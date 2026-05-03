import React from 'react';
import clsx from 'clsx';
import { AlertCircle, Paperclip, Upload } from 'lucide-react';
import styles from './FilePicker.module.scss';
import { Button } from '../Button';
import { FileItem } from '../FileItem';

export type FilePickerFileStatus = 'idle' | 'uploading' | 'complete' | 'error';

export interface FilePickerFile {
  id: string;
  file: File;
  status: FilePickerFileStatus;
  progress?: number;
  error?: string;
  downloadUrl?: string;
}

export interface FilePickerProps {
  files?: FilePickerFile[];
  onFilesChange?: (files: FilePickerFile[]) => void;
  onFilesAdded?: (newFiles: FilePickerFile[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  minSize?: number;
  id?: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  dropzoneLabel?: string;
  browseLabel?: string;
  dropzoneActiveLabel?: string;
  acceptedFormatsLabel?: string;
  compact?: boolean;
  className?: string;
}

interface RejectedFile {
  file: File;
  reason: string;
}

interface ValidationResult {
  accepted: File[];
  rejected: RejectedFile[];
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;
const DEFAULT_DROPZONE_LABEL = 'Drag and drop files here';
const DEFAULT_DROPZONE_ARIA_LABEL = 'Drag and drop files here, or use the Browse button';
const DEFAULT_BROWSE_LABEL = 'Browse files';
const DEFAULT_ACTIVE_LABEL = 'Drop files to upload';

const formatFileSize = (bytes: number) => {
  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, unitIndex);
  const formattedValue = value < 10 ? Number(value.toFixed(1)) : Math.round(value);

  return `${formattedValue} ${units[unitIndex]}`;
};

const isFileTypeAccepted = (file: File, accept: string) => {
  const acceptedTypes = accept.split(',').map((type) => type.trim().toLowerCase());

  return acceptedTypes.some((type) => {
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type);
    }

    if (type.endsWith('/*')) {
      return file.type.toLowerCase().startsWith(type.slice(0, -1));
    }

    return file.type.toLowerCase() === type;
  });
};

const getFormatsHint = ({
  accept,
  maxSize,
  maxFiles,
  multiple,
}: Pick<FilePickerProps, 'accept' | 'maxSize' | 'maxFiles' | 'multiple'>) => {
  const parts: string[] = [];

  if (accept) {
    const extensions = accept
      .split(',')
      .map((token) => token.trim())
      .filter((token) => token.startsWith('.'))
      .map((token) => token.toUpperCase().slice(1));

    if (extensions.length > 0) {
      parts.push(extensions.join(', '));
    } else {
      parts.push(accept);
    }
  }

  if (maxSize) {
    parts.push(`up to ${formatFileSize(maxSize)}`);
  }

  if (maxFiles && multiple) {
    parts.push(`max ${maxFiles} file${maxFiles === 1 ? '' : 's'}`);
  }

  return parts.join(' · ');
};

const getFormatsHintProps = ({
  accept,
  maxSize,
  maxFiles,
  multiple,
}: {
  accept?: string | undefined;
  maxSize?: number | undefined;
  maxFiles?: number | undefined;
  multiple?: boolean | undefined;
}) => ({
  ...(accept ? { accept } : {}),
  ...(maxSize !== undefined ? { maxSize } : {}),
  ...(maxFiles !== undefined ? { maxFiles } : {}),
  ...(multiple !== undefined ? { multiple } : {}),
});

export const FilePicker = React.forwardRef<HTMLDivElement, FilePickerProps>(
  (
    {
      files = [],
      onFilesChange,
      onFilesAdded,
      multiple = false,
      accept,
      maxSize = DEFAULT_MAX_SIZE,
      maxFiles,
      minSize = 0,
      id,
      label,
      hint,
      error,
      required = false,
      disabled = false,
      dropzoneLabel = DEFAULT_DROPZONE_LABEL,
      browseLabel = DEFAULT_BROWSE_LABEL,
      dropzoneActiveLabel = DEFAULT_ACTIVE_LABEL,
      acceptedFormatsLabel,
      compact = false,
      className,
    },
    ref
  ) => {
    // FileItem API note: FileItem already supported status, progress, onRemove, name, size,
    // and downloadUrl. This component required one compatibility addition there: `error` as an
    // alias for the existing `errorMessage` prop so FilePicker can pass per-file errors directly.
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const inputRef = React.useRef<HTMLInputElement>(null);
    const browseButtonRef = React.useRef<HTMLButtonElement>(null);
    const dragCounter = React.useRef(0);
    const validationTimeoutRef = React.useRef<number | null>(null);
    const [isDraggingOver, setIsDraggingOver] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState<RejectedFile[]>([]);

    const describedBy =
      [error ? `${inputId}-error` : undefined, hint ? `${inputId}-hint` : undefined]
        .filter(Boolean)
        .join(' ') || undefined;

    const formatsHint =
      acceptedFormatsLabel ??
      getFormatsHint(getFormatsHintProps({ accept, maxSize, maxFiles, multiple }));

    const displayedFiles = multiple ? files : files.slice(0, 1);

    React.useEffect(() => {
      return () => {
        if (validationTimeoutRef.current !== null) {
          window.clearTimeout(validationTimeoutRef.current);
        }
      };
    }, []);

    const clearValidationErrorsAfterDelay = React.useCallback(() => {
      if (validationTimeoutRef.current !== null) {
        window.clearTimeout(validationTimeoutRef.current);
      }

      validationTimeoutRef.current = window.setTimeout(() => {
        setValidationErrors([]);
        validationTimeoutRef.current = null;
      }, 6000);
    }, []);

    const validateFiles = React.useCallback(
      (incoming: File[]): ValidationResult => {
        const accepted: File[] = [];
        const rejected: RejectedFile[] = [];
        const currentCount = multiple
          ? displayedFiles.filter((pickerFile) => pickerFile.status !== 'error').length
          : 0;
        const configuredLimit = multiple ? (maxFiles ?? Number.POSITIVE_INFINITY) : 1;
        const allowedCount = Math.max(configuredLimit - currentCount, 0);

        incoming.forEach((file, index) => {
          if (index >= allowedCount) {
            rejected.push({
              file,
              reason: `Maximum of ${configuredLimit} file${configuredLimit === 1 ? '' : 's'} allowed`,
            });
            return;
          }

          if (
            displayedFiles.some(
              (pickerFile) =>
                pickerFile.file.name === file.name && pickerFile.file.size === file.size
            )
          ) {
            rejected.push({ file, reason: 'File already added' });
            return;
          }

          if (file.size > maxSize) {
            rejected.push({
              file,
              reason: `File exceeds maximum size of ${formatFileSize(maxSize)}`,
            });
            return;
          }

          if (file.size < minSize) {
            rejected.push({
              file,
              reason: `File is smaller than the minimum size of ${formatFileSize(minSize)}`,
            });
            return;
          }

          if (accept && !isFileTypeAccepted(file, accept)) {
            rejected.push({ file, reason: `File type not accepted. Allowed: ${accept}` });
            return;
          }

          accepted.push(file);
        });

        return { accepted, rejected };
      },
      [accept, displayedFiles, maxFiles, maxSize, minSize, multiple]
    );

    const processFiles = React.useCallback(
      (incoming: File[]) => {
        if (disabled || incoming.length === 0) {
          return;
        }

        const { accepted, rejected } = validateFiles(incoming);

        if (rejected.length > 0) {
          setValidationErrors(rejected);
          clearValidationErrorsAfterDelay();
        } else {
          if (validationTimeoutRef.current !== null) {
            window.clearTimeout(validationTimeoutRef.current);
            validationTimeoutRef.current = null;
          }

          setValidationErrors([]);
        }

        if (accepted.length === 0) {
          return;
        }

        const nextFiles: FilePickerFile[] = accepted.map((file) => ({
          id: crypto.randomUUID(),
          file,
          status: 'idle',
        }));
        const next = multiple ? [...files, ...nextFiles] : nextFiles.slice(0, 1);

        onFilesChange?.(next);
        onFilesAdded?.(nextFiles);
      },
      [
        clearValidationErrorsAfterDelay,
        disabled,
        files,
        multiple,
        onFilesAdded,
        onFilesChange,
        validateFiles,
      ]
    );

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(Array.from(event.target.files ?? []));
      event.target.value = '';
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      event.preventDefault();
      dragCounter.current += 1;

      if (event.dataTransfer.items.length > 0) {
        setIsDraggingOver(true);
      }
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      event.preventDefault();
      dragCounter.current -= 1;

      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDraggingOver(false);
      }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      event.preventDefault();
      dragCounter.current = 0;
      setIsDraggingOver(false);
      processFiles(Array.from(event.dataTransfer.files));
    };

    const handleRemove = (pickerFileId: string) => {
      const next = files.filter((pickerFile) => pickerFile.id !== pickerFileId);
      onFilesChange?.(next);
      browseButtonRef.current?.focus();
    };

    const regionLabel = isDraggingOver
      ? dropzoneActiveLabel
      : dropzoneLabel === DEFAULT_DROPZONE_LABEL
        ? DEFAULT_DROPZONE_ARIA_LABEL
        : dropzoneLabel;
    const DropzoneIcon = compact ? Paperclip : Upload;

    return (
      <div ref={ref} className={clsx(styles.root, className)}>
        {label ? (
          <label className={styles.label} htmlFor={inputId}>
            {label}
            {required ? (
              <span className={styles.required} aria-hidden="true">
                {' '}
                *
              </span>
            ) : null}
          </label>
        ) : null}

        <div
          className={clsx(
            styles.dropzone,
            isDraggingOver && styles.dropzoneActive,
            disabled && styles.dropzoneDisabled,
            error && styles.dropzoneError,
            compact && styles.dropzoneCompact
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          role="region"
          aria-label={regionLabel}
        >
          <DropzoneIcon className={styles.dropzoneIcon} aria-hidden="true" />
          <div className={styles.dropzoneText}>
            <p className={styles.dropzoneLabel}>
              {isDraggingOver ? dropzoneActiveLabel : dropzoneLabel}
            </p>
            <Button
              ref={browseButtonRef}
              type="button"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              {browseLabel}
            </Button>
          </div>
          {formatsHint ? <p className={styles.dropzoneFormatsHint}>{formatsHint}</p> : null}
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={handleInputChange}
            className={styles.hiddenInput}
            aria-label={label ?? browseLabel}
            aria-describedby={describedBy}
            aria-required={required || undefined}
            aria-invalid={error ? true : undefined}
          />
        </div>

        {validationErrors.length > 0 ? (
          <div role="alert" className={styles.validationErrors} aria-atomic="true">
            {validationErrors.map(({ file, reason }) => (
              <p key={`${file.name}-${file.size}-${reason}`} className={styles.validationError}>
                <AlertCircle aria-hidden="true" />
                <span>
                  <strong>{file.name}</strong>: {reason}
                </span>
              </p>
            ))}
          </div>
        ) : null}

        {displayedFiles.length > 0 ? (
          <ul className={styles.fileList} aria-label="Selected files" aria-live="polite">
            {displayedFiles.map((pickerFile) => (
              <li key={pickerFile.id} className={styles.fileListItem}>
                <FileItem
                  name={pickerFile.file.name}
                  size={pickerFile.file.size}
                  status={pickerFile.status}
                  {...(pickerFile.progress !== undefined ? { progress: pickerFile.progress } : {})}
                  {...(pickerFile.error ? { error: pickerFile.error } : {})}
                  {...(pickerFile.downloadUrl ? { downloadUrl: pickerFile.downloadUrl } : {})}
                  removable
                  onRemove={() => handleRemove(pickerFile.id)}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {error ? (
          <p id={`${inputId}-error`} className={styles.fieldError} role="alert">
            {error}
          </p>
        ) : null}

        {hint ? (
          <p id={`${inputId}-hint`} className={styles.fieldHint}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

FilePicker.displayName = 'FilePicker';

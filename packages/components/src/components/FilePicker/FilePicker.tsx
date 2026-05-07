import React from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, ChevronDown, Paperclip, Upload, UploadCloud } from 'lucide-react';
import { Button } from '../Button';
import type { ButtonVariant } from '../Button';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '../Dropdown';
import { FileItem, type FileItemStatus } from '../FileItem';
import { Label } from '../Label';
import styles from './FilePicker.module.scss';

export type FilePickerTriggerVariant = 'button' | 'menu' | 'dropzone';
export type FilePickerFileStatus = FileItemStatus;

export interface FilePickerFile {
  id: string;
  file: File;
  status: FilePickerFileStatus;
  progress?: number;
  error?: string;
  downloadUrl?: string;
}

export interface FilePickerMenuAction {
  label: string;
  onClick?: () => void;
  icon?: LucideIcon;
}

export interface FilePickerProps {
  files?: FilePickerFile[];
  onFilesChange?: (files: FilePickerFile[]) => void;
  onFilesAdded?: (newFiles: FilePickerFile[]) => void;
  triggerVariant?: FilePickerTriggerVariant;
  buttonVariant?: Extract<ButtonVariant, 'primary' | 'secondary'>;
  buttonLabel?: string;
  buttonIcon?: LucideIcon;
  menuLabel?: string;
  menuActions?: FilePickerMenuAction[];
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
  id?: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  showPanelHeader?: boolean;
  panelTitle?: string;
  showClearAll?: boolean;
  onClearAll?: () => void;
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
const DEFAULT_BUTTON_LABEL = 'Upload Files';
const DEFAULT_MENU_LABEL = 'Choose an action';

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
}: {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
}) => {
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

export const FilePicker = React.forwardRef<HTMLDivElement, FilePickerProps>(
  (
    {
      files = [],
      onFilesChange,
      onFilesAdded,
      triggerVariant = 'dropzone',
      buttonVariant = 'primary',
      buttonLabel = DEFAULT_BUTTON_LABEL,
      buttonIcon = UploadCloud,
      menuLabel = DEFAULT_MENU_LABEL,
      menuActions,
      multiple = false,
      accept,
      maxSize = DEFAULT_MAX_SIZE,
      minSize = 0,
      maxFiles,
      id,
      label,
      hint,
      error,
      required = false,
      disabled = false,
      showPanelHeader = true,
      panelTitle,
      showClearAll = true,
      onClearAll,
      dropzoneLabel = DEFAULT_DROPZONE_LABEL,
      browseLabel = DEFAULT_BROWSE_LABEL,
      dropzoneActiveLabel = DEFAULT_ACTIVE_LABEL,
      acceptedFormatsLabel,
      compact = false,
      className,
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const inputRef = React.useRef<HTMLInputElement>(null);
    const triggerButtonRef = React.useRef<HTMLButtonElement>(null);
    const dragCounter = React.useRef(0);
    const validationTimeoutRef = React.useRef<number | null>(null);
    const [isDraggingOver, setIsDraggingOver] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState<RejectedFile[]>([]);

    React.useEffect(() => {
      return () => {
        if (validationTimeoutRef.current !== null) {
          window.clearTimeout(validationTimeoutRef.current);
        }
      };
    }, []);

    const describedBy =
      [error ? `${inputId}-error` : undefined, hint ? `${inputId}-hint` : undefined]
        .filter(Boolean)
        .join(' ') || undefined;

    const autoFormatsHint = getFormatsHint({
      ...(accept !== undefined ? { accept } : {}),
      ...(maxSize !== undefined ? { maxSize } : {}),
      ...(maxFiles !== undefined ? { maxFiles } : {}),
      ...(multiple !== undefined ? { multiple } : {}),
    });
    const triggerHint = triggerVariant === 'button' ? (hint ?? autoFormatsHint) : hint;
    const dropzoneHint = acceptedFormatsLabel ?? autoFormatsHint;

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
          ? files.filter((pickerFile) => pickerFile.status !== 'error').length
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
            files.some(
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
      [accept, files, maxFiles, maxSize, minSize, multiple]
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
      if (!onFilesChange) {
        return;
      }

      const next = files.filter((pickerFile) => pickerFile.id !== pickerFileId);
      onFilesChange(next);
      triggerButtonRef.current?.focus();
    };

    const completeCount = files.filter((file) => file.status === 'complete').length;
    const totalCount = files.length;
    const activeCount = files.filter(
      (file) => file.status === 'uploading' || file.status === 'waiting' || file.status === 'paused'
    ).length;
    const autoTitle =
      activeCount > 0
        ? `Uploading ${totalCount} file${totalCount === 1 ? '' : 's'}`
        : `${totalCount} file${totalCount === 1 ? '' : 's'} selected`;
    const regionLabel = isDraggingOver
      ? dropzoneActiveLabel
      : dropzoneLabel === DEFAULT_DROPZONE_LABEL
        ? DEFAULT_DROPZONE_ARIA_LABEL
        : dropzoneLabel;
    const DropzoneIcon = compact ? Paperclip : Upload;

    return (
      <div ref={ref} className={clsx(styles.root, className)}>
        {triggerVariant === 'button' ? (
          <div className={styles.buttonTriggerWrapper}>
            {label ? (
              <Label
                className={styles.buttonTriggerLabel}
                htmlFor={inputId}
                required={required}
                disabled={disabled}
              >
                {label}
              </Label>
            ) : null}
            {triggerHint ? (
              <p className={styles.buttonTriggerHint} id={`${inputId}-hint`}>
                {triggerHint}
              </p>
            ) : null}
            <Button
              ref={triggerButtonRef}
              variant={buttonVariant}
              icon={buttonIcon}
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              aria-describedby={
                [
                  triggerHint ? `${inputId}-hint` : undefined,
                  error ? `${inputId}-error` : undefined,
                ]
                  .filter(Boolean)
                  .join(' ') || undefined
              }
            >
              {buttonLabel}
            </Button>
          </div>
        ) : null}

        {triggerVariant === 'menu' ? (
          <div className={styles.menuTriggerWrapper}>
            {label ? (
              <Label
                className={styles.buttonTriggerLabel}
                htmlFor={inputId}
                required={required}
                disabled={disabled}
              >
                {label}
              </Label>
            ) : null}
            {hint ? (
              <p className={styles.buttonTriggerHint} id={`${inputId}-hint`}>
                {hint}
              </p>
            ) : null}
            <Dropdown modal={false}>
              <DropdownTrigger asChild>
                <Button
                  ref={triggerButtonRef}
                  variant="secondary"
                  icon={ChevronDown}
                  iconPosition="end"
                  disabled={disabled}
                  aria-haspopup="menu"
                  aria-describedby={describedBy}
                >
                  {menuLabel}
                </Button>
              </DropdownTrigger>
              <DropdownContent align="start">
                <DropdownItem
                  startIcon={<UploadCloud aria-hidden="true" />}
                  onSelect={() => inputRef.current?.click()}
                >
                  Upload File
                </DropdownItem>
                {menuActions?.map((action) => {
                  const ActionIcon = action.icon;

                  return (
                    <DropdownItem
                      key={action.label}
                      startIcon={ActionIcon ? <ActionIcon aria-hidden="true" /> : undefined}
                      onSelect={() => action.onClick?.()}
                    >
                      {action.label}
                    </DropdownItem>
                  );
                })}
              </DropdownContent>
            </Dropdown>
          </div>
        ) : null}

        {triggerVariant === 'dropzone' ? (
          <>
            {label ? (
              <Label
                className={styles.dropzoneFieldLabel}
                htmlFor={inputId}
                required={required}
                disabled={disabled}
              >
                {label}
              </Label>
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
                  ref={triggerButtonRef}
                  variant={buttonVariant}
                  onClick={() => inputRef.current?.click()}
                  disabled={disabled}
                >
                  {browseLabel}
                </Button>
              </div>
              {dropzoneHint ? <p className={styles.dropzoneFormatsHint}>{dropzoneHint}</p> : null}
            </div>
          </>
        ) : null}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          className={styles.hiddenInput}
          aria-label={label ?? buttonLabel ?? menuLabel ?? browseLabel}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
        />

        {validationErrors.length > 0 ? (
          <div role="alert" className={styles.validationErrors} aria-atomic="true">
            {validationErrors.map(({ file, reason }) => (
              <p key={`${file.name}-${file.size}-${reason}`} className={styles.validationError}>
                <AlertCircle className={styles.validationErrorIcon} aria-hidden="true" />
                <span>
                  <strong>{file.name}</strong>: {reason}
                </span>
              </p>
            ))}
          </div>
        ) : null}

        {files.length > 0 ? (
          <div className={styles.panel}>
            {showPanelHeader ? (
              <div className={styles.panelHeader}>
                <div className={styles.panelHeaderText}>
                  <h2 className={styles.panelTitle} aria-live="polite" aria-atomic="true">
                    {panelTitle ?? autoTitle}
                  </h2>
                  {activeCount > 0 ? (
                    <p className={styles.panelSubtitle} aria-live="polite" aria-atomic="true">
                      {completeCount} of {totalCount} file{totalCount === 1 ? '' : 's'} uploaded
                    </p>
                  ) : null}
                </div>
                {showClearAll && onClearAll ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onClearAll}
                    aria-label="Clear all files"
                  >
                    Clear all
                  </Button>
                ) : null}
              </div>
            ) : null}

            <ul
              className={styles.fileList}
              aria-label={`${files.length} file${files.length === 1 ? '' : 's'} selected`}
              aria-live="polite"
            >
              {files.map((file) => (
                <li key={file.id} className={styles.fileListItem}>
                  <FileItem
                    name={file.file.name}
                    size={file.file.size}
                    status={file.status}
                    {...(file.progress !== undefined ? { progress: file.progress } : {})}
                    {...(file.error !== undefined ? { error: file.error } : {})}
                    {...(file.downloadUrl !== undefined ? { downloadUrl: file.downloadUrl } : {})}
                    {...(onFilesChange && !disabled
                      ? { onRemove: () => handleRemove(file.id) }
                      : {})}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {error ? (
          <p id={`${inputId}-error`} className={styles.fieldError} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

FilePicker.displayName = 'FilePicker';

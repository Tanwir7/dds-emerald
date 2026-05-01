import { AlertCircle, CheckCircle, X } from 'lucide-react';
import clsx from 'clsx';
import React from 'react';
import styles from './FileItem.module.scss';
import { Spinner } from '../Spinner';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type FileItemStatus = 'idle' | 'uploading' | 'complete' | 'error';

export interface FileItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onClick'
> {
  name: string;
  size?: number;
  status?: FileItemStatus;
  progress?: number;
  errorMessage?: string;
  removable?: boolean;
  onRemove?: () => void;
  downloadUrl?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  className?: string;
}

type FileType =
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'code'
  | 'spreadsheet'
  | 'document'
  | 'archive'
  | 'unknown';

const getFileType = (name: string): FileType => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';

  if (['pdf'].includes(ext)) {
    return 'pdf';
  }

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)) {
    return 'image';
  }

  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) {
    return 'video';
  }

  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
    return 'audio';
  }

  if (
    [
      'js',
      'ts',
      'jsx',
      'tsx',
      'py',
      'rb',
      'go',
      'rs',
      'java',
      'cpp',
      'c',
      'html',
      'css',
      'scss',
      'json',
      'yaml',
      'yml',
      'md',
    ].includes(ext)
  ) {
    return 'code';
  }

  if (['xls', 'xlsx', 'csv', 'numbers'].includes(ext)) {
    return 'spreadsheet';
  }

  if (['doc', 'docx', 'txt', 'rtf', 'pages'].includes(ext)) {
    return 'document';
  }

  if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)) {
    return 'archive';
  }

  return 'unknown';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, unitIndex);
  const formattedValue = value < 10 ? Number(value.toFixed(1)) : Math.round(value);

  return `${formattedValue} ${units[unitIndex]}`;
};

const fileTypeClassName: Record<FileType, string> = {
  pdf: getRequiredClassName(styles, 'typePdf'),
  image: getRequiredClassName(styles, 'typeImage'),
  video: getRequiredClassName(styles, 'typeVideo'),
  audio: getRequiredClassName(styles, 'typeAudio'),
  code: getRequiredClassName(styles, 'typeCode'),
  spreadsheet: getRequiredClassName(styles, 'typeSpreadsheet'),
  document: getRequiredClassName(styles, 'typeDocument'),
  archive: getRequiredClassName(styles, 'typeArchive'),
  unknown: getRequiredClassName(styles, 'typeUnknown'),
};

const FileTypeIcon = ({ name }: { name: string }) => {
  const type = getFileType(name);
  const ext = (name.split('.').pop() ?? 'file').toUpperCase().slice(0, 4);

  return (
    <span className={clsx(styles.fileIcon, fileTypeClassName[type])} aria-hidden="true">
      <span className={styles.fileIconText}>{ext}</span>
    </span>
  );
};

/**
 * FileItem exposes a file row with optional upload progress. The progress fill width uses an
 * inline style as a documented exception because the 0-100 value is dynamic runtime data.
 */
export const FileItem = React.forwardRef<HTMLDivElement, FileItemProps>(
  (
    {
      name,
      size,
      status = 'idle',
      progress,
      errorMessage,
      removable = false,
      onRemove,
      downloadUrl,
      onClick,
      onKeyDown,
      className,
      ...props
    },
    ref
  ) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.(event as unknown as React.MouseEvent<HTMLElement>);
      }

      onKeyDown?.(event);
    };

    const statusIcon =
      status === 'complete' ? (
        <span className={styles.statusIcon} aria-hidden="true">
          <CheckCircle />
        </span>
      ) : status === 'uploading' ? (
        <span className={styles.statusIcon}>
          <Spinner size="sm" label={`Uploading ${name}`} />
        </span>
      ) : status === 'error' ? (
        <span className={styles.statusIcon} aria-hidden="true">
          <AlertCircle />
        </span>
      ) : null;

    return (
      <div
        ref={ref}
        className={clsx(styles.root, styles[status], onClick && styles.clickable, className)}
        onClick={onClick as React.MouseEventHandler<HTMLDivElement> | undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? handleKeyDown : onKeyDown}
        {...props}
      >
        <FileTypeIcon name={name} />

        <div className={styles.info}>
          <div className={styles.nameRow}>
            {downloadUrl ? (
              <a
                href={downloadUrl}
                download={name}
                className={styles.nameLink}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                {name}
              </a>
            ) : (
              <span className={styles.name}>{name}</span>
            )}

            {size !== undefined ? (
              <span className={styles.size}>{formatFileSize(size)}</span>
            ) : null}
          </div>

          {status === 'uploading' && progress !== undefined ? (
            <div
              className={styles.progressBar}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Uploading ${name}`}
            >
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          ) : null}

          {status === 'error' && errorMessage ? (
            <span className={styles.errorMessage} role="alert">
              {errorMessage}
            </span>
          ) : null}
        </div>

        {statusIcon}

        {removable ? (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={(event) => {
              event.stopPropagation();
              onRemove?.();
            }}
            aria-label={`Remove ${name}`}
          >
            <X aria-hidden="true" />
          </button>
        ) : null}
      </div>
    );
  }
);

FileItem.displayName = 'FileItem';

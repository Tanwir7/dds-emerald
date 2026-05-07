import React from 'react';
import clsx from 'clsx';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  File,
  PauseCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Button } from '../Button';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import styles from './FileItem.module.scss';

export type FileItemStatus = 'idle' | 'waiting' | 'uploading' | 'paused' | 'complete' | 'error';

export interface FileItemProps {
  name: string;
  size?: number;
  status?: FileItemStatus;
  progress?: number;
  error?: string;
  downloadUrl?: string;
  onRemove?: () => void;
  className?: string;
}

const statusIconMap = {
  idle: { Icon: File, className: getRequiredClassName(styles, 'iconIdle') },
  waiting: { Icon: Clock, className: getRequiredClassName(styles, 'iconWaiting') },
  uploading: { Icon: RefreshCw, className: getRequiredClassName(styles, 'iconUploading') },
  paused: { Icon: PauseCircle, className: getRequiredClassName(styles, 'iconPaused') },
  complete: { Icon: CheckCircle2, className: getRequiredClassName(styles, 'iconComplete') },
  error: { Icon: AlertCircle, className: getRequiredClassName(styles, 'iconError') },
} satisfies Record<FileItemStatus, { Icon: React.ComponentType; className: string }>;

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 ** 3) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
};

export const FileItem = React.forwardRef<HTMLDivElement, FileItemProps>(
  ({ name, size, status = 'idle', progress = 0, error, downloadUrl, onRemove, className }, ref) => {
    const { Icon, className: iconClassName } = statusIconMap[status];
    const showProgress = status === 'uploading' || status === 'paused';

    const statusLabel = (() => {
      if (status === 'uploading' || status === 'paused') {
        return `${progress}% complete`;
      }

      if (status === 'waiting') {
        return 'Waiting…';
      }

      if (status === 'error') {
        return error ?? 'Upload failed';
      }

      return null;
    })();

    return (
      <div ref={ref} className={clsx(styles.fileItem, styles[`status-${status}`], className)}>
        <div className={styles.itemRow}>
          <span className={clsx(styles.statusIcon, iconClassName)} aria-hidden="true">
            <Icon />
          </span>

          <div className={styles.fileInfo}>
            {downloadUrl ? (
              <a
                href={downloadUrl}
                download={name}
                className={clsx(styles.fileName, styles.fileNameLink)}
              >
                {name}
              </a>
            ) : (
              <span className={styles.fileName}>{name}</span>
            )}
            {size != null ? <span className={styles.fileSize}>{formatFileSize(size)}</span> : null}
          </div>

          {statusLabel ? (
            <span
              className={clsx(styles.statusLabel, status === 'error' && styles.statusLabelError)}
              aria-live="off"
            >
              {statusLabel}
            </span>
          ) : null}

          {onRemove ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${name}`}
              icon={Trash2}
              onClick={onRemove}
              className={getRequiredClassName(styles, 'removeButton')}
            />
          ) : null}
        </div>

        {showProgress ? (
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${name} upload progress`}
            aria-valuetext={`${progress}% complete`}
          >
            <div
              className={clsx(
                styles.progressFill,
                status === 'paused' && styles.progressFillPaused
              )}
              style={{ width: `${progress}%` } as React.CSSProperties}
            />
          </div>
        ) : null}

        <span className={styles.srOnly} aria-live="polite" aria-atomic="true">
          {status === 'complete' ? `${name} upload complete` : ''}
          {status === 'error' ? `${name} upload failed: ${error ?? 'Upload failed'}` : ''}
        </span>
      </div>
    );
  }
);

FileItem.displayName = 'FileItem';

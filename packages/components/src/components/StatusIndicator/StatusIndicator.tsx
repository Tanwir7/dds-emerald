import clsx from 'clsx';
import React from 'react';
import styles from './StatusIndicator.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type StatusIndicatorStatus =
  | 'online'
  | 'offline'
  | 'away'
  | 'busy'
  | 'pending'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusIndicatorStatus;
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
  label?: string;
  className?: string;
}

const statusClassName: Record<StatusIndicatorStatus, string> = {
  online: getRequiredClassName(styles, 'online'),
  offline: getRequiredClassName(styles, 'offline'),
  away: getRequiredClassName(styles, 'away'),
  busy: getRequiredClassName(styles, 'busy'),
  pending: getRequiredClassName(styles, 'pending'),
  success: getRequiredClassName(styles, 'success'),
  warning: getRequiredClassName(styles, 'warning'),
  error: getRequiredClassName(styles, 'error'),
  info: getRequiredClassName(styles, 'info'),
  neutral: getRequiredClassName(styles, 'neutral'),
};

const sizeClassName = {
  xs: getRequiredClassName(styles, 'xs'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
} as const;

export const StatusIndicator = React.forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  ({ status, size = 'sm', pulse = false, label, className, ...props }, ref) => {
    const accessibleLabel = label?.trim();

    return (
      <span
        ref={ref}
        aria-hidden={accessibleLabel ? undefined : true}
        role={accessibleLabel ? 'img' : undefined}
        aria-label={accessibleLabel || undefined}
        className={clsx(
          styles.root,
          sizeClassName[size],
          statusClassName[status],
          pulse && styles.pulse,
          className
        )}
        {...props}
      >
        <span className={styles.dot} />
        {accessibleLabel ? <span className={styles.srOnly}>{accessibleLabel}</span> : null}
      </span>
    );
  }
);

StatusIndicator.displayName = 'StatusIndicator';

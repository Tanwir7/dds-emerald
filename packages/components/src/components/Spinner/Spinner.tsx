import React from 'react';
import clsx from 'clsx';
import styles from './Spinner.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

const sizeClassName: Record<SpinnerSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
};

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ size = 'md', label, className, ...props }, ref) => {
    const accessibleLabel = label?.trim();

    return (
      <span
        ref={ref}
        className={clsx(styles.root, sizeClassName[size], className)}
        role={accessibleLabel ? 'status' : undefined}
        aria-live={accessibleLabel ? 'polite' : undefined}
        aria-atomic={accessibleLabel ? true : undefined}
        aria-label={accessibleLabel || undefined}
        {...props}
      >
        <svg
          className={styles.svg}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <circle
            className={styles.track}
            cx="8"
            cy="8"
            r="6"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            className={styles.indicator}
            cx="8"
            cy="8"
            r="6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {accessibleLabel ? <span className={styles.label}>{accessibleLabel}</span> : null}
      </span>
    );
  }
);

Spinner.displayName = 'Spinner';

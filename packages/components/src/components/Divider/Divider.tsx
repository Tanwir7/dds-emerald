import React from 'react';
import clsx from 'clsx';
import styles from './Divider.module.scss';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  orientation?: DividerOrientation;
  label?: string;
  className?: string;
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ orientation = 'horizontal', label, className, ...props }, ref) => {
    const isHorizontal = orientation === 'horizontal';
    const isLabelled = isHorizontal && Boolean(label);

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={clsx(
          styles.root,
          isHorizontal ? styles.horizontal : styles.vertical,
          isLabelled && styles.labelled,
          className
        )}
        {...props}
      >
        {isHorizontal ? (
          <>
            <span className={styles.line} data-divider-line="" aria-hidden="true" />
            {isLabelled ? <span className={styles.label}>{label}</span> : null}
            <span className={styles.line} data-divider-line="" aria-hidden="true" />
          </>
        ) : null}
      </div>
    );
  }
);

Divider.displayName = 'Divider';

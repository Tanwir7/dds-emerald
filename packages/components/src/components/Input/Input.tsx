import React from 'react';
import clsx from 'clsx';
import styles from './Input.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  invalid?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
}

const sizeClassName: Record<InputSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'md', invalid = false, startIcon, endIcon, className, ...props }: InputProps, ref) => {
    return (
      <div className={styles.wrapper}>
        {startIcon ? (
          <span className={styles.startIcon} aria-hidden="true">
            {startIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          className={clsx(
            styles.root,
            sizeClassName[size],
            invalid && styles.invalid,
            startIcon && styles.hasStartIcon,
            endIcon && styles.hasEndIcon,
            className
          )}
          {...props}
        />
        {endIcon ? (
          <span className={styles.endIcon} aria-hidden="true">
            {endIcon}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

import React from 'react';
import clsx from 'clsx';
import styles from './Badge.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children: React.ReactNode;
}

const variantClassName: Record<BadgeVariant, string> = {
  default: getRequiredClassName(styles, 'variantDefault'),
  secondary: getRequiredClassName(styles, 'variantSecondary'),
  outline: getRequiredClassName(styles, 'variantOutline'),
  success: getRequiredClassName(styles, 'variantSuccess'),
  warning: getRequiredClassName(styles, 'variantWarning'),
  destructive: getRequiredClassName(styles, 'variantDestructive'),
  info: getRequiredClassName(styles, 'variantInfo'),
};

const sizeClassName: Record<BadgeSize, string> = {
  sm: getRequiredClassName(styles, 'sizeSm'),
  md: getRequiredClassName(styles, 'sizeMd'),
  lg: getRequiredClassName(styles, 'sizeLg'),
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(styles.root, variantClassName[variant], sizeClassName[size], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

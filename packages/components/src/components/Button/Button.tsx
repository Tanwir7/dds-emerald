import React from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

export type ButtonSize = 'sm' | 'default' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
  icon?: LucideIcon;
  iconPosition?: 'start' | 'end';
}

const variantClassName: Record<ButtonVariant, string> = {
  primary: styles.variantPrimary!,
  secondary: styles.variantSecondary!,
  outline: styles.variantOutline!,
  ghost: styles.variantGhost!,
  destructive: styles.variantDestructive!,
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: styles.sizeSm!,
  default: styles.sizeDefault!,
  lg: styles.sizeLg!,
  icon: styles.sizeIcon!,
  'icon-sm': styles.sizeIconSm!,
  'icon-lg': styles.sizeIconLg!,
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'default',
      fullWidth = false,
      className,
      children,
      icon: Icon,
      iconPosition = 'start',
      disabled = false,
      type,
      tabIndex,
      ...props
    }: ButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) => {
    const sharedClassName = clsx(
      styles.root,
      variantClassName[variant],
      sizeClassName[size],
      fullWidth && styles.fullWidth,
      className
    );

    return (
      <button
        ref={ref}
        className={sharedClassName}
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        tabIndex={tabIndex}
        type={type ?? 'button'}
        {...props}
      >
        {Icon && iconPosition === 'start' ? (
          <span className={styles.icon} aria-hidden="true">
            <Icon aria-hidden="true" />
          </span>
        ) : null}
        {children ? <span className={styles.label}>{children}</span> : null}
        {Icon && iconPosition === 'end' ? (
          <span className={styles.icon} aria-hidden="true">
            <Icon aria-hidden="true" />
          </span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = 'Button';

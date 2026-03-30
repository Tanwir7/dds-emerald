import React from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import styles from './Button.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

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
  loading?: boolean;
}

const variantClassName: Record<ButtonVariant, string> = {
  primary: getRequiredClassName(styles, 'variantPrimary'),
  secondary: getRequiredClassName(styles, 'variantSecondary'),
  outline: getRequiredClassName(styles, 'variantOutline'),
  ghost: getRequiredClassName(styles, 'variantGhost'),
  destructive: getRequiredClassName(styles, 'variantDestructive'),
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: getRequiredClassName(styles, 'sizeSm'),
  default: getRequiredClassName(styles, 'sizeDefault'),
  lg: getRequiredClassName(styles, 'sizeLg'),
  icon: getRequiredClassName(styles, 'sizeIcon'),
  'icon-sm': getRequiredClassName(styles, 'sizeIconSm'),
  'icon-lg': getRequiredClassName(styles, 'sizeIconLg'),
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
      loading = false,
      disabled = false,
      type,
      tabIndex,
      onClick,
      ...props
    }: ButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) => {
    const isDisabled = disabled || loading;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    };

    const sharedClassName = clsx(
      styles.root,
      variantClassName[variant],
      sizeClassName[size],
      loading && styles.stateLoading,
      fullWidth && styles.fullWidth,
      className
    );

    const spinner = (
      <span className={styles.icon} aria-hidden="true">
        <svg aria-hidden="true" className={styles.spinner} data-progress="" viewBox="0 0 16 16">
          <circle className={styles.spinnerCircle} cx="8" cy="8" r="7" />
        </svg>
      </span>
    );

    return (
      <button
        ref={ref}
        className={sharedClassName}
        data-disabled={disabled ? '' : undefined}
        data-loading={loading ? '' : undefined}
        aria-disabled={isDisabled ? true : undefined}
        disabled={disabled}
        tabIndex={tabIndex}
        type={type ?? 'button'}
        onClick={handleClick}
        {...props}
      >
        {loading ? spinner : null}
        {!loading && Icon && iconPosition === 'start' ? (
          <span className={styles.icon} aria-hidden="true">
            <Icon aria-hidden="true" />
          </span>
        ) : null}
        {children ? <span className={styles.label}>{children}</span> : null}
        {!loading && Icon && iconPosition === 'end' ? (
          <span className={styles.icon} aria-hidden="true">
            <Icon aria-hidden="true" />
          </span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = 'Button';

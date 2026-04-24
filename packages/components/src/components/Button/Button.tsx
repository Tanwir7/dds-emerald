import React from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import styles from './Button.module.scss';
import { Icon as DDSIcon } from '../Icon';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

export type ButtonSize = 'sm' | 'default' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';

type ButtonBaseProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'aria-labelledby' | 'children'
> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  icon?: LucideIcon;
  iconPosition?: 'start' | 'end';
  loading?: boolean;
};

type ButtonAccessibleName =
  | {
      children: React.ReactNode;
      'aria-label'?: string;
      'aria-labelledby'?: string;
    }
  | {
      children?: undefined;
      'aria-label': string;
      'aria-labelledby'?: string;
    }
  | {
      children?: undefined;
      'aria-label'?: string;
      'aria-labelledby': string;
    };

export type ButtonProps = ButtonBaseProps & ButtonAccessibleName;

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

const iconClassName = getRequiredClassName(styles, 'icon');

const hasVisibleLabel = (children: React.ReactNode) =>
  React.Children.toArray(children).some((child) => {
    if (child === null || child === undefined || typeof child === 'boolean') {
      return false;
    }

    if (typeof child === 'string') {
      return child.trim().length > 0;
    }

    return true;
  });

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'default',
      fullWidth = false,
      className,
      children,
      icon: IconComponent,
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
    const hasAccessibleName =
      hasVisibleLabel(children) ||
      (typeof props['aria-label'] === 'string' && props['aria-label'].trim().length > 0) ||
      (typeof props['aria-labelledby'] === 'string' && props['aria-labelledby'].trim().length > 0);

    if (!hasAccessibleName) {
      throw new Error(
        'Button requires visible text, aria-label, or aria-labelledby for an accessible name.'
      );
    }

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
      <span className={iconClassName} aria-hidden="true">
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
        {!loading && IconComponent && iconPosition === 'start' ? (
          <DDSIcon icon={IconComponent} className={iconClassName} aria-hidden="true" />
        ) : null}
        {hasVisibleLabel(children) ? <span className={styles.label}>{children}</span> : null}
        {!loading && IconComponent && iconPosition === 'end' ? (
          <DDSIcon icon={IconComponent} className={iconClassName} aria-hidden="true" />
        ) : null}
      </button>
    );
  }
);

Button.displayName = 'Button';

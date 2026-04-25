import clsx from 'clsx';
import { X } from 'lucide-react';
import React from 'react';
import styles from './Tag.module.scss';
import { Icon } from '../Icon';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type TagVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export type TagSize = 'sm' | 'md';

type TagBaseProps = Omit<React.HTMLAttributes<HTMLSpanElement>, 'onClick'> & {
  variant?: TagVariant;
  size?: TagSize;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

type InteractiveTagProps = TagBaseProps & {
  interactive: true;
  removable?: false;
  onRemove?: never;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
};

type RemovableTagProps = TagBaseProps & {
  interactive?: false;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
};

export type TagProps = InteractiveTagProps | RemovableTagProps;

const variantClassName: Record<TagVariant, string> = {
  default: getRequiredClassName(styles, 'variantDefault'),
  accent: getRequiredClassName(styles, 'variantAccent'),
  success: getRequiredClassName(styles, 'variantSuccess'),
  warning: getRequiredClassName(styles, 'variantWarning'),
  danger: getRequiredClassName(styles, 'variantDanger'),
  info: getRequiredClassName(styles, 'variantInfo'),
};

const sizeClassName: Record<TagSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
};

const removeIconClassName = getRequiredClassName(styles, 'removeIcon');

const getRemoveLabelText = (children: React.ReactNode) => {
  const text = React.Children.toArray(children)
    .filter(
      (child): child is string | number => typeof child === 'string' || typeof child === 'number'
    )
    .map((child) => String(child).trim())
    .filter(Boolean)
    .join(' ');

  return text.length > 0 ? text : 'tag';
};

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      variant = 'default',
      size = 'md',
      removable = false,
      onRemove,
      disabled = false,
      interactive = false,
      className,
      children,
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const isInteractive = interactive && !disabled;
    const isRemovable = removable && !interactive;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
      onKeyDown?.(event);

      if (event.defaultPrevented || !isInteractive) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.currentTarget.click();
      }
    };

    const handleRemoveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onRemove?.();
    };

    return (
      <span
        ref={ref}
        className={clsx(
          styles.root,
          variantClassName[variant],
          sizeClassName[size],
          isInteractive && styles.interactive,
          disabled && styles.disabled,
          className
        )}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        aria-disabled={disabled ? true : undefined}
        onClick={isInteractive ? onClick : undefined}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
        {isRemovable && !disabled ? (
          <button
            type="button"
            className={clsx(styles.removeButton, sizeClassName[size])}
            onClick={handleRemoveClick}
            aria-label={`Remove ${getRemoveLabelText(children)}`}
          >
            <Icon icon={X} size={size} className={removeIconClassName} aria-hidden="true" />
          </button>
        ) : null}
      </span>
    );
  }
);

Tag.displayName = 'Tag';

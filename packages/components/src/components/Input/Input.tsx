import React from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import styles from './Input.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type InputSize = 'sm' | 'md' | 'lg';

type InputBaseProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: InputSize;
  invalid?: boolean;
  startIcon?: LucideIcon;
  className?: string;
};

type InputEndIconProps =
  | {
      endIcon?: LucideIcon;
      endIconLabel?: never;
      onEndIconClick?: never;
    }
  | {
      endIcon: LucideIcon;
      endIconLabel: string;
      onEndIconClick: React.MouseEventHandler<HTMLButtonElement>;
    };

export type InputProps = InputBaseProps & InputEndIconProps;

const sizeClassName: Record<InputSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      invalid = false,
      startIcon,
      endIcon,
      endIconLabel,
      onEndIconClick,
      className,
      ...props
    }: InputProps,
    ref
  ) => {
    const StartIcon = startIcon;
    const EndIcon = endIcon;
    const hasEndIconAction = Boolean(EndIcon && onEndIconClick);

    return (
      <div className={styles.wrapper}>
        {StartIcon ? (
          <span className={styles.startIcon} aria-hidden="true">
            <StartIcon aria-hidden="true" />
          </span>
        ) : null}
        <input
          ref={ref}
          className={clsx(
            styles.root,
            sizeClassName[size],
            invalid && styles.invalid,
            StartIcon && styles.hasStartIcon,
            EndIcon && styles.hasEndIcon,
            className
          )}
          {...props}
        />
        {EndIcon && hasEndIconAction ? (
          <button
            className={styles.endIconButton}
            type="button"
            aria-label={endIconLabel}
            onClick={onEndIconClick}
            disabled={props.disabled || props.readOnly}
          >
            <EndIcon aria-hidden="true" />
          </button>
        ) : null}
        {EndIcon && !hasEndIconAction ? (
          <span className={styles.endIcon} aria-hidden="true">
            <EndIcon aria-hidden="true" />
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

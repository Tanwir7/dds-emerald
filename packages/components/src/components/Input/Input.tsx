import React from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import styles from './Input.module.scss';
import { Icon as DDSIcon } from '../Icon';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type InputSize = 'sm' | 'md' | 'lg';

type InputBaseProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: InputSize;
  invalid?: boolean;
  startIcon?: LucideIcon;
  endAdornment?: React.ReactNode;
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

const startIconClassName = getRequiredClassName(styles, 'startIcon');
const endIconClassName = getRequiredClassName(styles, 'endIcon');
const endIconButtonClassName = getRequiredClassName(styles, 'endIconButton');

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      invalid = false,
      startIcon,
      endAdornment,
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
    const hasEndAdornment = Boolean(endAdornment);
    const hasEndIconAction = Boolean(EndIcon && onEndIconClick);
    const hasEndAffordance = Boolean(EndIcon || hasEndAdornment);

    return (
      <div className={styles.wrapper}>
        {StartIcon ? (
          <DDSIcon icon={StartIcon} className={startIconClassName} aria-hidden="true" />
        ) : null}
        <input
          ref={ref}
          className={clsx(
            styles.root,
            sizeClassName[size],
            invalid && styles.invalid,
            StartIcon && styles.hasStartIcon,
            hasEndAffordance && styles.hasEndIcon,
            className
          )}
          {...props}
        />
        {hasEndAdornment ? <span className={endIconClassName}>{endAdornment}</span> : null}
        {EndIcon && hasEndIconAction ? (
          <button
            className={endIconButtonClassName}
            type="button"
            aria-label={endIconLabel}
            onClick={onEndIconClick}
            disabled={props.disabled || props.readOnly}
          >
            <DDSIcon icon={EndIcon} aria-hidden="true" />
          </button>
        ) : null}
        {EndIcon && !hasEndAdornment && !hasEndIconAction ? (
          <DDSIcon icon={EndIcon} className={endIconClassName} aria-hidden="true" />
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

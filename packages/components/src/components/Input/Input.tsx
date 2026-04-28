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
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  endAdornmentInteractive?: boolean;
  endAdornmentWidth?: 'default' | 'wide';
  endAdornmentClassName?: string;
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
const hasWideEndAdornmentClassName = getRequiredClassName(styles, 'hasWideEndAdornment');
const endAdornmentInteractiveClassName = getRequiredClassName(styles, 'endAdornmentInteractive');

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      invalid = false,
      startIcon,
      startAdornment,
      endAdornment,
      endAdornmentInteractive = false,
      endAdornmentWidth = 'default',
      endAdornmentClassName,
      endIcon,
      endIconLabel,
      onEndIconClick,
      className,
      ...props
    }: InputProps,
    ref
  ) => {
    const StartIcon = startIcon;
    const hasStartAdornment = Boolean(startAdornment);
    const EndIcon = endIcon;
    const hasEndAdornment = Boolean(endAdornment);
    const hasEndIconAction = Boolean(EndIcon && onEndIconClick);
    const hasStartAffordance = Boolean(StartIcon || hasStartAdornment);
    const hasEndAffordance = Boolean(EndIcon || hasEndAdornment);
    const hasWideEndAdornment = hasEndAdornment && endAdornmentWidth === 'wide';

    return (
      <div className={styles.wrapper}>
        {hasStartAdornment ? <span className={startIconClassName}>{startAdornment}</span> : null}
        {!hasStartAdornment && StartIcon ? (
          <DDSIcon icon={StartIcon} className={startIconClassName} aria-hidden="true" />
        ) : null}
        <input
          ref={ref}
          className={clsx(
            styles.root,
            sizeClassName[size],
            invalid && styles.invalid,
            hasStartAffordance && styles.hasStartIcon,
            hasEndAffordance && styles.hasEndIcon,
            hasWideEndAdornment && hasWideEndAdornmentClassName,
            className
          )}
          {...props}
        />
        {hasEndAdornment ? (
          <span
            className={clsx(
              endIconClassName,
              endAdornmentInteractive && endAdornmentInteractiveClassName,
              endAdornmentClassName
            )}
          >
            {endAdornment}
          </span>
        ) : null}
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

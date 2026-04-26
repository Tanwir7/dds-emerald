import * as Progress from '@radix-ui/react-progress';
import clsx from 'clsx';
import React from 'react';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import styles from './ProgressBar.module.scss';

export type ProgressBarSize = 'sm' | 'md' | 'lg';
export type ProgressBarVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface ProgressBarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> {
  value?: number;
  max?: number;
  size?: ProgressBarSize;
  variant?: ProgressBarVariant;
  label?: string;
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

const getNodeEnv = () => {
  const globalWithProcess = globalThis as typeof globalThis & {
    process?: { env?: { NODE_ENV?: string } };
  };

  return globalWithProcess.process?.env?.NODE_ENV;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const resolveMax = (max: number | undefined) => {
  if (typeof max !== 'number' || !Number.isFinite(max) || max <= 0) {
    return 100;
  }

  return max;
};

const variantClassName: Record<ProgressBarVariant, string> = {
  default: getRequiredClassName(styles, 'variantDefault'),
  success: getRequiredClassName(styles, 'variantSuccess'),
  warning: getRequiredClassName(styles, 'variantWarning'),
  danger: getRequiredClassName(styles, 'variantDanger'),
  info: getRequiredClassName(styles, 'variantInfo'),
};

/**
 * ProgressBar wraps Radix Progress to provide DDS tokens, variants, and an optional
 * inline percentage label. The inline `transform` style on the indicator is a
 * component-specific exception required to drive the fill position from the current value.
 */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      variant = 'default',
      label,
      showValue = false,
      animated = true,
      className,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref
  ) => {
    if (!label && !ariaLabelledBy && getNodeEnv() !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('ProgressBar expects a label or aria-labelledby prop for accessibility.');
    }

    const resolvedMax = resolveMax(max);
    const isDeterminate = typeof value === 'number' && Number.isFinite(value);
    const resolvedValue = isDeterminate ? clamp(value, 0, resolvedMax) : undefined;
    const completionPercent =
      resolvedValue !== undefined ? (resolvedValue / resolvedMax) * 100 : undefined;
    const indicatorStyle =
      completionPercent !== undefined
        ? {
            transform: `translateX(-${100 - completionPercent}%)`,
          }
        : undefined;

    return (
      <div className={clsx(styles.wrapper, className)}>
        <Progress.Root
          ref={ref}
          value={resolvedValue ?? null}
          max={resolvedMax}
          aria-label={label}
          aria-labelledby={ariaLabelledBy}
          aria-valuenow={resolvedValue}
          aria-valuemin={0}
          aria-valuemax={resolvedMax}
          className={clsx(
            styles.root,
            styles[size],
            !isDeterminate && styles.indeterminate,
            !animated && styles.noAnimation
          )}
          {...props}
        >
          <Progress.Indicator
            className={clsx(styles.indicator, variantClassName[variant])}
            style={indicatorStyle}
          />
        </Progress.Root>

        {showValue && completionPercent !== undefined ? (
          <span className={styles.valueLabel} aria-hidden="true">
            {Math.round(completionPercent)}%
          </span>
        ) : null}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

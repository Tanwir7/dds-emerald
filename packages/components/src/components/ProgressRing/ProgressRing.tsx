import clsx from 'clsx';
import React from 'react';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import styles from './ProgressRing.module.scss';

export type ProgressRingSize = 'sm' | 'md' | 'lg';
export type ProgressRingVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface ProgressRingProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  value?: number;
  max?: number;
  size?: ProgressRingSize;
  variant?: ProgressRingVariant;
  label?: string;
  showValue?: boolean;
  strokeWidth?: number;
  animated?: boolean;
  className?: string;
}

const sizeMap: Record<ProgressRingSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
};

const strokeMap: Record<ProgressRingSize, number> = {
  sm: 3,
  md: 4,
  lg: 5,
};

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

const variantClassName: Record<ProgressRingVariant, string> = {
  default: getRequiredClassName(styles, 'variantDefault'),
  success: getRequiredClassName(styles, 'variantSuccess'),
  warning: getRequiredClassName(styles, 'variantWarning'),
  danger: getRequiredClassName(styles, 'variantDanger'),
  info: getRequiredClassName(styles, 'variantInfo'),
};

/**
 * ProgressRing renders a circular SVG progress indicator. The inline `transformOrigin`
 * style on the arc is a documented SVG-specific exception so the rotating indeterminate
 * state keeps the arc centered on the ring geometry.
 */
export const ProgressRing = React.forwardRef<HTMLSpanElement, ProgressRingProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      variant = 'default',
      label,
      showValue = false,
      strokeWidth,
      animated = true,
      className,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref
  ) => {
    if (!label && !ariaLabelledBy && getNodeEnv() !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('ProgressRing expects a label or aria-labelledby prop for accessibility.');
    }

    const resolvedMax = resolveMax(max);
    const isDeterminate = typeof value === 'number' && Number.isFinite(value);
    const resolvedValue = isDeterminate ? clamp(value, 0, resolvedMax) : undefined;
    const progressRatio = resolvedValue !== undefined ? resolvedValue / resolvedMax : undefined;
    const svgSize = sizeMap[size];
    const stroke = strokeWidth ?? strokeMap[size];
    const radius = (svgSize - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashArray =
      progressRatio === undefined ? `${circumference * 0.25} ${circumference}` : `${circumference}`;
    const dashOffset =
      progressRatio === undefined ? circumference * 0.75 : circumference * (1 - progressRatio);
    const valueLabel = progressRatio === undefined ? undefined : Math.round(progressRatio * 100);

    return (
      <span
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-labelledby={ariaLabelledBy}
        aria-valuenow={resolvedValue}
        aria-valuemin={0}
        aria-valuemax={resolvedMax}
        className={clsx(styles.root, styles[size], className)}
        {...props}
      >
        <svg
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          width={svgSize}
          height={svgSize}
          aria-hidden="true"
          className={clsx(
            styles.svg,
            !isDeterminate && styles.indeterminate,
            !animated && styles.noAnimation
          )}
        >
          <circle
            className={styles.track}
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
          />
          <circle
            className={clsx(styles.arc, variantClassName[variant])}
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transformOrigin: 'center' }}
          />
        </svg>

        {showValue && valueLabel !== undefined ? (
          <span className={styles.valueLabel} aria-hidden="true">
            {valueLabel}%
          </span>
        ) : null}
      </span>
    );
  }
);

ProgressRing.displayName = 'ProgressRing';

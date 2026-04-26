import clsx from 'clsx';
import React from 'react';
import styles from './Rating.module.scss';

export type RatingSize = 'sm' | 'md' | 'lg';
export type RatingFill = 'full' | 'half' | 'empty';

export interface RatingProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'defaultValue' | 'onChange'
> {
  value?: number;
  defaultValue?: number;
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: RatingSize;
  allowHalf?: boolean;
  label?: string;
  className?: string;
}

const STAR_PATH = 'M10 1l2.39 7.26H19l-5.5 4 2.1 7.26L10 15.27l-5.6 4.25 2.1-7.26L1 8.26h6.61z';

const fillClassName: Record<RatingFill, string> = {
  full: styles.fillFull,
  half: styles.fillHalf,
  empty: styles.fillEmpty,
};

const getResolvedMax = (max: number | undefined) => {
  if (typeof max !== 'number' || !Number.isFinite(max) || max < 1) {
    return 5;
  }

  return Math.max(1, Math.round(max));
};

const clampValue = (value: number | undefined, max: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), max);
};

const StarIcon = ({ fill, halfId }: { fill: RatingFill; halfId?: string }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" width="100%" height="100%">
    {fill === 'half' && halfId ? (
      <>
        <defs>
          <clipPath id={halfId}>
            <rect x="0" y="0" width="10" height="20" />
          </clipPath>
        </defs>
        <path
          d={STAR_PATH}
          fill="var(--dds-color-bg-subtle)"
          stroke="currentColor"
          strokeWidth="1"
        />
        <path d={STAR_PATH} fill="currentColor" clipPath={`url(#${halfId})`} />
      </>
    ) : (
      <path
        d={STAR_PATH}
        fill={fill === 'full' ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1"
      />
    )}
  </svg>
);

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      defaultValue = 0,
      max = 5,
      onChange,
      readOnly = false,
      size = 'md',
      allowHalf = false,
      label = 'Rating',
      className,
      onMouseLeave,
      tabIndex,
      ...props
    },
    ref
  ) => {
    const resolvedMax = getResolvedMax(max);
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
    const [internalValue, setInternalValue] = React.useState(() =>
      clampValue(defaultValue, resolvedMax)
    );
    const isControlled = value !== undefined;
    const currentValue = clampValue(isControlled ? value : internalValue, resolvedMax);
    const displayValue = hoveredIndex !== null ? hoveredIndex : currentValue;
    const hasSelection =
      Number.isInteger(currentValue) && currentValue >= 1 && currentValue <= resolvedMax;
    const uid = React.useId();
    const starRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

    const getFill = (index: number): RatingFill => {
      if (displayValue >= index) {
        return 'full';
      }

      if (allowHalf && displayValue >= index - 0.5) {
        return 'half';
      }

      return 'empty';
    };

    const handleSelect = (nextValue: number) => {
      const resolvedValue = clampValue(nextValue, resolvedMax);

      if (!isControlled) {
        setInternalValue(resolvedValue);
      }

      onChange?.(resolvedValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        const next = Math.min(index + 1, resolvedMax);
        handleSelect(next);
        starRefs.current[next - 1]?.focus();
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        const previous = Math.max(index - 1, 1);
        handleSelect(previous);
        starRefs.current[previous - 1]?.focus();
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        handleSelect(1);
        starRefs.current[0]?.focus();
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        handleSelect(resolvedMax);
        starRefs.current[resolvedMax - 1]?.focus();
      }
    };

    const rootClassName = clsx(styles.root, styles[size], readOnly && styles.readOnly, className);

    if (readOnly) {
      return (
        <div
          {...props}
          ref={ref}
          role="img"
          aria-label={`${currentValue} out of ${resolvedMax} stars`}
          className={rootClassName}
        >
          {Array.from({ length: resolvedMax }, (_, index) => {
            const starIndex = index + 1;
            const fill = getFill(starIndex);

            return (
              <span
                key={starIndex}
                aria-hidden="true"
                className={clsx(styles.star, fillClassName[fill])}
              >
                <StarIcon
                  fill={fill}
                  halfId={fill === 'half' ? `${uid}-${starIndex}` : undefined}
                />
              </span>
            );
          })}
        </div>
      );
    }

    return (
      <div
        {...props}
        ref={ref}
        role="radiogroup"
        aria-label={label}
        tabIndex={tabIndex ?? -1}
        className={rootClassName}
        onMouseLeave={(event) => {
          setHoveredIndex(null);
          onMouseLeave?.(event);
        }}
      >
        {Array.from({ length: resolvedMax }, (_, index) => {
          const starIndex = index + 1;
          const fill = getFill(starIndex);
          const isSelected = currentValue === starIndex;
          const isTabStop = isSelected || (!hasSelection && starIndex === 1);

          return (
            <button
              key={starIndex}
              ref={(element) => {
                starRefs.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${starIndex} out of ${resolvedMax} stars`}
              className={clsx(styles.star, fillClassName[fill])}
              onClick={() => handleSelect(starIndex)}
              onKeyDown={(event) => handleKeyDown(event, starIndex)}
              onMouseEnter={() => setHoveredIndex(starIndex)}
              tabIndex={isTabStop ? 0 : -1}
            >
              <StarIcon fill={fill} halfId={fill === 'half' ? `${uid}-${starIndex}` : undefined} />
            </button>
          );
        })}
      </div>
    );
  }
);

Rating.displayName = 'Rating';

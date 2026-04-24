import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import clsx from 'clsx';
import styles from './Slider.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type SliderSize = 'sm' | 'md';
export type SliderOrientation = 'horizontal' | 'vertical';

type SliderRootProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'aria-label' | 'aria-labelledby' | 'children' | 'className' | 'defaultValue' | 'dir'
>;

export interface SliderProps extends SliderRootProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  disabled?: boolean;
  orientation?: SliderOrientation;
  size?: SliderSize;
  minStepsBetweenThumbs?: number;
  name?: string;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  thumbLabels?: string[];
}

const sizeClassName: Record<SliderSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
};

const orientationClassName: Record<SliderOrientation, string> = {
  horizontal: getRequiredClassName(styles, 'horizontal'),
  vertical: getRequiredClassName(styles, 'vertical'),
};

export const Slider = React.forwardRef<HTMLSpanElement, SliderProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue,
      onValueChange,
      onValueCommit,
      disabled = false,
      orientation = 'horizontal',
      size = 'md',
      minStepsBetweenThumbs,
      name,
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      thumbLabels,
      ...props
    }: SliderProps,
    ref
  ) => {
    const fallbackDefaultValue =
      value === undefined && defaultValue === undefined ? [min] : undefined;
    const rootDefaultValue = defaultValue ?? fallbackDefaultValue;
    const thumbValues = value ?? rootDefaultValue ?? [min];
    const thumbCount = Math.max(1, thumbValues.length);

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={clsx(
          styles.root,
          sizeClassName[size],
          orientationClassName[orientation],
          className
        )}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        orientation={orientation}
        {...(value !== undefined ? { value } : {})}
        {...(rootDefaultValue !== undefined ? { defaultValue: rootDefaultValue } : {})}
        {...(onValueChange !== undefined ? { onValueChange } : {})}
        {...(onValueCommit !== undefined ? { onValueCommit } : {})}
        {...(minStepsBetweenThumbs !== undefined ? { minStepsBetweenThumbs } : {})}
        {...(name !== undefined ? { name } : {})}
        {...props}
      >
        <SliderPrimitive.Track className={styles.track}>
          <SliderPrimitive.Range className={styles.range} />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbCount }, (_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className={styles.thumb}
            aria-label={thumbLabels?.[index] ?? ariaLabel}
            aria-labelledby={ariaLabelledBy}
          />
        ))}
      </SliderPrimitive.Root>
    );
  }
);

Slider.displayName = 'Slider';

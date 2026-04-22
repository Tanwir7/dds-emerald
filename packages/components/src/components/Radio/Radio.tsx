import React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import clsx from 'clsx';
import styles from './Radio.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type RadioSize = 'sm' | 'md';
export type RadioGroupOrientation = 'horizontal' | 'vertical';

export interface RadioProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'value'
> {
  value: string;
  size?: RadioSize;
  invalid?: boolean;
  className?: string;
}

export interface RadioGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'dir' | 'onChange'
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  orientation?: RadioGroupOrientation;
  dir?: 'ltr' | 'rtl';
  name?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

const sizeClassName: Record<RadioSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
};

const orientationClassName: Record<RadioGroupOrientation, string> = {
  horizontal: getRequiredClassName(styles, 'horizontal'),
  vertical: getRequiredClassName(styles, 'vertical'),
};

export const Radio = React.forwardRef<HTMLButtonElement, RadioProps>(
  ({ size = 'md', invalid = false, className, ...props }: RadioProps, ref) => {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        className={clsx(styles.root, sizeClassName[size], invalid && styles.invalid, className)}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className={styles.indicator}>
          <span className={styles.dot} />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    );
  }
);

Radio.displayName = 'Radio';

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ orientation = 'vertical', className, children, ...props }: RadioGroupProps, ref) => {
    return (
      <RadioGroupPrimitive.Root
        ref={ref}
        orientation={orientation}
        className={clsx(styles.group, orientationClassName[orientation], className)}
        {...props}
      >
        {children}
      </RadioGroupPrimitive.Root>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

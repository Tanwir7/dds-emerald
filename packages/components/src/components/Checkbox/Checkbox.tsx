import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import clsx from 'clsx';
import styles from './Checkbox.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type CheckboxSize = 'sm' | 'md';
export type CheckboxCheckedState = boolean | 'indeterminate';

export interface CheckboxProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'defaultChecked' | 'onChange' | 'value'
> {
  size?: CheckboxSize;
  checked?: CheckboxCheckedState;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: CheckboxCheckedState) => void;
  invalid?: boolean;
  name?: string;
  value?: string;
  className?: string;
}

const sizeClassName: Record<CheckboxSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
};

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      size = 'md',
      invalid = false,
      className,
      checked,
      defaultChecked,
      onCheckedChange,
      ...props
    }: CheckboxProps,
    ref
  ) => {
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        className={clsx(styles.root, sizeClassName[size], invalid && styles.invalid, className)}
        {...(checked !== undefined ? { checked } : {})}
        {...(defaultChecked !== undefined ? { defaultChecked } : {})}
        {...(onCheckedChange !== undefined ? { onCheckedChange } : {})}
        {...props}
      >
        <CheckboxPrimitive.Indicator className={styles.indicator}>
          <svg aria-hidden="true" className={styles.checkIcon} fill="none" viewBox="0 0 16 16">
            <path d="M3.5 8.25 6.5 11 12.5 4.75" />
          </svg>
          <svg aria-hidden="true" className={styles.dashIcon} fill="none" viewBox="0 0 16 16">
            <path d="M4 8h8" />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  }
);

Checkbox.displayName = 'Checkbox';

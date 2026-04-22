import React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import clsx from 'clsx';
import styles from './Switch.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type SwitchSize = 'sm' | 'md';

export interface SwitchProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'checked' | 'children' | 'defaultChecked' | 'onChange' | 'value'
> {
  size?: SwitchSize;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  invalid?: boolean;
  name?: string;
  value?: string;
  className?: string;
}

const sizeClassName: Record<SwitchSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
};

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      size = 'md',
      invalid = false,
      className,
      checked,
      defaultChecked,
      onCheckedChange,
      ...props
    }: SwitchProps,
    ref
  ) => {
    return (
      <SwitchPrimitive.Root
        ref={ref}
        className={clsx(styles.root, sizeClassName[size], invalid && styles.invalid, className)}
        {...(checked !== undefined ? { checked } : {})}
        {...(defaultChecked !== undefined ? { defaultChecked } : {})}
        {...(onCheckedChange !== undefined ? { onCheckedChange } : {})}
        {...props}
      >
        <SwitchPrimitive.Thumb className={styles.thumb} />
      </SwitchPrimitive.Root>
    );
  }
);

Switch.displayName = 'Switch';

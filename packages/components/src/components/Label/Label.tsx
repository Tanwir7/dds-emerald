import React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import clsx from 'clsx';
import styles from './Label.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type LabelSize = 'sm' | 'base';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  disabled?: boolean;
  size?: LabelSize;
  className?: string;
  children: React.ReactNode;
}

const sizeClassName: Record<LabelSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  base: getRequiredClassName(styles, 'base'),
};

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ required = false, disabled = false, size = 'sm', className, children, ...props }, ref) => {
    return (
      <LabelPrimitive.Root
        ref={ref}
        className={clsx(styles.root, sizeClassName[size], disabled && styles.disabled, className)}
        {...props}
      >
        {children}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : null}
      </LabelPrimitive.Root>
    );
  }
);

Label.displayName = 'Label';

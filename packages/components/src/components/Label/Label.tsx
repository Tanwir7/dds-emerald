import React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import clsx from 'clsx';
import styles from './Label.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type LabelSize = 'sm' | 'base';
export type LabelLayout = 'inline' | 'wrap';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  size?: LabelSize | undefined;
  layout?: LabelLayout | undefined;
  className?: string | undefined;
  children: React.ReactNode;
}

const sizeClassName: Record<LabelSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  base: getRequiredClassName(styles, 'base'),
};

const layoutClassName: Record<LabelLayout, string> = {
  inline: getRequiredClassName(styles, 'inline'),
  wrap: getRequiredClassName(styles, 'wrap'),
};

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      required = false,
      disabled = false,
      size = 'sm',
      layout = 'inline',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <LabelPrimitive.Root
        ref={ref}
        className={clsx(
          styles.root,
          sizeClassName[size],
          layoutClassName[layout],
          disabled && styles.disabled,
          className
        )}
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

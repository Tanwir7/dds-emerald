import React from 'react';
import * as RadixVisuallyHidden from '@radix-ui/react-visually-hidden';
import clsx from 'clsx';

export interface VisuallyHiddenProps extends Pick<
  RadixVisuallyHidden.VisuallyHiddenProps,
  'children' | 'className'
> {
  className?: string;
  children?: React.ReactNode;
}

export const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <RadixVisuallyHidden.Root ref={ref} className={clsx(className)} {...props}>
        {children}
      </RadixVisuallyHidden.Root>
    );
  }
);

VisuallyHidden.displayName = 'VisuallyHidden';

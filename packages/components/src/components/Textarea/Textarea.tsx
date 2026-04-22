import React from 'react';
import clsx from 'clsx';
import styles from './Textarea.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaResize = 'none' | 'vertical' | 'both';

export interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'size'
> {
  size?: TextareaSize;
  resize?: TextareaResize;
  invalid?: boolean;
  className?: string;
}

const sizeClassName: Record<TextareaSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
};

const resizeClassName: Record<TextareaResize, string> = {
  none: getRequiredClassName(styles, 'resizeNone'),
  vertical: getRequiredClassName(styles, 'resizeVertical'),
  both: getRequiredClassName(styles, 'resizeBoth'),
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ size = 'md', rows = 3, resize = 'vertical', invalid = false, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          styles.root,
          sizeClassName[size],
          resizeClassName[resize],
          invalid && styles.invalid,
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

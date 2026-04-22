import React from 'react';
import clsx from 'clsx';
import styles from './Code.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type CodeSize = 'xs' | 'sm' | 'base';

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  size?: CodeSize;
  block?: boolean;
  className?: string;
  children: React.ReactNode;
}

const sizeClassName: Record<CodeSize, string> = {
  xs: getRequiredClassName(styles, 'xs'),
  sm: getRequiredClassName(styles, 'sm'),
  base: getRequiredClassName(styles, 'base'),
};

export const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ size = 'sm', block = false, className, children, ...props }, ref) => {
    const code = (
      <code
        ref={ref}
        className={clsx(styles.root, sizeClassName[size], block && styles.block, className)}
        {...props}
      >
        {children}
      </code>
    );

    if (block) {
      return (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Required so keyboard users can scroll overflowing code blocks.
        <pre className={styles.pre} tabIndex={0}>
          {code}
        </pre>
      );
    }

    return code;
  }
);

Code.displayName = 'Code';

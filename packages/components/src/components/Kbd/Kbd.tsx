import React from 'react';
import clsx from 'clsx';
import styles from './Kbd.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type KbdSize = 'sm' | 'base';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  size?: KbdSize;
  className?: string;
  children: React.ReactNode;
}

const sizeClassName: Record<KbdSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  base: getRequiredClassName(styles, 'base'),
};

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ size = 'sm', className, children, ...props }, ref) => {
    return (
      <kbd ref={ref} className={clsx(styles.root, sizeClassName[size], className)} {...props}>
        {children}
      </kbd>
    );
  }
);

Kbd.displayName = 'Kbd';

import React from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import styles from './Icon.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type IconSize = 'sm' | 'md' | 'lg';

export interface IconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  icon: LucideIcon;
  size?: IconSize;
  label?: string;
  className?: string;
}

const sizeClassName: Record<IconSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
};

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ icon: IconComponent, size = 'md', label, className, ...props }, ref) => {
    const accessibleLabel = label?.trim();

    return (
      <span ref={ref} className={clsx(styles.root, sizeClassName[size], className)} {...props}>
        <IconComponent
          className={styles.svg}
          aria-hidden={accessibleLabel ? undefined : true}
          role={accessibleLabel ? 'img' : undefined}
          aria-label={accessibleLabel || undefined}
          focusable="false"
        />
      </span>
    );
  }
);

Icon.displayName = 'Icon';

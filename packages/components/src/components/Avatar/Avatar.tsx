import React from 'react';
import clsx from 'clsx';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import styles from './Avatar.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps extends Omit<
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
  'children'
> {
  src?: string;
  alt?: string;
  fallback: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClassName: Record<AvatarSize, string> = {
  sm: getRequiredClassName(styles, 'sizeSm'),
  md: getRequiredClassName(styles, 'sizeMd'),
  lg: getRequiredClassName(styles, 'sizeLg'),
};

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, alt = '', fallback, size = 'md', className, ...props }, ref) => {
    const fallbackText = fallback.slice(0, 2);

    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={clsx(styles.root, sizeClassName[size], className)}
        {...props}
      >
        {src ? <AvatarPrimitive.Image className={styles.image} src={src} alt={alt} /> : null}
        <AvatarPrimitive.Fallback className={styles.fallback}>
          {fallbackText}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  }
);

Avatar.displayName = 'Avatar';

import React from 'react';
import clsx from 'clsx';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import styles from './Avatar.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  size?: AvatarSize;
  className?: string;
  children: React.ReactNode;
}

export interface AvatarImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'alt' | 'className' | 'src'
> {
  src: string;
  alt: string;
  className?: string;
  onLoadingStatusChange?: (status: AvatarImageLoadingStatus) => void;
}

export interface AvatarFallbackProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'className' | 'children'
> {
  delayMs?: number;
  className?: string;
  children: React.ReactNode;
}

const sizeClassName: Record<AvatarSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
};

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ size = 'md', className, children, ...props }, ref) => (
    <AvatarPrimitive.Root
      ref={ref}
      className={clsx(styles.root, sizeClassName[size], className)}
      {...props}
    >
      {children}
    </AvatarPrimitive.Root>
  )
);

Avatar.displayName = 'Avatar';

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, ...props }, ref) => (
    <AvatarPrimitive.Image
      ref={ref}
      className={clsx(styles.image, className)}
      src={src}
      alt={alt}
      {...props}
    />
  )
);

AvatarImage.displayName = 'AvatarImage';

export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ delayMs = 600, className, children, ...props }, ref) => (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={clsx(styles.fallback, className)}
      delayMs={delayMs}
      {...props}
    >
      {children}
    </AvatarPrimitive.Fallback>
  )
);

AvatarFallback.displayName = 'AvatarFallback';

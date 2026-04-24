import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import styles from './Container.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type ContainerPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ContainerBackground = 'default' | 'subtle' | 'card' | 'muted';
export type ContainerBorderRadius = 'none' | 'full';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  padding?: ContainerPadding;
  paddingX?: ContainerPadding;
  paddingY?: ContainerPadding;
  background?: ContainerBackground;
  border?: boolean;
  borderRadius?: ContainerBorderRadius;
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const paddingClassName: Record<ContainerPadding, string> = {
  none: getRequiredClassName(styles, 'pNone'),
  xs: getRequiredClassName(styles, 'pXs'),
  sm: getRequiredClassName(styles, 'pSm'),
  md: getRequiredClassName(styles, 'pMd'),
  lg: getRequiredClassName(styles, 'pLg'),
  xl: getRequiredClassName(styles, 'pXl'),
};

const paddingXClassName: Record<ContainerPadding, string> = {
  none: getRequiredClassName(styles, 'pxNone'),
  xs: getRequiredClassName(styles, 'pxXs'),
  sm: getRequiredClassName(styles, 'pxSm'),
  md: getRequiredClassName(styles, 'pxMd'),
  lg: getRequiredClassName(styles, 'pxLg'),
  xl: getRequiredClassName(styles, 'pxXl'),
};

const paddingYClassName: Record<ContainerPadding, string> = {
  none: getRequiredClassName(styles, 'pyNone'),
  xs: getRequiredClassName(styles, 'pyXs'),
  sm: getRequiredClassName(styles, 'pySm'),
  md: getRequiredClassName(styles, 'pyMd'),
  lg: getRequiredClassName(styles, 'pyLg'),
  xl: getRequiredClassName(styles, 'pyXl'),
};

const backgroundClassName: Record<ContainerBackground, string> = {
  default: getRequiredClassName(styles, 'bgDefault'),
  subtle: getRequiredClassName(styles, 'bgSubtle'),
  card: getRequiredClassName(styles, 'bgCard'),
  muted: getRequiredClassName(styles, 'bgMuted'),
};

const borderRadiusClassName: Record<ContainerBorderRadius, string> = {
  none: getRequiredClassName(styles, 'radiusNone'),
  full: getRequiredClassName(styles, 'radiusFull'),
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      as: Component = 'div',
      padding,
      paddingX,
      paddingY,
      background,
      border = false,
      borderRadius,
      asChild = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Root = asChild ? Slot : Component;

    return (
      <Root
        ref={ref as React.ForwardedRef<HTMLElement>}
        className={clsx(
          styles.root,
          padding && paddingClassName[padding],
          paddingX && paddingXClassName[paddingX],
          paddingY && paddingYClassName[paddingY],
          background && backgroundClassName[background],
          border && styles.border,
          borderRadius && borderRadiusClassName[borderRadius],
          className
        )}
        {...props}
      >
        {children}
      </Root>
    );
  }
);

Container.displayName = 'Container';

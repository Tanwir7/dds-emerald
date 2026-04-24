import React from 'react';
import clsx from 'clsx';
import styles from './Stack.module.scss';
import { Divider } from '../Divider';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type StackDirection = 'vertical' | 'horizontal';
export type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  direction?: StackDirection;
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  inline?: boolean;
  /**
   * Renders Divider components between children. Horizontal stacks use vertical dividers,
   * so consumers should ensure child items establish a consistent height.
   */
  dividers?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const directionClassName: Record<StackDirection, string> = {
  vertical: getRequiredClassName(styles, 'vertical'),
  horizontal: getRequiredClassName(styles, 'horizontal'),
};

const gapClassName: Record<StackGap, string> = {
  none: getRequiredClassName(styles, 'gapNone'),
  xs: getRequiredClassName(styles, 'gapXs'),
  sm: getRequiredClassName(styles, 'gapSm'),
  md: getRequiredClassName(styles, 'gapMd'),
  lg: getRequiredClassName(styles, 'gapLg'),
  xl: getRequiredClassName(styles, 'gapXl'),
};

const alignClassName: Record<StackAlign, string> = {
  start: getRequiredClassName(styles, 'alignStart'),
  center: getRequiredClassName(styles, 'alignCenter'),
  end: getRequiredClassName(styles, 'alignEnd'),
  stretch: getRequiredClassName(styles, 'alignStretch'),
  baseline: getRequiredClassName(styles, 'alignBaseline'),
};

const justifyClassName: Record<StackJustify, string> = {
  start: getRequiredClassName(styles, 'justifyStart'),
  center: getRequiredClassName(styles, 'justifyCenter'),
  end: getRequiredClassName(styles, 'justifyEnd'),
  between: getRequiredClassName(styles, 'justifyBetween'),
  around: getRequiredClassName(styles, 'justifyAround'),
  evenly: getRequiredClassName(styles, 'justifyEvenly'),
};

const renderStackChildren = (
  children: React.ReactNode,
  dividers: boolean,
  direction: StackDirection
) => {
  if (!dividers) {
    return children;
  }

  const childArray = React.Children.toArray(children);

  return childArray.reduce<React.ReactNode[]>((acc, child, index) => {
    if (index > 0) {
      acc.push(
        <Divider
          key={`divider-${index}`}
          orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
        />
      );
    }

    acc.push(child);
    return acc;
  }, []);
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      as: Component = 'div',
      direction = 'vertical',
      gap = 'md',
      align,
      justify = 'start',
      wrap = false,
      inline = false,
      dividers = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const resolvedAlign = align ?? (direction === 'horizontal' ? 'center' : 'stretch');

    return (
      <Component
        ref={ref as React.ForwardedRef<HTMLElement>}
        className={clsx(
          styles.root,
          directionClassName[direction],
          gapClassName[gap],
          alignClassName[resolvedAlign],
          justifyClassName[justify],
          wrap && styles.wrap,
          inline && styles.inline,
          className
        )}
        {...props}
      >
        {renderStackChildren(children, dividers, direction)}
      </Component>
    );
  }
);

Stack.displayName = 'Stack';

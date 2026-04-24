import React from 'react';
import clsx from 'clsx';
import styles from './Flex.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | 'stretch';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  inline?: boolean;
  direction?: FlexDirection;
  wrap?: FlexWrap;
  gap?: FlexGap;
  columnGap?: FlexGap;
  rowGap?: FlexGap;
  align?: FlexAlign;
  justify?: FlexJustify;
  grow?: boolean;
  shrink?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export type FlexItemBasis = 'auto' | '0' | 'full' | 'min' | 'max';
export type FlexItemAlign = 'auto' | 'start' | 'center' | 'end' | 'stretch' | 'baseline';

export interface FlexItemProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  grow?: boolean | number;
  shrink?: boolean | number;
  basis?: FlexItemBasis;
  align?: FlexItemAlign;
  /**
   * Avoid using order - it breaks logical tab order for keyboard users. Use DOM reordering instead.
   */
  order?: number;
  className?: string;
  children?: React.ReactNode;
}

const directionClassNames: Record<FlexDirection, string> = {
  row: getRequiredClassName(styles, 'row'),
  'row-reverse': getRequiredClassName(styles, 'rowReverse'),
  column: getRequiredClassName(styles, 'column'),
  'column-reverse': getRequiredClassName(styles, 'columnReverse'),
};

const wrapClassNames: Record<FlexWrap, string> = {
  nowrap: getRequiredClassName(styles, 'nowrap'),
  wrap: getRequiredClassName(styles, 'wrap'),
  'wrap-reverse': getRequiredClassName(styles, 'wrapReverse'),
};

const gapClassNames: Record<FlexGap, string> = {
  none: getRequiredClassName(styles, 'gapNone'),
  xs: getRequiredClassName(styles, 'gapXs'),
  sm: getRequiredClassName(styles, 'gapSm'),
  md: getRequiredClassName(styles, 'gapMd'),
  lg: getRequiredClassName(styles, 'gapLg'),
  xl: getRequiredClassName(styles, 'gapXl'),
};

const columnGapClassNames: Record<FlexGap, string> = {
  none: getRequiredClassName(styles, 'colGapNone'),
  xs: getRequiredClassName(styles, 'colGapXs'),
  sm: getRequiredClassName(styles, 'colGapSm'),
  md: getRequiredClassName(styles, 'colGapMd'),
  lg: getRequiredClassName(styles, 'colGapLg'),
  xl: getRequiredClassName(styles, 'colGapXl'),
};

const rowGapClassNames: Record<FlexGap, string> = {
  none: getRequiredClassName(styles, 'rowGapNone'),
  xs: getRequiredClassName(styles, 'rowGapXs'),
  sm: getRequiredClassName(styles, 'rowGapSm'),
  md: getRequiredClassName(styles, 'rowGapMd'),
  lg: getRequiredClassName(styles, 'rowGapLg'),
  xl: getRequiredClassName(styles, 'rowGapXl'),
};

const alignClassNames: Record<FlexAlign, string> = {
  start: getRequiredClassName(styles, 'alignStart'),
  center: getRequiredClassName(styles, 'alignCenter'),
  end: getRequiredClassName(styles, 'alignEnd'),
  stretch: getRequiredClassName(styles, 'alignStretch'),
  baseline: getRequiredClassName(styles, 'alignBaseline'),
};

const justifyClassNames: Record<FlexJustify, string> = {
  start: getRequiredClassName(styles, 'justifyStart'),
  center: getRequiredClassName(styles, 'justifyCenter'),
  end: getRequiredClassName(styles, 'justifyEnd'),
  between: getRequiredClassName(styles, 'justifyBetween'),
  around: getRequiredClassName(styles, 'justifyAround'),
  evenly: getRequiredClassName(styles, 'justifyEvenly'),
  stretch: getRequiredClassName(styles, 'justifyStretch'),
};

const basisClassNames: Record<FlexItemBasis, string> = {
  auto: getRequiredClassName(styles, 'basisAuto'),
  '0': getRequiredClassName(styles, 'basis0'),
  full: getRequiredClassName(styles, 'basisFull'),
  min: getRequiredClassName(styles, 'basisMin'),
  max: getRequiredClassName(styles, 'basisMax'),
};

const selfAlignClassNames: Record<FlexItemAlign, string> = {
  auto: getRequiredClassName(styles, 'selfAuto'),
  start: getRequiredClassName(styles, 'selfStart'),
  center: getRequiredClassName(styles, 'selfCenter'),
  end: getRequiredClassName(styles, 'selfEnd'),
  stretch: getRequiredClassName(styles, 'selfStretch'),
  baseline: getRequiredClassName(styles, 'selfBaseline'),
};

const getNodeEnv = () => {
  const globalWithProcess = globalThis as typeof globalThis & {
    process?: { env?: { NODE_ENV?: string } };
  };

  return globalWithProcess.process?.env?.NODE_ENV;
};

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      as: Component = 'div',
      inline = false,
      direction,
      wrap = 'nowrap',
      gap,
      columnGap,
      rowGap,
      align,
      justify,
      grow = false,
      shrink = true,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <Component
      ref={ref as React.ForwardedRef<HTMLElement>}
      className={clsx(
        styles.root,
        inline && styles.inline,
        direction && directionClassNames[direction],
        wrapClassNames[wrap],
        gap && gapClassNames[gap],
        columnGap && columnGapClassNames[columnGap],
        rowGap && rowGapClassNames[rowGap],
        align && alignClassNames[align],
        justify && justifyClassNames[justify],
        grow && styles.grow,
        !shrink && styles.noShrink,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);

Flex.displayName = 'Flex';

export const FlexItem = React.forwardRef<HTMLDivElement, FlexItemProps>(
  (
    {
      as: Component = 'div',
      grow = false,
      shrink = true,
      basis = 'auto',
      align = 'auto',
      order,
      className,
      children,
      ...props
    },
    ref
  ) => {
    if (order !== undefined && getNodeEnv() !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        'FlexItem order should be avoided because it breaks logical tab order for keyboard users. Use DOM reordering instead.'
      );
    }

    const style = order !== undefined ? ({ order } as React.CSSProperties) : undefined;
    const growClassName =
      typeof grow === 'boolean' ? (grow ? styles.itemGrow : styles.itemNoGrow) : undefined;
    const shrinkClassName =
      typeof shrink === 'boolean' ? (shrink ? styles.itemShrink : styles.itemNoShrink) : undefined;
    const flexStyle =
      typeof grow === 'number' || typeof shrink === 'number'
        ? ({
            ...(typeof grow === 'number' ? { flexGrow: grow } : null),
            ...(typeof shrink === 'number' ? { flexShrink: shrink } : null),
            ...style,
          } as React.CSSProperties)
        : style;

    return (
      <Component
        ref={ref as React.ForwardedRef<HTMLElement>}
        className={clsx(
          styles.item,
          growClassName,
          shrinkClassName,
          basisClassNames[basis],
          selfAlignClassNames[align],
          className
        )}
        style={flexStyle}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

FlexItem.displayName = 'FlexItem';

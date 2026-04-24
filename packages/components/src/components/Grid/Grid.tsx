import React from 'react';
import clsx from 'clsx';
import styles from './Grid.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type GridColumnCount = 1 | 2 | 3 | 4;
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type GridAlign = 'start' | 'center' | 'end' | 'stretch';
export type GridJustify = 'start' | 'center' | 'end' | 'stretch';

export type GridResponsiveColumns = {
  default?: GridColumnCount;
  sm?: GridColumnCount;
  md?: GridColumnCount;
  lg?: GridColumnCount;
  xl?: GridColumnCount;
};

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  columns?: GridColumnCount | GridResponsiveColumns;
  gap?: GridGap;
  columnGap?: GridGap;
  rowGap?: GridGap;
  align?: GridAlign;
  justify?: GridJustify;
  className?: string;
  children?: React.ReactNode;
}

export type GridItemColumnSpan = 1 | 2 | 3 | 4 | 'full';
export type GridItemRowSpan = 1 | 2 | 3 | 4;

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  colSpan?: GridItemColumnSpan;
  rowSpan?: GridItemRowSpan;
  className?: string;
  children?: React.ReactNode;
}

const columnClassNames: Record<GridColumnCount, string> = {
  1: getRequiredClassName(styles, 'cols1'),
  2: getRequiredClassName(styles, 'cols2'),
  3: getRequiredClassName(styles, 'cols3'),
  4: getRequiredClassName(styles, 'cols4'),
};

const smColumnClassNames: Record<GridColumnCount, string> = {
  1: getRequiredClassName(styles, 'smCols1'),
  2: getRequiredClassName(styles, 'smCols2'),
  3: getRequiredClassName(styles, 'smCols3'),
  4: getRequiredClassName(styles, 'smCols4'),
};

const mdColumnClassNames: Record<GridColumnCount, string> = {
  1: getRequiredClassName(styles, 'mdCols1'),
  2: getRequiredClassName(styles, 'mdCols2'),
  3: getRequiredClassName(styles, 'mdCols3'),
  4: getRequiredClassName(styles, 'mdCols4'),
};

const lgColumnClassNames: Record<GridColumnCount, string> = {
  1: getRequiredClassName(styles, 'lgCols1'),
  2: getRequiredClassName(styles, 'lgCols2'),
  3: getRequiredClassName(styles, 'lgCols3'),
  4: getRequiredClassName(styles, 'lgCols4'),
};

const xlColumnClassNames: Record<GridColumnCount, string> = {
  1: getRequiredClassName(styles, 'xlCols1'),
  2: getRequiredClassName(styles, 'xlCols2'),
  3: getRequiredClassName(styles, 'xlCols3'),
  4: getRequiredClassName(styles, 'xlCols4'),
};

const gapClassNames: Record<GridGap, string> = {
  none: getRequiredClassName(styles, 'gapNone'),
  xs: getRequiredClassName(styles, 'gapXs'),
  sm: getRequiredClassName(styles, 'gapSm'),
  md: getRequiredClassName(styles, 'gapMd'),
  lg: getRequiredClassName(styles, 'gapLg'),
  xl: getRequiredClassName(styles, 'gapXl'),
};

const columnGapClassNames: Record<GridGap, string> = {
  none: getRequiredClassName(styles, 'colGapNone'),
  xs: getRequiredClassName(styles, 'colGapXs'),
  sm: getRequiredClassName(styles, 'colGapSm'),
  md: getRequiredClassName(styles, 'colGapMd'),
  lg: getRequiredClassName(styles, 'colGapLg'),
  xl: getRequiredClassName(styles, 'colGapXl'),
};

const rowGapClassNames: Record<GridGap, string> = {
  none: getRequiredClassName(styles, 'rowGapNone'),
  xs: getRequiredClassName(styles, 'rowGapXs'),
  sm: getRequiredClassName(styles, 'rowGapSm'),
  md: getRequiredClassName(styles, 'rowGapMd'),
  lg: getRequiredClassName(styles, 'rowGapLg'),
  xl: getRequiredClassName(styles, 'rowGapXl'),
};

const alignClassNames: Record<GridAlign, string> = {
  start: getRequiredClassName(styles, 'alignStart'),
  center: getRequiredClassName(styles, 'alignCenter'),
  end: getRequiredClassName(styles, 'alignEnd'),
  stretch: getRequiredClassName(styles, 'alignStretch'),
};

const justifyClassNames: Record<GridJustify, string> = {
  start: getRequiredClassName(styles, 'justifyStart'),
  center: getRequiredClassName(styles, 'justifyCenter'),
  end: getRequiredClassName(styles, 'justifyEnd'),
  stretch: getRequiredClassName(styles, 'justifyStretch'),
};

const gridItemColumnSpanClassNames: Record<Exclude<GridItemColumnSpan, 'full'>, string> = {
  1: getRequiredClassName(styles, 'span1'),
  2: getRequiredClassName(styles, 'span2'),
  3: getRequiredClassName(styles, 'span3'),
  4: getRequiredClassName(styles, 'span4'),
};

const gridItemRowSpanClassNames: Record<GridItemRowSpan, string> = {
  1: getRequiredClassName(styles, 'rowSpan1'),
  2: getRequiredClassName(styles, 'rowSpan2'),
  3: getRequiredClassName(styles, 'rowSpan3'),
  4: getRequiredClassName(styles, 'rowSpan4'),
};

const getColumnClassName = (columns: GridColumnCount | GridResponsiveColumns) => {
  if (typeof columns === 'number') {
    return columnClassNames[columns];
  }

  return clsx(
    columns.default && columnClassNames[columns.default],
    columns.sm && smColumnClassNames[columns.sm],
    columns.md && mdColumnClassNames[columns.md],
    columns.lg && lgColumnClassNames[columns.lg],
    columns.xl && xlColumnClassNames[columns.xl]
  );
};

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      as: Component = 'div',
      columns = 1,
      gap = 'md',
      columnGap,
      rowGap,
      align = 'stretch',
      justify = 'stretch',
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
        getColumnClassName(columns),
        gapClassNames[gap],
        alignClassNames[align],
        justifyClassNames[justify],
        columnGap && columnGapClassNames[columnGap],
        rowGap && rowGapClassNames[rowGap],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);

Grid.displayName = 'Grid';

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ as: Component = 'div', colSpan, rowSpan, className, children, ...props }, ref) => (
    <Component
      ref={ref as React.ForwardedRef<HTMLElement>}
      className={clsx(
        colSpan === 'full'
          ? getRequiredClassName(styles, 'spanFull')
          : colSpan && gridItemColumnSpanClassNames[colSpan],
        rowSpan && gridItemRowSpanClassNames[rowSpan],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);

GridItem.displayName = 'GridItem';

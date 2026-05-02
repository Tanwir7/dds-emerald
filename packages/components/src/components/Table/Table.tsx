import clsx from 'clsx';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import React from 'react';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import styles from './Table.module.scss';

export type TableDensity = 'compact' | 'default' | 'comfortable';
export type TableLayout = 'auto' | 'fixed';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  density?: TableDensity;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  stickyHeader?: boolean;
  layout?: TableLayout;
  caption?: string;
  className?: string;
  children: React.ReactNode;
}

export interface TableScrollWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  'aria-label'?: string;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  numeric?: boolean;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | 'none';
  sticky?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  numeric?: boolean;
  truncate?: boolean;
  sticky?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  side?: 'top' | 'bottom';
  className?: string;
  children: React.ReactNode;
}

const densityClassNames: Record<TableDensity, string> = {
  compact: getRequiredClassName(styles, 'density-compact'),
  default: getRequiredClassName(styles, 'density-default'),
  comfortable: getRequiredClassName(styles, 'density-comfortable'),
};

const layoutClassNames: Record<TableLayout, string> = {
  auto: getRequiredClassName(styles, 'layout-auto'),
  fixed: getRequiredClassName(styles, 'layout-fixed'),
};

const alignClassNames = {
  left: getRequiredClassName(styles, 'align-left'),
  center: getRequiredClassName(styles, 'align-center'),
  right: getRequiredClassName(styles, 'align-right'),
} as const;

const captionSideClassNames = {
  top: getRequiredClassName(styles, 'caption-top'),
  bottom: getRequiredClassName(styles, 'caption-bottom'),
} as const;

const sortIconMap = {
  asc: ChevronUp,
  desc: ChevronDown,
  none: ChevronsUpDown,
} as const;

const ariaSortMap = {
  asc: 'ascending',
  desc: 'descending',
  none: 'none',
} as const;

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      density = 'default',
      striped = false,
      hoverable = true,
      bordered = false,
      stickyHeader = false,
      layout = 'auto',
      caption,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <table
      ref={ref}
      className={clsx(
        styles.table,
        densityClassNames[density],
        layoutClassNames[layout],
        striped && styles.striped,
        hoverable && styles.hoverable,
        bordered && styles.bordered,
        stickyHeader && styles.stickyHeader,
        className
      )}
      {...props}
    >
      {caption ? <TableCaption>{caption}</TableCaption> : null}
      {children}
    </table>
  )
);

Table.displayName = 'Table';

export const TableScrollWrapper = React.forwardRef<HTMLDivElement, TableScrollWrapperProps>(
  ({ className, children, 'aria-label': ariaLabel = 'Scrollable table', ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(styles.scrollWrapper, className)}
      role="region"
      aria-label={ariaLabel}
      // The scroll region must be keyboard-focusable so overflow content is reachable.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  )
);

TableScrollWrapper.displayName = 'TableScrollWrapper';

export const TableHead = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={clsx(styles.thead, className)} {...props} />
));

TableHead.displayName = 'TableHead';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={clsx(styles.tbody, className)} {...props} />
));

TableBody.displayName = 'TableBody';

export const TableFoot = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={clsx(styles.tfoot, className)} {...props} />
));

TableFoot.displayName = 'TableFoot';

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ selected = false, disabled = false, className, children, ...props }, ref) => (
    <tr
      ref={ref}
      aria-selected={selected || undefined}
      aria-disabled={disabled || undefined}
      className={clsx(
        styles.row,
        selected && styles.rowSelected,
        disabled && styles.rowDisabled,
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
);

TableRow.displayName = 'TableRow';

export const TableHeader = React.forwardRef<HTMLTableCellElement, TableHeaderProps>(
  (
    {
      align = 'left',
      numeric = false,
      sortable = false,
      sortDirection = 'none',
      sticky = false,
      className,
      children,
      scope = 'col',
      ...props
    },
    ref
  ) => {
    const SortIcon = sortable ? sortIconMap[sortDirection] : null;

    return (
      <th
        ref={ref}
        scope={scope}
        aria-sort={sortable ? ariaSortMap[sortDirection] : undefined}
        className={clsx(
          styles.th,
          alignClassNames[numeric ? 'right' : align],
          numeric && styles.numeric,
          sticky && styles.stickyCol,
          className
        )}
        {...props}
      >
        <span className={styles.thInner}>
          <span className={styles.thLabel}>{children}</span>
          {SortIcon ? (
            <SortIcon
              className={clsx(styles.sortIcon, sortDirection !== 'none' && styles.sortIconActive)}
              aria-hidden="true"
            />
          ) : null}
        </span>
      </th>
    );
  }
);

TableHeader.displayName = 'TableHeader';

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  (
    {
      align = 'left',
      numeric = false,
      truncate = false,
      sticky = false,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <td
      ref={ref}
      className={clsx(
        styles.td,
        alignClassNames[numeric ? 'right' : align],
        numeric && styles.numeric,
        truncate && styles.truncate,
        sticky && styles.stickyCol,
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
);

TableCell.displayName = 'TableCell';

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ side = 'bottom', className, children, ...props }, ref) => (
    <caption
      ref={ref}
      className={clsx(styles.caption, captionSideClassNames[side], className)}
      {...props}
    >
      {children}
    </caption>
  )
);

TableCaption.displayName = 'TableCaption';

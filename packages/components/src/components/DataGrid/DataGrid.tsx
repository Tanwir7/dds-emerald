/* eslint-disable react/prop-types, jsx-a11y/no-noninteractive-element-interactions */
import clsx from 'clsx';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Columns3,
  Funnel,
  MoreHorizontal,
  Search,
} from 'lucide-react';
import React from 'react';
import {
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnPinningState,
  type ExpandedState,
  type Header,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table as TanStackTable,
  type Updater,
  type VisibilityState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import {
  Dropdown,
  DropdownCheckboxItem,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '../Dropdown';
import { Input } from '../Input';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Select';
import { Tooltip, TooltipProvider } from '../Tooltip';
import styles from './DataGrid.module.scss';
import type { LucideIcon } from 'lucide-react';

export type DataGridSortingState = SortingState;
export type DataGridFilterState = ColumnFiltersState;
export type DataGridRowSelectionState = RowSelectionState;
export type DataGridColumnVisibilityState = VisibilityState;
export type DataGridPaginationState = PaginationState;

export type DataGridColumn<TData> = ColumnDef<TData, unknown> & {
  sticky?: 'left' | 'right' | false;
  numeric?: boolean;
  headerAlign?: 'left' | 'center' | 'right';
  truncate?: boolean;
  filterable?: boolean;
  filterPlaceholder?: string;
  resizable?: boolean;
};

export interface DataGridRowAction<TData> {
  label: string;
  icon?: LucideIcon;
  onClick: (row: Row<TData>) => void;
  destructive?: boolean;
  disabled?: (row: Row<TData>) => boolean;
  hidden?: (row: Row<TData>) => boolean;
}

export interface DataGridProps<TData> {
  data: TData[];
  columns: DataGridColumn<TData>[];
  getRowId?: (row: TData, index: number, parent?: Row<TData>) => string;
  enableSorting?: boolean;
  sorting?: DataGridSortingState;
  defaultSorting?: DataGridSortingState;
  onSortingChange?: (sorting: DataGridSortingState) => void;
  manualSorting?: boolean;
  enableFiltering?: boolean;
  globalFilter?: string;
  defaultGlobalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  columnFilters?: DataGridFilterState;
  defaultColumnFilters?: DataGridFilterState;
  onColumnFiltersChange?: (filters: DataGridFilterState) => void;
  manualFiltering?: boolean;
  enablePagination?: boolean;
  pagination?: DataGridPaginationState;
  defaultPagination?: DataGridPaginationState;
  onPaginationChange?: (pagination: DataGridPaginationState) => void;
  pageCount?: number;
  manualPagination?: boolean;
  pageSizeOptions?: number[];
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  selectionMode?: 'single' | 'multi';
  rowSelection?: DataGridRowSelectionState;
  defaultRowSelection?: DataGridRowSelectionState;
  onRowSelectionChange?: (selection: DataGridRowSelectionState) => void;
  onRowClick?: (row: Row<TData>) => void;
  rowActions?: DataGridRowAction<TData>[];
  enableExpanding?: boolean;
  expanded?: ExpandedState;
  defaultExpanded?: ExpandedState;
  onExpandedChange?: (expanded: ExpandedState) => void;
  renderSubRow?: (row: Row<TData>) => React.ReactNode;
  enableCellEditing?: boolean;
  onCellEdit?: (rowId: string, columnId: string, value: unknown) => void;
  enableColumnResizing?: boolean;
  enableColumnReordering?: boolean;
  enableColumnPinning?: boolean;
  columnVisibility?: DataGridColumnVisibilityState;
  defaultColumnVisibility?: DataGridColumnVisibilityState;
  onColumnVisibilityChange?: (visibility: DataGridColumnVisibilityState) => void;
  columnOrder?: ColumnOrderState;
  onColumnOrderChange?: (order: ColumnOrderState) => void;
  columnPinning?: ColumnPinningState;
  onColumnPinningChange?: (pinning: ColumnPinningState) => void;
  enableVirtualisation?: boolean;
  estimatedRowHeight?: number;
  density?: 'compact' | 'default' | 'comfortable';
  striped?: boolean;
  stickyHeader?: boolean;
  responsiveMode?: 'scroll' | 'stack';
  stackBreakpoint?: number;
  isLoading?: boolean;
  loadingRowCount?: number;
  emptyMessage?: string;
  emptyDescription?: string;
  renderEmpty?: () => React.ReactNode;
  toolbarSlotStart?: React.ReactNode;
  toolbarSlotEnd?: React.ReactNode;
  hideToolbar?: boolean;
  className?: string;
  'aria-label': string;
}

export interface UseDataGridOptions {
  defaultSorting?: DataGridSortingState;
  defaultGlobalFilter?: string;
  defaultColumnFilters?: DataGridFilterState;
  defaultPagination?: DataGridPaginationState;
  defaultRowSelection?: DataGridRowSelectionState;
  defaultColumnVisibility?: DataGridColumnVisibilityState;
  defaultColumnOrder?: ColumnOrderState;
  defaultColumnPinning?: ColumnPinningState;
  defaultExpanded?: ExpandedState;
}

interface DataGridToolbarProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  table: TanStackTable<TData>;
  enableFiltering: boolean;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  toolbarSlotStart?: React.ReactNode;
  toolbarSlotEnd?: React.ReactNode;
}

interface DataGridPaginationProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  table: TanStackTable<TData>;
  pageSizeOptions: number[];
}

interface EditingCellState {
  rowId: string;
  columnId: string;
}

type EditableMeta = {
  editable?: boolean;
};

const INTERNAL_COLUMN_IDS = ['__select__', '__expand__', '__actions__'] as const;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function useControllableState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = React.useCallback(
    (updater: Updater<T>) => {
      const nextValue = functionalUpdate(updater, value);

      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onChange?.(nextValue);
    },
    [isControlled, onChange, value]
  );

  return [value, setValue] as const;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(query);
    const update = () => setMatches(mediaQueryList.matches);

    update();
    mediaQueryList.addEventListener('change', update);

    return () => mediaQueryList.removeEventListener('change', update);
  }, [query]);

  return matches;
}

function getHeaderLabel<TData>(header: Header<TData, unknown>) {
  const { columnDef } = header.column;

  if (typeof columnDef.header === 'string') {
    return columnDef.header;
  }

  if ('accessorKey' in columnDef && typeof columnDef.accessorKey === 'string') {
    return columnDef.accessorKey;
  }

  return header.column.id;
}

function hasActiveColumnFilter<TData>(header: Header<TData, unknown>) {
  const value = header.column.getFilterValue();

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return value !== undefined && value !== null && value !== false;
}

function isEditableColumn<TData>(column: DataGridColumn<TData>) {
  const meta = column.meta as EditableMeta | undefined;

  return meta?.editable === true;
}

function getHeaderAlignmentClass<TData>(column: DataGridColumn<TData>) {
  if (column.numeric) {
    return styles.alignRight;
  }

  if (column.headerAlign === 'center') {
    return styles.alignCenter;
  }

  if (column.headerAlign === 'right') {
    return styles.alignRight;
  }

  return styles.alignLeft;
}

function useDataGridInternal<TData>(props: DataGridProps<TData>) {
  const selectionMode = props.selectionMode ?? 'multi';
  const enableFiltering = props.enableFiltering !== false;
  const enableSorting = props.enableSorting !== false;
  const enablePagination = props.enablePagination !== false;
  const enableColumnResizing = props.enableColumnResizing !== false;

  const [sorting, setSorting] = useControllableState<DataGridSortingState>(
    props.sorting,
    props.defaultSorting ?? [],
    props.onSortingChange
  );
  const [globalFilter, setGlobalFilter] = useControllableState<string>(
    props.globalFilter,
    props.defaultGlobalFilter ?? '',
    props.onGlobalFilterChange
  );
  const [columnFilters, setColumnFilters] = useControllableState<DataGridFilterState>(
    props.columnFilters,
    props.defaultColumnFilters ?? [],
    props.onColumnFiltersChange
  );
  const [pagination, setPagination] = useControllableState<DataGridPaginationState>(
    props.pagination,
    props.defaultPagination ?? { pageIndex: 0, pageSize: 20 },
    props.onPaginationChange
  );
  const [rowSelection, setRowSelection] = useControllableState<DataGridRowSelectionState>(
    props.rowSelection,
    props.defaultRowSelection ?? {},
    props.onRowSelectionChange
  );
  const [columnVisibility, setColumnVisibility] =
    useControllableState<DataGridColumnVisibilityState>(
      props.columnVisibility,
      props.defaultColumnVisibility ?? {},
      props.onColumnVisibilityChange
    );
  const [columnOrder, setColumnOrder] = useControllableState<ColumnOrderState>(
    props.columnOrder,
    props.columnOrder ?? [],
    props.onColumnOrderChange
  );
  const [columnPinning, setColumnPinning] = useControllableState<ColumnPinningState>(
    props.columnPinning,
    props.columnPinning ?? {},
    props.onColumnPinningChange
  );
  const [expanded, setExpanded] = useControllableState<ExpandedState>(
    props.expanded,
    props.defaultExpanded ?? {},
    props.onExpandedChange
  );

  const resolvedColumns = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    const columns: ColumnDef<TData, unknown>[] = [];

    if (props.enableRowSelection) {
      columns.push({
        id: '__select__',
        size: 44,
        minSize: 44,
        maxSize: 44,
        enableSorting: false,
        enableResizing: false,
        enableHiding: false,
        header: ({ table }) =>
          selectionMode === 'multi' ? (
            <>
              <span className={styles.srOnly}>Select rows</span>
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected()
                    ? true
                    : table.getIsSomePageRowsSelected()
                      ? 'indeterminate'
                      : false
                }
                onCheckedChange={(checked) => table.toggleAllPageRowsSelected(Boolean(checked))}
                aria-label="Select all rows"
                onClick={(event) => event.stopPropagation()}
              />
            </>
          ) : (
            <span className={styles.srOnly}>Select row</span>
          ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
            disabled={!row.getCanSelect()}
            aria-label={`Select row ${row.index + 1}`}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      });
    }

    if (props.enableExpanding) {
      columns.push({
        id: '__expand__',
        size: 44,
        minSize: 44,
        maxSize: 44,
        enableSorting: false,
        enableResizing: false,
        enableHiding: false,
        header: () => <span className={styles.srOnly}>Expand row</span>,
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={
                row.getIsExpanded()
                  ? `Collapse row ${row.index + 1}`
                  : `Expand row ${row.index + 1}`
              }
              aria-expanded={row.getIsExpanded()}
              icon={row.getIsExpanded() ? ChevronDown : ChevronRight}
              onClick={(event) => {
                event.stopPropagation();
                row.toggleExpanded();
              }}
            />
          ) : null,
      });
    }

    columns.push(
      ...props.columns.map((column) => ({ ...column, enableResizing: column.resizable ?? true }))
    );

    if (props.rowActions && props.rowActions.length > 0) {
      columns.push({
        id: '__actions__',
        size: 52,
        minSize: 52,
        maxSize: 52,
        enableSorting: false,
        enableResizing: false,
        enableHiding: false,
        header: () => <span className={styles.srOnly}>Row actions</span>,
        cell: ({ row }) => {
          const visibleActions = props.rowActions?.filter((action) => !action.hidden?.(row)) ?? [];

          if (visibleActions.length === 0) {
            return null;
          }

          return (
            <Dropdown modal={false}>
              <DropdownTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Actions for row ${row.index + 1}`}
                  icon={MoreHorizontal}
                  onClick={(event) => event.stopPropagation()}
                />
              </DropdownTrigger>
              <DropdownContent align="end">
                {visibleActions.map((action) => {
                  const ActionIcon = action.icon;

                  return (
                    <DropdownItem
                      key={action.label}
                      intent={action.destructive ? 'destructive' : 'default'}
                      {...(typeof action.disabled?.(row) === 'boolean'
                        ? { disabled: action.disabled(row) }
                        : {})}
                      {...(ActionIcon
                        ? {
                            startIcon: <ActionIcon aria-hidden="true" />,
                          }
                        : {})}
                      onSelect={() => action.onClick(row)}
                    >
                      {action.label}
                    </DropdownItem>
                  );
                })}
              </DropdownContent>
            </Dropdown>
          );
        },
      });
    }

    return columns;
  }, [
    props.columns,
    props.enableExpanding,
    props.enableRowSelection,
    props.rowActions,
    selectionMode,
  ]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<TData>({
    data: props.data,
    columns: resolvedColumns,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting ? { getSortedRowModel: getSortedRowModel() } : {}),
    ...(enableFiltering ? { getFilteredRowModel: getFilteredRowModel() } : {}),
    ...(enablePagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    ...(props.enableExpanding ? { getExpandedRowModel: getExpandedRowModel() } : {}),
    ...(props.enableExpanding
      ? {
          getSubRows: (row: TData) => {
            const record = row as { subRows?: TData[] };
            return record.subRows;
          },
          getRowCanExpand: () => Boolean(props.renderSubRow),
        }
      : {}),
    ...(props.getRowId ? { getRowId: props.getRowId } : {}),
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination,
      rowSelection,
      columnVisibility,
      columnOrder,
      columnPinning,
      expanded,
    },
    manualSorting: props.manualSorting ?? false,
    manualFiltering: props.manualFiltering ?? false,
    manualPagination: props.manualPagination ?? false,
    ...(typeof props.pageCount === 'number' ? { pageCount: props.pageCount } : {}),
    enableSortingRemoval: true,
    enableSorting,
    enableFilters: enableFiltering,
    enableGlobalFilter: enableFiltering,
    enableColumnResizing,
    enableColumnPinning: props.enableColumnPinning ?? false,
    enableRowSelection: props.enableRowSelection ?? false,
    enableMultiRowSelection: selectionMode !== 'single',
    columnResizeMode: 'onChange',
    globalFilterFn: 'includesString',
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    onExpandedChange: setExpanded,
  });

  return {
    table,
    state: {
      globalFilter,
    },
  };
}

export function useDataGrid(_options: UseDataGridOptions = {}) {
  const [sorting, onSortingChange] = React.useState<DataGridSortingState>(
    _options.defaultSorting ?? []
  );
  const [globalFilter, onGlobalFilterChange] = React.useState(_options.defaultGlobalFilter ?? '');
  const [columnFilters, onColumnFiltersChange] = React.useState<DataGridFilterState>(
    _options.defaultColumnFilters ?? []
  );
  const [pagination, onPaginationChange] = React.useState<DataGridPaginationState>(
    _options.defaultPagination ?? { pageIndex: 0, pageSize: 20 }
  );
  const [rowSelection, onRowSelectionChange] = React.useState<DataGridRowSelectionState>(
    _options.defaultRowSelection ?? {}
  );
  const [columnVisibility, onColumnVisibilityChange] =
    React.useState<DataGridColumnVisibilityState>(_options.defaultColumnVisibility ?? {});
  const [columnOrder, onColumnOrderChange] = React.useState<ColumnOrderState>(
    _options.defaultColumnOrder ?? []
  );
  const [columnPinning, onColumnPinningChange] = React.useState<ColumnPinningState>(
    _options.defaultColumnPinning ?? {}
  );
  const [expanded, onExpandedChange] = React.useState<ExpandedState>(
    _options.defaultExpanded ?? {}
  );

  return {
    sorting,
    onSortingChange,
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    rowSelection,
    onRowSelectionChange,
    columnVisibility,
    onColumnVisibilityChange,
    columnOrder,
    onColumnOrderChange,
    columnPinning,
    onColumnPinningChange,
    expanded,
    onExpandedChange,
  };
}

function DataGridInner<TData>(
  allProps: DataGridProps<TData>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    density = 'default',
    striped = false,
    stickyHeader = true,
    responsiveMode = 'scroll',
    stackBreakpoint = 640,
    enableFiltering = true,
    enablePagination = true,
    enableVirtualisation = false,
    estimatedRowHeight = 48,
    loadingRowCount = 5,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    emptyMessage = 'No results found',
    className,
    hideToolbar = false,
    renderEmpty,
    onRowClick,
    enableCellEditing = false,
    onCellEdit,
    enableColumnReordering = false,
    ...props
  } = allProps;

  const { table, state } = useDataGridInternal(allProps);

  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [editingCell, setEditingCell] = React.useState<EditingCellState | null>(null);
  const [draggedColumnId, setDraggedColumnId] = React.useState<string | null>(null);
  const [dropTargetColumnId, setDropTargetColumnId] = React.useState<string | null>(null);
  const [keyboardMoveColumnId, setKeyboardMoveColumnId] = React.useState<string | null>(null);

  const matchesStackBreakpoint = useMediaQuery(`(max-width: ${stackBreakpoint}px)`);
  const isStacked = responsiveMode === 'stack' && matchesStackBreakpoint;

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: enableVirtualisation && !props.isLoading ? rows.length : 0,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 10,
  });

  const handleColumnReorder = React.useCallback(
    (fromId: string, toId: string) => {
      if (fromId === toId) {
        return;
      }

      const fallbackOrder = table.getAllLeafColumns().map((column) => column.id);
      const currentOrder =
        table.getState().columnOrder.length > 0 ? [...table.getState().columnOrder] : fallbackOrder;
      const fromIndex = currentOrder.indexOf(fromId);
      const toIndex = currentOrder.indexOf(toId);

      if (fromIndex < 0 || toIndex < 0) {
        return;
      }

      const nextOrder = [...currentOrder];
      const [movedColumn] = nextOrder.splice(fromIndex, 1);

      if (!movedColumn) {
        return;
      }

      nextOrder.splice(toIndex, 0, movedColumn);
      table.setColumnOrder(nextOrder);
    },
    [table]
  );

  const getCellStyle = React.useCallback(
    (
      column: ReturnType<Row<TData>['getVisibleCells']>[number]['column'],
      size: number,
      header = false
    ): React.CSSProperties => {
      const definition = column.columnDef as DataGridColumn<TData>;
      const pinnedPosition = definition.sticky ?? false;
      const style: React.CSSProperties = {
        width: size,
        minWidth: size,
      };

      if (pinnedPosition === 'left') {
        style.position = 'sticky';
        style.left = `${column.getStart('left')}px`;
        style.zIndex = header
          ? 'var(--dds-z-table-sticky-col-header)'
          : 'var(--dds-z-table-sticky-col)';
      }

      if (pinnedPosition === 'right') {
        style.position = 'sticky';
        style.right = `${column.getAfter('right')}px`;
        style.zIndex = header
          ? 'var(--dds-z-table-sticky-col-header)'
          : 'var(--dds-z-table-sticky-col)';
      }

      return style;
    },
    []
  );

  const startEditing = React.useCallback((rowId: string, columnId: string) => {
    setEditingCell({ rowId, columnId });
  }, []);

  const stopEditing = React.useCallback(() => {
    setEditingCell(null);
  }, []);

  const commitEdit = React.useCallback(
    (value: unknown) => {
      if (!editingCell) {
        return;
      }

      onCellEdit?.(editingCell.rowId, editingCell.columnId, value);
      setEditingCell(null);
    },
    [editingCell, onCellEdit]
  );

  const renderCellContent = React.useCallback(
    (cell: ReturnType<Row<TData>['getVisibleCells']>[number]) => {
      const column = cell.column.columnDef as DataGridColumn<TData>;
      const currentValue = cell.getValue();
      const isEditing =
        editingCell?.rowId === cell.row.id &&
        editingCell?.columnId === cell.column.id &&
        enableCellEditing &&
        isEditableColumn(column);

      if (isEditing) {
        return (
          <EditableCellInput value={currentValue} onCommit={commitEdit} onCancel={stopEditing} />
        );
      }

      return flexRender(cell.column.columnDef.cell, cell.getContext());
    },
    [commitEdit, editingCell, enableCellEditing, stopEditing]
  );

  const renderRow = React.useCallback(
    (row: Row<TData>, rowIndex: number, style?: React.CSSProperties) => (
      <React.Fragment key={row.id}>
        <tr
          aria-rowindex={rowIndex + 2}
          aria-selected={row.getIsSelected() || undefined}
          aria-expanded={row.getIsExpanded() || undefined}
          className={clsx(
            styles.row,
            row.getIsSelected() && styles.rowSelected,
            onRowClick && styles.rowClickable
          )}
          onClick={() => onRowClick?.(row)}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ' ') && onRowClick) {
              event.preventDefault();
              onRowClick(row);
            }
          }}
          tabIndex={onRowClick ? 0 : undefined}
          style={style}
        >
          {row.getVisibleCells().map((cell, cellIndex) => {
            const column = cell.column.columnDef as DataGridColumn<TData>;

            return (
              <td
                key={cell.id}
                aria-colindex={cellIndex + 1}
                className={clsx(
                  styles.td,
                  column.numeric && styles.numeric,
                  column.truncate && styles.truncate,
                  column.sticky === 'left' && styles.stickyLeft,
                  column.sticky === 'right' && styles.stickyRight
                )}
                style={getCellStyle(cell.column, cell.column.getSize())}
                onDoubleClick={() => {
                  if (enableCellEditing && isEditableColumn(column)) {
                    startEditing(row.id, cell.column.id);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && enableCellEditing && isEditableColumn(column)) {
                    event.preventDefault();
                    startEditing(row.id, cell.column.id);
                  }
                }}
              >
                {renderCellContent(cell)}
              </td>
            );
          })}
        </tr>
        {row.getIsExpanded() && props.renderSubRow ? (
          <tr className={styles.subRow} aria-rowindex={rowIndex + 2}>
            <td colSpan={row.getVisibleCells().length} className={styles.subRowCell}>
              {props.renderSubRow(row)}
            </td>
          </tr>
        ) : null}
      </React.Fragment>
    ),
    [enableCellEditing, getCellStyle, onRowClick, props, renderCellContent, startEditing]
  );

  const tableMarkup = (
    <table
      role="grid"
      aria-label={props['aria-label']}
      aria-rowcount={rows.length}
      aria-colcount={visibleColumns.length}
      aria-busy={props.isLoading || undefined}
      className={clsx(
        styles.table,
        styles[`density-${density}`],
        striped && styles.striped,
        stickyHeader && styles.stickyHeader
      )}
      style={{ width: '100%', minWidth: table.getTotalSize() }}
    >
      <thead className={styles.thead}>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className={styles.row}>
            {headerGroup.headers.map((header, headerIndex) => {
              const column = header.column.columnDef as DataGridColumn<TData>;
              const sortState = header.column.getIsSorted();
              const headerLabel = getHeaderLabel(header);
              const isMoveMode = keyboardMoveColumnId === header.column.id;
              const hasFilter = enableFiltering && column.filterable;
              const hasActiveFilter = hasActiveColumnFilter(header);
              const headerAlignmentClass = getHeaderAlignmentClass(column);
              const isLastHeader = headerIndex === headerGroup.headers.length - 1;

              return (
                <th
                  key={header.id}
                  scope="col"
                  aria-sort={
                    header.column.getCanSort()
                      ? sortState === 'asc'
                        ? 'ascending'
                        : sortState === 'desc'
                          ? 'descending'
                          : 'none'
                      : undefined
                  }
                  aria-colindex={headerIndex + 1}
                  draggable={enableColumnReordering}
                  className={clsx(
                    styles.th,
                    header.column.getCanSort() && styles.thSortable,
                    sortState && styles.thSorted,
                    column.numeric && styles.numeric,
                    headerAlignmentClass,
                    column.sticky === 'left' && styles.stickyLeft,
                    column.sticky === 'right' && styles.stickyRight,
                    draggedColumnId === header.column.id && styles.thDragging,
                    dropTargetColumnId === header.column.id && styles.thDropTarget
                  )}
                  style={getCellStyle(header.column, header.getSize(), true)}
                  onDragStart={() => setDraggedColumnId(header.column.id)}
                  onDragOver={(event) => {
                    if (!enableColumnReordering) {
                      return;
                    }

                    event.preventDefault();
                    setDropTargetColumnId(header.column.id);
                  }}
                  onDragEnd={() => {
                    setDraggedColumnId(null);
                    setDropTargetColumnId(null);
                  }}
                  onDrop={() => {
                    if (!enableColumnReordering || !draggedColumnId) {
                      return;
                    }

                    handleColumnReorder(draggedColumnId, header.column.id);
                    setDraggedColumnId(null);
                    setDropTargetColumnId(null);
                  }}
                >
                  {header.isPlaceholder ? null : (
                    <>
                      <div className={styles.headerControls}>
                        {header.column.getCanSort() ? (
                          <button
                            type="button"
                            className={clsx(styles.sortButton, headerAlignmentClass)}
                            onClick={header.column.getToggleSortingHandler()}
                            onKeyDown={(event) => {
                              if (!enableColumnReordering) {
                                return;
                              }

                              if (event.key === ' ') {
                                event.preventDefault();
                                setKeyboardMoveColumnId((currentId) =>
                                  currentId === header.column.id ? null : header.column.id
                                );
                                return;
                              }

                              if (keyboardMoveColumnId !== header.column.id) {
                                return;
                              }

                              const siblingColumns = table.getVisibleLeafColumns();
                              const currentIndex = siblingColumns.findIndex(
                                (visibleColumn) => visibleColumn.id === header.column.id
                              );

                              if (event.key === 'ArrowLeft' && currentIndex > 0) {
                                event.preventDefault();
                                handleColumnReorder(
                                  header.column.id,
                                  siblingColumns[currentIndex - 1]?.id ?? header.column.id
                                );
                              }

                              if (
                                event.key === 'ArrowRight' &&
                                currentIndex < siblingColumns.length - 1
                              ) {
                                event.preventDefault();
                                handleColumnReorder(
                                  header.column.id,
                                  siblingColumns[currentIndex + 1]?.id ?? header.column.id
                                );
                              }

                              if (event.key === 'Enter' || event.key === 'Escape') {
                                event.preventDefault();
                                setKeyboardMoveColumnId(null);
                              }
                            }}
                            aria-label={
                              enableColumnReordering
                                ? `Sort by ${headerLabel}. Press Space to enter column reorder mode.`
                                : `Sort by ${headerLabel}${
                                    sortState === 'asc'
                                      ? ', sorted ascending, click to sort descending'
                                      : sortState === 'desc'
                                        ? ', sorted descending, click to clear sort'
                                        : ', not sorted'
                                  }`
                            }
                            data-reorder-active={isMoveMode ? '' : undefined}
                          >
                            <span className={styles.headerLabel}>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            {sortState === 'asc' ? (
                              <ChevronUpDownIcon direction="asc" />
                            ) : sortState === 'desc' ? (
                              <ChevronUpDownIcon direction="desc" />
                            ) : (
                              <ChevronUpDownIcon direction="none" />
                            )}
                          </button>
                        ) : (
                          <span className={clsx(styles.headerLabel, headerAlignmentClass)}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                        )}

                        {hasFilter ? (
                          <Popover modal={false}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className={clsx(
                                  styles.filterTrigger,
                                  hasActiveFilter && styles.filterTriggerActive
                                )}
                                aria-label={`Filter ${headerLabel}`}
                                aria-pressed={hasActiveFilter || undefined}
                                onClick={(event) => event.stopPropagation()}
                              >
                                <Funnel className={styles.filterIcon} aria-hidden="true" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="start"
                              side="bottom"
                              sideOffset={8}
                              width="trigger"
                              className={styles.filterPopover ?? ''}
                            >
                              <Input
                                size="sm"
                                value={(header.column.getFilterValue() as string) ?? ''}
                                onChange={(event) =>
                                  header.column.setFilterValue(event.target.value)
                                }
                                placeholder={column.filterPlaceholder ?? 'Filter…'}
                                aria-label={`Filter ${headerLabel}`}
                                className={styles.filterInput ?? ''}
                              />
                            </PopoverContent>
                          </Popover>
                        ) : null}
                      </div>

                      {header.column.getCanResize() && !isLastHeader ? (
                        <div
                          role="separator"
                          aria-orientation="vertical"
                          aria-label={`Resize ${headerLabel}`}
                          aria-valuenow={header.getSize()}
                          aria-valuemin={40}
                          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                          tabIndex={0}
                          className={clsx(
                            styles.resizeHandle,
                            header.column.getIsResizing() && styles.resizeHandleActive
                          )}
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => {
                            if (event.key === 'ArrowLeft') {
                              event.preventDefault();
                              table.setColumnSizing((current) => ({
                                ...current,
                                [header.column.id]: Math.max(40, header.getSize() - 16),
                              }));
                            }

                            if (event.key === 'ArrowRight') {
                              event.preventDefault();
                              table.setColumnSizing((current) => ({
                                ...current,
                                [header.column.id]: header.getSize() + 16,
                              }));
                            }
                          }}
                        />
                      ) : null}
                    </>
                  )}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>

      {!enableVirtualisation || props.isLoading ? (
        <tbody className={styles.tbody}>
          {props.isLoading ? (
            Array.from({ length: loadingRowCount }, (_, rowIndex) => (
              <tr key={`loading-${rowIndex}`} aria-hidden="true" className={styles.skeletonRow}>
                {visibleColumns.map((column, cellIndex) => (
                  <td key={`${column.id}-${rowIndex}`} className={styles.td}>
                    <span
                      className={styles.skeleton}
                      style={{ width: `${60 + ((rowIndex + cellIndex) % 4) * 10}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr className={styles.row}>
              <td colSpan={visibleColumns.length} className={styles.emptyCell}>
                {renderEmpty ? (
                  renderEmpty()
                ) : (
                  <div className={styles.emptyState} role="status">
                    <p className={styles.emptyMessage}>{emptyMessage}</p>
                    {props.emptyDescription ? (
                      <p className={styles.emptyDescription}>{props.emptyDescription}</p>
                    ) : null}
                  </div>
                )}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => renderRow(row, rowIndex))
          )}
        </tbody>
      ) : (
        <tbody
          className={styles.tbody}
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];

            if (!row) {
              return null;
            }

            return renderRow(row, virtualRow.index, {
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
              width: '100%',
            });
          })}
        </tbody>
      )}
    </table>
  );

  return (
    <div ref={ref} className={clsx(styles.dataGrid, className)}>
      {!hideToolbar ? (
        <DataGridToolbar
          table={table}
          enableFiltering={enableFiltering}
          globalFilter={state.globalFilter}
          onGlobalFilterChange={(value) => table.setGlobalFilter(value)}
          toolbarSlotStart={props.toolbarSlotStart}
          toolbarSlotEnd={props.toolbarSlotEnd}
        />
      ) : null}

      {isStacked ? (
        <div className={styles.stackedRows} role="list" aria-label={props['aria-label']}>
          {rows.map((row) => (
            <div key={row.id} className={styles.stackedCard} role="listitem">
              {onRowClick ? (
                <button
                  type="button"
                  className={clsx(
                    styles.stackedCardButton,
                    row.getIsSelected() && styles.rowSelected
                  )}
                  onClick={() => onRowClick(row)}
                >
                  {row
                    .getVisibleCells()
                    .filter(
                      (cell) =>
                        !INTERNAL_COLUMN_IDS.includes(
                          cell.column.id as (typeof INTERNAL_COLUMN_IDS)[number]
                        )
                    )
                    .map((cell) => (
                      <div key={cell.id} className={styles.stackedRow}>
                        <span className={styles.stackedLabel}>
                          {typeof cell.column.columnDef.header === 'string'
                            ? cell.column.columnDef.header
                            : cell.column.id}
                        </span>
                        <span className={styles.stackedValue}>{renderCellContent(cell)}</span>
                      </div>
                    ))}
                </button>
              ) : (
                row
                  .getVisibleCells()
                  .filter(
                    (cell) =>
                      !INTERNAL_COLUMN_IDS.includes(
                        cell.column.id as (typeof INTERNAL_COLUMN_IDS)[number]
                      )
                  )
                  .map((cell) => (
                    <div key={cell.id} className={styles.stackedRow}>
                      <span className={styles.stackedLabel}>
                        {typeof cell.column.columnDef.header === 'string'
                          ? cell.column.columnDef.header
                          : cell.column.id}
                      </span>
                      <span className={styles.stackedValue}>{renderCellContent(cell)}</span>
                    </div>
                  ))
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className={styles.scrollWrapper}
          role="region"
          aria-label={`${props['aria-label']} table region`}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
        >
          {tableMarkup}
        </div>
      )}

      {enablePagination ? (
        <DataGridPagination table={table} pageSizeOptions={pageSizeOptions} />
      ) : null}
    </div>
  );
}

export const DataGrid = Object.assign(
  React.forwardRef(DataGridInner) as <TData>(
    props: DataGridProps<TData> & React.RefAttributes<HTMLDivElement>
  ) => React.ReactElement | null,
  { displayName: 'DataGrid' }
);

function DataGridToolbarInner<TData>(
  {
    table,
    enableFiltering,
    globalFilter,
    onGlobalFilterChange,
    toolbarSlotStart,
    toolbarSlotEnd,
    className,
    ...props
  }: DataGridToolbarProps<TData>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  return (
    <TooltipProvider>
      <div ref={ref} className={clsx(styles.toolbar, className)} {...props}>
        <div className={styles.toolbarLeading}>
          {toolbarSlotStart}
          {enableFiltering ? (
            <Input
              type="search"
              value={globalFilter}
              onChange={(event) => onGlobalFilterChange(event.target.value)}
              placeholder="Search…"
              aria-label="Search all columns"
              size="sm"
              startIcon={Search}
              className={styles.globalSearch ?? ''}
            />
          ) : null}
        </div>
        <div className={styles.toolbarTrailing}>
          <Dropdown modal={false}>
            <Tooltip content="Columns" align="end">
              <DropdownTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  icon={Columns3}
                  aria-label="Toggle column visibility"
                />
              </DropdownTrigger>
            </Tooltip>
            <DropdownContent align="end">
              {table
                .getAllLeafColumns()
                .filter(
                  (column) =>
                    !INTERNAL_COLUMN_IDS.includes(column.id as (typeof INTERNAL_COLUMN_IDS)[number])
                )
                .map((column) => (
                  <DropdownCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(checked) => column.toggleVisibility(checked)}
                  >
                    {typeof column.columnDef.header === 'string'
                      ? column.columnDef.header
                      : column.id}
                  </DropdownCheckboxItem>
                ))}
            </DropdownContent>
          </Dropdown>
          {toolbarSlotEnd}
        </div>
      </div>
    </TooltipProvider>
  );
}

export const DataGridToolbar = Object.assign(
  React.forwardRef(DataGridToolbarInner) as <TData>(
    props: DataGridToolbarProps<TData> & React.RefAttributes<HTMLDivElement>
  ) => React.ReactElement | null,
  { displayName: 'DataGridToolbar' }
);

function DataGridPaginationInner<TData>(
  { table, pageSizeOptions, className, ...props }: DataGridPaginationProps<TData>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = Math.max(table.getPageCount(), 1);
  const summaryCount = table.getFilteredRowModel().rows.length;
  const pageSizeLabelId = React.useId();

  return (
    <div
      ref={ref}
      className={clsx(styles.pagination, className)}
      role="navigation"
      aria-label="Pagination"
      {...props}
    >
      <span className={styles.paginationSummary} aria-live="polite" aria-atomic="true">
        {summaryCount} row{summaryCount === 1 ? '' : 's'}
      </span>

      <div className={styles.pageSizeLabel}>
        <span id={pageSizeLabelId}>Rows per page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger
            className={styles.pageSizeSelect}
            size="sm"
            aria-label="Rows per page"
            aria-labelledby={pageSizeLabelId}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span className={styles.pageInfo} aria-live="polite" aria-atomic="true">
        Page {pageIndex + 1} of {pageCount}
      </span>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="First page"
        icon={ChevronsLeft}
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.firstPage()}
      />
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Previous page"
        icon={ChevronLeft}
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
      />
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Next page"
        icon={ChevronRight}
        disabled={!table.getCanNextPage()}
        onClick={() => table.nextPage()}
      />
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Last page"
        icon={ChevronsRight}
        disabled={!table.getCanNextPage()}
        onClick={() => table.lastPage()}
      />
    </div>
  );
}

export const DataGridPagination = Object.assign(
  React.forwardRef(DataGridPaginationInner) as <TData>(
    props: DataGridPaginationProps<TData> & React.RefAttributes<HTMLDivElement>
  ) => React.ReactElement | null,
  { displayName: 'DataGridPagination' }
);

const EditableCellInput = ({
  value,
  onCommit,
  onCancel,
}: {
  value: unknown;
  onCommit: (value: unknown) => void;
  onCancel: () => void;
}) => {
  const [draftValue, setDraftValue] = React.useState(String(value ?? ''));
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Input
      ref={inputRef}
      size="sm"
      value={draftValue}
      onChange={(event) => setDraftValue(event.target.value)}
      onBlur={() => onCommit(draftValue)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          onCommit(draftValue);
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          onCancel();
        }
      }}
      aria-label="Edit cell value"
    />
  );
};

const ChevronUpDownIcon = ({ direction }: { direction: 'asc' | 'desc' | 'none' }) => {
  if (direction === 'asc') {
    return <ChevronDown className={styles.sortIcon} aria-hidden="true" />;
  }

  if (direction === 'desc') {
    return <ChevronUp className={styles.sortIcon} aria-hidden="true" />;
  }

  return <ChevronsUpDown className={styles.sortIcon} aria-hidden="true" />;
};

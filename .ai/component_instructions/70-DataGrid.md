# DataGrid · node scaffolding.mjs DataGrid

---

## AGENT TASK: Read `AGENTS.md`, `packages/tokens/src/tokens.css`, and `64-Table.md` first.

Before writing any code:

1. Verify the z-index tokens added for `Table` exist in `packages/tokens/src/tokens.css`:
   - `--dds-z-table-sticky-col`
   - `--dds-z-table-sticky-header`
   - `--dds-z-table-sticky-col-header`
     If they are missing, add them before proceeding.

2. Check the repo for existing components:

   ```
   packages/components/src/components/Table/
   packages/components/src/components/Button/
   packages/components/src/components/Checkbox/
   packages/components/src/components/Input/
   packages/components/src/components/Dropdown/
   packages/components/src/components/Badge/
   packages/components/src/components/
   ```

   - Use `Table`'s SCSS module classes where applicable for visual consistency — do not duplicate token mappings.
   - Use `Button` for toolbar actions, row action triggers, and pagination controls.
   - Use `Checkbox` (if it exists) for row selection cells — do not reimplement checkboxes.
   - Use `Input` (if it exists) for column filter inputs and the global search field.
   - Use `Dropdown` (if it exists) for the column visibility toggle and row action menus.
   - If any of the above don't exist, stub the dependency with a comment: `// TODO: replace with <ComponentName> when available`.

### Required dependencies

Add to `packages/components/package.json` if not already present:

```json
"@tanstack/react-table": "^8",
"@tanstack/react-virtual": "^3"
```

Do not use any other third-party table or virtualisation library.

### Additional token required

Add to `packages/tokens/src/tokens.css` Tier 1 shadow block (if `--dds-shadow-md` was not already added for Card):

```css
--dds-shadow-md: 0 4px 12px 0 rgb(0 0 0 / 0.1);
/* dark mode: */
--dds-shadow-md: 0 4px 12px 0 rgb(0 0 0 / 0.35);
```

---

## Scaffold location

```
packages/components/src/components/DataGrid/
  DataGrid.tsx
  DataGrid.module.scss
  DataGrid.test.tsx
  DataGrid.stories.tsx
  index.ts
```

---

## Purpose

`DataGrid` is a full-featured interactive data table built on TanStack Table v8 (headless logic) and TanStack Virtual v3 (row virtualisation). It handles sorting, multi-column filtering, column resizing, column reordering via drag-and-drop, column pinning (freeze left/right), row selection (single and multi), row click, expandable rows, inline cell editing, server-side data mode, and responsive behaviour.

DDS owns 100% of the rendering. TanStack Table provides zero UI — it is a pure state/logic layer.

**DataGrid vs Table:**

- `Table` is a static, zero-JS, semantic HTML display component.
- `DataGrid` is a fully interactive data management component.

---

## Exports from `index.ts`

```ts
export { DataGrid, DataGridToolbar, DataGridPagination };
export { useDataGrid };
export type {
  DataGridProps,
  DataGridColumn,
  DataGridRowAction,
  DataGridSortingState,
  DataGridFilterState,
  DataGridPaginationState,
  DataGridRowSelectionState,
  DataGridColumnVisibilityState,
};
```

---

## Types

```ts
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
  VisibilityState,
  ExpandedState,
  ColumnSizingState,
  ColumnOrderState,
  ColumnPinningState,
  PaginationState,
  Row,
} from '@tanstack/react-table';

// Re-export TanStack types under DDS names for clean public API
export type DataGridSortingState = SortingState;
export type DataGridFilterState = ColumnFiltersState;
export type DataGridRowSelectionState = RowSelectionState;
export type DataGridColumnVisibilityState = VisibilityState;
export type DataGridPaginationState = PaginationState;

// Column definition — consumers use this instead of raw ColumnDef
export type DataGridColumn<TData> = ColumnDef<TData> & {
  // DDS extensions on top of TanStack ColumnDef:
  sticky?: 'left' | 'right' | false; // default: false
  numeric?: boolean; // default: false — tabular-nums + right-align
  truncate?: boolean; // default: false
  filterable?: boolean; // default: false — shows filter input in header
  filterPlaceholder?: string; // placeholder for the column filter input
  resizable?: boolean; // default: true — can be disabled per-column
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
  // ─── Data ───────────────────────────────────────────────────────────────────
  data: TData[];
  columns: DataGridColumn<TData>[];
  getRowId?: (row: TData) => string; // default: TanStack auto-id

  // ─── Sorting ────────────────────────────────────────────────────────────────
  enableSorting?: boolean; // default: true
  sorting?: DataGridSortingState; // controlled
  defaultSorting?: DataGridSortingState;
  onSortingChange?: (sorting: DataGridSortingState) => void;
  manualSorting?: boolean; // default: false — server-side mode

  // ─── Filtering ──────────────────────────────────────────────────────────────
  enableFiltering?: boolean; // default: true
  globalFilter?: string; // controlled global search
  defaultGlobalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  columnFilters?: DataGridFilterState; // controlled per-column filters
  defaultColumnFilters?: DataGridFilterState;
  onColumnFiltersChange?: (filters: DataGridFilterState) => void;
  manualFiltering?: boolean; // default: false — server-side mode

  // ─── Pagination ─────────────────────────────────────────────────────────────
  enablePagination?: boolean; // default: true
  pagination?: DataGridPaginationState; // controlled
  defaultPagination?: DataGridPaginationState; // default: { pageIndex: 0, pageSize: 20 }
  onPaginationChange?: (pagination: DataGridPaginationState) => void;
  pageCount?: number; // required for server-side pagination
  manualPagination?: boolean; // default: false — server-side mode
  pageSizeOptions?: number[]; // default: [10, 20, 50, 100]

  // ─── Row selection ──────────────────────────────────────────────────────────
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean); // default: false
  selectionMode?: 'single' | 'multi'; // default: 'multi'
  rowSelection?: DataGridRowSelectionState; // controlled
  defaultRowSelection?: DataGridRowSelectionState;
  onRowSelectionChange?: (selection: DataGridRowSelectionState) => void;

  // ─── Row interaction ────────────────────────────────────────────────────────
  onRowClick?: (row: Row<TData>) => void;
  rowActions?: DataGridRowAction<TData>[]; // kebab menu per row

  // ─── Expandable rows ────────────────────────────────────────────────────────
  enableExpanding?: boolean; // default: false
  expanded?: ExpandedState; // controlled
  defaultExpanded?: ExpandedState;
  onExpandedChange?: (expanded: ExpandedState) => void;
  renderSubRow?: (row: Row<TData>) => React.ReactNode; // required when enableExpanding

  // ─── Inline editing ─────────────────────────────────────────────────────────
  enableCellEditing?: boolean; // default: false
  onCellEdit?: (rowId: string, columnId: string, value: unknown) => void;

  // ─── Columns ────────────────────────────────────────────────────────────────
  enableColumnResizing?: boolean; // default: true
  enableColumnReordering?: boolean; // default: false — drag to reorder
  enableColumnPinning?: boolean; // default: false
  columnVisibility?: DataGridColumnVisibilityState; // controlled
  defaultColumnVisibility?: DataGridColumnVisibilityState;
  onColumnVisibilityChange?: (visibility: DataGridColumnVisibilityState) => void;
  columnOrder?: ColumnOrderState; // controlled
  onColumnOrderChange?: (order: ColumnOrderState) => void;
  columnPinning?: ColumnPinningState; // controlled
  onColumnPinningChange?: (pinning: ColumnPinningState) => void;

  // ─── Virtualisation ─────────────────────────────────────────────────────────
  enableVirtualisation?: boolean; // default: false — enable for 100+ rows
  estimatedRowHeight?: number; // default: 48 — px, used by virtualiser

  // ─── Display ────────────────────────────────────────────────────────────────
  density?: 'compact' | 'default' | 'comfortable'; // default: 'default'
  striped?: boolean; // default: false
  stickyHeader?: boolean; // default: true
  responsiveMode?: 'scroll' | 'stack'; // default: 'scroll'
  stackBreakpoint?: number; // default: 640 — px, for responsiveMode="stack"

  // ─── Empty/loading states ───────────────────────────────────────────────────
  isLoading?: boolean; // renders skeleton rows
  loadingRowCount?: number; // default: 5 — skeleton row count
  emptyMessage?: string; // default: "No results found"
  emptyDescription?: string;
  renderEmpty?: () => React.ReactNode; // fully custom empty state slot

  // ─── Toolbar ────────────────────────────────────────────────────────────────
  toolbarSlotStart?: React.ReactNode; // slot before the global search
  toolbarSlotEnd?: React.ReactNode; // slot after column visibility toggle
  hideToolbar?: boolean; // default: false

  // ─── Misc ───────────────────────────────────────────────────────────────────
  className?: string;
  'aria-label'?: string; // accessible name for the grid
}
```

---

## Architecture

### Layer model

```
┌─────────────────────────────────────────────────────┐
│  DataGrid (React component — owns all rendering)    │
│  ┌─────────────────────────────────────────────────┐│
│  │  DataGridToolbar                                ││
│  │  (global search, column visibility, slot start/end) ││
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │  TableScrollWrapper (role="region", tabIndex=0) ││
│  │  ┌───────────────────────────────────────────┐  ││
│  │  │  <table role="grid">                      │  ││
│  │  │  <thead> sticky header                    │  ││
│  │  │    column resize handles                  │  ││
│  │  │    drag-to-reorder (HTML5 drag API)        │  ││
│  │  │    column filter inputs                   │  ││
│  │  │  <tbody>                                  │  ││
│  │  │    [virtual rows — TanStack Virtual]      │  ││
│  │  │    or [standard rows]                     │  ││
│  │  │    expandable sub-rows                    │  ││
│  │  └───────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │  DataGridPagination                             ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
        ↕ state sync
┌─────────────────────────────────────────────────────┐
│  @tanstack/react-table — headless logic layer       │
│  (sort, filter, paginate, select, expand, resize)   │
└─────────────────────────────────────────────────────┘
        ↕ virtualised row positions
┌─────────────────────────────────────────────────────┐
│  @tanstack/react-virtual — row virtualisation       │
└─────────────────────────────────────────────────────┘
```

### useDataGrid — internal hook

Encapsulate all TanStack Table initialisation in a `useDataGrid` hook so `DataGrid.tsx` renders only JSX:

```ts
// Internal hook — not the public export
function useDataGridInternal<TData>(props: DataGridProps<TData>) {
  const table = useReactTable({
    data: props.data,
    columns: props.columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: props.enableSorting !== false ? getSortedRowModel() : undefined,
    getFilteredRowModel: props.enableFiltering !== false ? getFilteredRowModel() : undefined,
    getPaginationRowModel: props.enablePagination !== false ? getPaginationRowModel() : undefined,
    getExpandedRowModel: props.enableExpanding ? getExpandedRowModel() : undefined,
    // manualSorting / manualFiltering / manualPagination pass through
    manualSorting: props.manualSorting ?? false,
    manualFiltering: props.manualFiltering ?? false,
    manualPagination: props.manualPagination ?? false,
    pageCount: props.pageCount,
    columnResizeMode: 'onChange',
    enableColumnResizing: props.enableColumnResizing ?? true,
    enableRowSelection: props.enableRowSelection ?? false,
    enableMultiRowSelection: props.selectionMode !== 'single',
    getSubRows: props.enableExpanding ? (row) => (row as any).subRows : undefined,
    // state (controlled or TanStack-managed)
    state: {
      sorting: props.sorting,
      columnFilters: props.columnFilters,
      globalFilter: props.globalFilter,
      pagination: props.pagination,
      rowSelection: props.rowSelection ?? {},
      columnVisibility: props.columnVisibility ?? {},
      columnOrder: props.columnOrder ?? [],
      columnPinning: props.columnPinning ?? {},
      expanded: props.expanded ?? {},
    },
    // callbacks
    onSortingChange: props.onSortingChange as any,
    onColumnFiltersChange: props.onColumnFiltersChange as any,
    onGlobalFilterChange: props.onGlobalFilterChange as any,
    onPaginationChange: props.onPaginationChange as any,
    onRowSelectionChange: props.onRowSelectionChange as any,
    onColumnVisibilityChange: props.onColumnVisibilityChange as any,
    onColumnOrderChange: props.onColumnOrderChange as any,
    onColumnPinningChange: props.onColumnPinningChange as any,
    onExpandedChange: props.onExpandedChange as any,
  });
  return table;
}
```

The public `useDataGrid` export is a lightweight convenience hook for consumers who want to control DataGrid state externally (e.g. to persist sort state in a URL).

---

## Key rendering patterns

### Table element

```tsx
<table
  role="grid"                             // grid role for interactive table
  aria-label={ariaLabel}
  aria-rowcount={totalRowCount}          // total rows for screen readers (virtualised)
  aria-colcount={visibleColumnCount}
  style={{
    width: table.getTotalSize(),          // TanStack computes column-resize-aware width
  }}
  className={clsx(
    styles.table,
    styles[`density-${density}`],
    striped    && styles.striped,
    styles.hoverable,
    className,
  )}
>
```

### Header cells

```tsx
<th
  key={header.id}
  scope="col"
  aria-sort={
    header.column.getIsSorted() === 'asc'  ? 'ascending'  :
    header.column.getIsSorted() === 'desc' ? 'descending' :
    header.column.getCanSort()             ? 'none'       :
    undefined
  }
  aria-colindex={colIndex + 1}
  style={{
    width:    header.getSize(),
    position: pinnedLeft  ? 'sticky' : undefined,
    left:     pinnedLeft  ? `${header.column.getStart('left')}px`  : undefined,
    right:    pinnedRight ? `${header.column.getAfter('right')}px` : undefined,
    zIndex:   pinnedLeft || pinnedRight ? 'var(--dds-z-table-sticky-col-header)' : undefined,
  }}
  className={clsx(
    styles.th,
    header.column.getCanSort() && styles.thSortable,
    header.column.getIsSorted() && styles.thSorted,
    (col.sticky === 'left')  && styles.stickyLeft,
    (col.sticky === 'right') && styles.stickyRight,
    col.numeric && styles.numeric,
  )}
>
```

Sticky column left/right offsets are computed by TanStack via `column.getStart('left')` and `column.getAfter('right')` — do NOT hardcode pixel values.

### Sort interaction on header

```tsx
<button
  type="button"
  onClick={header.column.getToggleSortingHandler()}
  className={styles.sortButton}
  aria-label={`Sort by ${header.column.columnDef.header as string}${
    header.column.getIsSorted() === 'asc'
      ? ', sorted ascending, click to sort descending'
      : header.column.getIsSorted() === 'desc'
        ? ', sorted descending, click to clear sort'
        : ', not sorted'
  }`}
>
  {flexRender(header.column.columnDef.header, header.getContext())}
  <SortIcon direction={header.column.getIsSorted()} />
</button>
```

Sort button must be a `<button>` — never an `onClick` on `<th>`. This ensures keyboard activation (Enter/Space) and correct screen reader role announcement.

### Column filter input

Rendered below the sort button when `col.filterable === true`:

```tsx
{
  col.filterable && (
    <Input
      value={(header.column.getFilterValue() as string) ?? ''}
      onChange={(e) => header.column.setFilterValue(e.target.value)}
      placeholder={col.filterPlaceholder ?? `Filter…`}
      aria-label={`Filter ${header.column.columnDef.header as string}`}
      size="sm"
      className={styles.filterInput}
      onClick={(e) => e.stopPropagation()} // prevent sort trigger
    />
  );
}
```

### Column resize handle

```tsx
<div
  role="separator"
  aria-orientation="vertical"
  aria-label={`Resize ${header.column.columnDef.header as string}`}
  aria-valuenow={header.column.getSize()}
  aria-valuemin={40}
  onMouseDown={header.getResizeHandler()}
  onTouchStart={header.getResizeHandler()}
  className={clsx(styles.resizeHandle, header.column.getIsResizing() && styles.resizeHandleActive)}
  onClick={(e) => e.stopPropagation()}
/>
```

### Column drag-to-reorder

Use the HTML5 Drag and Drop API. Set `draggable={true}` on the `<th>` when `enableColumnReordering`. Implement `onDragStart`, `onDragOver`, `onDrop` handlers that call `table.setColumnOrder(newOrder)`.

```tsx
// On <th>:
draggable={enableColumnReordering}
onDragStart={() => setDraggedColId(header.column.id)}
onDragOver={(e) => { e.preventDefault(); setDropTargetColId(header.column.id) }}
onDrop={() => {
  if (!draggedColId || !dropTargetColId) return
  const order = [...table.getState().columnOrder]
  const from = order.indexOf(draggedColId)
  const to   = order.indexOf(dropTargetColId)
  order.splice(to, 0, order.splice(from, 1)[0])
  table.setColumnOrder(order)
}}
```

### Row rendering — standard

```tsx
{table.getRowModel().rows.map((row, rowIndex) => (
  <React.Fragment key={row.id}>
    <tr
      aria-rowindex={rowIndex + 2}  // +2: 1-based, header is row 1
      aria-selected={row.getIsSelected() || undefined}
      aria-expanded={row.getIsExpanded() || undefined}
      className={clsx(
        styles.row,
        row.getIsSelected() && styles.rowSelected,
        onRowClick && styles.rowClickable,
      )}
      onClick={() => onRowClick?.(row)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onRowClick?.(row)
        }
      }}
      tabIndex={onRowClick ? 0 : undefined}
    >
      {row.getVisibleCells().map((cell, colIndex) => (
        <td
          key={cell.id}
          aria-colindex={colIndex + 1}
          // pinned column positioning — same pattern as headers
          style={{ ... }}
          className={clsx(styles.td, ...)}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
    {/* Expandable sub-row */}
    {row.getIsExpanded() && renderSubRow && (
      <tr className={styles.subRow} aria-rowindex={rowIndex + 2}>
        <td colSpan={row.getVisibleCells().length} className={styles.subRowCell}>
          {renderSubRow(row)}
        </td>
      </tr>
    )}
  </React.Fragment>
))}
```

### Row rendering — virtualised

When `enableVirtualisation={true}`, wrap the tbody in a fixed-height container and use `@tanstack/react-virtual`:

```tsx
const rowVirtualiser = useVirtualizer({
  count: rows.length,
  getScrollElement: () => scrollContainerRef.current,
  estimateSize: () => estimatedRowHeight ?? 48,
  overscan: 10,
})

// In JSX — tbody with padding spacers:
<tbody
  style={{ height: `${rowVirtualiser.getTotalSize()}px`, position: 'relative' }}
>
  {rowVirtualiser.getVirtualItems().map((virtualRow) => {
    const row = rows[virtualRow.index]
    return (
      <tr
        key={row.id}
        style={{
          position: 'absolute',
          top: 0,
          transform: `translateY(${virtualRow.start}px)`,
          width: '100%',
        }}
        aria-rowindex={virtualRow.index + 2}
        ...
      >
        ...
      </tr>
    )
  })}
</tbody>
```

Note: `aria-rowcount` on `<table>` must be the TOTAL row count (not the visible virtualised count) so screen readers announce the correct number.

### Row selection column

When `enableRowSelection` is truthy, prepend an auto-generated selection column to `columns` inside `useDataGridInternal`:

```ts
const selectionColumn: ColumnDef<TData> = {
  id: '__select__',
  size: 44,
  enableSorting: false,
  enableResizing: false,
  header: ({ table }) => (
    selectionMode === 'multi' ? (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ? true :
          table.getIsSomePageRowsSelected() ? 'indeterminate' :
          false
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all rows"
      />
    ) : null
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(v) => row.toggleSelected(!!v)}
      disabled={!row.getCanSelect()}
      aria-label={`Select row ${row.index + 1}`}
      onClick={(e) => e.stopPropagation()}  // prevent row click
    />
  ),
}
```

### Row expand column

When `enableExpanding`, prepend an expand column:

```ts
const expandColumn: ColumnDef<TData> = {
  id: '__expand__',
  size: 44,
  enableSorting: false,
  enableResizing: false,
  cell: ({ row }) => row.getCanExpand() ? (
    <Button
      variant="ghost"
      iconOnly
      icon={row.getIsExpanded() ? ChevronDown : ChevronRight}
      aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
      aria-expanded={row.getIsExpanded()}
      onClick={(e) => { e.stopPropagation(); row.toggleExpanded() }}
    />
  ) : null,
}
```

### Row actions column

When `rowActions` is provided, append an actions column:

```ts
const actionsColumn: ColumnDef<TData> = {
  id: '__actions__',
  size: 52,
  enableSorting: false,
  enableResizing: false,
  cell: ({ row }) => (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button
          variant="ghost"
          iconOnly
          icon={MoreHorizontal}
          aria-label={`Actions for row ${row.index + 1}`}
          onClick={(e) => e.stopPropagation()}
        />
      </DropdownTrigger>
      <DropdownContent>
        {rowActions
          .filter(action => !action.hidden?.(row))
          .map(action => (
            <DropdownItem
              key={action.label}
              icon={action.icon}
              destructive={action.destructive}
              disabled={action.disabled?.(row)}
              onSelect={() => action.onClick(row)}
            >
              {action.label}
            </DropdownItem>
          ))
        }
      </DropdownContent>
    </Dropdown>
  ),
}
```

### Inline cell editing

When `enableCellEditing={true}`, cells with an `editableCellRenderer` in their `ColumnDef` render an editable state on double-click or Enter. Implement a `useEditingCell` hook:

```ts
const [editingCell, setEditingCell] = React.useState<{ rowId: string; columnId: string } | null>(
  null
);

// On cell double-click or Enter:
const startEditing = (rowId: string, columnId: string) => setEditingCell({ rowId, columnId });
const commitEdit = (value: unknown) => {
  if (editingCell) onCellEdit?.(editingCell.rowId, editingCell.columnId, value);
  setEditingCell(null);
};
const cancelEdit = () => setEditingCell(null);
```

Cells in edit mode render an `Input` component. On `onBlur` or `Escape`: cancel. On `Enter`: commit.

### DataGridToolbar

```tsx
export const DataGridToolbar = ({
  table,
  globalFilter,
  onGlobalFilterChange,
  toolbarSlotStart,
  toolbarSlotEnd,
  density,
  onDensityChange,
}: DataGridToolbarProps) => (
  <div className={styles.toolbar}>
    {toolbarSlotStart}
    <Input
      value={globalFilter ?? ''}
      onChange={(e) => onGlobalFilterChange?.(e.target.value)}
      placeholder="Search…"
      aria-label="Search all columns"
      leftIcon={Search}
      className={styles.globalSearch}
    />
    {/* Column visibility toggle */}
    <Dropdown>
      <DropdownTrigger asChild>
        <Button variant="secondary" icon={Columns} aria-label="Toggle column visibility">
          Columns
        </Button>
      </DropdownTrigger>
      <DropdownContent>
        {table
          .getAllLeafColumns()
          .filter((col) => !['__select__', '__expand__', '__actions__'].includes(col.id))
          .map((col) => (
            <DropdownCheckboxItem
              key={col.id}
              checked={col.getIsVisible()}
              onCheckedChange={col.toggleVisibility}
            >
              {col.columnDef.header as string}
            </DropdownCheckboxItem>
          ))}
      </DropdownContent>
    </Dropdown>
    {toolbarSlotEnd}
  </div>
);
```

### DataGridPagination

```tsx
export const DataGridPagination = ({ table, pageSizeOptions }: DataGridPaginationProps) => {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();

  return (
    <div className={styles.pagination} role="navigation" aria-label="Pagination">
      {/* Row count summary */}
      <span className={styles.paginationSummary} aria-live="polite" aria-atomic="true">
        {table.getFilteredRowModel().rows.length} row
        {table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
      </span>

      {/* Page size selector */}
      <label className={styles.pageSizeLabel}>
        Rows per page
        <select
          value={pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className={styles.pageSizeSelect}
          aria-label="Rows per page"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>

      {/* Page info */}
      <span className={styles.pageInfo} aria-live="polite" aria-atomic="true">
        Page {pageIndex + 1} of {pageCount}
      </span>

      {/* Navigation buttons */}
      <Button
        variant="ghost"
        iconOnly
        icon={ChevronsLeft}
        aria-label="First page"
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.firstPage()}
      />
      <Button
        variant="ghost"
        iconOnly
        icon={ChevronLeft}
        aria-label="Previous page"
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
      />
      <Button
        variant="ghost"
        iconOnly
        icon={ChevronRight}
        aria-label="Next page"
        disabled={!table.getCanNextPage()}
        onClick={() => table.nextPage()}
      />
      <Button
        variant="ghost"
        iconOnly
        icon={ChevronsRight}
        aria-label="Last page"
        disabled={!table.getCanNextPage()}
        onClick={() => table.lastPage()}
      />
    </div>
  );
};
```

### Responsive — stack mode

When `responsiveMode="stack"` and viewport is below `stackBreakpoint` (default 640px), hide the `<table>` and render each row as a key/value card:

```tsx
// In DataGrid render:
const isStacked = useMediaQuery(`(max-width: ${stackBreakpoint}px)`) && responsiveMode === 'stack';

if (isStacked) {
  return (
    <div className={styles.stackedRows} role="list" aria-label={ariaLabel}>
      {table.getRowModel().rows.map((row) => (
        <div
          key={row.id}
          className={clsx(styles.stackedCard, row.getIsSelected() && styles.rowSelected)}
          role="listitem"
          onClick={() => onRowClick?.(row)}
          tabIndex={onRowClick ? 0 : undefined}
        >
          {row
            .getVisibleCells()
            .filter((cell) => !['__select__', '__expand__', '__actions__'].includes(cell.column.id))
            .map((cell) => (
              <div key={cell.id} className={styles.stackedRow}>
                <span className={styles.stackedLabel}>
                  {cell.column.columnDef.header as string}
                </span>
                <span className={styles.stackedValue}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </span>
              </div>
            ))}
          {/* Selection, expand, actions still rendered in stacked mode */}
        </div>
      ))}
    </div>
  );
}
```

Implement `useMediaQuery` as a small internal hook in `DataGrid.tsx` — do not import a third-party hook.

### Loading state

When `isLoading={true}`, render `loadingRowCount` skeleton rows:

```tsx
// Each skeleton row has the correct number of columns
// Use inline styles for skeleton shimmer width variation per cell
Array.from({ length: loadingRowCount ?? 5 }).map((_, i) => (
  <tr key={i} aria-hidden="true" className={styles.skeletonRow}>
    {table.getAllLeafColumns().map((col) => (
      <td key={col.id} className={styles.td}>
        <span className={styles.skeleton} style={{ width: `${60 + Math.random() * 30}%` }} />
      </td>
    ))}
  </tr>
));
```

`aria-hidden="true"` on skeleton rows — do not announce them to screen readers. Add `aria-busy="true"` to `<table>` during loading.

### Empty state

When `!isLoading` and `rows.length === 0`:

```tsx
<tr>
  <td colSpan={table.getAllLeafColumns().length} className={styles.emptyCell}>
    {renderEmpty ? (
      renderEmpty()
    ) : (
      <div className={styles.emptyState} role="status">
        <p className={styles.emptyMessage}>{emptyMessage ?? 'No results found'}</p>
        {emptyDescription && <p className={styles.emptyDescription}>{emptyDescription}</p>}
      </div>
    )}
  </td>
</tr>
```

---

## SCSS — DataGrid.module.scss

```scss
@use '../../../styles/mixins' as *;

// ─── Root ─────────────────────────────────────────────────────────────────────

.dataGrid {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--dds-color-border-default);
  background-color: var(--dds-color-bg-card);
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

.toolbar {
  display: flex;
  align-items: center;
  gap: var(--dds-space-3);
  padding: var(--dds-space-3) var(--dds-space-4);
  border-bottom: 1px solid var(--dds-color-border-default);
  background-color: var(--dds-color-bg-card);
  flex-wrap: wrap;
}

.globalSearch {
  flex: 1 1 200px;
  min-width: 0;
  max-width: 320px;
}

// ─── Table (inherits Table.module.scss patterns, re-declared here) ────────────

.table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-default);
  border-radius: var(--dds-radius-none);
}

// ─── Density ─────────────────────────────────────────────────────────────────

.density-compact .th,
.density-compact .td {
  padding: var(--dds-space-1-5) var(--dds-space-3);
  min-height: 32px;
}

.density-default .th,
.density-default .td {
  padding: var(--dds-space-3) var(--dds-space-4);
  min-height: 44px;
}

.density-comfortable .th,
.density-comfortable .td {
  padding: var(--dds-space-4) var(--dds-space-5);
  min-height: 56px;
}

// ─── Header ──────────────────────────────────────────────────────────────────

.thead {
  background-color: var(--dds-color-bg-subtle);
  position: sticky;
  top: 0;
  z-index: var(--dds-z-table-sticky-header);
}

.th {
  font-size: var(--dds-font-size-xs);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--dds-tracking-wider);
  white-space: nowrap;
  vertical-align: bottom;
  background-color: var(--dds-color-bg-subtle);
  border-bottom: 2px solid var(--dds-color-border-default);
  position: relative; // for resize handle
  user-select: none; // prevent text selection during resize/drag

  &[aria-sort] {
    cursor: pointer;
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: -3px;
  }
}

// Sort button inside th
.sortButton {
  display: inline-flex;
  align-items: center;
  gap: var(--dds-space-1-5);
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-align: inherit;
  letter-spacing: inherit;
  text-transform: inherit;

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

// ─── Resize handle ────────────────────────────────────────────────────────────

.resizeHandle {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background-color: transparent;
  transition: background-color var(--dds-duration-fast) var(--dds-ease-standard);
  z-index: 1;

  &:hover,
  &:focus-visible {
    background-color: var(--dds-color-action-primary);
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 0;
  }
}

.resizeHandleActive {
  background-color: var(--dds-color-action-primary);
}

// ─── Filter input ─────────────────────────────────────────────────────────────

.filterInput {
  margin-top: var(--dds-space-1-5);
  width: 100%;
}

// ─── Data cell ────────────────────────────────────────────────────────────────

.td {
  vertical-align: middle;
  border-bottom: 1px solid var(--dds-color-border-default);
  background-color: inherit;
}

// ─── Rows ────────────────────────────────────────────────────────────────────

.row {
  background-color: var(--dds-color-bg-card);
  transition: background-color var(--dds-duration-fast) var(--dds-ease-standard);

  &:last-child .td {
    border-bottom: none;
  }
}

.hoverable .row:hover:not(.rowDisabled) {
  background-color: var(--dds-color-bg-card-hover);
}

.striped .row:nth-child(even) {
  background-color: var(--dds-color-bg-subtle);
}

.rowSelected {
  background-color: oklch(from var(--dds-color-action-primary) l c h / 0.06);

  &:hover {
    background-color: oklch(from var(--dds-color-action-primary) l c h / 0.1);
  }
}

.rowClickable {
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: -3px;
  }
}

// ─── Sticky columns ───────────────────────────────────────────────────────────

.stickyLeft,
.stickyRight {
  position: sticky;
  background-color: inherit;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    width: 8px;
    height: 100%;
    pointer-events: none;
  }
}

.stickyLeft {
  left: 0;
  z-index: var(--dds-z-table-sticky-col);

  &::after {
    right: -8px;
    background: linear-gradient(
      to right,
      oklch(from var(--dds-color-bg-default) l c h / 0.15),
      transparent
    );
  }

  .thead & {
    z-index: var(--dds-z-table-sticky-col-header);
  }
}

.stickyRight {
  right: 0;
  z-index: var(--dds-z-table-sticky-col);

  &::after {
    left: -8px;
    background: linear-gradient(
      to left,
      oklch(from var(--dds-color-bg-default) l c h / 0.15),
      transparent
    );
  }

  .thead & {
    z-index: var(--dds-z-table-sticky-col-header);
  }
}

// ─── Numeric ─────────────────────────────────────────────────────────────────

.numeric {
  font-variant-numeric: tabular-nums;
  text-align: right;
  font-family: var(--dds-font-mono);
  font-size: var(--dds-font-size-xs);
}

// ─── Sub-row ─────────────────────────────────────────────────────────────────

.subRow {
  background-color: var(--dds-color-bg-subtle);
}

.subRowCell {
  padding: var(--dds-space-4) var(--dds-space-6);
  border-bottom: 1px solid var(--dds-color-border-default);
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

.skeleton {
  display: block;
  height: 14px;
  border-radius: var(--dds-radius-none);
  background: linear-gradient(
    90deg,
    var(--dds-color-bg-subtle) 0%,
    var(--dds-color-bg-muted) 50%,
    var(--dds-color-bg-subtle) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background: var(--dds-color-bg-subtle);
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// ─── Empty state ─────────────────────────────────────────────────────────────

.emptyCell {
  padding: var(--dds-space-12) var(--dds-space-6);
}

.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dds-space-2);
  text-align: center;
}

.emptyMessage {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-default);
  margin: 0;
}

.emptyDescription {
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-muted);
  margin: 0;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

.pagination {
  display: flex;
  align-items: center;
  gap: var(--dds-space-3);
  padding: var(--dds-space-3) var(--dds-space-4);
  border-top: 1px solid var(--dds-color-border-default);
  background-color: var(--dds-color-bg-subtle);
  flex-wrap: wrap;
}

.paginationSummary {
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-muted);
  margin-right: auto;
}

.pageSizeLabel {
  display: flex;
  align-items: center;
  gap: var(--dds-space-2);
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-muted);
}

.pageSizeSelect {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-default);
  background-color: var(--dds-color-bg-input);
  border: 1px solid var(--dds-color-border-input);
  border-radius: var(--dds-radius-none);
  padding: var(--dds-space-1) var(--dds-space-2);

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

.pageInfo {
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-muted);
  font-variant-numeric: tabular-nums;
}

// ─── Drag-to-reorder indicator ────────────────────────────────────────────────

.thDragging {
  opacity: 0.5;
  cursor: grabbing;
}

.thDropTarget {
  border-left: 2px solid var(--dds-color-action-primary);
}

// ─── Stacked (mobile card) mode ───────────────────────────────────────────────

.stackedRows {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-3);
  padding: var(--dds-space-3);
}

.stackedCard {
  background-color: var(--dds-color-bg-card);
  border: 1px solid var(--dds-color-border-default);
  padding: var(--dds-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-2);

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

.stackedRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dds-space-2);
  align-items: baseline;
}

.stackedLabel {
  font-size: var(--dds-font-size-xs);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--dds-tracking-wider);
}

.stackedValue {
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-default);
}
```

---

## CSS custom property exceptions (documented)

Column widths and pinned column offsets are set via TanStack-computed inline styles (`width: header.getSize()`, `left: column.getStart('left')px`). These are dynamic layout values that cannot be expressed as static token classes — they are documented exceptions consistent with the project pattern.

---

## Accessibility

DataGrid uses `role="grid"` (not `role="table"`) because it is interactive. This is the correct ARIA role for interactive grids per the APG Grid Pattern.

### Core ARIA

| Element                | ARIA                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `<table>`              | `role="grid"`, `aria-label`, `aria-rowcount` (total), `aria-colcount`, `aria-busy` (loading) |
| `<tr>` in tbody        | `aria-rowindex` (1-based, header = row 1)                                                    |
| `<td>`                 | `aria-colindex` (1-based)                                                                    |
| `<tr>` selected        | `aria-selected="true"`                                                                       |
| `<tr>` expanded        | `aria-expanded="true"`                                                                       |
| Sort `<button>`        | `aria-label` describing column name + current sort direction                                 |
| `<th>`                 | `aria-sort="ascending/descending/none"` when sortable                                        |
| Resize handle          | `role="separator"`, `aria-orientation="vertical"`, `aria-valuenow`, `aria-valuemin`          |
| Pagination container   | `role="navigation"`, `aria-label="Pagination"`                                               |
| Pagination summary     | `aria-live="polite"`, `aria-atomic="true"`                                                   |
| Page info              | `aria-live="polite"`, `aria-atomic="true"`                                                   |
| Loading skeleton rows  | `aria-hidden="true"` on each row; `aria-busy="true"` on `<table>`                            |
| Empty state            | `role="status"` on the message container                                                     |
| Selection checkbox     | `aria-label="Select row N"` / `"Select all rows"`                                            |
| Expand button          | `aria-expanded`, `aria-label="Expand/Collapse row"`                                          |
| Row actions trigger    | `aria-label="Actions for row N"`                                                             |
| Column vis dropdown    | `aria-label="Toggle column visibility"`                                                      |
| Global search          | `aria-label="Search all columns"`                                                            |
| Stacked mode container | `role="list"`, `aria-label` matching the grid label                                          |
| Stacked mode card      | `role="listitem"`                                                                            |

### Keyboard navigation — grid pattern

| Key               | Behaviour                                                                       |
| ----------------- | ------------------------------------------------------------------------------- |
| `Tab`             | Moves focus to the next focusable widget (sort button, checkbox, action button) |
| `Shift+Tab`       | Reverse                                                                         |
| `Enter` / `Space` | Activates focused button or checkbox                                            |
| `ArrowUp/Down`    | Moves between rows when a row is focused (clickable rows)                       |
| `ArrowLeft/Right` | Moves between cells in a row (if cell navigation is implemented)                |
| `Home`            | First focusable element in current row                                          |
| `End`             | Last focusable element in current row                                           |
| `Escape`          | Cancel inline edit / close dropdowns                                            |

### Column drag-to-reorder accessibility

Drag-and-drop via mouse only is inaccessible. Provide a keyboard alternative:

- Column header sort button has an additional `aria-label` hint: "Press Space to drag and reorder"
- When `enableColumnReordering`, add keyboard handler: pressing `Space` on a column header enters "move mode"; `ArrowLeft`/`ArrowRight` reorders; `Enter` or `Escape` exits. Implement via a `useColumnKeyboardReorder` internal hook.

---

## TDD — write ALL tests before implementing

Run scaffolding first: `node scaffolding.mjs DataGrid`

This is a large component. Organise tests into describe blocks:

```
describe('DataGrid - Rendering')
  - renders table with role="grid"
  - renders aria-label
  - renders column headers
  - renders data rows
  - renders correct row count
  - renders toolbar
  - renders pagination
  - renders with all required dependencies (Button, Checkbox, Input, Dropdown)

describe('DataGrid - Sorting')
  - clicking sortable header calls onSortingChange
  - aria-sort="ascending" set after sort asc
  - aria-sort="descending" set after sort desc
  - aria-sort="none" on unsorted sortable column
  - sort button has descriptive aria-label
  - multi-column sort supported (shift+click)
  - manualSorting=true does not sort client-side
  - enableSorting=false hides sort buttons

describe('DataGrid - Filtering')
  - global search input renders
  - typing in global search calls onGlobalFilterChange
  - column filter input renders when filterable=true on column
  - typing in column filter calls onColumnFiltersChange
  - manualFiltering=true does not filter client-side
  - enableFiltering=false hides filter inputs

describe('DataGrid - Pagination')
  - renders correct page count
  - next page button advances page
  - previous page button goes back
  - first/last page buttons work
  - first page button disabled on page 1
  - last page button disabled on last page
  - page size selector changes page size
  - pagination summary shows correct row count
  - pagination summary is aria-live="polite"
  - manualPagination=true uses pageCount prop
  - onPaginationChange called on page navigation

describe('DataGrid - Row Selection')
  - row checkbox renders when enableRowSelection=true
  - clicking row checkbox selects row
  - aria-selected="true" on selected row
  - select all checkbox selects all visible rows
  - select all is indeterminate when some rows selected
  - onRowSelectionChange called on selection
  - selectionMode="single" hides select-all checkbox
  - disabled row cannot be selected

describe('DataGrid - Row Click')
  - row has tabIndex=0 when onRowClick provided
  - clicking row calls onRowClick with row data
  - Enter key on focused row calls onRowClick
  - Space key on focused row calls onRowClick
  - clicking checkbox does not trigger onRowClick

describe('DataGrid - Expandable Rows')
  - expand button renders when enableExpanding=true
  - clicking expand button shows sub-row
  - sub-row renders renderSubRow content
  - aria-expanded="true" on expanded row
  - clicking expand again collapses sub-row
  - expand button aria-label changes between expand/collapse

describe('DataGrid - Row Actions')
  - actions menu button renders when rowActions provided
  - clicking actions button opens dropdown
  - action items render with labels
  - clicking action calls action.onClick with row
  - disabled action is not clickable
  - hidden action is not rendered
  - actions button does not trigger onRowClick

describe('DataGrid - Column Resizing')
  - resize handle renders on resizable columns
  - resize handle has role="separator"
  - resize handle has aria-valuenow
  - mouse drag on resize handle calls onColumnSizingChange
  - enableColumnResizing=false hides all resize handles
  - resizable=false on column hides that column's handle

describe('DataGrid - Column Visibility')
  - column visibility toggle dropdown renders
  - unchecking a column hides it
  - re-checking shows it
  - __select__, __expand__, __actions__ columns not shown in visibility menu
  - onColumnVisibilityChange called on toggle

describe('DataGrid - Column Pinning')
  - pinned left column has sticky left positioning
  - pinned right column has sticky right positioning
  - pinned column header has correct z-index
  - shadow indicator renders on pinned column edge

describe('DataGrid - Loading State')
  - skeleton rows render when isLoading=true
  - skeleton rows are aria-hidden="true"
  - table has aria-busy="true" when loading
  - custom loadingRowCount renders correct number of skeletons
  - data rows not rendered when loading

describe('DataGrid - Empty State')
  - empty message renders when no rows and not loading
  - custom emptyMessage prop renders
  - custom emptyDescription prop renders
  - renderEmpty slot renders custom empty state
  - empty state has role="status"

describe('DataGrid - Responsive Stack Mode')
  - stacked mode renders role="list" at narrow viewport
  - each stacked card has role="listitem"
  - stacked card shows column label + value pairs
  - clicking stacked card calls onRowClick
  - __select__ and __actions__ columns handled in stacked mode

describe('DataGrid - Virtualisation')
  - enableVirtualisation=true renders only visible rows
  - scrolling renders new rows
  - aria-rowcount reflects total (not just virtual) count
  - aria-rowindex correct on virtual rows

describe('DataGrid - Inline Editing')
  - double-click on editable cell enters edit mode
  - Enter key commits edit, calls onCellEdit
  - Escape cancels edit
  - blur cancels edit

describe('DataGrid - Accessibility')
  - role="grid" on table element
  - aria-rowcount equals total data length
  - aria-colcount equals visible column count
  - sort buttons have descriptive aria-labels
  - resize handles have role="separator"
  - pagination has role="navigation"
  - pagination summary is aria-live

describe('DataGrid - axe')
  - axe: basic grid with data
  - axe: with row selection
  - axe: with sorting active
  - axe: with column filters
  - axe: with expanded row
  - axe: with row actions
  - axe: loading state
  - axe: empty state
  - axe: paginated
  - axe: with pinned columns
  - axe: stacked mobile mode
  - axe: with virtualisation enabled
```

---

## Stories — `DataGrid.stories.tsx`

Title: `App Patterns/DataGrid`

All stories use a shared `generateEmployees(n: number)` data factory defined at the top of the stories file. Columns: id, name, email, role, department, status (active/inactive/pending), salary, startDate, location.

Named exports required:

- `Default` — 20 rows, sorting + filtering + pagination. All columns. `aria-label="Employee directory"`.
- `WithRowSelection` — `enableRowSelection={true}`, `selectionMode="multi"`. Toolbar slot shows "N selected" count.
- `WithRowActions` — 3 actions per row: View, Edit, Delete (destructive). Uses `rowActions` prop.
- `WithExpandableRows` — `enableExpanding={true}`. `renderSubRow` renders a `KeyValueList` of employee details.
- `WithInlineEditing` — `enableCellEditing={true}`. Name and email columns editable. `onCellEdit` logs to `actions`.
- `ServerSide` — `manualSorting`, `manualFiltering`, `manualPagination` all true. `pageCount` prop. All callbacks log to `actions`. Story shows simulated server-side data loading via `setTimeout` and `isLoading` state.
- `ColumnResizing` — `enableColumnResizing={true}` (default). All columns resizable. Story note explains resize handles.
- `ColumnReordering` — `enableColumnReordering={true}`. Drag column headers. Story note explains keyboard alternative.
- `ColumnPinning` — `columnPinning={{ left: ['name'], right: ['__actions__'] }}`. Wide table to require scroll.
- `WithVirtualisation` — `enableVirtualisation={true}`. 1000 rows via `generateEmployees(1000)`. Demonstrates smooth scrolling.
- `LoadingState` — `isLoading={true}`. Shows shimmer skeleton rows.
- `EmptyState` — `data={[]}`, custom `emptyMessage` and `emptyDescription`.
- `CustomEmptySlot` — `data={[]}`, `renderEmpty` renders an illustration + call-to-action button.
- `Densities` — three stacked DataGrids (compact / default / comfortable) with 5 rows each.
- `ResponsiveStack` — `responsiveMode="stack"`. Resize the Storybook canvas below 640px to see card mode.
- `RichCellContent` — Status column renders `Badge`, salary renders currency format, name renders `Avatar` + text, actions column renders `Button` directly (not via rowActions). Demonstrates DDS components inside cells.
- `AllFeatures` — single story combining: multi-row selection, row actions, expandable rows, sorting, column filtering, pagination, pinned first column, column visibility toggle. Closest to a real app scenario.

`SortByName` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const nameHeader = within(canvasElement).getByRole('button', { name: /sort by name/i });
  await userEvent.click(nameHeader);
  await expect(nameHeader.closest('th')).toHaveAttribute('aria-sort', 'ascending');
  await userEvent.click(nameHeader);
  await expect(nameHeader.closest('th')).toHaveAttribute('aria-sort', 'descending');
};
```

`SelectAllRows` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const selectAll = within(canvasElement).getByRole('checkbox', { name: /select all rows/i });
  await userEvent.click(selectAll);
  const rowCheckboxes = within(canvasElement).getAllByRole('checkbox', { name: /select row/i });
  rowCheckboxes.forEach((cb) => expect(cb).toBeChecked());
};
```

`GlobalSearch` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const search = within(canvasElement).getByRole('textbox', { name: /search all columns/i });
  await userEvent.type(search, 'engineering');
  // Rows should filter — verify at least one row contains "Engineering"
  const cells = within(canvasElement).getAllByRole('gridcell');
  const hasMatch = cells.some((c) => c.textContent?.toLowerCase().includes('engineering'));
  await expect(hasMatch).toBe(true);
};
```

`ExpandRow` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const expandBtn = within(canvasElement).getAllByRole('button', { name: /expand row/i })[0];
  await userEvent.click(expandBtn);
  await expect(expandBtn).toHaveAttribute('aria-expanded', 'true');
  // Sub-row content should now be in the document
  const subRow = within(canvasElement).getByRole('row', { name: /sub-row/i });
  // OR check for a known piece of renderSubRow content
};
```

Use `autodocs`. Storybook group: `App Patterns/DataGrid`.

---

## Definition of done

- [ ] Z-index tokens verified in `packages/tokens/src/tokens.css` before any code
- [ ] `@tanstack/react-table` and `@tanstack/react-virtual` added to `package.json`
- [ ] All Vitest tests pass across all describe blocks
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all test cases including virtualised and stacked modes
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] `role="grid"` on table, `aria-rowcount` = total rows, `aria-colcount` = visible columns
- [ ] `aria-rowindex` on each body row (1-based, header = 1)
- [ ] `aria-colindex` on each cell (1-based)
- [ ] Sort buttons are `<button>` elements with descriptive `aria-label` — not `onClick` on `<th>`
- [ ] `aria-sort` set correctly on `<th>` from TanStack sort state
- [ ] Resize handles have `role="separator"`, `aria-valuenow`, `aria-valuemin`
- [ ] Keyboard alternative for column reordering implemented (Space + Arrow + Enter/Escape)
- [ ] Loading skeleton rows are `aria-hidden="true"`; table is `aria-busy="true"` when loading
- [ ] Empty state has `role="status"`
- [ ] Pagination container has `role="navigation"`, summary has `aria-live="polite"`
- [ ] Stacked mode uses `role="list"` / `role="listitem"`
- [ ] Virtualised mode: `aria-rowcount` = full data length (not just rendered count)
- [ ] Pinned column offsets computed by TanStack `column.getStart('left')` — no hardcoded px values
- [ ] Shadow indicators render on both left-pinned and right-pinned column edges
- [ ] `border-radius: var(--dds-radius-none)` everywhere — no exceptions
- [ ] No Tailwind. No hardcoded color, spacing, or font values in SCSS.
- [ ] Exported from `packages/components/src/index.ts`

# Table · node scaffolding.mjs Table

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/Badge/
packages/components/src/components/Tag/
packages/components/src/components/StatusIndicator/
packages/components/src/components/
```

- Use existing components inside cell content in stories — Table itself renders no specific cell content.
- No Radix primitive and no TanStack dependency. Table is pure semantic HTML with SCSS modules.
- No JavaScript logic. Table is a static, presentational layout component.

### Token addition required

Before implementing, add the following z-index tokens to `packages/tokens/src/tokens.css` in the Tier 1 block. These are shared by both Table and DataGrid:

```css
/* Tier 1 — Z-index */
--dds-z-table-sticky-col: 2;
--dds-z-table-sticky-header: 3;
--dds-z-table-sticky-col-header: 4; /* pinned column + sticky header intersection */
```

Do not proceed with SCSS until these tokens exist.

---

## Scaffold location

```
packages/components/src/components/Table/
  Table.tsx
  Table.module.scss
  Table.test.tsx
  Table.stories.tsx
  index.ts
```

---

## Purpose

`Table` is a lightweight, semantic HTML table for displaying static, read-only tabular data. It handles layout, typography, borders, striping, hover states, responsive scrolling, and density variants — but has no JavaScript-driven interactivity.

**Table vs DataGrid:**

- `Table`: static display, no sorting/filtering/selection, written with semantic `<table>` elements, zero JS logic.
- `DataGrid`: full interactivity via TanStack Table v8, composes Table's SCSS tokens for visual consistency.

**When to use Table:** documentation pages, summary reports, pricing comparison grids, read-only data displays embedded in cards or modals.

---

## Exports from `index.ts`

```ts
export { Table, TableHead, TableBody, TableFoot, TableRow, TableHeader, TableCell, TableCaption };
export type { TableProps, TableRowProps, TableHeaderProps, TableCellProps, TableCaptionProps };
```

---

## Types

```ts
type TableDensity = 'compact' | 'default' | 'comfortable';
type TableLayout = 'auto' | 'fixed';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  density?: TableDensity; // default: 'default'
  striped?: boolean; // default: false — alternating row backgrounds
  hoverable?: boolean; // default: true  — row hover highlight
  bordered?: boolean; // default: false — adds borders to all cells
  stickyHeader?: boolean; // default: false — <thead> stays fixed on scroll
  layout?: TableLayout; // default: 'auto' — maps to table-layout CSS
  caption?: string; // renders a <caption> — required for a11y when table purpose isn't obvious from context
  'aria-label'?: string; // alternative to caption for accessible name
  className?: string;
  children: React.ReactNode;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean; // default: false — selected row highlight
  disabled?: boolean; // default: false — muted row
  className?: string;
  children: React.ReactNode;
}

export interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right'; // default: 'left'
  numeric?: boolean; // default: false — tabular-nums + right align
  sortable?: boolean; // default: false — renders sort icon (purely visual — no JS)
  sortDirection?: 'asc' | 'desc' | 'none'; // default: 'none'
  sticky?: boolean; // default: false — sticky left column header
  className?: string;
  children?: React.ReactNode;
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right'; // default: 'left'
  numeric?: boolean; // default: false — tabular-nums + right align
  truncate?: boolean; // default: false — text-overflow: ellipsis
  sticky?: boolean; // default: false — sticky left column
  className?: string;
  children?: React.ReactNode;
}

export interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  side?: 'top' | 'bottom'; // default: 'bottom' — HTML caption default
  className?: string;
  children: React.ReactNode;
}
```

---

## Architecture

Table wraps the full set of semantic HTML table elements. No JS is involved. Consumers write standard `<thead>/<tbody>/<tfoot>/<tr>/<th>/<td>` structures using the DDS sub-components.

### Responsive strategy

The `Table` root does **not** clip or scroll. Scrolling is handled by a consumer-provided wrapper:

```tsx
// Consumer wraps table in a scroll container:
<div className="table-scroll-wrapper" style={{ overflowX: 'auto' }}>
  <Table stickyHeader>…</Table>
</div>
```

Document this clearly. Provide a `TableScrollWrapper` export as a convenience:

```tsx
export const TableScrollWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(styles.scrollWrapper, className)}
    role="region"
    aria-label="Scrollable table" // overridable via aria-label prop
    tabIndex={0} // keyboard focusable so scroll region is reachable
    {...props}
  >
    {children}
  </div>
));
TableScrollWrapper.displayName = 'TableScrollWrapper';
```

Add `TableScrollWrapper` to exports.

### Sticky header

`stickyHeader` adds `position: sticky; top: 0; z-index: var(--dds-z-table-sticky-header)` to `<thead tr th` via a `.stickyHeader` modifier class on the `<table>`. Header cells get a background that matches the table header background so content doesn't bleed through on scroll.

### Sticky columns

`sticky` on `TableHeader` or `TableCell` adds `position: sticky; left: 0; z-index: var(--dds-z-table-sticky-col)`. At the `<thead>` intersection of sticky column + sticky header, z-index is `var(--dds-z-table-sticky-col-header)`.

The consumer is responsible for setting `left` offset for multiple pinned columns using inline style (`style={{ left: '200px' }}`). Document this limitation.

### Sort icons

`sortable` on `TableHeader` renders a sort icon using `lucide-react`. The icons are:

- `sortDirection="none"` → `ChevronsUpDown` (aria-hidden, muted colour)
- `sortDirection="asc"` → `ChevronUp` (aria-hidden, primary colour)
- `sortDirection="desc"` → `ChevronDown` (aria-hidden, primary colour)

These are purely visual in Table — there is no `onClick` handler. Consumers wire their own sort logic. This is intentional: Table is a display primitive.

The `<th>` renders `aria-sort="ascending"` / `aria-sort="descending"` / `aria-sort="none"` when `sortDirection` is provided.

---

## Component structure

```tsx
// Table.tsx
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import clsx from 'clsx';
import styles from './Table.module.scss';

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
        styles[`density-${density}`],
        striped && styles.striped,
        hoverable && styles.hoverable,
        bordered && styles.bordered,
        stickyHeader && styles.stickyHeader,
        styles[`layout-${layout}`],
        className
      )}
      {...props}
    >
      {caption && <TableCaption>{caption}</TableCaption>}
      {children}
    </table>
  )
);
Table.displayName = 'Table';

// TableScrollWrapper — responsive scroll container
export const TableScrollWrapper = React.forwardRef<HTMLDivElement, TableScrollWrapperProps>(
  ({ className, children, 'aria-label': ariaLabel = 'Scrollable table', ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(styles.scrollWrapper, className)}
      role="region"
      aria-label={ariaLabel}
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

const sortIconMap = {
  asc: ChevronUp,
  desc: ChevronDown,
  none: ChevronsUpDown,
};

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
      ...props
    },
    ref
  ) => {
    const SortIcon = sortable ? sortIconMap[sortDirection] : null;
    const ariaSortMap = { asc: 'ascending', desc: 'descending', none: 'none' } as const;

    return (
      <th
        ref={ref}
        scope="col"
        aria-sort={sortable ? ariaSortMap[sortDirection] : undefined}
        className={clsx(
          styles.th,
          styles[`align-${numeric ? 'right' : align}`],
          numeric && styles.numeric,
          sticky && styles.stickyCol,
          className
        )}
        {...props}
      >
        <span className={styles.thInner}>
          <span className={styles.thLabel}>{children}</span>
          {SortIcon && (
            <SortIcon
              className={clsx(styles.sortIcon, sortDirection !== 'none' && styles.sortIconActive)}
              aria-hidden="true"
            />
          )}
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
        styles[`align-${numeric ? 'right' : align}`],
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
      className={clsx(styles.caption, styles[`caption-${side}`], className)}
      {...props}
    >
      {children}
    </caption>
  )
);
TableCaption.displayName = 'TableCaption';
```

---

## SCSS — Table.module.scss

```scss
@use '../../../styles/mixins' as *;

// ─── Scroll wrapper ───────────────────────────────────────────────────────────

.scrollWrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  border: 1px solid var(--dds-color-border-default);

  // Focus ring when the scroll region itself is focused via keyboard
  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

// ─── Table ────────────────────────────────────────────────────────────────────

.table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-default);
  background-color: var(--dds-color-bg-card);
  border-radius: var(--dds-radius-none);
}

.layout-auto {
  table-layout: auto;
}
.layout-fixed {
  table-layout: fixed;
}

// ─── Thead ────────────────────────────────────────────────────────────────────

.thead {
  background-color: var(--dds-color-bg-subtle);
  border-bottom: 2px solid var(--dds-color-border-default);
}

// ─── Tfoot ────────────────────────────────────────────────────────────────────

.tfoot {
  background-color: var(--dds-color-bg-subtle);
  border-top: 2px solid var(--dds-color-border-default);

  .td {
    font-weight: var(--dds-font-weight-semibold);
  }
}

// ─── Rows ────────────────────────────────────────────────────────────────────

.row {
  border-bottom: 1px solid var(--dds-color-border-default);
  transition: background-color var(--dds-duration-fast) var(--dds-ease-standard);

  &:last-child {
    border-bottom: none;
  }
}

// Hover rows
.hoverable .tbody .row:hover:not(.rowDisabled) {
  background-color: var(--dds-color-bg-card-hover);
}

// Striped rows
.striped .tbody .row:nth-child(even) {
  background-color: var(--dds-color-bg-subtle);
}

// Selected row
.rowSelected {
  background-color: oklch(from var(--dds-color-action-primary) l c h / 0.06);

  &:hover {
    background-color: oklch(from var(--dds-color-action-primary) l c h / 0.1);
  }
}

// Disabled row
.rowDisabled {
  opacity: 0.45;
  pointer-events: none;
}

// ─── Density ─────────────────────────────────────────────────────────────────

.density-compact .th,
.density-compact .td {
  padding: var(--dds-space-1-5) var(--dds-space-3);
}

.density-default .th,
.density-default .td {
  padding: var(--dds-space-3) var(--dds-space-4);
}

.density-comfortable .th,
.density-comfortable .td {
  padding: var(--dds-space-4) var(--dds-space-5);
}

// ─── Header cell ─────────────────────────────────────────────────────────────

.th {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--dds-tracking-wider);
  white-space: nowrap;
  text-align: left;
  vertical-align: bottom;
  background-color: var(--dds-color-bg-subtle); // needed for sticky overlap
}

// ─── Th inner layout (label + sort icon) ─────────────────────────────────────

.thInner {
  display: inline-flex;
  align-items: center;
  gap: var(--dds-space-1-5);
}

.thLabel {
  flex: 1 1 0;
  min-width: 0;
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

.sortIcon {
  width: var(--dds-icon-size-md);
  height: var(--dds-icon-size-md);
  flex-shrink: 0;
  color: var(--dds-color-text-muted);
  opacity: 0.5;
}

.sortIconActive {
  color: var(--dds-color-action-primary);
  opacity: 1;
}

// ─── Data cell ────────────────────────────────────────────────────────────────

.td {
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-default);
  vertical-align: middle;
  background-color: inherit;
}

// ─── Alignment ────────────────────────────────────────────────────────────────

.align-left {
  text-align: left;
}
.align-center {
  text-align: center;
}
.align-right {
  text-align: right;
}

// ─── Numeric ─────────────────────────────────────────────────────────────────

.numeric {
  font-variant-numeric: tabular-nums;
  text-align: right;
  font-family: var(--dds-font-mono);
  font-size: var(--dds-font-size-xs);
}

// ─── Truncate ────────────────────────────────────────────────────────────────

.truncate {
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// ─── Bordered variant ────────────────────────────────────────────────────────

.bordered .th,
.bordered .td {
  border: 1px solid var(--dds-color-border-default);
}

// ─── Sticky header ────────────────────────────────────────────────────────────

.stickyHeader .th {
  position: sticky;
  top: 0;
  z-index: var(--dds-z-table-sticky-header);
  // box-shadow creates the bottom border so it scrolls with the header
  box-shadow: 0 1px 0 var(--dds-color-border-default);
}

// ─── Sticky column ────────────────────────────────────────────────────────────

.stickyCol {
  position: sticky;
  left: 0;
  z-index: var(--dds-z-table-sticky-col);
  background-color: inherit; // inherits row bg so it covers scrolled content

  // At the intersection of a sticky column header and sticky header row
  .stickyHeader .thead & {
    z-index: var(--dds-z-table-sticky-col-header);
  }

  // Right shadow to indicate more content scrolled beneath
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: -8px;
    width: 8px;
    height: 100%;
    background: linear-gradient(
      to right,
      oklch(from var(--dds-color-bg-default) l c h / 0.15),
      transparent
    );
    pointer-events: none;
  }
}

// ─── Caption ─────────────────────────────────────────────────────────────────

.caption {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-text-muted);
  text-align: left;
  padding: var(--dds-space-2) 0;
}

.caption-top {
  caption-side: top;
}
.caption-bottom {
  caption-side: bottom;
}
```

---

## Accessibility

- Native `<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th scope="col">`, `<td>` — full semantic HTML. No `role` overrides needed.
- `<caption>` or `aria-label` on `<table>` is required for accessible table identification. Storybook stories must always provide one.
- `TableHeader` always renders `scope="col"` — do not omit.
- For row header cells (first column identifying the row), pass `scope="row"` via the `...props` spread.
- `aria-sort`: set automatically from `sortDirection` prop — `"ascending"` / `"descending"` / `"none"`.
- Sort icons are `aria-hidden="true"` — sort direction is communicated via `aria-sort` on the `<th>`.
- `TableRow selected`: `aria-selected="true"` — announced by screen readers in a table context.
- `TableRow disabled`: `aria-disabled="true"` — `pointer-events: none` in CSS; not native `disabled` (invalid on `<tr>`).
- `TableScrollWrapper`: `role="region"` + `aria-label` + `tabIndex={0}` — keyboard users can focus the scroll region and use arrow keys / scrollbar to navigate. Without `tabIndex={0}`, keyboard users cannot access overflow content.
- `stickyHeader` background: `background-color: var(--dds-color-bg-subtle)` on all `<th>` cells so body content does not bleed through on scroll — critical for readability.
- Colour is never the sole differentiator — striped rows use background changes, selected uses border + background, disabled uses opacity.

### Keyboard interactions

| Element                | Key             | Behaviour                                           |
| ---------------------- | --------------- | --------------------------------------------------- |
| `TableScrollWrapper`   | `Tab`           | Focuses the scroll region                           |
| `TableScrollWrapper`   | `←` `→` `↑` `↓` | Scrolls the table (browser-native scroll behaviour) |
| Links/buttons in cells | `Tab`           | Standard tab order through interactive cell content |

---

## TDD — write ALL tests before implementing

Run scaffolding first: `node scaffolding.mjs Table`

```
// Rendering
- Table renders as <table>
- TableHead renders as <thead>
- TableBody renders as <tbody>
- TableFoot renders as <tfoot>
- TableRow renders as <tr>
- TableHeader renders as <th>
- TableCell renders as <td>
- TableCaption renders as <caption>
- TableHeader has scope="col"

// Props
- applies density-compact class
- applies density-default class (default)
- applies density-comfortable class
- applies striped class when striped={true}
- applies hoverable class when hoverable={true} (default)
- applies bordered class when bordered={true}
- applies stickyHeader class when stickyHeader={true}
- applies layout-fixed when layout="fixed"
- renders <caption> when caption string prop is provided
- forwards ref to <table>
- forwards className

// TableHeader
- align-left class by default
- align-right when align="right"
- align-center when align="center"
- numeric class when numeric={true}
- renders ChevronsUpDown icon when sortable={true} sortDirection="none"
- renders ChevronUp icon when sortDirection="asc"
- renders ChevronDown icon when sortDirection="desc"
- sort icon has aria-hidden="true"
- has aria-sort="ascending" when sortDirection="asc"
- has aria-sort="descending" when sortDirection="desc"
- has aria-sort="none" when sortDirection="none"
- no aria-sort when sortable={false}
- stickyCol class when sticky={true}

// TableCell
- numeric class and align-right when numeric={true}
- truncate class when truncate={true}
- stickyCol class when sticky={true}

// TableRow
- aria-selected="true" when selected={true}
- no aria-selected when selected={false}
- aria-disabled="true" when disabled={true}
- rowSelected class when selected={true}
- rowDisabled class when disabled={true}

// TableScrollWrapper
- renders with role="region"
- has tabIndex={0}
- has aria-label

// Accessibility
- <th> elements have scope="col"
- table has accessible name via caption or aria-label

// axe
- axe: basic table with caption
- axe: table with aria-label
- axe: stickyHeader={true}
- axe: striped={true}
- axe: selected row
- axe: disabled row
- axe: sortable headers with all three sortDirection values
- axe: sticky column
- axe: numeric cells
- axe: table with TableFoot
- axe: all density variants
- axe: inside TableScrollWrapper
```

---

## Stories — `Table.stories.tsx`

Title: `Core Components/Table`

All stories must wrap in `TableScrollWrapper` and provide either `caption` prop or `aria-label`.

Named exports required:

- `Default` — 5 columns, 6 rows of employee data (Name, Role, Department, Status, Joined). Uses `Badge` for status cell. `caption="Employee directory"`.
- `Densities` — three side-by-side tables (compact / default / comfortable) with the same 3-row dataset.
- `Striped` — `striped={true}`, 8 rows to show alternation clearly.
- `Bordered` — `bordered={true}`, clear cell borders.
- `StickyHeader` — `stickyHeader={true}` inside a `TableScrollWrapper` with fixed height (`style={{ maxHeight: '300px', overflowY: 'auto' }}`). 20 rows to demonstrate sticky behaviour.
- `StickyColumn` — first column `TableHeader` and `TableCell` have `sticky={true}`. Wide enough table to require horizontal scroll. 6 columns, 6 rows.
- `SortableHeaders` — all headers have `sortable={true}`. First column `sortDirection="asc"`, second `sortDirection="desc"`, rest `sortDirection="none"`. Note: sorting is visual only — no JS logic.
- `NumericCells` — financial data table: Asset, Price, Change, Volume, Market Cap. All numeric columns use `numeric={true}`. Footer row with totals.
- `SelectedRows` — two rows with `selected={true}`.
- `DisabledRows` — one row with `disabled={true}`.
- `WithRichCellContent` — cells contain `Badge`, `StatusIndicator`, `Avatar`, inline `Button`. Demonstrates that Table is a layout-only primitive compatible with other DDS components.
- `Responsive` — 10 columns, 8 rows, inside `TableScrollWrapper`. Resize the Storybook canvas to demonstrate horizontal scrolling.

Use `autodocs`. Storybook group: `Core Components/Table`.

---

## Definition of done

- [ ] Z-index tokens added to `packages/tokens/src/tokens.css` before SCSS is written
- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] `<th>` always has `scope="col"` — verified in tests
- [ ] `aria-sort` set correctly from `sortDirection` — verified in tests
- [ ] Sort icons are `aria-hidden="true"` — verified in tests
- [ ] `TableScrollWrapper` has `role="region"` + `tabIndex={0}` + `aria-label` — verified
- [ ] Sticky header covers body content on scroll (correct `z-index` + `background-color`)
- [ ] Sticky column shadow (`::after` pseudo-element) renders to indicate overflow
- [ ] Numeric cells use `font-variant-numeric: tabular-nums` and `font-family: var(--dds-font-mono)`
- [ ] `border-radius: var(--dds-radius-none)` — no exceptions
- [ ] No Tailwind. No hardcoded color, spacing, or font values in SCSS.
- [ ] Exported from `packages/components/src/index.ts`

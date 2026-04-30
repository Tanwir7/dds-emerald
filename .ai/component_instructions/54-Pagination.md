# Pagination · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Pagination` component.
- Scaffold: `packages/components/src/components/Pagination/`
- Radix primitive: none

---

## Purpose

`Pagination` provides controls for navigating paginated content: previous/next buttons, page number buttons, ellipsis for collapsed ranges, and an optional page size selector. It is a controlled component — the consumer owns `currentPage` and `totalPages` state.

---

## Exports from `index.ts`

```ts
export { Pagination };
export type { PaginationProps };
```

---

## Props

```ts
interface PaginationProps {
  currentPage: number; // 1-based, required
  totalPages: number; // required
  onPageChange: (page: number) => void; // required

  siblingCount?: number; // default: 1 — pages shown on each side of current
  boundaryCount?: number; // default: 1 — pages shown at start and end
  showFirstLast?: boolean; // default: true — show « first and » last buttons
  showPrevNext?: boolean; // default: true — show ‹ prev and › next buttons
  showPageSize?: boolean; // default: false — show "Items per page" select
  pageSize?: number; // current page size (required when showPageSize=true)
  pageSizeOptions?: number[]; // default: [10, 25, 50, 100]
  onPageSizeChange?: (size: number) => void; // required when showPageSize=true
  size?: 'sm' | 'md'; // default: 'md'
  disabled?: boolean; // default: false — disables all controls
  className?: string;
  // aria-label for the nav element — default: "Pagination"
  'aria-label'?: string;
}
```

---

## Page range algorithm

Compute the visible page numbers using `useMemo`:

```tsx
const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const pageRange = React.useMemo(() => {
  const totalPageCount = totalPages;
  // Total slots = siblingCount * 2 + 3 (current + 2 boundaries) + 2 (ellipsis slots)
  const totalDisplayed = siblingCount * 2 + 3 + boundaryCount * 2;

  if (totalDisplayed >= totalPageCount) {
    return range(1, totalPageCount);
  }

  const leftSiblingIdx = Math.max(currentPage - siblingCount, boundaryCount + 1);
  const rightSiblingIdx = Math.min(currentPage + siblingCount, totalPageCount - boundaryCount);

  const showLeftDots = leftSiblingIdx > boundaryCount + 2;
  const showRightDots = rightSiblingIdx < totalPageCount - boundaryCount - 1;

  const leftBoundary = range(1, boundaryCount);
  const rightBoundary = range(totalPageCount - boundaryCount + 1, totalPageCount);
  const middle = range(leftSiblingIdx, rightSiblingIdx);

  if (!showLeftDots && showRightDots) {
    return [...range(1, 3 + siblingCount * 2), 'ellipsis-right', ...rightBoundary];
  }
  if (showLeftDots && !showRightDots) {
    return [
      ...leftBoundary,
      'ellipsis-left',
      ...range(totalPageCount - (3 + siblingCount * 2) + 1, totalPageCount),
    ];
  }
  return [...leftBoundary, 'ellipsis-left', ...middle, 'ellipsis-right', ...rightBoundary];
}, [currentPage, totalPages, siblingCount, boundaryCount]);
```

---

## Structure

```tsx
<nav
  ref={ref}
  aria-label={ariaLabel ?? 'Pagination'}
  className={clsx(styles.root, styles[size], disabled && styles.disabled, className)}
>
  <div className={styles.controls}>
    {/* First page button */}
    {showFirstLast && (
      <button
        type="button"
        className={clsx(styles.btn, styles.navBtn)}
        onClick={() => onPageChange(1)}
        disabled={disabled || currentPage === 1}
        aria-label="First page"
      >
        <FirstIcon aria-hidden="true" />
      </button>
    )}

    {/* Previous page button */}
    {showPrevNext && (
      <button
        type="button"
        className={clsx(styles.btn, styles.navBtn)}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeftIcon aria-hidden="true" />
      </button>
    )}

    {/* Page number buttons */}
    {pageRange.map((item, idx) =>
      typeof item === 'string' ? (
        <span key={item} className={styles.ellipsis} aria-hidden="true">
          …
        </span>
      ) : (
        <button
          key={item}
          type="button"
          className={clsx(styles.btn, styles.pageBtn, item === currentPage && styles.current)}
          onClick={() => onPageChange(item)}
          disabled={disabled}
          aria-label={`Page ${item}`}
          aria-current={item === currentPage ? 'page' : undefined}
        >
          {item}
        </button>
      )
    )}

    {/* Next page button */}
    {showPrevNext && (
      <button
        type="button"
        className={clsx(styles.btn, styles.navBtn)}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRightIcon aria-hidden="true" />
      </button>
    )}

    {/* Last page button */}
    {showFirstLast && (
      <button
        type="button"
        className={clsx(styles.btn, styles.navBtn)}
        onClick={() => onPageChange(totalPages)}
        disabled={disabled || currentPage === totalPages}
        aria-label="Last page"
      >
        <LastIcon aria-hidden="true" />
      </button>
    )}
  </div>

  {/* Page size selector */}
  {showPageSize && (
    <div className={styles.pageSizeRow}>
      <label htmlFor={pageSizeId} className={styles.pageSizeLabel}>
        Items per page
      </label>
      <select
        id={pageSizeId}
        className={styles.pageSizeSelect}
        value={pageSize}
        onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
        disabled={disabled}
      >
        {(pageSizeOptions ?? [10, 25, 50, 100]).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )}
</nav>
```

Icons — embed minimal inline SVGs (first ‹‹, prev ‹, next ›, last ›› arrows):

```tsx
const FirstIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    width="14"
    height="14"
  >
    <path d="M11 4L7 8l4 4M5 4v8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
// ChevronLeft, ChevronRight, LastIcon — mirror pattern
```

---

## Styles — `Pagination.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: flex`
- `align-items: center`
- `gap: var(--dds-space-4)`
- `flex-wrap: wrap`

`.disabled`:

- `opacity: 0.5; pointer-events: none`

`.controls`:

- `display: flex`
- `align-items: center`
- `gap: var(--dds-space-1)`

`.btn`:

- `display: inline-flex; align-items: center; justify-content: center`
- `font-family: var(--dds-font-sans)`
- `font-weight: var(--dds-font-weight-normal)`
- `color: var(--dds-color-text-default)`
- `background-color: transparent`
- `border: 1px solid transparent`
- `cursor: pointer`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent`
- `outline-offset: 2px`
- `transition: background-color, border-color, color var(--dds-duration-fast) var(--dds-ease-standard)`
- `&:hover:not(:disabled)` → `background-color: var(--dds-color-action-ghost-hover)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`
- `&:disabled` → `opacity: 0.4; cursor: not-allowed`

Size modifiers:

- `.sm .btn` → `height: 28px; min-width: 28px; font-size: var(--dds-font-size-xs); padding: 0 var(--dds-space-1-5)`
- `.md .btn` → `height: 32px; min-width: 32px; font-size: var(--dds-font-size-sm); padding: 0 var(--dds-space-2)`

`.navBtn`:

- `color: var(--dds-color-text-muted)`
- `border-color: var(--dds-color-border-default)`
- `&:hover:not(:disabled)` → `border-color: var(--dds-color-action-primary); color: var(--dds-color-action-primary)`

`.pageBtn`:

- `border-color: var(--dds-color-border-default)`
- `font-variant-numeric: tabular-nums`

`.current`:

- `background-color: var(--dds-color-action-primary)`
- `color: var(--dds-color-action-primary-foreground)`
- `border-color: var(--dds-color-action-primary)`
- `font-weight: var(--dds-font-weight-medium)`
- `cursor: default`
- `&:hover` → no hover change (stays filled)

`.ellipsis`:

- `display: inline-flex; align-items: center; justify-content: center`
- `font-size: var(--dds-font-size-sm)` (md) / `var(--dds-font-size-xs)` (sm)
- `color: var(--dds-color-text-muted)`
- `min-width: 32px` (md) / `28px` (sm)
- `user-select: none`

### Page size selector

`.pageSizeRow`:

- `display: flex; align-items: center; gap: var(--dds-space-2)`

`.pageSizeLabel`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `color: var(--dds-color-text-muted)`
- `white-space: nowrap`

`.pageSizeSelect`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)` (md) / `var(--dds-font-size-xs)` (sm)
- `color: var(--dds-color-text-default)`
- `background-color: var(--dds-color-bg-input)`
- `border: 1px solid var(--dds-color-border-input)`
- `border-radius: var(--dds-radius-none)`
- `padding: var(--dds-space-1) var(--dds-space-2)`
- `cursor: pointer`
- `outline: 3px solid transparent; outline-offset: 2px`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on all buttons and select — no exceptions.
- `aria-current="page"` on the active page button — standard for pagination.
- Prev/First buttons are `disabled` when `currentPage === 1`.
- Next/Last buttons are `disabled` when `currentPage === totalPages`.
- Ellipsis items are `aria-hidden="true"` — they are visual decoration.
- Page buttons have `aria-label="Page N"` — distinguishes them from each other for screen readers.
- Current page button still renders as a `<button>` (not a `<span>`) — it is `aria-current="page"` but remains in the tab order to give context during keyboard navigation.

---

## Accessibility

- `<nav aria-label="Pagination">` — navigation landmark.
- Prev/Next/First/Last: descriptive `aria-label` on each button.
- Page buttons: `aria-label="Page N"`, `aria-current="page"` on current.
- Disabled prev/first/next/last: native `disabled` attribute removes from tab order.
- Ellipsis: `aria-hidden="true"`.
- Page size: `<label htmlFor>` associated with `<select>` — native form association.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a <nav> element
- nav has aria-label="Pagination" by default
- nav has custom aria-label when provided
- forwards className to nav
- forwards ref to nav HTMLElement

// Page buttons
- renders correct page number buttons for small totalPages (no ellipsis)
- current page button has aria-current="page"
- current page button has .current class
- non-current page buttons do NOT have aria-current
- each page button has aria-label="Page N"
- clicking page button calls onPageChange with that page number
- current page button is still rendered as <button>

// Prev / Next
- prev button rendered by default (showPrevNext=true)
- next button rendered by default
- prev button has aria-label="Previous page"
- next button has aria-label="Next page"
- prev button is disabled when currentPage=1
- next button is disabled when currentPage=totalPages
- clicking prev calls onPageChange(currentPage - 1)
- clicking next calls onPageChange(currentPage + 1)
- showPrevNext=false hides prev/next buttons

// First / Last
- first button rendered by default (showFirstLast=true)
- last button rendered by default
- first button has aria-label="First page"
- last button has aria-label="Last page"
- first button is disabled when currentPage=1
- last button is disabled when currentPage=totalPages
- clicking first calls onPageChange(1)
- clicking last calls onPageChange(totalPages)
- showFirstLast=false hides first/last buttons

// Ellipsis
- ellipsis rendered when totalPages > visible range
- ellipsis has aria-hidden="true"
- no ellipsis when all pages fit in range
- left ellipsis shown when currentPage is near the end
- right ellipsis shown when currentPage is near the start
- boundary pages always shown

// Page size selector
- page size selector NOT rendered by default
- page size selector rendered when showPageSize=true
- selector has label "Items per page"
- label and select are associated via htmlFor/id
- selector shows correct pageSize as selected option
- selector options match pageSizeOptions
- changing selector calls onPageSizeChange with numeric value

// Sizes
- applies .md class by default
- applies .sm class when size="sm"

// Disabled
- applies .disabled class when disabled={true}
- all buttons are not clickable when disabled

// axe
- axe: passes for basic 5-page pagination
- axe: passes with ellipsis
- axe: passes for currentPage=1 (prev/first disabled)
- axe: passes for currentPage=totalPages (next/last disabled)
- axe: passes with showPageSize=true
- axe: passes for size="sm"
```

---

## Stories — `Pagination.stories.tsx`

Named exports required:

- `Default` — currentPage=3, totalPages=10
- `FewPages` — totalPages=4, no ellipsis
- `ManyPages` — totalPages=50, currentPage=25, ellipsis both sides
- `FirstPage` — currentPage=1, prev/first disabled
- `LastPage` — currentPage=totalPages, next/last disabled
- `WithPageSize` — showPageSize=true, 10/25/50 options
- `NoPrevNext` — showPrevNext=false
- `NoFirstLast` — showFirstLast=false
- `Sizes` — sm and md stacked
- `Disabled`
- `Controlled` — useState for currentPage, showing "Page N of M" label

`NavigatePages` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const nextBtn = within(canvasElement).getByRole('button', { name: /next page/i });
  await userEvent.click(nextBtn);
  await expect(within(canvasElement).getByRole('button', { name: /page 4/i })).toHaveAttribute(
    'aria-current',
    'page'
  );
};
```

`KeyboardNavigation` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const page3 = within(canvasElement).getByRole('button', { name: /page 3/i });
  await userEvent.tab();
  // Tab through controls to reach a page button
  await userEvent.click(page3);
  await expect(page3).toHaveAttribute('aria-current', 'page');
};
```

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants and states
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] Ellipsis algorithm verified: boundary pages always visible, no duplicates
- [ ] `aria-current="page"` on current page button
- [ ] Disabled prev/first when on page 1, disabled next/last when on last page
- [ ] `border-radius: var(--dds-radius-none)` on all controls
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

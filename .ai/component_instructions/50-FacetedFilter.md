# FacetedFilter + FacetItem · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `FacetedFilter`, `FacetGroup`, and `FacetItem` components.
- Scaffold: `packages/components/src/components/FacetedFilter/`
- Radix primitive: `@radix-ui/react-checkbox` (for FacetItem checkbox behaviour)
- Depends on: `Checkbox` atom, `Badge` atom (both must be built first)

---

## Purpose

`FacetedFilter` is a compound filter UI for narrowing a result set by multiple dimensions simultaneously. It renders one or more named `FacetGroup` sections (e.g. "Status", "Assignee", "Label"), each containing a list of `FacetItem` options. Each `FacetItem` is a checkbox row: label + optional count badge + selected state.

Typical use: sidebar filters on a list/table page, search result refinement, data grid column filtering.

**Components in this scaffold:**

- `FacetedFilter` — outer container, manages all selected values across groups
- `FacetGroup` — a named section of related filter options (collapsible)
- `FacetItem` — a single filter option: checkbox + label + count

---

## Exports from `index.ts`

```ts
export { FacetedFilter, FacetGroup, FacetItem };
export type {
  FacetedFilterProps,
  FacetGroupProps,
  FacetItemProps,
  FacetedFilterValue,
  FacetedFilterState,
};
```

---

## Types

```ts
export interface FacetedFilterValue {
  group: string; // group key
  value: string; // item value
}

export interface FacetedFilterState {
  [groupKey: string]: string[]; // map of group key → selected values
}

export interface FacetedFilterProps {
  value?: FacetedFilterState; // controlled
  defaultValue?: FacetedFilterState; // uncontrolled, default: {}
  onChange?: (state: FacetedFilterState) => void;
  onClearAll?: () => void;
  showClearAll?: boolean; // default: true — renders "Clear all" button when any item selected
  className?: string;
  children: React.ReactNode; // FacetGroup elements
}

export interface FacetGroupProps {
  groupKey: string; // unique key — must be unique within FacetedFilter
  label: string; // group heading text
  collapsible?: boolean; // default: true — wraps in Disclosure
  defaultOpen?: boolean; // default: true — open by default
  searchable?: boolean; // default: false — shows a filter input above the items
  maxVisible?: number; // default: undefined — shows "Show N more" button when set
  className?: string;
  children: React.ReactNode; // FacetItem elements
}

export interface FacetItemProps {
  value: string; // unique value within the group
  count?: number; // optional result count
  disabled?: boolean; // default: false
  className?: string;
  children: React.ReactNode; // label text
}
```

---

## Architecture

### State management

`FacetedFilter` owns the selection state as a `FacetedFilterState` object (group key → string[]). It passes a selection handler and the current group selections to each `FacetGroup` via context.

```tsx
const FacetedFilterContext = React.createContext<{
  getGroupSelected: (groupKey: string) => string[];
  toggleItem: (groupKey: string, value: string) => void;
  clearGroup: (groupKey: string) => void;
}>({
  getGroupSelected: () => [],
  toggleItem: () => {},
  clearGroup: () => {},
});
```

```tsx
const FacetGroupContext = React.createContext<{
  groupKey: string;
  selected: string[];
}>({ groupKey: '', selected: [] });
```

`FacetItem` reads both contexts to determine its checked state and call `toggleItem`.

### Toggle logic

```tsx
const toggleItem = (groupKey: string, value: string) => {
  const next = { ...currentState };
  const groupSelected = next[groupKey] ?? [];
  if (groupSelected.includes(value)) {
    next[groupKey] = groupSelected.filter((v) => v !== value);
  } else {
    next[groupKey] = [...groupSelected, value];
  }
  if (!isControlled) setInternalState(next);
  onChange?.(next);
};
```

---

## Structure

### FacetedFilter

```tsx
<div className={clsx(styles.root, className)} ref={ref}>
  {showClearAll && hasAnySelected && (
    <div className={styles.header}>
      <button type="button" className={styles.clearAllBtn} onClick={handleClearAll}>
        Clear all filters
      </button>
    </div>
  )}
  <FacetedFilterContext.Provider value={contextValue}>{children}</FacetedFilterContext.Provider>
</div>
```

### FacetGroup

```tsx
// FacetGroup with collapsible=true wraps in Disclosure
<div className={clsx(styles.group, className)}>
  <Disclosure defaultOpen={defaultOpen}>
    <DisclosureTrigger className={styles.groupTrigger} showChevron size="sm">
      <span className={styles.groupLabel}>{label}</span>
      {selectedCount > 0 && (
        <Badge variant="accent" size="sm">
          {selectedCount}
        </Badge>
      )}
    </DisclosureTrigger>
    <DisclosureContent>
      <FacetGroupContext.Provider value={{ groupKey, selected }}>
        {searchable && (
          <div className={styles.groupSearch}>
            <input
              type="text"
              placeholder={`Filter ${label.toLowerCase()}…`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.groupSearchInput}
              aria-label={`Filter ${label} options`}
            />
          </div>
        )}
        <ul className={styles.itemList} role="group" aria-label={label}>
          {visibleItems}
        </ul>
        {maxVisible && hiddenCount > 0 && (
          <button
            type="button"
            className={styles.showMoreBtn}
            onClick={() => setShowAll((s) => !s)}
          >
            {showAll ? 'Show less' : `Show ${hiddenCount} more`}
          </button>
        )}
      </FacetGroupContext.Provider>
    </DisclosureContent>
  </Disclosure>
</div>
```

### FacetItem

```tsx
<li className={clsx(styles.item, disabled && styles.itemDisabled, className)}>
  <label className={styles.label}>
    <Checkbox
      id={checkboxId}
      checked={isChecked}
      onCheckedChange={() => toggleItem(groupKey, value)}
      disabled={disabled}
      size="sm"
      className={styles.checkbox}
    />
    <span className={styles.itemLabel}>{children}</span>
    {count !== undefined && (
      <span className={styles.count} aria-label={`${count} results`}>
        {count.toLocaleString()}
      </span>
    )}
  </label>
</li>
```

`FacetItem` uses a `<label>` wrapping the `<Checkbox>` so the entire row is clickable. The `<Checkbox>` handles `role="checkbox"` and `aria-checked`. The `<label>` must NOT have its own `htmlFor` — the Checkbox id is used internally.

---

## Styles — `FacetedFilter.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

### FacetedFilter root

`.root`:

- `display: flex; flex-direction: column`
- `gap: 0`
- `width: 100%`

`.header`:

- `display: flex; justify-content: flex-end`
- `padding: 0 0 var(--dds-space-2) 0`
- `border-bottom: 1px solid var(--dds-color-border-default)`
- `margin-bottom: var(--dds-space-1)`

`.clearAllBtn`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `font-weight: var(--dds-font-weight-medium)`
- `color: var(--dds-color-action-primary)`
- `background: transparent; border: none; cursor: pointer`
- `padding: 0`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent; outline-offset: 2px`
- `&:hover` → `color: var(--dds-color-action-primary-hover); text-decoration: underline`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`

### FacetGroup

`.group`:

- `border-bottom: 1px solid var(--dds-color-border-default)`
- `&:last-child` → `border-bottom: none`

`.groupTrigger` (extends DisclosureTrigger):

- `width: 100%`
- `justify-content: space-between`
- `padding: var(--dds-space-2-5) 0`
- `font-size: var(--dds-font-size-sm)`
- `font-weight: var(--dds-font-weight-semibold)`
- `color: var(--dds-color-text-default)`

`.groupLabel`:

- `flex: 1; text-align: left`

`.groupSearch`:

- `padding: var(--dds-space-1-5) 0`

`.groupSearchInput`:

- `width: 100%`
- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `padding: var(--dds-space-1) var(--dds-space-2)`
- `border: 1px solid var(--dds-color-border-input)`
- `background-color: var(--dds-color-bg-input)`
- `color: var(--dds-color-text-default)`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent; outline-offset: 2px`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`
- `&::placeholder` → `color: var(--dds-color-text-muted)`

`.itemList`:

- `list-style: none; margin: 0; padding: 0`
- `display: flex; flex-direction: column`
- `gap: 0`
- `padding-bottom: var(--dds-space-2)`

`.showMoreBtn`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `color: var(--dds-color-text-muted)`
- `background: transparent; border: none; cursor: pointer`
- `padding: var(--dds-space-1) 0`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent; outline-offset: 2px`
- `&:hover` → `color: var(--dds-color-text-default)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`

### FacetItem

`.item`:

- `display: block`

`.label`:

- `display: flex; align-items: center; gap: var(--dds-space-2)`
- `padding: var(--dds-space-1) 0`
- `cursor: pointer`
- `border-radius: var(--dds-radius-none)`
- `&:hover .itemLabel` → `color: var(--dds-color-text-default)`

`.itemDisabled .label`:

- `opacity: 0.5; cursor: not-allowed; pointer-events: none`

`.checkbox` (size override):

- `flex-shrink: 0`

`.itemLabel`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)`
- `color: var(--dds-color-text-default)`
- `flex: 1; min-width: 0`
- `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`

`.count`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `color: var(--dds-color-text-muted)`
- `margin-left: auto; flex-shrink: 0`
- `font-variant-numeric: tabular-nums`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on all buttons, search input, items.
- `FacetItem` uses a `<label>` wrapping the `<Checkbox>` for the full-row click target — do NOT add a separate `onClick` to the `<li>`.
- `FacetGroup` with `collapsible={false}` renders the heading and items without a `Disclosure` wrapper.
- The selected item count badge on the `FacetGroup` trigger shows how many items in that group are active — this updates reactively via context.
- `clearGroup` is available in context but `FacetGroup` does not render a per-group clear button unless explicitly requested — the current design shows only the top-level "Clear all" button.
- `searchable={true}` filters are client-side within the visible items list — they do NOT call `onInputChange` (this is not an async search).
- `maxVisible` hides items beyond the limit behind a "Show N more" toggle — the hidden items still participate in selection state.

---

## Accessibility

- `FacetedFilter` root: no role — it's a landmark-neutral container.
- `FacetGroup` item list: `role="group"` with `aria-label={label}` — groups related checkboxes.
- `FacetItem`: each `<Checkbox>` has `role="checkbox"` + `aria-checked` via the Checkbox atom.
- The `<label>` wrapping the checkbox provides the accessible name — no extra `aria-label` needed.
- Count `<span>` has `aria-label="N results"` for screen reader context.
- `DisclosureTrigger` in the group heading has `aria-expanded` via the Disclosure atom.
- `clearAllBtn` is a plain `<button>` — no ARIA role needed.
- `showMoreBtn` button: consider adding `aria-expanded` when toggling show more/less.

---

## TDD — write ALL tests before implementing

```
// FacetedFilter — rendering
- renders root div
- forwards className to root
- forwards ref to HTMLDivElement

// FacetedFilter — clear all
- clear all button NOT rendered when no items selected
- clear all button rendered when at least one item selected
- clear all button NOT rendered when showClearAll={false}
- clicking clear all calls onClearAll
- clicking clear all resets all selected values to []

// FacetGroup — rendering
- renders group with label heading
- renders children FacetItem elements
- group is open by default (defaultOpen=true)
- group can be closed by clicking trigger
- collapsible={false} renders without Disclosure

// FacetGroup — selected count badge
- badge NOT shown when no items selected in group
- badge shows count of selected items in that group

// FacetGroup — searchable
- search input NOT rendered when searchable={false} (default)
- search input rendered when searchable={true}
- typing in search input filters visible items
- items not matching query hidden
- cleared search shows all items again

// FacetGroup — maxVisible
- all items shown when count <= maxVisible
- items beyond maxVisible hidden when maxVisible set
- "Show N more" button shown when hidden items exist
- clicking "Show N more" reveals all items
- button changes to "Show less" when expanded

// FacetItem — rendering
- renders checkbox with role="checkbox"
- renders label text
- count shown when count prop provided
- count NOT shown when count omitted
- count has aria-label="N results"
- disabled FacetItem has opacity and no interaction

// FacetItem — selection
- clicking label toggles checkbox (checks it)
- clicking checked label unchecks it
- calls onChange with updated state on toggle
- checked state reflects controlled value

// Context wiring
- FacetItem checked state reflects parent FacetedFilter state
- toggling FacetItem updates FacetedFilter state for correct group

// Controlled
- controlled value prop respected
- onChange called with full FacetedFilterState on every change

// Keyboard
- Checkbox in FacetItem receives Tab focus
- Space toggles the checkbox
- group trigger receives Tab focus
- Space/Enter toggles group open/closed

// axe
- axe: passes with no items selected
- axe: passes with some items selected
- axe: passes with clear all button visible
- axe: passes with searchable group
- axe: passes with disabled item
- axe: passes with collapsed group
```

---

## Stories — `FacetedFilter.stories.tsx`

Named exports required:

- `Default` — 3 groups (Status, Priority, Assignee), no selection
- `WithSelections` — some items pre-selected, clear all visible
- `WithCounts` — items have count numbers
- `Searchable` — one group with searchable={true}
- `MaxVisible` — one group with maxVisible={4}, 8 items
- `NonCollapsible` — one group collapsible={false}
- `AllGroupsCollapsed` — all groups defaultOpen={false}
- `Controlled` — useState, live selection display beside filter
- `Disabled` — some items disabled
- `SingleGroup` — one FacetGroup standalone
- `InSidebar` — FacetedFilter in a fixed-width sidebar beside a content area

`SelectAndClear` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const checkboxes = within(canvasElement).getAllByRole('checkbox');
  await userEvent.click(checkboxes[0]);
  await expect(checkboxes[0]).toHaveAttribute('aria-checked', 'true');
  const clearBtn = within(canvasElement).getByRole('button', { name: /clear all/i });
  await userEvent.click(clearBtn);
  await expect(checkboxes[0]).toHaveAttribute('aria-checked', 'false');
};
```

`SearchFilter` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const searchInput = within(canvasElement).getByRole('textbox', { name: /filter/i });
  await userEvent.type(searchInput, 'high');
  const items = within(canvasElement).getAllByRole('checkbox');
  // Only items matching "high" remain visible
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
- [ ] Context wiring: toggling FacetItem updates correct group in FacetedFilterState
- [ ] Clear all resets ALL groups to empty arrays
- [ ] `border-radius: var(--dds-radius-none)` on all interactive elements
- [ ] maxVisible hidden items still participate in selection state
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] All 3 components exported from `packages/components/src/index.ts`

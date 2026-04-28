# List + SelectableList · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `List`, `ListItem`, `SelectableList`, and `SelectableListItem` components.
- Scaffold: `packages/components/src/components/List/`
- Radix primitive: none for `List`; none for `SelectableList` (managed keyboard pattern)

---

## Purpose

### `List` — display-only

A styled vertical list of items with consistent spacing, optional leading icon/avatar slot, optional trailing slot, and optional dividers between items. It has no selection state and no keyboard interaction beyond natural tab order of any interactive children.

### `SelectableList` — interactive

A listbox-pattern list where items can be focused and selected. Supports single or multiple selection. Keyboard-navigable. Used for sidebar navigation items, option lists, command results, and any UI where the user picks from a visible set.

---

## Exports from `index.ts`

```ts
export { List, ListItem, SelectableList, SelectableListItem };
export type { ListProps, ListItemProps, SelectableListProps, SelectableListItemProps };
```

---

## PART 1 — List (display-only)

### Props

```ts
// List
interface ListProps {
  as?: 'ul' | 'ol' | 'div'; // default: 'ul'
  size?: 'sm' | 'md' | 'lg'; // default: 'md' — controls item padding and font size
  dividers?: boolean; // default: false — renders separator between items
  flush?: boolean; // default: false — removes horizontal padding (for edge-to-edge)
  className?: string;
  children: React.ReactNode;
}

// ListItem
interface ListItemProps {
  as?: 'li' | 'div'; // default: 'li'
  startSlot?: React.ReactNode; // icon, avatar, or any element on the left
  endSlot?: React.ReactNode; // badge, text, icon button on the right
  description?: string; // secondary line below the main content
  selected?: boolean; // default: false — visual selected state (no ARIA, display only)
  disabled?: boolean; // default: false
  className?: string;
  children: React.ReactNode; // primary label content
  onClick?: React.MouseEventHandler<HTMLElement>;
}
```

Forward `ref` on `List` to its root element type. Forward `ref` on `ListItem` typed to `HTMLLIElement`.

### List structure

```tsx
<Tag // 'ul' | 'ol' | 'div'
  ref={ref}
  className={clsx(
    styles.list,
    styles[size],
    dividers && styles.dividers,
    flush && styles.flush,
    className
  )}
>
  {children}
</Tag>
```

### ListItem structure

```tsx
<Tag // 'li' | 'div'
  ref={ref}
  className={clsx(
    styles.item,
    styles[size], // inherited from List context via CSS
    selected && styles.selected,
    disabled && styles.itemDisabled,
    onClick && styles.clickable,
    flush && styles.flush,
    className
  )}
  onClick={!disabled ? onClick : undefined}
  aria-disabled={disabled ? true : undefined}
>
  {startSlot && <span className={styles.startSlot}>{startSlot}</span>}

  <span className={styles.content}>
    <span className={styles.label}>{children}</span>
    {description && <span className={styles.description}>{description}</span>}
  </span>

  {endSlot && <span className={styles.endSlot}>{endSlot}</span>}
</Tag>
```

**Note:** `List` passes `size`, `dividers`, and `flush` context to `ListItem` via React Context to avoid prop drilling. `ListItem` reads from context; explicit props on `ListItem` override context values.

### List styles — `List.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.list`:

- `list-style: none`
- `margin: 0; padding: 0`
- `width: 100%`

`.dividers .item`:

- `border-bottom: 1px solid var(--dds-color-border-default)`
- `&:last-child` → `border-bottom: none`

`.item`:

- `display: flex`
- `align-items: center`
- `gap: var(--dds-space-3)`
- `padding: var(--dds-space-2) var(--dds-space-3)`
- `background-color: transparent`
- `transition: background-color var(--dds-duration-fast) var(--dds-ease-standard)`

Size modifiers (on `.list` — propagated to `.item` via descendant selector):

- `.sm .item` → `padding: var(--dds-space-1-5) var(--dds-space-2); font-size: var(--dds-font-size-xs)`
- `.md .item` → `padding: var(--dds-space-2) var(--dds-space-3); font-size: var(--dds-font-size-sm)` (default)
- `.lg .item` → `padding: var(--dds-space-3) var(--dds-space-4); font-size: var(--dds-font-size-base)`

`.flush .item` → `padding-left: 0; padding-right: 0`

`.clickable`:

- `cursor: pointer`
- `&:hover:not(.itemDisabled)` → `background-color: var(--dds-color-action-ghost-hover)`

`.selected`:

- `background-color: var(--dds-color-accent)`
- `color: var(--dds-color-accent-foreground)`

`.itemDisabled`:

- `opacity: 0.5; cursor: not-allowed; pointer-events: none`

`.startSlot`:

- `flex-shrink: 0`
- `display: flex; align-items: center`
- `color: var(--dds-color-text-muted)`

`.endSlot`:

- `flex-shrink: 0; margin-left: auto`
- `display: flex; align-items: center`

`.content`:

- `display: flex; flex-direction: column; gap: var(--dds-space-0-5)`
- `flex: 1; min-width: 0`

`.label`:

- `font-family: var(--dds-font-sans)`
- `font-weight: var(--dds-font-weight-normal)`
- `color: var(--dds-color-text-default)`
- `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`
- `.selected &` → `font-weight: var(--dds-font-weight-medium)`

`.description`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `color: var(--dds-color-text-muted)`
- `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`

No hardcoded values. No Tailwind. No inline styles.

---

## PART 2 — SelectableList (interactive listbox)

### Props

```ts
// SelectableList
interface SelectableListProps {
  selectionMode?: 'single' | 'multiple'   // default: 'single'
  value?: string | string[]               // controlled selected value(s)
  defaultValue?: string | string[]        // uncontrolled
  onChange?: (value: string | string[]) => void
  size?: 'sm' | 'md' | 'lg'             // default: 'md'
  dividers?: boolean                      // default: false
  flush?: boolean                         // default: false
  orientation?: 'vertical' | 'horizontal' // default: 'vertical'
  aria-label?: string                     // required for accessibility
  aria-labelledby?: string
  className?: string
  children: React.ReactNode
}

// SelectableListItem
interface SelectableListItemProps {
  value: string                           // required — unique key and selected value
  startSlot?: React.ReactNode
  endSlot?: React.ReactNode
  description?: string
  disabled?: boolean                      // default: false
  className?: string
  children: React.ReactNode
}
```

Forward `ref` on `SelectableList` to `HTMLUListElement`. Forward `ref` on `SelectableListItem` to `HTMLLIElement`.

### SelectableList architecture

`SelectableList` renders a `<ul role="listbox">`. It manages:

- Selected value(s) state
- Roving tabindex across items
- Arrow key navigation
- Selection via Enter/Space

It passes selected values and a selection handler to `SelectableListItem` via React Context.

```tsx
const SelectableListContext = React.createContext<{
  selectedValues: string[]
  selectionMode: 'single' | 'multiple'
  onSelect: (value: string) => void
  size: 'sm' | 'md' | 'lg'
  dividers: boolean
  flush: boolean
  activeValue: string | null
  itemRefs: React.MutableRefObject<Map<string, HTMLLIElement>>
}>({ ... });
```

### SelectableList structure

```tsx
<ul
  ref={ref}
  role="listbox"
  aria-multiselectable={selectionMode === 'multiple'}
  aria-orientation={orientation}
  aria-label={ariaLabel}
  aria-labelledby={ariaLabelledBy}
  className={clsx(
    styles.list,
    styles[size],
    dividers && styles.dividers,
    flush && styles.flush,
    styles[orientation],
    className
  )}
  onKeyDown={handleKeyDown}
>
  <SelectableListContext.Provider value={contextValue}>{children}</SelectableListContext.Provider>
</ul>
```

### SelectableListItem structure

```tsx
<li
  ref={(el) => {
    if (el) itemRefs.current.set(value, el);
  }}
  role="option"
  aria-selected={isSelected}
  aria-disabled={disabled}
  tabIndex={isActive ? 0 : -1} // roving tabindex
  className={clsx(
    styles.item,
    isSelected && styles.selected,
    disabled && styles.itemDisabled,
    isActive && styles.active,
    className
  )}
  onClick={() => !disabled && onSelect(value)}
  onFocus={() => setActiveValue(value)}
>
  {startSlot && <span className={styles.startSlot}>{startSlot}</span>}
  <span className={styles.content}>
    <span className={styles.label}>{children}</span>
    {description && <span className={styles.description}>{description}</span>}
  </span>
  {endSlot && <span className={styles.endSlot}>{endSlot}</span>}
</li>
```

### Keyboard navigation

```tsx
const handleKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
  const values = getEnabledItemValues(); // ordered list of non-disabled item values
  const currentIdx = values.indexOf(activeValue ?? '');

  switch (e.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      e.preventDefault();
      const next = values[Math.min(currentIdx + 1, values.length - 1)];
      setActiveValue(next);
      itemRefs.current.get(next)?.focus();
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      e.preventDefault();
      const prev = values[Math.max(currentIdx - 1, 0)];
      setActiveValue(prev);
      itemRefs.current.get(prev)?.focus();
      break;
    case 'Home':
      e.preventDefault();
      setActiveValue(values[0]);
      itemRefs.current.get(values[0])?.focus();
      break;
    case 'End':
      e.preventDefault();
      setActiveValue(values[values.length - 1]);
      itemRefs.current.get(values[values.length - 1])?.focus();
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      if (activeValue) onSelect(activeValue);
      break;
  }
};
```

### SelectableList — additional SCSS

`.active` (focused item, not yet selected):

- `outline: 3px solid transparent`
- `outline-offset: -3px`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`

`.horizontal`:

- `display: flex; flex-direction: row; flex-wrap: wrap`
- `.item` → `flex-shrink: 0`
- `.dividers .item` → `border-bottom: none; border-right: 1px solid var(--dds-color-border-default); &:last-child` → `border-right: none`

Multiple selection — `.selected` in multiple mode:

```scss
.multipleSelected {
  background-color: var(--dds-color-accent);
  color: var(--dds-color-accent-foreground);
  // Checkmark via endSlot — not via CSS pseudo-element
}
```

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on all items.
- `List` is purely display — NO `role`, NO keyboard handling, NO selection ARIA. Clickable items in `List` are the consumer's responsibility.
- `SelectableList` MUST have `aria-label` OR `aria-labelledby` — enforce with a dev-mode warning.
- Roving tabindex: only one item has `tabIndex={0}` at a time in `SelectableList`.
- `SelectableListItem` uses `itemRefs` map (not array) keyed by `value` — allows stable ref lookup regardless of item order.
- Multiple selection in `SelectableList`: Ctrl+Click or Shift+Click is NOT implemented in this version — toggle via Enter/Space only. Document this limitation.

---

## Accessibility

**List:**

- `<ul>` / `<ol>` carry implicit list semantics.
- Clickable `ListItem` should have `onClick` — no ARIA role added automatically. If items are buttons, consumer should use `as="div"` and add their own `<button>` child.
- `disabled` on `ListItem` — `aria-disabled="true"` is set, `onClick` is suppressed.

**SelectableList:**

- `role="listbox"`, `aria-multiselectable` (multiple mode), `aria-orientation`.
- Each `SelectableListItem`: `role="option"`, `aria-selected`, `aria-disabled`.
- Roving tabindex — only focused item is in tab stop.
- `aria-label` / `aria-labelledby` required on the listbox.
- Focus is on list items (DOM focus), not managed via `aria-activedescendant`.

---

## TDD — write ALL tests before implementing

```
// List — rendering
- renders <ul> by default
- renders <ol> when as="ol"
- renders <div> when as="div"
- renders children
- forwards className to list root
- forwards ref to list root element

// List — sizes
- applies .md class by default
- applies .sm class when size="sm"
- applies .lg class when size="lg"

// List — dividers
- no divider class by default
- applies .dividers class when dividers={true}

// List — flush
- no flush class by default
- applies .flush class when flush={true}

// ListItem — rendering
- renders <li> by default
- renders startSlot when provided
- renders endSlot when provided
- renders description when provided
- renders children as label
- forwards className to item
- forwards ref to li element

// ListItem — states
- applies .selected class when selected={true}
- applies .itemDisabled class when disabled={true}
- applies .clickable class when onClick provided
- does NOT call onClick when disabled
- calls onClick when clicked and not disabled

// Context propagation
- ListItem receives size from List context
- ListItem receives dividers from List context
- explicit ListItem prop overrides List context

// SelectableList — rendering
- renders <ul> with role="listbox"
- has aria-multiselectable="false" in single mode
- has aria-multiselectable="true" in multiple mode
- has aria-orientation="vertical" by default
- has aria-label when provided
- forwards ref to HTMLUListElement

// SelectableListItem — rendering
- renders <li> with role="option"
- has aria-selected="false" when not selected
- has aria-selected="true" when selected
- has aria-disabled="true" when disabled
- first item has tabIndex=0 by default (active)
- non-active items have tabIndex=-1

// Single selection
- clicking item selects it
- clicking different item deselects previous
- calls onChange with new value string

// Multiple selection
- clicking item selects it
- clicking another item adds to selection (not deselect first)
- clicking selected item deselects it
- calls onChange with string[] of all selected values

// Disabled items
- disabled item cannot be selected
- disabled item skipped during keyboard navigation

// Keyboard
- Tab focuses first enabled item
- ArrowDown moves focus to next item
- ArrowUp moves focus to previous item
- ArrowDown at last item stays on last
- ArrowUp at first item stays on first
- Home moves focus to first item
- End moves focus to last item
- Enter selects focused item
- Space selects focused item
- disabled item skipped during arrow navigation

// Horizontal orientation
- applies .horizontal class when orientation="horizontal"
- ArrowRight navigates forward
- ArrowLeft navigates backward

// Controlled
- reflects controlled value prop
- calls onChange when item selected

// axe — List
- axe: passes for ul list
- axe: passes for ol list
- axe: passes with dividers
- axe: passes with startSlot containing icon

// axe — SelectableList
- axe: passes for single mode (vertical)
- axe: passes for multiple mode
- axe: passes for horizontal orientation
- axe: passes with one item selected
- axe: passes with disabled item
- axe: passes with aria-label
```

---

## Stories — `List.stories.tsx`

Named exports required:

- `Default` — ul, 5 plain items
- `Ordered` — as="ol"
- `Sizes` — sm / md / lg stacked
- `WithDividers` — dividers={true}
- `Flush` — flush={true}
- `WithStartSlot` — items with icon avatar on left
- `WithEndSlot` — items with Badge on right
- `WithDescription` — items with secondary description
- `WithBothSlots` — avatar + label + description + badge
- `WithSelected` — one item selected={true} (display)
- `Clickable` — items with onClick handlers
- `Disabled` — one item disabled

## Stories — `SelectableList.stories.tsx`

Named exports required:

- `SingleSelect` — default, 5 items, no pre-selection
- `MultipleSelect` — selectionMode="multiple"
- `WithDefault` — defaultValue pre-selected
- `Horizontal` — orientation="horizontal"
- `Sizes` — sm / md / lg stacked
- `WithDividers`
- `WithStartSlot` — icon on left per item
- `WithEndSlot` — trailing badge/count
- `DisabledItem` — one item disabled
- `Controlled` — useState, shows selected value display

`SelectItem` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const options = within(canvasElement).getAllByRole('option');
  await userEvent.click(options[1]);
  await expect(options[1]).toHaveAttribute('aria-selected', 'true');
  await expect(options[0]).toHaveAttribute('aria-selected', 'false');
};
```

`KeyboardSelect` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const listbox = within(canvasElement).getByRole('listbox');
  await userEvent.tab();
  await userEvent.keyboard('{ArrowDown}');
  await userEvent.keyboard('{Enter}');
  const options = within(canvasElement).getAllByRole('option');
  await expect(options[1]).toHaveAttribute('aria-selected', 'true');
};
```

Use `autodocs` for both.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants and states (both List and SelectableList)
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] Roving tabindex verified — only one item has tabIndex=0 at a time
- [ ] Disabled items skipped during keyboard navigation
- [ ] SelectableList warns in dev if aria-label/labelledby absent
- [ ] `border-radius: var(--dds-radius-none)` on all items
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] All 4 components exported from `packages/components/src/index.ts`

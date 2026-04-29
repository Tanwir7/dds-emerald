# TreeView · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `TreeView`, `TreeItem`, and `TreeItemGroup` components.
- Scaffold: `packages/components/src/components/TreeView/`
- Radix primitive: none — custom implementation with roving tabindex
  (Radix does not ship a tree primitive)

---

## Purpose

`TreeView` is a hierarchical expandable/collapsible tree structure for navigating nested data: file system trees, category hierarchies, nested navigation, JSON object explorers. It follows the WAI-ARIA Tree View pattern with full keyboard support.

---

## Exports from `index.ts`

```ts
export { TreeView, TreeItem, TreeItemGroup };
export type { TreeViewProps, TreeItemProps, TreeItemGroupProps };
```

---

## Props

### `TreeView` (root):

```ts
interface TreeViewProps {
  selectionMode?: 'none' | 'single' | 'multiple'; // default: 'single'
  value?: string | string[]; // controlled selected value(s)
  defaultValue?: string | string[]; // uncontrolled
  onChange?: (value: string | string[]) => void;
  expandedValues?: string[]; // controlled expanded nodes
  defaultExpandedValues?: string[]; // uncontrolled, default: []
  onExpandedChange?: (values: string[]) => void;
  size?: 'sm' | 'md'; // default: 'md'
  className?: string;
  'aria-label'?: string; // required if no aria-labelledby
  'aria-labelledby'?: string;
  children: React.ReactNode; // TreeItem elements
}
```

### `TreeItem` (leaf or branch node):

```ts
interface TreeItemProps {
  value: string; // required — unique identifier within the tree
  label: string; // visible text label
  startIcon?: React.ReactNode; // icon before label (e.g. file/folder icon)
  endSlot?: React.ReactNode; // badge, count, or action on the right
  disabled?: boolean; // default: false
  className?: string;
  children?: React.ReactNode; // if provided, renders as branch node with TreeItemGroup
}
```

### `TreeItemGroup` (branch content):

```ts
interface TreeItemGroupProps {
  className?: string;
  children: React.ReactNode; // nested TreeItem elements
}
```

**Usage pattern — branch node:**

```tsx
<TreeItem value="src" label="src">
  <TreeItemGroup>
    <TreeItem value="components" label="components">
      <TreeItemGroup>
        <TreeItem value="button" label="Button.tsx" />
      </TreeItemGroup>
    </TreeItem>
    <TreeItem value="styles" label="styles.css" />
  </TreeItemGroup>
</TreeItem>
```

---

## Architecture

### Contexts

```tsx
// Root context — shared across all tree nodes
const TreeViewContext = React.createContext<{
  selectionMode: 'none' | 'single' | 'multiple'
  selectedValues: string[]
  expandedValues: string[]
  size: 'sm' | 'md'
  focusedValue: string | null
  allValues: string[]           // flat ordered list of all non-disabled leaf+branch values for roving tabindex
  toggleExpanded: (value: string) => void
  selectItem: (value: string) => void
  setFocused: (value: string | null) => void
  itemRefs: React.MutableRefObject<Map<string, HTMLElement>>
}>({ ... });

// Item context — depth tracking
const TreeItemDepthContext = React.createContext<number>(0);
```

### Flat value registry

`TreeView` collects all item values in render order by walking the children tree. This flat ordered list enables correct up/down arrow navigation:

```tsx
// Use a ref to collect values during render via a registration pattern
const registeredValues = React.useRef<string[]>([]);

// Each TreeItem registers itself on mount:
React.useEffect(() => {
  registeredValues.current = [...registeredValues.current, value];
  return () => {
    registeredValues.current = registeredValues.current.filter((v) => v !== value);
  };
}, [value]);
```

---

## Structure

### TreeView

```tsx
<ul
  ref={ref}
  role="tree"
  aria-label={ariaLabel}
  aria-labelledby={ariaLabelledBy}
  aria-multiselectable={selectionMode === 'multiple'}
  className={clsx(styles.root, styles[size], className)}
  onKeyDown={handleTreeKeyDown}
>
  <TreeViewContext.Provider value={contextValue}>{children}</TreeViewContext.Provider>
</ul>
```

### TreeItem (branch — has children)

```tsx
<li
  ref={(el) => {
    if (el) itemRefs.current.set(value, el);
  }}
  role="treeitem"
  aria-expanded={isExpanded}
  aria-selected={selectionMode !== 'none' ? isSelected : undefined}
  aria-disabled={disabled}
  aria-level={depth + 1}
  tabIndex={isFocused ? 0 : -1}
  className={clsx(
    styles.item,
    styles[size],
    isSelected && styles.selected,
    isFocused && styles.focused,
    disabled && styles.itemDisabled,
    className
  )}
  onClick={!disabled ? handleItemClick : undefined}
  onFocus={() => setFocused(value)}
>
  {/* Item row */}
  <span className={styles.row} style={{ paddingLeft: `calc(${depth} * var(--dds-space-4))` }}>
    {/* Expand/collapse toggle — only for branch nodes */}
    {isBranch ? (
      <span
        className={clsx(styles.toggle, isExpanded && styles.toggleOpen)}
        aria-hidden="true"
        onClick={(e) => {
          e.stopPropagation();
          toggleExpanded(value);
        }}
      >
        <ChevronRightIcon />
      </span>
    ) : (
      <span className={styles.toggleSpacer} aria-hidden="true" />
    )}

    {startIcon && (
      <span className={styles.startIcon} aria-hidden="true">
        {startIcon}
      </span>
    )}

    <span className={styles.label}>{label}</span>

    {endSlot && <span className={styles.endSlot}>{endSlot}</span>}
  </span>

  {/* Branch children */}
  {isBranch && isExpanded && (
    <TreeItemDepthContext.Provider value={depth + 1}>
      <ul role="group" className={styles.group}>
        {children}
      </ul>
    </TreeItemDepthContext.Provider>
  )}
</li>
```

`paddingLeft` as an inline style is a **documented exception** — it is a dynamic layout calculation based on depth level, not a design token override.

### TreeItem (leaf — no children)

Same structure but without the branch toggle and `<ul role="group">`. The toggle area is replaced with `.toggleSpacer` for alignment.

---

## Keyboard navigation

All keyboard handling is on the `<ul role="tree">`:

```tsx
const handleTreeKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
  if (!focusedValue) return;
  const visibleValues = getVisibleValues(); // only non-disabled, currently-visible items
  const currentIdx = visibleValues.indexOf(focusedValue);

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      const next = visibleValues[currentIdx + 1];
      if (next) {
        setFocused(next);
        itemRefs.current.get(next)?.focus();
      }
      break;

    case 'ArrowUp':
      e.preventDefault();
      const prev = visibleValues[currentIdx - 1];
      if (prev) {
        setFocused(prev);
        itemRefs.current.get(prev)?.focus();
      }
      break;

    case 'ArrowRight':
      e.preventDefault();
      if (isBranch(focusedValue) && !isExpanded(focusedValue)) {
        toggleExpanded(focusedValue); // expand collapsed branch
      } else if (isBranch(focusedValue) && isExpanded(focusedValue)) {
        const firstChild = getFirstChild(focusedValue);
        if (firstChild) {
          setFocused(firstChild);
          itemRefs.current.get(firstChild)?.focus();
        }
      }
      // Leaf: ArrowRight does nothing
      break;

    case 'ArrowLeft':
      e.preventDefault();
      if (isBranch(focusedValue) && isExpanded(focusedValue)) {
        toggleExpanded(focusedValue); // collapse expanded branch
      } else {
        const parent = getParent(focusedValue); // move focus to parent node
        if (parent) {
          setFocused(parent);
          itemRefs.current.get(parent)?.focus();
        }
      }
      break;

    case 'Enter':
    case ' ':
      e.preventDefault();
      if (isBranch(focusedValue)) {
        toggleExpanded(focusedValue);
      }
      if (selectionMode !== 'none') {
        selectItem(focusedValue);
      }
      break;

    case 'Home':
      e.preventDefault();
      const first = visibleValues[0];
      if (first) {
        setFocused(first);
        itemRefs.current.get(first)?.focus();
      }
      break;

    case 'End':
      e.preventDefault();
      const last = visibleValues[visibleValues.length - 1];
      if (last) {
        setFocused(last);
        itemRefs.current.get(last)?.focus();
      }
      break;

    case '*':
      e.preventDefault();
      // Expand all siblings of the focused node at the same level
      expandSiblings(focusedValue);
      break;
  }
};
```

---

## Styles — `TreeView.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

### Root

`.root`:

- `list-style: none; margin: 0; padding: 0`
- `width: 100%`
- `outline: none`

### Item

`.item`:

- `list-style: none`
- `outline: none`

`.row`:

- `display: flex`
- `align-items: center`
- `gap: var(--dds-space-1-5)`
- `border-radius: var(--dds-radius-none)`
- `cursor: pointer`
- `user-select: none`
- `transition: background-color var(--dds-duration-fast) var(--dds-ease-standard)`
- `&:hover:not(.itemDisabled > .row)` → `background-color: var(--dds-color-action-ghost-hover)`

Size modifiers on `.row`:

- `.sm .row` → `padding: var(--dds-space-0-5) var(--dds-space-2); min-height: 28px; font-size: var(--dds-font-size-xs)`
- `.md .row` → `padding: var(--dds-space-1) var(--dds-space-2); min-height: 32px; font-size: var(--dds-font-size-sm)`

`.selected > .row`:

- `background-color: var(--dds-color-accent)`
- `color: var(--dds-color-accent-foreground)`

`.focused > .row`:

- `outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5)`
- `outline-offset: -3px`

`.itemDisabled`:

- `opacity: 0.5; pointer-events: none`

### Toggle

`.toggle`:

- `display: inline-flex; align-items: center; justify-content: center`
- `flex-shrink: 0`
- `width: var(--dds-icon-size-sm); height: var(--dds-icon-size-sm)`
- `color: var(--dds-color-text-muted)`
- `transition: transform var(--dds-duration-fast) var(--dds-ease-standard)`

`.toggleOpen`:

- `transform: rotate(90deg)`

`.toggleSpacer`:

- `flex-shrink: 0`
- `width: var(--dds-icon-size-sm)` — same width as toggle for alignment

### Label

`.label`:

- `flex: 1; min-width: 0`
- `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`
- `font-family: var(--dds-font-sans)`
- `font-weight: var(--dds-font-weight-normal)`
- `color: var(--dds-color-text-default)`
- `.selected > .row &` → `font-weight: var(--dds-font-weight-medium)`

### Icons and end slot

`.startIcon`:

- `flex-shrink: 0`
- `width: var(--dds-icon-size-sm); height: var(--dds-icon-size-sm)`
- `color: inherit`

`.endSlot`:

- `flex-shrink: 0; margin-left: auto`
- `display: flex; align-items: center`

### Group (nested list)

`.group`:

- `list-style: none; margin: 0; padding: 0`

No hardcoded values. No Tailwind. No inline styles (except `paddingLeft` depth calculation — documented exception).

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` — all item rows.
- `paddingLeft: calc(${depth} * var(--dds-space-4))` inline style — **documented exception** for dynamic depth indentation. The depth value comes from `TreeItemDepthContext`. This cannot be expressed with static SCSS classes since depth is unbounded.
- The expand/collapse toggle `<span>` has `aria-hidden="true"` — the `aria-expanded` on the `<li role="treeitem">` communicates the state.
- `role="group"` on nested `<ul>` (not `role="tree"`) — child lists are groups of the parent tree, not independent trees.
- `getVisibleValues()` must only include items that are currently visible — items inside collapsed branches are excluded from arrow key navigation.
- The `*` key expands all sibling nodes at the same depth level — WAI-ARIA tree pattern requirement.
- Focus management uses DOM focus (not `aria-activedescendant`) — each `<li>` is focusable via roving tabindex.

---

## Accessibility

Full WAI-ARIA Tree View pattern:

- `<ul role="tree">` with `aria-label` or `aria-labelledby`.
- `<li role="treeitem">` with `aria-expanded` (branch only), `aria-selected` (when selectionMode ≠ none), `aria-disabled`, `aria-level`.
- `<ul role="group">` for child lists.
- Roving tabindex — one item has `tabIndex={0}`, all others `tabIndex={-1}`.
- Arrow keys navigate, Enter/Space toggle expand + select, Home/End jump to ends, `*` expands siblings.
- `aria-multiselectable="true"` on root when `selectionMode="multiple"`.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders <ul role="tree">
- tree has aria-label when provided
- tree has aria-labelledby when provided
- forwards className to root ul
- forwards ref to root HTMLUListElement

// TreeItem — leaf
- renders <li role="treeitem">
- has aria-level="1" at root depth
- has aria-level="2" when nested one level deep
- renders label text
- renders startIcon when provided
- renders endSlot when provided
- no expand toggle rendered for leaf nodes
- toggle spacer rendered for leaf to maintain alignment

// TreeItem — branch
- renders expand toggle icon
- has aria-expanded="false" when collapsed (default)
- has aria-expanded="true" when expanded
- clicking row expands collapsed branch
- clicking row collapses expanded branch
- children (TreeItemGroup) rendered when expanded
- children NOT rendered when collapsed

// Selection (single)
- clicking leaf item selects it
- clicking another item deselects previous
- aria-selected="true" on selected item
- onChange called with selected value string

// Selection (multiple)
- clicking item selects it
- clicking another item adds to selection
- clicking selected item deselects it
- onChange called with string[] of all selected
- aria-multiselectable="true" on root

// Selection (none)
- aria-selected absent on all items when selectionMode="none"

// Disabled
- disabled item has aria-disabled="true"
- disabled item cannot be selected
- disabled item skipped during keyboard navigation

// Expand/collapse controlled
- expandedValues prop controls which branches are open
- onExpandedChange called when branch toggled

// Sizes
- applies .md class by default
- applies .sm class when size="sm"

// Keyboard — navigation
- Tab focuses first visible item
- ArrowDown moves focus to next visible item
- ArrowUp moves focus to previous visible item
- ArrowDown skips items inside collapsed branches
- ArrowDown wraps to last visible item at bottom (stays — no wrap)
- ArrowUp stays at first item (no wrap)
- Home moves focus to first item
- End moves focus to last visible item

// Keyboard — expand/collapse
- ArrowRight on collapsed branch: expands it
- ArrowRight on expanded branch: moves focus to first child
- ArrowRight on leaf: does nothing
- ArrowLeft on expanded branch: collapses it
- ArrowLeft on collapsed branch (or leaf): moves focus to parent
- ArrowLeft at root-level item with no parent: does nothing

// Keyboard — selection
- Enter on item selects it
- Space on item selects it
- Enter on branch toggles expansion AND selects (if selectionMode != none)

// Keyboard — expand siblings
- * key expands all sibling branches at the same level

// Depth indentation
- root items have depth 0 (no left padding from depth)
- depth-1 items have paddingLeft matching --dds-space-4
- depth-2 items have paddingLeft matching 2 * --dds-space-4

// axe
- axe: passes for flat list (all leaves)
- axe: passes for nested tree (branches and leaves)
- axe: passes with one item selected
- axe: passes for multiple selection mode
- axe: passes with disabled item
- axe: passes with expanded branch
- axe: passes for size="sm"
```

---

## Stories — `TreeView.stories.tsx`

Named exports required:

- `Default` — 3 root items, 2 are branches with 3 children each, single selection
- `FileSystem` — realistic file tree (src/, components/, stories/, tests/, assets/)
- `MultipleSelection` — selectionMode="multiple"
- `NoSelection` — selectionMode="none" (navigation only)
- `WithIcons` — folder/file icons via startIcon
- `WithEndSlots` — item count badges in endSlot
- `Sizes` — sm and md stacked
- `DefaultExpanded` — defaultExpandedValues=["src", "components"]
- `Controlled` — useState for both value and expandedValues
- `DisabledItems` — one branch and one leaf disabled
- `DeepNesting` — 4 levels deep to verify indentation

`ExpandBranch` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const branchItem = within(canvasElement).getByRole('treeitem', { name: /components/i });
  await expect(branchItem).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(branchItem);
  await expect(branchItem).toHaveAttribute('aria-expanded', 'true');
};
```

`KeyboardExpand` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const tree = within(canvasElement).getByRole('tree');
  await userEvent.tab();
  // Focus first item
  await userEvent.keyboard('{ArrowDown}'); // move to second item (branch)
  await userEvent.keyboard('{ArrowRight}'); // expand it
  const items = within(canvasElement).getAllByRole('treeitem');
  // children now visible
  await userEvent.keyboard('{ArrowRight}'); // move into first child
};
```

`SelectItem` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const leaf = within(canvasElement).getByRole('treeitem', { name: /Button.tsx/i });
  await userEvent.click(leaf);
  await expect(leaf).toHaveAttribute('aria-selected', 'true');
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
- [ ] `*` key expands all siblings at the same level — verified in tests
- [ ] Collapsed branch children excluded from ArrowDown/Up navigation
- [ ] ArrowLeft from root-level item does nothing (no crash)
- [ ] Depth indentation uses inline `paddingLeft` — documented exception in JSDoc
- [ ] `border-radius: var(--dds-radius-none)` on item rows
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] All 3 components exported from `packages/components/src/index.ts`

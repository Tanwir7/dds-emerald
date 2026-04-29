# Tabs · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Tabs`, `TabList`, `Tab`, `TabPanels`, and `TabPanel` components.
- Scaffold: `packages/components/src/components/Tabs/`
- Radix primitive: `@radix-ui/react-tabs`

---

## Purpose

`Tabs` organises content into labelled panels where only one panel is visible at a time. It supports two visual variants: `line` (underline indicator on the active tab — for top-level page sections) and `pill` (filled background on the active tab — for compact in-page switching).

---

## Exports from `index.ts`

```ts
export { Tabs, TabList, Tab, TabPanels, TabPanel };
export type { TabsProps, TabListProps, TabProps, TabPanelProps };
```

---

## Props

### `Tabs` (Radix `Tabs.Root`):

```ts
interface TabsProps {
  value?: string; // controlled active tab
  defaultValue?: string; // uncontrolled
  onValueChange?: (value: string) => void;
  variant?: 'line' | 'pill'; // default: 'line'
  size?: 'sm' | 'md'; // default: 'md'
  orientation?: 'horizontal' | 'vertical'; // default: 'horizontal'
  className?: string;
  children: React.ReactNode;
}
```

### `TabList` (Radix `Tabs.List`):

```ts
interface TabListProps {
  aria-label?: string   // required for accessibility when no visible heading labels the tab group
  className?: string
  children: React.ReactNode
}
```

### `Tab` (Radix `Tabs.Trigger`):

```ts
interface TabProps {
  value: string; // required — matches TabPanel value
  disabled?: boolean;
  startIcon?: React.ReactNode;
  endSlot?: React.ReactNode; // badge count, status dot, etc.
  className?: string;
  children: React.ReactNode;
}
```

### `TabPanel` (Radix `Tabs.Content`):

```ts
interface TabPanelProps {
  value: string; // required — matches Tab value
  forceMount?: boolean; // default: false — keep panel in DOM even when inactive
  className?: string;
  children: React.ReactNode;
}
```

`TabPanels` is a simple passthrough wrapper `<div>` — it adds no semantics, just layout container for `TabPanel` children (useful for consistent padding context).

Forward refs on all sub-components to their Radix element types.

---

## Tabs context

`Tabs` passes `variant` and `size` via React Context so `TabList`, `Tab`, and `TabPanel` can consume them without prop drilling:

```tsx
const TabsContext = React.createContext<{
  variant: 'line' | 'pill';
  size: 'sm' | 'md';
}>({ variant: 'line', size: 'md' });
```

---

## Styles — `Tabs.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

### TabList

`.list`:

- `display: flex`
- `align-items: center`

**Line variant:**

```scss
.line .list {
  border-bottom: 1px solid var(--dds-color-border-default);
  gap: 0;
}
```

**Pill variant:**

```scss
.pill .list {
  background-color: var(--dds-color-bg-subtle);
  padding: var(--dds-space-1);
  gap: var(--dds-space-1);
  border: 1px solid var(--dds-color-border-default);
}
```

**Vertical orientation:**

```scss
.vertical .list {
  flex-direction: column;
  align-items: stretch;
  border-bottom: none;
  border-right: 1px solid var(--dds-color-border-default); // line variant
}
.vertical.pill .list {
  border-right: none;
  border: 1px solid var(--dds-color-border-default);
}
```

### Tab (Trigger)

`.tab`:

- `display: inline-flex`
- `align-items: center`
- `gap: var(--dds-space-1-5)`
- `font-family: var(--dds-font-sans)`
- `font-weight: var(--dds-font-weight-medium)`
- `color: var(--dds-color-text-muted)`
- `background: transparent`
- `border: none`
- `cursor: pointer`
- `white-space: nowrap`
- `outline: 3px solid transparent`
- `outline-offset: -3px` — inset so it doesn't escape the tab area
- `border-radius: var(--dds-radius-none)`
- `transition: color, background-color var(--dds-duration-fast) var(--dds-ease-standard)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`
- `&[data-disabled]` → `opacity: 0.5; pointer-events: none; cursor: not-allowed`

Size modifiers:

- `.sm .tab` → `font-size: var(--dds-font-size-xs); padding: var(--dds-space-1-5) var(--dds-space-2); height: 32px`
- `.md .tab` → `font-size: var(--dds-font-size-sm); padding: var(--dds-space-2) var(--dds-space-3); height: 36px`

**Line variant active/hover:**

```scss
.line .tab {
  position: relative;
  margin-bottom: -1px; // overlap the list border-bottom
  border-bottom: 2px solid transparent;

  &:hover:not([data-disabled]) {
    color: var(--dds-color-text-default);
    border-bottom-color: var(--dds-color-border-default);
  }

  &[data-state='active'] {
    color: var(--dds-color-text-default);
    border-bottom-color: var(--dds-color-action-primary);
  }
}
```

**Pill variant active/hover:**

```scss
.pill .tab {
  border-radius: var(--dds-radius-none); // keep square

  &:hover:not([data-disabled]) {
    color: var(--dds-color-text-default);
    background-color: var(--dds-color-bg-card);
  }

  &[data-state='active'] {
    color: var(--dds-color-text-default);
    background-color: var(--dds-color-bg-card);
    box-shadow: var(--dds-shadow-xs);
  }
}
```

**Vertical line variant:**

```scss
.vertical.line .tab {
  border-bottom: none;
  border-right: 2px solid transparent;
  margin-bottom: 0;
  margin-right: -1px;
  justify-content: flex-start;
  width: 100%;

  &:hover:not([data-disabled]) {
    border-right-color: var(--dds-color-border-default);
  }
  &[data-state='active'] {
    border-right-color: var(--dds-color-action-primary);
  }
}
```

### startIcon and endSlot

`.startIcon`:

- `flex-shrink: 0`
- `width: var(--dds-icon-size-sm); height: var(--dds-icon-size-sm)`
- `color: inherit`

`.endSlot`:

- `flex-shrink: 0`
- `display: flex; align-items: center`

### TabPanel

`.panel`:

- `outline: none` — Radix removes focus from panels (they're not focusable by default)
- `&[data-state="inactive"]` → `display: none` — Radix handles this via data-state

`.panelInner` (optional inner padding wrapper):

- `padding-top: var(--dds-space-4)` (line variant)
- `padding-top: var(--dds-space-3)` (pill variant)

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on all tab buttons — both line and pill variants.
- **Line variant active indicator is `border-bottom: 2px solid`** — NOT a pseudo-element, not a box-shadow, not an absolutely positioned div. The 2px bottom border with `margin-bottom: -1px` overlaps the list's `border-bottom: 1px`.
- **Pill variant uses `box-shadow: var(--dds-shadow-xs)` on the active tab** — the subtle elevation distinguishes it from the list background without a harsh border.
- `outline-offset: -3px` on tab buttons — inset focus ring does not overflow the tab list container.
- `data-state="active"` drives active styles — NOT a separate `active` class prop. Radix sets this.
- `data-state="inactive"` on `TabPanel` sets `display: none` — Radix handles this automatically. Do NOT override it.

---

## Accessibility

- Radix `Tabs` handles full WAI-ARIA tabs pattern: `role="tablist"`, `role="tab"`, `role="tabpanel"`.
- `aria-selected="true"` on active tab, `aria-controls` pointing to panel id, `aria-labelledby` on panel pointing to tab id — all Radix.
- `TabList` should have `aria-label` when there is no visible heading that labels the tab group.
- Keyboard: Arrow keys navigate between tabs (automatic activation on arrow — Radix default). Tab moves to panel content. Shift+Tab returns to the tab list.
- `disabled` tabs are skipped during arrow key navigation (Radix).
- `orientation="vertical"` tells Radix to use up/down arrows instead of left/right.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders Tabs.Root
- TabList renders with role="tablist"
- Tab renders with role="tab"
- TabPanel renders with role="tabpanel"
- forwards className to each sub-component
- forwards refs to each sub-component

// Active state
- first Tab is active by default when defaultValue matches
- active Tab has aria-selected="true"
- inactive Tabs have aria-selected="false"
- active TabPanel is visible
- inactive TabPanel has data-state="inactive" (not visible)

// Value control
- controlled: respects value prop
- uncontrolled: clicking Tab changes active panel
- onValueChange called with new value on tab click

// Variants — line
- TabList has line border-bottom in line variant (default)
- active Tab has bottom border in line variant

// Variants — pill
- TabList has bg-subtle background in pill variant
- active Tab has bg-card background + shadow in pill variant

// Sizes
- applies .md size class by default
- applies .sm size class when size="sm"

// Orientation
- horizontal: TabList has horizontal flex direction (default)
- vertical: TabList has vertical flex direction

// Tab with icons/slots
- startIcon renders inside Tab
- endSlot renders inside Tab

// Disabled Tab
- disabled Tab has data-disabled
- disabled Tab is not clickable
- disabled Tab skipped during arrow navigation

// forceMount
- TabPanel with forceMount is in DOM when inactive
- TabPanel without forceMount removed from DOM when inactive

// Keyboard
- Tab focuses the active Tab on initial Tab press
- ArrowRight moves focus to next Tab (horizontal)
- ArrowLeft moves focus to previous Tab (horizontal)
- ArrowDown moves focus to next Tab (vertical)
- ArrowUp moves focus to previous Tab (vertical)
- Home moves focus to first Tab
- End moves focus to last Tab
- Tab from tablist moves focus to active panel content

// axe
- axe: passes for line variant (horizontal)
- axe: passes for pill variant
- axe: passes for vertical orientation
- axe: passes with disabled tab
- axe: passes with startIcon and endSlot
- axe: passes with aria-label on TabList
```

---

## Stories — `Tabs.stories.tsx`

Named exports required:

- `Line` — default, horizontal, 3 tabs
- `Pill` — variant="pill", 3 tabs
- `Vertical` — orientation="vertical", line variant
- `VerticalPill` — orientation="vertical", pill variant
- `Sizes` — sm and md stacked, line variant
- `WithIcons` — tabs with startIcon
- `WithBadge` — tabs with endSlot showing a Badge count
- `DisabledTab` — one tab disabled
- `Controlled` — useState-controlled value
- `ForceMount` — one panel with forceMount={true} (verify it's in DOM when inactive)
- `ManyTabs` — 7 tabs, horizontal (overflow scroll)
- `InCard` — tabs inside a card, no padding on panel content

`ClickTab` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const tabs = within(canvasElement).getAllByRole('tab');
  await userEvent.click(tabs[1]);
  await expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  await expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
};
```

`KeyboardNavigation` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const tabs = within(canvasElement).getAllByRole('tab');
  await userEvent.tab();
  await expect(tabs[0]).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect(tabs[1]).toHaveFocus();
  await expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
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
- [ ] Line variant active indicator is `border-bottom: 2px solid` with `margin-bottom: -1px`
- [ ] Pill variant active tab has `box-shadow: var(--dds-shadow-xs)` — no hardcoded shadow
- [ ] `border-radius: var(--dds-radius-none)` on all tab buttons
- [ ] Vertical orientation uses up/down arrow keys
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] All 5 sub-components exported from `packages/components/src/index.ts`

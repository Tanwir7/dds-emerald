# Dropdown · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Dropdown` component.
- Scaffold: `packages/components/src/components/Dropdown/`
- Radix primitive: `@radix-ui/react-dropdown-menu`

---

## Purpose

`Dropdown` is an action menu attached to a trigger element. It is NOT a form control — it does not have a `name`, `value`, or `onChange`. It is used for contextual actions: "Edit", "Delete", "Share", "Copy link". For form-bound value selection, use `Select`.

---

## Exports from `index.ts`

```ts
export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownCheckboxItem,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownSub,
  DropdownSubTrigger,
  DropdownSubContent,
  DropdownGroup,
};
```

---

## Props

### `Dropdown` (Radix `DropdownMenu.Root`):

```ts
open?: boolean
defaultOpen?: boolean
onOpenChange?: (open: boolean) => void
modal?: boolean      // default: true — traps focus when open
children: React.ReactNode
```

### `DropdownTrigger` (Radix `DropdownMenu.Trigger`):

```ts
asChild?: boolean    // default: false — when true, passes props to child
className?: string
children: React.ReactNode
```

### `DropdownContent` (Radix `DropdownMenu.Content`):

```ts
side?: 'top' | 'right' | 'bottom' | 'left'  // default: 'bottom'
align?: 'start' | 'center' | 'end'          // default: 'start'
sideOffset?: number                          // default: 4
className?: string
children: React.ReactNode
```

### `DropdownItem` (Radix `DropdownMenu.Item`):

```ts
intent?: 'default' | 'destructive'   // default: 'default'
disabled?: boolean
onSelect?: (event: Event) => void
startIcon?: React.ReactNode          // icon on left
endText?: string                     // shortcut/description on right
inset?: boolean                      // default: false — indent when no icon, aligns with icon items
className?: string
children: React.ReactNode
```

### `DropdownCheckboxItem` (Radix `DropdownMenu.CheckboxItem`):

```ts
checked?: boolean
onCheckedChange?: (checked: boolean) => void
disabled?: boolean
className?: string
children: React.ReactNode
```

### `DropdownRadioGroup` → thin wrapper over `DropdownMenu.RadioGroup`

### `DropdownRadioItem` (Radix `DropdownMenu.RadioItem`) — same pattern as CheckboxItem

### `DropdownSub`, `DropdownSubTrigger`, `DropdownSubContent` — thin wrappers

### `DropdownLabel`, `DropdownSeparator`, `DropdownGroup` — thin wrappers

Forward refs on all sub-components.

---

## Styles — `Dropdown.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

### Content (floating panel)

`.content`:

- `min-width: 180px`
- `max-width: 280px`
- `background-color: var(--dds-color-bg-popover)`
- `border: 1px solid var(--dds-color-border-default)`
- `border-radius: var(--dds-radius-none)`
- `box-shadow: var(--dds-shadow-sm)`
- `padding: var(--dds-space-1) 0`
- `z-index: 50`
- `overflow: hidden`
- Entry/exit animation:
  ```scss
  &[data-state='open'] {
    animation: dropIn var(--dds-duration-fast) var(--dds-ease-out);
  }
  &[data-state='closed'] {
    animation: dropOut var(--dds-duration-fast) var(--dds-ease-standard);
  }
  @keyframes dropIn {
    from {
      opacity: 0;
      transform: scale(0.97) translateY(-4px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  @keyframes dropOut {
    from {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    to {
      opacity: 0;
      transform: scale(0.97) translateY(-4px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    &[data-state='open'],
    &[data-state='closed'] {
      animation: none;
    }
  }
  ```

### Items

`.item`:

- `display: flex`
- `align-items: center`
- `gap: var(--dds-space-2)`
- `padding: var(--dds-space-1-5) var(--dds-space-3)`
- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)`
- `color: var(--dds-color-text-default)`
- `cursor: default`
- `outline: none`
- `user-select: none`
- `border-radius: var(--dds-radius-none)`
- `&[data-highlighted]` → `background-color: var(--dds-color-action-ghost-hover)`
- `&[data-disabled]` → `opacity: 0.5; pointer-events: none`

Intent modifier:

- `.intentDestructive` → `color: var(--dds-color-status-danger)`
- `.intentDestructive[data-highlighted]` → `background-color: var(--dds-badge-danger-bg); color: var(--dds-color-status-danger)`

Inset modifier (no icon, aligned with icon items):

- `.inset` → `padding-left: calc(var(--dds-space-3) + 16px + var(--dds-space-2))`

`.startIcon`:

- `flex-shrink: 0`
- `width: var(--dds-icon-size-sm); height: var(--dds-icon-size-sm)`
- `color: var(--dds-color-text-muted)`
- `.intentDestructive &` → `color: var(--dds-color-status-danger)`

`.endText`:

- `margin-left: auto`
- `font-size: var(--dds-font-size-xs)`
- `color: var(--dds-color-text-muted)`
- `white-space: nowrap`

### CheckboxItem / RadioItem

`.checkboxItem`, `.radioItem`:

- Same as `.item`
- `.itemIndicator` → positioned left, shows check/dot icon when checked

### Sub-menu

`.subTrigger`:

- Same as `.item`
- `.subArrow` → right-pointing chevron, `margin-left: auto`, rotates 0deg

`.subContent`:

- Same as `.content`
- Appears to the side of the trigger item

### Label / Separator

`.label`:

- Same as Select's `.groupLabel` — xs, semibold, muted, uppercase, wide tracking

`.separator`:

- `height: 1px`
- `background-color: var(--dds-color-border-default)`
- `margin: var(--dds-space-1) 0`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on content, items, sub-content — no exceptions.
- Content renders in `<DropdownMenu.Portal>` — mandatory for correct z-index and overflow escaping.
- `data-highlighted` drives item focus/hover styles — NOT CSS `:hover`. Radix manages focus via `data-highlighted`.
- `intent="destructive"` on items must change both text colour AND hover background — not just colour.
- `DropdownItem`'s `onSelect` fires on keyboard Enter and mouse click; `event.preventDefault()` in the handler prevents the menu from closing automatically (useful for confirmation flows).
- Sub-menus open on pointer-enter and arrow-right; close on arrow-left (Radix built-in).

---

## Accessibility

- Radix `DropdownMenu` handles `role="menu"` on content, `role="menuitem"` on items, `role="menuitemcheckbox"`, `role="menuitemradio"`.
- `aria-haspopup="menu"` and `aria-expanded` on the trigger (Radix).
- Focus is trapped inside the menu when `modal={true}`.
- Keyboard: Arrow keys navigate, Enter/Space activate, Escape closes, Tab closes and moves focus out.
- `DropdownTrigger` should be a visible interactive element — use `asChild` to attach to an existing `Button` or `IconButton`.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders trigger element
- trigger has aria-haspopup="menu"
- trigger has aria-expanded="false" when closed
- content is not in DOM when closed
- forwards ref to DropdownContent HTMLDivElement

// Open/close
- clicking trigger opens the menu (aria-expanded="true")
- content has role="menu" when open
- pressing Escape closes the menu
- clicking outside closes the menu

// Items
- DropdownItem renders with role="menuitem"
- clicking item calls onSelect
- clicking item closes the menu
- disabled item has data-disabled and cannot be activated

// Intent
- default item has default text colour class
- destructive item applies .intentDestructive class
- destructive item highlighted state uses danger background

// Icons and end text
- startIcon renders inside item
- endText renders right-aligned inside item

// Inset
- .inset class applied when inset={true}

// CheckboxItem
- renders with role="menuitemcheckbox"
- has aria-checked="true" when checked
- clicking calls onCheckedChange

// RadioGroup + RadioItem
- renders with role="menuitemradio"
- has aria-checked="true" for selected value

// Sub-menu
- DropdownSubTrigger renders with aria-haspopup="menu"
- sub-menu opens on ArrowRight
- sub-menu closes on ArrowLeft

// Label and separator
- DropdownLabel renders with correct styles
- DropdownSeparator renders a divider

// Keyboard
- Tab on open trigger opens menu
- ArrowDown highlights first item
- ArrowDown then ArrowDown highlights second item
- ArrowUp wraps to last item from first
- Enter activates highlighted item
- Escape closes without activating

// Axe
- axe: passes when closed
- axe: passes when open
- axe: passes with checkbox items
- axe: passes with radio items
- axe: passes with sub-menu
- axe: passes with disabled items
```

---

## Stories — `Dropdown.stories.tsx`

Named exports required:

- `Default` — trigger button, 4 items
- `WithIcons` — items with startIcon
- `WithEndText` — items with keyboard shortcuts as endText
- `Destructive` — one destructive item (e.g. "Delete")
- `WithSeparators` — items grouped with separators and labels
- `WithCheckboxItems` — 3 checkbox items
- `WithRadioItems` — RadioGroup with 3 options
- `WithSubMenu` — one item with a sub-menu
- `DisabledItems` — some items disabled
- `AsChildTrigger` — `DropdownTrigger asChild` wrapping an existing `Button`
- `AlignEnd` — content align="end"

`OpenAndSelectItem` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button');
  await userEvent.click(trigger);
  const item = within(document.body).getByRole('menuitem', { name: 'Edit' });
  await userEvent.click(item);
};
```

`KeyboardNavigation` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button');
  await userEvent.tab();
  await expect(trigger).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  const items = within(document.body).getAllByRole('menuitem');
  await userEvent.keyboard('{ArrowDown}');
  await expect(items[0]).toHaveFocus();
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
- [ ] Content renders in portal — verified in stories
- [ ] `border-radius: var(--dds-radius-none)` on all parts
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] All sub-components exported from `packages/components/src/index.ts`

# Select · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Select` component.
- Scaffold: `packages/components/src/components/Select/`
- Radix primitive: `@radix-ui/react-select`

---

## Purpose

`Select` is the standard single-value dropdown form control. It is a stylised replacement for `<select>` that renders a trigger button and a floating list of options. It is a **form control** — it participates in forms, supports `name` + `value`, and pairs with a `Field` or `Label` molecule.

For searchable/filterable selection, use `Combobox` instead.

---

## Exports from `index.ts`

```ts
export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
};
export type { SelectProps };
```

---

## Props

### `Select` (Radix `Select.Root`):

```ts
value?: string
defaultValue?: string
onValueChange?: (value: string) => void
open?: boolean
defaultOpen?: boolean
onOpenChange?: (open: boolean) => void
disabled?: boolean
required?: boolean
name?: string
children: React.ReactNode
```

### `SelectTrigger` (Radix `Select.Trigger`):

```ts
size?: 'sm' | 'md' | 'lg'   // default: 'md'
invalid?: boolean            // default: false
placeholder?: string         // forwarded as SelectValue placeholder
className?: string
children?: React.ReactNode   // optional — overrides default SelectValue + chevron layout
```

### `SelectContent` (Radix `Select.Content`):

```ts
position?: 'item-aligned' | 'popper'  // default: 'popper'
side?: 'top' | 'bottom'               // default: 'bottom'
sideOffset?: number                   // default: 4
className?: string
children: React.ReactNode
```

### `SelectItem` (Radix `Select.Item`):

```ts
value: string                // required
disabled?: boolean
className?: string
children: React.ReactNode
```

### `SelectGroup`, `SelectLabel`, `SelectSeparator` — thin wrappers over Radix equivalents.

Forward refs on all sub-components to their respective Radix element types.

---

## Default `SelectTrigger` structure

```tsx
<Select.Trigger
  ref={ref}
  className={clsx(styles.trigger, styles[size], invalid && styles.invalid, className)}
>
  <Select.Value placeholder={placeholder} className={styles.value} />
  <Select.Icon asChild>
    <ChevronDownIcon className={styles.chevron} aria-hidden="true" />
  </Select.Icon>
</Select.Trigger>
```

`ChevronDownIcon` — embed a small inline SVG:

```tsx
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    width="16"
    height="16"
    className={className}
  >
    <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
```

---

## `SelectContent` structure

```tsx
<Select.Portal>
  <Select.Content
    ref={ref}
    position={position}
    side={side}
    sideOffset={sideOffset}
    className={clsx(styles.content, className)}
  >
    <Select.ScrollUpButton className={styles.scrollBtn}>
      <ChevronUpIcon aria-hidden="true" />
    </Select.ScrollUpButton>
    <Select.Viewport className={styles.viewport}>{children}</Select.Viewport>
    <Select.ScrollDownButton className={styles.scrollBtn}>
      <ChevronDownIcon aria-hidden="true" />
    </Select.ScrollDownButton>
  </Select.Content>
</Select.Portal>
```

---

## Styles — `Select.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

### Trigger

`.trigger`:

- `display: inline-flex`
- `align-items: center`
- `justify-content: space-between`
- `gap: var(--dds-space-2)`
- `width: 100%`
- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)`
- `font-weight: var(--dds-font-weight-normal)`
- `color: var(--dds-color-text-default)`
- `background-color: var(--dds-color-bg-input)`
- `border: 1px solid var(--dds-color-border-input)`
- `border-radius: var(--dds-radius-none)`
- `cursor: pointer`
- `outline: 3px solid transparent`
- `outline-offset: 2px`
- `transition: border-color, outline-color var(--dds-duration-fast) var(--dds-ease-standard)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5); border-color: var(--dds-color-focus-ring)`
- `&[data-disabled]` → `opacity: 0.5; cursor: not-allowed; pointer-events: none`
- `&[data-placeholder] > .value` → `color: var(--dds-color-text-muted)` — placeholder text

Size modifiers:

- `.sm` → `height: 32px; padding: 0 var(--dds-space-2); font-size: var(--dds-font-size-xs)`
- `.md` → `height: 36px; padding: 0 var(--dds-space-3)`
- `.lg` → `height: 40px; padding: 0 var(--dds-space-4); font-size: var(--dds-font-size-base)`

Invalid modifier:

- `.invalid` → `border-color: var(--dds-color-status-danger)`
- `.invalid:focus-visible` → `outline-color: oklch(from var(--dds-color-status-danger) l c h / 0.5)`

`.chevron`:

- `flex-shrink: 0`
- `color: var(--dds-color-text-muted)`
- `transition: transform var(--dds-duration-fast) var(--dds-ease-standard)`
- `[data-state="open"] &` → `transform: rotate(180deg)`

### Content (floating panel)

`.content`:

- `min-width: var(--radix-select-trigger-width)` — matches trigger width via Radix CSS var
- `max-height: var(--radix-select-content-available-height)`
- `background-color: var(--dds-color-bg-popover)`
- `border: 1px solid var(--dds-color-border-default)`
- `border-radius: var(--dds-radius-none)`
- `box-shadow: var(--dds-shadow-sm)` — elevated above page
- `overflow: hidden`
- `z-index: 50`
- Entry/exit animation:

  ```scss
  &[data-state='open'] {
    animation: selectIn var(--dds-duration-fast) var(--dds-ease-out);
  }
  &[data-state='closed'] {
    animation: selectOut var(--dds-duration-fast) var(--dds-ease-standard);
  }

  @keyframes selectIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes selectOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-4px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    &[data-state='open'],
    &[data-state='closed'] {
      animation: none;
    }
  }
  ```

`.viewport`:

- `padding: var(--dds-space-1) 0`

### Items

`.item` (SelectItem):

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
- `&[data-highlighted]` → `background-color: var(--dds-color-action-ghost-hover); color: var(--dds-color-text-default)`
- `&[data-selected]` → `font-weight: var(--dds-font-weight-medium)`
- `&[data-disabled]` → `opacity: 0.5; pointer-events: none`

`.itemIndicator` (the checkmark for selected):

- `margin-left: auto`
- `color: var(--dds-color-action-primary)`
- `width: 14px; height: 14px`

`.groupLabel` (SelectLabel):

- `padding: var(--dds-space-1-5) var(--dds-space-3)`
- `font-size: var(--dds-font-size-xs)`
- `font-weight: var(--dds-font-weight-semibold)`
- `color: var(--dds-color-text-muted)`
- `text-transform: uppercase`
- `letter-spacing: var(--dds-tracking-wider)`

`.separator`:

- `height: 1px`
- `background-color: var(--dds-color-border-default)`
- `margin: var(--dds-space-1) 0`

`.scrollBtn`:

- `display: flex; justify-content: center; align-items: center`
- `padding: var(--dds-space-1)`
- `cursor: default`
- `color: var(--dds-color-text-muted)`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on trigger, content, and items — no exceptions.
- Content renders inside `<Select.Portal>` — it mounts in `document.body` to escape overflow/clip contexts.
- `min-width: var(--radix-select-trigger-width)` — Radix injects this CSS var; use it so the content matches trigger width.
- `data-state="open"` on the trigger is provided by Radix — use it for chevron rotation, not a JS state variable.
- `data-highlighted` drives hover/focus styles on items — NOT `:hover` CSS pseudo-class (Radix controls focus with JS).
- Checkmark indicator must use `Select.ItemIndicator` (Radix) so it only renders for the selected item.
- `Select.Portal` is mandatory — omitting it breaks z-index stacking in modal/drawer contexts.

---

## Accessibility

- Radix `Select` handles full WAI-ARIA combobox pattern: `role="combobox"` on trigger, `role="listbox"` on content, `role="option"` on items.
- `aria-expanded`, `aria-haspopup`, `aria-selected` all managed by Radix.
- `aria-required` forwarded via `Select.Root`'s `required` prop.
- `aria-invalid` — pass via trigger's native props when `invalid={true}`.
- `name` prop enables native form participation (Radix renders a hidden `<input>`).
- Keyboard: Space/Enter opens, Arrow keys navigate, Enter selects, Escape closes. All handled by Radix.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders SelectTrigger as a button
- trigger has role="combobox"
- trigger has aria-haspopup="listbox"
- trigger has aria-expanded="false" when closed
- forwards ref to trigger HTMLButtonElement
- forwards className to trigger

// Placeholder
- trigger shows placeholder text when no value selected
- placeholder text has muted colour class

// Sizes
- applies .md class by default
- applies .sm class when size="sm"
- applies .lg class when size="lg"

// Invalid
- applies .invalid class when invalid={true}

// Open/close
- clicking trigger opens the content (aria-expanded="true")
- content has role="listbox" when open
- pressing Escape closes the content

// Selection
- clicking an item selects it and closes dropdown
- calls onValueChange with correct value on selection
- selected item has aria-selected="true"
- selected item renders checkmark indicator

// Disabled
- trigger has data-disabled when disabled={true}
- disabled items cannot be selected

// Groups
- SelectGroup + SelectLabel renders group with label
- SelectSeparator renders a divider

// Keyboard
- Space opens the select
- Enter opens the select
- ArrowDown highlights next item
- ArrowUp highlights previous item
- Enter selects highlighted item
- Escape closes without selecting
- Tab closes the select and moves focus out

// Form participation
- hidden input rendered with correct name and value
- required prop forwarded

// Axe
- axe: passes when closed
- axe: passes when open with items
- axe: passes with disabled trigger
- axe: passes with groups and labels
- axe: passes with invalid={true}
```

---

## Stories — `Select.stories.tsx`

Named exports required:

- `Default` — 5 options, no value
- `WithValue` — pre-selected value
- `Sizes` — sm / md / lg stacked
- `Invalid` — invalid={true}
- `Disabled` — disabled trigger
- `WithGroups` — SelectGroup + SelectLabel separating options
- `WithSeparator`
- `DisabledItem` — one option disabled
- `LongList` — 20+ items to show scroll buttons
- `InField` — wrapped in Field molecule with label and helper

`OpenAndSelect` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('combobox');
  await userEvent.click(trigger);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const option = within(document.body).getByRole('option', { name: 'Option 2' });
  await userEvent.click(option);
  await expect(trigger).toHaveTextContent('Option 2');
};
```

`KeyboardSelect` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('combobox');
  await userEvent.tab();
  await expect(trigger).toHaveFocus();
  await userEvent.keyboard(' ');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await userEvent.keyboard('{ArrowDown}');
  await userEvent.keyboard('{Enter}');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
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
- [ ] Content renders in portal (`document.body`) — verified in stories
- [ ] Chevron rotates 180° on open
- [ ] `border-radius: var(--dds-radius-none)` on all parts
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] All sub-components exported from `packages/components/src/index.ts`

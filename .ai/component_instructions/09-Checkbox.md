# Checkbox · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Checkbox` component.
- Scaffold: `packages/components/src/components/Checkbox/`
- Radix primitive: `@radix-ui/react-checkbox`

---

## Props

```ts
size?: 'sm' | 'md'                                      // default: 'md'
checked?: boolean | 'indeterminate'                      // controlled
defaultChecked?: boolean                                 // uncontrolled
onCheckedChange?: (checked: boolean | 'indeterminate') => void
disabled?: boolean                                       // default: false
invalid?: boolean                                        // default: false
id?: string
name?: string
value?: string
className?: string
```

Compose using Radix `Checkbox.Root` and `Checkbox.Indicator`. Forward `ref` typed to `HTMLButtonElement` (Radix Checkbox root is a `<button>`). Spread remaining non-Radix HTML props.

---

## Styles — `Checkbox.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root` (the `<button>` from Radix):

- `display: inline-flex`
- `align-items: center`
- `justify-content: center`
- `flex-shrink: 0`
- `border: 2px solid var(--dds-color-border-input)`
- `border-radius: var(--dds-radius-none)`
- `background-color: var(--dds-color-bg-input)`
- `color: var(--dds-color-action-primary-foreground)`
- `cursor: pointer`
- `outline: 3px solid transparent`
- `outline-offset: 2px`
- `transition: background-color, border-color, outline-color — var(--dds-duration-fast) var(--dds-ease-standard)`

States:

- `&[data-state="checked"]` → `background-color: var(--dds-color-action-primary); border-color: var(--dds-color-action-primary)`
- `&[data-state="indeterminate"]` → `background-color: var(--dds-color-action-primary); border-color: var(--dds-color-action-primary)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`
- `&:hover:not([data-disabled])` → `border-color: var(--dds-color-action-primary)`
- `&[data-disabled]` → `opacity: 0.5; cursor: not-allowed`

Invalid modifier `.invalid`:

- `border-color: var(--dds-color-status-danger)`
- `&[data-state="checked"]` → `background-color: var(--dds-color-status-danger); border-color: var(--dds-color-status-danger)`

Size modifiers:

- `.sm` → `width: 16px; height: 16px`
- `.md` → `width: 20px; height: 20px` (default)

`.indicator` (Radix Indicator child):

- `display: flex; align-items: center; justify-content: center`
- Renders a checkmark icon (SVG) for checked, dash for indeterminate

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` — Checkbox is square. No exceptions.
- Use Radix `data-state` and `data-disabled` attributes for styling — do NOT add separate class names for checked/disabled state.
- The checkmark and indeterminate icons must be SVG elements embedded directly (or use the `Icon` component if it's available) — never use background images or border tricks.
- `invalid` is a visual-only modifier — do not auto-set `aria-invalid` inside the component.

---

## Accessibility

- Radix Checkbox handles `role="checkbox"`, `aria-checked` (including indeterminate), and keyboard interaction (Space to toggle) natively.
- Forward `id` so a `<Label htmlFor={id}>` can be associated.
- Forward `name` and `value` for native form participation (Radix supports this).
- `disabled` is handled by Radix via `data-disabled`; the button's `disabled` attribute is not set by Radix — check Radix docs and ensure keyboard focus is removed when disabled.
- `aria-invalid` should be forwarded as a native prop to Radix root for screen reader support when used in an invalid field.
- Focus ring: `outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5); outline-offset: 2px`

---

## TDD — write ALL tests before implementing

```
- renders a button with role="checkbox"
- has aria-checked="false" when unchecked (default)
- has aria-checked="true" when checked={true}
- has aria-checked="mixed" when checked="indeterminate"
- forwards className to root element
- forwards ref to HTMLButtonElement (Radix root)
- applies .md class by default
- applies .sm class when size="sm"
- applies .invalid class when invalid={true}
- does NOT apply .invalid when invalid={false}
- forwards id prop to button
- forwards name and value props
- renders Indicator (checkmark) when checked
- renders Indicator (dash) when indeterminate
- does not render Indicator content when unchecked
- is not disabled by default
- is disabled when disabled={true}
- calls onCheckedChange with true when clicked (unchecked → checked)
- calls onCheckedChange with false when clicked (checked → unchecked)
- does not call onCheckedChange when disabled
- keyboard: receives focus on Tab
- keyboard: toggles on Space
- keyboard: does not toggle when disabled
- axe: passes when unchecked
- axe: passes when checked
- axe: passes when indeterminate
- axe: passes when disabled
- axe: passes when invalid
- axe: passes when associated with a <label> via htmlFor/id
```

---

## Stories — `Checkbox.stories.tsx`

Named exports required:

- `Unchecked` (default)
- `Checked` (checked={true})
- `Indeterminate` (checked="indeterminate")
- `Disabled`
- `DisabledChecked`
- `Invalid`
- `Sizes` (sm and md side by side)
- `WithLabel` (Checkbox + Label side by side demonstrating htmlFor linkage)
- `Controlled` (useState-driven story showing toggle)
- `FocusVisible` with `play()`:
  ```ts
  play: async ({ canvasElement }) => {
    const cb = within(canvasElement).getByRole('checkbox');
    await userEvent.tab();
    await expect(cb).toHaveFocus();
  };
  ```
- `Toggle` with `play()`:
  ```ts
  play: async ({ canvasElement }) => {
    const cb = within(canvasElement).getByRole('checkbox');
    await expect(cb).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(cb);
    await expect(cb).toHaveAttribute('aria-checked', 'true');
  };
  ```

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all variants and states
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] All variants represented in stories
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color or spacing values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

# Switch · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Switch` component.
- Scaffold: `packages/components/src/components/Switch/`
- Radix primitive: `@radix-ui/react-switch`

---

## Props

```ts
size?: 'sm' | 'md'                                     // default: 'md'
checked?: boolean                                       // controlled
defaultChecked?: boolean                                // uncontrolled
onCheckedChange?: (checked: boolean) => void
disabled?: boolean                                      // default: false
invalid?: boolean                                       // default: false
id?: string
name?: string
value?: string
className?: string
```

Compose using Radix `Switch.Root` and `Switch.Thumb`. Forward `ref` typed to `HTMLButtonElement`. Spread remaining non-Radix props.

---

## Styles — `Switch.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root` (the `<button>` from Radix Switch.Root):

- `display: inline-flex`
- `align-items: center`
- `flex-shrink: 0`
- `cursor: pointer`
- `border-radius: var(--dds-radius-full)` — **Switch track uses full radius — this is an intentional exception**
- `border: none`
- `background-color: var(--dds-color-border-input)` (unchecked track)
- `outline: 3px solid transparent`
- `outline-offset: 2px`
- `transition: background-color, outline-color — var(--dds-duration-fast) var(--dds-ease-standard)`
- `&[data-state="checked"]` → `background-color: var(--dds-color-action-primary)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`
- `&[data-disabled]` → `opacity: 0.5; cursor: not-allowed`

Invalid modifier `.invalid`:

- `&[data-state="unchecked"]` → `background-color: var(--dds-color-status-danger)` (soft visual cue)
- `&[data-state="checked"]` → `background-color: var(--dds-color-status-danger)`

Size modifiers (on `.root`):

- `.sm` → `width: 32px; height: 18px`
- `.md` → `width: 44px; height: 24px` (default)

`.thumb` (the Radix Switch.Thumb — the sliding circle):

- `display: block`
- `border-radius: var(--dds-radius-full)`
- `background-color: white`
- `box-shadow: var(--dds-shadow-sm)`
- `transition: transform — var(--dds-duration-fast) var(--dds-ease-standard)`
- Size `.sm` thumb: `width: 14px; height: 14px; transform: translateX(2px)` → checked: `transform: translateX(16px)`
- Size `.md` thumb: `width: 20px; height: 20px; transform: translateX(2px)` → checked: `transform: translateX(22px)`
- `&[data-state="checked"]` → apply the correct translateX per size

No hardcoded values (except thumb white — which is intentional for universality — this is a documented exception). No Tailwind. No inline styles.

---

## Critical design rules

- Switch track and thumb both use `var(--dds-radius-full)` — this is an **explicitly documented exception** to the zero-radius rule. It mirrors the ProgressBar and Avatar exception.
- Thumb background is `white` — this is intentional and documented. It ensures the thumb is always visible against both unchecked (grey) and checked (emerald) track backgrounds.
- Use Radix `data-state` for styling — no separate checked class.
- Do not use a checkbox input underneath — Radix Switch uses `role="switch"`.

---

## Accessibility

- Radix Switch exposes `role="switch"` with `aria-checked` managed automatically.
- `id` enables `<Label htmlFor={id}>` association.
- `name` and `value` enable native form participation (Radix handles hidden input).
- `disabled` maps to `data-disabled` on the Radix root — keyboard focus is removed automatically.
- `aria-invalid` should be forwardable via native props for form validation.
- Focus ring: `outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5); outline-offset: 2px`
- Keyboard: Space toggles the switch (Radix built-in).

---

## TDD — write ALL tests before implementing

```
- renders a button with role="switch"
- has aria-checked="false" when unchecked (default)
- has aria-checked="true" when checked={true}
- forwards className to root element
- forwards ref to HTMLButtonElement
- applies .md class by default
- applies .sm class when size="sm"
- applies .invalid class when invalid={true}
- does NOT apply .invalid when invalid={false}
- forwards id, name, value props
- Thumb is rendered inside root
- calls onCheckedChange(true) when clicked from unchecked state
- calls onCheckedChange(false) when clicked from checked state
- does not call onCheckedChange when disabled
- is disabled (data-disabled) when disabled={true}
- keyboard: receives focus on Tab
- keyboard: toggles on Space
- keyboard: does not toggle when disabled
- axe: passes when unchecked
- axe: passes when checked
- axe: passes when disabled
- axe: passes when invalid
- axe: passes when associated with a Label via htmlFor
```

---

## Stories — `Switch.stories.tsx`

Named exports required:

- `Unchecked` (default)
- `Checked` (defaultChecked={true})
- `Disabled`
- `DisabledChecked`
- `Invalid`
- `Sizes` (sm and md side by side)
- `WithLabel` (Switch + Label, demonstrating htmlFor/id linkage)
- `Controlled` (useState)
- `FocusVisible` with `play()`:
  ```ts
  play: async ({ canvasElement }) => {
    const sw = within(canvasElement).getByRole('switch');
    await userEvent.tab();
    await expect(sw).toHaveFocus();
  };
  ```
- `Toggle` with `play()`:
  ```ts
  play: async ({ canvasElement }) => {
    const sw = within(canvasElement).getByRole('switch');
    await expect(sw).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(sw);
    await expect(sw).toHaveAttribute('aria-checked', 'true');
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
- [ ] No hardcoded color or spacing values in SCSS (except thumb white — documented exception)
- [ ] Exported from `packages/components/src/index.ts`

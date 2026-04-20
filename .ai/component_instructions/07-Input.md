# Input · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Input` component.
- Scaffold: `packages/components/src/components/Input/`
- Radix primitive: none (native `<input>` element)

---

## Props

```ts
size?: 'sm' | 'md' | 'lg'         // default: 'md'
invalid?: boolean                  // default: false — error border state
startIcon?: React.ReactNode        // optional icon slotted before the text
endIcon?: React.ReactNode          // optional icon slotted after the text
className?: string
// All native <input> HTML attributes are forwarded (type, value, onChange, disabled, readOnly, placeholder, aria-*, etc.)
```

Renders a wrapper `<div>` (not focusable) containing the `<input>`. Forward `ref` typed to `HTMLInputElement`. Spread all native input props onto the `<input>` element, not the wrapper div.

---

## Styles — `Input.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.wrapper` (the outer `<div>`):

- `position: relative`
- `display: flex`
- `align-items: center`
- `width: 100%`

`.root` (the `<input>`):

- `width: 100%`
- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)` (default, `.md`)
- `font-weight: var(--dds-font-weight-normal)`
- `line-height: var(--dds-line-height-normal)`
- `color: var(--dds-color-text-default)`
- `background-color: var(--dds-color-bg-input)`
- `border: 1px solid var(--dds-color-border-input)`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent`
- `outline-offset: 2px`
- `transition: border-color, outline-color — var(--dds-duration-fast) var(--dds-ease-standard)`
- `&::placeholder` → `color: var(--dds-color-text-muted)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5); border-color: var(--dds-color-focus-ring)`
- `&:disabled` → `opacity: 0.5; cursor: not-allowed`
- `&:read-only` → `background-color: var(--dds-color-bg-muted); cursor: default`

Size modifiers (on `.root`):

- `.sm` → `height: 32px; padding: 0 var(--dds-space-2); font-size: var(--dds-font-size-xs)`
- `.md` → `height: 36px; padding: 0 var(--dds-space-3)`
- `.lg` → `height: 40px; padding: 0 var(--dds-space-4); font-size: var(--dds-font-size-base)`

Invalid state `.invalid` (on `.root`):

- `border-color: var(--dds-color-status-danger)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-status-danger) l c h / 0.5)`

Icon slot padding adjustments:

- `.hasStartIcon` → `padding-left: var(--dds-space-8)` (md), adjust per size
- `.hasEndIcon` → `padding-right: var(--dds-space-8)` (md), adjust per size

`.startIcon`, `.endIcon` (positioned absolute spans inside wrapper):

- `position: absolute`
- `top: 50%; transform: translateY(-50%)`
- `left: var(--dds-space-2-5)` / `right: var(--dds-space-2-5)`
- `color: var(--dds-color-text-muted)`
- `pointer-events: none`
- `display: flex; align-items: center`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` — Input is NOT an exception.
- `invalid` prop drives visual state only. `aria-invalid` must be set by the consumer (or a Field molecule) — this component does not set it automatically to avoid double-management.
- `startIcon` and `endIcon` children should receive `aria-hidden="true"` — pass this via the Icon component's default behaviour.
- Never use `outline: none` — always transition `outline-color` from transparent to the focus ring colour.

---

## Accessibility

- Native `<input>` carries all necessary semantics.
- `disabled` attribute removes the element from tab order — do not use `aria-disabled` alone.
- `readOnly` should still be reachable by keyboard — do not add `tabIndex={-1}`.
- `invalid={true}` adds a visual border colour change only; the consuming Field must set `aria-invalid="true"` and `aria-describedby` on the input for screen reader support.
- Focus ring: `outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5); outline-offset: 2px`

---

## TDD — write ALL tests before implementing

```
- renders an <input> element
- forwards ref to HTMLInputElement (not wrapper div)
- forwards className to the <input> element
- renders wrapper <div> containing the input
- applies .md class by default
- applies .sm class when size="sm"
- applies .lg class when size="lg"
- applies .invalid class when invalid={true}
- does NOT apply .invalid when invalid={false}
- renders startIcon when startIcon prop is provided
- applies .hasStartIcon class when startIcon provided
- renders endIcon when endIcon prop is provided
- applies .hasEndIcon class when endIcon provided
- renders both icons simultaneously
- forwards type, name, value props to <input>
- forwards placeholder prop to <input>
- forwards disabled to <input> (native attribute)
- forwards readOnly to <input>
- forwards onChange, onBlur, onFocus handlers
- forwards aria-* props to <input> (aria-label, aria-describedby)
- forwards data-testid and other arbitrary props to <input>
- keyboard: receives focus on Tab
- keyboard: does not receive focus when disabled
- keyboard: is reachable when readOnly
- axe: passes for default render
- axe: passes when invalid={true}
- axe: passes when disabled
- axe: passes when readOnly
- axe: passes with startIcon and endIcon
- axe: passes with aria-label
```

---

## Stories — `Input.stories.tsx`

Named exports required:

- `Default` (md, placeholder text)
- `Sizes` (sm / md / lg stacked)
- `Invalid` (invalid={true})
- `Disabled`
- `ReadOnly` (value pre-filled)
- `WithStartIcon` (search icon left)
- `WithEndIcon` (clear icon right)
- `WithBothIcons`
- `FocusVisible` with `play()`:
  ```ts
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');
    await userEvent.tab();
    await expect(input).toHaveFocus();
  };
  ```
- `TypeIntoInput` with `play()`:
  ```ts
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');
    await userEvent.type(input, 'Hello, Emerald');
    await expect(input).toHaveValue('Hello, Emerald');
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

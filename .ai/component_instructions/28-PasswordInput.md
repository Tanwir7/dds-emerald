# PasswordInput · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `PasswordInput` component.
- Scaffold: `packages/components/src/components/PasswordInput/`
- Radix primitive: none — composes `Input` and `IconButton` atoms.
- Depends on: `Input` atom, `IconButton` atom (both must be built first).

---

## Purpose

`PasswordInput` is a controlled or uncontrolled password field with a toggle button that switches the input between `type="password"` and `type="text"`. It wraps the `Input` atom and appends a show/hide `IconButton` as the `endIcon` slot.

---

## Props

```ts
size?: 'sm' | 'md' | 'lg'    // default: 'md' — forwarded to Input
invalid?: boolean             // default: false — forwarded to Input
showToggleLabel?: boolean     // default: false — if true, show "Show"/"Hide" text beside icon
className?: string
// All native <input> HTML attributes forwarded except `type` (controlled internally)
// including: value, defaultValue, onChange, onBlur, onFocus, disabled, readOnly,
//            placeholder, name, id, aria-*, aria-describedby, etc.
```

`type` is never exposed as a prop — it is controlled internally by the show/hide toggle state.

Forward `ref` typed to `HTMLInputElement`. Spread all remaining input-safe HTML props onto the underlying `Input`.

---

## Internal state

```tsx
const [visible, setVisible] = React.useState(false);
const toggle = () => setVisible((v) => !v);
```

The toggle button switches between:

- `visible = false` → `type="password"`, button shows "eye" icon, `aria-label="Show password"`
- `visible = true` → `type="text"`, button shows "eye-off" icon, `aria-label="Hide password"`

---

## Structure

```tsx
<Input
  {...props}
  ref={ref}
  type={visible ? 'text' : 'password'}
  size={size}
  invalid={invalid}
  endIcon={
    <IconButton
      size={size === 'lg' ? 'md' : 'sm'}
      variant="ghost"
      label={visible ? 'Hide password' : 'Show password'}
      onClick={toggle}
      tabIndex={0}
      type="button" // prevent accidental form submission
    >
      {visible ? <EyeOffIcon /> : <EyeIcon />}
    </IconButton>
  }
/>
```

The toggle `IconButton` must have `type="button"` to prevent it from submitting the parent form.

---

## Icons

Embed two small SVG icons directly in the component file (do not use the `Icon` wrapper to avoid coupling). Both should use `currentColor` for stroke/fill:

```tsx
const EyeIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    width="100%"
    height="100%"
  >
    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" strokeLinejoin="round" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    width="100%"
    height="100%"
  >
    <path d="M2 2l12 12M6.5 6.5A2 2 0 0 0 9.5 9.5" strokeLinecap="round" />
    <path
      d="M4.5 4.5C2.8 5.6 1.5 7.5 1.5 8s2.5 5 6.5 5c1.2 0 2.3-.3 3.2-.8M7 3.1c.3 0 .7-.1 1-.1 4 0 6.5 4.5 6.5 5 0 .3-.4 1-1.1 1.8"
      strokeLinecap="round"
    />
  </svg>
);
```

---

## Styles — `PasswordInput.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`PasswordInput` has no styles of its own — it delegates entirely to the `Input` atom's wrapper and the `IconButton`. The `.root` class exists only as a passthrough:

```scss
.root {
  // No styles — PasswordInput is a pure composition of Input + IconButton
  // All visual styles live in Input.module.scss and IconButton.module.scss
}
```

If `showToggleLabel={true}`, the `IconButton` children include a `<span>` with the label text:

```tsx
// In IconButton children when showToggleLabel={true}:
<>
  {visible ? <EyeOffIcon /> : <EyeIcon />}
  <span className={styles.toggleLabel}>{visible ? 'Hide' : 'Show'}</span>
</>
```

`.toggleLabel`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `color: var(--dds-color-text-muted)`
- `white-space: nowrap`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `type` is NEVER an external prop — it is always controlled by `visible` state.
- The toggle `IconButton` must have `type="button"` — if omitted, clicking Show/Hide inside a `<form>` will submit it.
- `aria-label` on the toggle button must update dynamically as visibility toggles — not static.
- The toggle button is inside the `endIcon` slot of `Input` — it is positioned absolutely over the input's right edge. It must NOT be a sibling of `<input>` in the DOM (it already lives inside Input's wrapper div via the `endIcon` prop).
- Do NOT disable the toggle button when the input is `disabled` — screen readers and sighted users should still be able to see what is currently in a disabled pre-filled field. However, `readOnly` inputs should also keep the toggle functional.

---

## Accessibility

- `aria-label` on the toggle button: `"Show password"` / `"Hide password"` — updates on every toggle.
- The toggle button announces its own state change through the updated `aria-label` — no additional live region needed.
- `autocomplete="current-password"` or `autocomplete="new-password"` should be forwarded by the consumer via the native `autocomplete` prop — `PasswordInput` does not set a default.
- `inputMode` prop can be forwarded — useful for password managers.
- When `visible=true`, the input is `type="text"` — some password managers may not recognise it. This is a known UX trade-off, not a bug.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders an input element
- input type is "password" by default
- renders a toggle button with role="button"
- toggle button has aria-label="Show password" by default
- forwards ref to HTMLInputElement
- forwards className to the root element

// Toggle behaviour
- clicking toggle changes input type from "password" to "text"
- clicking toggle again changes input type back to "password"
- toggle button aria-label changes to "Hide password" when visible
- toggle button aria-label changes back to "Show password" when hidden again
- toggle button has type="button" attribute

// Props forwarding
- forwards size="sm" to Input
- forwards size="lg" to Input
- forwards invalid={true} to Input
- forwards disabled to Input
- forwards readOnly to Input
- forwards placeholder to Input
- forwards value and onChange to Input
- forwards name to Input
- forwards id to Input
- forwards aria-describedby to Input
- does NOT expose type prop (not in prop types)

// showToggleLabel
- does NOT render label text when showToggleLabel={false} (default)
- renders "Show" text beside icon when showToggleLabel={true} and hidden
- renders "Hide" text beside icon when showToggleLabel={true} and visible

// Keyboard
- toggle button is reachable by Tab
- Space activates the toggle button
- Enter activates the toggle button
- input is not reachable when disabled

// Axe
- axe: passes for default render (password hidden)
- axe: passes when password is visible (type="text")
- axe: passes when disabled
- axe: passes when invalid={true}
- axe: passes with aria-label on input
- axe: passes with showToggleLabel={true}
```

---

## Stories — `PasswordInput.stories.tsx`

Named exports required:

- `Default` — md, placeholder="Enter password"
- `Visible` — pre-toggled to visible state
- `Sizes` — sm / md / lg stacked
- `Invalid` — invalid={true}
- `Disabled` — disabled with a pre-filled value
- `WithToggleLabel` — showToggleLabel={true}
- `WithFormField` — wrapped in a `Field` molecule (label="Password", helper="Min 8 characters")

`ToggleVisibility` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const input =
    within(canvasElement).getByRole('textbox', { hidden: true }) ??
    within(canvasElement).getByDisplayValue('');
  const toggle = within(canvasElement).getByRole('button', { name: /show/i });
  await expect(input).toHaveAttribute('type', 'password');
  await userEvent.click(toggle);
  await expect(input).toHaveAttribute('type', 'text');
  await expect(toggle).toHaveAccessibleName(/hide/i);
};
```

`KeyboardToggle` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const toggle = within(canvasElement).getByRole('button', { name: /show/i });
  await userEvent.tab(); // focus input
  await userEvent.tab(); // focus toggle button
  await expect(toggle).toHaveFocus();
  await userEvent.keyboard(' ');
  await expect(toggle).toHaveAccessibleName(/hide/i);
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
- [ ] `type` prop is absent from exported prop types
- [ ] Toggle button always has `type="button"`
- [ ] `aria-label` updates dynamically on toggle
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color or spacing values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

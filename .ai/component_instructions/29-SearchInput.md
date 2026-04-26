# SearchInput · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `SearchInput` component.
- Scaffold: `packages/components/src/components/SearchInput/`
- Radix primitive: none — composes `Input` and `IconButton` atoms.
- Depends on: `Input` atom, `IconButton` atom (both must be built first).

---

## Purpose

`SearchInput` is a search field with a magnifying glass icon on the left and an optional clear button on the right that appears when the input has a value. It is a controlled or uncontrolled input with `type="search"` and `role="searchbox"`.

---

## Props

```ts
size?: 'sm' | 'md' | 'lg'       // default: 'md' — forwarded to Input
invalid?: boolean                // default: false
clearable?: boolean              // default: true — shows clear button when value is non-empty
onClear?: () => void             // called when clear button is clicked
loading?: boolean                // default: false — replaces search icon with Spinner
className?: string
// All native <input> HTML attributes forwarded
// including: value, defaultValue, onChange, onBlur, onFocus, disabled,
//            readOnly, placeholder, name, id, aria-*, aria-label, etc.
```

Forward `ref` typed to `HTMLInputElement`. Spread all remaining input-safe HTML props onto the underlying `Input`.

---

## Internal state

```tsx
// For uncontrolled usage — track whether value is non-empty to show clear button
// For controlled usage — derive from value prop
const [internalValue, setInternalValue] = React.useState((props.defaultValue as string) ?? '');
const isControlled = props.value !== undefined;
const currentValue = isControlled ? (props.value as string) : internalValue;
const hasValue = currentValue.length > 0;
```

Clear button visibility: `clearable && hasValue && !props.disabled && !props.readOnly`

---

## Structure

```tsx
<Input
  {...inputProps}
  ref={ref}
  type="search"
  role="searchbox"
  size={size}
  invalid={invalid}
  startIcon={loading ? <Spinner size="sm" label="Searching…" /> : <SearchIcon />}
  endIcon={
    clearable && hasValue && !disabled && !readOnly ? (
      <IconButton
        size="sm"
        variant="ghost"
        label="Clear search"
        onClick={handleClear}
        type="button"
      >
        <ClearIcon />
      </IconButton>
    ) : undefined
  }
  onChange={handleChange}
/>
```

---

## Handlers

```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!isControlled) setInternalValue(e.target.value);
  props.onChange?.(e);
};

const handleClear = () => {
  if (!isControlled) setInternalValue('');
  onClear?.();
  // Refocus the input after clearing for keyboard users
  inputRef.current?.focus();
};
```

---

## Icons

Embed SVGs directly (same rationale as PasswordInput — no Icon atom coupling):

```tsx
const SearchIcon = () => (
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
    <circle cx="6.5" cy="6.5" r="4" />
    <path d="M11 11l3 3" strokeLinecap="round" />
  </svg>
);

const ClearIcon = () => (
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
    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
  </svg>
);
```

---

## Styles — `SearchInput.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`SearchInput` has no styles of its own — all visual work is done by `Input`. The `.root` class is a passthrough only:

```scss
.root {
  // No styles — SearchInput is a composition of Input + IconButton + Spinner
}
```

Additionally, suppress the native `<input type="search">` browser clear button to avoid double clear buttons:

```scss
.root input[type='search'] {
  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration {
    appearance: none;
  }
}
```

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `type="search"` on the underlying `<input>` — this enables semantic search semantics and correct mobile keyboard.
- Native browser clear button MUST be suppressed via CSS — `SearchInput` provides its own clear button.
- The clear `IconButton` must have `type="button"` — prevents accidental form submission.
- After clearing, focus must return to the input — keyboard users should not lose their position.
- `loading={true}` replaces the search icon (left) with a `Spinner` — the clear button (right) should still be visible if the field has a value.
- `role="searchbox"` is set on the `<input>` for richer screen reader announcement than the default `role="textbox"`.

---

## Accessibility

- `type="search"` combined with `role="searchbox"` gives the correct accessible role.
- The clear button `aria-label="Clear search"` is explicit and descriptive.
- `loading={true}` spinner has `label="Searching…"` — announced to screen readers via `role="status"`.
- `aria-label` or `aria-labelledby` should be forwarded from the consumer — `SearchInput` does not set a default label. Provide a warning in JSDoc.
- Refocusing input after clear is keyboard accessibility critical.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders an input with type="search"
- input has role="searchbox"
- renders search icon on the left by default
- clear button is NOT visible when input is empty
- clear button IS visible when input has a value (controlled)
- clear button IS visible when input has a value (uncontrolled)
- forwards ref to HTMLInputElement

// Props forwarding
- forwards size="lg" to Input
- forwards invalid={true} to Input
- forwards disabled to Input
- forwards readOnly to Input
- forwards placeholder
- forwards id, name, aria-label, aria-describedby

// Clear button
- clear button has aria-label="Clear search"
- clear button has type="button"
- clicking clear button clears uncontrolled value
- clicking clear button calls onClear callback
- clicking clear button refocuses the input
- clear button does NOT appear when clearable={false}
- clear button does NOT appear when input is disabled
- clear button does NOT appear when input is readOnly

// Loading
- renders Spinner instead of search icon when loading={true}
- Spinner has label="Searching…"
- clear button still appears when loading={true} and input has value

// Native clear button suppression
- native webkit search cancel button is suppressed (CSS class applied)

// Controlled vs uncontrolled
- works as uncontrolled with defaultValue
- works as controlled with value + onChange

// Keyboard
- Tab focuses input
- Tab again focuses clear button (when visible)
- Space/Enter on clear button clears value and refocuses input
- input not focusable when disabled

// Axe
- axe: passes for empty state
- axe: passes with a value (clear button visible)
- axe: passes when loading={true}
- axe: passes when disabled
- axe: passes when invalid={true}
- axe: passes with aria-label forwarded
```

---

## Stories — `SearchInput.stories.tsx`

Named exports required:

- `Default` — empty, placeholder="Search…"
- `WithValue` — defaultValue="emerald" showing clear button
- `Sizes` — sm / md / lg stacked
- `Loading` — loading={true}
- `Invalid` — invalid={true}
- `Disabled`
- `NoClear` — clearable={false}
- `InSearchForm` — wrapped in `<form role="search">` with a `Field` molecule (aria-label="Site search")
- `Controlled` — useState demo showing live value display

`ClearInteraction` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const input = within(canvasElement).getByRole('searchbox');
  await userEvent.type(input, 'hello');
  await expect(input).toHaveValue('hello');
  const clear = within(canvasElement).getByRole('button', { name: /clear/i });
  await userEvent.click(clear);
  await expect(input).toHaveValue('');
  await expect(input).toHaveFocus();
};
```

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] Native browser clear button suppressed in all webkit browsers
- [ ] Focus returns to input after clearing
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color or spacing values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

# PinInput · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `PinInput` component.
- Scaffold: `packages/components/src/components/PinInput/`
- Radix primitive: none (managed array of native `<input>` elements)

---

## Purpose

`PinInput` renders a row of single-character input boxes for OTP (one-time password) and PIN entry. Each slot accepts exactly one character. Focus moves automatically to the next slot on input and to the previous slot on Backspace.

---

## Props

```ts
length?: number                    // default: 6 — number of slots
type?: 'numeric' | 'alphanumeric'  // default: 'numeric' — controls inputMode + pattern
value?: string                     // controlled — full PIN string e.g. "123456"
defaultValue?: string              // uncontrolled
onChange?: (value: string) => void // called with full string on every change
onComplete?: (value: string) => void  // called when all slots are filled
size?: 'sm' | 'md' | 'lg'         // default: 'md' — controls slot dimensions
invalid?: boolean                  // default: false
disabled?: boolean                 // default: false
mask?: boolean                     // default: false — renders type="password" per slot
placeholder?: string               // default: '○' for numeric, '·' for alphanumeric
id?: string                        // applied to first slot; others get id-1, id-2, etc.
className?: string
```

`PinInput` manages an internal `string[]` of length `length`. Forward `ref` typed to `HTMLDivElement` (the wrapper). The individual slot inputs do NOT expose refs externally.

---

## Internal state

```tsx
const [slots, setSlots] = React.useState<string[]>(() => {
  const initial = (value ?? defaultValue ?? '').split('').slice(0, length);
  return Array.from({ length }, (_, i) => initial[i] ?? '');
});

const isControlled = value !== undefined;
const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
```

When controlled, derive slots from `value` prop on every render.

---

## Keyboard & input behaviour

### On input (character typed):

1. Accept only the first character of the input value.
2. Update the slot.
3. If the slot is now filled and is not the last, move focus to slot `i + 1`.
4. After updating, if all slots are filled, call `onComplete(fullValue)`.

### On Backspace:

1. If the current slot has a value, clear it and stay on the same slot.
2. If the current slot is empty, move focus to slot `i - 1` and clear that slot.

### On paste:

1. Split pasted text into characters.
2. Fill slots from the current focused slot index forward.
3. Move focus to the last filled slot or the slot after the last filled one.
4. Call `onChange` and `onComplete` if applicable.

### On ArrowLeft / ArrowRight:

1. Move focus to the previous / next slot without clearing values.

---

## Slot render

Each slot is a native `<input>`:

```tsx
<input
  ref={(el) => {
    inputRefs.current[i] = el;
  }}
  id={id ? `${id}-${i}` : undefined}
  type={mask ? 'password' : type === 'numeric' ? 'tel' : 'text'}
  inputMode={type === 'numeric' ? 'numeric' : 'text'}
  pattern={type === 'numeric' ? '[0-9]*' : undefined}
  maxLength={1}
  value={slots[i]}
  onChange={handleChange(i)}
  onKeyDown={handleKeyDown(i)}
  onPaste={i === 0 ? handlePaste : undefined}
  disabled={disabled}
  aria-label={`PIN digit ${i + 1} of ${length}`}
  autoComplete={i === 0 ? 'one-time-code' : 'off'}
  className={clsx(
    styles.slot,
    styles[size],
    invalid && styles.invalid,
    disabled && styles.disabled
  )}
/>
```

Note: `type="tel"` is used instead of `type="number"` for numeric PINs — `type="number"` has spinner controls and poor mobile UX. `type="tel"` gives a numeric keyboard on iOS/Android without those issues.

---

## Styles — `PinInput.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root` (the wrapper `<div>`):

- `display: inline-flex`
- `align-items: center`
- `gap: var(--dds-space-2)`

`.slot` (each `<input>`):

- `display: flex`
- `align-items: center`
- `justify-content: center`
- `text-align: center`
- `font-family: var(--dds-font-mono)`
- `font-weight: var(--dds-font-weight-semibold)`
- `color: var(--dds-color-text-default)`
- `background-color: var(--dds-color-bg-input)`
- `border: 1px solid var(--dds-color-border-input)`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent`
- `outline-offset: 2px`
- `transition: border-color, outline-color var(--dds-duration-fast) var(--dds-ease-standard)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5); border-color: var(--dds-color-focus-ring)`
- `&::placeholder` → `color: var(--dds-color-text-muted); font-weight: var(--dds-font-weight-normal)`

Size modifiers (square slots):

- `.sm` → `width: 32px; height: 32px; font-size: var(--dds-font-size-sm)`
- `.md` → `width: 40px; height: 40px; font-size: var(--dds-font-size-base)` (default)
- `.lg` → `width: 48px; height: 48px; font-size: var(--dds-font-size-lg)`

Invalid modifier:

- `.invalid` → `border-color: var(--dds-color-status-danger)`
- `.invalid:focus-visible` → `outline-color: oklch(from var(--dds-color-status-danger) l c h / 0.5)`

Disabled modifier:

- `.disabled` → `opacity: 0.5; cursor: not-allowed`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` — slots are square, no exceptions.
- `type="tel"` not `type="number"` for numeric PINs.
- `autoComplete="one-time-code"` on the first slot enables browser/SMS OTP autofill.
- `maxLength={1}` on every slot — critical to prevent multi-character input breaking the focus-advance logic.
- Paste must be handled on the first slot only (`onPaste` on index 0) — attach it there and fill forward from the current focused index.
- Never use `Array.from({ length: 6 }, (_, i) => i)` iteration in render without a stable `key` — use the index as key since slot count is fixed.

---

## Accessibility

- Each slot has `aria-label="PIN digit N of M"` — explicit, enumerated, descriptive.
- The wrapper `<div>` should have `role="group"` and `aria-label="PIN input"` (or the consumer's label).
- `aria-invalid` on each slot when `invalid={true}`.
- `disabled` attribute on each slot when `disabled={true}` — removes from tab order.
- `autoComplete="one-time-code"` on the first slot enables SMS OTP autofill on mobile.
- Focus management (auto-advance, backspace-retreat) is keyboard-only friendly — mouse users also benefit.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders `length` number of input slots (default 6)
- renders 4 slots when length={4}
- each slot has correct aria-label ("PIN digit 1 of 6", etc.)
- wrapper has role="group"
- forwards className to wrapper div
- forwards ref to wrapper HTMLDivElement

// Type
- slots have inputMode="numeric" when type="numeric" (default)
- slots have type="tel" when type="numeric" (default)
- slots have type="text" when type="alphanumeric"
- slots have type="password" when mask={true}

// Sizes
- applies .md class to slots by default
- applies .sm class to slots when size="sm"
- applies .lg class to slots when size="lg"

// Value (controlled)
- controlled: slot values match value prop "1234" split into slots
- controlled: calls onChange with full string on change

// Value (uncontrolled)
- uncontrolled: renders with defaultValue pre-filled
- uncontrolled: updates internally on change

// Keyboard behaviour
- typing a digit fills slot and moves focus to next slot
- typing in last slot does not advance focus further
- Backspace on filled slot clears it and stays
- Backspace on empty slot moves focus to previous slot and clears it
- ArrowRight moves focus to next slot
- ArrowLeft moves focus to previous slot
- typing fills slot and calls onChange

// onComplete
- calls onComplete when all slots are filled
- does NOT call onComplete when slots are partially filled

// Paste
- pasting "123456" fills all slots from first slot
- pasting "12" fills first two slots
- calls onChange after paste
- calls onComplete after paste if all slots filled

// Invalid
- applies .invalid class to all slots when invalid={true}
- each slot has aria-invalid="true" when invalid={true}

// Disabled
- applies .disabled class to all slots when disabled={true}
- all slots have disabled attribute when disabled={true}

// Keyboard (focus flow)
- Tab focuses first slot
- Tab again leaves component (Tab does not move between slots — arrow keys do)

// Axe
- axe: passes for default render
- axe: passes when all slots filled
- axe: passes when invalid={true}
- axe: passes when disabled
- axe: passes for mask={true}
```

---

## Stories — `PinInput.stories.tsx`

Named exports required:

- `Default` — 6 digits, empty
- `Prefilled` — defaultValue="1234" (4 digits, length=4)
- `Alphanumeric` — type="alphanumeric"
- `Masked` — mask={true}
- `Sizes` — sm / md / lg stacked
- `Invalid` — invalid={true}
- `Disabled` — disabled={true}, defaultValue="1234"
- `FourDigit` — length={4}
- `WithCompletion` — logs to console when onComplete fires
- `Controlled` — useState with live value display

`TypeAndAdvance` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const inputs = within(canvasElement).getAllByRole('textbox');
  await userEvent.type(inputs[0], '1');
  await expect(inputs[0]).toHaveValue('1');
  await expect(inputs[1]).toHaveFocus();
  await userEvent.type(inputs[1], '2');
  await expect(inputs[2]).toHaveFocus();
};
```

`BackspaceRetreats` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const inputs = within(canvasElement).getAllByRole('textbox');
  await userEvent.click(inputs[1]);
  await userEvent.keyboard('{Backspace}');
  await expect(inputs[0]).toHaveFocus();
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
- [ ] Paste fills slots from current focused index forward
- [ ] `autoComplete="one-time-code"` on first slot
- [ ] Tab exits the group (not moves between slots)
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

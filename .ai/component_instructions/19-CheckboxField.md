# CheckboxField · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `CheckboxField` component.
- Scaffold: `packages/components/src/components/CheckboxField/`
- Radix primitive: none — composes `Checkbox`, `Label`, and `Caption` atoms internally.
- Depends on: `Checkbox` atom, `Label` atom, `Caption` atom (all must be built first).

---

## Purpose

`CheckboxField` is the standard molecule for a single checkbox option with an associated label beside it, optional instructional text above the whole row, and optional helper/error text below. Unlike `Field`, the label sits beside the control (not above it) because that is the universal checkbox convention.

Supports `labelPosition="right"` (default) and `labelPosition="left"` for cases where the checkbox must appear on the trailing edge (e.g. settings rows with a full-width label on the left).

---

## Props

```ts
// Label (beside checkbox)
label: string                         // required
labelPosition?: 'right' | 'left'      // default: 'right'
required?: boolean                    // default: false — visual * on label + aria-required on checkbox
disabled?: boolean                    // default: false — passed to Label + Checkbox

// Text slots
instruction?: string                  // above the checkbox+label row
helper?: string                       // below the checkbox+label row
helperIntent?: 'default' | 'error' | 'success'   // default: 'default'

// ID wiring — auto via useId() if not provided
id?: string

// Checkbox atom props (all forwarded)
size?: 'sm' | 'md'                    // default: 'md'
checked?: boolean | 'indeterminate'
defaultChecked?: boolean
onCheckedChange?: (checked: boolean | 'indeterminate') => void
invalid?: boolean                     // visual state on Checkbox; also drives aria-invalid
name?: string
value?: string

className?: string
```

---

## ID wiring — implementation detail

```tsx
const generatedId = useId();
const checkboxId  = id ?? generatedId;
const instructionId = instruction ? `${checkboxId}-instruction` : undefined;
const helperId      = helper      ? `${checkboxId}-helper`      : undefined;

const describedBy = [instructionId, helperId].filter(Boolean).join(' ') || undefined;

// Pass directly to Checkbox atom — no cloneElement needed since props are explicit
<Checkbox
  id={checkboxId}
  aria-describedby={describedBy}
  aria-required={required ? true : undefined}
  aria-invalid={helperIntent === 'error' || invalid ? true : undefined}
  disabled={disabled}
  ...checkboxProps
/>
```

---

## Structure

```html
<div class="root">
  <!-- only if instruction provided -->
  <caption as="p" id="{instructionId}" class="instruction">
    {instruction}
  </caption>

  <!-- the control row — order swaps based on labelPosition -->
  <div class="row">
    <!-- labelPosition="left": Label first, then Checkbox -->
    <!-- labelPosition="right": Checkbox first, then Label -->

    <Checkbox
      id="{checkboxId}"
      size="{size}"
      checked="{checked}"
      disabled="{disabled}"
      invalid="{helperIntent"
      =""
      =""
      ="error"
      ||
      invalid}
      aria-describedby="{describedBy}"
      aria-required="{required}"
      aria-invalid="{helperIntent"
      =""
      =""
      ="error"
      ||
      invalid}
      ...rest
    />

    <label htmlFor="{checkboxId}" required="{required}" disabled="{disabled}"> {label} </label>
  </div>

  <!-- only if helper provided -->
  <caption as="p" id="{helperId}" intent="{helperIntent}" class="helper">
    {helper}
  </caption>
</div>
```

---

## Styles — `CheckboxField.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: flex`
- `flex-direction: column`
- `gap: 0`

`.instruction`:

- `margin-bottom: var(--dds-space-1-5)` — instruction → row gap (6px)

`.row`:

- `display: flex`
- `align-items: center`
- `gap: var(--dds-space-2)` — checkbox ↔ label gap (8px)

`.labelLeft`:

- Applied to `.row` when `labelPosition="left"`
- `flex-direction: row-reverse` — reverses the visual order without changing DOM order (DOM order: Checkbox then Label, regardless of visual position, for correct tab order)

`.helper`:

- `margin-top: var(--dds-space-1)` — row → helper gap (4px)
- `padding-left: calc(20px + var(--dds-space-2))` — indent under label (checkbox md width + gap), so helper aligns with label text
  - For size="sm": `calc(16px + var(--dds-space-2))`

No hardcoded values (checkbox size pixel values are derived from the Checkbox atom's documented sizes: 16px sm, 20px md). No Tailwind. No inline styles.

---

## Critical design rules

- DOM order is always: Checkbox first, Label second — regardless of `labelPosition`. Visual reversal is CSS-only (`flex-direction: row-reverse`). This preserves natural tab order.
- Helper text indentation must align with the start of the label text, not the start of the checkbox. Use `padding-left` calculated from checkbox width + gap.
- `invalid` prop on `CheckboxField` is the single source of truth — it passes both to the Checkbox atom (visual border) and sets `aria-invalid` on the checkbox element.
- If both `invalid={true}` and `helperIntent="error"` are set, they are consistent — do not conflict.

---

## Accessibility

- `Label` is associated to `Checkbox` via `htmlFor` / `id` — Radix Checkbox uses a `<button>`, which `<label>` can label via `htmlFor`.
- `aria-describedby` on the checkbox button lists instruction and helper ids.
- `aria-required={true}` when `required={true}`.
- `aria-invalid={true}` when validation fails.
- `disabled` on Checkbox removes it from tab order (Radix behaviour).
- The required `*` indicator on the Label is `aria-hidden="true"` (handled by Label atom).
- Screen reader reading order: Checkbox announces as "Label text, checkbox, unchecked" — the label association handles this.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a checkbox with role="checkbox"
- renders a label element with correct text
- label htmlFor matches checkbox id
- auto-generates id when no id prop provided
- uses provided id when id prop given
- renders instruction Caption above the row when instruction provided
- does NOT render instruction element when omitted
- renders helper Caption below the row when helper provided
- does NOT render helper element when omitted

// Label position
- default labelPosition="right": Checkbox precedes Label in DOM
- labelPosition="left": Checkbox still precedes Label in DOM (order unchanged)
- labelPosition="left": applies .labelLeft class to row (visual reversal via CSS)

// ARIA wiring
- checkbox has aria-describedby pointing to instruction id when present
- checkbox has aria-describedby pointing to helper id when present
- checkbox has aria-describedby listing both ids when both present
- checkbox does NOT have aria-describedby when neither present
- checkbox has aria-required="true" when required={true}
- checkbox has aria-invalid="true" when helperIntent="error"
- checkbox has aria-invalid="true" when invalid={true}
- checkbox has aria-invalid="true" when both invalid and helperIntent="error"

// Label props
- Label shows required indicator when required={true}
- Label is disabled when disabled={true}

// Checkbox forwarding
- size="sm" is forwarded to Checkbox
- checked prop is forwarded
- onCheckedChange fires when checkbox clicked
- disabled forwarded — checkbox is not clickable when disabled

// Helper indent
- helper has correct padding-left class for size="md" (default)
- helper has correct padding-left class for size="sm"

// Keyboard
- Tab focuses the checkbox
- Space toggles the checkbox
- disabled checkbox is not focusable

// Axe
- axe: passes for default render (right label)
- axe: passes for labelPosition="left"
- axe: passes with instruction and helper
- axe: passes when required={true}
- axe: passes when disabled={true}
- axe: passes when helperIntent="error"
- axe: passes when checked="indeterminate"
```

---

## Stories — `CheckboxField.stories.tsx`

Named exports required:

- `Default` — label right, unchecked
- `LabelLeft` — labelPosition="left"
- `Checked` — defaultChecked={true}
- `Indeterminate` — checked="indeterminate"
- `WithInstruction` — instruction text above
- `WithHelper` — helper text below
- `Error` — helperIntent="error", helper message, invalid
- `Success` — helperIntent="success", helper message
- `Required` — required={true}
- `Disabled` — disabled={true}
- `DisabledChecked` — disabled + defaultChecked
- `SizeSmall` — size="sm"
- `AllSlots` — instruction + helper + label, default state

`Toggle` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const cb = within(canvasElement).getByRole('checkbox');
  await expect(cb).toHaveAttribute('aria-checked', 'false');
  await userEvent.click(cb);
  await expect(cb).toHaveAttribute('aria-checked', 'true');
};
```

`KeyboardToggle` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const cb = within(canvasElement).getByRole('checkbox');
  await userEvent.tab();
  await expect(cb).toHaveFocus();
  await userEvent.keyboard(' ');
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
- [ ] DOM order is always Checkbox → Label regardless of labelPosition
- [ ] Helper text indentation aligns with label text for both sizes
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color or spacing values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

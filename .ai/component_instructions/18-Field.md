# Field · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Field` component.
- Scaffold: `packages/components/src/components/Field/`
- Radix primitive: none — composes `Label` and `Caption` atoms internally.
- Depends on: `Label` atom, `Caption` atom (both must be built first).

---

## Purpose

`Field` is the standard molecule for wrapping a single form control (`Input`, `Textarea`, `Slider`) with a required label, optional instructional text above the control, optional helper/error text below, and an optional right-side description annotation (inline layout only). It auto-wires all ARIA relationships between label, descriptions, and the control via `useId`.

`Field` does NOT wrap `Checkbox`, `Switch`, or `RadioGroup` — those have dedicated molecules (`CheckboxField`, `SwitchField`, `RadioGroupField`) because their label positioning differs.

---

## Props

```ts
// Label
label: string                         // required — visible label text
required?: boolean                    // default: false — passes to Label (visual *) + aria-required on control
disabled?: boolean                    // default: false — passes to Label + disabled on control

// Text slots
instruction?: string                  // above control — between label and input
helper?: string                       // below control — helper or validation message
helperIntent?: 'default' | 'error' | 'success'  // default: 'default'
description?: string                  // inline layout only — short annotation right of input

// Layout
layout?: 'stack' | 'inline'          // default: 'stack'
inlineLabelWidth?: string             // default: '160px' — left col width, inline only

// ID wiring — auto-generated via useId() if not provided
id?: string

className?: string
children: React.ReactNode             // single form control atom (Input, Textarea, Slider)
```

---

## ID wiring — implementation detail

```tsx
const generatedId = useId();
const fieldId = id ?? generatedId;
const instructionId = instruction ? `${fieldId}-instruction` : undefined;
const helperId = helper ? `${fieldId}-helper` : undefined;

const describedBy = [instructionId, helperId].filter(Boolean).join(' ') || undefined;

// Clone child to inject ARIA + id props
const control = React.cloneElement(React.Children.only(children) as React.ReactElement, {
  id: fieldId,
  'aria-describedby': describedBy,
  'aria-required': required ? true : undefined,
  'aria-invalid': helperIntent === 'error' ? true : undefined,
  disabled: disabled ?? undefined,
});
```

Do not overwrite props the consumer has explicitly set — merge safely (e.g. if consumer already passed `aria-describedby`, append to it rather than replace).

---

## Structure — layout="stack"

```html
<div class="root stack">
  <label htmlFor="{fieldId}" required="{required}" disabled="{disabled}"> {label} </label>

  <!-- only if instruction provided -->
  <caption as="p" id="{instructionId}">
    {instruction}
  </caption>

  <div class="control">{cloned child control}</div>

  <!-- only if helper provided -->
  <caption as="p" id="{helperId}" intent="{helperIntent}">
    {helper}
  </caption>
</div>
```

## Structure — layout="inline"

```html
<div
  class="root inline"
  style={{ '--field-label-width': inlineLabelWidth }}
>
  <div class="labelCol">
    <Label htmlFor={fieldId} required={required} disabled={disabled}>
      {label}
    </Label>
    <!-- only if instruction provided -->
    <Caption as="p" id={instructionId}>
      {instruction}
    </Caption>
  </div>

  <div class="controlCol">
    <div class="inputRow">
      {cloned child control}
      <!-- only if description provided -->
      <span class="description">{description}</span>
    </div>
    <!-- only if helper provided -->
    <Caption as="p" id={helperId} intent={helperIntent}>
      {helper}
    </Caption>
  </div>
</div>
```

The `--field-label-width` CSS custom property is set as an inline style on the root so the SCSS can consume it without hardcoding a pixel value.

---

## Styles — `Field.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

### Stack layout

`.root.stack`:

- `display: flex`
- `flex-direction: column`
- `gap: 0` — spacing controlled per-child with margin

`.root.stack > :global(.label-root)`: _(target the Label atom's root)_

- `margin-bottom: var(--dds-space-0-5)` — Label → Instruction gap (2px)

`.root.stack .instruction` _(Caption used as instruction)_:

- `margin-bottom: var(--dds-space-1-5)` — Instruction → Control gap (6px)

`.root.stack .control`:

- `width: 100%`

`.root.stack .helper` _(Caption used as helper)_:

- `margin-top: var(--dds-space-1)` — Control → Helper gap (4px)

**When no instruction:** Label bottom margin increases to `var(--dds-space-1-5)` to maintain the same Label → Control spacing. Use a modifier class `.noInstruction` on `.root` for this.

### Inline layout

`.root.inline`:

- `display: grid`
- `grid-template-columns: var(--field-label-width, 160px) 1fr`
- `column-gap: var(--dds-space-6)` — 24px between cols
- `align-items: start`

`.labelCol`:

- `display: flex`
- `flex-direction: column`
- `gap: var(--dds-space-0-5)` — Label → Instruction gap
- `padding-top: var(--dds-space-1)` — vertically aligns label baseline with input

`.controlCol`:

- `display: flex`
- `flex-direction: column`
- `gap: var(--dds-space-1)` — inputRow → Helper

`.inputRow`:

- `display: flex`
- `align-items: center`
- `gap: var(--dds-space-2)` — Input ↔ Description gap

`.description`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `color: var(--dds-color-text-muted)`
- `white-space: nowrap`
- `flex-shrink: 0`

### Responsive collapse (inline → stack below sm)

```scss
@include breakpoint-below(sm) {
  .root.inline {
    grid-template-columns: 1fr;
    row-gap: var(--dds-space-1-5);
  }

  .labelCol {
    padding-top: 0;
  }
}
```

_(Assumes `breakpoint-below(sm)` mixin exists in `_breakpoints.scss` for `max-width: 639px`)_

No hardcoded values. No Tailwind. No inline styles (except the `--field-label-width` CSS custom property which is intentional).

---

## Critical design rules

- `Field` must render exactly one child control — throw a dev-mode warning if `React.Children.count(children) !== 1`.
- Never hardcode gap/spacing — always use `--dds-space-*` tokens.
- The `--field-label-width` inline style is a **documented exception** to the no-inline-styles rule — it is a dynamic CSS custom property used as a layout variable, not a style value.
- `aria-invalid="true"` is set automatically when `helperIntent="error"` — do not set it again in the control atom.
- Inline layout collapses to stack below `640px` — this is non-negotiable per the responsive spec.

---

## Accessibility

- `Label` is always rendered — never conditional. `Field` enforces this by requiring the `label` prop.
- `htmlFor` on `Label` points to the control's `id` (auto-generated via `useId`).
- `aria-describedby` on the control lists `instructionId` and/or `helperId` (only the ones that exist).
- `aria-required={true}` on the control when `required={true}`.
- `aria-invalid={true}` on the control when `helperIntent="error"`.
- `disabled` forwarded to control — native `disabled` attribute, not `aria-disabled`.
- The helper Caption with `intent="error"` does NOT use `role="alert"` — the `aria-invalid` + `aria-describedby` combination is sufficient and avoids duplicate announcements.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a label element with correct text
- renders the child control
- label htmlFor matches the control's id
- auto-generates id via useId when no id prop provided
- uses provided id when id prop given
- renders instruction Caption when instruction prop provided
- does NOT render instruction element when instruction is omitted
- renders helper Caption when helper prop provided
- does NOT render helper element when helper is omitted
- renders description span when layout="inline" and description provided
- does NOT render description span in layout="stack"
- does NOT render description span when description omitted in inline layout

// ARIA wiring
- control has aria-describedby pointing to instruction id when instruction present
- control has aria-describedby pointing to helper id when helper present
- control has aria-describedby listing both ids when both present
- control does NOT have aria-describedby when neither instruction nor helper present
- control has aria-required="true" when required={true}
- control does NOT have aria-required when required={false}
- control has aria-invalid="true" when helperIntent="error"
- control does NOT have aria-invalid when helperIntent is not "error"
- control has disabled attribute when disabled={true}

// Label props
- Label renders required indicator (*) when required={true}
- Label has disabled appearance when disabled={true}

// Helper intent
- helper Caption has intent="error" class when helperIntent="error"
- helper Caption has intent="success" class when helperIntent="success"
- helper Caption has default intent when helperIntent omitted

// Layout
- root has .stack class by default
- root has .inline class when layout="inline"
- inline layout sets --field-label-width CSS custom property to "160px" by default
- inline layout sets --field-label-width to provided inlineLabelWidth value

// Forwarding
- forwards className to root div
- forwards ref not required on Field (it is a layout component)

// Responsive (via className check)
- inline layout root contains expected grid class

// Keyboard (integration)
- Tab focuses the child control
- child control is not focusable when disabled

// Axe
- axe: passes for stack layout with Input child
- axe: passes for stack layout with Textarea child
- axe: passes for inline layout with Input child
- axe: passes for stack layout with instruction and helper
- axe: passes for stack layout with helperIntent="error"
- axe: passes for stack layout with required={true}
- axe: passes for stack layout with disabled={true}
- axe: passes for inline layout with description
```

---

## Stories — `Field.stories.tsx`

Named exports required:

- `StackDefault` — label only, Input child
- `StackWithInstruction` — label + instruction + Input
- `StackWithHelper` — label + Input + helper (default intent)
- `StackError` — label + Input + helper (helperIntent="error") + invalid state
- `StackSuccess` — label + Input + helper (helperIntent="success")
- `StackRequired` — required={true}
- `StackDisabled` — disabled={true}
- `StackAllSlots` — label + instruction + Input + helper
- `StackWithTextarea` — label + instruction + Textarea
- `InlineDefault` — layout="inline", label + Input
- `InlineWithInstruction` — layout="inline", label + instruction + Input
- `InlineWithDescription` — layout="inline", label + Input + description ("Optional")
- `InlineAllSlots` — layout="inline", all text slots filled
- `InlineError` — layout="inline", helperIntent="error"
- `InlineLabelWidth` — layout="inline", inlineLabelWidth="200px"

`FocusInteraction` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const input = within(canvasElement).getByRole('textbox');
  await userEvent.tab();
  await expect(input).toHaveFocus();
};
```

`ErrorAnnouncement` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const input = within(canvasElement).getByRole('textbox');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAttribute('aria-describedby');
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
- [ ] All layout variants and slots represented in stories
- [ ] Inline layout collapses to stack below 640px (verify in Storybook viewport)
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color or spacing values in SCSS
- [ ] `--field-label-width` inline style exception documented in component JSDoc
- [ ] Exported from `packages/components/src/index.ts`

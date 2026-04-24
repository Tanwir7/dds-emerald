# RadioGroupField · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `RadioGroupField` component.
- Scaffold: `packages/components/src/components/RadioGroupField/`
- Radix primitive: none — composes `RadioGroup`, `Radio`, `Label`, and `Caption` atoms internally.
- Depends on: `Radio` atom (which exports `RadioGroup` and `Radio`), `Label` atom, `Caption` atom (all must be built first).

---

## Purpose

`RadioGroupField` is the standard molecule for a group of radio options with a group-level label above, optional instructional text, optional helper/error text below, and individual Radio items (which each have their own sibling `<Label>` for the option text).

This molecule differs from `Field` in two important ways:

1. The group label uses `aria-labelledby` (not `htmlFor`) because `RadioGroup` renders a `<div>`, not an `<input>`.
2. Each `Radio` item inside has its own option label — those are the consumer's responsibility and passed as `children`.

---

## Props

```ts
// Group label (above all options)
label: string                          // required — group-level label
required?: boolean                     // default: false
disabled?: boolean                     // default: false — disables all Radio children

// Text slots
instruction?: string                   // below group label, above options
helper?: string                        // below all options
helperIntent?: 'default' | 'error' | 'success'   // default: 'default'

// ID wiring — auto via useId()
id?: string                            // base id; label gets `${id}-label`

// RadioGroup atom props (all forwarded)
value?: string
defaultValue?: string
onValueChange?: (value: string) => void
orientation?: 'horizontal' | 'vertical'   // default: 'vertical'
name?: string

className?: string
children: React.ReactNode              // Radio + Label pairs (see Usage below)
```

---

## ID wiring — implementation detail

`RadioGroup` is a `<div>` — `<label htmlFor>` cannot point to a `<div>`. Use `aria-labelledby` instead:

```tsx
const generatedId   = useId();
const baseId        = id ?? generatedId;
const labelId       = `${baseId}-label`;
const instructionId = instruction ? `${baseId}-instruction` : undefined;
const helperId      = helper      ? `${baseId}-helper`      : undefined;

const describedBy = [instructionId, helperId].filter(Boolean).join(' ') || undefined;

<RadioGroup
  aria-labelledby={labelId}
  aria-describedby={describedBy}
  aria-required={required ? true : undefined}
  aria-invalid={helperIntent === 'error' ? true : undefined}
  disabled={disabled}
  ...radioGroupProps
>
  {children}
</RadioGroup>
```

The Label atom is rendered with `id={labelId}` (not `htmlFor`) because it labels a group, not a single input.

---

## Structure

```html
<div class="root">
  <!-- Group label — uses id, not htmlFor -->
  <span id="{labelId}" class="groupLabel">
    <!-- render Label atom, but as a <span> with id, not a <label> with htmlFor -->
    <!-- OR: render Label with as="span" if Label supports it -->
    {label} {required && <span aria-hidden="true" class="requiredMark">*</span>}
  </span>

  <!-- only if instruction provided -->
  <caption as="p" id="{instructionId}" class="instruction">
    {instruction}
  </caption>

  <!-- RadioGroup wraps all Radio + Label pairs -->
  <RadioGroup
    aria-labelledby="{labelId}"
    aria-describedby="{describedBy}"
    aria-required="{required}"
    aria-invalid="{helperIntent"
    =""
    =""
    ="error"
    }
    orientation="{orientation}"
    disabled="{disabled}"
    ...rest
  >
    {children}
  </RadioGroup>

  <!-- only if helper provided -->
  <caption as="p" id="{helperId}" intent="{helperIntent}" class="helper">
    {helper}
  </caption>
</div>
```

### Why a `<span>` and not a `<label>`?

`<label>` with `htmlFor` can only point to a labelable element (`input`, `textarea`, `select`, `button`, etc.). A `<div>` (RadioGroup root) is not labelable via `htmlFor`. Using `<label>` without a valid `htmlFor` causes an accessibility violation. The correct pattern for group labelling is `aria-labelledby` pointing to any element with an `id` — a `<span>` or styled `<p>` is correct here.

The group label span should visually match the `Label` atom's `base` size and weight. Reuse the Label's SCSS classes or extract a shared mixin.

---

## Usage pattern for consumers

The consumer composes `Radio` + `Label` pairs inside `RadioGroupField`:

```tsx
<RadioGroupField
  label="Notification frequency"
  instruction="Choose how often you want to receive updates"
  helper="You can change this in settings at any time"
  required
  name="frequency"
>
  <div className={styles.option}>
    <Radio id="freq-daily" value="daily" />
    <Label htmlFor="freq-daily">Daily</Label>
  </div>
  <div className={styles.option}>
    <Radio id="freq-weekly" value="weekly" />
    <Label htmlFor="freq-weekly">Weekly</Label>
  </div>
  <div className={styles.option}>
    <Radio id="freq-never" value="never" />
    <Label htmlFor="freq-never">Never</Label>
  </div>
</RadioGroupField>
```

The individual `Radio` + `Label` option pattern is the consumer's responsibility. `RadioGroupField` does not auto-generate option labels.

---

## Styles — `RadioGroupField.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: flex`
- `flex-direction: column`
- `gap: 0`

`.groupLabel`:

- `display: inline-flex`
- `align-items: center`
- `gap: var(--dds-space-1)`
- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)`
- `font-weight: var(--dds-font-weight-medium)`
- `color: var(--dds-color-text-default)`
- `margin-bottom: var(--dds-space-0-5)` — group label → instruction gap (2px)

`.requiredMark`:

- `color: var(--dds-color-status-danger)`
- `font-weight: var(--dds-font-weight-bold)`

`.groupLabelDisabled`:

- `opacity: 0.5`

`.instruction`:

- `margin-bottom: var(--dds-space-1-5)` — instruction → RadioGroup gap (6px)

`.helper`:

- `margin-top: var(--dds-space-2)` — RadioGroup → helper gap (8px — slightly larger than Field because the options group has its own internal spacing)

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- Never use `<label htmlFor>` to label a `<div>`. Always use `aria-labelledby` for group labelling.
- The group label element must have an `id` — this is not optional.
- Individual `Radio` items inside must each have their own `<Label htmlFor={radioId}>` — this is the consumer's responsibility, not the molecule's.
- `disabled` on `RadioGroupField` is forwarded to `RadioGroup`, which propagates to all `Radio` children (Radix behaviour).
- `aria-invalid` on the `RadioGroup` signals that the group-level selection is invalid — individual radio items do not need `aria-invalid`.

---

## Accessibility

- `aria-labelledby={labelId}` on `RadioGroup` provides the group's accessible name.
- `aria-describedby` on `RadioGroup` lists instruction and helper for full context.
- `aria-required={true}` on `RadioGroup` when required.
- `aria-invalid={true}` on `RadioGroup` when `helperIntent="error"`.
- Arrow key navigation between options is handled by Radix `RadioGroup`.
- `Tab` enters the group, arrow keys navigate within it — standard radio group keyboard pattern.
- Required `*` indicator is `aria-hidden="true"` — required state communicated via `aria-required`.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a div with role="radiogroup"
- renders group label span with correct text
- group label span has correct id attribute
- RadioGroup has aria-labelledby matching group label id
- auto-generates id when no id prop provided
- uses provided id when id prop given
- renders instruction Caption when instruction provided
- does NOT render instruction when omitted
- renders helper Caption when helper provided
- does NOT render helper when omitted
- renders children (Radio options) inside RadioGroup

// ARIA wiring
- RadioGroup has aria-describedby including instruction id when present
- RadioGroup has aria-describedby including helper id when present
- RadioGroup has aria-describedby listing both ids when both present
- RadioGroup does NOT have aria-describedby when neither slot provided
- RadioGroup has aria-required="true" when required={true}
- RadioGroup has aria-invalid="true" when helperIntent="error"
- RadioGroup does NOT have aria-invalid when helperIntent is not "error"

// Group label required/disabled
- group label span renders required mark (*) when required={true}
- required mark has aria-hidden="true"
- group label applies .groupLabelDisabled when disabled={true}

// RadioGroup forwarding
- orientation="horizontal" forwarded to RadioGroup
- value prop forwarded (controlled)
- onValueChange fires when Radio selected
- disabled forwarded — all Radio children are disabled

// Helper intent
- helper has intent="error" when helperIntent="error"
- helper has intent="success" when helperIntent="success"

// Keyboard
- Tab focuses first Radio in group
- ArrowDown moves to next Radio
- ArrowUp moves to previous Radio
- disabled group — no Radio is focusable

// Axe
- axe: passes for default (vertical, no slots)
- axe: passes for horizontal orientation
- axe: passes with instruction and helper
- axe: passes when required={true}
- axe: passes when disabled={true}
- axe: passes when helperIntent="error"
- axe: passes with one option selected
- axe: passes when children include Radio + Label pairs with htmlFor/id
```

---

## Stories — `RadioGroupField.stories.tsx`

Named exports required:

- `Default` — vertical, no selection, basic options
- `WithSelection` — one option pre-selected
- `Horizontal` — orientation="horizontal"
- `WithInstruction` — instruction text above options
- `WithHelper` — helper text below options
- `Error` — helperIntent="error", helper message
- `Success` — helperIntent="success"
- `Required` — required={true}
- `Disabled` — disabled={true}
- `AllSlots` — all text slots populated, required
- `Controlled` — useState-driven value with live display

`KeyboardNavigation` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const radios = within(canvasElement).getAllByRole('radio');
  await userEvent.tab();
  await expect(radios[0]).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect(radios[1]).toHaveFocus();
};
```

`SelectOption` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const radios = within(canvasElement).getAllByRole('radio');
  await userEvent.click(radios[1]);
  await expect(radios[1]).toHaveAttribute('aria-checked', 'true');
  await expect(radios[0]).toHaveAttribute('aria-checked', 'false');
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
- [ ] Group label uses `aria-labelledby` — never `htmlFor` on a `<div>`
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color or spacing values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

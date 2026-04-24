# SwitchField · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `SwitchField` component.
- Scaffold: `packages/components/src/components/SwitchField/`
- Radix primitive: none — composes `Switch`, `Label`, and `Caption` atoms internally.
- Depends on: `Switch` atom, `Label` atom, `Caption` atom (all must be built first).

---

## Purpose

`SwitchField` is the standard molecule for a toggle switch with an associated label beside it, an optional short description beside the label (e.g. "Recommended", "Beta"), optional instructional text above the row, and optional helper/error text below the row.

Supports `labelPosition="right"` (default — switch on left, label on right) and `labelPosition="left"` (label on left, switch on right — common in settings panels).

---

## Props

```ts
// Label
label: string                         // required
labelPosition?: 'right' | 'left'      // default: 'right'
description?: string                  // short annotation beside label (e.g. "Recommended")
required?: boolean                    // default: false
disabled?: boolean                    // default: false

// Text slots
instruction?: string                  // above the switch+label row
helper?: string                       // below the switch+label row
helperIntent?: 'default' | 'error' | 'success'   // default: 'default'

// ID wiring — auto via useId() if not provided
id?: string

// Switch atom props (all forwarded)
size?: 'sm' | 'md'                    // default: 'md'
checked?: boolean
defaultChecked?: boolean
onCheckedChange?: (checked: boolean) => void
invalid?: boolean
name?: string
value?: string

className?: string
```

---

## ID wiring — implementation detail

```tsx
const generatedId   = useId();
const switchId      = id ?? generatedId;
const instructionId = instruction ? `${switchId}-instruction` : undefined;
const helperId      = helper      ? `${switchId}-helper`      : undefined;
const descriptionId = description ? `${switchId}-desc`        : undefined;

const describedBy = [instructionId, descriptionId, helperId]
  .filter(Boolean).join(' ') || undefined;

<Switch
  id={switchId}
  aria-describedby={describedBy}
  aria-required={required ? true : undefined}
  aria-invalid={helperIntent === 'error' || invalid ? true : undefined}
  disabled={disabled}
  ...switchProps
/>
```

Note: `descriptionId` is included in `aria-describedby` so screen readers announce the description alongside helper text when the switch is focused.

---

## Structure

```html
<div class="root">
  <!-- only if instruction provided -->
  <caption as="p" id="{instructionId}" class="instruction">
    {instruction}
  </caption>

  <div class="row [labelLeft?]">
    <!-- DOM order always: Switch first, then label group -->
    <!-- Visual order swapped via CSS for labelPosition="left" -->

    <Switch
      id="{switchId}"
      size="{size}"
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

    <div class="labelGroup">
      <label htmlFor="{switchId}" required="{required}" disabled="{disabled}"> {label} </label>
      <!-- only if description provided -->
      <span id="{descriptionId}" class="description"> {description} </span>
    </div>
  </div>

  <!-- only if helper provided -->
  <caption as="p" id="{helperId}" intent="{helperIntent}" class="helper">
    {helper}
  </caption>
</div>
```

---

## Styles — `SwitchField.module.scss`

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
- `gap: var(--dds-space-3)` — switch ↔ labelGroup gap (12px — slightly wider than CheckboxField because switch is wider)

`.labelLeft`:

- Applied to `.row` when `labelPosition="left"`
- `flex-direction: row-reverse` — CSS-only visual swap; DOM order unchanged

`.labelGroup`:

- `display: flex`
- `flex-direction: row`
- `align-items: center`
- `gap: var(--dds-space-2)` — label ↔ description gap (8px)
- `flex: 1` — takes remaining width (important for labelPosition="left" settings layout)

`.description`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `color: var(--dds-color-text-muted)`
- `white-space: nowrap`

`.helper`:

- `margin-top: var(--dds-space-1)` — row → helper gap (4px)
- `padding-left: calc(44px + var(--dds-space-3))` — indent under label text
  - md switch width = 44px + gap 12px
  - sm switch: `calc(32px + var(--dds-space-3))`

No hardcoded values (switch pixel widths come from documented Switch atom sizes: 32px sm, 44px md). No Tailwind. No inline styles.

---

## Critical design rules

- DOM order is always: Switch first, Label group second — CSS only for visual reversal.
- `labelPosition="left"` with `flex: 1` on `.labelGroup` creates the full-width settings row pattern (label stretches to fill space, switch stays right-aligned).
- Helper text indentation aligns with the label text baseline, not the switch.
- `invalid` and `helperIntent="error"` both drive `aria-invalid` — they are treated as equivalent.
- `description` is included in `aria-describedby` — it is not purely decorative for screen reader users.

---

## Accessibility

- `Label` is associated via `htmlFor` / `id` (Radix Switch root is a `<button>`, which `<label>` can label).
- `aria-describedby` covers instruction, description, and helper ids — providing full context on focus.
- `aria-required` and `aria-invalid` forwarded to the Switch button.
- `disabled` removes switch from tab order (Radix behaviour).
- `description` span has an `id` so screen readers can read it via `aria-describedby`.
- Space bar toggles switch (Radix built-in).

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a switch with role="switch"
- renders a label element with correct text
- label htmlFor matches switch id
- auto-generates id when no id prop provided
- uses provided id when id prop given
- renders instruction Caption when instruction provided
- does NOT render instruction when omitted
- renders helper Caption when helper provided
- does NOT render helper when omitted
- renders description span when description provided
- does NOT render description when omitted
- description span has an id attribute

// Label position
- default labelPosition="right": Switch precedes labelGroup in DOM
- labelPosition="left": Switch still precedes labelGroup in DOM
- labelPosition="left": applies .labelLeft class to row

// ARIA wiring
- switch has aria-describedby including instruction id when present
- switch has aria-describedby including description id when present
- switch has aria-describedby including helper id when present
- switch has aria-describedby listing all three ids when all present
- switch does NOT have aria-describedby when no text slots provided
- switch has aria-required="true" when required={true}
- switch has aria-invalid="true" when helperIntent="error"
- switch has aria-invalid="true" when invalid={true}

// Label props
- Label shows required indicator when required={true}
- Label is disabled when disabled={true}

// Switch forwarding
- size="sm" forwarded to Switch
- checked prop forwarded
- onCheckedChange fires on click
- disabled forwarded

// Helper indent
- helper has correct padding class for size="md"
- helper has correct padding class for size="sm"

// Keyboard
- Tab focuses the switch
- Space toggles the switch
- disabled switch is not focusable

// Axe
- axe: passes for default (right label, no slots)
- axe: passes for labelPosition="left"
- axe: passes with description
- axe: passes with instruction and helper
- axe: passes when required={true}
- axe: passes when disabled={true}
- axe: passes when helperIntent="error"
- axe: passes when checked={true}
```

---

## Stories — `SwitchField.stories.tsx`

Named exports required:

- `Default` — label right, unchecked
- `LabelLeft` — labelPosition="left", full-width settings row style
- `Checked` — defaultChecked={true}
- `WithDescription` — description="Recommended"
- `WithInstruction` — instruction text above
- `WithHelper` — helper text below
- `Error` — helperIntent="error", invalid
- `Success` — helperIntent="success"
- `Required` — required={true}
- `Disabled` — disabled={true}
- `SizeSmall` — size="sm"
- `SettingsRow` — labelPosition="left", description="Beta", helper — demonstrating full settings panel pattern
- `AllSlots` — all text slots populated

`Toggle` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const sw = within(canvasElement).getByRole('switch');
  await expect(sw).toHaveAttribute('aria-checked', 'false');
  await userEvent.click(sw);
  await expect(sw).toHaveAttribute('aria-checked', 'true');
};
```

`KeyboardToggle` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const sw = within(canvasElement).getByRole('switch');
  await userEvent.tab();
  await expect(sw).toHaveFocus();
  await userEvent.keyboard(' ');
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
- [ ] DOM order always Switch → LabelGroup regardless of labelPosition
- [ ] Helper indentation aligns with label text for both sizes
- [ ] labelPosition="left" creates a full-width settings row (verify in Storybook)
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color or spacing values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

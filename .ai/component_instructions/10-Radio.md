# Radio · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Radio` component (the single option item, not the group).
- Scaffold: `packages/components/src/components/Radio/`
- Radix primitive: `@radix-ui/react-radio-group` (`RadioGroup.Item` + `RadioGroup.Indicator`)

---

## Props

### `Radio` (single item — `RadioGroup.Item`):

```ts
value: string              // required — Radix RadioGroup.Item value
size?: 'sm' | 'md'        // default: 'md'
disabled?: boolean         // default: false
invalid?: boolean          // default: false
id?: string
className?: string
```

### `RadioGroup` (group wrapper — `RadioGroup.Root`):

```ts
value?: string                      // controlled selected value
defaultValue?: string               // uncontrolled
onValueChange?: (value: string) => void
disabled?: boolean                  // disables all items
orientation?: 'horizontal' | 'vertical'   // default: 'vertical'
name?: string                       // native form name
required?: boolean
className?: string
children: React.ReactNode
```

Export both `Radio` and `RadioGroup` from `index.ts`.

Forward `ref` on `Radio` typed to `HTMLButtonElement` (Radix Item is a `<button>`).
Forward `ref` on `RadioGroup` typed to `HTMLDivElement`.

---

## Styles — `Radio.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root` (the `<button>` from Radix RadioGroup.Item):

- `display: inline-flex`
- `align-items: center`
- `justify-content: center`
- `flex-shrink: 0`
- `border-radius: var(--dds-radius-full)` — **Radio is the ONLY input that uses full radius**
- `border: 2px solid var(--dds-color-border-input)`
- `background-color: var(--dds-color-bg-input)`
- `cursor: pointer`
- `outline: 3px solid transparent`
- `outline-offset: 2px`
- `transition: background-color, border-color, outline-color — var(--dds-duration-fast) var(--dds-ease-standard)`

States:

- `&[data-state="checked"]` → `border-color: var(--dds-color-action-primary)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`
- `&:hover:not([data-disabled])` → `border-color: var(--dds-color-action-primary)`
- `&[data-disabled]` → `opacity: 0.5; cursor: not-allowed`

`.indicator` (Radix RadioGroup.Indicator child — the filled dot):

- `display: flex; align-items: center; justify-content: center`
- Inner dot: `width: 8px; height: 8px; border-radius: var(--dds-radius-full); background-color: var(--dds-color-action-primary)`
- Indeterminate not applicable to Radio — only checked/unchecked

Invalid modifier `.invalid`:

- `border-color: var(--dds-color-status-danger)`
- `&[data-state="checked"]` → `border-color: var(--dds-color-status-danger)`
- Inner dot when invalid: `background-color: var(--dds-color-status-danger)`

Size modifiers:

- `.sm` → `width: 16px; height: 16px` (dot: 6px)
- `.md` → `width: 20px; height: 20px` (dot: 8px)

`.group` (RadioGroup wrapper `<div>`):

- `display: flex`
- `gap: var(--dds-space-2)`
- `.vertical` → `flex-direction: column`
- `.horizontal` → `flex-direction: row; flex-wrap: wrap`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-full)` on the Radio item — this is INTENTIONAL and the only non-Avatar element allowed full radius. It is a circle because that is the universal convention for radio buttons.
- The inner dot indicator also uses `var(--dds-radius-full)`.
- Use Radix `data-state` and `data-disabled` for styling — no separate checked/disabled class names.
- `RadioGroup` is always the parent — `Radio` items must not be rendered without a `RadioGroup`.

---

## Accessibility

- Radix RadioGroup handles `role="radiogroup"` on the wrapper and `role="radio"` on each item.
- `aria-checked` is managed by Radix — do not set manually.
- Arrow keys navigate between options (Radix built-in) — do not override keyboard handling.
- `id` on `Radio` allows a sibling `<Label htmlFor={id}>` to associate correctly.
- `orientation` prop sets `aria-orientation` on the group (Radix handles this).
- `required` on the group sets `aria-required` (Radix handles this).
- `invalid` on individual items: pass `aria-invalid="true"` via forwarded props from the consumer.

---

## TDD — write ALL tests before implementing

```
- RadioGroup renders a div with role="radiogroup"
- Radio renders a button with role="radio"
- Radio has aria-checked="false" when not selected
- Radio has aria-checked="true" when its value matches RadioGroup value
- RadioGroup forwards className to wrapper
- Radio forwards className to button
- RadioGroup forwards ref to HTMLDivElement
- Radio forwards ref to HTMLButtonElement
- Radio applies .md class by default
- Radio applies .sm class when size="sm"
- Radio applies .invalid class when invalid={true}
- RadioGroup orientation="vertical" applies .vertical class (default)
- RadioGroup orientation="horizontal" applies .horizontal class
- Radio disabled={true} sets data-disabled attribute
- RadioGroup disabled={true} disables all child Radio items
- calls onValueChange with correct value when Radio is clicked
- does not call onValueChange when Radio is disabled
- renders Indicator (dot) when Radio is selected
- does not render Indicator when Radio is unselected
- keyboard: Tab focuses first unchecked/selected Radio
- keyboard: ArrowDown moves to next Radio
- keyboard: ArrowUp moves to previous Radio
- keyboard: disabled Radio is skipped during arrow navigation
- axe: passes for default group (vertical)
- axe: passes for horizontal group
- axe: passes when one item is selected
- axe: passes when one item is disabled
- axe: passes when invalid item has aria-invalid forwarded
```

---

## Stories — `Radio.stories.tsx`

Named exports required:

- `Default` (vertical group, no selection)
- `Selected` (one item pre-selected)
- `Horizontal` (orientation="horizontal")
- `Disabled` (one item disabled)
- `AllDisabled` (group-level disabled)
- `Invalid` (one item with invalid={true})
- `Sizes` (sm vs md side by side, same group)
- `Controlled` (useState-driven value)
- `WithLabels` (each Radio paired with a Label)
- `FocusNavigation` with `play()`:
  ```ts
  play: async ({ canvasElement }) => {
    const radios = within(canvasElement).getAllByRole('radio');
    await userEvent.tab();
    await expect(radios[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(radios[1]).toHaveFocus();
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
- [ ] Both `Radio` and `RadioGroup` exported from `packages/components/src/index.ts`

# Slider · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Slider` component.
- Scaffold: `packages/components/src/components/Slider/`
- Radix primitive: `@radix-ui/react-slider`

---

## Props

```ts
min?: number                          // default: 0
max?: number                          // default: 100
step?: number                         // default: 1
value?: number[]                      // controlled (array for range support)
defaultValue?: number[]               // uncontrolled
onValueChange?: (value: number[]) => void
onValueCommit?: (value: number[]) => void
disabled?: boolean                    // default: false
orientation?: 'horizontal' | 'vertical'  // default: 'horizontal'
size?: 'sm' | 'md'                    // default: 'md' — track thickness
minStepsBetweenThumbs?: number        // for range sliders
name?: string
className?: string
```

Compose using Radix `Slider.Root`, `Slider.Track`, `Slider.Range`, and `Slider.Thumb`. Forward `ref` typed to `HTMLSpanElement` (Radix Slider root). Spread remaining non-Radix props onto Root.

---

## Styles — `Slider.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root` (Radix Slider.Root):

- `position: relative`
- `display: flex`
- `align-items: center`
- `user-select: none`
- `touch-action: none`
- `width: 100%` (horizontal) / `height: 100%` (vertical)

`.track` (Radix Slider.Track):

- `background-color: var(--dds-color-bg-subtle)`
- `border-radius: var(--dds-radius-full)` — **track uses full radius — documented exception**
- `position: relative`
- `flex-grow: 1`
- Size `.sm` horizontal: `height: 4px`
- Size `.md` horizontal: `height: 6px` (default)
- Vertical: swap height/width

`.range` (Radix Slider.Range — the filled portion):

- `position: absolute`
- `background-color: var(--dds-color-action-primary)`
- `border-radius: var(--dds-radius-full)`
- `height: 100%` (horizontal)

`.thumb` (Radix Slider.Thumb — the draggable handle):

- `display: block`
- `border-radius: var(--dds-radius-full)`
- `background-color: var(--dds-color-action-primary)`
- `border: 2px solid white`
- `box-shadow: var(--dds-shadow-sm)`
- `cursor: grab`
- `&:active` → `cursor: grabbing`
- `outline: 3px solid transparent`
- `outline-offset: 2px`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`
- Size `.sm` thumb: `width: 16px; height: 16px`
- Size `.md` thumb: `width: 20px; height: 20px` (default)
- `transition: outline-color — var(--dds-duration-fast) var(--dds-ease-standard)`

Disabled state:

- `.root[data-disabled]` → `opacity: 0.5`
- `.thumb[data-disabled]` → `cursor: not-allowed`

No hardcoded values (thumb border white is a documented exception). No Tailwind. No inline styles.

---

## Critical design rules

- Track, range, and thumb all use `var(--dds-radius-full)` — these are explicitly documented exceptions to the zero-radius rule, like ProgressBar.
- Thumb border is `2px solid white` — documented exception to ensure thumb is always visible against the filled range.
- Do NOT use any CSS that relies on `::-webkit-slider-thumb` — this is not a native `<input type="range">`. It uses Radix's span-based slider.
- Range slider is supported via the `value` array — if `value` has two items, two thumbs are rendered by Radix automatically.

---

## Accessibility

- Radix Slider handles `role="slider"` on each thumb with correct `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext`.
- Arrow keys move thumbs (Radix built-in): ← → for horizontal, ↑ ↓ for vertical.
- Home / End jump to min/max (Radix built-in).
- Page Up / Page Down move by 10% of range (Radix built-in).
- `aria-label` or `aria-labelledby` should be forwarded from the consumer — pass through via spread props onto Root.
- Each thumb receives an `aria-label` from Radix; for range sliders the consumer may need to pass `aria-label` array via Radix's API.
- `disabled` maps to `data-disabled` — Radix removes keyboard interaction.
- Focus ring: `outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5); outline-offset: 2px`

---

## TDD — write ALL tests before implementing

```
- renders a slider with role="slider" on the thumb
- thumb has aria-valuenow=0 by default (min=0, defaultValue=[0])
- thumb has aria-valuemin matching min prop
- thumb has aria-valuemax matching max prop
- forwards className to root element
- forwards ref to root HTMLSpanElement
- applies .md class by default
- applies .sm class when size="sm"
- renders two thumbs for range slider (value=[20,80])
- calls onValueChange when thumb is moved
- does not call onValueChange when disabled
- forwards disabled (data-disabled on root)
- orientation="horizontal" renders track with horizontal layout
- orientation="vertical" renders track with vertical layout
- forwards name prop to Radix Root
- keyboard: thumb receives focus on Tab
- keyboard: ArrowRight increases value (horizontal)
- keyboard: ArrowLeft decreases value (horizontal)
- keyboard: Home sets value to min
- keyboard: End sets value to max
- keyboard: disabled thumb does not respond to arrow keys
- axe: passes for default horizontal slider
- axe: passes for vertical slider
- axe: passes for range slider (two thumbs)
- axe: passes when disabled
- axe: passes with aria-label forwarded
```

---

## Stories — `Slider.stories.tsx`

Named exports required:

- `Default` (horizontal, md, single thumb, 0-100)
- `Sizes` (sm and md stacked)
- `Range` (two-thumb range, value=[20,80])
- `Vertical` (orientation="vertical", fixed height container)
- `WithSteps` (step=10)
- `Disabled`
- `Controlled` (useState, showing live value label)
- `KeyboardInteraction` with `play()`:
  ```ts
  play: async ({ canvasElement }) => {
    const thumb = within(canvasElement).getByRole('slider');
    await userEvent.tab();
    await expect(thumb).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '1');
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
- [ ] No hardcoded color or spacing values in SCSS (thumb/track border white — documented exception)
- [ ] Exported from `packages/components/src/index.ts`

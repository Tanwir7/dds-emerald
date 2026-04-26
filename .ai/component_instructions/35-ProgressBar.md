# ProgressBar · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `ProgressBar` component.
- Scaffold: `packages/components/src/components/ProgressBar/`
- Radix primitive: `@radix-ui/react-progress`
- Strategy reference: Phase 4 component #18 — "3 sizes, 5 variants — `rounded-full` exception"

---

## Props

```ts
value?: number           // 0–100, default: 0. undefined = indeterminate
max?: number             // default: 100
size?: 'sm' | 'md' | 'lg'  // default: 'md'
variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'  // default: 'default'
label?: string           // accessible label for the progress bar
showValue?: boolean      // default: false — renders "N%" text beside the bar
animated?: boolean       // default: true — fill transition animation
className?: string
```

When `value` is `undefined`, render as indeterminate (animated sliding bar, `aria-valuenow` omitted).

Compose using Radix `Progress.Root` and `Progress.Indicator`. Forward `ref` typed to `HTMLDivElement`. Spread remaining non-Radix props.

---

## Variant token mapping (fill colour)

| Variant   | Fill colour                       |
| --------- | --------------------------------- |
| `default` | `var(--dds-color-action-primary)` |
| `success` | `var(--dds-color-status-success)` |
| `warning` | `var(--dds-color-status-warning)` |
| `danger`  | `var(--dds-color-status-danger)`  |
| `info`    | `var(--dds-color-status-info)`    |

Track background: `var(--dds-color-bg-subtle)` for all variants.

---

## Styles — `ProgressBar.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root` (Radix Progress.Root `<div>`):

- `position: relative`
- `width: 100%`
- `overflow: hidden`
- `background-color: var(--dds-color-bg-subtle)`
- `border-radius: var(--dds-radius-full)` — **documented exception; required by strategy Phase 4 note**

Size modifiers (track height):

- `.sm` → `height: 4px`
- `.md` → `height: 8px` (default)
- `.lg` → `height: 12px`

`.indicator` (Radix Progress.Indicator `<div>`):

- `height: 100%`
- `border-radius: var(--dds-radius-full)` — matches track
- `transition: width var(--dds-duration-normal) var(--dds-ease-standard)`
- Width is set by Radix via transform: `transform: translateX(-${100 - value}%)`

Variant fill modifiers:

- `.variantDefault` → `background-color: var(--dds-color-action-primary)`
- `.variantSuccess` → `background-color: var(--dds-color-status-success)`
- `.variantWarning` → `background-color: var(--dds-color-status-warning)`
- `.variantDanger` → `background-color: var(--dds-color-status-danger)`
- `.variantInfo` → `background-color: var(--dds-color-status-info)`

Indeterminate animation (when `value` is undefined):

```scss
.indeterminate .indicator {
  width: 40% !important; // override Radix transform-based width
  animation: indeterminate var(--dds-duration-slow) ease-in-out infinite;
}

@keyframes indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(350%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .indeterminate .indicator {
    animation: none;
    width: 100% !important;
    opacity: 0.4;
  }
}
```

No-animation modifier (when `animated={false}`):

- `.noAnimation .indicator` → `transition: none`

`.wrapper` (outer flex container when `showValue={true}`):

- `display: flex`
- `align-items: center`
- `gap: var(--dds-space-2)`

`.valueLabel`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `font-weight: var(--dds-font-weight-medium)`
- `color: var(--dds-color-text-muted)`
- `white-space: nowrap`
- `min-width: var(--dds-space-8)` — prevents layout shift as value changes
- `text-align: right`

No hardcoded values. No Tailwind. No inline styles.

---

## Structure

```tsx
<div className={clsx(styles.wrapper, className)}>
  <Progress.Root
    ref={ref}
    value={value ?? null} // null = indeterminate in Radix
    max={max}
    aria-label={label}
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={max}
    className={clsx(
      styles.root,
      styles[size],
      value === undefined && styles.indeterminate,
      !animated && styles.noAnimation
    )}
  >
    <Progress.Indicator
      className={clsx(styles.indicator, styles[`variant${capitalise(variant)}`])}
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </Progress.Root>

  {showValue && value !== undefined && (
    <span className={styles.valueLabel} aria-hidden="true">
      {Math.round(value)}%
    </span>
  )}
</div>
```

Note: `aria-hidden="true"` on the value label — the `aria-valuenow` on the Radix root already provides this to screen readers.

---

## Critical design rules

- `border-radius: var(--dds-radius-full)` on both track and indicator — **explicitly documented as a Phase 4 exception in the strategy**.
- `value={null}` triggers Radix's indeterminate state — `undefined` in the DDS prop maps to `null` for Radix.
- `aria-label` is required for screen reader context — log a dev warning if neither `label` nor `aria-labelledby` is provided.
- Value label is `aria-hidden` — `aria-valuenow` provides the value to screen readers.
- `prefers-reduced-motion` must stop the indeterminate animation.

---

## Accessibility

- Radix Progress handles `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
- `aria-label={label}` provides the accessible name — consumer must supply this.
- Indeterminate state: `aria-valuenow` is omitted when `value={null}` (Radix behaviour).
- `aria-valuetext` can be forwarded by the consumer for custom text like "Loading profile…".

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a progressbar role element (Radix root)
- renders Progress.Indicator inside root
- forwards className to wrapper div
- forwards ref to Radix root HTMLDivElement

// Value
- has aria-valuenow=0 when value={0}
- has aria-valuenow=50 when value={50}
- has aria-valuenow=100 when value={100}
- does NOT have aria-valuenow when value is undefined (indeterminate)
- has aria-valuemin=0
- has aria-valuemax=100
- has aria-valuemax=200 when max={200}

// Aria label
- has aria-label matching label prop

// Sizes
- applies .md class by default
- applies .sm class when size="sm"
- applies .lg class when size="lg"

// Variants
- applies .variantDefault by default
- applies .variantSuccess when variant="success"
- applies .variantWarning when variant="warning"
- applies .variantDanger when variant="danger"
- applies .variantInfo when variant="info"

// Indeterminate
- applies .indeterminate class when value is undefined
- does NOT apply .indeterminate when value is a number

// showValue
- does NOT render value label by default
- renders "50%" label when showValue={true} and value={50}
- value label has aria-hidden="true"
- does NOT render value label when indeterminate (value=undefined)

// animated
- does NOT apply .noAnimation by default
- applies .noAnimation when animated={false}

// Axe
- axe: passes for value=50
- axe: passes for value=0
- axe: passes for value=100
- axe: passes for indeterminate (value=undefined)
- axe: passes for all size variants
- axe: passes for all variant modifiers
- axe: passes with showValue={true}
```

---

## Stories — `ProgressBar.stories.tsx`

Named exports required:

- `Default` — value=60, label="Upload progress"
- `Sizes` — sm / md / lg at value=60 stacked
- `Variants` — all 5 variants at value=60 stacked
- `Zero` — value=0
- `Complete` — value=100
- `Indeterminate` — value=undefined
- `WithValueLabel` — showValue={true}
- `Animated` — showValue, value animates 0→100 via setTimeout in story
- `NoAnimation` — animated={false}

`AnimateToFull` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const bar = within(canvasElement).getByRole('progressbar');
  await expect(bar).toHaveAttribute('aria-valuenow', '0');
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
- [ ] `border-radius: var(--dds-radius-full)` on both track and indicator — strategy exception documented
- [ ] `prefers-reduced-motion` stops indeterminate animation
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

# ProgressRing · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `ProgressRing` component.
- Scaffold: `packages/components/src/components/ProgressRing/`
- Radix primitive: none — SVG-based (Radix Progress does not support circular output)

---

## Purpose

`ProgressRing` is a circular progress indicator built from SVG. It renders a track ring and a fill arc driven by `stroke-dasharray` / `stroke-dashoffset`. It supports determinate (0–100) and indeterminate (spinning arc) states, optional centre label, and the same 5 intents as `ProgressBar`.

---

## Props

```ts
value?: number               // 0–100. undefined = indeterminate
max?: number                 // default: 100
size?: 'sm' | 'md' | 'lg'  // default: 'md'
variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'  // default: 'default'
label?: string               // aria-label for the ring
showValue?: boolean          // default: false — renders "N%" in the centre
strokeWidth?: number         // default depends on size (see below)
animated?: boolean           // default: true — arc transition
className?: string
```

Renders a `<span>` wrapper containing an `<svg>`. Forward `ref` typed to `HTMLSpanElement`. No `role="progressbar"` is added by this component directly — it is set on the wrapper span.

---

## SVG implementation

### Geometry

```tsx
const sizeMap = { sm: 32, md: 48, lg: 64 }; // SVG viewBox dimension
const strokeMap = { sm: 3, md: 4, lg: 5 }; // default stroke width

const svgSize = sizeMap[size];
const stroke = strokeWidth ?? strokeMap[size];
const radius = (svgSize - stroke) / 2; // radius inset by stroke/2
const circumference = 2 * Math.PI * radius; // full circle perimeter

// Determinate: offset = circumference * (1 - value/max)
// 0% → fully offset (no arc visible)
// 100% → offset 0 (full arc visible)
const offset = value !== undefined ? circumference * (1 - value / max) : circumference * 0.75; // indeterminate arc shows 25% of ring
```

### SVG structure

```tsx
<span
  role="progressbar"
  aria-label={label}
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={max}
  className={clsx(styles.root, styles[size], className)}
  ref={ref}
>
  <svg
    viewBox={`0 0 ${svgSize} ${svgSize}`}
    width={svgSize}
    height={svgSize}
    aria-hidden="true"
    className={clsx(
      styles.svg,
      value === undefined && styles.indeterminate,
      !animated && styles.noAnimation
    )}
  >
    {/* Track */}
    <circle
      className={styles.track}
      cx={svgSize / 2}
      cy={svgSize / 2}
      r={radius}
      fill="none"
      strokeWidth={stroke}
    />
    {/* Fill arc */}
    <circle
      className={clsx(styles.arc, styles[`variant${capitalise(variant)}`])}
      cx={svgSize / 2}
      cy={svgSize / 2}
      r={radius}
      fill="none"
      strokeWidth={stroke}
      strokeDasharray={circumference}
      strokeDashoffset={offset}
      strokeLinecap="round"
      style={{ transformOrigin: 'center' }}
    />
  </svg>

  {/* Centre value label */}
  {showValue && value !== undefined && (
    <span className={styles.valueLabel} aria-hidden="true">
      {Math.round(value)}%
    </span>
  )}
</span>
```

---

## Styles — `ProgressRing.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `position: relative`
- `display: inline-flex`
- `align-items: center`
- `justify-content: center`
- `flex-shrink: 0`

`.svg`:

- `transform: rotate(-90deg)` — start arc at top (12 o'clock)
- `transition: stroke-dashoffset var(--dds-duration-normal) var(--dds-ease-standard)`

`.noAnimation`:

- `transition: none`

`.track`:

- `stroke: var(--dds-color-bg-subtle)`

`.arc` (the fill):

- `transition: stroke-dashoffset var(--dds-duration-normal) var(--dds-ease-standard)`

Variant modifiers on `.arc`:

- `.variantDefault` → `stroke: var(--dds-color-action-primary)`
- `.variantSuccess` → `stroke: var(--dds-color-status-success)`
- `.variantWarning` → `stroke: var(--dds-color-status-warning)`
- `.variantDanger` → `stroke: var(--dds-color-status-danger)`
- `.variantInfo` → `stroke: var(--dds-color-status-info)`

Indeterminate animation:

```scss
.indeterminate {
  animation: ringRotate var(--dds-duration-slow) linear infinite;
}

@keyframes ringRotate {
  from {
    transform: rotate(-90deg);
  }
  to {
    transform: rotate(270deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .indeterminate {
    animation: none;
  }
  .indeterminate .arc {
    stroke-dashoffset: 0; // show full ring at low opacity
    opacity: 0.3;
  }
}
```

`.valueLabel`:

- `position: absolute`
- `font-family: var(--dds-font-sans)`
- `font-weight: var(--dds-font-weight-semibold)`
- `color: var(--dds-color-text-default)`
- Per size:
  - `.sm .valueLabel` → `font-size: var(--dds-font-size-xs)` (ring too small — omit showValue for sm in practice)
  - `.md .valueLabel` → `font-size: var(--dds-font-size-xs)`
  - `.lg .valueLabel` → `font-size: var(--dds-font-size-sm)`

No hardcoded values. No Tailwind. No inline styles (except `transformOrigin: 'center'` on the arc circle for animation correctness — documented exception).

---

## Critical design rules

- `transform: rotate(-90deg)` on the SVG element is required to start the arc at 12 o'clock — NOT on the arc circle itself.
- `strokeLinecap="round"` on the fill arc gives rounded endpoints — consistent with ProgressBar's rounded track.
- `aria-hidden="true"` on the `<svg>` — accessibility is handled by the wrapper `<span role="progressbar">`.
- `prefers-reduced-motion` must stop the indeterminate rotation.
- `transformOrigin: 'center'` on the arc is an inline style — documented exception because SVG `transform-origin` requires the geometric centre of the element, which must be computed.
- No `border-radius` needed — this is SVG, not CSS.

---

## Accessibility

- Wrapper `<span>` has `role="progressbar"`, `aria-label`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
- Indeterminate state: `aria-valuenow` is omitted.
- `<svg>` has `aria-hidden="true"`.
- Value label span has `aria-hidden="true"` — `aria-valuenow` communicates the value to screen readers.
- Warn in development if `label` is not provided.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a span with role="progressbar"
- renders an SVG inside the span
- SVG has aria-hidden="true"
- forwards className to root span
- forwards ref to root HTMLSpanElement

// Value
- has aria-valuenow=0 when value={0}
- has aria-valuenow=50 when value={50}
- has aria-valuenow=100 when value={100}
- does NOT have aria-valuenow when value is undefined (indeterminate)
- has aria-valuemin=0
- has aria-valuemax=100 by default
- has aria-valuemax=50 when max={50}

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
- applies .indeterminate class to SVG when value is undefined
- does NOT apply .indeterminate when value is a number

// showValue
- does NOT render value label by default
- renders "50%" label when showValue={true} and value={50}
- value label has aria-hidden="true"
- does NOT render value label when indeterminate

// animated
- applies .noAnimation class when animated={false}

// Axe
- axe: passes for value=50
- axe: passes for indeterminate
- axe: passes for all size variants
- axe: passes for all variant modifiers
- axe: passes with showValue={true}
```

---

## Stories — `ProgressRing.stories.tsx`

Named exports required:

- `Default` — value=60, label="Upload progress", md
- `Sizes` — sm / md / lg at value=60 side by side
- `Variants` — all 5 variants at value=60 side by side
- `Zero` — value=0
- `Complete` — value=100
- `Indeterminate`
- `WithValueLabel` — showValue={true}, md, value=75
- `NoAnimation` — animated={false}
- `InCard` — ProgressRing inside a card (practical composition example)

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all variants and states
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] Arc starts at 12 o'clock (verified visually in Storybook)
- [ ] `prefers-reduced-motion` stops indeterminate rotation
- [ ] `transformOrigin: 'center'` inline style exception documented in JSDoc
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

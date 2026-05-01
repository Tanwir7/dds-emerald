# StatCard · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `StatCard` component.
- Scaffold: `packages/components/src/components/StatCard/`
- Radix primitive: none (native HTML)

---

## Purpose

`StatCard` displays a single key metric: a label, a prominent value, and an optional delta (change indicator showing positive/negative/neutral trend). Used in dashboards, summaries, and analytics panels.

---

## Exports from `index.ts`

```ts
export { StatCard };
export type { StatCardProps, StatCardDelta };
```

---

## Types

```ts
export type StatCardDelta = {
  value: string; // e.g. "+12.4%", "-3", "↑ 200"
  trend?: 'up' | 'down' | 'neutral'; // default: 'neutral'
  label?: string; // optional context e.g. "vs last month"
};

export interface StatCardProps {
  label: string; // metric name e.g. "Monthly Revenue"
  value: string | number; // prominent metric value e.g. "$48,295" or 1234
  delta?: StatCardDelta; // optional change indicator
  icon?: React.ReactNode; // optional leading icon beside the label
  size?: 'sm' | 'md' | 'lg'; // default: 'md'
  loading?: boolean; // default: false — shows skeleton state
  className?: string;
}
```

---

## Structure

```tsx
<div ref={ref} className={clsx(styles.root, styles[size], loading && styles.loading, className)}>
  {/* Label row */}
  <div className={styles.labelRow}>
    {icon && (
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    )}
    <span className={styles.label}>{label}</span>
  </div>

  {/* Value */}
  {loading ? (
    <div className={styles.valueSkeleton} aria-hidden="true" />
  ) : (
    <p className={styles.value}>{value}</p>
  )}

  {/* Delta */}
  {!loading && delta && (
    <div className={clsx(styles.delta, delta.trend && styles[`trend${capitalise(delta.trend)}`])}>
      <span className={styles.deltaValue} aria-label={`Change: ${delta.value}`}>
        {delta.value}
      </span>
      {delta.label && <span className={styles.deltaLabel}>{delta.label}</span>}
    </div>
  )}
</div>
```

---

## Styles — `StatCard.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: flex`
- `flex-direction: column`
- `gap: var(--dds-space-1)`

`.labelRow`:

- `display: flex`
- `align-items: center`
- `gap: var(--dds-space-1-5)`

`.icon`:

- `flex-shrink: 0`
- `width: var(--dds-icon-size-sm); height: var(--dds-icon-size-sm)`
- `color: var(--dds-color-text-muted)`

`.label`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `font-weight: var(--dds-font-weight-medium)`
- `color: var(--dds-color-text-muted)`
- `text-transform: uppercase`
- `letter-spacing: var(--dds-tracking-wider)`
- `line-height: var(--dds-line-height-none)`

`.value`:

- `margin: 0`
- `font-family: var(--dds-font-display)` — Barlow Condensed for impact
- `font-weight: var(--dds-font-weight-bold)`
- `color: var(--dds-color-text-default)`
- `line-height: var(--dds-line-height-tight)`
- `font-variant-numeric: tabular-nums`

Size modifiers (applied to `.value`):

- `.sm .value` → `font-size: var(--dds-font-size-2xl)`
- `.md .value` → `font-size: var(--dds-font-size-3xl)` (default)
- `.lg .value` → `font-size: var(--dds-font-size-4xl)`

`.delta`:

- `display: flex`
- `align-items: center`
- `gap: var(--dds-space-1-5)`
- `flex-wrap: wrap`

`.deltaValue`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `font-weight: var(--dds-font-weight-semibold)`
- `line-height: var(--dds-line-height-none)`

Trend colour modifiers:

- `.trendUp .deltaValue` → `color: var(--dds-color-status-success)`
- `.trendDown .deltaValue` → `color: var(--dds-color-status-danger)`
- `.trendNeutral .deltaValue` → `color: var(--dds-color-text-muted)`

`.deltaLabel`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `color: var(--dds-color-text-muted)`
- `font-weight: var(--dds-font-weight-normal)`

### Loading skeleton

`.valueSkeleton`:

- `height: var(--dds-font-size-3xl)` (md) — matches value height
- `width: 120px`
- `background-color: var(--dds-color-bg-subtle)`
- `border-radius: var(--dds-radius-none)`
- Shimmer animation — same `@keyframes shimmer` pattern as `Skeleton` component

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` everywhere.
- `font-family: var(--dds-font-display)` (Barlow Condensed) on the value — this is the system's display font and gives StatCard its distinctive large-number impact. Do NOT use sans here.
- `font-variant-numeric: tabular-nums` on `.value` — numeric values must align on a consistent grid across rows.
- `text-transform: uppercase` + `letter-spacing: var(--dds-tracking-wider)` on `.label` — stat labels follow the uppercase category label convention used across the system.
- Delta `aria-label="Change: +12.4%"` — ensures screen readers read the change value with context, not just "+12.4%" out of nowhere.
- Loading skeleton matches the visual footprint of the value — same height.

---

## Accessibility

- `StatCard` has no interactive elements — purely informational display.
- `.label` is visually uppercase but NOT `aria-label`-overridden — screen readers read the original text, CSS `text-transform` only affects visual rendering, which is correct.
- Delta `<span>` has `aria-label` for context.
- Loading state: skeleton has `aria-hidden="true"` so screen readers don't announce skeleton placeholder elements.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders label text
- renders value
- renders icon when icon prop provided
- icon has aria-hidden="true"
- does NOT render delta section when delta omitted
- renders delta value when delta provided
- renders delta label when delta.label provided
- does NOT render delta label when delta.label omitted
- forwards className to root
- forwards ref to HTMLDivElement

// Sizes
- applies .md class by default
- applies .sm class when size="sm"
- applies .lg class when size="lg"

// Delta trends
- applies .trendUp when trend="up"
- applies .trendDown when trend="down"
- applies .trendNeutral when trend="neutral"
- no trend class when trend omitted

// Delta aria
- delta value span has aria-label="Change: {value}"

// Loading
- applies .loading class when loading={true}
- renders value skeleton when loading={true}
- skeleton has aria-hidden="true"
- does NOT render value when loading
- does NOT render delta when loading

// axe
- axe: passes for default render
- axe: passes with delta (trend="up")
- axe: passes with delta (trend="down")
- axe: passes with icon
- axe: passes when loading={true}
- axe: passes for all sizes
```

---

## Stories — `StatCard.stories.tsx`

Named exports required:

- `Default` — label, value, no delta
- `WithDeltaUp` — delta trend="up", "+12.4% vs last month"
- `WithDeltaDown` — delta trend="down", "-3.1%"
- `WithDeltaNeutral` — delta trend="neutral", "No change"
- `WithIcon` — icon beside label
- `Sizes` — sm / md / lg stacked
- `Loading` — loading={true}
- `Dashboard` — 4 StatCards in a Grid (2×2) — practical composition example
- `DarkSurface` — StatCards on a dark/sidebar background

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants and states
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] `font-family: var(--dds-font-display)` on value — not sans
- [ ] `font-variant-numeric: tabular-nums` on value
- [ ] Delta aria-label includes "Change:" prefix
- [ ] Skeleton height matches value height for no layout shift
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

# Spinner · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Spinner` component.
- Scaffold: `packages/components/src/components/Spinner/`
- Radix primitive: none (SVG-based animation)

---

## Props

```ts
size?: 'sm' | 'md' | 'lg'   // default: 'md'
label?: string               // default: 'Loading…' — used as aria-label
className?: string
```

Renders a `<span>` containing an SVG circle with a CSS spin animation. Forward `ref` typed to `HTMLSpanElement`. Spread remaining HTML props onto the span.

---

## Implementation detail

The spinner is an SVG circle with a `stroke-dasharray` and `stroke-dashoffset` technique to create the arc appearance, animated with a CSS `@keyframes` rotation. Do NOT use `border` trick spinners — use SVG.

```tsx
// Structure:
<span role="status" aria-label={label} className={...}>
  <svg viewBox="0 0 24 24" className={styles.svg} aria-hidden="true">
    <circle
      className={styles.track}
      cx="12" cy="12" r="10"
      fill="none"
      strokeWidth="2.5"
    />
    <circle
      className={styles.arc}
      cx="12" cy="12" r="10"
      fill="none"
      strokeWidth="2.5"
      strokeDasharray="62.83"
      strokeDashoffset="47.12"
      strokeLinecap="butt"
    />
  </svg>
</span>
```

---

## Styles — `Spinner.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root` (the `<span>`):

- `display: inline-flex`
- `align-items: center`
- `justify-content: center`
- `flex-shrink: 0`

Size modifiers (width/height on `.root`):

- `.sm` → `width: 16px; height: 16px`
- `.md` → `width: 20px; height: 20px` (default)
- `.lg` → `width: 32px; height: 32px`

`.svg`:

- `width: 100%; height: 100%`
- `animation: spin var(--dds-duration-normal) linear infinite` — use the motion token

`.track` (background circle):

- `stroke: var(--dds-color-bg-subtle)`

`.arc` (the moving arc):

- `stroke: var(--dds-color-action-primary)`
- `transform-origin: center`

`@keyframes spin`:

```scss
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

Respect `prefers-reduced-motion`:

```scss
@media (prefers-reduced-motion: reduce) {
  .svg {
    animation: none;
    opacity: 0.5;
  }
}
```

No hardcoded color values. No Tailwind. No inline styles. Use `--dds-duration-normal` for animation speed.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` — the wrapper span is square. The circular appearance comes from the SVG, not border-radius.
- Animation speed must use `var(--dds-duration-normal)` — not a hardcoded `300ms`.
- `prefers-reduced-motion` must be respected — stop the animation and reduce opacity instead.
- `stroke` colours must use Tier 2 tokens — never hardcoded colours.

---

## Accessibility

- `role="status"` on the wrapper span provides a live region — screen readers will announce when a spinner appears.
- `aria-label={label}` (default "Loading…") provides the accessible name for the live region.
- The SVG inside has `aria-hidden="true"` — the span's aria-label is the announcement.
- Do NOT use `role="progressbar"` — Spinner is indeterminate loading, not a measurable progress bar.

---

## TDD — write ALL tests before implementing

```
- renders a <span> with role="status"
- has aria-label="Loading…" by default
- has aria-label matching custom label prop
- renders an <svg> inside the span
- SVG has aria-hidden="true"
- forwards className to root span
- forwards ref to HTMLSpanElement
- applies .md class by default
- applies .sm class when size="sm"
- applies .lg class when size="lg"
- forwards arbitrary HTML props (data-testid)
- axe: passes for default render (md)
- axe: passes for size="sm"
- axe: passes for size="lg"
- axe: passes with custom label
```

---

## Stories — `Spinner.stories.tsx`

Named exports required:

- `Default` (md)
- `Sizes` (sm / md / lg side by side)
- `CustomLabel` (label="Saving changes…")
- `OnDarkBackground` (spinner inside a dark panel to verify arc colour)
- `InButton` (spinner inside a disabled button, demonstrating loading state — see IconButton for reference)

Note in the `Sizes` story: mention that `prefers-reduced-motion` will stop the animation.

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] All variants represented in stories
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color values in SCSS
- [ ] `prefers-reduced-motion` handled in SCSS
- [ ] Exported from `packages/components/src/index.ts`

# Skeleton · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Skeleton` component.
- Scaffold: `packages/components/src/components/Skeleton/`
- Radix primitive: none (native HTML element)

---

## Purpose

`Skeleton` is a loading placeholder shape that mimics the layout of content before it loads. It uses a shimmer animation to indicate activity. Multiple `Skeleton` instances are composed by consumers to replicate a content structure (e.g. a card with a heading skeleton, two text line skeletons, and a button skeleton).

---

## Props

```ts
variant?: 'text' | 'circular' | 'rectangular'  // default: 'rectangular'
width?: string | number    // default: '100%'
height?: string | number   // default: depends on variant (see below)
lines?: number             // default: 1 — only for variant="text", renders N stacked text lines
className?: string
```

`variant="text"` defaults:

- `height`: `var(--dds-font-size-sm)` per line (managed by CSS, not inline style)
- `border-radius`: `var(--dds-radius-none)`

`variant="circular"` defaults:

- `height` and `width` must be equal — if only one is set, set the other to match
- `border-radius`: `var(--dds-radius-full)` — documented exception

`variant="rectangular"` defaults:

- `height`: `20px` (managed via a CSS custom property, not inline style)
- `border-radius`: `var(--dds-radius-none)`

Width and height are set via CSS custom properties (`--skeleton-width`, `--skeleton-height`) applied as inline style on the root — this is a documented exception to the no-inline-styles rule, identical to how `--field-label-width` works in Field.

Forward `ref` typed to `HTMLSpanElement`. No children accepted.

---

## Internal structure

For `lines > 1` with `variant="text"`:

```tsx
// Renders a wrapper span containing N skeleton line spans
<span className={clsx(styles.group, className)} ref={ref} {...props}>
  {Array.from({ length: lines }, (_, i) => (
    <span
      key={i}
      className={clsx(styles.root, styles.text)}
      style={{
        '--skeleton-width': i === lines - 1 ? '75%' : '100%', // last line shorter
      }}
      aria-hidden="true"
    />
  ))}
</span>
```

For all other cases (single item):

```tsx
<span
  className={clsx(styles.root, styles[variant], className)}
  style={{ '--skeleton-width': width, '--skeleton-height': height }}
  aria-hidden="true"
  ref={ref}
  {...props}
/>
```

---

## Styles — `Skeleton.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: block`
- `background-color: var(--dds-color-bg-subtle)`
- `width: var(--skeleton-width, 100%)`
- `height: var(--skeleton-height, 20px)`
- `overflow: hidden`
- `position: relative`
- `border-radius: var(--dds-radius-none)`

Shimmer animation via `::after` pseudo-element:

```scss
.root::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent 0%,
    oklch(from var(--dds-color-bg-card) l c h / 0.6) 50%,
    transparent 100%
  );
  animation: shimmer var(--dds-duration-slow) ease-in-out infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .root::after {
    animation: none;
    opacity: 0;
  }
}
```

Variant modifiers:

- `.text`:
  - `height: var(--skeleton-height, 1em)`
  - `border-radius: var(--dds-radius-none)`
- `.circular`:
  - `border-radius: var(--dds-radius-full)` — documented exception
  - `width: var(--skeleton-width, 40px)`
  - `height: var(--skeleton-height, 40px)`
- `.rectangular`:
  - `border-radius: var(--dds-radius-none)` (default)

`.group` (multi-line text wrapper):

- `display: flex`
- `flex-direction: column`
- `gap: var(--dds-space-2)`

No hardcoded values (except shimmer gradient structure). No Tailwind. No inline styles (except CSS custom properties — documented exception).

---

## Critical design rules

- All `Skeleton` elements must have `aria-hidden="true"` — they carry no semantic content.
- The shimmer uses `oklch(from var(--dds-color-bg-card) l c h / 0.6)` — adapts to dark mode automatically via the token.
- `prefers-reduced-motion` must disable the shimmer animation.
- Width and height are injected as CSS custom properties (`--skeleton-width`, `--skeleton-height`) — this is the documented exception pattern for dynamic layout values.
- Last line in multi-line text skeleton is `75%` wide — this mimics real text where the last line is shorter.
- `variant="circular"` is the only case where `border-radius: var(--dds-radius-full)` is applied — documented exception.

---

## Accessibility

- `aria-hidden="true"` on every skeleton element — screen readers skip them entirely.
- The loading state should be announced by the parent component using `aria-busy="true"` and `aria-label` on the container, not by Skeleton itself.
- No role, no focusable elements, no interactive content.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a <span> for default (rectangular)
- has aria-hidden="true"
- forwards className to root
- forwards ref to HTMLSpanElement

// Variants
- applies .rectangular class by default
- applies .text class when variant="text"
- applies .circular class when variant="circular"

// Width and height (CSS custom properties)
- sets --skeleton-width inline style when width prop provided
- sets --skeleton-height inline style when height prop provided
- sets --skeleton-width to "100%" by default when no width
- does NOT set --skeleton-height inline when height not provided (CSS default used)

// Text lines
- renders 1 span when variant="text" and lines={1} (default)
- renders 3 spans when variant="text" and lines={3}
- all line spans have aria-hidden="true"
- last line in multi-line has --skeleton-width of "75%"
- first lines in multi-line have --skeleton-width of "100%"
- renders wrapper .group span when lines > 1

// Forwarding
- forwards id, data-testid

// Axe
- axe: passes for variant="rectangular"
- axe: passes for variant="text"
- axe: passes for variant="circular"
- axe: passes for lines={3}
```

---

## Stories — `Skeleton.stories.tsx`

Named exports required:

- `Rectangular` — default, width="100%", height="80px"
- `Text` — variant="text", single line
- `TextMultiline` — variant="text", lines={3}
- `Circular` — variant="circular", width="48px"
- `CardSkeleton` — composed skeleton mimicking a card: circular avatar + 2 text lines + rectangular button
- `TableSkeleton` — composed skeleton mimicking a 3-row table
- `ReducedMotion` — story note: "Add `prefers-reduced-motion` emulation in browser to see animation disabled"

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] `prefers-reduced-motion` disables shimmer
- [ ] Last text line in multi-line is 75% width
- [ ] `aria-hidden="true"` on every skeleton element
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

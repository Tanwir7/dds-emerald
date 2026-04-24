# Grid · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Grid` component.
- Scaffold: `packages/components/src/components/Grid/`
- Radix primitive: none (native HTML element with CSS Grid)

---

## Purpose

`Grid` is the responsive CSS Grid layout primitive. It maps directly to the strategy's Phase 2 `ContentGrid` component: `1–4 cols, responsive`. It provides token-mapped column counts, gap sizes, and responsive breakpoint modifiers without requiring consumers to write raw CSS grid.

It covers two use cases:

1. **Content grids** — equal-width columns for cards, media items, data panels.
2. **Layout grids** — arbitrary `gridTemplateColumns` via `columns` prop accepting a number or a responsive object.

---

## Props

```ts
as?: React.ElementType   // default: 'div'

// Column count — number means equal-width auto columns
columns?: 1 | 2 | 3 | 4 | {
  default?: 1 | 2 | 3 | 4
  sm?: 1 | 2 | 3 | 4
  md?: 1 | 2 | 3 | 4
  lg?: 1 | 2 | 3 | 4
  xl?: 1 | 2 | 3 | 4
}    // default: 1

gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'   // default: 'md' — applies to both row and column gap
columnGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'  // overrides gap on column axis
rowGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'     // overrides gap on row axis

align?: 'start' | 'center' | 'end' | 'stretch'    // align-items, default: 'stretch'
justify?: 'start' | 'center' | 'end' | 'stretch'  // justify-items, default: 'stretch'

className?: string
children?: React.ReactNode
// All HTML div attributes forwarded
```

Forward `ref` typed to `HTMLDivElement`. Spread all remaining HTML props.

---

## Gap token mapping

Same as Stack:
| Value | Token | px |
|---|---|---|
| `none` | `0` | 0 |
| `xs` | `var(--dds-space-1)` | 4px |
| `sm` | `var(--dds-space-2)` | 8px |
| `md` | `var(--dds-space-4)` | 16px |
| `lg` | `var(--dds-space-6)` | 24px |
| `xl` | `var(--dds-space-8)` | 32px |

---

## Styles — `Grid.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: grid`
- `box-sizing: border-box`
- `min-width: 0`

Column classes (applied when `columns` is a plain number):

- `.cols1` → `grid-template-columns: repeat(1, minmax(0, 1fr))`
- `.cols2` → `grid-template-columns: repeat(2, minmax(0, 1fr))`
- `.cols3` → `grid-template-columns: repeat(3, minmax(0, 1fr))`
- `.cols4` → `grid-template-columns: repeat(4, minmax(0, 1fr))`

Responsive column classes (using breakpoint mixins):

```scss
// sm breakpoint
@include breakpoint(sm) {
  .smCols1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .smCols2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .smCols3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .smCols4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
// md, lg, xl — same pattern
```

Gap modifiers (shorthand — applies both row and column gap):

- `.gapNone` → `gap: 0`
- `.gapXs` → `gap: var(--dds-space-1)`
- `.gapSm` → `gap: var(--dds-space-2)`
- `.gapMd` → `gap: var(--dds-space-4)`
- `.gapLg` → `gap: var(--dds-space-6)`
- `.gapXl` → `gap: var(--dds-space-8)`

Column gap overrides (`.colGapXs`, `.colGapSm`, etc.) — same token mapping, `column-gap` only.
Row gap overrides (`.rowGapXs`, `.rowGapSm`, etc.) — same token mapping, `row-gap` only.

Align modifiers:

- `.alignStart` → `align-items: start`
- `.alignCenter` → `align-items: center`
- `.alignEnd` → `align-items: end`
- `.alignStretch` → `align-items: stretch`

Justify modifiers:

- `.justifyStart` → `justify-items: start`
- `.justifyCenter` → `justify-items: center`
- `.justifyEnd` → `justify-items: end`
- `.justifyStretch` → `justify-items: stretch`

No hardcoded values. No Tailwind. No inline styles.

---

## Responsive columns — implementation detail

When `columns` is a responsive object (e.g. `{ default: 1, md: 2, lg: 3 }`), compute the class list in the component:

```tsx
const colClassMap = {
  1: styles.cols1,
  2: styles.cols2,
  3: styles.cols3,
  4: styles.cols4,
};
const smColClassMap = {
  1: styles.smCols1,
  2: styles.smCols2,
  3: styles.smCols3,
  4: styles.smCols4,
};
// mdColClassMap, lgColClassMap, xlColClassMap — same pattern

const columnClasses =
  typeof columns === 'number'
    ? colClassMap[columns]
    : clsx(
        columns?.default && colClassMap[columns.default],
        columns?.sm && smColClassMap[columns.sm],
        columns?.md && mdColClassMap[columns.md],
        columns?.lg && lgColClassMap[columns.lg],
        columns?.xl && xlColClassMap[columns.xl]
      );
```

---

## GridItem sub-component

Export a `GridItem` sub-component for spanning columns:

```ts
// GridItem props
colSpan?: 1 | 2 | 3 | 4 | 'full'   // default: undefined (auto)
rowSpan?: 1 | 2 | 3 | 4             // default: undefined (auto)
className?: string
children?: React.ReactNode
as?: React.ElementType               // default: 'div'
```

```scss
// GridItem.module.scss (same file or split — your choice)
.span1 {
  grid-column: span 1;
}
.span2 {
  grid-column: span 2;
}
.span3 {
  grid-column: span 3;
}
.span4 {
  grid-column: span 4;
}
.spanFull {
  grid-column: 1 / -1;
}
.rowSpan1 {
  grid-row: span 1;
}
.rowSpan2 {
  grid-row: span 2;
}
.rowSpan3 {
  grid-row: span 3;
}
.rowSpan4 {
  grid-row: span 4;
}
```

Export `Grid` and `GridItem` from `index.ts`.

---

## Critical design rules

- `minmax(0, 1fr)` — always use `minmax(0, 1fr)` not `1fr` alone. `1fr` can overflow when children have min-width > 0; `minmax(0, 1fr)` prevents this.
- `min-width: 0` on `.root` — same reason as Stack.
- Responsive breakpoints must use the existing `_breakpoints.scss` mixins — never hardcode `@media (min-width: 640px)`.
- `columnGap` and `rowGap` override `gap` on their respective axes — apply them after the `gap` class in `clsx` to ensure correct cascade order.

---

## Accessibility

- `Grid` is a purely layout primitive — no semantic meaning.
- When `as="ul"` with `<GridItem as="li">` children, the grid creates a semantic list.
- Logical reading order must match visual order — avoid using `order` CSS property (not in this component's API, but document the warning in JSDoc).
- No ARIA attributes added by default — forward all via props.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a <div> by default
- renders as <ul> when as="ul"
- renders children
- forwards className to root element
- forwards ref to root element

// Columns (number)
- applies .cols1 by default when columns not set
- applies .cols1 when columns={1}
- applies .cols2 when columns={2}
- applies .cols3 when columns={3}
- applies .cols4 when columns={4}

// Columns (responsive object)
- applies .cols1 when columns={{ default: 1 }}
- applies .smCols2 when columns={{ sm: 2 }}
- applies .mdCols3 when columns={{ md: 3 }}
- applies .lgCols4 when columns={{ lg: 4 }}
- applies multiple responsive classes simultaneously: { default: 1, md: 2, lg: 3 }

// Gap
- applies .gapMd by default
- applies .gapNone when gap="none"
- applies .gapXs when gap="xs"
- applies .gapLg when gap="lg"
- applies .colGapLg when columnGap="lg"
- applies .rowGapSm when rowGap="sm"
- applies both columnGap and rowGap simultaneously

// Align and Justify
- applies .alignStretch by default
- applies .alignCenter when align="center"
- applies .justifyStretch by default
- applies .justifyCenter when justify="center"

// GridItem
- GridItem renders a <div> by default
- GridItem renders as <li> when as="li"
- GridItem applies .span2 when colSpan={2}
- GridItem applies .spanFull when colSpan="full"
- GridItem applies .rowSpan2 when rowSpan={2}
- GridItem forwards className and ref

// Forwarding
- forwards id, aria-label, data-testid

// Axe
- axe: passes for 1-column grid
- axe: passes for 3-column grid
- axe: passes for responsive grid
- axe: passes with GridItem children
- axe: passes for as="ul" with GridItem as="li"
```

---

## Stories — `Grid.stories.tsx`

Named exports required:

- `OneColumn` — columns={1}, default
- `TwoColumns` — columns={2}
- `ThreeColumns` — columns={3}
- `FourColumns` — columns={4}
- `Responsive` — `columns={{ default: 1, sm: 2, lg: 3 }}` — resize viewport to see reflow
- `GapSizes` — same 3-column grid shown at all gap values
- `WithColumnAndRowGap` — different column and row gaps
- `GridItemSpanning` — 3-column grid where one GridItem spans 2 columns, one spans full
- `ContentCardGrid` — practical example: 3-column grid of Box+Text cards
- `AlignCenter` — align="center" with items of varying heights

Include a note in the `Responsive` story to resize the Storybook viewport to see breakpoint changes.

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] Responsive story reflows correctly at sm/md/lg breakpoints
- [ ] `minmax(0, 1fr)` used in all column classes — not bare `1fr`
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded values in SCSS
- [ ] `Grid` and `GridItem` both exported from `packages/components/src/index.ts`

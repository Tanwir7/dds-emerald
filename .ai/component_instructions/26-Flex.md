# Flex · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Flex` component.
- Scaffold: `packages/components/src/components/Flex/`
- Radix primitive: none (native HTML element with flexbox)

---

## Purpose

`Flex` is a low-level flexbox primitive for cases where `Stack` is too opinionated. While `Stack` enforces a single direction with a fixed gap, `Flex` exposes the full flexbox API through named props mapped to design tokens, giving consumers fine-grained control over alignment, wrapping, and growth behaviour.

**When to use `Flex` vs `Stack`:**

- Use `Stack` for ordered vertical or horizontal sequences of content with consistent spacing (the 90% case).
- Use `Flex` when you need `justify-content: space-between`, mixed grow/shrink on children, or multi-axis control that Stack's API doesn't cover.

---

## Props

```ts
as?: React.ElementType    // default: 'div'
inline?: boolean          // default: false — display: inline-flex vs flex

direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse'  // default: 'row'
wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'   // default: 'nowrap'

gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'    // default: undefined (no gap)
columnGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
rowGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'   // align-items, default: undefined
justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | 'stretch'  // justify-content, default: undefined

grow?: boolean    // default: false — flex: 1 1 0% on root
shrink?: boolean  // default: true  — flex-shrink: 1 on root

className?: string
children?: React.ReactNode
// All HTML div attributes forwarded
```

Forward `ref` typed to `HTMLDivElement`. Spread all remaining HTML props.

---

## FlexItem sub-component

Export a `FlexItem` sub-component to control individual child flex behaviour:

```ts
// FlexItem props
grow?: boolean | number    // default: false — false=0, true=1, number=exact value
shrink?: boolean | number  // default: true  — false=0, true=1, number=exact value
basis?: 'auto' | '0' | 'full' | 'min' | 'max'   // default: 'auto'
                           // 'full' = 100%, 'min' = min-content, 'max' = max-content
align?: 'auto' | 'start' | 'center' | 'end' | 'stretch' | 'baseline'  // align-self
order?: number             // default: undefined — use sparingly, warn in JSDoc
as?: React.ElementType     // default: 'div'
className?: string
children?: React.ReactNode
```

Export `Flex` and `FlexItem` from `index.ts`.

---

## Gap token mapping

Same as Stack and Grid:
| Value | Token | px |
|---|---|---|
| `none` | `0` | 0 |
| `xs` | `var(--dds-space-1)` | 4px |
| `sm` | `var(--dds-space-2)` | 8px |
| `md` | `var(--dds-space-4)` | 16px |
| `lg` | `var(--dds-space-6)` | 24px |
| `xl` | `var(--dds-space-8)` | 32px |

---

## Styles — `Flex.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: flex`
- `box-sizing: border-box`
- `min-width: 0`

Inline modifier:

- `.inline` → `display: inline-flex`

Direction modifiers:

- `.row` → `flex-direction: row`
- `.rowReverse` → `flex-direction: row-reverse`
- `.column` → `flex-direction: column`
- `.columnReverse` → `flex-direction: column-reverse`

Wrap modifiers:

- `.nowrap` → `flex-wrap: nowrap`
- `.wrap` → `flex-wrap: wrap`
- `.wrapReverse` → `flex-wrap: wrap-reverse`

Gap modifiers (shorthand): `.gapNone`, `.gapXs`, `.gapSm`, `.gapMd`, `.gapLg`, `.gapXl`
Column gap modifiers: `.colGapNone` … `.colGapXl`
Row gap modifiers: `.rowGapNone` … `.rowGapXl`

Align (align-items) modifiers:

- `.alignStart` → `align-items: flex-start`
- `.alignCenter` → `align-items: center`
- `.alignEnd` → `align-items: flex-end`
- `.alignStretch` → `align-items: stretch`
- `.alignBaseline` → `align-items: baseline`

Justify (justify-content) modifiers:

- `.justifyStart` → `justify-content: flex-start`
- `.justifyCenter` → `justify-content: center`
- `.justifyEnd` → `justify-content: flex-end`
- `.justifyBetween` → `justify-content: space-between`
- `.justifyAround` → `justify-content: space-around`
- `.justifyEvenly` → `justify-content: space-evenly`
- `.justifyStretch` → `justify-content: stretch`

Grow/shrink on root:

- `.grow` → `flex: 1 1 0%`
- `.noShrink` → `flex-shrink: 0`

**FlexItem classes** (can be in same file or `FlexItem.module.scss`):

`.item` (FlexItem root):

- `box-sizing: border-box`
- `min-width: 0`

Grow: `.itemGrow` → `flex-grow: 1` | `.itemNoGrow` → `flex-grow: 0`
Shrink: `.itemShrink` → `flex-shrink: 1` | `.itemNoShrink` → `flex-shrink: 0`

Basis:

- `.basisAuto` → `flex-basis: auto`
- `.basis0` → `flex-basis: 0%`
- `.basisFull` → `flex-basis: 100%`
- `.basisMin` → `flex-basis: min-content`
- `.basisMax` → `flex-basis: max-content`

Align self:

- `.selfAuto` → `align-self: auto`
- `.selfStart` → `align-self: flex-start`
- `.selfCenter` → `align-self: center`
- `.selfEnd` → `align-self: flex-end`
- `.selfStretch` → `align-self: stretch`
- `.selfBaseline` → `align-self: baseline`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `min-width: 0` on both `.root` and `.item` — without it, text in flex children overflows.
- No gap applied by default — unlike Stack. Flex is lower-level; the consumer controls all spacing.
- `grow` and `shrink` on the root Flex apply to the Flex container itself when it is inside another flex parent (e.g. `grow={true}` makes the whole Flex take remaining space in its parent).
- `FlexItem`'s `order` prop is supported but must have a JSDoc warning: "Avoid using order — it breaks logical tab order for keyboard users. Use DOM reordering instead."
- `direction="row"` is the default (CSS flex default) — apply the class only when direction is set, to avoid redundant classes.

---

## Accessibility

- `Flex` is a layout primitive — no ARIA attributes added.
- **Critical warning for `order` prop on `FlexItem`**: visual order and DOM order diverge when `order` is used, breaking keyboard navigation. Document prominently. The component still supports it (for edge cases where DOM reordering is impossible), but always warns in development mode if `order` is set.
- When `as="ul"` with `FlexItem as="li"`, the list semantics are preserved.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a <div> by default
- renders as <span> when as="span"
- renders children
- forwards className to root element
- forwards ref to root element

// Inline
- does NOT apply .inline by default
- applies .inline when inline={true}

// Direction
- does NOT apply direction class when direction not set (defaults to row via CSS)
- applies .row when direction="row"
- applies .column when direction="column"
- applies .rowReverse when direction="row-reverse"
- applies .columnReverse when direction="column-reverse"

// Wrap
- applies .nowrap by default
- applies .wrap when wrap="wrap"
- applies .wrapReverse when wrap="wrap-reverse"

// Gap
- does NOT apply gap class when gap not set
- applies .gapNone when gap="none"
- applies .gapMd when gap="md"
- applies .colGapLg when columnGap="lg"
- applies .rowGapSm when rowGap="sm"

// Align and justify
- does NOT apply align class when align not set
- applies .alignCenter when align="center"
- applies .alignBaseline when align="baseline"
- does NOT apply justify class when justify not set
- applies .justifyBetween when justify="between"
- applies .justifyCenter when justify="center"

// Grow and shrink
- does NOT apply .grow by default
- applies .grow when grow={true}
- does NOT apply .noShrink by default
- applies .noShrink when shrink={false}

// FlexItem
- FlexItem renders a <div> by default
- FlexItem renders as <li> when as="li"
- FlexItem applies .itemGrow when grow={true}
- FlexItem applies .itemNoGrow when grow={false}
- FlexItem applies .basisFull when basis="full"
- FlexItem applies .selfCenter when align="center"
- FlexItem forwards className and ref

// Forwarding
- forwards id, aria-label, data-testid
- forwards onClick

// Axe
- axe: passes for row flex
- axe: passes for column flex
- axe: passes with FlexItem children
- axe: passes for as="ul" with FlexItem as="li"
```

---

## Stories — `Flex.stories.tsx`

Named exports required:

- `Row` — direction="row", gap="md", 3 children (default view)
- `Column` — direction="column", gap="md"
- `JustifyBetween` — row, justify="between", fixed-width container
- `AlignCenter` — row, align="center", children of varying heights
- `Wrap` — wrap="wrap", many small items, fixed-width container
- `GrowItem` — row with one FlexItem grow={true} taking remaining space
- `NavBar` — practical example: `<Flex as="nav" justify="between" align="center">` with logo + links + actions
- `FormRow` — `<Flex gap="sm" align="end">` with a label-input pair and a button
- `FlexItemBasis` — items with different basis values side by side

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] All variants represented in stories
- [ ] `min-width: 0` on both `.root` and `.item`
- [ ] `FlexItem.order` includes dev-mode console warning about tab order
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded values in SCSS
- [ ] `Flex` and `FlexItem` both exported from `packages/components/src/index.ts`

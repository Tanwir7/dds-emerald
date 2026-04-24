# Box · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Box` component.
- Scaffold: `packages/components/src/components/Box/`
- Radix primitive: none (polymorphic native HTML element)

---

## Purpose

`Box` is the foundational layout primitive — a polymorphic, style-prop-free `<div>` wrapper that provides:

1. A consistent `as` prop for semantic element selection.
2. Optional padding, background, and border shortcuts mapped strictly to design tokens.
3. The `asChild` escape hatch for composing with other components.

`Box` does NOT accept arbitrary CSS values as props (no `style={{ margin: '14px' }}`-style prop drilling). All visual variants map to named token values. If a consumer needs arbitrary CSS, they should pass a `className` with their own SCSS module class.

---

## Props

```ts
as?: React.ElementType                          // default: 'div'
padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'  // default: undefined (no padding class)
paddingX?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
paddingY?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
background?: 'default' | 'subtle' | 'card' | 'muted'   // default: undefined (transparent)
border?: boolean                                         // default: false — adds 1px border-default
borderRadius?: 'none' | 'full'                           // default: 'none'
asChild?: boolean                                        // default: false — Radix Slot
className?: string
children?: React.ReactNode
// All HTML div attributes forwarded (id, role, aria-*, data-*, onClick, etc.)
```

Forward `ref` typed to `HTMLDivElement` (cast for non-div `as` elements). Spread all remaining HTML props.

---

## Padding token mapping

| Prop value | CSS custom property  | Computed value |
| ---------- | -------------------- | -------------- |
| `xs`       | `var(--dds-space-2)` | 8px            |
| `sm`       | `var(--dds-space-3)` | 12px           |
| `md`       | `var(--dds-space-4)` | 16px           |
| `lg`       | `var(--dds-space-6)` | 24px           |
| `xl`       | `var(--dds-space-8)` | 32px           |
| `none`     | `0`                  | 0              |

`padding` sets all four sides. `paddingX` sets left+right (overrides `padding` on x-axis if both given). `paddingY` sets top+bottom (overrides `padding` on y-axis if both given).

---

## Styles — `Box.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `box-sizing: border-box`

Padding classes (all sides):

- `.pNone` → `padding: 0`
- `.pXs` → `padding: var(--dds-space-2)`
- `.pSm` → `padding: var(--dds-space-3)`
- `.pMd` → `padding: var(--dds-space-4)`
- `.pLg` → `padding: var(--dds-space-6)`
- `.pXl` → `padding: var(--dds-space-8)`

Padding X classes:

- `.pxNone` → `padding-left: 0; padding-right: 0`
- `.pxXs` → `padding-left: var(--dds-space-2); padding-right: var(--dds-space-2)`
- `.pxSm` → `padding-left: var(--dds-space-3); padding-right: var(--dds-space-3)`
- `.pxMd` → `padding-left: var(--dds-space-4); padding-right: var(--dds-space-4)`
- `.pxLg` → `padding-left: var(--dds-space-6); padding-right: var(--dds-space-6)`
- `.pxXl` → `padding-left: var(--dds-space-8); padding-right: var(--dds-space-8)`

Padding Y classes (same pattern for `padding-top` / `padding-bottom`).

Background classes:

- `.bgDefault` → `background-color: var(--dds-color-bg-default)`
- `.bgSubtle` → `background-color: var(--dds-color-bg-subtle)`
- `.bgCard` → `background-color: var(--dds-color-bg-card)`
- `.bgMuted` → `background-color: var(--dds-color-bg-muted)`

Border class:

- `.border` → `border: 1px solid var(--dds-color-border-default)`

Border radius classes:

- `.radiusNone` → `border-radius: var(--dds-radius-none)` (explicit — 0px)
- `.radiusFull` → `border-radius: var(--dds-radius-full)` (documented exception)

No hardcoded values. No Tailwind. No inline styles.

---

## Implementation — class composition

```tsx
import clsx from 'clsx';
import styles from './Box.module.scss';

const paddingClassMap = {
  none: styles.pNone,
  xs: styles.pXs,
  sm: styles.pSm,
  md: styles.pMd,
  lg: styles.pLg,
  xl: styles.pXl,
};
const paddingXClassMap = {
  /* same keys, px classes */
};
const paddingYClassMap = {
  /* same keys, py classes */
};
const bgClassMap = {
  default: styles.bgDefault,
  subtle: styles.bgSubtle,
  card: styles.bgCard,
  muted: styles.bgMuted,
};

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  (
    {
      as: Tag = 'div',
      asChild,
      padding,
      paddingX,
      paddingY,
      background,
      border,
      borderRadius = 'none',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : Tag;
    return (
      <Comp
        ref={ref}
        className={clsx(
          styles.root,
          padding && paddingClassMap[padding],
          paddingX && paddingXClassMap[paddingX],
          paddingY && paddingYClassMap[paddingY],
          background && bgClassMap[background],
          border && styles.border,
          borderRadius === 'full' && styles.radiusFull,
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
```

---

## Critical design rules

- `Box` has NO default `display` property — it renders a block-level `<div>` by default, which is already `display: block`. Do not add `display: block` to `.root` — it would break `as="span"`.
- `borderRadius` default is `'none'` — but only apply the `.radiusNone` class if explicitly set, since `border-radius: 0` is a browser default anyway (no class needed unless overriding).
- `Box` is intentionally minimal — it is NOT a full style-prop system. Resist the urge to add `color`, `fontSize`, `margin` props. Those belong in component-specific SCSS modules.
- `asChild` is useful for wrapping router links (`<Box asChild><NextLink href="...">...</NextLink></Box>`) and for extending other HTML elements.

---

## Accessibility

- `Box` is a generic container — no inherent semantics beyond the `as` prop.
- When `as="section"`, `as="article"`, `as="nav"` etc., the semantic element carries the role.
- When used as a landmark (`as="main"`, `as="nav"`, `as="aside"`), consumers should provide `aria-label` or `aria-labelledby`.
- `Box` itself adds no ARIA — it forwards all `aria-*` props.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a <div> by default
- renders as <section> when as="section"
- renders as <article> when as="article"
- renders as <span> when as="span"
- renders as <main> when as="main"
- renders children
- forwards className to root element
- forwards ref to HTMLDivElement
- renders via Slot when asChild={true}

// Padding
- no padding class applied when padding prop omitted
- applies .pXs when padding="xs"
- applies .pSm when padding="sm"
- applies .pMd when padding="md"
- applies .pLg when padding="lg"
- applies .pXl when padding="xl"
- applies .pNone when padding="none"
- applies .pxMd when paddingX="md"
- applies .pyMd when paddingY="md"
- both padding and paddingX can be set simultaneously

// Background
- no background class when background prop omitted
- applies .bgDefault when background="default"
- applies .bgSubtle when background="subtle"
- applies .bgCard when background="card"
- applies .bgMuted when background="muted"

// Border
- no border class when border={false} (default)
- applies .border class when border={true}

// Border radius
- no radius class applied when borderRadius not set
- applies .radiusFull when borderRadius="full"

// Forwarding
- forwards id, role, aria-label, data-testid
- forwards onClick handler
- forwards arbitrary HTML attributes

// Axe
- axe: passes for default render
- axe: passes for as="section" with aria-label
- axe: passes for as="nav" with aria-label
- axe: passes with background and border
```

---

## Stories — `Box.stories.tsx`

Named exports required:

- `Default` — bare Box with children text
- `WithPadding` — all padding sizes stacked with background="subtle" to make padding visible
- `PaddingXY` — paddingX and paddingY independently
- `Backgrounds` — all 4 background values side by side
- `WithBorder` — border={true}, padding="md"
- `PolymorphicAs` — as="section", as="article", as="aside" with labels
- `AsChildPattern` — asChild with a mock anchor child
- `Composed` — Box nested inside Box to show composition

Use `autodocs`. No `play()` functions needed.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] All variants represented in stories
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color or spacing values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

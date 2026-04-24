# Stack · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Stack` component.
- Scaffold: `packages/components/src/components/Stack/`
- Radix primitive: none (native HTML element with flexbox)

---

## Purpose

`Stack` is the primary layout primitive for arranging children in a single direction (vertical or horizontal) with consistent token-driven gaps. It is the most-used layout primitive in the system — it replaces the pattern of manually adding `display: flex; gap: X` to every container.

This component maps directly to the strategy's Phase 2 `Stack` component: `gap xs/sm/md/lg/xl, direction h/v`.

---

## Props

```ts
as?: React.ElementType                                  // default: 'div'
direction?: 'vertical' | 'horizontal'                  // default: 'vertical'
gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'     // default: 'md'
align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'  // default: 'stretch' (vertical) / 'center' (horizontal)
justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'  // default: 'start'
wrap?: boolean                                          // default: false — flex-wrap: wrap
inline?: boolean                                        // default: false — display: inline-flex vs flex
dividers?: boolean                                      // default: false — renders Separator between children
className?: string
children?: React.ReactNode
// All HTML div attributes forwarded
```

Forward `ref` typed to `HTMLDivElement`. Spread all remaining HTML props.

---

## Gap token mapping

| Prop value | CSS custom property  | Computed value |
| ---------- | -------------------- | -------------- |
| `none`     | `0`                  | 0              |
| `xs`       | `var(--dds-space-1)` | 4px            |
| `sm`       | `var(--dds-space-2)` | 8px            |
| `md`       | `var(--dds-space-4)` | 16px           |
| `lg`       | `var(--dds-space-6)` | 24px           |
| `xl`       | `var(--dds-space-8)` | 32px           |

---

## Styles — `Stack.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: flex`
- `box-sizing: border-box`
- `min-width: 0` — prevents flex children from overflowing

Direction modifiers:

- `.vertical` → `flex-direction: column`
- `.horizontal` → `flex-direction: row`

Gap modifiers:

- `.gapNone` → `gap: 0`
- `.gapXs` → `gap: var(--dds-space-1)`
- `.gapSm` → `gap: var(--dds-space-2)`
- `.gapMd` → `gap: var(--dds-space-4)`
- `.gapLg` → `gap: var(--dds-space-6)`
- `.gapXl` → `gap: var(--dds-space-8)`

Align modifiers:

- `.alignStart` → `align-items: flex-start`
- `.alignCenter` → `align-items: center`
- `.alignEnd` → `align-items: flex-end`
- `.alignStretch` → `align-items: stretch`
- `.alignBaseline` → `align-items: baseline`

Justify modifiers:

- `.justifyStart` → `justify-content: flex-start`
- `.justifyCenter` → `justify-content: center`
- `.justifyEnd` → `justify-content: flex-end`
- `.justifyBetween` → `justify-content: space-between`
- `.justifyAround` → `justify-content: space-around`
- `.justifyEvenly` → `justify-content: space-evenly`

Wrap modifier:

- `.wrap` → `flex-wrap: wrap`

Inline modifier:

- `.inline` → `display: inline-flex`

No hardcoded values. No Tailwind. No inline styles.

---

## Dividers implementation

When `dividers={true}`, Stack renders a `Separator` atom between each child (not before first or after last). Use `React.Children.toArray` + `intersperse` pattern:

```tsx
const renderChildren = () => {
  if (!dividers) return children;
  const childArray = React.Children.toArray(children).filter(Boolean);
  return childArray.reduce<React.ReactNode[]>((acc, child, index) => {
    if (index > 0) {
      acc.push(
        <Separator
          key={`divider-${index}`}
          orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
        />
      );
    }
    acc.push(child);
    return acc;
  }, []);
};
```

When `dividers={true}` with `direction="horizontal"`, the `Separator` must be `orientation="vertical"` and needs a fixed height. The consumer is responsible for ensuring child items have consistent height. Document this caveat in stories and JSDoc.

- Depends on: `Separator` atom (must be built first — or use the `Divider` component).

---

## Critical design rules

- `min-width: 0` on `.root` is required — without it, flex children with text content overflow their container.
- The default `gap` is `'md'` (16px) — this is the most common gap in product UI and avoids the "no gap by default" footgun.
- `align` default differs by direction: `'stretch'` for vertical (children fill width), `'center'` for horizontal (children align vertically centred). Implement this in the component logic, not in CSS defaults.
- `dividers={true}` requires the `Separator`/`Divider` component to be imported. If it is not yet built, stub with a `<hr>` and leave a `// TODO: replace with Separator` comment.

---

## Accessibility

- `Stack` is a purely layout component — no ARIA attributes added by default.
- When `as="ul"` or `as="ol"`, children should be `<li>` elements — Stack does not enforce this but it is documented.
- When `as="nav"`, provide `aria-label` via prop spreading.
- `dividers` with `role="separator"` are handled by the `Separator` atom.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a <div> by default
- renders as <ul> when as="ul"
- renders as <nav> when as="nav"
- renders children
- forwards className to root element
- forwards ref to root element

// Direction
- applies .vertical class by default
- applies .horizontal class when direction="horizontal"

// Gap
- applies .gapMd class by default
- applies .gapNone when gap="none"
- applies .gapXs when gap="xs"
- applies .gapSm when gap="sm"
- applies .gapLg when gap="lg"
- applies .gapXl when gap="xl"

// Align
- applies .alignStretch by default for vertical direction
- applies .alignCenter by default for horizontal direction
- applies .alignStart when align="start"
- applies .alignEnd when align="end"
- applies .alignBaseline when align="baseline"

// Justify
- applies .justifyStart by default
- applies .justifyCenter when justify="center"
- applies .justifyBetween when justify="between"
- applies .justifyEnd when justify="end"

// Wrap
- does NOT apply .wrap by default
- applies .wrap when wrap={true}

// Inline
- does NOT apply .inline by default
- applies .inline when inline={true}

// Dividers
- does NOT render separators when dividers={false} (default)
- renders (n-1) separators between n children when dividers={true}
- separator orientation is "horizontal" when direction="vertical" and dividers={true}
- separator orientation is "vertical" when direction="horizontal" and dividers={true}
- does not render separator before first child
- does not render separator after last child

// Forwarding
- forwards id, aria-label, data-testid
- forwards onClick

// Axe
- axe: passes for vertical stack
- axe: passes for horizontal stack
- axe: passes with dividers={true}
- axe: passes for as="nav" with aria-label
- axe: passes for as="ul" with li children
```

---

## Stories — `Stack.stories.tsx`

Named exports required:

- `Vertical` — default, 3 card-like Box children, gap="md"
- `Horizontal` — direction="horizontal", 3 items
- `GapSizes` — all 5 gap values shown with vertical stacks
- `Alignment` — all align values shown with horizontal stack
- `Justify` — all justify values with horizontal stack in fixed-width container
- `Wrap` — wrap={true}, horizontal, many small children
- `WithDividers` — dividers={true}, vertical (3 items with separators)
- `WithDividersHorizontal` — dividers={true}, direction="horizontal"
- `Inline` — inline={true} inside a paragraph of text
- `PolymorphicUl` — as="ul", children are `<li>` items
- `Nested` — Stack inside Stack (vertical > horizontal > items)

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] All variants represented in stories
- [ ] `min-width: 0` present on `.root`
- [ ] Divider count is always n-1 (never n) — verified in test
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color or spacing values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

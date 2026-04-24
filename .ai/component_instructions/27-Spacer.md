# Spacer · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Spacer` component.
- Scaffold: `packages/components/src/components/Spacer/`
- Radix primitive: none (native `<span>` or `<div>`)

---

## Purpose

`Spacer` adds explicit whitespace between sibling elements. It is used when `gap` on a parent layout primitive (Stack, Flex, Grid) would apply spacing to ALL children, but you only need space between specific children. It is also used for creating a "push" effect in flex layouts (flexible spacer that fills remaining space).

**When to use Spacer vs gap on Stack/Flex:**

- Use `gap` on Stack/Flex when all children should have equal spacing — this is the 90% case.
- Use `Spacer size="flex"` when you want to push one group of items to the far end (e.g. logo | [spacer] | nav links).
- Use `Spacer size="md"` for one-off spacing between specific elements when changing the parent's gap would affect others.

---

## Props

```ts
size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'flex'   // default: 'md'
         // 'flex' = flex: 1 1 0% — fills remaining space in flex parent
axis?: 'horizontal' | 'vertical' | 'both'            // default: 'both'
         // 'horizontal' = width only, 'vertical' = height only, 'both' = both
as?: 'div' | 'span'                                  // default: 'span' (inline context safe)
className?: string
```

No `children` — Spacer is always empty. Do not accept `children` in the prop type.
Forward `ref` typed to `HTMLSpanElement`. Spread remaining HTML props.

---

## Size token mapping

| Value  | Token                | Computed              |
| ------ | -------------------- | --------------------- |
| `xs`   | `var(--dds-space-1)` | 4px                   |
| `sm`   | `var(--dds-space-2)` | 8px                   |
| `md`   | `var(--dds-space-4)` | 16px                  |
| `lg`   | `var(--dds-space-6)` | 24px                  |
| `xl`   | `var(--dds-space-8)` | 32px                  |
| `flex` | `flex: 1 1 0%`       | fills available space |

---

## Styles — `Spacer.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: block`
- `flex-shrink: 0` — by default, a fixed-size spacer should not shrink

Size modifiers (`axis="both"` — default):

- `.sizeXs` → `width: var(--dds-space-1);  height: var(--dds-space-1)`
- `.sizeSm` → `width: var(--dds-space-2);  height: var(--dds-space-2)`
- `.sizeMd` → `width: var(--dds-space-4);  height: var(--dds-space-4)`
- `.sizeLg` → `width: var(--dds-space-6);  height: var(--dds-space-6)`
- `.sizeXl` → `width: var(--dds-space-8);  height: var(--dds-space-8)`
- `.sizeFlex` → `flex: 1 1 0%; width: auto; height: auto; flex-shrink: unset`

Axis modifiers — combine with size:

- `.axisHorizontal`:
  - `.sizeXs` → override height to `auto` (only width set)
  - Pattern: only `width` for horizontal, only `height` for vertical

To implement axis correctly, use compound classes in SCSS:

```scss
.axisHorizontal {
  height: auto;
  &.sizeXs {
    width: var(--dds-space-1);
  }
  &.sizeSm {
    width: var(--dds-space-2);
  }
  &.sizeMd {
    width: var(--dds-space-4);
  }
  &.sizeLg {
    width: var(--dds-space-6);
  }
  &.sizeXl {
    width: var(--dds-space-8);
  }
}

.axisVertical {
  width: auto;
  &.sizeXs {
    height: var(--dds-space-1);
  }
  &.sizeSm {
    height: var(--dds-space-2);
  }
  &.sizeMd {
    height: var(--dds-space-4);
  }
  &.sizeLg {
    height: var(--dds-space-6);
  }
  &.sizeXl {
    height: var(--dds-space-8);
  }
}

// No axis modifier (both): base size classes handle both dimensions as above
```

No hardcoded values. No Tailwind. No inline styles.

---

## Implementation notes

```tsx
export const Spacer = React.forwardRef<HTMLSpanElement, SpacerProps>(
  ({ size = 'md', axis = 'both', as: Tag = 'span', className, ...props }, ref) => {
    return (
      <Tag
        ref={ref}
        aria-hidden="true" // always decorative — never readable content
        className={clsx(
          styles.root,
          styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
          axis !== 'both' && styles[`axis${axis.charAt(0).toUpperCase() + axis.slice(1)}`],
          className
        )}
        {...props}
      />
    );
  }
);
```

---

## Critical design rules

- `aria-hidden="true"` is always set — Spacer is a purely visual layout element. It must never appear in the accessibility tree.
- `flex-shrink: 0` on fixed-size spacers prevents them from collapsing in a flex container.
- `size="flex"` unsets `flex-shrink` and applies `flex: 1 1 0%` — this is the "push remaining items right/down" pattern.
- No `children` prop — Spacer is intentionally empty. Enforce at the TypeScript type level by not including `children` in the prop type.
- `as="span"` default keeps Spacer safe in inline contexts (e.g. inside `<p>` or `<label>`). Use `as="div"` in block contexts if needed.

---

## Accessibility

- `aria-hidden="true"` always — Spacer is decorative whitespace.
- Contains no text, no interactive elements, no focusable content.
- Screen readers skip it entirely.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a <span> by default
- renders as <div> when as="div"
- does NOT render children (children prop not accepted)
- always has aria-hidden="true"
- forwards className to root element
- forwards ref to root element

// Size classes
- applies .sizeMd by default
- applies .sizeXs when size="xs"
- applies .sizeSm when size="sm"
- applies .sizeLg when size="lg"
- applies .sizeXl when size="xl"
- applies .sizeFlex when size="flex"

// Axis classes
- does NOT apply axis class when axis="both" (default)
- applies .axisHorizontal when axis="horizontal"
- applies .axisVertical when axis="vertical"

// Combined
- applies both .sizeMd and .axisHorizontal when size="md" axis="horizontal"
- applies both .sizeLg and .axisVertical when size="lg" axis="vertical"

// Forwarding
- forwards data-testid and arbitrary props

// Axe
- axe: passes for default render
- axe: passes for size="flex"
- axe: passes for all axis values
- axe: passes when inside a Flex container
```

---

## Stories — `Spacer.stories.tsx`

Named exports required:

- `Default` — Spacer between two Box elements, size="md", axis="both"
- `Sizes` — all size values (xs → xl) shown between coloured boxes
- `HorizontalAxis` — axis="horizontal", inside a horizontal Flex
- `VerticalAxis` — axis="vertical", inside a vertical Stack
- `FlexPush` — `size="flex"` inside `<Flex>` pushing nav items to far right:
  ```tsx
  <Flex align="center" gap="md">
    <Logo />
    <Spacer size="flex" axis="horizontal" />
    <NavLink>Docs</NavLink>
    <NavLink>GitHub</NavLink>
  </Flex>
  ```
- `VsGap` — side-by-side comparison: Stack with `gap="md"` vs Stack with `<Spacer>` between specific items

Use `autodocs`. No `play()` functions needed.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] All variants represented in stories
- [ ] `aria-hidden="true"` always present — verified in tests
- [ ] No `children` in prop type — TypeScript error if consumer tries to pass children
- [ ] `FlexPush` story correctly demonstrates the "push" pattern
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded spacing values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

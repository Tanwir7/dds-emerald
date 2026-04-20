# Heading · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Heading` component.
- Scaffold: `packages/components/src/components/Heading/`
- Radix primitive: none (native HTML element via `as` prop)

---

## Props

```ts
as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'   // default: 'h2'
size?: '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'  // default: '3xl'
font?: 'display' | 'sans'                          // default: 'display'
weight?: 'normal' | 'medium' | 'semibold' | 'bold' // default: 'bold'
color?: 'default' | 'muted' | 'on-primary'         // default: 'default'
align?: 'left' | 'center' | 'right'               // default: 'left'
textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase' // default: 'none'
truncate?: boolean                                 // default: false
className?: string
children: React.ReactNode
```

Forward `ref` typed to `HTMLHeadingElement`. Spread all remaining HTML props.

---

## Styles — `Heading.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

Base `.root`:

- `line-height: var(--dds-line-height-tight)`
- `letter-spacing: var(--dds-tracking-tight)`
- `color: var(--dds-color-text-default)`
- `margin: 0`

Font modifiers:

- `.display` → `font-family: var(--dds-font-display)` (Barlow Condensed)
- `.sans` → `font-family: var(--dds-font-sans)` (DM Sans)

Size modifiers:

- `.size2xl` → `var(--dds-font-size-2xl)`
- `.size3xl` → `var(--dds-font-size-3xl)`
- `.size4xl` → `var(--dds-font-size-4xl)`
- `.size5xl` → `var(--dds-font-size-5xl)`
- `.size6xl` → `var(--dds-font-size-6xl)`
- `.size7xl` → `var(--dds-font-size-7xl)`

Weight, color, align, textTransform, truncate modifiers: identical pattern to `Text` component (see Text task for exact token mappings).

No `border-radius`. No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `font="display"` uses `var(--dds-font-display)` (Barlow Condensed) — required for all display headings.
- `font="sans"` uses `var(--dds-font-sans)` (DM Sans) — for UI headings.
- Never fall back to system fonts directly — always through token variables.
- Letter spacing on display headings must use `var(--dds-tracking-tight)`.

---

## Accessibility

- The `as` prop controls the rendered HTML element; consumers must maintain correct document outline (h1 > h2 > h3 etc.).
- Do not add ARIA heading roles — the native element carries them.
- Colour contrast compliant per token audit.

---

## TDD — write ALL tests before implementing

```
- renders children as <h2> by default
- renders as <h1> when as="h1"
- renders as <h3> when as="h3"
- renders as <h4> when as="h4"
- renders as <h5> when as="h5"
- renders as <h6> when as="h6"
- forwards className to root element
- forwards ref to root DOM heading element
- applies .display class when font="display" (default)
- applies .sans class when font="sans"
- applies .size3xl class by default
- applies .size7xl class when size="7xl"
- applies .size2xl class when size="2xl"
- applies correct size class for each of the 6 size values
- applies .bold class by default
- applies .medium class when weight="medium"
- applies .colorMuted class when color="muted"
- applies .colorOnPrimary class when color="on-primary"
- applies .alignCenter when align="center"
- applies .textTransformNone by default
- applies .textTransformCapitalize when textTransform="capitalize"
- applies .textTransformUppercase when textTransform="uppercase"
- applies .textTransformLowercase when textTransform="lowercase"
- applies .truncate when truncate={true}
- forwards arbitrary HTML props (data-testid, id, etc.)
- axe: passes for h1
- axe: passes for h2 (default)
- axe: passes for display font
- axe: passes for sans font
```

---

## Stories — `Heading.stories.tsx`

Named exports required:

- `Default` (h2, display font, 3xl)
- `AllLevels` (h1–h6 stacked, display font)
- `DisplayFont` (large display heading, 6xl)
- `SansFont` (sans heading for UI use)
- `AllSizes` (2xl → 7xl stacked)
- `ColorMuted`
- `Truncated` (fixed-width container)
- `TextTransform`
- `OnPrimary`

Use `autodocs`. No `play()` functions needed.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all rendered variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] All variants represented in stories
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color or spacing values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

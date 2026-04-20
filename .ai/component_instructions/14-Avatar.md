# Avatar + AvatarGroup · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Avatar` and `AvatarGroup` components.
- Scaffold: `packages/components/src/components/Avatar/`
- Radix primitive: `@radix-ui/react-avatar`

---

## Components in this file

Export `Avatar`, `AvatarImage`, `AvatarFallback`, and `AvatarGroup` from `index.ts`.

---

## Props

### `Avatar` (Radix `Avatar.Root`):

```ts
size?: 'sm' | 'md' | 'lg'    // default: 'md'
className?: string
children: React.ReactNode     // AvatarImage + AvatarFallback
```

### `AvatarImage` (Radix `Avatar.Image`):

```ts
src: string
alt: string                   // required — image must have alt text
className?: string
```

### `AvatarFallback` (Radix `Avatar.Fallback`):

```ts
delayMs?: number              // default: 600 (Radix default)
className?: string
children: React.ReactNode     // initials (max 2 chars recommended) or Icon
```

### `AvatarGroup`:

```ts
max?: number                  // default: 5 — max avatars before overflow count
size?: 'sm' | 'md' | 'lg'    // default: 'md' — passed down to all Avatar children
className?: string
children: React.ReactNode     // Avatar elements
```

Forward `ref` on `Avatar` typed to `HTMLSpanElement` (Radix Avatar root).
`AvatarGroup` forwards `ref` typed to `HTMLDivElement`.

---

## Styles — `Avatar.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root` (Radix Avatar.Root `<span>`):

- `display: inline-flex`
- `align-items: center`
- `justify-content: center`
- `border-radius: var(--dds-radius-full)` — **Avatar is an explicitly documented exception**
- `overflow: hidden`
- `flex-shrink: 0`
- `background-color: var(--dds-color-bg-subtle)` (shown under fallback)
- `user-select: none`

Size modifiers:

- `.sm` → `width: 32px; height: 32px`
- `.md` → `width: 40px; height: 40px` (default)
- `.lg` → `width: 56px; height: 56px`

`.image` (Radix Avatar.Image):

- `width: 100%; height: 100%`
- `object-fit: cover`

`.fallback` (Radix Avatar.Fallback):

- `width: 100%; height: 100%`
- `display: flex; align-items: center; justify-content: center`
- `font-family: var(--dds-font-sans)`
- `font-weight: var(--dds-font-weight-semibold)`
- `color: var(--dds-color-accent-foreground)`
- `background-color: var(--dds-color-accent)`
- Font sizes per avatar size:
  - `.sm` fallback → `var(--dds-font-size-xs)`
  - `.md` fallback → `var(--dds-font-size-sm)` (default)
  - `.lg` fallback → `var(--dds-font-size-base)`

`.group` (AvatarGroup `<div>`):

- `display: flex`
- `flex-direction: row-reverse` (so first avatar appears leftmost when reversed stacking)
- `align-items: center`

`.groupItem` (each Avatar inside group):

- `margin-left: calc(var(--dds-space-2) * -1)` — negative margin for overlap (8px)
- `border: 2px solid var(--dds-color-bg-default)` — ring to separate overlapping avatars
- `border-radius: var(--dds-radius-full)`
- `&:last-child` → `margin-left: 0`

`.overflow` (the "+N" overflow avatar):

- Reuse Avatar root styles + fallback styles
- `background-color: var(--dds-color-bg-muted)`
- `color: var(--dds-color-text-muted)`
- `font-size: var(--dds-font-size-xs)`
- `font-weight: var(--dds-font-weight-semibold)`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-full)` on Avatar root — this is a **documented explicit exception** to the zero-radius rule.
- The overflow badge in `AvatarGroup` also uses `var(--dds-radius-full)` — documented exception.
- `alt` on `AvatarImage` is **required** — enforce at the TypeScript type level.
- `AvatarGroup` renders at most `max` avatars and appends a `+N` overflow indicator if children exceed `max`.
- The overlap ring (`border: 2px solid var(--dds-color-bg-default)`) must use the background token so it adapts to dark mode.

---

## Accessibility

- `AvatarImage` must have a non-empty `alt` — enforced by required type.
- `AvatarFallback` children (initials) should have `aria-hidden="true"` if the Image's `alt` already describes the user — but since Radix shows Fallback only when Image fails/loads, the Fallback should NOT be `aria-hidden` (it's the only visual representation of the user in that state).
- `AvatarGroup` as a whole: consider adding `aria-label="User avatars: Alice, Bob, and 3 others"` — this is the consumer's responsibility. Document in stories.
- The overflow span (`+3`) should have `aria-label="3 more"` for screen readers.

---

## TDD — write ALL tests before implementing

```
- Avatar renders a <span> (Radix root)
- AvatarImage renders an <img> with provided src and alt
- AvatarFallback renders its children
- Avatar forwards className to root
- Avatar forwards ref to HTMLSpanElement
- Avatar applies .md class by default
- Avatar applies .sm class when size="sm"
- Avatar applies .lg class when size="lg"
- AvatarImage has correct alt text
- AvatarFallback is not visible when image loads successfully (Radix behaviour)
- AvatarFallback is visible when image fails to load
- AvatarGroup renders correct number of avatars up to max
- AvatarGroup renders overflow indicator when children > max
- AvatarGroup overflow shows correct count (+N)
- AvatarGroup overflow has aria-label="N more"
- AvatarGroup does NOT render overflow when children <= max
- AvatarGroup forwards className to wrapper div
- AvatarGroup forwards ref to HTMLDivElement
- axe: passes for Avatar with image (alt provided)
- axe: passes for Avatar with fallback initials
- axe: passes for AvatarGroup with overflow
- axe: passes for AvatarGroup without overflow
- axe: passes for all three sizes
```

---

## Stories — `Avatar.stories.tsx`

Named exports required:

- `WithImage` (default — src provided)
- `WithFallback` (no src — fallback initials)
- `Sizes` (sm / md / lg side by side, with image)
- `FallbackSizes` (sm / md / lg with initials fallback)
- `ImageError` (invalid src — forces fallback)
- `Group` (AvatarGroup, 5 avatars, no overflow)
- `GroupOverflow` (AvatarGroup, 8 avatars, max=4 — shows +4)
- `GroupSizes` (sm / md / lg groups stacked)

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
- [ ] No hardcoded color or spacing values in SCSS
- [ ] `Avatar`, `AvatarImage`, `AvatarFallback`, and `AvatarGroup` all exported from `packages/components/src/index.ts`

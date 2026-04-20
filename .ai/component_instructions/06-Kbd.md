# Kbd · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Kbd` component.
- Scaffold: `packages/components/src/components/Kbd/`
- Radix primitive: none (native `<kbd>` element)

---

## Props

```ts
size?: 'sm' | 'base'   // default: 'sm'
className?: string
children: React.ReactNode
```

Renders as a single `<kbd>` element. Forward `ref` typed to `HTMLElement`. Spread all remaining HTML props.

Multiple keys in a sequence should be composed by the consumer as separate `<Kbd>` elements with a `+` or `→` separator between them — this component does NOT manage key sequences internally.

---

## Styles — `Kbd.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

Base `.root`:

- `font-family: var(--dds-font-mono)`
- `font-size: var(--dds-font-size-xs)` (default, `.sm`)
- `font-weight: var(--dds-font-weight-medium)`
- `line-height: var(--dds-line-height-none)`
- `color: var(--dds-color-text-default)`
- `background-color: var(--dds-color-bg-muted)`
- `border: 1px solid var(--dds-color-border-default)`
- `border-radius: var(--dds-radius-none)`
- `padding: var(--dds-space-0-5) var(--dds-space-1-5)`
- `display: inline-flex`
- `align-items: center`
- `box-shadow: var(--dds-shadow-xs)`

Size modifiers:

- `.sm` → `var(--dds-font-size-xs)`, padding `var(--dds-space-0-5) var(--dds-space-1-5)`
- `.base` → `var(--dds-font-size-sm)`, padding `var(--dds-space-1) var(--dds-space-2)`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius` is `var(--dds-radius-none)` — no exceptions. Kbd is a UI element, not an avatar.
- Must use `var(--dds-font-mono)` (JetBrains Mono) — never a system monospace font directly.
- Background must be `var(--dds-color-bg-muted)` to distinguish from surrounding text.

---

## Accessibility

- Native `<kbd>` element is semantically correct for keyboard shortcuts — no additional ARIA needed.
- Keyboard shortcuts shown visually via `<kbd>` are purely presentational labels; interactive shortcut behaviour is the consuming component's responsibility.

---

## TDD — write ALL tests before implementing

```
- renders children inside <kbd> element
- forwards className to root element
- forwards ref to HTMLElement (<kbd>)
- applies .sm class by default when no size provided
- applies .sm class when size="sm"
- applies .base class when size="base"
- forwards arbitrary HTML props (data-testid)
- axe: passes for default render (sm)
- axe: passes for size="base"
```

---

## Stories — `Kbd.stories.tsx`

Named exports required:

- `Default` (single key: ⌘)
- `Sizes` (sm and base side by side)
- `Sequence` (⌘ + K shown as two Kbd elements with " + " separator)
- `InContext` (sentence: "Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open command palette")

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
- [ ] Exported from `packages/components/src/index.ts`

# Code · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Code` component.
- Scaffold: `packages/components/src/components/Code/`
- Radix primitive: none (native `<code>` element)

---

## Props

```ts
size?: 'xs' | 'sm' | 'base'   // default: 'sm'
block?: boolean                // default: false — when true renders as <pre><code>
className?: string
children: React.ReactNode
```

When `block={false}` (default): renders as `<code>` inline.
When `block={true}`: renders as `<pre><code>` block, with `overflow-x: auto` scroll on the `<pre>`.

Forward `ref` typed to `HTMLElement` (the `<code>` element). Spread all remaining HTML props onto `<code>`.

---

## Styles — `Code.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

Base `.root` (the `<code>` element):

- `font-family: var(--dds-font-mono)`
- `font-size: var(--dds-font-size-sm)` (default)
- `line-height: var(--dds-line-height-normal)`
- `background-color: var(--dds-color-bg-muted)`
- `color: var(--dds-color-text-default)`
- `border: 1px solid var(--dds-color-border-default)`
- `border-radius: var(--dds-radius-none)`
- `padding: var(--dds-space-0-5) var(--dds-space-1-5)` (inline variant)

`.block` modifier on `<code>` (inside `<pre>`):

- `display: block`
- `padding: var(--dds-space-4)`
- Remove inline padding override

`.pre` class on the `<pre>` wrapper:

- `margin: 0`
- `overflow-x: auto`
- `background-color: var(--dds-color-bg-muted)`
- `border: 1px solid var(--dds-color-border-default)`
- `border-radius: var(--dds-radius-none)`

Size modifiers:

- `.xs` → `var(--dds-font-size-xs)`
- `.sm` → `var(--dds-font-size-sm)`
- `.base` → `var(--dds-font-size-base)`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `font-family` must always be `var(--dds-font-mono)` (JetBrains Mono). Never a system monospace stack directly.
- `border-radius` must be `var(--dds-radius-none)` — this component is NOT an exception.
- Background must be `var(--dds-color-bg-muted)`, never a hardcoded grey.

---

## Accessibility

- Native `<code>` element carries implicit semantics — no extra ARIA needed.
- `<pre>` block must be scrollable (`overflow-x: auto`) to avoid horizontal page overflow on small viewports.
- Colour contrast between `--dds-color-text-default` on `--dds-color-bg-muted` is WCAG AA-compliant per token audit.
- Add `tabIndex={0}` on the `<pre>` element when `block={true}` so keyboard users can scroll it.

---

## TDD — write ALL tests before implementing

```
- renders children inside <code> element by default
- root element is <code> when block={false}
- renders <pre><code> when block={true}
- <pre> has tabIndex={0} when block={true}
- forwards className to <code> element
- forwards ref to <code> element
- applies .xs size class when size="xs"
- applies .sm size class when size="sm" (default)
- applies .base size class when size="base"
- applies .block class to <code> when block={true}
- does not apply .block when block={false}
- forwards arbitrary HTML props onto <code> (data-testid)
- axe: passes for inline (block=false)
- axe: passes for block variant (block=true)
```

---

## Stories — `Code.stories.tsx`

Named exports required:

- `Inline` (default — `block={false}`, inside a `<p>` sentence)
- `Block` (`block={true}`, multi-line code snippet)
- `Sizes` (xs / sm / base stacked, inline)
- `LongLine` (block with a very long line to demo horizontal scroll)

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

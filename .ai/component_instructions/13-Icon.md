# Icon · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Icon` component.
- Scaffold: `packages/components/src/components/Icon/`
- Radix primitive: none (SVG wrapper)

---

## Design decision

`Icon` is a thin wrapper that sizes and colours an SVG icon passed as `children`. It does NOT bundle an icon library. Consuming code passes an SVG element directly (from Lucide, Heroicons, or custom SVGs). The wrapper enforces consistent sizing, colour inheritance, and accessibility attributes.

---

## Props

```ts
size?: 'sm' | 'md' | 'lg'   // default: 'md'
label?: string               // if provided: renders as accessible icon with aria-label; if omitted: aria-hidden="true" decorative
className?: string
children: React.ReactElement  // expected: a single <svg> element
```

Renders a `<span>` wrapper around the SVG child. Forward `ref` typed to `HTMLSpanElement`. Spread remaining HTML props onto the `<span>`.

Internally clones the SVG child to inject `aria-hidden="true"` (when no `label`) or `role="img"` + `aria-label` (when `label` is provided). Uses `React.cloneElement`.

---

## Styles — `Icon.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root` (the `<span>` wrapper):

- `display: inline-flex`
- `align-items: center`
- `justify-content: center`
- `flex-shrink: 0`
- `color: inherit` — icon colour always comes from the parent via `currentColor`
- `line-height: 1`

Size modifiers (applied to `.root` — controls `width` and `height` of the span, and the SVG inherits via `width: 100%; height: 100%`):

- `.sm` → `width: var(--dds-icon-size-sm); height: var(--dds-icon-size-sm)` (14px)
- `.md` → `width: var(--dds-icon-size-md); height: var(--dds-icon-size-md)` (16px)
- `.lg` → `width: var(--dds-icon-size-lg); height: var(--dds-icon-size-lg)` (32px)

The injected SVG child should have:

- `width="100%"`
- `height="100%"`
- `aria-hidden="true"` (decorative) OR `role="img"` + `aria-label={label}` (meaningful)

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- The SVG must NEVER use hardcoded `fill` or `stroke` colours — it should use `currentColor` so it inherits from the parent.
- Do NOT set a `color` on `.root` — colour is always inherited from context (text colour, button colour, etc.).
- Icon size is set on the wrapper span, not on the SVG directly — use `width: 100%; height: 100%` on the SVG.
- The `--dds-icon-size-*` tokens must be used — never hardcode pixel sizes.

---

## Accessibility

Two modes:

1. **Decorative (no `label` prop):** SVG gets `aria-hidden="true"`. The span has no accessible name. The parent element (e.g. Button with text, IconButton with `label`) provides the accessible label.
2. **Meaningful (with `label` prop):** SVG gets `role="img"` and `aria-label={label}`. Use this when the icon conveys information with no accompanying visible text.

Never use both `aria-hidden` and `aria-label` on the same element.

---

## TDD — write ALL tests before implementing

```
- renders a <span> wrapper
- renders children (SVG) inside the span
- forwards className to root span
- forwards ref to HTMLSpanElement
- applies .md class by default
- applies .sm class when size="sm"
- applies .lg class when size="lg"
- SVG child has aria-hidden="true" when no label prop
- SVG child has role="img" when label prop is provided
- SVG child has aria-label matching label prop
- SVG child does NOT have aria-hidden when label is provided
- forwards arbitrary HTML props to span (data-testid)
- forwards id and style props to span
- axe: passes with no label (decorative, inside button with label)
- axe: passes with label prop (meaningful icon)
- axe: passes for size="sm"
- axe: passes for size="lg"
```

---

## Stories — `Icon.stories.tsx`

Named exports required:

- `Decorative` (no label — icon inside a `<button>` with text)
- `Meaningful` (label="Close" — standalone icon with accessible label)
- `Sizes` (sm / md / lg side by side, same icon)
- `ColourInheritance` (icons inside different coloured text wrappers, showing inheritance)

Use a placeholder SVG (e.g. a simple square or circle) in stories since no icon library is bundled. Document in the story that consumers should pass their own SVG (Lucide, Heroicons, etc.).

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] Both decorative and meaningful modes demonstrated in stories
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color or size values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

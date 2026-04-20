# Caption · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Caption` component.
- Scaffold: `packages/components/src/components/Caption/`
- Radix primitive: none (native HTML element via `as` prop)

---

## Props

```ts
as?: 'p' | 'span' | 'figcaption' | 'caption'   // default: 'p'
intent?: 'default' | 'error' | 'success'        // default: 'default'
className?: string
children: React.ReactNode
```

Forward `ref` typed to `HTMLParagraphElement`. Spread all remaining HTML props.

---

## Styles — `Caption.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

Base `.root`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `font-weight: var(--dds-font-weight-normal)`
- `line-height: var(--dds-line-height-normal)`
- `color: var(--dds-color-text-muted)`
- `margin: 0`

Intent modifiers:

- `.intentDefault` → `color: var(--dds-color-text-muted)` (same as base — explicit)
- `.intentError` → `color: var(--dds-color-status-danger)`
- `.intentSuccess` → `color: var(--dds-color-status-success)`

No `border-radius`. No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- Caption is always `xs` size — it does not support size variants. If larger text is needed, use `Text`.
- `intent="error"` uses `--dds-color-status-danger`, NOT a hardcoded red.
- This component is the correct one to use for form field helper text and validation messages.

---

## Accessibility

- When used as a form validation error message, the consuming parent (e.g. a `Field` molecule) is responsible for adding `aria-describedby` on the input pointing to this element's `id`.
- `intent="error"` does NOT add `role="alert"` automatically — this is the parent's responsibility to avoid duplicate live region announcements.
- Colour contrast: `--dds-color-text-muted` and `--dds-color-status-danger` are both WCAG AA-compliant on light and dark backgrounds per token audit.

---

## TDD — write ALL tests before implementing

```
- renders children inside <p> by default
- renders as <span> when as="span"
- renders as <figcaption> when as="figcaption"
- renders as <caption> when as="caption"
- forwards className to root element
- forwards ref to root DOM element
- applies .intentDefault class when intent="default" (default)
- applies .intentError class when intent="error"
- applies .intentSuccess class when intent="success"
- forwards arbitrary HTML props (id, data-testid)
- axe: passes for default render
- axe: passes for intent="error"
- axe: passes for intent="success"
- axe: passes when as="figcaption" inside <figure>
```

---

## Stories — `Caption.stories.tsx`

Named exports required:

- `Default` (muted helper text under a field)
- `Error` (intent="error", validation message)
- `Success` (intent="success", confirmation message)
- `AsFigcaption` (inside a `<figure>` with an image)
- `InContext` (Label + Input + Caption group mock)

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

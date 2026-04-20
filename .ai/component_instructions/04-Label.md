# Label · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Label` component.
- Scaffold: `packages/components/src/components/Label/`
- Radix primitive: `@radix-ui/react-label`

---

## Props

```ts
required?: boolean     // default: false — appends a required indicator (*)
disabled?: boolean     // default: false — reduces opacity
size?: 'sm' | 'base'  // default: 'sm'
className?: string
children: React.ReactNode
htmlFor?: string       // passed through to underlying <label>
```

Wrap `@radix-ui/react-label`'s `Root` primitive. Forward `ref` typed to `HTMLLabelElement`. Spread all remaining HTML props.

---

## Styles — `Label.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

Base `.root`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)` (default)
- `font-weight: var(--dds-font-weight-medium)`
- `line-height: var(--dds-line-height-none)`
- `color: var(--dds-color-text-default)`
- `display: inline-flex`
- `align-items: center`
- `gap: var(--dds-space-1)`
- `cursor: default`

Size modifier:

- `.sm` → `var(--dds-font-size-sm)` (same as default, explicit class)
- `.base` → `var(--dds-font-size-base)`

Required indicator `.required`:

- `color: var(--dds-color-status-danger)`
- `font-weight: var(--dds-font-weight-bold)`
- rendered as a `<span aria-hidden="true">*</span>` adjacent to children

Disabled modifier `.disabled`:

- `opacity: 0.5`
- `cursor: not-allowed`

No `border-radius`. No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- The required indicator (`*`) MUST be `aria-hidden="true"`. Required state must be communicated to form fields via `aria-required` on the input, not through this component.
- Label should NOT add `aria-required` itself — it only provides the visual indicator.
- Use Radix `@radix-ui/react-label` as the underlying element for correct `htmlFor` + pointer cursor behaviour.

---

## Accessibility

- Radix Label primitive provides correct association behaviour via `htmlFor`.
- `aria-hidden="true"` on the `*` indicator prevents screen readers from announcing "asterisk".
- Disabled state should only reduce opacity — a disabled label is still readable.
- Colour contrast: `--dds-color-text-default` on any background is WCAG AA-compliant per token audit.

---

## TDD — write ALL tests before implementing

```
- renders children text
- renders as <label> element (via Radix)
- forwards htmlFor to <label> htmlFor attribute
- forwards className to root element
- forwards ref to HTMLLabelElement
- does NOT render required indicator when required={false} (default)
- renders required indicator <span> when required={true}
- required indicator has aria-hidden="true"
- required indicator contains "*" text
- applies .disabled class when disabled={true}
- does NOT apply .disabled class when disabled={false}
- applies .sm class when size="sm"
- applies .base class when size="base"
- forwards arbitrary HTML props (data-testid)
- axe: passes for default render
- axe: passes when required={true}
- axe: passes when disabled={true}
- axe: passes when used with htmlFor pointing to an input in the DOM
```

---

## Stories — `Label.stories.tsx`

Named exports required:

- `Default` (label text, no required)
- `Required` (required={true})
- `Disabled` (disabled={true})
- `RequiredAndDisabled`
- `Sizes` (sm and base stacked)
- `WithInput` (label + input in a field — demonstrates htmlFor linkage)

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

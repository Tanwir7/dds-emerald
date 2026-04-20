# Textarea · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Textarea` component.
- Scaffold: `packages/components/src/components/Textarea/`
- Radix primitive: none (native `<textarea>` element)

---

## Props

```ts
size?: 'sm' | 'md' | 'lg'   // default: 'md' — controls font-size and padding, not height
rows?: number                // default: 3 — native rows attribute
resize?: 'none' | 'vertical' | 'both'   // default: 'vertical'
invalid?: boolean            // default: false
className?: string
// All native <textarea> HTML attributes forwarded (value, onChange, disabled, readOnly, placeholder, maxLength, aria-*, etc.)
```

Renders a single `<textarea>` element. Forward `ref` typed to `HTMLTextAreaElement`. Spread all native textarea props.

---

## Styles — `Textarea.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

Base `.root`:

- `display: block`
- `width: 100%`
- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)` (default, `.md`)
- `font-weight: var(--dds-font-weight-normal)`
- `line-height: var(--dds-line-height-relaxed)`
- `color: var(--dds-color-text-default)`
- `background-color: var(--dds-color-bg-input)`
- `border: 1px solid var(--dds-color-border-input)`
- `border-radius: var(--dds-radius-none)`
- `padding: var(--dds-space-2) var(--dds-space-3)` (default, `.md`)
- `outline: 3px solid transparent`
- `outline-offset: 2px`
- `transition: border-color, outline-color — var(--dds-duration-fast) var(--dds-ease-standard)`
- `&::placeholder` → `color: var(--dds-color-text-muted)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5); border-color: var(--dds-color-focus-ring)`
- `&:disabled` → `opacity: 0.5; cursor: not-allowed; resize: none`
- `&:read-only` → `background-color: var(--dds-color-bg-muted); cursor: default; resize: none`

Size modifiers:

- `.sm` → `padding: var(--dds-space-1-5) var(--dds-space-2); font-size: var(--dds-font-size-xs)`
- `.md` → `padding: var(--dds-space-2) var(--dds-space-3); font-size: var(--dds-font-size-sm)` (default)
- `.lg` → `padding: var(--dds-space-3) var(--dds-space-4); font-size: var(--dds-font-size-base)`

Invalid state `.invalid`:

- `border-color: var(--dds-color-status-danger)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-status-danger) l c h / 0.5)`

Resize modifiers:

- `.resizeNone` → `resize: none`
- `.resizeVertical` → `resize: vertical`
- `.resizeBoth` → `resize: both`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` — no exceptions.
- When `disabled` or `readOnly`, force `resize: none` via CSS (not just via prop).
- `invalid` drives visual styling only — `aria-invalid` belongs on the element and should be forwarded from the consumer via the native `aria-invalid` HTML attribute support.
- `line-height` must be `var(--dds-line-height-relaxed)` — textarea text is multi-line and needs more breathing room than single-line inputs.

---

## Accessibility

- Native `<textarea>` carries correct role — no extra ARIA.
- `disabled` attribute must be the native attribute (not just `aria-disabled`).
- `readOnly` is keyboard-reachable; do not remove from tab order.
- `aria-invalid` can be passed as a native prop by the consumer — forward it correctly.
- `aria-describedby` forwarded from consumer to support Caption/error linkage.
- Focus ring identical to Input: `outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5); outline-offset: 2px`

---

## TDD — write ALL tests before implementing

```
- renders a <textarea> element
- forwards ref to HTMLTextAreaElement
- forwards className to <textarea>
- applies .md class by default
- applies .sm class when size="sm"
- applies .lg class when size="lg"
- has rows={3} by default
- respects rows prop (rows={6})
- applies .resizeVertical class by default
- applies .resizeNone class when resize="none"
- applies .resizeBoth class when resize="both"
- applies .invalid class when invalid={true}
- does NOT apply .invalid when invalid={false}
- forwards placeholder prop
- forwards value and onChange props
- forwards disabled (native attribute)
- forwards readOnly
- forwards maxLength
- forwards aria-label, aria-describedby, aria-invalid
- forwards data-testid and arbitrary props
- keyboard: receives focus on Tab
- keyboard: does not receive focus when disabled
- keyboard: is reachable when readOnly
- axe: passes for default render
- axe: passes when invalid={true}
- axe: passes when disabled
- axe: passes when readOnly
- axe: passes with aria-label provided
```

---

## Stories — `Textarea.stories.tsx`

Named exports required:

- `Default` (md, 3 rows, placeholder)
- `Sizes` (sm / md / lg stacked)
- `Invalid` (invalid={true})
- `Disabled`
- `ReadOnly` (with pre-filled value)
- `ResizeNone`
- `ResizeBoth`
- `LongContent` (rows={6}, pre-filled multi-paragraph text)
- `FocusVisible` with `play()`:
  ```ts
  play: async ({ canvasElement }) => {
    const ta = within(canvasElement).getByRole('textbox');
    await userEvent.tab();
    await expect(ta).toHaveFocus();
  };
  ```

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all variants and states
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] All variants represented in stories
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color or spacing values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

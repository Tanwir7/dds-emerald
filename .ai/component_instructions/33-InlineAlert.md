# InlineAlert · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `InlineAlert` component.
- Scaffold: `packages/components/src/components/InlineAlert/`
- Radix primitive: none (native HTML elements)

---

## Purpose

`InlineAlert` is a compact single-line feedback strip: an icon followed by a short message. It sits inline within content — inside a form, beneath a section, beside a field — rather than spanning the full page width like `Alert`. It has no title, no dismiss button, and no left accent border. It is the lightest feedback primitive in the system.

Typical uses: form-level summary error ("Please fix 3 errors above"), info note beneath a code block, confirmation line after an action.

---

## Props

```ts
intent?: 'info' | 'success' | 'warning' | 'danger'  // default: 'info'
showIcon?: boolean   // default: true
className?: string
children: React.ReactNode
```

Renders as `<span>` (inline) by default — can be used inside `<p>` without causing block-in-inline violations.

Forward `ref` typed to `HTMLSpanElement`. Spread remaining HTML props.

---

## Intent token mapping

Same as Alert — use identical icon and colour tokens:

| Intent    | Icon colour                       | Text colour                     |
| --------- | --------------------------------- | ------------------------------- |
| `info`    | `var(--dds-color-status-info)`    | `var(--dds-color-text-default)` |
| `success` | `var(--dds-color-status-success)` | `var(--dds-color-text-default)` |
| `warning` | `var(--dds-color-status-warning)` | `var(--dds-color-text-default)` |
| `danger`  | `var(--dds-color-status-danger)`  | `var(--dds-color-text-default)` |

No background. No border. No padding beyond the icon gap.

---

## Structure

```html
<span
  role={intent === 'danger' || intent === 'warning' ? 'alert' : 'status'}
  aria-live={intent === 'danger' || intent === 'warning' ? 'assertive' : 'polite'}
  aria-atomic="true"
  class="root intentInfo|Success|Warning|Danger"
>
  {showIcon && (
    <span class="icon" aria-hidden="true">
      {icons[intent]}
    </span>
  )}
  <span class="message">{children}</span>
</span>
```

---

## Styles — `InlineAlert.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: inline-flex`
- `align-items: center`
- `gap: var(--dds-space-1)`
- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)`
- `line-height: var(--dds-line-height-none)`
- `font-weight: var(--dds-font-weight-normal)`

`.icon`:

- `display: inline-flex`
- `flex-shrink: 0`
- `width: var(--dds-icon-size-md); height: var(--dds-icon-size-md)`

Intent colour modifiers on `.icon`:

- `.intentInfo .icon` → `color: var(--dds-color-status-info)`
- `.intentSuccess .icon` → `color: var(--dds-color-status-success)`
- `.intentWarning .icon` → `color: var(--dds-color-status-warning)`
- `.intentDanger .icon` → `color: var(--dds-color-status-danger)`

`.message`:

- `color: var(--dds-color-text-default)`

No background. No border. No border-radius. No hardcoded values. No Tailwind. No inline styles.

---

## Icons

Reuse the same SVG shapes as `Alert` component (InfoIcon, CheckCircleIcon, AlertTriangleIcon, AlertCircleIcon) — but embed them at `--dds-icon-size-md` (16px) not `--dds-icon-size-lg` (32px). Embed directly, do not import from Alert.

---

## Critical design rules

- `InlineAlert` is `<span>`-based — it must be safe to use inside inline contexts without causing HTML validation errors.
- No background, no border, no padding — purely icon + text. If a background is needed, use `Alert` instead.
- `border-radius: var(--dds-radius-none)` — not that it matters here (no background/border), but maintain the rule.
- `role` and `aria-live` follow the same logic as Alert — danger/warning = assertive, info/success = polite.

---

## Accessibility

- `role="alert"` + `aria-live="assertive"` for `danger`/`warning`.
- `role="status"` + `aria-live="polite"` for `info`/`success`.
- `aria-atomic="true"` on root span.
- Icon is `aria-hidden="true"` — intent communicated via text content and live region.
- No keyboard interaction — InlineAlert is read-only.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a <span> element
- renders children as message text
- renders icon by default (showIcon=true)
- does NOT render icon when showIcon={false}
- icon has aria-hidden="true"
- forwards className to root span
- forwards ref to HTMLSpanElement

// Role and live region
- has role="status" and aria-live="polite" for intent="info" (default)
- has role="status" and aria-live="polite" for intent="success"
- has role="alert" and aria-live="assertive" for intent="warning"
- has role="alert" and aria-live="assertive" for intent="danger"
- has aria-atomic="true" for all intents

// Intent classes
- applies .intentInfo by default
- applies .intentSuccess when intent="success"
- applies .intentWarning when intent="warning"
- applies .intentDanger when intent="danger"

// Forwarding
- forwards id, data-testid, aria-label

// Axe
- axe: passes for intent="info"
- axe: passes for intent="success"
- axe: passes for intent="warning"
- axe: passes for intent="danger"
- axe: passes with showIcon={false}
- axe: passes when used inside a <p> element
```

---

## Stories — `InlineAlert.stories.tsx`

Named exports required:

- `Info` — default
- `Success`
- `Warning`
- `Danger`
- `NoIcon` — showIcon={false}
- `AllIntents` — all 4 stacked
- `InsideParagraph` — InlineAlert rendered inside a `<p>` of body text
- `InFormContext` — InlineAlert below a Field molecule as a form-level summary

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all intents
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] Safe to use inside `<p>` or `<label>` — span-based
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

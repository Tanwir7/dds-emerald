# Alert · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Alert` component.
- Scaffold: `packages/components/src/components/Alert/`
- Radix primitive: none (native HTML elements)

---

## Purpose

`Alert` is a full-width inline feedback block used to communicate important information, warnings, errors, or success states within the page flow. It is NOT a toast (which is transient and overlapping) — it is a persistent, in-page message block.

---

## Props

```ts
intent?: 'info' | 'success' | 'warning' | 'danger'  // default: 'info'
title?: string           // optional bold title line above description
dismissible?: boolean    // default: false — shows close button
onDismiss?: () => void   // called when dismiss button clicked
icon?: React.ReactNode   // optional custom icon to override default intent icon
showIcon?: boolean       // default: true
className?: string
children: React.ReactNode  // body content / description text
```

Renders as a `<div role="alert">` for danger/warning intents and `<div role="status">` for info/success intents. Forward `ref` typed to `HTMLDivElement`. Spread remaining HTML props.

---

## Intent token mapping

| Intent    | Background                                    | Border (left accent)              | Text                            | Icon colour                       |
| --------- | --------------------------------------------- | --------------------------------- | ------------------------------- | --------------------------------- |
| `info`    | `var(--dds-color-status-info)` at 10% opacity | `var(--dds-color-status-info)`    | `var(--dds-color-text-default)` | `var(--dds-color-status-info)`    |
| `success` | `var(--dds-badge-success-bg)`                 | `var(--dds-color-status-success)` | `var(--dds-color-text-default)` | `var(--dds-color-status-success)` |
| `warning` | `var(--dds-badge-warning-bg)`                 | `var(--dds-color-status-warning)` | `var(--dds-color-text-default)` | `var(--dds-color-status-warning)` |
| `danger`  | `var(--dds-badge-danger-bg)`                  | `var(--dds-color-status-danger)`  | `var(--dds-color-text-default)` | `var(--dds-color-status-danger)`  |

The left border accent is `border-left: 4px solid <intent-colour>` — NOT a full border.

---

## Default icons per intent

Embed SVGs directly. All icons use `currentColor` (which will be the intent icon colour):

```tsx
const icons = {
  info: <InfoIcon />,
  success: <CheckCircleIcon />,
  warning: <AlertTriangleIcon />,
  danger: <AlertCircleIcon />,
};
```

Use simple geometric SVG shapes for each. `aria-hidden="true"` on all default icons.

---

## Structure

```html
<div
  role={intent === 'danger' || intent === 'warning' ? 'alert' : 'status'}
  aria-live={intent === 'danger' || intent === 'warning' ? 'assertive' : 'polite'}
  aria-atomic="true"
  class="root intentInfo|Success|Warning|Danger"
>
  <!-- icon column -->
  {showIcon && (
    <span class="icon" aria-hidden="true">
      {icon ?? icons[intent]}
    </span>
  )}

  <!-- content column -->
  <div class="content">
    {title && <p class="title">{title}</p>}
    <div class="body">{children}</div>
  </div>

  <!-- dismiss button -->
  {dismissible && (
    <button type="button" class="dismiss" aria-label="Dismiss alert" onClick={onDismiss}>
      <CloseIcon />
    </button>
  )}
</div>
```

---

## Styles — `Alert.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: flex`
- `align-items: flex-start`
- `gap: var(--dds-space-3)`
- `padding: var(--dds-space-3) var(--dds-space-4)`
- `border-radius: var(--dds-radius-none)`
- `border: 1px solid transparent`
- `border-left-width: 4px`
- `width: 100%`

Intent modifiers — background + border-left colour per above mapping:

- `.intentInfo`
- `.intentSuccess`
- `.intentWarning`
- `.intentDanger`

For background, use the badge token's alpha variant where available. For info use `oklch(from var(--dds-color-status-info) l c h / 0.1)`:

```scss
.intentInfo {
  background-color: oklch(from var(--dds-color-status-info) l c h / 0.1);
  border-left-color: var(--dds-color-status-info);
}
.intentSuccess {
  background-color: var(--dds-badge-success-bg);
  border-left-color: var(--dds-color-status-success);
}
.intentWarning {
  background-color: var(--dds-badge-warning-bg);
  border-left-color: var(--dds-color-status-warning);
}
.intentDanger {
  background-color: var(--dds-badge-danger-bg);
  border-left-color: var(--dds-color-status-danger);
}
```

`.icon`:

- `flex-shrink: 0`
- `margin-top: var(--dds-space-0-5)` — optical alignment with first text line
- `width: var(--dds-icon-size-lg); height: var(--dds-icon-size-lg)`
- `color` inherited from intent modifier:
  - `.intentInfo .icon` → `color: var(--dds-color-status-info)`
  - `.intentSuccess .icon` → `color: var(--dds-color-status-success)`
  - `.intentWarning .icon` → `color: var(--dds-color-status-warning)`
  - `.intentDanger .icon` → `color: var(--dds-color-status-danger)`

`.content`:

- `flex: 1`
- `min-width: 0`

`.title`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)`
- `font-weight: var(--dds-font-weight-semibold)`
- `color: var(--dds-color-text-default)`
- `margin: 0 0 var(--dds-space-1) 0`
- `line-height: var(--dds-line-height-snug)`

`.body`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)`
- `color: var(--dds-color-text-default)`
- `line-height: var(--dds-line-height-normal)`

`.dismiss`:

- `flex-shrink: 0`
- `display: inline-flex; align-items: center; justify-content: center`
- `width: var(--dds-icon-size-lg); height: var(--dds-icon-size-lg)`
- `border: none; background: transparent`
- `color: var(--dds-color-text-muted)`
- `cursor: pointer`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent; outline-offset: 2px`
- `&:hover` → `color: var(--dds-color-text-default)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `role="alert"` + `aria-live="assertive"` for `danger` and `warning` — these need immediate screen reader announcement.
- `role="status"` + `aria-live="polite"` for `info` and `success` — polite announcement, does not interrupt.
- `aria-atomic="true"` on both — the whole alert content is announced as a unit.
- `border-radius: var(--dds-radius-none)` — no rounding.
- The left accent is `border-left: 4px solid` — NOT a box shadow or pseudo element.
- Default icons are decorative (`aria-hidden`) — the intent is communicated by colour AND `role="alert"/"status"` announcement.

---

## Accessibility

- `role="alert"` / `role="status"` provide live region semantics for dynamic injection.
- `aria-live="assertive"` for danger/warning, `"polite"` for info/success.
- `aria-atomic="true"` so the full alert content is read, not just changed parts.
- Dismiss button: `aria-label="Dismiss alert"` — explicit. If title is provided, use `aria-label={`Dismiss: ${title}`}`.
- The icon is `aria-hidden="true"` — intent is communicated via role and text.
- Keyboard: dismiss button is reachable by Tab and activatable by Enter/Space.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a div with role="status" for intent="info" (default)
- renders a div with role="status" for intent="success"
- renders a div with role="alert" for intent="warning"
- renders a div with role="alert" for intent="danger"
- has aria-live="polite" for info/success
- has aria-live="assertive" for warning/danger
- has aria-atomic="true"
- renders children as body content
- renders title when title prop provided
- does NOT render title element when title omitted
- forwards className to root
- forwards ref to HTMLDivElement

// Intents
- applies .intentInfo by default
- applies .intentSuccess when intent="success"
- applies .intentWarning when intent="warning"
- applies .intentDanger when intent="danger"

// Icon
- renders default icon when showIcon={true} (default)
- does NOT render icon when showIcon={false}
- renders custom icon when icon prop provided
- icon has aria-hidden="true"

// Dismissible
- does NOT render dismiss button by default
- renders dismiss button when dismissible={true}
- dismiss button has type="button"
- dismiss button has aria-label="Dismiss alert"
- dismiss button has aria-label including title when title provided
- clicking dismiss calls onDismiss
- dismiss button is focusable

// Keyboard
- dismiss button receives focus on Tab
- Enter activates dismiss
- Space activates dismiss

// Forwarding
- forwards id, data-testid, aria-labelledby

// Axe
- axe: passes for intent="info"
- axe: passes for intent="success"
- axe: passes for intent="warning"
- axe: passes for intent="danger"
- axe: passes with title
- axe: passes with dismissible={true}
- axe: passes with showIcon={false}
```

---

## Stories — `Alert.stories.tsx`

Named exports required:

- `Info` — default
- `Success`
- `Warning`
- `Danger`
- `WithTitle` — title + children body
- `TitleOnly` — title, no children
- `BodyOnly` — no title, only children
- `NoIcon` — showIcon={false}
- `CustomIcon` — icon prop with custom SVG
- `Dismissible` — dismissible={true}
- `AllIntents` — all 4 intents stacked
- `LongContent` — multi-paragraph body text

`DismissInteraction` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const dismiss = within(canvasElement).getByRole('button', { name: /dismiss/i });
  await userEvent.tab();
  await expect(dismiss).toHaveFocus();
  await userEvent.keyboard('{Enter}');
};
```

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all intents and states
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] `role="alert"` vs `role="status"` correct per intent
- [ ] `aria-live` correct per intent
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

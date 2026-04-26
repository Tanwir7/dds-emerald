# Tag · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Tag` component.
- Scaffold: `packages/components/src/components/Tag/`
- Radix primitive: none (native HTML elements)

---

## Purpose

`Tag` is a compact, removable label chip used for user-selected values, filters, and categories. It renders a text label with an optional remove button. It is NOT the same as `Badge` — `Badge` is read-only status; `Tag` is interactive and removable.

---

## Props

```ts
variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info'  // default: 'default'
size?: 'sm' | 'md'          // default: 'md'
removable?: boolean          // default: false — shows remove (×) button
onRemove?: () => void        // called when remove button clicked
disabled?: boolean           // default: false
interactive?: boolean        // default: false — makes the whole tag clickable (adds hover/focus styles to root)
onClick?: React.MouseEventHandler<HTMLSpanElement>  // only used when interactive={true}
className?: string
children: React.ReactNode
```

Renders as a `<span>` (not a `<button>`) by default. When `interactive={true}`, adds `role="button"` and `tabIndex={0}` to the root span.

Forward `ref` typed to `HTMLSpanElement`. Spread all remaining HTML props.

---

## Variant token mapping

| Variant   | Background                    | Text colour                          | Border                            |
| --------- | ----------------------------- | ------------------------------------ | --------------------------------- |
| `default` | `var(--dds-color-bg-subtle)`  | `var(--dds-color-text-default)`      | `var(--dds-color-border-default)` |
| `accent`  | `var(--dds-color-accent)`     | `var(--dds-color-accent-foreground)` | transparent                       |
| `success` | `var(--dds-badge-success-bg)` | `var(--dds-badge-success-color)`     | `var(--dds-badge-success-ring)`   |
| `warning` | `var(--dds-badge-warning-bg)` | `var(--dds-badge-warning-color)`     | `var(--dds-badge-warning-ring)`   |
| `danger`  | `var(--dds-badge-danger-bg)`  | `var(--dds-badge-danger-color)`      | `var(--dds-badge-danger-ring)`    |
| `info`    | `var(--dds-badge-info-bg)`    | `var(--dds-badge-info-color)`        | `var(--dds-badge-info-ring)`      |

---

## Styles — `Tag.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: inline-flex`
- `align-items: center`
- `gap: var(--dds-space-1)`
- `font-family: var(--dds-font-sans)`
- `font-weight: var(--dds-font-weight-medium)`
- `line-height: var(--dds-line-height-none)`
- `white-space: nowrap`
- `border: 1px solid transparent`
- `border-radius: var(--dds-radius-none)`
- `user-select: none`
- `transition: background-color, border-color, opacity var(--dds-duration-fast) var(--dds-ease-standard)`

Size modifiers:

- `.sm` → `padding: var(--dds-space-0-5) var(--dds-space-1-5); font-size: var(--dds-font-size-xs)`
- `.md` → `padding: var(--dds-space-1) var(--dds-space-2); font-size: var(--dds-font-size-sm)` (default)

Variant modifiers (background, color, border — use above mapping):

- `.variantDefault`, `.variantAccent`, `.variantSuccess`, `.variantWarning`, `.variantDanger`, `.variantInfo`

Interactive modifier `.interactive`:

- `cursor: pointer`
- `outline: 3px solid transparent`
- `outline-offset: 1px`
- `&:hover:not(.disabled)` → `filter: brightness(0.95)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`

Disabled modifier `.disabled`:

- `opacity: 0.5`
- `pointer-events: none`
- `cursor: not-allowed`

`.removeButton`:

- `display: inline-flex`
- `align-items: center`
- `justify-content: center`
- `flex-shrink: 0`
- `padding: 0`
- `border: none`
- `background: transparent`
- `color: inherit`
- `cursor: pointer`
- `opacity: 0.7`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent`
- `outline-offset: 1px`
- `transition: opacity var(--dds-duration-fast) var(--dds-ease-standard)`
- `&:hover` → `opacity: 1`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`
- Size `.sm` button → `width: 14px; height: 14px`
- Size `.md` button → `width: 16px; height: 16px`

`.removeIcon` (the × SVG):

- `width: 100%; height: 100%`
- `stroke: currentColor; fill: none`

No hardcoded values. No Tailwind. No inline styles.

---

## Remove button structure

```tsx
{
  removable && !disabled && (
    <button
      type="button"
      className={clsx(styles.removeButton, styles[size])}
      onClick={(e) => {
        e.stopPropagation();
        onRemove?.();
      }}
      aria-label={`Remove ${typeof children === 'string' ? children : 'tag'}`}
      tabIndex={0}
    >
      <svg className={styles.removeIcon} viewBox="0 0 10 10" aria-hidden="true" focusable="false">
        <path d="M2 2l6 6M8 2l-6 6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}
```

`e.stopPropagation()` prevents the remove click from bubbling to `onClick` when `interactive={true}`.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` — Tag is a rectangular chip, no exceptions.
- The remove `<button>` must be a native `<button type="button">` — not a span or div.
- `aria-label` on the remove button must include the tag text: `"Remove react"` not just `"Remove"`.
- `e.stopPropagation()` on remove click is mandatory when the root is interactive.
- `disabled` applies to the whole component — the remove button should be hidden (not just disabled) when `disabled={true}`.
- Colour tokens come from the `--dds-badge-*` tokens where applicable — same palette as Badge. Do NOT hardcode colours.

---

## Accessibility

- Non-interactive Tag (default): `<span>` with no role — purely informational.
- Interactive Tag: `role="button"`, `tabIndex={0}`, keyboard: Enter + Space activate `onClick`.
- Remove button: always a native `<button>` with descriptive `aria-label`.
- When `removable={true}` and `interactive={true}`, Tab focuses the tag root; Tab again focuses the remove button.
- Screen reader should announce: "react, button" (interactive) or "react, remove react, button" (removable).

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a <span> by default
- renders children text
- forwards className to root
- forwards ref to HTMLSpanElement
- does NOT render remove button by default
- renders remove button when removable={true}

// Variants
- applies .variantDefault by default
- applies .variantAccent when variant="accent"
- applies .variantSuccess when variant="success"
- applies .variantWarning when variant="warning"
- applies .variantDanger when variant="danger"
- applies .variantInfo when variant="info"

// Sizes
- applies .md class by default
- applies .sm class when size="sm"

// Remove button
- remove button has type="button"
- remove button aria-label includes tag text: "Remove react"
- clicking remove button calls onRemove
- clicking remove does NOT call onClick when interactive (stopPropagation)
- remove button is NOT rendered when disabled={true}

// Interactive
- does NOT apply .interactive by default
- applies .interactive when interactive={true}
- has role="button" when interactive={true}
- has tabIndex={0} when interactive={true}
- calls onClick when interactive tag is clicked
- calls onClick on Enter key when interactive
- calls onClick on Space key when interactive

// Disabled
- applies .disabled class when disabled={true}
- has pointer-events:none when disabled

// Keyboard
- remove button receives Tab focus when removable={true}
- Enter/Space activates remove button
- interactive tag receives Tab focus

// Axe
- axe: passes for default (non-interactive, non-removable)
- axe: passes for removable={true}
- axe: passes for interactive={true}
- axe: passes for interactive + removable
- axe: passes for each variant
- axe: passes for disabled
```

---

## Stories — `Tag.stories.tsx`

Named exports required:

- `Default` — default variant, md
- `Variants` — all 6 variants side by side
- `Sizes` — sm and md side by side
- `Removable` — removable={true}, onRemove logs to console
- `Interactive` — interactive={true}, onClick logs to console
- `InteractiveRemovable` — both interactive and removable
- `Disabled` — disabled={true}
- `TagGroup` — 5 tags in a Flex wrap container (filter chip pattern)
- `RemovableGroup` — controlled list that removes tags on click

`RemoveInteraction` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const removeBtn = within(canvasElement).getByRole('button', { name: /remove/i });
  await userEvent.click(removeBtn);
  // Verify onRemove was called (via args.onRemove.mock)
};
```

`KeyboardActivate` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const tag = within(canvasElement).getByRole('button', { name: /react/i });
  await userEvent.tab();
  await expect(tag).toHaveFocus();
  await userEvent.keyboard('{Enter}');
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
- [ ] Remove button `aria-label` includes tag text content
- [ ] `e.stopPropagation()` on remove click verified in tests
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

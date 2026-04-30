# NavItem · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `NavItem` component.
- Scaffold: `packages/components/src/components/NavItem/`
- Radix primitive: `@radix-ui/react-slot` (for `asChild` router link support)

---

## Purpose

`NavItem` is the standard navigation link atom used to build sidebars, top navigation bars, and any grouped navigation list. It renders a single clickable row with an optional leading icon, label text, optional trailing badge/count slot, and supports active, disabled, and nested (indented) states.

It is NOT a navigation container — it is always used inside a `<nav>` or `<ul>` provided by the consumer. It does not manage its own active state — the consumer controls `isActive` based on the current route.

---

## Exports from `index.ts`

```ts
export { NavItem };
export type { NavItemProps };
```

---

## Props

```ts
interface NavItemProps {
  href?: string; // renders as <a> when provided
  asChild?: boolean; // default: false — Radix Slot for router links
  isActive?: boolean; // default: false — active/current page state
  disabled?: boolean; // default: false
  icon?: React.ReactNode; // optional leading icon
  endSlot?: React.ReactNode; // optional trailing element (Badge, count, indicator)
  level?: 0 | 1 | 2; // default: 0 — indent level for nested navigation
  variant?: 'default' | 'sidebar'; // default: 'default'
  // 'default' — light background nav (top bar, card nav)
  // 'sidebar' — dark sidebar context (uses sidebar-specific tokens)
  size?: 'sm' | 'md'; // default: 'md'
  className?: string;
  children: React.ReactNode; // label text
  onClick?: React.MouseEventHandler<HTMLElement>;
  // All native <a> or <button> HTML attributes forwarded
}
```

When `href` is provided: renders as `<a>`.
When `asChild` is true: renders via `Slot`, merging props onto the child.
When neither: renders as `<button type="button">`.

Forward `ref` typed to `HTMLAnchorElement | HTMLButtonElement`. Spread all remaining HTML props.

---

## Element selection logic

```tsx
const Comp = asChild ? Slot : href ? 'a' : 'button';
const extraProps = !asChild && !href ? { type: 'button' as const } : {};
```

---

## Structure

```tsx
<Comp
  ref={ref}
  href={href}
  aria-current={isActive ? 'page' : undefined}
  aria-disabled={disabled ? true : undefined}
  disabled={!href && !asChild && disabled ? true : undefined}
  className={clsx(
    styles.root,
    styles[size],
    styles[variant],
    isActive && styles.active,
    disabled && styles.disabled,
    level === 1 && styles.level1,
    level === 2 && styles.level2,
    className
  )}
  onClick={!disabled ? onClick : undefined}
  {...extraProps}
  {...rest}
>
  {icon && (
    <span className={styles.icon} aria-hidden="true">
      {icon}
    </span>
  )}

  <span className={styles.label}>{children}</span>

  {endSlot && <span className={styles.endSlot}>{endSlot}</span>}
</Comp>
```

---

## Styles — `NavItem.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

### Base

`.root`:

- `display: flex`
- `align-items: center`
- `gap: var(--dds-space-2)`
- `width: 100%`
- `font-family: var(--dds-font-sans)`
- `font-weight: var(--dds-font-weight-normal)`
- `text-decoration: none`
- `border: none`
- `background: transparent`
- `cursor: pointer`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent`
- `outline-offset: -3px` — inset focus ring
- `transition: background-color, color var(--dds-duration-fast) var(--dds-ease-standard)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`
- `text-align: left`

### Sizes

- `.sm` → `height: 32px; padding: 0 var(--dds-space-2); font-size: var(--dds-font-size-xs)`
- `.md` → `height: 36px; padding: 0 var(--dds-space-3); font-size: var(--dds-font-size-sm)`

### Variant — default (light context)

`.default`:

- `color: var(--dds-color-text-muted)`
- `&:hover:not(.disabled)` → `background-color: var(--dds-color-action-ghost-hover); color: var(--dds-color-text-default)`

`.default.active`:

- `background-color: var(--dds-color-accent)`
- `color: var(--dds-color-accent-foreground)`
- `font-weight: var(--dds-font-weight-medium)`

### Variant — sidebar (dark context)

`.sidebar`:

- `color: var(--dds-color-text-muted-on-sidebar)`
- `&:hover:not(.disabled)` → `background-color: oklch(from var(--dds-color-bg-sidebar) l c h / 0.15); color: var(--dds-color-text-on-sidebar)`

`.sidebar.active`:

- `background-color: var(--dds-color-sidebar-accent)`
- `color: var(--dds-color-text-on-sidebar)`
- `font-weight: var(--dds-font-weight-medium)`

### Disabled

`.disabled`:

- `opacity: 0.4`
- `cursor: not-allowed`
- `pointer-events: none`

### Indent levels

Level is applied as left padding added to the base padding:

- `.level1` → `padding-left: calc(var(--dds-space-3) + var(--dds-space-4))` (md) / `calc(var(--dds-space-2) + var(--dds-space-4))` (sm)
- `.level2` → `padding-left: calc(var(--dds-space-3) + var(--dds-space-8))` (md) / `calc(var(--dds-space-2) + var(--dds-space-8))` (sm)

These are calculated as base padding + indent multiplier.

### Icon and slots

`.icon`:

- `flex-shrink: 0`
- `display: flex; align-items: center; justify-content: center`
- `width: var(--dds-icon-size-sm); height: var(--dds-icon-size-sm)`
- `color: inherit`

`.label`:

- `flex: 1; min-width: 0`
- `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`

`.endSlot`:

- `flex-shrink: 0; margin-left: auto`
- `display: flex; align-items: center`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` — NavItem is always a hard rectangle.
- `outline-offset: -3px` — inset focus ring prevents overflow in tight navigation panels.
- `aria-current="page"` — set when `isActive={true}` and the item is a link. This is the correct ARIA attribute for the current navigation item, not `aria-selected`.
- Disabled `<a>` elements: use `aria-disabled="true"` and suppress click via `onClick` guard — do NOT use the `disabled` attribute on `<a>` (it's not a valid attribute for anchors). Only native `<button>` elements use the `disabled` attribute.
- `variant="sidebar"` uses sidebar-specific tokens (`--dds-color-text-on-sidebar`, `--dds-color-bg-sidebar`, `--dds-color-sidebar-accent`) — these exist in the token system for the dark sidebar surface.
- The `endSlot` is always `margin-left: auto` — it always pushes to the right edge of the item.

---

## Accessibility

- `<a href>` renders as a link with implicit `role="link"`.
- `<button>` renders with implicit `role="button"`.
- `asChild` delegates role to the child element.
- `aria-current="page"` on the active item — standard for navigation landmarks.
- `aria-disabled="true"` on disabled links — since `disabled` is invalid on `<a>`.
- `disabled` attribute on disabled `<button>` — removes from tab order.
- NavItem must always be used inside a `<nav>`, `<ul>`, or similar landmark — document this in JSDoc.
- Icon is `aria-hidden="true"` — the label provides the accessible name.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders <a> when href provided
- renders <button> when no href
- renders via Slot child when asChild={true}
- button has type="button"
- renders children as label text
- renders icon when icon prop provided
- icon has aria-hidden="true"
- renders endSlot when provided
- forwards className to root
- forwards ref to root element

// Active state
- has aria-current="page" when isActive={true}
- does NOT have aria-current when isActive={false}
- applies .active class when isActive={true}

// Disabled
- <a> has aria-disabled="true" when disabled (not native disabled attr)
- <button> has disabled attribute when disabled
- disabled link onClick is suppressed
- applies .disabled class when disabled

// Variants
- applies .default class by default
- applies .sidebar class when variant="sidebar"

// Sizes
- applies .md class by default
- applies .sm class when size="sm"

// Indent levels
- applies no level class when level={0} (default)
- applies .level1 when level={1}
- applies .level2 when level={2}

// Forwarding
- forwards href to <a>
- forwards onClick to root element
- forwards aria-label, data-testid

// Keyboard
- <a> receives Tab focus
- <button> receives Tab focus
- disabled <button> is NOT in tab order
- disabled <a> is still in tab order (aria-disabled only)
- Enter activates <a> (browser default)
- Enter activates <button>
- Space activates <button>

// axe
- axe: passes for <a> link, isActive={false}
- axe: passes for <a> link, isActive={true}
- axe: passes for <button>
- axe: passes for disabled <a>
- axe: passes for disabled <button>
- axe: passes for variant="sidebar"
- axe: passes with icon
- axe: passes for all indent levels
```

---

## Stories — `NavItem.stories.tsx`

Named exports required:

- `Default` — href, label only
- `Active` — isActive={true}
- `WithIcon` — icon + label
- `WithEndSlot` — icon + label + Badge endSlot
- `Disabled`
- `Sizes` — sm and md
- `Variants` — default and sidebar side by side (sidebar on dark bg)
- `IndentLevels` — level 0, 1, 2 stacked (simulating a tree)
- `AsButtonAction` — no href, onClick logs to console
- `AsChildNextLink` — asChild wrapping a mock router link
- `SidebarNav` — practical example: `<nav>` with a vertical list of NavItems (variant="sidebar") in a dark container
- `TopNav` — practical example: horizontal `<nav>` with NavItems

`FocusAndActivate` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const item = within(canvasElement).getByRole('link');
  await userEvent.tab();
  await expect(item).toHaveFocus();
};
```

`DisabledNotClickable` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const item = within(canvasElement).getByRole('button');
  await expect(item).toBeDisabled();
  await userEvent.click(item);
  // onClick should NOT have fired
};
```

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants and states
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] Disabled `<a>` uses `aria-disabled` not native `disabled` attribute
- [ ] `aria-current="page"` on active links
- [ ] `border-radius: var(--dds-radius-none)` always
- [ ] Sidebar variant uses `--dds-color-*-on-sidebar` tokens only
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

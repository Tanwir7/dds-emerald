# Breadcrumbs · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Breadcrumbs`, `BreadcrumbItem`, and `BreadcrumbSeparator` components.
- Scaffold: `packages/components/src/components/Breadcrumbs/`
- Radix primitive: none (native HTML nav/ol/li pattern)

---

## Purpose

`Breadcrumbs` renders a navigational path trail showing the user's location in the page hierarchy. It is a `<nav aria-label="Breadcrumb">` containing an ordered list of links. The current (last) item is not a link — it is a `<span>` with `aria-current="page"`.

---

## Exports from `index.ts`

```ts
export { Breadcrumbs, BreadcrumbItem, BreadcrumbSeparator };
export type { BreadcrumbsProps, BreadcrumbItemProps };
```

---

## Props

### `Breadcrumbs` (root):

```ts
interface BreadcrumbsProps {
  separator?: React.ReactNode; // default: built-in ChevronRight SVG
  maxItems?: number; // default: undefined — truncates middle items when exceeded
  size?: 'sm' | 'md'; // default: 'md'
  className?: string;
  children: React.ReactNode; // BreadcrumbItem elements
}
```

### `BreadcrumbItem`:

```ts
interface BreadcrumbItemProps {
  href?: string; // if omitted, renders as current page (aria-current="page")
  asChild?: boolean; // default: false — Radix Slot for router link
  isCurrent?: boolean; // explicitly mark as current (auto-detected if no href)
  className?: string;
  children: React.ReactNode;
}
```

### `BreadcrumbSeparator`:

```ts
interface BreadcrumbSeparatorProps {
  className?: string;
  children?: React.ReactNode; // override default separator icon
}
```

Forward `ref` on `Breadcrumbs` typed to `HTMLElement` (the `<nav>`). Forward `ref` on `BreadcrumbItem` typed to `HTMLLIElement`.

---

## Auto-detection of current item

`Breadcrumbs` inspects its children and automatically treats the **last** `BreadcrumbItem` as the current page item — it sets `aria-current="page"` and renders it as a `<span>` rather than an `<a>`. This behaviour is overridden if `isCurrent` is explicitly set on an item.

Implement this by wrapping children in a context that passes the `isLast` flag:

```tsx
const items = React.Children.toArray(children).filter(
  child => React.isValidElement(child) && child.type === BreadcrumbItem
);

return (
  <nav aria-label="Breadcrumb" className={...} ref={ref}>
    <ol className={styles.list}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        if (child.type === BreadcrumbItem) {
          const isLast = index === items.length - 1;
          return (
            <>
              {React.cloneElement(child as React.ReactElement<BreadcrumbItemProps>, {
                isCurrent: child.props.isCurrent ?? isLast,
              })}
              {!isLast && (
                <BreadcrumbSeparator key={`sep-${index}`}>
                  {separator}
                </BreadcrumbSeparator>
              )}
            </>
          );
        }
        return child;
      })}
    </ol>
  </nav>
);
```

---

## Truncation (`maxItems`)

When `maxItems` is set and the number of `BreadcrumbItem` children exceeds it, collapse the middle items into an ellipsis button:

```
Home › … › Parent › Current Page
```

- Always show the first item and the last 2 items.
- Middle items are collapsed into a `<button aria-label="Show full breadcrumb path">…</button>`.
- Clicking the ellipsis button expands all items (controlled by internal `expanded` state).

```tsx
const [expanded, setExpanded] = React.useState(false);

const shouldTruncate = !expanded && maxItems && items.length > maxItems;
const visibleItems = shouldTruncate
  ? [items[0], 'ellipsis' as const, ...items.slice(items.length - 2)]
  : items;
```

---

## Default separator SVG

```tsx
const DefaultSeparator = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    width="12"
    height="12"
  >
    <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
```

---

## Structure of BreadcrumbItem

```tsx
// Current page (last item, no href):
<li className={clsx(styles.item, styles[size], className)} ref={ref}>
  <span
    aria-current="page"
    className={clsx(styles.current, styles[size])}
  >
    {children}
  </span>
</li>

// Link item (has href):
<li className={clsx(styles.item, styles[size], className)} ref={ref}>
  {asChild ? (
    <Slot className={clsx(styles.link, styles[size])}>
      {children}
    </Slot>
  ) : (
    <a href={href} className={clsx(styles.link, styles[size])}>
      {children}
    </a>
  )}
</li>
```

---

## Structure of BreadcrumbSeparator

```tsx
<li role="presentation" aria-hidden="true" className={styles.separator}>
  {children ?? <DefaultSeparator />}
</li>
```

`role="presentation"` and `aria-hidden="true"` on the separator `<li>` — screen readers skip it entirely.

---

## Styles — `Breadcrumbs.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root` (the `<nav>`):

- `display: block`
- `width: 100%`

`.list`:

- `list-style: none`
- `margin: 0; padding: 0`
- `display: flex`
- `align-items: center`
- `flex-wrap: wrap`
- `gap: 0` — gap handled by separator li padding

`.item`:

- `display: inline-flex`
- `align-items: center`

`.link`:

- `font-family: var(--dds-font-sans)`
- `font-weight: var(--dds-font-weight-normal)`
- `color: var(--dds-color-text-muted)`
- `text-decoration: none`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent`
- `outline-offset: 2px`
- `transition: color var(--dds-duration-fast) var(--dds-ease-standard)`
- `&:hover` → `color: var(--dds-color-text-default); text-decoration: underline; text-underline-offset: 3px`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`

`.current`:

- `font-family: var(--dds-font-sans)`
- `font-weight: var(--dds-font-weight-medium)`
- `color: var(--dds-color-text-default)`

Size modifiers (applied to `.link` and `.current`):

- `.sm` → `font-size: var(--dds-font-size-xs)`
- `.md` → `font-size: var(--dds-font-size-sm)` (default)

`.separator`:

- `display: inline-flex; align-items: center`
- `padding: 0 var(--dds-space-1)`
- `color: var(--dds-color-text-muted)`
- `user-select: none`

`.ellipsisBtn`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)` (md) / `var(--dds-font-size-xs)` (sm)
- `color: var(--dds-color-text-muted)`
- `background: transparent; border: none; cursor: pointer`
- `padding: 0 var(--dds-space-1)`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent; outline-offset: 2px`
- `&:hover` → `color: var(--dds-color-text-default)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`
- `transition: color var(--dds-duration-fast) var(--dds-ease-standard)`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on links and ellipsis button.
- The last `BreadcrumbItem` MUST render as a `<span>` with `aria-current="page"` — never as an `<a>` link.
- Separators MUST be `aria-hidden="true"` — they are visual decoration not content.
- `BreadcrumbSeparator` renders as `<li role="presentation">` — stays in the `<ol>` flow while being semantically neutral.
- Truncation always shows first item + last 2 — never hide the current page or the root.
- The ellipsis button is keyboard-accessible and has a descriptive `aria-label`.

---

## Accessibility

- Root `<nav aria-label="Breadcrumb">` creates a navigation landmark.
- `<ol>` conveys ordered list semantics — screen readers announce item count.
- Current page item: `<span aria-current="page">` — announces "current page" to screen readers.
- Separators: `aria-hidden="true"` — not read aloud.
- Links: native `<a>` or `asChild` for router compatibility.
- Ellipsis button: `aria-label="Show full breadcrumb path"` — descriptive.
- `aria-expanded` could be added to the ellipsis button for state announcement — add it.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a <nav> element
- nav has aria-label="Breadcrumb"
- renders an <ol> inside nav
- renders BreadcrumbItem children as <li> elements
- forwards className to nav
- forwards ref to HTMLElement (nav)

// Link items
- BreadcrumbItem with href renders an <a> with correct href
- link has color muted class
- link is focusable

// Current item (last)
- last BreadcrumbItem auto-detected as current
- current item renders as <span> (not <a>)
- current item has aria-current="page"
- explicitly isCurrent={true} renders as current
- non-last item with href renders as link

// Separators
- separator rendered between each pair of items
- separator has role="presentation"
- separator has aria-hidden="true"
- custom separator prop renders custom content
- no separator after last item

// Sizes
- applies .md class by default
- applies .sm class when size="sm"
- sm class applied to link and current items

// Truncation
- all items shown when count <= maxItems
- middle items collapsed when count > maxItems
- first item always visible when truncated
- last 2 items always visible when truncated
- ellipsis button rendered when truncated
- ellipsis button has aria-label="Show full breadcrumb path"
- clicking ellipsis expands all items
- aria-expanded="false" on ellipsis when collapsed
- aria-expanded="true" on ellipsis when expanded

// asChild
- BreadcrumbItem asChild renders child element instead of <a>

// Keyboard
- link items receive Tab focus
- current item NOT in tab order (it's a span)
- ellipsis button receives Tab focus
- ellipsis button activates on Enter
- ellipsis button activates on Space

// axe
- axe: passes for 3-item breadcrumb
- axe: passes for 5-item truncated (maxItems=3)
- axe: passes after ellipsis expanded
- axe: passes for size="sm"
- axe: passes with custom separator
```

---

## Stories — `Breadcrumbs.stories.tsx`

Named exports required:

- `Default` — 3 items (Home › Dashboard › Settings)
- `TwoItems` — root + current only
- `LongPath` — 6 items, no truncation
- `Truncated` — 6 items, maxItems=4
- `TruncatedExpanded` — same, shows expanded state
- `CustomSeparator` — `/` text separator
- `Sizes` — sm and md stacked
- `AsChildNextLink` — `BreadcrumbItem asChild` wrapping mock router link

`ExpandTruncated` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const btn = within(canvasElement).getByRole('button', { name: /show full/i });
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(btn);
  await expect(
    within(canvasElement).queryByRole('button', { name: /show full/i })
  ).not.toBeInTheDocument();
};
```

`KeyboardNavigation` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const links = within(canvasElement).getAllByRole('link');
  await userEvent.tab();
  await expect(links[0]).toHaveFocus();
  await userEvent.tab();
  await expect(links[1]).toHaveFocus();
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
- [ ] Last item always renders as `<span aria-current="page">` — never a link
- [ ] Separators are aria-hidden
- [ ] Truncation always preserves first + last 2 items
- [ ] `border-radius: var(--dds-radius-none)` on links and ellipsis button
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] All 3 components exported from `packages/components/src/index.ts`

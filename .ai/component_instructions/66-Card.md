# Card · node scaffolding.mjs Card

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/Button/
packages/components/src/components/Badge/
packages/components/src/components/
```

- No Radix primitive is required. Card is a native HTML composition using semantic elements.
- The clickable card variant uses a native `<a>` or `<button>` element — do NOT wrap a non-interactive `<div>` in an `onClick`. The interactive root IS the anchor/button.
- The selectable card uses a visually hidden native `<input type="checkbox">` for full keyboard and screen reader support.

### Token addition required

The `elevated` variant needs a medium shadow. Before implementing, add the following token to `packages/tokens/src/tokens.css` in the Tier 1 shadow block, and mirror it in the dark mode block:

```css
/* Tier 1 */
--dds-shadow-md: 0 4px 12px 0 rgb(0 0 0 / 0.1);

/* Dark mode (inside [data-theme='dark'] and the OS prefers-color-scheme block) */
--dds-shadow-md: 0 4px 12px 0 rgb(0 0 0 / 0.35);
```

Do not proceed with implementing `Card.module.scss` until this token exists in `tokens.css`.

---

## Scaffold location

```
packages/components/src/components/Card/
  Card.tsx
  Card.module.scss
  Card.test.tsx
  Card.stories.tsx
  index.ts
```

---

## Purpose

`Card` is a flexible surface container that groups related content and actions. It is the primary layout primitive for dashboard panels, list item rows, product tiles, profile summaries, and settings sections.

Card has four visual variants, two interaction modes (static, clickable, selectable), and a full set of named layout sub-components for consistent internal structure.

---

## Exports from `index.ts`

```ts
export { Card, CardHeader, CardBody, CardFooter, CardMedia, CardTitle, CardDescription };
export type {
  CardProps,
  CardVariant,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardMediaProps,
  CardTitleProps,
  CardDescriptionProps,
};
```

---

## Types

```ts
type CardVariant = 'outlined' | 'elevated' | 'filled' | 'ghost';

// Card is overloaded: static div, clickable anchor/button, or selectable checkbox card.
// Use discriminated union to enforce correct prop combinations.

interface CardBaseProps {
  variant?: CardVariant; // default: 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'; // default: 'none' — sub-components handle their own padding
  className?: string;
  children: React.ReactNode;
}

interface CardStaticProps extends CardBaseProps {
  as?: 'div'; // default
  href?: never;
  onClick?: never;
  selected?: never;
  onSelectedChange?: never;
  disabled?: never;
  selectLabel?: never;
}

interface CardClickableAnchorProps extends CardBaseProps {
  as: 'a';
  href: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  selected?: never;
  onSelectedChange?: never;
  disabled?: boolean;
  selectLabel?: never;
  // All anchor props forwarded (target, rel, download, etc.)
}

interface CardClickableButtonProps extends CardBaseProps {
  as: 'button';
  href?: never;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  selected?: never;
  onSelectedChange?: never;
  disabled?: boolean;
  selectLabel?: never;
}

interface CardSelectableProps extends CardBaseProps {
  as?: 'div';
  href?: never;
  onClick?: never;
  selected: boolean; // controlled — required for selectable
  onSelectedChange: (selected: boolean) => void;
  disabled?: boolean;
  selectLabel: string; // required — accessible label for the hidden checkbox
}

export type CardProps =
  | CardStaticProps
  | CardClickableAnchorProps
  | CardClickableButtonProps
  | CardSelectableProps;

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end' | 'between'; // default: 'start'
  className?: string;
  children: React.ReactNode;
}

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  aspectRatio?: '16/9' | '4/3' | '1/1' | '3/2'; // default: '16/9'
  position?: 'top' | 'bottom'; // default: 'top'
  className?: string;
  children: React.ReactNode; // consumer provides <img> or <video> — Card does not render media directly
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; // default: 'h3'
  className?: string;
  children: React.ReactNode;
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}
```

---

## Architecture

### Static card

```tsx
<div role="…" className={…}>
  {children}
</div>
```

### Clickable card — anchor

```tsx
<a href={href} className={clsx(styles.card, styles.clickable, …)} ...>
  {children}
</a>
```

### Clickable card — button

```tsx
<button type="button" className={clsx(styles.card, styles.clickable, …)} ...>
  {children}
</button>
```

### Selectable card

The selectable card pairs a visually hidden `<input type="checkbox">` with the visible card surface. The checkbox is the real interactive element — it receives focus and is operated by keyboard. The card surface is purely visual.

```tsx
<div
  className={clsx(
    styles.card,
    styles.selectable,
    selected && styles.selected,
    disabled && styles.disabled,
    styles[`variant-${variant}`],
    className
  )}
>
  {/* Visually hidden checkbox — the real interactive control */}
  <input
    type="checkbox"
    checked={selected}
    onChange={(e) => onSelectedChange(e.target.checked)}
    disabled={disabled}
    aria-label={selectLabel}
    className={styles.selectableCheckbox}
  />
  {/* Selected state indicator — top-right checkmark badge */}
  {selected && (
    <span className={styles.selectedIndicator} aria-hidden="true">
      <Check />
    </span>
  )}
  {children}
</div>
```

The visually hidden checkbox:

- Uses the standard visually-hidden technique: `position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0`
- Receives the DDS focus ring on `:focus-visible` — applied to the card surface via the sibling selector: `.selectableCheckbox:focus-visible + * ~ .card` — or more practically, use `:has(:focus-visible)` on the card root:
  ```scss
  .selectable:has(.selectableCheckbox:focus-visible) {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
  ```
- `aria-label={selectLabel}` provides the accessible name (e.g. "Select Acme Corp plan")

---

## Component structure

```tsx
// Card.tsx
import { Check } from 'lucide-react';
import clsx from 'clsx';
import styles from './Card.module.scss';

export const Card = React.forwardRef<HTMLElement, CardProps>((props, ref) => {
  const { variant = 'outlined', padding = 'none', className, children } = props;

  const baseClass = clsx(
    styles.card,
    styles[`variant-${variant}`],
    padding !== 'none' && styles[`padding-${padding}`],
    className
  );

  // Selectable
  if ('selected' in props && props.selected !== undefined) {
    const { selected, onSelectedChange, disabled, selectLabel } = props;
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={clsx(
          baseClass,
          styles.selectable,
          selected && styles.selected,
          disabled && styles.disabled
        )}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelectedChange(e.target.checked)}
          disabled={disabled}
          aria-label={selectLabel}
          className={styles.selectableCheckbox}
        />
        {selected && (
          <span className={styles.selectedIndicator} aria-hidden="true">
            <Check />
          </span>
        )}
        {children}
      </div>
    );
  }

  // Clickable anchor
  if (props.as === 'a') {
    const { href, onClick, disabled, as: _as, ...rest } = props as CardClickableAnchorProps;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        onClick={onClick}
        aria-disabled={disabled || undefined}
        className={clsx(baseClass, styles.clickable, disabled && styles.disabled)}
        {...rest}
      >
        {children}
      </a>
    );
  }

  // Clickable button
  if (props.as === 'button') {
    const { onClick, disabled, as: _as, ...rest } = props as CardClickableButtonProps;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={clsx(baseClass, styles.clickable, disabled && styles.disabled)}
        {...rest}
      >
        {children}
      </button>
    );
  }

  // Static div (default)
  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={baseClass}
      {...(props as CardStaticProps)}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';

// CardHeader
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.header, className)} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

// CardBody
export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.body, className)} {...props}>
      {children}
    </div>
  )
);
CardBody.displayName = 'CardBody';

// CardFooter
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ align = 'start', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(styles.footer, styles[`footerAlign-${align}`], className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

// CardMedia
export const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
  ({ aspectRatio = '16/9', position = 'top', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        styles.media,
        styles[`media-${aspectRatio.replace('/', '-')}`],
        styles[`media-${position}`],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
CardMedia.displayName = 'CardMedia';

// CardTitle
export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Tag = 'h3', className, children, ...props }, ref) => (
    <Tag ref={ref} className={clsx(styles.title, className)} {...props}>
      {children}
    </Tag>
  )
);
CardTitle.displayName = 'CardTitle';

// CardDescription
export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={clsx(styles.description, className)} {...props}>
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';
```

---

## SCSS — Card.module.scss

```scss
@use '../../../styles/mixins' as *;

// ─── Base card surface ────────────────────────────────────────────────────────

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--dds-radius-none);
  overflow: hidden; // clips CardMedia to card edges

  // Remove default button/anchor browser styles
  text-decoration: none;
  text-align: left;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  background: none;
  border: none;
  cursor: default;
}

// ─── Visual variants ──────────────────────────────────────────────────────────

.variant-outlined {
  background-color: var(--dds-color-bg-card);
  border: 1px solid var(--dds-color-border-default);
}

.variant-elevated {
  background-color: var(--dds-color-bg-card);
  border: 1px solid transparent;
  box-shadow: var(--dds-shadow-md);
}

.variant-filled {
  background-color: var(--dds-color-bg-subtle);
  border: 1px solid transparent;
}

.variant-ghost {
  background-color: transparent;
  border: 1px solid transparent;
}

// ─── Padding (when card-level padding is used instead of sub-components) ──────

.padding-sm {
  padding: var(--dds-space-3);
}
.padding-md {
  padding: var(--dds-space-5);
}
.padding-lg {
  padding: var(--dds-space-8);
}

// ─── Clickable card ───────────────────────────────────────────────────────────

.clickable {
  cursor: pointer;
  transition:
    background-color var(--dds-duration-fast) var(--dds-ease-standard),
    box-shadow var(--dds-duration-fast) var(--dds-ease-standard),
    border-color var(--dds-duration-fast) var(--dds-ease-standard);

  &:hover:not(.disabled) {
    background-color: var(--dds-color-bg-card-hover);
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }

  // Elevated hover deepens the shadow
  &.variant-elevated:hover:not(.disabled) {
    box-shadow: var(--dds-shadow-md);
    border-color: var(--dds-color-border-default);
  }

  // Outlined hover shows border accent
  &.variant-outlined:hover:not(.disabled) {
    border-color: var(--dds-color-action-primary);
  }
}

// ─── Selectable card ──────────────────────────────────────────────────────────

.selectable {
  cursor: pointer;
  transition:
    background-color var(--dds-duration-fast) var(--dds-ease-standard),
    border-color var(--dds-duration-fast) var(--dds-ease-standard);

  &:hover:not(.disabled) {
    background-color: var(--dds-color-bg-card-hover);
  }

  // Focus ring surfaced from the hidden checkbox using :has()
  &:has(.selectableCheckbox:focus-visible) {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

.selected {
  border-color: var(--dds-color-action-primary);
  background-color: oklch(from var(--dds-color-action-primary) l c h / 0.04);

  &:hover:not(.disabled) {
    background-color: oklch(from var(--dds-color-action-primary) l c h / 0.07);
  }
}

// Visually hidden checkbox — real interactive control for selectable cards
.selectableCheckbox {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

// Selected state indicator — top-right checkmark
.selectedIndicator {
  position: absolute;
  top: var(--dds-space-2);
  right: var(--dds-space-2);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: var(--dds-color-action-primary);
  color: var(--dds-color-action-primary-foreground);

  svg {
    width: 12px;
    height: 12px;
  }
}

// ─── Disabled state ───────────────────────────────────────────────────────────

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

// ─── CardHeader ───────────────────────────────────────────────────────────────

.header {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-1);
  padding: var(--dds-space-5) var(--dds-space-5) 0;
}

// ─── CardBody ────────────────────────────────────────────────────────────────

.body {
  flex: 1 1 0;
  padding: var(--dds-space-4) var(--dds-space-5);
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  line-height: var(--dds-line-height-normal);
  color: var(--dds-color-text-default);
}

// ─── CardFooter ──────────────────────────────────────────────────────────────

.footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--dds-space-3);
  padding: var(--dds-space-4) var(--dds-space-5) var(--dds-space-5);
  border-top: 1px solid var(--dds-color-border-default);

  // Ghost variant has no footer divider
  .variant-ghost & {
    border-top-color: transparent;
  }
}

.footerAlign-start {
  justify-content: flex-start;
}
.footerAlign-center {
  justify-content: center;
}
.footerAlign-end {
  justify-content: flex-end;
}
.footerAlign-between {
  justify-content: space-between;
}

// ─── CardMedia ────────────────────────────────────────────────────────────────

.media {
  position: relative;
  width: 100%;
  overflow: hidden;
  flex-shrink: 0;

  // Consumer's <img> or <video> fills the slot
  img,
  video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

// Aspect ratio modifier classes — use padding-top hack for broad browser support
// and aspect-ratio CSS property as primary with fallback
.media-16-9 {
  aspect-ratio: 16 / 9;
}
.media-4-3 {
  aspect-ratio: 4 / 3;
}
.media-1-1 {
  aspect-ratio: 1 / 1;
}
.media-3-2 {
  aspect-ratio: 3 / 2;
}

// Position modifiers — bottom media sits after content
.media-top {
  order: -1;
}
.media-bottom {
  order: 1;
  border-top: 1px solid var(--dds-color-border-default);
}

// ─── CardTitle ────────────────────────────────────────────────────────────────

.title {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-base);
  font-weight: var(--dds-font-weight-semibold);
  line-height: var(--dds-line-height-tight);
  color: var(--dds-color-text-default);
  margin: 0;
}

// ─── CardDescription ─────────────────────────────────────────────────────────

.description {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  line-height: var(--dds-line-height-normal);
  color: var(--dds-color-text-muted);
  margin: 0;
}
```

---

## Accessibility

### Static card

- Renders as a plain `<div>`. No ARIA role needed — it is a layout container.
- If the card represents a landmark or list item, the consumer adds semantics via `role` prop or wraps in `<ul>/<li>`.

### Clickable card

- Anchor (`as="a"`): correct semantic for navigation. Always provide meaningful link text — either visible `CardTitle` text or `aria-label` if the title is insufficient.
- Button (`as="button"`): correct semantic for actions (open modal, expand, etc.). Always provide visible text or `aria-label`.
- `disabled` on a clickable anchor: native `disabled` does not exist on `<a>` — use `aria-disabled="true"` and remove `href`. On `<button>`, use native `disabled`.
- Hover state: `border-color` transition provides visual feedback beyond colour change — WCAG 1.4.11 non-text contrast.
- Focus ring: standard `outline: 3px solid oklch(…); outline-offset: 2px` — WCAG 2.4.7 focus visible.

### Selectable card

- The hidden `<input type="checkbox">` IS the interactive element. It receives focus, is Tab-navigable, and is toggled with Space.
- `selectLabel` is required and maps to `aria-label` on the checkbox — consumers must pass a meaningful label (e.g. "Select Enterprise plan", not just "Select").
- The `selectedIndicator` checkmark is `aria-hidden="true"` — the checkbox itself conveys checked state to screen readers.
- `:has(.selectableCheckbox:focus-visible)` surfaces the focus ring to the visible card surface — tested in browsers supporting `:has()`. For older browsers the checkbox's native focus ring is still present (never suppress it with `outline: none` without replacing it).
- Selected state: `border-color` change + subtle background — never colour alone.

### CardMedia

- The consumer provides the `<img>` — they are responsible for `alt` text. The `CardMedia` wrapper does not add or suppress alt text.
- Document this clearly in Storybook story descriptions.

### Keyboard interactions

| Element          | Key             | Behaviour                                |
| ---------------- | --------------- | ---------------------------------------- |
| Clickable anchor | `Enter`         | Follows the link                         |
| Clickable button | `Enter`/`Space` | Fires onClick                            |
| Selectable card  | `Tab`           | Focuses the hidden checkbox              |
| Selectable card  | `Space`         | Toggles selected state                   |
| Selectable card  | `Enter`         | No-op (checkbox convention — Space only) |

---

## TDD — write ALL tests before implementing

Run scaffolding first: `node scaffolding.mjs Card`

```
// Static rendering
- renders children inside a div by default
- applies variant-outlined class by default
- applies variant-elevated class when variant="elevated"
- applies variant-filled class when variant="filled"
- applies variant-ghost class when variant="ghost"
- applies padding-sm/md/lg class when padding prop is set
- forwards ref to root element
- forwards className to root

// Sub-components render
- CardHeader renders its children
- CardBody renders its children
- CardFooter renders its children
- CardFooter applies footerAlign-end when align="end"
- CardFooter applies footerAlign-between when align="between"
- CardMedia renders children inside the media wrapper
- CardMedia applies media-16-9 class by default
- CardMedia applies media-1-1 class when aspectRatio="1/1"
- CardMedia applies media-top class by default
- CardMedia applies media-bottom class when position="bottom"
- CardTitle renders as h3 by default
- CardTitle renders as h2 when as="h2"
- CardDescription renders as a <p>

// Clickable anchor
- renders as <a> when as="a"
- has href attribute
- calls onClick when clicked
- applies clickable class
- is keyboard focusable
- responds to Enter key
- disabled anchor has aria-disabled="true" and no href
- disabled anchor does not call onClick

// Clickable button
- renders as <button type="button"> when as="button"
- calls onClick when clicked
- applies clickable class
- is keyboard focusable
- responds to Enter and Space
- disabled button has native disabled attribute
- disabled button does not call onClick

// Selectable card
- renders a hidden checkbox input
- checkbox has aria-label matching selectLabel prop
- checkbox is checked when selected={true}
- checkbox is unchecked when selected={false}
- calls onSelectedChange(true) when unchecked checkbox is changed
- calls onSelectedChange(false) when checked checkbox is changed
- renders selectedIndicator when selected={true}
- selectedIndicator has aria-hidden="true"
- does NOT render selectedIndicator when selected={false}
- applies selected class when selected={true}
- disabled selectable card has disabled checkbox
- disabled selectable card applies disabled class

// Focus management
- clickable anchor receives focus on Tab
- clickable button receives focus on Tab
- selectable card's checkbox receives focus on Tab

// Accessibility
- static card has no implicit role
- clickable anchor has implicit link role
- clickable button has implicit button role
- selectable checkbox has role="checkbox"
- selectable checkbox has accessible name from selectLabel

// axe
- axe: static card, outlined variant
- axe: static card, elevated variant
- axe: static card, filled variant
- axe: static card, ghost variant
- axe: clickable anchor with CardTitle
- axe: clickable button with aria-label
- axe: selectable card, selected={false}
- axe: selectable card, selected={true}
- axe: card with CardMedia containing an img with alt text
- axe: card with all sub-components composed together
- axe: disabled clickable anchor
- axe: disabled selectable card
```

---

## Stories — `Card.stories.tsx`

Title: `Core Components/Card`

Named exports required:

- `Default` — static, outlined, all sub-components: `CardMedia` (16/9, placeholder img), `CardHeader` with `CardTitle` + `CardDescription`, `CardBody` with a sentence, `CardFooter` with two `Button` components.
- `Variants` — four cards in a 2×2 grid, one per variant (outlined / elevated / filled / ghost), same content in each.
- `Clickable` — two cards side by side: one `as="a"` (with `href`), one `as="button"` (with `onClick` that calls `action()`). Both show hover + focus state in description.
- `Selectable` — three cards in a row, multi-selectable. `selected` state managed with `useState` on an array of ids. `selectLabel` unique per card (e.g. "Select Starter plan", "Select Pro plan", "Select Enterprise plan").
- `WithMedia` — `CardMedia` at top (default) and `CardMedia` at bottom, side by side.
- `MediaAspectRatios` — four cards showing 16/9, 4/3, 1/1, 3/2.
- `NoMedia` — header + body + footer only.
- `FooterAlignments` — four cards demonstrating each `align` value.
- `DisabledClickable` — `as="a"` and `as="button"` both disabled.
- `DisabledSelectable` — selectable card with `disabled`.
- `CompactWithPadding` — static card using `padding="md"` without sub-components, just raw text content.

`SelectableInteraction` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const checkboxes = within(canvasElement).getAllByRole('checkbox');
  await expect(checkboxes[0]).not.toBeChecked();
  await userEvent.click(checkboxes[0]);
  await expect(checkboxes[0]).toBeChecked();
  await userEvent.click(checkboxes[0]);
  await expect(checkboxes[0]).not.toBeChecked();
};
```

`KeyboardSelectTab` with `play()`:

```ts
play: async ({ canvasElement }) => {
  await userEvent.tab();
  const checkbox = within(canvasElement).getAllByRole('checkbox')[0];
  await expect(checkbox).toHaveFocus();
  await userEvent.keyboard(' ');
  await expect(checkbox).toBeChecked();
};
```

Use `autodocs`. Storybook group: `Core Components/Card`.

---

## Definition of done

- [ ] `--dds-shadow-md` added to `packages/tokens/src/tokens.css` (both light and dark blocks) before any SCSS is written
- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants and interaction modes
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] Clickable anchor uses `<a>` — not a div with onClick
- [ ] Clickable button uses `<button type="button">` — not a div with onClick
- [ ] Selectable card uses hidden `<input type="checkbox">` — not aria-checked on a div
- [ ] `selectLabel` is required in TypeScript for selectable cards — not optional
- [ ] `:has(.selectableCheckbox:focus-visible)` focus ring on selectable card verified in tests
- [ ] `aria-disabled` used for disabled anchor; native `disabled` used for button and checkbox
- [ ] Selected state uses border colour + subtle bg — never colour alone
- [ ] `selectedIndicator` is `aria-hidden="true"`
- [ ] `border-radius: var(--dds-radius-none)` on card root — no exceptions
- [ ] `overflow: hidden` on card root clips media to card edges
- [ ] No Tailwind. No hardcoded color or spacing values in SCSS.
- [ ] Exported from `packages/components/src/index.ts`

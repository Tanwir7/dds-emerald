# HoverCard · node scaffolding.mjs HoverCard

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/Avatar/
packages/components/src/components/Badge/
packages/components/src/components/
```

- `HoverCard` is frequently used to show user or entity previews. Check if `Avatar` and `Badge` exist and use them inside story examples — do not duplicate their implementation.
- Radix primitive: `@radix-ui/react-hover-card` — use it entirely.

---

## Scaffold location

```
packages/components/src/components/HoverCard/
  HoverCard.tsx
  HoverCard.module.scss
  HoverCard.test.tsx
  HoverCard.stories.tsx
  index.ts
```

---

## Purpose

`HoverCard` is a non-modal floating card that appears when the user hovers over a trigger element. It is used to preview supplementary information about a link, user, entity, or concept — without requiring the user to navigate away or open a modal. It disappears when the pointer leaves the trigger or the card itself.

**HoverCard vs Tooltip:**

- `Tooltip`: single short text label, appears on hover AND focus, plain text only, used for labelling icons and truncated text.
- `HoverCard`: rich card content (avatar, stats, description, links), appears on hover only (NOT keyboard focus), used for entity previews and contextual detail panels.

**Critical accessibility rule:** HoverCard content is hover-only and is NOT shown on keyboard focus. This is the correct and intentional WCAG pattern for supplementary preview content — the primary link or trigger must still work independently. Do not add `onFocus` open behaviour.

---

## Exports from `index.ts`

```ts
export { HoverCard, HoverCardTrigger, HoverCardContent, HoverCardArrow };
export type { HoverCardProps, HoverCardContentProps };
```

---

## Types

```ts
export interface HoverCardProps {
  open?: boolean; // controlled
  defaultOpen?: boolean; // uncontrolled
  onOpenChange?: (open: boolean) => void;
  openDelay?: number; // ms before opening — default: 400
  closeDelay?: number; // ms before closing — default: 200
  children: React.ReactNode;
}

export interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'right' | 'bottom' | 'left'; // default: 'bottom'
  sideOffset?: number; // default: 8 (px gap from trigger)
  align?: 'start' | 'center' | 'end'; // default: 'center'
  alignOffset?: number; // default: 0
  showArrow?: boolean; // default: true — renders HoverCardArrow
  className?: string;
  children: React.ReactNode;
}
```

---

## Architecture

```
HoverCard          → Radix HoverCard.Root
HoverCardTrigger   → Radix HoverCard.Trigger (asChild — wraps consumer's anchor/button)
HoverCardContent   → Radix HoverCard.Content  (portal, floating card)
HoverCardArrow     → Radix HoverCard.Arrow    (optional pointing arrow)
```

### Delay defaults

HoverCard uses Radix's built-in `openDelay` and `closeDelay` on the Root. The defaults (400ms open, 200ms close) follow the WCAG 2.2 guideline that hover-triggered content must remain visible when the pointer moves to the content itself, and must not appear instantly (to avoid accidental triggers).

The close delay ensures the user can move the pointer from the trigger to the card without it disappearing.

---

## Component structure

```tsx
// HoverCard.tsx
import * as RadixHoverCard from '@radix-ui/react-hover-card';
import clsx from 'clsx';
import styles from './HoverCard.module.scss';

// Root
export const HoverCard = ({
  openDelay = 400,
  closeDelay = 200,
  children,
  ...props
}: HoverCardProps) => (
  <RadixHoverCard.Root openDelay={openDelay} closeDelay={closeDelay} {...props}>
    {children}
  </RadixHoverCard.Root>
);
HoverCard.displayName = 'HoverCard';

// Trigger — asChild: consumer's element (usually an <a> or <button>) is the trigger
export const HoverCardTrigger = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof RadixHoverCard.Trigger>
>(({ children, ...props }, ref) => (
  <RadixHoverCard.Trigger asChild ref={ref} {...props}>
    {children}
  </RadixHoverCard.Trigger>
));
HoverCardTrigger.displayName = 'HoverCardTrigger';

// Content — the floating card panel
export const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  (
    {
      side = 'bottom',
      sideOffset = 8,
      align = 'center',
      alignOffset = 0,
      showArrow = true,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <RadixHoverCard.Portal>
      <RadixHoverCard.Content
        ref={ref}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={clsx(styles.content, className)}
        {...props}
      >
        {showArrow && <HoverCardArrow />}
        {children}
      </RadixHoverCard.Content>
    </RadixHoverCard.Portal>
  )
);
HoverCardContent.displayName = 'HoverCardContent';

// Arrow — the small directional pointer between trigger and card
export const HoverCardArrow = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<typeof RadixHoverCard.Arrow>
>(({ className, ...props }, ref) => (
  <RadixHoverCard.Arrow
    ref={ref}
    className={clsx(styles.arrow, className)}
    width={12}
    height={6}
    {...props}
  />
));
HoverCardArrow.displayName = 'HoverCardArrow';
```

---

## SCSS — HoverCard.module.scss

```scss
@use '../../../styles/mixins' as *;

// ─── Content (floating card) ─────────────────────────────────────────────────

.content {
  z-index: 50;
  min-width: 240px;
  max-width: 360px;
  padding: var(--dds-space-4);

  background-color: var(--dds-color-bg-popover);
  border: 1px solid var(--dds-color-border-default);
  border-radius: var(--dds-radius-none);
  box-shadow: var(--dds-shadow-sm);

  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  line-height: var(--dds-line-height-normal);
  color: var(--dds-color-text-default);

  // Radix sets data-state and data-side for animation and position awareness
  &[data-state='open'] {
    animation: hoverCardIn var(--dds-duration-fast) var(--dds-ease-out);
  }
  &[data-state='closed'] {
    animation: hoverCardOut var(--dds-duration-fast) var(--dds-ease-standard);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

// Origin-aware entry animations — card slides in from its anchor side
@keyframes hoverCardIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes hoverCardOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
}

// Side-specific slide direction
.content[data-side='top'] {
  &[data-state='open'] {
    animation-name: slideInFromBottom;
  }
  &[data-state='closed'] {
    animation-name: slideOutToBottom;
  }
}
.content[data-side='bottom'] {
  &[data-state='open'] {
    animation-name: slideInFromTop;
  }
  &[data-state='closed'] {
    animation-name: slideOutToTop;
  }
}
.content[data-side='left'] {
  &[data-state='open'] {
    animation-name: slideInFromRight;
  }
  &[data-state='closed'] {
    animation-name: slideOutToRight;
  }
}
.content[data-side='right'] {
  &[data-state='open'] {
    animation-name: slideInFromLeft;
  }
  &[data-state='closed'] {
    animation-name: slideOutToLeft;
  }
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes slideOutToTop {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-6px);
  }
}
@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes slideOutToBottom {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(6px);
  }
}
@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes slideOutToLeft {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-6px);
  }
}
@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes slideOutToRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(6px);
  }
}

// ─── Arrow ────────────────────────────────────────────────────────────────────

.arrow {
  // Radix renders an SVG polygon — fill it with the popover background
  // and stroke it to match the border so it looks like a card extension
  fill: var(--dds-color-bg-popover);
  // The arrow itself cannot have a border-radius — it is an SVG polygon.
  // This is not a radius exception; SVG shapes have no border-radius property.
}
```

---

## Accessibility

HoverCard intentionally follows a restricted accessibility model:

- **Hover-only** — `HoverCardContent` is NOT shown on keyboard focus. This is the correct WCAG 2.2 pattern for supplementary preview content. Do not add `onFocus` handlers.
- **No keyboard trigger** — The content is supplementary. The trigger (link, username, tag) must independently convey its destination or action without the HoverCard.
- **Not a modal** — HoverCard content receives no focus trap, no `role="dialog"`. It is purely informational.
- **WCAG 2.2 — 1.4.13 Content on Hover:** The card remains visible when the pointer moves into the card itself (handled by Radix's `closeDelay` and pointer-leave detection). The card is dismissible via Escape. It does not disappear when the pointer moves slowly between trigger and card.
- **Escape dismisses** — Radix handles this automatically.
- **Consumer responsibility** — The trigger element must itself be accessible (e.g. `<a href>` or `<button>`) with meaningful text. HoverCard does not manage the trigger's accessibility.
- **Rich content inside the card** — Any images inside HoverCard content must have `alt` text. Any links inside must have accessible names. The component instruction does not enforce this — it is a consumer responsibility, but should be called out in Storybook story documentation.

### What HoverCard does NOT need

- `role="dialog"` — wrong semantic; this is not a modal
- `aria-haspopup` — unnecessary for hover-only previews
- `aria-expanded` — the trigger state is not meaningful to announce for supplementary previews
- Focus trap — content is not interactive-primary; users can Tab past without engaging the card

---

## TDD — write ALL tests before implementing

Run scaffolding first: `node scaffolding.mjs HoverCard`

**Note on testing hover behaviour:** Radix HoverCard uses pointer events and timers. Use `vi.useFakeTimers()` with `vi.advanceTimersByTime()` to control open/close delays in tests. Clean up with `vi.useRealTimers()` in `afterEach`.

```
// Rendering
- does not render card content by default
- renders card content after hover and openDelay passes
- renders HoverCardArrow when showArrow={true} (default)
- does not render HoverCardArrow when showArrow={false}
- forwards ref to HoverCardContent HTMLDivElement
- forwards className to HoverCardContent

// Open/close
- card opens after pointer enters trigger and openDelay elapses
- card does NOT open before openDelay elapses
- card closes after pointer leaves trigger and closeDelay elapses
- card does NOT close before closeDelay elapses
- card remains open when pointer moves from trigger into card content
- card closes on Escape key while open
- works as controlled component (open + onOpenChange)
- calls onOpenChange(true) when card opens
- calls onOpenChange(false) when card closes

// Props
- applies custom openDelay
- applies custom closeDelay
- passes side prop to Radix Content
- passes sideOffset prop to Radix Content
- passes align prop to Radix Content

// Accessibility
- trigger is NOT given aria-expanded (hover-only pattern)
- HoverCardContent does NOT have role="dialog"
- HoverCardContent does NOT trap focus

// axe
- axe: passes when card is closed
- axe: passes when card is open with text content
- axe: passes when card is open with showArrow={false}
- axe: passes when card contains an image with alt text
- axe: passes when card contains a link with accessible name
- axe: passes with all four side values (top/right/bottom/left)
```

---

## Stories — `HoverCard.stories.tsx`

Title: `Core Components/HoverCard`

Named exports required:

- `Default` — Trigger is an underlined `<a>` tag with a username ("@emerald_ds"). Card content: avatar, display name, handle, short bio, follower/following counts. Shows the canonical user preview use case.
- `TopSide` — `side="top"`. Same content as Default. Trigger positioned lower in the canvas so the card has room above.
- `AllSides` — four triggers in a 2×2 grid, one for each `side` value. Same compact card content on each.
- `NoArrow` — `showArrow={false}`. Card appears without the pointing arrow.
- `CustomDelays` — `openDelay={100}` `closeDelay={0}`. Story note: "Opens almost immediately."
- `RichContent` — Card body contains: avatar, name, `Badge` (if it exists), stats row (font-variant-numeric), short description, and a link. Demonstrates the range of content the component can hold.
- `Controlled` — open state managed with `useState`. External toggle button alongside the trigger for testing in Storybook.
- `LongContent` — card content is 5 lines of description text. Demonstrates max-width and text wrapping.

No `play()` stories are required for HoverCard — hover interactions cannot be reliably automated in Storybook play functions without pointer simulation limitations. Document this in the story file with a comment.

Use `autodocs`. Storybook group: `Core Components/HoverCard`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all states and side variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] Card does not close when pointer moves from trigger into card — verified in tests
- [ ] `openDelay` and `closeDelay` defaults are 400ms and 200ms respectively
- [ ] Escape closes the card — verified in tests
- [ ] No `role="dialog"`, no focus trap, no `aria-expanded` on trigger
- [ ] Side-specific slide animations use `data-side` attribute
- [ ] `border-radius: var(--dds-radius-none)` on content panel
- [ ] Arrow SVG uses `fill: var(--dds-color-bg-popover)` — no hardcoded colour
- [ ] `prefers-reduced-motion` disables animations
- [ ] No Tailwind. No hardcoded color or spacing values in SCSS.
- [ ] Exported from `packages/components/src/index.ts`

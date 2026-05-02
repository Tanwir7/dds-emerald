# Sheet · node scaffolding.mjs Sheet

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/Button/
packages/components/src/components/Dialog/
packages/components/src/components/
```

- Use the existing `Button` component for all action buttons and the internal close (×) button.
- The close button is `<Button variant="ghost" iconOnly icon={X} aria-label="Close sheet" />` — match the exact icon-only API that `Button` exposes. Do not create a new close button primitive.
- Radix primitive: `@radix-ui/react-dialog` — Sheet is a positioned modal panel. Do NOT use a separate Radix primitive. The DDS Sheet applies its own side-panel positioning on top of the same Radix Dialog infrastructure used by `Dialog` and `AlertDialog`.
- If `Button` or `Dialog` do not yet exist, note the dependency and stub — do not implement them here.

---

## Scaffold location

```
packages/components/src/components/Sheet/
  Sheet.tsx
  Sheet.module.scss
  Sheet.test.tsx
  Sheet.stories.tsx
  index.ts
```

---

## Purpose

`Sheet` (also known as a Drawer) is a modal panel that slides in from the left or right edge of the viewport. It is used for contextual tasks that require focus but do not need to fully interrupt the user's view of the underlying page — navigation drawers, detail panels, filter sidebars, settings forms, and step-by-step task flows.

Sheet is semantically a modal (`role="dialog"`, `aria-modal="true"`). It traps focus while open. It is NOT a non-modal side panel — if a non-modal implementation is needed, that is a separate component.

**Sheet vs Dialog:**

- `Dialog`: centred overlay, interrupts the entire page, shorter-lived tasks.
- `Sheet`: edge-anchored panel, preserves spatial context of the page layout, suited to longer tasks and detail views.

---

## Exports from `index.ts`

```ts
export {
  Sheet,
  SheetTrigger,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetClose,
  SheetTitle,
  SheetDescription,
};
export type {
  SheetProps,
  SheetContentProps,
  SheetHeaderProps,
  SheetBodyProps,
  SheetFooterProps,
  SheetSide,
  SheetSize,
};
```

---

## Types

```ts
type SheetSide = 'left' | 'right'; // top/bottom not supported — left and right only

type SheetSize = 'sm' | 'md' | 'lg' | 'full';

export interface SheetProps {
  open?: boolean; // controlled
  defaultOpen?: boolean; // uncontrolled
  onOpenChange?: (open: boolean) => void;
  modal?: boolean; // default: true — passed to Radix
  children: React.ReactNode;
}

export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: SheetSide; // default: 'right'
  size?: SheetSize; // default: 'md'
  closeOnOverlayClick?: boolean; // default: true
  closeOnEscape?: boolean; // default: true
  showCloseButton?: boolean; // default: true
  'aria-label'?: string; // required when no SheetTitle is rendered
  className?: string;
  children: React.ReactNode;
}

export interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface SheetBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end' | 'between'; // default: 'end'
  className?: string;
  children: React.ReactNode;
}
```

---

## Architecture

Sheet is a thin wrapper around `@radix-ui/react-dialog` with side-panel positioning applied via SCSS. It intentionally mirrors the sub-component API of `Dialog` so consumers have a consistent mental model across both components.

### Radix parts used

| Radix part           | Sheet export                     |
| -------------------- | -------------------------------- |
| `Dialog.Root`        | `Sheet`                          |
| `Dialog.Trigger`     | `SheetTrigger`                   |
| `Dialog.Portal`      | internal (inside `SheetContent`) |
| `Dialog.Overlay`     | `SheetOverlay`                   |
| `Dialog.Content`     | `SheetContent`                   |
| `Dialog.Close`       | `SheetClose`                     |
| `Dialog.Title`       | `SheetTitle`                     |
| `Dialog.Description` | `SheetDescription`               |

### Dismissal control

Same pattern as `Dialog` — use `onPointerDownOutside` and `onEscapeKeyDown` on `Dialog.Content`:

```tsx
<RadixDialog.Content
  onPointerDownOutside={(e) => {
    if (!closeOnOverlayClick) e.preventDefault();
  }}
  onEscapeKeyDown={(e) => {
    if (!closeOnEscape) e.preventDefault();
  }}
  ...
>
```

### Size widths

Sheet width (for `left` and `right` sides) is controlled via a `--sheet-width` CSS custom property set as an inline style on the content element — a documented exception for dynamic layout values that cannot be expressed as a static token class.

| Size   | `--sheet-width` |
| ------ | --------------- |
| `sm`   | 320px           |
| `md`   | 480px           |
| `lg`   | 640px           |
| `full` | 100vw           |

```tsx
style={{ '--sheet-width': sizeMap[size] } as React.CSSProperties}
```

Sheet is always full viewport height (`height: 100vh`). Width varies by size prop.

### Body scrolling

The Sheet body always scrolls independently — `SheetHeader` and `SheetFooter` are always sticky (this is not opt-in like `Dialog`). This matches expected drawer UX: the content area scrolls while the controls remain visible at all times.

Layout model on `SheetContent`:

- `display: flex; flex-direction: column; height: 100vh`
- `SheetHeader`: `flex-shrink: 0`
- `SheetBody`: `flex: 1 1 0; overflow-y: auto`
- `SheetFooter`: `flex-shrink: 0` (rendered only when children exist)

---

## Component structure

```tsx
// Sheet.tsx
import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../Button';
import styles from './Sheet.module.scss';

const sizeMap: Record<SheetSize, string> = {
  sm: '320px',
  md: '480px',
  lg: '640px',
  full: '100vw',
};

// Root
export const Sheet = ({ children, ...props }: SheetProps) => (
  <RadixDialog.Root {...props}>{children}</RadixDialog.Root>
);
Sheet.displayName = 'Sheet';

// Trigger
export const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <RadixDialog.Trigger asChild ref={ref} {...props}>
    {children}
  </RadixDialog.Trigger>
));
SheetTrigger.displayName = 'SheetTrigger';

// Overlay — full-screen backdrop behind the panel
export const SheetOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <RadixDialog.Overlay ref={ref} className={clsx(styles.overlay, className)} {...props} />
  )
);
SheetOverlay.displayName = 'SheetOverlay';

// Content — the slide-in panel
export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  (
    {
      side = 'right',
      size = 'md',
      closeOnOverlayClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <RadixDialog.Portal>
      <SheetOverlay />
      <RadixDialog.Content
        ref={ref}
        className={clsx(styles.content, styles[`side-${side}`], styles[`size-${size}`], className)}
        style={{ '--sheet-width': sizeMap[size] } as React.CSSProperties}
        onPointerDownOutside={(e) => {
          if (!closeOnOverlayClick) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (!closeOnEscape) e.preventDefault();
        }}
        {...props}
      >
        {showCloseButton && (
          <RadixDialog.Close asChild>
            <Button
              variant="ghost"
              iconOnly
              icon={X}
              aria-label="Close sheet"
              className={styles.closeButton}
            />
          </RadixDialog.Close>
        )}
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
);
SheetContent.displayName = 'SheetContent';

// Close — lets consumers wire custom close triggers
export const SheetClose = RadixDialog.Close;
SheetClose.displayName = 'SheetClose';

// Title
export const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <RadixDialog.Title ref={ref} className={clsx(styles.title, className)} {...props}>
    {children}
  </RadixDialog.Title>
));
SheetTitle.displayName = 'SheetTitle';

// Description
export const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <RadixDialog.Description ref={ref} className={clsx(styles.description, className)} {...props}>
    {children}
  </RadixDialog.Description>
));
SheetDescription.displayName = 'SheetDescription';

// Header — always sticky (flex-shrink: 0)
export const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.header, className)} {...props}>
      {children}
    </div>
  )
);
SheetHeader.displayName = 'SheetHeader';

// Body — scrollable region
export const SheetBody = React.forwardRef<HTMLDivElement, SheetBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.body, className)} {...props}>
      {children}
    </div>
  )
);
SheetBody.displayName = 'SheetBody';

// Footer — always sticky (flex-shrink: 0)
export const SheetFooter = React.forwardRef<HTMLDivElement, SheetFooterProps>(
  ({ align = 'end', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(styles.footer, styles[`footerAlign-${align}`], className)}
      {...props}
    >
      {children}
    </div>
  )
);
SheetFooter.displayName = 'SheetFooter';
```

---

## SCSS — Sheet.module.scss

```scss
@use '../../../styles/mixins' as *; // adjust path to match repo structure

// ─── Overlay ─────────────────────────────────────────────────────────────────

.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: oklch(from var(--dds-color-bg-default) l c h / 0.6);
  backdrop-filter: blur(2px);

  &[data-state='open'] {
    animation: overlayIn var(--dds-duration-normal) var(--dds-ease-out);
  }
  &[data-state='closed'] {
    animation: overlayOut var(--dds-duration-fast) var(--dds-ease-standard);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

@keyframes overlayIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes overlayOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

// ─── Content ─────────────────────────────────────────────────────────────────

.content {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 51;

  width: var(--sheet-width, 480px);
  max-width: 100vw;
  height: 100vh;

  display: flex;
  flex-direction: column;
  overflow: hidden; // body handles its own scroll

  background-color: var(--dds-color-bg-card);
  border: 1px solid var(--dds-color-border-default);
  border-radius: var(--dds-radius-none);
  box-shadow: var(--dds-shadow-sm);

  // Radix focuses the content on open
  outline: none;
  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: -3px; // inset focus ring — panel is flush with edge
  }
}

// ─── Side positioning & animation ────────────────────────────────────────────

.side-right {
  right: 0;
  left: auto;
  border-right: none;
  border-left: 1px solid var(--dds-color-border-default);

  &[data-state='open'] {
    animation: slideInFromRight var(--dds-duration-normal) var(--dds-ease-out);
  }
  &[data-state='closed'] {
    animation: slideOutToRight var(--dds-duration-fast) var(--dds-ease-standard);
  }
}

.side-left {
  left: 0;
  right: auto;
  border-left: none;
  border-right: 1px solid var(--dds-color-border-default);

  &[data-state='open'] {
    animation: slideInFromLeft var(--dds-duration-normal) var(--dds-ease-out);
  }
  &[data-state='closed'] {
    animation: slideOutToLeft var(--dds-duration-fast) var(--dds-ease-standard);
  }
}

@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutToRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes slideInFromLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutToLeft {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .side-right,
  .side-left {
    animation: none;
  }
}

// ─── Size modifier classes ────────────────────────────────────────────────────
// Width is set via --sheet-width inline custom property.
// These classes exist for specificity surface and potential overrides.

.size-full {
  max-width: 100vw;
}

// ─── Close button ────────────────────────────────────────────────────────────

.closeButton {
  position: absolute;
  top: var(--dds-space-3);
  right: var(--dds-space-3);
  // For left-side sheets the close button stays top-right (readable corner).
  // No mirroring — the X is always top-right regardless of side.
}

// ─── Header ──────────────────────────────────────────────────────────────────

.header {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-1);
  padding: var(--dds-space-6) var(--dds-space-6) var(--dds-space-4);
  // Right padding accounts for the absolute-positioned close button
  padding-right: calc(var(--dds-space-6) + var(--dds-space-10));
  border-bottom: 1px solid var(--dds-color-border-default);
  flex-shrink: 0;
}

// ─── Title ───────────────────────────────────────────────────────────────────

.title {
  font-family: var(--dds-font-display);
  font-size: var(--dds-font-size-xl);
  font-weight: var(--dds-font-weight-semibold);
  line-height: var(--dds-line-height-tight);
  color: var(--dds-color-text-default);
  margin: 0;
}

// ─── Description ─────────────────────────────────────────────────────────────

.description {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  line-height: var(--dds-line-height-normal);
  color: var(--dds-color-text-muted);
  margin: 0;
}

// ─── Body ────────────────────────────────────────────────────────────────────

.body {
  flex: 1 1 0;
  overflow-y: auto; // body always scrolls independently
  padding: var(--dds-space-6);
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-base);
  line-height: var(--dds-line-height-normal);
  color: var(--dds-color-text-default);
}

// ─── Footer ──────────────────────────────────────────────────────────────────

.footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dds-space-3);
  padding: var(--dds-space-4) var(--dds-space-6) var(--dds-space-6);
  border-top: 1px solid var(--dds-color-border-default);
  flex-shrink: 0;
}

.footerAlign-end {
  justify-content: flex-end;
}
.footerAlign-start {
  justify-content: flex-start;
}
.footerAlign-center {
  justify-content: center;
}
.footerAlign-between {
  justify-content: space-between;
}
```

---

## CSS custom property exceptions (documented)

| Property        | Component    | Reason                                                          |
| --------------- | ------------ | --------------------------------------------------------------- |
| `--sheet-width` | SheetContent | Dynamic per-size value; no static token exists for panel widths |

This follows the same inline-style-as-custom-property exception pattern used by `Dialog` and documented in the project summary.

---

## Accessibility

- `SheetContent` renders as Radix `Dialog.Content` which sets `role="dialog"` and `aria-modal="true"` automatically.
- `SheetTitle` maps to `Dialog.Title` — Radix auto-wires `aria-labelledby` when `SheetTitle` is a direct child of `SheetContent`.
- `SheetDescription` maps to `Dialog.Description` — Radix auto-wires `aria-describedby`.
- If `SheetTitle` is intentionally omitted, the consumer **must** pass `aria-label` to `SheetContent`.
- Focus is trapped inside the Sheet while open — Radix manages this entirely.
- On open: focus moves to the first focusable element inside the content, or to the content panel itself if no focusable children exist above the body.
- On close: focus returns to the trigger element — Radix manages this.
- Close button: `aria-label="Close sheet"`, `ghost` variant, positioned `absolute` top-right. It sits outside the normal header→body→footer tab order but is reachable via Tab sequence within the trapped focus.
- The `inset` focus ring (`outline-offset: -3px`) is used instead of the standard `outline-offset: 2px` because the panel is flush against the viewport edge — an outset ring would be clipped.
- Escape closes by default — `closeOnEscape={false}` calls `e.preventDefault()` on the Radix key event.
- Backdrop click closes by default — `closeOnOverlayClick={false}` calls `e.preventDefault()` on `onPointerDownOutside`.

### Keyboard interactions

| Key            | Behaviour                                              |
| -------------- | ------------------------------------------------------ |
| `Tab`          | Cycles forward through focusable elements inside Sheet |
| `Shift+Tab`    | Cycles backward                                        |
| `Escape`       | Closes Sheet and returns focus to trigger (default)    |
| Backdrop click | Closes Sheet (default)                                 |
| `Enter`        | Activates focused button                               |
| `Space`        | Activates focused button                               |

### Animation and reduced motion

- Slide-in and slide-out animations use `--dds-duration-normal` (open) and `--dds-duration-fast` (close) with `--dds-ease-out` and `--dds-ease-standard` respectively.
- `@media (prefers-reduced-motion: reduce)` disables all Sheet animations. This is handled in SCSS — the global reduced-motion reset in `tokens.css` also covers this, but the SCSS rule is explicit for component clarity.
- The overlay fade follows the same reduced-motion rule.

---

## TDD — write ALL tests before implementing

Run scaffolding first: `node scaffolding.mjs Sheet`

```
// Rendering
- renders children inside the content panel when open
- does not render content panel when closed (Radix Portal not mounted)
- renders SheetTitle with correct text
- renders SheetDescription with correct text
- renders SheetHeader, SheetBody, SheetFooter
- forwards ref to content HTMLDivElement
- forwards className to content root
- renders internal close button by default
- does not render internal close button when showCloseButton={false}

// Side
- applies side-right class by default
- applies side-left class when side="left"
- applies side-right class when side="right"

// Size
- applies size-sm class when size="sm"
- applies size-md class when size="md" (default)
- applies size-lg class when size="lg"
- applies size-full class when size="full"
- sets --sheet-width inline custom property for sm
- sets --sheet-width inline custom property for md
- sets --sheet-width inline custom property for lg
- sets --sheet-width as 100vw for full

// Body scrolling
- SheetBody has overflow-y: auto (always scrollable)
- SheetHeader does not scroll (flex-shrink: 0)
- SheetFooter does not scroll (flex-shrink: 0)

// Open/close behaviour
- opens when trigger is clicked (uncontrolled)
- closes when close button is clicked
- closes when overlay is clicked (closeOnOverlayClick default true)
- does NOT close when overlay is clicked and closeOnOverlayClick={false}
- closes on Escape key (closeOnEscape default true)
- does NOT close on Escape when closeOnEscape={false}
- calls onOpenChange(false) when closed via close button
- calls onOpenChange(false) when closed via Escape
- works as controlled component (open + onOpenChange)

// Footer alignment
- applies footerAlign-end class by default
- applies footerAlign-start when align="start"
- applies footerAlign-center when align="center"
- applies footerAlign-between when align="between"

// Focus management
- focus moves into Sheet on open
- focus returns to trigger on close
- Tab key cycles through focusable elements inside Sheet
- Shift+Tab reverse cycles inside Sheet
- focus does NOT leave Sheet while open (trap is active)
- Escape closes and returns focus to trigger

// Accessibility
- content has role="dialog"
- content has aria-modal="true"
- aria-labelledby is wired to SheetTitle id (Radix auto-wires)
- aria-describedby is wired to SheetDescription id (Radix auto-wires)
- close button has aria-label="Close sheet"

// axe
- axe: passes when open with title and description, side="right"
- axe: passes when open with title and description, side="left"
- axe: passes when open with aria-label and no SheetTitle
- axe: passes when open, showCloseButton={false}
- axe: passes when open, size="full"
- axe: passes when open, closeOnEscape={false}
- axe: passes when open with a form inside SheetBody
```

---

## Stories — `Sheet.stories.tsx`

Title: `Core Components/Sheet`

Named exports required:

- `Default` — `side="right"`, `size="md"`. Title: "Sheet title". Description: "Optional supporting context." Body: lorem ipsum paragraph. Footer: Cancel (`secondary`) + Confirm (`primary`) buttons. Trigger: `<Button>Open Sheet</Button>`.
- `LeftSide` — `side="left"`, `size="md"`. Same content as Default.
- `Sizes` — four triggers (sm / md / lg / full) all using `side="right"`, each opening a Sheet of that size. Lay out triggers in a horizontal row.
- `WithForm` — SheetBody contains a three-field form (Name, Email, Role using `Input` and `Field` components if they exist). Footer: Cancel + Save Changes. Demonstrates the primary Sheet use case for contextual editing.
- `LongContent` — SheetBody contains 800+ words of lorem ipsum to demonstrate the independently scrolling body with sticky header and footer visible throughout.
- `NoCloseButton` — `showCloseButton={false}`, footer provides an explicit Cancel `SheetClose` button.
- `Controlled` — open/close state managed via `useState` in the story. External "Open" and "Close" buttons outside the Sheet component.
- `NoEscapeNoOverlay` — `closeOnEscape={false}` and `closeOnOverlayClick={false}`. Only the footer Cancel button closes it. Story includes a note: "Escape and backdrop click are disabled — only the Cancel button dismisses this sheet."
- `FooterAlignments` — four triggers demonstrating each `align` value on `SheetFooter`.
- `NavigationDrawer` — `side="left"`, `size="sm"`, `showCloseButton={false}`. SheetBody renders a simple vertical list of nav links (`<a>` elements). Demonstrates the navigation drawer pattern.

`OpenAndClose` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: /open sheet/i });
  await userEvent.click(trigger);
  const sheet = within(document.body).getByRole('dialog');
  await expect(sheet).toBeVisible();
  const closeBtn = within(sheet).getByRole('button', { name: /close sheet/i });
  await userEvent.click(closeBtn);
  await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
};
```

`EscapeClose` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: /open sheet/i });
  await userEvent.click(trigger);
  await expect(within(document.body).getByRole('dialog')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
};
```

`FocusTrap` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: /open sheet/i });
  await userEvent.click(trigger);
  const sheet = within(document.body).getByRole('dialog');
  await expect(sheet).toBeVisible();
  // Tab through all focusable elements — focus should not leave the sheet
  await userEvent.keyboard('{Tab}');
  await userEvent.keyboard('{Tab}');
  await userEvent.keyboard('{Tab}');
  // All focused elements should still be within the dialog
  const focused = document.activeElement;
  await expect(sheet.contains(focused)).toBe(true);
};
```

Use `autodocs`. Storybook group: `Core Components/Sheet`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants, both sides, all sizes
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] `side="left"` and `side="right"` slide animations both work
- [ ] `size="full"` fills the full viewport width
- [ ] SheetBody scrolls independently while SheetHeader and SheetFooter remain visible
- [ ] Focus trap active while Sheet is open — verified in `FocusTrap` play() story and tests
- [ ] Focus returns to trigger on close — verified in tests
- [ ] Escape closes by default; `closeOnEscape={false}` verified in tests
- [ ] Overlay click closes by default; `closeOnOverlayClick={false}` verified in tests
- [ ] Close button uses existing `Button` component with `variant="ghost"` and `iconOnly`
- [ ] `border-radius: var(--dds-radius-none)` on content panel — no exceptions
- [ ] Focus ring uses `outline-offset: -3px` (inset) — not the standard outset value
- [ ] `--sheet-width` is the only inline style / CSS custom property used
- [ ] No Tailwind. No hardcoded color, spacing, or font values in SCSS.
- [ ] Overlay and animations respect `prefers-reduced-motion`
- [ ] Exported from `packages/components/src/index.ts`

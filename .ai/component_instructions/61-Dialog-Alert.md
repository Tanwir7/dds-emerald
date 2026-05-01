# Dialog & AlertDialog · node scaffolding.mjs Dialog && node scaffolding.mjs AlertDialog

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/Button/
packages/components/src/components/
```

- Use the existing `Button` component for all action buttons (footer actions, close button).
- The internal close (`×`) button is `<Button variant="ghost" iconOnly ... />` — match the exact icon-only API that the `Button` component exposes. Do not invent a new close button primitive.
- If `Button` does not yet exist, note the dependency and stub it — but do not implement it here.
- Radix primitive: `@radix-ui/react-dialog` — used for **both** Dialog and AlertDialog.
  - AlertDialog uses the same Radix `Dialog` primitive but with stricter dismissal behaviour layered on top (see AlertDialog section below). Do NOT use `@radix-ui/react-alert-dialog`; the DDS pattern controls dismissal in userland.

---

## Scaffold locations

```
packages/components/src/components/Dialog/
  Dialog.tsx
  Dialog.module.scss
  Dialog.test.tsx
  Dialog.stories.tsx
  index.ts

packages/components/src/components/AlertDialog/
  AlertDialog.tsx
  AlertDialog.module.scss
  AlertDialog.test.tsx
  AlertDialog.stories.tsx
  index.ts
```

Both components **share** the overlay backdrop styles. Define the overlay SCSS only once — in `Dialog.module.scss` — and have `AlertDialog.module.scss` `@use` or duplicate as needed. Do NOT create a shared package-level partial just for two components; keep it local.

---

## Purpose

### Dialog

A general-purpose modal overlay for tasks that require immediate attention or focused interaction: confirmation prompts, forms, detail views, media previews. Supports a scrollable body area with sticky header and footer.

### AlertDialog

A blocking confirmation modal for consequential or irreversible actions (deleting records, revoking access, destructive batch operations). Unlike Dialog:

- Escape key does **not** close it by default (`closeOnEscape={false}` default).
- Clicking the backdrop does **not** close it by default (`closeOnOverlayClick={false}` default).
- No internal close (×) button — the user must pick an explicit action.
- Both behaviours can be overridden by the consumer if needed.

---

## Exports from `index.ts`

### Dialog

```ts
export {
  Dialog,
  DialogTrigger,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogClose,
  DialogTitle,
  DialogDescription,
};
export type {
  DialogProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogBodyProps,
  DialogFooterProps,
};
```

### AlertDialog

```ts
export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
};
export type { AlertDialogProps, AlertDialogContentProps };
```

---

## Types — Dialog

```ts
type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

export interface DialogProps {
  open?: boolean; // controlled
  defaultOpen?: boolean; // uncontrolled
  onOpenChange?: (open: boolean) => void;
  modal?: boolean; // default: true — passed to Radix
  children: React.ReactNode;
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: DialogSize; // default: 'md'
  scrollable?: boolean; // default: false — when true, only DialogBody scrolls
  closeOnOverlayClick?: boolean; // default: true
  closeOnEscape?: boolean; // default: true
  showCloseButton?: boolean; // default: true — renders internal × Button
  'aria-label'?: string; // required when no DialogTitle is rendered
  className?: string;
  children: React.ReactNode;
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end' | 'between'; // default: 'end'
  className?: string;
  children: React.ReactNode;
}
```

---

## Types — AlertDialog

```ts
type AlertDialogVariant = 'destructive' | 'warning' | 'info';

export interface AlertDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertDialogVariant; // default: 'destructive'
  size?: 'sm' | 'md'; // AlertDialog is never lg/xl/fullscreen
  closeOnOverlayClick?: boolean; // default: false
  closeOnEscape?: boolean; // default: false
  className?: string;
  children: React.ReactNode;
}
```

AlertDialog re-exports the same layout sub-components (`AlertDialogHeader`, `AlertDialogBody`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`) — these are thin wrappers that apply AlertDialog-specific SCSS class names but follow the exact same layout logic as their Dialog counterparts.

---

## Architecture

Both components are thin wrappers around `@radix-ui/react-dialog`. They compose the Radix parts (`Dialog.Root`, `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, `Dialog.Description`, `Dialog.Close`) and apply DDS SCSS module classes.

### Dismissal control

Radix exposes `onPointerDownOutside` and `onEscapeKeyDown` on `Dialog.Content`. Use these to implement `closeOnOverlayClick` and `closeOnEscape`:

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

### Scrollable body

When `scrollable={true}`:

- `DialogContent` root: `display: flex; flex-direction: column; max-height: var(--dialog-max-height)` (CSS custom property exception — see token section below).
- `DialogHeader` and `DialogFooter`: `flex-shrink: 0` — they never scroll.
- `DialogBody`: `flex: 1 1 0; overflow-y: auto` — only this region scrolls.

When `scrollable={false}` (default): the entire content panel scrolls as one within the viewport.

### Size widths

Sizes map to fixed max-widths. Implement via a `--dialog-max-width` CSS custom property on the content element (documented exception — dynamic layout value):

| Size         | `--dialog-max-width`  |
| ------------ | --------------------- |
| `sm`         | 400px                 |
| `md`         | 560px                 |
| `lg`         | 720px                 |
| `xl`         | 960px                 |
| `fullscreen` | 100vw (+ full height) |

Set via inline style on the content root: `style={{ '--dialog-max-width': sizeMap[size] } as React.CSSProperties}` — this is a documented exception for dynamic layout values that cannot be expressed as a static token class.

---

## Component structure — Dialog

```tsx
// Dialog.tsx

// Root — thin pass-through to Radix Root
export const Dialog = ({ children, ...props }: DialogProps) => (
  <RadixDialog.Root {...props}>{children}</RadixDialog.Root>
);
Dialog.displayName = 'Dialog';

// Trigger — thin pass-through to Radix Trigger using Slot
export const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <RadixDialog.Trigger asChild ref={ref} {...props}>
    {children}
  </RadixDialog.Trigger>
));
DialogTrigger.displayName = 'DialogTrigger';

// Overlay — rendered inside Portal; always dark semi-transparent
export const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <RadixDialog.Overlay ref={ref} className={clsx(styles.overlay, className)} {...props} />
  )
);
DialogOverlay.displayName = 'DialogOverlay';

// Content — the white panel
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  (
    {
      size = 'md',
      scrollable = false,
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
      <DialogOverlay />
      <RadixDialog.Content
        ref={ref}
        className={clsx(
          styles.content,
          styles[`size-${size}`],
          scrollable && styles.scrollable,
          className
        )}
        style={{ '--dialog-max-width': sizeMap[size] } as React.CSSProperties}
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
              aria-label="Close dialog"
              className={styles.closeButton}
            />
          </RadixDialog.Close>
        )}
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
);
DialogContent.displayName = 'DialogContent';

// DialogClose — lets consumers wire custom close triggers
export const DialogClose = RadixDialog.Close;
DialogClose.displayName = 'DialogClose';

// Title — maps to Radix Dialog.Title for accessibility
export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <RadixDialog.Title ref={ref} className={clsx(styles.title, className)} {...props}>
    {children}
  </RadixDialog.Title>
));
DialogTitle.displayName = 'DialogTitle';

// Description — maps to Radix Dialog.Description for accessibility
export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <RadixDialog.Description ref={ref} className={clsx(styles.description, className)} {...props}>
    {children}
  </RadixDialog.Description>
));
DialogDescription.displayName = 'DialogDescription';

// Header — sticky in scrollable mode
export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.header, className)} {...props}>
      {children}
    </div>
  )
);
DialogHeader.displayName = 'DialogHeader';

// Body — scrollable region when scrollable={true}
export const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.body, className)} {...props}>
      {children}
    </div>
  )
);
DialogBody.displayName = 'DialogBody';

// Footer — action area, right-aligned by default
export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
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
DialogFooter.displayName = 'DialogFooter';
```

---

## Component structure — AlertDialog

AlertDialog wraps the same Radix Dialog primitive but applies its own SCSS module and stricter defaults.

```tsx
// AlertDialog.tsx

export const AlertDialog = ({ children, ...props }: AlertDialogProps) => (
  <RadixDialog.Root {...props}>{children}</RadixDialog.Root>
)
AlertDialog.displayName = 'AlertDialog'

export const AlertDialogTrigger = React.forwardRef<...>(...)  // same pattern as DialogTrigger
AlertDialogTrigger.displayName = 'AlertDialogTrigger'

export const AlertDialogOverlay = React.forwardRef<...>(...)  // same overlay pattern
AlertDialogOverlay.displayName = 'AlertDialogOverlay'

export const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  (
    {
      variant = 'destructive',
      size = 'sm',
      closeOnOverlayClick = false,    // ← AlertDialog default is FALSE
      closeOnEscape = false,          // ← AlertDialog default is FALSE
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <RadixDialog.Portal>
      <AlertDialogOverlay />
      <RadixDialog.Content
        ref={ref}
        // AlertDialog has no role override — Radix sets role="dialog" which is correct.
        // Announce as alert dialog via aria-describedby pointing to the description.
        aria-modal="true"
        className={clsx(
          styles.content,
          styles[`size-${size}`],
          styles[`variant-${variant}`],
          className,
        )}
        style={{ '--dialog-max-width': alertSizeMap[size] } as React.CSSProperties}
        onPointerDownOutside={(e) => { if (!closeOnOverlayClick) e.preventDefault() }}
        onEscapeKeyDown={(e) => { if (!closeOnEscape) e.preventDefault() }}
        {...props}
      >
        {/* No internal close button on AlertDialog — user must choose an action */}
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  ),
)
AlertDialogContent.displayName = 'AlertDialogContent'

// Layout sub-components — same pattern as Dialog counterparts
export const AlertDialogHeader    = ...  // clsx(styles.header, className)
export const AlertDialogBody      = ...  // clsx(styles.body, className)
export const AlertDialogFooter    = ...  // clsx(styles.footer, styles[`footerAlign-${align}`], className) — default align='end'
export const AlertDialogTitle     = ...  // maps to RadixDialog.Title
export const AlertDialogDescription = ...  // maps to RadixDialog.Description
```

### AlertDialog variant stripe

The `variant` prop adds a 4px left border stripe on the content panel — identical in concept to the KPICard top stripe pattern:

| Variant       | Border token                          |
| ------------- | ------------------------------------- |
| `destructive` | `var(--dds-color-action-destructive)` |
| `warning`     | `var(--dds-color-status-warning)`     |
| `info`        | `var(--dds-color-status-info)`        |

Apply as `border-left: 4px solid <token>` on `.content` within each `.variant-*` modifier class.

---

## SCSS — Dialog.module.scss

```scss
@use '../../../styles/mixins' as *; // adjust path to match repo structure

// ─── Overlay ─────────────────────────────────────────────────────────────────

.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: oklch(from var(--dds-color-bg-default) l c h / 0.6);
  backdrop-filter: blur(2px);

  // Radix data attributes drive animation
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 51;

  width: min(var(--dialog-max-width, 560px), calc(100vw - var(--dds-space-8)));
  max-height: calc(100vh - var(--dds-space-16));
  overflow-y: auto; // default: whole panel scrolls

  background-color: var(--dds-color-bg-card);
  border: 1px solid var(--dds-color-border-default);
  border-radius: var(--dds-radius-none);
  box-shadow: var(--dds-shadow-sm);

  display: flex;
  flex-direction: column;

  // Focus ring on the content panel itself (Radix focuses it on open)
  outline: none;
  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }

  // Entry / exit animations driven by Radix data-state
  &[data-state='open'] {
    animation: contentIn var(--dds-duration-normal) var(--dds-ease-out);
  }
  &[data-state='closed'] {
    animation: contentOut var(--dds-duration-fast) var(--dds-ease-standard);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

@keyframes contentIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes contentOut {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.97);
  }
}

// ─── Scrollable variant ───────────────────────────────────────────────────────

// When scrollable, only .body scrolls; .header and .footer are sticky.
.scrollable {
  overflow-y: hidden; // panel itself does NOT scroll
  max-height: calc(100vh - var(--dds-space-16));
}

// ─── Size modifiers ───────────────────────────────────────────────────────────
// max-width is set via inline --dialog-max-width; these classes are still
// generated for specificity and future override surface.

.size-fullscreen {
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  max-height: 100vh;
  top: 0;
  left: 0;
  transform: none;
  border: none;
}

// ─── Close button ────────────────────────────────────────────────────────────

.closeButton {
  position: absolute;
  top: var(--dds-space-3);
  right: var(--dds-space-3);
}

// ─── Header ──────────────────────────────────────────────────────────────────

.header {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-1);
  padding: var(--dds-space-6) var(--dds-space-6) var(--dds-space-4);
  // Right padding accounts for the close button
  padding-right: calc(var(--dds-space-6) + var(--dds-space-10));
  border-bottom: 1px solid var(--dds-color-border-default);
  flex-shrink: 0; // sticky in scrollable mode
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
  padding: var(--dds-space-6);
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-base);
  line-height: var(--dds-line-height-normal);
  color: var(--dds-color-text-default);
  flex: 1 1 0; // expands in scrollable mode

  // Only scrolls when .scrollable is present on parent
  .scrollable & {
    overflow-y: auto;
  }
}

// ─── Footer ──────────────────────────────────────────────────────────────────

.footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dds-space-3);
  padding: var(--dds-space-4) var(--dds-space-6) var(--dds-space-6);
  border-top: 1px solid var(--dds-color-border-default);
  flex-shrink: 0; // sticky in scrollable mode
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

## SCSS — AlertDialog.module.scss

AlertDialog shares the same overlay, content, header, body, footer, title, and description patterns. Do not duplicate SCSS — instead define only the AlertDialog-specific rules here:

```scss
// All layout SCSS follows the same structure as Dialog.module.scss.
// Only variant-specific additions are listed below.

// ─── Variant stripe (left border) ────────────────────────────────────────────

.variant-destructive {
  border-left: 4px solid var(--dds-color-action-destructive);
}

.variant-warning {
  border-left: 4px solid var(--dds-color-status-warning);
}

.variant-info {
  border-left: 4px solid var(--dds-color-status-info);
}

// AlertDialog footer always right-aligns with a specific button order convention:
// [Cancel] [Confirm] — confirm is always the rightmost (most prominent) action.
// This is a layout convention enforced by documentation, not by the component itself;
// the consumer is responsible for button order in JSX.
```

---

## CSS custom property exceptions (documented)

| Property             | Component                         | Reason                                         |
| -------------------- | --------------------------------- | ---------------------------------------------- |
| `--dialog-max-width` | DialogContent, AlertDialogContent | Dynamic per-size value, no static token exists |

These follow the same inline-style-as-custom-property exception documented in the project summary.

---

## Accessibility

### Dialog

- `DialogContent` renders as Radix `Dialog.Content`, which sets `role="dialog"` and `aria-modal="true"` automatically.
- `DialogTitle` maps to `Dialog.Title` — Radix wires `aria-labelledby` automatically when `DialogTitle` is a child of `DialogContent`.
- `DialogDescription` maps to `Dialog.Description` — Radix wires `aria-describedby` automatically.
- If `DialogTitle` is intentionally omitted, the consumer **must** pass `aria-label` to `DialogContent`.
- Focus is trapped inside the dialog while open — Radix manages this.
- On open: focus moves to the first focusable element inside the content, or to the content panel itself.
- On close: focus returns to the trigger element — Radix manages this.
- Close button: `aria-label="Close dialog"`, `ghost` variant, positioned `absolute` top-right — not in the tab flow between header and body.
- Escape closes by default — Radix handles the key event; `closeOnEscape={false}` calls `e.preventDefault()`.

### AlertDialog

- Same `role="dialog"` + `aria-modal="true"` from Radix.
- No internal close button — user must choose an explicit action; this is intentional.
- `AlertDialogTitle` and `AlertDialogDescription` follow the same Radix auto-wiring as Dialog.
- Escape does NOT close by default — `onEscapeKeyDown` calls `e.preventDefault()`.
- Backdrop click does NOT close by default — `onPointerDownOutside` calls `e.preventDefault()`.
- Action buttons in `AlertDialogFooter`:
  - Confirm/destructive action: `<Button variant="destructive">Delete</Button>` — always present.
  - Cancel: `<AlertDialogTrigger asChild>` wrapping `<Button variant="secondary">Cancel</Button>` or use `RadixDialog.Close asChild`.
  - Tab order: Cancel first (left), Confirm last (right) in DOM — this matches visual layout when `footerAlign="end"` (right-to-left visual read of danger → cancel).
    - **Wait:** reverse this. Confirm (destructive) should come last in the DOM so it gets focus last on Tab, reducing accidental activation. DOM order: Cancel → Confirm. Visual order via `flex-direction: row`.

### Keyboard interactions

| Key            | Dialog behaviour                                 | AlertDialog behaviour |
| -------------- | ------------------------------------------------ | --------------------- |
| `Tab`          | Cycles through focusable elements inside content | Same                  |
| `Shift+Tab`    | Reverse cycle                                    | Same                  |
| `Escape`       | Closes (default)                                 | No-op (default)       |
| Backdrop click | Closes (default)                                 | No-op (default)       |
| `Enter`        | Activates focused button                         | Same                  |
| `Space`        | Activates focused button                         | Same                  |

---

## TDD — write ALL tests before implementing

Run scaffolding first: `node scaffolding.mjs Dialog` and `node scaffolding.mjs AlertDialog`.

### Dialog tests (`Dialog.test.tsx`)

```
// Rendering
- renders children inside the content panel when open
- does not render content panel when closed (Radix Portal not mounted)
- renders DialogTitle with correct text
- renders DialogDescription with correct text
- renders DialogHeader, DialogBody, DialogFooter
- forwards ref to content HTMLDivElement
- forwards className to content root
- renders internal close button by default
- does not render internal close button when showCloseButton={false}

// Sizes
- applies size-sm class when size="sm"
- applies size-md class when size="md" (default)
- applies size-lg class when size="lg"
- applies size-xl class when size="xl"
- applies size-fullscreen class when size="fullscreen"
- sets --dialog-max-width inline custom property for each size

// Scrollable
- applies scrollable class when scrollable={true}
- does not apply scrollable class when scrollable={false} (default)

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
- focus moves into dialog on open
- focus returns to trigger on close
- Tab key cycles through focusable elements
- Escape closes and returns focus to trigger

// Accessibility
- content has role="dialog"
- content has aria-modal="true"
- aria-labelledby is wired to DialogTitle id
- aria-describedby is wired to DialogDescription id
- close button has aria-label="Close dialog"

// axe
- axe: passes when open with title and description
- axe: passes when open with aria-label and no DialogTitle
- axe: passes when open, scrollable={true}
- axe: passes when open, showCloseButton={false}
- axe: passes when open, size="fullscreen"
```

### AlertDialog tests (`AlertDialog.test.tsx`)

```
// Rendering
- renders children when open
- renders AlertDialogTitle and AlertDialogDescription
- renders AlertDialogHeader, AlertDialogBody, AlertDialogFooter
- does NOT render an internal close button
- forwards ref to content HTMLDivElement
- forwards className to content root

// Variants
- applies variant-destructive class by default
- applies variant-warning class when variant="warning"
- applies variant-info class when variant="info"

// Sizes
- applies size-sm class by default
- applies size-md class when size="md"

// Dismissal defaults
- does NOT close on Escape by default
- does NOT close on overlay click by default

// Dismissal overrides
- closes on Escape when closeOnEscape={true}
- closes on overlay click when closeOnOverlayClick={true}

// Open/close behaviour
- opens when trigger is clicked
- closes when cancel button (DialogClose) is clicked
- closes when confirm button with onOpenChange(false) fires
- calls onOpenChange(false) on explicit close

// Focus management
- focus moves into alert dialog on open
- Tab cycles through focusable elements
- Shift+Tab reverse cycles
- focus returns to trigger on close

// Accessibility
- content has role="dialog"
- content has aria-modal="true"
- aria-labelledby wired to AlertDialogTitle
- aria-describedby wired to AlertDialogDescription

// axe
- axe: passes when open, variant="destructive"
- axe: passes when open, variant="warning"
- axe: passes when open, variant="info"
- axe: passes when open with cancel and confirm buttons
- axe: passes when closeOnEscape={true}
```

---

## Stories — `Dialog.stories.tsx`

Title: `Core Components/Dialog`

Named exports required:

- `Default` — md size, title + description + body text + footer with Cancel (`secondary`) and Confirm (`primary`) buttons. Trigger: `<Button>Open Dialog</Button>`.
- `Sizes` — render five dialog triggers (sm / md / lg / xl / fullscreen) side by side, each opening a dialog of that size.
- `ScrollableBody` — `scrollable={true}`, DialogBody contains a long lorem ipsum passage (400+ words) to demonstrate sticky header/footer with scrolling body.
- `NoCloseButton` — `showCloseButton={false}`, footer has explicit Cancel button.
- `FooterAlignments` — four triggers demonstrating each `align` value on DialogFooter.
- `Controlled` — open/close state managed in story with `useState`, external "Open" and "Close" buttons outside the Dialog.
- `WithForm` — DialogBody contains a simple two-field form (Name + Email using the `Input` and `Field` components if they exist). Footer: Cancel + Submit. Submit calls `args.onOpenChange(false)`.
- `NoEscapeNoOverlay` — `closeOnEscape={false}` and `closeOnOverlayClick={false}`. Only the explicit footer Cancel button closes it. Story includes a note: "Escape and backdrop click are disabled."

`OpenAndClose` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: /open dialog/i });
  await userEvent.click(trigger);
  const dialog = within(document.body).getByRole('dialog');
  await expect(dialog).toBeVisible();
  const closeBtn = within(dialog).getByRole('button', { name: /close dialog/i });
  await userEvent.click(closeBtn);
  await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
};
```

`EscapeClose` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: /open dialog/i });
  await userEvent.click(trigger);
  await expect(within(document.body).getByRole('dialog')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
};
```

Use `autodocs`. Storybook group: `Core Components/Dialog`.

---

## Stories — `AlertDialog.stories.tsx`

Title: `Core Components/AlertDialog`

Named exports required:

- `Destructive` — default variant. Title: "Delete project". Description: "This action cannot be undone. All associated data will be permanently removed." Footer: Cancel (`secondary`) + Delete (`destructive`) buttons.
- `Warning` — `variant="warning"`. Title: "Archive workspace". Description: "Archiving will hide this workspace from active views." Footer: Cancel + Archive (`primary`) buttons.
- `Info` — `variant="info"`. Title: "Update required". Description: "A new version is available. Updating will reload the application." Footer: Later (`secondary`) + Update Now (`primary`) buttons.
- `SizeMd` — `size="md"` with longer body content to demonstrate wider layout.
- `EscapeEnabled` — `closeOnEscape={true}`, story note: "Escape key is enabled for this alert".
- `OverlayEnabled` — `closeOnOverlayClick={true}`, story note: "Clicking the backdrop closes this alert".

`ConfirmDelete` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: /delete/i });
  await userEvent.click(trigger);
  const dialog = within(document.body).getByRole('dialog');
  await expect(dialog).toBeVisible();
  // Escape should NOT close
  await userEvent.keyboard('{Escape}');
  await expect(dialog).toBeVisible();
  // Confirm button closes
  const confirmBtn = within(dialog).getByRole('button', { name: /delete/i });
  await userEvent.click(confirmBtn);
  await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
};
```

`CancelDismisses` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: /delete/i });
  await userEvent.click(trigger);
  const dialog = within(document.body).getByRole('dialog');
  const cancelBtn = within(dialog).getByRole('button', { name: /cancel/i });
  await userEvent.click(cancelBtn);
  await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
};
```

Use `autodocs`. Storybook group: `Core Components/AlertDialog`.

---

## Definition of done

### Dialog

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants and states
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] All sizes, scrollable, and footer alignment variants shown in stories
- [ ] `closeOnOverlayClick` and `closeOnEscape` overrides verified in tests and stories
- [ ] Scrollable story demonstrates sticky header + footer with independently scrolling body
- [ ] `border-radius: var(--dds-radius-none)` on content panel — no exceptions
- [ ] `--dialog-max-width` is the only inline style / CSS custom property in use
- [ ] No Tailwind. No hardcoded color or spacing values in SCSS.
- [ ] Internal close button uses existing `Button` component — not a custom element
- [ ] Exported from `packages/components/src/index.ts`

### AlertDialog

- [ ] All Vitest tests pass
- [ ] axe passes for all three variants
- [ ] Escape and overlay click are both no-ops by default — verified in tests
- [ ] Variant left-border stripe renders correctly in all three variants
- [ ] No internal close button present in the DOM
- [ ] DOM order of footer buttons: Cancel first, Confirm last (keyboard safety)
- [ ] No Tailwind. No hardcoded values in SCSS.
- [ ] Exported from `packages/components/src/index.ts`

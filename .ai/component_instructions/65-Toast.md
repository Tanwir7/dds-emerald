# Toast · node scaffolding.mjs Toast

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/Button/
packages/components/src/components/
```

- The Toast close button uses the existing `Button` component with `variant="ghost"` and `iconOnly`. Match the exact icon-only API `Button` exposes.
- Radix primitive: `@radix-ui/react-toast` — use it entirely.
- `ToastProvider` must be rendered once at the application root (or in the Storybook decorator). The component instruction must make this clear and provide the provider as a named export.

---

## Scaffold location

```
packages/components/src/components/Toast/
  Toast.tsx
  Toast.module.scss
  Toast.test.tsx
  Toast.stories.tsx
  index.ts
```

---

## Purpose

`Toast` is a brief, auto-dismissing notification that appears at the edge of the viewport to communicate the result of a user action or a system event. It does not interrupt the user's flow and requires no response.

Common uses: "File saved", "Link copied", "Changes published", "Error uploading file", "Undo" affordance after a destructive action.

**Toast vs Alert / InlineAlert:**

- `Toast`: ephemeral, auto-dismisses, appears in a fixed viewport region, initiated by an action or event.
- `Alert` / `InlineAlert`: persistent, inline in the page content, used for important status conditions that remain until resolved.

**Toast vs Dialog / AlertDialog:**

- `Toast`: no user action required, non-blocking, dismisses automatically.
- `Dialog` / `AlertDialog`: blocks the user, requires an explicit action.

---

## Exports from `index.ts`

```ts
export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  useToast,
};
export type { ToastProps, ToastVariant, ToastActionProps };
```

---

## Types

```ts
type ToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface ToastProps extends React.HTMLAttributes<HTMLLIElement> {
  variant?: ToastVariant; // default: 'default'
  duration?: number; // ms before auto-dismiss — default: 5000. Pass Infinity to disable auto-dismiss.
  open?: boolean; // controlled
  defaultOpen?: boolean; // uncontrolled — default: true
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

export interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  altText: string; // required — screen reader description of the action (Radix requirement)
  className?: string;
  children: React.ReactNode;
}
```

---

## Architecture

### Radix parts

```
ToastProvider   → Radix Toast.Provider   (render once at app root)
ToastViewport   → Radix Toast.Viewport   (the fixed-position stack region)
Toast           → Radix Toast.Root       (individual toast item)
ToastTitle      → Radix Toast.Title
ToastDescription → Radix Toast.Description
ToastClose      → Radix Toast.Close      (wraps Button variant="ghost" iconOnly)
ToastAction     → Radix Toast.Action     (optional action button, e.g. Undo)
```

### useToast — imperative API

Consumers should not need to manage toast state manually. Provide a `useToast` hook backed by a simple React context that:

1. Holds a list of active toast configs in state.
2. Exposes a `toast({ title, description, variant, duration, action })` function that adds a new toast to the list.
3. Exposes a `dismiss(id)` function.
4. Renders a `<ToastViewport>` and the list of active `<Toast>` elements from inside a `ToastProvider`.

```ts
// Hook return type
interface UseToastReturn {
  toast: (options: ToastOptions) => string; // returns toast id
  dismiss: (id: string) => void;
  toasts: ToastConfig[];
}

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string; // button text
    altText: string; // screen reader label (Radix requirement)
    onClick: () => void;
  };
}

interface ToastConfig extends ToastOptions {
  id: string;
  open: boolean;
}
```

### Provider setup

Consumers wrap their application once:

```tsx
// app root
<ToastProvider>
  {children} {/* ToastViewport is rendered inside the provider */}
</ToastProvider>
```

`ToastProvider` renders `Radix Toast.Provider` and a `<ToastViewport>` internally. It also provides the `useToast` context. Consumers call `useToast()` anywhere in the tree to trigger toasts.

### Toast stacking

Radix `Toast.Provider` accepts a `swipeDirection` prop (default: `'right'`) and handles stacking and swipe-to-dismiss natively. Set `swipeDirection="right"` as the DDS default.

---

## Component structure

```tsx
// Toast.tsx
import * as RadixToast from '@radix-ui/react-toast';
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../Button';
import styles from './Toast.module.scss';

// ─── Context ──────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  toasts: ToastConfig[];
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<ToastConfig[]>([]);

  const toast = React.useCallback((options: ToastOptions): string => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...options, id, open: true }]);
    return id;
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, open: false } : t)));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            duration={t.duration}
            open={t.open}
            onOpenChange={(open) => {
              if (!open) dismiss(t.id);
            }}
          >
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
            {t.action && (
              <ToastAction altText={t.action.altText} onClick={t.action.onClick}>
                {t.action.label}
              </ToastAction>
            )}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
};
ToastProvider.displayName = 'ToastProvider';

// ─── Viewport ────────────────────────────────────────────────────────────────

export const ToastViewport = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<typeof RadixToast.Viewport>
>(({ className, ...props }, ref) => (
  <RadixToast.Viewport ref={ref} className={clsx(styles.viewport, className)} {...props} />
));
ToastViewport.displayName = 'ToastViewport';

// ─── Variant icon map ────────────────────────────────────────────────────────

const variantIconMap: Record<ToastVariant, LucideIcon | null> = {
  default: null,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
};

// ─── Toast (individual notification) ─────────────────────────────────────────

export const Toast = React.forwardRef<HTMLLIElement, ToastProps>(
  ({ variant = 'default', duration = 5000, className, children, ...props }, ref) => {
    const Icon = variantIconMap[variant];
    return (
      <RadixToast.Root
        ref={ref}
        duration={duration}
        className={clsx(styles.toast, styles[`variant-${variant}`], className)}
        {...props}
      >
        {Icon && (
          <span className={styles.variantIcon} aria-hidden="true">
            <Icon />
          </span>
        )}
        <div className={styles.toastContent}>{children}</div>
      </RadixToast.Root>
    );
  }
);
Toast.displayName = 'Toast';

// ─── Title ────────────────────────────────────────────────────────────────────

export const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <RadixToast.Title ref={ref} className={clsx(styles.title, className)} {...props}>
      {children}
    </RadixToast.Title>
  )
);
ToastTitle.displayName = 'ToastTitle';

// ─── Description ─────────────────────────────────────────────────────────────

export const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <RadixToast.Description ref={ref} className={clsx(styles.description, className)} {...props}>
    {children}
  </RadixToast.Description>
));
ToastDescription.displayName = 'ToastDescription';

// ─── Close ────────────────────────────────────────────────────────────────────

export const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <RadixToast.Close asChild ref={ref}>
    <Button
      variant="ghost"
      iconOnly
      icon={X}
      aria-label="Dismiss notification"
      className={clsx(styles.closeButton, className)}
      {...props}
    />
  </RadixToast.Close>
));
ToastClose.displayName = 'ToastClose';

// ─── Action ──────────────────────────────────────────────────────────────────

export const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ altText, className, children, ...props }, ref) => (
    <RadixToast.Action ref={ref} altText={altText} asChild>
      <Button
        variant="ghost"
        size="sm"
        className={clsx(styles.action, className)}
        ref={ref}
        {...props}
      >
        {children}
      </Button>
    </RadixToast.Action>
  )
);
ToastAction.displayName = 'ToastAction';
```

---

## SCSS — Toast.module.scss

```scss
@use '../../../styles/mixins' as *;

// ─── Viewport ────────────────────────────────────────────────────────────────

.viewport {
  position: fixed;
  bottom: var(--dds-space-6);
  right: var(--dds-space-6);
  z-index: 9999;

  display: flex;
  flex-direction: column;
  gap: var(--dds-space-2);

  width: 380px;
  max-width: calc(100vw - var(--dds-space-12));

  // Reset list styles — Radix renders an <ol>
  list-style: none;
  margin: 0;
  padding: 0;
  outline: none;
}

// ─── Toast (individual item) ─────────────────────────────────────────────────

.toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--dds-space-3);
  padding: var(--dds-space-4);

  background-color: var(--dds-color-bg-card);
  border: 1px solid var(--dds-color-border-default);
  border-radius: var(--dds-radius-none);
  box-shadow: var(--dds-shadow-sm);

  // Radix data attributes for animation
  &[data-state='open'] {
    animation: toastIn var(--dds-duration-normal) var(--dds-ease-out);
  }
  &[data-state='closed'] {
    animation: toastOut var(--dds-duration-fast) var(--dds-ease-standard);
  }
  // Swipe gesture — Radix moves the toast with a CSS variable
  &[data-swipe='move'] {
    transform: translateX(var(--radix-toast-swipe-move-x));
  }
  &[data-swipe='cancel'] {
    transform: translateX(0);
    transition: transform var(--dds-duration-fast) var(--dds-ease-out);
  }
  &[data-swipe='end'] {
    animation: swipeOut var(--dds-duration-fast) var(--dds-ease-standard);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(calc(100% + var(--dds-space-6)));
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toastOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(calc(100% + var(--dds-space-6)));
  }
}

@keyframes swipeOut {
  from {
    transform: translateX(var(--radix-toast-swipe-end-x));
  }
  to {
    transform: translateX(calc(100% + var(--dds-space-6)));
  }
}

// ─── Variant left-border accent ───────────────────────────────────────────────

// All variants add a 3px left border stripe for non-colour-dependent status signalling
.variant-default {
  border-left: 3px solid var(--dds-color-border-default);
}

.variant-success {
  border-left: 3px solid var(--dds-color-status-success);
}

.variant-warning {
  border-left: 3px solid var(--dds-color-status-warning);
}

.variant-danger {
  border-left: 3px solid var(--dds-color-status-danger);
}

.variant-info {
  border-left: 3px solid var(--dds-color-status-info);
}

// ─── Variant icon ────────────────────────────────────────────────────────────

.variantIcon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-top: 1px; // optical alignment with first line of text

  svg {
    width: var(--dds-icon-size-md);
    height: var(--dds-icon-size-md);
  }
}

.variant-success .variantIcon {
  color: var(--dds-color-status-success);
}
.variant-warning .variantIcon {
  color: var(--dds-color-status-warning);
}
.variant-danger .variantIcon {
  color: var(--dds-color-status-danger);
}
.variant-info .variantIcon {
  color: var(--dds-color-status-info);
}

// ─── Content region ───────────────────────────────────────────────────────────

.toastContent {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-1);
}

// ─── Title ────────────────────────────────────────────────────────────────────

.title {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-semibold);
  line-height: var(--dds-line-height-snug);
  color: var(--dds-color-text-default);
}

// ─── Description ─────────────────────────────────────────────────────────────

.description {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  line-height: var(--dds-line-height-normal);
  color: var(--dds-color-text-muted);
}

// ─── Action button ────────────────────────────────────────────────────────────

.action {
  // Inherits Button ghost styles. No overrides needed — ghost is correct here.
  // Ensure it sits below description in the content column:
  margin-top: var(--dds-space-1);
  align-self: flex-start;
}

// ─── Close button ────────────────────────────────────────────────────────────

.closeButton {
  position: absolute;
  top: var(--dds-space-2);
  right: var(--dds-space-2);
  flex-shrink: 0;
}
```

---

## Accessibility

Toast uses Radix `@radix-ui/react-toast` which handles the `role="status"` live region pattern. Key rules:

- `Toast.Root` renders with `role="status"` and `aria-live="polite"` by default — screen readers announce the content without interrupting the user.
- For `variant="danger"` toasts representing errors, set `type="foreground"` on the Radix Root — this triggers `aria-live="assertive"` for immediate announcement.
  - Implementation: detect `variant === 'danger'` inside `<Toast>` and pass `type="foreground"` to `RadixToast.Root`.
- `ToastAction` requires `altText` prop — this is a Radix hard requirement. It provides an alternative description read by screen readers in the toast region summary. Never omit it.
- The close button has `aria-label="Dismiss notification"`.
- Variant icons are `aria-hidden="true"` — meaning is also conveyed by the left border stripe, title wording, and live region announcement.
- The border stripe on each variant (success/warning/danger/info) ensures status is never communicated by colour alone — it pairs colour with a structural indicator.
- `ToastViewport` renders as `<ol>` via Radix — each `Toast` is an `<li>`. This is the correct list semantics for a notification stack.
- Swipe-to-dismiss is a pointer convenience — keyboard users dismiss via the close button or by navigating to the toast and pressing F8 (Radix's keyboard shortcut to jump to the toast region), then Tab to the close button and pressing Enter/Space.
- Toasts must not auto-dismiss while the user is interacting with them (pointer inside, or keyboard focus inside). Radix pauses the dismiss timer on `onMouseEnter`, `onPointerDown`, and `onFocus` automatically.

### Keyboard interactions (Radix-managed)

| Key           | Behaviour                                                       |
| ------------- | --------------------------------------------------------------- |
| `F8`          | Moves keyboard focus to the toast viewport region               |
| `Tab`         | Navigates through interactive elements inside the focused toast |
| `Shift+Tab`   | Reverse navigation                                              |
| `Enter/Space` | Activates close button or action button                         |
| `Escape`      | Returns focus to the document (exits toast region)              |

---

## TDD — write ALL tests before implementing

Run scaffolding first: `node scaffolding.mjs Toast`

**Note on testing:** Wrap the component under test in `<ToastProvider>` for all tests. Use `vi.useFakeTimers()` and `vi.advanceTimersByTime(duration)` to test auto-dismiss. Use `vi.useRealTimers()` in `afterEach`.

```
// ToastProvider / useToast
- useToast throws if used outside ToastProvider
- toast() adds a toast to the DOM
- toast() returns a string id
- dismiss(id) removes the toast from the DOM
- multiple toasts can be open simultaneously
- calling toast() twice renders two toast items

// Toast rendering
- renders ToastTitle text
- renders ToastDescription text
- renders ToastAction with correct label
- renders close button with aria-label="Dismiss notification"
- does NOT render variant icon for variant="default"
- renders CheckCircle2 icon for variant="success"
- renders AlertTriangle icon for variant="warning"
- renders XCircle icon for variant="danger"
- renders Info icon for variant="info"
- variant icon has aria-hidden="true"
- applies variant-success class for variant="success"
- applies variant-warning class for variant="warning"
- applies variant-danger class for variant="danger"
- applies variant-info class for variant="info"
- forwards ref to Toast root HTMLLIElement
- forwards className to Toast root

// Auto-dismiss
- toast dismisses automatically after default duration (5000ms)
- toast dismisses after custom duration
- toast with duration=Infinity does NOT auto-dismiss
- onOpenChange(false) called when toast closes

// Close button
- clicking close button dismisses the toast
- close button calls onOpenChange(false)

// Action
- ToastAction renders a button with the provided label
- clicking ToastAction calls the onClick handler
- ToastAction has altText prop (required by Radix)

// Danger variant live region
- variant="danger" Toast has type="foreground" (aria-live="assertive")
- other variants do NOT have type="foreground"

// Accessibility (Radix-managed)
- ToastViewport renders as <ol>
- Toast renders as <li>
- Toast has role="status" for non-danger variants
- ToastViewport has aria-label (check Radix default output)

// axe
- axe: passes with default variant
- axe: passes with variant="success"
- axe: passes with variant="warning"
- axe: passes with variant="danger"
- axe: passes with variant="info"
- axe: passes with ToastAction present
- axe: passes with title only (no description)
- axe: passes with description only (no title)
- axe: passes with two toasts open simultaneously
```

---

## Stories — `Toast.stories.tsx`

Title: `Core Components/Toast`

**Setup:** All stories must use a Storybook decorator that wraps the canvas in `<ToastProvider>`. Add this to the story file's `default` export:

```ts
decorators: [
  (Story) => (
    <ToastProvider>
      <Story />
    </ToastProvider>
  ),
],
```

Named exports required:

- `Default` — Button labelled "Show notification". Clicking calls `toast({ title: 'File saved', description: 'Your changes have been saved.' })`. Demonstrates the `useToast` imperative API.
- `Variants` — Five buttons, one per variant (default / success / warning / danger / info), each calling `toast()` with variant-appropriate title and description. Lay out buttons in a row.
- `TitleOnly` — Toast with `title` but no `description`.
- `DescriptionOnly` — Toast with `description` but no `title`.
- `WithAction` — Toast with an "Undo" `ToastAction`. Clicking Undo calls `toast({ title: 'Action undone' })`.
- `LongContent` — Toast with a long description (two sentences) to demonstrate text wrapping inside the fixed-width viewport.
- `CustomDuration` — `duration={2000}`. Story note: "This toast dismisses after 2 seconds."
- `Persistent` — `duration={Infinity}`. Story note: "This toast will not auto-dismiss — only the close button dismisses it."
- `MultipleToasts` — A button that appends a new toast on each click. Shows stacking behaviour. Limit stacking to 3 via Radix `Toast.Provider`'s internal limit — do not implement a custom limit.
- `DangerAssertive` — `variant="danger"` toast with title "Upload failed" and description "The file exceeded the size limit." Documents the `aria-live="assertive"` behaviour.

`ShowAndDismiss` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const button = within(canvasElement).getByRole('button', { name: /show notification/i });
  await userEvent.click(button);
  const toast = within(document.body).getByRole('status');
  await expect(toast).toBeVisible();
  const closeBtn = within(toast).getByRole('button', { name: /dismiss/i });
  await userEvent.click(closeBtn);
  await expect(within(document.body).queryByRole('status')).not.toBeInTheDocument();
};
```

`ActionFires` with `play()`:

```ts
play: async ({ canvasElement }) => {
  // Uses the WithAction story
  const button = within(canvasElement).getByRole('button', { name: /undo/i });
  // The trigger button opens the toast; then the Undo action inside is clicked
  const triggerBtn = within(canvasElement).getByRole('button', { name: /show/i });
  await userEvent.click(triggerBtn);
  const toast = within(document.body).getByRole('status');
  const undoBtn = within(toast).getByRole('button', { name: /undo/i });
  await userEvent.click(undoBtn);
  // After undo, a second "Action undone" toast should appear
  await expect(within(document.body).getAllByRole('status').length).toBeGreaterThan(0);
};
```

Use `autodocs`. Storybook group: `Core Components/Toast`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants and states
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] `useToast` throws a clear error when used outside `ToastProvider`
- [ ] `variant="danger"` passes `type="foreground"` to Radix Root — assertive announcement
- [ ] Auto-dismiss timer pauses when pointer is inside toast — verified via Radix behaviour
- [ ] Auto-dismiss timer pauses when keyboard focus is inside toast — verified via Radix behaviour
- [ ] `duration={Infinity}` prevents auto-dismiss — verified in tests
- [ ] Swipe-to-dismiss gesture styles (`data-swipe` states) implemented in SCSS
- [ ] Variant left-border stripe renders for all five variants
- [ ] Variant icons are aria-hidden; meaning not conveyed by icon/colour alone
- [ ] `ToastAction` requires `altText` — TypeScript enforces this (not optional)
- [ ] Close button uses existing `Button` component with `variant="ghost"` and `iconOnly`
- [ ] `border-radius: var(--dds-radius-none)` on toast panel — no exceptions
- [ ] `prefers-reduced-motion` disables all animations and transitions
- [ ] No Tailwind. No hardcoded color or spacing values in SCSS.
- [ ] `ToastProvider` documented as a required app-root setup in the story file header comment
- [ ] Exported from `packages/components/src/index.ts`

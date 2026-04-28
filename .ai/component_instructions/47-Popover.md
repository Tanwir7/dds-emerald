# Popover · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Popover` component.
- Scaffold: `packages/components/src/components/Popover/`
- Radix primitive: `@radix-ui/react-popover`

---

## Purpose

`Popover` displays a floating panel of rich content anchored to a trigger element. Unlike `Tooltip` (text-only, no interaction, hover/focus triggered), `Popover` supports JSX children, interactive content (forms, buttons, links), and is triggered only by explicit user activation (click or Enter/Space). It is the correct component for: settings panels, confirmation prompts, date pickers, filter menus, and any floating UI that needs to contain interactive elements.

**Popover vs Tooltip:**

- `Tooltip` — text-only label, hover + focus trigger, `role="tooltip"`, never interactive inside.
- `Popover` — rich JSX content, click/keyboard trigger, `role="dialog"` or no role, fully interactive inside.

---

## Exports from `index.ts`

```ts
export { Popover, PopoverTrigger, PopoverContent, PopoverClose, PopoverAnchor };
export type { PopoverProps, PopoverContentProps };
```

---

## Props

### `Popover` (Radix `Popover.Root`):

```ts
interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean; // default: false — true traps focus like a dialog
  children: React.ReactNode;
}
```

### `PopoverTrigger` (Radix `Popover.Trigger`):

```ts
interface PopoverTriggerProps {
  asChild?: boolean; // default: false
  className?: string;
  children: React.ReactNode;
}
```

### `PopoverContent` (Radix `Popover.Content`):

```ts
interface PopoverContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left'; // default: 'bottom'
  align?: 'start' | 'center' | 'end'; // default: 'start'
  sideOffset?: number; // default: 6
  alignOffset?: number; // default: 0
  width?: 'trigger' | 'auto' | string; // default: 'auto'
  // 'trigger' = match trigger width via var(--radix-popover-trigger-width)
  // 'auto' = content-width with min/max
  // string = explicit CSS width e.g. '320px'
  showArrow?: boolean; // default: false
  showCloseButton?: boolean; // default: false
  closeButtonLabel?: string; // default: 'Close'
  className?: string;
  children: React.ReactNode;
}
```

### `PopoverClose` — re-export of `Radix Popover.Close` with `asChild` support.

### `PopoverAnchor` — re-export of `Radix Popover.Anchor` for custom anchor positioning.

Forward `ref` on `PopoverContent` to `HTMLDivElement`. Forward `ref` on `PopoverTrigger` to `HTMLButtonElement`.

---

## PopoverContent structure

```tsx
<PopoverPrimitive.Portal>
  <PopoverPrimitive.Content
    ref={ref}
    side={side}
    align={align}
    sideOffset={sideOffset}
    alignOffset={alignOffset}
    className={clsx(styles.content, className)}
    style={
      width === 'trigger'
        ? { width: 'var(--radix-popover-trigger-width)' }
        : width !== 'auto'
          ? { width }
          : undefined
    }
  >
    {showCloseButton && (
      <PopoverPrimitive.Close className={styles.closeButton} aria-label={closeButtonLabel}>
        <CloseIcon aria-hidden="true" />
      </PopoverPrimitive.Close>
    )}

    {children}

    {showArrow && <PopoverPrimitive.Arrow className={styles.arrow} />}
  </PopoverPrimitive.Content>
</PopoverPrimitive.Portal>
```

`width` inline style is a documented exception — it conveys a dynamic layout value, not a design token value.

---

## Styles — `Popover.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.content`:

- `background-color: var(--dds-color-bg-popover)`
- `border: 1px solid var(--dds-color-border-default)`
- `border-radius: var(--dds-radius-none)`
- `box-shadow: var(--dds-shadow-sm)`
- `padding: var(--dds-space-4)`
- `min-width: 200px`
- `max-width: 480px`
- `z-index: 50`
- `outline: none` — focus is managed internally by Radix
- Entry/exit animation:

  ```scss
  &[data-state='open'] {
    animation: popoverIn var(--dds-duration-fast) var(--dds-ease-out);
  }
  &[data-state='closed'] {
    animation: popoverOut var(--dds-duration-fast) var(--dds-ease-standard);
  }

  @keyframes popoverIn {
    from {
      opacity: 0;
      transform: scale(0.97) translateY(-4px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  @keyframes popoverOut {
    from {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    to {
      opacity: 0;
      transform: scale(0.97) translateY(-4px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-state='open'],
    &[data-state='closed'] {
      animation: none;
    }
  }
  ```

`.closeButton`:

- `position: absolute`
- `top: var(--dds-space-2)`
- `right: var(--dds-space-2)`
- `display: inline-flex; align-items: center; justify-content: center`
- `width: 24px; height: 24px`
- `border: none; background: transparent`
- `color: var(--dds-color-text-muted)`
- `cursor: pointer`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent; outline-offset: 2px`
- `&:hover` → `color: var(--dds-color-text-default)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`

`.arrow`:

- `fill: var(--dds-color-bg-popover)`
- `stroke: var(--dds-color-border-default)`
- `width: 12px; height: 6px`

No hardcoded values. No Tailwind. No inline styles (except `width` — documented exception).

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on content — no exceptions.
- `PopoverContent` renders inside `Popover.Portal` — mandatory for correct z-index.
- `modal={false}` by default — the popover does NOT trap focus. Use `modal={true}` for confirmation-style popovers where the user should not interact with the rest of the page.
- When `modal={false}`, Escape closes the popover and focus returns to the trigger (Radix behaviour).
- When `showCloseButton={true}`, position it absolutely at top-right of the content — `padding` on `.content` must accommodate this (`padding-right` increased or close button overlaps with content padding).
- The `width="trigger"` option uses `var(--radix-popover-trigger-width)` — Radix CSS var, documented exception for the inline style.
- `PopoverContent` does NOT add `role="dialog"` by default — Radix does not add it either. If the consumer needs dialog semantics (for modal popovers), they should add `role="dialog"` + `aria-label` or `aria-labelledby` manually.

---

## Accessibility

- `Popover.Trigger` gets `aria-haspopup="dialog"` and `aria-expanded` from Radix.
- Focus moves into the popover content on open (Radix default) — first focusable element receives focus.
- Focus returns to the trigger on close (Radix default).
- `Escape` closes the popover (Radix built-in).
- When `modal={true}`, focus is trapped — Tab cycles within the popover, not the page.
- When `showCloseButton={true}`, it is the first focusable element — consumers may want to put it last. Use `PopoverClose asChild` for custom close button placement.
- Interactive content inside the popover (buttons, inputs) is fully accessible — Popover does not restrict its children.

---

## TDD — write ALL tests before implementing

```
// Rendering
- PopoverTrigger renders as a button by default
- PopoverContent not in DOM when closed
- PopoverContent renders in a portal when open
- PopoverContent renders children when open
- forwards className to PopoverContent
- forwards ref to PopoverContent HTMLDivElement

// Open/close
- clicking trigger opens the popover
- trigger has aria-expanded="true" when open
- trigger has aria-expanded="false" when closed
- clicking outside closes the popover
- pressing Escape closes the popover
- focus returns to trigger on close

// Focus
- first focusable element in content receives focus on open
- Tab moves through interactive content in content
- Tab when modal={false} can move outside popover

// Close button
- close button NOT rendered by default
- close button rendered when showCloseButton={true}
- close button has aria-label="Close" by default
- close button has custom aria-label when closeButtonLabel provided
- clicking close button closes popover
- close button is focusable

// Width
- no inline width style by default (width="auto")
- width style set to var(--radix-popover-trigger-width) when width="trigger"
- explicit width string applied as inline style

// Arrow
- arrow NOT rendered by default
- arrow rendered when showArrow={true}

// Side / align
- side="top" forwarded to Radix Content
- side="right" forwarded
- align="end" forwarded

// asChild trigger
- PopoverTrigger asChild renders child element as trigger

// Controlled
- respects open={true}
- respects open={false}
- onOpenChange called on open/close

// Modal
- modal={true} — Tab stays within popover content

// axe
- axe: passes when closed
- axe: passes when open with simple content
- axe: passes when open with form content
- axe: passes with showCloseButton={true}
- axe: passes with modal={true}
- axe: passes for side="top"
```

---

## Stories — `Popover.stories.tsx`

Named exports required:

- `Default` — simple text + close button, bottom-start
- `WithForm` — popover containing a form Field + Button (real-world use: filter panel)
- `WithCloseButton` — showCloseButton={true}
- `WithArrow` — showArrow={true}
- `Sides` — top / right / bottom / left, 4 triggers in a grid
- `Alignment` — align start / center / end
- `TriggerWidth` — width="trigger" (dropdown-style width matching)
- `ExplicitWidth` — width="320px"
- `Modal` — modal={true}, focus trapped
- `AsChildTrigger` — PopoverTrigger asChild wrapping a custom Button
- `ControlledOpen` — useState to control open state
- `Nested` — Popover inside Popover (advanced, verify z-index and focus)
- `DatePickerMock` — Popover containing a calendar placeholder (demonstrates real use case)

`OpenAndClose` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: /open/i });
  await userEvent.click(trigger);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const content = within(document.body).getByText('Popover content');
  await expect(content).toBeInTheDocument();
  await userEvent.keyboard('{Escape}');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toHaveFocus();
};
```

`FocusManagement` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: /open/i });
  await userEvent.click(trigger);
  // First focusable element in popover should have focus
  const firstInput = within(document.body).getByRole('textbox');
  await expect(firstInput).toHaveFocus();
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
- [ ] Focus moves into content on open, returns to trigger on close
- [ ] Escape closes popover in all stories
- [ ] Content renders in portal (document.body) — verified
- [ ] `border-radius: var(--dds-radius-none)` on content
- [ ] `width` inline style exception documented in JSDoc
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] All 4 sub-components exported from `packages/components/src/index.ts`

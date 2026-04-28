# Tooltip · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Tooltip` component.
- Scaffold: `packages/components/src/components/Tooltip/`
- Radix primitive: `@radix-ui/react-tooltip`

---

## Purpose

`Tooltip` displays a short text label that appears on hover or keyboard focus of its trigger element. It is text-only — no interactive content, no buttons, no links inside the tooltip body. For rich content (icons, formatted text, actions), use `Popover` instead.

---

## Exports from `index.ts`

```ts
export { Tooltip, TooltipProvider };
export type { TooltipProps };
```

`TooltipProvider` re-exports `Radix Tooltip.Provider` directly — consumers must wrap their app (or a subtree) in `<TooltipProvider>` once for correct open/close timing across all tooltips.

---

## Props

```ts
interface TooltipProps {
  content: string; // required — tooltip text
  side?: 'top' | 'right' | 'bottom' | 'left'; // default: 'top'
  align?: 'start' | 'center' | 'end'; // default: 'center'
  sideOffset?: number; // default: 6
  delayDuration?: number; // default: 500ms — overrides Provider default
  disableHoverableContent?: boolean; // default: true — tooltip not hoverable (text-only)
  disabled?: boolean; // default: false — no tooltip shown
  className?: string; // applied to the tooltip content panel
  children: React.ReactElement; // the trigger element
}
```

`Tooltip` is a self-contained compound — it renders `Tooltip.Provider` (if not already in tree), `Tooltip.Root`, `Tooltip.Trigger`, and `Tooltip.Content` internally. The consumer passes the trigger as `children` and the label as `content`.

Forward `ref` is NOT exposed on `Tooltip` — the trigger element manages its own ref. The `Tooltip.Trigger` uses `asChild` to render the consumer's child element as the trigger.

---

## Structure

```tsx
export const Tooltip = ({
  content,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  delayDuration,
  disableHoverableContent = true,
  disabled,
  className,
  children,
}: TooltipProps) => {
  if (disabled) return <>{children}</>;

  return (
    <TooltipPrimitive.Root
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>

      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={clsx(styles.content, className)}
        >
          {content}
          <TooltipPrimitive.Arrow className={styles.arrow} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};

export const TooltipProvider = TooltipPrimitive.Provider;
```

When `disabled={true}`, `Tooltip` renders only its `children` with no wrapper — the trigger element is returned as-is.

---

## Styles — `Tooltip.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.content`:

- `background-color: var(--dds-color-text-default)` — dark background (inverted)
- `color: var(--dds-color-bg-default)` — light text on dark bg
- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `font-weight: var(--dds-font-weight-medium)`
- `line-height: var(--dds-line-height-snug)`
- `padding: var(--dds-space-1-5) var(--dds-space-2-5)`
- `border-radius: var(--dds-radius-none)`
- `max-width: 240px`
- `word-break: break-word`
- `pointer-events: none` — text-only tooltip, not hoverable
- `z-index: 100`
- `box-shadow: var(--dds-shadow-sm)`
- Entry/exit animation:

  ```scss
  &[data-state='delayed-open'],
  &[data-state='instant-open'] {
    animation: tooltipIn var(--dds-duration-fast) var(--dds-ease-out);
  }
  &[data-state='closed'] {
    animation: tooltipOut var(--dds-duration-fast) var(--dds-ease-standard);
  }

  @keyframes tooltipIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes tooltipOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-state='delayed-open'],
    &[data-state='instant-open'],
    &[data-state='closed'] {
      animation: none;
    }
  }
  ```

`.arrow`:

- `fill: var(--dds-color-text-default)` — matches tooltip bg
- `width: 10px; height: 5px`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` — Tooltip is rectangular, no exceptions.
- `pointer-events: none` on `.content` — text-only tooltips are never hoverable. `disableHoverableContent={true}` also set at the Radix Root level.
- Tooltip background uses `var(--dds-color-text-default)` (dark in light mode, light in dark mode) — creates an inverted colour scheme that visually distinguishes it from page content. Do NOT use a popover/card background.
- `content` prop is `string` only — enforced at the TypeScript type level. JSX is not accepted. If a consumer passes JSX, TypeScript will error.
- `disabled={true}` renders ONLY the children — no wrapper element, no portal, no ARIA changes.
- `Tooltip.Trigger` uses `asChild` — the trigger element must be a single focusable element (`<button>`, `<a>`, etc.).
- `TooltipProvider` must wrap the app or subtree — document clearly in JSDoc and stories.

---

## Accessibility

- Radix `Tooltip` renders the content with `role="tooltip"` and assigns `aria-describedby` on the trigger pointing to the tooltip content id.
- Tooltip appears on hover AND keyboard focus — never on focus alone without hover (Radix handles both).
- `content` is always a string — screen readers read it via `aria-describedby`.
- `disableHoverableContent={true}` prevents the tooltip from staying open when the pointer moves from trigger to tooltip — correct for text-only tooltips.
- Tooltip must NOT contain interactive content — this is a strict accessibility rule. If interaction is needed, use `Popover`.
- Do NOT use `Tooltip` as the only means of conveying information that is needed to complete a task — it is supplementary.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders children as the trigger
- does NOT render tooltip content until hovered/focused
- forwards className to content panel

// Content visibility
- tooltip content appears on hover (userEvent.hover)
- tooltip content appears on keyboard focus (Tab to trigger)
- tooltip content disappears on mouse leave
- tooltip content disappears on blur
- tooltip content has role="tooltip"
- trigger has aria-describedby pointing to tooltip id

// Content text
- content prop text is rendered in the tooltip
- long content wraps (max-width applied)

// Disabled
- when disabled={true}, tooltip does not appear on hover
- when disabled={true}, no portal rendered
- when disabled={true}, children rendered as-is

// Side prop
- side="bottom" applied to Radix Content
- side="left" applied to Radix Content
- side="right" applied to Radix Content

// Align prop
- align="start" applied
- align="end" applied

// Arrow
- Arrow element rendered inside content

// prefers-reduced-motion
- animation class still applied (motion preference handled in CSS)

// axe
- axe: passes when tooltip closed
- axe: passes when tooltip open (hover)
- axe: passes when disabled={true}
- axe: passes for side="bottom"
- axe: passes for side="left"
```

---

## Stories — `Tooltip.stories.tsx`

**Important:** All stories must be wrapped in `<TooltipProvider>`. Add a global decorator in the story file:

```tsx
const meta: Meta<typeof Tooltip> = {
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};
```

Named exports required:

- `Default` — side="top", button trigger, short text
- `Sides` — all 4 sides (top/right/bottom/left), 4 buttons in a grid
- `Alignment` — align start/center/end at side="bottom"
- `LongContent` — content with 60+ chars that wraps
- `Disabled` — disabled={true}, no tooltip
- `OnIconButton` — tooltip on an IconButton (real use case)
- `OnDisabledButton` — button with disabled attr inside Tooltip — note in story that this requires a wrapper span because disabled buttons don't fire pointer events

`HoverToShow` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button');
  await userEvent.hover(trigger);
  const tooltip = await within(document.body).findByRole('tooltip');
  await expect(tooltip).toBeInTheDocument();
};
```

`FocusToShow` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button');
  await userEvent.tab();
  await expect(trigger).toHaveFocus();
  const tooltip = await within(document.body).findByRole('tooltip');
  await expect(tooltip).toBeInTheDocument();
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
- [ ] `content` prop is typed as `string` — TypeScript error if JSX passed
- [ ] `disabled={true}` renders only children — no wrapper
- [ ] `pointer-events: none` on content panel
- [ ] `TooltipProvider` usage documented in all stories
- [ ] `border-radius: var(--dds-radius-none)`
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] Both `Tooltip` and `TooltipProvider` exported from `packages/components/src/index.ts`

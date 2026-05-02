# ContextMenu · node scaffolding.mjs ContextMenu

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/Button/
packages/components/src/components/
```

- Check whether a `Dropdown` component exists. `ContextMenu` and `Dropdown` share near-identical item anatomy (label, icon, shortcut, separator, sub-menu). Do not duplicate SCSS token mappings — read how `Dropdown` handles item states and follow the same token choices. Do NOT import or re-export from `Dropdown`; keep `ContextMenu` a fully independent component.
- Radix primitive: `@radix-ui/react-context-menu` — use it entirely. Do not build a custom positioning or event-detection layer.

---

## Scaffold location

```
packages/components/src/components/ContextMenu/
  ContextMenu.tsx
  ContextMenu.module.scss
  ContextMenu.test.tsx
  ContextMenu.stories.tsx
  index.ts
```

---

## Purpose

`ContextMenu` is a right-click (or long-press) triggered floating menu that appears at the pointer position. It provides contextual actions for the element the user interacted with — file operations, row actions, canvas tools, code editor shortcuts.

**ContextMenu vs Dropdown:**

- `Dropdown`: opened by clicking a specific trigger button; positioned relative to that button.
- `ContextMenu`: opened by right-clicking any target area; positioned at the pointer coordinates. The trigger is an invisible zone wrapping the target content, not a visible button.

---

## Exports from `index.ts`

```ts
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuShortcut,
  ContextMenuItemIndicator,
};
export type {
  ContextMenuContentProps,
  ContextMenuItemProps,
  ContextMenuCheckboxItemProps,
  ContextMenuRadioItemProps,
  ContextMenuSubTriggerProps,
  ContextMenuSubContentProps,
  ContextMenuLabelProps,
};
```

---

## Types

```ts
export interface ContextMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  // All Radix ContextMenu.Content props forwarded (sideOffset, alignOffset, etc.)
}

export interface ContextMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon; // optional leading icon — decorative, aria-hidden
  shortcut?: string; // e.g. "⌘K", "Ctrl+S" — rendered right-aligned, aria-hidden
  destructive?: boolean; // default: false — applies danger colour
  disabled?: boolean; // default: false
  inset?: boolean; // default: false — adds left padding when no icon, for alignment
  className?: string;
  children: React.ReactNode;
}

export interface ContextMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  shortcut?: string;
  inset?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface ContextMenuRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  shortcut?: string;
  inset?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface ContextMenuSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  inset?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface ContextMenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface ContextMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

---

## Architecture

All parts map 1-to-1 onto Radix `ContextMenu` primitives. DDS wraps each to apply SCSS module class names and expose the `destructive`, `icon`, `shortcut`, and `inset` conveniences.

```
ContextMenu          → Radix ContextMenu.Root
ContextMenuTrigger   → Radix ContextMenu.Trigger (asChild — wraps consumer content)
ContextMenuContent   → Radix ContextMenu.Content  (portal, floating panel)
ContextMenuItem      → Radix ContextMenu.Item
ContextMenuCheckboxItem → Radix ContextMenu.CheckboxItem
ContextMenuRadioGroup   → Radix ContextMenu.RadioGroup
ContextMenuRadioItem    → Radix ContextMenu.RadioItem
ContextMenuSeparator    → Radix ContextMenu.Separator
ContextMenuLabel        → Radix ContextMenu.Label
ContextMenuSub          → Radix ContextMenu.Sub
ContextMenuSubTrigger   → Radix ContextMenu.SubTrigger
ContextMenuSubContent   → Radix ContextMenu.SubContent
ContextMenuShortcut     → plain <span> — decorative, aria-hidden
ContextMenuItemIndicator → Radix ContextMenu.ItemIndicator
```

---

## Component structure

```tsx
// ContextMenu.tsx
import * as RadixContextMenu from '@radix-ui/react-context-menu';
import { ChevronRight, Check, Minus } from 'lucide-react';
import clsx from 'clsx';
import styles from './ContextMenu.module.scss';

// Root — thin pass-through, no props transformation needed
export const ContextMenu = RadixContextMenu.Root;
ContextMenu.displayName = 'ContextMenu';

// Trigger — asChild so consumer's element IS the right-click zone
export const ContextMenuTrigger = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixContextMenu.Trigger
    ref={ref}
    asChild
    className={clsx(styles.trigger, className)}
    {...props}
  >
    {children}
  </RadixContextMenu.Trigger>
));
ContextMenuTrigger.displayName = 'ContextMenuTrigger';

// Content — the floating menu panel
export const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  ({ className, ...props }, ref) => (
    <RadixContextMenu.Portal>
      <RadixContextMenu.Content ref={ref} className={clsx(styles.content, className)} {...props} />
    </RadixContextMenu.Portal>
  )
);
ContextMenuContent.displayName = 'ContextMenuContent';

// Item — standard action row
export const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(
  (
    { icon: Icon, shortcut, destructive = false, inset = false, className, children, ...props },
    ref
  ) => (
    <RadixContextMenu.Item
      ref={ref}
      className={clsx(
        styles.item,
        destructive && styles.itemDestructive,
        inset && styles.itemInset,
        className
      )}
      {...props}
    >
      {Icon && <Icon className={styles.itemIcon} aria-hidden="true" />}
      <span className={styles.itemLabel}>{children}</span>
      {shortcut && (
        <span className={styles.shortcut} aria-hidden="true">
          {shortcut}
        </span>
      )}
    </RadixContextMenu.Item>
  )
);
ContextMenuItem.displayName = 'ContextMenuItem';

// CheckboxItem — item with a checkmark indicator
export const ContextMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  ContextMenuCheckboxItemProps
>(({ checked, onCheckedChange, shortcut, inset = false, className, children, ...props }, ref) => (
  <RadixContextMenu.CheckboxItem
    ref={ref}
    checked={checked}
    onCheckedChange={onCheckedChange}
    className={clsx(styles.item, styles.itemCheckbox, inset && styles.itemInset, className)}
    {...props}
  >
    <span className={styles.itemIndicatorSlot}>
      <RadixContextMenu.ItemIndicator>
        {checked === 'indeterminate' ? (
          <Minus className={styles.indicatorIcon} aria-hidden="true" />
        ) : (
          <Check className={styles.indicatorIcon} aria-hidden="true" />
        )}
      </RadixContextMenu.ItemIndicator>
    </span>
    <span className={styles.itemLabel}>{children}</span>
    {shortcut && (
      <span className={styles.shortcut} aria-hidden="true">
        {shortcut}
      </span>
    )}
  </RadixContextMenu.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = 'ContextMenuCheckboxItem';

// RadioGroup — pass-through
export const ContextMenuRadioGroup = RadixContextMenu.RadioGroup;
ContextMenuRadioGroup.displayName = 'ContextMenuRadioGroup';

// RadioItem — item with a dot indicator
export const ContextMenuRadioItem = React.forwardRef<HTMLDivElement, ContextMenuRadioItemProps>(
  ({ value, shortcut, inset = false, className, children, ...props }, ref) => (
    <RadixContextMenu.RadioItem
      ref={ref}
      value={value}
      className={clsx(styles.item, styles.itemRadio, inset && styles.itemInset, className)}
      {...props}
    >
      <span className={styles.itemIndicatorSlot}>
        <RadixContextMenu.ItemIndicator>
          <span className={styles.radioDot} aria-hidden="true" />
        </RadixContextMenu.ItemIndicator>
      </span>
      <span className={styles.itemLabel}>{children}</span>
      {shortcut && (
        <span className={styles.shortcut} aria-hidden="true">
          {shortcut}
        </span>
      )}
    </RadixContextMenu.RadioItem>
  )
);
ContextMenuRadioItem.displayName = 'ContextMenuRadioItem';

// Separator
export const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <RadixContextMenu.Separator ref={ref} className={clsx(styles.separator, className)} {...props} />
));
ContextMenuSeparator.displayName = 'ContextMenuSeparator';

// Label — non-interactive group heading
export const ContextMenuLabel = React.forwardRef<HTMLDivElement, ContextMenuLabelProps>(
  ({ inset = false, className, children, ...props }, ref) => (
    <RadixContextMenu.Label
      ref={ref}
      className={clsx(styles.label, inset && styles.labelInset, className)}
      {...props}
    >
      {children}
    </RadixContextMenu.Label>
  )
);
ContextMenuLabel.displayName = 'ContextMenuLabel';

// Sub — compound sub-menu root
export const ContextMenuSub = RadixContextMenu.Sub;
ContextMenuSub.displayName = 'ContextMenuSub';

// SubTrigger — item that opens a nested sub-menu
export const ContextMenuSubTrigger = React.forwardRef<HTMLDivElement, ContextMenuSubTriggerProps>(
  ({ icon: Icon, inset = false, className, children, ...props }, ref) => (
    <RadixContextMenu.SubTrigger
      ref={ref}
      className={clsx(styles.item, styles.subTrigger, inset && styles.itemInset, className)}
      {...props}
    >
      {Icon && <Icon className={styles.itemIcon} aria-hidden="true" />}
      <span className={styles.itemLabel}>{children}</span>
      <ChevronRight className={styles.subTriggerChevron} aria-hidden="true" />
    </RadixContextMenu.SubTrigger>
  )
);
ContextMenuSubTrigger.displayName = 'ContextMenuSubTrigger';

// SubContent — nested menu panel
export const ContextMenuSubContent = React.forwardRef<HTMLDivElement, ContextMenuSubContentProps>(
  ({ className, ...props }, ref) => (
    <RadixContextMenu.Portal>
      <RadixContextMenu.SubContent
        ref={ref}
        className={clsx(styles.content, className)}
        {...props}
      />
    </RadixContextMenu.Portal>
  )
);
ContextMenuSubContent.displayName = 'ContextMenuSubContent';

// Shortcut — decorative key hint span
export const ContextMenuShortcut = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={clsx(styles.shortcut, className)} aria-hidden="true" {...props}>
    {children}
  </span>
);
ContextMenuShortcut.displayName = 'ContextMenuShortcut';

// ItemIndicator — re-exported for consumers who want raw indicator control
export const ContextMenuItemIndicator = RadixContextMenu.ItemIndicator;
ContextMenuItemIndicator.displayName = 'ContextMenuItemIndicator';
```

---

## SCSS — ContextMenu.module.scss

```scss
@use '../../../styles/mixins' as *;

// ─── Trigger ─────────────────────────────────────────────────────────────────

// ContextMenuTrigger wraps consumer content with asChild — no visual styles.
// Only ensure it does not break layout:
.trigger {
  display: contents;
}

// ─── Content (floating panel) ────────────────────────────────────────────────

.content {
  min-width: 200px;
  max-width: 320px;
  padding: var(--dds-space-1) 0;
  z-index: 60;

  background-color: var(--dds-color-bg-popover);
  border: 1px solid var(--dds-color-border-default);
  border-radius: var(--dds-radius-none);
  box-shadow: var(--dds-shadow-sm);

  outline: none;

  &[data-state='open'] {
    animation: contentIn var(--dds-duration-fast) var(--dds-ease-out);
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
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes contentOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.97);
  }
}

// ─── Item (shared by Item, CheckboxItem, RadioItem, SubTrigger) ───────────────

.item {
  display: flex;
  align-items: center;
  gap: var(--dds-space-2);
  padding: var(--dds-space-1-5) var(--dds-space-3);
  min-height: 32px;

  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  line-height: var(--dds-line-height-snug);
  color: var(--dds-color-text-default);

  cursor: default;
  user-select: none;
  outline: none;
  border-radius: var(--dds-radius-none);

  // Radix adds data-highlighted when keyboard or pointer focused
  &[data-highlighted] {
    background-color: var(--dds-color-action-ghost-hover);
    color: var(--dds-color-text-default);
  }

  &[data-disabled] {
    opacity: 0.4;
    pointer-events: none;
  }
}

// Destructive variant — danger colour, overrides on highlight
.itemDestructive {
  color: var(--dds-color-text-danger);

  &[data-highlighted] {
    background-color: oklch(from var(--dds-color-action-destructive) l c h / 0.08);
    color: var(--dds-color-action-destructive);
  }
}

// Inset — left padding for alignment when no icon/indicator present
.itemInset {
  padding-left: calc(var(--dds-space-3) + var(--dds-icon-size-md) + var(--dds-space-2));
}

// Checkbox and radio items use the indicator slot for leading alignment
.itemCheckbox,
.itemRadio {
  padding-left: var(--dds-space-1-5);
}

// ─── Item icon ────────────────────────────────────────────────────────────────

.itemIcon {
  width: var(--dds-icon-size-md);
  height: var(--dds-icon-size-md);
  flex-shrink: 0;
  color: var(--dds-color-text-muted);

  .item[data-highlighted] & {
    color: var(--dds-color-text-default);
  }

  .itemDestructive[data-highlighted] & {
    color: var(--dds-color-action-destructive);
  }
}

// ─── Item label ───────────────────────────────────────────────────────────────

.itemLabel {
  flex: 1 1 0;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// ─── Indicator slot (checkbox / radio leading space) ─────────────────────────

.itemIndicatorSlot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--dds-icon-size-md);
  height: var(--dds-icon-size-md);
  flex-shrink: 0;
}

.indicatorIcon {
  width: var(--dds-icon-size-md);
  height: var(--dds-icon-size-md);
  color: var(--dds-color-action-primary);
}

// Radio dot — small filled circle indicator
.radioDot {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: var(--dds-radius-full); // documented exception — indicator dot
  background-color: var(--dds-color-action-primary);
}

// ─── Shortcut ────────────────────────────────────────────────────────────────

.shortcut {
  margin-left: auto;
  font-family: var(--dds-font-mono);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-text-muted);
  letter-spacing: var(--dds-tracking-wide);
  flex-shrink: 0;

  .item[data-highlighted] & {
    color: var(--dds-color-text-muted); // stays muted even on highlight
  }
}

// ─── Sub-menu trigger chevron ─────────────────────────────────────────────────

.subTrigger {
  // SubTrigger[data-state='open'] indicates the sub-menu is open
  &[data-state='open'] {
    background-color: var(--dds-color-action-ghost-hover);
  }
}

.subTriggerChevron {
  width: var(--dds-icon-size-md);
  height: var(--dds-icon-size-md);
  margin-left: auto;
  color: var(--dds-color-text-muted);
  flex-shrink: 0;
}

// ─── Separator ────────────────────────────────────────────────────────────────

.separator {
  height: 1px;
  margin: var(--dds-space-1) 0;
  background-color: var(--dds-color-border-default);
}

// ─── Label (non-interactive group heading) ────────────────────────────────────

.label {
  padding: var(--dds-space-1-5) var(--dds-space-3);
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--dds-tracking-wider);
  user-select: none;
}

.labelInset {
  padding-left: calc(var(--dds-space-3) + var(--dds-icon-size-md) + var(--dds-space-2));
}
```

---

## Accessibility

- Radix `ContextMenu` fully manages ARIA — `role="menu"` on `Content`, `role="menuitem"` on `Item`, `role="menuitemcheckbox"` on `CheckboxItem`, `role="menuitemradio"` on `RadioItem`, `role="separator"` on `Separator`.
- `ContextMenuTrigger` uses `asChild` — the consumer's element becomes the right-click zone. No ARIA role is added to the trigger; it remains whatever the underlying element is.
- Keyboard shortcut strings (e.g. `⌘K`) are rendered with `aria-hidden="true"` — they are visual hints only. The actual keyboard shortcut must be implemented by the consumer's `onKeyDown` handlers; the shortcut span does NOT wire up keyboard listeners.
- `ChevronRight` on SubTrigger is `aria-hidden="true"` — Radix handles announcing the presence of a sub-menu.
- Check and Minus icons inside `ItemIndicator` are `aria-hidden="true"` — Radix announces checked state via `aria-checked` on the menuitemcheckbox.
- Disabled items: Radix sets `aria-disabled="true"` on items with `disabled` prop. Do not use the native `disabled` attribute on div-based menu items.
- Focus management: Radix traps keyboard navigation inside the open menu. Arrow keys navigate items. Escape closes the menu and returns focus to the document (not to a specific trigger, since right-click has no standard focus target).

### Keyboard interactions

| Key               | Behaviour                                                              |
| ----------------- | ---------------------------------------------------------------------- |
| `ArrowDown`       | Moves focus to next item (skips disabled)                              |
| `ArrowUp`         | Moves focus to previous item                                           |
| `ArrowRight`      | Opens sub-menu if focused item is a SubTrigger                         |
| `ArrowLeft`       | Closes sub-menu and returns to parent                                  |
| `Enter` / `Space` | Activates the focused item                                             |
| `Escape`          | Closes the menu (and sub-menu if open); focus returns to document      |
| Printable chars   | Typeahead — jumps to first item starting with that character           |
| `Tab`             | Closes the menu (standard menu pattern — Tab does not navigate inside) |

---

## TDD — write ALL tests before implementing

Run scaffolding first: `node scaffolding.mjs ContextMenu`

```
// Rendering
- does not render menu content by default
- renders menu content when trigger is right-clicked
- renders ContextMenuLabel text
- renders ContextMenuSeparator
- renders ContextMenuItem with text
- renders ContextMenuItem with icon
- renders ContextMenuItem with shortcut text
- shortcut span has aria-hidden="true"
- item icon has aria-hidden="true"
- renders ContextMenuCheckboxItem with check indicator when checked
- renders ContextMenuCheckboxItem with minus indicator when indeterminate
- renders ContextMenuRadioGroup with ContextMenuRadioItem
- selected radio item shows dot indicator
- renders ContextMenuSub with ContextMenuSubTrigger
- ChevronRight on SubTrigger has aria-hidden="true"
- forwards ref to ContextMenuContent HTMLDivElement
- forwards className to ContextMenuContent

// Open / close
- opens on right-click (contextmenu event) on trigger zone
- closes on Escape key
- closes when item is selected
- closes when clicking outside

// Items
- calls onSelect when item is clicked
- does not call onSelect when disabled item is clicked
- disabled item has aria-disabled="true"
- destructive item applies destructive class
- inset item applies inset class

// CheckboxItem
- calls onCheckedChange with true when unchecked item clicked
- calls onCheckedChange with false when checked item clicked
- has role="menuitemcheckbox"
- has aria-checked="true" when checked
- has aria-checked="false" when unchecked
- has aria-checked="mixed" when indeterminate

// RadioItem
- has role="menuitemradio"
- has aria-checked="true" on selected item
- has aria-checked="false" on unselected items
- selecting radio item calls onValueChange on RadioGroup

// Sub-menu
- SubTrigger ArrowRight opens sub-menu
- sub-menu content renders when SubTrigger opened
- ArrowLeft from sub-menu closes it and returns to parent

// Keyboard navigation
- ArrowDown moves to next item
- ArrowUp moves to previous item
- Enter activates focused item
- Tab closes the menu

// Accessibility (ARIA — Radix managed)
- ContextMenuContent has role="menu"
- ContextMenuItem has role="menuitem"
- ContextMenuLabel has role="none" (or presentation — check Radix output)
- ContextMenuSeparator has role="separator"

// axe
- axe: passes when menu is closed
- axe: passes when menu is open with standard items
- axe: passes with checkbox items (checked and unchecked)
- axe: passes with radio group
- axe: passes with sub-menu open
- axe: passes with destructive item
- axe: passes with disabled item
- axe: passes with label and separator groupings
```

---

## Stories — `ContextMenu.stories.tsx`

Title: `Core Components/ContextMenu`

A story canvas element to right-click on must be clearly labelled. Use a bordered target area `<div>` with the text "Right-click here" as the `ContextMenuTrigger` child in all stories.

Named exports required:

- `Default` — standard items (Open, Rename, Duplicate, separator, Delete destructive). Trigger area: full-width bordered div.
- `WithIcons` — each item has an icon (`FolderOpen`, `Pencil`, `Copy`, `Trash2` for destructive).
- `WithShortcuts` — each item has a keyboard shortcut string (e.g. `⌘O`, `F2`, `⌘D`, `Del`).
- `WithCheckboxItems` — a `ContextMenuLabel` "View options" followed by three `ContextMenuCheckboxItem` entries managed with `useState`. Demonstrates toggling.
- `WithRadioGroup` — a `ContextMenuLabel` "Sort by" followed by a `ContextMenuRadioGroup` with three `ContextMenuRadioItem` entries. Selected value managed with `useState`.
- `WithSubMenu` — one item opens a sub-menu (`ContextMenuSub`) with three nested items.
- `MixedContent` — combines labels, separators, checkboxes, radio group, standard items, and a sub-menu in a single realistic menu. Uses an 80px tall bordered trigger zone.
- `DisabledItems` — several items, two of which are `disabled`.
- `Inset` — items without icons but with `inset` prop demonstrating alignment consistency.

`OpenAndNavigate` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const triggerZone = within(canvasElement).getByText(/right-click here/i);
  await userEvent.pointer([{ target: triggerZone, keys: '[MouseRight]' }]);
  const menu = within(document.body).getByRole('menu');
  await expect(menu).toBeVisible();
  await userEvent.keyboard('{ArrowDown}');
  await userEvent.keyboard('{Enter}');
  await expect(within(document.body).queryByRole('menu')).not.toBeInTheDocument();
};
```

`EscapeCloses` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const triggerZone = within(canvasElement).getByText(/right-click here/i);
  await userEvent.pointer([{ target: triggerZone, keys: '[MouseRight]' }]);
  await expect(within(document.body).getByRole('menu')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect(within(document.body).queryByRole('menu')).not.toBeInTheDocument();
};
```

Use `autodocs`. Storybook group: `Core Components/ContextMenu`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants and states
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] Keyboard navigation (Arrow keys, Enter, Escape, Tab) verified in tests and play() stories
- [ ] Sub-menu opens on ArrowRight, closes on ArrowLeft — verified in tests
- [ ] Checkbox items show correct indicator (check / minus / empty) for all states
- [ ] Radio items show dot indicator only on selected item
- [ ] Shortcut spans are aria-hidden
- [ ] Icons are aria-hidden
- [ ] Destructive item uses danger colour tokens — no hardcoded values
- [ ] `border-radius: var(--dds-radius-none)` on content and all items — exception only for radio dot
- [ ] `radioDot` uses `var(--dds-radius-full)` — documented exception for indicator dots
- [ ] No Tailwind. No hardcoded color or spacing values in SCSS.
- [ ] Exported from `packages/components/src/index.ts`

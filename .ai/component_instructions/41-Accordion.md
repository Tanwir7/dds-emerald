# Accordion · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Accordion` component.
- Scaffold: `packages/components/src/components/Accordion/`
- Radix primitive: `@radix-ui/react-accordion`

---

## Purpose

`Accordion` renders a stacked list of collapsible sections, each with a header trigger and an expandable panel. It supports `type="single"` (only one item open at a time) and `type="multiple"` (multiple items open simultaneously).

---

## Exports from `index.ts`

```ts
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
export type { AccordionProps, AccordionItemProps, AccordionTriggerProps, AccordionContentProps };
```

---

## Props

### `Accordion` (Radix `Accordion.Root`):

```ts
type?: 'single' | 'multiple'   // default: 'single'
// When type="single":
value?: string
defaultValue?: string
onValueChange?: (value: string) => void
collapsible?: boolean          // default: true — allows closing the open item in single mode
// When type="multiple":
// value?: string[]
// defaultValue?: string[]
// onValueChange?: (value: string[]) => void
variant?: 'default' | 'flush'  // default: 'default'
className?: string
children: React.ReactNode
```

**Implementation note:** TypeScript overloads — use a union type or two overloaded signatures for the `single`/`multiple` cases. Radix's types already handle this; match them.

### `AccordionItem` (Radix `Accordion.Item`):

```ts
value: string       // required — unique identifier
disabled?: boolean
className?: string
children: React.ReactNode
```

### `AccordionTrigger` (Radix `Accordion.Trigger`):

```ts
className?: string
children: React.ReactNode
```

### `AccordionContent` (Radix `Accordion.Content`):

```ts
className?: string
children: React.ReactNode
```

Forward refs on all sub-components.

---

## Variants

### `variant="default"` — bordered card style

Each item has a full border. Items are visually separated with gap between them.

### `variant="flush"` — borderless divider style

No outer border. Only a bottom divider between items. Flush with the container edges. Used inside cards or sidebars.

---

## Structure

```tsx
// Accordion.tsx
<Accordion.Root
  type={type}
  collapsible={collapsible}
  value={value}
  defaultValue={defaultValue}
  onValueChange={onValueChange}
  className={clsx(styles.root, styles[`variant${capitalise(variant)}`], className)}
  ref={ref}
>
  {children}
</Accordion.Root>

// AccordionItem.tsx
<Accordion.Item
  value={value}
  disabled={disabled}
  className={clsx(styles.item, className)}
  ref={ref}
>
  {children}
</Accordion.Item>

// AccordionTrigger.tsx
<Accordion.Header className={styles.header}>
  <Accordion.Trigger className={clsx(styles.trigger, className)} ref={ref}>
    {children}
    <ChevronDownIcon className={styles.chevron} aria-hidden="true" />
  </Accordion.Trigger>
</Accordion.Header>

// AccordionContent.tsx
<Accordion.Content className={clsx(styles.content, className)} ref={ref}>
  <div className={styles.contentInner}>
    {children}
  </div>
</Accordion.Content>
```

---

## Styles — `Accordion.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

### Root

`.root`:

- `display: flex; flex-direction: column`
- `width: 100%`

`.variantDefault .item`:

- `border: 1px solid var(--dds-color-border-default)`
- `.root` → `gap: var(--dds-space-1)` — small gap between bordered items

`.variantFlush .item`:

- `border: none`
- `border-bottom: 1px solid var(--dds-color-border-default)`
- `&:last-child` → `border-bottom: none`
- `.root` → `gap: 0`

### Item

`.item`:

- `border-radius: var(--dds-radius-none)`
- `&[data-disabled]` → `opacity: 0.5`

### Trigger

`.header`:

- `margin: 0` — reset browser `<h3>` margin (Radix wraps trigger in `<h3>`)

`.trigger`:

- `display: flex; align-items: center; justify-content: space-between`
- `width: 100%`
- `padding: var(--dds-space-4) var(--dds-space-4)` — default variant
- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)`
- `font-weight: var(--dds-font-weight-medium)`
- `color: var(--dds-color-text-default)`
- `background: transparent`
- `border: none`
- `cursor: pointer`
- `text-align: left`
- `outline: 3px solid transparent`
- `outline-offset: -3px` — inset focus ring (avoids clipping at border)
- `transition: background-color, outline-color var(--dds-duration-fast) var(--dds-ease-standard)`
- `&:hover:not([data-disabled])` → `background-color: var(--dds-color-bg-subtle)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`
- `&[data-state="open"]` → `background-color: var(--dds-color-bg-subtle)` (optional, subtle open indicator)

Flush variant trigger padding:

- `.variantFlush .trigger` → `padding: var(--dds-space-3) 0` — no horizontal padding

### Chevron

`.chevron`:

- `flex-shrink: 0`
- `width: var(--dds-icon-size-sm); height: var(--dds-icon-size-sm)`
- `color: var(--dds-color-text-muted)`
- `transition: transform var(--dds-duration-fast) var(--dds-ease-standard)`
- `[data-state="open"] &` → `transform: rotate(180deg)`

### Content

`.content`:

- Radix animates `height` via `data-state`:

  ```scss
  &[data-state='open'] {
    animation: accordionOpen var(--dds-duration-fast) var(--dds-ease-out);
  }
  &[data-state='closed'] {
    animation: accordionClose var(--dds-duration-fast) var(--dds-ease-standard);
  }

  @keyframes accordionOpen {
    from {
      height: 0;
      opacity: 0;
    }
    to {
      height: var(--radix-accordion-content-height);
      opacity: 1;
    }
  }
  @keyframes accordionClose {
    from {
      height: var(--radix-accordion-content-height);
      opacity: 1;
    }
    to {
      height: 0;
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    &[data-state='open'],
    &[data-state='closed'] {
      animation: none;
    }
  }
  ```

- `overflow: hidden`

`.contentInner`:

- `padding: 0 var(--dds-space-4) var(--dds-space-4)` — default variant
- `.variantFlush .contentInner` → `padding: 0 0 var(--dds-space-3)` — no horizontal padding

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on all parts.
- `outline-offset: -3px` on the trigger — inset focus ring ensures it's visible without clipping at the item border.
- `--radix-accordion-content-height` is a CSS var injected by Radix on the Content element — use it for the height animation. Do NOT use `max-height` hacks.
- `Accordion.Header` renders an `<h3>` by default (Radix). This is correct for most use cases but semantic heading level should be considered by the consumer. Do NOT suppress the heading role.
- `type="single"` with `collapsible={true}` allows the open item to be clicked closed. Default to `collapsible={true}`.

---

## Accessibility

- Radix `Accordion` handles `role="button"` with `aria-expanded` and `aria-controls` on triggers.
- Each `AccordionContent` has `role="region"` and `aria-labelledby` pointing to its trigger (Radix manages this).
- `AccordionHeader` renders an `<h3>` — correct for landmark navigation.
- `disabled` on `AccordionItem` maps to `data-disabled` — Radix removes the trigger from interaction.
- Keyboard: Space/Enter toggles, Arrow keys move focus between headers.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders AccordionItem with correct structure
- trigger renders with role="button"
- trigger has aria-expanded="false" by default
- content is hidden by default (data-state="closed")
- forwards className to each sub-component
- forwards ref to Accordion.Root, Item, Trigger, Content

// Single type (default)
- clicking trigger expands the panel (aria-expanded="true")
- clicking trigger again collapses it (collapsible=true)
- opening a second item closes the first (single type)
- collapsible=false prevents re-collapsing the open item

// Multiple type
- multiple items can be open simultaneously when type="multiple"
- opening one item does not close another in multiple type

// Chevron
- chevron rotates 180deg when item is open

// Content
- AccordionContent is visible when item is open
- AccordionContent is hidden when item is closed
- content renders children when open

// Disabled
- disabled AccordionItem has data-disabled on trigger
- disabled trigger cannot be opened by click
- disabled trigger is not keyboard activatable

// Variants
- applies .variantDefault class by default
- applies .variantFlush class when variant="flush"

// Keyboard
- Tab focuses first trigger
- Space toggles focused trigger
- Enter toggles focused trigger
- ArrowDown moves focus to next trigger
- ArrowUp moves focus to previous trigger
- Home moves focus to first trigger
- End moves focus to last trigger

// Axe
- axe: passes for default single accordion (all closed)
- axe: passes with one item open
- axe: passes for type="multiple"
- axe: passes for variant="flush"
- axe: passes with disabled item
```

---

## Stories — `Accordion.stories.tsx`

Named exports required:

- `Default` — single type, 3 items, all closed
- `OneOpen` — one item defaultOpen
- `Multiple` — type="multiple"
- `NotCollapsible` — collapsible={false}
- `Flush` — variant="flush"
- `Disabled` — one item disabled
- `WithRichContent` — items containing form fields, paragraphs, lists
- `ControlledSingle` — useState-controlled value

`OpenAndClose` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const triggers = within(canvasElement).getAllByRole('button');
  await expect(triggers[0]).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(triggers[0]);
  await expect(triggers[0]).toHaveAttribute('aria-expanded', 'true');
  await userEvent.click(triggers[0]);
  await expect(triggers[0]).toHaveAttribute('aria-expanded', 'false');
};
```

`KeyboardNavigation` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const triggers = within(canvasElement).getAllByRole('button');
  await userEvent.tab();
  await expect(triggers[0]).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect(triggers[1]).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(triggers[1]).toHaveAttribute('aria-expanded', 'true');
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
- [ ] Height animation uses `--radix-accordion-content-height` — no max-height hacks
- [ ] `prefers-reduced-motion` disables animation
- [ ] `border-radius: var(--dds-radius-none)` on all parts
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] All 4 sub-components exported from `packages/components/src/index.ts`

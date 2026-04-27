# Disclosure · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Disclosure` component.
- Scaffold: `packages/components/src/components/Disclosure/`
- Radix primitive: `@radix-ui/react-collapsible`

---

## Purpose

`Disclosure` is a single collapsible panel: one trigger toggles one content region. It is the atomic form of Accordion — use it when you need a single expand/collapse, not a stacked list. Common uses: "Show advanced options", "Read more", FAQ single item, inline code toggle.

**When to use Disclosure vs Accordion:**

- `Disclosure` — standalone single toggle, often mid-content, tight layout.
- `Accordion` — structured list of labelled sections, always as a group.

---

## Exports from `index.ts`

```ts
export { Disclosure, DisclosureTrigger, DisclosureContent };
export type { DisclosureProps };
```

---

## Props

### `Disclosure` (Radix `Collapsible.Root`):

```ts
open?: boolean                        // controlled
defaultOpen?: boolean                 // uncontrolled, default: false
onOpenChange?: (open: boolean) => void
disabled?: boolean                    // default: false
className?: string
children: React.ReactNode
```

### `DisclosureTrigger` (Radix `Collapsible.Trigger`):

```ts
showChevron?: boolean   // default: true — appends animated chevron
size?: 'sm' | 'md'     // default: 'md' — controls font-size and padding
className?: string
children: React.ReactNode
```

### `DisclosureContent` (Radix `Collapsible.Content`):

```ts
className?: string
children: React.ReactNode
```

Forward refs on all three sub-components.

---

## Structure

```tsx
// Disclosure.tsx
<Collapsible.Root
  open={open}
  defaultOpen={defaultOpen}
  onOpenChange={onOpenChange}
  disabled={disabled}
  className={clsx(styles.root, className)}
  ref={ref}
>
  {children}
</Collapsible.Root>

// DisclosureTrigger.tsx
<Collapsible.Trigger
  className={clsx(styles.trigger, styles[size], className)}
  ref={ref}
>
  <span className={styles.triggerContent}>{children}</span>
  {showChevron && (
    <ChevronDownIcon className={styles.chevron} aria-hidden="true" />
  )}
</Collapsible.Trigger>

// DisclosureContent.tsx
<Collapsible.Content
  className={clsx(styles.content, className)}
  ref={ref}
>
  <div className={styles.contentInner}>
    {children}
  </div>
</Collapsible.Content>
```

---

## Styles — `Disclosure.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

### Root

`.root`:

- `width: 100%`

`&[data-disabled]` → no pointer events on root

### Trigger

`.trigger`:

- `display: inline-flex`
- `align-items: center`
- `gap: var(--dds-space-1-5)`
- `background: transparent`
- `border: none`
- `cursor: pointer`
- `color: var(--dds-color-text-default)`
- `font-family: var(--dds-font-sans)`
- `font-weight: var(--dds-font-weight-medium)`
- `padding: var(--dds-space-1) 0` — minimal padding, inline feel
- `outline: 3px solid transparent`
- `outline-offset: 2px`
- `border-radius: var(--dds-radius-none)`
- `transition: color, outline-color var(--dds-duration-fast) var(--dds-ease-standard)`
- `&:hover:not([data-disabled])` → `color: var(--dds-color-action-primary)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`
- `&[data-disabled]` → `opacity: 0.5; cursor: not-allowed; pointer-events: none`

Size modifiers:

- `.sm` → `font-size: var(--dds-font-size-sm)`
- `.md` → `font-size: var(--dds-font-size-base)` (default)

`.triggerContent`:

- `flex: 1; text-align: left`

### Chevron

`.chevron`:

- `flex-shrink: 0`
- `width: var(--dds-icon-size-sm); height: var(--dds-icon-size-sm)`
- `color: var(--dds-color-text-muted)`
- `transition: transform var(--dds-duration-fast) var(--dds-ease-standard)`
- `[data-state="open"] &` → `transform: rotate(180deg)`

### Content

`.content`:

- Uses Radix `--radix-collapsible-content-height` for animation:

  ```scss
  &[data-state='open'] {
    animation: disclosureOpen var(--dds-duration-fast) var(--dds-ease-out);
  }
  &[data-state='closed'] {
    animation: disclosureClose var(--dds-duration-fast) var(--dds-ease-standard);
  }

  @keyframes disclosureOpen {
    from {
      height: 0;
      opacity: 0;
    }
    to {
      height: var(--radix-collapsible-content-height);
      opacity: 1;
    }
  }
  @keyframes disclosureClose {
    from {
      height: var(--radix-collapsible-content-height);
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

- `padding-top: var(--dds-space-2)`
- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)`
- `color: var(--dds-color-text-default)`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on trigger.
- `--radix-collapsible-content-height` — Radix CSS var for height animation. Never use `max-height`.
- `Disclosure` has no built-in border or card styling — it is a plain toggle. Use `Box` or a `Card` around it if a bordered container is needed.
- The trigger is `inline-flex` not `width: 100%` by default — it sizes to its content. Consumers can override with `className` if they need a full-width trigger.
- `disabled` on `Disclosure.Root` maps to `data-disabled` on all children (Radix propagation).

---

## Accessibility

- Radix `Collapsible` handles `aria-expanded` and `aria-controls` on the trigger, and `role="region"` is NOT added by Collapsible (unlike Accordion). This is correct — Disclosure is not necessarily a landmark.
- If the Disclosure content should be a landmark, the consumer should add `role="region"` and `aria-labelledby` manually.
- Keyboard: Space/Enter toggles (Radix built-in).
- `disabled` removes trigger from interaction.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders Collapsible.Root
- DisclosureTrigger renders as a button
- trigger has aria-expanded="false" by default
- trigger has aria-controls pointing to content id
- content has matching id
- content is hidden by default (data-state="closed")
- forwards className to each sub-component
- forwards ref to each Radix root element

// Open/close
- clicking trigger expands content (aria-expanded="true")
- clicking trigger again collapses content
- onOpenChange called with true on open
- onOpenChange called with false on close

// Controlled
- respects controlled open={true}
- respects controlled open={false}
- onOpenChange called when user clicks (controlled)

// Chevron
- chevron rendered by default (showChevron=true)
- chevron rotates 180deg when open
- chevron NOT rendered when showChevron={false}

// Sizes
- applies .md class by default
- applies .sm class when size="sm"

// Disabled
- trigger has data-disabled when disabled={true}
- click does not toggle when disabled

// Content
- children rendered inside content when open
- contentInner padding class applied

// Animation
- content has data-state="open" when open
- content has data-state="closed" when closed

// Keyboard
- Space toggles trigger
- Enter toggles trigger
- disabled trigger does not respond to Space/Enter

// Axe
- axe: passes when closed
- axe: passes when open
- axe: passes when disabled
- axe: passes with showChevron={false}
```

---

## Stories — `Disclosure.stories.tsx`

Named exports required:

- `Default` — closed, "Show advanced options" trigger
- `DefaultOpen` — defaultOpen={true}
- `NoChevron` — showChevron={false}, custom trigger text with own icon
- `SizeSmall` — size="sm"
- `Disabled`
- `Controlled` — useState open/close
- `ReadMore` — "Read more" pattern: truncated paragraph, Disclosure reveals the rest
- `InCard` — Disclosure inside a Card with border
- `AdvancedOptions` — form field, Disclosure hides secondary fields (practical example)
- `WithRichContent` — content contains a nested Stack with form fields

`ToggleOpen` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(trigger);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
};
```

`KeyboardToggle` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button');
  await userEvent.tab();
  await expect(trigger).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await userEvent.keyboard(' ');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
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
- [ ] Height animation uses `--radix-collapsible-content-height` — no max-height hacks
- [ ] `prefers-reduced-motion` disables animation
- [ ] `border-radius: var(--dds-radius-none)` on trigger
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] All 3 sub-components exported from `packages/components/src/index.ts`

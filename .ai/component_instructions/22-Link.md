# Link · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Link` component.
- Scaffold: `packages/components/src/components/Link/`
- Radix primitive: `@radix-ui/react-slot` (for `asChild` pattern)

---

## Purpose

`Link` is the standard typographic anchor for inline navigation. It renders a styled `<a>` by default, or delegates rendering to a child element (e.g. Next.js `<Link>`) via `asChild`. It is NOT a button — it must have an `href` or be wrapped around a router link.

---

## Props

```ts
variant?: 'default' | 'muted' | 'destructive'  // default: 'default'
size?: 'sm' | 'base' | 'lg'                    // default: 'base' — inherits from context if not set
underline?: 'always' | 'hover' | 'none'        // default: 'hover'
external?: boolean                              // default: false — adds target="_blank" rel="noopener noreferrer" + external icon
asChild?: boolean                               // default: false — Radix Slot passthrough for router links
className?: string
children: React.ReactNode
// All native <a> HTML attributes forwarded (href, target, rel, aria-*, etc.)
```

When `asChild={true}`, render via `@radix-ui/react-slot`'s `Slot` component and merge all props onto the child. Do not render `<a>` directly.

When `external={true}` AND `asChild={false}`:

- Set `target="_blank"` (unless consumer overrides)
- Set `rel="noopener noreferrer"` (unless consumer overrides)
- Append a small external link icon after the text (decorative, `aria-hidden="true"`)

Forward `ref` typed to `HTMLAnchorElement`. Spread all remaining HTML props onto `<a>` (or Slot).

---

## Styles — `Link.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: inline-flex`
- `align-items: center`
- `gap: var(--dds-space-1)` — for external icon
- `font-family: var(--dds-font-sans)`
- `font-size: inherit` — default: inherits from surrounding text
- `font-weight: var(--dds-font-weight-medium)`
- `line-height: inherit`
- `cursor: pointer`
- `outline: 3px solid transparent`
- `outline-offset: 2px`
- `transition: color var(--dds-duration-fast) var(--dds-ease-standard),
             outline-color var(--dds-duration-fast) var(--dds-ease-standard)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`

Variant modifiers:

- `.default`:
  - `color: var(--dds-color-action-primary)`
  - `&:hover` → `color: var(--dds-color-action-primary-hover)`
  - `&:visited` → `color: var(--dds-color-action-primary)` (keep brand colour, no purple visited state)
- `.muted`:
  - `color: var(--dds-color-text-muted)`
  - `&:hover` → `color: var(--dds-color-text-default)`
- `.destructive`:
  - `color: var(--dds-color-status-danger)`
  - `&:hover` → `color: var(--dds-color-action-destructive-hover)`

Underline modifiers:

- `.underlineAlways` → `text-decoration: underline; text-decoration-color: currentColor; text-underline-offset: 3px`
- `.underlineHover`:
  - `text-decoration: none`
  - `&:hover` → `text-decoration: underline; text-decoration-color: currentColor; text-underline-offset: 3px`
- `.underlineNone` → `text-decoration: none`

Size modifiers (only applied when size prop is explicitly set — otherwise `font-size: inherit`):

- `.sm` → `font-size: var(--dds-font-size-sm)`
- `.base` → `font-size: var(--dds-font-size-base)`
- `.lg` → `font-size: var(--dds-font-size-lg)`

`.externalIcon`:

- `display: inline-flex`
- `align-items: center`
- `width: var(--dds-icon-size-sm)`
- `height: var(--dds-icon-size-sm)`
- `flex-shrink: 0`

No `border-radius`. No hardcoded values. No Tailwind. No inline styles.

---

## External icon implementation

Render a small inline SVG (↗ or similar arrow-out-of-box) as the external icon. Do not use the `Icon` component (to avoid a coupling dependency at this atomic level). Embed the SVG directly:

```tsx
const ExternalIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={styles.externalIcon}
  >
    <path d="M2 10L10 2M10 2H5M10 2V7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
```

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` — focus ring outline only, no background radius.
- `font-size: inherit` by default — `Link` is an inline element and must scale with its surrounding text. Only apply a size class if the `size` prop is explicitly passed.
- `visited` colour must stay brand-coloured — do NOT allow browser-default purple visited state. Override `&:visited` explicitly.
- `external={true}` must never override an explicitly passed `target` or `rel` prop (consumer wins).
- `asChild={true}` is the correct pattern for Next.js `<Link>` — document this prominently in stories.

---

## Accessibility

- Native `<a>` carries `role="link"` implicitly — no extra ARIA needed.
- `external={true}` links open in a new tab — screen readers must be informed. Two acceptable approaches:
  1. Append visually hidden text `(opens in new tab)` — preferred.
  2. `aria-label` override on the link — consumer's responsibility.
  - This component uses approach 1: render a `<VisuallyHidden>` span (or equivalent) with `(opens in new tab)` when `external={true}` and `asChild={false}`.
- `href` is the consumer's responsibility — `Link` does not enforce it at the type level (to support `asChild` patterns), but a dev-mode warning should be logged if neither `href` nor `asChild` is provided.
- Focus ring: `outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5); outline-offset: 2px`
- Do not use `tabIndex={-1}` — links must always be keyboard-reachable.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders an <a> element by default
- renders children text
- forwards href to <a>
- forwards className to root element
- forwards ref to HTMLAnchorElement
- renders via Slot (not <a>) when asChild={true}

// Variants
- applies .default class by default
- applies .muted class when variant="muted"
- applies .destructive class when variant="destructive"

// Underline
- applies .underlineHover class by default
- applies .underlineAlways class when underline="always"
- applies .underlineNone class when underline="none"

// Size
- does NOT apply a size class when size prop is omitted
- applies .sm class when size="sm"
- applies .base class when size="base"
- applies .lg class when size="lg"

// External
- does NOT render external icon when external={false} (default)
- renders external icon SVG when external={true}
- external icon has aria-hidden="true"
- sets target="_blank" when external={true}
- sets rel="noopener noreferrer" when external={true}
- renders visually hidden "(opens in new tab)" text when external={true}
- does NOT override consumer-provided target prop when external={true}
- does NOT override consumer-provided rel prop when external={true}

// Forwarding
- forwards aria-label to <a>
- forwards aria-current to <a>
- forwards onClick to <a>
- forwards data-testid and arbitrary props

// Keyboard
- receives focus on Tab
- activates on Enter key
- activates on Space key (browser default for links — verify)

// Axe
- axe: passes for default (href provided)
- axe: passes for variant="muted"
- axe: passes for variant="destructive"
- axe: passes for external={true}
- axe: passes for underline="always"
- axe: passes for underline="none"
- axe: passes when used asChild with a mock router link
```

---

## Stories — `Link.stories.tsx`

Named exports required:

- `Default` — default variant, `href="#"`, short text
- `Variants` — default / muted / destructive stacked in a paragraph
- `UnderlineStyles` — always / hover / none side by side
- `Sizes` — sm / base / lg (explicit size prop)
- `InheritedSize` — Link inside `<p>`, `<h2>`, and `<small>` to show size inheritance
- `External` — `external={true}`, opens in new tab
- `AsChildNextLink` — demonstrates `asChild` pattern:
  ```tsx
  // In the story, simulate with a plain <a> child since Next.js Link is unavailable in Storybook
  <Link asChild>
    <a href="/dashboard">Dashboard</a>
  </Link>
  ```
  Include a note that in a real Next.js app this would be `<Link asChild><NextLink href="/dashboard">Dashboard</NextLink></Link>`.
- `InlineParagraph` — link embedded in a paragraph of body text
- `FocusVisible` with `play()`:
  ```ts
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    await userEvent.tab();
    await expect(link).toHaveFocus();
  };
  ```

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all variants and states
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] All variants represented in stories
- [ ] `external={true}` renders visually hidden new-tab announcement
- [ ] `font-size: inherit` by default — verified in InheritedSize story
- [ ] `visited` state keeps brand colour — no purple
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color or spacing values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

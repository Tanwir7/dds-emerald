# MediaObject · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `MediaObject` component.
- Scaffold: `packages/components/src/components/MediaObject/`
- Radix primitive: none (native HTML)

---

## Purpose

`MediaObject` is the classic side-by-side layout molecule: a fixed-width media element (image, icon, avatar) aligned to the left or right of a flexible text content column. It is one of the most reused layout patterns in product UI — user rows, notification items, comment threads, feature lists, and activity feeds all use this pattern.

---

## Exports from `index.ts`

```ts
export { MediaObject };
export type { MediaObjectProps };
```

---

## Props

```ts
interface MediaObjectProps {
  media: React.ReactNode; // required — icon, avatar, image, or any element
  mediaAlign?: 'top' | 'center' | 'bottom'; // default: 'top' — vertical alignment of media to content
  mediaPosition?: 'left' | 'right'; // default: 'left'
  gap?: 'xs' | 'sm' | 'md' | 'lg'; // default: 'md' — space between media and content
  as?: React.ElementType; // default: 'div'
  className?: string;
  children: React.ReactNode; // the text/content column
}
```

Forward `ref` typed to `HTMLDivElement`. Spread all remaining HTML props.

---

## Structure

```tsx
<Tag
  ref={ref}
  className={clsx(
    styles.root,
    styles[`media${capitalise(mediaPosition)}`],
    styles[`align${capitalise(mediaAlign)}`],
    styles[`gap${capitalise(gap)}`],
    className
  )}
>
  {mediaPosition === 'right' ? (
    <>
      <div className={styles.content}>{children}</div>
      <div className={styles.media}>{media}</div>
    </>
  ) : (
    <>
      <div className={styles.media}>{media}</div>
      <div className={styles.content}>{children}</div>
    </>
  )}
</Tag>
```

**Note on DOM order:** When `mediaPosition="right"`, the content column comes first in the DOM — this is correct for screen readers and keyboard users (content is announced/reached before the trailing media). Visual reversal is achieved purely by ordering in JSX, not by CSS `order` or `flex-direction: row-reverse`.

---

## Styles — `MediaObject.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: flex`
- `width: 100%`
- `min-width: 0`

`.mediaLeft`:

- `flex-direction: row`

`.mediaRight`:

- `flex-direction: row-reverse` — visual only, DOM order unchanged via JSX

`.media`:

- `flex-shrink: 0`
- `display: flex`
- `align-items: flex-start`

`.content`:

- `flex: 1`
- `min-width: 0` — prevents long text from overflowing

Align modifiers (on `.root`):

- `.alignTop` → `align-items: flex-start`
- `.alignCenter` → `align-items: center`
- `.alignBottom` → `align-items: flex-end`

Gap modifiers:

- `.gapXs` → `gap: var(--dds-space-1-5)`
- `.gapSm` → `gap: var(--dds-space-2)`
- `.gapMd` → `gap: var(--dds-space-3)` (default)
- `.gapLg` → `gap: var(--dds-space-4)`

No `border-radius`. No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `min-width: 0` on both `.root` and `.content` — without this, long text in the content column overflows the flex container.
- Media column has `flex-shrink: 0` — the media never shrinks; content shrinks to accommodate it.
- `mediaPosition="right"` changes JSX order (content before media), NOT CSS `order` — this preserves correct reading/tab order for screen readers and keyboard users.
- No default `width` or `height` on `.media` — the media element itself (Icon, Avatar, Image) controls its own dimensions.
- No default padding — consumers control spacing with their own wrappers or className.

---

## Accessibility

- `MediaObject` is a layout primitive — no ARIA attributes added.
- `as` prop allows semantic elements (`as="article"`, `as="li"`) when context requires.
- Content column order in the DOM always matches reading order — even with `mediaPosition="right"`.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders root element as <div> by default
- renders as <li> when as="li"
- renders media slot
- renders children in content slot
- forwards className to root
- forwards ref to root element

// Media position
- media renders before content in DOM when mediaPosition="left" (default)
- content renders before media in DOM when mediaPosition="right"
- applies .mediaLeft class by default
- applies .mediaRight class when mediaPosition="right"

// Alignment
- applies .alignTop class by default
- applies .alignCenter when mediaAlign="center"
- applies .alignBottom when mediaAlign="bottom"

// Gap
- applies .gapMd by default
- applies .gapXs when gap="xs"
- applies .gapSm when gap="sm"
- applies .gapLg when gap="lg"

// Content overflow protection
- content div has min-width: 0 (class applied)

// Forwarding
- forwards id, aria-label, data-testid

// axe
- axe: passes for default (left media)
- axe: passes for mediaPosition="right"
- axe: passes for all alignment values
- axe: passes with avatar as media
- axe: passes as <li> inside <ul>
```

---

## Stories — `MediaObject.stories.tsx`

Named exports required:

- `Default` — avatar + name + description
- `WithIcon` — icon + title + subtitle
- `MediaRight` — mediaPosition="right"
- `AlignCenter` — mediaAlign="center", multi-line content
- `GapSizes` — all 4 gap values stacked
- `AsList` — `<ul>` with `<MediaObject as="li">` items
- `WithImage` — small image thumbnail + text
- `Stacked` — multiple MediaObjects in a list (activity feed style)

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] DOM order correct for `mediaPosition="right"` (content before media in DOM)
- [ ] `min-width: 0` on both root and content
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

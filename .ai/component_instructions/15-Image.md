# Image · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Image` component.
- Scaffold: `packages/components/src/components/Image/`
- Radix primitive: none (native `<img>` element)

---

## Design decision

This is a thin wrapper around `<img>` that enforces: consistent aspect ratio control, a loading state placeholder, and a token-driven fallback background. It is NOT a Next.js `<Image>` replacement — it is a pure HTML `<img>` with enforced constraints. In consuming Next.js apps, developers may use this component's styles only, or opt into Next.js `<Image>` via `asChild` at the molecule level.

---

## Props

```ts
src: string
alt: string                                        // required — empty string allowed for decorative images
aspectRatio?: '1/1' | '4/3' | '16/9' | '3/2'    // default: undefined (natural ratio)
fit?: 'cover' | 'contain' | 'fill'               // default: 'cover'
rounded?: boolean                                  // default: false — applies var(--dds-radius-full) for circular crop
loading?: 'lazy' | 'eager'                        // default: 'lazy'
className?: string
width?: number | string
height?: number | string
// All other native <img> props forwarded
```

Renders a `<figure>` wrapper when `aspectRatio` is set, otherwise renders just `<img>`. Forward `ref` typed to `HTMLImageElement`.

---

## Styles — `Image.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root` (the `<img>`):

- `display: block`
- `max-width: 100%`
- `height: auto`
- `background-color: var(--dds-color-bg-subtle)` — shows during load
- `border-radius: var(--dds-radius-none)` — default square

`.rounded`:

- `border-radius: var(--dds-radius-full)` — documented exception for circular avatars/thumbnails

Fit modifiers:

- `.cover` → `object-fit: cover`
- `.contain` → `object-fit: contain`
- `.fill` → `object-fit: fill`

`.figure` (the `<figure>` wrapper when aspectRatio is set):

- `position: relative`
- `overflow: hidden`
- `margin: 0`
- `background-color: var(--dds-color-bg-subtle)`
- `border-radius: inherit`

Aspect ratio modifiers (on `.figure`):

- `.ratio1x1` → `aspect-ratio: 1 / 1`
- `.ratio4x3` → `aspect-ratio: 4 / 3`
- `.ratio16x9` → `aspect-ratio: 16 / 9`
- `.ratio3x2` → `aspect-ratio: 3 / 2`

When inside `.figure`, the `.root` img:

- `position: absolute; inset: 0; width: 100%; height: 100%`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` by default — no exceptions.
- `rounded={true}` applies `var(--dds-radius-full)` — this is a documented exception for circular image crops (e.g. user thumbnails outside of the Avatar component).
- The placeholder background (`var(--dds-color-bg-subtle)`) ensures a meaningful loading state without a spinner.
- `alt` is required at the TypeScript level. An empty string `alt=""` is allowed for decorative images (e.g. background textures).
- `loading="lazy"` by default — do NOT change the default to eager.

---

## Accessibility

- `alt` is a required prop (empty string allowed for decorative use).
- When `alt=""`, the image is treated as decorative by screen readers — this is correct and valid.
- `<figure>` wrapper does not need `role` — it is a semantic HTML5 element.
- Do not add `aria-*` attributes to the image by default — consumers can forward them via spread.

---

## TDD — write ALL tests before implementing

```
- renders an <img> element
- has correct src attribute
- has alt attribute (empty string is valid)
- forwards ref to HTMLImageElement
- forwards className to <img>
- renders <img> directly when no aspectRatio prop
- renders <figure> wrapper when aspectRatio is provided
- applies .cover class by default when fit not specified (default is cover)
- applies .contain class when fit="contain"
- applies .fill class when fit="fill"
- applies .rounded class when rounded={true}
- does NOT apply .rounded when rounded={false}
- applies .ratio1x1 on figure when aspectRatio="1/1"
- applies .ratio4x3 on figure when aspectRatio="4/3"
- applies .ratio16x9 on figure when aspectRatio="16/9"
- applies .ratio3x2 on figure when aspectRatio="3/2"
- has loading="lazy" by default
- has loading="eager" when loading="eager"
- forwards width and height to <img>
- forwards arbitrary HTML props (data-testid, decoding)
- axe: passes with meaningful alt text
- axe: passes with empty alt (decorative)
- axe: passes with aspectRatio set
- axe: passes for rounded variant
```

---

## Stories — `Image.stories.tsx`

Named exports required:

- `Default` (src, meaningful alt, no aspect ratio)
- `AspectRatios` (all four ratios side by side, same image)
- `FitModes` (cover / contain / fill with same container size)
- `Rounded` (rounded={true}, 1:1 ratio)
- `LazyLoading` (loading="lazy", note in story description)
- `Decorative` (alt="" demonstrating decorative pattern)
- `LoadingState` (invalid src to show bg-subtle placeholder)

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] All variants represented in stories
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color or spacing values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

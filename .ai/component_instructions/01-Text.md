# Text · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Text` component.
- Scaffold: `packages/components/src/components/Text/`
- Radix primitive: none (native HTML element via `as` prop)

---

## Props

```ts
as?: 'p' | 'span' | 'div' | 'li' | 'label' | 'legend' | 'strong' | 'em' | 'small' // default: 'p'
size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' // default: 'base'
weight?: 'normal' | 'medium' | 'semibold' | 'bold' // default: 'normal'
color?: 'default' | 'muted' | 'on-primary' // default: 'default'
font?: 'sans' | 'mono' // default: 'sans'
textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase' // default: 'none'
align?: 'left' | 'center' | 'right' // default: 'left'
truncate?: boolean // default: false — single-line ellipsis
className?: string
children: React.ReactNode
```

Forward `ref` typed to `HTMLParagraphElement` (cast internally per `as` value). Spread all remaining HTML props.

Export all public types from `packages/components/src/components/Text/index.ts` and from the package root `packages/components/src/index.ts`:

- `TextAlign`
- `TextColor`
- `TextElement`
- `TextFont`
- `TextProps`
- `TextSize`
- `TextTransform`
- `TextWeight`

---

## Styles — `Text.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

Base `.root`:

- `line-height: var(--dds-line-height-normal)`
- `color: var(--dds-color-text-default)`
- `margin: 0`

Font modifiers:

- `.fontSans` → `font-family: var(--dds-font-sans)`
- `.fontMono` → `font-family: var(--dds-font-mono)`

`font="mono"` is a presentational typeface choice only. Do not render `<code>`, do not add code-specific styling, and do not automatically add `font-variant-numeric`.

Text transform modifiers:

- `.textTransformNone` → `text-transform: none`
- `.textTransformCapitalize` → `text-transform: capitalize`
- `.textTransformUppercase` → `text-transform: uppercase`
- `.textTransformLowercase` → `text-transform: lowercase`

Size modifiers (map to font-size tokens):

- `.xs` → `var(--dds-font-size-xs)`
- `.sm` → `var(--dds-font-size-sm)`
- `.base` → `var(--dds-font-size-base)`
- `.lg` → `var(--dds-font-size-lg)`
- `.xl` → `var(--dds-font-size-xl)`

Weight modifiers:

- `.normal` → `var(--dds-font-weight-normal)`
- `.medium` → `var(--dds-font-weight-medium)`
- `.semibold` → `var(--dds-font-weight-semibold)`
- `.bold` → `var(--dds-font-weight-bold)`

Color modifiers:

- `.colorDefault` → `var(--dds-color-text-default)`
- `.colorMuted` → `var(--dds-color-text-muted)`
- `.colorOnPrimary` → `var(--dds-color-text-on-primary)`

Align modifiers:

- `.alignLeft` / `.alignCenter` / `.alignRight` — `text-align`

Truncate:

- `.truncate` → `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`

No `border-radius`. No hardcoded values. No Tailwind. No inline styles.

---

## Accessibility

- Render the correct semantic element via `as` prop — consumers are responsible for correct hierarchy.
- No additional ARIA needed; the element itself carries semantics.
- Colour contrast: `--dds-color-text-default` and `--dds-color-text-muted` are both WCAG AA-compliant per token audit (see tokens.css comments).
- For `color="on-primary"`, render on a primary/action background in examples and stories.

---

## TDD — write ALL tests before implementing

```
- renders children as <p> by default
- renders as <span> when as="span"
- renders as <div> when as="div"
- renders as <li> when as="li"
- renders as <label> when as="label"
- renders as <strong> when as="strong"
- forwards className to root element
- forwards ref to root DOM element
- forwards arbitrary HTML props (e.g. data-testid)
- applies .base class by default
- applies .xs class when size="xs"
- applies .sm class when size="sm"
- applies .base class when size="base"
- applies .lg class when size="lg"
- applies .xl class when size="xl"
- applies .normal class by default
- applies .medium class when weight="medium"
- applies .semibold class when weight="semibold"
- applies .bold class when weight="bold"
- applies .colorDefault class by default
- applies .colorMuted class when color="muted"
- applies .colorOnPrimary class when color="on-primary"
- applies .fontSans class by default
- applies .fontMono class when font="mono"
- applies .textTransformNone class by default
- applies .textTransformCapitalize class when textTransform="capitalize"
- applies .textTransformUppercase class when textTransform="uppercase"
- applies .textTransformLowercase class when textTransform="lowercase"
- applies .alignLeft class by default
- applies .alignCenter class when align="center"
- applies .alignRight class when align="right"
- applies .truncate class when truncate={true}
- does NOT apply .truncate when truncate={false}
- axe: passes for default render
- axe: passes for label render
- axe: passes for all size variants
- axe: passes for muted color variant
- stylesheet assertion: color="on-primary" uses `--dds-color-text-on-primary`
- stylesheet assertion: font modifiers use `--dds-font-sans` and `--dds-font-mono`
- stylesheet assertion: text transform modifiers define none/capitalize/uppercase/lowercase
```

---

## Stories — `Text.stories.tsx`

Named exports required:

- `Default` (size base, color default)
- `ColorMuted`
- `ColorOnPrimary`
- `Sizes` (render all 5 sizes stacked)
- `Weights` (render all 4 weights stacked)
- `MonoFont`
- `TextTransforms`
- `Alignment` (left / center / right stacked)
- `Truncated` (inside a fixed-width container)
- `AsSpan`
- `AsStrong`

Use `autodocs`. No `play()` functions needed.
Use `parameters.a11y.context` scoped to the story root.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all rendered variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] All variants represented in stories
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color or spacing values in SCSS
- [ ] `TextFont` and `TextTransform` are exported from the component barrel and package root
- [ ] Exported from `packages/components/src/index.ts`

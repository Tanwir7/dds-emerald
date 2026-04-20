# Text · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Text` component.
- Scaffold: `packages/components/src/components/Text/`
- Radix primitive: none (native HTML element via `as` prop)

---

## Props

```ts
as?: 'p' | 'span' | 'div' | 'li' | 'label'   // default: 'p'
size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'     // default: 'base'
weight?: 'normal' | 'medium' | 'semibold' | 'bold'  // default: 'normal'
color?: 'default' | 'muted'                    // default: 'default'
align?: 'left' | 'center' | 'right'            // default: 'left'
truncate?: boolean                              // default: false — single-line ellipsis
className?: string
children: React.ReactNode
```

Forward `ref` typed to `HTMLParagraphElement` (cast internally per `as` value). Spread all remaining HTML props.

---

## Styles — `Text.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

Base `.root`:

- `font-family: var(--dds-font-sans)`
- `line-height: var(--dds-line-height-normal)`
- `color: var(--dds-color-text-default)`
- `margin: 0`

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

---

## TDD — write ALL tests before implementing

```
- renders children as <p> by default
- renders as <span> when as="span"
- renders as <div> when as="div"
- renders as <li> when as="li"
- forwards className to root element
- forwards ref to root DOM element
- applies .xs class when size="xs"
- applies .sm class when size="sm"
- applies .base class when size="base"
- applies .lg class when size="lg"
- applies .xl class when size="xl"
- applies .medium class when weight="medium"
- applies .semibold class when weight="semibold"
- applies .bold class when weight="bold"
- applies .colorMuted class when color="muted"
- applies .alignCenter class when align="center"
- applies .alignRight class when align="right"
- applies .truncate class when truncate={true}
- does NOT apply .truncate when truncate={false}
- forwards arbitrary HTML props (e.g. data-testid)
- axe: passes for default render
- axe: passes for all size variants
- axe: passes for muted color variant
```

---

## Stories — `Text.stories.tsx`

Named exports required:

- `Default` (size base, color default)
- `Sizes` (render all 5 sizes stacked)
- `Weights` (render all 4 weights stacked)
- `ColorMuted`
- `Alignment` (left / center / right stacked)
- `Truncated` (inside a fixed-width container)
- `AsSpan`

Use `autodocs`. No `play()` functions needed.

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
- [ ] Exported from `packages/components/src/index.ts`

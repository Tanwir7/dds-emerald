# AGENTS.md — DDS Emerald Design System

Read this before making code changes.

## Identity

- System: Emerald
- Company: Digital Dev Studio (DDS)
- CSS prefix: `dds`
- React components use PascalCase names with no JSX prefix

## Repo map

- Component library: `packages/components`
- Tokens: `packages/tokens/src/tokens.css`
- Docs and Storybook: `apps/docs`
- New component scaffold: `scaffolding.mjs`
- Component source root: `packages/components/src/components`
- Patterns source root: `packages/components/src/patterns`

## Styling

- No Tailwind.
- No inline styles except low-level layout primitives using dynamic numeric values that cannot be represented via existing class or token APIs.
- No hardcoded color values; use `--dds-*` tokens.
- Runtime styles live in `ComponentName.module.scss`.
- Story-only styles live in `ComponentName.stories.module.scss`.
- Do not put story selectors in runtime SCSS.
- Use shared `@use` mixins and breakpoints; do not copy mixins inline.
- Components should consume Tier 2 tokens such as `--dds-color-*` and `--dds-space-*`.

## Components

- Use `React.forwardRef`.
- Accept and forward `className`.
- Use `clsx` for class merging. Do not use `cx`, `cn`, or `classnames`.
- Prefer Radix for interactive accessibility primitives.
- Do not expose Radix types in public component props.
- Public declarations must not import from `@radix-ui/*`.

## Design constraints

- Border radius is `var(--dds-radius-none)` unless an existing component spec says otherwise.
- Sidebar background is always `var(--dds-color-bg-sidebar)`.
- Focus ring is always outline-based:
  `outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5); outline-offset: 2px;`
- `NavItem` minimum height is 44px.
- `NavItem` sizing must follow `.ai/component_instructions/52-NavItem.md`, mapped to existing DDS tokens.
- Body-level text must use `font-feature-settings: "cv02", "cv03", "cv04", "cv11"`.
- Numeric and tabular data uses `font-variant-numeric: tabular-nums`.

## Typography

- Display: `var(--dds-font-display)`
- Body: `var(--dds-font-sans)`
- Code/data: `var(--dds-font-mono)`
- Do not hardcode font-family values in component styles.
- Do not import font files inside components.

## Testing

- Every component needs a `*.test.tsx`.
- Include axe accessibility coverage in every component test file.
- Coverage threshold is 80% for lines, functions, and branches.
- Storybook browser tests must keep `apps/docs/vitest.config.ts` aligned with the repo-root fs allowlist and `127.0.0.1` browser API host binding unless intentionally reworking that setup.
- For Storybook browser tests, use `pnpm run test:storybook`.
- Do not use ad hoc `node -e` or direct Playwright commands when the root Storybook test script can be used.

## Tokens

- New CSS custom properties must use the `--dds-` prefix.
- New color values must be added in `packages/tokens/src/tokens.css`.
- Color values use OKLCH.

## File structure

- One component per directory under `packages/components/src/components/ComponentName/`.
- New components should include `ComponentName.tsx`, `ComponentName.module.scss`, `ComponentName.test.tsx`, `ComponentName.stories.tsx`, and `index.ts`.
- Use `scaffolding.mjs` for new components.
- Runtime components may import only `ComponentName.module.scss`.
- Stories may import `ComponentName.stories.module.scss`.
- Storybook addon-a11y scans must be scoped with `parameters.a11y.context`.
- Storybook source previews should show consumer-facing JSX only; use `storySourceParameters` from `packages/components/src/utils/storySource.ts` when wrappers or custom renders would otherwise leak into docs.

## Storybook naming

- `Core Components/ComponentName`
- `Grouped Components/ComponentName`
- `Marketing Patterns/PatternName`
- `App Patterns/PatternName`
- `AI Patterns/PatternName`
- Do not use `Atoms`, `Molecules`, or generic `Components`.

## Icons

- Icon prop type is `LucideIcon` from `lucide-react`.
- Use component-as-prop: `icon={Inbox}`, not `icon={<Inbox />}`.
- Do not pass `size` directly to Lucide icons inside DDS components.
- Control icon sizing through SCSS and DDS icon-size tokens.
- Decorative icons should usually be `aria-hidden="true"`.
- Semantic icons need a visible label or accessible name.
- Default icon size is `--dds-icon-size-md`.
- Use `--dds-icon-size-lg` only when a component spec explicitly calls for it.
- Import named icons only.

## Accessibility baseline

- Target WCAG 2.2 AA.
- For detailed accessibility review guidance, see `docs/accessibility.md`.
- All interactive elements must be keyboard reachable and operable.
- Overlays and modals must trap focus and restore focus on close.
- Do not leave visually hidden interactive elements focusable.
- Do not rely on color alone for meaning.
- Form controls need a visible label or equivalent accessible name.
- Use native HTML before ARIA.
- Verify clear name, role, and state for interactive controls.
- Use `aria-live` for dynamic announcements when needed.
- Pointer targets must meet WCAG 2.2 AA minimum target size requirements unless a documented exception applies.

## When unsure

- If a design decision is not documented here, in component instructions, or in tokens, ask before inventing a default.

# AGENTS.md — DDS Emerald Design System

# READ THIS BEFORE WRITING ANY CODE

## Identity

- System name: Emerald
- Company: Digital Dev Studio (DDS)
- CSS prefix: `dds` — applies to ALL CSS custom properties, SCSS variables, class names
- Component prefix: all React components are PascalCase, no prefix in JSX

## Non-negotiable rules

### Styling

- NO Tailwind CSS. Not one class, not one import.
- NO inline styles. All styles via SCSS modules.
- NO hardcoded color values. Always consume `--dds-*` tokens.
- SCSS modules only: file must be named `ComponentName.module.scss`
- Always `@use` shared mixins and breakpoints, never copy-paste mixins inline
- Components consume Tier 2 tokens (`--dds-color-*`, `--dds-space-*`). Never Tier 1 directly.

### Components

- All components use `React.forwardRef`
- All components accept and forward `className` prop
- All components use `clsx` for conditional class merging
- Never use `cx`, `cn`, `classnames` — only `clsx`
- Radix UI for all interactive primitives needing accessibility (Dialog, Select, etc.)
- No custom ARIA implementations when a Radix primitive exists

### Design constraints — do NOT deviate

- Border radius is ALWAYS `var(--dds-radius-none)` (0px) on all UI components
- The ONLY exception is `var(--dds-radius-full)` for Avatar, StatusIndicator dot, AvatarGroup overflow, ProgressBar track
- Never add rounding to Button, Input, Badge, Card, NavItem, DataTable, or any other UI element
- Sidebar background is ALWAYS `var(--dds-color-bg-sidebar)` — it is dark in both light AND dark mode
- ProgressBar uses `var(--dds-radius-full)` on track and fill — this is the only non-avatar exception
- KPICard highlighted variant MUST include the `h-4px w-full bg-[--dds-color-action-primary]` absolute top stripe
- Focus ring width is always 3px: `box-shadow: 0 0 0 3px oklch(from var(--dds-color-focus-ring) l c h / 0.5)`
- NavItem minimum height is always 44px (WCAG 2.2 touch target)
- `font-feature-settings: "cv02", "cv03", "cv04", "cv11"` must be set on body-level text
- All numeric/tabular data uses `font-variant-numeric: tabular-nums`

### Typography

- Display headings: `font-family: var(--dds-font-display)` (Barlow Condensed)
- Body text: `font-family: var(--dds-font-sans)` (DM Sans)
- Code/data: `font-family: var(--dds-font-mono)` (JetBrains Mono)
- Never use system fonts directly — always via token variables

### Testing

- Every component MUST have a corresponding `*.test.tsx` file
- Tests must be written BEFORE implementation (TDD)
- Every test file MUST include the axe a11y check
- Coverage threshold: 80% lines/functions/branches — CI will fail below this

### Tokens

- Never add a new CSS custom property without the `--dds-` prefix
- Never create a new color value without adding it to `packages/tokens/src/tokens.css` first
- Color values are always oklch format

### File structure

- One component per directory: `src/components/ComponentName/`
- Directory must contain: `.tsx`, `.module.scss`, `.test.tsx`, `.stories.tsx`, `index.ts`
- Use `scaffolding.mjs` to generate the initial files for any new component

### What to ask when unsure

If a design decision is not documented here or in the token file, ask the human before implementing. Do not guess or use a "sensible default".

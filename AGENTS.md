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
- Focus ring is always outline-based: `outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5); outline-offset: 2px;`
- NavItem minimum height is always 44px (Emerald navigation design constraint)
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
- Storybook stories using addon-a11y MUST scope checks to the component story root with `parameters.a11y.context`; never let addon-a11y scan surrounding docs/chrome markup

### Font loading

- Never hardcode font-family strings in component SCSS
- Always use var(--dds-font-display), var(--dds-font-sans), var(--dds-font-mono)
- Do not import font files inside component files
- Font loading is handled at the app root level — components assume the CSS
  variables are already resolved by the time they render
- font-feature-settings "cv02" "cv03" "cv04" "cv11" is set globally in base.css
  Do not repeat it in component SCSS
- DM Sans optical size axis (opsz) is loaded — use font-size changes to benefit
  from it automatically; do not set font-variation-settings manually in components

### Icons (lucide-react)

- Icon prop type is always `LucideIcon` from 'lucide-react'
- Always use component-as-prop: `icon={Inbox}` not `icon={<Inbox />}`
- Never pass a `size` prop to a Lucide icon inside a DDS component
- Control icon size via the icon-size SCSS mixin only
- Never hardcode width/height on icons — use --dds-icon-size-\* tokens
- Icons are aria-hidden="true" when decorative (almost always)
- Icons require aria-label or visible paired text when semantic
- Default icon size is --dds-icon-size-md (16px)
- EmptyState is the only component using --dds-icon-size-lg (32px)
- Always import individual named icons, never import _
  ✅ import { Inbox } from 'lucide-react'
  ❌ import _ as Icons from 'lucide-react'

## Accessibility

Accessibility is not optional. It is part of the definition of done for every component and UI pattern in this system. Apply WCAG 2.2 Level AA as the baseline.

### Core principles (POUR)

Every UI decision must satisfy all four:

| Principle          | Question to answer                           | Examples                                                                               |
| ------------------ | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Perceivable**    | Can people see or hear the content?          | Contrast, captions, alt text, non-color indicators                                     |
| **Operable**       | Can people use it without a mouse?           | Keyboard nav, focus order, no focus traps, WCAG AA target sizes                        |
| **Understandable** | Is the interface clear?                      | Labels, instructions, specific error messages                                          |
| **Robust**         | Does it work with real assistive technology? | Semantic HTML, correct roles/names/states, ARIA only when native HTML can't do the job |

### Non-negotiable accessibility rules

- Every interactive element must be reachable and operable via keyboard (Tab, Shift+Tab, Enter, Space, Escape)
- Focus order must follow a logical reading sequence — never strand or skip focus
- Modals and overlays MUST trap focus while open and return focus on close
- Never leave interactive elements reachable when visually hidden (e.g. off-screen menus)
- Meaning must never be conveyed by color alone — always pair with text, icon, or pattern
- All form fields must have a visible `<label>` or accessible name — placeholder is not a label
- Error messages must be specific, human-readable, and non-blaming
- Error / success states must not rely on color alone
- Images require meaningful `alt` text; decorative images use `alt=""`
- Use native HTML elements before reaching for ARIA — avoid bloated ARIA when a `<button>`, `<input>`, or `<dialog>` suffices
- All text must meet WCAG AA contrast minimums (4.5:1 body, 3:1 large/UI)
- Pointer targets must meet WCAG 2.2 AA Target Size (Minimum): at least 24 by 24 CSS pixels, or satisfy a documented WCAG exception. Use 44 by 44 CSS pixels only where an Emerald component spec explicitly requires it.

### Accessibility review passes

When building or reviewing any UI component, pattern, or flow, run the following five review passes. These are listed in priority order.

---

#### Pass 1 — Keyboard-first

Walk through the UI as if you can only use a keyboard.

1. List the tab order from first to last meaningful interactive element
2. Identify any interactive elements that might be missed, skipped, or unreachable
3. Flag focus risks: modals that don't trap focus, hidden elements that remain focusable, dropdowns that strand focus, custom controls that behave like unlabelled `<div>`s
4. Verify Enter/Space activate buttons and links; Escape closes overlays
5. Confirm no keyboard traps exist

---

#### Pass 2 — Screen reader narration

Narrate the screen as a screen reader user would experience it.

1. Navigate landmarks first (`<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`), then main content, then secondary regions
2. For each interactive element, confirm a clear **name**, **role**, and **state** would be announced
3. Flag: unnamed buttons, duplicated labels, confusing reading order, images with missing or useless alt text, form fields without proper labels
4. Confirm live regions (`aria-live`) announce dynamic content changes (toasts, inline validation, loading states)

---

#### Pass 3 — Color and contrast

Review for color-dependent meaning and risky contrast pairings.

1. Identify places where meaning is conveyed by color alone (errors, success, required fields, links vs body text)
2. Call out text/background pairings that are risky — especially small body text on subtle backgrounds
3. Suggest safer alternatives that preserve the DDS brand (don't default to ugly)
4. Note what still requires measurement with engineering tools (Colour Contrast Analyser, browser DevTools) — AI cannot reliably measure exact ratios from screenshots

---

#### Pass 4 — Forms

Review all form fields for accessibility and clarity.

1. Every field has a visible, associated `<label>` (or `aria-label` / `aria-labelledby` when visual label is impossible)
2. Helper text is linked via `aria-describedby`
3. Error messages are specific, human, and non-blaming — rewrite any weak messages
4. Success states don't rely on color alone
5. Related fields are grouped with `<fieldset>` / `<legend>` where applicable
6. Instructions appear **before** users can fail, not after

---

#### Pass 5 — Component accessibility contract

When defining or extending a design-system component, produce a concise accessibility contract:

1. **Keyboard interactions** — document behaviour for default, hover, focus, active, disabled, loading, and error states
2. **Screen reader expectations** — required names, roles, state announcements
3. **Focus management** — rules for overlays, menus, dialogs, inline editing
4. **Designer specs** — what designers must document: labels, helper text, error patterns, empty states
5. **QA checklist** — what must be validated in code review and testing
6. ARIA is allowed only when native HTML cannot do the job — keep it minimal

---

### What to ask when unsure

If a design decision is not documented here or in the token file, ask the human before implementing. Do not guess or use a "sensible default".

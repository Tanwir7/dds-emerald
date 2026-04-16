# DDS Emerald — Design System Development Strategy

**Company:** Digital Dev Studio (DDS) · **System Name:** Emerald · **Prefix:** `dds`
**Stack:** Next.js · Radix UI · SCSS Modules · Storybook v10 · Vitest · Turborepo
**Last updated:** 2026-03-27

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Repository Architecture](#2-repository-architecture)
3. [Token Architecture](#3-token-architecture)
4. [Component Phasing](#4-component-phasing)
5. [SCSS Module Architecture](#5-scss-module-architecture)
6. [Storybook Setup](#6-storybook-setup)
7. [Testing Strategy (TDD)](#7-testing-strategy-tdd)
8. [CI/CD Pipeline](#8-cicd-pipeline)
9. [npm Packaging](#9-npm-packaging)
10. [Scaffolding CLI](#10-scaffolding-cli)
11. [AI Agent Rules & Prompts](#11-ai-agent-rules--prompts)
12. [Landing Page](#12-landing-page)
13. [Design Constraints Registry](#13-design-constraints-registry)

---

## 1. Executive Summary

Emerald is a public open-source design system built by Digital Dev Studio. It is opinionated, single-brand, and not designed for consumer theming or white-labelling. The visual language is architectural minimal: zero border radius on all UI, hard rectangles, dark emerald sidebar in light mode, oklch color space throughout, and a three-font typographic system (Barlow Condensed / DM Sans / JetBrains Mono).

The system is built as a Turborepo monorepo with two publishable packages (`@dds/emerald-tokens` and `@dds/emerald`), a Storybook documentation site, and a Next.js landing page. All components are built TDD-first using Vitest + React Testing Library. AI agents (Antigravity primary, Codex secondary) build components one at a time using a strict scaffolding template.

---

## 2. Repository Architecture

### 2.1 Recommended Structure: Turborepo Monorepo

**Why Turborepo:** Tokens must be consumable independently (e.g. for CSS-only integration), so a monorepo with separate publishable packages is the correct architecture. Turborepo provides caching, parallel task execution, and clean dependency graphs with minimal config overhead vs. Nx.

```
dds-emerald/
├── apps/
│   ├── docs/               # Storybook v10 documentation site
│   └── landing/            # Next.js marketing landing page
├── packages/
│   ├── tokens/             # @dds/emerald-tokens (CSS vars + JS/TS export)
│   └── components/         # @dds/emerald (React + Radix + SCSS)
├── tooling/
│   ├── eslint/             # shared ESLint config
│   ├── typescript/         # shared tsconfig bases
│   └── vitest/             # shared Vitest config
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── .changeset/
│   └── config.json
├── scaffolding.mjs         # component scaffolding CLI
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 2.2 Package Details

**`packages/tokens/` → `@dds/emerald-tokens`**

- Outputs: `dist/tokens.css` (CSS custom properties), `dist/tokens.js` (ESM), `dist/tokens.d.ts`
- No React dependency — usable in any framework
- Source of truth for all design decisions

**`packages/components/` → `@dds/emerald`**

- Peer deps: `react`, `react-dom`, `@radix-ui/*`
- Depends on `@dds/emerald-tokens`
- Outputs: ESM + CJS + type declarations + bundled CSS

**`apps/docs/`**

- Storybook v10, consumes both packages
- Deployed to Chromatic / Vercel
- This IS the documentation site

**`apps/landing/`**

- Next.js 14+ one-pager
- Consumes `@dds/emerald` directly from monorepo
- Links out to Storybook docs

### 2.3 Package Manager

Use **pnpm** with workspaces. Faster installs, strict dependency isolation, best Turborepo compatibility.

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tooling/*'
```

---

## 3. Token Architecture

### 3.1 Three-Tier Token System (Industry Standard)

The industry standard (used by IBM Carbon, GitHub Primer, Shopify Polaris) is a three-tier hierarchy:

```
Tier 1 — Primitive    Raw values. No semantics. Full palette.
Tier 2 — Semantic     Role-based. Theme-aware. What you use in components.
Tier 3 — Component    Scoped overrides. Optional. Only for complex components.
```

**Rule:** Components always consume Tier 2 tokens. Never consume Tier 1 directly in component SCSS. Tier 1 only feeds Tier 2.

### 3.2 Naming Convention

Pattern: `--dds-{category}-{role}-{modifier}`

```css
/* Tier 1 — Primitives */
--dds-emerald-50  through  --dds-emerald-950
--dds-silver-50   through  --dds-silver-950
--dds-space-1     through  --dds-space-24     (4px scale)
--dds-font-size-xs  ...  --dds-font-size-7xl
--dds-font-weight-normal | medium | semibold | bold
--dds-line-height-none | tight | snug | normal | relaxed
--dds-tracking-tighter | tight | normal | wide | wider | widest
--dds-radius-none   (0px)
--dds-radius-full   (9999px)
--dds-shadow-xs | sm | md
--dds-duration-fast   (150ms)
--dds-duration-normal (300ms)
--dds-duration-slow   (500ms)
--dds-ease-standard   (cubic-bezier(0.4, 0, 0.2, 1))
--dds-ease-out        (ease-out)

/* Tier 2 — Semantic (light mode :root, dark mode [data-theme="dark"]) */
--dds-color-bg-default
--dds-color-bg-subtle
--dds-color-bg-card
--dds-color-bg-popover
--dds-color-bg-input
--dds-color-bg-muted
--dds-color-bg-sidebar
--dds-color-text-default
--dds-color-text-muted
--dds-color-text-on-primary
--dds-color-text-on-sidebar
--dds-color-text-muted-on-sidebar
--dds-color-action-primary
--dds-color-action-primary-hover
--dds-color-action-primary-foreground
--dds-color-action-secondary
--dds-color-action-secondary-hover
--dds-color-action-secondary-foreground
--dds-color-action-ghost-hover
--dds-color-action-destructive
--dds-color-action-destructive-hover
--dds-color-border-default
--dds-color-border-focus
--dds-color-border-input
--dds-color-border-sidebar
--dds-color-focus-ring
--dds-color-accent
--dds-color-accent-foreground
--dds-color-status-success
--dds-color-status-success-foreground
--dds-color-status-warning
--dds-color-status-warning-foreground
--dds-color-status-danger
--dds-color-status-danger-foreground
--dds-color-status-info
--dds-color-status-info-foreground
--dds-color-sidebar-primary
--dds-color-sidebar-accent
--dds-color-chart-1 through --dds-color-chart-5

/* Tier 3 — Component (examples) */
--dds-button-bg
--dds-button-bg-hover
--dds-button-color
--dds-button-border
--dds-input-border
--dds-input-border-focus
--dds-badge-success-bg
--dds-badge-success-color
--dds-badge-success-ring
```

### 3.3 Color Values (oklch, faithfully mapped from prototype)

```css
/* packages/tokens/src/tokens.css */

:root {
  /* ── Tier 1: Emerald Primitive Palette ── */
  --dds-emerald-50: oklch(0.97 0.02 160);
  --dds-emerald-100: oklch(0.94 0.04 160);
  --dds-emerald-200: oklch(0.88 0.06 160);
  --dds-emerald-300: oklch(0.78 0.08 160);
  --dds-emerald-400: oklch(0.65 0.1 160);
  --dds-emerald-500: oklch(0.5 0.12 160);
  --dds-emerald-600: oklch(0.4 0.12 160);
  --dds-emerald-700: oklch(0.35 0.12 160);
  --dds-emerald-800: oklch(0.28 0.1 160);
  --dds-emerald-900: oklch(0.22 0.08 160);
  --dds-emerald-950: oklch(0.15 0.06 160);

  /* ── Tier 1: Silver/Neutral Primitive Palette ── */
  --dds-silver-50: oklch(0.98 0 0);
  --dds-silver-100: oklch(0.96 0 0);
  --dds-silver-200: oklch(0.92 0 0);
  --dds-silver-300: oklch(0.86 0 0);
  --dds-silver-400: oklch(0.7 0 0);
  --dds-silver-500: oklch(0.55 0 0);
  --dds-silver-600: oklch(0.45 0 0);
  --dds-silver-700: oklch(0.35 0 0);
  --dds-silver-800: oklch(0.25 0 0);
  --dds-silver-900: oklch(0.18 0 0);
  --dds-silver-950: oklch(0.1 0 0);

  /* ── Tier 1: Spacing (4px base grid) ── */
  --dds-space-0-5: 2px;
  --dds-space-1: 4px;
  --dds-space-1-5: 6px;
  --dds-space-2: 8px;
  --dds-space-2-5: 10px;
  --dds-space-3: 12px;
  --dds-space-4: 16px;
  --dds-space-5: 20px;
  --dds-space-6: 24px;
  --dds-space-8: 32px;
  --dds-space-10: 40px;
  --dds-space-12: 48px;
  --dds-space-16: 64px;
  --dds-space-20: 80px;
  --dds-space-24: 96px;

  /* ── Tier 1: Border Radius ── */
  --dds-radius-none: 0px;
  --dds-radius-full: 9999px;

  /* ── Tier 1: Typography ── */
  --dds-font-display: 'Barlow Condensed', system-ui, sans-serif;
  --dds-font-sans: 'DM Sans', system-ui, sans-serif;
  --dds-font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --dds-font-size-xs: 0.75rem; /* 12px */
  --dds-font-size-sm: 0.875rem; /* 14px */
  --dds-font-size-base: 1rem; /* 16px */
  --dds-font-size-lg: 1.125rem; /* 18px */
  --dds-font-size-xl: 1.25rem; /* 20px */
  --dds-font-size-2xl: 1.5rem; /* 24px */
  --dds-font-size-3xl: 1.875rem; /* 30px */
  --dds-font-size-4xl: 2.25rem; /* 36px */
  --dds-font-size-5xl: 3rem; /* 48px */
  --dds-font-size-6xl: 3.75rem; /* 60px */
  --dds-font-size-7xl: 4.5rem; /* 72px */

  --dds-font-weight-normal: 400;
  --dds-font-weight-medium: 500;
  --dds-font-weight-semibold: 600;
  --dds-font-weight-bold: 700;

  --dds-line-height-none: 1;
  --dds-line-height-tight: 1.25;
  --dds-line-height-snug: 1.375;
  --dds-line-height-normal: 1.5;
  --dds-line-height-relaxed: 1.625;

  --dds-tracking-tighter: -0.05em;
  --dds-tracking-tight: -0.025em;
  --dds-tracking-normal: 0em;
  --dds-tracking-wide: 0.025em;
  --dds-tracking-wider: 0.05em;
  --dds-tracking-widest: 0.1em;

  /* ── Tier 1: Shadow ── */
  --dds-shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.025);
  --dds-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

  /* ── Tier 1: Motion ── */
  --dds-duration-fast: 150ms;
  --dds-duration-normal: 300ms;
  --dds-duration-slow: 500ms;
  --dds-ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --dds-ease-out: ease-out;

  /* ── Tier 1: Breakpoints (reference only — use in SCSS, not consumed as vars) ── */
  /* sm: 640px  md: 768px  lg: 1024px  xl: 1280px */

  /* ── Tier 2: Semantic — Light Mode ── */
  --dds-color-bg-default: oklch(0.99 0 0);
  --dds-color-bg-subtle: oklch(0.96 0 0);
  --dds-color-bg-card: oklch(1 0 0);
  --dds-color-bg-popover: oklch(1 0 0);
  --dds-color-bg-input: oklch(0.9 0 0);
  --dds-color-bg-muted: oklch(0.96 0 0);
  --dds-color-bg-sidebar: oklch(0.2 0.05 160);

  --dds-color-text-default: oklch(0.13 0 0);
  --dds-color-text-muted: oklch(0.45 0 0);
  --dds-color-text-on-primary: oklch(0.98 0 0);
  --dds-color-text-on-sidebar: oklch(0.92 0 0);
  --dds-color-text-muted-on-sidebar: oklch(0.92 0 0 / 0.5);

  --dds-color-action-primary: oklch(0.35 0.12 160);
  --dds-color-action-primary-hover: oklch(0.35 0.12 160 / 0.9);
  --dds-color-action-primary-foreground: oklch(0.98 0 0);
  --dds-color-action-secondary: oklch(0.96 0.005 260);
  --dds-color-action-secondary-hover: oklch(0.96 0.005 260 / 0.8);
  --dds-color-action-secondary-foreground: oklch(0.18 0 0);
  --dds-color-action-ghost-hover: oklch(0.94 0.03 160);
  --dds-color-action-destructive: oklch(0.55 0.2 25);
  --dds-color-action-destructive-hover: oklch(0.55 0.2 25 / 0.9);

  --dds-color-border-default: oklch(0.9 0 0);
  --dds-color-border-input: oklch(0.9 0 0);
  --dds-color-border-sidebar: oklch(0.28 0.04 160);
  --dds-color-focus-ring: oklch(0.35 0.12 160);

  --dds-color-accent: oklch(0.94 0.03 160);
  --dds-color-accent-foreground: oklch(0.25 0.08 160);

  --dds-color-sidebar-primary: oklch(0.45 0.12 160);
  --dds-color-sidebar-primary-foreground: oklch(0.98 0 0);
  --dds-color-sidebar-accent: oklch(0.28 0.06 160);
  --dds-color-sidebar-accent-foreground: oklch(0.92 0 0);

  --dds-color-status-success: oklch(0.45 0.12 160);
  --dds-color-status-success-foreground: oklch(0.98 0 0);
  --dds-color-status-warning: oklch(0.75 0.15 85);
  --dds-color-status-warning-foreground: oklch(0.25 0.05 85);
  --dds-color-status-danger: oklch(0.55 0.2 25);
  --dds-color-status-danger-foreground: oklch(0.98 0 0);
  --dds-color-status-info: oklch(0.55 0.12 240);
  --dds-color-status-info-foreground: oklch(0.98 0 0);

  /* Badge semantic tokens — resolved from primitives */
  --dds-badge-success-bg: var(--dds-emerald-100);
  --dds-badge-success-color: oklch(0.28 0.1 160); /* emerald-800 equivalent */
  --dds-badge-success-ring: oklch(0.4 0.12 160 / 0.2);
  --dds-badge-warning-bg: oklch(0.95 0.06 85);
  --dds-badge-warning-color: oklch(0.3 0.08 85);
  --dds-badge-warning-ring: oklch(0.65 0.15 85 / 0.2);
  --dds-badge-danger-bg: oklch(0.93 0.06 25);
  --dds-badge-danger-color: oklch(0.3 0.12 25);
  --dds-badge-danger-ring: oklch(0.55 0.2 25 / 0.2);
  --dds-badge-info-bg: oklch(0.93 0.04 240);
  --dds-badge-info-color: oklch(0.28 0.1 240);
  --dds-badge-info-ring: oklch(0.55 0.12 240 / 0.2);

  --dds-color-chart-1: oklch(0.35 0.12 160);
  --dds-color-chart-2: oklch(0.5 0.1 160);
  --dds-color-chart-3: oklch(0.65 0.08 160);
  --dds-color-chart-4: oklch(0.55 0.02 260);
  --dds-color-chart-5: oklch(0.4 0.01 260);
}

/* ── Dark Mode ── */
[data-theme='dark'] {
  --dds-color-bg-default: oklch(0.12 0 0);
  --dds-color-bg-subtle: oklch(0.22 0 0);
  --dds-color-bg-card: oklch(0.16 0.01 160);
  --dds-color-bg-popover: oklch(0.16 0.01 160);
  --dds-color-bg-input: oklch(0.22 0.01 160);
  --dds-color-bg-muted: oklch(0.22 0 0);
  --dds-color-bg-sidebar: oklch(0.14 0.03 160);

  --dds-color-text-default: oklch(0.95 0 0);
  --dds-color-text-muted: oklch(0.65 0 0);
  --dds-color-text-on-primary: oklch(0.12 0 0);
  --dds-color-text-on-sidebar: oklch(0.92 0 0);
  --dds-color-text-muted-on-sidebar: oklch(0.92 0 0 / 0.5);

  --dds-color-action-primary: oklch(0.55 0.14 160);
  --dds-color-action-primary-hover: oklch(0.55 0.14 160 / 0.9);
  --dds-color-action-primary-foreground: oklch(0.12 0 0);
  --dds-color-action-secondary: oklch(0.22 0.01 160);
  --dds-color-action-ghost-hover: oklch(0.25 0.04 160);
  --dds-color-action-destructive: oklch(0.5 0.18 25);

  --dds-color-border-default: oklch(0.25 0.02 160);
  --dds-color-border-input: oklch(0.22 0.01 160);
  --dds-color-border-sidebar: oklch(0.22 0.03 160);
  --dds-color-focus-ring: oklch(0.55 0.14 160);

  --dds-color-accent: oklch(0.25 0.04 160);
  --dds-color-accent-foreground: oklch(0.85 0.06 160);

  --dds-color-sidebar-primary: oklch(0.55 0.14 160);
  --dds-color-sidebar-accent: oklch(0.22 0.04 160);

  --dds-color-status-success: oklch(0.55 0.14 160);
  --dds-color-status-success-foreground: oklch(0.12 0 0);
  --dds-color-status-warning: oklch(0.8 0.12 85);
  --dds-color-status-warning-foreground: oklch(0.2 0.04 85);
  --dds-color-status-danger: oklch(0.5 0.18 25);
  --dds-color-status-info: oklch(0.6 0.1 240);
  --dds-color-status-info-foreground: oklch(0.12 0 0);

  --dds-badge-success-bg: oklch(0.22 0.08 160 / 0.3);
  --dds-badge-success-color: oklch(0.65 0.1 160);
  --dds-badge-success-ring: oklch(0.65 0.1 160 / 0.2);
  --dds-badge-warning-bg: oklch(0.4 0.08 85 / 0.3);
  --dds-badge-warning-color: oklch(0.8 0.12 85);
  --dds-badge-warning-ring: oklch(0.8 0.12 85 / 0.2);
  --dds-badge-danger-bg: oklch(0.3 0.1 25 / 0.3);
  --dds-badge-danger-color: oklch(0.7 0.15 25);
  --dds-badge-danger-ring: oklch(0.7 0.15 25 / 0.2);
  --dds-badge-info-bg: oklch(0.25 0.08 240 / 0.3);
  --dds-badge-info-color: oklch(0.7 0.1 240);
  --dds-badge-info-ring: oklch(0.7 0.1 240 / 0.2);

  --dds-color-chart-1: oklch(0.55 0.14 160);
  --dds-color-chart-2: oklch(0.65 0.12 160);
  --dds-color-chart-3: oklch(0.75 0.08 160);
  --dds-color-chart-4: oklch(0.6 0.02 260);
  --dds-color-chart-5: oklch(0.45 0.01 260);
}

/* Honour OS preference when no [data-theme] attribute is set */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    /* mirror dark overrides here */
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 3.4 JavaScript/TypeScript Token Export

```ts
// packages/tokens/src/tokens.ts
// Auto-generated — do not edit manually. Run: pnpm build:tokens

export const tokens = {
  color: {
    emerald: {
      50: 'oklch(0.97 0.02 160)',
      // ...
      950: 'oklch(0.15 0.06 160)',
    },
    silver: {
      /* ... */
    },
  },
  space: {
    1: '4px',
    2: '8px',
    // ...
  },
  // etc.
} as const;

export type TokenKey = keyof typeof tokens;
```

### 3.5 Dark Mode Strategy

- Primary mechanism: `[data-theme="dark"]` attribute on `<html>` (SSR-safe, no flash)
- Fallback: `@media (prefers-color-scheme: dark)` for users with no JS or no preference set
- Precedence: explicit `[data-theme]` attribute always wins over media query
- A `ThemeProvider` component (in `@dds/emerald`) manages this via React context

---

## 4. Component Phasing

### Phase 0 — Infrastructure (Week 1)

Set up monorepo, tooling, CI, empty package shells. No components yet.

- [ ] Turborepo + pnpm workspace
- [ ] Shared tsconfig, eslint config, Vitest config
- [ ] Token package with full `tokens.css` + `tokens.ts` output
- [ ] GitHub Actions CI (lint + test + build)
- [ ] Changesets configured
- [ ] Storybook v10 scaffold in `apps/docs`
- [ ] `scaffolding.mjs` CLI
- [ ] `AGENTS.md` constraints file

### Phase 1 — True Primitives (Weeks 2–4)

The atoms that everything else is built from. No Radix deps except for accessibility utilities.

| #   | Component                | Radix Primitive                   | Notes                                     |
| --- | ------------------------ | --------------------------------- | ----------------------------------------- |
| 1   | `Button`                 | `@radix-ui/react-slot` (asChild)  | All 6 variants, 5 sizes                   |
| 2   | `Input`                  | none (native `<input>`)           | States: default, focus, disabled, invalid |
| 3   | `Badge`                  | none                              | All 7 variants, 3 sizes                   |
| 4   | `Avatar` + `AvatarGroup` | `@radix-ui/react-avatar`          | 3 sizes, fallback, overlap group          |
| 5   | `Divider`                | none                              | Horizontal, vertical, labelled            |
| 6   | `VisuallyHidden`         | `@radix-ui/react-visually-hidden` | Accessibility utility                     |

### Phase 2 — Container & Layout Atoms (Week 5)

| #   | Component                 | Notes                                                                       |
| --- | ------------------------- | --------------------------------------------------------------------------- |
| 7   | `Card` (+ sub-components) | CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter |
| 8   | `Stack`                   | gap xs/sm/md/lg/xl, direction h/v                                           |
| 9   | `ContentGrid`             | 1–4 cols, responsive                                                        |

### Phase 3 — Navigation & Chrome (Weeks 6–7)

| #   | Component                      | Radix Primitive | Notes                                |
| --- | ------------------------------ | --------------- | ------------------------------------ |
| 10  | `NavItem`                      | none            | 5 variants, 3 sizes, collapsed state |
| 11  | `Sidebar` + `SidebarSection`   | none            | Expand/collapse, dark-always bg      |
| 12  | `ActionBar` + `ActionBarGroup` | none            | Top/bottom, sticky                   |
| 13  | `PageHeader`                   | none            | Breadcrumbs, title, actions          |
| 14  | `SectionHeader`                | none            | Label overline, display title, desc  |

### Phase 4 — Data Display (Weeks 8–9)

| #   | Component         | Notes                                             |
| --- | ----------------- | ------------------------------------------------- |
| 15  | `StatusIndicator` | 5 statuses, pulse animation, label                |
| 16  | `KPICard`         | Extends Card, highlighted variant with top stripe |
| 17  | `Stat`            | 3 sizes, trend direction                          |
| 18  | `ProgressBar`     | 3 sizes, 5 variants — `rounded-full` exception    |
| 19  | `DataTable`       | Striped, hoverable, compact, column config        |

### Phase 5 — Feedback & Utility (Week 10)

| #   | Component       | Notes                                |
| --- | --------------- | ------------------------------------ |
| 20  | `EmptyState`    | Icon, title, description, CTA        |
| 21  | `SkipLink`      | Accessibility — skip to main content |
| 22  | `ThemeProvider` | `[data-theme]` attribute manager     |

### Phase 6 — Apps & Publishing (Weeks 11–12)

- Landing page (`apps/landing`)
- Storybook polish, token docs page
- npm publish `@dds/emerald-tokens` and `@dds/emerald`
- README, CONTRIBUTING, LICENSE

### Phase 7+ — Domain Components (Future)

To be scoped separately after Phase 6 ships. Will include forms, modals, toasts, charts, and any application-specific patterns extracted from v0 prototype domain sections.

---

## 5. SCSS Module Architecture

### 5.1 File Structure per Component

```
packages/components/src/components/Button/
├── Button.tsx
├── Button.module.scss
├── Button.test.tsx
├── Button.stories.tsx
└── index.ts
```

### 5.2 SCSS Module Conventions

```scss
// Button.module.scss

// ── Import shared SCSS utilities (not tailwind) ──
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;

.root {
  // Always consume Tier 2 tokens
  // Never hardcode color values
  // Never use Tier 1 directly in components

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--dds-space-3);
  white-space: nowrap;
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-medium);
  border-radius: var(--dds-radius-none); // always 0px — do not override
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    color var(--dds-duration-fast) var(--dds-ease-standard),
    background-color var(--dds-duration-fast) var(--dds-ease-standard),
    border-color var(--dds-duration-fast) var(--dds-ease-standard);
  outline: 3px solid transparent;
  outline-offset: 2px;

  // Default size
  height: 36px; // h-9
  padding: 0 var(--dds-space-4);

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  &:focus-visible {
    outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5);
  }
}

// Variants
.primary {
  background-color: var(--dds-color-action-primary);
  color: var(--dds-color-action-primary-foreground);

  &:hover:not(:disabled) {
    background-color: var(--dds-color-action-primary-hover);
  }
}

// Sizes
.sm {
  height: 32px; // h-8
  padding: 0 var(--dds-space-3);
  font-size: var(--dds-font-size-sm);
  gap: var(--dds-space-1-5);
}

// etc.
```

### 5.3 Shared SCSS Utilities

```
packages/components/src/styles/
├── _mixins.scss       # focus-ring, visually-hidden, etc.
├── _breakpoints.scss  # sm/md/lg/xl as SCSS variables
├── _typography.scss   # display/body/label/mono utility mixins
├── _reset.scss        # component-level reset
└── index.scss         # re-exports all, not used directly
```

### 5.4 Global Base Styles

A single `packages/components/src/styles/base.css` (not a module) provides:

- Font feature settings on body
- `text-rendering: optimizeLegibility`
- `scroll-behavior: smooth` on `html`
- Global focus-visible rule
- `prefers-reduced-motion` media query
- `touch-action` for touch targets

Consumers import this once: `import '@dds/emerald/styles'`

---

## 6. Storybook Setup

### 6.1 Version & Config

Use **Storybook 9.x** (stable at time of writing) or v10 RC once stable. The `@storybook/nextjs` framework is used for `apps/docs`.

```
apps/docs/
├── .storybook/
│   ├── main.ts         # addons, framework config
│   ├── preview.ts      # global decorators, theme provider, token import
│   └── theme.ts        # custom Storybook manager theme using dds tokens
├── src/
│   └── docs/           # MDX documentation pages
│       ├── Introduction.mdx
│       ├── Tokens.mdx
│       ├── Typography.mdx
│       └── Colors.mdx
```

### 6.2 Addons

```ts
// .storybook/main.ts
addons: [
  '@storybook/addon-docs', // MDX + auto-generated API docs
  '@storybook/addon-a11y', // Axe accessibility audit per story
  '@storybook/addon-themes', // Light/dark toggle via [data-theme]
  '@storybook/addon-interactions', // play() function testing in UI
  '@chromatic-com/storybook', // Visual regression (optional)
];
```

### 6.3 Story Conventions

Each component has a `*.stories.tsx` file. Every variant, size, and interactive state must have its own named story. Stories use `play()` functions for interaction tests.

```tsx
// Button.stories.tsx
export const Primary: Story = {
  args: { variant: 'primary', children: 'Button' },
};

export const FocusVisible: Story = {
  args: { variant: 'primary', children: 'Focused' },
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button');
    await userEvent.tab();
    await expect(btn).toHaveFocus();
  },
};
```

### 6.4 Token Documentation Page

A dedicated `Tokens.mdx` page renders live swatches, spacing scale, typography scale, and motion tokens by reading CSS custom properties from the document at runtime. This is the single source of truth for visual documentation.

---

## 7. Testing Strategy (TDD)

### 7.1 Stack

| Tool                            | Role                                                          |
| ------------------------------- | ------------------------------------------------------------- |
| **Vitest**                      | Test runner — fast, native ESM, compatible with Storybook v10 |
| **React Testing Library**       | Component tests — accessible query patterns                   |
| **@testing-library/user-event** | Realistic user interaction simulation                         |
| **@testing-library/jest-dom**   | Custom matchers (`toBeVisible`, `toHaveClass`, etc.)          |
| **Storybook Test Runner**       | Runs `play()` stories as tests via Playwright                 |
| **axe-core** (`jest-axe`)       | Automated accessibility assertions in unit tests              |

### 7.2 TDD Workflow per Component

Every component follows this sequence — no exceptions:

```
1. Write test file (all cases failing)
2. Implement component until all tests pass
3. Write Storybook stories
4. Run a11y audit (jest-axe + addon-a11y)
5. Review visually in Storybook
6. PR — CI must be green before merge
```

### 7.3 What to Test

Every component test file must cover:

```tsx
describe('ComponentName', () => {
  // 1. Renders without crashing
  it('renders', () => { ... });

  // 2. All variants render correctly
  it('renders all variants', () => { ... });

  // 3. All sizes render correctly
  it('renders all sizes', () => { ... });

  // 4. Disabled state
  it('is not interactive when disabled', () => { ... });

  // 5. Keyboard interaction (if interactive)
  it('is keyboard accessible', async () => { ... });

  // 6. Focus management
  it('shows focus ring on focus-visible', async () => { ... });

  // 7. ARIA attributes
  it('has correct aria attributes', () => { ... });

  // 8. Accessibility audit
  it('has no a11y violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // 9. Custom className forwarding
  it('forwards className', () => { ... });

  // 10. Ref forwarding
  it('forwards ref', () => { ... });
});
```

### 7.4 Shared Vitest Config

```ts
// tooling/vitest/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: { lines: 80, functions: 80, branches: 80 },
    },
  },
});
```

---

## 8. CI/CD Pipeline

### 8.1 GitHub Actions — `ci.yml` (every PR)

```yaml
jobs:
  lint: # ESLint + TypeScript check
  test: # Vitest (all packages)
  build: # Turborepo build
  storybook: # Storybook build (smoke test)
  a11y: # Storybook Test Runner (axe)
```

All jobs must pass before merge. No exceptions enforced via branch protection rules.

### 8.2 GitHub Actions — `release.yml` (merge to main)

```yaml
# Uses changesets/action
jobs:
  release:
    - Create/update "Version Packages" PR via changesets
    - On merge of that PR: publish to npm
```

### 8.3 Changesets Configuration

```json
// .changeset/config.json
{
  "changelog": "@changesets/changelog-github",
  "commit": false,
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["docs", "landing"]
}
```

### 8.4 Branch Strategy

```
main          → production, protected
dev           → integration branch
feat/*        → feature branches
fix/*         → bug fix branches
chore/*       → tooling/config changes
```

PRs must target `dev`. Only `dev → main` merges trigger releases.

### 8.5 Additional Tooling

```
ESLint:      @dds/eslint-config (extends eslint-plugin-react, jsx-a11y, import)
TypeScript:  strict mode, noUncheckedIndexedAccess: true
Prettier:    enforced via lint-staged + husky pre-commit hook
Commitlint:  conventional commits enforced
```

---

## 9. npm Packaging

### 9.1 Package Names

```
@dds/emerald-tokens   →  CSS + JS token export (no React dep)
@dds/emerald          →  Full component library
```

### 9.2 `package.json` Structure (components)

```json
{
  "name": "@dds/emerald",
  "version": "0.1.0",
  "description": "Emerald Design System by Digital Dev Studio",
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./styles": "./dist/styles.css"
  },
  "files": ["dist"],
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "sideEffects": ["**/*.css"]
}
```

### 9.3 Build Tool

Use **tsup** for building both packages. It handles ESM + CJS dual output, type declarations, and CSS bundling with minimal config.

```ts
// packages/components/tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
  injectStyle: false, // CSS emitted separately
});
```

### 9.4 Public API Surface

`packages/components/src/index.ts` must explicitly export every component and type. Named exports only — no default exports from the package root.

```ts
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';
// ...
```

---

## 10. Scaffolding CLI

`scaffolding.mjs` is a Node.js ESM script at the repo root. Run with:

```bash
node scaffolding.mjs ComponentName [--phase 1]
```

### 10.1 What It Generates

```
packages/components/src/components/{Name}/
  {Name}.tsx           ← component skeleton
  {Name}.module.scss   ← SCSS module skeleton
  {Name}.test.tsx      ← full TDD test skeleton
  {Name}.stories.tsx   ← Storybook stories skeleton
  index.ts             ← re-export
```

It also automatically appends the export line to `packages/components/src/index.ts`.

### 10.2 Template Content

```js
// scaffolding.mjs (abbreviated)
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const [, , name] = process.argv;
if (!name) {
  console.error('Usage: node scaffolding.mjs ComponentName');
  process.exit(1);
}

const dir = `packages/components/src/components/${name}`;
mkdirSync(dir, { recursive: true });

// Component template
writeFileSync(
  join(dir, `${name}.tsx`),
  `
import React from 'react';
import styles from './${name}.module.scss';
import clsx from 'clsx';

export interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

export const ${name} = React.forwardRef<HTMLDivElement, ${name}Props>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(styles.root, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

${name}.displayName = '${name}';
`.trimStart()
);

// SCSS template
writeFileSync(
  join(dir, `${name}.module.scss`),
  `
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;

.root {
  // TODO: implement ${name} styles
  // Always use --dds-* tokens. Never hardcode values.
}
`.trimStart()
);

// Test template
writeFileSync(
  join(dir, `${name}.test.tsx`),
  `
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ${name} } from './${name}';

expect.extend(toHaveNoViolations);

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name}>content</${name}>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('forwards className', () => {
    render(<${name} className="custom">content</${name}>);
    expect(screen.getByText('content')).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<${name} ref={ref}>content</${name}>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has no a11y violations', async () => {
    const { container } = render(<${name}>content</${name}>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // TODO: add variant tests, state tests, interaction tests
});
`.trimStart()
);

// Stories template
writeFileSync(
  join(dir, `${name}.stories.tsx`),
  `
import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  args: {
    children: '${name}',
  },
};
`.trimStart()
);

// index.ts
writeFileSync(
  join(dir, 'index.ts'),
  `export { ${name} } from './${name}';\nexport type { ${name}Props } from './${name}';\n`
);

console.log(`✅ Scaffolded ${name} in ${dir}`);
```

---

## 11. AI Agent Rules & Prompts

### 11.1 `AGENTS.md` — Mandatory Constraints File

Place at repo root. Both Antigravity and Codex must be instructed to read this file before any task.

```markdown
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
```

### 11.2 Antigravity — Per-Component Prompt Template

Use this template when assigning a component task to Antigravity:

```
## Task: Implement `{ComponentName}` for DDS Emerald design system

### Before starting
1. Read `AGENTS.md` in full
2. Read `packages/tokens/src/tokens.css` to understand available tokens
3. Review the test file already scaffolded at `packages/components/src/components/{ComponentName}/{ComponentName}.test.tsx`

### Component specification

**Component:** `{ComponentName}`
**Radix primitive:** {e.g. `@radix-ui/react-avatar` | none}
**Location:** `packages/components/src/components/{ComponentName}/`

**Props:**
{list props with types}

**Variants:**
{list variants exactly as specified}

**Sizes:**
{list sizes with exact px values}

**States:**
{list: default, hover, focus-visible, disabled, etc. with exact token/style for each}

**Critical design rules for this component:**
{extract component-specific rules from Section 9 of the extraction report}

### Deliverables — in this order
1. Make all existing tests pass (TDD — tests are already written)
2. Implement `{ComponentName}.tsx` — React component using Radix + forwardRef
3. Implement `{ComponentName}.module.scss` — SCSS module using only `--dds-*` tokens
4. Add any missing test cases for edge cases you identify
5. Add all required stories to `{ComponentName}.stories.tsx`
6. Export from `packages/components/src/index.ts`

### Definition of done
- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe a11y test passes
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] All variants/sizes/states are represented in Storybook stories
- [ ] No Tailwind classes anywhere in the output
- [ ] No hardcoded color values anywhere in the SCSS
```

### 11.3 Antigravity — Token Package Prompt

```
## Task: Implement `@dds/emerald-tokens`

Read `AGENTS.md` first.

Implement the tokens package at `packages/tokens/` with:
1. `src/tokens.css` — all CSS custom properties exactly as specified in the token architecture section of the strategy document. Light mode in `:root`, dark mode in `[data-theme="dark"]`, media query fallback.
2. `src/tokens.ts` — TypeScript object mirroring all token values, fully typed with `as const`
3. `tsup.config.ts` — builds to `dist/tokens.css` and `dist/index.js` + `dist/index.d.ts`
4. `package.json` — package name `@dds/emerald-tokens`, exports `"."` for JS and `"./styles"` for CSS

No React. No component code. Tokens only.
Tests: write a Vitest test that loads the CSS file, parses it, and asserts every expected `--dds-*` property is present.
```

---

## 12. Landing Page

**Location:** `apps/landing/` — Next.js 14+ app directory
**Purpose:** Brand introduction → routes to Storybook docs
**Style:** Uses `@dds/emerald` from the monorepo directly

### Structure

```
/                   Hero section
  ↓
  "Design for precision, built for scale."
  [View Documentation →]   ← links to deployed Storybook

  What's in Emerald    3-column feature grid
  Tokens               Visual token preview (color, type)
  Components           Static screenshot of Storybook
  Footer               Links, version badge, npm install snippet
```

### Key sections

**Hero:** Barlow Condensed display headline, full-width, dark emerald background panel on the right (mirrors sidebar aesthetic). Single CTA button linking to Storybook.

**Feature grid:** 2×2 grid same as prototype. Feature tiles: Tokens, Components, Accessibility, Dark Mode.

**Install snippet:** Monospace code block showing `npm install @dds/emerald @dds/emerald-tokens`

**Token preview:** Live color swatches rendered from CSS custom properties.

**No external analytics, no cookie banners, no ads.** Anthropic policy reminder: Claude products are ad-free; this page follows the same philosophy.

---

## 13. Design Constraints Registry

This is the canonical list of hard rules. Any deviation requires explicit sign-off and a design decision record (DDR).

| Constraint         | Rule                                                                  | Exception                                                            |
| ------------------ | --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Border radius      | Always `0px` (via `--dds-radius-none`)                                | `rounded-full` for Avatar, StatusIndicator, AvatarGroup, ProgressBar |
| Colors             | oklch only                                                            | None                                                                 |
| Color consumption  | Tier 2 tokens in components only                                      | None                                                                 |
| CSS prefix         | All custom properties prefixed `--dds-`                               | None                                                                 |
| Tailwind           | Never                                                                 | None                                                                 |
| Inline styles      | Never                                                                 | None                                                                 |
| Font stack         | Display/Sans/Mono via token variables only                            | None                                                                 |
| Tabular data       | Always `font-variant-numeric: tabular-nums`                           | None                                                                 |
| Focus ring         | 3px outline, `var(--dds-color-focus-ring)` at 50% opacity, 2px offset | None                                                                 |
| Touch target       | `min-height: 44px` on all interactive nav items                       | None                                                                 |
| Sidebar bg         | Always dark (`--dds-color-bg-sidebar`) in both modes                  | None                                                                 |
| KPI highlighted    | Must include 4px absolute top stripe                                  | None                                                                 |
| ProgressBar radius | `--dds-radius-full` on track and fill only                            | None                                                                 |
| forwardRef         | All components must use it                                            | Pure utility/context components                                      |
| Testing            | TDD — tests before implementation                                     | None                                                                 |
| a11y               | axe test in every component test file                                 | None                                                                 |
| Changesets         | Every PR touching packages needs a changeset                          | Docs-only changes                                                    |
| New components     | Must start from scaffolding.mjs                                       | None                                                                 |

---

_End of strategy document. Next action: execute Phase 0 — run `scaffolding.mjs` setup and establish monorepo skeleton._

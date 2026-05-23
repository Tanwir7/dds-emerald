# Emerald Design System (DDS)

Emerald is Digital Dev Studio's design system: design tokens, accessible React components, and Storybook documentation for building consistent, data-dense product UI. Components are built on Radix primitives, styled with SCSS Modules and `--dds-*` tokens, and target **WCAG 2.2 AA**.

> Why this exists: Emerald was designed without a Figma library. The design language is codified in code and docs — start with [Design Principles](docs/design-principles.md).

## Packages

| Package               | Path                  | Description                                                     |
| --------------------- | --------------------- | --------------------------------------------------------------- |
| `@dds/emerald`        | `packages/components` | React component library (ESM + CJS, typed).                     |
| `@dds/emerald-tokens` | `packages/tokens`     | Design tokens — OKLCH colors, spacing, type, motion (CSS + JS). |
| `docs`                | `apps/docs`           | Storybook 10 documentation site (not published).                |
| `@dds/*-config`       | `tooling/*`           | Shared ESLint, Stylelint, TypeScript, and Vitest configs.       |

## Install (consumers)

```bash
pnpm add @dds/emerald @dds/emerald-tokens
```

```tsx
import '@dds/emerald-tokens/styles';
import '@dds/emerald/styles';
import { Button } from '@dds/emerald';
```

## Develop

Requires Node ≥ 22 and pnpm (pinned via Volta). From the repo root:

```bash
pnpm install
pnpm dev            # Storybook at http://localhost:6006
pnpm build          # build all packages + Storybook
pnpm test           # unit tests (Vitest + axe) for components & tokens
pnpm test:storybook # Storybook browser tests (Playwright/Chromium)
pnpm lint           # ESLint
pnpm stylelint      # SCSS/CSS — enforces token-only colors
pnpm typecheck      # tsc
```

### Quality gates (all run in CI)

| Gate           | Command                                           | What it protects                                                |
| -------------- | ------------------------------------------------- | --------------------------------------------------------------- |
| Lint           | `pnpm lint`                                       | TS/React/a11y lint rules                                        |
| Stylelint      | `pnpm stylelint`                                  | No hardcoded colors — `--dds-*` tokens / OKLCH only             |
| Token contrast | `pnpm --filter @dds/emerald-tokens test:contrast` | WCAG AA contrast on semantic color pairs (light + dark)         |
| Types          | `pnpm typecheck`                                  | Strict TypeScript                                               |
| Unit + a11y    | `pnpm test`                                       | Behavior + axe per component                                    |
| Story a11y     | `pnpm test:storybook`                             | axe across every story (error level) in a real browser          |
| API surface    | `pnpm api:check`                                  | Public API changes are reviewed (see `packages/*/etc/*.api.md`) |
| Bundle size    | `pnpm size`                                       | Per-package gzip budgets (`.size-limit.json`)                   |
| Generated docs | `pnpm docs:check`                                 | Token docs stay in sync with `tokens.css`                       |

## Add a component

Use the scaffolder, then follow [`CONTRIBUTING.md`](CONTRIBUTING.md) and the rules in [`AGENTS.md`](AGENTS.md):

```bash
node scaffolding.mjs
```

## Release

Publishing is automated with [Changesets](https://github.com/changesets/changesets). Add a changeset describing your change, and merging to `main` publishes the affected packages to npm:

```bash
pnpm changeset
```

## Documentation

- [Design Principles](docs/design-principles.md) — the source of truth for color, spacing, type, shape, motion, and variant usage.
- [Accessibility](docs/accessibility.md) — WCAG 2.2 AA baseline and review checklist.
- [AGENTS.md](AGENTS.md) — engineering conventions for component work.
- Storybook (`pnpm dev`) — live component docs under **Foundations → Design Principles**.

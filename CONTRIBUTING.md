# Contributing to Emerald

Read [`AGENTS.md`](AGENTS.md) and [`docs/design-principles.md`](docs/design-principles.md) before making changes. This guide is the practical workflow; those documents are the rules and rationale.

## Setup

```bash
pnpm install   # Node >= 22, pnpm (pinned via Volta)
pnpm dev       # Storybook at http://localhost:6006
```

## Adding a component

1. Scaffold it (generates `.tsx`, `.module.scss`, `.test.tsx`, `.stories.tsx`, `.stories.module.scss`, `index.ts`):
   ```bash
   node scaffolding.mjs
   ```
2. Implement against the checklist below.
3. Export it from `packages/components/src/index.ts`.
4. Add a Storybook story under the correct title group (`Core Components/…`, `Grouped Components/…`, `App Patterns/…`, etc.).

### Component checklist

- [ ] `React.forwardRef`; accepts and forwards `className` via `clsx`.
- [ ] Variants/sizes typed as unions, mapped with `getRequiredClassName`.
- [ ] Radix used for interactive a11y primitives; **no `@radix-ui/*` types in public props**.
- [ ] Styles in `ComponentName.module.scss` using `--dds-*` tokens only — **no hardcoded colors, no inline styles, no Tailwind**. Story-only styles go in `*.stories.module.scss`.
- [ ] Border radius `--dds-radius-none` unless the spec calls for `--dds-radius-full`.
- [ ] Focus ring via the shared mixin; keyboard + screen-reader support.
- [ ] Icons are `LucideIcon` passed as components; sized via tokens, not the `size` prop.
- [ ] `*.test.tsx` with behavior coverage **and** an axe assertion.
- [ ] Story `parameters.a11y.context` scoped to the story's `.storyA11yScope`.

## Quality gates

Everything below runs in CI; run locally before pushing:

```bash
pnpm lint && pnpm stylelint && pnpm typecheck && pnpm test
pnpm --filter @dds/emerald-tokens test:contrast
pnpm build && pnpm check:dist && pnpm api:check && pnpm size
```

- **Stylelint** (`@dds/stylelint-config`) fails on hardcoded colors in component SCSS. `rgb()` is allowed only in shadow properties (matching the `--dds-shadow-*` convention); define color values in `packages/tokens/src/tokens.css`.
- **Token contrast** validates every semantic color pair against WCAG AA in both themes. If you add a contrast-bearing pair, register it in `packages/tokens/scripts/check-contrast.mjs`.
- **API surface:** the public API is snapshotted in `packages/*/etc/*.api.md`. If you intentionally change the public API, regenerate and commit the reports:
  ```bash
  pnpm build && pnpm api:update
  ```
- **Bundle size:** budgets live in `.size-limit.json`. If a change legitimately grows a bundle, update the limit in the same PR with justification.
- **Token docs:** after editing `tokens.css`, run `pnpm docs:generate` and commit the regenerated MDX.

## Commits & releases

- Commits follow **Conventional Commits** (enforced by commitlint): `type(scope): subject`, lowercase, no trailing period. Types: `build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test`.
- Add a **changeset** for any consumer-facing change:
  ```bash
  pnpm changeset
  ```
  Merging to `main` publishes affected packages to npm via the Changesets release workflow.

## Visual regression (Chromatic)

The `@chromatic-com/storybook` addon is installed but **not yet gated in CI**. It is intentionally deferred until the component UI stabilizes at v1 — running it during active visual iteration produces mostly expected diffs and burns the free-tier snapshot quota. To enable later: create a Chromatic project, add a `CHROMATIC_PROJECT_TOKEN` repo secret, and add a `chromatic` CI job that builds Storybook and runs the Chromatic action.

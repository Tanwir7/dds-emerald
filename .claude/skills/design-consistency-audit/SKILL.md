---
name: design-consistency-audit
description: Audit DDS Emerald for design-system drift — hardcoded colors/fonts/spacing, primitive-token leakage, missing axe/test coverage, and WCAG contrast regressions. Use when reviewing a component, before a release, or when checking whether the codebase still matches docs/design-principles.md.
---

# Design Consistency Audit

Check whether Emerald still adheres to its own design principles. Report findings grouped by severity; do not fix unless asked.

## Reference

- `docs/design-principles.md` — the source of truth (color, spacing, type, shape, motion, variant usage, token governance).
- `AGENTS.md` — component/styling rules.
- `packages/tokens/src/tokens.css` — the only place raw color values may live.

## Steps

1. **Hardcoded colors** (Tier-1 / raw values in component SCSS):
   - Run `pnpm stylelint` — this is the authoritative gate (bans hex, named colors, and `rgb()/hsl()` in color properties; shadows are exempt by design).
   - Also grep for primitive-token leakage in runtime SCSS (components should consume Tier-2 semantic tokens, not primitives):
     `grep -rnE "var\(--dds-(emerald|silver)-[0-9]" packages/components/src --include="*.module.scss" | grep -v ".stories."`

2. **Contrast:** run `pnpm --filter @dds/emerald-tokens test:contrast`. If a new semantic color pair exists that isn't covered, note it should be added to `packages/tokens/scripts/check-contrast.mjs`.

3. **Hardcoded layout / type:** grep component SCSS for raw `px`/`rem` font-sizes and `font-family` literals, and magic pixel spacing that should use `--dds-space-*` / `--dds-font-*` tokens. Allow low-level dynamic layout primitives noted in AGENTS.md.

4. **Component contract drift** (sample or target components):
   - `React.forwardRef`, forwards `className`, uses `clsx` (not `cx`/`cn`/`classnames`).
   - No `@radix-ui/*` types in public props.
   - Icons typed `LucideIcon`, passed as components.
   - Border radius is `--dds-radius-none` unless spec allows `--dds-radius-full`.

5. **Coverage:** every `components/*` and `patterns/*` has a `*.test.tsx` with an axe assertion; every component has a `*.stories.tsx` with a correct title group.

6. **Public API:** run `pnpm build && pnpm api:check` to confirm no unreviewed public-API changes; `pnpm size` for bundle budgets.

## Output

A short report: **Blocking** (gate failures: stylelint, contrast, api/size), **Drift** (primitive leakage, missing tests/stories, variant misuse), and **Notes** (judgment calls worth a human look). Cite `file:line`.

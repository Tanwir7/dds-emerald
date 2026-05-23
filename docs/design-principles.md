# Emerald Design Principles

This is the source-of-truth for _why_ Emerald looks and behaves the way it does. Emerald was designed without a Figma library or external brand guidelines, so this document codifies the decisions that are otherwise only implicit in `packages/tokens/src/tokens.css` and `AGENTS.md`. When a design question isn't answered here, in component instructions, or in tokens, **ask before inventing a default**.

Token names below are the canonical API. Values are quoted from `tokens.css`; if they ever disagree, the token file wins and this document should be updated.

---

## 1. Identity

- **System:** Emerald · **Company:** Digital Dev Studio (DDS) · **Prefix:** `dds`
- **Visual stance:** clean, sharp, enterprise-dense. Square corners, generous use of a single neutral, one confident brand hue, and high text contrast. Emerald is built for data-rich product UI (tables, forms, dashboards) first and marketing surfaces second.

---

## 2. Color

### Philosophy

- **All colors are authored in OKLCH.** OKLCH is perceptually uniform: changing lightness (`L`) moves perceived brightness predictably, which makes the light/dark ramps and contrast math reliable. This is why the palette can be reasoned about and validated programmatically.
- **Two primitive ramps only:** `--dds-emerald-{50…950}` (brand, hue 160) and `--dds-silver-{50…950}` (neutral, chroma 0). Status hues (warning ~85, danger ~25, info ~240) appear only at the semantic tier. Keeping primitives minimal is deliberate — breadth comes from semantic mapping, not from more raw colors.
- **Chroma discipline:** the emerald ramp holds hue 160 and tapers chroma at the extremes (`50` = `0.02`, `500` = `0.12`, `950` = `0.06`) so the lightest/darkest steps don't oversaturate.

### Three-tier token model

1. **Tier 1 — primitives:** raw ramps and scales (`--dds-emerald-600`, `--dds-silver-200`). Never consumed directly in component SCSS.
2. **Tier 2 — semantic:** intent-named tokens that components consume (`--dds-color-bg-default`, `--dds-color-action-primary`, `--dds-color-text-muted`, `--dds-color-border-default`). These remap per theme.
3. **Tier 3 — component/feature:** narrow tokens for specific surfaces (`--dds-tag-success-bg`, `--dds-color-chart-1`).

**Rule:** components consume Tier 2 (and Tier 3 where applicable). Reaching into Tier 1 from a component is a smell — add or use a semantic token instead.

### Contrast is a hard commitment (WCAG 2.2 AA)

Every semantic foreground/background pair must meet AA: **4.5:1** for body text, **3:1** for large text and non-text UI (borders, control boundaries). This is not aspirational — it is enforced by `packages/tokens/scripts/check-contrast.mjs` (run `pnpm --filter @dds/emerald-tokens test:contrast`), which resolves the token pairs in both themes, converts OKLCH to relative luminance, and fails CI on any regression. The inline ratio comments in `tokens.css` are the human-readable record of the same checks.

### Theming

- Light is the `:root` default. Dark is opt-in via `[data-theme='dark']` and also tracks the OS via `@media (prefers-color-scheme: dark)` (mirrored exactly). Dark mode is **not** an inversion — several tokens are re-tuned for contrast (e.g. `bg-default` is pure `black` in dark for maximum headroom; borders move to `silver-500` because darker neutrals failed AA on black).
- Don't hardcode a color. The only place raw color values live is `tokens.css`. Stylelint (`@dds/stylelint-config`) enforces this in CI.

---

## 3. Spacing

- Base unit **4px**, exposed as `--dds-space-*` (`-0-5` = 2px through `-24` = 96px), with half-steps at the low end (`-1-5`, `-2-5`) where fine control matters most.
- Use the scale for _all_ padding, gap, and layout offsets — no magic pixel values in component SCSS.
- **Density:** Emerald favors compact, information-dense layouts. Prefer the smaller steps for intra-component spacing and reserve the larger steps (`-12`+) for page/section rhythm.

---

## 4. Typography

- **Three families, three jobs:**
  - Display: `--dds-font-display` (Barlow Condensed) — headings, hero text.
  - Body/UI: `--dds-font-sans` (DM Sans) — default for everything interactive and textual.
  - Code/data: `--dds-font-mono` (JetBrains Mono).
- Never hardcode a `font-family`; never `@import` font files from a component (fonts ship via `@dds/emerald-tokens/fonts`).
- **Type scale** is rem-based, `--dds-font-size-{xs…7xl}` (0.75rem → 4.5rem). Weights are `normal/medium/semibold/bold` (400–700); line-heights `none/tight/snug/normal/relaxed`; letter-spacing `--dds-tracking-*`.
- **Body text** sets `font-feature-settings: "cv02","cv03","cv04","cv11"`. **Numeric/tabular data** uses `font-variant-numeric: tabular-nums` so columns align.

---

## 5. Shape & elevation

- **Border radius is `--dds-radius-none` (0px) by default.** The square aesthetic is intentional and defining; only use `--dds-radius-full` (pills/circles: avatars, switches, sliders) where a component spec calls for it. There is deliberately no `radius-sm/md` — don't introduce arbitrary rounding.
- **Elevation** is a restrained 3-step shadow ramp (`--dds-shadow-xs/sm/md`), heavier in dark mode. Shadows use `rgb(0 0 0 / a)` — black-alpha in _shadows_ is the one accepted use of `rgb()` (the stylelint color rule exempts shadow properties for this reason).

---

## 6. Motion

- Durations `--dds-duration-fast` (150ms) / `normal` (300ms) / `slow` (500ms); easing `--dds-ease-standard` (`cubic-bezier(0.4,0,0.2,1)`) and `--dds-ease-out`.
- Default interactive transitions are `fast` + `standard`. Motion is functional, not decorative.
- **Respect `prefers-reduced-motion`:** the token layer already neutralizes animations/transitions globally under that media query. Don't fight it.

---

## 7. Iconography

- Icons are Lucide, passed **as components** (`icon={Inbox}`, never `icon={<Inbox/>}`), typed `LucideIcon`.
- Size via SCSS + `--dds-icon-size-{sm,md,lg}` (14/16/32px); default `md`. Never pass `size` to a Lucide icon directly.
- Decorative icons are `aria-hidden`; semantic icons need an accessible name.

---

## 8. Accessibility (baseline, non-negotiable)

Target **WCAG 2.2 AA**. See `docs/accessibility.md` for the full review checklist. Load-bearing rules:

- All interactive elements keyboard-reachable and operable; logical focus order.
- **Focus is always an outline ring:** `outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5); outline-offset: 2px;` — use the shared mixin, don't reinvent.
- Overlays/modals trap focus and restore it on close. No focusable-but-hidden elements.
- Never rely on color alone. Native HTML before ARIA. Form controls always have a visible label or accessible name.
- Pointer targets meet WCAG 2.2 AA minimum size unless a documented exception applies (`NavItem` min height is 44px).
- Every component ships a `*.test.tsx` with axe coverage; every story is a11y-scanned at error level in CI.

---

## 9. Variant usage guidance

The judgment a Figma library would normally encode — when to reach for which variant:

- **Actions (Button/Link):**
  - `primary` — the single most important action in a view (one per context). Emerald-700 fill.
  - `secondary` — supporting actions next to a primary. Neutral fill.
  - `outline` / `ghost` — low-emphasis or toolbar/inline actions; `ghost` for the lightest footprint.
  - `destructive` — irreversible/dangerous actions only. Don't use it for emphasis.
- **Status & feedback** (Alert/Tag/status tokens): `success` (emerald), `warning` (~85), `danger` (~25), `info` (~240). Map meaning to the matching hue consistently; never repurpose a status hue for decoration.
- **Surfaces:** `bg-default` for the app canvas, `bg-card`/`bg-popover` for raised content, `bg-subtle`/`bg-muted` for quiet fills, `bg-sidebar` (always `--dds-color-bg-sidebar`) for navigation chrome.

---

## 10. Token governance

How to evolve the system without eroding consistency:

1. **New color value?** Add it to `tokens.css` in OKLCH, at the lowest tier that makes sense, with the `--dds-` prefix. If a component needs it, expose a _semantic_ (Tier 2/3) token — don't consume a primitive directly.
2. **New contrast-bearing pair?** Add it to `check-contrast.mjs` so it's protected.
3. **Naming:** intent over appearance (`--dds-color-action-primary`, not `--dds-color-green-button`). Follow the existing `category-role-state` shape.
4. **Layout constants used in JS** (e.g. breakpoints) live in `packages/components/src/styles/breakpoints.ts`, mirroring `_breakpoints.scss`, because CSS custom properties can't be read inside `@media` conditions.
5. Regenerate token docs after any token change: `pnpm docs:generate` (CI verifies they're committed).

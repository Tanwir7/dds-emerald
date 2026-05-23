# Building a Design System That Lasts

_Lessons from DDS Emerald — an open-source, production-grade component library built without compromise._

---

A design system is not a component library. It's a set of decisions, enforced. The library is just where those decisions live.

DDS Emerald is a single-brand, open-source system built by Digital Dev Studio. It ships 80+ components, a three-tier token model, automated accessibility gating, a strict public API contract, and opinionated visual defaults — all in a Turborepo monorepo with two independent publishable packages.

This guide uses Emerald as a living case study. Not as the only way, but as a worked example of one team's principled choices. Take what fits. Push back on what doesn't. But finish with a system of your own.

---

## 1. Why Build Your Own

Most teams should not build a design system from scratch. That's the honest starting point.

If your product could use MUI, Chakra, or shadcn/ui without meaningfully compromising your brand, use them. The maintenance burden of a custom system is real, ongoing, and often underestimated. Borrowed systems give you accessibility, documentation, and test coverage for free.

Build from scratch when:

- **Brand ownership is non-negotiable.** Your visual language is core to the product, and adapters and overrides would undermine it within a year.
- **Token depth matters.** You need a semantic color system with programmatic contrast validation, dark mode that remaps rather than inverts, and fine-grained spacing beyond what Tailwind's scale offers.
- **Accessibility is a gate, not a goal.** You want automated WCAG enforcement baked into CI, not a checklist to revisit before launch.
- **API surface control is required.** You need stable, typed, versioned component APIs that you can evolve on your own terms.

If any of these apply, building your own earns its cost. The tradeoff is permanent: you now own a product inside your product.

**The discipline required to build a design system is the same discipline the system teaches everyone who uses it.**

---

## 2. Start With Tokens, Not Components

The most common mistake is building components before tokens. You ship a `Button`, it has `#10b981` hardcoded in its SCSS, and six months later you're grepping across 80 files to change a color.

Tokens are not theming. They are a versioned, enforced vocabulary that makes your design decisions refactorable. Start there.

### The Three-Tier Model

```
Tier 1 — Primitives    --dds-emerald-600         Raw scales, never used directly in components
Tier 2 — Semantic      --dds-color-action-primary Intent-named, theme-aware, primary consumption layer
Tier 3 — Component     --dds-tag-success-bg       Narrow tokens for specific surfaces; rarely needed
```

Components consume Tier 2 tokens only. Primitives are never referenced in component CSS. This single rule, enforced by stylelint in CI, is what makes token refactoring safe.

### OKLCH Over HSL

Author your color ramps in OKLCH instead of HSL or hex.

```css
--dds-emerald-600: oklch(53% 0.17 160);
--dds-emerald-700: oklch(44% 0.15 160);
```

OKLCH is perceptually uniform — equal steps in `L` produce equal perceived brightness changes. This makes building a consistent ramp predictable instead of manual. It also makes contrast math reliable: you can write a CI script that converts OKLCH to relative luminance and validates every semantic foreground/background pair in both themes, automatically, on every commit.

HSL promises perceptual uniformity and doesn't deliver. OKLCH does.

### Dark Mode as a Remap

Dark mode is not a separate palette. It's a semantic layer remap:

```css
:root {
  --dds-color-bg-default: oklch(99% 0.005 160);
  --dds-color-text-primary: oklch(14% 0.01 160);
}

[data-theme='dark'] {
  --dds-color-bg-default: oklch(16% 0.01 160);
  --dds-color-text-primary: oklch(96% 0.005 160);
}
```

Components don't know about themes. They consume `--dds-color-bg-default`. The theme remap handles the rest. This is the payoff of the semantic tier.

**Build your token model first. Everything that comes after is just a consumer of it.**

---

## 3. Monorepo Architecture

Tokens and components belong in separate publishable packages. This is not theoretical cleanliness — it has real consequences for consumers.

A team using your tokens for a server-rendered Rails app doesn't need React. A team migrating incrementally might adopt your tokens first while they're still on a legacy component library. Coupling tokens to components blocks these paths.

### The Structure

```text
your-ds/
├── apps/
│   └── docs/               # Storybook documentation site
├── packages/
│   ├── tokens/             # @yourds/tokens — CSS vars + JS/TS export, no React
│   └── components/         # @yourds/ui — React components, depends on tokens
├── tooling/
│   ├── eslint/             # shared ESLint config
│   ├── stylelint/          # shared Stylelint config, enforces token consumption
│   ├── typescript/         # shared tsconfig bases
│   └── vitest/             # shared Vitest config
├── scaffolding.mjs
├── turbo.json
└── pnpm-workspace.yaml
```

Turborepo provides workspace-aware task caching and parallel execution. `pnpm build` in the tokens package is cached; if `tokens.css` hasn't changed, the next build skips it. This matters at scale.

### The `tooling/` Pattern

Shared configs in a `tooling/` workspace package that every other package references. ESLint rules, stylelint rules, TypeScript base configs, Vitest presets — authored once, consumed everywhere. When you update a lint rule, all packages get it on the next run.

This is how you prevent config drift across a monorepo that will grow for years.

### Package Boundaries

- `@yourds/tokens` — outputs `dist/tokens.css` and `dist/tokens.js`. No React peer dep.
- `@yourds/ui` — peer deps: `react`, `react-dom`, `@radix-ui/*`. Depends on tokens.

The tokens package is the source of truth. The JS export from it is **generated** from the CSS file — never hand-edited. In Emerald, running `pnpm --filter @dds/emerald-tokens generate` after changing `tokens.css` regenerates the JS export, and `tokens:check` in CI fails if they're out of sync.

**Separate packages enforce the token/component boundary at the dependency graph level, not just by convention.**

---

## 4. Component Philosophy

A design system component is a contract. Every prop is a promise. Every API decision you make now, you'll be maintaining for years.

### The Non-Negotiable Baseline

Every component in Emerald follows the same structural rules:

```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'solid', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(styles.root, styles[variant], styles[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
```

- `React.forwardRef` — always. Consumers need ref access for focus management, animations, and third-party integrations.
- `className` forwarding — always. Consumers need escape hatches. Accept and merge with `clsx`.
- Variant/size as union types — never boolean prop soup (`isPrimary`, `isLarge`). One prop, clear values.
- `clsx` for class merging — not `cx`, `cn`, or `classnames`. Pick one and codify it.

### Radix UI for Accessibility Primitives

Interactive components — dialogs, popovers, dropdowns, tooltips, checkboxes, sliders — have complex keyboard behavior and ARIA requirements that are hard to get right. Radix UI provides these primitives correctly.

Use it, but never let its types leak into your public API. The moment a consumer imports from `@radix-ui/*` to use your component, you've coupled them to your implementation. Wrap Radix types, re-export only your own.

```tsx
// Bad — leaks Radix into your public API
import type { DialogProps } from "@radix-ui/react-dialog";
export interface SheetProps extends DialogProps { ... }

// Good — your API is yours
export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}
```

### SCSS Modules Over Utility Classes

Design systems need stable, predictable class names. SCSS Modules give you:

- Scoped styles that don't collide across components
- Static class names that don't change with content
- `@use` for shared mixins and breakpoints without duplication
- Story-only styles isolated in `*.stories.module.scss`, never in runtime output

Tailwind trades predictability for speed. For an application, that's often the right call. For a design system, the hidden cost is that consumers can't override anything predictably, and your docs become a mess of utility class strings instead of semantic selectors.

### Opinionation Is a Feature

Emerald has `border-radius: var(--dds-radius-none)` as its default — zero, everywhere, unless a specific component spec says otherwise. This is an intentional visual statement: clean, architectural, hard-edged.

Your system should make equally deliberate choices. Not because there's one right aesthetic, but because wishy-washy systems get overridden by every team that uses them. A system with no opinion becomes twelve slightly-different local component libraries.

**Your component API is a contract. Design it like one.**

---

## 5. Accessibility Is Architecture, Not a Checklist

Every component in Emerald ships with an `axe` accessibility test. Not some components — all of them. This is not aspirational. It's enforced in CI.

```tsx
import { axe } from 'jest-axe';

it('passes axe', async () => {
  const { container } = render(<Button>Submit</Button>);
  expect(await axe(container)).toHaveNoViolations();
});
```

This alone catches a meaningful class of violations before code review. But automated axe coverage is a floor, not a ceiling. Layer on top of it:

### Contrast Validation in CI

Write a script that reads your semantic tokens, converts OKLCH to relative luminance, and validates every foreground/background pair in both light and dark themes against WCAG AA ratios. Run it on every commit. When a color change breaks contrast, CI fails — not a designer's eye, not a manual audit.

### Focus Rings — Standardized

```scss
// One mixin. Used everywhere. Never deviated from.
@mixin focus-ring {
  outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
  outline-offset: 2px;
}
```

Do not fake focus rings with `box-shadow`. Box-shadow doesn't respect border-radius consistently across browsers and can be invisible in high-contrast mode. Outline-based rings work everywhere and satisfy WCAG 2.4.11.

### Form Baseline

Every form control needs a visible label or an accessible name. Placeholder text is not a label. If a design calls for a field without a visible label, use `VisuallyHidden`. Never let a `<input>` ship without an associated `<label>`.

### Touch Target Minimum

Interactive elements need a minimum 44×44px pointer target. In a component library, this usually means setting `min-height: 44px` on nav items, menu items, and icon buttons, then confirming the actual hit area — not just the visual size — with a touch target test in Storybook.

> **Accessibility enforced in CI changes its status from "nice to have" to "required to ship."**

---

## 6. Quality Gates That Actually Enforce Discipline

The value of a design system comes from consistency. Consistency requires enforcement. Enforcement requires automation.

### Token Consumption — Stylelint

```js
// stylelint config — fails on hardcoded colors in component SCSS
"color-no-invalid-hex": true,
"declaration-property-value-disallowed-list": {
  "color": ["/^#/", "/^rgb/", "/^hsl/"],
  "background-color": ["/^#/", "/^rgb/", "/^hsl/"]
}
```

When this runs in CI, a developer can't hardcode `#10b981` in component SCSS and merge. The only escape is using a `--dds-*` token. This single gate prevents the most common form of design drift.

### Public API Snapshots — api-extractor

Every exported component, prop, and type is snapshotted into `packages/*/etc/*.api.md`. When a PR changes the API — adds a prop, renames an existing one, changes a type — the snapshot is out of date and CI fails.

This forces every API change to be intentional. You regenerate the report, review the diff, and commit it alongside the change. Consumers can read the snapshot to understand what changed. There are no surprise breaking changes.

### Bundle Size — size-limit

```json
[
  { "path": "packages/components/dist/index.js", "limit": "120 kB" },
  { "path": "packages/tokens/dist/tokens.css", "limit": "20 kB" }
]
```

Gzip budget enforced in CI. When a PR adds 15kB to the component bundle unexpectedly, it surfaces before merge — not after a consumer reports a Lighthouse regression.

### Coverage Threshold

80% on lines, functions, and branches. Not 100% — that way lies brittle tests that test implementation details. 80% with axe coverage per component is a meaningful bar.

### Changesets + Commitlint

Changesets enforces that every PR affecting a publishable package includes a changelog entry. Commitlint enforces `feat:`, `fix:`, `chore:` prefixes. Together, your release history is machine-readable and your changelogs write themselves.

**Enforcement through tooling beats enforcement through code review. Code review catches what slips through.**

---

## 7. Documentation as a Product

A design system without documentation is a library. Documentation is what makes it a system.

### Design Principles — Versioned with the Code

`docs/design-principles.md` in Emerald explains why every major decision was made: why OKLCH, why zero border radius, why the three-font system, why component-as-prop for icons. When a new engineer joins and asks why the sidebar is always `--dds-color-bg-sidebar` and never a raw color, there's an answer — not in someone's memory, but in the repository.

Version this file. It changes when decisions change. The git history of your principles file is as important as the git history of your components.

### Storybook as the Primary Consumer Surface

Storybook is not a playground. It's the interface between the system and its consumers. Structure it accordingly:

- **Controls** — every configurable prop is exposed and interactive
- **axe auto-scan** — every story runs accessibility validation on render
- **Interaction tests** — keyboard flows, open/close sequences, form submission
- **Source preview** — show only consumer-facing JSX; if your story uses a wrapper, hide it with `storySourceParameters`

Naming taxonomy matters. Emerald uses `Core Components/`, `Grouped Components/`, `App Patterns/`, `AI Patterns/`, `Marketing Patterns/`. These categories survive growth and communicate intent to consumers. `Atoms` and `Molecules` don't.

### AGENTS.md — Constraints as Documentation

Emerald ships an `AGENTS.md` file that codifies styling rules, component patterns, testing requirements, and design constraints in a single authoritative reference. It's not for AI agents only — it's the engineering constraint registry for every contributor, human or otherwise.

Write this file for your own system. It answers the question "why can't I just do X?" before it's asked.

### Patterns vs. Components

Components are primitives. Patterns show how to assemble them into finished UIs. In Emerald, patterns live in `src/patterns/` and are illustrative — a `SignupForm`, a `DashboardShell`, a `StatCard` layout — not independently published. They don't need unit tests, but they do get axe-scanned through their Storybook stories.

This distinction matters: patterns are how you demonstrate the system's expressive range without overcomplicating the component API.

**Documentation is a product. It requires the same care as the code it describes.**

---

## 8. Scaffolding and Consistency at Scale

At 10 components, file structure inconsistency is annoying. At 80, it's a maintenance crisis.

Emerald ships `scaffolding.mjs` — a CLI that generates the full component directory structure from a single command:

```sh
node scaffolding.mjs MyComponent
```

Generates:

```text
packages/components/src/components/MyComponent/
├── MyComponent.tsx
├── MyComponent.module.scss
├── MyComponent.test.tsx
├── MyComponent.stories.tsx
└── index.ts
```

Every file pre-populated with the correct structure: `forwardRef`, `clsx`, `axe` test, Storybook metadata with the right category prefix, SCSS module import. The developer fills in the logic; the scaffold handles the ceremony.

Write this early — before you hit 15 components. Retrofitting consistency is significantly harder than building it in from the start.

### The One-Component-Per-Directory Rule

One component, one directory. The directory name matches the component name exactly. This rule means you can find any component's files without searching:

```text
components/Button/Button.tsx
components/Button/Button.module.scss
components/Button/Button.test.tsx
components/Button/Button.stories.tsx
components/Button/index.ts
```

The `index.ts` re-exports the component and its public types. The component file is never imported directly — only through the index. This gives you flexibility to refactor internals without changing import paths.

**A scaffold is not automation of the boring part. It's enforcement of the correct part.**

---

## 9. Starting Small: The Phased Approach

Ship something usable as early as possible. A design system that exists only in a monorepo is not a design system yet.

### Phase 0 — Tokens Only

Ship `@yourds/tokens` before building a single component. A CSS file of custom properties is immediately useful: teams can adopt your color palette, spacing scale, and typography definitions in any existing project. This also forces you to make token decisions early, when the cost of changing them is low.

### Phase 1 — Typography Primitives

`Text`, `Heading`, `Label`, `Code`. These are the most universally needed and the least interactive, making them ideal for establishing patterns without complexity.

### Phase 2 — Form Foundation

`Input`, `Checkbox`, `Field`, `Select`. Forms appear everywhere. Nail the accessibility baseline here — visible labels, error states, keyboard operability — and every subsequent form component inherits the right foundation.

### Phase 3 — Layout System

`Stack`, `Grid`, `Flex`, `Container`. Composable layout primitives that consumers use to build page structure. Keep them thin: they should set spacing and direction, not impose visual opinions.

### Phase 4 — Feedback and Status

`Alert`, `Toast`, `Skeleton`, `ProgressBar`, `Spinner`. Status communication patterns that are almost always needed and that consumers otherwise implement inconsistently across a product.

### Phase 5 — Overlays and Disclosure

`Dialog`, `Tooltip`, `Popover`, `Accordion`, `Sheet`. Highest accessibility complexity, highest Radix dependency. Build these after the simpler components have validated your patterns.

Each phase should be independently shippable and usable before the next begins. If you can't ship Phase 1 independently, your monorepo setup or build pipeline needs fixing.

**Build in phases. Ship each one. A design system that works at Phase 2 is more valuable than one that's planned to Phase 7.**

---

## 10. What Makes a Design System Worth Using

Components are not enough. What makes a design system worth adopting — and worth maintaining — is everything around the components.

### Opinionation

Emerald is square-cornered, enterprise-dense, dark-sidebar-first, and OKLCH throughout. These choices are not for everyone. That's the point.

A system with no opinion becomes invisible within six months. Developers override it, designers work around it, and it degrades into a lowest-common-denominator library that nobody trusts. An opinionated system has a voice. People adopt it because they want that voice.

Make your system say something.

### API Surface as a Promise

Every component prop you ship is a promise to every consumer. When you rename a prop in a major version, someone upgrades and breaks. Be deliberate:

- Name props for intent, not implementation (`onOpenChange`, not `onToggle`)
- Keep variant and size values consistent across components (`"sm" | "md" | "lg"` everywhere, not `"small" | "medium" | "large"` in one component and `"sm" | "md" | "lg"` in another)
- Deprecate before removing — add a console warning, give consumers a migration cycle
- Use `api-extractor` snapshots to make API changes visible at review time, not after release

### The Maintenance Reality

A design system is a product with a roadmap, a changelog, and real consumers. It does not maintain itself. Budget accordingly:

- Allocate recurring time for accessibility audits, dependency updates, and consumer feedback
- Treat breaking changes as expensive — not impossible, but expensive
- Document deprecations thoroughly; migration paths matter as much as the change itself

### The Discipline of Deprecation

When you add a new component API pattern and realize an older component doesn't follow it, you have two options: fix the old one (breaking change) or live with inconsistency. Both have costs. The discipline is knowing which cost is worth paying at which stage of the system's life.

Early, with few consumers — fix it. Late, with broad adoption — deprecate and migrate.

---

## Building Emerald

DDS Emerald is available as a reference. The patterns described in this guide are the actual patterns the system uses — not aspirational documentation. The token architecture, the three-tier model, the axe coverage requirement, the api-extractor snapshots, the scaffolding CLI — all of it ships in the repository.

If you're building your own system and a specific decision here doesn't make sense for your context, push back on it. The goal is not to clone Emerald. The goal is to build something with the same level of intentionality about its own choices.

Start with tokens. Ship in phases. Enforce with CI. Document the why.

The rest is just components.

---

_DDS Emerald — Digital Dev Studio · CSS prefix: `dds` · WCAG 2.2 AA · OKLCH throughout_

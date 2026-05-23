# Design System Repo Setup — Step-by-Step

_A practical checklist for standing up a production-grade design system monorepo from scratch. Based on the DDS Emerald stack: pnpm · Turborepo · React · Vite · SCSS Modules · Storybook · Vitest._

Replace `yourds` and `@yourds` with your system's prefix throughout.

---

## Phase 0 — Prerequisites

- [ ] Install Node ≥22 and pnpm ≥10
- [ ] Pin versions for the team. Add both files at repo root:
  ```
  # .nvmrc
  22.22.0
  ```
  ```
  # .node-version
  22.22.0
  ```
- [ ] Optionally use [Volta](https://volta.sh) to pin Node + pnpm without `.nvmrc` discipline:
  ```sh
  volta pin node@22.22.0
  volta pin pnpm@10.33.0
  ```
- [ ] Create the GitHub repo. Set `main` as the protected base branch. Create a `development` branch for active work.
- [ ] `git init` locally, add remote, push initial commit.

---

## Phase 1 — Initialize the Monorepo

- [ ] Run `pnpm init` at repo root. Set `"private": true` in `package.json`.
- [ ] Set `"packageManager": "pnpm@10.33.0"` in root `package.json`.
- [ ] Create `pnpm-workspace.yaml`:
  ```yaml
  packages:
    - 'apps/*'
    - 'packages/*'
    - 'tooling/*'
  ```
- [ ] Create the directory skeleton:
  ```sh
  mkdir -p apps packages tooling
  ```
- [ ] Install Turborepo:
  ```sh
  pnpm add -Dw turbo
  ```
- [ ] Create `turbo.json`:
  ```json
  {
    "$schema": "https://turbo.build/schema.json",
    "tasks": {
      "build": {
        "dependsOn": ["^build"],
        "outputs": ["dist/**"]
      },
      "check:dist": {
        "dependsOn": ["build"],
        "outputs": []
      },
      "dev": {
        "cache": false,
        "persistent": true
      },
      "lint": {
        "dependsOn": ["^build"]
      },
      "test": {
        "dependsOn": ["^build"],
        "outputs": ["coverage/**"]
      },
      "typecheck": {
        "dependsOn": ["^build"]
      },
      "clean": {
        "cache": false
      }
    }
  }
  ```
- [ ] Add root scripts to `package.json`:
  ```json
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean",
    "stylelint": "stylelint \"packages/**/src/**/*.{css,scss}\"",
    "api:check": "api-extractor run -c packages/components/api-extractor.json && api-extractor run -c packages/tokens/api-extractor.json",
    "api:update": "api-extractor run --local -c packages/components/api-extractor.json && api-extractor run --local -c packages/tokens/api-extractor.json",
    "tokens:check": "pnpm --filter @yourds/tokens generate && git diff --exit-code -- packages/tokens/src/tokens.ts",
    "size": "size-limit",
    "prepare": "husky"
  }
  ```

---

## Phase 2 — Shared Tooling Packages

Four private workspace packages that every other package references. None are published.

### 2a. TypeScript Config — `tooling/typescript/`

- [ ] Create `tooling/typescript/package.json`:
  ```json
  {
    "name": "@yourds/typescript-config",
    "version": "0.0.0",
    "private": true,
    "license": "MIT",
    "files": ["base.json", "react.json"]
  }
  ```
- [ ] `tooling/typescript/base.json` — strict mode, bundler module resolution:
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "ESNext",
      "moduleResolution": "bundler",
      "strict": true,
      "skipLibCheck": true,
      "declaration": true,
      "declarationMap": true,
      "sourceMap": true
    }
  }
  ```
- [ ] `tooling/typescript/react.json` — extends base, adds JSX:
  ```json
  {
    "extends": "./base.json",
    "compilerOptions": {
      "jsx": "react-jsx",
      "lib": ["ES2022", "DOM", "DOM.Iterable"]
    }
  }
  ```

### 2b. ESLint Config — `tooling/eslint/`

- [ ] Create `tooling/eslint/package.json`:
  ```json
  {
    "name": "@yourds/eslint-config",
    "version": "0.0.0",
    "private": true,
    "license": "MIT",
    "type": "module",
    "exports": {
      "./base": "./base.js",
      "./react": "./react.js"
    },
    "dependencies": {
      "@eslint/js": "^9.x.x",
      "eslint-plugin-import": "^2.x.x",
      "eslint-plugin-jsx-a11y": "^6.x.x",
      "eslint-plugin-react": "^7.x.x",
      "eslint-plugin-react-hooks": "^5.x.x",
      "typescript-eslint": "^8.x.x"
    }
  }
  ```
- [ ] `tooling/eslint/base.js` — TypeScript + import rules for non-React files
- [ ] `tooling/eslint/react.js` — extends base, adds `jsx-a11y`, `react`, `react-hooks`

### 2c. Vitest Config — `tooling/vitest/`

- [ ] Create `tooling/vitest/package.json`:
  ```json
  {
    "name": "@yourds/vitest-config",
    "version": "0.0.0",
    "private": true,
    "license": "MIT",
    "type": "module",
    "exports": {
      ".": "./vitest.config.ts",
      "./setup": "./setup.ts"
    },
    "dependencies": {
      "@testing-library/jest-dom": "^6.x.x",
      "@vitejs/plugin-react": "^6.x.x",
      "jest-axe": "^10.x.x",
      "jsdom": "^26.x.x",
      "vitest": "^4.x.x"
    }
  }
  ```
- [ ] `tooling/vitest/setup.ts` — imports `@testing-library/jest-dom` and `jest-axe` matchers
- [ ] `tooling/vitest/vitest.config.ts` — `jsdom` environment, 80% coverage thresholds:
  ```ts
  export default defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['@yourds/vitest-config/setup'],
      coverage: {
        provider: 'v8',
        thresholds: { lines: 80, functions: 80, branches: 80 },
      },
    },
  });
  ```

### 2d. Stylelint Config — `tooling/stylelint/`

- [ ] Create `tooling/stylelint/package.json`:
  ```json
  {
    "name": "@yourds/stylelint-config",
    "version": "0.0.0",
    "private": true,
    "license": "MIT",
    "main": "index.cjs",
    "exports": { ".": "./index.cjs" },
    "peerDependencies": { "stylelint": "^17.0.0" },
    "dependencies": { "postcss-scss": "^4.x.x" }
  }
  ```
- [ ] `tooling/stylelint/index.cjs` — rules that fail on hardcoded colors in component SCSS:
  ```js
  module.exports = {
    customSyntax: 'postcss-scss',
    rules: {
      'color-no-invalid-hex': true,
      'declaration-property-value-disallowed-list': {
        '/^(color|background|background-color|border-color|outline-color|fill|stroke)$/': [
          '/^#/',
          '/^rgb/',
          '/^hsl/',
          '/^oklch(?!.*var)/',
        ],
      },
    },
  };
  ```
  > This rule allows `oklch(from var(--yourds-*) ...)` and `var(--yourds-*)` but fails on literal color values in component SCSS files.

---

## Phase 3 — Design Tokens Package

`packages/tokens/` → published as `@yourds/tokens`

- [ ] Create `packages/tokens/package.json`:
  ```json
  {
    "name": "@yourds/tokens",
    "version": "0.1.0",
    "type": "module",
    "exports": {
      ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
      "./styles": "./dist/tokens.css",
      "./fonts": "./dist/fonts.css"
    },
    "files": ["dist"],
    "sideEffects": ["**/*.css"],
    "scripts": {
      "build": "tsup",
      "generate": "node scripts/generate-tokens.mjs",
      "test:contrast": "node scripts/check-contrast.mjs",
      "typecheck": "tsc --noEmit",
      "clean": "rm -rf dist"
    },
    "devDependencies": {
      "@yourds/typescript-config": "workspace:*",
      "tsup": "^8.x.x",
      "typescript": "^5.x.x"
    }
  }
  ```
- [ ] Create `packages/tokens/src/tokens.css` — the single source of truth. Structure:

  ```css
  /* ─── Tier 1: Primitives ─────────────────────────── */
  :root {
    /* Color ramps — OKLCH */
    --yourds-emerald-50: oklch(97% 0.03 160);
    --yourds-emerald-500: oklch(53% 0.17 160);
    --yourds-emerald-950: oklch(14% 0.05 160);

    /* Neutral ramp */
    --yourds-silver-50: oklch(98% 0 0);
    --yourds-silver-950: oklch(12% 0 0);

    /* Spacing scale — 4px base unit */
    --yourds-space-1: 0.25rem; /* 4px */
    --yourds-space-2: 0.5rem; /* 8px */
    --yourds-space-4: 1rem; /* 16px */
    --yourds-space-8: 2rem; /* 32px */

    /* Border radius */
    --yourds-radius-none: 0px;
    --yourds-radius-full: 9999px;

    /* Typography */
    --yourds-font-display: 'Barlow Condensed', sans-serif;
    --yourds-font-sans: 'DM Sans', sans-serif;
    --yourds-font-mono: 'JetBrains Mono', monospace;
  }

  /* ─── Tier 2: Semantic (light mode) ──────────────── */
  :root {
    --yourds-color-bg-default: var(--yourds-silver-50);
    --yourds-color-bg-sidebar: var(--yourds-emerald-950);
    --yourds-color-text-primary: var(--yourds-silver-950);
    --yourds-color-action-primary: var(--yourds-emerald-500);
    --yourds-color-focus-ring: var(--yourds-emerald-500);
  }

  /* ─── Tier 2: Semantic (dark mode remap) ─────────── */
  [data-theme='dark'] {
    --yourds-color-bg-default: oklch(16% 0.01 160);
    --yourds-color-text-primary: oklch(96% 0.005 160);
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) {
      --yourds-color-bg-default: oklch(16% 0.01 160);
      --yourds-color-text-primary: oklch(96% 0.005 160);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :root {
      --yourds-motion-duration-fast: 0ms;
      --yourds-motion-duration-normal: 0ms;
    }
  }
  ```

- [ ] Create `packages/tokens/scripts/generate-tokens.mjs` — parses `tokens.css`, extracts custom property names and values, writes `src/tokens.ts` as a typed JS object. This file is **never hand-edited**.
- [ ] Create `packages/tokens/scripts/check-contrast.mjs` — reads all Tier 2 semantic color pairs, converts OKLCH to relative luminance, asserts WCAG AA (4.5:1 text, 3:1 large text) for light and dark themes. `process.exit(1)` on any failure.
- [ ] Create `packages/tokens/tsconfig.json` extending `@yourds/typescript-config/base.json`.
- [ ] Run `pnpm --filter @yourds/tokens build` — verify `dist/tokens.css`, `dist/index.js`, `dist/index.d.ts` are generated.

---

## Phase 4 — Components Package

`packages/components/` → published as `@yourds/ui`

- [ ] Create `packages/components/package.json`:
  ```json
  {
    "name": "@yourds/ui",
    "version": "0.1.0",
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
    "sideEffects": ["**/*.css"],
    "peerDependencies": {
      "@yourds/tokens": "^0.1.0",
      "lucide-react": "^1.x.x",
      "react": ">=18.0.0",
      "react-dom": ">=18.0.0"
    },
    "scripts": {
      "build": "vite build",
      "typecheck": "tsc --noEmit",
      "test": "vitest run --coverage",
      "test:watch": "vitest watch",
      "clean": "rm -rf dist"
    },
    "devDependencies": {
      "@yourds/eslint-config": "workspace:*",
      "@yourds/tokens": "workspace:*",
      "@yourds/typescript-config": "workspace:*",
      "@yourds/vitest-config": "workspace:*",
      "@radix-ui/react-dialog": "^1.x.x",
      "@radix-ui/react-tooltip": "^1.x.x",
      "@testing-library/react": "^16.x.x",
      "@testing-library/user-event": "^14.x.x",
      "@types/react": "^19.x.x",
      "@vitejs/plugin-react": "^6.x.x",
      "@vitest/coverage-v8": "^4.x.x",
      "clsx": "^2.x.x",
      "jest-axe": "^10.x.x",
      "lucide-react": "^1.x.x",
      "react": "^19.x.x",
      "react-dom": "^19.x.x",
      "sass": "^1.x.x",
      "vite": "^8.x.x",
      "vite-plugin-dts": "^4.x.x",
      "vitest": "^4.x.x"
    }
  }
  ```
- [ ] Create `packages/components/vite.config.ts`:

  ```ts
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import dts from 'vite-plugin-dts';

  export default defineConfig({
    plugins: [react(), dts({ insertTypesEntry: true })],
    build: {
      lib: {
        entry: 'src/index.ts',
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime', '@yourds/tokens'],
      },
      cssCodeSplit: false,
    },
  });
  ```

- [ ] Create `packages/components/tsconfig.json` extending `@yourds/typescript-config/react.json`.
- [ ] Create `packages/components/vitest.config.ts` extending `@yourds/vitest-config`.
- [ ] Create `packages/components/src/index.ts` — barrel file, re-exports all components.
- [ ] Enforce directory rule: one component per directory under `src/components/ComponentName/`.

---

## Phase 5 — Storybook Docs App

`apps/docs/`

- [ ] Scaffold:
  ```sh
  mkdir -p apps/docs
  cd apps/docs
  pnpm dlx storybook@latest init --type react_vite
  ```
- [ ] Install addons:
  ```sh
  pnpm add -D @storybook/addon-a11y @storybook/addon-interactions @storybook/addon-docs
  ```
- [ ] Update `.storybook/main.ts`:
  ```ts
  export default {
    stories: ['../../packages/components/src/**/*.stories.tsx'],
    addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-interactions'],
    framework: { name: '@storybook/react-vite', options: {} },
  };
  ```
- [ ] Enforce Storybook naming taxonomy in all stories:
  - `Core Components/ComponentName`
  - `Grouped Components/ComponentName`
  - `App Patterns/PatternName`
  - `AI Patterns/PatternName`
  - `Marketing Patterns/PatternName`
- [ ] Create `apps/docs/vitest.config.ts` for browser-mode Storybook tests:
  - `browser: { enabled: true, provider: 'playwright', headless: true }`
  - `server.host: '127.0.0.1'`
  - `server.fs.allow` pointing at `packages/components/src`
- [ ] Add root script: `"test:storybook": "pnpm --dir apps/docs test"`

---

## Phase 6 — Component Scaffolding CLI

`scaffolding.mjs` at repo root — plain Node ESM, no dependencies.

- [ ] Create `scaffolding.mjs`. On `node scaffolding.mjs ComponentName`, generate:

  **`ComponentName.tsx`**

  ```tsx
  import React from 'react';
  import clsx from 'clsx';
  import styles from './ComponentName.module.scss';

  export interface ComponentNameProps extends React.HTMLAttributes<HTMLDivElement> {
    // add props here
  }

  const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
    ({ className, ...props }, ref) => {
      return <div ref={ref} className={clsx(styles.root, className)} {...props} />;
    }
  );
  ComponentName.displayName = 'ComponentName';

  export { ComponentName };
  ```

  **`ComponentName.module.scss`**

  ```scss
  @use '../../styles/mixins' as *;

  .root {
    // consume Tier 2 tokens only
    // color: var(--yourds-color-text-primary);
  }
  ```

  **`ComponentName.test.tsx`**

  ```tsx
  import { render } from '@testing-library/react';
  import { axe } from 'jest-axe';
  import { ComponentName } from './ComponentName';

  describe('ComponentName', () => {
    it('renders', () => {
      const { container } = render(<ComponentName />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('passes axe', async () => {
      const { container } = render(<ComponentName />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
  ```

  **`ComponentName.stories.tsx`**

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import { ComponentName } from './ComponentName';

  const meta: Meta<typeof ComponentName> = {
    title: 'Core Components/ComponentName',
    component: ComponentName,
    parameters: { a11y: { context: '#storybook-root' } },
  };
  export default meta;

  type Story = StoryObj<typeof ComponentName>;
  export const Default: Story = {};
  ```

  **`index.ts`**

  ```ts
  export { ComponentName } from './ComponentName';
  export type { ComponentNameProps } from './ComponentName';
  ```

---

## Phase 7 — Quality Gates (Local)

- [ ] Install tools:
  ```sh
  pnpm add -Dw prettier husky lint-staged @commitlint/cli @commitlint/config-conventional stylelint
  ```
- [ ] Create `.prettierrc.json`:
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "trailingComma": "es5",
    "printWidth": 100,
    "tabWidth": 2
  }
  ```
- [ ] Create `commitlint.config.mjs`:
  ```js
  export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'scope-empty': [2, 'never'],
      'header-max-length': [2, 'always', 72],
      'type-enum': [
        2,
        'always',
        [
          'feat',
          'fix',
          'chore',
          'docs',
          'test',
          'ci',
          'refactor',
          'perf',
          'build',
          'revert',
          'style',
        ],
      ],
    },
  };
  ```
- [ ] Initialize husky:
  ```sh
  pnpm husky init
  ```

  - `.husky/pre-commit` → `pnpm lint-staged`
  - `.husky/commit-msg` → `pnpm commitlint --edit $1`
- [ ] Add `"lint-staged"` to root `package.json`:
  ```json
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["stylelint --fix", "prettier --write"],
    "*.{md,json}": ["prettier --write"]
  }
  ```
- [ ] Create root `eslint.config.mjs` (flat config):

  ```js
  import base from './tooling/eslint/base.js';
  import react from './tooling/eslint/react.js';
  import storybook from 'eslint-plugin-storybook';

  const withFiles = (configs, files) => configs.map((c) => ({ ...c, files }));

  export default [
    { ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**', '**/storybook-static/**'] },
    ...withFiles(base, ['packages/tokens/**/*.ts', 'tooling/**/*.ts']),
    ...withFiles(react, ['packages/components/**/*.{ts,tsx}', 'apps/docs/**/*.{ts,tsx}']),
    ...withFiles(storybook.configs['flat/recommended'], ['packages/components/**/*.stories.tsx']),
  ];
  ```

- [ ] Create `stylelint.config.mjs`:
  ```js
  export default { extends: ['@yourds/stylelint-config'] };
  ```

---

## Phase 8 — Public API Surface Tracking

- [ ] Install:
  ```sh
  pnpm add -Dw @microsoft/api-extractor
  ```
- [ ] Create `packages/tokens/api-extractor.json` pointing to `etc/emerald-tokens.api.md`
- [ ] Create `packages/components/api-extractor.json` pointing to `etc/emerald.api.md`
- [ ] Run `pnpm api:update` after the initial build — generates the baseline `.api.md` files
- [ ] Commit `packages/tokens/etc/` and `packages/components/etc/` to version control
- [ ] From this point on: any intentional API change requires `pnpm api:update` + committing the updated report in the same PR

---

## Phase 9 — Bundle Size Budgets

- [ ] Install:
  ```sh
  pnpm add -Dw size-limit @size-limit/file
  ```
- [ ] Create `.size-limit.json` at root:
  ```json
  [
    { "path": "packages/components/dist/index.js", "limit": "120 kB" },
    { "path": "packages/tokens/dist/tokens.css", "limit": "20 kB" }
  ]
  ```
- [ ] Confirm `pnpm size` passes after initial build. Adjust limits to match actual baseline + a small buffer.

---

## Phase 10 — Changesets for Versioning

- [ ] Install:
  ```sh
  pnpm add -Dw @changesets/cli @changesets/changelog-github
  ```
- [ ] Initialize:
  ```sh
  pnpm changeset init
  ```
- [ ] Edit `.changeset/config.json`:
  ```json
  {
    "changelog": "@changesets/changelog-github",
    "commit": false,
    "access": "public",
    "baseBranch": "main",
    "updateInternalDependencies": "patch",
    "ignore": [
      "@yourds/eslint-config",
      "@yourds/typescript-config",
      "@yourds/vitest-config",
      "@yourds/stylelint-config"
    ]
  }
  ```
- [ ] Create `.github/workflows/release.yml` using the `changesets/action`. On push to `main`: open a Release PR that bumps versions + updates changelogs. On Release PR merge: publish to npm.
- [ ] **Workflow for contributors:** every PR that touches a publishable package must include a changeset file (`pnpm changeset` → pick package + bump type + write summary).

---

## Phase 11 — CI Pipeline

Create `.github/workflows/ci.yml`. All jobs use Node 22, pnpm cache, trigger on PRs to `main`/`development` and pushes to `development`.

- [ ] **lint** — `pnpm lint`
- [ ] **stylelint** — `pnpm stylelint`
- [ ] **typecheck** — `pnpm typecheck`
- [ ] **generated-tokens** — `pnpm tokens:check` (fails if JS export is out of sync with `tokens.css`)
- [ ] **contrast** — `pnpm --filter @yourds/tokens test:contrast` (WCAG AA validation on all semantic color pairs)
- [ ] **test** — `pnpm build` first, then `pnpm test --filter @yourds/ui --filter @yourds/tokens`
- [ ] **storybook-test** — build, install Playwright, `pnpm test:storybook`
- [ ] **build** — `pnpm build && pnpm api:check && pnpm size` (all three must pass)

Full example job:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build --filter @yourds/tokens
      - run: pnpm test --filter @yourds/ui --filter @yourds/tokens
```

---

## Phase 12 — First Component (Validation Pass)

Run through this checklist end-to-end before building any more components. It proves the entire pipeline works.

- [ ] Run the scaffold:
  ```sh
  node scaffolding.mjs Text
  ```
- [ ] Implement `Text.tsx`: `forwardRef`, `as` polymorphic prop (default `"p"`), `size` and `weight` variant unions, `className` forwarding via `clsx`
- [ ] In `Text.module.scss`: consume only Tier 2 tokens
  ```scss
  .root {
    font-family: var(--yourds-font-sans);
    color: var(--yourds-color-text-primary);
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  }
  ```
- [ ] Write one render test and one axe test in `Text.test.tsx`
- [ ] Run tests — must pass, must hit 80% coverage:
  ```sh
  pnpm test --filter @yourds/ui
  ```
- [ ] Build and confirm output:
  ```sh
  pnpm build --filter @yourds/ui
  ```
  Verify `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`, and `dist/styles.css` exist.
- [ ] Generate the initial API report and commit it:
  ```sh
  pnpm api:update
  git add packages/components/etc/
  ```
- [ ] Run `pnpm size` — note the baseline, adjust limits if needed
- [ ] Open Storybook, confirm the `Text` story renders and the a11y panel shows no violations:
  ```sh
  pnpm dev --filter docs
  ```
- [ ] Run Storybook browser tests:
  ```sh
  pnpm test:storybook
  ```

If all steps pass, the repo is ready. Every subsequent component follows the same path.

---

## Reference: Root `package.json` devDependencies

```json
{
  "@changesets/changelog-github": "^0.6.0",
  "@changesets/cli": "^2.30.0",
  "@commitlint/cli": "^19.x.x",
  "@commitlint/config-conventional": "^19.x.x",
  "@microsoft/api-extractor": "^7.58.x",
  "@size-limit/file": "^12.x.x",
  "eslint": "^9.x.x",
  "eslint-plugin-storybook": "^10.x.x",
  "husky": "^9.x.x",
  "lint-staged": "^15.x.x",
  "prettier": "^3.x.x",
  "size-limit": "^12.x.x",
  "stylelint": "^17.x.x",
  "turbo": "^2.x.x",
  "typescript": "^5.x.x"
}
```

---

_This checklist mirrors the actual DDS Emerald setup. Commands are verified against the repo. Replace `yourds` with your system prefix throughout._

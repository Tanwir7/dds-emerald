# Commit Message Convention

DDS Emerald uses Conventional Commits with repository-specific expectations for scopes and wording.

## Format

Use this format for every commit subject:

```text
type(scope): concise outcome
```

Examples:

```text
feat(sidebar): add collapsed navigation state
fix(nav-item): restore outline focus ring on keyboard navigation
docs(tokens): document date and time aliases
test(file-picker): add axe coverage for drag and drop
ci(workflows): run dependency review on pull requests
refactor(storybook): simplify docs test bootstrap
```

## Required Rules

- `scope` is required.
- `type` must be one of: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`.
- Keep the full header at 72 characters or fewer.
- Write the subject as an outcome, not as a task log.
- Do not end the subject with a period.

## Scope Guidance

Choose the narrowest scope that makes the affected area obvious in history.

Recommended scopes in this repo:

- Components: `sidebar`, `nav-item`, `button`, `dialog`, `file-picker`, `datagrid`
- Packages: `components`, `tokens`, `docs`
- Tooling: `storybook`, `vitest`, `eslint`, `typescript`, `changesets`
- Delivery: `ci`, `workflows`, `release`

Use lowercase, usually kebab-case, for multi-word scopes.

## Subject Guidance

Good subjects are specific and searchable:

- `feat(sidebar): add nested group expansion state`
- `fix(tokens): correct focus ring color alias`
- `refactor(file-picker): split drag state from selection logic`

Avoid vague subjects:

- `improvement: sidebar`
- `refactor: bugs`
- `ci: gh`
- `feat: workflows`
- `feat: sidebar pass 3`

## When To Use Each Type

- `feat`: a new user-facing capability or component behavior
- `fix`: a bug fix, regression fix, or accessibility correction
- `refactor`: internal code changes with no intended behavior change
- `docs`: documentation-only changes
- `test`: test-only changes
- `ci`: CI workflow or automation pipeline changes
- `build`: packaging, dependency, or build-system changes
- `perf`: measurable performance improvements
- `style`: formatting or style-only changes with no logic change
- `chore`: maintenance that does not fit the categories above
- `revert`: reverting an earlier commit

## Body Guidance

Add a body when the reason is not obvious from the subject alone.

Useful body topics:

- why the change was needed
- what behavior changed
- any visual or accessibility impact
- migration or follow-up work

Example:

```text
fix(sidebar): restore outline focus ring on keyboard navigation

The previous refactor moved focus styles to a wrapper that does not
receive focus in the collapsed variant. Apply the ring to the
interactive element so WCAG 2.2 focus visibility is preserved.
```

## Repo Notes

- This repo already enforces commit messages through `.husky/commit-msg` and `commitlint.config.js`.
- Use commit subjects to describe the meaningful change, even if a changeset will carry release notes separately.
- If a commit touches multiple areas, scope it to the primary surface area rather than using a vague label.

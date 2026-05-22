/**
 * @dds/stylelint-config — shared Stylelint config for DDS Emerald.
 *
 * Scope is intentionally narrow: mechanically enforce the one styling rule
 * that review can't reliably catch — "no hardcoded color values; use --dds-*
 * tokens / OKLCH" (AGENTS.md). Formatting and SCSS conventions are owned by
 * Prettier and code review, so the opinionated stylistic rulesets are NOT
 * pulled in (they would flag ~400 pre-existing, non-design issues).
 *
 * Shadow properties are excluded from the color check on purpose: the design
 * system's own --dds-shadow-* tokens are defined with `rgb(0 0 0 / a)`, so
 * black-alpha in shadows is an accepted convention.
 */
const colorProps =
  /^(color|fill|stroke|caret-color|background|background-color|border|border-color|border-(top|right|bottom|left|block|inline)(-(start|end))?-color|outline|outline-color|text-decoration-color|column-rule-color)$/;

/** @type {import('stylelint').Config} */
export default {
  customSyntax: 'postcss-scss',
  rules: {
    'color-no-hex': true,
    'color-named': 'never',
    'declaration-property-value-disallowed-list': {
      [`/${colorProps.source}/`]: [/\brgba?\(/i, /\bhsla?\(/i],
    },
  },
  overrides: [
    {
      // tokens.css is the single source where raw color values are defined
      // (OKLCH primitives, `white`/`black`, and rgb() shadow ramps).
      files: ['**/tokens.css'],
      rules: {
        'color-no-hex': null,
        'color-named': null,
        'declaration-property-value-disallowed-list': null,
      },
    },
    {
      // Story-only styles may use one-off values for documentation framing.
      files: ['**/*.stories.module.scss'],
      rules: {
        'declaration-property-value-disallowed-list': null,
      },
    },
  ],
};

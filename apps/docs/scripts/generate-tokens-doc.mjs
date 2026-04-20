import { writeFileSync } from 'node:fs';
import { parseTokensCss, resolveTokenValue, tokensPath } from './token-doc-utils.mjs';

const outputPath = new URL('../src/docs/Tokens.mdx', import.meta.url);

const { declarations, darkDeclarations, rootTokenMap, darkTokenMap } = parseTokensCss();
const darkTokenNames = new Set(darkDeclarations.map((declaration) => declaration.name));

const htmlEscape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const code = (value) =>
  `<code className="dds-docs-token-code">{${JSON.stringify(String(value))}}</code>`;

const byName = (names) =>
  names
    .map((name) => declarations.find((declaration) => declaration.name === name))
    .filter(Boolean);

const byPattern = (pattern) => declarations.filter((declaration) => pattern.test(declaration.name));

const resolvedValue = (name, tokenMap) => resolveTokenValue(tokenMap.get(name), tokenMap);

const text = (value) => htmlEscape(value);

const formatTable = (rows, columns) => {
  const headers = columns
    .map((column) => `        <th scope="col">${text(column.label)}</th>`)
    .join('\n');
  const body = rows
    .map(
      (row) => `      <tr>
${columns
  .map((column) => `        <td data-label="${text(column.label)}">${column.render(row)}</td>`)
  .join('\n')}
      </tr>`
    )
    .join('\n');

  return `<div className="dds-docs-token-table-wrap">
  <table className="dds-docs-token-table">
    <thead>
      <tr>
${headers}
      </tr>
    </thead>
    <tbody>
${body}
    </tbody>
  </table>
</div>`;
};

const tokenValueTable = (rows, { includeDark = false } = {}) =>
  formatTable(
    rows,
    [
      {
        label: 'Token',
        render: (row) => code(row.name),
      },
      {
        label: 'Default value',
        render: (row) => code(row.value),
      },
      ...(includeDark
        ? [
            {
              label: 'Dark value',
              render: (row) =>
                darkTokenNames.has(row.name) ? code(darkTokenMap.get(row.name)) : text('Same as default'),
            },
          ]
        : []),
    ]
  );

const resolvedModeTable = (rows) =>
  formatTable(rows, [
    {
      label: 'Token',
      render: (row) => code(row.name),
    },
    {
      label: 'Light resolved',
      render: (row) => code(resolvedValue(row.name, rootTokenMap)),
    },
    {
      label: 'Dark resolved',
      render: (row) => code(resolvedValue(row.name, darkTokenMap)),
    },
  ]);

const colorFamilyRows = [
  {
    family: 'Primitive palette',
    tokens: ['--dds-emerald-*', '--dds-silver-*'],
    usage: 'Foundation for semantic color tokens. Components should not consume these directly.',
  },
  {
    family: 'Semantic color',
    tokens: ['--dds-color-*'],
    usage: 'Component-facing color roles for backgrounds, text, action states, borders, status, and charts.',
  },
  {
    family: 'Badge color',
    tokens: ['--dds-badge-*'],
    usage: 'Badge-specific Tier 3 colors for status badge variants.',
  },
];

const tokenModelRows = [
  {
    tier: 'Tier 1',
    purpose: 'Primitive foundations such as palette, spacing, radius, typography, shadow, motion, and icon sizes',
    usage: 'Used to compose higher-level tokens',
  },
  {
    tier: 'Tier 2',
    purpose: 'Semantic product roles such as --dds-color-bg-default and --dds-color-action-primary',
    usage: 'Component SCSS consumes these directly',
  },
  {
    tier: 'Tier 3',
    purpose: 'Component or domain-specific tokens such as --dds-badge-success-bg',
    usage: 'Used only by the owning component or domain',
  },
];

const tokenModelTable = formatTable(tokenModelRows, [
  {
    label: 'Tier',
    render: (row) => text(row.tier),
  },
  {
    label: 'Purpose',
    render: (row) => text(row.purpose),
  },
  {
    label: 'Usage',
    render: (row) => text(row.usage),
  },
]);

const colorFamilyTable = formatTable(colorFamilyRows, [
  {
    label: 'Family',
    render: (row) => text(row.family),
  },
  {
    label: 'Tokens',
    render: (row) => row.tokens.map((token) => code(token)).join(' '),
  },
  {
    label: 'Usage',
    render: (row) => text(row.usage),
  },
]);

const spacingTokens = byPattern(/^--dds-space-/);
const radiusTokens = byPattern(/^--dds-radius-/);
const fontFamilyTokens = byName(['--dds-font-display', '--dds-font-sans', '--dds-font-mono']);
const fontSizeTokens = byPattern(/^--dds-font-size-/);
const fontWeightTokens = byPattern(/^--dds-font-weight-/);
const lineHeightTokens = byPattern(/^--dds-line-height-/);
const trackingTokens = byPattern(/^--dds-tracking-/);
const shadowTokens = byPattern(/^--dds-shadow-/);
const motionTokens = byPattern(/^--dds-(duration|ease)-/);
const iconSizeTokens = byPattern(/^--dds-icon-size-/);
const semanticColorTokens = byPattern(/^--dds-color-/).filter(
  (declaration) => !declaration.name.startsWith('--dds-color-chart-')
);
const badgeTokens = byPattern(/^--dds-badge-/);
const chartTokens = byPattern(/^--dds-color-chart-/);

const mdx = `import { Meta } from '@storybook/addon-docs/blocks';

{/* This file is generated by apps/docs/scripts/generate-tokens-doc.mjs. */}

<Meta title="Foundations/Tokens" />

# Tokens

Emerald tokens are defined in \`packages/tokens/src/tokens.css\`. Token names use the \`--dds-\` prefix.

## Token Model

${tokenModelTable}

Components should consume Tier 2 semantic tokens wherever possible. Do not introduce new raw values in component SCSS.

## Color Token Families

Color swatches are documented visually in the Colors page. This page lists the token families and resolved semantic values.

${colorFamilyTable}

## Spacing

${tokenValueTable(spacingTokens)}

## Radius

Emerald components use \`--dds-radius-none\` by default. \`--dds-radius-full\` is reserved for documented exceptions such as Avatar, StatusIndicator dots, AvatarGroup overflow, and ProgressBar track/fill.

${tokenValueTable(radiusTokens)}

## Typography

### Font Families

${tokenValueTable(fontFamilyTokens)}

### Font Sizes

${tokenValueTable(fontSizeTokens)}

### Font Weights

${tokenValueTable(fontWeightTokens)}

### Line Heights

${tokenValueTable(lineHeightTokens)}

### Tracking

${tokenValueTable(trackingTokens)}

## Icon Sizes

Lucide icons inside DDS components are sized through these tokens and the shared icon-size SCSS mixin.

${tokenValueTable(iconSizeTokens)}

## Shadow

${tokenValueTable(shadowTokens)}

## Motion

Reduced motion handling is defined in \`tokens.css\`; components should use these timing tokens for transitions.

${tokenValueTable(motionTokens)}

## Semantic Color Values

These values are resolved from \`:root\` and \`[data-theme='dark']\` so both modes are visible at once.

${resolvedModeTable(semanticColorTokens)}

## Badge Tokens

${resolvedModeTable(badgeTokens)}

## Chart Tokens

${resolvedModeTable(chartTokens)}
`;

writeFileSync(outputPath, mdx);

console.log(`Generated ${outputPath.pathname} from ${tokensPath.pathname}`);

import { writeFileSync } from 'node:fs';
import { parseTokensCss, resolveTokenValue, tokensPath } from './token-doc-utils.mjs';

const outputPath = new URL('../src/docs/Colors.mdx', import.meta.url);

const shadeOrder = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const { declarations, rootTokenMap, darkTokenMap, tokenNames } = parseTokensCss();
const documentedTokens = new Set();

const getToken = (name, label) => {
  if (!tokenNames.has(name)) {
    return null;
  }

  documentedTokens.add(name);

  return {
    name,
    label,
  };
};

const getResolvedToken = (name, label, tokenMap) => {
  if (!tokenNames.has(name) || !tokenMap.has(name)) {
    return null;
  }

  documentedTokens.add(name);

  return {
    label,
    value: resolveTokenValue(tokenMap.get(name), tokenMap),
  };
};

const getPrimitiveRange = (scale, shades, title, subtitle) => ({
  title,
  subtitle,
  colors: shades.map((shade) => getToken(`--dds-${scale}-${shade}`, shade)).filter(Boolean),
});

const getResolvedSemanticTokens = (prefix, entries, title, subtitle, tokenMap) => ({
  title,
  subtitle,
  colors: entries
    .map(([suffix, label]) => getResolvedToken(`${prefix}${suffix}`, label, tokenMap))
    .filter(Boolean),
});

const getResolvedBadgeTokens = (variant, title, subtitle, tokenMap) =>
  getResolvedSemanticTokens(
    `--dds-badge-${variant}-`,
    [
      ['bg', 'bg'],
      ['color', 'color'],
      ['ring', 'ring'],
    ],
    title,
    subtitle,
    tokenMap
  );

const getResolvedChartTokens = (title, subtitle, tokenMap) => ({
  title,
  subtitle,
  colors: ['1', '2', '3', '4', '5']
    .map((label) => getResolvedToken(`--dds-color-chart-${label}`, label, tokenMap))
    .filter(Boolean),
});

const sections = [
  {
    heading: 'Primitive Palettes',
    body: 'The primitive palettes are split into smaller ranges so shade labels stay readable.',
    palettes: [
      [
        getPrimitiveRange('emerald', shadeOrder.slice(0, 4), 'Emerald 50-300', 'Light brand tints'),
        getPrimitiveRange('emerald', shadeOrder.slice(4, 8), 'Emerald 400-700', 'Core brand range'),
        getPrimitiveRange('emerald', shadeOrder.slice(8), 'Emerald 800-950', 'Dark brand range'),
      ],
      [
        getPrimitiveRange('silver', shadeOrder.slice(0, 4), 'Silver 50-300', 'Light neutral range'),
        getPrimitiveRange('silver', shadeOrder.slice(4, 8), 'Silver 400-700', 'Core neutral range'),
        getPrimitiveRange('silver', shadeOrder.slice(8), 'Silver 800-950', 'Dark neutral range'),
      ],
    ],
  },
  {
    heading: 'Semantic Palettes',
    body: 'These swatches show resolved light and dark values from tokens.css, so they do not change with the active Storybook theme.',
    palettes: [
      [
        getResolvedSemanticTokens(
          '--dds-color-bg-',
          [
            ['default', 'default'],
            ['subtle', 'subtle'],
            ['muted', 'muted'],
          ],
          'Light Background',
          'Page and subtle backgrounds in light mode',
          rootTokenMap
        ),
        getResolvedSemanticTokens(
          '--dds-color-bg-',
          [
            ['card', 'card'],
            ['card-hover', 'card-hover'],
            ['popover', 'popover'],
            ['input', 'input'],
          ],
          'Light Surface',
          'Cards, popovers, and inputs in light mode',
          rootTokenMap
        ),
      ],
      [
        getResolvedSemanticTokens(
          '--dds-color-bg-',
          [
            ['default', 'default'],
            ['subtle', 'subtle'],
            ['muted', 'muted'],
          ],
          'Dark Background',
          'Page and subtle backgrounds in dark mode',
          darkTokenMap
        ),
        getResolvedSemanticTokens(
          '--dds-color-bg-',
          [
            ['card', 'card'],
            ['card-hover', 'card-hover'],
            ['popover', 'popover'],
            ['input', 'input'],
          ],
          'Dark Surface',
          'Cards, popovers, and inputs in dark mode',
          darkTokenMap
        ),
      ],
      [
        getResolvedSemanticTokens(
          '--dds-color-text-',
          [
            ['default', 'default'],
            ['muted', 'muted'],
            ['on-primary', 'on-primary'],
            ['success', 'success'],
            ['warning', 'warning'],
            ['danger', 'danger'],
            ['info', 'info'],
          ],
          'Light Text',
          'Foreground roles in light mode',
          rootTokenMap
        ),
        getResolvedSemanticTokens(
          '--dds-color-text-',
          [
            ['card-foreground', 'card'],
            ['popover-foreground', 'popover'],
          ],
          'Light Surface Text',
          'Elevated surface foregrounds in light mode',
          rootTokenMap
        ),
      ],
      [
        getResolvedSemanticTokens(
          '--dds-color-text-',
          [
            ['default', 'default'],
            ['muted', 'muted'],
            ['on-primary', 'on-primary'],
            ['success', 'success'],
            ['warning', 'warning'],
            ['danger', 'danger'],
            ['info', 'info'],
          ],
          'Dark Text',
          'Foreground roles in dark mode',
          darkTokenMap
        ),
        getResolvedSemanticTokens(
          '--dds-color-text-',
          [
            ['card-foreground', 'card'],
            ['popover-foreground', 'popover'],
          ],
          'Dark Surface Text',
          'Elevated surface foregrounds in dark mode',
          darkTokenMap
        ),
      ],
      [
        getResolvedSemanticTokens(
          '--dds-color-action-primary',
          [
            ['', 'primary'],
            ['-hover', 'hover'],
            ['-foreground', 'foreground'],
            ['-hover-foreground', 'hover-fg'],
          ],
          'Light Primary Action',
          'Primary action surface and foreground in light mode',
          rootTokenMap
        ),
        getResolvedSemanticTokens(
          '--dds-color-action-secondary',
          [
            ['', 'secondary'],
            ['-hover', 'hover'],
            ['-foreground', 'foreground'],
            ['-hover-foreground', 'hover-fg'],
          ],
          'Light Secondary Action',
          'Secondary action surface and foreground in light mode',
          rootTokenMap
        ),
        getResolvedSemanticTokens(
          '--dds-color-',
          [
            ['accent', 'accent'],
            ['accent-foreground', 'accent-fg'],
            ['action-accent-hover', 'accent-hover'],
            ['action-accent-hover-foreground', 'accent-hover-fg'],
            ['action-ghost-hover', 'ghost-hover'],
            ['action-muted-hover', 'muted-hover'],
            ['action-muted-hover-foreground', 'muted-fg'],
          ],
          'Light Accent and Muted',
          'Subtle interactive states in light mode',
          rootTokenMap
        ),
      ],
      [
        getResolvedSemanticTokens(
          '--dds-color-action-primary',
          [
            ['', 'primary'],
            ['-hover', 'hover'],
            ['-foreground', 'foreground'],
            ['-hover-foreground', 'hover-fg'],
          ],
          'Dark Primary Action',
          'Primary action surface and foreground in dark mode',
          darkTokenMap
        ),
        getResolvedSemanticTokens(
          '--dds-color-action-secondary',
          [
            ['', 'secondary'],
            ['-hover', 'hover'],
            ['-foreground', 'foreground'],
            ['-hover-foreground', 'hover-fg'],
          ],
          'Dark Secondary Action',
          'Secondary action surface and foreground in dark mode',
          darkTokenMap
        ),
        getResolvedSemanticTokens(
          '--dds-color-',
          [
            ['accent', 'accent'],
            ['accent-foreground', 'accent-fg'],
            ['action-accent-hover', 'accent-hover'],
            ['action-accent-hover-foreground', 'accent-hover-fg'],
            ['action-ghost-hover', 'ghost-hover'],
            ['action-muted-hover', 'muted-hover'],
            ['action-muted-hover-foreground', 'muted-fg'],
          ],
          'Dark Accent and Muted',
          'Subtle interactive states in dark mode',
          darkTokenMap
        ),
      ],
      [
        getResolvedSemanticTokens(
          '--dds-color-action-destructive',
          [
            ['', 'destructive'],
            ['-hover', 'hover'],
            ['-foreground', 'foreground'],
            ['-hover-foreground', 'hover-fg'],
          ],
          'Light Destructive Action',
          'Dangerous action surface and foreground in light mode',
          rootTokenMap
        ),
        getResolvedSemanticTokens(
          '--dds-color-',
          [
            ['border-default', 'border'],
            ['border-input', 'input'],
            ['focus-ring', 'focus'],
          ],
          'Light Border and Focus',
          'Structural lines and focus indication in light mode',
          rootTokenMap
        ),
      ],
      [
        getResolvedSemanticTokens(
          '--dds-color-action-destructive',
          [
            ['', 'destructive'],
            ['-hover', 'hover'],
            ['-foreground', 'foreground'],
            ['-hover-foreground', 'hover-fg'],
          ],
          'Dark Destructive Action',
          'Dangerous action surface and foreground in dark mode',
          darkTokenMap
        ),
        getResolvedSemanticTokens(
          '--dds-color-',
          [
            ['border-default', 'border'],
            ['border-input', 'input'],
            ['focus-ring', 'focus'],
          ],
          'Dark Border and Focus',
          'Structural lines and focus indication in dark mode',
          darkTokenMap
        ),
      ],
    ],
  },
  {
    heading: 'Status Palettes',
    body: 'Status palettes show resolved light and dark values from tokens.css.',
    palettes: [
      [
        getResolvedSemanticTokens(
          '--dds-color-',
          [
            ['status-success', 'status'],
            ['status-success-foreground', 'foreground'],
            ['action-success-hover', 'hover'],
            ['action-success-hover-foreground', 'hover-fg'],
          ],
          'Light Success',
          'Positive state tokens in light mode',
          rootTokenMap
        ),
        getResolvedSemanticTokens(
          '--dds-color-',
          [
            ['status-warning', 'status'],
            ['status-warning-foreground', 'foreground'],
            ['action-warning-hover', 'hover'],
            ['action-warning-hover-foreground', 'hover-fg'],
          ],
          'Light Warning',
          'Caution state tokens in light mode',
          rootTokenMap
        ),
      ],
      [
        getResolvedSemanticTokens(
          '--dds-color-',
          [
            ['status-danger', 'status'],
            ['status-danger-foreground', 'foreground'],
          ],
          'Light Danger',
          'Error or critical state tokens in light mode',
          rootTokenMap
        ),
        getResolvedSemanticTokens(
          '--dds-color-',
          [
            ['status-info', 'status'],
            ['status-info-foreground', 'foreground'],
            ['action-info-hover', 'hover'],
            ['action-info-hover-foreground', 'hover-fg'],
          ],
          'Light Info',
          'Informational state tokens in light mode',
          rootTokenMap
        ),
      ],
      [
        getResolvedSemanticTokens(
          '--dds-color-',
          [
            ['status-success', 'status'],
            ['status-success-foreground', 'foreground'],
            ['action-success-hover', 'hover'],
            ['action-success-hover-foreground', 'hover-fg'],
          ],
          'Dark Success',
          'Positive state tokens in dark mode',
          darkTokenMap
        ),
        getResolvedSemanticTokens(
          '--dds-color-',
          [
            ['status-warning', 'status'],
            ['status-warning-foreground', 'foreground'],
            ['action-warning-hover', 'hover'],
            ['action-warning-hover-foreground', 'hover-fg'],
          ],
          'Dark Warning',
          'Caution state tokens in dark mode',
          darkTokenMap
        ),
      ],
      [
        getResolvedSemanticTokens(
          '--dds-color-',
          [
            ['status-danger', 'status'],
            ['status-danger-foreground', 'foreground'],
          ],
          'Dark Danger',
          'Error or critical state tokens in dark mode',
          darkTokenMap
        ),
        getResolvedSemanticTokens(
          '--dds-color-',
          [
            ['status-info', 'status'],
            ['status-info-foreground', 'foreground'],
            ['action-info-hover', 'hover'],
            ['action-info-hover-foreground', 'hover-fg'],
          ],
          'Dark Info',
          'Informational state tokens in dark mode',
          darkTokenMap
        ),
      ],
    ],
  },
  {
    heading: 'Badge Palettes',
    body: 'Badge palettes show resolved light and dark values from tokens.css.',
    palettes: [
      [
        getResolvedBadgeTokens(
          'success',
          'Light Badge Success',
          'Badge-specific success tokens in light mode',
          rootTokenMap
        ),
        getResolvedBadgeTokens(
          'warning',
          'Light Badge Warning',
          'Badge-specific warning tokens in light mode',
          rootTokenMap
        ),
      ],
      [
        getResolvedBadgeTokens(
          'danger',
          'Light Badge Danger',
          'Badge-specific danger tokens in light mode',
          rootTokenMap
        ),
        getResolvedBadgeTokens(
          'info',
          'Light Badge Info',
          'Badge-specific info tokens in light mode',
          rootTokenMap
        ),
      ],
      [
        getResolvedBadgeTokens(
          'success',
          'Dark Badge Success',
          'Badge-specific success tokens in dark mode',
          darkTokenMap
        ),
        getResolvedBadgeTokens(
          'warning',
          'Dark Badge Warning',
          'Badge-specific warning tokens in dark mode',
          darkTokenMap
        ),
      ],
      [
        getResolvedBadgeTokens(
          'danger',
          'Dark Badge Danger',
          'Badge-specific danger tokens in dark mode',
          darkTokenMap
        ),
        getResolvedBadgeTokens(
          'info',
          'Dark Badge Info',
          'Badge-specific info tokens in dark mode',
          darkTokenMap
        ),
      ],
    ],
  },
  {
    heading: 'Chart Palette',
    body: 'Chart palettes show resolved light and dark values from tokens.css.',
    palettes: [
      [
        getResolvedChartTokens('Light Chart', 'Ordered chart color tokens in light mode', rootTokenMap),
      ],
      [
        getResolvedChartTokens('Dark Chart', 'Ordered chart color tokens in dark mode', darkTokenMap),
      ],
    ],
  },
];

const colorTokenNames = declarations
  .map((declaration) => declaration.name)
  .filter(
    (name) =>
      /^--dds-(emerald|silver)-\d+$/.test(name) ||
      name.startsWith('--dds-color-') ||
      name.startsWith('--dds-badge-')
  );

const ungroupedTokens = colorTokenNames.filter((name) => !documentedTokens.has(name));

if (ungroupedTokens.length > 0) {
  throw new Error(`Colors doc generator is missing token groups for: ${ungroupedTokens.join(', ')}`);
}

const renderColors = (colors) =>
  colors
    .map((color) => `        '${color.label}': '${color.value ?? `var(${color.name})`}',`)
    .join('\n');

const renderColorItem = ({ title, subtitle, colors }) => {
  if (colors.length === 0) {
    return '';
  }

  return `    <ColorItem
      title="${title}"
      subtitle="${subtitle}"
      colors={{
${renderColors(colors)}
      }}
    />`;
};

const renderPalette = (items) => {
  const renderedItems = items.map(renderColorItem).filter(Boolean).join('\n');

  if (!renderedItems) {
    return '';
  }

  return `  <ColorPalette>
${renderedItems}
  </ColorPalette>`;
};

const renderSection = ({ heading, body, palettes }) => {
  const renderedPalettes = palettes.map(renderPalette).filter(Boolean).join('\n\n');

  return `## ${heading}

${body ? `${body}\n\n` : ''}<div className="dds-docs-color-palettes">
${renderedPalettes}
</div>`;
};

const mdx = `import { ColorItem, ColorPalette, Meta } from '@storybook/addon-docs/blocks';

{/* This file is generated by apps/docs/scripts/generate-colors-doc.mjs. */}

<Meta title="Foundations/Colors" />

# Colors

Emerald color tokens are defined in \`packages/tokens/src/tokens.css\`.
Components consume semantic \`--dds-color-*\` tokens; primitive shade scales exist to support token composition.

${sections.map(renderSection).join('\n\n')}
`;

writeFileSync(outputPath, mdx);

console.log(`Generated ${outputPath.pathname} from ${tokensPath.pathname}`);

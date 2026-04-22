import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';
import { tokens } from './tokens';

function extractCssCustomProperties(cssSource: string): Set<string> {
  const matches = cssSource.matchAll(/--dds-[a-z0-9-]+/g);

  return new Set(Array.from(matches, ([match]) => match));
}

function extractCssCustomPropertyDeclarations(cssSource: string): Set<string> {
  const matches = cssSource.matchAll(/^\s*(--dds-[a-z0-9-]+)\s*:/gm);

  return new Set(Array.from(matches, ([, name]) => name));
}

function extractBlock(cssSource: string, selector: string): string {
  const selectorIndex = cssSource.indexOf(selector);

  if (selectorIndex === -1) {
    throw new Error(`Unable to find selector "${selector}" in tokens.css.`);
  }

  const blockStart = cssSource.indexOf('{', selectorIndex);
  let depth = 0;

  for (let index = blockStart; index < cssSource.length; index += 1) {
    const character = cssSource[index];

    if (character === '{') {
      depth += 1;
    }

    if (character === '}') {
      depth -= 1;

      if (depth === 0) {
        return cssSource.slice(blockStart + 1, index);
      }
    }
  }

  throw new Error(`Unable to find closing brace for selector "${selector}" in tokens.css.`);
}

function extractCssCustomPropertyValue(blockSource: string, property: string): string {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = blockSource.match(new RegExp(`${escapedProperty}\\s*:\\s*([^;]+);`));

  if (!match) {
    throw new Error(`Unable to find property "${property}" in CSS block.`);
  }

  return match[1]
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

type Rgb = readonly [number, number, number];

function resolveCssCustomPropertyValue(
  blockSource: string,
  property: string,
  seen = new Set<string>()
): string {
  if (seen.has(property)) {
    throw new Error(`Circular custom property reference found for "${property}".`);
  }

  seen.add(property);

  const value = extractCssCustomPropertyValue(blockSource, property);
  const reference = value.match(/^var\(\s*(--dds-[a-z0-9-]+)\s*\)$/);

  if (!reference) {
    return value;
  }

  return resolveCssCustomPropertyValue(blockSource, reference[1], seen);
}

function oklchToRgb(value: string): Rgb {
  const match = value.match(/^oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*\)$/);

  if (!match) {
    throw new Error(`Unable to parse OKLCH value "${value}".`);
  }

  const lightness = Number(match[1]);
  const chroma = Number(match[2]);
  const hue = (Number(match[3]) * Math.PI) / 180;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const long = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const medium = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const short = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l = long ** 3;
  const m = medium ** 3;
  const s = short ** 3;
  const linearRgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  return linearRgb.map((channel) => {
    const clamped = Math.min(1, Math.max(0, channel));

    return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
  }) as [number, number, number];
}

function colorToRgb(value: string): Rgb {
  if (value === 'white') {
    return [1, 1, 1];
  }

  if (value === 'black') {
    return [0, 0, 0];
  }

  return oklchToRgb(value);
}

function getRelativeLuminance(rgb: Rgb): number {
  return rgb
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce(
      (luminance, channel, index) => luminance + channel * [0.2126, 0.7152, 0.0722][index],
      0
    );
}

function getContrastRatio(foreground: Rgb, background: Rgb): number {
  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);

  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

describe('tokens', () => {
  it('declares every --dds-* custom property referenced in tokens.css', () => {
    const cssSource = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
    const referencedProperties = extractCssCustomProperties(cssSource);
    const declaredProperties = extractCssCustomPropertyDeclarations(cssSource);

    expect(declaredProperties).toEqual(referencedProperties);
  });

  it('defines the current action token contract in each theme scope', () => {
    const cssSource = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
    const actionContract = [
      '--dds-color-action-primary',
      '--dds-color-action-primary-hover',
      '--dds-color-action-primary-foreground',
      '--dds-color-action-primary-hover-foreground',
      '--dds-color-action-secondary',
      '--dds-color-action-secondary-hover',
      '--dds-color-action-secondary-foreground',
      '--dds-color-action-secondary-hover-foreground',
      '--dds-color-action-ghost-hover',
      '--dds-color-action-destructive',
      '--dds-color-action-destructive-hover',
      '--dds-color-action-destructive-foreground',
      '--dds-color-action-destructive-hover-foreground',
      '--dds-color-action-accent-hover',
      '--dds-color-action-accent-hover-foreground',
      '--dds-color-action-muted-hover',
      '--dds-color-action-muted-hover-foreground',
      '--dds-color-action-success-hover',
      '--dds-color-action-success-hover-foreground',
      '--dds-color-action-warning-hover',
      '--dds-color-action-warning-hover-foreground',
      '--dds-color-action-info-hover',
      '--dds-color-action-info-hover-foreground',
    ];

    const rootDeclarations = extractCssCustomPropertyDeclarations(extractBlock(cssSource, ':root'));
    const darkDeclarations = extractCssCustomPropertyDeclarations(
      extractBlock(cssSource, "[data-theme='dark']")
    );
    const osDarkDeclarations = extractCssCustomPropertyDeclarations(
      extractBlock(cssSource, ":root:not([data-theme='light'])")
    );

    [rootDeclarations, darkDeclarations, osDarkDeclarations].forEach((declarations) => {
      actionContract.forEach((property) => {
        expect(declarations).toContain(property);
      });
    });
  });

  it('defines status text color tokens in each theme scope', () => {
    const cssSource = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
    const statusTextContract = [
      '--dds-color-text-success',
      '--dds-color-text-warning',
      '--dds-color-text-danger',
      '--dds-color-text-info',
    ];
    const rootDeclarations = extractCssCustomPropertyDeclarations(extractBlock(cssSource, ':root'));
    const darkDeclarations = extractCssCustomPropertyDeclarations(
      extractBlock(cssSource, "[data-theme='dark']")
    );
    const osDarkDeclarations = extractCssCustomPropertyDeclarations(
      extractBlock(cssSource, ":root:not([data-theme='light'])")
    );

    [rootDeclarations, darkDeclarations, osDarkDeclarations].forEach((declarations) => {
      statusTextContract.forEach((property) => {
        expect(declarations).toContain(property);
      });
    });

    expect(tokens.theme.light.color.text.success).toBeDefined();
    expect(tokens.theme.light.color.text.warning).toBeDefined();
    expect(tokens.theme.light.color.text.danger).toBeDefined();
    expect(tokens.theme.light.color.text.info).toBeDefined();
    expect(tokens.theme.dark.color.text.success).toBeDefined();
    expect(tokens.theme.dark.color.text.warning).toBeDefined();
    expect(tokens.theme.dark.color.text.danger).toBeDefined();
    expect(tokens.theme.dark.color.text.info).toBeDefined();
  });

  it("keeps OS-level dark mode token names aligned with [data-theme='dark']", () => {
    const cssSource = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
    const darkDeclarations = extractCssCustomPropertyDeclarations(
      extractBlock(cssSource, "[data-theme='dark']")
    );
    const osDarkDeclarations = extractCssCustomPropertyDeclarations(
      extractBlock(cssSource, ":root:not([data-theme='light'])")
    );

    expect(osDarkDeclarations).toEqual(darkDeclarations);
  });

  it('keeps text-on-primary and action-primary-foreground values identical', () => {
    const cssSource = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
    const cssBlocks = [
      extractBlock(cssSource, ':root'),
      extractBlock(cssSource, "[data-theme='dark']"),
      extractBlock(cssSource, ":root:not([data-theme='light'])"),
    ];

    cssBlocks.forEach((block) => {
      expect(extractCssCustomPropertyValue(block, '--dds-color-text-on-primary')).toBe(
        extractCssCustomPropertyValue(block, '--dds-color-action-primary-foreground')
      );
    });

    expect(tokens.theme.light.color.text['on-primary']).toBe(
      tokens.theme.light.color.action['primary-foreground']
    );
    expect(tokens.theme.dark.color.text['on-primary']).toBe(
      tokens.theme.dark.color.action['primary-foreground']
    );
  });

  it('keeps status text colors at WCAG AA contrast on standard surfaces', () => {
    const cssSource = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
    const rootBlock = extractBlock(cssSource, ':root');
    const darkBlock = extractBlock(cssSource, "[data-theme='dark']");
    const themes = [
      {
        block: rootBlock,
        backgrounds: [
          '--dds-color-bg-default',
          '--dds-color-bg-subtle',
          '--dds-color-bg-card',
          '--dds-color-bg-input',
          '--dds-color-bg-muted',
        ],
      },
      {
        block: `${darkBlock}\n${rootBlock}`,
        backgrounds: [
          '--dds-color-bg-default',
          '--dds-color-bg-subtle',
          '--dds-color-bg-card',
          '--dds-color-bg-input',
          '--dds-color-bg-muted',
        ],
      },
    ];
    const foregrounds = [
      '--dds-color-text-success',
      '--dds-color-text-warning',
      '--dds-color-text-danger',
      '--dds-color-text-info',
    ];

    themes.forEach(({ block, backgrounds }) => {
      foregrounds.forEach((foregroundProperty) => {
        const foreground = colorToRgb(resolveCssCustomPropertyValue(block, foregroundProperty));

        backgrounds.forEach((backgroundProperty) => {
          const background = colorToRgb(resolveCssCustomPropertyValue(block, backgroundProperty));

          expect(getContrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
        });
      });
    });
  });
});

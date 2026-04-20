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
});

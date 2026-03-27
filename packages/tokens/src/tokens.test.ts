import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { tokens } from './tokens';

function extractCssCustomProperties(cssSource: string): Set<string> {
  const matches = cssSource.matchAll(/--dds-[a-z0-9-]+/g);

  return new Set(Array.from(matches, ([match]) => match));
}

function prefixedEntries(prefix: string, values: Record<string, string>): string[] {
  return Object.keys(values).map((key) => `${prefix}-${key}`);
}

function buildTokenPropertyNames(): Set<string> {
  const names = new Set<string>();
  const { primitive, theme } = tokens;

  prefixedEntries('--dds-emerald', primitive.color.emerald).forEach((name) => names.add(name));
  prefixedEntries('--dds-silver', primitive.color.silver).forEach((name) => names.add(name));
  prefixedEntries('--dds-space', primitive.space).forEach((name) => names.add(name));
  prefixedEntries('--dds-radius', primitive.radius).forEach((name) => names.add(name));
  prefixedEntries('--dds-font', primitive.font.family).forEach((name) => names.add(name));
  prefixedEntries('--dds-font-size', primitive.font.size).forEach((name) => names.add(name));
  prefixedEntries('--dds-font-weight', primitive.font.weight).forEach((name) => names.add(name));
  prefixedEntries('--dds-line-height', primitive.font.lineHeight).forEach((name) =>
    names.add(name)
  );
  prefixedEntries('--dds-tracking', primitive.font.tracking).forEach((name) => names.add(name));
  prefixedEntries('--dds-shadow', primitive.shadow).forEach((name) => names.add(name));
  prefixedEntries('--dds-duration', primitive.duration).forEach((name) => names.add(name));
  prefixedEntries('--dds-ease', primitive.ease).forEach((name) => names.add(name));

  Object.values(theme).forEach((currentTheme) => {
    prefixedEntries('--dds-color-bg', currentTheme.color.bg).forEach((name) => names.add(name));
    prefixedEntries('--dds-color-text', currentTheme.color.text).forEach((name) => names.add(name));
    prefixedEntries('--dds-color-action', currentTheme.color.action).forEach((name) =>
      names.add(name)
    );
    prefixedEntries('--dds-color-border', currentTheme.color.border).forEach((name) =>
      names.add(name)
    );
    names.add('--dds-color-focus-ring');
    names.add('--dds-color-accent');
    names.add('--dds-color-accent-foreground');
    prefixedEntries('--dds-color-sidebar', currentTheme.color.sidebar).forEach((name) =>
      names.add(name)
    );
    prefixedEntries('--dds-color-status', currentTheme.color.status).forEach((name) =>
      names.add(name)
    );
    prefixedEntries('--dds-color-chart', currentTheme.color.chart).forEach((name) =>
      names.add(name)
    );

    Object.entries(currentTheme.badge).forEach(([variant, badgeTokens]) => {
      prefixedEntries(`--dds-badge-${variant}`, badgeTokens).forEach((name) => names.add(name));
    });
  });

  return names;
}

describe('tokens', () => {
  it('mirrors all --dds-* custom properties declared in tokens.css', () => {
    const cssSource = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
    const cssProperties = extractCssCustomProperties(cssSource);
    const tokenProperties = buildTokenPropertyNames();

    expect(tokenProperties).toEqual(cssProperties);
  });
});

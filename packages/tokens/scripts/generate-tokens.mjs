#!/usr/bin/env node
/**
 * Generate `src/tokens.ts` from `src/tokens.css`.
 *
 * `tokens.css` is the single source of truth. This produces the typed JS token
 * object (`{ primitive, theme: { light, dark } }`) with every value resolved
 * from the CSS per theme, so the published `tokens` export can never drift from
 * the CSS again. Run via `pnpm --filter @dds/emerald-tokens generate`.
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import { loadTokenMaps } from './parse-tokens.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(here, '../src/tokens.css');
const outPath = resolve(here, '../src/tokens.ts');

const { light, resolveToken } = loadTokenMaps(cssPath);

const isSemantic = (name) =>
  name.startsWith('--dds-color-') ||
  name.startsWith('--dds-tag-') ||
  name.startsWith('--dds-badge-');

// Ordered: more specific prefixes first (font-size/weight before font-family).
const PRIMITIVE_RULES = [
  ['--dds-emerald-', ['color', 'emerald']],
  ['--dds-silver-', ['color', 'silver']],
  ['--dds-space-', ['space']],
  ['--dds-radius-', ['radius']],
  ['--dds-font-size-', ['font', 'size']],
  ['--dds-font-weight-', ['font', 'weight']],
  ['--dds-font-', ['font', 'family']],
  ['--dds-line-height-', ['font', 'lineHeight']],
  ['--dds-tracking-', ['font', 'tracking']],
  ['--dds-shadow-', ['shadow']],
  ['--dds-duration-', ['duration']],
  ['--dds-ease-', ['ease']],
  ['--dds-icon-size-', ['icon', 'size']],
  ['--dds-z-', ['zIndex']],
  ['--dds-dialog-width-', ['dialogWidth']],
  // layout: keep the full `sidebar-width` / `site-header-height` segment as key
  ['--dds-sidebar-width', ['layout'], (n) => n.slice('--dds-'.length)],
  ['--dds-site-header-height', ['layout'], (n) => n.slice('--dds-'.length)],
];

const COLOR_GROUPS = ['bg', 'text', 'action', 'border', 'sidebar', 'status', 'chart', 'upload'];

function setPath(obj, path, value) {
  let node = obj;
  for (let i = 0; i < path.length - 1; i++) {
    node[path[i]] ??= {};
    node = node[path[i]];
  }
  node[path[path.length - 1]] = value;
}

function semanticPath(name) {
  if (name.startsWith('--dds-color-')) {
    const rest = name.slice('--dds-color-'.length);
    const group = COLOR_GROUPS.find((g) => rest === g || rest.startsWith(`${g}-`));
    return group ? ['color', group, rest.slice(group.length + 1)] : ['color', rest];
  }
  const prefix = name.startsWith('--dds-tag-') ? '--dds-tag-' : '--dds-badge-';
  const root = prefix === '--dds-tag-' ? 'tag' : 'badge';
  const rest = name.slice(prefix.length);
  const i = rest.indexOf('-');
  return [root, rest.slice(0, i), rest.slice(i + 1)];
}

const tokens = { primitive: {}, theme: { light: {}, dark: {} } };

for (const name of light.keys()) {
  if (isSemantic(name)) {
    const path = semanticPath(name);
    setPath(tokens.theme.light, path, resolveToken(name, 'light'));
    setPath(tokens.theme.dark, path, resolveToken(name, 'dark'));
    continue;
  }
  const rule = PRIMITIVE_RULES.find(([p]) => name.startsWith(p));
  if (!rule) throw new Error(`No mapping rule for primitive token: ${name}`);
  const [prefix, base, keyFn] = rule;
  const key = keyFn ? keyFn(name) : name.slice(prefix.length);
  setPath(tokens.primitive, [...base, key], resolveToken(name, 'light'));
}

const header = [
  '// AUTO-GENERATED — DO NOT EDIT.',
  '// Generated from tokens.css by scripts/generate-tokens.mjs.',
  '// Run: pnpm --filter @dds/emerald-tokens generate',
  '',
].join('\n');

const source = `${header}\nexport const tokens = ${JSON.stringify(
  tokens,
  null,
  2
)} as const;\n\nexport type Tokens = typeof tokens;\n`;

const prettierConfig = (await prettier.resolveConfig(outPath)) ?? {};
const formatted = await prettier.format(source, {
  ...prettierConfig,
  parser: 'typescript',
  filepath: outPath,
});

writeFileSync(outPath, formatted);

console.log(`Generated ${outPath} from tokens.css`);

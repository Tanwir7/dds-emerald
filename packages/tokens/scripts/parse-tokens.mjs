/**
 * Shared parser for `src/tokens.css`. Reads the `:root` (light) and
 * `[data-theme='dark']` (dark overrides) blocks, parses `--dds-*`
 * declarations, and resolves `var()` chains per theme (dark falls back to
 * light/root). Used by both the contrast gate and the tokens.ts generator so
 * there is a single source of parsing truth.
 */
import { readFileSync } from 'node:fs';

/** Extract `--name: value;` declarations from a CSS block body, in order. */
export function parseDecls(body) {
  const map = new Map();
  const re = /(--dds-[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    map.set(m[1], m[2].trim());
  }
  return map;
}

/** Return the body of the first CSS block matching `selector` (brace-balanced). */
export function blockBody(source, selector) {
  const idx = source.indexOf(selector);
  if (idx === -1) return '';
  const open = source.indexOf('{', idx);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(open + 1, i);
    }
  }
  return '';
}

/**
 * Load token maps for both themes from a tokens.css path.
 * Returns the raw maps plus resolvers that follow `var()` chains.
 */
export function loadTokenMaps(cssPath) {
  const css = readFileSync(cssPath, 'utf8');
  const light = parseDecls(blockBody(css, ':root'));
  const dark = parseDecls(blockBody(css, "[data-theme='dark']"));

  function resolveValue(value, mode) {
    let v = value.trim();
    let guard = 0;
    while (v.startsWith('var(') && guard++ < 20) {
      const inner = v.slice(4, v.lastIndexOf(')')).split(',')[0].trim();
      const fromDark = mode === 'dark' ? dark.get(inner) : undefined;
      v = (fromDark ?? light.get(inner) ?? '').trim();
      if (!v) throw new Error(`Unresolved token reference: ${inner}`);
    }
    return v;
  }

  function resolveToken(name, mode) {
    const raw = (mode === 'dark' ? dark.get(name) : undefined) ?? light.get(name);
    if (raw === undefined) throw new Error(`Unknown token: ${name} (${mode})`);
    return resolveValue(raw, mode);
  }

  return { css, light, dark, resolveValue, resolveToken };
}

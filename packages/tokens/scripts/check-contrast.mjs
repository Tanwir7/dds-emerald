#!/usr/bin/env node
/**
 * Token-contrast regression gate.
 *
 * Parses src/tokens.css, resolves the semantic color tokens (following var()
 * chains) for both light and dark modes, converts OKLCH -> relative luminance,
 * and asserts WCAG contrast for the documented foreground/background pairs.
 * Turns the inline contrast comments in tokens.css into an executable check.
 *
 * No dependencies: OKLCH -> linear sRGB uses the Oklab transform (Ottosson).
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTokenMaps } from './parse-tokens.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const tokensPath = resolve(here, '../src/tokens.css');
const { resolveToken } = loadTokenMaps(tokensPath);

const clamp01 = (x) => Math.min(1, Math.max(0, x));

/** OKLCH string -> WCAG relative luminance (alpha ignored). */
function luminance(color) {
  if (color === 'white') return 1;
  if (color === 'black') return 0;

  const match = color.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/i);
  if (!match) throw new Error(`Unsupported color literal: ${color}`);
  const L = parseFloat(match[1]);
  const C = parseFloat(match[2]);
  const Hdeg = parseFloat(match[3]);
  const h = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const r = clamp01(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = clamp01(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const bl = clamp01(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);

  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
}

function contrast(fg, bg, mode) {
  const a = luminance(resolveToken(fg, mode));
  const b = luminance(resolveToken(bg, mode));
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT_AA = 4.5;
const UI_AA = 3.0;

/** Documented pairs from the inline comments in tokens.css. */
const pairs = [
  // --- text on surfaces (light) ---
  { mode: 'light', fg: '--dds-color-text-default', bg: '--dds-color-bg-card', min: TEXT_AA },
  { mode: 'light', fg: '--dds-color-text-default', bg: '--dds-color-bg-default', min: TEXT_AA },
  { mode: 'light', fg: '--dds-color-text-muted', bg: '--dds-color-bg-card', min: TEXT_AA },
  { mode: 'light', fg: '--dds-color-text-muted', bg: '--dds-color-bg-muted', min: TEXT_AA },
  {
    mode: 'light',
    fg: '--dds-color-action-primary-foreground',
    bg: '--dds-color-action-primary',
    min: TEXT_AA,
  },
  {
    mode: 'light',
    fg: '--dds-color-action-secondary-foreground',
    bg: '--dds-color-action-secondary',
    min: TEXT_AA,
  },
  {
    mode: 'light',
    fg: '--dds-color-action-destructive-foreground',
    bg: '--dds-color-action-destructive',
    min: TEXT_AA,
  },
  {
    mode: 'light',
    fg: '--dds-color-status-success-foreground',
    bg: '--dds-color-status-success',
    min: TEXT_AA,
  },
  // --- non-text UI (light) ---
  { mode: 'light', fg: '--dds-color-border-default', bg: '--dds-color-bg-card', min: UI_AA },
  { mode: 'light', fg: '--dds-color-border-default', bg: '--dds-color-bg-default', min: UI_AA },

  // --- text on surfaces (dark) ---
  { mode: 'dark', fg: '--dds-color-text-default', bg: '--dds-color-bg-default', min: TEXT_AA },
  { mode: 'dark', fg: '--dds-color-text-muted', bg: '--dds-color-bg-default', min: TEXT_AA },
  {
    mode: 'dark',
    fg: '--dds-color-action-primary-foreground',
    bg: '--dds-color-action-primary',
    min: TEXT_AA,
  },
  {
    mode: 'dark',
    fg: '--dds-color-action-secondary-foreground',
    bg: '--dds-color-action-secondary',
    min: TEXT_AA,
  },
  // --- non-text UI (dark) ---
  { mode: 'dark', fg: '--dds-color-border-default', bg: '--dds-color-bg-default', min: UI_AA },
  { mode: 'dark', fg: '--dds-color-border-default', bg: '--dds-color-bg-card', min: UI_AA },
];

const failures = [];
for (const { mode, fg, bg, min } of pairs) {
  const ratio = contrast(fg, bg, mode);
  const ok = ratio >= min;
  const label = `${mode.padEnd(5)} ${fg} on ${bg}`;

  console.log(`${ok ? 'PASS' : 'FAIL'}  ${ratio.toFixed(2)}:1 (min ${min})  ${label}`);
  if (!ok) failures.push({ label, ratio, min });
}

if (failures.length > 0) {
  console.error(`\n${failures.length} contrast pair(s) below WCAG AA threshold.`);
  process.exit(1);
}

console.log(`\nAll ${pairs.length} token contrast pairs meet WCAG AA.`);

export type ColorMode = 'hex' | 'rgb' | 'hsl';

export interface HSVA {
  h: number;
  s: number;
  v: number;
  a: number;
}

interface HSLA {
  h: number;
  s: number;
  l: number;
  a: number;
}

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

const HEX_PATTERN = /^#([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;
const RGB_PATTERN =
  /^rgba?\(\s*([+-]?[\d.]+)\s*,\s*([+-]?[\d.]+)\s*,\s*([+-]?[\d.]+)(?:\s*,\s*([+-]?[\d.]+)\s*)?\)$/i;
const HSL_PATTERN =
  /^hsla?\(\s*([+-]?[\d.]+)\s*,\s*([+-]?[\d.]+)%\s*,\s*([+-]?[\d.]+)%(?:\s*,\s*([+-]?[\d.]+)\s*)?\)$/i;

const roundTo = (value: number, decimals: number) => {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
};

const normalizeHue = (value: number) => {
  const normalized = value % 360;

  return normalized < 0 ? normalized + 360 : normalized;
};

const formatAlpha = (value: number) => {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(3).replace(/\.?0+$/, '');
};

const isFiniteNumber = (value: number) => Number.isFinite(value) && !Number.isNaN(value);

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function hexToRgba(hex: string): RGBA | null {
  const trimmed = hex.trim();

  if (!HEX_PATTERN.test(trimmed)) {
    return null;
  }

  let normalized = trimmed.slice(1);

  if (normalized.length === 3 || normalized.length === 4) {
    normalized = normalized
      .split('')
      .map((character) => `${character}${character}`)
      .join('');
  }

  const hasAlpha = normalized.length === 8;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const a = hasAlpha ? Number.parseInt(normalized.slice(6, 8), 16) / 255 : 1;

  return {
    r,
    g,
    b,
    a: roundTo(clamp(a, 0, 1), 3),
  };
}

export function rgbaToHex(r: number, g: number, b: number, a = 1) {
  const toHexChannel = (channel: number) =>
    Math.round(clamp(channel, 0, 255))
      .toString(16)
      .padStart(2, '0');

  const alpha = clamp(a, 0, 1);
  const base = `${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;

  if (alpha >= 1) {
    return `#${base}`;
  }

  return `#${base}${toHexChannel(alpha * 255)}`;
}

export function rgbaToHsva(r: number, g: number, b: number, a: number): HSVA {
  const red = clamp(r, 0, 255) / 255;
  const green = clamp(g, 0, 255) / 255;
  const blue = clamp(b, 0, 255) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;

  if (delta !== 0) {
    if (max === red) {
      hue = 60 * (((green - blue) / delta) % 6);
    } else if (max === green) {
      hue = 60 * ((blue - red) / delta + 2);
    } else {
      hue = 60 * ((red - green) / delta + 4);
    }
  }

  const saturation = max === 0 ? 0 : (delta / max) * 100;
  const value = max * 100;

  return {
    h: roundTo(normalizeHue(hue), 1),
    s: roundTo(saturation, 1),
    v: roundTo(value, 1),
    a: roundTo(clamp(a, 0, 1), 3),
  };
}

export function hsvaToRgba(hsva: HSVA): RGBA {
  const hue = normalizeHue(hsva.h);
  const saturation = clamp(hsva.s, 0, 100) / 100;
  const value = clamp(hsva.v, 0, 100) / 100;
  const chroma = value * saturation;
  const secondary = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = value - chroma;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) {
    red = chroma;
    green = secondary;
  } else if (hue < 120) {
    red = secondary;
    green = chroma;
  } else if (hue < 180) {
    green = chroma;
    blue = secondary;
  } else if (hue < 240) {
    green = secondary;
    blue = chroma;
  } else if (hue < 300) {
    red = secondary;
    blue = chroma;
  } else {
    red = chroma;
    blue = secondary;
  }

  return {
    r: Math.round((red + match) * 255),
    g: Math.round((green + match) * 255),
    b: Math.round((blue + match) * 255),
    a: roundTo(clamp(hsva.a, 0, 1), 3),
  };
}

export function hslaToHsva(h: number, s: number, l: number, a: number): HSVA {
  const hue = normalizeHue(h);
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const value = lightness + saturation * Math.min(lightness, 1 - lightness);
  const nextSaturation = value === 0 ? 0 : 2 * (1 - lightness / value);

  return {
    h: roundTo(hue, 1),
    s: roundTo(nextSaturation * 100, 1),
    v: roundTo(value * 100, 1),
    a: roundTo(clamp(a, 0, 1), 3),
  };
}

export function hsvaToHsla(hsva: HSVA): HSLA {
  const saturation = clamp(hsva.s, 0, 100) / 100;
  const value = clamp(hsva.v, 0, 100) / 100;
  const lightness = value * (1 - saturation / 2);
  const nextSaturation =
    lightness === 0 || lightness === 1
      ? 0
      : (value - lightness) / Math.min(lightness, 1 - lightness);

  return {
    h: roundTo(normalizeHue(hsva.h), 1),
    s: roundTo(nextSaturation * 100, 1),
    l: roundTo(lightness * 100, 1),
    a: roundTo(clamp(hsva.a, 0, 1), 3),
  };
}

const parseRgbColor = (value: string) => {
  const match = value.match(RGB_PATTERN);

  if (!match) {
    return null;
  }

  const red = Number(match[1]);
  const green = Number(match[2]);
  const blue = Number(match[3]);
  const alpha = match[4] === undefined ? 1 : Number(match[4]);

  if (![red, green, blue, alpha].every(isFiniteNumber)) {
    return null;
  }

  if (red < 0 || red > 255 || green < 0 || green > 255 || blue < 0 || blue > 255) {
    return null;
  }

  if (alpha < 0 || alpha > 1) {
    return null;
  }

  return rgbaToHsva(red, green, blue, alpha);
};

const parseHslColor = (value: string) => {
  const match = value.match(HSL_PATTERN);

  if (!match) {
    return null;
  }

  const hue = Number(match[1]);
  const saturation = Number(match[2]);
  const lightness = Number(match[3]);
  const alpha = match[4] === undefined ? 1 : Number(match[4]);

  if (![hue, saturation, lightness, alpha].every(isFiniteNumber)) {
    return null;
  }

  if (saturation < 0 || saturation > 100 || lightness < 0 || lightness > 100) {
    return null;
  }

  if (alpha < 0 || alpha > 1) {
    return null;
  }

  return hslaToHsva(hue, saturation, lightness, alpha);
};

export function parseColor(css: string): HSVA | null {
  const value = css.trim();

  if (value.length === 0) {
    return null;
  }

  if (value.startsWith('#')) {
    const rgba = hexToRgba(value);

    return rgba ? rgbaToHsva(rgba.r, rgba.g, rgba.b, rgba.a) : null;
  }

  if (value.startsWith('rgb')) {
    return parseRgbColor(value);
  }

  if (value.startsWith('hsl')) {
    return parseHslColor(value);
  }

  return null;
}

export function isValidCssColor(value: string) {
  return parseColor(value) !== null;
}

export function toHex(hsva: HSVA) {
  const rgba = hsvaToRgba(hsva);

  return rgbaToHex(rgba.r, rgba.g, rgba.b, rgba.a);
}

export function toRgb(hsva: HSVA) {
  const { r, g, b, a } = hsvaToRgba(hsva);

  if (a >= 1) {
    return `rgb(${r}, ${g}, ${b})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${formatAlpha(a)})`;
}

export function toHsl(hsva: HSVA) {
  const { h, s, l, a } = hsvaToHsla(hsva);
  const roundedHue = Math.round(h);
  const roundedSaturation = Math.round(s);
  const roundedLightness = Math.round(l);

  if (a >= 1) {
    return `hsl(${roundedHue}, ${roundedSaturation}%, ${roundedLightness}%)`;
  }

  return `hsla(${roundedHue}, ${roundedSaturation}%, ${roundedLightness}%, ${formatAlpha(a)})`;
}

export function toMode(hsva: HSVA, mode: ColorMode) {
  if (mode === 'rgb') {
    return toRgb(hsva);
  }

  if (mode === 'hsl') {
    return toHsl(hsva);
  }

  return toHex(hsva);
}

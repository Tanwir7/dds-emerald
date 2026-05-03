# ColorPicker · node scaffolding.mjs ColorPicker

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/Button/
packages/components/src/components/Input/
packages/components/src/components/Popover/
packages/components/src/components/
```

- Use the existing `Input` component for hex/RGB/HSL text inputs inside the picker panel.
- Use the existing `Popover` component (or `@radix-ui/react-popover` directly) for the flyout.
- Use the existing `Button` component for the copy button and any action buttons.
- No third-party colour library. All colour math (hex↔RGB↔HSL↔alpha, canvas hit-testing) is implemented as pure utility functions inside `ColorPicker.tsx` or a co-located `colorUtils.ts` file.

---

## Scaffold location

```
packages/components/src/components/ColorPicker/
  ColorPicker.tsx
  colorUtils.ts          ← pure colour math utilities — no React
  ColorPicker.module.scss
  ColorPicker.test.tsx
  ColorPicker.stories.tsx
  index.ts
```

---

## Purpose

`ColorPicker` is a form input for selecting a colour value. It consists of a colour swatch trigger button that opens a popover panel containing a hue/saturation/brightness canvas, hue slider, alpha/opacity slider, hex/RGB/HSL text inputs, and optional preset swatches.

**Output format:** `onChange` always emits a single CSS string in the currently active input mode:

- Hex mode (default): `"#ff0000"` or `"#ff000080"` (8-digit with alpha)
- RGB mode: `"rgb(255, 0, 0)"` or `"rgba(255, 0, 0, 0.5)"`
- HSL mode: `"hsl(0, 100%, 50%)"` or `"hsla(0, 100%, 50%, 0.5)"`

When alpha is 1 (fully opaque), the format omits the alpha channel even in the alpha-aware format (e.g. `"#ff0000"` not `"#ff0000ff"`).

---

## Exports from `index.ts`

```ts
export { ColorPicker };
export type { ColorPickerProps, ColorSwatch };
```

---

## Types

```ts
export type ColorMode = 'hex' | 'rgb' | 'hsl';

export interface ColorSwatch {
  color: string; // any valid CSS color string — normalised internally
  label: string; // accessible name for the swatch button
}

export interface ColorPickerProps {
  // ─── Value ────────────────────────────────────────────────────────────────
  value?: string | null; // controlled — any valid CSS color string
  defaultValue?: string | null; // uncontrolled
  onChange?: (color: string) => void; // emits string in active mode format

  // ─── Preset swatches ──────────────────────────────────────────────────────
  swatches?: ColorSwatch[]; // optional — renders swatch row above inputs
  swatchColumns?: number; // default: 8 — swatches per row

  // ─── Display ──────────────────────────────────────────────────────────────
  defaultMode?: ColorMode; // default: 'hex' — active input mode on first render
  showAlpha?: boolean; // default: true — shows opacity slider and alpha inputs
  showCopyButton?: boolean; // default: true — copies current value to clipboard
  showModeToggle?: boolean; // default: true — shows hex/rgb/hsl toggle buttons

  // ─── Trigger ──────────────────────────────────────────────────────────────
  id?: string;
  label?: string; // renders a visible <label> above the trigger
  disabled?: boolean; // default: false
  error?: string;
  hint?: string;
  triggerSize?: 'sm' | 'md' | 'lg'; // default: 'md' — swatch trigger button size
  className?: string;

  // ─── Popover ──────────────────────────────────────────────────────────────
  align?: 'start' | 'center' | 'end'; // default: 'start'
  side?: 'top' | 'bottom' | 'left' | 'right'; // default: 'bottom'
}
```

---

## Architecture

### Internal colour representation

All internal state uses a normalised HSVA object regardless of the active display mode. This avoids loss of precision during mode switching (e.g. round-tripping through hex destroys HSL precision).

```ts
// colorUtils.ts
export interface HSVA {
  h: number; // 0–360
  s: number; // 0–100
  v: number; // 0–100
  a: number; // 0–1
}
```

Conversion functions required in `colorUtils.ts`:

```ts
// Parsing — input can be any CSS color string
export function parseColor(css: string): HSVA | null;
// handles: #rgb, #rrggbb, #rrggbbaa, rgb(), rgba(), hsl(), hsla()
// returns null if unparseable

// Serialisation — outputs in the requested format
export function toHex(hsva: HSVA): string; // "#rrggbb" or "#rrggbbaa" when a < 1
export function toRgb(hsva: HSVA): string; // "rgb(r, g, b)" or "rgba(r, g, b, a)"
export function toHsl(hsva: HSVA): string; // "hsl(h, s%, l%)" or "hsla(h, s%, l%, a)"
export function toMode(hsva: HSVA, mode: ColorMode): string; // routes to above

// Internal conversions
export function hsvaToRgba(hsva: HSVA): { r: number; g: number; b: number; a: number };
export function rgbaToHsva(r: number, g: number, b: number, a: number): HSVA;
export function hsvaToHsla(hsva: HSVA): { h: number; s: number; l: number; a: number };
export function hslaToHsva(h: number, s: number, l: number, a: number): HSVA;
export function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } | null;
export function rgbaToHex(r: number, g: number, b: number, a?: number): string;

// Validation
export function isValidCssColor(value: string): boolean;
export function clamp(value: number, min: number, max: number): number;
```

### Component breakdown

```
ColorPicker
  ├── <label>                       (when label prop provided)
  ├── Popover.Root
  │     ├── Popover.Trigger asChild
  │     │     └── ColorSwatchTrigger   (swatch square + hex label)
  │     └── Popover.Content
  │           └── ColorPickerPanel
  │                 ├── SaturationCanvas    (2D drag: x=saturation, y=brightness)
  │                 ├── HueSlider           (horizontal range input)
  │                 ├── AlphaSlider         (horizontal range input, when showAlpha)
  │                 ├── ColorPreview        (before/after swatch comparison strip)
  │                 ├── SwatchRow           (when swatches prop provided)
  │                 ├── ModeToggle          (hex/rgb/hsl buttons, when showModeToggle)
  │                 ├── HexInput            (when mode="hex")
  │                 ├── RgbInputs           (when mode="rgb", three inputs: R G B)
  │                 ├── HslInputs           (when mode="hsl", three inputs: H S L)
  │                 ├── AlphaInput          (always when showAlpha — single 0–100 input)
  │                 └── CopyButton          (when showCopyButton)
  └── <p> error / hint
```

### SaturationCanvas

The saturation/brightness picker is a 2D canvas — the most complex part. Implement it WITHOUT `<canvas>` — use a CSS gradient approach instead which is simpler, more accessible, and avoids canvas hit-testing complexity:

```tsx
// SaturationCanvas — pure CSS implementation
const SaturationCanvas = ({ hsva, onChange }: SaturationCanvasProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // CSS gradient: white-to-hue horizontal, white-to-black vertical overlay
  // background: linear-gradient(to bottom, transparent, black),
  //             linear-gradient(to right, white, hsl(${hsva.h}, 100%, 50%))

  const handlePointerEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    onChange({ ...hsva, s: x * 100, v: (1 - y) * 100 });
  };

  return (
    <div
      ref={containerRef}
      className={styles.saturationCanvas}
      style={
        {
          background: `
          linear-gradient(to bottom, transparent, black),
          linear-gradient(to right, white, hsl(${hsva.h}, 100%, 50%))
        `,
        } as React.CSSProperties
      }
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        handlePointerEvent(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) handlePointerEvent(e);
      }}
      role="slider"
      aria-label="Saturation and brightness"
      aria-valuetext={`Saturation ${Math.round(hsva.s)}%, Brightness ${Math.round(hsva.v)}%`}
      tabIndex={0}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 10 : 1;
        switch (e.key) {
          case 'ArrowRight':
            onChange({ ...hsva, s: clamp(hsva.s + step, 0, 100) });
            break;
          case 'ArrowLeft':
            onChange({ ...hsva, s: clamp(hsva.s - step, 0, 100) });
            break;
          case 'ArrowUp':
            onChange({ ...hsva, v: clamp(hsva.v + step, 0, 100) });
            break;
          case 'ArrowDown':
            onChange({ ...hsva, v: clamp(hsva.v - step, 0, 100) });
            break;
        }
      }}
    >
      {/* Thumb indicator */}
      <div
        className={styles.saturationThumb}
        style={
          {
            left: `${hsva.s}%`,
            top: `${100 - hsva.v}%`,
          } as React.CSSProperties
        }
        aria-hidden="true"
      />
    </div>
  );
};
```

The inline `background` style is a documented CSS custom property exception — it is a dynamic computed gradient value based on the current hue that cannot be expressed as a static token or class. Document it as such.

The thumb position (`left`/`top`) is also an inline style exception — dynamic numeric layout driven by colour state.

### HueSlider and AlphaSlider

Both are native `<input type="range">` elements styled with CSS to replace the browser track and thumb. Native range inputs are the correct semantic element — they provide free keyboard navigation (Arrow keys, Page Up/Down, Home/End) and screen reader announcements without any custom implementation.

```tsx
// HueSlider
<input
  type="range"
  min={0}
  max={360}
  step={1}
  value={Math.round(hsva.h)}
  onChange={(e) => onChange({ ...hsva, h: Number(e.target.value) })}
  className={styles.hueSlider}
  aria-label="Hue"
  aria-valuetext={`${Math.round(hsva.h)}°`}
/>

// AlphaSlider
<input
  type="range"
  min={0}
  max={100}
  step={1}
  value={Math.round(hsva.a * 100)}
  onChange={(e) => onChange({ ...hsva, a: Number(e.target.value) / 100 })}
  className={styles.alphaSlider}
  aria-label="Opacity"
  aria-valuetext={`${Math.round(hsva.a * 100)}%`}
/>
```

**Styling range inputs:** Use `appearance: none` and style `::-webkit-slider-thumb`, `::-webkit-slider-runnable-track`, `::-moz-range-thumb`, `::-moz-range-track` in SCSS. The hue slider track is a `linear-gradient` across the hue spectrum. The alpha slider track is a `linear-gradient` from transparent to the current opaque colour over a checkerboard background (indicating transparency).

The slider track gradients are inline styles (dynamic computed values — documented exceptions):

```tsx
// On HueSlider container/wrapper:
style={{
  '--slider-track-bg': 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
} as React.CSSProperties}

// On AlphaSlider container/wrapper:
style={{
  '--alpha-track-color': toHex({ ...hsva, a: 1 }),  // the opaque colour at current hue/s/v
} as React.CSSProperties}
```

### ColorSwatchTrigger

```tsx
const ColorSwatchTrigger = React.forwardRef<HTMLButtonElement, ColorSwatchTriggerProps>(
  (
    { color, label, size = 'md', disabled, hasError, 'aria-expanded': ariaExpanded, ...props },
    ref
  ) => (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      aria-haspopup="dialog"
      aria-expanded={ariaExpanded}
      aria-label={`${label ?? 'Color picker'}. Current colour: ${color ?? 'none'}. Press to open picker.`}
      className={clsx(
        styles.swatchTrigger,
        styles[`swatchTrigger-${size}`],
        hasError && styles.swatchTriggerError,
        disabled && styles.swatchTriggerDisabled
      )}
      {...props}
    >
      {/* Checkerboard background visible through transparent colours */}
      <span className={styles.swatchCheckerboard} aria-hidden="true" />
      <span
        className={styles.swatchColor}
        style={{ backgroundColor: color ?? 'transparent' } as React.CSSProperties}
        aria-hidden="true"
      />
    </button>
  )
);
```

The checkerboard is rendered via a CSS background pattern (documented exception — dynamic computed value). Implement in SCSS using a `background-image` with a repeating-linear-gradient checkerboard:

```scss
.swatchCheckerboard {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(45deg, var(--dds-color-bg-subtle) 25%, transparent 25%),
    linear-gradient(-45deg, var(--dds-color-bg-subtle) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--dds-color-bg-subtle) 75%),
    linear-gradient(-45deg, transparent 75%, var(--dds-color-bg-subtle) 75%);
  background-size: 8px 8px;
  background-position:
    0 0,
    0 4px,
    4px -4px,
    -4px 0;
}
```

### ModeToggle

Three `<button>` elements acting as a tab-like toggle (HEX / RGB / HSL). Use `role="radiogroup"` and `role="radio"` semantics:

```tsx
<div role="radiogroup" aria-label="Colour format" className={styles.modeToggle}>
  {(['hex', 'rgb', 'hsl'] as ColorMode[]).map((m) => (
    <button
      key={m}
      type="button"
      role="radio"
      aria-checked={mode === m}
      onClick={() => setMode(m)}
      className={clsx(styles.modeButton, mode === m && styles.modeButtonActive)}
    >
      {m.toUpperCase()}
    </button>
  ))}
</div>
```

### Text inputs

Each input mode renders different text fields. All use the existing `Input` component:

**Hex mode:**

```tsx
<Input
  value={hexInputValue}
  onChange={(e) => handleHexInput(e.target.value)}
  onBlur={() => commitHexInput()}
  aria-label="Hex colour value"
  placeholder="#000000"
  maxLength={9} // #rrggbbaa
  className={styles.hexInput}
/>
```

**RGB mode:** three `Input` components (R, G, B), each `type="number"` min=0 max=255 step=1.

**HSL mode:** three `Input` components (H: 0–360, S: 0–100, L: 0–100).

**Alpha input** (always shown when `showAlpha`): one `Input`, `type="number"` min=0 max=100 step=1, `aria-label="Opacity percentage"`.

### Text input commit strategy

Do NOT call `onChange` on every keystroke in text inputs — this causes the cursor to jump while the user is mid-typing (e.g. typing "ff" passes "#f" first which is invalid). Instead:

- Maintain a local `inputText` state per field.
- Update `inputText` on every keystroke (`onChange`).
- Commit to HSVA (and call `onChange`) only on `onBlur` and `onKeyDown Enter`.
- Validate on commit — if invalid, revert `inputText` to the last valid value.

### Clipboard copy

```tsx
const handleCopy = async () => {
  await navigator.clipboard.writeText(currentOutputString);
  // Show brief "Copied!" feedback — update button aria-label temporarily
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

The copy button `aria-label` changes to "Copied!" for 2 seconds then reverts. Use `aria-live="polite"` on a visually-hidden span for screen reader announcement.

### Popover panel layout

```
┌──────────────────────────────────────┐
│  [Saturation/brightness canvas      ]│  ← 240px wide, 150px tall
│                                      │
├──────────────────────────────────────┤
│  [Hue slider                        ]│
│  [Alpha slider          ] (if alpha) │
├───────────┬──────────────────────────┤
│ [Preview] │  [Swatch row (if any)   ]│
├───────────┴──────────────────────────┤
│  [HEX] [RGB] [HSL]  (mode toggle)   │
│  [Hex input        ] [A: 100 ] [📋] │
└──────────────────────────────────────┘
```

---

## SCSS — ColorPicker.module.scss

```scss
@use '../../../styles/mixins' as *;

// ─── Root ─────────────────────────────────────────────────────────────────────

.root {
  display: inline-flex;
  flex-direction: column;
  gap: var(--dds-space-1-5);
}

// ─── Label ────────────────────────────────────────────────────────────────────

.label {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-medium);
  color: var(--dds-color-text-default);
}

// ─── Swatch trigger ───────────────────────────────────────────────────────────

.swatchTrigger {
  position: relative;
  overflow: hidden;
  padding: 0;
  border: 2px solid var(--dds-color-border-input);
  border-radius: var(--dds-radius-none);
  cursor: pointer;
  transition: border-color var(--dds-duration-fast) var(--dds-ease-standard);

  &:hover:not(.swatchTriggerDisabled) {
    border-color: var(--dds-color-action-primary);
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }

  &.swatchTriggerError {
    border-color: var(--dds-color-status-danger);
  }
  &.swatchTriggerDisabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.swatchTrigger-sm {
  width: 24px;
  height: 24px;
}
.swatchTrigger-md {
  width: 32px;
  height: 32px;
}
.swatchTrigger-lg {
  width: 40px;
  height: 40px;
}

.swatchCheckerboard {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(45deg, var(--dds-color-bg-subtle) 25%, transparent 25%),
    linear-gradient(-45deg, var(--dds-color-bg-subtle) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--dds-color-bg-subtle) 75%),
    linear-gradient(-45deg, transparent 75%, var(--dds-color-bg-subtle) 75%);
  background-size: 8px 8px;
  background-position:
    0 0,
    0 4px,
    4px -4px,
    -4px 0;
}

.swatchColor {
  position: absolute;
  inset: 0;
}

// ─── Popover panel ────────────────────────────────────────────────────────────

.popoverContent {
  z-index: 50;
  width: 280px;
  background-color: var(--dds-color-bg-popover);
  border: 1px solid var(--dds-color-border-default);
  border-radius: var(--dds-radius-none);
  box-shadow: var(--dds-shadow-sm);
  overflow: hidden;

  &[data-state='open'] {
    animation: panelIn var(--dds-duration-fast) var(--dds-ease-out);
  }
  &[data-state='closed'] {
    animation: panelOut var(--dds-duration-fast) var(--dds-ease-standard);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

@keyframes panelIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes panelOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
}

// ─── Saturation canvas ────────────────────────────────────────────────────────

.saturationCanvas {
  position: relative;
  width: 100%;
  height: 160px;
  cursor: crosshair;
  touch-action: none; // prevent scroll during drag on touch

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: -3px; // inset — canvas is flush to edge
  }
}

.saturationThumb {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid white;
  border-radius: var(--dds-radius-full); // documented exception — circular thumb
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.3);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

// ─── Sliders ─────────────────────────────────────────────────────────────────

.sliderRow {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-2);
  padding: var(--dds-space-3) var(--dds-space-4);
}

// Common slider styling
.hueSlider,
.alphaSlider {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 12px;
  border-radius: var(--dds-radius-full); // documented exception — slider track pill
  border: none;
  outline: none;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }

  // Thumb
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: var(--dds-radius-full); // documented exception — circular thumb
    border: 2px solid white;
    box-shadow:
      0 0 0 1px rgb(0 0 0 / 0.2),
      0 1px 3px rgb(0 0 0 / 0.15);
    background-color: white;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: var(--dds-radius-full);
    border: 2px solid white;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 0.2);
    background-color: white;
    cursor: grab;
  }
}

.hueSlider {
  // Track gradient set via CSS custom property (dynamic — documented exception)
  background: var(
    --slider-track-bg,
    linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)
  );
}

.alphaSliderWrapper {
  position: relative;

  // Checkerboard under the alpha track
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--dds-radius-full);
    background-image:
      linear-gradient(45deg, var(--dds-color-bg-subtle) 25%, transparent 25%),
      linear-gradient(-45deg, var(--dds-color-bg-subtle) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--dds-color-bg-subtle) 75%),
      linear-gradient(-45deg, transparent 75%, var(--dds-color-bg-subtle) 75%);
    background-size: 8px 8px;
    background-position:
      0 0,
      0 4px,
      4px -4px,
      -4px 0;
    pointer-events: none;
  }
}

.alphaSlider {
  position: relative;
  // Track gradient: transparent → current colour (dynamic — documented exception)
  background: linear-gradient(to right, transparent, var(--alpha-track-color, #000000));
}

// ─── Preview + swatches row ───────────────────────────────────────────────────

.previewRow {
  display: flex;
  align-items: flex-start;
  gap: var(--dds-space-3);
  padding: 0 var(--dds-space-4) var(--dds-space-3);
}

.colorPreview {
  position: relative;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid var(--dds-color-border-default);
}

// Checkerboard under preview (same pattern)
.colorPreviewCheckerboard {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(45deg, var(--dds-color-bg-subtle) 25%, transparent 25%),
    linear-gradient(-45deg, var(--dds-color-bg-subtle) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--dds-color-bg-subtle) 75%),
    linear-gradient(-45deg, transparent 75%, var(--dds-color-bg-subtle) 75%);
  background-size: 6px 6px;
  background-position:
    0 0,
    0 3px,
    3px -3px,
    -3px 0;
}

.colorPreviewFill {
  position: absolute;
  inset: 0;
  // backgroundColor set via inline style (dynamic — documented exception)
}

// ─── Swatch row ───────────────────────────────────────────────────────────────

.swatchRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dds-space-1-5);
  flex: 1 1 0;
}

.swatch {
  position: relative;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid var(--dds-color-border-default);
  border-radius: var(--dds-radius-none);
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
  transition:
    transform var(--dds-duration-fast) var(--dds-ease-standard),
    border-color var(--dds-duration-fast) var(--dds-ease-standard);

  &:hover {
    transform: scale(1.15);
    border-color: var(--dds-color-action-primary);
  }
  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }

  &[aria-pressed='true'] {
    border: 2px solid var(--dds-color-action-primary);
  }
}

.swatchFill {
  position: absolute;
  inset: 0;
  // backgroundColor set via inline style
}

// ─── Controls area ────────────────────────────────────────────────────────────

.controls {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-2);
  padding: var(--dds-space-3) var(--dds-space-4) var(--dds-space-4);
  border-top: 1px solid var(--dds-color-border-default);
}

// ─── Mode toggle ─────────────────────────────────────────────────────────────

.modeToggle {
  display: flex;
  gap: var(--dds-space-0-5);
}

.modeButton {
  flex: 1 1 0;
  padding: var(--dds-space-1) 0;
  background: none;
  border: 1px solid var(--dds-color-border-default);
  border-radius: var(--dds-radius-none);
  font-family: var(--dds-font-mono);
  font-size: var(--dds-font-size-xs);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-muted);
  cursor: pointer;
  letter-spacing: var(--dds-tracking-wide);

  &:hover {
    background-color: var(--dds-color-action-ghost-hover);
    color: var(--dds-color-text-default);
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

.modeButtonActive {
  background-color: var(--dds-color-action-primary);
  border-color: var(--dds-color-action-primary);
  color: var(--dds-color-action-primary-foreground);

  &:hover {
    background-color: var(--dds-color-action-primary-hover);
  }
}

// ─── Input row ────────────────────────────────────────────────────────────────

.inputRow {
  display: flex;
  align-items: flex-end;
  gap: var(--dds-space-2);
}

.hexInput {
  flex: 1 1 0;
}
.rgbInput {
  flex: 1 1 0;
}
.hslInput {
  flex: 1 1 0;
}
.alphaInput {
  width: 56px;
  flex-shrink: 0;
}

// ─── Error / hint ─────────────────────────────────────────────────────────────

.error {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-status-danger);
  margin: 0;
}

.hint {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-text-muted);
  margin: 0;
}

// ─── Live region for copy feedback ───────────────────────────────────────────

.liveRegion {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## CSS custom property / inline style exceptions (documented)

| Usage                                   | Element             | Reason                                                       |
| --------------------------------------- | ------------------- | ------------------------------------------------------------ |
| `background` on saturation canvas       | `.saturationCanvas` | Dynamic gradient computed from current hue — no static token |
| `left`/`top` on saturation thumb        | `.saturationThumb`  | Position derived from s/v state — dynamic numeric layout     |
| `--slider-track-bg`                     | `.hueSlider`        | Static hue gradient — passed as CSS custom property          |
| `--alpha-track-color`                   | `.alphaSlider`      | Opaque version of current colour — dynamic                   |
| `backgroundColor` on swatches / preview | Inline              | Dynamic colour value — cannot be a token                     |

---

## Accessibility

### Saturation canvas

- `role="slider"` — the canvas behaves as a 2D slider.
- `aria-label="Saturation and brightness"`.
- `aria-valuetext` communicates current S and V as a readable string: `"Saturation 75%, Brightness 60%"`.
- Keyboard: ArrowRight/Left adjusts saturation ±1% (±10% with Shift). ArrowUp/Down adjusts brightness ±1% (±10% with Shift).
- `tabIndex={0}` — focusable via keyboard.
- Focus ring is inset (`outline-offset: -3px`) since the canvas is edge-to-edge.

### Hue and alpha sliders

- Native `<input type="range">` — full keyboard support (Arrow keys, Home, End, Page Up/Down) built in.
- `aria-label="Hue"` / `aria-label="Opacity"`.
- `aria-valuetext` adds units: `"180°"` for hue, `"50%"` for opacity.

### Mode toggle

- `role="radiogroup"` + `role="radio"` — announces correctly as a set of mutually exclusive options.
- `aria-checked` on each mode button.

### Swatch buttons

- Each swatch is a `<button type="button">` with `aria-label` from the `ColorSwatch.label` field (consumer-provided). This is required — consumers must write meaningful labels (e.g. "Coral red", not "#ff4444").
- `aria-pressed={isSelected}` — indicates currently selected swatch.

### Text inputs

- Each uses the `Input` component with an `aria-label` (e.g. "Red channel", "Hue angle", "Opacity percentage").
- The hex input: `aria-label="Hex colour value"`.
- Number inputs (R/G/B/H/S/L/A): `type="number"` with `min`/`max`/`step` so screen readers announce the range.

### Trigger button

- `aria-haspopup="dialog"`, `aria-expanded`.
- `aria-label` describes current colour: `"Color picker. Current colour: #ff0000. Press to open picker."`.

### Copy button

- `aria-label` toggles: `"Copy colour value"` → `"Copied!"` for 2 seconds.
- `aria-live="polite"` on a visually-hidden span outside the button announces "Copied!" to screen readers without changing button focus.

### Keyboard interactions

| Element           | Key             | Behaviour                                          |
| ----------------- | --------------- | -------------------------------------------------- |
| Trigger           | `Enter`/`Space` | Opens picker popover                               |
| Picker popover    | `Escape`        | Closes, returns focus to trigger                   |
| Saturation canvas | `Arrow` keys    | Adjust S/V by 1% (10% with Shift)                  |
| Hue slider        | `Arrow` keys    | Adjust hue by 1° (10° with Shift — browser native) |
| Alpha slider      | `Arrow` keys    | Adjust opacity by 1% (browser native)              |
| Mode buttons      | `Arrow` keys    | Navigate between HEX/RGB/HSL (radiogroup pattern)  |
| Text inputs       | `Enter`         | Commits typed value                                |
| Text inputs       | `Escape`        | Reverts to last valid value                        |
| Swatch            | `Enter`/`Space` | Selects swatch colour                              |
| Copy button       | `Enter`/`Space` | Copies current value to clipboard                  |

---

## TDD — write ALL tests before implementing

Run scaffolding first: `node scaffolding.mjs ColorPicker`

```
// colorUtils.ts — pure function tests (no React)
describe('colorUtils')
  - parseColor('#ff0000') returns { h: 0, s: 100, v: 100, a: 1 }
  - parseColor('#ff000080') returns correct hsva with a ≈ 0.502
  - parseColor('rgb(255, 0, 0)') returns correct hsva
  - parseColor('rgba(255, 0, 0, 0.5)') returns correct hsva with a=0.5
  - parseColor('hsl(0, 100%, 50%)') returns correct hsva
  - parseColor('hsla(0, 100%, 50%, 0.5)') returns correct hsva
  - parseColor('invalid') returns null
  - parseColor('') returns null
  - toHex with a=1 returns 6-digit hex
  - toHex with a=0.5 returns 8-digit hex
  - toRgb with a=1 returns rgb() not rgba()
  - toRgb with a<1 returns rgba()
  - toHsl with a=1 returns hsl() not hsla()
  - toHsl with a<1 returns hsla()
  - hsvaToRgba round-trip is lossless for primary colours
  - rgbaToHsva round-trip for achromatic (grey) colours
  - clamp(150, 0, 100) returns 100
  - clamp(-10, 0, 100) returns 0
  - to12Hour / to24Hour edge cases: 12AM=0, 12PM=12

// ColorPicker component
describe('Rendering')
  - renders swatch trigger button
  - trigger has aria-haspopup="dialog"
  - trigger has aria-expanded="false" when closed
  - renders label when label prop provided
  - renders error when error prop provided
  - renders hint when hint prop provided
  - error has role="alert"

describe('Trigger')
  - clicking trigger opens popover
  - trigger aria-expanded="true" when open
  - popover closes on Escape
  - popover closes when clicking outside
  - trigger aria-label includes current colour value
  - trigger shows checkerboard for transparent colours

describe('Saturation canvas')
  - renders saturation canvas with role="slider"
  - canvas has aria-label="Saturation and brightness"
  - canvas has aria-valuetext with S and V values
  - ArrowRight increases saturation
  - ArrowLeft decreases saturation
  - ArrowUp increases brightness
  - ArrowDown decreases brightness
  - Shift+ArrowRight increases saturation by 10
  - saturation clamped to 0–100
  - brightness clamped to 0–100
  - pointer down updates colour
  - pointer move with button=1 updates colour
  - pointer capture set on pointer down

describe('Hue slider')
  - renders hue slider with aria-label="Hue"
  - hue slider has aria-valuetext with degree symbol
  - changing hue slider calls onChange
  - hue change updates swatch trigger colour

describe('Alpha slider')
  - renders alpha slider when showAlpha={true} (default)
  - alpha slider has aria-label="Opacity"
  - alpha slider has aria-valuetext with % symbol
  - does NOT render alpha slider when showAlpha={false}
  - changing alpha emits rgba/hsla/8-digit hex

describe('Mode toggle')
  - renders HEX/RGB/HSL buttons
  - mode toggle has role="radiogroup"
  - each button has role="radio"
  - active mode button has aria-checked="true"
  - clicking RGB changes mode
  - does NOT render mode toggle when showModeToggle={false}

describe('Text inputs')
  - hex input renders in hex mode
  - hex input shows current colour value
  - typing valid hex updates colour on blur
  - typing invalid hex reverts on blur
  - typing valid hex and pressing Enter updates colour
  - RGB inputs render in rgb mode (3 inputs)
  - R input has aria-label containing "Red"
  - changing R value updates colour
  - HSL inputs render in hsl mode (3 inputs)
  - alpha input renders when showAlpha={true}
  - alpha input aria-label contains "Opacity"

describe('Swatches')
  - renders swatch buttons when swatches prop provided
  - each swatch has aria-label from ColorSwatch.label
  - each swatch has aria-pressed matching selection state
  - clicking swatch updates colour and calls onChange
  - active swatch has aria-pressed="true"
  - does NOT render swatch row when swatches not provided

describe('Copy button')
  - renders copy button when showCopyButton={true} (default)
  - does NOT render when showCopyButton={false}
  - clicking copy calls navigator.clipboard.writeText with current value
  - copy button aria-label changes to "Copied!" after click
  - aria-label reverts after 2 seconds
  - live region announces "Copied!"

describe('Controlled mode')
  - renders controlled colour value
  - calls onChange on interaction
  - does not update internal state when controlled

describe('Disabled')
  - trigger has disabled attribute
  - popover does not open when disabled

describe('axe')
  - axe: closed state
  - axe: open, hex mode
  - axe: open, rgb mode
  - axe: open, hsl mode
  - axe: open, showAlpha={false}
  - axe: open, with swatches
  - axe: open, swatch selected
  - axe: open, showModeToggle={false}
  - axe: with error
  - axe: disabled
```

---

## Stories — `ColorPicker.stories.tsx`

Title: `Core Components/ColorPicker`

Named exports required:

- `Default` — uncontrolled, all features enabled, no swatches.
- `WithSwatches` — 16 named colour swatches (brand palette). `swatches` prop provided.
- `HexModeOnly` — `showModeToggle={false}`, `defaultMode="hex"`.
- `NoAlpha` — `showAlpha={false}`.
- `NoCopyButton` — `showCopyButton={false}`.
- `WithLabel` — `label="Brand colour"`, `id="brand-color"`.
- `WithError` — `error="Please select a colour"`.
- `Controlled` — `value` and `onChange` managed with `useState`. Displays current value as a `<code>` element outside the picker.
- `TriggerSizes` — three pickers with `triggerSize="sm"`, `"md"`, `"lg"` side by side.
- `Disabled` — `disabled={true}` with a pre-filled value.
- `TransparentDefault` — `defaultValue="rgba(59, 130, 246, 0.5)"`. Shows transparency in trigger.
- `InForm` — ColorPicker inside a `<form>` with a submit button that logs the value. Uses hidden input via `name` prop.

`OpenAndSelectSwatch` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: /color picker/i });
  await userEvent.click(trigger);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const swatch = within(document.body).getByRole('button', { name: /coral red/i });
  await userEvent.click(swatch);
  await expect(swatch).toHaveAttribute('aria-pressed', 'true');
};
```

`SwitchToRgbMode` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: /color picker/i });
  await userEvent.click(trigger);
  const rgbButton = within(document.body).getByRole('radio', { name: /rgb/i });
  await userEvent.click(rgbButton);
  await expect(rgbButton).toHaveAttribute('aria-checked', 'true');
  // R, G, B inputs should now be visible
  await expect(within(document.body).getByRole('spinbutton', { name: /red/i })).toBeVisible();
};
```

Use `autodocs`. Storybook group: `Core Components/ColorPicker`.

---

## Definition of done

- [ ] `colorUtils.ts` implemented as pure functions with no React imports — all round-trip conversions tested
- [ ] All Vitest tests pass
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all states and modes
- [ ] Storybook builds without error
- [ ] Saturation canvas uses CSS gradients — no `<canvas>` element
- [ ] Hue and alpha sliders use native `<input type="range">` — no custom slider
- [ ] Mode toggle uses `role="radiogroup"` / `role="radio"` / `aria-checked`
- [ ] Saturation canvas: `role="slider"`, `aria-valuetext`, keyboard navigation
- [ ] Text inputs commit on blur/Enter — not on every keystroke
- [ ] Invalid text input reverts to last valid value on blur
- [ ] Copy button aria-label toggles and live region announces "Copied!"
- [ ] Swatch buttons have consumer-provided `aria-label` and `aria-pressed`
- [ ] Trigger aria-label includes current colour value
- [ ] `border-radius: var(--dds-radius-none)` on all interactive elements
- [ ] `var(--dds-radius-full)` ONLY on: saturation thumb, slider thumb, slider track — documented exceptions
- [ ] Inline style exceptions documented in component file comment
- [ ] No Tailwind. No hardcoded color or spacing values in SCSS.
- [ ] Exported from `packages/components/src/index.ts`

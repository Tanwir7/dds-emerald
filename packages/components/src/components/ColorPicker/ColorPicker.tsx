import clsx from 'clsx';
import { Copy } from 'lucide-react';
import React from 'react';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { Button } from '../Button';
import { Input } from '../Input';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import styles from './ColorPicker.module.scss';
import {
  clamp,
  parseColor,
  toHex,
  toMode,
  toRgb,
  type ColorMode,
  type HSVA,
  hsvaToHsla,
  hsvaToRgba,
  hslaToHsva,
  rgbaToHsva,
} from './colorUtils';

export type { ColorMode } from './colorUtils';

export interface ColorSwatch {
  color: string;
  label: string;
}

export interface ColorPickerProps {
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (color: string) => void;
  swatches?: ColorSwatch[];
  swatchColumns?: number;
  defaultMode?: ColorMode;
  showAlpha?: boolean;
  showCopyButton?: boolean;
  showModeToggle?: boolean;
  id?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
  triggerSize?: 'sm' | 'md' | 'lg';
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
}

interface DraftState {
  hex: string;
  red: string;
  green: string;
  blue: string;
  hue: string;
  saturation: string;
  lightness: string;
  alpha: string;
}

interface SaturationCanvasProps {
  hsva: HSVA;
  disabled?: boolean;
  onChange: (next: HSVA) => void;
}

interface ColorSwatchTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color: string;
  valueLabel: string;
  size: 'sm' | 'md' | 'lg';
  hasError: boolean;
}

const FALLBACK_HSVA: HSVA = {
  h: 0,
  s: 100,
  v: 100,
  a: 1,
};

const HUE_TRACK_BACKGROUND = [
  'hsl(0 100% 50%)',
  'hsl(60 100% 50%)',
  'hsl(120 100% 50%)',
  'hsl(180 100% 50%)',
  'hsl(240 100% 50%)',
  'hsl(300 100% 50%)',
  'hsl(360 100% 50%)',
].join(', ');

const clampHsva = (value: HSVA): HSVA => ({
  h: clamp(value.h, 0, 360),
  s: clamp(value.s, 0, 100),
  v: clamp(value.v, 0, 100),
  a: clamp(value.a, 0, 1),
});

const getInitialHsva = (value?: string | null, defaultValue?: string | null) =>
  parseColor(value ?? '') ?? parseColor(defaultValue ?? '') ?? FALLBACK_HSVA;

const getDraftState = (hsva: HSVA): DraftState => {
  const rgba = hsvaToRgba(hsva);
  const hsla = hsvaToHsla(hsva);

  return {
    hex: toHex(hsva),
    red: String(rgba.r),
    green: String(rgba.g),
    blue: String(rgba.b),
    hue: String(Math.round(hsla.h)),
    saturation: String(Math.round(hsla.s)),
    lightness: String(Math.round(hsla.l)),
    alpha: String(Math.round(hsva.a * 100)),
  };
};

const getNextDescriptionIds = (errorId?: string, hintId?: string) =>
  [errorId, hintId].filter(Boolean).join(' ') || undefined;

const modeOrder: ColorMode[] = ['hex', 'rgb', 'hsl'];
const popoverContentClassName = getRequiredClassName(styles, 'popoverContent');
const hexInputClassName = getRequiredClassName(styles, 'hexInput');
const rgbInputClassName = getRequiredClassName(styles, 'rgbInput');
const hslInputClassName = getRequiredClassName(styles, 'hslInput');
const alphaInputClassName = getRequiredClassName(styles, 'alphaInput');
const copyButtonClassName = getRequiredClassName(styles, 'copyButton');

const SaturationCanvas = ({ hsva, disabled = false, onChange }: SaturationCanvasProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const updateFromPointer = (clientX: number, clientY: number) => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((clientY - rect.top) / rect.height, 0, 1);

    onChange({
      ...hsva,
      s: roundToOneDecimal(x * 100),
      v: roundToOneDecimal((1 - y) * 100),
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    event.currentTarget.setPointerCapture?.(event.pointerId);
    updateFromPointer(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.buttons !== 1) {
      return;
    }

    updateFromPointer(event.clientX, event.clientY);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    const step = event.shiftKey ? 10 : 1;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        onChange({ ...hsva, s: clamp(hsva.s + step, 0, 100) });
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onChange({ ...hsva, s: clamp(hsva.s - step, 0, 100) });
        break;
      case 'ArrowUp':
        event.preventDefault();
        onChange({ ...hsva, v: clamp(hsva.v + step, 0, 100) });
        break;
      case 'ArrowDown':
        event.preventDefault();
        onChange({ ...hsva, v: clamp(hsva.v - step, 0, 100) });
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      aria-disabled={disabled || undefined}
      aria-label="Saturation and brightness"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(hsva.s)}
      aria-valuetext={`Saturation ${Math.round(hsva.s)}%, Brightness ${Math.round(hsva.v)}%`}
      className={styles.saturationCanvas}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      role="slider"
      style={
        {
          background: `
            linear-gradient(to bottom, transparent, rgb(0 0 0)),
            linear-gradient(to right, rgb(255 255 255), hsl(${Math.round(hsva.h)} 100% 50%))
          `,
        } as React.CSSProperties
      }
      tabIndex={disabled ? -1 : 0}
    >
      <div
        aria-hidden="true"
        className={styles.saturationThumb}
        style={
          {
            left: `${hsva.s}%`,
            top: `${100 - hsva.v}%`,
          } as React.CSSProperties
        }
      />
    </div>
  );
};

const ColorSwatchTrigger = React.forwardRef<HTMLButtonElement, ColorSwatchTriggerProps>(
  ({ color, valueLabel, size, hasError, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        styles.swatchTrigger,
        styles[`swatchTrigger-${size}`],
        hasError && styles.swatchTriggerError,
        disabled && styles.swatchTriggerDisabled,
        className
      )}
      disabled={disabled}
      type="button"
      {...props}
    >
      <span className={styles.triggerSwatch} aria-hidden="true">
        <span className={styles.swatchCheckerboard} />
        <span
          className={styles.swatchColor}
          style={{ backgroundColor: color } as React.CSSProperties}
        />
      </span>
      <span className={styles.triggerValue}>{valueLabel}</span>
    </button>
  )
);

ColorSwatchTrigger.displayName = 'ColorSwatchTrigger';

const roundToOneDecimal = (value: number) => Math.round(value * 10) / 10;

export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      value,
      defaultValue = null,
      onChange,
      swatches,
      swatchColumns = 8,
      defaultMode = 'hex',
      showAlpha = true,
      showCopyButton = true,
      showModeToggle = true,
      id,
      label,
      disabled = false,
      error,
      hint,
      triggerSize = 'md',
      className,
      align = 'start',
      side = 'bottom',
    },
    ref
  ) => {
    const generatedId = React.useId();
    const baseId = id ?? generatedId;
    const triggerId = `${baseId}-trigger`;
    const errorId = error ? `${baseId}-error` : undefined;
    const hintId = hint ? `${baseId}-hint` : undefined;
    const descriptionIds = getNextDescriptionIds(errorId, hintId);
    const [open, setOpen] = React.useState(false);
    const [mode, setMode] = React.useState<ColorMode>(defaultMode);
    const [copied, setCopied] = React.useState(false);
    const [hsva, setHsva] = React.useState<HSVA>(() => getInitialHsva(value, defaultValue));
    const [drafts, setDrafts] = React.useState<DraftState>(() =>
      getDraftState(getInitialHsva(value, defaultValue))
    );

    React.useEffect(() => {
      if (value === undefined) {
        return;
      }

      const parsed = value === null ? FALLBACK_HSVA : parseColor(value);

      if (!parsed) {
        return;
      }

      setHsva(parsed);
      setDrafts(getDraftState(parsed));
    }, [value]);

    React.useEffect(() => {
      if (!copied) {
        return;
      }

      const timeoutId = window.setTimeout(() => {
        setCopied(false);
      }, 2000);

      return () => window.clearTimeout(timeoutId);
    }, [copied]);

    const currentValue = toMode(hsva, mode);
    const previewColor = toRgb(hsva);

    const commitHsva = (nextHsva: HSVA) => {
      const normalized = clampHsva(nextHsva);

      setHsva(normalized);
      setDrafts(getDraftState(normalized));
      onChange?.(toMode(normalized, mode));
    };

    const commitHexDraft = () => {
      const parsed = parseColor(drafts.hex);

      if (!parsed) {
        setDrafts(getDraftState(hsva));
        return;
      }

      const alpha = showAlpha ? Number(drafts.alpha) / 100 : 1;

      if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
        setDrafts(getDraftState(hsva));
        return;
      }

      commitHsva(showAlpha ? { ...parsed, a: alpha } : { ...parsed, a: 1 });
    };

    const commitRgbDraft = () => {
      const red = Number(drafts.red);
      const green = Number(drafts.green);
      const blue = Number(drafts.blue);
      const alpha = showAlpha ? Number(drafts.alpha) / 100 : 1;

      if (
        ![red, green, blue, alpha].every(Number.isFinite) ||
        red < 0 ||
        red > 255 ||
        green < 0 ||
        green > 255 ||
        blue < 0 ||
        blue > 255 ||
        alpha < 0 ||
        alpha > 1
      ) {
        setDrafts(getDraftState(hsva));
        return;
      }

      commitHsva(rgbaToHsva(red, green, blue, alpha));
    };

    const commitHslDraft = () => {
      const hue = Number(drafts.hue);
      const saturation = Number(drafts.saturation);
      const lightness = Number(drafts.lightness);
      const alpha = showAlpha ? Number(drafts.alpha) / 100 : 1;

      if (
        ![hue, saturation, lightness, alpha].every(Number.isFinite) ||
        hue < 0 ||
        hue > 360 ||
        saturation < 0 ||
        saturation > 100 ||
        lightness < 0 ||
        lightness > 100 ||
        alpha < 0 ||
        alpha > 1
      ) {
        setDrafts(getDraftState(hsva));
        return;
      }

      commitHsva(hslaToHsva(hue, saturation, lightness, alpha));
    };

    const handleDraftKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>,
      commit: () => void
    ) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commit();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setDrafts(getDraftState(hsva));
      }
    };

    const handleModeToggleKeyDown = (
      event: React.KeyboardEvent<HTMLButtonElement>,
      active: ColorMode
    ) => {
      const currentIndex = modeOrder.indexOf(active);

      if (
        event.key !== 'ArrowRight' &&
        event.key !== 'ArrowDown' &&
        event.key !== 'ArrowLeft' &&
        event.key !== 'ArrowUp'
      ) {
        return;
      }

      event.preventDefault();
      const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
      const nextMode = modeOrder[
        (currentIndex + direction + modeOrder.length) % modeOrder.length
      ] as ColorMode;
      setMode(nextMode);
    };

    const handleCopy = async () => {
      await navigator.clipboard.writeText(currentValue);
      setCopied(true);
    };

    return (
      <div ref={ref} className={clsx(styles.root, className)}>
        {label ? (
          <label className={styles.label} htmlFor={triggerId}>
            {label}
          </label>
        ) : null}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <ColorSwatchTrigger
              aria-describedby={descriptionIds}
              aria-expanded={open}
              aria-haspopup="dialog"
              aria-label={`${label ?? 'Color picker'}. Current colour: ${currentValue}. Press to open picker.`}
              color={previewColor}
              disabled={disabled}
              hasError={Boolean(error)}
              id={triggerId}
              size={triggerSize}
              valueLabel={currentValue}
            />
          </PopoverTrigger>

          <PopoverContent
            align={align}
            aria-label={label ? `${label} color picker panel` : 'Color picker panel'}
            className={popoverContentClassName}
            side={side}
            sideOffset={8}
            width="auto"
          >
            <div className={styles.panel}>
              <SaturationCanvas hsva={hsva} onChange={commitHsva} />

              <div className={styles.sliderRow}>
                <div
                  className={styles.sliderTrack}
                  style={
                    {
                      '--slider-track-bg': `linear-gradient(to right, ${HUE_TRACK_BACKGROUND})`,
                    } as React.CSSProperties
                  }
                >
                  <input
                    aria-label="Hue"
                    aria-valuetext={`${Math.round(hsva.h)}°`}
                    className={styles.hueSlider}
                    max={360}
                    min={0}
                    onChange={(event) => commitHsva({ ...hsva, h: Number(event.target.value) })}
                    step={1}
                    type="range"
                    value={Math.round(hsva.h)}
                  />
                </div>

                {showAlpha ? (
                  <div
                    className={clsx(styles.sliderTrack, styles.alphaSliderWrapper)}
                    style={
                      { '--alpha-track-color': toHex({ ...hsva, a: 1 }) } as React.CSSProperties
                    }
                  >
                    <input
                      aria-label="Opacity"
                      aria-valuetext={`${Math.round(hsva.a * 100)}%`}
                      className={styles.alphaSlider}
                      max={100}
                      min={0}
                      onChange={(event) =>
                        commitHsva({ ...hsva, a: Number(event.target.value) / 100 })
                      }
                      step={1}
                      type="range"
                      value={Math.round(hsva.a * 100)}
                    />
                  </div>
                ) : null}
              </div>

              <div className={styles.previewRow}>
                <div className={styles.colorPreview} aria-hidden="true">
                  <span className={styles.colorPreviewCheckerboard} />
                  <span
                    className={styles.colorPreviewFill}
                    style={{ backgroundColor: previewColor } as React.CSSProperties}
                  />
                </div>

                {swatches && swatches.length > 0 ? (
                  <div
                    className={styles.swatchRow}
                    style={
                      {
                        gridTemplateColumns: `repeat(${Math.max(1, swatchColumns)}, minmax(0, 1fr))`,
                      } as React.CSSProperties
                    }
                  >
                    {swatches.map((swatch) => {
                      const parsed = parseColor(swatch.color);
                      const normalized = parsed ? toMode(parsed, mode) : swatch.color;
                      const isSelected = parsed ? toHex(parsed) === toHex(hsva) : false;

                      return (
                        <button
                          key={`${swatch.label}-${swatch.color}`}
                          aria-label={swatch.label}
                          aria-pressed={isSelected}
                          className={styles.swatch}
                          onClick={() => {
                            if (parsed) {
                              commitHsva(showAlpha ? parsed : { ...parsed, a: 1 });
                            }
                          }}
                          type="button"
                        >
                          <span className={styles.swatchCheckerboard} aria-hidden="true" />
                          <span
                            aria-hidden="true"
                            className={styles.swatchFill}
                            data-color-value={normalized}
                            style={{ backgroundColor: swatch.color } as React.CSSProperties}
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className={styles.controls}>
                {showModeToggle ? (
                  <div aria-label="Colour format" className={styles.modeToggle} role="radiogroup">
                    {modeOrder.map((item) => (
                      <button
                        key={item}
                        aria-checked={mode === item}
                        className={clsx(
                          styles.modeButton,
                          mode === item && styles.modeButtonActive
                        )}
                        onClick={() => setMode(item)}
                        onKeyDown={(event) => handleModeToggleKeyDown(event, item)}
                        role="radio"
                        tabIndex={mode === item ? 0 : -1}
                        type="button"
                      >
                        {item.toUpperCase()}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className={styles.inputRow}>
                  {mode === 'hex' ? (
                    <Input
                      aria-label="Hex colour value"
                      className={hexInputClassName}
                      onBlur={commitHexDraft}
                      onChange={(event) =>
                        setDrafts((previous) => ({ ...previous, hex: event.target.value }))
                      }
                      onKeyDown={(event) => handleDraftKeyDown(event, commitHexDraft)}
                      placeholder="#000000"
                      type="text"
                      value={drafts.hex}
                    />
                  ) : null}

                  {mode === 'rgb' ? (
                    <>
                      <Input
                        aria-label="Red channel"
                        className={rgbInputClassName}
                        max={255}
                        min={0}
                        onBlur={commitRgbDraft}
                        onChange={(event) =>
                          setDrafts((previous) => ({ ...previous, red: event.target.value }))
                        }
                        onKeyDown={(event) => handleDraftKeyDown(event, commitRgbDraft)}
                        step={1}
                        type="number"
                        value={drafts.red}
                      />
                      <Input
                        aria-label="Green channel"
                        className={rgbInputClassName}
                        max={255}
                        min={0}
                        onBlur={commitRgbDraft}
                        onChange={(event) =>
                          setDrafts((previous) => ({ ...previous, green: event.target.value }))
                        }
                        onKeyDown={(event) => handleDraftKeyDown(event, commitRgbDraft)}
                        step={1}
                        type="number"
                        value={drafts.green}
                      />
                      <Input
                        aria-label="Blue channel"
                        className={rgbInputClassName}
                        max={255}
                        min={0}
                        onBlur={commitRgbDraft}
                        onChange={(event) =>
                          setDrafts((previous) => ({ ...previous, blue: event.target.value }))
                        }
                        onKeyDown={(event) => handleDraftKeyDown(event, commitRgbDraft)}
                        step={1}
                        type="number"
                        value={drafts.blue}
                      />
                    </>
                  ) : null}

                  {mode === 'hsl' ? (
                    <>
                      <Input
                        aria-label="Hue angle"
                        className={hslInputClassName}
                        max={360}
                        min={0}
                        onBlur={commitHslDraft}
                        onChange={(event) =>
                          setDrafts((previous) => ({ ...previous, hue: event.target.value }))
                        }
                        onKeyDown={(event) => handleDraftKeyDown(event, commitHslDraft)}
                        step={1}
                        type="number"
                        value={drafts.hue}
                      />
                      <Input
                        aria-label="Saturation percentage"
                        className={hslInputClassName}
                        max={100}
                        min={0}
                        onBlur={commitHslDraft}
                        onChange={(event) =>
                          setDrafts((previous) => ({ ...previous, saturation: event.target.value }))
                        }
                        onKeyDown={(event) => handleDraftKeyDown(event, commitHslDraft)}
                        step={1}
                        type="number"
                        value={drafts.saturation}
                      />
                      <Input
                        aria-label="Lightness percentage"
                        className={hslInputClassName}
                        max={100}
                        min={0}
                        onBlur={commitHslDraft}
                        onChange={(event) =>
                          setDrafts((previous) => ({ ...previous, lightness: event.target.value }))
                        }
                        onKeyDown={(event) => handleDraftKeyDown(event, commitHslDraft)}
                        step={1}
                        type="number"
                        value={drafts.lightness}
                      />
                    </>
                  ) : null}

                  {showAlpha ? (
                    <Input
                      aria-label="Opacity percentage"
                      className={alphaInputClassName}
                      max={100}
                      min={0}
                      onBlur={
                        mode === 'hsl'
                          ? commitHslDraft
                          : mode === 'rgb'
                            ? commitRgbDraft
                            : commitHexDraft
                      }
                      onChange={(event) =>
                        setDrafts((previous) => ({ ...previous, alpha: event.target.value }))
                      }
                      onKeyDown={(event) =>
                        handleDraftKeyDown(
                          event,
                          mode === 'hsl'
                            ? commitHslDraft
                            : mode === 'rgb'
                              ? commitRgbDraft
                              : commitHexDraft
                        )
                      }
                      step={1}
                      type="number"
                      value={drafts.alpha}
                    />
                  ) : null}

                  {showCopyButton ? (
                    <Button
                      aria-label={copied ? 'Copied!' : 'Copy colour value'}
                      className={copyButtonClassName}
                      icon={Copy}
                      onClick={() => {
                        void handleCopy();
                      }}
                      size="icon-sm"
                      variant="ghost"
                    />
                  ) : null}
                </div>
              </div>

              <span aria-live="polite" className={styles.liveRegion}>
                {copied ? 'Copied!' : ''}
              </span>
            </div>
          </PopoverContent>
        </Popover>

        {error ? (
          <p className={styles.error} id={errorId} role="alert">
            {error}
          </p>
        ) : null}

        {hint ? (
          <p className={styles.hint} id={hintId}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';

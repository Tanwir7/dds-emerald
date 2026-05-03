import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { clamp, hsvaToRgba, parseColor, rgbaToHsva, toHex, toHsl, toRgb } from './colorUtils';
import { ColorPicker } from './ColorPicker';

expect.extend(toHaveNoViolations);

beforeAll(() => {
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ??
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
    configurable: true,
    value: vi.fn(),
  });

  Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('colorUtils', () => {
  it('parses 6-digit hex colours', () => {
    expect(parseColor('#ff0000')).toEqual({ h: 0, s: 100, v: 100, a: 1 });
  });

  it('parses 8-digit hex colours with alpha', () => {
    const parsed = parseColor('#ff000080');

    expect(parsed).not.toBeNull();
    expect(parsed?.h).toBe(0);
    expect(parsed?.s).toBe(100);
    expect(parsed?.v).toBe(100);
    expect(parsed?.a).toBeCloseTo(0.502, 2);
  });

  it('parses rgb colours', () => {
    expect(parseColor('rgb(255, 0, 0)')).toEqual({ h: 0, s: 100, v: 100, a: 1 });
  });

  it('parses rgba colours', () => {
    const parsed = parseColor('rgba(255, 0, 0, 0.5)');

    expect(parsed).not.toBeNull();
    expect(parsed?.a).toBeCloseTo(0.5, 5);
  });

  it('parses hsl colours', () => {
    expect(parseColor('hsl(0, 100%, 50%)')).toEqual({ h: 0, s: 100, v: 100, a: 1 });
  });

  it('parses hsla colours', () => {
    const parsed = parseColor('hsla(0, 100%, 50%, 0.5)');

    expect(parsed).not.toBeNull();
    expect(parsed?.a).toBeCloseTo(0.5, 5);
  });

  it('returns null for invalid colours', () => {
    expect(parseColor('invalid')).toBeNull();
    expect(parseColor('')).toBeNull();
  });

  it('serialises opaque colours as 6-digit hex', () => {
    expect(toHex({ h: 0, s: 100, v: 100, a: 1 })).toBe('#ff0000');
  });

  it('serialises translucent colours as 8-digit hex', () => {
    expect(toHex({ h: 0, s: 100, v: 100, a: 0.5 })).toBe('#ff000080');
  });

  it('serialises opaque colours as rgb()', () => {
    expect(toRgb({ h: 0, s: 100, v: 100, a: 1 })).toBe('rgb(255, 0, 0)');
  });

  it('serialises translucent colours as rgba()', () => {
    expect(toRgb({ h: 0, s: 100, v: 100, a: 0.5 })).toBe('rgba(255, 0, 0, 0.5)');
  });

  it('serialises opaque colours as hsl()', () => {
    expect(toHsl({ h: 0, s: 100, v: 100, a: 1 })).toBe('hsl(0, 100%, 50%)');
  });

  it('serialises translucent colours as hsla()', () => {
    expect(toHsl({ h: 0, s: 100, v: 100, a: 0.5 })).toBe('hsla(0, 100%, 50%, 0.5)');
  });

  it('round-trips HSVA to RGBA for primary colours', () => {
    expect(hsvaToRgba({ h: 120, s: 100, v: 100, a: 1 })).toEqual({ r: 0, g: 255, b: 0, a: 1 });
  });

  it('round-trips RGBA to HSVA for grey colours', () => {
    expect(rgbaToHsva(128, 128, 128, 1)).toEqual({ h: 0, s: 0, v: 50.2, a: 1 });
  });

  it('clamps numeric values', () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-10, 0, 100)).toBe(0);
  });
});

describe('ColorPicker', () => {
  it('renders a swatch trigger button with the current value text', () => {
    render(<ColorPicker defaultValue="#336699" />);

    expect(screen.getByRole('button', { name: /color picker/i })).toBeInTheDocument();
    expect(screen.getByText('#336699')).toBeInTheDocument();
  });

  it('forwards the ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<ColorPicker ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders label, error, and hint copy with the expected accessibility wiring', () => {
    render(
      <ColorPicker
        id="brand-color"
        label="Brand colour"
        error="Choose a valid brand colour."
        hint="Used for chart highlights."
      />
    );

    const trigger = screen.getByRole('button', { name: /brand colour/i });

    expect(screen.getByText('Brand colour').tagName).toBe('LABEL');
    expect(screen.getByText('Choose a valid brand colour.')).toHaveAttribute('role', 'alert');
    expect(screen.getByText('Used for chart highlights.')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-describedby', 'brand-color-error brand-color-hint');
  });

  it('sets popover trigger semantics when closed', () => {
    render(<ColorPicker defaultValue="#ff0000" />);

    const trigger = screen.getByRole('button', { name: /current colour: #ff0000/i });

    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the popover when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="#ff0000" />);

    await user.click(screen.getByRole('button', { name: /current colour: #ff0000/i }));

    expect(await screen.findByRole('slider', { name: 'Saturation and brightness' })).toBeVisible();
    expect(screen.getByRole('button', { name: /current colour: #ff0000/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('closes the popover on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="#ff0000" />);

    const trigger = screen.getByRole('button', { name: /current colour: #ff0000/i });

    await user.click(trigger);
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(
        screen.queryByRole('slider', { name: 'Saturation and brightness' })
      ).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it('renders the saturation canvas with slider semantics', async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="#ff0000" />);

    await user.click(screen.getByRole('button', { name: /current colour: #ff0000/i }));

    const canvas = screen.getByRole('slider', { name: 'Saturation and brightness' });

    expect(canvas).toHaveAttribute('aria-valuetext', 'Saturation 100%, Brightness 100%');
  });

  it('keyboard interaction on the saturation canvas updates the colour', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker defaultValue="#808080" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /current colour: #808080/i }));
    const canvas = screen.getByRole('slider', { name: 'Saturation and brightness' });

    canvas.focus();
    await user.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith('#807f7f');
  });

  it('shift-arrow adjusts saturation in larger steps and clamps values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker defaultValue="#ffffff" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /current colour: #ffffff/i }));
    const canvas = screen.getByRole('slider', { name: 'Saturation and brightness' });

    canvas.focus();
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');

    expect(onChange).toHaveBeenLastCalledWith('#ffffff');
  });

  it('pointer interaction on the saturation canvas updates the colour', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker defaultValue="#000000" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /current colour: #000000/i }));
    const canvas = screen.getByRole('slider', { name: 'Saturation and brightness' });

    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      bottom: 100,
      height: 100,
      left: 0,
      right: 100,
      toJSON: () => ({}),
      top: 0,
      width: 100,
      x: 0,
      y: 0,
    });

    fireEvent.pointerDown(canvas, {
      button: 0,
      buttons: 1,
      clientX: 100,
      clientY: 0,
      pointerId: 1,
    });

    expect(onChange).toHaveBeenLastCalledWith('#ff0000');
  });

  it('renders preset swatches in a grid and allows selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ColorPicker
        defaultValue="#000000"
        onChange={onChange}
        swatchColumns={4}
        swatches={[
          { color: '#ff0000', label: 'Red swatch' },
          { color: '#00ff00', label: 'Green swatch' },
        ]}
      />
    );

    await user.click(screen.getByRole('button', { name: /current colour: #000000/i }));
    await user.click(screen.getByRole('button', { name: 'Red swatch' }));

    expect(onChange).toHaveBeenLastCalledWith('#ff0000');
    expect(screen.getByRole('button', { name: 'Red swatch' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('supports changing the active mode with the mode toggle', async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="#ff0000" />);

    await user.click(screen.getByRole('button', { name: /current colour: #ff0000/i }));
    await user.click(screen.getByRole('radio', { name: 'RGB' }));

    expect(screen.getByDisplayValue('255')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /current colour: rgb\(255, 0, 0\)/i })
    ).toBeInTheDocument();
  });

  it('commits valid hex input on blur and reverts invalid input on Escape', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker defaultValue="#ff0000" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /current colour: #ff0000/i }));
    const hexInput = screen.getByRole('textbox', { name: 'Hex colour value' });

    await user.clear(hexInput);
    await user.type(hexInput, '#00ff00');
    fireEvent.blur(hexInput);

    expect(onChange).toHaveBeenLastCalledWith('#00ff00');

    await user.clear(hexInput);
    await user.type(hexInput, '#zzzzzz');
    await user.keyboard('{Escape}');

    expect(hexInput).toHaveValue('#00ff00');
  });

  it('commits RGB channel changes on Enter instead of every keystroke', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker defaultValue="#000000" defaultMode="rgb" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /current colour: rgb\(0, 0, 0\)/i }));
    const redInput = screen.getByRole('spinbutton', { name: 'Red channel' });

    await user.clear(redInput);
    await user.type(redInput, '255');

    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenLastCalledWith('rgb(255, 0, 0)');
  });

  it('updates opacity through the alpha input when alpha is enabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker defaultValue="#ff0000" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /current colour: #ff0000/i }));
    const opacityInput = screen.getByRole('spinbutton', { name: 'Opacity percentage' });

    await user.clear(opacityInput);
    await user.type(opacityInput, '50');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenLastCalledWith('#ff000080');
  });

  it('copies the current value using the active mode output', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(<ColorPicker defaultValue="#ff0000" defaultMode="rgb" />);

    await user.click(screen.getByRole('button', { name: /current colour: rgb\(255, 0, 0\)/i }));
    await user.click(screen.getByRole('button', { name: 'Copy colour value' }));

    expect(writeText).toHaveBeenCalledWith('rgb(255, 0, 0)');
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('hides alpha controls when showAlpha is false', async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="#ff0000" showAlpha={false} />);

    await user.click(screen.getByRole('button', { name: /current colour: #ff0000/i }));

    expect(screen.queryByLabelText('Opacity')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('spinbutton', { name: 'Opacity percentage' })
    ).not.toBeInTheDocument();
  });

  it('disables interaction when disabled', async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="#ff0000" disabled />);

    const trigger = screen.getByRole('button', { name: /current colour: #ff0000/i });

    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(
      screen.queryByRole('slider', { name: 'Saturation and brightness' })
    ).not.toBeInTheDocument();
  });

  it('has no accessibility violations when the popover is open', async () => {
    const user = userEvent.setup();
    render(
      <main>
        <ColorPicker
          defaultValue="rgba(255, 0, 0, 0.5)"
          label="Colour"
          swatches={[{ color: '#ff0000', label: 'Red swatch' }]}
        />
      </main>
    );

    await user.click(screen.getByRole('button', { name: /current colour: #ff000080/i }));

    expect(await axe(document.body)).toHaveNoViolations();
  });
});

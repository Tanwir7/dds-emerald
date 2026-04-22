import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Label } from '../Label';
import { Switch } from './Switch';
import styles from './Switch.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

beforeAll(() => {
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ??
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  invalid: getRequiredClassName(styles, 'invalid'),
  thumb: getRequiredClassName(styles, 'thumb'),
} as const;

const render = (ui: React.ReactNode) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  let root!: Root;
  act(() => {
    root = createRoot(container);
    root.render(ui);
  });

  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};

const getSwitch = (container: HTMLElement = document.body) => {
  const switchControl = container.querySelector('[role="switch"]');

  expect(switchControl).toBeInstanceOf(HTMLButtonElement);
  return switchControl as HTMLButtonElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Switch', () => {
  it('renders a button with role="switch"', () => {
    const { container } = render(<Switch aria-label="Enable notifications" />);
    const switchControl = getSwitch(container);

    expect(switchControl.tagName).toBe('BUTTON');
    expect(switchControl).toHaveAttribute('role', 'switch');
  });

  it('has aria-checked="false" when unchecked by default', () => {
    const { container } = render(<Switch aria-label="Enable notifications" />);

    expect(getSwitch(container)).toHaveAttribute('aria-checked', 'false');
  });

  it('has aria-checked="true" when checked={true}', () => {
    const { container } = render(<Switch checked aria-label="Enable notifications" />);

    expect(getSwitch(container)).toHaveAttribute('aria-checked', 'true');
  });

  it('forwards className to the root element', () => {
    const { container } = render(
      <Switch className="custom-switch" aria-label="Enable notifications" />
    );

    expect(getSwitch(container)).toHaveClass('custom-switch');
  });

  it('forwards ref to HTMLButtonElement', () => {
    const ref = React.createRef<HTMLButtonElement>();
    const { container } = render(<Switch ref={ref} aria-label="Enable notifications" />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toBe(getSwitch(container));
  });

  it('applies .md class by default', () => {
    const { container } = render(<Switch aria-label="Enable notifications" />);

    expect(getSwitch(container)).toHaveClass(classNames.md);
  });

  it('applies .sm class when size="sm"', () => {
    const { container } = render(<Switch size="sm" aria-label="Enable notifications" />);

    expect(getSwitch(container)).toHaveClass(classNames.sm);
  });

  it('applies .invalid class when invalid={true}', () => {
    const { container } = render(<Switch invalid aria-label="Enable notifications" />);

    expect(getSwitch(container)).toHaveClass(classNames.invalid);
  });

  it('does not apply .invalid when invalid={false}', () => {
    const { container } = render(<Switch invalid={false} aria-label="Enable notifications" />);

    expect(getSwitch(container)).not.toHaveClass(classNames.invalid);
  });

  it('does not automatically set aria-invalid when invalid is true', () => {
    const { container } = render(<Switch invalid aria-label="Enable notifications" />);

    expect(getSwitch(container)).not.toHaveAttribute('aria-invalid');
  });

  it('forwards aria-invalid when supplied by the consumer', () => {
    const { container } = render(
      <Switch invalid aria-invalid="true" aria-label="Enable notifications" />
    );

    expect(getSwitch(container)).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards id prop to the button', () => {
    const { container } = render(<Switch id="notifications" aria-label="Enable notifications" />);

    expect(getSwitch(container)).toHaveAttribute('id', 'notifications');
  });

  it('forwards name and value props for form participation', () => {
    const { container } = render(
      <form>
        <Switch name="notifications" value="enabled" aria-label="Enable notifications" />
      </form>
    );

    const formControl = container.querySelector('input[type="checkbox"]');

    expect(formControl).toHaveAttribute('name', 'notifications');
    expect(formControl).toHaveAttribute('value', 'enabled');
  });

  it('renders Thumb inside root', () => {
    const { container } = render(<Switch aria-label="Enable notifications" />);
    const switchControl = getSwitch(container);
    const thumb = switchControl.querySelector(`.${classNames.thumb}`);

    expect(thumb).toBeInTheDocument();
  });

  it('calls onCheckedChange with true when clicked from unchecked to checked', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Switch onCheckedChange={onCheckedChange} aria-label="Enable notifications" />
    );

    await act(async () => {
      await user.click(getSwitch(container));
    });

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('calls onCheckedChange with false when clicked from checked to unchecked', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Switch checked onCheckedChange={onCheckedChange} aria-label="Enable notifications" />
    );

    await act(async () => {
      await user.click(getSwitch(container));
    });

    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it('does not call onCheckedChange when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Switch disabled onCheckedChange={onCheckedChange} aria-label="Enable notifications" />
    );

    await act(async () => {
      await user.click(getSwitch(container));
    });

    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('is not disabled by default', () => {
    const { container } = render(<Switch aria-label="Enable notifications" />);

    expect(getSwitch(container)).not.toBeDisabled();
    expect(getSwitch(container)).not.toHaveAttribute('data-disabled');
  });

  it('is disabled and has data-disabled when disabled={true}', () => {
    const { container } = render(<Switch disabled aria-label="Enable notifications" />);

    expect(getSwitch(container)).toBeDisabled();
    expect(getSwitch(container)).toHaveAttribute('data-disabled');
  });

  it('keyboard: receives focus on Tab', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <Switch aria-label="Enable notifications" />
      </div>
    );

    await act(async () => {
      await user.tab();
      await user.tab();
    });

    expect(getSwitch(container)).toHaveFocus();
  });

  it('keyboard: toggles on Space', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <Switch onCheckedChange={onCheckedChange} aria-label="Enable notifications" />
      </div>
    );

    await act(async () => {
      await user.tab();
      await user.tab();
      await user.keyboard(' ');
    });

    expect(getSwitch(container)).toHaveAttribute('aria-checked', 'true');
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('keyboard: does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <Switch disabled onCheckedChange={onCheckedChange} aria-label="Enable notifications" />
        <button type="button">after</button>
      </div>
    );

    await act(async () => {
      await user.tab();
      await user.tab();
    });
    await act(async () => {
      await user.keyboard(' ');
    });

    expect(getSwitch(container)).toHaveAttribute('aria-checked', 'false');
    expect(getSwitch(container)).not.toHaveFocus();
    expect(container.querySelector('button:not([role="switch"])')).toHaveFocus();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('axe passes when unchecked', async () => {
    const { container } = render(<Switch aria-label="Enable notifications" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when checked', async () => {
    const { container } = render(<Switch checked aria-label="Enable notifications" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when disabled', async () => {
    const { container } = render(<Switch disabled aria-label="Enable notifications" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when invalid', async () => {
    const { container } = render(
      <Switch invalid aria-invalid="true" aria-label="Enable notifications" />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when associated with a Label via htmlFor/id', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="notifications">Enable notifications</Label>
        <Switch id="notifications" />
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses required tokens and focus styles', () => {
    const stylesheet = readFileSync('src/components/Switch/Switch.module.scss', 'utf8');

    expect(stylesheet).toContain('border-radius: var(--dds-radius-full);');
    expect(stylesheet).toContain('background-color: var(--dds-color-border-input);');
    expect(stylesheet).toContain('background-color: var(--dds-color-action-primary);');
    expect(stylesheet).toContain('background-color: var(--dds-color-status-danger);');
    expect(stylesheet).toContain('outline: 3px solid transparent;');
    expect(stylesheet).toContain('outline-offset: 2px;');
    expect(stylesheet).toContain('oklch(from var(--dds-color-focus-ring) l c h / 0.5)');
    expect(stylesheet).toContain('background-color: white;');
    expect(stylesheet).toContain('box-shadow: var(--dds-shadow-sm);');
    expect(stylesheet).not.toContain('outline: none;');
    expect(stylesheet).not.toContain('.storyA11yScope');
  });

  it('keeps story-only selectors out of runtime styles', () => {
    const runtimeStyles = readFileSync('src/components/Switch/Switch.module.scss', 'utf8');
    const storyStyles = readFileSync('src/components/Switch/Switch.stories.module.scss', 'utf8');

    expect(runtimeStyles).not.toContain('.story');
    expect(storyStyles).toContain('.storyA11yScope');
  });
});

import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox';
import styles from './Checkbox.module.scss';
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
  indicator: getRequiredClassName(styles, 'indicator'),
  checkIcon: getRequiredClassName(styles, 'checkIcon'),
  dashIcon: getRequiredClassName(styles, 'dashIcon'),
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

const getCheckbox = (container: HTMLElement = document.body) => {
  const checkbox = container.querySelector('[role="checkbox"]');

  expect(checkbox).toBeInstanceOf(HTMLButtonElement);
  return checkbox as HTMLButtonElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Checkbox', () => {
  it('renders a button with role="checkbox"', () => {
    const { container } = render(<Checkbox aria-label="Accept terms" />);
    const checkbox = getCheckbox(container);

    expect(checkbox.tagName).toBe('BUTTON');
    expect(checkbox).toHaveAttribute('role', 'checkbox');
  });

  it('has aria-checked="false" when unchecked by default', () => {
    const { container } = render(<Checkbox aria-label="Accept terms" />);

    expect(getCheckbox(container)).toHaveAttribute('aria-checked', 'false');
  });

  it('has aria-checked="true" when checked={true}', () => {
    const { container } = render(<Checkbox checked aria-label="Accept terms" />);

    expect(getCheckbox(container)).toHaveAttribute('aria-checked', 'true');
  });

  it('has aria-checked="mixed" when checked="indeterminate"', () => {
    const { container } = render(<Checkbox checked="indeterminate" aria-label="Accept terms" />);

    expect(getCheckbox(container)).toHaveAttribute('aria-checked', 'mixed');
  });

  it('forwards className to the root element', () => {
    const { container } = render(
      <Checkbox className="custom-checkbox" aria-label="Accept terms" />
    );

    expect(getCheckbox(container)).toHaveClass('custom-checkbox');
  });

  it('forwards ref to HTMLButtonElement', () => {
    const ref = React.createRef<HTMLButtonElement>();
    const { container } = render(<Checkbox ref={ref} aria-label="Accept terms" />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toBe(getCheckbox(container));
  });

  it('applies .md class by default', () => {
    const { container } = render(<Checkbox aria-label="Accept terms" />);

    expect(getCheckbox(container)).toHaveClass(classNames.md);
  });

  it('applies .sm class when size="sm"', () => {
    const { container } = render(<Checkbox size="sm" aria-label="Accept terms" />);

    expect(getCheckbox(container)).toHaveClass(classNames.sm);
  });

  it('applies .invalid class when invalid={true}', () => {
    const { container } = render(<Checkbox invalid aria-label="Accept terms" />);

    expect(getCheckbox(container)).toHaveClass(classNames.invalid);
  });

  it('does not apply .invalid when invalid={false}', () => {
    const { container } = render(<Checkbox invalid={false} aria-label="Accept terms" />);

    expect(getCheckbox(container)).not.toHaveClass(classNames.invalid);
  });

  it('does not automatically set aria-invalid when invalid is true', () => {
    const { container } = render(<Checkbox invalid aria-label="Accept terms" />);

    expect(getCheckbox(container)).not.toHaveAttribute('aria-invalid');
  });

  it('forwards aria-invalid when supplied by the consumer', () => {
    const { container } = render(
      <Checkbox invalid aria-invalid="true" aria-label="Accept terms" />
    );

    expect(getCheckbox(container)).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards id prop to the button', () => {
    const { container } = render(<Checkbox id="terms" aria-label="Accept terms" />);

    expect(getCheckbox(container)).toHaveAttribute('id', 'terms');
  });

  it('forwards name and value props for form participation', () => {
    const { container } = render(
      <form>
        <Checkbox name="terms" value="accepted" aria-label="Accept terms" />
      </form>
    );

    const formControl = container.querySelector('input[type="checkbox"]');

    expect(formControl).toHaveAttribute('name', 'terms');
    expect(formControl).toHaveAttribute('value', 'accepted');
  });

  it('renders Indicator checkmark when checked', () => {
    const { container } = render(<Checkbox checked aria-label="Accept terms" />);
    const indicator = container.querySelector(`.${classNames.indicator}`);

    expect(indicator).toBeInTheDocument();
    expect(indicator?.querySelector(`.${classNames.checkIcon}`)).toBeInTheDocument();
    expect(indicator?.querySelector(`.${classNames.dashIcon}`)).toBeInTheDocument();
  });

  it('renders Indicator dash when indeterminate', () => {
    const { container } = render(<Checkbox checked="indeterminate" aria-label="Accept terms" />);
    const indicator = container.querySelector(`.${classNames.indicator}`);

    expect(indicator).toBeInTheDocument();
    expect(indicator?.querySelector(`.${classNames.checkIcon}`)).toBeInTheDocument();
    expect(indicator?.querySelector(`.${classNames.dashIcon}`)).toBeInTheDocument();
  });

  it('does not render Indicator content when unchecked', () => {
    const { container } = render(<Checkbox aria-label="Accept terms" />);

    expect(container.querySelector(`.${classNames.indicator}`)).not.toBeInTheDocument();
  });

  it('is not disabled by default', () => {
    const { container } = render(<Checkbox aria-label="Accept terms" />);

    expect(getCheckbox(container)).not.toBeDisabled();
    expect(getCheckbox(container)).not.toHaveAttribute('data-disabled');
  });

  it('is disabled when disabled={true}', () => {
    const { container } = render(<Checkbox disabled aria-label="Accept terms" />);

    expect(getCheckbox(container)).toBeDisabled();
    expect(getCheckbox(container)).toHaveAttribute('data-disabled');
  });

  it('calls onCheckedChange with true when clicked from unchecked to checked', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Checkbox onCheckedChange={onCheckedChange} aria-label="Accept terms" />
    );

    await act(async () => {
      await user.click(getCheckbox(container));
    });

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('calls onCheckedChange with false when clicked from checked to unchecked', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Checkbox checked onCheckedChange={onCheckedChange} aria-label="Accept terms" />
    );

    await act(async () => {
      await user.click(getCheckbox(container));
    });

    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it('does not call onCheckedChange when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Checkbox disabled onCheckedChange={onCheckedChange} aria-label="Accept terms" />
    );

    await act(async () => {
      await user.click(getCheckbox(container));
    });

    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('keyboard: receives focus on Tab', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <Checkbox aria-label="Accept terms" />
      </div>
    );

    await user.tab();
    await user.tab();

    expect(getCheckbox(container)).toHaveFocus();
  });

  it('keyboard: toggles on Space', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <Checkbox onCheckedChange={onCheckedChange} aria-label="Accept terms" />
      </div>
    );

    await user.tab();
    await user.tab();
    await act(async () => {
      await user.keyboard(' ');
    });

    expect(getCheckbox(container)).toHaveAttribute('aria-checked', 'true');
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('keyboard: does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <Checkbox disabled onCheckedChange={onCheckedChange} aria-label="Accept terms" />
        <button type="button">after</button>
      </div>
    );

    await user.tab();
    await user.tab();
    await act(async () => {
      await user.keyboard(' ');
    });

    expect(getCheckbox(container)).toHaveAttribute('aria-checked', 'false');
    expect(getCheckbox(container)).not.toHaveFocus();
    expect(container.querySelector('button:not([role="checkbox"])')).toHaveFocus();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('axe passes when unchecked', async () => {
    const { container } = render(<Checkbox aria-label="Accept terms" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when checked', async () => {
    const { container } = render(<Checkbox checked aria-label="Accept terms" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when indeterminate', async () => {
    const { container } = render(<Checkbox checked="indeterminate" aria-label="Accept terms" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when disabled', async () => {
    const { container } = render(<Checkbox disabled aria-label="Accept terms" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when invalid', async () => {
    const { container } = render(
      <Checkbox invalid aria-invalid="true" aria-label="Accept terms" />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when associated with a <label> via htmlFor/id', async () => {
    const { container } = render(
      <div>
        <label htmlFor="terms">Accept terms</label>
        <Checkbox id="terms" />
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses required tokens and focus styles', () => {
    const stylesheet = readFileSync('src/components/Checkbox/Checkbox.module.scss', 'utf8');

    expect(stylesheet).toContain('border: 2px solid var(--dds-color-border-input);');
    expect(stylesheet).toContain('border-radius: var(--dds-radius-none);');
    expect(stylesheet).toContain('background-color: var(--dds-color-bg-input);');
    expect(stylesheet).toContain('color: var(--dds-color-action-primary-foreground);');
    expect(stylesheet).toContain('outline: 3px solid transparent;');
    expect(stylesheet).toContain('outline-offset: 2px;');
    expect(stylesheet).toContain('oklch(from var(--dds-color-focus-ring) l c h / 0.5)');
    expect(stylesheet).toContain('background-color: var(--dds-color-action-primary);');
    expect(stylesheet).toContain('border-color: var(--dds-color-action-primary);');
    expect(stylesheet).toContain('border-color: var(--dds-color-status-danger);');
    expect(stylesheet).toContain('background-color: var(--dds-color-status-danger);');
    expect(stylesheet).toContain('width: var(--dds-space-4);');
    expect(stylesheet).toContain('height: var(--dds-space-4);');
    expect(stylesheet).toContain('width: var(--dds-space-5);');
    expect(stylesheet).toContain('height: var(--dds-space-5);');
    expect(stylesheet).toContain('@include icon-size(sm);');
    expect(stylesheet).not.toContain('outline: none;');
    expect(stylesheet).not.toContain('.storyA11yScope');
  });

  it('keeps story-only selectors out of runtime styles', () => {
    const runtimeStyles = readFileSync('src/components/Checkbox/Checkbox.module.scss', 'utf8');
    const storyStyles = readFileSync(
      'src/components/Checkbox/Checkbox.stories.module.scss',
      'utf8'
    );

    expect(runtimeStyles).not.toContain('.story');
    expect(storyStyles).toContain('.storyA11yScope');
  });
});

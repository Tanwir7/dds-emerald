import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Radio, RadioGroup } from './Radio';
import styles from './Radio.module.scss';
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
  group: getRequiredClassName(styles, 'group'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  invalid: getRequiredClassName(styles, 'invalid'),
  vertical: getRequiredClassName(styles, 'vertical'),
  horizontal: getRequiredClassName(styles, 'horizontal'),
  indicator: getRequiredClassName(styles, 'indicator'),
  dot: getRequiredClassName(styles, 'dot'),
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

const getRadioGroup = (container: HTMLElement = document.body) => {
  const group = container.querySelector('[role="radiogroup"]');

  expect(group).toBeInstanceOf(HTMLDivElement);
  return group as HTMLDivElement;
};

const getRadio = (container: HTMLElement, name: string) => {
  const radio = Array.from(container.querySelectorAll('[role="radio"]')).find(
    (item) => item.getAttribute('aria-label') === name
  );

  expect(radio).toBeInstanceOf(HTMLButtonElement);
  return radio as HTMLButtonElement;
};

const defaultGroup = (
  <RadioGroup aria-label="Delivery speed">
    <Radio value="standard" aria-label="Standard" />
    <Radio value="express" aria-label="Express" />
  </RadioGroup>
);

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Radio', () => {
  it('RadioGroup renders a div with role="radiogroup"', () => {
    const { container } = render(defaultGroup);
    const group = getRadioGroup(container);

    expect(group.tagName).toBe('DIV');
    expect(group).toHaveAttribute('role', 'radiogroup');
  });

  it('Radio renders a button with role="radio"', () => {
    const { container } = render(defaultGroup);
    const radio = getRadio(container, 'Standard');

    expect(radio.tagName).toBe('BUTTON');
    expect(radio).toHaveAttribute('role', 'radio');
  });

  it('Radio has aria-checked="false" when not selected', () => {
    const { container } = render(defaultGroup);

    expect(getRadio(container, 'Standard')).toHaveAttribute('aria-checked', 'false');
  });

  it('Radio has aria-checked="true" when its value matches RadioGroup value', () => {
    const { container } = render(
      <RadioGroup value="express" aria-label="Delivery speed">
        <Radio value="standard" aria-label="Standard" />
        <Radio value="express" aria-label="Express" />
      </RadioGroup>
    );

    expect(getRadio(container, 'Express')).toHaveAttribute('aria-checked', 'true');
  });

  it('RadioGroup forwards className to wrapper', () => {
    const { container } = render(
      <RadioGroup className="custom-group" aria-label="Delivery speed">
        <Radio value="standard" aria-label="Standard" />
      </RadioGroup>
    );

    expect(getRadioGroup(container)).toHaveClass('custom-group');
  });

  it('Radio forwards className to button', () => {
    const { container } = render(
      <RadioGroup aria-label="Delivery speed">
        <Radio className="custom-radio" value="standard" aria-label="Standard" />
      </RadioGroup>
    );

    expect(getRadio(container, 'Standard')).toHaveClass('custom-radio');
  });

  it('RadioGroup forwards ref to HTMLDivElement', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <RadioGroup ref={ref} aria-label="Delivery speed">
        <Radio value="standard" aria-label="Standard" />
      </RadioGroup>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(getRadioGroup(container));
  });

  it('Radio forwards ref to HTMLButtonElement', () => {
    const ref = React.createRef<HTMLButtonElement>();
    const { container } = render(
      <RadioGroup aria-label="Delivery speed">
        <Radio ref={ref} value="standard" aria-label="Standard" />
      </RadioGroup>
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toBe(getRadio(container, 'Standard'));
  });

  it('Radio applies .md class by default', () => {
    const { container } = render(defaultGroup);

    expect(getRadio(container, 'Standard')).toHaveClass(classNames.md);
  });

  it('Radio applies .sm class when size="sm"', () => {
    const { container } = render(
      <RadioGroup aria-label="Delivery speed">
        <Radio size="sm" value="standard" aria-label="Standard" />
      </RadioGroup>
    );

    expect(getRadio(container, 'Standard')).toHaveClass(classNames.sm);
  });

  it('Radio applies .invalid class when invalid={true}', () => {
    const { container } = render(
      <RadioGroup aria-label="Delivery speed">
        <Radio invalid value="standard" aria-label="Standard" />
      </RadioGroup>
    );

    expect(getRadio(container, 'Standard')).toHaveClass(classNames.invalid);
  });

  it('Radio does not automatically set aria-invalid when invalid is true', () => {
    const { container } = render(
      <RadioGroup aria-label="Delivery speed">
        <Radio invalid value="standard" aria-label="Standard" />
      </RadioGroup>
    );

    expect(getRadio(container, 'Standard')).not.toHaveAttribute('aria-invalid');
  });

  it('Radio forwards aria-invalid when supplied by the consumer', () => {
    const { container } = render(
      <RadioGroup aria-label="Delivery speed">
        <Radio invalid aria-invalid="true" value="standard" aria-label="Standard" />
      </RadioGroup>
    );

    expect(getRadio(container, 'Standard')).toHaveAttribute('aria-invalid', 'true');
  });

  it('RadioGroup orientation="vertical" applies .vertical class by default', () => {
    const { container } = render(defaultGroup);

    expect(getRadioGroup(container)).toHaveClass(classNames.vertical);
  });

  it('RadioGroup orientation="horizontal" applies .horizontal class', () => {
    const { container } = render(
      <RadioGroup orientation="horizontal" aria-label="Delivery speed">
        <Radio value="standard" aria-label="Standard" />
      </RadioGroup>
    );

    expect(getRadioGroup(container)).toHaveClass(classNames.horizontal);
  });

  it('Radio disabled={true} sets data-disabled attribute', () => {
    const { container } = render(
      <RadioGroup aria-label="Delivery speed">
        <Radio disabled value="standard" aria-label="Standard" />
      </RadioGroup>
    );

    expect(getRadio(container, 'Standard')).toBeDisabled();
    expect(getRadio(container, 'Standard')).toHaveAttribute('data-disabled');
  });

  it('RadioGroup disabled={true} disables all child Radio items', () => {
    const { container } = render(
      <RadioGroup disabled aria-label="Delivery speed">
        <Radio value="standard" aria-label="Standard" />
        <Radio value="express" aria-label="Express" />
      </RadioGroup>
    );

    expect(getRadio(container, 'Standard')).toBeDisabled();
    expect(getRadio(container, 'Express')).toBeDisabled();
  });

  it('calls onValueChange with correct value when Radio is clicked', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <RadioGroup onValueChange={onValueChange} aria-label="Delivery speed">
        <Radio value="standard" aria-label="Standard" />
        <Radio value="express" aria-label="Express" />
      </RadioGroup>
    );

    await act(async () => {
      await user.click(getRadio(container, 'Express'));
    });

    expect(onValueChange).toHaveBeenCalledWith('express');
  });

  it('does not call onValueChange when Radio is disabled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <RadioGroup onValueChange={onValueChange} aria-label="Delivery speed">
        <Radio disabled value="standard" aria-label="Standard" />
      </RadioGroup>
    );

    await act(async () => {
      await user.click(getRadio(container, 'Standard'));
    });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('renders Indicator dot when Radio is selected', () => {
    const { container } = render(
      <RadioGroup value="standard" aria-label="Delivery speed">
        <Radio value="standard" aria-label="Standard" />
        <Radio value="express" aria-label="Express" />
      </RadioGroup>
    );

    const selectedRadio = getRadio(container, 'Standard');
    expect(selectedRadio.querySelector(`.${classNames.indicator}`)).toBeInTheDocument();
    expect(selectedRadio.querySelector(`.${classNames.dot}`)).toBeInTheDocument();
  });

  it('does not render Indicator when Radio is unselected', () => {
    const { container } = render(defaultGroup);

    expect(
      getRadio(container, 'Standard').querySelector(`.${classNames.indicator}`)
    ).not.toBeInTheDocument();
  });

  it('keyboard: Tab focuses first unchecked/selected Radio', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        {defaultGroup}
      </div>
    );

    await act(async () => {
      await user.tab();
      await user.tab();
    });

    expect(getRadio(container, 'Standard')).toHaveFocus();
  });

  it('keyboard: ArrowDown moves to next Radio', async () => {
    const user = userEvent.setup();
    const { container } = render(defaultGroup);

    act(() => {
      getRadio(container, 'Standard').focus();
    });
    await act(async () => {
      await user.keyboard('{ArrowDown}');
    });

    expect(getRadio(container, 'Express')).toHaveFocus();
  });

  it('keyboard: ArrowUp moves to previous Radio', async () => {
    const user = userEvent.setup();
    const { container } = render(defaultGroup);

    act(() => {
      getRadio(container, 'Express').focus();
    });
    await act(async () => {
      await user.keyboard('{ArrowUp}');
    });

    expect(getRadio(container, 'Standard')).toHaveFocus();
  });

  it('keyboard: disabled Radio is skipped during arrow navigation', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RadioGroup aria-label="Delivery speed">
        <Radio value="standard" aria-label="Standard" />
        <Radio disabled value="express" aria-label="Express" />
        <Radio value="overnight" aria-label="Overnight" />
      </RadioGroup>
    );

    act(() => {
      getRadio(container, 'Standard').focus();
    });
    await act(async () => {
      await user.keyboard('{ArrowDown}');
    });

    expect(getRadio(container, 'Overnight')).toHaveFocus();
  });

  it('axe passes for default group (vertical)', async () => {
    const { container } = render(defaultGroup);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes for horizontal group', async () => {
    const { container } = render(
      <RadioGroup orientation="horizontal" aria-label="Delivery speed">
        <Radio value="standard" aria-label="Standard" />
        <Radio value="express" aria-label="Express" />
      </RadioGroup>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when one item is selected', async () => {
    const { container } = render(
      <RadioGroup value="standard" aria-label="Delivery speed">
        <Radio value="standard" aria-label="Standard" />
        <Radio value="express" aria-label="Express" />
      </RadioGroup>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when one item is disabled', async () => {
    const { container } = render(
      <RadioGroup aria-label="Delivery speed">
        <Radio value="standard" aria-label="Standard" />
        <Radio disabled value="express" aria-label="Express" />
      </RadioGroup>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when invalid item has aria-invalid forwarded', async () => {
    const { container } = render(
      <RadioGroup aria-label="Delivery speed">
        <Radio invalid aria-invalid="true" value="standard" aria-label="Standard" />
        <Radio value="express" aria-label="Express" />
      </RadioGroup>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses required tokens and focus styles', () => {
    const stylesheet = readFileSync('src/components/Radio/Radio.module.scss', 'utf8');

    expect(stylesheet).toContain("@use '../../styles/mixins' as *;");
    expect(stylesheet).toContain("@use '../../styles/breakpoints' as *;");
    expect(stylesheet).toContain('border: 2px solid var(--dds-color-border-input);');
    expect(stylesheet).toContain('border-radius: var(--dds-radius-full);');
    expect(stylesheet).toContain('background-color: var(--dds-color-bg-input);');
    expect(stylesheet).toContain('outline: 3px solid transparent;');
    expect(stylesheet).toContain('outline-offset: 2px;');
    expect(stylesheet).toContain('oklch(from var(--dds-color-focus-ring) l c h / 0.5)');
    expect(stylesheet).toContain('border-color: var(--dds-color-action-primary);');
    expect(stylesheet).toContain('background-color: var(--dds-color-action-primary);');
    expect(stylesheet).toContain('border-color: var(--dds-color-status-danger);');
    expect(stylesheet).toContain('background-color: var(--dds-color-status-danger);');
    expect(stylesheet).toContain('width: var(--dds-space-4);');
    expect(stylesheet).toContain('height: var(--dds-space-4);');
    expect(stylesheet).toContain('width: var(--dds-space-5);');
    expect(stylesheet).toContain('height: var(--dds-space-5);');
    expect(stylesheet).toContain('gap: var(--dds-space-2);');
    expect(stylesheet).not.toContain('outline: none;');
    expect(stylesheet).not.toContain('.storyA11yScope');
  });

  it('keeps story-only selectors out of runtime styles', () => {
    const runtimeStyles = readFileSync('src/components/Radio/Radio.module.scss', 'utf8');
    const storyStyles = readFileSync('src/components/Radio/Radio.stories.module.scss', 'utf8');

    expect(runtimeStyles).not.toContain('.story');
    expect(storyStyles).toContain('.storyA11yScope');
  });
});

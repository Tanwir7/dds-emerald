import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { SwitchField } from './SwitchField';
import styles from './SwitchField.module.scss';
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
  row: getRequiredClassName(styles, 'row'),
  labelLeft: getRequiredClassName(styles, 'labelLeft'),
  labelGroup: getRequiredClassName(styles, 'labelGroup'),
  instruction: getRequiredClassName(styles, 'instruction'),
  description: getRequiredClassName(styles, 'description'),
  helper: getRequiredClassName(styles, 'helper'),
  helperSm: getRequiredClassName(styles, 'helperSm'),
  helperMd: getRequiredClassName(styles, 'helperMd'),
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

const getLabel = (container: HTMLElement = document.body) => {
  const label = container.querySelector('label');

  expect(label).toBeInstanceOf(HTMLLabelElement);
  return label as HTMLLabelElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('SwitchField', () => {
  it('renders a switch with role="switch"', () => {
    const { container } = render(<SwitchField label="Enable notifications" />);

    expect(getSwitch(container)).toHaveAttribute('role', 'switch');
  });

  it('renders a label element with correct text', () => {
    const { container } = render(<SwitchField label="Enable notifications" />);

    expect(getLabel(container)).toHaveTextContent('Enable notifications');
  });

  it('label htmlFor matches switch id', () => {
    const { container } = render(<SwitchField id="notifications" label="Enable notifications" />);

    expect(getLabel(container)).toHaveAttribute('for', 'notifications');
    expect(getSwitch(container)).toHaveAttribute('id', 'notifications');
  });

  it('auto-generates id when no id prop provided', () => {
    const { container } = render(<SwitchField label="Enable notifications" />);
    const switchControl = getSwitch(container);

    expect(switchControl.id).toBeTruthy();
    expect(getLabel(container)).toHaveAttribute('for', switchControl.id);
  });

  it('uses provided id when id prop given', () => {
    const { container } = render(<SwitchField id="notifications" label="Enable notifications" />);

    expect(getSwitch(container)).toHaveAttribute('id', 'notifications');
  });

  it('forwards className to the root element', () => {
    const { container } = render(
      <SwitchField className="custom-field" label="Enable notifications" />
    );

    expect(container.querySelector(`.${classNames.root}`)).toHaveClass('custom-field');
  });

  it('forwards ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<SwitchField ref={ref} label="Enable notifications" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass(classNames.root);
  });

  it('renders instruction Text when instruction provided', () => {
    const { container } = render(
      <SwitchField
        id="notifications"
        label="Enable notifications"
        instruction="Choose how this workspace sends alerts."
      />
    );

    const instruction = container.querySelector('#notifications-instruction');

    expect(instruction).toHaveTextContent('Choose how this workspace sends alerts.');
    expect(instruction).toHaveClass(classNames.instruction);
  });

  it('does not render instruction when omitted', () => {
    const { container } = render(<SwitchField id="notifications" label="Enable notifications" />);

    expect(container.querySelector('#notifications-instruction')).not.toBeInTheDocument();
  });

  it('renders helper Text when helper provided', () => {
    const { container } = render(
      <SwitchField
        id="notifications"
        label="Enable notifications"
        helper="You can update this later."
      />
    );

    const helper = container.querySelector('#notifications-helper');

    expect(helper).toHaveTextContent('You can update this later.');
    expect(helper).toHaveClass(classNames.helper);
  });

  it('does not render helper when omitted', () => {
    const { container } = render(<SwitchField id="notifications" label="Enable notifications" />);

    expect(container.querySelector('#notifications-helper')).not.toBeInTheDocument();
  });

  it('renders description span when description provided', () => {
    const { container } = render(
      <SwitchField id="notifications" label="Enable notifications" description="Recommended" />
    );

    expect(container.querySelector('#notifications-desc')).toHaveTextContent('Recommended');
    expect(container.querySelector('#notifications-desc')).toHaveClass(classNames.description);
  });

  it('does not render description when omitted', () => {
    const { container } = render(<SwitchField id="notifications" label="Enable notifications" />);

    expect(container.querySelector('#notifications-desc')).not.toBeInTheDocument();
  });

  it('description span has an id attribute', () => {
    const { container } = render(
      <SwitchField id="notifications" label="Enable notifications" description="Recommended" />
    );

    expect(container.querySelector(`.${classNames.description}`)).toHaveAttribute(
      'id',
      'notifications-desc'
    );
  });

  it('default labelPosition="right": Switch precedes labelGroup in DOM', () => {
    const { container } = render(<SwitchField label="Enable notifications" />);
    const row = container.querySelector(`.${classNames.row}`);

    expect(row?.children[0]).toBe(getSwitch(container));
    expect(row?.children[1]).toHaveClass(classNames.labelGroup);
  });

  it('labelPosition="left": Switch still precedes labelGroup in DOM', () => {
    const { container } = render(<SwitchField label="Enable notifications" labelPosition="left" />);
    const row = container.querySelector(`.${classNames.row}`);

    expect(row?.children[0]).toBe(getSwitch(container));
    expect(row?.children[1]).toHaveClass(classNames.labelGroup);
  });

  it('labelPosition="left": applies .labelLeft class to row', () => {
    const { container } = render(<SwitchField label="Enable notifications" labelPosition="left" />);

    expect(container.querySelector(`.${classNames.row}`)).toHaveClass(classNames.labelLeft);
  });

  it('switch has aria-describedby including instruction id when present', () => {
    const { container } = render(
      <SwitchField id="notifications" label="Enable notifications" instruction="Choose alerts." />
    );

    expect(getSwitch(container)).toHaveAttribute('aria-describedby', 'notifications-instruction');
  });

  it('switch has aria-describedby including description id when present', () => {
    const { container } = render(
      <SwitchField id="notifications" label="Enable notifications" description="Recommended" />
    );

    expect(getSwitch(container)).toHaveAttribute('aria-describedby', 'notifications-desc');
  });

  it('switch has aria-describedby including helper id when present', () => {
    const { container } = render(
      <SwitchField id="notifications" label="Enable notifications" helper="You can update this." />
    );

    expect(getSwitch(container)).toHaveAttribute('aria-describedby', 'notifications-helper');
  });

  it('switch has aria-describedby listing all three ids when all present', () => {
    const { container } = render(
      <SwitchField
        id="notifications"
        label="Enable notifications"
        instruction="Choose alerts."
        description="Recommended"
        helper="You can update this."
      />
    );

    expect(getSwitch(container)).toHaveAttribute(
      'aria-describedby',
      'notifications-instruction notifications-desc notifications-helper'
    );
  });

  it('switch does not have aria-describedby when no text slots provided', () => {
    const { container } = render(<SwitchField id="notifications" label="Enable notifications" />);

    expect(getSwitch(container)).not.toHaveAttribute('aria-describedby');
  });

  it('switch has aria-required="true" when required={true}', () => {
    const { container } = render(<SwitchField label="Enable notifications" required />);

    expect(getSwitch(container)).toHaveAttribute('aria-required', 'true');
  });

  it('switch has aria-invalid="true" when helperIntent="error"', () => {
    const { container } = render(
      <SwitchField
        label="Enable notifications"
        helper="Choose a notification preference."
        helperIntent="error"
      />
    );

    expect(getSwitch(container)).toHaveAttribute('aria-invalid', 'true');
  });

  it('switch has aria-invalid="true" when invalid={true}', () => {
    const { container } = render(<SwitchField label="Enable notifications" invalid />);

    expect(getSwitch(container)).toHaveAttribute('aria-invalid', 'true');
  });

  it('Label shows required indicator when required={true}', () => {
    const { container } = render(<SwitchField label="Enable notifications" required />);

    expect(getLabel(container).querySelector('[aria-hidden="true"]')).toHaveTextContent('*');
  });

  it('Label is disabled when disabled={true}', () => {
    const { container } = render(<SwitchField label="Enable notifications" disabled />);

    expect(getLabel(container).className).toContain('disabled');
  });

  it('size="sm" is forwarded to Switch', () => {
    const { container } = render(<SwitchField label="Enable notifications" size="sm" />);

    expect(getSwitch(container).className).toContain('sm');
  });

  it('checked prop is forwarded', () => {
    const { container } = render(<SwitchField label="Enable notifications" checked />);

    expect(getSwitch(container)).toHaveAttribute('aria-checked', 'true');
  });

  it('onCheckedChange fires on click', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <SwitchField label="Enable notifications" onCheckedChange={onCheckedChange} />
    );

    await act(async () => {
      await user.click(getSwitch(container));
    });

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('disabled forwarded', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <SwitchField label="Enable notifications" disabled onCheckedChange={onCheckedChange} />
    );

    await act(async () => {
      await user.click(getSwitch(container));
    });

    expect(getSwitch(container)).toBeDisabled();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('helper has correct padding class for size="md"', () => {
    const { container } = render(
      <SwitchField id="notifications" label="Enable notifications" helper="Help." />
    );

    expect(container.querySelector('#notifications-helper')).toHaveClass(classNames.helperMd);
  });

  it('helper has correct padding class for size="sm"', () => {
    const { container } = render(
      <SwitchField id="notifications" label="Enable notifications" helper="Help." size="sm" />
    );

    expect(container.querySelector('#notifications-helper')).toHaveClass(classNames.helperSm);
  });

  it('keyboard: Tab focuses the switch', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <SwitchField label="Enable notifications" />
      </div>
    );

    await act(async () => {
      await user.tab();
      await user.tab();
    });

    expect(getSwitch(container)).toHaveFocus();
  });

  it('keyboard: Space toggles the switch', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <SwitchField label="Enable notifications" onCheckedChange={onCheckedChange} />
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

  it('keyboard: disabled switch is not focusable', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <SwitchField label="Enable notifications" disabled />
        <button type="button">after</button>
      </div>
    );

    await act(async () => {
      await user.tab();
      await user.tab();
    });

    expect(getSwitch(container)).not.toHaveFocus();
    expect(container.querySelector('button:not([role="switch"])')).toHaveFocus();
  });

  it('axe: passes for default right label with no slots', async () => {
    const { container } = render(<SwitchField label="Enable notifications" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe: passes for labelPosition="left"', async () => {
    const { container } = render(<SwitchField label="Enable notifications" labelPosition="left" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe: passes with description', async () => {
    const { container } = render(
      <SwitchField label="Enable notifications" description="Recommended" />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe: passes with instruction and helper', async () => {
    const { container } = render(
      <SwitchField
        label="Enable notifications"
        instruction="Choose alerts."
        helper="You can update this later."
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses required tokens and keeps story styles out of runtime CSS', () => {
    const stylesheet = readFileSync('src/components/SwitchField/SwitchField.module.scss', 'utf8');

    expect(stylesheet).toContain('gap: var(--dds-space-3);');
    expect(stylesheet).toContain('color: var(--dds-color-text-muted);');
    expect(stylesheet).toContain('padding-left: calc(var(--dds-space-11) + var(--dds-space-3));');
    expect(stylesheet).toContain('padding-left: calc(var(--dds-space-8) + var(--dds-space-3));');
    expect(stylesheet).not.toContain('.story');
    expect(stylesheet).not.toContain('44px');
    expect(stylesheet).not.toContain('32px');
  });
});

import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { RadioGroupField } from './RadioGroupField';
import styles from './RadioGroupField.module.scss';
import { Label } from '../Label';
import { Radio } from '../Radio';
import radioStyles from '../Radio/Radio.module.scss';
import textStyles from '../Text/Text.module.scss';
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
  groupLabel: getRequiredClassName(styles, 'groupLabel'),
  groupLabelNoInstruction: getRequiredClassName(styles, 'groupLabelNoInstruction'),
  groupLabelDisabled: getRequiredClassName(styles, 'groupLabelDisabled'),
  requiredMark: getRequiredClassName(styles, 'requiredMark'),
  instruction: getRequiredClassName(styles, 'instruction'),
  helper: getRequiredClassName(styles, 'helper'),
} as const;

const radioClassNames = {
  horizontal: getRequiredClassName(radioStyles, 'horizontal'),
  vertical: getRequiredClassName(radioStyles, 'vertical'),
};

const textClassNames = {
  colorDanger: getRequiredClassName(textStyles, 'colorDanger'),
  colorSuccess: getRequiredClassName(textStyles, 'colorSuccess'),
};

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

const RadioOption = ({ id, label, value }: { id: string; label: string; value: string }) => (
  <div>
    <Radio id={id} value={value} />
    <Label htmlFor={id}>{label}</Label>
  </div>
);

const defaultField = (
  <RadioGroupField label="Notification frequency">
    <RadioOption id="frequency-daily" label="Daily" value="daily" />
    <RadioOption id="frequency-weekly" label="Weekly" value="weekly" />
  </RadioGroupField>
);

const getRadioGroup = (container: HTMLElement = document.body) => {
  const group = container.querySelector('[role="radiogroup"]');

  expect(group).toBeInstanceOf(HTMLDivElement);
  return group as HTMLDivElement;
};

const getGroupLabel = (container: HTMLElement = document.body) => {
  const label = container.querySelector(`.${classNames.groupLabel}`);

  expect(label).toBeInstanceOf(HTMLSpanElement);
  return label as HTMLSpanElement;
};

const getRadioByLabel = (container: HTMLElement, label: string) => {
  const input = container.querySelector(`[id="${label}"]`);

  expect(input).toBeInstanceOf(HTMLButtonElement);
  return input as HTMLButtonElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('RadioGroupField', () => {
  it('renders a div with role="radiogroup"', () => {
    const { container } = render(defaultField);

    expect(getRadioGroup(container)).toHaveAttribute('role', 'radiogroup');
  });

  it('renders group label span with correct text', () => {
    const { container } = render(defaultField);

    expect(getGroupLabel(container).tagName).toBe('SPAN');
    expect(getGroupLabel(container)).toHaveTextContent('Notification frequency');
  });

  it('group label span has correct id attribute', () => {
    const { container } = render(
      <RadioGroupField id="frequency" label="Notification frequency">
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(getGroupLabel(container)).toHaveAttribute('id', 'frequency-label');
  });

  it('RadioGroup has aria-labelledby matching group label id', () => {
    const { container } = render(
      <RadioGroupField id="frequency" label="Notification frequency">
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(getRadioGroup(container)).toHaveAttribute('aria-labelledby', 'frequency-label');
  });

  it('auto-generates id when no id prop provided', () => {
    const { container } = render(defaultField);
    const group = getRadioGroup(container);
    const groupLabel = getGroupLabel(container);

    expect(group.id).toBeTruthy();
    expect(groupLabel.id).toBe(`${group.id}-label`);
    expect(group).toHaveAttribute('aria-labelledby', groupLabel.id);
  });

  it('uses provided id when id prop given', () => {
    const { container } = render(
      <RadioGroupField id="frequency" label="Notification frequency">
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(getRadioGroup(container)).toHaveAttribute('id', 'frequency');
    expect(getGroupLabel(container)).toHaveAttribute('id', 'frequency-label');
  });

  it('forwards className to the root element', () => {
    const { container } = render(
      <RadioGroupField className="custom-field" label="Notification frequency">
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(container.querySelector(`.${classNames.root}`)).toHaveClass('custom-field');
  });

  it('forwards ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <RadioGroupField ref={ref} label="Notification frequency">
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass(classNames.root);
  });

  it('renders instruction Text when instruction provided', () => {
    const { container } = render(
      <RadioGroupField
        id="frequency"
        label="Notification frequency"
        instruction="Choose how often updates are sent."
      >
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    const instruction = container.querySelector('#frequency-instruction');

    expect(instruction).toHaveTextContent('Choose how often updates are sent.');
    expect(instruction).toHaveClass(classNames.instruction);
  });

  it('does not render instruction when omitted', () => {
    const { container } = render(
      <RadioGroupField id="frequency" label="Notification frequency">
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(container.querySelector('#frequency-instruction')).not.toBeInTheDocument();
  });

  it('renders helper Text when helper provided', () => {
    const { container } = render(
      <RadioGroupField
        id="frequency"
        label="Notification frequency"
        helper="You can change this later."
      >
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    const helper = container.querySelector('#frequency-helper');

    expect(helper).toHaveTextContent('You can change this later.');
    expect(helper).toHaveClass(classNames.helper);
  });

  it('does not render helper when omitted', () => {
    const { container } = render(
      <RadioGroupField id="frequency" label="Notification frequency">
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(container.querySelector('#frequency-helper')).not.toBeInTheDocument();
  });

  it('renders children inside RadioGroup', () => {
    const { container } = render(defaultField);

    expect(getRadioGroup(container)).toContainElement(
      getRadioByLabel(container, 'frequency-daily')
    );
    expect(getRadioGroup(container)).toContainElement(
      getRadioByLabel(container, 'frequency-weekly')
    );
  });

  it('adds the no-instruction spacing class when instruction is omitted', () => {
    const { container } = render(defaultField);

    expect(getGroupLabel(container)).toHaveClass(classNames.groupLabelNoInstruction);
  });

  it('uses tighter group label spacing when instruction is present', () => {
    const { container } = render(
      <RadioGroupField
        id="frequency"
        label="Notification frequency"
        instruction="Choose how often updates are sent."
      >
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(getGroupLabel(container)).not.toHaveClass(classNames.groupLabelNoInstruction);
  });

  it('RadioGroup has aria-describedby including instruction id when present', () => {
    const { container } = render(
      <RadioGroupField
        id="frequency"
        label="Notification frequency"
        instruction="Choose how often updates are sent."
      >
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(getRadioGroup(container)).toHaveAttribute('aria-describedby', 'frequency-instruction');
  });

  it('RadioGroup has aria-describedby including helper id when present', () => {
    const { container } = render(
      <RadioGroupField
        id="frequency"
        label="Notification frequency"
        helper="You can change this later."
      >
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(getRadioGroup(container)).toHaveAttribute('aria-describedby', 'frequency-helper');
  });

  it('RadioGroup has aria-describedby listing both ids when both present', () => {
    const { container } = render(
      <RadioGroupField
        id="frequency"
        label="Notification frequency"
        instruction="Choose how often updates are sent."
        helper="You can change this later."
      >
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(getRadioGroup(container)).toHaveAttribute(
      'aria-describedby',
      'frequency-instruction frequency-helper'
    );
  });

  it('RadioGroup does not have aria-describedby when neither slot provided', () => {
    const { container } = render(defaultField);

    expect(getRadioGroup(container)).not.toHaveAttribute('aria-describedby');
  });

  it('RadioGroup has aria-required="true" when required={true}', () => {
    const { container } = render(
      <RadioGroupField label="Notification frequency" required>
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(getRadioGroup(container)).toHaveAttribute('aria-required', 'true');
  });

  it('RadioGroup has aria-invalid="true" when helperIntent="error"', () => {
    const { container } = render(
      <RadioGroupField
        label="Notification frequency"
        helper="Select a notification frequency."
        helperIntent="error"
      >
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(getRadioGroup(container)).toHaveAttribute('aria-invalid', 'true');
  });

  it('RadioGroup does not have aria-invalid when helperIntent is not "error"', () => {
    const { container } = render(
      <RadioGroupField
        label="Notification frequency"
        helper="Notification frequency is saved."
        helperIntent="success"
      >
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(getRadioGroup(container)).not.toHaveAttribute('aria-invalid');
  });

  it('group label span renders required mark when required={true}', () => {
    const { container } = render(
      <RadioGroupField label="Notification frequency" required>
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(getGroupLabel(container).querySelector(`.${classNames.requiredMark}`)).toHaveTextContent(
      '*'
    );
  });

  it('required mark has aria-hidden="true"', () => {
    const { container } = render(
      <RadioGroupField label="Notification frequency" required>
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(getGroupLabel(container).querySelector(`.${classNames.requiredMark}`)).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('group label applies .groupLabelDisabled when disabled={true}', () => {
    const { container } = render(
      <RadioGroupField label="Notification frequency" disabled>
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(getGroupLabel(container)).toHaveClass(classNames.groupLabelDisabled);
  });

  it('orientation="vertical" forwarded to RadioGroup by default', () => {
    const { container } = render(defaultField);

    expect(getRadioGroup(container)).toHaveClass(radioClassNames.vertical);
  });

  it('orientation="horizontal" forwarded to RadioGroup', () => {
    const { container } = render(
      <RadioGroupField label="Notification frequency" orientation="horizontal">
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(getRadioGroup(container)).toHaveClass(radioClassNames.horizontal);
  });

  it('value prop is forwarded', () => {
    const { container } = render(
      <RadioGroupField label="Notification frequency" value="weekly">
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
        <RadioOption id="frequency-weekly" label="Weekly" value="weekly" />
      </RadioGroupField>
    );

    expect(getRadioByLabel(container, 'frequency-weekly')).toHaveAttribute('aria-checked', 'true');
  });

  it('onValueChange fires when Radio selected', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <RadioGroupField label="Notification frequency" onValueChange={onValueChange}>
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
        <RadioOption id="frequency-weekly" label="Weekly" value="weekly" />
      </RadioGroupField>
    );

    await act(async () => {
      await user.click(getRadioByLabel(container, 'frequency-weekly'));
    });

    expect(onValueChange).toHaveBeenCalledWith('weekly');
  });

  it('disabled forwarded: all Radio children are disabled', () => {
    const { container } = render(
      <RadioGroupField label="Notification frequency" disabled>
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
        <RadioOption id="frequency-weekly" label="Weekly" value="weekly" />
      </RadioGroupField>
    );

    expect(getRadioByLabel(container, 'frequency-daily')).toBeDisabled();
    expect(getRadioByLabel(container, 'frequency-weekly')).toBeDisabled();
  });

  it('helper has danger color class when helperIntent="error"', () => {
    const { container } = render(
      <RadioGroupField
        id="frequency"
        label="Notification frequency"
        helper="Select a notification frequency."
        helperIntent="error"
      >
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(container.querySelector('#frequency-helper')).toHaveClass(textClassNames.colorDanger);
  });

  it('helper has success color class when helperIntent="success"', () => {
    const { container } = render(
      <RadioGroupField
        id="frequency"
        label="Notification frequency"
        helper="Notification frequency is saved."
        helperIntent="success"
      >
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
      </RadioGroupField>
    );

    expect(container.querySelector('#frequency-helper')).toHaveClass(textClassNames.colorSuccess);
  });

  it('keyboard: Tab focuses first Radio in group', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        {defaultField}
      </div>
    );

    await act(async () => {
      await user.tab();
      await user.tab();
    });

    expect(getRadioByLabel(container, 'frequency-daily')).toHaveFocus();
  });

  it('keyboard: ArrowDown moves to next Radio', async () => {
    const user = userEvent.setup();
    const { container } = render(defaultField);

    act(() => {
      getRadioByLabel(container, 'frequency-daily').focus();
    });
    await act(async () => {
      await user.keyboard('{ArrowDown}');
    });

    expect(getRadioByLabel(container, 'frequency-weekly')).toHaveFocus();
  });

  it('keyboard: ArrowUp moves to previous Radio', async () => {
    const user = userEvent.setup();
    const { container } = render(defaultField);

    act(() => {
      getRadioByLabel(container, 'frequency-weekly').focus();
    });
    await act(async () => {
      await user.keyboard('{ArrowUp}');
    });

    expect(getRadioByLabel(container, 'frequency-daily')).toHaveFocus();
  });

  it('keyboard: disabled group has no focusable Radio', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <RadioGroupField label="Notification frequency" disabled>
          <RadioOption id="frequency-daily" label="Daily" value="daily" />
          <RadioOption id="frequency-weekly" label="Weekly" value="weekly" />
        </RadioGroupField>
        <button type="button">after</button>
      </div>
    );

    await user.tab();
    await user.tab();

    expect(getRadioByLabel(container, 'frequency-daily')).not.toHaveFocus();
    expect(getRadioByLabel(container, 'frequency-weekly')).not.toHaveFocus();
    expect(container.querySelector('button:not([role="radio"])')).toHaveFocus();
  });

  it('axe passes for default vertical render', async () => {
    const { container } = render(defaultField);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes for horizontal orientation', async () => {
    const { container } = render(
      <RadioGroupField label="Notification frequency" orientation="horizontal">
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
        <RadioOption id="frequency-weekly" label="Weekly" value="weekly" />
      </RadioGroupField>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes with instruction and helper', async () => {
    const { container } = render(
      <RadioGroupField
        label="Notification frequency"
        instruction="Choose how often updates are sent."
        helper="You can change this later."
      >
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
        <RadioOption id="frequency-weekly" label="Weekly" value="weekly" />
      </RadioGroupField>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when required={true}', async () => {
    const { container } = render(
      <RadioGroupField label="Notification frequency" required>
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
        <RadioOption id="frequency-weekly" label="Weekly" value="weekly" />
      </RadioGroupField>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when disabled={true}', async () => {
    const { container } = render(
      <RadioGroupField label="Notification frequency" disabled>
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
        <RadioOption id="frequency-weekly" label="Weekly" value="weekly" />
      </RadioGroupField>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when helperIntent="error"', async () => {
    const { container } = render(
      <RadioGroupField
        label="Notification frequency"
        helper="Select a notification frequency."
        helperIntent="error"
      >
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
        <RadioOption id="frequency-weekly" label="Weekly" value="weekly" />
      </RadioGroupField>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes with one option selected', async () => {
    const { container } = render(
      <RadioGroupField label="Notification frequency" value="weekly">
        <RadioOption id="frequency-daily" label="Daily" value="daily" />
        <RadioOption id="frequency-weekly" label="Weekly" value="weekly" />
      </RadioGroupField>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when children include Radio + Label pairs with htmlFor/id', async () => {
    const { container } = render(defaultField);

    expect(container.querySelector('label')).toHaveAttribute('for', 'frequency-daily');

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses Text for helper and instruction styling and keeps story-only selectors out', () => {
    const stylesheet = readFileSync(
      'src/components/RadioGroupField/RadioGroupField.module.scss',
      'utf8'
    );

    expect(stylesheet).toContain("@use '../../styles/mixins' as *;");
    expect(stylesheet).toContain("@use '../../styles/breakpoints' as *;");
    expect(stylesheet).toContain('font-family: var(--dds-font-sans);');
    expect(stylesheet).toContain('font-size: var(--dds-font-size-sm);');
    expect(stylesheet).toContain('font-weight: var(--dds-font-weight-medium);');
    expect(stylesheet).toContain('color: var(--dds-color-text-default);');
    expect(stylesheet).toContain('color: var(--dds-color-status-danger);');
    expect(stylesheet).toContain('margin-bottom: var(--dds-space-0-5);');
    expect(stylesheet).toContain('margin-bottom: var(--dds-space-1-5);');
    expect(stylesheet).toContain('margin-top: var(--dds-space-2);');
    expect(stylesheet).not.toContain('.story');
  });
});

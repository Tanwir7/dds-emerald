import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Field } from './Field';
import styles from './Field.module.scss';
import { Input } from '../Input';
import labelStyles from '../Label/Label.module.scss';
import textStyles from '../Text/Text.module.scss';
import { Textarea } from '../Textarea';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  stack: getRequiredClassName(styles, 'stack'),
  inline: getRequiredClassName(styles, 'inline'),
  noInstruction: getRequiredClassName(styles, 'noInstruction'),
  control: getRequiredClassName(styles, 'control'),
  labelCol: getRequiredClassName(styles, 'labelCol'),
  controlCol: getRequiredClassName(styles, 'controlCol'),
  inputRow: getRequiredClassName(styles, 'inputRow'),
  instruction: getRequiredClassName(styles, 'instruction'),
  helper: getRequiredClassName(styles, 'helper'),
} as const;

const labelClassNames = {
  disabled: getRequiredClassName(labelStyles, 'disabled'),
} as const;

const textClassNames = {
  colorMuted: getRequiredClassName(textStyles, 'colorMuted'),
  colorDanger: getRequiredClassName(textStyles, 'colorDanger'),
  colorSuccess: getRequiredClassName(textStyles, 'colorSuccess'),
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

const getRoot = (container: HTMLElement = document.body) => {
  const root = container.querySelector(`.${classNames.root}`);

  expect(root).toBeInstanceOf(HTMLDivElement);
  return root as HTMLDivElement;
};

const getInput = (container: HTMLElement = document.body) => {
  const input = container.querySelector('input');

  expect(input).toBeInstanceOf(HTMLInputElement);
  return input as HTMLInputElement;
};

const getTextarea = (container: HTMLElement = document.body) => {
  const textarea = container.querySelector('textarea');

  expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
  return textarea as HTMLTextAreaElement;
};

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('Field', () => {
  it('renders a label element with correct text', () => {
    render(
      <Field label="Email address">
        <Input />
      </Field>
    );

    expect(document.querySelector('label')).toHaveTextContent('Email address');
  });

  it('renders the child control', () => {
    const { container } = render(
      <Field label="Email address">
        <Input />
      </Field>
    );

    expect(getInput(container)).toBeInTheDocument();
  });

  it("label htmlFor matches the control's id", () => {
    const { container } = render(
      <Field label="Email address" id="email">
        <Input />
      </Field>
    );

    expect(container.querySelector('label')).toHaveAttribute('for', 'email');
    expect(getInput(container)).toHaveAttribute('id', 'email');
  });

  it('auto-generates id via useId when no id prop provided', () => {
    const { container } = render(
      <Field label="Email address">
        <Input />
      </Field>
    );

    expect(getInput(container).id).toBeTruthy();
    expect(container.querySelector('label')).toHaveAttribute('for', getInput(container).id);
  });

  it('uses provided id when id prop given', () => {
    const { container } = render(
      <Field label="Email address" id="email">
        <Input />
      </Field>
    );

    expect(getInput(container)).toHaveAttribute('id', 'email');
  });

  it('renders instruction text when instruction prop provided', () => {
    const { container } = render(
      <Field label="Email address" instruction="Use your work email.">
        <Input />
      </Field>
    );

    expect(container.querySelector(`.${classNames.instruction}`)).toHaveTextContent(
      'Use your work email.'
    );
  });

  it('does not render instruction element when instruction is omitted', () => {
    const { container } = render(
      <Field label="Email address">
        <Input />
      </Field>
    );

    expect(container.querySelector(`.${classNames.instruction}`)).not.toBeInTheDocument();
  });

  it('renders helper text when helper prop provided', () => {
    const { container } = render(
      <Field label="Email address" helper="We will only use this for updates.">
        <Input />
      </Field>
    );

    expect(container.querySelector(`.${classNames.helper}`)).toHaveTextContent(
      'We will only use this for updates.'
    );
  });

  it('does not render helper element when helper is omitted', () => {
    const { container } = render(
      <Field label="Email address">
        <Input />
      </Field>
    );

    expect(container.querySelector(`.${classNames.helper}`)).not.toBeInTheDocument();
  });

  it('renders inline instruction beside the control in the input row', () => {
    const { container } = render(
      <Field label="Email address" layout="inline" instruction="Use your work email.">
        <Input />
      </Field>
    );
    const inputRow = container.querySelector(`.${classNames.inputRow}`);
    const instruction = container.querySelector(`.${classNames.instruction}`);

    expect(inputRow).toBeInstanceOf(HTMLElement);
    expect(instruction).toHaveTextContent('Use your work email.');
    expect(inputRow as HTMLElement).toContainElement(instruction as HTMLElement);
  });

  it('renders stack instruction before the control', () => {
    const { container } = render(
      <Field label="Email address" instruction="Use your work email.">
        <Input />
      </Field>
    );
    const instruction = container.querySelector(`.${classNames.instruction}`);
    const control = container.querySelector(`.${classNames.control}`);

    expect(instruction).toHaveTextContent('Use your work email.');
    expect(instruction?.nextElementSibling).toBe(control);
  });

  it('control has aria-describedby pointing to instruction id when instruction present', () => {
    const { container } = render(
      <Field label="Email address" id="email" instruction="Use your work email.">
        <Input />
      </Field>
    );

    expect(getInput(container)).toHaveAttribute('aria-describedby', 'email-instruction');
  });

  it('control has aria-describedby pointing to helper id when helper present', () => {
    const { container } = render(
      <Field label="Email address" id="email" helper="Enter a valid email.">
        <Input />
      </Field>
    );

    expect(getInput(container)).toHaveAttribute('aria-describedby', 'email-helper');
  });

  it('control has aria-describedby listing both ids when both present', () => {
    const { container } = render(
      <Field
        label="Email address"
        id="email"
        instruction="Use your work email."
        helper="Enter a valid email."
      >
        <Input />
      </Field>
    );

    expect(getInput(container)).toHaveAttribute(
      'aria-describedby',
      'email-instruction email-helper'
    );
  });

  it('appends generated descriptions to consumer aria-describedby', () => {
    const { container } = render(
      <Field label="Email address" id="email" helper="Enter a valid email.">
        <Input aria-describedby="external-help" />
      </Field>
    );

    expect(getInput(container)).toHaveAttribute('aria-describedby', 'external-help email-helper');
  });

  it('control does not have aria-describedby when neither instruction nor helper present', () => {
    const { container } = render(
      <Field label="Email address">
        <Input />
      </Field>
    );

    expect(getInput(container)).not.toHaveAttribute('aria-describedby');
  });

  it('control has aria-required="true" when required={true}', () => {
    const { container } = render(
      <Field label="Email address" required>
        <Input />
      </Field>
    );

    expect(getInput(container)).toHaveAttribute('aria-required', 'true');
  });

  it('control does not have aria-required when required={false}', () => {
    const { container } = render(
      <Field label="Email address" required={false}>
        <Input />
      </Field>
    );

    expect(getInput(container)).not.toHaveAttribute('aria-required');
  });

  it('control has aria-invalid="true" when helperIntent="error"', () => {
    const { container } = render(
      <Field label="Email address" helper="Enter a valid email." helperIntent="error">
        <Input />
      </Field>
    );

    expect(getInput(container)).toHaveAttribute('aria-invalid', 'true');
  });

  it('control does not have aria-invalid when helperIntent is not "error"', () => {
    const { container } = render(
      <Field label="Email address" helper="Email is available." helperIntent="success">
        <Input />
      </Field>
    );

    expect(getInput(container)).not.toHaveAttribute('aria-invalid');
  });

  it('control has disabled attribute when disabled={true}', () => {
    const { container } = render(
      <Field label="Email address" disabled>
        <Input />
      </Field>
    );

    expect(getInput(container)).toBeDisabled();
  });

  it('Label renders required indicator when required={true}', () => {
    render(
      <Field label="Email address" required>
        <Input />
      </Field>
    );

    expect(document.querySelector('label span')).toHaveTextContent('*');
  });

  it('Label has disabled appearance when disabled={true}', () => {
    render(
      <Field label="Email address" disabled>
        <Input />
      </Field>
    );

    expect(document.querySelector('label')).toHaveClass(labelClassNames.disabled);
  });

  it('helper text has danger color when helperIntent="error"', () => {
    const { container } = render(
      <Field label="Email address" helper="Enter a valid email." helperIntent="error">
        <Input />
      </Field>
    );

    expect(container.querySelector(`.${classNames.helper}`)).toHaveClass(
      textClassNames.colorDanger
    );
  });

  it('helper text has success color when helperIntent="success"', () => {
    const { container } = render(
      <Field label="Email address" helper="Email is available." helperIntent="success">
        <Input />
      </Field>
    );

    expect(container.querySelector(`.${classNames.helper}`)).toHaveClass(
      textClassNames.colorSuccess
    );
  });

  it('helper text has muted color when helperIntent omitted', () => {
    const { container } = render(
      <Field label="Email address" helper="We will only use this for updates.">
        <Input />
      </Field>
    );

    expect(container.querySelector(`.${classNames.helper}`)).toHaveClass(textClassNames.colorMuted);
  });

  it('root has .stack class by default', () => {
    const { container } = render(
      <Field label="Email address">
        <Input />
      </Field>
    );

    expect(getRoot(container)).toHaveClass(classNames.stack);
  });

  it('root has .inline class when layout="inline"', () => {
    const { container } = render(
      <Field label="Email address" layout="inline">
        <Input />
      </Field>
    );

    expect(getRoot(container)).toHaveClass(classNames.inline);
  });

  it('inline layout does not set --field-label-width CSS custom property by default', () => {
    const { container } = render(
      <Field label="Email address" layout="inline">
        <Input />
      </Field>
    );

    expect(getRoot(container).style.getPropertyValue('--field-label-width')).toBe('');
  });

  it('inline layout sets --field-label-width to provided inlineLabelWidth value', () => {
    const { container } = render(
      <Field label="Email address" layout="inline" inlineLabelWidth="200px">
        <Input />
      </Field>
    );

    expect(getRoot(container).style.getPropertyValue('--field-label-width')).toBe('200px');
  });

  it('forwards className to root div', () => {
    const { container } = render(
      <Field label="Email address" className="custom-field">
        <Input />
      </Field>
    );

    expect(getRoot(container)).toHaveClass('custom-field');
  });

  it('forwards ref to root div', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <Field ref={ref} label="Email address">
        <Input />
      </Field>
    );

    expect(ref.current).toBe(getRoot(container));
  });

  it('inline layout root contains expected grid class', () => {
    const { container } = render(
      <Field label="Email address" layout="inline">
        <Input />
      </Field>
    );

    expect(getRoot(container)).toHaveClass(classNames.inline);
    expect(container.querySelector(`.${classNames.labelCol}`)).toBeInTheDocument();
    expect(container.querySelector(`.${classNames.controlCol}`)).toBeInTheDocument();
    expect(container.querySelector(`.${classNames.inputRow}`)).toBeInTheDocument();
  });

  it('adds .noInstruction class when instruction is omitted', () => {
    const { container } = render(
      <Field label="Email address">
        <Input />
      </Field>
    );

    expect(getRoot(container)).toHaveClass(classNames.noInstruction);
  });

  it('does not add .noInstruction class when instruction is provided', () => {
    const { container } = render(
      <Field label="Email address" instruction="Use your work email.">
        <Input />
      </Field>
    );

    expect(getRoot(container)).not.toHaveClass(classNames.noInstruction);
  });

  it('keyboard: Tab focuses the child control', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <Field label="Email address">
          <Input />
        </Field>
      </div>
    );

    await user.tab();
    await user.tab();

    expect(getInput(container)).toHaveFocus();
  });

  it('keyboard: child control is not focusable when disabled', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <Field label="Email address" disabled>
          <Input />
        </Field>
        <button type="button">after</button>
      </div>
    );

    await user.tab();
    await user.tab();

    expect(getInput(container)).not.toHaveFocus();
    expect(container.querySelector('button')).toHaveFocus();
  });

  it('warns in development and renders nothing when more than one child is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(
      <Field label="Email address">
        <Input />
        <Input />
      </Field>
    );

    expect(warn).toHaveBeenCalledWith('Field expects exactly one child control.');
    expect(container).toBeEmptyDOMElement();
  });

  it('axe: passes for stack layout with Input child', async () => {
    const { container } = render(
      <Field label="Email address">
        <Input />
      </Field>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe: passes for stack layout with Textarea child', async () => {
    const { container } = render(
      <Field label="Bio">
        <Textarea />
      </Field>
    );

    expect(getTextarea(container)).toBeInTheDocument();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe: passes for inline layout with Input child', async () => {
    const { container } = render(
      <Field label="Email address" layout="inline">
        <Input />
      </Field>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe: passes for stack layout with instruction and helper', async () => {
    const { container } = render(
      <Field
        label="Email address"
        instruction="Use your work email."
        helper="We will only use this for updates."
      >
        <Input />
      </Field>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe: passes for stack layout with helperIntent="error"', async () => {
    const { container } = render(
      <Field label="Email address" helper="Enter a valid email." helperIntent="error">
        <Input defaultValue="ada" />
      </Field>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe: passes for stack layout with required={true}', async () => {
    const { container } = render(
      <Field label="Email address" required>
        <Input />
      </Field>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe: passes for stack layout with disabled={true}', async () => {
    const { container } = render(
      <Field label="Email address" disabled>
        <Input />
      </Field>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe: passes for inline layout with instruction', async () => {
    const { container } = render(
      <Field label="Email address" layout="inline" instruction="Use your work email.">
        <Input />
      </Field>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses required layout tokens and shared breakpoint mixin', () => {
    const stylesheet = readFileSync('src/components/Field/Field.module.scss', 'utf8');

    expect(stylesheet).toContain('@use');
    expect(stylesheet).toContain(
      'grid-template-columns: var(--field-label-width, max-content) minmax(0, 1fr);'
    );
    expect(stylesheet).toContain('column-gap: var(--dds-space-3);');
    expect(stylesheet).toContain('@include breakpoint-below(sm)');
    expect(stylesheet).not.toContain('.storyA11yScope');
  });
});

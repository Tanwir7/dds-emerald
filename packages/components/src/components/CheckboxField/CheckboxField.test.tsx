import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CheckboxField } from './CheckboxField';
import styles from './CheckboxField.module.scss';
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

const getCheckbox = (container: HTMLElement = document.body) => {
  const checkbox = container.querySelector('[role="checkbox"]');

  expect(checkbox).toBeInstanceOf(HTMLButtonElement);
  return checkbox as HTMLButtonElement;
};

const getLabel = (container: HTMLElement = document.body) => {
  const label = container.querySelector('label');

  expect(label).toBeInstanceOf(HTMLLabelElement);
  return label as HTMLLabelElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('CheckboxField', () => {
  it('renders a checkbox with role="checkbox"', () => {
    const { container } = render(<CheckboxField label="Accept terms" />);

    expect(getCheckbox(container)).toHaveAttribute('role', 'checkbox');
  });

  it('renders a label element with correct text', () => {
    const { container } = render(<CheckboxField label="Accept terms" />);

    expect(getLabel(container)).toHaveTextContent('Accept terms');
  });

  it('label htmlFor matches checkbox id', () => {
    const { container } = render(<CheckboxField id="terms" label="Accept terms" />);

    expect(getLabel(container)).toHaveAttribute('for', 'terms');
    expect(getCheckbox(container)).toHaveAttribute('id', 'terms');
  });

  it('auto-generates id when no id prop provided', () => {
    const { container } = render(<CheckboxField label="Accept terms" />);
    const checkbox = getCheckbox(container);

    expect(checkbox.id).toBeTruthy();
    expect(getLabel(container)).toHaveAttribute('for', checkbox.id);
  });

  it('uses provided id when id prop given', () => {
    const { container } = render(<CheckboxField id="terms" label="Accept terms" />);

    expect(getCheckbox(container)).toHaveAttribute('id', 'terms');
  });

  it('forwards className to the root element', () => {
    const { container } = render(<CheckboxField className="custom-field" label="Accept terms" />);

    expect(container.querySelector(`.${classNames.root}`)).toHaveClass('custom-field');
  });

  it('forwards ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<CheckboxField ref={ref} label="Accept terms" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass(classNames.root);
  });

  it('renders helper text below the row when helper provided', () => {
    const { container } = render(
      <CheckboxField id="terms" label="Accept terms" helper="You can update this later." />
    );

    const helper = container.querySelector(`#terms-helper`);

    expect(helper).toHaveTextContent('You can update this later.');
    expect(helper).toHaveClass(classNames.helper);
    expect(helper?.previousElementSibling).toHaveClass(classNames.row);
  });

  it('does not render helper element when omitted', () => {
    const { container } = render(<CheckboxField id="terms" label="Accept terms" />);

    expect(container.querySelector('#terms-helper')).not.toBeInTheDocument();
  });

  it('Checkbox precedes Label in DOM', () => {
    const { container } = render(<CheckboxField label="Accept terms" />);
    const row = container.querySelector(`.${classNames.row}`);

    expect(row?.children[0]).toBe(getCheckbox(container));
    expect(row?.children[1]).toBe(getLabel(container));
  });

  it('checkbox has aria-describedby pointing to helper id when present', () => {
    const { container } = render(
      <CheckboxField id="terms" label="Accept terms" helper="You can update this later." />
    );

    expect(getCheckbox(container)).toHaveAttribute('aria-describedby', 'terms-helper');
  });

  it('checkbox does not have aria-describedby when neither present', () => {
    const { container } = render(<CheckboxField id="terms" label="Accept terms" />);

    expect(getCheckbox(container)).not.toHaveAttribute('aria-describedby');
  });

  it('checkbox has aria-required="true" when required={true}', () => {
    const { container } = render(<CheckboxField label="Accept terms" required />);

    expect(getCheckbox(container)).toHaveAttribute('aria-required', 'true');
  });

  it('checkbox has aria-invalid="true" when helperIntent="error"', () => {
    const { container } = render(
      <CheckboxField label="Accept terms" helper="Accept the terms." helperIntent="error" />
    );

    expect(getCheckbox(container)).toHaveAttribute('aria-invalid', 'true');
  });

  it('checkbox has aria-invalid="true" when invalid={true}', () => {
    const { container } = render(<CheckboxField label="Accept terms" invalid />);

    expect(getCheckbox(container)).toHaveAttribute('aria-invalid', 'true');
  });

  it('checkbox has aria-invalid="true" when both invalid and helperIntent="error"', () => {
    const { container } = render(
      <CheckboxField label="Accept terms" invalid helper="Accept the terms." helperIntent="error" />
    );

    expect(getCheckbox(container)).toHaveAttribute('aria-invalid', 'true');
  });

  it('Label shows required indicator when required={true}', () => {
    const { container } = render(<CheckboxField label="Accept terms" required />);

    expect(getLabel(container).querySelector('[aria-hidden="true"]')).toHaveTextContent('*');
  });

  it('Label is disabled when disabled={true}', () => {
    const { container } = render(<CheckboxField label="Accept terms" disabled />);

    expect(getLabel(container).className).toContain('disabled');
  });

  it('size="sm" is forwarded to Checkbox', () => {
    const { container } = render(<CheckboxField label="Accept terms" size="sm" />);

    expect(getCheckbox(container).className).toContain('sm');
  });

  it('checked prop is forwarded', () => {
    const { container } = render(<CheckboxField label="Accept terms" checked />);

    expect(getCheckbox(container)).toHaveAttribute('aria-checked', 'true');
  });

  it('onCheckedChange fires when checkbox clicked', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <CheckboxField label="Accept terms" onCheckedChange={onCheckedChange} />
    );

    await act(async () => {
      await user.click(getCheckbox(container));
    });

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('disabled forwarded: checkbox is not clickable when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <CheckboxField label="Accept terms" disabled onCheckedChange={onCheckedChange} />
    );

    await act(async () => {
      await user.click(getCheckbox(container));
    });

    expect(getCheckbox(container)).toBeDisabled();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('helper has correct padding-left class for size="md" by default', () => {
    const { container } = render(<CheckboxField id="terms" label="Accept terms" helper="Help." />);

    expect(container.querySelector('#terms-helper')).toHaveClass(classNames.helperMd);
  });

  it('helper has correct padding-left class for size="sm"', () => {
    const { container } = render(
      <CheckboxField id="terms" label="Accept terms" helper="Help." size="sm" />
    );

    expect(container.querySelector('#terms-helper')).toHaveClass(classNames.helperSm);
  });

  it('keyboard: Tab focuses the checkbox', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <CheckboxField label="Accept terms" />
      </div>
    );

    await user.tab();
    await user.tab();

    expect(getCheckbox(container)).toHaveFocus();
  });

  it('keyboard: Space toggles the checkbox', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <CheckboxField label="Accept terms" onCheckedChange={onCheckedChange} />
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

  it('keyboard: disabled checkbox is not focusable', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <CheckboxField label="Accept terms" disabled />
        <button type="button">after</button>
      </div>
    );

    await user.tab();
    await user.tab();

    expect(getCheckbox(container)).not.toHaveFocus();
    expect(container.querySelector('button:not([role="checkbox"])')).toHaveFocus();
  });

  it('axe passes for default render', async () => {
    const { container } = render(<CheckboxField label="Accept terms" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes with helper', async () => {
    const { container } = render(
      <CheckboxField label="Accept terms" helper="You can update this later." />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when required={true}', async () => {
    const { container } = render(<CheckboxField label="Accept terms" required />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when disabled={true}', async () => {
    const { container } = render(<CheckboxField label="Accept terms" disabled />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when helperIntent="error"', async () => {
    const { container } = render(
      <CheckboxField label="Accept terms" helper="Accept the terms." helperIntent="error" />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when checked="indeterminate"', async () => {
    const { container } = render(
      <CheckboxField label="Select all permissions" checked="indeterminate" />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses Text for helper styling and keeps story-only selectors out', () => {
    const stylesheet = readFileSync(
      'src/components/CheckboxField/CheckboxField.module.scss',
      'utf8'
    );

    expect(stylesheet).toContain('@use');
    expect(stylesheet).toContain('gap: var(--dds-space-2);');
    expect(stylesheet).toContain('padding-left: calc(var(--dds-space-5) + var(--dds-space-2));');
    expect(stylesheet).toContain('padding-left: calc(var(--dds-space-4) + var(--dds-space-2));');
    expect(stylesheet).not.toContain('.story');
  });
});

import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PasswordInput } from './PasswordInput';

expect.extend(toHaveNoViolations);

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

const getInput = (container: HTMLElement = document.body) => {
  const input = container.querySelector('input');

  expect(input).toBeInstanceOf(HTMLInputElement);
  return input as HTMLInputElement;
};

const getToggleButton = (container: HTMLElement = document.body) => {
  const button = container.querySelector('button');

  expect(button).toBeInstanceOf(HTMLButtonElement);
  return button as HTMLButtonElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('PasswordInput', () => {
  it('renders an input element', () => {
    const { container } = render(<PasswordInput aria-label="Password" />);

    expect(getInput(container)).toBeInTheDocument();
  });

  it('input type is "password" by default', () => {
    const { container } = render(<PasswordInput aria-label="Password" />);

    expect(getInput(container)).toHaveAttribute('type', 'password');
  });

  it('renders a toggle button with role="button"', () => {
    const { container } = render(<PasswordInput aria-label="Password" />);

    expect(getToggleButton(container)).toHaveAttribute('type', 'button');
  });

  it('toggle button has aria-label="Show password" by default', () => {
    const { container } = render(<PasswordInput aria-label="Password" />);

    expect(getToggleButton(container)).toHaveAccessibleName('Show password');
  });

  it('forwards ref to HTMLInputElement', () => {
    const ref = React.createRef<HTMLInputElement>();
    const { container } = render(<PasswordInput ref={ref} aria-label="Password" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toBe(getInput(container));
  });

  it('forwards className to the root input element', () => {
    const { container } = render(
      <PasswordInput className="custom-password" aria-label="Password" />
    );

    expect(getInput(container)).toHaveClass('custom-password');
  });

  it('clicking toggle changes input type from "password" to "text"', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput aria-label="Password" />);

    await user.click(getToggleButton(container));

    expect(getInput(container)).toHaveAttribute('type', 'text');
  });

  it('clicking toggle again changes input type back to "password"', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput aria-label="Password" />);
    const toggle = getToggleButton(container);

    await user.click(toggle);
    await user.click(toggle);

    expect(getInput(container)).toHaveAttribute('type', 'password');
  });

  it('toggle button aria-label changes to "Hide password" when visible', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput aria-label="Password" />);

    await user.click(getToggleButton(container));

    expect(getToggleButton(container)).toHaveAccessibleName('Hide password');
  });

  it('toggle button aria-label changes back to "Show password" when hidden again', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput aria-label="Password" />);
    const toggle = getToggleButton(container);

    await user.click(toggle);
    await user.click(toggle);

    expect(getToggleButton(container)).toHaveAccessibleName('Show password');
  });

  it('forwards size="sm" to Input', () => {
    const { container } = render(<PasswordInput size="sm" aria-label="Password" />);

    expect(getInput(container).className).toMatch(/sm/);
  });

  it('forwards size="lg" to Input', () => {
    const { container } = render(<PasswordInput size="lg" aria-label="Password" />);

    expect(getInput(container).className).toMatch(/lg/);
  });

  it('forwards invalid={true} to Input', () => {
    const { container } = render(<PasswordInput invalid aria-label="Password" />);

    expect(getInput(container).className).toMatch(/invalid/);
  });

  it('forwards disabled to Input', () => {
    const { container } = render(<PasswordInput disabled aria-label="Password" />);

    expect(getInput(container)).toBeDisabled();
  });

  it('forwards readOnly to Input', () => {
    const { container } = render(<PasswordInput readOnly aria-label="Password" />);

    expect(getInput(container)).toHaveAttribute('readonly');
  });

  it('forwards placeholder to Input', () => {
    const { container } = render(
      <PasswordInput placeholder="Enter password" aria-label="Password" />
    );

    expect(getInput(container)).toHaveAttribute('placeholder', 'Enter password');
  });

  it('forwards value and onChange to Input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const ControlledPasswordInput = () => {
      const [value, setValue] = React.useState('');

      return (
        <PasswordInput
          aria-label="Password"
          value={value}
          onChange={(event) => {
            setValue(event.currentTarget.value);
            onChange(event.currentTarget.value);
          }}
        />
      );
    };
    const { container } = render(<ControlledPasswordInput />);

    await user.type(getInput(container), 'emerald');

    expect(getInput(container)).toHaveValue('emerald');
    expect(onChange).toHaveBeenLastCalledWith('emerald');
  });

  it('forwards name to Input', () => {
    const { container } = render(<PasswordInput name="password" aria-label="Password" />);

    expect(getInput(container)).toHaveAttribute('name', 'password');
  });

  it('forwards id to Input', () => {
    const { container } = render(<PasswordInput id="account-password" aria-label="Password" />);

    expect(getInput(container)).toHaveAttribute('id', 'account-password');
  });

  it('forwards aria-describedby to Input', () => {
    const { container } = render(
      <PasswordInput aria-label="Password" aria-describedby="password-helper" />
    );

    expect(getInput(container)).toHaveAttribute('aria-describedby', 'password-helper');
  });

  it('does not expose type prop and ignores JS consumers trying to override it', () => {
    const { container } = render(
      // @ts-expect-error PasswordInput manages type internally.
      <PasswordInput type="email" aria-label="Password" />
    );

    expect(getInput(container)).toHaveAttribute('type', 'password');
  });

  it('does not render label text when showToggleLabel={false}', () => {
    const { container } = render(<PasswordInput aria-label="Password" />);

    expect(getToggleButton(container)).not.toHaveTextContent('Show');
    expect(getToggleButton(container)).not.toHaveTextContent('Hide');
  });

  it('renders "Show" text beside icon when showToggleLabel={true} and hidden', () => {
    const { container } = render(<PasswordInput showToggleLabel aria-label="Password" />);

    expect(getToggleButton(container)).toHaveTextContent('Show');
  });

  it('renders "Hide" text beside icon when showToggleLabel={true} and visible', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput showToggleLabel aria-label="Password" />);

    await user.click(getToggleButton(container));

    expect(getToggleButton(container)).toHaveTextContent('Hide');
  });

  it('toggle button is reachable by Tab', async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Password" />);

    await user.tab();
    expect(document.activeElement).toBe(getInput());

    await user.tab();
    expect(document.activeElement).toBe(getToggleButton());
  });

  it('Space activates the toggle button', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput aria-label="Password" />);

    await user.tab();
    await user.tab();
    await user.keyboard(' ');

    expect(getInput(container)).toHaveAttribute('type', 'text');
  });

  it('Enter activates the toggle button', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput aria-label="Password" />);

    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');

    expect(getInput(container)).toHaveAttribute('type', 'text');
  });

  it('input is not reachable when disabled', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput disabled aria-label="Password" />);

    await user.tab();

    expect(document.activeElement).not.toBe(getInput(container));
    expect(document.activeElement).toBe(getToggleButton(container));
  });

  it('keeps the toggle functional when disabled', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PasswordInput disabled defaultValue="secret" aria-label="Password" />
    );

    await user.click(getToggleButton(container));

    expect(getInput(container)).toHaveAttribute('type', 'text');
  });

  it('keeps the toggle functional when readOnly', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PasswordInput readOnly defaultValue="secret" aria-label="Password" />
    );

    await user.click(getToggleButton(container));

    expect(getInput(container)).toHaveAttribute('type', 'text');
  });

  it('axe a11y passes for default render', async () => {
    const { container } = render(<PasswordInput aria-label="Password" />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe a11y passes when password is visible', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput aria-label="Password" />);

    await user.click(getToggleButton(container));

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe a11y passes when disabled', async () => {
    const { container } = render(<PasswordInput disabled aria-label="Password" />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe a11y passes when invalid={true}', async () => {
    const { container } = render(
      <PasswordInput invalid aria-label="Password" aria-invalid="true" />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe a11y passes with aria-label on input', async () => {
    const { container } = render(<PasswordInput aria-label="Account password" />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe a11y passes with showToggleLabel={true}', async () => {
    const { container } = render(<PasswordInput showToggleLabel aria-label="Password" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});

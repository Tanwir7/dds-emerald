import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PasswordInput } from './PasswordInput';
import styles from './PasswordInput.module.scss';

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

const getStrengthBars = (container: HTMLElement = document.body) =>
  Array.from(container.querySelectorAll('[data-password-strength-bar="true"]'));

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

  it('does not render strength UI by default', () => {
    const { container } = render(<PasswordInput aria-label="Password" defaultValue="Password1!" />);

    expect(container).not.toHaveTextContent('Password strength:');
    expect(getStrengthBars(container)).toHaveLength(0);
  });

  it('keeps strength UI hidden when enabled and value is empty', () => {
    const { container } = render(<PasswordInput aria-label="Password" showPasswordStrength />);

    expect(container).not.toHaveTextContent('Password strength:');
    expect(getInput(container)).not.toHaveAttribute('aria-describedby');
  });

  it('shows strength UI after typing when enabled', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput aria-label="Password" showPasswordStrength />);

    await act(async () => {
      await user.type(getInput(container), 'a');
    });

    expect(container).toHaveTextContent('Password strength: Weak');
    expect(getStrengthBars(container)).toHaveLength(4);
  });

  it('renders correct strength labels for each score bucket', () => {
    const cases = [
      { value: 'abcdefgh', label: 'Weak' },
      { value: 'Abcdefgh', label: 'Fair' },
      { value: 'Abcdefgh1', label: 'Good' },
      { value: 'Abcdefgh1!', label: 'Strong' },
    ] as const;

    for (const testCase of cases) {
      const { container, unmount } = render(
        <PasswordInput aria-label="Password" defaultValue={testCase.value} showPasswordStrength />
      );

      expect(container).toHaveTextContent(`Password strength: ${testCase.label}`);
      unmount();
    }
  });

  it('activates the expected number of strength bars and tone classes', () => {
    const cases = [
      { value: 'abcdefgh', activeCount: 1, activeClass: styles.strengthBarActiveDanger },
      { value: 'Abcdefgh', activeCount: 2, activeClass: styles.strengthBarActiveWarning },
      { value: 'Abcdefgh1', activeCount: 3, activeClass: styles.strengthBarActiveInfo },
      { value: 'Abcdefgh1!', activeCount: 4, activeClass: styles.strengthBarActiveSuccess },
    ] as const;

    for (const testCase of cases) {
      const { container, unmount } = render(
        <PasswordInput aria-label="Password" defaultValue={testCase.value} showPasswordStrength />
      );
      const bars = getStrengthBars(container);
      const activeBars = bars.filter((bar) => bar.getAttribute('data-active') === 'true');
      const activeClassName = testCase.activeClass ?? '';

      expect(activeBars).toHaveLength(testCase.activeCount);
      expect(activeBars.every((bar) => bar.classList.contains(activeClassName))).toBe(true);
      unmount();
    }
  });

  it('merges the generated strength description id with consumer aria-describedby ids', () => {
    const { container } = render(
      <PasswordInput
        aria-describedby="password-helper password-error"
        aria-label="Password"
        defaultValue="Abcdefgh1!"
        showPasswordStrength
      />
    );
    const describedBy = getInput(container).getAttribute('aria-describedby');

    expect(describedBy).toContain('password-helper');
    expect(describedBy).toContain('password-error');
    expect(describedBy).toMatch(/\S+/);

    const ids = describedBy?.split(/\s+/) ?? [];
    const generatedId = ids.find((id) => id !== 'password-helper' && id !== 'password-error');

    expect(generatedId).toBeTruthy();
    expect(container.querySelector(`#${generatedId ?? ''}`)).toHaveTextContent(
      'Password strength: Strong'
    );
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

  it('axe a11y passes with strength enabled', async () => {
    const { container } = render(
      <PasswordInput
        aria-describedby="password-helper"
        aria-label="Password"
        defaultValue="Abcdefgh1!"
        showPasswordStrength
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe a11y passes with strength enabled after toggling visibility', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PasswordInput aria-label="Password" defaultValue="Abcdefgh1!" showPasswordStrength />
    );

    await user.click(getToggleButton(container));

    expect(await axe(container)).toHaveNoViolations();
  });
});

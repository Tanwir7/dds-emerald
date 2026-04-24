import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Search, X } from 'lucide-react';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Input } from './Input';
import styles from './Input.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  wrapper: getRequiredClassName(styles, 'wrapper'),
  root: getRequiredClassName(styles, 'root'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
  invalid: getRequiredClassName(styles, 'invalid'),
  hasStartIcon: getRequiredClassName(styles, 'hasStartIcon'),
  hasEndIcon: getRequiredClassName(styles, 'hasEndIcon'),
  startIcon: getRequiredClassName(styles, 'startIcon'),
  endIcon: getRequiredClassName(styles, 'endIcon'),
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

const getInput = (container: HTMLElement = document.body) => {
  const input = container.querySelector('input');

  expect(input).toBeInstanceOf(HTMLInputElement);
  return input as HTMLInputElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Input', () => {
  it('renders an <input> element', () => {
    const { container } = render(<Input aria-label="Email address" />);

    expect(getInput(container)).toBeInTheDocument();
  });

  it('forwards ref to HTMLInputElement and not the wrapper div', () => {
    const ref = React.createRef<HTMLInputElement>();
    const { container } = render(<Input ref={ref} aria-label="Email address" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toBe(getInput(container));
    expect(ref.current).not.toBe(container.firstElementChild);
  });

  it('forwards className to the <input> element', () => {
    const { container } = render(<Input className="custom-input" aria-label="Email address" />);

    expect(getInput(container)).toHaveClass('custom-input');
    expect(container.firstElementChild).not.toHaveClass('custom-input');
  });

  it('renders a wrapper <div> containing the input', () => {
    const { container } = render(<Input aria-label="Email address" />);
    const wrapper = container.firstElementChild;

    expect(wrapper?.tagName).toBe('DIV');
    expect(wrapper).toHaveClass(classNames.wrapper);
    expect(wrapper).toContainElement(getInput(container));
  });

  it('applies .md class by default', () => {
    const { container } = render(<Input aria-label="Email address" />);

    expect(getInput(container)).toHaveClass(classNames.md);
  });

  it('applies .sm class when size="sm"', () => {
    const { container } = render(<Input size="sm" aria-label="Email address" />);

    expect(getInput(container)).toHaveClass(classNames.sm);
  });

  it('applies .lg class when size="lg"', () => {
    const { container } = render(<Input size="lg" aria-label="Email address" />);

    expect(getInput(container)).toHaveClass(classNames.lg);
  });

  it('applies .invalid class when invalid={true}', () => {
    const { container } = render(<Input invalid aria-label="Email address" />);

    expect(getInput(container)).toHaveClass(classNames.invalid);
  });

  it('does not apply .invalid when invalid={false}', () => {
    const { container } = render(<Input invalid={false} aria-label="Email address" />);

    expect(getInput(container)).not.toHaveClass(classNames.invalid);
  });

  it('does not automatically set aria-invalid when invalid is true', () => {
    const { container } = render(<Input invalid aria-label="Email address" />);

    expect(getInput(container)).not.toHaveAttribute('aria-invalid');
  });

  it('renders startIcon when startIcon prop is provided', () => {
    const { container } = render(<Input startIcon={Search} aria-label="Search" />);

    expect(container.querySelector(`.${classNames.startIcon}`)).toBeInTheDocument();
    expect(container.querySelector(`.${classNames.startIcon} svg`)).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('applies .hasStartIcon class when startIcon is provided', () => {
    const { container } = render(<Input startIcon={Search} aria-label="Search" />);

    expect(getInput(container)).toHaveClass(classNames.hasStartIcon);
  });

  it('renders endIcon when endIcon prop is provided', () => {
    const { container } = render(<Input endIcon={X} aria-label="Search" />);

    expect(container.querySelector(`.${classNames.endIcon}`)).toBeInTheDocument();
    expect(container.querySelector(`.${classNames.endIcon} svg`)).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('applies .hasEndIcon class when endIcon is provided', () => {
    const { container } = render(<Input endIcon={X} aria-label="Search" />);

    expect(getInput(container)).toHaveClass(classNames.hasEndIcon);
  });

  it('renders an accessible end icon button when onEndIconClick is provided', () => {
    const onEndIconClick = vi.fn();
    const { container } = render(
      <Input
        endIcon={X}
        endIconLabel="Clear search"
        onEndIconClick={onEndIconClick}
        aria-label="Search"
      />
    );
    const button = container.querySelector('button');

    expect(button).toBeInstanceOf(HTMLButtonElement);
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAccessibleName('Clear search');
    expect(button?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onEndIconClick when the end icon button is clicked', async () => {
    const user = userEvent.setup();
    const onEndIconClick = vi.fn();
    const { container } = render(
      <Input
        endIcon={X}
        endIconLabel="Clear search"
        onEndIconClick={onEndIconClick}
        aria-label="Search"
      />
    );
    const button = container.querySelector('button');

    expect(button).toBeInstanceOf(HTMLButtonElement);
    await user.click(button as HTMLButtonElement);

    expect(onEndIconClick).toHaveBeenCalledTimes(1);
  });

  it('supports clearing a controlled input from the end icon button', async () => {
    const user = userEvent.setup();
    const ClearableInput = () => {
      const [value, setValue] = React.useState('Emerald');

      return (
        <Input
          aria-label="Search"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          endIcon={X}
          endIconLabel="Clear search"
          onEndIconClick={() => setValue('')}
        />
      );
    };
    const { container } = render(<ClearableInput />);

    expect(getInput(container)).toHaveValue('Emerald');
    await user.click(container.querySelector('button') as HTMLButtonElement);

    expect(getInput(container)).toHaveValue('');
  });

  it('keyboard: reaches and activates the end icon button after the input', async () => {
    const user = userEvent.setup();
    const onEndIconClick = vi.fn();
    const { container } = render(
      <Input
        endIcon={X}
        endIconLabel="Clear search"
        onEndIconClick={onEndIconClick}
        aria-label="Search"
      />
    );
    const input = getInput(container);
    const button = container.querySelector('button');

    expect(button).toBeInstanceOf(HTMLButtonElement);
    await user.tab();
    expect(input).toHaveFocus();
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(onEndIconClick).toHaveBeenCalledTimes(1);
  });

  it('disables the end icon button when the input is disabled', () => {
    const { container } = render(
      <Input
        disabled
        endIcon={X}
        endIconLabel="Clear search"
        onEndIconClick={() => {}}
        aria-label="Search"
      />
    );

    expect(container.querySelector('button')).toBeDisabled();
  });

  it('renders both icons simultaneously', () => {
    const { container } = render(<Input startIcon={Search} endIcon={X} aria-label="Search" />);

    expect(container.querySelector(`.${classNames.startIcon}`)).toBeInTheDocument();
    expect(container.querySelector(`.${classNames.endIcon}`)).toBeInTheDocument();
    expect(getInput(container)).toHaveClass(classNames.hasStartIcon, classNames.hasEndIcon);
  });

  it('forwards type, name, value props to <input>', () => {
    const { container } = render(
      <Input type="email" name="email" value="ada@example.com" onChange={() => {}} />
    );

    expect(getInput(container)).toHaveAttribute('type', 'email');
    expect(getInput(container)).toHaveAttribute('name', 'email');
    expect(getInput(container)).toHaveValue('ada@example.com');
  });

  it('forwards placeholder prop to <input>', () => {
    const { container } = render(<Input placeholder="name@example.com" aria-label="Email" />);

    expect(getInput(container)).toHaveAttribute('placeholder', 'name@example.com');
  });

  it('forwards disabled to <input> as a native attribute', () => {
    const { container } = render(<Input disabled aria-label="Email" />);

    expect(getInput(container)).toBeDisabled();
  });

  it('forwards readOnly to <input>', () => {
    const { container } = render(<Input readOnly aria-label="Email" />);

    expect(getInput(container)).toHaveAttribute('readonly');
  });

  it('forwards onChange, onBlur, and onFocus handlers', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onBlur = vi.fn();
    const onFocus = vi.fn();
    const { container } = render(
      <Input aria-label="Email" onChange={onChange} onBlur={onBlur} onFocus={onFocus} />
    );
    const input = getInput(container);

    await user.click(input);
    await user.keyboard('a');
    await user.tab();

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('forwards aria-* props to <input>', () => {
    const { container } = render(
      <Input aria-label="Email address" aria-describedby="email-helper" />
    );

    expect(getInput(container)).toHaveAttribute('aria-label', 'Email address');
    expect(getInput(container)).toHaveAttribute('aria-describedby', 'email-helper');
  });

  it('forwards data-testid and other arbitrary props to <input>', () => {
    const { container } = render(
      <Input data-testid="email-input" autoComplete="email" aria-label="Email" />
    );
    const input = getInput(container);

    expect(input).toHaveAttribute('data-testid', 'email-input');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });

  it('keyboard: receives focus on Tab', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <Input aria-label="Email" />
      </div>
    );
    const input = getInput(container);

    await user.tab();
    await user.tab();

    expect(input).toHaveFocus();
  });

  it('keyboard: does not receive focus when disabled', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <Input disabled aria-label="Email" />
        <button type="button">after</button>
      </div>
    );

    await user.tab();
    await user.tab();

    expect(getInput(container)).not.toHaveFocus();
    expect(container.querySelector('button')).toHaveFocus();
  });

  it('keyboard: is reachable when readOnly', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <Input readOnly aria-label="Email" />
      </div>
    );
    const input = getInput(container);

    await user.tab();
    await user.tab();

    expect(input).toHaveFocus();
  });

  it('axe passes for default render with an associated label', async () => {
    const { container } = render(
      <div>
        <label htmlFor="default-input">Email address</label>
        <Input id="default-input" />
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when invalid={true} and the consumer supplies error semantics', async () => {
    const { container } = render(
      <div>
        <label htmlFor="invalid-input">Email address</label>
        <Input id="invalid-input" invalid aria-invalid="true" aria-describedby="email-error" />
        <p id="email-error">Enter an email address with a domain.</p>
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when disabled', async () => {
    const { container } = render(
      <div>
        <label htmlFor="disabled-input">Email address</label>
        <Input id="disabled-input" disabled />
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when readOnly', async () => {
    const { container } = render(
      <div>
        <label htmlFor="readonly-input">Account ID</label>
        <Input id="readonly-input" readOnly value="DDS-1024" onChange={() => {}} />
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes with decorative startIcon and endIcon', async () => {
    const { container } = render(<Input aria-label="Search" startIcon={Search} endIcon={X} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes with an actionable endIcon', async () => {
    const { container } = render(
      <Input
        aria-label="Search"
        endIcon={X}
        endIconLabel="Clear search"
        onEndIconClick={() => {}}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes with aria-label', async () => {
    const { container } = render(<Input aria-label="Search" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses required tokens and focus styles', () => {
    const stylesheet = readFileSync('src/components/Input/Input.module.scss', 'utf8');

    expect(stylesheet).toContain('font-family: var(--dds-font-sans);');
    expect(stylesheet).toContain('background-color: var(--dds-color-bg-input);');
    expect(stylesheet).toContain('border: 1px solid var(--dds-color-border-input);');
    expect(stylesheet).toContain('border-radius: var(--dds-radius-none);');
    expect(stylesheet).toContain('outline: 3px solid transparent;');
    expect(stylesheet).toContain('outline-offset: 2px;');
    expect(stylesheet).toContain('oklch(from var(--dds-color-focus-ring) l c h / 0.5)');
    expect(stylesheet).toContain('border-color: var(--dds-color-status-danger);');
    expect(stylesheet).toContain('oklch(from var(--dds-color-status-danger) l c h / 0.5)');
    expect(stylesheet).toContain('@include icon-size(md);');
    expect(stylesheet).not.toContain('outline: none;');
    expect(stylesheet).not.toContain('.storyA11yScope');
  });

  it('keeps story-only selectors out of runtime styles', () => {
    const runtimeStyles = readFileSync('src/components/Input/Input.module.scss', 'utf8');
    const storyStyles = readFileSync('src/components/Input/Input.stories.module.scss', 'utf8');

    expect(runtimeStyles).not.toContain('.story');
    expect(storyStyles).toContain('.storyA11yScope');
  });
});

import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './SearchInput.module.scss';
import { SearchInput } from './SearchInput';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  searchAdornment: getRequiredClassName(styles, 'searchAdornment'),
  clearButton: getRequiredClassName(styles, 'clearButton'),
} as const;

const getInput = () => screen.getByRole('searchbox') as HTMLInputElement;

const getClearButton = () => screen.getByRole('button', { name: 'Clear search' });

afterEach(() => {
  cleanup();
});

describe('SearchInput', () => {
  it('renders an input with type="search"', () => {
    render(<SearchInput aria-label="Search projects" />);

    expect(getInput()).toHaveAttribute('type', 'search');
  });

  it('input has role="searchbox"', () => {
    render(<SearchInput aria-label="Search projects" />);

    expect(getInput()).toBeInTheDocument();
  });

  it('renders search icon on the left by default', () => {
    const { container } = render(<SearchInput aria-label="Search projects" />);

    expect(container.querySelector(`.${classNames.searchAdornment}`)).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Searching…' })).not.toBeInTheDocument();
  });

  it('clear button is not visible when input is empty', () => {
    render(<SearchInput aria-label="Search projects" />);

    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('clear button is visible when input has a value in controlled usage', () => {
    render(<SearchInput aria-label="Search projects" value="Emerald" readOnly />);

    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('clear button is visible when input has a value in controlled usage and is interactive', () => {
    render(<SearchInput aria-label="Search projects" value="Emerald" onChange={() => undefined} />);

    expect(getClearButton()).toBeInTheDocument();
  });

  it('clear button is visible when input has a value in uncontrolled usage', () => {
    render(<SearchInput aria-label="Search projects" defaultValue="Emerald" />);

    expect(getClearButton()).toBeInTheDocument();
  });

  it('forwards ref to HTMLInputElement', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<SearchInput ref={ref} aria-label="Search projects" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toBe(getInput());
  });

  it('forwards size="lg" to Input', () => {
    render(<SearchInput aria-label="Search projects" size="lg" />);

    expect(getInput().className).toMatch(/lg/);
  });

  it('forwards invalid={true} to Input', () => {
    render(<SearchInput aria-label="Search projects" invalid />);

    expect(getInput().className).toMatch(/invalid/);
  });

  it('forwards disabled to Input', () => {
    render(<SearchInput aria-label="Search projects" disabled />);

    expect(getInput()).toBeDisabled();
  });

  it('forwards readOnly to Input', () => {
    render(<SearchInput aria-label="Search projects" readOnly defaultValue="Emerald" />);

    expect(getInput()).toHaveAttribute('readonly');
  });

  it('forwards placeholder', () => {
    render(<SearchInput aria-label="Search projects" placeholder="Search projects" />);

    expect(getInput()).toHaveAttribute('placeholder', 'Search projects');
  });

  it('forwards id, name, aria-label, and aria-describedby', () => {
    render(
      <SearchInput
        id="project-search"
        name="projectSearch"
        aria-label="Search projects"
        aria-describedby="project-search-help"
      />
    );

    expect(getInput()).toHaveAttribute('id', 'project-search');
    expect(getInput()).toHaveAttribute('name', 'projectSearch');
    expect(getInput()).toHaveAttribute('aria-label', 'Search projects');
    expect(getInput()).toHaveAttribute('aria-describedby', 'project-search-help');
  });

  it('clear button has aria-label="Clear search"', () => {
    render(<SearchInput aria-label="Search projects" defaultValue="Emerald" />);

    expect(getClearButton()).toHaveAccessibleName('Clear search');
  });

  it('clear button has type="button"', () => {
    render(<SearchInput aria-label="Search projects" defaultValue="Emerald" />);

    expect(getClearButton()).toHaveAttribute('type', 'button');
  });

  it('clicking clear button clears uncontrolled value', async () => {
    const user = userEvent.setup();
    render(<SearchInput aria-label="Search projects" defaultValue="Emerald" />);

    await user.click(getClearButton());

    expect(getInput()).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('clicking clear button calls onClear callback', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<SearchInput aria-label="Search projects" defaultValue="Emerald" onClear={onClear} />);

    await user.click(getClearButton());

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('clicking clear button refocuses the input', async () => {
    const user = userEvent.setup();
    render(<SearchInput aria-label="Search projects" defaultValue="Emerald" />);

    await user.tab();
    await user.tab();
    await user.click(getClearButton());

    expect(document.activeElement).toBe(getInput());
  });

  it('clear button does not appear when clearable={false}', () => {
    render(<SearchInput aria-label="Search projects" defaultValue="Emerald" clearable={false} />);

    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('clear button does not appear when input is disabled', () => {
    render(<SearchInput aria-label="Search projects" defaultValue="Emerald" disabled />);

    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('clear button does not appear when input is readOnly', () => {
    render(<SearchInput aria-label="Search projects" defaultValue="Emerald" readOnly />);

    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('renders Spinner instead of search icon when loading={true}', () => {
    const { container } = render(<SearchInput aria-label="Search projects" loading />);

    expect(screen.getByRole('status', { name: 'Searching…' })).toBeInTheDocument();
    expect(container.querySelector(`.${classNames.searchAdornment}`)).not.toBeInTheDocument();
  });

  it('Spinner has label="Searching…"', () => {
    render(<SearchInput aria-label="Search projects" loading />);

    expect(screen.getByRole('status', { name: 'Searching…' })).toBeInTheDocument();
  });

  it('clear button still appears when loading={true} and input has value', () => {
    render(<SearchInput aria-label="Search projects" loading defaultValue="Emerald" />);

    expect(getClearButton()).toBeInTheDocument();
  });

  it('suppresses the native webkit search cancel button in the component stylesheet', () => {
    const stylesheet = readFileSync('src/components/SearchInput/SearchInput.module.scss', 'utf8');

    expect(stylesheet).toContain('&::-webkit-search-cancel-button');
    expect(stylesheet).toContain('&::-webkit-search-decoration');
    expect(stylesheet).toContain('appearance: none;');
    expect(stylesheet).not.toContain('.storyA11yScope');
    expect(
      readFileSync('src/components/SearchInput/SearchInput.stories.module.scss', 'utf8')
    ).toContain('.storyA11yScope');
  });

  it('works as uncontrolled with defaultValue', async () => {
    const user = userEvent.setup();
    render(<SearchInput aria-label="Search projects" defaultValue="Emerald" />);

    await user.type(getInput(), ' DS');

    expect(getInput()).toHaveValue('Emerald DS');
  });

  it('works as controlled with value and onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const ControlledSearchInput = () => {
      const [value, setValue] = React.useState('Emerald');

      return (
        <SearchInput
          aria-label="Search projects"
          value={value}
          onChange={(event) => {
            setValue(event.currentTarget.value);
            onChange(event.currentTarget.value);
          }}
        />
      );
    };

    render(<ControlledSearchInput />);
    await user.type(getInput(), ' DS');

    expect(getInput()).toHaveValue('Emerald DS');
    expect(onChange).toHaveBeenLastCalledWith('Emerald DS');
  });

  it('Tab focuses input first', async () => {
    const user = userEvent.setup();
    render(<SearchInput aria-label="Search projects" defaultValue="Emerald" />);

    await user.tab();

    expect(document.activeElement).toBe(getInput());
  });

  it('Tab again focuses clear button when visible', async () => {
    const user = userEvent.setup();
    render(<SearchInput aria-label="Search projects" defaultValue="Emerald" />);

    await user.tab();
    await user.tab();

    expect(document.activeElement).toBe(getClearButton());
  });

  it('Space on clear button clears value and refocuses input', async () => {
    const user = userEvent.setup();
    render(<SearchInput aria-label="Search projects" defaultValue="Emerald" />);

    await user.tab();
    await user.tab();
    await user.keyboard(' ');

    expect(getInput()).toHaveValue('');
    expect(document.activeElement).toBe(getInput());
  });

  it('Enter on clear button clears value and refocuses input', async () => {
    const user = userEvent.setup();
    render(<SearchInput aria-label="Search projects" defaultValue="Emerald" />);

    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');

    expect(getInput()).toHaveValue('');
    expect(document.activeElement).toBe(getInput());
  });

  it('input is not focusable when disabled', async () => {
    const user = userEvent.setup();
    render(<SearchInput aria-label="Search projects" disabled />);

    await user.tab();

    expect(document.activeElement).not.toBe(getInput());
  });

  it('applies the SearchInput root class to the underlying input element', () => {
    render(<SearchInput aria-label="Search projects" />);

    expect(getInput()).toHaveClass(classNames.root);
  });

  it('clear button uses the local adornment button class', () => {
    render(<SearchInput aria-label="Search projects" defaultValue="Emerald" />);

    expect(getClearButton()).toHaveClass(classNames.clearButton);
  });

  it('axe: passes for empty state', async () => {
    const { container } = render(<SearchInput aria-label="Search projects" />);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});

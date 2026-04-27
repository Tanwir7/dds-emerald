import React from 'react';
import '@testing-library/jest-dom/vitest';
import {
  act,
  cleanup,
  createEvent,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Typeahead, type TypeaheadSuggestion } from './Typeahead';
import styles from './Typeahead.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  listbox: getRequiredClassName(styles, 'listbox'),
  optionActive: getRequiredClassName(styles, 'optionActive'),
  optionDisabled: getRequiredClassName(styles, 'optionDisabled'),
  highlight: getRequiredClassName(styles, 'highlight'),
  optionDescription: getRequiredClassName(styles, 'optionDescription'),
  groupLabel: getRequiredClassName(styles, 'groupLabel'),
} as const;

const suggestions: TypeaheadSuggestion[] = [
  { value: 'React', group: 'Frontend' },
  { value: 'Remix', group: 'Frontend', description: 'Full-stack React framework' },
  { value: 'Redux', group: 'Frontend', disabled: true },
  { value: 'Node.js', group: 'Backend' },
  { value: 'Redis', group: 'Backend' },
  { value: 'Svelte' },
];

const renderTypeahead = (props: Partial<React.ComponentProps<typeof Typeahead>> = {}) =>
  render(
    <Typeahead
      id="framework-typeahead"
      name="framework"
      suggestions={suggestions}
      placeholder="Search frameworks"
      {...props}
    />
  );

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('Typeahead', () => {
  it('renders an input element', () => {
    renderTypeahead();

    expect(screen.getByRole('combobox')).toBeInstanceOf(HTMLInputElement);
  });

  it('input has aria-autocomplete="list"', () => {
    renderTypeahead();

    expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('input has aria-expanded="false" when no suggestions are visible', () => {
    renderTypeahead();

    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('suggestion list not in DOM when input is empty and minChars=1', () => {
    renderTypeahead();

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('forwards ref to root HTMLDivElement', () => {
    const ref = React.createRef<HTMLDivElement>();
    renderTypeahead({ ref });

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass(classNames.root);
  });

  it('forwards className to root', () => {
    renderTypeahead({ className: 'custom-root' });

    expect(screen.getByRole('combobox').closest('div.custom-root')).toBeInTheDocument();
  });

  it('typing 1+ chars shows suggestion list', async () => {
    const user = userEvent.setup();
    renderTypeahead();

    await user.type(screen.getByRole('combobox'), 're');

    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toHaveClass(classNames.listbox);
  });

  it('list closes on Escape', async () => {
    const user = userEvent.setup();
    renderTypeahead();
    const input = screen.getByRole('combobox');

    await user.type(input, 're');
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('list closes on blur with delay', async () => {
    renderTypeahead();
    const input = screen.getByRole('combobox');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 're' } });
    fireEvent.blur(input);

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await act(async () => {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 180);
      });
    });

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('does not open when fewer chars than minChars', async () => {
    const user = userEvent.setup();
    renderTypeahead({ minChars: 3 });

    await user.type(screen.getByRole('combobox'), 're');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not open when disabled', async () => {
    renderTypeahead({ disabled: true, value: 're' });
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('filters suggestions internally and case-insensitively', async () => {
    const user = userEvent.setup();
    renderTypeahead();

    await user.type(screen.getByRole('combobox'), 'RE');

    expect(screen.getByRole('option', { name: 'React' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: /Remix\s*Full-stack React framework/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Redux' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Redis' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Node.js' })).not.toBeInTheDocument();
  });

  it('shows emptyMessage when no matches', async () => {
    const user = userEvent.setup();
    renderTypeahead({ emptyMessage: 'Nothing found' });

    await user.type(screen.getByRole('combobox'), 'zzz');

    expect(screen.getByRole('option', { name: 'Nothing found' })).toBeInTheDocument();
  });

  it('respects maxSuggestions limit', async () => {
    const user = userEvent.setup();
    renderTypeahead({ maxSuggestions: 2 });

    await user.type(screen.getByRole('combobox'), 'r');

    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('onInputChange called on every keystroke and disables internal filtering', async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    renderTypeahead({
      onInputChange,
      suggestions: [{ value: 'Alpha' }, { value: 'Beta' }],
    });

    await user.type(screen.getByRole('combobox'), 'z');

    expect(onInputChange).toHaveBeenCalledWith('z');
    expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
  });

  it('clicking suggestion fills input, calls callbacks, and closes the list', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSelect = vi.fn();
    renderTypeahead({ onChange, onSelect });

    await user.type(screen.getByRole('combobox'), 'rem');
    await user.click(screen.getByRole('option', { name: /Remix\s*Full-stack React framework/i }));

    expect(screen.getByRole('combobox')).toHaveValue('Remix');
    expect(onChange).toHaveBeenLastCalledWith('Remix');
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'Remix', description: 'Full-stack React framework' })
    );
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('disabled suggestion cannot be selected', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderTypeahead({ onSelect });

    await user.type(screen.getByRole('combobox'), 'red');
    const option = screen.getByRole('option', { name: 'Redux' });
    await user.click(option);

    expect(option).toHaveClass(classNames.optionDisabled);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('matching text is wrapped in strong by default and can be disabled', async () => {
    const user = userEvent.setup();
    const { rerender } = renderTypeahead();

    await user.type(screen.getByRole('combobox'), 're');
    expect(document.body.querySelector(`strong.${classNames.highlight}`)).toBeInTheDocument();

    rerender(
      <Typeahead
        id="framework-typeahead"
        suggestions={suggestions}
        highlightMatch={false}
        value="re"
      />
    );

    expect(document.body.querySelector(`strong.${classNames.highlight}`)).not.toBeInTheDocument();
  });

  it('renders descriptions only when present', async () => {
    const user = userEvent.setup();
    renderTypeahead();

    await user.type(screen.getByRole('combobox'), 'rem');

    expect(document.body.querySelector(`.${classNames.optionDescription}`)).toHaveTextContent(
      'Full-stack React framework'
    );
    expect(screen.queryByText('Node.js')).not.toBeInTheDocument();
  });

  it('renders group headings', async () => {
    const user = userEvent.setup();
    renderTypeahead();

    await user.type(screen.getByRole('combobox'), 'r');

    const labels = document.body.querySelectorAll(`.${classNames.groupLabel}`);
    expect(labels.length).toBeGreaterThan(0);
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('shows spinner in input and list when loading', async () => {
    const user = userEvent.setup();
    renderTypeahead({ loading: true, suggestions: [] });

    await user.type(screen.getByRole('combobox'), 're');

    expect(screen.getByTestId('typeahead-spinner')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading...' })).toBeInTheDocument();
  });

  it('ArrowDown opens list and sets first active option', async () => {
    const user = userEvent.setup();
    renderTypeahead({ value: 're' });
    const input = screen.getByRole('combobox');

    await user.click(input);
    await user.keyboard('{ArrowDown}');

    expect(input).toHaveAttribute('aria-activedescendant', 'framework-typeahead-listbox-0');
    expect(screen.getByRole('option', { name: 'React' })).toHaveClass(classNames.optionActive);
  });

  it('ArrowDown and ArrowUp update active option, and ArrowUp at index 0 clears it', async () => {
    const user = userEvent.setup();
    renderTypeahead({ value: 're' });
    const input = screen.getByRole('combobox');

    await user.click(input);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', 'framework-typeahead-listbox-1');

    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-activedescendant', 'framework-typeahead-listbox-0');

    await user.keyboard('{ArrowUp}');
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('Enter selects the active option and does nothing when there is no active option', async () => {
    const user = userEvent.setup();
    renderTypeahead({ defaultValue: 're' });
    const input = screen.getByRole('combobox');

    await user.click(input);
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('re');

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('React');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('aria-controls is set only while open and options ids align with aria-activedescendant', async () => {
    const user = userEvent.setup();
    renderTypeahead();
    const input = screen.getByRole('combobox');

    expect(input).not.toHaveAttribute('aria-controls');
    await user.type(input, 're');
    expect(input).toHaveAttribute('aria-controls', 'framework-typeahead-listbox');

    const option = screen.getByRole('option', { name: 'React' });
    expect(option).toHaveAttribute('id', 'framework-typeahead-listbox-0');

    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', 'framework-typeahead-listbox-0');
  });

  it('prevents default on option mousedown so blur does not fire before click', async () => {
    const user = userEvent.setup();
    renderTypeahead();
    const input = screen.getByRole('combobox');

    await user.type(input, 're');
    const option = screen.getByRole('option', { name: 'React' });
    const mouseDown = createEvent.mouseDown(option);
    fireEvent(option, mouseDown);

    expect(mouseDown.defaultPrevented).toBe(true);
    expect(input).toHaveFocus();
  });

  it('axe: passes when closed', async () => {
    const { container } = renderTypeahead();

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes when open with groups and disabled suggestions', async () => {
    const user = userEvent.setup();
    const { container } = renderTypeahead({ invalid: true, value: 're' });
    const input = screen.getByRole('combobox');

    await user.click(input);
    await user.keyboard('{ArrowDown}');

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});

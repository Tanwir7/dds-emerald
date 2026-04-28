import React from 'react';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { MultiTypeahead, type MultiTypeaheadSuggestion } from './MultiTypeahead';
import styles from './MultiTypeahead.module.scss';

expect.extend(toHaveNoViolations);

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  listbox: getRequiredClassName(styles, 'listbox'),
  optionActive: getRequiredClassName(styles, 'optionActive'),
  optionDisabled: getRequiredClassName(styles, 'optionDisabled'),
  highlight: getRequiredClassName(styles, 'highlight'),
} as const;

const suggestions: MultiTypeaheadSuggestion[] = [
  { value: 'react', label: 'React', group: 'Frontend' },
  { value: 'remix', label: 'Remix', group: 'Frontend', description: 'Full-stack React framework' },
  { value: 'redux', label: 'Redux', group: 'Frontend', disabled: true },
  { value: 'node', label: 'Node.js', group: 'Backend' },
  { value: 'redis', label: 'Redis', group: 'Backend' },
];

const renderMultiTypeahead = (props: Partial<React.ComponentProps<typeof MultiTypeahead>> = {}) =>
  render(
    <MultiTypeahead
      id="skill-picker"
      name="skills"
      suggestions={suggestions}
      placeholder="Add skills"
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

describe('MultiTypeahead', () => {
  it('renders a combobox input', () => {
    renderMultiTypeahead();

    expect(screen.getByRole('combobox')).toBeInstanceOf(HTMLInputElement);
  });

  it('forwards ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    renderMultiTypeahead({ ref });

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass(classNames.root);
  });

  it('forwards className to the root', () => {
    renderMultiTypeahead({ className: 'custom-root' });

    expect(screen.getByRole('group')).toHaveClass('custom-root');
  });

  it('shows the placeholder only before any tags are selected', async () => {
    const user = userEvent.setup();
    renderMultiTypeahead();
    const input = screen.getByRole('combobox');

    expect(input).toHaveAttribute('placeholder', 'Add skills');

    await user.type(input, 'rea');
    await user.click(screen.getByRole('option', { name: 'React' }));

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).not.toHaveAttribute('placeholder');
  });

  it('opens suggestions while typing', async () => {
    const user = userEvent.setup();
    renderMultiTypeahead();

    await user.type(screen.getByRole('combobox'), 're');

    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toHaveClass(classNames.listbox);
  });

  it('filters suggestions and excludes already selected values', async () => {
    const user = userEvent.setup();
    renderMultiTypeahead({ defaultValue: ['react'] });

    await user.type(screen.getByRole('combobox'), 're');

    expect(screen.queryByRole('option', { name: 'React' })).not.toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: /Remix\s*Full-stack React framework/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Redux' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Redis' })).toBeInTheDocument();
  });

  it('creates one hidden input per selected value', () => {
    renderMultiTypeahead({ defaultValue: ['react', 'node'] });

    const hiddenInputs = document.querySelectorAll('input[type="hidden"][name="skills[]"]');
    expect(hiddenInputs).toHaveLength(2);
    expect(hiddenInputs[0]).toHaveValue('react');
    expect(hiddenInputs[1]).toHaveValue('node');
  });

  it('selects a suggestion on click and clears the query', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderMultiTypeahead({ onChange });
    const input = screen.getByRole('combobox');

    await user.type(input, 'rea');
    await user.click(screen.getByRole('option', { name: 'React' }));

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(onChange).toHaveBeenLastCalledWith(['react']);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('supports keyboard selection', async () => {
    const user = userEvent.setup();
    renderMultiTypeahead();
    const input = screen.getByRole('combobox');

    await user.type(input, 're');
    await user.keyboard('{ArrowDown}');

    const activeOptionId = input.getAttribute('aria-activedescendant');
    expect(activeOptionId).toBeTruthy();
    expect(document.getElementById(activeOptionId as string)).toHaveClass(classNames.optionActive);

    await user.keyboard('{Enter}');

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('removes the last selected tag when Backspace is pressed on an empty input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderMultiTypeahead({ defaultValue: ['react', 'node'], onChange });

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Backspace}');

    expect(screen.queryByText('Node.js')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(['react']);
  });

  it('removes a tag from its remove button', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderMultiTypeahead({ defaultValue: ['react'], onChange });

    await user.click(screen.getByRole('button', { name: 'Remove React' }));

    expect(screen.queryByText('React')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('can add custom values with Enter when enabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderMultiTypeahead({ allowCustomValues: true, onChange });

    await user.type(screen.getByRole('combobox'), 'GraphQL');
    await user.keyboard('{Enter}');

    expect(screen.getByText('GraphQL')).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(['GraphQL']);
  });

  it('does not add custom values when disabled by props', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderMultiTypeahead({ allowCustomValues: false, onChange });

    await user.type(screen.getByRole('combobox'), 'GraphQL');
    await user.keyboard('{Enter}');

    expect(screen.queryByText('GraphQL')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onInputChange on each keystroke and when selection clears the query', async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    renderMultiTypeahead({
      onInputChange,
      suggestions: [
        { value: 'alpha', label: 'Alpha' },
        { value: 'beta', label: 'Beta' },
      ],
    });

    await user.type(screen.getByRole('combobox'), 'z');
    await user.click(screen.getByRole('option', { name: 'Alpha' }));

    expect(onInputChange).toHaveBeenNthCalledWith(1, 'z');
    expect(onInputChange).toHaveBeenLastCalledWith('');
  });

  it('shows emptyMessage when no results match', async () => {
    const user = userEvent.setup();
    renderMultiTypeahead({ emptyMessage: 'No skills found' });

    await user.type(screen.getByRole('combobox'), 'zzz');

    expect(screen.getByRole('option', { name: 'No skills found' })).toBeInTheDocument();
  });

  it('shows a loading state when async results are pending', async () => {
    const user = userEvent.setup();
    renderMultiTypeahead({ loading: true, suggestions: [] });

    await user.type(screen.getByRole('combobox'), 'rea');

    expect(screen.getByRole('status', { name: 'Loading...' })).toBeInTheDocument();
  });

  it('prevents disabled suggestions from being selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderMultiTypeahead({ onChange });

    await user.type(screen.getByRole('combobox'), 'red');
    const option = screen.getByRole('option', { name: 'Redux' });
    await user.click(option);

    expect(option).toHaveClass(classNames.optionDisabled);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('hides the input when maxItems is reached', () => {
    renderMultiTypeahead({ defaultValue: ['react'], maxItems: 1 });

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('supports controlled values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const ControlledExample = () => {
      const [value, setValue] = React.useState<string[]>(['react']);

      return (
        <MultiTypeahead
          id="controlled-skills"
          suggestions={suggestions}
          value={value}
          onChange={(nextValue) => {
            onChange(nextValue);
            setValue(nextValue);
          }}
        />
      );
    };

    render(<ControlledExample />);

    await user.click(screen.getByRole('button', { name: 'Remove React' }));

    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  it('closes the list on blur after a delay', async () => {
    renderMultiTypeahead();
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

  it('wraps the matching text in a highlight element by default', async () => {
    const user = userEvent.setup();
    const { rerender } = renderMultiTypeahead();

    await user.type(screen.getByRole('combobox'), 're');
    expect(document.body.querySelector(`strong.${classNames.highlight}`)).toBeInTheDocument();

    rerender(
      <MultiTypeahead
        id="skill-picker"
        suggestions={suggestions}
        highlightMatch={false}
        placeholder="Add skills"
      />
    );

    await user.clear(screen.getByRole('combobox'));
    await user.type(screen.getByRole('combobox'), 're');
    expect(document.body.querySelector(`strong.${classNames.highlight}`)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderMultiTypeahead({ defaultValue: ['react'] });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

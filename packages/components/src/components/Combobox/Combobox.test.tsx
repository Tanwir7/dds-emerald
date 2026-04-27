import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Combobox, type ComboboxOption } from './Combobox';
import styles from './Combobox.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  placeholder: getRequiredClassName(styles, 'placeholder'),
  clearButton: getRequiredClassName(styles, 'clearButton'),
  optionSelected: getRequiredClassName(styles, 'optionSelected'),
  optionDisabled: getRequiredClassName(styles, 'optionDisabled'),
  groupLabel: getRequiredClassName(styles, 'groupLabel'),
  loadingIndicator: getRequiredClassName(styles, 'loadingIndicator'),
} as const;

const options: ComboboxOption[] = [
  { value: 'react', label: 'React', group: 'Frontend' },
  { value: 'angular', label: 'Angular', group: 'Frontend', disabled: true },
  { value: 'vue', label: 'Vue', group: 'Frontend' },
  { value: 'node', label: 'Node.js', group: 'Backend' },
];

const renderCombobox = (props: Partial<React.ComponentProps<typeof Combobox>> = {}) =>
  render(
    <Combobox
      id="framework-combobox"
      name="framework"
      options={options}
      placeholder="Select a framework"
      searchPlaceholder="Search frameworks"
      {...props}
    />
  );

const openCombobox = async (props: Partial<React.ComponentProps<typeof Combobox>> = {}) => {
  renderCombobox(props);
  const user = userEvent.setup();
  const trigger = screen.getByRole('combobox');
  await user.click(trigger);
  const searchbox = await screen.findByRole('searchbox');
  await waitFor(() => {
    expect(searchbox).toHaveFocus();
  });

  return { user, trigger, searchbox };
};

afterEach(() => {
  cleanup();
});

describe('Combobox', () => {
  it('renders a combobox trigger button', () => {
    renderCombobox();

    expect(screen.getByRole('combobox')).toBeInstanceOf(HTMLButtonElement);
  });

  it('trigger has role="combobox"', () => {
    renderCombobox();

    expect(screen.getByRole('combobox')).toHaveAttribute('role', 'combobox');
  });

  it('trigger has aria-haspopup="listbox"', () => {
    renderCombobox();

    expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('trigger has aria-expanded="false" when closed', () => {
    renderCombobox();

    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('trigger shows placeholder when no value selected', () => {
    renderCombobox();
    const trigger = screen.getByRole('combobox');

    expect(trigger).toHaveTextContent('Select a framework');
    expect(trigger.querySelector(`.${classNames.placeholder}`)).toBeInTheDocument();
  });

  it('trigger shows selected label when value is set', () => {
    renderCombobox({ value: 'react' });

    expect(screen.getByRole('combobox')).toHaveTextContent('React');
  });

  it('hidden input rendered with correct name', () => {
    const { container } = renderCombobox();

    expect(container.querySelector('input[type="hidden"][name="framework"]')).toBeInTheDocument();
  });

  it('hidden input value matches selected value', () => {
    const { container } = renderCombobox({ value: 'vue' });

    expect(container.querySelector('input[type="hidden"][name="framework"]')).toHaveValue('vue');
  });

  it('clicking trigger opens the popover', async () => {
    const { trigger } = await openCombobox();

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('search input has focus when open', async () => {
    const { searchbox } = await openCombobox();

    expect(searchbox).toHaveFocus();
  });

  it('pressing Escape closes the popover and refocuses trigger', async () => {
    const { user, trigger, searchbox } = await openCombobox();

    expect(searchbox).toHaveFocus();
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it('clicking outside closes the popover', async () => {
    const { user, trigger } = await openCombobox();

    await user.click(document.body);

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('typing in search input filters options', async () => {
    const { user, searchbox } = await openCombobox();

    await user.type(searchbox, 'node');

    expect(screen.getByRole('option', { name: 'Node.js' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'React' })).not.toBeInTheDocument();
  });

  it('all options shown when query is empty', async () => {
    await openCombobox();

    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('no options shown when query matches nothing', async () => {
    const { user, searchbox } = await openCombobox();

    await user.type(searchbox, 'svelte');

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('emptyMessage shown when no results', async () => {
    const { user, searchbox } = await openCombobox();

    await user.type(searchbox, 'svelte');

    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('onInputChange called on every keystroke', async () => {
    const onInputChange = vi.fn();
    const { user, searchbox } = await openCombobox({ onInputChange });
    await user.type(searchbox, 'ab');

    expect(onInputChange).toHaveBeenNthCalledWith(1, 'a');
    expect(onInputChange).toHaveBeenNthCalledWith(2, 'ab');
  });

  it('clicking an option selects it and closes popover', async () => {
    const onChange = vi.fn();
    const { user } = await openCombobox({ onChange });
    await user.click(screen.getByRole('option', { name: 'React' }));

    expect(onChange).toHaveBeenCalledWith('react');
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('selected option has aria-selected="true"', async () => {
    const { user } = await openCombobox();
    await user.click(screen.getByRole('option', { name: 'React' }));
    await user.click(screen.getByRole('combobox'));

    expect(await screen.findByRole('option', { name: 'React' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('selected option shows checkmark', async () => {
    const { user } = await openCombobox({ value: 'react' });
    const option = screen.getByRole('option', { name: 'React' });

    expect(option.querySelector('svg')).toBeInTheDocument();
    expect(option).toHaveClass(classNames.optionSelected);
    await user.keyboard('{Escape}');
  });

  it('selecting calls onChange with the option value', async () => {
    const onChange = vi.fn();
    const { user } = await openCombobox({ onChange });
    await user.click(screen.getByRole('option', { name: 'Vue' }));

    expect(onChange).toHaveBeenCalledWith('vue');
  });

  it('trigger text updates to show selected label', async () => {
    const { trigger, user } = await openCombobox();
    await user.click(screen.getByRole('option', { name: 'Vue' }));

    expect(trigger).toHaveTextContent('Vue');
  });

  it('clear button not shown when clearable={false} (default)', () => {
    renderCombobox({ value: 'react' });

    expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
  });

  it('clear button shown when clearable={true} and value is selected', () => {
    renderCombobox({ value: 'react', clearable: true });

    expect(screen.getByRole('button', { name: 'Clear selection' })).toHaveClass(
      classNames.clearButton
    );
  });

  it("clicking clear removes selection and calls onChange('')", async () => {
    const Wrapper = () => {
      const [value, setValue] = React.useState('react');
      return (
        <Combobox
          id="clearable-combobox"
          name="framework"
          options={options}
          value={value}
          clearable
          onChange={setValue}
        />
      );
    };
    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(screen.getByRole('combobox')).toHaveTextContent('Select...');
  });

  it('clear button has aria-label="Clear selection"', () => {
    renderCombobox({ value: 'react', clearable: true });

    expect(screen.getByRole('button', { name: 'Clear selection' })).toBeInTheDocument();
  });

  it('Spinner shown when loading={true}', async () => {
    await openCombobox({ loading: true });

    expect(screen.getByText('Loading options...')).toBeInTheDocument();
    expect(document.body.querySelector(`.${classNames.loadingIndicator}`)).toBeInTheDocument();
  });

  it('options not shown when loading={true}', async () => {
    await openCombobox({ loading: true });

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('trigger is disabled when disabled={true}', () => {
    renderCombobox({ disabled: true });

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('disabled options have aria-disabled and cannot be selected', async () => {
    const onChange = vi.fn();
    const { user } = await openCombobox({ onChange });
    const option = screen.getByRole('option', { name: 'Angular' });

    expect(option).toHaveAttribute('aria-disabled', 'true');
    expect(option).toHaveClass(classNames.optionDisabled);
    await user.click(option);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('options with group property are grouped under a group label', async () => {
    await openCombobox();

    const labels = document.body.querySelectorAll(`.${classNames.groupLabel}`);
    expect(labels).toHaveLength(2);
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('ArrowDown in search moves focus to first option', async () => {
    const { user, searchbox } = await openCombobox();

    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'React' })).toHaveFocus();
    expect(searchbox).not.toHaveFocus();
  });

  it('ArrowDown in list moves to next option', async () => {
    const { user } = await openCombobox();

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Vue' })).toHaveFocus();
  });

  it('ArrowUp from first option returns focus to search', async () => {
    const { user, searchbox } = await openCombobox();

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowUp}');

    expect(searchbox).toHaveFocus();
  });

  it('Enter in search selects first non-disabled option', async () => {
    const onChange = vi.fn();
    const { user } = await openCombobox({ onChange });
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('react');
  });

  it('Enter on option selects it', async () => {
    const { user } = await openCombobox();

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(screen.getByRole('combobox')).toHaveTextContent('React');
  });

  it('Escape closes popover from search input', async () => {
    const { user, trigger } = await openCombobox();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it('Escape closes popover from option list', async () => {
    const { user, trigger } = await openCombobox();

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it('axe: passes when closed', async () => {
    const { container } = renderCombobox();

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes when open with options', async () => {
    await openCombobox();
    expect(
      await axe(document.body, {
        rules: {
          region: { enabled: false },
        },
      })
    ).toHaveNoViolations();
  });

  it('axe: passes when open with no results', async () => {
    const { user, searchbox } = await openCombobox();
    await user.type(searchbox, 'svelte');

    expect(
      await axe(document.body, {
        rules: {
          region: { enabled: false },
        },
      })
    ).toHaveNoViolations();
  });

  it('axe: passes with loading={true}', async () => {
    await openCombobox({ loading: true });
    expect(
      await axe(document.body, {
        rules: {
          region: { enabled: false },
        },
      })
    ).toHaveNoViolations();
  });

  it('axe: passes with disabled options', async () => {
    await openCombobox();

    expect(screen.getByRole('option', { name: 'Angular' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(
      await axe(document.body, {
        rules: {
          region: { enabled: false },
        },
      })
    ).toHaveNoViolations();
  });

  it('axe: passes with clearable and value selected', async () => {
    renderCombobox({ value: 'react', clearable: true });

    expect(screen.getByRole('button', { name: 'Clear selection' })).toBeInTheDocument();
    expect(
      await axe(document.body, {
        rules: {
          region: { enabled: false },
        },
      })
    ).toHaveNoViolations();
  });
});

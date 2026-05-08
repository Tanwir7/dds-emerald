import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { DateRangePicker } from './DateRangePicker';

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

afterEach(() => {
  cleanup();
});

const getCalendarDay = (calendar: HTMLElement, day: string, index = 0) =>
  within(calendar).getAllByRole('gridcell', { name: day })[index] as HTMLButtonElement;

describe('DateRangePicker', () => {
  it('renders start and end placeholders when no value is selected', () => {
    render(<DateRangePicker id="travel-dates" label="Travel dates" />);

    expect(
      screen.getByRole('combobox', { name: /travel dates, start date, start date/i })
    ).toHaveTextContent('Start date');
    expect(
      screen.getByRole('combobox', { name: /travel dates, end date, end date/i })
    ).toHaveTextContent('End date');
  });

  it('renders formatted dates when a value is provided', () => {
    render(
      <DateRangePicker
        id="travel-dates"
        label="Travel dates"
        value={{ from: new Date(2026, 4, 10), to: new Date(2026, 4, 16) }}
      />
    );

    expect(
      screen.getByRole('combobox', {
        name: /travel dates, start date: sunday, may 10th, 2026/i,
      })
    ).toHaveTextContent('10/05/2026');
    expect(
      screen.getByRole('combobox', {
        name: /travel dates, end date: saturday, may 16th, 2026/i,
      })
    ).toHaveTextContent('16/05/2026');
  });

  it('opens from selection when the start trigger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker defaultMonth={new Date(2026, 4, 1)} id="travel-dates" label="Travel dates" />
    );

    await user.click(
      screen.getByRole('combobox', { name: /travel dates, start date, start date/i })
    );

    expect(await screen.findByRole('dialog', { name: 'Date picker calendar' })).toBeInTheDocument();
    expect(screen.getByText('Select a start date')).toBeInTheDocument();
  });

  it('opens end selection when the end trigger is clicked and a start date exists', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker
        defaultMonth={new Date(2026, 4, 1)}
        defaultValue={{ from: new Date(2026, 4, 10), to: undefined }}
        id="travel-dates"
        label="Travel dates"
      />
    );

    await user.click(
      screen.getByRole('combobox', {
        name: /travel dates, end date, end date/i,
      })
    );

    expect(await screen.findByRole('dialog', { name: 'Date picker calendar' })).toBeInTheDocument();
    expect(screen.getByText(/Start: 10\/05\/2026/i)).toBeInTheDocument();
  });

  it('selects a two-step date range and closes the popover after the end date', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        defaultMonth={new Date(2026, 4, 1)}
        id="travel-dates"
        label="Travel dates"
        name="travelDates"
        onChange={onChange}
      />
    );

    await user.click(
      screen.getByRole('combobox', { name: /travel dates, start date, start date/i })
    );

    const calendar = await screen.findByRole('dialog', { name: 'Date picker calendar' });
    await user.click(getCalendarDay(calendar, '10'));
    expect(screen.getByText('Start: 10/05/2026 — Select an end date')).toBeInTheDocument();

    await user.click(getCalendarDay(calendar, '16'));

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Date picker calendar' })
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByRole('combobox', {
        name: /travel dates, start date: sunday, may 10th, 2026/i,
      })
    ).toHaveTextContent('10/05/2026');
    expect(
      screen.getByRole('combobox', {
        name: /travel dates, end date: saturday, may 16th, 2026/i,
      })
    ).toHaveTextContent('16/05/2026');
    expect(onChange).toHaveBeenCalledWith({
      from: new Date(2026, 4, 10),
      to: new Date(2026, 4, 16),
    });
    expect(document.querySelector('input[name="travelDates[from]"]')).toHaveAttribute(
      'value',
      '2026-05-10'
    );
    expect(document.querySelector('input[name="travelDates[to]"]')).toHaveAttribute(
      'value',
      '2026-05-16'
    );
  });

  it('resets the start date when the second click is before the current start', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker defaultMonth={new Date(2026, 4, 1)} id="travel-dates" label="Travel dates" />
    );

    await user.click(
      screen.getByRole('combobox', { name: /travel dates, start date, start date/i })
    );

    const calendar = await screen.findByRole('dialog', { name: 'Date picker calendar' });
    await user.click(getCalendarDay(calendar, '18'));
    await user.click(getCalendarDay(calendar, '12'));

    expect(screen.getByText('Start: 12/05/2026 — Select an end date')).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', {
        name: /travel dates, start date: tuesday, may 12th, 2026/i,
      })
    ).toHaveTextContent('12/05/2026');
    expect(
      screen.getByRole('combobox', {
        name: /travel dates, end date, end date/i,
      })
    ).toHaveTextContent('End date');
  });

  it('allows a single-day range when the same day is clicked twice', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker defaultMonth={new Date(2026, 4, 1)} id="travel-dates" label="Travel dates" />
    );

    await user.click(
      screen.getByRole('combobox', { name: /travel dates, start date, start date/i })
    );

    const calendar = await screen.findByRole('dialog', { name: 'Date picker calendar' });
    await user.click(getCalendarDay(calendar, '14'));
    await user.click(getCalendarDay(calendar, '14'));

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Date picker calendar' })
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByRole('combobox', {
        name: /travel dates, start date: thursday, may 14th, 2026/i,
      })
    ).toHaveTextContent('14/05/2026');
    expect(
      screen.getByRole('combobox', {
        name: /travel dates, end date: thursday, may 14th, 2026/i,
      })
    ).toHaveTextContent('14/05/2026');
  });

  it('clears the selected range', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        defaultValue={{ from: new Date(2026, 4, 10), to: new Date(2026, 4, 16) }}
        id="travel-dates"
        label="Travel dates"
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Clear date range' }));

    expect(
      screen.getByRole('combobox', { name: /travel dates, start date, start date/i })
    ).toHaveTextContent('Start date');
    expect(
      screen.getByRole('combobox', { name: /travel dates, end date, end date/i })
    ).toHaveTextContent('End date');
    expect(onChange).toHaveBeenCalledWith({ from: undefined, to: undefined });
  });

  it('keeps the triggers focusable but does not open in readOnly mode', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker
        defaultValue={{ from: new Date(2026, 4, 10), to: new Date(2026, 4, 16) }}
        id="travel-dates"
        label="Travel dates"
        readOnly
      />
    );

    const startTrigger = screen.getByRole('combobox', {
      name: /travel dates, start date: sunday, may 10th, 2026/i,
    });
    startTrigger.focus();
    await user.click(startTrigger);

    expect(startTrigger).toHaveFocus();
    expect(screen.queryByRole('dialog', { name: 'Date picker calendar' })).not.toBeInTheDocument();
  });

  it('renders a danger inline alert and wires aria-describedby on the trigger group', () => {
    render(
      <DateRangePicker
        id="travel-dates"
        inlineAlert={{ intent: 'danger', children: 'Choose a valid travel range.' }}
        label="Travel dates"
      />
    );

    const group = screen.getByRole('group', { name: 'Travel dates' });
    const inlineAlert = screen.getByRole('alert');

    expect(group).toHaveAttribute('aria-describedby', 'travel-dates-inline-alert');
    expect(inlineAlert).toHaveAttribute('id', 'travel-dates-inline-alert');
    expect(inlineAlert).toHaveTextContent('Choose a valid travel range.');
  });

  it('does not apply the error state class for a non-danger inline alert', () => {
    render(
      <DateRangePicker
        id="travel-dates"
        inlineAlert={{ intent: 'success', children: 'Travel dates look good.' }}
        label="Travel dates"
      />
    );

    expect(screen.getByRole('group', { name: 'Travel dates' })).toHaveAttribute(
      'aria-describedby',
      'travel-dates-inline-alert'
    );
    expect(screen.getByText('Travel dates look good.')).toBeInTheDocument();
  });

  it('passes showIcon through to the inline alert', () => {
    render(
      <DateRangePicker
        id="travel-dates"
        inlineAlert={{
          intent: 'danger',
          children: 'Choose a valid travel range.',
          showIcon: false,
        }}
        label="Travel dates"
      />
    );

    expect(screen.getByRole('alert').querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders hint only when inlineAlert is absent', () => {
    const { rerender } = render(
      <DateRangePicker
        hint="Select a departure date and then a return date."
        id="travel-dates"
        label="Travel dates"
      />
    );

    expect(screen.getByText('Select a departure date and then a return date.')).toBeInTheDocument();

    rerender(
      <DateRangePicker
        hint="Select a departure date and then a return date."
        id="travel-dates"
        inlineAlert={{ intent: 'danger', children: 'Choose a valid travel range.' }}
        label="Travel dates"
      />
    );

    expect(
      screen.queryByText('Select a departure date and then a return date.')
    ).not.toBeInTheDocument();
  });

  it('has no accessibility violations in the default state', async () => {
    const { container } = render(<DateRangePicker id="travel-dates" label="Travel dates" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { DatePicker } from './DatePicker';

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

describe('DatePicker', () => {
  it('renders the visible label and placeholder text', () => {
    render(<DatePicker id="invoice-date" label="Invoice date" placeholder="Select date" />);

    expect(screen.getByText('Invoice date')).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /invoice date, select date/i })
    ).toBeInTheDocument();
  });

  it('forwards ref to the trigger button', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<DatePicker ref={ref} id="invoice-date" label="Invoice date" />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveAttribute('type', 'button');
  });

  it('opens the calendar popover when activated', async () => {
    const user = userEvent.setup();
    render(<DatePicker id="invoice-date" label="Invoice date" />);

    await user.click(screen.getByRole('combobox', { name: /invoice date, select date/i }));

    expect(await screen.findByRole('dialog', { name: 'Date picker calendar' })).toBeInTheDocument();
  });

  it('uses button navigation by default', async () => {
    const user = userEvent.setup();
    render(<DatePicker id="invoice-date" label="Invoice date" />);

    await user.click(screen.getByRole('combobox', { name: /invoice date, select date/i }));

    const calendar = await screen.findByRole('dialog', { name: 'Date picker calendar' });

    expect(within(calendar).getByRole('button', { name: /go to previous month/i })).toBeVisible();
    expect(within(calendar).getByRole('button', { name: /go to next month/i })).toBeVisible();
    expect(within(calendar).queryByRole('combobox', { name: /month/i })).not.toBeInTheDocument();
    expect(within(calendar).queryByRole('combobox', { name: /year/i })).not.toBeInTheDocument();
  });

  it('renders month and year dropdowns in dropdown mode', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        captionLayout="dropdown"
        defaultMonth={new Date(2024, 4, 1)}
        fromYear={1990}
        id="date-of-birth"
        label="Date of birth"
        toYear={2024}
      />
    );

    await user.click(screen.getByRole('combobox', { name: /date of birth, select date/i }));

    const calendar = await screen.findByRole('dialog', { name: 'Date picker calendar' });

    expect(within(calendar).getByRole('combobox', { name: /month/i })).toBeInTheDocument();
    expect(within(calendar).getByRole('combobox', { name: /year/i })).toBeInTheDocument();
    expect(
      within(calendar).queryByRole('button', { name: /go to previous month/i })
    ).not.toBeInTheDocument();
  });

  it('constrains the year dropdown to fromYear and toYear', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        captionLayout="dropdown"
        defaultMonth={new Date(1991, 4, 1)}
        fromYear={1990}
        id="date-of-birth"
        label="Date of birth"
        toYear={1992}
      />
    );

    await user.click(screen.getByRole('combobox', { name: /date of birth, select date/i }));

    const calendar = await screen.findByRole('dialog', { name: 'Date picker calendar' });
    const yearSelect = within(calendar).getByRole('combobox', { name: /year/i });
    const yearOptions = within(yearSelect)
      .getAllByRole('option')
      .map((option) => option.textContent);

    expect(yearOptions).toEqual(['1990', '1991', '1992']);
  });

  it('updates the visible month and selected value from dropdown navigation', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        captionLayout="dropdown"
        defaultMonth={new Date(2024, 4, 1)}
        fromYear={2020}
        id="date-of-birth"
        label="Date of birth"
        toYear={2024}
      />
    );

    await user.click(screen.getByRole('combobox', { name: /date of birth, select date/i }));

    const calendar = await screen.findByRole('dialog', { name: 'Date picker calendar' });
    const monthSelect = within(calendar).getByRole('combobox', { name: /month/i });
    const yearSelect = within(calendar).getByRole('combobox', { name: /year/i });
    await user.selectOptions(monthSelect, '1');
    await user.selectOptions(yearSelect, '2020');

    expect(monthSelect).toHaveValue('1');
    expect(yearSelect).toHaveValue('2020');

    await user.click(within(calendar).getByRole('gridcell', { name: '14' }));

    expect(
      screen.getByRole('combobox', {
        name: /date of birth, selected date: friday, february 14th, 2020/i,
      })
    ).toHaveTextContent('14/02/2020');
  });

  it('selects a date, closes the popover, and updates the hidden input', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultMonth={new Date(2026, 4, 1)}
        id="invoice-date"
        label="Invoice date"
        name="invoiceDate"
      />
    );

    await user.click(screen.getByRole('combobox', { name: /invoice date, select date/i }));
    const calendar = await screen.findByRole('dialog', { name: 'Date picker calendar' });
    await user.click(within(calendar).getByRole('gridcell', { name: '15' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Date picker calendar' })
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByRole('combobox', { name: /invoice date, selected date: friday, may 15th, 2026/i })
    ).toHaveTextContent('15/05/2026');
    expect(document.querySelector('input[type="hidden"][name="invoiceDate"]')).toHaveAttribute(
      'value',
      '2026-05-15'
    );
  });

  it('clears the selected date and calls onChange with null', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        defaultValue={new Date(2026, 4, 3)}
        defaultMonth={new Date(2026, 4, 1)}
        id="invoice-date"
        label="Invoice date"
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Clear selected date' }));

    expect(screen.getByRole('combobox', { name: /invoice date, select date/i })).toHaveTextContent(
      'Select date'
    );
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('honors controlled value updates', async () => {
    const user = userEvent.setup();

    const ControlledExample = () => {
      const [value, setValue] = React.useState<Date | null>(new Date(2026, 4, 3));
      return (
        <DatePicker
          defaultMonth={new Date(2026, 4, 1)}
          id="invoice-date"
          label="Invoice date"
          onChange={setValue}
          value={value}
        />
      );
    };

    render(<ControlledExample />);

    await user.click(
      screen.getByRole('combobox', {
        name: /invoice date, selected date: sunday, may 3rd, 2026/i,
      })
    );
    const calendar = await screen.findByRole('dialog', { name: 'Date picker calendar' });
    await user.click(within(calendar).getByRole('gridcell', { name: '18' }));

    expect(
      screen.getByRole('combobox', {
        name: /invoice date, selected date: monday, may 18th, 2026/i,
      })
    ).toHaveTextContent('18/05/2026');
  });

  it('prevents opening when readOnly while remaining focusable', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultValue={new Date(2026, 4, 3)}
        defaultMonth={new Date(2026, 4, 1)}
        id="invoice-date"
        label="Invoice date"
        readOnly
      />
    );

    const trigger = screen.getByRole('combobox', {
      name: /invoice date, selected date: sunday, may 3rd, 2026/i,
    });
    trigger.focus();
    await user.click(trigger);

    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('dialog', { name: 'Date picker calendar' })).not.toBeInTheDocument();
  });

  it('disables blocked dates from minDate and maxDate constraints', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultMonth={new Date(2026, 4, 1)}
        id="invoice-date"
        label="Invoice date"
        maxDate={new Date(2026, 4, 20)}
        minDate={new Date(2026, 4, 10)}
      />
    );

    await user.click(screen.getByRole('combobox', { name: /invoice date, select date/i }));

    const calendar = await screen.findByRole('dialog', { name: 'Date picker calendar' });

    expect(within(calendar).getByRole('gridcell', { name: '9' })).toBeDisabled();
    expect(within(calendar).getByRole('gridcell', { name: '10' })).toBeEnabled();
    expect(within(calendar).getByRole('gridcell', { name: '21' })).toBeDisabled();
  });

  it('renders a danger inline alert with aria-describedby and aria-invalid', () => {
    render(
      <DatePicker
        id="invoice-date"
        inlineAlert={{ intent: 'danger', children: 'Choose a valid invoice date.' }}
        label="Invoice date"
      />
    );

    const trigger = screen.getByRole('combobox', { name: /invoice date, select date/i });
    const inlineAlert = screen.getByRole('alert');

    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-describedby', 'invoice-date-inline-alert');
    expect(inlineAlert).toHaveAttribute('id', 'invoice-date-inline-alert');
    expect(inlineAlert).toHaveTextContent('Choose a valid invoice date.');
  });

  it('does not set aria-invalid for a non-danger inline alert', () => {
    render(
      <DatePicker
        id="invoice-date"
        inlineAlert={{ intent: 'success', children: 'Invoice date saved.' }}
        label="Invoice date"
      />
    );

    const trigger = screen.getByRole('combobox', { name: /invoice date, select date/i });

    expect(trigger).not.toHaveAttribute('aria-invalid');
    expect(trigger).toHaveAttribute('aria-describedby', 'invoice-date-inline-alert');
  });

  it('passes showIcon through to the inline alert', () => {
    render(
      <DatePicker
        id="invoice-date"
        inlineAlert={{
          intent: 'danger',
          children: 'Choose a valid invoice date.',
          showIcon: false,
        }}
        label="Invoice date"
      />
    );

    expect(screen.getByRole('alert').querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders hint only when inlineAlert is absent', () => {
    const { rerender } = render(
      <DatePicker
        hint="Use the calendar to select an invoice date."
        id="invoice-date"
        label="Invoice date"
      />
    );

    expect(screen.getByText('Use the calendar to select an invoice date.')).toBeInTheDocument();

    rerender(
      <DatePicker
        hint="Use the calendar to select an invoice date."
        id="invoice-date"
        inlineAlert={{ intent: 'danger', children: 'Choose a valid invoice date.' }}
        label="Invoice date"
      />
    );

    expect(
      screen.queryByText('Use the calendar to select an invoice date.')
    ).not.toBeInTheDocument();
  });

  it('has no accessibility violations in the default state', async () => {
    const { container } = render(<DatePicker id="invoice-date" label="Invoice date" />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations in dropdown navigation mode', async () => {
    const { container } = render(
      <DatePicker
        captionLayout="dropdown"
        defaultMonth={new Date(2024, 4, 1)}
        fromYear={1990}
        id="date-of-birth"
        label="Date of birth"
        toYear={2024}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

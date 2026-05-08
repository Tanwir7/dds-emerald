import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TimePicker } from './TimePicker';

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

describe('TimePicker', () => {
  it('renders hour and minute selects by default', () => {
    render(<TimePicker id="appointment-time" label="Appointment time" />);

    expect(screen.getByRole('combobox', { name: 'Hour' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Minute' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Second' })).not.toBeInTheDocument();
  });

  it('renders second and AM/PM selects when configured', () => {
    render(
      <TimePicker id="appointment-time" label="Appointment time" precision="seconds" use12Hour />
    );

    expect(screen.getByRole('combobox', { name: 'Second' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'AM/PM' })).toBeInTheDocument();
  });

  it('forwards ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<TimePicker id="appointment-time" label="Appointment time" ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('focuses the hour select when the label is clicked', async () => {
    const user = userEvent.setup();
    render(<TimePicker id="appointment-time" label="Appointment time" />);

    await user.click(screen.getByText('Appointment time'));

    expect(screen.getByRole('combobox', { name: 'Hour' })).toHaveFocus();
  });

  it('calls onChange with null until all required segments are set', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimePicker id="appointment-time" label="Appointment time" onChange={onChange} />);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Hour' }), '9');

    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('calls onChange with a complete value when hour and minute are selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimePicker id="appointment-time" label="Appointment time" onChange={onChange} />);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Hour' }), '9');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Minute' }), '30');

    expect(onChange).toHaveBeenLastCalledWith({ hours: 9, minutes: 30 });
  });

  it('converts 12-hour selections to internal 24-hour values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker id="appointment-time" label="Appointment time" onChange={onChange} use12Hour />
    );

    await user.selectOptions(screen.getByRole('combobox', { name: 'Hour' }), '2');
    await user.selectOptions(screen.getByRole('combobox', { name: 'AM/PM' }), 'PM');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Minute' }), '0');

    expect(onChange).toHaveBeenLastCalledWith({ hours: 14, minutes: 0 });
  });

  it('renders a controlled value in 12-hour mode', () => {
    render(
      <TimePicker
        id="appointment-time"
        label="Appointment time"
        use12Hour
        value={{ hours: 23, minutes: 45 }}
      />
    );

    expect(screen.getByRole('combobox', { name: 'Hour' })).toHaveValue('11');
    expect(screen.getByRole('combobox', { name: 'Minute' })).toHaveValue('45');
    expect(screen.getByRole('combobox', { name: 'AM/PM' })).toHaveValue('PM');
  });

  it('renders a hidden input in HH:mm:ss format when precision is seconds', async () => {
    const user = userEvent.setup();
    render(
      <TimePicker
        id="appointment-time"
        label="Appointment time"
        name="appointmentTime"
        precision="seconds"
      />
    );

    await user.selectOptions(screen.getByRole('combobox', { name: 'Hour' }), '9');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Minute' }), '5');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Second' }), '30');

    expect(document.querySelector('input[type="hidden"][name="appointmentTime"]')).toHaveAttribute(
      'value',
      '09:05:30'
    );
  });

  it('disables hour options that are entirely outside minTime and maxTime constraints', () => {
    render(
      <TimePicker
        id="appointment-time"
        label="Appointment time"
        maxTime={{ hours: 17, minutes: 0 }}
        minTime={{ hours: 9, minutes: 0 }}
      />
    );

    const hourSelect = screen.getByRole('combobox', { name: 'Hour' });
    const hourOptions = hourSelect.querySelectorAll('option');
    const hourEight = Array.from(hourOptions).find((option) => option.value === '8');
    const hourNine = Array.from(hourOptions).find((option) => option.value === '9');
    const hourEighteen = Array.from(hourOptions).find((option) => option.value === '18');

    expect(hourEight).toBeDisabled();
    expect(hourNine).toBeEnabled();
    expect(hourEighteen).toBeDisabled();
  });

  it('disables minute options based on the selected hour and disabled times', async () => {
    const user = userEvent.setup();
    render(
      <TimePicker
        id="appointment-time"
        disabledTimes={[{ hours: 11, minutes: 0 }]}
        label="Appointment time"
        minuteStep={30}
      />
    );

    await user.selectOptions(screen.getByRole('combobox', { name: 'Hour' }), '11');

    const minuteSelect = screen.getByRole('combobox', { name: 'Minute' });
    const minuteOptions = minuteSelect.querySelectorAll('option');
    const zeroMinutes = Array.from(minuteOptions).find((option) => option.value === '0');
    const thirtyMinutes = Array.from(minuteOptions).find((option) => option.value === '30');

    expect(zeroMinutes).toBeDisabled();
    expect(thirtyMinutes).toBeEnabled();
  });

  it('disables all selects when disabled is true', () => {
    render(<TimePicker disabled id="appointment-time" label="Appointment time" />);

    expect(screen.getByRole('combobox', { name: 'Hour' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Minute' })).toBeDisabled();
  });

  it('renders a danger inline alert and wires group and select accessibility attributes', () => {
    render(
      <TimePicker
        id="appointment-time"
        inlineAlert={{ intent: 'danger', children: 'Please select a valid time.' }}
        label="Appointment time"
        required
      />
    );

    const group = screen.getByRole('group', { name: 'Appointment time' });
    const hourSelect = screen.getByRole('combobox', { name: 'Hour' });
    const inlineAlert = screen.getByRole('alert');

    expect(group).toHaveAttribute('aria-describedby', 'appointment-time-inline-alert');
    expect(hourSelect).toHaveAttribute('aria-invalid', 'true');
    expect(hourSelect).toHaveAttribute('aria-describedby', 'appointment-time-inline-alert');
    expect(hourSelect).toBeRequired();
    expect(inlineAlert).toHaveAttribute('id', 'appointment-time-inline-alert');
    expect(inlineAlert).toHaveTextContent('Please select a valid time.');
  });

  it('does not set aria-invalid for non-danger inline alerts', () => {
    render(
      <TimePicker
        id="appointment-time"
        inlineAlert={{ intent: 'success', children: 'Time saved.' }}
        label="Appointment time"
      />
    );

    expect(screen.getByRole('group', { name: 'Appointment time' })).toHaveAttribute(
      'aria-describedby',
      'appointment-time-inline-alert'
    );
    expect(screen.getByRole('combobox', { name: 'Hour' })).not.toHaveAttribute('aria-invalid');
  });

  it('passes showIcon through to the inline alert', () => {
    render(
      <TimePicker
        id="appointment-time"
        inlineAlert={{ intent: 'danger', children: 'Please select a valid time.', showIcon: false }}
        label="Appointment time"
      />
    );

    expect(screen.getByRole('alert').querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders hint only when inlineAlert is absent', () => {
    const { rerender } = render(
      <TimePicker
        hint="Opening hours: 09:00-17:00"
        id="appointment-time"
        label="Appointment time"
      />
    );

    expect(screen.getByText('Opening hours: 09:00-17:00')).toBeInTheDocument();

    rerender(
      <TimePicker
        hint="Opening hours: 09:00-17:00"
        id="appointment-time"
        inlineAlert={{ intent: 'danger', children: 'Please select a valid time.' }}
        label="Appointment time"
      />
    );

    expect(screen.queryByText('Opening hours: 09:00-17:00')).not.toBeInTheDocument();
  });

  it('has no accessibility violations in the default state', async () => {
    const { container } = render(<TimePicker id="appointment-time" label="Appointment time" />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations in 12-hour seconds mode', async () => {
    const { container } = render(
      <TimePicker
        id="appointment-time"
        label="Appointment time"
        precision="seconds"
        use12Hour
        value={{ hours: 14, minutes: 30, seconds: 15 }}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

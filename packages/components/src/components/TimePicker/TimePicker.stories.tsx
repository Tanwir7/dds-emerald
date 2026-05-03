import type { ComponentProps } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button';
import { DatePicker } from '../DatePicker';
import { Text } from '../Text';
import { storySource, storySourceParameters } from '../../utils/storySource';
import { TimePicker } from './TimePicker';
import storyStyles from './TimePicker.stories.module.scss';

const ControlledExample = (args: ComponentProps<typeof TimePicker>) => {
  const [value, setValue] = React.useState<{ hours: number; minutes: number } | null>(null);

  return (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <TimePicker {...args} onChange={setValue} value={value} />
        <Text as="p" size="sm">
          {value
            ? `Selected time: ${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}`
            : 'No time selected'}
        </Text>
      </div>
    </div>
  );
};

const meta: Meta<typeof TimePicker> = {
  title: 'Core Components/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof TimePicker>) => (
    <div className={storyStyles.storyA11yScope}>
      <TimePicker {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
  args: {
    id: 'storybook-time-picker',
    label: 'Appointment time',
  },
};

export default meta;

type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {
  parameters: storySourceParameters(
    storySource('<TimePicker id="appointment-time" label="Appointment time" />')
  ),
};

export const WithLabel: Story = {
  args: {
    id: 'appt-time',
    label: 'Appointment time',
  },
  parameters: storySourceParameters(
    storySource('<TimePicker id="appt-time" label="Appointment time" />')
  ),
};

export const TwelveHour: Story = {
  args: {
    use12Hour: true,
  },
  parameters: storySourceParameters(
    storySource('<TimePicker id="appointment-time" label="Appointment time" use12Hour />')
  ),
};

export const WithSeconds: Story = {
  args: {
    precision: 'seconds',
  },
  parameters: storySourceParameters(
    storySource('<TimePicker id="appointment-time" label="Appointment time" precision="seconds" />')
  ),
};

export const TwelveHourWithSeconds: Story = {
  args: {
    precision: 'seconds',
    use12Hour: true,
  },
  parameters: storySourceParameters(
    storySource(
      '<TimePicker id="appointment-time" label="Appointment time" precision="seconds" use12Hour />'
    )
  ),
};

export const MinuteStep5: Story = {
  args: {
    minuteStep: 5,
  },
  parameters: storySourceParameters(
    storySource('<TimePicker id="appointment-time" label="Appointment time" minuteStep={5} />')
  ),
};

export const MinuteStep15: Story = {
  args: {
    minuteStep: 15,
  },
  parameters: storySourceParameters(
    storySource('<TimePicker id="appointment-time" label="Appointment time" minuteStep={15} />')
  ),
};

export const MinuteStep30: Story = {
  args: {
    minuteStep: 30,
  },
  parameters: storySourceParameters(
    storySource('<TimePicker id="appointment-time" label="Appointment time" minuteStep={30} />')
  ),
};

export const WithError: Story = {
  args: {
    error: 'Please select a valid time',
  },
  parameters: storySourceParameters(
    storySource(
      '<TimePicker id="appointment-time" label="Appointment time" error="Please select a valid time" />'
    )
  ),
};

export const WithHint: Story = {
  args: {
    hint: 'Opening hours: 09:00-17:00',
  },
  parameters: storySourceParameters(
    storySource(
      '<TimePicker id="appointment-time" label="Appointment time" hint="Opening hours: 09:00-17:00" />'
    )
  ),
};

export const Controlled: Story = {
  render: (args) => <ControlledExample {...args} />,
  parameters: storySourceParameters(
    storySource(
      'const [value, setValue] = useState<TimeValue | null>(null)',
      '<TimePicker id="appointment-time" label="Appointment time" value={value} onChange={setValue} />'
    )
  ),
};

export const WithMinMax: Story = {
  args: {
    minTime: { hours: 9, minutes: 0 },
    maxTime: { hours: 17, minutes: 0 },
  },
  parameters: storySourceParameters(
    storySource(
      '<TimePicker',
      '  id="appointment-time"',
      '  label="Appointment time"',
      '  minTime={{ hours: 9, minutes: 0 }}',
      '  maxTime={{ hours: 17, minutes: 0 }}',
      '/>'
    )
  ),
};

export const DisabledTimes: Story = {
  args: {
    disabledTimes: [
      { hours: 12, minutes: 0 },
      { hours: 12, minutes: 30 },
    ],
    minuteStep: 30,
  },
  parameters: storySourceParameters(
    storySource(
      '<TimePicker',
      '  id="appointment-time"',
      '  label="Appointment time"',
      '  minuteStep={30}',
      '  disabledTimes={[{ hours: 12, minutes: 0 }, { hours: 12, minutes: 30 }]}',
      '/>'
    )
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: { hours: 14, minutes: 30 },
  },
  parameters: storySourceParameters(
    storySource(
      '<TimePicker id="appointment-time" label="Appointment time" disabled value={{ hours: 14, minutes: 30 }} />'
    )
  ),
};

export const Required: Story = {
  args: {
    id: 'meeting-time',
    label: 'Meeting time',
    required: true,
  },
  parameters: storySourceParameters(
    storySource('<TimePicker id="meeting-time" label="Meeting time" required />')
  ),
};

export const ComposedWithDatePicker: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <form className={storyStyles.composedForm}>
        <DatePicker id="schedule-date" label="Schedule appointment" />
        <TimePicker id="schedule-time" label="Time" name="schedule-time" />
        <Button type="submit">Submit</Button>
      </form>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<form>',
      '  <DatePicker id="schedule-date" label="Schedule appointment" />',
      '  <TimePicker id="schedule-time" label="Time" name="schedule-time" />',
      '  <Button type="submit">Submit</Button>',
      '</form>'
    )
  ),
};

export const InForm: Story = {
  args: {
    name: 'start-time',
  },
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <form className={storyStyles.storyStack}>
        <TimePicker {...args} />
        <Button type="submit">Submit</Button>
      </form>
    </div>
  ),
  parameters: storySourceParameters(
    storySource('<TimePicker id="appointment-time" label="Appointment time" name="start-time" />')
  ),
};

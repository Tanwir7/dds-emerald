import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateRangePicker } from './DateRangePicker';
import storyStyles from './DateRangePicker.stories.module.scss';
import { storySource, storySourceParameters } from '../../utils/storySource';

const meta: Meta<typeof DateRangePicker> = {
  title: 'Core Components/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof DateRangePicker>) => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <DateRangePicker {...args} />
      </div>
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
  args: {
    label: 'Travel dates',
  },
};

export default meta;

type Story = StoryObj<typeof DateRangePicker>;

export const Default: Story = {
  args: {
    id: 'storybook-date-range-picker',
  },
  parameters: storySourceParameters(
    storySource('<DateRangePicker id="travel-dates" label="Travel dates" />')
  ),
};

export const WithValue: Story = {
  args: {
    id: 'storybook-date-range-picker-value',
    value: { from: new Date(2026, 4, 10), to: new Date(2026, 4, 16) },
  },
  parameters: storySourceParameters(
    storySource(
      '<DateRangePicker',
      '  id="travel-dates"',
      '  label="Travel dates"',
      '  value={{ from: new Date(2026, 4, 10), to: new Date(2026, 4, 16) }}',
      '/>'
    )
  ),
};

export const WithError: Story = {
  args: {
    error: 'Choose a valid travel range.',
    hint: 'Select a departure date and then a return date.',
    id: 'storybook-date-range-picker-error',
  },
  parameters: storySourceParameters(
    storySource(
      '<DateRangePicker',
      '  id="travel-dates"',
      '  label="Travel dates"',
      '  error="Choose a valid travel range."',
      '  hint="Select a departure date and then a return date."',
      '/>'
    )
  ),
};

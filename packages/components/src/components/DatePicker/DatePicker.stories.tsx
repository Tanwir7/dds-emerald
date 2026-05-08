import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './DatePicker';
import storyStyles from './DatePicker.stories.module.scss';
import { storySource, storySourceParameters } from '../../utils/storySource';

const currentYear = new Date().getFullYear();

const meta: Meta<typeof DatePicker> = {
  title: 'Core Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof DatePicker>) => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <DatePicker {...args} />
      </div>
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
  args: {
    label: 'Invoice date',
    placeholder: 'Select date',
  },
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: {
    id: 'storybook-date-picker',
  },
  parameters: storySourceParameters(
    storySource('<DatePicker id="invoice-date" label="Invoice date" placeholder="Select date" />')
  ),
};

export const WithValue: Story = {
  args: {
    id: 'storybook-date-picker-value',
    value: new Date(2026, 4, 3),
  },
  parameters: storySourceParameters(
    storySource(
      '<DatePicker id="invoice-date" label="Invoice date" value={new Date(2026, 4, 3)} />'
    )
  ),
};

export const WithError: Story = {
  args: {
    id: 'storybook-date-picker-error',
    error: 'Choose a date on or after May 3, 2026.',
    hint: 'Use the calendar to select an invoice date.',
  },
  parameters: storySourceParameters(
    storySource(
      '<DatePicker',
      '  id="invoice-date"',
      '  label="Invoice date"',
      '  error="Choose a date on or after May 3, 2026."',
      '  hint="Use the calendar to select an invoice date."',
      '/>'
    )
  ),
};

export const TwoMonths: Story = {
  args: {
    id: 'storybook-date-picker-two-months',
    numberOfMonths: 2,
  },
  parameters: storySourceParameters(
    storySource('<DatePicker id="invoice-date" label="Invoice date" numberOfMonths={2} />')
  ),
};

export const DateOfBirthDropdown: Story = {
  args: {
    id: 'storybook-date-picker-dob',
    label: 'Date of birth',
    hint: 'You must be at least 13 years old.',
    captionLayout: 'dropdown',
    fromYear: currentYear - 120,
    toYear: currentYear - 13,
    maxDate: new Date(currentYear, 11, 31),
  },
  parameters: storySourceParameters(
    storySource(
      '<DatePicker',
      '  id="date-of-birth"',
      '  label="Date of birth"',
      '  hint="You must be at least 13 years old."',
      '  captionLayout="dropdown"',
      '  fromYear={currentYear - 120}',
      '  toYear={currentYear - 13}',
      '/>'
    )
  ),
};

export const ConstrainedYearRange: Story = {
  args: {
    id: 'storybook-date-picker-range',
    label: 'Project kickoff',
    captionLayout: 'dropdown',
    fromYear: 2020,
    toYear: 2028,
    defaultMonth: new Date(2024, 4, 1),
  },
  parameters: storySourceParameters(
    storySource(
      '<DatePicker',
      '  id="project-kickoff"',
      '  label="Project kickoff"',
      '  captionLayout="dropdown"',
      '  fromYear={2020}',
      '  toYear={2028}',
      '  defaultMonth={new Date(2024, 4, 1)}',
      '/>'
    )
  ),
};

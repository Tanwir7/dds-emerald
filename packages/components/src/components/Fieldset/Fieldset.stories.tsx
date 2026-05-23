import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import clsx from 'clsx';
import { Fieldset } from './Fieldset';
import storyStyles from './Fieldset.stories.module.scss';
import { Input } from '../Input';
import { Stack } from '../Stack';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { storySource, storySourceParameters } from '../../utils/storySource';

const classNames = {
  storyA11yScope: getRequiredClassName(storyStyles, 'storyA11yScope'),
  storyFieldset: getRequiredClassName(storyStyles, 'storyFieldset'),
} as const;

const renderFieldset = ({ className, ...args }: ComponentProps<typeof Fieldset>) => (
  <div className={classNames.storyA11yScope}>
    <Fieldset {...args} className={clsx(classNames.storyFieldset, className)} />
  </div>
);

const meta: Meta<typeof Fieldset> = {
  title: 'Grouped Components/Fieldset',
  component: Fieldset,
  tags: ['autodocs'],
  render: (args) => renderFieldset(args),
  parameters: {
    a11y: {
      context: `.${classNames.storyA11yScope}`,
    },
  },
  args: {
    legend: 'Personal details',
    children: (
      <Stack gap="md">
        <Input aria-label="Full name" placeholder="Jane Smith" />
        <Input aria-label="Email address" placeholder="jane@example.com" type="email" />
      </Stack>
    ),
  },
  argTypes: {
    children: {
      table: {
        disable: true,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Fieldset>;

export const Default: Story = {
  parameters: storySourceParameters(
    storySource(
      '<Fieldset legend="Personal details">',
      '  <Stack gap="md">',
      '    <Input aria-label="Full name" placeholder="Jane Smith" />',
      '    <Input aria-label="Email address" placeholder="jane@example.com" type="email" />',
      '  </Stack>',
      '</Fieldset>'
    )
  ),
};

export const WithHelper: Story = {
  args: {
    helper: 'These details appear on your account profile.',
  },
  parameters: storySourceParameters(
    storySource(
      '<Fieldset',
      '  legend="Personal details"',
      '  helper="These details appear on your account profile."',
      '>',
      '  <Stack gap="md">',
      '    <Input aria-label="Full name" placeholder="Jane Smith" />',
      '    <Input aria-label="Email address" placeholder="jane@example.com" type="email" />',
      '  </Stack>',
      '</Fieldset>'
    )
  ),
};

export const WithoutLegend: Story = {
  args: {
    legend: undefined,
  },
  parameters: storySourceParameters(
    storySource(
      '<Fieldset>',
      '  <Stack gap="md">',
      '    <Input aria-label="Full name" placeholder="Jane Smith" />',
      '    <Input aria-label="Email address" placeholder="jane@example.com" type="email" />',
      '  </Stack>',
      '</Fieldset>'
    )
  ),
};

export const FormSectionExample: Story = {
  args: {
    legend: 'Account security',
    helper: 'Use a strong password with uppercase, lowercase, numbers, and symbols.',
    children: (
      <Stack gap="md">
        <Input aria-label="Password" type="password" />
        <Input aria-label="Confirm password" type="password" />
      </Stack>
    ),
  },
  parameters: storySourceParameters(
    storySource(
      '<Fieldset',
      '  legend="Account security"',
      '  helper="Use a strong password with uppercase, lowercase, numbers, and symbols."',
      '>',
      '  <Stack gap="md">',
      '    <Input aria-label="Password" type="password" />',
      '    <Input aria-label="Confirm password" type="password" />',
      '  </Stack>',
      '</Fieldset>'
    )
  ),
};

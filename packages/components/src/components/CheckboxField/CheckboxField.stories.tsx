import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckboxField } from './CheckboxField';
import storyStyles from './CheckboxField.stories.module.scss';
import { storySource, storySourceParameters } from '../../utils/storySource';

const renderCheckboxField = (args: ComponentProps<typeof CheckboxField>) => (
  <div className={storyStyles.storyA11yScope}>
    <CheckboxField {...args} />
  </div>
);

const meta: Meta<typeof CheckboxField> = {
  title: 'Grouped Components/CheckboxField',
  component: CheckboxField,
  tags: ['autodocs'],
  render: (args) => renderCheckboxField(args),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  args: {
    label: 'Receive project updates',
    size: 'md',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
    },
    inlineAlert: {
      table: {
        disable: true,
      },
    },
    checked: {
      control: 'inline-radio',
      options: [false, true, 'indeterminate'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof CheckboxField>;

export const Default: Story = {
  args: {
    label: 'Receive project updates',
  },
  parameters: storySourceParameters('<CheckboxField label="Receive project updates" />'),
};

export const WithHelper: Story = {
  args: {
    label: 'Receive project updates',
    helper: 'We send a monthly summary and release notes.',
  },
  parameters: storySourceParameters(
    storySource(
      '<CheckboxField',
      '  label="Receive project updates"',
      '  helper="We send a monthly summary and release notes."',
      '/>'
    )
  ),
};

export const Error: Story = {
  args: {
    label: 'Accept terms',
    required: true,
    invalid: true,
    inlineAlert: {
      intent: 'danger',
      children: 'Accept the terms before continuing.',
    },
  },
  parameters: storySourceParameters(
    storySource(
      '<CheckboxField',
      '  label="Accept terms"',
      '  required',
      '  invalid',
      '  inlineAlert={{ intent: "danger", children: "Accept the terms before continuing." }}',
      '/>'
    )
  ),
};

export const Success: Story = {
  args: {
    label: 'Receive security alerts',
    checked: true,
    inlineAlert: {
      intent: 'success',
      children: 'Security alerts are enabled.',
    },
  },
  parameters: storySourceParameters(
    storySource(
      '<CheckboxField',
      '  label="Receive security alerts"',
      '  checked',
      '  inlineAlert={{ intent: "success", children: "Security alerts are enabled." }}',
      '/>'
    )
  ),
};

export const Small: Story = {
  args: {
    label: 'Add me to the beta list',
    size: 'sm',
    helper: 'Beta invitations are sent in small batches.',
  },
  parameters: storySourceParameters(
    storySource(
      '<CheckboxField',
      '  label="Add me to the beta list"',
      '  size="sm"',
      '  helper="Beta invitations are sent in small batches."',
      '/>'
    )
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Managed by organization policy',
    checked: true,
    disabled: true,
    helper: 'Your workspace admin controls this setting.',
  },
  parameters: storySourceParameters(
    storySource(
      '<CheckboxField',
      '  label="Managed by organization policy"',
      '  checked',
      '  disabled',
      '  helper="Your workspace admin controls this setting."',
      '/>'
    )
  ),
};

export const Indeterminate: Story = {
  args: {
    label: 'Select all visible permissions',
    checked: 'indeterminate',
    helper: 'Some visible permissions are already selected.',
  },
  parameters: storySourceParameters(
    storySource(
      '<CheckboxField',
      '  label="Select all visible permissions"',
      '  checked="indeterminate"',
      '  helper="Some visible permissions are already selected."',
      '/>'
    )
  ),
};

export const AllSlots: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <CheckboxField label="Accept terms" required helper="Review the terms before continuing." />
        <CheckboxField
          label="Sync workspace data"
          helper="Keeps local activity in sync with your workspace."
        />
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<CheckboxField',
      '  label="Accept terms"',
      '  required',
      '  helper="Review the terms before continuing."',
      '/>',
      '',
      '<CheckboxField',
      '  label="Sync workspace data"',
      '  helper="Keeps local activity in sync with your workspace."',
      '/>'
    )
  ),
};

export const ConsentLinks: Story = {
  args: {
    label: (
      <>
        I agree to the <a href="/terms">Terms of Service</a> and{' '}
        <a href="/privacy">Privacy Policy</a>.
      </>
    ),
    required: true,
  },
  parameters: storySourceParameters(
    storySource(
      '<CheckboxField',
      '  required',
      '  label={<>',
      '    I agree to the <a href="/terms">Terms of Service</a> and{" "}',
      '    <a href="/privacy">Privacy Policy</a>.',
      '  </>}',
      '/>'
    )
  ),
};

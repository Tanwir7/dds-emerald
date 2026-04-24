import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SwitchField } from './SwitchField';
import storyStyles from './SwitchField.stories.module.scss';
import { storySource, storySourceParameters } from '../../utils/storySource';

const renderSwitchField = (args: ComponentProps<typeof SwitchField>) => (
  <div className={storyStyles.storyA11yScope}>
    <SwitchField {...args} />
  </div>
);

const meta: Meta<typeof SwitchField> = {
  title: 'Grouped Components/SwitchField',
  component: SwitchField,
  tags: ['autodocs'],
  render: (args) => renderSwitchField(args),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  args: {
    label: 'Enable notifications',
    labelPosition: 'right',
    size: 'md',
    helperIntent: 'default',
  },
  argTypes: {
    labelPosition: {
      control: 'inline-radio',
      options: ['right', 'left'],
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
    },
    helperIntent: {
      control: 'inline-radio',
      options: ['default', 'error', 'success'],
    },
    checked: {
      control: 'boolean',
    },
  },
};
export default meta;

type Story = StoryObj<typeof SwitchField>;

export const Default: Story = {
  args: {
    label: 'Enable notifications',
  },
  parameters: storySourceParameters('<SwitchField label="Enable notifications" />'),
};

export const WithDescription: Story = {
  args: {
    label: 'Enable notifications',
    description: 'Recommended',
  },
  parameters: storySourceParameters(
    storySource(
      '<SwitchField',
      '  label="Enable notifications"',
      '  description="Recommended"',
      '/>'
    )
  ),
};

export const WithInstruction: Story = {
  args: {
    label: 'Enable notifications',
    instruction: 'Choose how this workspace sends product and security alerts.',
  },
  parameters: storySourceParameters(
    storySource(
      '<SwitchField',
      '  label="Enable notifications"',
      '  instruction="Choose how this workspace sends product and security alerts."',
      '/>'
    )
  ),
};

export const WithHelper: Story = {
  args: {
    label: 'Enable notifications',
    helper: 'You can update this setting at any time.',
  },
  parameters: storySourceParameters(
    storySource(
      '<SwitchField',
      '  label="Enable notifications"',
      '  helper="You can update this setting at any time."',
      '/>'
    )
  ),
};

export const Error: Story = {
  args: {
    label: 'Enable notifications',
    required: true,
    invalid: true,
    helper: 'Choose a notification preference before continuing.',
    helperIntent: 'error',
  },
  parameters: storySourceParameters(
    storySource(
      '<SwitchField',
      '  label="Enable notifications"',
      '  required',
      '  invalid',
      '  helper="Choose a notification preference before continuing."',
      '  helperIntent="error"',
      '/>'
    )
  ),
};

export const Success: Story = {
  args: {
    label: 'Security alerts',
    checked: true,
    helper: 'Security alerts are enabled.',
    helperIntent: 'success',
  },
  parameters: storySourceParameters(
    storySource(
      '<SwitchField',
      '  label="Security alerts"',
      '  checked',
      '  helper="Security alerts are enabled."',
      '  helperIntent="success"',
      '/>'
    )
  ),
};

export const LabelLeft: Story = {
  args: {
    label: 'Sync workspace data',
    labelPosition: 'left',
  },
  parameters: storySourceParameters(
    storySource('<SwitchField', '  label="Sync workspace data"', '  labelPosition="left"', '/>')
  ),
};

export const Small: Story = {
  args: {
    label: 'Beta features',
    size: 'sm',
    description: 'Beta',
    helper: 'Try new workspace features before general availability.',
  },
  parameters: storySourceParameters(
    storySource(
      '<SwitchField',
      '  label="Beta features"',
      '  size="sm"',
      '  description="Beta"',
      '  helper="Try new workspace features before general availability."',
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
      '<SwitchField',
      '  label="Managed by organization policy"',
      '  checked',
      '  disabled',
      '  helper="Your workspace admin controls this setting."',
      '/>'
    )
  ),
};

export const AllSlots: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <SwitchField
          label="Enable notifications"
          description="Recommended"
          instruction="Choose how this workspace sends product and security alerts."
          helper="You can update this setting at any time."
        />
        <SwitchField label="Sync workspace data" labelPosition="left" />
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<SwitchField',
      '  label="Enable notifications"',
      '  description="Recommended"',
      '  instruction="Choose how this workspace sends product and security alerts."',
      '  helper="You can update this setting at any time."',
      '/>',
      '',
      '<SwitchField',
      '  label="Sync workspace data"',
      '  labelPosition="left"',
      '/>'
    )
  ),
};

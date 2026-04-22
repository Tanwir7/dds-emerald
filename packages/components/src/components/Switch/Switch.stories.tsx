import { useState } from 'react';
import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Label } from '../Label';
import { Text } from '../Text';
import { storySource, storySourceParameters } from '../../utils/storySource';
import { Switch } from './Switch';
import storyStyles from './Switch.stories.module.scss';

const renderSwitch = (args: ComponentProps<typeof Switch>) => (
  <div className={storyStyles.storyA11yScope}>
    <Switch {...args} />
  </div>
);

const meta: Meta<typeof Switch> = {
  title: 'Core Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Switch>) => renderSwitch(args),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  args: {
    'aria-label': 'Enable notifications',
    size: 'md',
    invalid: false,
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
    },
    checked: {
      control: 'boolean',
    },
    invalid: {
      control: 'boolean',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Switch>;

const ControlledExample = () => {
  const [checked, setChecked] = useState(false);

  return (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Switch id="storybook-controlled-switch" checked={checked} onCheckedChange={setChecked} />
        <Label htmlFor="storybook-controlled-switch">Receive project updates</Label>
      </div>
    </div>
  );
};

export const Unchecked: Story = {
  args: {
    'aria-label': 'Enable notifications',
  },
  parameters: storySourceParameters('<Switch aria-label="Enable notifications" />'),
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
    'aria-label': 'Enable notifications',
  },
  parameters: storySourceParameters('<Switch defaultChecked aria-label="Enable notifications" />'),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    'aria-label': 'Enable notifications',
  },
  parameters: storySourceParameters('<Switch disabled aria-label="Enable notifications" />'),
};

export const DisabledChecked: Story = {
  args: {
    defaultChecked: true,
    disabled: true,
    'aria-label': 'Enable notifications',
  },
  parameters: storySourceParameters(
    '<Switch defaultChecked disabled aria-label="Enable notifications" />'
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyFieldStack}>
        <div className={storyStyles.storyField}>
          <Switch
            id="storybook-invalid-switch"
            invalid
            aria-invalid="true"
            aria-describedby="storybook-invalid-switch-error"
          />
          <Label htmlFor="storybook-invalid-switch">Enable notifications</Label>
        </div>
        <Text as="p" size="sm" color="danger" id="storybook-invalid-switch-error">
          Choose a notification preference before continuing.
        </Text>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Switch',
      '  id="notifications"',
      '  invalid',
      '  aria-invalid="true"',
      '  aria-describedby="notifications-error"',
      '/>',
      '<Label htmlFor="notifications">Enable notifications</Label>',
      '<Text as="p" size="sm" color="danger" id="notifications-error">',
      '  Choose a notification preference before continuing.',
      '</Text>'
    )
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        <div className={storyStyles.storyField}>
          <Switch id="storybook-switch-sm" size="sm" />
          <Label htmlFor="storybook-switch-sm">Small</Label>
        </div>
        <div className={storyStyles.storyField}>
          <Switch id="storybook-switch-md" size="md" />
          <Label htmlFor="storybook-switch-md">Medium</Label>
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Switch id="switch-sm" size="sm" />',
      '<Label htmlFor="switch-sm">Small</Label>',
      '',
      '<Switch id="switch-md" size="md" />',
      '<Label htmlFor="switch-md">Medium</Label>'
    )
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Switch id="storybook-labeled-switch" />
        <Label htmlFor="storybook-labeled-switch">Enable notifications</Label>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Switch id="notifications" />',
      '<Label htmlFor="notifications">Enable notifications</Label>'
    )
  ),
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
  parameters: storySourceParameters(
    storySource(
      'const [checked, setChecked] = useState(false);',
      '',
      '<Switch',
      '  id="updates"',
      '  checked={checked}',
      '  onCheckedChange={setChecked}',
      '/>',
      '<Label htmlFor="updates">Receive project updates</Label>'
    )
  ),
};

export const FocusVisible: Story = {
  args: {
    'aria-label': 'Focus visible example',
  },
  parameters: storySourceParameters('<Switch aria-label="Focus visible example" />'),
  play: async ({ canvasElement }) => {
    const sw = within(canvasElement).getByRole('switch');
    await userEvent.tab();
    await expect(sw).toHaveFocus();
  },
};

export const Toggle: Story = {
  args: {
    'aria-label': 'Toggle example',
  },
  parameters: storySourceParameters('<Switch aria-label="Toggle example" />'),
  play: async ({ canvasElement }) => {
    const sw = within(canvasElement).getByRole('switch');
    await expect(sw).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(sw);
    await expect(sw).toHaveAttribute('aria-checked', 'true');
  },
};

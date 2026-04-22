import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from './Label';
import storyStyles from './Label.stories.module.scss';

const meta: Meta<typeof Label> = {
  title: 'Core Components/Label',
  component: Label,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Label>) => (
    <div className={storyStyles.storyA11yScope}>
      <Label {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  args: {
    children: 'Email address',
    required: false,
    disabled: false,
    size: 'sm',
  },
  argTypes: {
    required: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'base'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {},
};

export const Required: Story = {
  args: {
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const RequiredAndDisabled: Story = {
  args: {
    required: true,
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Label size="sm">Small label</Label>
        <Label size="base">Base label</Label>
      </div>
    </div>
  ),
};

export const WithInput: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="storybook-email" required>
          Email address
        </Label>
        <input
          className={storyStyles.storyInput}
          id="storybook-email"
          type="email"
          aria-required="true"
        />
      </div>
    </div>
  ),
};

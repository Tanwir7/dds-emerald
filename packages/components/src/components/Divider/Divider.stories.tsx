import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';
import storyStyles from './Divider.stories.module.scss';

const meta: Meta<typeof Divider> = {
  title: 'Core Components/Divider',
  component: Divider,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Divider>) => (
    <div className={storyStyles.storyA11yScope}>
      <Divider {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
};
export default meta;

type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  args: {
    orientation: 'horizontal',
  },
};

export const Vertical: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyVerticalFrame}>
        <Divider orientation="vertical" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: '<Divider orientation="vertical" />',
      },
    },
  },
};

export const Labelled: Story = {
  args: {
    label: 'Section',
  },
};

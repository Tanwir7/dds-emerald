import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';
import styles from './Divider.module.scss';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Divider>) => (
    <div className={styles.storyA11yScope}>
      <Divider {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${styles.storyA11yScope}`,
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
    <div className={styles.storyA11yScope}>
      <div className={styles.storyVerticalFrame}>
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

import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';
import styles from './Avatar.module.scss';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Avatar>) => (
    <div className={styles.storyA11yScope}>
      <Avatar {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${styles.storyA11yScope}`,
    },
  },
  args: {
    fallback: 'AL',
    alt: 'Ada Lovelace',
    size: 'md',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {},
};

export const WithImage: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80',
    alt: 'Portrait of a person',
    fallback: 'AP',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className={styles.storyA11yScope}>
      <div className={styles.storyRow}>
        <Avatar size="sm" fallback="SM" />
        <Avatar size="md" fallback="MD" />
        <Avatar size="lg" fallback="LG" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: '<><Avatar size="sm" fallback="SM" /><Avatar size="md" fallback="MD" /><Avatar size="lg" fallback="LG" /></>',
      },
    },
  },
};

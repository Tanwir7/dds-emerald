import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarGroup } from './AvatarGroup';
import styles from './AvatarGroup.module.scss';

const avatars = [
  { fallback: 'AL', alt: 'Ada Lovelace' },
  { fallback: 'GH', alt: 'Grace Hopper' },
  { fallback: 'KJ', alt: 'Katherine Johnson' },
  { fallback: 'DV', alt: 'Dorothy Vaughan' },
  { fallback: 'HM', alt: 'Hedy Lamarr' },
];

const meta: Meta<typeof AvatarGroup> = {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof AvatarGroup>) => (
    <div className={styles.storyA11yScope}>
      <AvatarGroup {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${styles.storyA11yScope}`,
    },
  },
  args: {
    avatars,
    max: 3,
    size: 'md',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    max: {
      control: { type: 'number', min: 1, max: 5 },
    },
  },
};
export default meta;

type Story = StoryObj<typeof AvatarGroup>;

export const Default: Story = {
  args: {},
};

export const Sizes: Story = {
  render: () => (
    <div className={styles.storyA11yScope}>
      <div className={styles.storyRow}>
        <AvatarGroup avatars={avatars} size="sm" max={3} />
        <AvatarGroup avatars={avatars} size="md" max={3} />
        <AvatarGroup avatars={avatars} size="lg" max={3} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: '<><AvatarGroup avatars={avatars} size="sm" /><AvatarGroup avatars={avatars} size="md" /><AvatarGroup avatars={avatars} size="lg" /></>',
      },
    },
  },
};

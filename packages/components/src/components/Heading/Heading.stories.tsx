import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './Heading';
import styles from './Heading.module.scss';

const meta: Meta<typeof Heading> = {
  title: 'Atoms/Heading',
  component: Heading,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Heading>) => (
    <div className={styles.storyA11yScope}>
      <Heading {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${styles.storyA11yScope}`,
    },
  },
  args: {
    level: 1,
    children: 'Heading',
    color: 'default',
  },
  argTypes: {
    level: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
    },
    visualLevel: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
    },
    font: {
      control: 'inline-radio',
      options: ['display', 'sans'],
    },
    color: {
      control: 'select',
      options: ['default', 'muted', 'on-primary'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Heading>;

export const H1Display: Story = {
  args: {
    level: 1,
    children: 'Primary Heading',
  },
};

export const H2Display: Story = {
  args: {
    level: 2,
    children: 'Section Heading',
  },
};

export const H3: Story = {
  args: {
    level: 3,
    children: 'Subsection Heading',
  },
};

export const AllLevels: Story = {
  render: () => (
    <div className={styles.storyA11yScope}>
      <div className={styles.storyStack}>
        <Heading level={1}>Primary Heading</Heading>
        <Heading level={2}>Section Heading</Heading>
        <Heading level={3}>Subsection Heading</Heading>
        <Heading level={4}>Group Heading</Heading>
        <Heading level={5}>Panel Heading</Heading>
        <Heading level={6}>Label Heading</Heading>
      </div>
    </div>
  ),
};

export const VisualOverride: Story = {
  args: {
    level: 3,
    visualLevel: 1,
    children: 'Semantic H3 With H1 Scale',
  },
};

export const SansFont: Story = {
  args: {
    level: 1,
    font: 'sans',
    children: 'Sans Heading',
  },
};

export const MutedColor: Story = {
  args: {
    level: 2,
    color: 'muted',
    children: 'Muted Heading',
  },
};

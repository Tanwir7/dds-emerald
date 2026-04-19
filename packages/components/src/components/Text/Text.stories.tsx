import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';
import styles from './Text.module.scss';

const meta: Meta<typeof Text> = {
  title: 'Atoms/Text',
  component: Text,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Text>) => (
    <div className={styles.storyA11yScope}>
      <Text {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${styles.storyA11yScope}`,
    },
  },
  args: {
    children: 'Text',
    size: 'base',
    weight: 'normal',
    color: 'default',
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['p', 'span', 'div', 'label', 'legend', 'strong', 'em', 'small'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'base', 'lg', 'xl'],
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
    },
    color: {
      control: 'select',
      options: ['default', 'muted', 'on-primary'],
    },
    align: {
      control: 'inline-radio',
      options: ['left', 'center', 'right'],
    },
    truncate: {
      control: 'boolean',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {},
};

export const Muted: Story = {
  args: {
    color: 'muted',
    children: 'Muted supporting text',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className={styles.storyA11yScope}>
      <div className={styles.storyStack}>
        <Text size="xs">Extra small text</Text>
        <Text size="sm">Small text</Text>
        <Text size="base">Base text</Text>
        <Text size="lg">Large text</Text>
        <Text size="xl">Extra large text</Text>
      </div>
    </div>
  ),
};

export const AllWeights: Story = {
  render: () => (
    <div className={styles.storyA11yScope}>
      <div className={styles.storyStack}>
        <Text weight="normal">Normal text</Text>
        <Text weight="medium">Medium text</Text>
        <Text weight="semibold">Semibold text</Text>
        <Text weight="bold">Bold text</Text>
      </div>
    </div>
  ),
};

export const Truncated: Story = {
  render: () => (
    <div className={styles.storyA11yScope}>
      <div className={styles.storyTruncateFrame}>
        <Text truncate>
          This is a long sentence that truncates after one line inside a constrained frame.
        </Text>
      </div>
    </div>
  ),
};

export const AsSpan: Story = {
  args: {
    as: 'span',
    children: 'Inline span text',
  },
};

export const AsStrong: Story = {
  args: {
    as: 'strong',
    weight: 'bold',
    children: 'Strong emphasized text',
  },
};

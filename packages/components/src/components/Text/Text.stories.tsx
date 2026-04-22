import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';
import storyStyles from './Text.stories.module.scss';

const meta: Meta<typeof Text> = {
  title: 'Core Components/Text',
  component: Text,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Text>) => (
    <div className={storyStyles.storyA11yScope}>
      <Text {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
  args: {
    children: 'Text',
    size: 'base',
    weight: 'normal',
    color: 'default',
    font: 'sans',
    textTransform: 'none',
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['p', 'span', 'div', 'li', 'legend', 'strong', 'em', 'small'],
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
      options: ['default', 'muted', 'success', 'warning', 'danger', 'on-primary'],
    },
    font: {
      control: 'inline-radio',
      options: ['sans', 'mono'],
    },
    textTransform: {
      control: 'select',
      options: ['none', 'capitalize', 'uppercase', 'lowercase'],
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

export const ColorMuted: Story = {
  args: {
    color: 'muted',
    children: 'Muted supporting text',
  },
};

export const ColorSuccess: Story = {
  args: {
    color: 'success',
    children: 'Success confirmation text',
  },
};

export const ColorWarning: Story = {
  args: {
    color: 'warning',
    children: 'Warning guidance text',
  },
};

export const ColorDanger: Story = {
  args: {
    color: 'danger',
    children: 'Validation error text',
  },
};

export const ColorOnPrimary: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyPrimaryFrame}>
        <Text color="on-primary">Text on a primary background</Text>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Text size="xs">Extra small text</Text>
        <Text size="sm">Small text</Text>
        <Text size="base">Base text</Text>
        <Text size="lg">Large text</Text>
        <Text size="xl">Extra large text</Text>
      </div>
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Text weight="normal">Normal text</Text>
        <Text weight="medium">Medium text</Text>
        <Text weight="semibold">Semibold text</Text>
        <Text weight="bold">Bold text</Text>
      </div>
    </div>
  ),
};

export const MonoFont: Story = {
  args: {
    font: 'mono',
    children: 'Operational forecast summary',
  },
};

export const TextTransforms: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Text textTransform="none">quarterly revenue outlook</Text>
        <Text textTransform="capitalize">quarterly revenue outlook</Text>
        <Text textTransform="uppercase">quarterly revenue outlook</Text>
        <Text textTransform="lowercase">QUARTERLY REVENUE OUTLOOK</Text>
      </div>
    </div>
  ),
};

export const Alignment: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Text align="left">Left aligned text</Text>
        <Text align="center">Center aligned text</Text>
        <Text align="right">Right aligned text</Text>
      </div>
    </div>
  ),
};

export const Truncated: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyTruncateFrame}>
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

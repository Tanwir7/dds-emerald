import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';
import storyStyles from './Text.stories.module.scss';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

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
      options: ['default', 'muted', 'success', 'warning', 'danger', 'info', 'on-primary'],
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
  parameters: storySourceParameters('<Text>Text</Text>'),
};

export const ColorMuted: Story = {
  args: {
    color: 'muted',
    children: 'Muted supporting text',
  },
  parameters: storySourceParameters('<Text color="muted">Muted supporting text</Text>'),
};

export const ColorSuccess: Story = {
  args: {
    color: 'success',
    children: 'Success confirmation text',
  },
  parameters: storySourceParameters('<Text color="success">Success confirmation text</Text>'),
};

export const ColorWarning: Story = {
  args: {
    color: 'warning',
    children: 'Warning guidance text',
  },
  parameters: storySourceParameters('<Text color="warning">Warning guidance text</Text>'),
};

export const ColorDanger: Story = {
  args: {
    color: 'danger',
    children: 'Validation error text',
  },
  parameters: storySourceParameters('<Text color="danger">Validation error text</Text>'),
};

export const ColorInfo: Story = {
  args: {
    color: 'info',
    children: 'Informational helper text',
  },
  parameters: storySourceParameters('<Text color="info">Informational helper text</Text>'),
};

export const ColorOnPrimary: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyPrimaryFrame}>
        <Text color="on-primary">Text on a primary background</Text>
      </div>
    </div>
  ),
  parameters: storySourceParameters('<Text color="on-primary">Text on a primary background</Text>'),
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
  parameters: storySourceParameters(
    storySourceFragment(
      '<Text size="xs">Extra small text</Text>',
      '<Text size="sm">Small text</Text>',
      '<Text size="base">Base text</Text>',
      '<Text size="lg">Large text</Text>',
      '<Text size="xl">Extra large text</Text>'
    )
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
  parameters: storySourceParameters(
    storySourceFragment(
      '<Text weight="normal">Normal text</Text>',
      '<Text weight="medium">Medium text</Text>',
      '<Text weight="semibold">Semibold text</Text>',
      '<Text weight="bold">Bold text</Text>'
    )
  ),
};

export const MonoFont: Story = {
  args: {
    font: 'mono',
    children: 'Operational forecast summary',
  },
  parameters: storySourceParameters('<Text font="mono">Operational forecast summary</Text>'),
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
  parameters: storySourceParameters(
    storySourceFragment(
      '<Text textTransform="none">quarterly revenue outlook</Text>',
      '<Text textTransform="capitalize">quarterly revenue outlook</Text>',
      '<Text textTransform="uppercase">quarterly revenue outlook</Text>',
      '<Text textTransform="lowercase">QUARTERLY REVENUE OUTLOOK</Text>'
    )
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
  parameters: storySourceParameters(
    storySourceFragment(
      '<Text align="left">Left aligned text</Text>',
      '<Text align="center">Center aligned text</Text>',
      '<Text align="right">Right aligned text</Text>'
    )
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
  parameters: storySourceParameters(
    storySource(
      '<Text truncate>',
      '  This is a long sentence that truncates after one line inside a constrained frame.',
      '</Text>'
    )
  ),
};

export const AsSpan: Story = {
  args: {
    as: 'span',
    children: 'Inline span text',
  },
  parameters: storySourceParameters('<Text as="span">Inline span text</Text>'),
};

export const AsStrong: Story = {
  args: {
    as: 'strong',
    weight: 'bold',
    children: 'Strong emphasized text',
  },
  parameters: storySourceParameters(
    '<Text as="strong" weight="bold">Strong emphasized text</Text>'
  ),
};

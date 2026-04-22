import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './Heading';
import storyStyles from './Heading.stories.module.scss';
import { storySourceFragment, storySourceParameters } from '../../utils/storySource';

const meta: Meta<typeof Heading> = {
  title: 'Core Components/Heading',
  component: Heading,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Heading>) => (
    <div className={storyStyles.storyA11yScope}>
      <Heading {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
  args: {
    as: 'h2',
    size: '3xl',
    font: 'display',
    weight: 'bold',
    color: 'default',
    align: 'left',
    textTransform: 'none',
    children: 'Heading',
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
    size: {
      control: 'select',
      options: ['2xl', '3xl', '4xl', '5xl', '6xl', '7xl'],
    },
    font: {
      control: 'inline-radio',
      options: ['display', 'sans'],
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
    textTransform: {
      control: 'select',
      options: ['none', 'capitalize', 'uppercase', 'lowercase'],
    },
    truncate: {
      control: 'boolean',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Heading>;

export const Default: Story = {
  args: {
    children: 'Section Heading',
  },
  parameters: storySourceParameters('<Heading>Section Heading</Heading>'),
};

export const AllLevels: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Heading as="h1">Primary Heading</Heading>
        <Heading as="h2">Section Heading</Heading>
        <Heading as="h3">Subsection Heading</Heading>
        <Heading as="h4">Group Heading</Heading>
        <Heading as="h5">Panel Heading</Heading>
        <Heading as="h6">Label Heading</Heading>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Heading as="h1">Primary Heading</Heading>',
      '<Heading as="h2">Section Heading</Heading>',
      '<Heading as="h3">Subsection Heading</Heading>',
      '<Heading as="h4">Group Heading</Heading>',
      '<Heading as="h5">Panel Heading</Heading>',
      '<Heading as="h6">Label Heading</Heading>'
    )
  ),
};

export const DisplayFont: Story = {
  args: {
    as: 'h1',
    size: '6xl',
    font: 'display',
    children: 'Display Heading',
  },
  parameters: storySourceParameters(
    '<Heading as="h1" size="6xl" font="display">Display Heading</Heading>'
  ),
};

export const SansFont: Story = {
  args: {
    font: 'sans',
    children: 'Sans Heading',
  },
  parameters: storySourceParameters('<Heading font="sans">Sans Heading</Heading>'),
};

export const AllSizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Heading size="2xl">2xl Heading</Heading>
        <Heading size="3xl">3xl Heading</Heading>
        <Heading size="4xl">4xl Heading</Heading>
        <Heading size="5xl">5xl Heading</Heading>
        <Heading size="6xl">6xl Heading</Heading>
        <Heading size="7xl">7xl Heading</Heading>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Heading size="2xl">2xl Heading</Heading>',
      '<Heading size="3xl">3xl Heading</Heading>',
      '<Heading size="4xl">4xl Heading</Heading>',
      '<Heading size="5xl">5xl Heading</Heading>',
      '<Heading size="6xl">6xl Heading</Heading>',
      '<Heading size="7xl">7xl Heading</Heading>'
    )
  ),
};

export const ColorMuted: Story = {
  args: {
    color: 'muted',
    children: 'Muted Heading',
  },
  parameters: storySourceParameters('<Heading color="muted">Muted Heading</Heading>'),
};

export const Truncated: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyTruncateFrame}>
        <Heading truncate>This heading is intentionally long enough to truncate</Heading>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    '<Heading truncate>This heading is intentionally long enough to truncate</Heading>'
  ),
};

export const TextTransform: Story = {
  args: {
    textTransform: 'uppercase',
    children: 'Transformed Heading',
  },
  parameters: storySourceParameters(
    '<Heading textTransform="uppercase">Transformed Heading</Heading>'
  ),
};

export const OnPrimary: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyPrimaryFrame}>
        <Heading color="on-primary">On Primary Heading</Heading>
      </div>
    </div>
  ),
  parameters: storySourceParameters('<Heading color="on-primary">On Primary Heading</Heading>'),
};

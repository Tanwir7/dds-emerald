import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd } from './Kbd';
import storyStyles from './Kbd.stories.module.scss';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const meta: Meta<typeof Kbd> = {
  title: 'Core Components/Kbd',
  component: Kbd,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Kbd>) => (
    <div className={storyStyles.storyA11yScope}>
      <Kbd {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  args: {
    children: '⌘',
    size: 'sm',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'base'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Kbd>;

export const Default: Story = {
  args: {},
  parameters: storySourceParameters('<Kbd>⌘</Kbd>'),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Kbd size="sm">Esc</Kbd>
        <Kbd size="base">Enter</Kbd>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment('<Kbd size="sm">Esc</Kbd>', '<Kbd size="base">Enter</Kbd>')
  ),
};

export const Sequence: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <span className={storyStyles.storySequence}>
        <Kbd>⌘</Kbd>
        <span>+</span>
        <Kbd>K</Kbd>
      </span>
    </div>
  ),
  parameters: storySourceParameters(storySource('<Kbd>⌘</Kbd>', '<span>+</span>', '<Kbd>K</Kbd>')),
};

export const InContext: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <p className={storyStyles.storySentence}>
        Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open command palette
      </p>
    </div>
  ),
  parameters: storySourceParameters(
    storySource('<p>', '  Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open command palette', '</p>')
  ),
};

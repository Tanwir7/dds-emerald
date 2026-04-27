import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';
import storyStyles from './Spinner.stories.module.scss';
import { storySource, storySourceParameters } from '../../utils/storySource';

const meta: Meta<typeof Spinner> = {
  title: 'Core Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <Spinner {...args} />
    </div>
  ),
  args: {
    size: 'md',
    label: 'Loading content',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  parameters: storySourceParameters('<Spinner label="Loading content" />'),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Spinner size="sm" label="Loading small content" />
        <Spinner size="md" label="Loading medium content" />
        <Spinner size="lg" label="Loading large content" />
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Spinner size="sm" label="Loading small content" />',
      '<Spinner size="md" label="Loading medium content" />',
      '<Spinner size="lg" label="Loading large content" />'
    )
  ),
};

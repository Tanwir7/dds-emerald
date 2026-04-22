import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Code } from './Code';
import { Text } from '../Text';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import storyStyles from './Code.stories.module.scss';

const storySentenceClassName = getRequiredClassName(storyStyles, 'storySentence');

const meta: Meta<typeof Code> = {
  title: 'Core Components/Code',
  component: Code,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Code>) => (
    <div className={storyStyles.storyA11yScope}>
      <Code {...args} />
    </div>
  ),
  parameters: {
    layout: 'padded',
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
  args: {
    children: 'npm run build',
    size: 'sm',
    block: false,
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'base'],
    },
    block: {
      control: 'boolean',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Code>;

export const Inline: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Text className={storySentenceClassName}>
        Run <Code>pnpm test</Code> before publishing a package.
      </Text>
    </div>
  ),
};

export const Block: Story = {
  args: {
    block: true,
    children: `import { Code } from '@dds/emerald';

export function Snippet() {
  return <Code>pnpm build</Code>;
}`,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Code size="xs">{"const size = 'xs';"}</Code>
        <Code size="sm">{"const size = 'sm';"}</Code>
        <Code size="base">{"const size = 'base';"}</Code>
      </div>
    </div>
  ),
};

export const LongLine: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyLongLine}>
        <Code block>
          {
            "const endpoint = 'https://api.digitaldevstudio.example/v1/components/code/very-long-path-that-demonstrates-horizontal-scroll-without-page-overflow';"
          }
        </Code>
      </div>
    </div>
  ),
};

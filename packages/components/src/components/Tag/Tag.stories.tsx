import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from './Tag';
import storyStyles from './Tag.stories.module.scss';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const meta: Meta<typeof Tag> = {
  title: 'Core Components/Tag',
  component: Tag,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Tag>) => (
    <div className={storyStyles.storyA11yScope}>
      <Tag {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
};
export default meta;

type Story = StoryObj<typeof Tag>;

const variants = ['default', 'accent', 'success', 'warning', 'danger', 'info'] as const;

const renderVariants = () => (
  <div className={storyStyles.storyA11yScope}>
    <div className={storyStyles.storyRow}>
      {variants.map((variant) => (
        <Tag key={variant} variant={variant}>
          {variant}
        </Tag>
      ))}
    </div>
  </div>
);

export const Default: Story = {
  args: {
    children: 'React',
  },
  parameters: storySourceParameters('<Tag>React</Tag>'),
};

export const Removable: Story = {
  args: {
    children: 'React',
    removable: true,
  },
  parameters: storySourceParameters('<Tag removable>React</Tag>'),
};

export const Interactive: Story = {
  args: {
    children: 'Filter',
    interactive: true,
  },
  parameters: storySourceParameters('<Tag interactive>Filter</Tag>'),
};

export const Small: Story = {
  args: {
    children: 'Small tag',
    size: 'sm',
    removable: true,
  },
  parameters: storySourceParameters('<Tag size="sm" removable>Small tag</Tag>'),
};

export const Variants: Story = {
  render: () => renderVariants(),
  parameters: storySourceParameters(
    storySourceFragment(...variants.map((variant) => `<Tag variant="${variant}">${variant}</Tag>`))
  ),
};

export const InteractiveSet: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        <Tag interactive>All</Tag>
        <Tag interactive variant="accent">
          React
        </Tag>
        <Tag interactive variant="info">
          Design System
        </Tag>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<>',
      '  <Tag interactive>All</Tag>',
      '  <Tag interactive variant="accent">React</Tag>',
      '  <Tag interactive variant="info">Design System</Tag>',
      '</>'
    )
  ),
};

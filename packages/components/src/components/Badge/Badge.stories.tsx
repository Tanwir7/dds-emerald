import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';
import storyStyles from './Badge.stories.module.scss';

const meta: Meta<typeof Badge> = {
  title: 'Core Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Badge>) => (
    <div className={storyStyles.storyA11yScope}>
      <Badge {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

const sizes = ['sm', 'md', 'lg'] as const;

const renderVariantSizes = (
  variant: NonNullable<ComponentProps<typeof Badge>['variant']>,
  label: string
) => (
  <div className={storyStyles.storyA11yScope}>
    <div className={storyStyles.storyRow}>
      {sizes.map((size) => (
        <Badge key={size} variant={variant} size={size}>
          {label} {size.toUpperCase()}
        </Badge>
      ))}
    </div>
  </div>
);

const buildVariantSizesSource = (
  variant: NonNullable<ComponentProps<typeof Badge>['variant']>,
  label: string
) => `<>
  <Badge variant="${variant}" size="sm">${label} SM</Badge>
  <Badge variant="${variant}" size="md">${label} MD</Badge>
  <Badge variant="${variant}" size="lg">${label} LG</Badge>
</>`;

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
    size: 'md',
  },
};

export const Secondary: Story = {
  render: () => renderVariantSizes('secondary', 'Secondary'),
  parameters: {
    docs: {
      source: {
        code: buildVariantSizesSource('secondary', 'Secondary'),
      },
    },
  },
};

export const Outline: Story = {
  render: () => renderVariantSizes('outline', 'Outline'),
  parameters: {
    docs: {
      source: {
        code: buildVariantSizesSource('outline', 'Outline'),
      },
    },
  },
};

export const Success: Story = {
  render: () => renderVariantSizes('success', 'Success'),
  parameters: {
    docs: {
      source: {
        code: buildVariantSizesSource('success', 'Success'),
      },
    },
  },
};

export const Warning: Story = {
  render: () => renderVariantSizes('warning', 'Warning'),
  parameters: {
    docs: {
      source: {
        code: buildVariantSizesSource('warning', 'Warning'),
      },
    },
  },
};

export const Destructive: Story = {
  render: () => renderVariantSizes('destructive', 'Destructive'),
  parameters: {
    docs: {
      source: {
        code: buildVariantSizesSource('destructive', 'Destructive'),
      },
    },
  },
};

export const Info: Story = {
  render: () => renderVariantSizes('info', 'Info'),
  parameters: {
    docs: {
      source: {
        code: buildVariantSizesSource('info', 'Info'),
      },
    },
  },
};

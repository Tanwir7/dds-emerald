import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';
import styles from './Badge.module.scss';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Badge>;

const sizes = ['sm', 'md', 'lg'] as const;

const renderVariantSizes = (
  variant: NonNullable<ComponentProps<typeof Badge>['variant']>,
  label: string
) => (
  <div className={styles.storyRow}>
    {sizes.map((size) => (
      <Badge key={size} variant={variant} size={size}>
        {label} {size.toUpperCase()}
      </Badge>
    ))}
  </div>
);

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
    size: 'md',
  },
};

export const Secondary: Story = {
  render: () => renderVariantSizes('secondary', 'Secondary'),
};

export const Outline: Story = {
  render: () => renderVariantSizes('outline', 'Outline'),
};

export const Success: Story = {
  render: () => renderVariantSizes('success', 'Success'),
};

export const Warning: Story = {
  render: () => renderVariantSizes('warning', 'Warning'),
};

export const Destructive: Story = {
  render: () => renderVariantSizes('destructive', 'Destructive'),
};

export const Info: Story = {
  render: () => renderVariantSizes('info', 'Info'),
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { VisuallyHidden } from './VisuallyHidden';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Components/VisuallyHidden',
  component: VisuallyHidden,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: '#storybook-root',
    },
  },
};
export default meta;

type Story = StoryObj<typeof VisuallyHidden>;

export const Default: Story = {
  args: {
    children: 'VisuallyHidden',
  },
};

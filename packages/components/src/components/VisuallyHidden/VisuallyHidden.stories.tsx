import type { Meta, StoryObj } from '@storybook/react-vite';
import { VisuallyHidden } from './VisuallyHidden';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Core Components/VisuallyHidden',
  component: VisuallyHidden,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof VisuallyHidden>;

export const Default: Story = {
  args: {
    children: 'VisuallyHidden',
  },
};

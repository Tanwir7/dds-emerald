import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColorPicker } from './ColorPicker';
import storyStyles from './ColorPicker.stories.module.scss';
import { storySourceParameters } from '../../utils/storySource';

const meta: Meta<typeof ColorPicker> = {
  title: 'Core Components/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <ColorPicker {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
};

export default meta;

type Story = StoryObj<typeof ColorPicker>;

export const Default: Story = {
  args: {
    defaultValue: '#0a7f5a',
    label: 'Brand colour',
  },
  parameters: storySourceParameters(
    `<ColorPicker
  defaultValue="#0a7f5a"
  label="Brand colour"
/>`
  ),
};

export const WithSwatches: Story = {
  args: {
    defaultValue: '#0a7f5a',
    label: 'Chart accent',
    swatchColumns: 4,
    swatches: [
      { color: '#0a7f5a', label: 'Emerald 700' },
      { color: '#2abf88', label: 'Emerald 500' },
      { color: '#d97706', label: 'Amber 600' },
      { color: '#dc2626', label: 'Red 600' },
    ],
  },
  parameters: storySourceParameters(
    `<ColorPicker
  defaultValue="#0a7f5a"
  label="Chart accent"
  swatchColumns={4}
  swatches={[
    { color: '#0a7f5a', label: 'Emerald 700' },
    { color: '#2abf88', label: 'Emerald 500' },
    { color: '#d97706', label: 'Amber 600' },
    { color: '#dc2626', label: 'Red 600' },
  ]}
/>`
  ),
};

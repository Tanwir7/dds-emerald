import type { Preview, Decorator } from '@storybook/react';
import '@dds/emerald-tokens/styles';
import '@dds/emerald/styles';

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    layout: 'centered',
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    ((Story, context) => {
      document.documentElement.setAttribute('data-theme', context.globals['theme'] ?? 'light');
      return Story();
    }) as Decorator,
  ],
};
export default preview;

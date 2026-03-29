import type { Preview, Decorator } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { createElement } from 'react';
import '@dds/emerald-tokens/styles';
import '@dds/emerald/styles';
import './preview.css';

const THEME_STORAGE_KEY = 'dds-storybook-theme';

const getStoredTheme = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : null;
};

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    layout: 'centered',
    controls: {
      disableSaveFromUI: true,
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: getStoredTheme() ?? 'light',
      attributeName: 'data-theme',
    }),
    ((Story, context) => {
      const theme =
        context.globals.theme === 'dark' || context.globals.theme === 'light'
          ? context.globals.theme
          : (getStoredTheme() ?? 'light');

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      }

      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.colorScheme = theme;
      document.body.style.backgroundColor = 'var(--dds-color-bg-default)';
      document.body.style.color = 'var(--dds-color-text-default)';
      if (context.viewMode === 'docs') {
        return createElement('div', { className: 'dds-storybook-docs-preview' }, Story());
      }
      return Story();
    }) as Decorator,
  ],
};
export default preview;

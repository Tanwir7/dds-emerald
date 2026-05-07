import type { Preview, Decorator } from '@storybook/nextjs-vite';
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
    layout: 'fullscreen',
    controls: {
      disableSaveFromUI: true,
    },
    docs: {
      source: {
        excludeDecorators: true,
      },
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Foundations',
          ['Tokens', 'Colors', 'Typography'],
          'Core Components',
          'Grouped Components',
          'Marketing Patterns',
          'App Patterns',
          'AI Patterns',
        ],
      },
    },
    a11y: {
      context: '.dds-story-a11y-scope',
      test: 'error',
      options: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
      },
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

      const story = createElement('div', { className: 'dds-story-a11y-scope' }, Story());

      if (context.viewMode === 'docs') {
        return createElement('div', { className: 'dds-storybook-docs-preview' }, story);
      }

      return story;
    }) as Decorator,
  ],
};
export default preview;

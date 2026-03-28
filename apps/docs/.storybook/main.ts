import type { StorybookConfig } from '@storybook/nextjs-vite';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: ['../../../packages/components/src/**/*.stories.@(ts|tsx)', '../src/docs/**/*.mdx'],
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath('@chromatic-com/storybook'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/nextjs-vite') as any,
    options: {},
  },
  staticDirs: ['../public'],
};

export default config;

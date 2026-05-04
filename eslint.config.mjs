// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import base from './tooling/eslint/base.js';
import react from './tooling/eslint/react.js';

const withFiles = (configs, files) => configs.map((config) => ({ ...config, files }));
const componentFiles = ['packages/components/**/*.{ts,tsx}', 'apps/docs/**/*.{ts,tsx}'];
const componentStoryFiles = ['packages/components/**/*.stories.tsx'];

export default [{
  ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**'],
}, ...withFiles(base, ['packages/tokens/**/*.ts', 'tooling/**/*.ts']), ...withFiles(react, componentFiles), ...withFiles(storybook.configs["flat/recommended"], componentStoryFiles)];

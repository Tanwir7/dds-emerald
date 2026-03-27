import base from './tooling/eslint/base.js';
import react from './tooling/eslint/react.js';

const withFiles = (configs, files) => configs.map((config) => ({ ...config, files }));

export default [
  {
    ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**'],
  },
  ...withFiles(base, ['packages/tokens/**/*.ts', 'tooling/**/*.ts']),
  ...withFiles(react, ['packages/components/**/*.{ts,tsx}']),
];

import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import a11yPlugin from 'eslint-plugin-jsx-a11y';
import base from './base.js';

export default [
  ...base,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  { plugins: { 'react-hooks': hooksPlugin }, rules: hooksPlugin.configs.recommended.rules },
  a11yPlugin.flatConfigs.recommended,
  { settings: { react: { version: 'detect' } } },
];

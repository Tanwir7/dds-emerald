import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'storybook-manager',
    environment: 'node',
    globalSetup: ['./tests/storybookManager.globalSetup.ts'],
    include: ['./tests/storybookManager.test.ts'],
  },
});

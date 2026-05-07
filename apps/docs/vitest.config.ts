import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { emeraldStyleAliases } from './.storybook/viteAliases';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirname, '../..');

export default defineConfig({
  resolve: {
    alias: emeraldStyleAliases,
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  plugins: [
    storybookTest({
      configDir: path.join(dirname, '.storybook'),
      storybookScript: 'pnpm dev:ci',
    }),
  ],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      provider: playwright({}),
      headless: true,
      api: {
        host: '127.0.0.1',
      },
      instances: [{ browser: 'chromium' }],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: path.join(dirname, 'coverage', 'storybook'),
    },
  },
});

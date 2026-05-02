import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const reactRoot = resolve(require.resolve('react/package.json'), '..');
const reactDomRoot = resolve(require.resolve('react-dom/package.json'), '..');
const rolldownRegionCommentPattern = /^\/\/#(?:end)?region.*(?:\r?\n)?/gm;
const tokenCssImports = ['@dds/emerald-tokens/fonts', '@dds/emerald-tokens/styles'];
const baseStylesPath = resolve(__dirname, 'src/styles/base.css');
const tokenImportPattern = new RegExp(
  `^@import ['"](?:${tokenCssImports.map((entry) => entry.replace('/', '\\/')).join('|')})['"];\\s*`,
  'gm'
);

export default defineConfig({
  resolve: {
    alias: [
      { find: 'react/jsx-runtime', replacement: require.resolve('react/jsx-runtime') },
      {
        find: 'react/jsx-dev-runtime',
        replacement: require.resolve('react/jsx-dev-runtime'),
      },
      { find: 'react-dom/client', replacement: require.resolve('react-dom/client') },
      {
        find: 'react-dom/test-utils',
        replacement: require.resolve('react-dom/test-utils'),
      },
      { find: 'react-dom', replacement: reactDomRoot },
      { find: 'react', replacement: reactRoot },
    ],
  },
  plugins: [
    react(),
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
      insertTypesEntry: true,
      rollupTypes: true,
      aliasesExclude: [/^react(?:\/.*)?$/, /^react-dom(?:\/.*)?$/],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.ts', '**/*.stories.tsx'],
    }),
    {
      name: 'strip-rolldown-region-comments',
      generateBundle(_, bundle) {
        for (const output of Object.values(bundle)) {
          if (output.type === 'chunk') {
            output.code = output.code.replace(rolldownRegionCommentPattern, '');
          }
        }
      },
    },
    {
      name: 'preserve-token-css-package-imports',
      apply: 'build',
      enforce: 'pre',
      transform(source, id) {
        if (id !== baseStylesPath) {
          return null;
        }

        return {
          code: source.replace(tokenImportPattern, ''),
          map: null,
        };
      },
      writeBundle() {
        const stylesPath = resolve(__dirname, 'dist/styles.css');
        const styles = readFileSync(stylesPath, 'utf8');
        const importBlock = `${tokenCssImports.map((entry) => `@import '${entry}';`).join('\n')}\n`;

        if (styles.startsWith(importBlock)) {
          return;
        }

        writeFileSync(stylesPath, `${importBlock}${styles}`);
      },
    },
  ],
  css: {
    modules: {
      // Generates scoped class names: dds-Button_root__abc123
      generateScopedName: 'dds-[local]__[hash:base64:6]',
      localsConvention: 'camelCase',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: resolve(__dirname, '../../tooling/vitest/setup.ts'),
    server: {
      deps: {
        inline: ['@testing-library/react', '@testing-library/user-event'],
      },
    },
  },
  build: {
    minify: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'lucide-react',
      ],
      output: {
        comments: false,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        // Emit a single CSS file rather than per-component CSS
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'styles.css';
          return assetInfo.name ?? 'asset';
        },
      },
    },
  },
});

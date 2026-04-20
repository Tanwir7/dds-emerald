import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const reactRoot = resolve(require.resolve('react/package.json'), '..');
const reactDomRoot = resolve(require.resolve('react-dom/package.json'), '..');

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
      exclude: ['**/*.test.tsx', '**/*.stories.tsx'],
    }),
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

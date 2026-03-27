import { defineConfig } from 'tsup';
export default defineConfig({
  entry: { index: 'src/tokens.ts' },
  format: ['esm'],
  dts: true,
  clean: true,
  loader: {
    '.css': 'copy',
  },
  esbuildOptions(options) {
    options.assetNames = 'tokens';
  },
});

import { defineConfig } from 'tsup';
import { copyFileSync } from 'fs';

export default defineConfig({
  entry: { index: 'src/tokens.ts' },
  format: ['esm'],
  dts: true,
  clean: true,
  onSuccess: async () => {
    copyFileSync('src/fonts.css', 'dist/fonts.css');
    copyFileSync('src/tokens.css', 'dist/tokens.css');
  },
});

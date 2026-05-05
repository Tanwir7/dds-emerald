import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirname, '../../..');

export const emeraldStyleAliases = {
  '@dds/emerald/styles': path.join(repoRoot, 'packages/components/src/styles/base.css'),
  '@dds/emerald-tokens/styles': path.join(repoRoot, 'packages/tokens/src/tokens.css'),
  '@dds/emerald-tokens/fonts': path.join(repoRoot, 'packages/tokens/src/fonts.css'),
};

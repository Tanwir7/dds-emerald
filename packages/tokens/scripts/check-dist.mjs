import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distRoot = join(packageRoot, 'dist');

const expectedFiles = new Set([
  'dist/fonts.css',
  'dist/index.d.ts',
  'dist/index.js',
  'dist/tokens.css',
]);

const getFiles = (directory) =>
  readdirSync(directory)
    .flatMap((entry) => {
      const filePath = join(directory, entry);
      return statSync(filePath).isDirectory() ? getFiles(filePath) : filePath;
    })
    .sort();

const fail = (message, details = []) => {
  console.error(message);

  for (const detail of details) {
    console.error(`- ${detail}`);
  }

  process.exit(1);
};

if (!existsSync(distRoot)) {
  fail('dist hygiene check failed: dist directory does not exist. Run the package build first.');
}

const files = getFiles(distRoot);
const relativeFiles = files.map((filePath) => relative(packageRoot, filePath));

const unexpectedFiles = relativeFiles.filter((filePath) => !expectedFiles.has(filePath));

if (unexpectedFiles.length > 0) {
  fail('dist hygiene check failed: unexpected files were emitted.', unexpectedFiles);
}

for (const filePath of expectedFiles) {
  if (!existsSync(join(packageRoot, filePath))) {
    fail('dist hygiene check failed: expected file is missing.', [filePath]);
  }
}

const storyOrTestFiles = relativeFiles.filter((filePath) =>
  /\.(?:stories|story|test|spec)\.[cm]?(?:ts|tsx|js|jsx|css|scss)(?:\.map)?$/.test(filePath)
);

if (storyOrTestFiles.length > 0) {
  fail('dist hygiene check failed: story or test files were emitted.', storyOrTestFiles);
}

const declarationsWithLocalPaths = files
  .filter((filePath) => filePath.endsWith('.d.ts'))
  .filter((filePath) => /(?:^|[/"'])node_modules\/|\.pnpm\//.test(readFileSync(filePath, 'utf8')));

if (declarationsWithLocalPaths.length > 0) {
  fail(
    'dist hygiene check failed: local dependency paths were emitted in declarations.',
    declarationsWithLocalPaths.map((filePath) => relative(packageRoot, filePath))
  );
}

const runtimeBundlesWithLocalPaths = files
  .filter((filePath) => filePath.endsWith('.js'))
  .filter((filePath) =>
    /node_modules\/|\.pnpm\/|^\/\/ src\//m.test(readFileSync(filePath, 'utf8'))
  );

if (runtimeBundlesWithLocalPaths.length > 0) {
  fail(
    'dist hygiene check failed: local paths were emitted in runtime bundles.',
    runtimeBundlesWithLocalPaths.map((filePath) => relative(packageRoot, filePath))
  );
}

console.log('dist hygiene check passed');

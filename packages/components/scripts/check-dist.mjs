import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distRoot = join(packageRoot, 'dist');

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

const testDeclarations = relativeFiles.filter(
  (filePath) => /\.test\.d\.ts(?:\.map)?$/.test(filePath) || /\.spec\.d\.ts(?:\.map)?$/.test(filePath)
);

if (testDeclarations.length > 0) {
  fail('dist hygiene check failed: test declarations were emitted.', testDeclarations);
}

const stylesPath = join(distRoot, 'styles.css');

if (!existsSync(stylesPath)) {
  fail('dist hygiene check failed: dist/styles.css is missing.');
}

const styles = readFileSync(stylesPath, 'utf8');

if (styles.includes('dds-story')) {
  fail('dist hygiene check failed: Storybook CSS selectors were emitted in dist/styles.css.');
}

const runtimeBundles = ['index.js', 'index.cjs']
  .map((fileName) => join(distRoot, fileName))
  .filter((filePath) => existsSync(filePath));

const bundlesWithStoryKeys = runtimeBundles.filter((filePath) =>
  /story[A-Z][A-Za-z0-9]*/.test(readFileSync(filePath, 'utf8'))
);

if (bundlesWithStoryKeys.length > 0) {
  fail(
    'dist hygiene check failed: Storybook CSS module keys were emitted in runtime bundles.',
    bundlesWithStoryKeys.map((filePath) => relative(packageRoot, filePath))
  );
}

console.log('dist hygiene check passed');

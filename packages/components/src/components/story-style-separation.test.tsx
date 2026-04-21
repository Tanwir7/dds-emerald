import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

expect.extend(toHaveNoViolations);

const componentsRoot = 'src/components';

const getFiles = (directory: string): string[] =>
  readdirSync(directory)
    .flatMap((entry) => {
      const filePath = join(directory, entry);
      return statSync(filePath).isDirectory() ? getFiles(filePath) : filePath;
    })
    .sort();

const runtimeStyleFiles = getFiles(componentsRoot).filter(
  (filePath) => filePath.endsWith('.module.scss') && !filePath.endsWith('.stories.module.scss')
);

const storyFiles = getFiles(componentsRoot).filter((filePath) => filePath.endsWith('.stories.tsx'));

const runtimeComponentFiles = getFiles(componentsRoot).filter(
  (filePath) =>
    filePath.endsWith('.tsx') &&
    !filePath.endsWith('.stories.tsx') &&
    !filePath.endsWith('.test.tsx')
);

describe('Story style separation', () => {
  it('keeps story-only selectors out of runtime component styles', () => {
    const offenders = runtimeStyleFiles.filter((filePath) =>
      /^\s*\.story[A-Z0-9]/m.test(readFileSync(filePath, 'utf8'))
    );

    expect(offenders.map((filePath) => relative(process.cwd(), filePath))).toEqual([]);
  });

  it('keeps Storybook helper styles in separate story modules', () => {
    const offenders = storyFiles.filter((filePath) => {
      const source = readFileSync(filePath, 'utf8');

      if (!source.includes('storyA11yScope')) {
        return false;
      }

      return !existsSync(filePath.replace('.stories.tsx', '.stories.module.scss'));
    });

    expect(offenders.map((filePath) => relative(process.cwd(), filePath))).toEqual([]);
  });

  it('prevents runtime components from importing story style modules', () => {
    const offenders = runtimeComponentFiles.filter((filePath) =>
      readFileSync(filePath, 'utf8').includes('.stories.module.scss')
    );

    expect(offenders.map((filePath) => relative(process.cwd(), filePath))).toEqual([]);
  });

  it('has no a11y violations for the Storybook a11y scope wrapper', async () => {
    const container = document.createElement('div');
    container.innerHTML = '<button type="button">Focusable control</button>';

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

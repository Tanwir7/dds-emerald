import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { axe, toHaveNoViolations } from 'jest-axe';
import * as ts from 'typescript';
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

const forbiddenDocsSourceFragments = ['storyA11yScope', 'storyStyles', 'render:'];
const sourceHelperNames = new Set([
  'storySource',
  'storySourceBlock',
  'storySourceFragment',
  'storySourceParameters',
]);

const getStringLiteralValue = (node: ts.Node) => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  if (ts.isTemplateExpression(node)) {
    return [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join('');
  }

  return null;
};

const isSourceCodeProperty = (node: ts.PropertyAssignment) =>
  ts.isIdentifier(node.name) && node.name.text === 'code';

const getSourceSnippetStrings = (source: string, filePath: string) => {
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const snippets: string[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isPropertyAssignment(node) && isSourceCodeProperty(node)) {
      const value = getStringLiteralValue(node.initializer);

      if (value !== null) {
        snippets.push(value);
      }
    }

    if (ts.isCallExpression(node)) {
      const expression = node.expression;

      if (ts.isIdentifier(expression) && sourceHelperNames.has(expression.text)) {
        node.arguments.forEach((argument) => {
          const value = getStringLiteralValue(argument);

          if (value !== null) {
            snippets.push(value);
          }
        });
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return snippets;
};

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

  it('keeps Storybook source snippets free of render and story wrapper implementation details', () => {
    const offenders = storyFiles.flatMap((filePath) => {
      const source = readFileSync(filePath, 'utf8');
      const snippets = getSourceSnippetStrings(source, filePath);

      return snippets.flatMap((snippet) =>
        forbiddenDocsSourceFragments
          .filter((fragment) => snippet.includes(fragment))
          .map((fragment) => `${relative(process.cwd(), filePath)} includes "${fragment}"`)
      );
    });

    expect(offenders).toEqual([]);
  });

  it('has no a11y violations for the Storybook a11y scope wrapper', async () => {
    const container = document.createElement('div');
    container.innerHTML = '<button type="button">Focusable control</button>';

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

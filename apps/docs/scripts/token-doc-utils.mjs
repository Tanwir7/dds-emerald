import { readFileSync } from 'node:fs';

export const tokensPath = new URL('../../../packages/tokens/src/tokens.css', import.meta.url);

export const readTokensCss = () => readFileSync(tokensPath, 'utf8');

export const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '');

export const extractBlock = (source, selector) => {
  const selectorIndex = source.indexOf(selector);

  if (selectorIndex === -1) {
    throw new Error(`Unable to find selector "${selector}" in tokens.css.`);
  }

  const blockStart = source.indexOf('{', selectorIndex);

  if (blockStart === -1) {
    throw new Error(`Unable to find opening brace for selector "${selector}" in tokens.css.`);
  }

  let depth = 0;

  for (let index = blockStart; index < source.length; index += 1) {
    const character = source[index];

    if (character === '{') {
      depth += 1;
    } else if (character === '}') {
      depth -= 1;
    }

    if (depth === 0) {
      return source.slice(blockStart + 1, index);
    }
  }

  throw new Error(`Unable to find closing brace for selector "${selector}" in tokens.css.`);
};

export const normalizeValue = (value) => value.replace(/\s+/g, ' ').trim();

export const extractDeclarations = (block) => {
  const declarations = [];
  const declarationPattern = /(--dds-[\w-]+)\s*:\s*([^;]+);/g;
  let match;

  while ((match = declarationPattern.exec(block)) !== null) {
    declarations.push({
      name: match[1],
      value: normalizeValue(match[2]),
    });
  }

  return declarations;
};

export const createDeclarationMap = (declarationList) =>
  new Map(declarationList.map((declaration) => [declaration.name, declaration.value]));

export const resolveTokenValue = (value, tokenMap, seen = new Set()) =>
  value.replace(/var\(\s*(--dds-[\w-]+)\s*\)/g, (match, tokenName) => {
    if (seen.has(tokenName) || !tokenMap.has(tokenName)) {
      return match;
    }

    seen.add(tokenName);
    return resolveTokenValue(tokenMap.get(tokenName), tokenMap, seen);
  });

export const parseTokensCss = () => {
  const cssWithoutComments = stripComments(readTokensCss());
  const rootBlock = extractBlock(cssWithoutComments, ':root');
  const darkBlock = extractBlock(cssWithoutComments, "[data-theme='dark']");
  const declarations = extractDeclarations(rootBlock);
  const darkDeclarations = extractDeclarations(darkBlock);
  const rootTokenMap = createDeclarationMap(declarations);
  const darkTokenMap = new Map([...rootTokenMap, ...createDeclarationMap(darkDeclarations)]);

  return {
    declarations,
    darkDeclarations,
    rootTokenMap,
    darkTokenMap,
    tokenNames: new Set(declarations.map((declaration) => declaration.name)),
  };
};

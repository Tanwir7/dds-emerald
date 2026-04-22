export type StorySourceParameters = {
  docs: {
    source: StorySourceBlock;
  };
};

export type StorySourceBlock = {
  code: string;
};

export const storySource = (...lines: string[]) => lines.join('\n');

export const indentStorySource = (source: string, spaces = 2) => {
  const indentation = ' '.repeat(spaces);

  return source
    .split('\n')
    .map((line) => (line.length > 0 ? `${indentation}${line}` : line))
    .join('\n');
};

export const storySourceFragment = (...snippets: string[]) =>
  storySource('<>', ...snippets.map((snippet) => indentStorySource(snippet)), '</>');

export const storySourceBlock = (code: string): StorySourceBlock => ({ code });

export const storySourceParameters = (code: string): StorySourceParameters => ({
  docs: {
    source: storySourceBlock(code),
  },
});

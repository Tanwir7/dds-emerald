import { describe, expect, it } from 'vitest';
import {
  indentStorySource,
  storySource,
  storySourceBlock,
  storySourceFragment,
  storySourceParameters,
} from './storySource';

describe('storySource', () => {
  it('joins source lines with newlines', () => {
    expect(storySource('<Button>', '  Save', '</Button>')).toBe('<Button>\n  Save\n</Button>');
  });

  it('indents non-empty source lines', () => {
    expect(indentStorySource('<Text>One</Text>\n\n<Text>Two</Text>')).toBe(
      '  <Text>One</Text>\n\n  <Text>Two</Text>'
    );
  });

  it('wraps multiple snippets in a fragment', () => {
    expect(storySourceFragment('<Badge>One</Badge>', '<Badge>Two</Badge>')).toBe(
      '<>\n  <Badge>One</Badge>\n  <Badge>Two</Badge>\n</>'
    );
  });

  it('creates Storybook docs source parameters', () => {
    expect(storySourceParameters('<Input />')).toEqual({
      docs: {
        source: {
          code: '<Input />',
        },
      },
    });
  });

  it('creates a Storybook docs source block', () => {
    expect(storySourceBlock('<Image />')).toEqual({
      code: '<Image />',
    });
  });
});

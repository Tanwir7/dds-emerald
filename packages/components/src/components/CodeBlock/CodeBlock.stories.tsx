import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CodeBlock } from './CodeBlock';
import storyStyles from './CodeBlock.stories.module.scss';
import { Heading } from '../Heading';
import { Text } from '../Text';
import { storySource, storySourceParameters } from '../../utils/storySource';

const longFile = Array.from({ length: 86 }, (_, index) => {
  const lineNumber = index + 1;

  return `export const item${lineNumber} = 'line-${lineNumber}';`;
}).join('\n');

const defaultSnippet = `import { CodeBlock } from '@dds/emerald';

export function Example() {
  return <CodeBlock code="pnpm lint" />;
}`;

const highlightedSnippet =
  '<span class="token keyword">import</span> <span class="token punctuation">{</span> <span class="token function">CodeBlock</span> <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">\'@dds/emerald\'</span><span class="token punctuation">;</span>';

const meta: Meta<typeof CodeBlock> = {
  title: 'Core Components/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof CodeBlock>) => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyPanel}>
        <CodeBlock {...args} />
      </div>
    </div>
  ),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  args: {
    code: defaultSnippet,
    showCopyButton: true,
    showLineNumbers: false,
    wrapLong: false,
  },
  argTypes: {
    showLineNumbers: {
      control: 'boolean',
    },
    showCopyButton: {
      control: 'boolean',
    },
    wrapLong: {
      control: 'boolean',
    },
  },
};

export default meta;

type Story = StoryObj<typeof CodeBlock>;

export const Default: Story = {
  parameters: storySourceParameters(
    storySource(
      '<CodeBlock',
      "  code={`import { CodeBlock } from '@dds/emerald';",
      '',
      'export function Example() {',
      '  return <CodeBlock code="pnpm lint" />;',
      '}`}',
      '/>'
    )
  ),
};

export const WithLanguage: Story = {
  args: {
    language: 'typescript',
  },
  parameters: storySourceParameters(
    storySource('<CodeBlock code={snippet} language="typescript" />')
  ),
};

export const HighlightedHtml: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyPanel}>
        <div className={storyStyles.storyHighlightedScope}>
          <CodeBlock highlightedHtml={highlightedSnippet} language="typescript" />
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<CodeBlock',
      '  highlightedHtml={highlightedSnippet}',
      '  language="typescript"',
      '/>'
    )
  ),
};

export const WithLineNumbers: Story = {
  args: {
    language: 'typescript',
    showLineNumbers: true,
  },
  parameters: storySourceParameters(
    storySource('<CodeBlock code={snippet} language="typescript" showLineNumbers />')
  ),
};

export const BashSnippet: Story = {
  args: {
    code: 'pnpm add @dds/emerald @dds/emerald-tokens',
    language: 'bash',
  },
  parameters: storySourceParameters(
    storySource('<CodeBlock code="pnpm add @dds/emerald @dds/emerald-tokens" language="bash" />')
  ),
};

export const MaxHeight: Story = {
  args: {
    code: longFile,
    language: 'typescript',
    maxHeight: '200px',
  },
  parameters: storySourceParameters(
    storySource('<CodeBlock code={longFile} language="typescript" maxHeight="200px" />')
  ),
};

export const WrapLong: Story = {
  args: {
    code: "const endpoint = 'https://api.digitaldevstudio.example/v1/components/code-block/very/long/path/that/needs/wrapping/to/stay/visible/in/narrow/layouts';",
    language: 'typescript',
    wrapLong: true,
  },
  parameters: storySourceParameters(
    storySource('<CodeBlock code={longLine} language="typescript" wrapLong />')
  ),
};

export const NoCopyButton: Story = {
  args: {
    language: 'typescript',
    showCopyButton: false,
  },
  parameters: storySourceParameters(
    storySource('<CodeBlock code={snippet} language="typescript" showCopyButton={false} />')
  ),
};

export const LongFile: Story = {
  args: {
    code: longFile,
    language: 'typescript',
    maxHeight: '280px',
    showLineNumbers: true,
  },
  parameters: storySourceParameters(
    storySource(
      '<CodeBlock',
      '  code={longFile}',
      '  language="typescript"',
      '  showLineNumbers',
      '  maxHeight="280px"',
      '/>'
    )
  ),
};

export const InDocs: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyDocsLayout}>
        <Heading size="3xl">Rendering plain code snippets</Heading>
        <Text>
          CodeBlock renders preformatted code only. Syntax highlighting is intentionally left to
          consumers so the design system does not bundle a highlighting runtime. For richer output,
          pass pre-highlighted markup through the highlightedHtml prop.
        </Text>
        <CodeBlock code={defaultSnippet} language="typescript" showLineNumbers />
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<>',
      '  <Heading size="md">Rendering plain code snippets</Heading>',
      '  <Text>',
      '    CodeBlock renders preformatted code only. Syntax highlighting is intentionally left to',
      '    consumers so the design system does not bundle a highlighting runtime.',
      '  </Text>',
      '  <CodeBlock code={snippet} language="typescript" showLineNumbers />',
      '</>'
    )
  ),
};

export const CopyCode: Story = {
  args: {
    code: defaultSnippet,
    language: 'typescript',
  },
  parameters: storySourceParameters(
    storySource('<CodeBlock code={snippet} language="typescript" />')
  ),
  play: async ({ canvasElement }) => {
    const existingClipboard = globalThis.navigator.clipboard ?? {};

    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: {
        ...existingClipboard,
        writeText: async () => undefined,
      },
    });
    const copyBtn = within(canvasElement).getByRole('button', { name: /copy code/i });
    await userEvent.click(copyBtn);
    await waitFor(() => {
      expect(within(canvasElement).getByText('Copied!')).toBeInTheDocument();
    });
  },
};

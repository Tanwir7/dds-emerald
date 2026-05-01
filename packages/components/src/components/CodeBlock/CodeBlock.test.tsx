import { createRef } from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import styles from './CodeBlock.module.scss';
import { CodeBlock } from './CodeBlock';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  wrapLong: getRequiredClassName(styles, 'wrapLong'),
  header: getRequiredClassName(styles, 'header'),
  language: getRequiredClassName(styles, 'language'),
  copyBtn: getRequiredClassName(styles, 'copyBtn'),
  lineNumbers: getRequiredClassName(styles, 'lineNumbers'),
  lineNumber: getRequiredClassName(styles, 'lineNumber'),
  scrollbar: getRequiredClassName(styles, 'scrollbar'),
  srOnly: getRequiredClassName(styles, 'srOnly'),
} as const;

const sampleCode = `const status = 'ready';
console.log(status);`;
const highlightedHtml =
  '<span class="token keyword">const</span> <span class="token variable">status</span> = <span class="token string">\'ready\'</span>;';

beforeAll(() => {
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ??
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const mockClipboard = () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  Object.defineProperty(globalThis.navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText,
    },
  });

  return writeText;
};

describe('CodeBlock', () => {
  it('renders root div', () => {
    const { container } = render(<CodeBlock code={sampleCode} />);

    expect(container.firstElementChild).toBeInstanceOf(HTMLDivElement);
    expect(container.firstElementChild).toHaveClass(classNames.root);
  });

  it('renders <pre> element', () => {
    const { container } = render(<CodeBlock code={sampleCode} />);

    expect(container.querySelector('pre')).toBeInTheDocument();
  });

  it('renders <code> element with the code string', () => {
    const { container } = render(<CodeBlock code={sampleCode} />);
    const code = container.querySelector('code');

    expect(code?.textContent).toBe(sampleCode);
    expect(code?.tagName).toBe('CODE');
  });

  it('renders highlighted HTML when provided', () => {
    const { container } = render(
      <CodeBlock highlightedHtml={highlightedHtml} language="typescript" />
    );
    const code = container.querySelector('code');

    expect(code?.innerHTML).toContain('token keyword');
    expect(code?.textContent).toBe("const status = 'ready';");
  });

  it('forwards className to root', () => {
    const { container } = render(<CodeBlock code={sampleCode} className="custom-root" />);

    expect(container.firstElementChild).toHaveClass('custom-root');
  });

  it('forwards ref to root HTMLDivElement', () => {
    const ref = createRef<HTMLDivElement>();

    render(<CodeBlock ref={ref} code={sampleCode} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('header is not rendered when no language and showCopyButton is false', () => {
    const { container } = render(<CodeBlock code={sampleCode} showCopyButton={false} />);

    expect(container.querySelector(`.${classNames.header}`)).not.toBeInTheDocument();
  });

  it('header is rendered when language is provided', () => {
    const { container } = render(
      <CodeBlock code={sampleCode} language="typescript" showCopyButton={false} />
    );

    expect(container.querySelector(`.${classNames.header}`)).toBeInTheDocument();
  });

  it('header is rendered when showCopyButton is true by default', () => {
    const { container } = render(<CodeBlock code={sampleCode} />);

    expect(container.querySelector(`.${classNames.header}`)).toBeInTheDocument();
  });

  it('renders language label when language is provided', () => {
    render(<CodeBlock code={sampleCode} language="typescript" />);

    expect(screen.getByText('typescript')).toHaveClass(classNames.language);
  });

  it('does not render language label when language is omitted', () => {
    const { container } = render(<CodeBlock code={sampleCode} />);

    expect(container.querySelector(`.${classNames.language}`)).not.toBeInTheDocument();
  });

  it('renders copy button by default', () => {
    render(<CodeBlock code={sampleCode} />);

    expect(screen.getByRole('button', { name: /copy code/i })).toHaveClass(classNames.copyBtn);
  });

  it('copy button has aria-label="Copy code"', () => {
    render(<CodeBlock code={sampleCode} />);

    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
  });

  it('does not render copy button when showCopyButton is false', () => {
    render(<CodeBlock code={sampleCode} showCopyButton={false} />);

    expect(screen.queryByRole('button', { name: /copy code/i })).not.toBeInTheDocument();
  });

  it('clicking copy button calls navigator.clipboard.writeText with code string', async () => {
    const writeText = mockClipboard();

    render(<CodeBlock code={sampleCode} />);

    fireEvent.click(screen.getByRole('button', { name: /copy code/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(sampleCode);
    });
  });

  it('copy button label changes to "Copied!" after click', async () => {
    const user = userEvent.setup();
    mockClipboard();

    render(<CodeBlock code={sampleCode} />);

    await user.click(screen.getByRole('button', { name: /copy code/i }));

    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('onCopy is called with code string after click', async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    mockClipboard();

    render(<CodeBlock code={sampleCode} onCopy={onCopy} />);

    await user.click(screen.getByRole('button', { name: /copy code/i }));

    expect(onCopy).toHaveBeenCalledWith(sampleCode);
  });

  it('copies plain text from highlighted HTML', async () => {
    const writeText = mockClipboard();

    render(<CodeBlock highlightedHtml={highlightedHtml} language="typescript" />);

    fireEvent.click(screen.getByRole('button', { name: /copy code/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("const status = 'ready';");
    });
  });

  it('copy label reverts to "Copy" after 2000ms', async () => {
    mockClipboard();

    render(<CodeBlock code={sampleCode} />);

    fireEvent.click(screen.getByRole('button', { name: /copy code/i }));
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    await new Promise((resolve) => {
      window.setTimeout(resolve, 2100);
    });

    expect(screen.getByText('Copy')).toBeInTheDocument();
  }, 7000);

  it('live region announces "Code copied to clipboard" after copy', async () => {
    const user = userEvent.setup();
    mockClipboard();

    render(<CodeBlock code={sampleCode} />);

    await user.click(screen.getByRole('button', { name: /copy code/i }));

    expect(screen.getByRole('status')).toHaveTextContent('Code copied to clipboard');
  });

  it('live region is empty initially', () => {
    render(<CodeBlock code={sampleCode} />);

    expect(screen.getByRole('status')).toHaveTextContent('');
    expect(screen.getByRole('status')).toHaveClass(classNames.srOnly);
  });

  it('does not render line numbers by default', () => {
    const { container } = render(<CodeBlock code={sampleCode} />);

    expect(container.querySelector(`.${classNames.lineNumbers}`)).not.toBeInTheDocument();
  });

  it('renders line numbers when showLineNumbers is true', () => {
    const { container } = render(<CodeBlock code={sampleCode} showLineNumbers />);

    expect(container.querySelector(`.${classNames.lineNumbers}`)).toBeInTheDocument();
  });

  it('renders the correct number of line number spans', () => {
    const { container } = render(<CodeBlock code={sampleCode} showLineNumbers />);

    expect(container.querySelectorAll(`.${classNames.lineNumber}`)).toHaveLength(2);
  });

  it('line numbers have aria-hidden="true"', () => {
    const { container } = render(<CodeBlock code={sampleCode} showLineNumbers />);

    expect(container.querySelector(`.${classNames.lineNumbers}`)).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('does not set the max-height CSS variable by default', () => {
    const { container } = render(<CodeBlock code={sampleCode} />);
    const root = container.firstElementChild as HTMLDivElement;

    expect(root.style.getPropertyValue('--dds-code-block-max-height')).toBe('');
  });

  it('sets the max-height CSS variable when provided', () => {
    const { container } = render(<CodeBlock code={sampleCode} maxHeight="400px" />);
    const root = container.firstElementChild as HTMLDivElement;

    expect(root.style.getPropertyValue('--dds-code-block-max-height')).toBe('400px');
  });

  it('does not apply wrapLong class by default', () => {
    const { container } = render(<CodeBlock code={sampleCode} />);

    expect(container.firstElementChild).not.toHaveClass(classNames.wrapLong);
  });

  it('applies wrapLong class when wrapLong is true', () => {
    const { container } = render(<CodeBlock code={sampleCode} wrapLong />);

    expect(container.firstElementChild).toHaveClass(classNames.wrapLong);
  });

  it('renders horizontal scrollbar', () => {
    const { container } = render(<CodeBlock code={sampleCode} />);

    expect(container.querySelectorAll(`.${classNames.scrollbar}`)).toHaveLength(2);
  });

  it('renders vertical scrollbar', () => {
    const { container } = render(<CodeBlock code={sampleCode} />);

    expect(container.querySelectorAll(`.${classNames.scrollbar}`)).toHaveLength(2);
  });

  it('has no a11y violations for default render', async () => {
    const { container } = render(<CodeBlock code={sampleCode} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations with language label', async () => {
    const { container } = render(<CodeBlock code={sampleCode} language="typescript" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations with line numbers', async () => {
    const { container } = render(<CodeBlock code={sampleCode} showLineNumbers />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations without copy button', async () => {
    const { container } = render(<CodeBlock code={sampleCode} showCopyButton={false} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations after copy', async () => {
    const user = userEvent.setup();
    mockClipboard();
    const { container } = render(<CodeBlock code={sampleCode} />);

    await user.click(screen.getByRole('button', { name: /copy code/i }));

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations with highlighted HTML', async () => {
    const { container } = render(
      <CodeBlock highlightedHtml={highlightedHtml} language="typescript" />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

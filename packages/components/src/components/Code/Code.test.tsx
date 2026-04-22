import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import styles from './Code.module.scss';
import { Code } from './Code';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const rootClassName = getRequiredClassName(styles, 'root');
const blockClassName = getRequiredClassName(styles, 'block');
const sizeClassNames = {
  xs: getRequiredClassName(styles, 'xs'),
  sm: getRequiredClassName(styles, 'sm'),
  base: getRequiredClassName(styles, 'base'),
} as const;

const render = (ui: React.ReactNode) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  let root!: Root;
  act(() => {
    root = createRoot(container);
    root.render(ui);
  });

  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};

const getCodeByText = (text: string) => {
  const element = Array.from(document.querySelectorAll('code')).find(
    (candidate) => candidate.textContent === text
  );

  expect(element).toBeTruthy();
  return element as HTMLElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Code', () => {
  it('renders children inside <code> element by default', () => {
    render(<Code>const value = 1;</Code>);

    const code = getCodeByText('const value = 1;');

    expect(code).toBeInTheDocument();
    expect(code.tagName).toBe('CODE');
  });

  it('root element is <code> when block={false}', () => {
    const { container } = render(<Code>inline</Code>);

    expect(container.firstElementChild?.tagName).toBe('CODE');
    expect(container.querySelector('pre')).toBeNull();
  });

  it('renders <pre><code> when block={true}', () => {
    const { container } = render(<Code block>block</Code>);

    const pre = container.firstElementChild;
    const code = getCodeByText('block');

    expect(pre?.tagName).toBe('PRE');
    expect(pre?.firstElementChild).toBe(code);
    expect(code.tagName).toBe('CODE');
  });

  it('<pre> has tabIndex={0} when block={true}', () => {
    const { container } = render(<Code block>block</Code>);

    expect(container.querySelector('pre')).toHaveAttribute('tabIndex', '0');
  });

  it('forwards className', () => {
    render(<Code className="custom">content</Code>);

    expect(getCodeByText('content')).toHaveClass('custom');
  });

  it('forwards ref to <code> element', () => {
    const ref = React.createRef<HTMLElement>();

    render(<Code ref={ref}>content</Code>);

    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('CODE');
    expect(ref.current).toBe(getCodeByText('content'));
  });

  it('applies .xs size class when size="xs"', () => {
    render(<Code size="xs">content</Code>);

    expect(getCodeByText('content')).toHaveClass(sizeClassNames.xs);
  });

  it('applies .sm size class when size="sm" (default)', () => {
    render(<Code>content</Code>);

    expect(getCodeByText('content')).toHaveClass(sizeClassNames.sm);
  });

  it('applies .base size class when size="base"', () => {
    render(<Code size="base">content</Code>);

    expect(getCodeByText('content')).toHaveClass(sizeClassNames.base);
  });

  it('applies .block class to <code> when block={true}', () => {
    render(<Code block>content</Code>);

    expect(getCodeByText('content')).toHaveClass(blockClassName);
  });

  it('does not apply .block when block={false}', () => {
    render(<Code>content</Code>);

    expect(getCodeByText('content')).not.toHaveClass(blockClassName);
  });

  it('forwards arbitrary HTML props onto <code>', () => {
    render(
      <Code data-testid="code" title="Generated snippet">
        content
      </Code>
    );

    const code = document.querySelector('[data-testid="code"]');

    expect(code).toBe(getCodeByText('content'));
    expect(code).toHaveAttribute('title', 'Generated snippet');
  });

  it('has no a11y violations — inline', async () => {
    const { container } = render(<Code>{"const status = 'ready';"}</Code>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — block', async () => {
    const { container } = render(
      <Code block>{`function logStatus(status) {
  return status;
}`}</Code>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses the required code style tokens', () => {
    const stylesheet = readFileSync('src/components/Code/Code.module.scss', 'utf8');

    expect(stylesheet).toContain('font-family: var(--dds-font-mono);');
    expect(stylesheet).toContain('background-color: var(--dds-color-bg-muted);');
    expect(stylesheet).toContain('color: var(--dds-color-text-default);');
    expect(stylesheet).toContain('border: 1px solid var(--dds-color-border-default);');
    expect(stylesheet).toContain('border-radius: var(--dds-radius-none);');
  });

  it('does not use Tailwind classes in implementation or stories', () => {
    const component = readFileSync('src/components/Code/Code.tsx', 'utf8');
    const stories = readFileSync('src/components/Code/Code.stories.tsx', 'utf8');

    expect(component).not.toMatch(/className="[^"]*\b(?:h-|w-|bg-|text-|p-|px-|py-)/);
    expect(stories).not.toMatch(/className="[^"]*\b(?:h-|w-|bg-|text-|p-|px-|py-)/);
  });

  it('applies the root class to <code>', () => {
    render(<Code>content</Code>);

    expect(getCodeByText('content')).toHaveClass(rootClassName);
  });
});

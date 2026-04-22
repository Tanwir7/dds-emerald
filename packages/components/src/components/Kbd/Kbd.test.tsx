import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import styles from './Kbd.module.scss';
import { Kbd } from './Kbd';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const rootClassName = getRequiredClassName(styles, 'root');
const sizeClassNames = {
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

const getKbdByText = (text: string) => {
  const element = Array.from(document.querySelectorAll('kbd')).find(
    (candidate) => candidate.textContent === text
  );

  expect(element).toBeTruthy();
  return element as HTMLElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Kbd', () => {
  it('renders children inside <kbd> element', () => {
    render(<Kbd>⌘</Kbd>);

    const kbd = getKbdByText('⌘');

    expect(kbd).toBeInTheDocument();
    expect(kbd.tagName).toBe('KBD');
  });

  it('forwards className to root element', () => {
    render(<Kbd className="custom">content</Kbd>);

    expect(getKbdByText('content')).toHaveClass('custom');
  });

  it('forwards ref to HTMLElement <kbd>', () => {
    const ref = React.createRef<HTMLElement>();

    render(<Kbd ref={ref}>content</Kbd>);

    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('KBD');
    expect(ref.current).toBe(getKbdByText('content'));
  });

  it('applies .sm class by default when no size provided', () => {
    render(<Kbd>content</Kbd>);

    expect(getKbdByText('content')).toHaveClass(sizeClassNames.sm);
  });

  it('applies .sm class when size="sm"', () => {
    render(<Kbd size="sm">content</Kbd>);

    expect(getKbdByText('content')).toHaveClass(sizeClassNames.sm);
  });

  it('applies .base class when size="base"', () => {
    render(<Kbd size="base">content</Kbd>);

    expect(getKbdByText('content')).toHaveClass(sizeClassNames.base);
  });

  it('forwards arbitrary HTML props', () => {
    render(<Kbd data-testid="shortcut-key">content</Kbd>);

    expect(getKbdByText('content')).toHaveAttribute('data-testid', 'shortcut-key');
  });

  it('applies the root class to <kbd>', () => {
    render(<Kbd>content</Kbd>);

    expect(getKbdByText('content')).toHaveClass(rootClassName);
  });

  it('axe: passes for default render (sm)', async () => {
    const { container } = render(<Kbd>content</Kbd>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe: passes for size="base"', async () => {
    const { container } = render(<Kbd size="base">content</Kbd>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses the required keyboard style tokens', () => {
    const stylesheet = readFileSync('src/components/Kbd/Kbd.module.scss', 'utf8');

    expect(stylesheet).toContain('font-family: var(--dds-font-mono);');
    expect(stylesheet).toContain('background-color: var(--dds-color-bg-muted);');
    expect(stylesheet).toContain('color: var(--dds-color-text-default);');
    expect(stylesheet).toContain('border: 1px solid var(--dds-color-border-default);');
    expect(stylesheet).toContain('border-radius: var(--dds-radius-none);');
    expect(stylesheet).toContain('box-shadow: var(--dds-shadow-xs);');
  });

  it('does not use Tailwind classes in implementation or stories', () => {
    const component = readFileSync('src/components/Kbd/Kbd.tsx', 'utf8');
    const stories = readFileSync('src/components/Kbd/Kbd.stories.tsx', 'utf8');

    expect(component).not.toMatch(/className="[^"]*\b(?:h-|w-|bg-|text-|p-|px-|py-)/);
    expect(stories).not.toMatch(/className="[^"]*\b(?:h-|w-|bg-|text-|p-|px-|py-)/);
  });
});

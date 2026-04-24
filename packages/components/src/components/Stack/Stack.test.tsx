import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './Stack.module.scss';
import { Stack } from './Stack';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const rootClassName = getRequiredClassName(styles, 'root');

const directionClassNames = {
  vertical: getRequiredClassName(styles, 'vertical'),
  horizontal: getRequiredClassName(styles, 'horizontal'),
} as const;

const gapClassNames = {
  none: getRequiredClassName(styles, 'gapNone'),
  xs: getRequiredClassName(styles, 'gapXs'),
  sm: getRequiredClassName(styles, 'gapSm'),
  md: getRequiredClassName(styles, 'gapMd'),
  lg: getRequiredClassName(styles, 'gapLg'),
  xl: getRequiredClassName(styles, 'gapXl'),
} as const;

const alignClassNames = {
  start: getRequiredClassName(styles, 'alignStart'),
  center: getRequiredClassName(styles, 'alignCenter'),
  end: getRequiredClassName(styles, 'alignEnd'),
  stretch: getRequiredClassName(styles, 'alignStretch'),
  baseline: getRequiredClassName(styles, 'alignBaseline'),
} as const;

const justifyClassNames = {
  start: getRequiredClassName(styles, 'justifyStart'),
  center: getRequiredClassName(styles, 'justifyCenter'),
  end: getRequiredClassName(styles, 'justifyEnd'),
  between: getRequiredClassName(styles, 'justifyBetween'),
  around: getRequiredClassName(styles, 'justifyAround'),
  evenly: getRequiredClassName(styles, 'justifyEvenly'),
} as const;

const wrapClassName = getRequiredClassName(styles, 'wrap');
const inlineClassName = getRequiredClassName(styles, 'inline');

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

const getStack = (container: ParentNode = document) => {
  const element = container.querySelector(`.${rootClassName}`);

  expect(element).toBeTruthy();
  return element as HTMLElement;
};

const getSeparators = (container: ParentNode = document) =>
  Array.from(container.querySelectorAll('[role="separator"]')) as HTMLElement[];

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('Stack', () => {
  it('renders a <div> by default', () => {
    render(<Stack>content</Stack>);

    expect(getStack().tagName).toBe('DIV');
  });

  it('renders as <ul> when as="ul"', () => {
    render(
      <Stack as="ul">
        <li>One</li>
      </Stack>
    );

    expect(getStack().tagName).toBe('UL');
  });

  it('renders as <nav> when as="nav"', () => {
    render(
      <Stack as="nav" aria-label="Primary">
        content
      </Stack>
    );

    expect(getStack().tagName).toBe('NAV');
  });

  it('renders children', () => {
    render(
      <Stack>
        <span>content</span>
      </Stack>
    );

    expect(getStack()).toHaveTextContent('content');
  });

  it('forwards className to root element', () => {
    render(<Stack className="custom">content</Stack>);

    expect(getStack()).toHaveClass('custom');
  });

  it('forwards ref to root element', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<Stack ref={ref}>content</Stack>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(getStack());
  });

  it('applies vertical class by default', () => {
    render(<Stack>content</Stack>);

    expect(getStack()).toHaveClass(directionClassNames.vertical);
  });

  it('applies horizontal class when direction="horizontal"', () => {
    render(<Stack direction="horizontal">content</Stack>);

    expect(getStack()).toHaveClass(directionClassNames.horizontal);
  });

  it('applies gapMd class by default', () => {
    render(<Stack>content</Stack>);

    expect(getStack()).toHaveClass(gapClassNames.md);
  });

  it('applies gapNone when gap="none"', () => {
    render(<Stack gap="none">content</Stack>);

    expect(getStack()).toHaveClass(gapClassNames.none);
  });

  it('applies gapXs when gap="xs"', () => {
    render(<Stack gap="xs">content</Stack>);

    expect(getStack()).toHaveClass(gapClassNames.xs);
  });

  it('applies gapSm when gap="sm"', () => {
    render(<Stack gap="sm">content</Stack>);

    expect(getStack()).toHaveClass(gapClassNames.sm);
  });

  it('applies gapLg when gap="lg"', () => {
    render(<Stack gap="lg">content</Stack>);

    expect(getStack()).toHaveClass(gapClassNames.lg);
  });

  it('applies gapXl when gap="xl"', () => {
    render(<Stack gap="xl">content</Stack>);

    expect(getStack()).toHaveClass(gapClassNames.xl);
  });

  it('applies alignStretch by default for vertical direction', () => {
    render(<Stack>content</Stack>);

    expect(getStack()).toHaveClass(alignClassNames.stretch);
  });

  it('applies alignCenter by default for horizontal direction', () => {
    render(<Stack direction="horizontal">content</Stack>);

    expect(getStack()).toHaveClass(alignClassNames.center);
  });

  it('applies alignStart when align="start"', () => {
    render(<Stack align="start">content</Stack>);

    expect(getStack()).toHaveClass(alignClassNames.start);
  });

  it('applies alignEnd when align="end"', () => {
    render(<Stack align="end">content</Stack>);

    expect(getStack()).toHaveClass(alignClassNames.end);
  });

  it('applies alignBaseline when align="baseline"', () => {
    render(<Stack align="baseline">content</Stack>);

    expect(getStack()).toHaveClass(alignClassNames.baseline);
  });

  it('applies justifyStart by default', () => {
    render(<Stack>content</Stack>);

    expect(getStack()).toHaveClass(justifyClassNames.start);
  });

  it('applies justifyCenter when justify="center"', () => {
    render(<Stack justify="center">content</Stack>);

    expect(getStack()).toHaveClass(justifyClassNames.center);
  });

  it('applies justifyBetween when justify="between"', () => {
    render(<Stack justify="between">content</Stack>);

    expect(getStack()).toHaveClass(justifyClassNames.between);
  });

  it('applies justifyEnd when justify="end"', () => {
    render(<Stack justify="end">content</Stack>);

    expect(getStack()).toHaveClass(justifyClassNames.end);
  });

  it('does not apply wrap by default', () => {
    render(<Stack>content</Stack>);

    expect(getStack()).not.toHaveClass(wrapClassName);
  });

  it('applies wrap when wrap is true', () => {
    render(<Stack wrap>content</Stack>);

    expect(getStack()).toHaveClass(wrapClassName);
  });

  it('does not apply inline by default', () => {
    render(<Stack>content</Stack>);

    expect(getStack()).not.toHaveClass(inlineClassName);
  });

  it('applies inline when inline is true', () => {
    render(<Stack inline>content</Stack>);

    expect(getStack()).toHaveClass(inlineClassName);
  });

  it('does not render separators by default', () => {
    render(
      <Stack>
        <span>One</span>
        <span>Two</span>
      </Stack>
    );

    expect(getSeparators()).toHaveLength(0);
  });

  it('renders n-1 separators between n children when dividers is true', () => {
    render(
      <Stack dividers>
        <span>One</span>
        <span>Two</span>
        <span>Three</span>
      </Stack>
    );

    expect(getSeparators()).toHaveLength(2);
  });

  it('uses horizontal separators for vertical stacks with dividers', () => {
    render(
      <Stack dividers>
        <span>One</span>
        <span>Two</span>
      </Stack>
    );

    expect(getSeparators()[0]).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('uses vertical separators for horizontal stacks with dividers', () => {
    render(
      <Stack direction="horizontal" dividers>
        <span>One</span>
        <span>Two</span>
      </Stack>
    );

    expect(getSeparators()[0]).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('does not render a separator before the first child', () => {
    render(
      <Stack dividers>
        <span data-testid="first">One</span>
        <span>Two</span>
      </Stack>
    );

    expect(getStack().firstElementChild).toHaveAttribute('data-testid', 'first');
  });

  it('does not render a separator after the last child', () => {
    render(
      <Stack dividers>
        <span>One</span>
        <span data-testid="last">Two</span>
      </Stack>
    );

    expect(getStack().lastElementChild).toHaveAttribute('data-testid', 'last');
  });

  it('forwards id, aria-label, and data-testid', () => {
    render(
      <Stack id="stack-id" aria-label="Stack region" data-testid="stack">
        content
      </Stack>
    );

    const stack = getStack();

    expect(stack).toHaveAttribute('id', 'stack-id');
    expect(stack).toHaveAttribute('aria-label', 'Stack region');
    expect(stack).toHaveAttribute('data-testid', 'stack');
  });

  it('forwards onClick', () => {
    const onClick = vi.fn();

    render(<Stack onClick={onClick}>content</Stack>);

    act(() => {
      getStack().click();
    });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has no a11y violations — vertical stack', async () => {
    const { container } = render(
      <Stack>
        <span>One</span>
        <span>Two</span>
      </Stack>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — horizontal stack', async () => {
    const { container } = render(
      <Stack direction="horizontal">
        <span>One</span>
        <span>Two</span>
      </Stack>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — with dividers', async () => {
    const { container } = render(
      <Stack dividers>
        <span>One</span>
        <span>Two</span>
      </Stack>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — nav with aria-label', async () => {
    const { container } = render(
      <Stack as="nav" aria-label="Secondary">
        <a href="#one">One</a>
        <a href="#two">Two</a>
      </Stack>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — ul with li children', async () => {
    const { container } = render(
      <Stack as="ul">
        <li>One</li>
        <li>Two</li>
      </Stack>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses token-backed gap values and required flex containment styles', () => {
    const stylesheet = readFileSync('src/components/Stack/Stack.module.scss', 'utf8');

    expect(stylesheet).toContain('display: flex;');
    expect(stylesheet).toContain('box-sizing: border-box;');
    expect(stylesheet).toContain('min-width: 0;');
    expect(stylesheet).toContain('gap: var(--dds-space-1);');
    expect(stylesheet).toContain('gap: var(--dds-space-2);');
    expect(stylesheet).toContain('gap: var(--dds-space-4);');
    expect(stylesheet).toContain('gap: var(--dds-space-6);');
    expect(stylesheet).toContain('gap: var(--dds-space-8);');
  });
});

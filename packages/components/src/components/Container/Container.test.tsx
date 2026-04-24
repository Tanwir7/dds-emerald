import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './Container.module.scss';
import { Container } from './Container';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const rootClassName = getRequiredClassName(styles, 'root');

const paddingClassNames = {
  none: getRequiredClassName(styles, 'pNone'),
  xs: getRequiredClassName(styles, 'pXs'),
  sm: getRequiredClassName(styles, 'pSm'),
  md: getRequiredClassName(styles, 'pMd'),
  lg: getRequiredClassName(styles, 'pLg'),
  xl: getRequiredClassName(styles, 'pXl'),
} as const;

const paddingXClassNames = {
  none: getRequiredClassName(styles, 'pxNone'),
  xs: getRequiredClassName(styles, 'pxXs'),
  sm: getRequiredClassName(styles, 'pxSm'),
  md: getRequiredClassName(styles, 'pxMd'),
  lg: getRequiredClassName(styles, 'pxLg'),
  xl: getRequiredClassName(styles, 'pxXl'),
} as const;

const paddingYClassNames = {
  none: getRequiredClassName(styles, 'pyNone'),
  xs: getRequiredClassName(styles, 'pyXs'),
  sm: getRequiredClassName(styles, 'pySm'),
  md: getRequiredClassName(styles, 'pyMd'),
  lg: getRequiredClassName(styles, 'pyLg'),
  xl: getRequiredClassName(styles, 'pyXl'),
} as const;

const backgroundClassNames = {
  default: getRequiredClassName(styles, 'bgDefault'),
  subtle: getRequiredClassName(styles, 'bgSubtle'),
  card: getRequiredClassName(styles, 'bgCard'),
  muted: getRequiredClassName(styles, 'bgMuted'),
} as const;

const borderClassName = getRequiredClassName(styles, 'border');
const radiusClassNames = {
  none: getRequiredClassName(styles, 'radiusNone'),
  full: getRequiredClassName(styles, 'radiusFull'),
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

const getContainer = (text = 'content') => {
  const element = Array.from(document.querySelectorAll(`.${rootClassName}`)).find(
    (candidate) => candidate.textContent === text
  );

  expect(element).toBeTruthy();
  return element as HTMLElement;
};

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('Container', () => {
  it('renders a <div> by default', () => {
    render(<Container>content</Container>);

    expect(getContainer().tagName).toBe('DIV');
  });

  it('renders as <section> when as="section"', () => {
    render(<Container as="section">content</Container>);

    expect(getContainer().tagName).toBe('SECTION');
  });

  it('renders as <article> when as="article"', () => {
    render(<Container as="article">content</Container>);

    expect(getContainer().tagName).toBe('ARTICLE');
  });

  it('renders as <span> when as="span"', () => {
    render(<Container as="span">content</Container>);

    expect(getContainer().tagName).toBe('SPAN');
  });

  it('renders as <main> when as="main"', () => {
    render(<Container as="main">content</Container>);

    expect(getContainer().tagName).toBe('MAIN');
  });

  it('renders children', () => {
    render(<Container>content</Container>);

    expect(getContainer()).toBeInTheDocument();
  });

  it('forwards className to the root element', () => {
    render(<Container className="custom">content</Container>);

    expect(getContainer()).toHaveClass('custom');
  });

  it('forwards ref to HTMLDivElement', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<Container ref={ref}>content</Container>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(getContainer());
  });

  it('renders via Slot when asChild is true', () => {
    render(
      <Container asChild padding="md">
        <a href="/docs">content</a>
      </Container>
    );

    const link = document.querySelector('a');

    expect(link).toBeTruthy();
    expect(link).toHaveClass(rootClassName);
    expect(link).toHaveClass(paddingClassNames.md);
    expect(document.querySelector('div')).not.toHaveClass(rootClassName);
  });

  it('does not apply a padding class when padding is omitted', () => {
    render(<Container>content</Container>);

    expect(getContainer()).not.toHaveClass(paddingClassNames.none);
    expect(getContainer()).not.toHaveClass(paddingClassNames.xs);
    expect(getContainer()).not.toHaveClass(paddingClassNames.sm);
    expect(getContainer()).not.toHaveClass(paddingClassNames.md);
    expect(getContainer()).not.toHaveClass(paddingClassNames.lg);
    expect(getContainer()).not.toHaveClass(paddingClassNames.xl);
  });

  it('applies pXs when padding="xs"', () => {
    render(<Container padding="xs">content</Container>);

    expect(getContainer()).toHaveClass(paddingClassNames.xs);
  });

  it('applies pSm when padding="sm"', () => {
    render(<Container padding="sm">content</Container>);

    expect(getContainer()).toHaveClass(paddingClassNames.sm);
  });

  it('applies pMd when padding="md"', () => {
    render(<Container padding="md">content</Container>);

    expect(getContainer()).toHaveClass(paddingClassNames.md);
  });

  it('applies pLg when padding="lg"', () => {
    render(<Container padding="lg">content</Container>);

    expect(getContainer()).toHaveClass(paddingClassNames.lg);
  });

  it('applies pXl when padding="xl"', () => {
    render(<Container padding="xl">content</Container>);

    expect(getContainer()).toHaveClass(paddingClassNames.xl);
  });

  it('applies pNone when padding="none"', () => {
    render(<Container padding="none">content</Container>);

    expect(getContainer()).toHaveClass(paddingClassNames.none);
  });

  it('applies pxMd when paddingX="md"', () => {
    render(<Container paddingX="md">content</Container>);

    expect(getContainer()).toHaveClass(paddingXClassNames.md);
  });

  it('applies pyMd when paddingY="md"', () => {
    render(<Container paddingY="md">content</Container>);

    expect(getContainer()).toHaveClass(paddingYClassNames.md);
  });

  it('applies both padding and paddingX classes when both are set', () => {
    render(
      <Container padding="lg" paddingX="md">
        content
      </Container>
    );

    expect(getContainer()).toHaveClass(paddingClassNames.lg);
    expect(getContainer()).toHaveClass(paddingXClassNames.md);
  });

  it('does not apply a background class when background is omitted', () => {
    render(<Container>content</Container>);

    expect(getContainer()).not.toHaveClass(backgroundClassNames.default);
    expect(getContainer()).not.toHaveClass(backgroundClassNames.subtle);
    expect(getContainer()).not.toHaveClass(backgroundClassNames.card);
    expect(getContainer()).not.toHaveClass(backgroundClassNames.muted);
  });

  it('applies bgDefault when background="default"', () => {
    render(<Container background="default">content</Container>);

    expect(getContainer()).toHaveClass(backgroundClassNames.default);
  });

  it('applies bgSubtle when background="subtle"', () => {
    render(<Container background="subtle">content</Container>);

    expect(getContainer()).toHaveClass(backgroundClassNames.subtle);
  });

  it('applies bgCard when background="card"', () => {
    render(<Container background="card">content</Container>);

    expect(getContainer()).toHaveClass(backgroundClassNames.card);
  });

  it('applies bgMuted when background="muted"', () => {
    render(<Container background="muted">content</Container>);

    expect(getContainer()).toHaveClass(backgroundClassNames.muted);
  });

  it('does not apply the border class by default', () => {
    render(<Container>content</Container>);

    expect(getContainer()).not.toHaveClass(borderClassName);
  });

  it('does not apply the border class when border is false', () => {
    render(<Container border={false}>content</Container>);

    expect(getContainer()).not.toHaveClass(borderClassName);
  });

  it('applies the border class when border is true', () => {
    render(<Container border>content</Container>);

    expect(getContainer()).toHaveClass(borderClassName);
  });

  it('does not apply a radius class when borderRadius is omitted', () => {
    render(<Container>content</Container>);

    expect(getContainer()).not.toHaveClass(radiusClassNames.none);
    expect(getContainer()).not.toHaveClass(radiusClassNames.full);
  });

  it('applies radiusNone when borderRadius="none"', () => {
    render(<Container borderRadius="none">content</Container>);

    expect(getContainer()).toHaveClass(radiusClassNames.none);
  });

  it('applies radiusFull when borderRadius="full"', () => {
    render(<Container borderRadius="full">content</Container>);

    expect(getContainer()).toHaveClass(radiusClassNames.full);
  });

  it('forwards id, role, aria-label, and data-testid', () => {
    render(
      <Container
        id="container-id"
        role="region"
        aria-label="Container region"
        data-testid="container"
      >
        content
      </Container>
    );

    const container = getContainer();

    expect(container).toHaveAttribute('id', 'container-id');
    expect(container).toHaveAttribute('role', 'region');
    expect(container).toHaveAttribute('aria-label', 'Container region');
    expect(container).toHaveAttribute('data-testid', 'container');
  });

  it('forwards onClick handler', () => {
    const onClick = vi.fn();

    render(<Container onClick={onClick}>content</Container>);

    act(() => {
      getContainer().click();
    });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards arbitrary HTML attributes', () => {
    render(
      <Container title="Additional context" lang="en">
        content
      </Container>
    );

    const container = getContainer();

    expect(container).toHaveAttribute('title', 'Additional context');
    expect(container).toHaveAttribute('lang', 'en');
  });

  it('has no a11y violations — default render', async () => {
    const { container } = render(<Container>content</Container>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — section with aria-label', async () => {
    const { container } = render(
      <Container as="section" aria-label="Product metrics">
        content
      </Container>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — nav with aria-label', async () => {
    const { container } = render(
      <Container as="nav" aria-label="Secondary">
        content
      </Container>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — with background and border', async () => {
    const { container } = render(
      <Container padding="md" background="card" border>
        content
      </Container>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses only token-backed spacing, background, border, and radius values', () => {
    const stylesheet = readFileSync('src/components/Container/Container.module.scss', 'utf8');

    expect(stylesheet).toContain('padding: var(--dds-space-2);');
    expect(stylesheet).toContain('padding: var(--dds-space-3);');
    expect(stylesheet).toContain('padding: var(--dds-space-4);');
    expect(stylesheet).toContain('padding: var(--dds-space-6);');
    expect(stylesheet).toContain('padding: var(--dds-space-8);');
    expect(stylesheet).toContain('background-color: var(--dds-color-bg-default);');
    expect(stylesheet).toContain('background-color: var(--dds-color-bg-subtle);');
    expect(stylesheet).toContain('background-color: var(--dds-color-bg-card);');
    expect(stylesheet).toContain('background-color: var(--dds-color-bg-muted);');
    expect(stylesheet).toContain('border: 1px solid var(--dds-color-border-default);');
    expect(stylesheet).toContain('border-radius: var(--dds-radius-none);');
    expect(stylesheet).toContain('border-radius: var(--dds-radius-full);');
  });

  it('does not set display on the root class', () => {
    const stylesheet = readFileSync('src/components/Container/Container.module.scss', 'utf8');

    expect(stylesheet).not.toContain('display:');
  });
});

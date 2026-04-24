import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { getByRole } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { Search, X } from 'lucide-react';
import { Icon } from './Icon';
import styles from './Icon.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const rootClassName = getRequiredClassName(styles, 'root');
const sizeClassNames = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
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

const getRoot = () => {
  const root = document.querySelector('span');

  expect(root).toBeTruthy();
  return root as HTMLSpanElement;
};

const getSvg = () => {
  const svg = document.querySelector('svg');

  expect(svg).toBeTruthy();
  return svg as SVGSVGElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Icon', () => {
  it('renders a <span> wrapper', () => {
    const { container } = render(<Icon icon={Search} />);

    expect(container.firstElementChild?.tagName).toBe('SPAN');
    expect(getRoot()).toHaveClass(rootClassName);
  });

  it('renders the Lucide icon SVG inside the span', () => {
    render(<Icon icon={Search} />);

    expect(getRoot().firstElementChild).toBe(getSvg());
    expect(getSvg().tagName).toBe('svg');
  });

  it('forwards className', () => {
    render(<Icon icon={Search} className="custom" />);

    expect(getRoot()).toHaveClass('custom');
  });

  it('forwards ref to HTMLSpanElement', () => {
    const ref = React.createRef<HTMLSpanElement>();

    render(<Icon ref={ref} icon={Search} />);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toBe(getRoot());
  });

  it('applies .md class by default', () => {
    render(<Icon icon={Search} />);

    expect(getRoot()).toHaveClass(sizeClassNames.md);
  });

  it('applies .sm class when size="sm"', () => {
    render(<Icon icon={Search} size="sm" />);

    expect(getRoot()).toHaveClass(sizeClassNames.sm);
  });

  it('applies .lg class when size="lg"', () => {
    render(<Icon icon={Search} size="lg" />);

    expect(getRoot()).toHaveClass(sizeClassNames.lg);
  });

  it('marks the SVG decorative when no label prop is provided', () => {
    render(<Icon icon={Search} />);

    expect(getSvg()).toHaveAttribute('aria-hidden', 'true');
    expect(getSvg()).not.toHaveAttribute('role');
    expect(getSvg()).not.toHaveAttribute('aria-label');
  });

  it('gives the SVG role="img" and aria-label when label is provided', () => {
    render(<Icon icon={X} label="Close" />);

    const svg = getByRole(document.body, 'img', { name: 'Close' });

    expect(svg).toBe(getSvg());
    expect(svg).toHaveAttribute('aria-label', 'Close');
    expect(svg).not.toHaveAttribute('aria-hidden');
  });

  it('forwards arbitrary HTML props to the span', () => {
    render(<Icon icon={Search} data-testid="search-icon" title="Search" />);

    expect(getRoot()).toHaveAttribute('data-testid', 'search-icon');
    expect(getRoot()).toHaveAttribute('title', 'Search');
  });

  it('forwards id and style props to the span', () => {
    render(<Icon icon={Search} id="search-icon" style={{ marginInlineStart: '1px' }} />);

    expect(getRoot()).toHaveAttribute('id', 'search-icon');
    expect(getRoot()).toHaveStyle({ marginInlineStart: '1px' });
  });

  it('axe passes with no label when decorative inside a labelled button', async () => {
    const { container } = render(
      <button type="button">
        <Icon icon={Search} />
        Search
      </button>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes with label prop for a meaningful standalone icon', async () => {
    const { container } = render(<Icon icon={X} label="Close" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes for size="sm"', async () => {
    const { container } = render(
      <button type="button">
        <Icon icon={Search} size="sm" />
        Search
      </button>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes for size="lg"', async () => {
    const { container } = render(<Icon icon={Search} size="lg" label="Search" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses icon size tokens and currentColor inheritance', () => {
    const stylesheet = readFileSync('src/components/Icon/Icon.module.scss', 'utf8');

    expect(stylesheet).toContain('@include icon-size(sm);');
    expect(stylesheet).toContain('@include icon-size(md);');
    expect(stylesheet).toContain('@include icon-size(lg);');
    expect(stylesheet).toContain('color: inherit;');
    expect(stylesheet).toContain('stroke: currentColor;');
    expect(stylesheet).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    expect(stylesheet).not.toContain('.storyA11yScope');
  });

  it('documents the component accessibility contract in Storybook', () => {
    const story = readFileSync('src/components/Icon/Icon.stories.tsx', 'utf8');

    expect(story).toContain('### Accessibility contract');
    expect(story).toContain('pnpm add lucide-react');
    expect(story).toContain("import { Search } from 'lucide-react';");
    expect(story).toContain('https://lucide.dev/icons/');
    expect(story).toContain('Decorative icons must omit');
    expect(story).toContain('Meaningful standalone icons must provide');
    expect(story).toContain('Lucide');
  });
});

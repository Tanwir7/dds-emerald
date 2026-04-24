import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './Link.module.scss';
import { Link } from './Link';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const variantClassNames = {
  default: getRequiredClassName(styles, 'default'),
  muted: getRequiredClassName(styles, 'muted'),
  destructive: getRequiredClassName(styles, 'destructive'),
} as const;

const underlineClassNames = {
  always: getRequiredClassName(styles, 'underlineAlways'),
  hover: getRequiredClassName(styles, 'underlineHover'),
  none: getRequiredClassName(styles, 'underlineNone'),
} as const;

const sizeClassNames = {
  sm: getRequiredClassName(styles, 'sm'),
  base: getRequiredClassName(styles, 'base'),
  lg: getRequiredClassName(styles, 'lg'),
} as const;

const rootClassName = getRequiredClassName(styles, 'root');

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

const getLink = (name = /content/i) => {
  const link = Array.from(document.querySelectorAll('a')).find((element) =>
    name.test(element.textContent ?? '')
  );

  expect(link).toBeTruthy();
  return link as HTMLAnchorElement;
};

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('Link', () => {
  it('renders an <a> element by default', () => {
    render(<Link href="/docs">content</Link>);

    expect(getLink().tagName).toBe('A');
  });

  it('renders children text', () => {
    render(<Link href="/docs">content</Link>);

    expect(getLink()).toHaveTextContent('content');
  });

  it('forwards href to <a>', () => {
    render(<Link href="/docs">content</Link>);

    expect(getLink()).toHaveAttribute('href', '/docs');
  });

  it('forwards className to the root element', () => {
    render(
      <Link href="/docs" className="custom">
        content
      </Link>
    );

    expect(getLink()).toHaveClass('custom');
  });

  it('forwards ref to HTMLAnchorElement', () => {
    const ref = React.createRef<HTMLAnchorElement>();

    render(
      <Link href="/docs" ref={ref}>
        content
      </Link>
    );

    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    expect(ref.current).toBe(getLink());
  });

  it('renders via Slot instead of rendering its own <a> when asChild is true', () => {
    render(
      <Link asChild>
        <button type="button">content</button>
      </Link>
    );

    const button = document.querySelector('button');

    expect(button).toBeTruthy();
    expect(button).toHaveClass(rootClassName);
    expect(document.querySelector('a')).toBeNull();
  });

  it('applies the default variant class by default', () => {
    render(<Link href="/docs">content</Link>);

    expect(getLink()).toHaveClass(variantClassNames.default);
  });

  it('applies the muted variant class', () => {
    render(
      <Link href="/docs" variant="muted">
        content
      </Link>
    );

    expect(getLink()).toHaveClass(variantClassNames.muted);
  });

  it('applies the destructive variant class', () => {
    render(
      <Link href="/docs" variant="destructive">
        content
      </Link>
    );

    expect(getLink()).toHaveClass(variantClassNames.destructive);
  });

  it('applies underline-hover class by default', () => {
    render(<Link href="/docs">content</Link>);

    expect(getLink()).toHaveClass(underlineClassNames.hover);
  });

  it('applies underline-always class', () => {
    render(
      <Link href="/docs" underline="always">
        content
      </Link>
    );

    expect(getLink()).toHaveClass(underlineClassNames.always);
  });

  it('applies underline-none class', () => {
    render(
      <Link href="/docs" underline="none">
        content
      </Link>
    );

    expect(getLink()).toHaveClass(underlineClassNames.none);
  });

  it('does not apply a size class when size is omitted', () => {
    render(<Link href="/docs">content</Link>);

    expect(getLink()).not.toHaveClass(sizeClassNames.sm);
    expect(getLink()).not.toHaveClass(sizeClassNames.base);
    expect(getLink()).not.toHaveClass(sizeClassNames.lg);
  });

  it('applies sm class when size="sm"', () => {
    render(
      <Link href="/docs" size="sm">
        content
      </Link>
    );

    expect(getLink()).toHaveClass(sizeClassNames.sm);
  });

  it('applies base class when size="base"', () => {
    render(
      <Link href="/docs" size="base">
        content
      </Link>
    );

    expect(getLink()).toHaveClass(sizeClassNames.base);
  });

  it('applies lg class when size="lg"', () => {
    render(
      <Link href="/docs" size="lg">
        content
      </Link>
    );

    expect(getLink()).toHaveClass(sizeClassNames.lg);
  });

  it('does not render an external icon by default', () => {
    render(<Link href="/docs">content</Link>);

    expect(getLink().querySelector('svg')).toBeNull();
  });

  it('renders external icon SVG when external is true', () => {
    render(
      <Link href="https://example.com" external>
        content
      </Link>
    );

    expect(getLink().querySelector('svg')).toBeTruthy();
  });

  it('marks the external icon as decorative', () => {
    render(
      <Link href="https://example.com" external>
        content
      </Link>
    );

    expect(getLink().querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('sets target blank when external is true', () => {
    render(
      <Link href="https://example.com" external>
        content
      </Link>
    );

    expect(getLink()).toHaveAttribute('target', '_blank');
  });

  it('sets noopener noreferrer rel when external is true', () => {
    render(
      <Link href="https://example.com" external>
        content
      </Link>
    );

    expect(getLink()).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders visually hidden opens-in-new-tab text when external is true', () => {
    render(
      <Link href="https://example.com" external>
        content
      </Link>
    );

    expect(getLink()).toHaveTextContent('content (opens in new tab)');
  });

  it('does not override a consumer-provided target prop when external is true', () => {
    render(
      <Link href="https://example.com" external target="_self">
        content
      </Link>
    );

    expect(getLink()).toHaveAttribute('target', '_self');
  });

  it('does not override a consumer-provided rel prop when external is true', () => {
    render(
      <Link href="https://example.com" external rel="author">
        content
      </Link>
    );

    expect(getLink()).toHaveAttribute('rel', 'author');
  });

  it('does not add external icon, target, or rel defaults for asChild links', () => {
    render(
      <Link asChild external>
        <a href="/dashboard">content</a>
      </Link>
    );

    const link = getLink();

    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
    expect(link.querySelector('svg')).toBeNull();
  });

  it('forwards aria-label to <a>', () => {
    render(
      <Link href="/docs" aria-label="Open documentation">
        content
      </Link>
    );

    expect(getLink()).toHaveAttribute('aria-label', 'Open documentation');
  });

  it('forwards aria-current to <a>', () => {
    render(
      <Link href="/docs" aria-current="page">
        content
      </Link>
    );

    expect(getLink()).toHaveAttribute('aria-current', 'page');
  });

  it('forwards onClick to <a>', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <Link href="/docs" onClick={onClick}>
        content
      </Link>
    );

    await user.click(getLink());

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards data-testid and arbitrary props', () => {
    render(
      <Link href="/docs" data-testid="docs-link" title="Documentation">
        content
      </Link>
    );

    const link = getLink();

    expect(link).toHaveAttribute('data-testid', 'docs-link');
    expect(link).toHaveAttribute('title', 'Documentation');
  });

  it('receives focus on Tab', async () => {
    const user = userEvent.setup();

    render(<Link href="/docs">content</Link>);

    await user.tab();

    expect(getLink()).toHaveFocus();
  });

  it('activates on Enter key', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <Link href="/docs" onClick={onClick}>
        content
      </Link>
    );

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('activates on Space key', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <Link href="/docs" onClick={onClick}>
        content
      </Link>
    );

    await user.tab();
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respects consumer keydown prevention before Space activation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onKeyDown = vi.fn((event: React.KeyboardEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <Link href="/docs" onClick={onClick} onKeyDown={onKeyDown}>
        content
      </Link>
    );

    await user.tab();
    await user.keyboard(' ');

    expect(onKeyDown).toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('warns in development when href is omitted without asChild', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<Link>content</Link>);

    expect(warn).toHaveBeenCalledWith('Link expects an href prop unless asChild is true.');
  });

  it('does not warn when asChild is true', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <Link asChild>
        <a href="/docs">content</a>
      </Link>
    );

    expect(warn).not.toHaveBeenCalled();
  });

  it('axe passes for default links', async () => {
    const { container } = render(<Link href="/docs">content</Link>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes for muted links', async () => {
    const { container } = render(
      <Link href="/docs" variant="muted">
        content
      </Link>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes for destructive links', async () => {
    const { container } = render(
      <Link href="/docs" variant="destructive">
        content
      </Link>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes for external links', async () => {
    const { container } = render(
      <Link href="https://example.com" external>
        content
      </Link>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes for always-underlined links', async () => {
    const { container } = render(
      <Link href="/docs" underline="always">
        content
      </Link>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes for non-underlined links', async () => {
    const { container } = render(
      <Link href="/docs" underline="none">
        content
      </Link>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when used asChild with a mock router link', async () => {
    const { container } = render(
      <Link asChild>
        <a href="/dashboard">content</a>
      </Link>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses only tokenized runtime styles and keeps story styles separate', () => {
    const stylesheet = readFileSync('src/components/Link/Link.module.scss', 'utf8');

    expect(stylesheet).toContain('gap: var(--dds-space-1);');
    expect(stylesheet).toContain('border-radius: var(--dds-radius-none);');
    expect(stylesheet).toContain('font-family: var(--dds-font-sans);');
    expect(stylesheet).toContain('font-size: inherit;');
    expect(stylesheet).toContain('color: var(--dds-color-action-primary);');
    expect(stylesheet).toContain('&:visited');
    expect(stylesheet).toContain('outline: 3px solid transparent;');
    expect(stylesheet).toContain(
      'outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5);'
    );
    expect(stylesheet).toContain('width: var(--dds-icon-size-sm);');
    expect(stylesheet).not.toContain('.storyA11yScope');
    expect(readFileSync('src/components/Link/Link.stories.module.scss', 'utf8')).toContain(
      '.storyA11yScope'
    );
  });
});

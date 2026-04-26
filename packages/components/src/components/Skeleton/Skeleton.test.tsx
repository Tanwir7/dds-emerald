import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { Skeleton } from './Skeleton';
import styles from './Skeleton.module.scss';

expect.extend(toHaveNoViolations);

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  text: getRequiredClassName(styles, 'text'),
  circular: getRequiredClassName(styles, 'circular'),
  rectangular: getRequiredClassName(styles, 'rectangular'),
  group: getRequiredClassName(styles, 'group'),
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

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Skeleton', () => {
  it('renders a span for the default rectangular variant', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('span');

    expect(skeleton).toBeInstanceOf(HTMLSpanElement);
    expect(skeleton).toHaveClass(classNames.root, classNames.rectangular);
  });

  it('has aria-hidden="true"', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('span')).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards className to the root', () => {
    const { container } = render(<Skeleton className="custom" />);
    expect(container.querySelector('span')).toHaveClass('custom');
  });

  it('forwards ref to HTMLSpanElement', () => {
    const ref = React.createRef<HTMLSpanElement>();
    const { container } = render(<Skeleton ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toBe(container.querySelector('span'));
  });

  it('applies the rectangular class by default', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('span')).toHaveClass(classNames.rectangular);
  });

  it('applies the text class when variant="text"', () => {
    const { container } = render(<Skeleton variant="text" />);
    expect(container.querySelector('span')).toHaveClass(classNames.text);
  });

  it('applies the circular class when variant="circular"', () => {
    const { container } = render(<Skeleton variant="circular" />);
    expect(container.querySelector('span')).toHaveClass(classNames.circular);
  });

  it('sets --skeleton-width inline style when width prop is provided', () => {
    const { container } = render(<Skeleton width="24rem" />);
    expect(container.querySelector('span')?.style.getPropertyValue('--skeleton-width')).toBe(
      '24rem'
    );
  });

  it('sets --skeleton-height inline style when height prop is provided', () => {
    const { container } = render(<Skeleton height={80} />);
    expect(container.querySelector('span')?.style.getPropertyValue('--skeleton-height')).toBe(
      '80px'
    );
  });

  it('sets --skeleton-width to 100% by default when no width is provided', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('span')?.style.getPropertyValue('--skeleton-width')).toBe(
      '100%'
    );
  });

  it('does not set --skeleton-height inline when height is not provided', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('span')?.style.getPropertyValue('--skeleton-height')).toBe('');
  });

  it('renders one span when variant="text" and lines={1}', () => {
    const { container } = render(<Skeleton variant="text" lines={1} />);
    expect(container.querySelectorAll('span')).toHaveLength(1);
  });

  it('renders three text line spans when variant="text" and lines={3}', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    expect(container.querySelectorAll(`.${classNames.root}.${classNames.text}`)).toHaveLength(3);
  });

  it('all line spans have aria-hidden="true"', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const lines = Array.from(container.querySelectorAll(`.${classNames.root}.${classNames.text}`));

    expect(lines).toHaveLength(3);
    lines.forEach((line) => {
      expect(line).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('last line in multiline text has a width of 75%', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const lines = container.querySelectorAll(`.${classNames.root}.${classNames.text}`);

    expect(lines[2]?.getAttribute('style')).toContain('--skeleton-width: 75%');
  });

  it('first lines in multiline text have a width of 100%', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const lines = container.querySelectorAll(`.${classNames.root}.${classNames.text}`);

    expect(lines[0]?.getAttribute('style')).toContain('--skeleton-width: 100%');
    expect(lines[1]?.getAttribute('style')).toContain('--skeleton-width: 100%');
  });

  it('renders a wrapper group span when lines is greater than 1', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const group = container.querySelector(`.${classNames.group}`);

    expect(group).toBeInstanceOf(HTMLSpanElement);
    expect(group).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards id and data-testid', () => {
    const { container } = render(<Skeleton id="skeleton-id" data-testid="skeleton" />);
    const skeleton = container.querySelector('#skeleton-id');

    expect(skeleton).toHaveAttribute('data-testid', 'skeleton');
  });

  it('matches width and height when circular width is provided on its own', () => {
    const { container } = render(<Skeleton variant="circular" width={48} />);
    const skeleton = container.querySelector('span');

    expect(skeleton?.style.getPropertyValue('--skeleton-width')).toBe('48px');
    expect(skeleton?.style.getPropertyValue('--skeleton-height')).toBe('48px');
  });

  it('matches width and height when circular height is provided on its own', () => {
    const { container } = render(<Skeleton variant="circular" height="3rem" />);
    const skeleton = container.querySelector('span');

    expect(skeleton?.style.getPropertyValue('--skeleton-width')).toBe('3rem');
    expect(skeleton?.style.getPropertyValue('--skeleton-height')).toBe('3rem');
  });

  it('passes axe for the rectangular variant', async () => {
    const { container } = render(<Skeleton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe for the text variant', async () => {
    const { container } = render(<Skeleton variant="text" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe for the circular variant', async () => {
    const { container } = render(<Skeleton variant="circular" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe for multiline text', async () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

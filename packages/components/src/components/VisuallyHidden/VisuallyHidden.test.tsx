import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { getByRole } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { VisuallyHidden } from './VisuallyHidden';

expect.extend(toHaveNoViolations);

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

describe('VisuallyHidden', () => {
  it('renders children in the DOM but visually hidden', () => {
    render(<VisuallyHidden>Hidden label</VisuallyHidden>);

    const hidden = document.querySelector('span');
    const styles = getComputedStyle(hidden as HTMLSpanElement);

    expect(hidden).toBeInTheDocument();
    expect(hidden).toHaveTextContent('Hidden label');
    expect(styles.position).toBe('absolute');
    expect(styles.overflow).toBe('hidden');
    expect(styles.width).toBe('1px');
    expect(styles.height).toBe('1px');
    expect(styles.clip).toBe('rect(0px, 0px, 0px, 0px)');
  });

  it('keeps content accessible to screen readers', () => {
    const { container } = render(
      <button type="button">
        <VisuallyHidden>Archive invoice</VisuallyHidden>
      </button>
    );

    const button = getByRole(container, 'button', { name: 'Archive invoice' });

    expect(button).toHaveAccessibleName('Archive invoice');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('forwards className and ref to the Radix primitive', () => {
    const ref = React.createRef<HTMLSpanElement>();

    render(
      <VisuallyHidden ref={ref} className="custom">
        content
      </VisuallyHidden>
    );

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveClass('custom');
    expect(ref.current).toHaveTextContent('content');
  });

  it('axe passes', async () => {
    const { container } = render(
      <button type="button">
        <VisuallyHidden>Archive invoice</VisuallyHidden>
      </button>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

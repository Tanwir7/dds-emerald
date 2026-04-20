import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Avatar } from './Avatar';
import styles from './Avatar.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const sizes = ['sm', 'md', 'lg'] as const;

const sizeClassNames = {
  sm: getRequiredClassName(styles, 'sizeSm'),
  md: getRequiredClassName(styles, 'sizeMd'),
  lg: getRequiredClassName(styles, 'sizeLg'),
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

const originalImage = window.Image;

class TestImage {
  complete = false;
  naturalWidth = 0;
  referrerPolicy = '';
  crossOrigin: string | null = null;

  private currentSrc = '';
  private readonly listeners = new Map<string, Set<EventListener>>();

  get src() {
    return this.currentSrc;
  }

  set src(value: string) {
    this.currentSrc = value;

    const eventType = value.includes('fail') ? 'error' : 'load';
    this.complete = eventType === 'load';
    this.naturalWidth = eventType === 'load' ? 1 : 0;

    window.setTimeout(() => {
      const event = new Event(eventType);
      this.listeners.get(eventType)?.forEach((listener) => listener.call(this, event));
    }, 0);
  }

  addEventListener(type: string, listener: EventListener) {
    const listeners = this.listeners.get(type) ?? new Set<EventListener>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: EventListener) {
    this.listeners.get(type)?.delete(listener);
  }
}

beforeEach(() => {
  Object.defineProperty(window, 'Image', {
    configurable: true,
    writable: true,
    value: TestImage,
  });
});

afterEach(() => {
  Object.defineProperty(window, 'Image', {
    configurable: true,
    writable: true,
    value: originalImage,
  });
  document.body.innerHTML = '';
});

describe('Avatar', () => {
  it('renders with image', async () => {
    render(<Avatar src="/avatar.png" alt="Ada Lovelace" fallback="AL" />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
    });

    expect(screen.queryByText('AL')).not.toBeInTheDocument();
  });

  it('renders fallback when image fails', async () => {
    render(<Avatar src="/fail-avatar.png" alt="Ada Lovelace" fallback="AL" />);

    await waitFor(() => {
      expect(screen.getByText('AL')).toBeInTheDocument();
    });

    expect(screen.queryByRole('img', { name: 'Ada Lovelace' })).not.toBeInTheDocument();
  });

  it('renders all 3 sizes', () => {
    render(
      <div>
        {sizes.map((size) => (
          <Avatar key={size} size={size} fallback={size.slice(0, 2).toUpperCase()} />
        ))}
      </div>
    );

    sizes.forEach((size) => {
      const root = screen.getByText(size.slice(0, 2).toUpperCase()).parentElement;
      expect(root).toHaveClass(sizeClassNames[size]);
    });
  });

  it('forwards className', () => {
    render(<Avatar className="custom" fallback="AL" />);
    expect(screen.getByText('AL').parentElement).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} fallback="AL" />);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toContainElement(screen.getByText('AL'));
  });

  it('axe passes', async () => {
    const { container } = render(<Avatar src="/avatar.png" alt="Ada Lovelace" fallback="AL" />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

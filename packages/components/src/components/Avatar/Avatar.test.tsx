import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';
import styles from './Avatar.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const sizes = ['sm', 'md', 'lg'] as const;

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
  it('renders a span root with md size by default', async () => {
    render(
      <Avatar>
        <AvatarFallback delayMs={0}>AL</AvatarFallback>
      </Avatar>
    );

    const root = (await screen.findByText('AL')).parentElement;
    expect(root).toBeInstanceOf(HTMLSpanElement);
    expect(root).toHaveClass(sizeClassNames.md);
  });

  it('renders AvatarImage as an img with provided src and alt', async () => {
    render(
      <Avatar>
        <AvatarImage src="/avatar.png" alt="Ada Lovelace" />
        <AvatarFallback delayMs={0}>AL</AvatarFallback>
      </Avatar>
    );

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute(
        'src',
        '/avatar.png'
      );
    });
  });

  it('renders AvatarFallback children', async () => {
    render(
      <Avatar>
        <AvatarFallback delayMs={0}>AL</AvatarFallback>
      </Avatar>
    );

    expect(await screen.findByText('AL')).toBeInTheDocument();
  });

  it('forwards className to the Avatar root', async () => {
    render(
      <Avatar className="custom">
        <AvatarFallback delayMs={0}>AL</AvatarFallback>
      </Avatar>
    );

    expect((await screen.findByText('AL')).parentElement).toHaveClass('custom');
  });

  it('forwards ref to the Avatar root', async () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Avatar ref={ref}>
        <AvatarFallback delayMs={0}>AL</AvatarFallback>
      </Avatar>
    );

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toContainElement(await screen.findByText('AL'));
  });

  it('applies sm and lg size classes', async () => {
    render(
      <div>
        <Avatar size="sm">
          <AvatarFallback delayMs={0}>SM</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback delayMs={0}>LG</AvatarFallback>
        </Avatar>
      </div>
    );

    expect((await screen.findByText('SM')).parentElement).toHaveClass(sizeClassNames.sm);
    expect((await screen.findByText('LG')).parentElement).toHaveClass(sizeClassNames.lg);
  });

  it('hides AvatarFallback when the image loads successfully', async () => {
    render(
      <Avatar>
        <AvatarImage src="/avatar.png" alt="Ada Lovelace" />
        <AvatarFallback delayMs={0}>AL</AvatarFallback>
      </Avatar>
    );

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
    });

    expect(screen.queryByText('AL')).not.toBeInTheDocument();
  });

  it('shows AvatarFallback when the image fails to load', async () => {
    render(
      <Avatar>
        <AvatarImage src="/fail-avatar.png" alt="Ada Lovelace" />
        <AvatarFallback delayMs={0}>AL</AvatarFallback>
      </Avatar>
    );

    await waitFor(() => {
      expect(screen.getByText('AL')).toBeInTheDocument();
    });

    expect(screen.queryByRole('img', { name: 'Ada Lovelace' })).not.toBeInTheDocument();
  });

  it('forwards className and ref to AvatarImage', async () => {
    const ref = React.createRef<HTMLImageElement>();
    render(
      <Avatar>
        <AvatarImage ref={ref} className="image-custom" src="/avatar.png" alt="Ada Lovelace" />
        <AvatarFallback delayMs={0}>AL</AvatarFallback>
      </Avatar>
    );

    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLImageElement);
    });

    expect(ref.current).toHaveClass('image-custom');
  });

  it('forwards className and ref to AvatarFallback', async () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Avatar>
        <AvatarFallback ref={ref} className="fallback-custom" delayMs={0}>
          AL
        </AvatarFallback>
      </Avatar>
    );

    await screen.findByText('AL');
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveClass('fallback-custom');
  });

  it('axe passes for Avatar with image', async () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/avatar.png" alt="Ada Lovelace" />
        <AvatarFallback delayMs={0}>AL</AvatarFallback>
      </Avatar>
    );

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes for Avatar with fallback initials', async () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback delayMs={0}>AL</AvatarFallback>
      </Avatar>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes for all three sizes', async () => {
    const { container } = render(
      <div>
        {sizes.map((size) => (
          <Avatar key={size} size={size}>
            <AvatarFallback delayMs={0}>{size.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        ))}
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

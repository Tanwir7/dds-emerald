import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  type HoverCardContentProps,
  type HoverCardProps,
} from './HoverCard';

expect.extend(toHaveNoViolations);

const testImageDataUri = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const axeOptions = {
  rules: {
    region: {
      enabled: false,
    },
  },
};

beforeAll(() => {
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ??
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

afterEach(async () => {
  cleanup();

  if (vi.isFakeTimers()) {
    vi.runOnlyPendingTimers();
    vi.clearAllTimers();
    vi.useRealTimers();
  }

  await act(async () => {
    await Promise.resolve();
  });
});

const getHoverCardContent = () =>
  document.body.querySelector(
    '[data-radix-popper-content-wrapper] > div[data-side]'
  ) as HTMLDivElement | null;

const getVisibleHoverCardContent = () => {
  const content = getHoverCardContent();
  expect(content).toBeInTheDocument();
  return content as HTMLDivElement;
};

const renderHoverCard = (
  rootProps: Partial<HoverCardProps> = {},
  contentProps: Partial<HoverCardContentProps> = {}
) => {
  const view = render(
    <main>
      <button type="button">Before</button>
      <HoverCard {...rootProps}>
        <HoverCardTrigger>
          <button type="button">Open preview</button>
        </HoverCardTrigger>
        <HoverCardContent {...contentProps}>
          <div>
            <p>Emerald Design System</p>
            <a href="#hover-card-docs">Read docs</a>
          </div>
        </HoverCardContent>
      </HoverCard>
      <button type="button">After</button>
    </main>
  );

  return {
    ...view,
    trigger: screen.getByRole('button', { name: 'Open preview' }),
    before: screen.getByRole('button', { name: 'Before' }),
    after: screen.getByRole('button', { name: 'After' }),
  };
};

const advanceTimers = async (duration: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(duration);
  });
};

const flushEffects = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

const hoverElement = (element: Element) => {
  fireEvent.pointerEnter(element);
  fireEvent.mouseEnter(element);
};

const unhoverElement = (element: Element) => {
  fireEvent.pointerLeave(element);
  fireEvent.mouseLeave(element);
};

describe('HoverCard', () => {
  describe('Rendering', () => {
    it('does not render card content by default', () => {
      renderHoverCard();

      expect(screen.queryByText('Emerald Design System')).not.toBeInTheDocument();
      expect(getHoverCardContent()).not.toBeInTheDocument();
    });

    it('renders card content after hover and openDelay passes', async () => {
      vi.useFakeTimers();
      const { trigger } = renderHoverCard();

      hoverElement(trigger);
      await advanceTimers(400);

      expect(screen.getByText('Emerald Design System')).toBeInTheDocument();
    });

    it('renders HoverCardArrow when showArrow is true by default', async () => {
      vi.useFakeTimers();
      const { trigger } = renderHoverCard();

      hoverElement(trigger);
      await advanceTimers(400);

      const panel = getVisibleHoverCardContent();
      expect(panel.querySelector('svg')).toBeInTheDocument();
    });

    it('does not render HoverCardArrow when showArrow is false', async () => {
      vi.useFakeTimers();
      const { trigger } = renderHoverCard({}, { showArrow: false });

      hoverElement(trigger);
      await advanceTimers(400);

      const panel = getVisibleHoverCardContent();
      expect(panel.querySelector('svg')).not.toBeInTheDocument();
    });

    it('forwards ref to HoverCardContent HTMLDivElement', async () => {
      vi.useFakeTimers();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <HoverCard>
          <HoverCardTrigger>
            <button type="button">Open preview</button>
          </HoverCardTrigger>
          <HoverCardContent ref={ref}>Preview content</HoverCardContent>
        </HoverCard>
      );

      hoverElement(screen.getByRole('button', { name: 'Open preview' }));
      await advanceTimers(400);

      expect(screen.getByText('Preview content')).toBeInTheDocument();
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveTextContent('Preview content');
    });

    it('forwards className to HoverCardContent', async () => {
      vi.useFakeTimers();
      const { trigger } = renderHoverCard({}, { className: 'custom-hover-card' });

      hoverElement(trigger);
      await advanceTimers(400);

      expect(getVisibleHoverCardContent()).toHaveClass('custom-hover-card');
    });
  });

  describe('Open/close', () => {
    it('card opens after pointer enters trigger and openDelay elapses', async () => {
      vi.useFakeTimers();
      const { trigger } = renderHoverCard();

      hoverElement(trigger);
      await advanceTimers(400);

      expect(screen.getByText('Emerald Design System')).toBeInTheDocument();
    });

    it('card does not open before openDelay elapses', async () => {
      vi.useFakeTimers();
      const { trigger } = renderHoverCard();

      hoverElement(trigger);
      await advanceTimers(399);

      expect(screen.queryByText('Emerald Design System')).not.toBeInTheDocument();
    });

    it('card closes after pointer leaves trigger and closeDelay elapses', async () => {
      vi.useFakeTimers();
      const { trigger } = renderHoverCard();

      hoverElement(trigger);
      await advanceTimers(400);
      expect(screen.getByText('Emerald Design System')).toBeInTheDocument();

      unhoverElement(trigger);
      await advanceTimers(200);

      expect(screen.queryByText('Emerald Design System')).not.toBeInTheDocument();
    });

    it('card does not close before closeDelay elapses', async () => {
      vi.useFakeTimers();
      const { trigger } = renderHoverCard();

      hoverElement(trigger);
      await advanceTimers(400);
      expect(screen.getByText('Emerald Design System')).toBeInTheDocument();

      unhoverElement(trigger);
      await advanceTimers(199);

      expect(screen.getByText('Emerald Design System')).toBeInTheDocument();
    });

    it('card remains open when pointer moves from trigger into card content', async () => {
      vi.useFakeTimers();
      const { trigger } = renderHoverCard();

      hoverElement(trigger);
      await advanceTimers(400);
      const panel = getVisibleHoverCardContent();

      unhoverElement(trigger);
      hoverElement(panel);
      await advanceTimers(200);

      expect(screen.getByText('Emerald Design System')).toBeInTheDocument();
    });

    it('card closes on Escape key while open', async () => {
      const user = userEvent.setup();
      renderHoverCard({ defaultOpen: true });

      expect(screen.getByText('Emerald Design System')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByText('Emerald Design System')).not.toBeInTheDocument();
    });

    it('works as a controlled component', async () => {
      const onOpenChange = vi.fn();
      const { rerender } = render(
        <HoverCard open={false} onOpenChange={onOpenChange}>
          <HoverCardTrigger>
            <button type="button">Open preview</button>
          </HoverCardTrigger>
          <HoverCardContent>Controlled content</HoverCardContent>
        </HoverCard>
      );

      expect(screen.queryByText('Controlled content')).not.toBeInTheDocument();

      rerender(
        <HoverCard open onOpenChange={onOpenChange}>
          <HoverCardTrigger>
            <button type="button">Open preview</button>
          </HoverCardTrigger>
          <HoverCardContent>Controlled content</HoverCardContent>
        </HoverCard>
      );

      await waitFor(() => {
        expect(screen.getByText('Controlled content')).toBeInTheDocument();
      });

      rerender(
        <HoverCard open={false} onOpenChange={onOpenChange}>
          <HoverCardTrigger>
            <button type="button">Open preview</button>
          </HoverCardTrigger>
          <HoverCardContent>Controlled content</HoverCardContent>
        </HoverCard>
      );

      await waitFor(() => {
        expect(screen.queryByText('Controlled content')).not.toBeInTheDocument();
      });
    });

    it('calls onOpenChange(true) when card opens', async () => {
      vi.useFakeTimers();
      const onOpenChange = vi.fn();
      const { trigger } = renderHoverCard({ onOpenChange });

      hoverElement(trigger);
      await advanceTimers(400);

      expect(screen.getByText('Emerald Design System')).toBeInTheDocument();
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('calls onOpenChange(false) when card closes', async () => {
      vi.useFakeTimers();
      const onOpenChange = vi.fn();
      const { trigger } = renderHoverCard({ onOpenChange });

      hoverElement(trigger);
      await advanceTimers(400);
      expect(screen.getByText('Emerald Design System')).toBeInTheDocument();

      unhoverElement(trigger);
      await advanceTimers(200);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Props', () => {
    it('applies custom openDelay', async () => {
      vi.useFakeTimers();
      const { trigger } = renderHoverCard({ openDelay: 100 });

      hoverElement(trigger);
      await advanceTimers(99);
      expect(screen.queryByText('Emerald Design System')).not.toBeInTheDocument();

      await advanceTimers(1);
      expect(screen.getByText('Emerald Design System')).toBeInTheDocument();
    });

    it('applies custom closeDelay', async () => {
      vi.useFakeTimers();
      const { trigger } = renderHoverCard({ closeDelay: 500 });

      hoverElement(trigger);
      await advanceTimers(400);
      expect(screen.getByText('Emerald Design System')).toBeInTheDocument();

      unhoverElement(trigger);
      await advanceTimers(499);
      expect(screen.getByText('Emerald Design System')).toBeInTheDocument();

      await advanceTimers(1);
      expect(screen.queryByText('Emerald Design System')).not.toBeInTheDocument();
    });

    it('passes side prop to Radix content', async () => {
      vi.useFakeTimers();
      const { trigger } = renderHoverCard({}, { side: 'top' });

      hoverElement(trigger);
      await advanceTimers(400);

      expect(getVisibleHoverCardContent()).toHaveAttribute('data-side', 'top');
    });

    it('passes sideOffset prop without preventing open state', async () => {
      vi.useFakeTimers();
      const { trigger } = renderHoverCard({}, { sideOffset: 24 });

      hoverElement(trigger);
      await advanceTimers(400);

      expect(getVisibleHoverCardContent()).toHaveTextContent('Emerald Design System');
    });

    it('passes align prop to Radix content', async () => {
      vi.useFakeTimers();
      const { trigger } = renderHoverCard({}, { align: 'end' });

      hoverElement(trigger);
      await advanceTimers(400);

      expect(getVisibleHoverCardContent()).toHaveAttribute('data-align', 'end');
    });
  });

  describe('Accessibility', () => {
    it('trigger is not given aria-expanded', () => {
      const { trigger } = renderHoverCard();

      expect(trigger).not.toHaveAttribute('aria-expanded');
    });

    it('HoverCardContent does not have role dialog', async () => {
      vi.useFakeTimers();
      const { trigger } = renderHoverCard();

      hoverElement(trigger);
      await advanceTimers(400);

      expect(getVisibleHoverCardContent()).not.toHaveAttribute('role', 'dialog');
    });

    it('HoverCardContent does not trap focus', async () => {
      const user = userEvent.setup();
      const { before, trigger, after } = renderHoverCard({ defaultOpen: true });

      before.focus();
      await user.tab();
      expect(trigger).toHaveFocus();

      await user.tab();
      expect(after).toHaveFocus();
    });
  });

  describe('axe', () => {
    it('passes when card is closed', async () => {
      const { container } = renderHoverCard();

      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes when card is open with text content', async () => {
      renderHoverCard({ defaultOpen: true });
      await flushEffects();
      expect(screen.getByText('Emerald Design System')).toBeInTheDocument();

      expect(await axe(document.body, axeOptions)).toHaveNoViolations();
    });

    it('passes when card is open with showArrow false', async () => {
      renderHoverCard({ defaultOpen: true }, { showArrow: false });
      await flushEffects();
      expect(screen.getByText('Emerald Design System')).toBeInTheDocument();

      expect(await axe(document.body, axeOptions)).toHaveNoViolations();
    });

    it('passes when card contains an image with alt text', async () => {
      render(
        <HoverCard defaultOpen>
          <HoverCardTrigger>
            <button type="button">Open preview</button>
          </HoverCardTrigger>
          <HoverCardContent>
            <img src={testImageDataUri} alt="Profile avatar for Emerald Design System" />
          </HoverCardContent>
        </HoverCard>
      );

      await flushEffects();
      expect(screen.getByAltText('Profile avatar for Emerald Design System')).toBeInTheDocument();

      expect(await axe(document.body, axeOptions)).toHaveNoViolations();
    });

    it('passes when card contains a link with accessible name', async () => {
      renderHoverCard({ defaultOpen: true });
      await flushEffects();
      expect(screen.getByRole('link', { name: 'Read docs' })).toBeInTheDocument();

      expect(await axe(document.body, axeOptions)).toHaveNoViolations();
    });

    it.each(['top', 'right', 'bottom', 'left'] as const)('passes with side %s', async (side) => {
      renderHoverCard({ defaultOpen: true }, { side });
      await flushEffects();
      expect(screen.getByText('Emerald Design System')).toBeInTheDocument();

      expect(await axe(document.body, axeOptions)).toHaveNoViolations();
      cleanup();
    });
  });
});

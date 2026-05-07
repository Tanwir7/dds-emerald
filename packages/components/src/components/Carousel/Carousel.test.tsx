// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  Carousel,
  CarouselContent,
  CarouselDot,
  CarouselDots,
  CarouselNextButton,
  CarouselPrevButton,
  CarouselSlide,
  useCarousel,
} from './Carousel';

expect.extend(toHaveNoViolations);

const scrollToMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(globalThis.HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: scrollToMock,
  });

  Object.defineProperty(globalThis, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(async () => {
  cleanup();
  scrollToMock.mockReset();

  if (vi.isFakeTimers()) {
    vi.runOnlyPendingTimers();
    vi.clearAllTimers();
    vi.useRealTimers();
  }

  await act(async () => {
    await Promise.resolve();
  });
});

const getContentElement = () => {
  const firstSlide = screen.getByRole('group', { name: 'Slide 1 of 3' });
  const content = firstSlide.parentElement;

  if (!(content instanceof HTMLDivElement)) {
    throw new Error('Expected carousel content element.');
  }

  return content;
};

const PauseButton = () => {
  const { isPaused, togglePause } = useCarousel();

  return (
    <button type="button" onClick={togglePause}>
      {isPaused ? 'Resume autoplay' : 'Pause autoplay'}
    </button>
  );
};

const renderCarousel = (
  props: Partial<React.ComponentProps<typeof Carousel>> = {},
  includeControls = true
) =>
  render(
    <main>
      <Carousel aria-label="Featured content" {...props}>
        <CarouselSlide>
          <article>
            <h2>Slide 1</h2>
            <p>First panel</p>
          </article>
        </CarouselSlide>
        <CarouselSlide>
          <article>
            <h2>Slide 2</h2>
            <p>Second panel</p>
          </article>
        </CarouselSlide>
        <CarouselSlide>
          <article>
            <h2>Slide 3</h2>
            <p>Third panel</p>
          </article>
        </CarouselSlide>
        {includeControls ? (
          <>
            <CarouselPrevButton />
            <CarouselNextButton />
            <CarouselDots />
          </>
        ) : null}
      </Carousel>
    </main>
  );

describe('Carousel', () => {
  describe('structure', () => {
    it('renders the carousel root with aria-roledescription', () => {
      renderCarousel();

      expect(screen.getByLabelText('Featured content')).toHaveAttribute(
        'aria-roledescription',
        'carousel'
      );
    });

    it('renders the provided aria-label on the root', () => {
      renderCarousel({ 'aria-label': 'Product gallery' });

      expect(screen.getByLabelText('Product gallery')).toBeInTheDocument();
    });

    it('renders each slide as a group with slide roledescription', () => {
      renderCarousel();

      const slides = screen.getAllByRole('group');
      expect(slides).toHaveLength(3);
      expect(slides[0]).toHaveAttribute('aria-roledescription', 'slide');
    });

    it('auto-injects slide labels based on position', () => {
      renderCarousel();

      expect(screen.getByRole('group', { name: 'Slide 1 of 3' })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Slide 2 of 3' })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Slide 3 of 3' })).toBeInTheDocument();
    });

    it('does not override a consumer-provided slide aria-label', () => {
      render(
        <Carousel aria-label="Gallery">
          <CarouselSlide aria-label="Custom first slide">One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </Carousel>
      );

      expect(screen.getByRole('group', { name: 'Custom first slide' })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Slide 2 of 2' })).toBeInTheDocument();
    });

    it('renders one dot per slide', () => {
      renderCarousel();

      const tablist = screen.getByRole('tablist', { name: 'Slide navigation' });
      expect(within(tablist).getAllByRole('tab')).toHaveLength(3);
    });

    it('marks the active dot as selected', () => {
      renderCarousel();

      const dots = screen.getAllByRole('tab');
      expect(dots[0]).toHaveAttribute('aria-selected', 'true');
      expect(dots[1]).toHaveAttribute('aria-selected', 'false');
    });

    it('renders previous and next buttons with accessible labels', () => {
      renderCarousel();

      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
    });

    it('forwards a ref to the root element', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Carousel ref={ref} aria-label="Ref carousel">
          <CarouselSlide>Slide 1</CarouselSlide>
        </Carousel>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toBe(screen.getByLabelText('Ref carousel'));
    });

    it('makes the scrollable content region keyboard focusable by default', () => {
      renderCarousel();

      expect(getContentElement()).toHaveAttribute('tabindex', '0');
    });

    it('preserves a consumer-provided content tabIndex', () => {
      render(
        <Carousel aria-label="Custom tab index carousel">
          <CarouselContent tabIndex={-1}>
            <CarouselSlide>One</CarouselSlide>
          </CarouselContent>
        </Carousel>
      );

      const slide = screen.getByRole('group', { name: 'Slide 1 of 1' });
      expect(slide.parentElement).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('navigation', () => {
    it('goTo scrolls to the requested slide when a dot is clicked', async () => {
      const user = userEvent.setup();
      renderCarousel();

      await user.click(screen.getByRole('tab', { name: 'Go to slide 3' }));

      expect(scrollToMock).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('tab', { name: 'Go to slide 3' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('next increments the current slide when the next button is clicked', async () => {
      const user = userEvent.setup();
      renderCarousel();

      await user.click(screen.getByRole('button', { name: 'Next slide' }));

      expect(screen.getByRole('tab', { name: 'Go to slide 2' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('prev decrements the current slide when the previous button is clicked', async () => {
      const user = userEvent.setup();
      renderCarousel({ defaultIndex: 1 });

      await user.click(screen.getByRole('button', { name: 'Previous slide' }));

      expect(screen.getByRole('tab', { name: 'Go to slide 1' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('keeps dots in sync with native scrolling through scroll position updates', () => {
      vi.useFakeTimers();
      renderCarousel();
      const content = getContentElement();

      Object.defineProperty(content, 'scrollLeft', {
        configurable: true,
        value: 320,
      });

      const slides = Array.from(content.children) as HTMLElement[];
      slides.forEach((slide, index) => {
        Object.defineProperty(slide, 'offsetLeft', {
          configurable: true,
          value: index * 160,
        });
      });

      act(() => {
        fireEvent.scroll(content);
        vi.advanceTimersByTime(150);
      });

      expect(screen.getByRole('tab', { name: 'Go to slide 3' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });
  });

  describe('boundaries', () => {
    it('disables the previous button at index 0 by default', () => {
      renderCarousel();

      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
    });

    it('disables the next button at the last slide when loop is false', () => {
      renderCarousel({ defaultIndex: 2 });

      expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled();
    });

    it('does not move before the first slide when loop is false', async () => {
      const user = userEvent.setup();
      renderCarousel();

      await user.click(screen.getByRole('button', { name: 'Previous slide' }));

      expect(scrollToMock).not.toHaveBeenCalled();
      expect(screen.getByRole('tab', { name: 'Go to slide 1' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('does not move beyond the last slide when loop is false', async () => {
      const user = userEvent.setup();
      renderCarousel({ defaultIndex: 2 });

      await user.click(screen.getByRole('button', { name: 'Next slide' }));

      expect(scrollToMock).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('tab', { name: 'Go to slide 3' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('keeps prev and next buttons enabled when loop is true', () => {
      renderCarousel({ loop: true, defaultIndex: 0 });

      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeEnabled();
    });

    it('wraps from the first slide to the last when loop is true', async () => {
      const user = userEvent.setup();
      renderCarousel({ loop: true });

      await user.click(screen.getByRole('button', { name: 'Previous slide' }));

      expect(screen.getByRole('tab', { name: 'Go to slide 3' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('wraps from the last slide to the first when loop is true', async () => {
      const user = userEvent.setup();
      renderCarousel({ loop: true, defaultIndex: 2 });

      await user.click(screen.getByRole('button', { name: 'Next slide' }));

      expect(screen.getByRole('tab', { name: 'Go to slide 1' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('disables both navigation buttons when there is a single slide', () => {
      render(
        <Carousel aria-label="Single slide carousel">
          <CarouselSlide>Only slide</CarouselSlide>
          <CarouselPrevButton />
          <CarouselNextButton />
        </Carousel>
      );

      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled();
    });
  });

  describe('controlled mode', () => {
    it('renders with the provided controlled index', () => {
      renderCarousel({ index: 1 });

      expect(screen.getByRole('tab', { name: 'Go to slide 2' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('calls onIndexChange when the slide changes', async () => {
      const user = userEvent.setup();
      const onIndexChange = vi.fn();
      renderCarousel({ index: 0, onIndexChange });

      await user.click(screen.getByRole('button', { name: 'Next slide' }));

      expect(onIndexChange).toHaveBeenCalledWith(1);
    });

    it('does not update the visible controlled index without a prop change', async () => {
      const user = userEvent.setup();
      renderCarousel({ index: 0, onIndexChange: vi.fn() });

      await user.click(screen.getByRole('button', { name: 'Next slide' }));

      expect(screen.getByRole('tab', { name: 'Go to slide 1' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      expect(screen.getByRole('tab', { name: 'Go to slide 2' })).toHaveAttribute(
        'aria-selected',
        'false'
      );
    });
  });

  describe('keyboard', () => {
    it('ArrowRight navigates to the next slide when focus is within the carousel', () => {
      renderCarousel();

      const nextButton = screen.getByRole('button', { name: 'Next slide' });
      nextButton.focus();
      fireEvent.keyDown(nextButton, { key: 'ArrowRight' });

      expect(screen.getByRole('tab', { name: 'Go to slide 2' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('ArrowLeft navigates to the previous slide when focus is within the carousel', () => {
      renderCarousel({ defaultIndex: 1 });

      const prevButton = screen.getByRole('button', { name: 'Previous slide' });
      prevButton.focus();
      fireEvent.keyDown(prevButton, { key: 'ArrowLeft' });

      expect(screen.getByRole('tab', { name: 'Go to slide 1' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('Home navigates to the first slide', () => {
      renderCarousel({ defaultIndex: 2 });

      const nextButton = screen.getByRole('button', { name: 'Next slide' });
      nextButton.focus();
      fireEvent.keyDown(nextButton, { key: 'Home' });

      expect(screen.getByRole('tab', { name: 'Go to slide 1' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('End navigates to the last slide', () => {
      renderCarousel();

      const nextButton = screen.getByRole('button', { name: 'Next slide' });
      nextButton.focus();
      fireEvent.keyDown(nextButton, { key: 'End' });

      expect(screen.getByRole('tab', { name: 'Go to slide 3' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });
  });

  describe('autoplay', () => {
    it('advances at the configured autoplay interval', () => {
      vi.useFakeTimers();
      renderCarousel({ autoplay: true, autoplayInterval: 1200 });

      act(() => {
        vi.advanceTimersByTime(1200);
      });

      expect(screen.getByRole('tab', { name: 'Go to slide 2' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('pauses on mouse enter when pauseOnHover is true', () => {
      vi.useFakeTimers();
      renderCarousel({ autoplay: true, autoplayInterval: 1000, pauseOnHover: true });

      fireEvent.mouseEnter(screen.getByLabelText('Featured content'));

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByRole('tab', { name: 'Go to slide 1' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('resumes on mouse leave after pausing', () => {
      vi.useFakeTimers();
      renderCarousel({ autoplay: true, autoplayInterval: 1000, pauseOnHover: true });

      const carousel = screen.getByLabelText('Featured content');
      fireEvent.mouseEnter(carousel);
      fireEvent.mouseLeave(carousel);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByRole('tab', { name: 'Go to slide 2' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('pauses on focus and resumes on blur', () => {
      vi.useFakeTimers();
      renderCarousel({ autoplay: true, autoplayInterval: 1000 });

      const nextButton = screen.getByRole('button', { name: 'Next slide' });
      fireEvent.focusIn(nextButton);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByRole('tab', { name: 'Go to slide 1' })).toHaveAttribute(
        'aria-selected',
        'true'
      );

      fireEvent.focusOut(nextButton);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByRole('tab', { name: 'Go to slide 2' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('does not pause on hover when pauseOnHover is false', () => {
      vi.useFakeTimers();
      renderCarousel({ autoplay: true, autoplayInterval: 1000, pauseOnHover: false });

      fireEvent.mouseEnter(screen.getByLabelText('Featured content'));

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByRole('tab', { name: 'Go to slide 2' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('announces the current slide in a live region when autoplay is active', () => {
      render(
        <Carousel aria-label="Autoplay carousel" autoplay>
          <CarouselSlide>Slide 1</CarouselSlide>
          <CarouselSlide>Slide 2</CarouselSlide>
          <PauseButton />
        </Carousel>
      );

      expect(screen.getByText('Slide 1 of 2')).toHaveAttribute('aria-live', 'polite');
    });

    it('supports a consumer-rendered pause control via useCarousel', async () => {
      const user = userEvent.setup();

      render(
        <Carousel aria-label="Autoplay controls" autoplay>
          <CarouselSlide>Slide 1</CarouselSlide>
          <CarouselSlide>Slide 2</CarouselSlide>
          <PauseButton />
        </Carousel>
      );

      const pauseButton = screen.getByRole('button', { name: 'Pause autoplay' });
      await user.click(pauseButton);

      expect(screen.getByRole('button', { name: 'Resume autoplay' })).toBeInTheDocument();
    });
  });

  describe('composition', () => {
    it('supports explicit CarouselContent for advanced composition', () => {
      render(
        <Carousel aria-label="Explicit content carousel">
          <CarouselContent>
            <CarouselSlide>One</CarouselSlide>
            <CarouselSlide>Two</CarouselSlide>
          </CarouselContent>
          <CarouselDots />
        </Carousel>
      );

      expect(screen.getByRole('group', { name: 'Slide 1 of 2' })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Slide 2 of 2' })).toBeInTheDocument();
    });

    it('forwards className to CarouselContent', () => {
      const { container } = render(
        <Carousel aria-label="Content class carousel">
          <CarouselContent className="custom-content">
            <CarouselSlide>One</CarouselSlide>
          </CarouselContent>
        </Carousel>
      );

      expect(container.querySelector('.custom-content')).toBeInTheDocument();
    });

    it('renders standalone CarouselDot semantics', () => {
      render(<CarouselDot index={0} active aria-label="Go to slide 1" onClick={() => undefined} />);

      expect(screen.getByRole('tab', { name: 'Go to slide 1' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });
  });

  describe('useCarousel', () => {
    it('throws when used outside a Carousel', () => {
      const Consumer = () => {
        useCarousel();
        return null;
      };

      expect(() => render(<Consumer />)).toThrowError('useCarousel must be used within a Carousel');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations with buttons and dots', async () => {
      const { container } = renderCarousel();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations when loop is enabled', async () => {
      const { container } = renderCarousel({ loop: true });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations for autoplay with a pause button', async () => {
      const { container } = render(
        <main>
          <Carousel aria-label="Autoplay a11y carousel" autoplay>
            <CarouselSlide>One</CarouselSlide>
            <CarouselSlide>Two</CarouselSlide>
            <CarouselPrevButton />
            <CarouselNextButton />
            <CarouselDots />
            <PauseButton />
          </Carousel>
        </main>
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations with slidesPerView set to 2', async () => {
      const { container } = renderCarousel({ slidesPerView: 2 });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations for a single slide', async () => {
      const { container } = render(
        <main>
          <Carousel aria-label="Single slide accessibility">
            <CarouselSlide>Only slide</CarouselSlide>
            <CarouselPrevButton />
            <CarouselNextButton />
          </Carousel>
        </main>
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations without dots', async () => {
      const { container } = renderCarousel({}, false);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { Button } from '../Button';
import styles from './Carousel.module.scss';

type CarouselGap = 'none' | 'sm' | 'md' | 'lg';
type CarouselOrientation = 'horizontal';

type CarouselState = {
  currentIndex: number;
  slideCount: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  isPaused: boolean;
  goTo: (index: number) => void;
  prev: () => void;
  next: () => void;
  togglePause: () => void;
  pause: () => void;
  resume: () => void;
};

type InternalCarouselContentProps = CarouselContentProps & {
  scrollRef?: React.Ref<HTMLDivElement>;
  internalStyle?: React.CSSProperties;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
};

type CarouselSlideLabelProps = {
  'aria-label'?: string;
};

type CarouselNavButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'aria-labelledby' | 'children'
> & {
  className?: string | undefined;
};

const gapMap: Record<CarouselGap, string> = {
  none: '0px',
  sm: 'var(--dds-space-2)',
  md: 'var(--dds-space-4)',
  lg: 'var(--dds-space-6)',
};

const CarouselContext = React.createContext<CarouselState | null>(null);

const matchesComponentDisplayName = (child: React.ReactNode, displayName: string) => {
  if (!React.isValidElement(child)) {
    return false;
  }

  const childType = child.type as {
    displayName?: string;
    name?: string;
    render?: { displayName?: string; name?: string };
  };

  return (
    childType.displayName === displayName ||
    childType.name === displayName ||
    childType.render?.displayName === displayName ||
    childType.render?.name === displayName
  );
};

const isCarouselContentElement = (
  child: React.ReactNode
): child is React.ReactElement<CarouselContentProps> =>
  React.isValidElement(child) &&
  (child.type === CarouselContent || matchesComponentDisplayName(child, 'CarouselContent'));

const isCarouselSlideElement = (
  child: React.ReactNode
): child is React.ReactElement<CarouselSlideProps> =>
  React.isValidElement(child) &&
  (child.type === CarouselSlide || matchesComponentDisplayName(child, 'CarouselSlide'));

const mergeRefs =
  <T,>(...refs: Array<React.Ref<T> | undefined>) =>
  (value: T | null) => {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        ref(value);
        return;
      }

      (ref as React.MutableRefObject<T | null>).current = value;
    });
  };

const clampIndex = (index: number, slideCount: number, loop: boolean) => {
  if (slideCount <= 0) {
    return 0;
  }

  if (loop) {
    return ((index % slideCount) + slideCount) % slideCount;
  }

  return Math.max(0, Math.min(index, slideCount - 1));
};

const getSlidesFromChildren = (children: React.ReactNode) =>
  React.Children.toArray(children).filter(
    isCarouselSlideElement
  ) as React.ReactElement<CarouselSlideProps>[];

const injectSlideMetadata = (children: React.ReactNode, slideCount: number) => {
  let slideIndex = 0;

  return React.Children.map(children, (child) => {
    if (!isCarouselSlideElement(child)) {
      return child;
    }

    const currentSlideIndex = slideIndex;
    slideIndex += 1;

    const existingProps = child.props as CarouselSlideProps & CarouselSlideLabelProps;

    return React.cloneElement(child, {
      'aria-label':
        existingProps['aria-label'] ?? `Slide ${currentSlideIndex + 1} of ${slideCount}`,
    });
  });
};

const resolveContentChildren = (children: React.ReactNode) => {
  const childArray = React.Children.toArray(children);
  const contentChild = childArray.find(isCarouselContentElement);
  const nonContentChildren = childArray.filter((child) => !isCarouselContentElement(child));

  if (contentChild) {
    return {
      contentChild,
      controlChildren: nonContentChildren,
      slideChildren: getSlidesFromChildren(contentChild.props.children),
    };
  }

  const slideChildren = getSlidesFromChildren(children);
  const controlChildren = childArray.filter((child) => !isCarouselSlideElement(child));

  return {
    contentChild: null,
    controlChildren,
    slideChildren,
  };
};

const getSlideOffset = (container: HTMLDivElement, index: number) => {
  const slide = container.children.item(index);
  return slide instanceof HTMLElement ? slide.offsetLeft : 0;
};

const findClosestSlideIndex = (container: HTMLDivElement) => {
  const targetScrollLeft = container.scrollLeft;
  const slides = Array.from(container.children);

  if (slides.length === 0) {
    return 0;
  }

  let closestIndex = 0;
  let smallestDistance = Number.POSITIVE_INFINITY;

  slides.forEach((slide, index) => {
    if (!(slide instanceof HTMLElement)) {
      return;
    }

    const distance = Math.abs(slide.offsetLeft - targetScrollLeft);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
};

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultIndex?: number;
  index?: number;
  onIndexChange?: (index: number) => void;
  loop?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  pauseOnHover?: boolean;
  slidesPerView?: number;
  gap?: CarouselGap;
  orientation?: CarouselOrientation;
  className?: string | undefined;
  children: React.ReactNode;
  'aria-label'?: string;
  'aria-roledescription'?: string;
}

export interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string | undefined;
  children: React.ReactNode;
}

export interface CarouselSlideProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string | undefined;
  children: React.ReactNode;
}

export interface CarouselDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string | undefined;
}

interface CarouselDotProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  index: number;
  active: boolean;
}

export const useCarousel = () => {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a Carousel');
  }

  return context;
};

export const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, children, style, tabIndex, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(styles.content, className)}
      style={style}
      tabIndex={tabIndex ?? 0}
      {...props}
    >
      {children}
    </div>
  )
);

CarouselContent.displayName = 'CarouselContent';

export const CarouselSlide = React.forwardRef<HTMLDivElement, CarouselSlideProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(styles.slide, className)}
      role="group"
      aria-roledescription="slide"
      {...props}
    >
      {children}
    </div>
  )
);

CarouselSlide.displayName = 'CarouselSlide';

const InternalCarouselContent = React.forwardRef<HTMLDivElement, InternalCarouselContentProps>(
  ({ className, children, internalStyle, onScroll, scrollRef, style, ...props }, ref) => (
    <CarouselContent
      ref={mergeRefs(ref, scrollRef)}
      className={className}
      style={{ ...internalStyle, ...style }}
      onScroll={onScroll}
      {...props}
    >
      {children}
    </CarouselContent>
  )
);

InternalCarouselContent.displayName = 'InternalCarouselContent';

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      defaultIndex = 0,
      index: controlledIndex,
      onIndexChange,
      loop = false,
      autoplay = false,
      autoplayInterval = 4000,
      pauseOnHover = true,
      slidesPerView = 1,
      gap = 'md',
      orientation = 'horizontal',
      className,
      children,
      'aria-label': ariaLabel,
      'aria-roledescription': ariaRoleDescription = 'carousel',
      ...props
    },
    ref
  ) => {
    const isControlled = controlledIndex !== undefined;
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const hasMountedRef = React.useRef(false);
    const scrollSyncTimeoutRef = React.useRef<number | null>(null);
    const { contentChild, controlChildren, slideChildren } = resolveContentChildren(children);
    const [renderedSlideCount, setRenderedSlideCount] = React.useState(slideChildren.length);
    const slideCount = renderedSlideCount || slideChildren.length;
    const [internalIndex, setInternalIndex] = React.useState(() =>
      clampIndex(defaultIndex, slideCount, loop)
    );
    const [isInteractionPaused, setIsInteractionPaused] = React.useState(false);
    const [isUserPaused, setIsUserPaused] = React.useState(false);
    const currentIndex = clampIndex(
      isControlled ? (controlledIndex ?? 0) : internalIndex,
      slideCount,
      loop
    );

    const setCurrentIndex = React.useCallback(
      (nextIndex: number) => {
        const resolvedIndex = clampIndex(nextIndex, slideCount, loop);

        if (resolvedIndex === currentIndex) {
          return;
        }

        if (!isControlled) {
          setInternalIndex(resolvedIndex);
        }

        onIndexChange?.(resolvedIndex);
      },
      [currentIndex, isControlled, loop, onIndexChange, slideCount]
    );

    const syncIndexFromScroll = React.useCallback(() => {
      const container = contentRef.current;
      if (!container || slideCount <= 0) {
        return;
      }

      const nextIndex = findClosestSlideIndex(container);
      setCurrentIndex(nextIndex);
    }, [setCurrentIndex, slideCount]);

    const scrollToIndex = React.useCallback(
      (nextIndex: number, behavior: ScrollBehavior) => {
        const container = contentRef.current;
        if (!container || slideCount <= 0) {
          return;
        }

        container.scrollTo({
          left: getSlideOffset(container, clampIndex(nextIndex, slideCount, loop)),
          behavior,
        });
      },
      [loop, slideCount]
    );

    const goTo = React.useCallback(
      (nextIndex: number) => {
        if (slideCount <= 0) {
          return;
        }

        const resolvedIndex = clampIndex(nextIndex, slideCount, loop);

        if (resolvedIndex === currentIndex) {
          return;
        }

        setCurrentIndex(resolvedIndex);
      },
      [currentIndex, loop, setCurrentIndex, slideCount]
    );

    const prev = React.useCallback(() => {
      if (!loop && currentIndex <= 0) {
        return;
      }

      goTo(currentIndex - 1);
    }, [currentIndex, goTo, loop]);

    const next = React.useCallback(() => {
      if (!loop && currentIndex >= slideCount - 1) {
        return;
      }

      goTo(currentIndex + 1);
    }, [currentIndex, goTo, loop, slideCount]);

    const pause = React.useCallback(() => {
      setIsInteractionPaused(true);
    }, []);

    const resume = React.useCallback(() => {
      setIsInteractionPaused(false);
    }, []);

    const togglePause = React.useCallback(() => {
      setIsUserPaused((previous) => !previous);
    }, []);

    const effectiveIsPaused = isInteractionPaused || isUserPaused;

    React.useEffect(() => {
      if (slideCount <= 0) {
        return;
      }

      if (!isControlled) {
        setInternalIndex((previousIndex) => clampIndex(previousIndex, slideCount, loop));
      }
    }, [isControlled, loop, slideCount]);

    React.useEffect(() => {
      if (slideCount <= 0) {
        return;
      }

      if (!hasMountedRef.current && currentIndex === 0) {
        hasMountedRef.current = true;
        return;
      }

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior = hasMountedRef.current && !prefersReducedMotion ? 'smooth' : 'auto';
      scrollToIndex(currentIndex, behavior);
      hasMountedRef.current = true;
    }, [currentIndex, scrollToIndex, slideCount]);

    React.useEffect(() => {
      return () => {
        if (scrollSyncTimeoutRef.current !== null) {
          window.clearTimeout(scrollSyncTimeoutRef.current);
        }
      };
    }, []);

    React.useEffect(() => {
      const container = contentRef.current;
      if (!container) {
        setRenderedSlideCount(slideChildren.length);
        return;
      }

      const renderedSlides = Array.from(container.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement
      );
      const nextSlideCount = renderedSlides.length;

      setRenderedSlideCount(nextSlideCount);

      renderedSlides.forEach((slide, index) => {
        if (!slide.getAttribute('aria-label')) {
          slide.setAttribute('aria-label', `Slide ${index + 1} of ${nextSlideCount}`);
        }
      });
    }, [children, slideChildren.length]);

    React.useEffect(() => {
      if (!autoplay || effectiveIsPaused || slideCount <= 1) {
        return;
      }

      const intervalId = window.setInterval(() => {
        next();
      }, autoplayInterval);

      return () => {
        window.clearInterval(intervalId);
      };
    }, [autoplay, autoplayInterval, effectiveIsPaused, next, slideCount]);

    React.useEffect(() => {
      const rootElement = rootRef.current;
      if (!rootElement) {
        return;
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (orientation !== 'horizontal') {
          return;
        }

        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          prev();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          next();
        } else if (event.key === 'Home') {
          event.preventDefault();
          goTo(0);
        } else if (event.key === 'End') {
          event.preventDefault();
          goTo(slideCount - 1);
        }
      };

      const handleFocusIn = () => {
        if (pauseOnHover) {
          pause();
        }
      };

      const handleFocusOut = (event: FocusEvent) => {
        if (!pauseOnHover) {
          return;
        }

        if (rootElement.contains(event.relatedTarget as Node | null)) {
          return;
        }

        resume();
      };

      const handleMouseEnter = () => {
        if (pauseOnHover) {
          pause();
        }
      };

      const handleMouseLeave = () => {
        if (pauseOnHover) {
          resume();
        }
      };

      rootElement.addEventListener('keydown', handleKeyDown);
      rootElement.addEventListener('focusin', handleFocusIn);
      rootElement.addEventListener('focusout', handleFocusOut);
      rootElement.addEventListener('mouseenter', handleMouseEnter);
      rootElement.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        rootElement.removeEventListener('keydown', handleKeyDown);
        rootElement.removeEventListener('focusin', handleFocusIn);
        rootElement.removeEventListener('focusout', handleFocusOut);
        rootElement.removeEventListener('mouseenter', handleMouseEnter);
        rootElement.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, [goTo, next, orientation, pause, pauseOnHover, prev, resume, slideCount]);

    const handleScroll = React.useCallback<React.UIEventHandler<HTMLDivElement>>(() => {
      if (scrollSyncTimeoutRef.current !== null) {
        window.clearTimeout(scrollSyncTimeoutRef.current);
      }

      scrollSyncTimeoutRef.current = window.setTimeout(() => {
        syncIndexFromScroll();
        scrollSyncTimeoutRef.current = null;
      }, 120);
    }, [syncIndexFromScroll]);

    const canGoPrev = loop ? slideCount > 1 : currentIndex > 0;
    const canGoNext = loop ? slideCount > 1 : currentIndex < slideCount - 1;

    const contextValue = React.useMemo<CarouselState>(
      () => ({
        currentIndex,
        slideCount,
        canGoPrev,
        canGoNext,
        isPaused: isUserPaused,
        goTo,
        prev,
        next,
        togglePause,
        pause,
        resume,
      }),
      [
        canGoNext,
        canGoPrev,
        currentIndex,
        goTo,
        isUserPaused,
        next,
        pause,
        prev,
        resume,
        slideCount,
        togglePause,
      ]
    );

    const contentStyle = {
      '--dds-carousel-slides-per-view': String(slidesPerView),
      '--dds-carousel-gap': gapMap[gap],
    } as React.CSSProperties;

    const resolvedSlides = injectSlideMetadata(
      contentChild ? contentChild.props.children : slideChildren,
      slideCount
    );

    return (
      <CarouselContext.Provider value={contextValue}>
        <div
          ref={mergeRefs(ref, rootRef)}
          className={clsx(styles.carousel, className)}
          aria-label={ariaLabel}
          aria-roledescription={ariaRoleDescription}
          {...props}
        >
          {contentChild ? (
            <InternalCarouselContent
              {...contentChild.props}
              scrollRef={contentRef}
              internalStyle={contentStyle}
              onScroll={handleScroll}
            >
              {resolvedSlides}
            </InternalCarouselContent>
          ) : (
            <InternalCarouselContent
              scrollRef={contentRef}
              internalStyle={contentStyle}
              onScroll={handleScroll}
            >
              {resolvedSlides}
            </InternalCarouselContent>
          )}
          {controlChildren}
          <span className={styles.liveRegion} aria-live="polite" aria-atomic="true">
            {autoplay && slideCount > 0 ? `Slide ${currentIndex + 1} of ${slideCount}` : ''}
          </span>
        </div>
      </CarouselContext.Provider>
    );
  }
);

Carousel.displayName = 'Carousel';

export const CarouselPrevButton = React.forwardRef<HTMLButtonElement, CarouselNavButtonProps>(
  (props, ref) => {
    const { className, onClick, disabled, ...buttonProps } = props;
    const { prev, canGoPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        icon={ChevronLeft}
        aria-label="Previous slide"
        disabled={disabled ?? !canGoPrev}
        className={clsx(styles.prevButton, className)}
        onClick={(event) => {
          onClick?.(event);

          if (!event.defaultPrevented) {
            prev();
          }
        }}
        {...buttonProps}
      />
    );
  }
);

CarouselPrevButton.displayName = 'CarouselPrevButton';

export const CarouselNextButton = React.forwardRef<HTMLButtonElement, CarouselNavButtonProps>(
  (props, ref) => {
    const { className, onClick, disabled, ...buttonProps } = props;
    const { next, canGoNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        icon={ChevronRight}
        aria-label="Next slide"
        disabled={disabled ?? !canGoNext}
        className={clsx(styles.nextButton, className)}
        onClick={(event) => {
          onClick?.(event);

          if (!event.defaultPrevented) {
            next();
          }
        }}
        {...buttonProps}
      />
    );
  }
);

CarouselNextButton.displayName = 'CarouselNextButton';

export const CarouselDots = React.forwardRef<HTMLDivElement, CarouselDotsProps>(
  ({ className, ...props }, ref) => {
    const { currentIndex, slideCount, goTo } = useCarousel();

    return (
      <div
        ref={ref}
        className={clsx(styles.dots, className)}
        role="tablist"
        aria-label="Slide navigation"
        {...props}
      >
        {Array.from({ length: slideCount }, (_, index) => (
          <CarouselDot
            key={index}
            index={index}
            active={index === currentIndex}
            onClick={() => {
              goTo(index);
            }}
          />
        ))}
      </div>
    );
  }
);

CarouselDots.displayName = 'CarouselDots';

export const CarouselDot = React.forwardRef<HTMLButtonElement, CarouselDotProps>(
  ({ index, active, className, type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? 'button'}
      role="tab"
      aria-label={`Go to slide ${index + 1}`}
      aria-selected={active}
      className={clsx(styles.dot, active && styles.dotActive, className)}
      {...props}
    />
  )
);

CarouselDot.displayName = 'CarouselDot';

# Carousel · node scaffolding.mjs Carousel

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/Button/
packages/components/src/components/
```

- Previous/next navigation buttons use the existing `Button` component with `variant="ghost"` and `iconOnly`. Match the exact icon-only API `Button` exposes.
- No Radix primitive is required. Carousel is built with the CSS Scroll Snap API for scrolling and a small React state layer for controlled navigation, dots, and keyboard support.
- Do NOT use any third-party carousel library (Embla, Swiper, Splide, etc.).

---

## Scaffold location

```
packages/components/src/components/Carousel/
  Carousel.tsx
  Carousel.module.scss
  Carousel.test.tsx
  Carousel.stories.tsx
  index.ts
```

---

## Purpose

`Carousel` presents a horizontal sequence of slides that the user can navigate through one at a time (or peek at the next). It supports pointer drag/swipe (via native scroll), prev/next arrow buttons, dot indicators, optional autoplay, and keyboard navigation.

**Use cases:** image galleries, feature highlight sequences, testimonial rotators, onboarding step panels, product variant previews.

**Not a substitute for:** tab panels (use `Tabs`), steppers (use `Stepper`), or infinite scrolling lists.

---

## Exports from `index.ts`

```ts
export {
  Carousel,
  CarouselContent,
  CarouselSlide,
  CarouselPrevButton,
  CarouselNextButton,
  CarouselDots,
  CarouselDot,
  useCarousel,
};
export type { CarouselProps, CarouselContentProps, CarouselSlideProps, CarouselDotsProps };
```

---

## Types

```ts
export interface CarouselProps {
  defaultIndex?: number; // uncontrolled start slide — default: 0
  index?: number; // controlled current slide index
  onIndexChange?: (index: number) => void;
  loop?: boolean; // default: false — wraps around at ends
  autoplay?: boolean; // default: false
  autoplayInterval?: number; // ms — default: 4000
  pauseOnHover?: boolean; // default: true — pauses autoplay on hover
  slidesPerView?: number; // default: 1 — supports 1, 1.2, 1.5, 2, 3 (partial peek via fractional)
  gap?: 'none' | 'sm' | 'md' | 'lg'; // default: 'md' — gap between slides
  orientation?: 'horizontal'; // only horizontal supported — reserved for future vertical
  className?: string;
  children: React.ReactNode;
  // Accessible labels — required when multiple carousels exist on a page
  'aria-label'?: string; // e.g. "Product images"
  'aria-roledescription'?: string; // default: "carousel"
}

export interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface CarouselSlideProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface CarouselDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
```

---

## Architecture

### State

```ts
interface CarouselState {
  currentIndex: number;
  slideCount: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  goTo: (index: number) => void;
  prev: () => void;
  next: () => void;
}
```

Expose via `useCarousel()` hook backed by a `CarouselContext`. This allows `CarouselPrevButton`, `CarouselNextButton`, and `CarouselDots` to connect without prop drilling.

### Scroll Snap implementation

`CarouselContent` is a horizontally scrolling `<div>` with:

```css
display: flex;
overflow-x: scroll;
scroll-snap-type: x mandatory;
scrollbar-width: none; /* hide scrollbar — navigation via buttons/dots/drag */
-ms-overflow-style: none;
```

Each `CarouselSlide` has:

```css
scroll-snap-align: start;
flex: 0 0 calc((100% - (gap * (slidesPerView - 1))) / slidesPerView);
```

`slidesPerView` and `gap` are passed to `CarouselContent` via CSS custom properties (documented exception):

```tsx
style={{
  '--carousel-slides-per-view': slidesPerView,
  '--carousel-gap': gapMap[gap],
} as React.CSSProperties}
```

### Programmatic scrolling

When `goTo(index)` is called (from prev/next buttons or dot clicks):

```ts
const scrollToIndex = (index: number) => {
  const container = scrollRef.current;
  if (!container) return;
  const slide = container.children[index] as HTMLElement;
  slide?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
};
```

### Active index tracking

Use an `IntersectionObserver` on each slide to detect which is currently visible and update `currentIndex`. This keeps dot indicators and prev/next button states in sync with both programmatic scrolling AND native touch/pointer scrolling.

```ts
React.useEffect(() => {
  const container = scrollRef.current;
  if (!container) return;
  const slides = Array.from(container.children) as HTMLElement[];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = slides.indexOf(entry.target as HTMLElement);
          if (idx !== -1) setCurrentIndex(idx);
        }
      });
    },
    { root: container, threshold: 0.5 }
  );

  slides.forEach((slide) => observer.observe(slide));
  return () => observer.disconnect();
}, [slideCount]);
```

### Autoplay

```ts
React.useEffect(() => {
  if (!autoplay) return;
  if (isPaused) return;
  const id = setInterval(() => {
    next(); // next() wraps around when loop=true, stops at end when loop=false
  }, autoplayInterval);
  return () => clearInterval(id);
}, [autoplay, autoplayInterval, isPaused, currentIndex]);
```

`isPaused` is set to `true` on `onMouseEnter` and `onFocus` on the carousel root (when `pauseOnHover` is true), and reset on `onMouseLeave` and `onBlur`.

### loop behaviour

When `loop={false}` (default):

- `canGoPrev` is `false` when `currentIndex === 0`
- `canGoNext` is `false` when `currentIndex === slideCount - 1`
- Prev/next buttons get `disabled` prop when at the boundary

When `loop={true}`:

- `prev()` wraps from index 0 to `slideCount - 1`
- `next()` wraps from `slideCount - 1` to 0
- Prev/next buttons are never disabled

### slidesPerView CSS custom property exception

```tsx
// On CarouselContent:
style={{
  '--carousel-slides-per-view': String(slidesPerView ?? 1),
  '--carousel-gap': gapMap[gap ?? 'md'],
} as React.CSSProperties}
```

This is a documented exception — these are dynamic layout values that cannot be expressed as static token classes.

---

## Component structure

```tsx
// Carousel.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../Button';
import styles from './Carousel.module.scss';

// Gap token map
const gapMap: Record<NonNullable<CarouselProps['gap']>, string> = {
  none: '0px',
  sm: 'var(--dds-space-2)',
  md: 'var(--dds-space-4)',
  lg: 'var(--dds-space-6)',
};

// ─── Context ──────────────────────────────────────────────────────────────────

const CarouselContext = React.createContext<CarouselState | null>(null);

export const useCarousel = (): CarouselState => {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) throw new Error('useCarousel must be used within a Carousel');
  return ctx;
};

// ─── Carousel root ────────────────────────────────────────────────────────────

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
      className,
      children,
      'aria-label': ariaLabel,
      'aria-roledescription': ariaRoleDescription = 'carousel',
      ...props
    },
    ref
  ) => {
    const isControlled = controlledIndex !== undefined;
    const [internalIndex, setInternalIndex] = React.useState(defaultIndex);
    const currentIndex = isControlled ? controlledIndex! : internalIndex;
    const [slideCount, setSlideCount] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const setCurrentIndex = React.useCallback(
      (idx: number) => {
        if (!isControlled) setInternalIndex(idx);
        onIndexChange?.(idx);
      },
      [isControlled, onIndexChange]
    );

    const goTo = React.useCallback(
      (idx: number) => {
        const clamped = loop
          ? ((idx % slideCount) + slideCount) % slideCount
          : Math.max(0, Math.min(idx, slideCount - 1));
        setCurrentIndex(clamped);
        const container = scrollRef.current;
        if (!container) return;
        const slide = container.children[clamped] as HTMLElement;
        slide?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      },
      [loop, slideCount, setCurrentIndex]
    );

    const prev = React.useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);
    const next = React.useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);

    const canGoPrev = loop ? true : currentIndex > 0;
    const canGoNext = loop ? true : currentIndex < slideCount - 1;

    // Autoplay
    React.useEffect(() => {
      if (!autoplay || isPaused) return;
      const id = setInterval(next, autoplayInterval);
      return () => clearInterval(id);
    }, [autoplay, autoplayInterval, isPaused, next]);

    // IntersectionObserver to sync currentIndex with scroll position
    React.useEffect(() => {
      const container = scrollRef.current;
      if (!container) return;
      const slides = Array.from(container.children) as HTMLElement[];
      setSlideCount(slides.length);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const idx = slides.indexOf(entry.target as HTMLElement);
              if (idx !== -1) setCurrentIndex(idx);
            }
          });
        },
        { root: container, threshold: 0.5 }
      );
      slides.forEach((slide) => observer.observe(slide));
      return () => observer.disconnect();
    }, [setCurrentIndex]);

    const contextValue: CarouselState = {
      currentIndex,
      slideCount,
      canGoPrev,
      canGoNext,
      goTo,
      prev,
      next,
    };

    return (
      <CarouselContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={clsx(styles.carousel, className)}
          aria-label={ariaLabel}
          aria-roledescription={ariaRoleDescription}
          onMouseEnter={() => pauseOnHover && setIsPaused(true)}
          onMouseLeave={() => pauseOnHover && setIsPaused(false)}
          onFocus={() => pauseOnHover && setIsPaused(true)}
          onBlur={() => pauseOnHover && setIsPaused(false)}
          {...props}
        >
          <CarouselContentInternal scrollRef={scrollRef} slidesPerView={slidesPerView} gap={gap}>
            {children}
          </CarouselContentInternal>
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = 'Carousel';

// ─── CarouselContent ──────────────────────────────────────────────────────────
// Internal version holds the scrollRef; public version for consumer JSX.

// The public CarouselContent is the scroll container rendered by Carousel internally.
// Consumers use <CarouselSlide> directly inside <Carousel>.
// The separate <CarouselContent> export allows advanced consumers to wrap slides
// in a custom scroll region if needed.

export const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.content, className)} {...props}>
      {children}
    </div>
  )
);
CarouselContent.displayName = 'CarouselContent';

// ─── CarouselSlide ────────────────────────────────────────────────────────────

export const CarouselSlide = React.forwardRef<HTMLDivElement, CarouselSlideProps>(
  ({ className, children, ...props }, ref) => {
    const { currentIndex, slideCount } = useCarousel();

    // Each slide needs to know its own index for aria-label.
    // Use a data attribute set by the parent to determine index.
    // Simpler: wrap in a render-counting context — but that's complex.
    // Instead: require consumer to pass aria-label or aria-roledescription per slide,
    // OR use a SlideIndex context populated by CarouselContent via React.Children.map.
    // Implementation choice: use React.Children.map in CarouselContent to clone
    // each slide and inject its index as a data attribute / context value.
    // The agent should implement this pattern.

    return (
      <div
        ref={ref}
        className={clsx(styles.slide, className)}
        role="group"
        aria-roledescription="slide"
        {...props}
      >
        {children}
      </div>
    );
  }
);
CarouselSlide.displayName = 'CarouselSlide';

// ─── CarouselPrevButton ───────────────────────────────────────────────────────

export const CarouselPrevButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { prev, canGoPrev } = useCarousel();
  return (
    <Button
      ref={ref}
      variant="ghost"
      iconOnly
      icon={ChevronLeft}
      aria-label="Previous slide"
      disabled={!canGoPrev}
      onClick={(e) => {
        prev();
        onClick?.(e);
      }}
      className={clsx(styles.prevButton, className)}
      {...props}
    />
  );
});
CarouselPrevButton.displayName = 'CarouselPrevButton';

// ─── CarouselNextButton ───────────────────────────────────────────────────────

export const CarouselNextButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { next, canGoNext } = useCarousel();
  return (
    <Button
      ref={ref}
      variant="ghost"
      iconOnly
      icon={ChevronRight}
      aria-label="Next slide"
      disabled={!canGoNext}
      onClick={(e) => {
        next();
        onClick?.(e);
      }}
      className={clsx(styles.nextButton, className)}
      {...props}
    />
  );
});
CarouselNextButton.displayName = 'CarouselNextButton';

// ─── CarouselDots ─────────────────────────────────────────────────────────────

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
        {Array.from({ length: slideCount }, (_, i) => (
          <CarouselDot key={i} index={i} active={i === currentIndex} onClick={() => goTo(i)} />
        ))}
      </div>
    );
  }
);
CarouselDots.displayName = 'CarouselDots';

// ─── CarouselDot ──────────────────────────────────────────────────────────────

interface CarouselDotProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  index: number;
  active: boolean;
}

export const CarouselDot = React.forwardRef<HTMLButtonElement, CarouselDotProps>(
  ({ index, active, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-label={`Go to slide ${index + 1}`}
      aria-selected={active}
      className={clsx(styles.dot, active && styles.dotActive, className)}
      {...props}
    />
  )
);
CarouselDot.displayName = 'CarouselDot';
```

### Slide index injection via React.Children

Inside the `Carousel` root (or `CarouselContent`), use `React.Children.map` to inject `aria-label` on each `CarouselSlide`:

```tsx
// Inside the scroll container render:
const slidesWithLabels = React.Children.map(children, (child, i) => {
  if (!React.isValidElement(child)) return child;
  return React.cloneElement(child as React.ReactElement<CarouselSlideProps>, {
    'aria-label':
      (child.props as CarouselSlideProps)['aria-label'] ?? `Slide ${i + 1} of ${slideCount}`,
  });
});
```

This ensures every slide has an accessible label without requiring consumers to add it manually.

---

## Keyboard navigation

The carousel root div is not focusable. Navigation is via the `CarouselPrevButton`, `CarouselNextButton`, and `CarouselDot` buttons. Additionally, attach a `onKeyDown` to the carousel root to handle Arrow keys when any child has focus:

```tsx
onKeyDown={(e) => {
  if (e.key === 'ArrowLeft')  { e.preventDefault(); prev() }
  if (e.key === 'ArrowRight') { e.preventDefault(); next() }
  if (e.key === 'Home')       { e.preventDefault(); goTo(0) }
  if (e.key === 'End')        { e.preventDefault(); goTo(slideCount - 1) }
}}
```

This implements the ARIA Carousel Pattern keyboard contract.

---

## SCSS — Carousel.module.scss

```scss
@use '../../../styles/mixins' as *;

// ─── Carousel root ────────────────────────────────────────────────────────────

.carousel {
  position: relative;
  width: 100%;
  // Do not clip here — allow prev/next buttons to be positioned outside if needed
}

// ─── Scroll container ────────────────────────────────────────────────────────

.content {
  display: flex;
  gap: var(--carousel-gap, var(--dds-space-4));
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;

  // Hide scrollbar — navigation via buttons/dots/drag only
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  // Prevent overscroll chaining on iOS
  overscroll-behavior-x: contain;

  // Respect reduced motion — disable smooth scroll snap
  @media (prefers-reduced-motion: reduce) {
    scroll-behavior: auto;
  }
}

// ─── Slide ───────────────────────────────────────────────────────────────────

.slide {
  // Width is calculated from the slidesPerView custom property
  flex: 0 0
    calc(
      (
          100% -
            (var(--carousel-gap, var(--dds-space-4)) * (var(--carousel-slides-per-view, 1) - 1))
        ) /
        var(--carousel-slides-per-view, 1)
    );

  scroll-snap-align: start;
  min-width: 0;
  border-radius: var(--dds-radius-none);

  // Prevent slides from being focusable themselves —
  // interactive content inside slides handles their own focus
  outline: none;
}

// ─── Prev / Next buttons ──────────────────────────────────────────────────────

.prevButton,
.nextButton {
  // Positioned by consumer via wrapper — these are unstyled beyond inheriting Button ghost styles.
  // A common layout places them flanking the scroll container:
  // [← prev] [scroll content] [next →]
  flex-shrink: 0;
}

// ─── Dot indicators ───────────────────────────────────────────────────────────

.dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--dds-space-2);
  padding: var(--dds-space-3) 0 0;
}

.dot {
  display: block;
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: var(--dds-radius-full); // documented exception — indicator dot
  background-color: var(--dds-color-border-strong);
  cursor: pointer;
  transition:
    background-color var(--dds-duration-fast) var(--dds-ease-standard),
    width var(--dds-duration-fast) var(--dds-ease-standard);

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.dotActive {
  background-color: var(--dds-color-action-primary);
  width: 20px; // active dot expands width (pill shape) for visual distinction
}
```

---

## CSS custom property exceptions (documented)

| Property                     | Component       | Reason                                         |
| ---------------------------- | --------------- | ---------------------------------------------- |
| `--carousel-slides-per-view` | CarouselContent | Dynamic numeric layout value — no static token |
| `--carousel-gap`             | CarouselContent | Resolves at runtime from `gap` prop value      |

---

## Accessibility

This implementation follows the [ARIA Authoring Practices Guide — Carousel Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/).

### Roles and labels

- Carousel root: `aria-roledescription="carousel"`, `aria-label` required when multiple carousels exist on a page.
- Each `CarouselSlide`: `role="group"`, `aria-roledescription="slide"`, `aria-label="Slide N of M"` (auto-injected via `React.Children.map`; consumer can override).
- `CarouselDots`: `role="tablist"`, `aria-label="Slide navigation"`.
- `CarouselDot`: `role="tab"`, `aria-label="Go to slide N"`, `aria-selected={active}`.
- `CarouselPrevButton`: `aria-label="Previous slide"`.
- `CarouselNextButton`: `aria-label="Next slide"`.

### Autoplay

- When `autoplay={true}`, a pause/play control MUST be provided. The consumer is responsible for adding a pause button — expose `isPaused` state and a `togglePause` function via `useCarousel()` for this purpose.
- If autoplay is active, announce slide changes via a live region. Add an `aria-live="polite"` visually-hidden element that announces the current slide index when it changes:
  ```tsx
  <span className={styles.liveRegion} aria-live="polite" aria-atomic="true">
    {autoplay ? `Slide ${currentIndex + 1} of ${slideCount}` : ''}
  </span>
  ```
- `pauseOnHover` and `pauseOnFocus` are both `true` by default — this satisfies WCAG 2.2 SC 2.2.2 (Pause, Stop, Hide).

### Keyboard

| Key             | Behaviour                                                                  |
| --------------- | -------------------------------------------------------------------------- |
| `Tab`           | Moves focus through prev/next buttons, dots, and interactive slide content |
| `ArrowLeft`     | Previous slide (when focus is within carousel)                             |
| `ArrowRight`    | Next slide                                                                 |
| `Home`          | First slide                                                                |
| `End`           | Last slide                                                                 |
| `Enter`/`Space` | Activates focused dot or button                                            |

### Non-colour distinction

- Active dot: wider pill shape (8px → 20px) + primary colour — shape change ensures status is not conveyed by colour alone.
- Disabled prev/next buttons: native `disabled` attribute + 50% opacity via Button component's disabled styles.

### Touch / pointer

- Native CSS scroll snap handles swipe — no custom pointer event logic needed.
- `overscroll-behavior-x: contain` prevents accidental page navigation on mobile.

---

## TDD — write ALL tests before implementing

Run scaffolding first: `node scaffolding.mjs Carousel`

```
// Structure
- renders carousel root with aria-roledescription="carousel"
- renders aria-label when provided
- each CarouselSlide has role="group"
- each CarouselSlide has aria-roledescription="slide"
- each CarouselSlide has aria-label "Slide N of M" (auto-injected)
- consumer-provided aria-label on CarouselSlide is not overridden
- CarouselDots renders one dot per slide
- CarouselDot has role="tab"
- CarouselDot has aria-selected="true" for active slide
- CarouselDot has aria-selected="false" for inactive slides
- CarouselPrevButton has aria-label="Previous slide"
- CarouselNextButton has aria-label="Next slide"

// Navigation
- goTo(index) scrolls to the correct slide
- prev() decrements currentIndex
- next() increments currentIndex
- clicking CarouselPrevButton calls prev()
- clicking CarouselNextButton calls next()
- clicking CarouselDot calls goTo(index)

// Boundaries — loop=false (default)
- prev button is disabled at index 0
- next button is disabled at last slide
- prev() does nothing at index 0
- next() does nothing at last slide

// Boundaries — loop=true
- prev button is NOT disabled at index 0
- next button is NOT disabled at last slide
- prev() from index 0 goes to last slide
- next() from last slide goes to index 0

// Controlled mode
- renders with provided index
- calls onIndexChange when slide changes
- does not update internal index when controlled

// Keyboard
- ArrowRight navigates to next slide
- ArrowLeft navigates to previous slide
- Home navigates to first slide
- End navigates to last slide

// Autoplay
- autoplay calls next() at autoplayInterval
- autoplay pauses on mouse enter when pauseOnHover=true
- autoplay resumes on mouse leave
- autoplay pauses on focus
- autoplay resumes on blur
- autoplay does NOT pause on hover when pauseOnHover=false
- autoplay live region announces current slide when active

// useCarousel
- throws if used outside Carousel

// Accessibility
- carousel root has aria-roledescription="carousel"
- CarouselDots has role="tablist"
- slides have role="group"

// axe
- axe: 3 slides, prev/next buttons, dots
- axe: loop=true
- axe: autoplay=true with pause button
- axe: slidesPerView=2
- axe: single slide (no prev/next needed — buttons disabled)
- axe: no dots rendered
- axe: with aria-label on carousel root
```

---

## Stories — `Carousel.stories.tsx`

Title: `Core Components/Carousel`

**Note:** All stories must pass `aria-label` to the `Carousel` component since multiple carousels appear on the same page in Storybook.

Named exports required:

- `Default` — 5 slides, numbered placeholder panels (coloured with subtle background tokens). Prev/next buttons flanking the scroll area, dots below.
- `WithImages` — 4 slides each containing a 16:9 image (use `https://picsum.photos/seed/{n}/800/450` as placeholder). Demonstrates `CardMedia`-style image fills inside slides.
- `Loop` — `loop={true}`. 4 slides. Story note: "Wraps around at both ends."
- `Autoplay` — `autoplay={true}` `autoplayInterval={2000}`. Includes a pause/play toggle button using `useCarousel()`. Required for WCAG 2.2.2 compliance.
- `SlidesPerView2` — `slidesPerView={2}` `gap="md"`. 6 slides.
- `PeekNext` — `slidesPerView={1.2}` `gap="sm"`. Shows partial next slide as affordance. 5 slides.
- `NoDots` — prev/next buttons only, no `CarouselDots`.
- `NoButtons` — `CarouselDots` only, no prev/next buttons. Swipe/scroll to navigate.
- `Controlled` — `index` and `onIndexChange` managed with `useState`. External slide counter displayed: "Slide 2 of 5".
- `SingleSlide` — 1 slide. Prev/next buttons both disabled. Dot shows single active indicator.

`NavigateForward` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const nextBtn = within(canvasElement).getByRole('button', { name: /next slide/i });
  await expect(nextBtn).not.toBeDisabled();
  await userEvent.click(nextBtn);
  const dots = within(canvasElement).getAllByRole('tab');
  await expect(dots[1]).toHaveAttribute('aria-selected', 'true');
};
```

`KeyboardNavigation` with `play()`:

```ts
play: async ({ canvasElement }) => {
  // Focus the carousel area first
  const carousel = canvasElement.querySelector('[aria-roledescription="carousel"]') as HTMLElement;
  carousel?.focus();
  await userEvent.keyboard('{ArrowRight}');
  const dots = within(canvasElement).getAllByRole('tab');
  await expect(dots[1]).toHaveAttribute('aria-selected', 'true');
  await userEvent.keyboard('{End}');
  await expect(dots[dots.length - 1]).toHaveAttribute('aria-selected', 'true');
  await userEvent.keyboard('{Home}');
  await expect(dots[0]).toHaveAttribute('aria-selected', 'true');
};
```

`PrevDisabledAtStart` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const prevBtn = within(canvasElement).getByRole('button', { name: /previous slide/i });
  await expect(prevBtn).toBeDisabled();
  const nextBtn = within(canvasElement).getByRole('button', { name: /next slide/i });
  await userEvent.click(nextBtn);
  await expect(prevBtn).not.toBeDisabled();
};
```

Use `autodocs`. Storybook group: `Core Components/Carousel`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants and states
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] `aria-roledescription="carousel"` on root, `"slide"` on each slide — verified in tests
- [ ] Auto-injected `aria-label="Slide N of M"` on each slide — verified in tests
- [ ] `CarouselDots` uses `role="tablist"` / `role="tab"` / `aria-selected` — verified
- [ ] Arrow key navigation (Left/Right/Home/End) functional — verified in play() and tests
- [ ] Autoplay pauses on hover and focus — verified in tests
- [ ] Autoplay story includes a pause/play toggle button — WCAG 2.2.2 compliance
- [ ] Autoplay live region announces current slide — verified in tests
- [ ] Active dot uses pill shape (width change) + colour — not colour alone
- [ ] `loop=false` disables prev at index 0 and next at last slide — verified
- [ ] `loop=true` wraps around both ends — verified
- [ ] `--carousel-slides-per-view` and `--carousel-gap` are the only inline custom properties
- [ ] Native scroll snap used — no third-party library
- [ ] `scrollbar-width: none` hides scrollbar — navigation via controls only
- [ ] `overscroll-behavior-x: contain` prevents page navigation on touch
- [ ] `prefers-reduced-motion` disables scroll-behavior: smooth and dot transitions
- [ ] `border-radius: var(--dds-radius-none)` on slide — `var(--dds-radius-full)` only on dots
- [ ] No Tailwind. No hardcoded color or spacing values in SCSS.
- [ ] `useCarousel` throws outside `Carousel` — verified in tests
- [ ] Exported from `packages/components/src/index.ts`

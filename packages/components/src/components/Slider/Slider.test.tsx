import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Slider, type SliderProps } from './Slider';
import styles from './Slider.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

beforeAll(() => {
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ??
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  track: getRequiredClassName(styles, 'track'),
  range: getRequiredClassName(styles, 'range'),
  thumb: getRequiredClassName(styles, 'thumb'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  horizontal: getRequiredClassName(styles, 'horizontal'),
  vertical: getRequiredClassName(styles, 'vertical'),
} as const;

const rangeAriaLabels: Pick<SliderProps, 'thumbLabels'> = {
  thumbLabels: ['Minimum value', 'Maximum value'],
};

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

const getRoot = (container: HTMLElement = document.body) => {
  const root = container.querySelector(`.${classNames.root}`);

  expect(root).toBeInstanceOf(HTMLSpanElement);
  return root as HTMLSpanElement;
};

const getThumbs = (container: HTMLElement = document.body) => {
  const thumbs = Array.from(container.querySelectorAll('[role="slider"]'));

  expect(thumbs.length).toBeGreaterThan(0);
  thumbs.forEach((thumb) => expect(thumb).toBeInstanceOf(HTMLSpanElement));

  return thumbs as HTMLSpanElement[];
};

const getThumb = (container: HTMLElement = document.body) => {
  const [thumb] = getThumbs(container);

  expect(thumb).toBeInstanceOf(HTMLSpanElement);
  return thumb as HTMLSpanElement;
};

const getTrack = (container: HTMLElement = document.body) => {
  const track = container.querySelector(`.${classNames.track}`);

  expect(track).toBeInstanceOf(HTMLSpanElement);
  return track as HTMLSpanElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Slider', () => {
  it('renders a slider with role="slider" on the thumb', () => {
    const { container } = render(<Slider aria-label="Volume" />);

    expect(getThumb(container)).toHaveAttribute('role', 'slider');
  });

  it('thumb has aria-valuenow=0 by default', () => {
    const { container } = render(<Slider aria-label="Volume" />);

    expect(getThumb(container)).toHaveAttribute('aria-valuenow', '0');
  });

  it('thumb has aria-valuemin matching min prop', () => {
    const { container } = render(<Slider min={10} defaultValue={[20]} aria-label="Volume" />);

    expect(getThumb(container)).toHaveAttribute('aria-valuemin', '10');
  });

  it('thumb has aria-valuemax matching max prop', () => {
    const { container } = render(<Slider max={50} defaultValue={[20]} aria-label="Volume" />);

    expect(getThumb(container)).toHaveAttribute('aria-valuemax', '50');
  });

  it('forwards className to the root element', () => {
    const { container } = render(<Slider className="custom-slider" aria-label="Volume" />);

    expect(getRoot(container)).toHaveClass('custom-slider');
  });

  it('forwards ref to root HTMLSpanElement', () => {
    const ref = React.createRef<HTMLSpanElement>();
    const { container } = render(<Slider ref={ref} aria-label="Volume" />);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toBe(getRoot(container));
  });

  it('applies .md class by default', () => {
    const { container } = render(<Slider aria-label="Volume" />);

    expect(getRoot(container)).toHaveClass(classNames.md);
  });

  it('applies .sm class when size="sm"', () => {
    const { container } = render(<Slider size="sm" aria-label="Volume" />);

    expect(getRoot(container)).toHaveClass(classNames.sm);
  });

  it('renders two thumbs for range slider', () => {
    const { container } = render(<Slider value={[20, 80]} {...rangeAriaLabels} />);

    expect(getThumbs(container)).toHaveLength(2);
  });

  it('applies the provided thumb labels to a range slider', () => {
    const { container } = render(<Slider value={[20, 80]} {...rangeAriaLabels} />);
    const [minimumThumb, maximumThumb] = getThumbs(container);

    expect(minimumThumb).toHaveAccessibleName('Minimum value');
    expect(maximumThumb).toHaveAccessibleName('Maximum value');
  });

  it('calls onValueChange when thumb is moved', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Slider defaultValue={[0]} onValueChange={onValueChange} aria-label="Volume" />
    );
    const thumb = getThumb(container);

    await act(async () => {
      thumb.focus();
      await user.keyboard('{ArrowRight}');
    });

    expect(onValueChange).toHaveBeenCalledWith([1]);
  });

  it('does not call onValueChange when disabled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Slider disabled defaultValue={[0]} onValueChange={onValueChange} aria-label="Volume" />
    );

    await act(async () => {
      getThumb(container).focus();
      await user.keyboard('{ArrowRight}');
    });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('forwards disabled to the root', () => {
    const { container } = render(<Slider disabled aria-label="Volume" />);

    expect(getRoot(container)).toHaveAttribute('data-disabled');
    expect(getThumb(container)).toHaveAttribute('data-disabled');
  });

  it('orientation="horizontal" renders with horizontal layout', () => {
    const { container } = render(<Slider orientation="horizontal" aria-label="Volume" />);

    expect(getRoot(container)).toHaveClass(classNames.horizontal);
    expect(getTrack(container)).toHaveClass(classNames.track);
  });

  it('orientation="vertical" renders with vertical layout', () => {
    const { container } = render(<Slider orientation="vertical" aria-label="Volume" />);

    expect(getRoot(container)).toHaveClass(classNames.vertical);
    expect(getTrack(container)).toHaveClass(classNames.track);
  });

  it('forwards name prop for form participation', () => {
    const { container } = render(
      <form>
        <Slider name="volume" defaultValue={[25]} aria-label="Volume" />
      </form>
    );

    expect(container.querySelector('input[name="volume"]')).toBeInTheDocument();
  });

  it('keyboard: thumb receives focus on Tab', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <a href="/">before</a>
        <Slider aria-label="Volume" />
      </div>
    );

    await act(async () => {
      await user.tab();
      await user.tab();
    });

    expect(getThumb(container)).toHaveFocus();
  });

  it('keyboard: ArrowRight increases value', async () => {
    const user = userEvent.setup();
    const { container } = render(<Slider defaultValue={[0]} aria-label="Volume" />);
    const thumb = getThumb(container);

    await act(async () => {
      thumb.focus();
      await user.keyboard('{ArrowRight}');
    });

    expect(thumb).toHaveAttribute('aria-valuenow', '1');
  });

  it('keyboard: ArrowLeft decreases value', async () => {
    const user = userEvent.setup();
    const { container } = render(<Slider defaultValue={[10]} aria-label="Volume" />);
    const thumb = getThumb(container);

    await act(async () => {
      thumb.focus();
      await user.keyboard('{ArrowLeft}');
    });

    expect(thumb).toHaveAttribute('aria-valuenow', '9');
  });

  it('keyboard: Home sets value to min', async () => {
    const user = userEvent.setup();
    const { container } = render(<Slider min={5} defaultValue={[20]} aria-label="Volume" />);
    const thumb = getThumb(container);

    await act(async () => {
      thumb.focus();
      await user.keyboard('{Home}');
    });

    expect(thumb).toHaveAttribute('aria-valuenow', '5');
  });

  it('keyboard: End sets value to max', async () => {
    const user = userEvent.setup();
    const { container } = render(<Slider max={50} defaultValue={[20]} aria-label="Volume" />);
    const thumb = getThumb(container);

    await act(async () => {
      thumb.focus();
      await user.keyboard('{End}');
    });

    expect(thumb).toHaveAttribute('aria-valuenow', '50');
  });

  it('keyboard: disabled thumb does not respond to arrow keys', async () => {
    const user = userEvent.setup();
    const { container } = render(<Slider disabled defaultValue={[20]} aria-label="Volume" />);
    const thumb = getThumb(container);

    await act(async () => {
      thumb.focus();
      await user.keyboard('{ArrowRight}');
    });

    expect(thumb).toHaveAttribute('aria-valuenow', '20');
  });

  it('axe passes for default horizontal slider', async () => {
    const { container } = render(<Slider aria-label="Volume" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes for vertical slider', async () => {
    const { container } = render(<Slider orientation="vertical" aria-label="Volume" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes for range slider', async () => {
    const { container } = render(<Slider defaultValue={[20, 80]} {...rangeAriaLabels} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes when disabled', async () => {
    const { container } = render(<Slider disabled aria-label="Volume" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes with aria-label forwarded', async () => {
    const { container } = render(<Slider aria-label="Project priority" />);

    expect(getThumb(container)).toHaveAccessibleName('Project priority');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses required tokens, documented exceptions, and focus styles', () => {
    const stylesheet = readFileSync('src/components/Slider/Slider.module.scss', 'utf8');

    expect(stylesheet).toContain("@use '../../styles/mixins' as *;");
    expect(stylesheet).toContain("@use '../../styles/breakpoints' as *;");
    expect(stylesheet).toContain('background-color: var(--dds-color-bg-subtle);');
    expect(stylesheet).toContain('background-color: var(--dds-color-action-primary);');
    expect(stylesheet).toContain('border-radius: var(--dds-radius-none);');
    expect(stylesheet).toContain('border: 2px solid var(--dds-color-action-primary);');
    expect(stylesheet).toContain('box-shadow: var(--dds-shadow-sm);');
    expect(stylesheet).toContain('outline: 3px solid transparent;');
    expect(stylesheet).toContain('outline-offset: 2px;');
    expect(stylesheet).toContain('oklch(from var(--dds-color-focus-ring) l c h / 0.5)');
    expect(stylesheet).not.toContain('var(--dds-radius-full)');
    expect(stylesheet).not.toContain('solid white');
    expect(stylesheet).not.toContain('::-webkit-slider-thumb');
    expect(stylesheet).not.toContain('outline: none;');
    expect(stylesheet).not.toContain('.storyA11yScope');
  });

  it('keeps story-only selectors out of runtime styles', () => {
    const runtimeStyles = readFileSync('src/components/Slider/Slider.module.scss', 'utf8');
    const storyStyles = readFileSync('src/components/Slider/Slider.stories.module.scss', 'utf8');

    expect(runtimeStyles).not.toContain('.story');
    expect(storyStyles).toContain('.storyA11yScope');
  });
});

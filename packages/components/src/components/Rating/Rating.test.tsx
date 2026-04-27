import '@testing-library/jest-dom/vitest';
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { Rating } from './Rating';
import styles from './Rating.module.scss';

expect.extend(toHaveNoViolations);

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  star: getRequiredClassName(styles, 'star'),
  readOnly: getRequiredClassName(styles, 'readOnly'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
  fillFull: getRequiredClassName(styles, 'fillFull'),
  fillHalf: getRequiredClassName(styles, 'fillHalf'),
  fillEmpty: getRequiredClassName(styles, 'fillEmpty'),
} as const;

const getRoot = (container: HTMLElement) =>
  (container.querySelector('[role="radiogroup"], [role="img"]') as HTMLDivElement | null) ?? null;

const getStars = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(`.${classNames.star}`)) as Array<
    HTMLButtonElement | HTMLSpanElement
  >;

const getRadioStars = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('button[role="radio"]')) as HTMLButtonElement[];

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

describe('Rating', () => {
  it('renders a div with role="radiogroup" by default', () => {
    const { container } = render(<Rating />);
    const root = getRoot(container);

    expect(root).toBeInstanceOf(HTMLDivElement);
    expect(root).toHaveAttribute('role', 'radiogroup');
    expect(root).toHaveAccessibleName('Rating');
  });

  it('renders five radio buttons by default', () => {
    const { container } = render(<Rating />);

    expect(getRadioStars(container)).toHaveLength(5);
  });

  it('forwards className to the root element', () => {
    const { container } = render(<Rating className="custom-rating" />);

    expect(getRoot(container)).toHaveClass('custom-rating');
  });

  it('forwards ref to the root HTMLDivElement', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(<Rating ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(getRoot(container));
  });

  it('applies the md size class by default', () => {
    const { container } = render(<Rating />);

    expect(getRoot(container)).toHaveClass(classNames.md);
  });

  it('applies the requested size class', () => {
    const { container } = render(<Rating size="lg" />);

    expect(getRoot(container)).toHaveClass(classNames.lg);
    expect(getRoot(container)).not.toHaveClass(classNames.sm);
  });

  it('uses the provided label for the interactive group', () => {
    const { container } = render(<Rating label="Product rating" />);

    expect(getRoot(container)).toHaveAccessibleName('Product rating');
  });

  it('uses defaultValue for uncontrolled selection', () => {
    const { container } = render(<Rating defaultValue={3} />);
    const stars = getRadioStars(container);

    expect(stars[2]).toHaveAttribute('aria-checked', 'true');
    expect(stars[0]).toHaveClass(classNames.fillFull);
    expect(stars[1]).toHaveClass(classNames.fillFull);
    expect(stars[2]).toHaveClass(classNames.fillFull);
    expect(stars[3]).toHaveClass(classNames.fillEmpty);
  });

  it('uses value for controlled selection', () => {
    const { container } = render(<Rating value={4} />);
    const stars = getRadioStars(container);

    expect(stars[3]).toHaveAttribute('aria-checked', 'true');
    expect(stars[3]).toHaveClass(classNames.fillFull);
    expect(stars[4]).toHaveClass(classNames.fillEmpty);
  });

  it('clicking a star updates uncontrolled state and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<Rating defaultValue={1} onChange={onChange} />);
    const stars = getRadioStars(container);

    await act(async () => {
      await user.click(stars[3]!);
    });

    expect(onChange).toHaveBeenCalledWith(4);
    expect(stars[3]).toHaveAttribute('aria-checked', 'true');
    expect(stars[0]).toHaveClass(classNames.fillFull);
    expect(stars[1]).toHaveClass(classNames.fillFull);
    expect(stars[2]).toHaveClass(classNames.fillFull);
    expect(stars[3]).toHaveClass(classNames.fillFull);
  });

  it('clicking a star in controlled mode calls onChange without changing selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<Rating value={2} onChange={onChange} />);
    const stars = getRadioStars(container);

    await act(async () => {
      await user.click(stars[4]!);
    });

    expect(onChange).toHaveBeenCalledWith(5);
    expect(stars[1]).toHaveAttribute('aria-checked', 'true');
    expect(stars[4]).toHaveAttribute('aria-checked', 'false');
  });

  it('only the selected radio is tabbable when a value is selected', () => {
    const { container } = render(<Rating value={3} />);
    const stars = getRadioStars(container);

    expect(stars[0]).toHaveAttribute('tabindex', '-1');
    expect(stars[1]).toHaveAttribute('tabindex', '-1');
    expect(stars[2]).toHaveAttribute('tabindex', '0');
    expect(stars[3]).toHaveAttribute('tabindex', '-1');
  });

  it('the first radio is tabbable when the current value is zero', () => {
    const { container } = render(<Rating value={0} />);
    const stars = getRadioStars(container);

    expect(stars[0]).toHaveAttribute('tabindex', '0');
    expect(stars[1]).toHaveAttribute('tabindex', '-1');
  });

  it('ArrowRight selects the next star and moves focus', async () => {
    const user = userEvent.setup();
    const { container } = render(<Rating defaultValue={2} />);
    const stars = getRadioStars(container);

    await act(async () => {
      stars[1]!.focus();
      await user.keyboard('{ArrowRight}');
    });

    expect(stars[2]).toHaveFocus();
    expect(stars[2]).toHaveAttribute('aria-checked', 'true');
  });

  it('ArrowLeft selects the previous star and moves focus', async () => {
    const user = userEvent.setup();
    const { container } = render(<Rating defaultValue={3} />);
    const stars = getRadioStars(container);

    await act(async () => {
      stars[2]!.focus();
      await user.keyboard('{ArrowLeft}');
    });

    expect(stars[1]).toHaveFocus();
    expect(stars[1]).toHaveAttribute('aria-checked', 'true');
  });

  it('Home and End move to the first and last stars', async () => {
    const user = userEvent.setup();
    const { container } = render(<Rating defaultValue={3} />);
    const stars = getRadioStars(container);

    await act(async () => {
      stars[2]!.focus();
      await user.keyboard('{Home}');
    });
    expect(stars[0]).toHaveFocus();
    expect(stars[0]).toHaveAttribute('aria-checked', 'true');

    await act(async () => {
      await user.keyboard('{End}');
    });
    expect(stars[4]).toHaveFocus();
    expect(stars[4]).toHaveAttribute('aria-checked', 'true');
  });

  it('hover previews a higher value and resets on mouse leave', () => {
    const { container } = render(<Rating defaultValue={2} />);
    const root = getRoot(container) as HTMLDivElement;
    const stars = getRadioStars(container);

    act(() => {
      fireEvent.mouseEnter(stars[3]!);
    });

    expect(stars[2]).toHaveClass(classNames.fillFull);
    expect(stars[3]).toHaveClass(classNames.fillFull);

    act(() => {
      fireEvent.mouseLeave(root);
    });

    expect(stars[2]).toHaveClass(classNames.fillEmpty);
    expect(stars[3]).toHaveClass(classNames.fillEmpty);
  });

  it('renders a read-only image when readOnly is true', () => {
    const { container } = render(<Rating readOnly value={3.5} allowHalf />);
    const root = getRoot(container);

    expect(root).toHaveAttribute('role', 'img');
    expect(root).toHaveAccessibleName('3.5 out of 5 stars');
    expect(root).toHaveClass(classNames.readOnly);
    expect(getRadioStars(container)).toHaveLength(0);
  });

  it('renders a half-filled star in read-only mode when allowHalf is true', () => {
    const { container } = render(<Rating readOnly value={3.5} allowHalf />);
    const stars = getStars(container);

    expect(stars[3]).toHaveClass(classNames.fillHalf);
    expect(container.querySelectorAll('clipPath')).toHaveLength(1);
  });

  it('respects the max prop', () => {
    const { container } = render(<Rating max={7} value={6} />);

    expect(getRadioStars(container)).toHaveLength(7);
  });

  it('axe: passes in interactive mode', async () => {
    const { container } = render(<Rating label="Customer rating" defaultValue={4} />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes in read-only mode', async () => {
    const { container } = render(<Rating readOnly value={4.5} allowHalf />);

    expect(await axe(container)).toHaveNoViolations();
  });
});

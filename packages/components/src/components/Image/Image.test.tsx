import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Image } from './Image';
import styles from './Image.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  cover: getRequiredClassName(styles, 'cover'),
  contain: getRequiredClassName(styles, 'contain'),
  fill: getRequiredClassName(styles, 'fill'),
  rounded: getRequiredClassName(styles, 'rounded'),
  stateError: getRequiredClassName(styles, 'stateError'),
  ratio1x1: getRequiredClassName(styles, 'ratio1x1'),
  ratio4x3: getRequiredClassName(styles, 'ratio4x3'),
  ratio16x9: getRequiredClassName(styles, 'ratio16x9'),
  ratio3x2: getRequiredClassName(styles, 'ratio3x2'),
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

const getImage = (container: HTMLElement) => {
  const image = container.querySelector('img');

  expect(image).toBeInstanceOf(HTMLImageElement);
  return image as HTMLImageElement;
};

const getFigure = (container: HTMLElement) => {
  const figure = container.querySelector('figure');

  expect(figure).toBeInstanceOf(HTMLElement);
  return figure as HTMLElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Image', () => {
  it('renders an img element', () => {
    const { container } = render(<Image src="/image.jpg" alt="Product dashboard" />);

    expect(getImage(container)).toBeInTheDocument();
  });

  it('has the correct src attribute', () => {
    const { container } = render(<Image src="/image.jpg" alt="Product dashboard" />);

    expect(getImage(container)).toHaveAttribute('src', '/image.jpg');
  });

  it('has an alt attribute and allows an empty decorative alt', () => {
    const { container } = render(
      <div>
        <Image src="/image.jpg" alt="Product dashboard" />
        <Image src="/texture.jpg" alt="" />
      </div>
    );

    const images = container.querySelectorAll('img');
    expect(images[0]).toHaveAttribute('alt', 'Product dashboard');
    expect(images[1]).toHaveAttribute('alt', '');
  });

  it('forwards ref to the HTMLImageElement', () => {
    const ref = React.createRef<HTMLImageElement>();

    const { container } = render(<Image ref={ref} src="/image.jpg" alt="Product dashboard" />);

    expect(ref.current).toBeInstanceOf(HTMLImageElement);
    expect(ref.current).toBe(getImage(container));
  });

  it('forwards className to the img', () => {
    const { container } = render(
      <Image className="custom-image" src="/image.jpg" alt="Product dashboard" />
    );

    expect(getImage(container)).toHaveClass('custom-image');
  });

  it('renders img directly when no aspectRatio prop is provided', () => {
    const { container } = render(<Image src="/image.jpg" alt="Product dashboard" />);

    expect(container.querySelector('figure')).not.toBeInTheDocument();
    expect(container.firstElementChild).toBe(getImage(container));
  });

  it('renders a figure wrapper when aspectRatio is provided', () => {
    const { container } = render(
      <Image src="/image.jpg" alt="Product dashboard" aspectRatio="16/9" />
    );

    expect(getFigure(container)).toContainElement(getImage(container));
  });

  it('applies the cover class by default when fit is not specified', () => {
    const { container } = render(<Image src="/image.jpg" alt="Product dashboard" />);

    expect(getImage(container)).toHaveClass(classNames.cover);
  });

  it('applies the contain class when fit is contain', () => {
    const { container } = render(<Image src="/image.jpg" alt="Product dashboard" fit="contain" />);

    expect(getImage(container)).toHaveClass(classNames.contain);
  });

  it('applies the fill class when fit is fill', () => {
    const { container } = render(<Image src="/image.jpg" alt="Product dashboard" fit="fill" />);

    expect(getImage(container)).toHaveClass(classNames.fill);
  });

  it('applies the rounded class when rounded is true', () => {
    const { container } = render(<Image src="/image.jpg" alt="Product dashboard" rounded={true} />);

    expect(getImage(container)).toHaveClass(classNames.rounded);
  });

  it('does not apply the rounded class when rounded is false', () => {
    const { container } = render(
      <Image src="/image.jpg" alt="Product dashboard" rounded={false} />
    );

    expect(getImage(container)).not.toHaveClass(classNames.rounded);
  });

  it('applies ratio1x1 on figure when aspectRatio is 1/1', () => {
    const { container } = render(
      <Image src="/image.jpg" alt="Product dashboard" aspectRatio="1/1" />
    );

    expect(getFigure(container)).toHaveClass(classNames.ratio1x1);
  });

  it('applies ratio4x3 on figure when aspectRatio is 4/3', () => {
    const { container } = render(
      <Image src="/image.jpg" alt="Product dashboard" aspectRatio="4/3" />
    );

    expect(getFigure(container)).toHaveClass(classNames.ratio4x3);
  });

  it('applies ratio16x9 on figure when aspectRatio is 16/9', () => {
    const { container } = render(
      <Image src="/image.jpg" alt="Product dashboard" aspectRatio="16/9" />
    );

    expect(getFigure(container)).toHaveClass(classNames.ratio16x9);
  });

  it('applies ratio3x2 on figure when aspectRatio is 3/2', () => {
    const { container } = render(
      <Image src="/image.jpg" alt="Product dashboard" aspectRatio="3/2" />
    );

    expect(getFigure(container)).toHaveClass(classNames.ratio3x2);
  });

  it('has loading lazy by default', () => {
    const { container } = render(<Image src="/image.jpg" alt="Product dashboard" />);

    expect(getImage(container)).toHaveAttribute('loading', 'lazy');
  });

  it('has loading eager when loading is eager', () => {
    const { container } = render(
      <Image src="/image.jpg" alt="Product dashboard" loading="eager" />
    );

    expect(getImage(container)).toHaveAttribute('loading', 'eager');
  });

  it('forwards width and height to the img', () => {
    const { container } = render(
      <Image src="/image.jpg" alt="Product dashboard" width={640} height="360" />
    );

    expect(getImage(container)).toHaveAttribute('width', '640');
    expect(getImage(container)).toHaveAttribute('height', '360');
  });

  it('forwards arbitrary HTML props to the img', () => {
    const { container } = render(
      <Image
        src="/image.jpg"
        alt="Product dashboard"
        data-testid="dashboard-image"
        decoding="async"
      />
    );

    expect(getImage(container)).toHaveAttribute('data-testid', 'dashboard-image');
    expect(getImage(container)).toHaveAttribute('decoding', 'async');
  });

  it('shows the placeholder state when the image fails to load', () => {
    const { container } = render(
      <Image src="/missing-image.jpg" alt="Missing image" aspectRatio="16/9" />
    );
    const image = getImage(container);

    act(() => {
      image.dispatchEvent(new Event('error'));
    });

    expect(image).toHaveClass(classNames.stateError);
    expect(image).toHaveAttribute('data-error', '');
  });

  it('forwards onError when the image fails to load', () => {
    const handleError = vi.fn();
    const { container } = render(
      <Image src="/missing-image.jpg" alt="Missing image" onError={handleError} />
    );

    act(() => {
      getImage(container).dispatchEvent(new Event('error'));
    });

    expect(handleError).toHaveBeenCalledTimes(1);
  });

  it('clears the placeholder error state and forwards onLoad when the image loads', () => {
    const handleLoad = vi.fn();
    const { container } = render(
      <Image src="/recovering-image.jpg" alt="Recovering image" onLoad={handleLoad} />
    );
    const image = getImage(container);

    act(() => {
      image.dispatchEvent(new Event('error'));
    });

    expect(image).toHaveClass(classNames.stateError);

    act(() => {
      image.dispatchEvent(new Event('load'));
    });

    expect(image).not.toHaveClass(classNames.stateError);
    expect(image).not.toHaveAttribute('data-error');
    expect(handleLoad).toHaveBeenCalledTimes(1);
  });

  it('axe passes with meaningful alt text', async () => {
    const { container } = render(<Image src="/image.jpg" alt="Product dashboard" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes with empty alt for a decorative image', async () => {
    const { container } = render(<Image src="/texture.jpg" alt="" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes with aspectRatio set', async () => {
    const { container } = render(
      <Image src="/image.jpg" alt="Product dashboard" aspectRatio="16/9" />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes for rounded variant', async () => {
    const { container } = render(
      <Image src="/headshot.jpg" alt="Ada Lovelace" aspectRatio="1/1" rounded={true} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

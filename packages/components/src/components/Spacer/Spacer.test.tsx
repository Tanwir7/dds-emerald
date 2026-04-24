import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { renderToString } from 'react-dom/server';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import styles from './Spacer.module.scss';
import { Spacer } from './Spacer';
import { Flex } from '../Flex';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const rootClassName = getRequiredClassName(styles, 'root');

const classNames = {
  sizeXs: getRequiredClassName(styles, 'sizeXs'),
  sizeSm: getRequiredClassName(styles, 'sizeSm'),
  sizeMd: getRequiredClassName(styles, 'sizeMd'),
  sizeLg: getRequiredClassName(styles, 'sizeLg'),
  sizeXl: getRequiredClassName(styles, 'sizeXl'),
  sizeFlex: getRequiredClassName(styles, 'sizeFlex'),
  axisHorizontal: getRequiredClassName(styles, 'axisHorizontal'),
  axisVertical: getRequiredClassName(styles, 'axisVertical'),
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

const getSpacer = (container: ParentNode = document) => {
  const element = container.querySelector(`.${rootClassName}`);

  expect(element).toBeTruthy();
  return element as HTMLElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Spacer', () => {
  it('renders a <span> by default', () => {
    render(<Spacer />);

    expect(getSpacer().tagName).toBe('SPAN');
  });

  it('renders as <div> when as="div"', () => {
    render(<Spacer as="div" />);

    expect(getSpacer().tagName).toBe('DIV');
  });

  it('does not accept children in the prop type', () => {
    expect(() =>
      renderToString(
        // @ts-expect-error Spacer is intentionally empty.
        <Spacer>content</Spacer>
      )
    ).not.toThrow();
  });

  it('always has aria-hidden="true"', () => {
    render(<Spacer />);

    expect(getSpacer()).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards className to the root element', () => {
    render(<Spacer className="custom-spacer" />);

    expect(getSpacer()).toHaveClass('custom-spacer');
  });

  it('forwards ref to the root element', () => {
    const ref = React.createRef<HTMLSpanElement>();

    render(<Spacer ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toBe(getSpacer());
  });

  it('applies .sizeMd by default', () => {
    render(<Spacer />);

    expect(getSpacer()).toHaveClass(classNames.sizeMd);
  });

  it('applies .sizeXs when size="xs"', () => {
    render(<Spacer size="xs" />);

    expect(getSpacer()).toHaveClass(classNames.sizeXs);
  });

  it('applies .sizeSm when size="sm"', () => {
    render(<Spacer size="sm" />);

    expect(getSpacer()).toHaveClass(classNames.sizeSm);
  });

  it('applies .sizeLg when size="lg"', () => {
    render(<Spacer size="lg" />);

    expect(getSpacer()).toHaveClass(classNames.sizeLg);
  });

  it('applies .sizeXl when size="xl"', () => {
    render(<Spacer size="xl" />);

    expect(getSpacer()).toHaveClass(classNames.sizeXl);
  });

  it('applies .sizeFlex when size="flex"', () => {
    render(<Spacer size="flex" />);

    expect(getSpacer()).toHaveClass(classNames.sizeFlex);
  });

  it('does not apply an axis class by default', () => {
    render(<Spacer />);

    expect(getSpacer()).not.toHaveClass(classNames.axisHorizontal);
    expect(getSpacer()).not.toHaveClass(classNames.axisVertical);
  });

  it('applies .axisHorizontal when axis="horizontal"', () => {
    render(<Spacer axis="horizontal" />);

    expect(getSpacer()).toHaveClass(classNames.axisHorizontal);
  });

  it('applies .axisVertical when axis="vertical"', () => {
    render(<Spacer axis="vertical" />);

    expect(getSpacer()).toHaveClass(classNames.axisVertical);
  });

  it('applies both .sizeMd and .axisHorizontal when size="md" axis="horizontal"', () => {
    render(<Spacer size="md" axis="horizontal" />);

    expect(getSpacer()).toHaveClass(classNames.sizeMd, classNames.axisHorizontal);
  });

  it('applies both .sizeLg and .axisVertical when size="lg" axis="vertical"', () => {
    render(<Spacer size="lg" axis="vertical" />);

    expect(getSpacer()).toHaveClass(classNames.sizeLg, classNames.axisVertical);
  });

  it('forwards data-testid and arbitrary props', () => {
    render(<Spacer data-testid="spacer" id="toolbar-gap" />);

    expect(getSpacer()).toHaveAttribute('data-testid', 'spacer');
    expect(getSpacer()).toHaveAttribute('id', 'toolbar-gap');
  });

  it('passes axe for the default render', async () => {
    const { container } = render(<Spacer />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe for size="flex"', async () => {
    const { container } = render(<Spacer size="flex" />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe for all axis values', async () => {
    const { container } = render(
      <div>
        <Spacer axis="both" />
        <Spacer axis="horizontal" />
        <Spacer axis="vertical" />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe when inside a Flex container', async () => {
    const { container } = render(
      <Flex align="center" gap="md">
        <span>Logo</span>
        <Spacer size="flex" axis="horizontal" />
        <span>Docs</span>
        <span>GitHub</span>
      </Flex>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

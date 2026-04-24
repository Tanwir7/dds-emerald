import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './Flex.module.scss';
import { Flex, FlexItem } from './Flex';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const rootClassName = getRequiredClassName(styles, 'root');
const itemClassName = getRequiredClassName(styles, 'item');

const classNames = {
  inline: getRequiredClassName(styles, 'inline'),
  row: getRequiredClassName(styles, 'row'),
  column: getRequiredClassName(styles, 'column'),
  rowReverse: getRequiredClassName(styles, 'rowReverse'),
  columnReverse: getRequiredClassName(styles, 'columnReverse'),
  nowrap: getRequiredClassName(styles, 'nowrap'),
  wrap: getRequiredClassName(styles, 'wrap'),
  wrapReverse: getRequiredClassName(styles, 'wrapReverse'),
  gapNone: getRequiredClassName(styles, 'gapNone'),
  gapMd: getRequiredClassName(styles, 'gapMd'),
  colGapLg: getRequiredClassName(styles, 'colGapLg'),
  rowGapSm: getRequiredClassName(styles, 'rowGapSm'),
  alignCenter: getRequiredClassName(styles, 'alignCenter'),
  alignBaseline: getRequiredClassName(styles, 'alignBaseline'),
  justifyBetween: getRequiredClassName(styles, 'justifyBetween'),
  justifyCenter: getRequiredClassName(styles, 'justifyCenter'),
  grow: getRequiredClassName(styles, 'grow'),
  noShrink: getRequiredClassName(styles, 'noShrink'),
  itemGrow: getRequiredClassName(styles, 'itemGrow'),
  itemNoGrow: getRequiredClassName(styles, 'itemNoGrow'),
  basisFull: getRequiredClassName(styles, 'basisFull'),
  selfCenter: getRequiredClassName(styles, 'selfCenter'),
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

const getFlex = (container: ParentNode = document) => {
  const element = container.querySelector(`.${rootClassName}`);

  expect(element).toBeTruthy();
  return element as HTMLElement;
};

const getFlexItem = (container: ParentNode = document) => {
  const element = container.querySelector(`.${itemClassName}`);

  expect(element).toBeTruthy();
  return element as HTMLElement;
};

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('Flex', () => {
  it('renders a <div> by default', () => {
    render(<Flex>content</Flex>);

    expect(getFlex().tagName).toBe('DIV');
  });

  it('renders as <span> when as="span"', () => {
    render(<Flex as="span">content</Flex>);

    expect(getFlex().tagName).toBe('SPAN');
  });

  it('renders children', () => {
    render(
      <Flex>
        <span>content</span>
      </Flex>
    );

    expect(getFlex()).toHaveTextContent('content');
  });

  it('forwards className to root element', () => {
    render(<Flex className="custom">content</Flex>);

    expect(getFlex()).toHaveClass('custom');
  });

  it('forwards ref to root element', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<Flex ref={ref}>content</Flex>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(getFlex());
  });

  it('does NOT apply .inline by default', () => {
    render(<Flex>content</Flex>);

    expect(getFlex()).not.toHaveClass(classNames.inline);
  });

  it('applies .inline when inline={true}', () => {
    render(<Flex inline>content</Flex>);

    expect(getFlex()).toHaveClass(classNames.inline);
  });

  it('does NOT apply direction class when direction not set', () => {
    render(<Flex>content</Flex>);

    expect(getFlex()).not.toHaveClass(classNames.row);
    expect(getFlex()).not.toHaveClass(classNames.column);
    expect(getFlex()).not.toHaveClass(classNames.rowReverse);
    expect(getFlex()).not.toHaveClass(classNames.columnReverse);
  });

  it('applies .row when direction="row"', () => {
    render(<Flex direction="row">content</Flex>);

    expect(getFlex()).toHaveClass(classNames.row);
  });

  it('applies .column when direction="column"', () => {
    render(<Flex direction="column">content</Flex>);

    expect(getFlex()).toHaveClass(classNames.column);
  });

  it('applies .rowReverse when direction="row-reverse"', () => {
    render(<Flex direction="row-reverse">content</Flex>);

    expect(getFlex()).toHaveClass(classNames.rowReverse);
  });

  it('applies .columnReverse when direction="column-reverse"', () => {
    render(<Flex direction="column-reverse">content</Flex>);

    expect(getFlex()).toHaveClass(classNames.columnReverse);
  });

  it('applies .nowrap by default', () => {
    render(<Flex>content</Flex>);

    expect(getFlex()).toHaveClass(classNames.nowrap);
  });

  it('applies .wrap when wrap="wrap"', () => {
    render(<Flex wrap="wrap">content</Flex>);

    expect(getFlex()).toHaveClass(classNames.wrap);
  });

  it('applies .wrapReverse when wrap="wrap-reverse"', () => {
    render(<Flex wrap="wrap-reverse">content</Flex>);

    expect(getFlex()).toHaveClass(classNames.wrapReverse);
  });

  it('does NOT apply gap class when gap not set', () => {
    render(<Flex>content</Flex>);

    expect(getFlex()).not.toHaveClass(classNames.gapNone);
    expect(getFlex()).not.toHaveClass(classNames.gapMd);
  });

  it('applies .gapNone when gap="none"', () => {
    render(<Flex gap="none">content</Flex>);

    expect(getFlex()).toHaveClass(classNames.gapNone);
  });

  it('applies .gapMd when gap="md"', () => {
    render(<Flex gap="md">content</Flex>);

    expect(getFlex()).toHaveClass(classNames.gapMd);
  });

  it('applies .colGapLg when columnGap="lg"', () => {
    render(<Flex columnGap="lg">content</Flex>);

    expect(getFlex()).toHaveClass(classNames.colGapLg);
  });

  it('applies .rowGapSm when rowGap="sm"', () => {
    render(<Flex rowGap="sm">content</Flex>);

    expect(getFlex()).toHaveClass(classNames.rowGapSm);
  });

  it('does NOT apply align class when align not set', () => {
    render(<Flex>content</Flex>);

    expect(getFlex()).not.toHaveClass(classNames.alignCenter);
    expect(getFlex()).not.toHaveClass(classNames.alignBaseline);
  });

  it('applies .alignCenter when align="center"', () => {
    render(<Flex align="center">content</Flex>);

    expect(getFlex()).toHaveClass(classNames.alignCenter);
  });

  it('applies .alignBaseline when align="baseline"', () => {
    render(<Flex align="baseline">content</Flex>);

    expect(getFlex()).toHaveClass(classNames.alignBaseline);
  });

  it('does NOT apply justify class when justify not set', () => {
    render(<Flex>content</Flex>);

    expect(getFlex()).not.toHaveClass(classNames.justifyBetween);
    expect(getFlex()).not.toHaveClass(classNames.justifyCenter);
  });

  it('applies .justifyBetween when justify="between"', () => {
    render(<Flex justify="between">content</Flex>);

    expect(getFlex()).toHaveClass(classNames.justifyBetween);
  });

  it('applies .justifyCenter when justify="center"', () => {
    render(<Flex justify="center">content</Flex>);

    expect(getFlex()).toHaveClass(classNames.justifyCenter);
  });

  it('does NOT apply .grow by default', () => {
    render(<Flex>content</Flex>);

    expect(getFlex()).not.toHaveClass(classNames.grow);
  });

  it('applies .grow when grow={true}', () => {
    render(<Flex grow>content</Flex>);

    expect(getFlex()).toHaveClass(classNames.grow);
  });

  it('does NOT apply .noShrink by default', () => {
    render(<Flex>content</Flex>);

    expect(getFlex()).not.toHaveClass(classNames.noShrink);
  });

  it('applies .noShrink when shrink={false}', () => {
    render(<Flex shrink={false}>content</Flex>);

    expect(getFlex()).toHaveClass(classNames.noShrink);
  });

  it('forwards id, aria-label, and data-testid', () => {
    render(
      <Flex id="layout" aria-label="Layout" data-testid="flex-root">
        content
      </Flex>
    );

    expect(getFlex()).toHaveAttribute('id', 'layout');
    expect(getFlex()).toHaveAttribute('aria-label', 'Layout');
    expect(getFlex()).toHaveAttribute('data-testid', 'flex-root');
  });

  it('forwards onClick', () => {
    const handleClick = vi.fn();

    render(<Flex onClick={handleClick}>content</Flex>);

    getFlex().click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('axe: passes for row flex', async () => {
    const { container } = render(<Flex gap="md">content</Flex>);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes for column flex', async () => {
    const { container } = render(
      <Flex direction="column" gap="md">
        <span>One</span>
        <span>Two</span>
      </Flex>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes with FlexItem children', async () => {
    const { container } = render(
      <Flex gap="md">
        <FlexItem>One</FlexItem>
        <FlexItem grow>Two</FlexItem>
      </Flex>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes for as="ul" with FlexItem as="li"', async () => {
    const { container } = render(
      <Flex as="ul" gap="sm">
        <FlexItem as="li">One</FlexItem>
        <FlexItem as="li">Two</FlexItem>
      </Flex>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('FlexItem', () => {
  it('renders a <div> by default', () => {
    render(<FlexItem>content</FlexItem>);

    expect(getFlexItem().tagName).toBe('DIV');
  });

  it('renders as <li> when as="li"', () => {
    render(<FlexItem as="li">content</FlexItem>);

    expect(getFlexItem().tagName).toBe('LI');
  });

  it('applies .itemGrow when grow={true}', () => {
    render(<FlexItem grow>content</FlexItem>);

    expect(getFlexItem()).toHaveClass(classNames.itemGrow);
  });

  it('applies .itemNoGrow when grow={false}', () => {
    render(<FlexItem grow={false}>content</FlexItem>);

    expect(getFlexItem()).toHaveClass(classNames.itemNoGrow);
  });

  it('applies .basisFull when basis="full"', () => {
    render(<FlexItem basis="full">content</FlexItem>);

    expect(getFlexItem()).toHaveClass(classNames.basisFull);
  });

  it('applies .selfCenter when align="center"', () => {
    render(<FlexItem align="center">content</FlexItem>);

    expect(getFlexItem()).toHaveClass(classNames.selfCenter);
  });

  it('forwards className and ref', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(
      <FlexItem ref={ref} className="custom">
        content
      </FlexItem>
    );

    expect(getFlexItem()).toHaveClass('custom');
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(getFlexItem());
  });

  it('warns in development mode when order is set', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const originalNodeEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = 'development';

    render(<FlexItem order={2}>content</FlexItem>);

    expect(warnSpy).toHaveBeenCalledWith(
      'FlexItem order should be avoided because it breaks logical tab order for keyboard users. Use DOM reordering instead.'
    );

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('does not warn in production mode when order is set', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const originalNodeEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = 'production';

    render(<FlexItem order={2}>content</FlexItem>);

    expect(warnSpy).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalNodeEnv;
  });
});

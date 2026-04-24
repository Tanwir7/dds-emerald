import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './Grid.module.scss';
import { Grid, GridItem } from './Grid';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const rootClassName = getRequiredClassName(styles, 'root');

const columnClassNames = {
  1: getRequiredClassName(styles, 'cols1'),
  2: getRequiredClassName(styles, 'cols2'),
  3: getRequiredClassName(styles, 'cols3'),
  4: getRequiredClassName(styles, 'cols4'),
} as const;

const smColumnClassNames = {
  1: getRequiredClassName(styles, 'smCols1'),
  2: getRequiredClassName(styles, 'smCols2'),
  3: getRequiredClassName(styles, 'smCols3'),
  4: getRequiredClassName(styles, 'smCols4'),
} as const;

const mdColumnClassNames = {
  1: getRequiredClassName(styles, 'mdCols1'),
  2: getRequiredClassName(styles, 'mdCols2'),
  3: getRequiredClassName(styles, 'mdCols3'),
  4: getRequiredClassName(styles, 'mdCols4'),
} as const;

const lgColumnClassNames = {
  1: getRequiredClassName(styles, 'lgCols1'),
  2: getRequiredClassName(styles, 'lgCols2'),
  3: getRequiredClassName(styles, 'lgCols3'),
  4: getRequiredClassName(styles, 'lgCols4'),
} as const;

const gapClassNames = {
  none: getRequiredClassName(styles, 'gapNone'),
  xs: getRequiredClassName(styles, 'gapXs'),
  sm: getRequiredClassName(styles, 'gapSm'),
  md: getRequiredClassName(styles, 'gapMd'),
  lg: getRequiredClassName(styles, 'gapLg'),
  xl: getRequiredClassName(styles, 'gapXl'),
} as const;

const columnGapClassNames = {
  lg: getRequiredClassName(styles, 'colGapLg'),
} as const;

const rowGapClassNames = {
  sm: getRequiredClassName(styles, 'rowGapSm'),
  xl: getRequiredClassName(styles, 'rowGapXl'),
} as const;

const alignClassNames = {
  center: getRequiredClassName(styles, 'alignCenter'),
  stretch: getRequiredClassName(styles, 'alignStretch'),
} as const;

const justifyClassNames = {
  center: getRequiredClassName(styles, 'justifyCenter'),
  stretch: getRequiredClassName(styles, 'justifyStretch'),
} as const;

const gridItemClassNames = {
  span2: getRequiredClassName(styles, 'span2'),
  spanFull: getRequiredClassName(styles, 'spanFull'),
  rowSpan2: getRequiredClassName(styles, 'rowSpan2'),
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

const getGrid = (container: ParentNode = document) => {
  const element = container.querySelector(`.${rootClassName}`);

  expect(element).toBeTruthy();
  return element as HTMLElement;
};

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('Grid', () => {
  it('renders a <div> by default', () => {
    render(<Grid>content</Grid>);

    expect(getGrid().tagName).toBe('DIV');
  });

  it('renders as <ul> when as="ul"', () => {
    render(
      <Grid as="ul">
        <GridItem as="li">One</GridItem>
      </Grid>
    );

    expect(getGrid().tagName).toBe('UL');
  });

  it('renders children', () => {
    render(
      <Grid>
        <span>content</span>
      </Grid>
    );

    expect(getGrid()).toHaveTextContent('content');
  });

  it('forwards className to root element', () => {
    render(<Grid className="custom">content</Grid>);

    expect(getGrid()).toHaveClass('custom');
  });

  it('forwards ref to root element', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<Grid ref={ref}>content</Grid>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(getGrid());
  });

  it('applies .cols1 by default when columns is not set', () => {
    render(<Grid>content</Grid>);

    expect(getGrid()).toHaveClass(columnClassNames[1]);
  });

  it('applies .cols1 when columns={1}', () => {
    render(<Grid columns={1}>content</Grid>);

    expect(getGrid()).toHaveClass(columnClassNames[1]);
  });

  it('applies .cols2 when columns={2}', () => {
    render(<Grid columns={2}>content</Grid>);

    expect(getGrid()).toHaveClass(columnClassNames[2]);
  });

  it('applies .cols3 when columns={3}', () => {
    render(<Grid columns={3}>content</Grid>);

    expect(getGrid()).toHaveClass(columnClassNames[3]);
  });

  it('applies .cols4 when columns={4}', () => {
    render(<Grid columns={4}>content</Grid>);

    expect(getGrid()).toHaveClass(columnClassNames[4]);
  });

  it('applies .cols1 when columns={{ default: 1 }}', () => {
    render(<Grid columns={{ default: 1 }}>content</Grid>);

    expect(getGrid()).toHaveClass(columnClassNames[1]);
  });

  it('applies .smCols2 when columns={{ sm: 2 }}', () => {
    render(<Grid columns={{ sm: 2 }}>content</Grid>);

    expect(getGrid()).toHaveClass(smColumnClassNames[2]);
  });

  it('applies .mdCols3 when columns={{ md: 3 }}', () => {
    render(<Grid columns={{ md: 3 }}>content</Grid>);

    expect(getGrid()).toHaveClass(mdColumnClassNames[3]);
  });

  it('applies .lgCols4 when columns={{ lg: 4 }}', () => {
    render(<Grid columns={{ lg: 4 }}>content</Grid>);

    expect(getGrid()).toHaveClass(lgColumnClassNames[4]);
  });

  it('applies multiple responsive column classes simultaneously', () => {
    render(<Grid columns={{ default: 1, md: 2, lg: 3 }}>content</Grid>);

    expect(getGrid()).toHaveClass(columnClassNames[1]);
    expect(getGrid()).toHaveClass(mdColumnClassNames[2]);
    expect(getGrid()).toHaveClass(lgColumnClassNames[3]);
  });

  it('applies .gapMd by default', () => {
    render(<Grid>content</Grid>);

    expect(getGrid()).toHaveClass(gapClassNames.md);
  });

  it('applies .gapNone when gap="none"', () => {
    render(<Grid gap="none">content</Grid>);

    expect(getGrid()).toHaveClass(gapClassNames.none);
  });

  it('applies .gapXs when gap="xs"', () => {
    render(<Grid gap="xs">content</Grid>);

    expect(getGrid()).toHaveClass(gapClassNames.xs);
  });

  it('applies .gapLg when gap="lg"', () => {
    render(<Grid gap="lg">content</Grid>);

    expect(getGrid()).toHaveClass(gapClassNames.lg);
  });

  it('applies .colGapLg when columnGap="lg"', () => {
    render(<Grid columnGap="lg">content</Grid>);

    expect(getGrid()).toHaveClass(columnGapClassNames.lg);
  });

  it('applies .rowGapSm when rowGap="sm"', () => {
    render(<Grid rowGap="sm">content</Grid>);

    expect(getGrid()).toHaveClass(rowGapClassNames.sm);
  });

  it('applies both columnGap and rowGap simultaneously', () => {
    render(
      <Grid columnGap="lg" rowGap="xl">
        content
      </Grid>
    );

    expect(getGrid()).toHaveClass(columnGapClassNames.lg);
    expect(getGrid()).toHaveClass(rowGapClassNames.xl);
  });

  it('applies .alignStretch by default', () => {
    render(<Grid>content</Grid>);

    expect(getGrid()).toHaveClass(alignClassNames.stretch);
  });

  it('applies .alignCenter when align="center"', () => {
    render(<Grid align="center">content</Grid>);

    expect(getGrid()).toHaveClass(alignClassNames.center);
  });

  it('applies .justifyStretch by default', () => {
    render(<Grid>content</Grid>);

    expect(getGrid()).toHaveClass(justifyClassNames.stretch);
  });

  it('applies .justifyCenter when justify="center"', () => {
    render(<Grid justify="center">content</Grid>);

    expect(getGrid()).toHaveClass(justifyClassNames.center);
  });

  it('forwards id, aria-label, and data-testid', () => {
    render(
      <Grid id="grid-id" aria-label="Grid label" data-testid="grid-test-id">
        content
      </Grid>
    );

    expect(getGrid()).toHaveAttribute('id', 'grid-id');
    expect(getGrid()).toHaveAttribute('aria-label', 'Grid label');
    expect(getGrid()).toHaveAttribute('data-testid', 'grid-test-id');
  });

  it('passes axe for a 1-column grid', async () => {
    const { container } = render(<Grid>content</Grid>);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe for a 3-column grid', async () => {
    const { container } = render(
      <Grid columns={3}>
        <GridItem>One</GridItem>
        <GridItem>Two</GridItem>
        <GridItem>Three</GridItem>
      </Grid>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe for a responsive grid', async () => {
    const { container } = render(
      <Grid columns={{ default: 1, sm: 2, lg: 3 }}>
        <GridItem>One</GridItem>
        <GridItem>Two</GridItem>
        <GridItem>Three</GridItem>
      </Grid>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe with GridItem children', async () => {
    const { container } = render(
      <Grid columns={3}>
        <GridItem colSpan={2}>Wide</GridItem>
        <GridItem>Item</GridItem>
      </Grid>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe for as="ul" with GridItem as="li"', async () => {
    const { container } = render(
      <Grid as="ul" columns={2}>
        <GridItem as="li">One</GridItem>
        <GridItem as="li">Two</GridItem>
      </Grid>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('GridItem', () => {
  it('renders a <div> by default', () => {
    render(
      <GridItem>
        <span>content</span>
      </GridItem>
    );

    expect(document.querySelector('span')?.parentElement?.tagName).toBe('DIV');
  });

  it('renders as <li> when as="li"', () => {
    render(
      <GridItem as="li">
        <span>content</span>
      </GridItem>
    );

    expect(document.querySelector('span')?.parentElement?.tagName).toBe('LI');
  });

  it('applies .span2 when colSpan={2}', () => {
    render(
      <GridItem colSpan={2}>
        <span>content</span>
      </GridItem>
    );

    expect(document.querySelector('span')?.parentElement).toHaveClass(gridItemClassNames.span2);
  });

  it('applies .spanFull when colSpan="full"', () => {
    render(
      <GridItem colSpan="full">
        <span>content</span>
      </GridItem>
    );

    expect(document.querySelector('span')?.parentElement).toHaveClass(gridItemClassNames.spanFull);
  });

  it('applies .rowSpan2 when rowSpan={2}', () => {
    render(
      <GridItem rowSpan={2}>
        <span>content</span>
      </GridItem>
    );

    expect(document.querySelector('span')?.parentElement).toHaveClass(gridItemClassNames.rowSpan2);
  });

  it('forwards className and ref', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(
      <GridItem ref={ref} className="custom">
        <span>content</span>
      </GridItem>
    );

    expect(document.querySelector('span')?.parentElement).toHaveClass('custom');
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(document.querySelector('span')?.parentElement);
  });
});

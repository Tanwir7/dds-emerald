import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import styles from './Text.module.scss';
import { Text } from './Text';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const sizes = ['xs', 'sm', 'base', 'lg', 'xl'] as const;
const alignments = ['left', 'center', 'right'] as const;

const sizeClassNames = {
  xs: getRequiredClassName(styles, 'sizeXs'),
  sm: getRequiredClassName(styles, 'sizeSm'),
  base: getRequiredClassName(styles, 'sizeBase'),
  lg: getRequiredClassName(styles, 'sizeLg'),
  xl: getRequiredClassName(styles, 'sizeXl'),
} as const;

const weightClassNames = {
  normal: getRequiredClassName(styles, 'weightNormal'),
  medium: getRequiredClassName(styles, 'weightMedium'),
  semibold: getRequiredClassName(styles, 'weightSemibold'),
  bold: getRequiredClassName(styles, 'weightBold'),
} as const;

const colorClassNames = {
  default: getRequiredClassName(styles, 'colorDefault'),
  muted: getRequiredClassName(styles, 'colorMuted'),
  'on-primary': getRequiredClassName(styles, 'colorOnPrimary'),
} as const;

const alignClassNames = {
  left: getRequiredClassName(styles, 'alignLeft'),
  center: getRequiredClassName(styles, 'alignCenter'),
  right: getRequiredClassName(styles, 'alignRight'),
} as const;

const rootClassName = getRequiredClassName(styles, 'root');

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

const getTextByContent = (text: string) => {
  const element = Array.from(document.querySelectorAll(`.${rootClassName}`)).find(
    (candidate) => candidate.textContent === text
  );

  expect(element).toBeTruthy();
  return element as HTMLElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Text', () => {
  it('renders as <p> by default', () => {
    render(<Text>content</Text>);

    expect(getTextByContent('content').tagName).toBe('P');
  });

  it('renders as <span> when as="span"', () => {
    render(<Text as="span">content</Text>);

    expect(getTextByContent('content').tagName).toBe('SPAN');
  });

  it('renders as <div> when as="div"', () => {
    render(<Text as="div">content</Text>);

    expect(getTextByContent('content').tagName).toBe('DIV');
  });

  it('renders as <label> when as="label"', () => {
    render(<Text as="label">content</Text>);

    expect(getTextByContent('content').tagName).toBe('LABEL');
  });

  it('renders as <strong> when as="strong"', () => {
    render(<Text as="strong">content</Text>);

    expect(getTextByContent('content').tagName).toBe('STRONG');
  });

  it('renders children', () => {
    render(<Text>content</Text>);

    expect(getTextByContent('content')).toBeInTheDocument();
  });

  it('applies size-base class by default', () => {
    render(<Text>content</Text>);

    expect(getTextByContent('content')).toHaveClass(sizeClassNames.base);
  });

  it('applies size-xs class', () => {
    render(<Text size="xs">content</Text>);

    expect(getTextByContent('content')).toHaveClass(sizeClassNames.xs);
  });

  it('applies size-sm class', () => {
    render(<Text size="sm">content</Text>);

    expect(getTextByContent('content')).toHaveClass(sizeClassNames.sm);
  });

  it('applies size-lg class', () => {
    render(<Text size="lg">content</Text>);

    expect(getTextByContent('content')).toHaveClass(sizeClassNames.lg);
  });

  it('applies size-xl class', () => {
    render(<Text size="xl">content</Text>);

    expect(getTextByContent('content')).toHaveClass(sizeClassNames.xl);
  });

  it('applies weight-normal class by default', () => {
    render(<Text>content</Text>);

    expect(getTextByContent('content')).toHaveClass(weightClassNames.normal);
  });

  it('applies weight-medium class', () => {
    render(<Text weight="medium">content</Text>);

    expect(getTextByContent('content')).toHaveClass(weightClassNames.medium);
  });

  it('applies weight-semibold class', () => {
    render(<Text weight="semibold">content</Text>);

    expect(getTextByContent('content')).toHaveClass(weightClassNames.semibold);
  });

  it('applies weight-bold class', () => {
    render(<Text weight="bold">content</Text>);

    expect(getTextByContent('content')).toHaveClass(weightClassNames.bold);
  });

  it('applies color-default class by default', () => {
    render(<Text>content</Text>);

    expect(getTextByContent('content')).toHaveClass(colorClassNames.default);
  });

  it('applies color-muted class', () => {
    render(<Text color="muted">content</Text>);

    expect(getTextByContent('content')).toHaveClass(colorClassNames.muted);
  });

  it('applies color-on-primary class', () => {
    render(<Text color="on-primary">content</Text>);

    expect(getTextByContent('content')).toHaveClass(colorClassNames['on-primary']);
  });

  it('does not apply alignment class by default', () => {
    render(<Text>content</Text>);

    const text = getTextByContent('content');
    alignments.forEach((align) => {
      expect(text).not.toHaveClass(alignClassNames[align]);
    });
  });

  it('applies align-left class', () => {
    render(<Text align="left">content</Text>);

    expect(getTextByContent('content')).toHaveClass(alignClassNames.left);
  });

  it('applies align-center class', () => {
    render(<Text align="center">content</Text>);

    expect(getTextByContent('content')).toHaveClass(alignClassNames.center);
  });

  it('applies align-right class', () => {
    render(<Text align="right">content</Text>);

    expect(getTextByContent('content')).toHaveClass(alignClassNames.right);
  });

  it('applies truncate class when truncate is true', () => {
    render(<Text truncate>content</Text>);

    expect(getTextByContent('content')).toHaveClass(getRequiredClassName(styles, 'truncate'));
  });

  it('does not apply truncate class by default', () => {
    render(<Text>content</Text>);

    expect(getTextByContent('content')).not.toHaveClass(getRequiredClassName(styles, 'truncate'));
  });

  it('forwards className', () => {
    render(<Text className="custom">content</Text>);

    expect(getTextByContent('content')).toHaveClass('custom');
  });

  it('forwards ref to the rendered element', () => {
    const ref = React.createRef<HTMLElement>();

    render(
      <Text as="span" ref={ref}>
        content
      </Text>
    );

    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('SPAN');
    expect(ref.current).toBe(getTextByContent('content'));
  });

  it('spreads additional HTML attributes onto the element', () => {
    render(
      <Text id="description" data-testid="text" title="Additional context">
        content
      </Text>
    );

    const text = getTextByContent('content');

    expect(text).toHaveAttribute('id', 'description');
    expect(text).toHaveAttribute('data-testid', 'text');
    expect(text).toHaveAttribute('title', 'Additional context');
  });

  it('has no a11y violations — default', async () => {
    const { container } = render(<Text>content</Text>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — as label', async () => {
    const { container } = render(
      <Text as="label">
        Label
        <input type="text" />
      </Text>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — all sizes', async () => {
    const { container } = render(
      <div>
        {sizes.map((size) => (
          <Text key={size} size={size}>
            {size}
          </Text>
        ))}
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

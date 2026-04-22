import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import styles from './Text.module.scss';
import { Text } from './Text';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const sizes = ['xs', 'sm', 'base', 'lg', 'xl'] as const;

const sizeClassNames = {
  xs: getRequiredClassName(styles, 'xs'),
  sm: getRequiredClassName(styles, 'sm'),
  base: getRequiredClassName(styles, 'base'),
  lg: getRequiredClassName(styles, 'lg'),
  xl: getRequiredClassName(styles, 'xl'),
} as const;

const weightClassNames = {
  normal: getRequiredClassName(styles, 'normal'),
  medium: getRequiredClassName(styles, 'medium'),
  semibold: getRequiredClassName(styles, 'semibold'),
  bold: getRequiredClassName(styles, 'bold'),
} as const;

const colorClassNames = {
  default: getRequiredClassName(styles, 'colorDefault'),
  muted: getRequiredClassName(styles, 'colorMuted'),
  success: getRequiredClassName(styles, 'colorSuccess'),
  warning: getRequiredClassName(styles, 'colorWarning'),
  danger: getRequiredClassName(styles, 'colorDanger'),
  'on-primary': getRequiredClassName(styles, 'colorOnPrimary'),
} as const;

const fontClassNames = {
  sans: getRequiredClassName(styles, 'fontSans'),
  mono: getRequiredClassName(styles, 'fontMono'),
} as const;

const textTransformClassNames = {
  none: getRequiredClassName(styles, 'textTransformNone'),
  capitalize: getRequiredClassName(styles, 'textTransformCapitalize'),
  uppercase: getRequiredClassName(styles, 'textTransformUppercase'),
  lowercase: getRequiredClassName(styles, 'textTransformLowercase'),
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

  it('renders as <li> when as="li"', () => {
    render(<Text as="li">content</Text>);

    expect(getTextByContent('content').tagName).toBe('LI');
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

  it('applies color-success class', () => {
    render(<Text color="success">content</Text>);

    expect(getTextByContent('content')).toHaveClass(colorClassNames.success);
  });

  it('applies color-warning class', () => {
    render(<Text color="warning">content</Text>);

    expect(getTextByContent('content')).toHaveClass(colorClassNames.warning);
  });

  it('applies color-danger class', () => {
    render(<Text color="danger">content</Text>);

    expect(getTextByContent('content')).toHaveClass(colorClassNames.danger);
  });

  it('applies color-on-primary class', () => {
    render(<Text color="on-primary">content</Text>);

    expect(getTextByContent('content')).toHaveClass(colorClassNames['on-primary']);
  });

  it('applies font-sans class by default', () => {
    render(<Text>content</Text>);

    expect(getTextByContent('content')).toHaveClass(fontClassNames.sans);
  });

  it('applies font-mono class', () => {
    render(<Text font="mono">content</Text>);

    expect(getTextByContent('content')).toHaveClass(fontClassNames.mono);
  });

  it('applies text-transform-none class by default', () => {
    render(<Text>content</Text>);

    expect(getTextByContent('content')).toHaveClass(textTransformClassNames.none);
  });

  it('applies text-transform-capitalize class', () => {
    render(<Text textTransform="capitalize">content</Text>);

    expect(getTextByContent('content')).toHaveClass(textTransformClassNames.capitalize);
  });

  it('applies text-transform-uppercase class', () => {
    render(<Text textTransform="uppercase">content</Text>);

    expect(getTextByContent('content')).toHaveClass(textTransformClassNames.uppercase);
  });

  it('applies text-transform-lowercase class', () => {
    render(<Text textTransform="lowercase">content</Text>);

    expect(getTextByContent('content')).toHaveClass(textTransformClassNames.lowercase);
  });

  it('applies align-left class by default', () => {
    render(<Text>content</Text>);

    expect(getTextByContent('content')).toHaveClass(alignClassNames.left);
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
    const ref = React.createRef<HTMLParagraphElement>();

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

  it('has no a11y violations — muted color', async () => {
    const { container } = render(<Text color="muted">Muted supporting text</Text>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses the text-on-primary token for on-primary text', () => {
    const stylesheet = readFileSync('src/components/Text/Text.module.scss', 'utf8');

    expect(stylesheet).toContain('color: var(--dds-color-text-on-primary);');
  });

  it('uses the status danger token for danger text', () => {
    const stylesheet = readFileSync('src/components/Text/Text.module.scss', 'utf8');

    expect(stylesheet).toContain('color: var(--dds-color-status-danger);');
  });

  it('uses status tokens for success and warning text', () => {
    const stylesheet = readFileSync('src/components/Text/Text.module.scss', 'utf8');

    expect(stylesheet).toContain('color: var(--dds-color-status-success);');
    expect(stylesheet).toContain('color: var(--dds-color-status-warning);');
  });

  it('uses font family tokens for font options', () => {
    const stylesheet = readFileSync('src/components/Text/Text.module.scss', 'utf8');

    expect(stylesheet).toContain('font-family: var(--dds-font-sans);');
    expect(stylesheet).toContain('font-family: var(--dds-font-mono);');
  });

  it('uses the shared truncate mixin', () => {
    const stylesheet = readFileSync('src/components/Text/Text.module.scss', 'utf8');

    expect(stylesheet).toContain('@include truncate;');
  });

  it('defines text-transform styles for transform options', () => {
    const stylesheet = readFileSync('src/components/Text/Text.module.scss', 'utf8');

    expect(stylesheet).toContain('text-transform: none;');
    expect(stylesheet).toContain('text-transform: capitalize;');
    expect(stylesheet).toContain('text-transform: uppercase;');
    expect(stylesheet).toContain('text-transform: lowercase;');
  });
});

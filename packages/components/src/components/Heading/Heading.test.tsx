import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import styles from './Heading.module.scss';
import { Heading } from './Heading';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const elements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
const sizes = ['2xl', '3xl', '4xl', '5xl', '6xl', '7xl'] as const;

const rootClassName = getRequiredClassName(styles, 'root');

const sizeClassNames = {
  '2xl': getRequiredClassName(styles, 'size2xl'),
  '3xl': getRequiredClassName(styles, 'size3xl'),
  '4xl': getRequiredClassName(styles, 'size4xl'),
  '5xl': getRequiredClassName(styles, 'size5xl'),
  '6xl': getRequiredClassName(styles, 'size6xl'),
  '7xl': getRequiredClassName(styles, 'size7xl'),
} as const;

const fontClassNames = {
  display: getRequiredClassName(styles, 'display'),
  sans: getRequiredClassName(styles, 'sans'),
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
  'on-primary': getRequiredClassName(styles, 'colorOnPrimary'),
} as const;

const alignClassNames = {
  left: getRequiredClassName(styles, 'alignLeft'),
  center: getRequiredClassName(styles, 'alignCenter'),
  right: getRequiredClassName(styles, 'alignRight'),
} as const;

const textTransformClassNames = {
  none: getRequiredClassName(styles, 'textTransformNone'),
  capitalize: getRequiredClassName(styles, 'textTransformCapitalize'),
  uppercase: getRequiredClassName(styles, 'textTransformUppercase'),
  lowercase: getRequiredClassName(styles, 'textTransformLowercase'),
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

const getHeadingByContent = (text: string) => {
  const element = Array.from(document.querySelectorAll(`.${rootClassName}`)).find(
    (candidate) => candidate.textContent === text
  );

  expect(element).toBeTruthy();
  return element as HTMLHeadingElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Heading', () => {
  it('renders children as <h2> by default', () => {
    render(<Heading>Heading</Heading>);

    expect(getHeadingByContent('Heading').tagName).toBe('H2');
  });

  it('renders as <h1> when as="h1"', () => {
    render(<Heading as="h1">Heading 1</Heading>);

    expect(getHeadingByContent('Heading 1').tagName).toBe('H1');
  });

  it('renders as <h3> when as="h3"', () => {
    render(<Heading as="h3">Heading 3</Heading>);

    expect(getHeadingByContent('Heading 3').tagName).toBe('H3');
  });

  it('renders as <h4> when as="h4"', () => {
    render(<Heading as="h4">Heading 4</Heading>);

    expect(getHeadingByContent('Heading 4').tagName).toBe('H4');
  });

  it('renders as <h5> when as="h5"', () => {
    render(<Heading as="h5">Heading 5</Heading>);

    expect(getHeadingByContent('Heading 5').tagName).toBe('H5');
  });

  it('renders as <h6> when as="h6"', () => {
    render(<Heading as="h6">Heading 6</Heading>);

    expect(getHeadingByContent('Heading 6').tagName).toBe('H6');
  });

  it('renders each supported heading element', () => {
    render(
      <div>
        {elements.map((element) => (
          <Heading key={element} as={element}>
            {element}
          </Heading>
        ))}
      </div>
    );

    elements.forEach((element) => {
      expect(getHeadingByContent(element).tagName).toBe(element.toUpperCase());
    });
  });

  it('forwards className to root element', () => {
    render(<Heading className="custom">Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass('custom');
  });

  it('forwards ref to root DOM heading element', () => {
    const ref = React.createRef<HTMLHeadingElement>();

    render(
      <Heading as="h1" ref={ref}>
        Heading
      </Heading>
    );

    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    expect(ref.current?.tagName).toBe('H1');
    expect(ref.current).toBe(getHeadingByContent('Heading'));
  });

  it('applies display class when font="display" by default', () => {
    render(<Heading>Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(fontClassNames.display);
  });

  it('applies sans class when font="sans"', () => {
    render(<Heading font="sans">Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(fontClassNames.sans);
  });

  it('applies size3xl class by default', () => {
    render(<Heading>Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(sizeClassNames['3xl']);
  });

  it('applies size7xl class when size="7xl"', () => {
    render(<Heading size="7xl">Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(sizeClassNames['7xl']);
  });

  it('applies size2xl class when size="2xl"', () => {
    render(<Heading size="2xl">Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(sizeClassNames['2xl']);
  });

  it('applies correct size class for each supported size', () => {
    render(
      <div>
        {sizes.map((size) => (
          <Heading key={size} size={size}>
            {size}
          </Heading>
        ))}
      </div>
    );

    sizes.forEach((size) => {
      expect(getHeadingByContent(size)).toHaveClass(sizeClassNames[size]);
    });
  });

  it('applies bold class by default', () => {
    render(<Heading>Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(weightClassNames.bold);
  });

  it('applies normal class when weight="normal"', () => {
    render(<Heading weight="normal">Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(weightClassNames.normal);
  });

  it('applies medium class when weight="medium"', () => {
    render(<Heading weight="medium">Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(weightClassNames.medium);
  });

  it('applies semibold class when weight="semibold"', () => {
    render(<Heading weight="semibold">Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(weightClassNames.semibold);
  });

  it('applies color-default class by default', () => {
    render(<Heading>Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(colorClassNames.default);
  });

  it('applies color-muted class when color="muted"', () => {
    render(<Heading color="muted">Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(colorClassNames.muted);
  });

  it('applies color-on-primary class when color="on-primary"', () => {
    render(<Heading color="on-primary">Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(colorClassNames['on-primary']);
  });

  it('applies align-left class by default', () => {
    render(<Heading>Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(alignClassNames.left);
  });

  it('applies align-center class when align="center"', () => {
    render(<Heading align="center">Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(alignClassNames.center);
  });

  it('applies align-right class when align="right"', () => {
    render(<Heading align="right">Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(alignClassNames.right);
  });

  it('applies text-transform-none class by default', () => {
    render(<Heading>Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(textTransformClassNames.none);
  });

  it('applies text-transform-capitalize class', () => {
    render(<Heading textTransform="capitalize">Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(textTransformClassNames.capitalize);
  });

  it('applies text-transform-uppercase class', () => {
    render(<Heading textTransform="uppercase">Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(textTransformClassNames.uppercase);
  });

  it('applies text-transform-lowercase class', () => {
    render(<Heading textTransform="lowercase">Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(textTransformClassNames.lowercase);
  });

  it('applies truncate class when truncate is true', () => {
    render(<Heading truncate>Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(getRequiredClassName(styles, 'truncate'));
  });

  it('does not apply truncate class by default', () => {
    render(<Heading>Heading</Heading>);

    expect(getHeadingByContent('Heading')).not.toHaveClass(
      getRequiredClassName(styles, 'truncate')
    );
  });

  it('forwards arbitrary HTML props', () => {
    render(
      <Heading id="title" data-testid="heading" title="Additional context">
        Heading
      </Heading>
    );

    const heading = getHeadingByContent('Heading');

    expect(heading).toHaveAttribute('id', 'title');
    expect(heading).toHaveAttribute('data-testid', 'heading');
    expect(heading).toHaveAttribute('title', 'Additional context');
  });

  it('has no a11y violations - h1', async () => {
    const { container } = render(<Heading as="h1">Heading</Heading>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations - h2 default', async () => {
    const { container } = render(<Heading>Heading</Heading>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations - display font', async () => {
    const { container } = render(<Heading font="display">Heading</Heading>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations - sans font', async () => {
    const { container } = render(<Heading font="sans">Heading</Heading>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses font family tokens for font options', () => {
    const stylesheet = readFileSync('src/components/Heading/Heading.module.scss', 'utf8');

    expect(stylesheet).toContain('font-family: var(--dds-font-display);');
    expect(stylesheet).toContain('font-family: var(--dds-font-sans);');
  });

  it('uses tracking-tight for heading letter spacing', () => {
    const stylesheet = readFileSync('src/components/Heading/Heading.module.scss', 'utf8');

    expect(stylesheet).toContain('letter-spacing: var(--dds-tracking-tight);');
    expect(stylesheet).not.toContain('var(--dds-tracking-wider)');
  });

  it('uses the shared truncate mixin', () => {
    const stylesheet = readFileSync('src/components/Heading/Heading.module.scss', 'utf8');

    expect(stylesheet).toContain('@include truncate;');
  });

  it('defines text-transform styles for transform options', () => {
    const stylesheet = readFileSync('src/components/Heading/Heading.module.scss', 'utf8');

    expect(stylesheet).toContain('text-transform: none;');
    expect(stylesheet).toContain('text-transform: capitalize;');
    expect(stylesheet).toContain('text-transform: uppercase;');
    expect(stylesheet).toContain('text-transform: lowercase;');
  });
});

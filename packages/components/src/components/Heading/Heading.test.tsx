import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import styles from './Heading.module.scss';
import { Heading } from './Heading';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const levels = [1, 2, 3, 4, 5, 6] as const;

const rootClassName = getRequiredClassName(styles, 'root');

const levelClassNames = {
  1: getRequiredClassName(styles, 'level1'),
  2: getRequiredClassName(styles, 'level2'),
  3: getRequiredClassName(styles, 'level3'),
  4: getRequiredClassName(styles, 'level4'),
  5: getRequiredClassName(styles, 'level5'),
  6: getRequiredClassName(styles, 'level6'),
} as const;

const fontClassNames = {
  display: getRequiredClassName(styles, 'fontDisplay'),
  sans: getRequiredClassName(styles, 'fontSans'),
} as const;

const colorClassNames = {
  default: getRequiredClassName(styles, 'colorDefault'),
  muted: getRequiredClassName(styles, 'colorMuted'),
  'on-primary': getRequiredClassName(styles, 'colorOnPrimary'),
} as const;

const semanticDisplayClassName = getRequiredClassName(styles, 'semanticDisplay');

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
  it('renders as <h1> when level={1}', () => {
    render(<Heading level={1}>Heading 1</Heading>);

    expect(getHeadingByContent('Heading 1').tagName).toBe('H1');
  });

  it('renders as <h2> when level={2}', () => {
    render(<Heading level={2}>Heading 2</Heading>);

    expect(getHeadingByContent('Heading 2').tagName).toBe('H2');
  });

  it('renders as <h3> when level={3}', () => {
    render(<Heading level={3}>Heading 3</Heading>);

    expect(getHeadingByContent('Heading 3').tagName).toBe('H3');
  });

  it('renders as <h4> when level={4}', () => {
    render(<Heading level={4}>Heading 4</Heading>);

    expect(getHeadingByContent('Heading 4').tagName).toBe('H4');
  });

  it('renders as <h5> when level={5}', () => {
    render(<Heading level={5}>Heading 5</Heading>);

    expect(getHeadingByContent('Heading 5').tagName).toBe('H5');
  });

  it('renders as <h6> when level={6}', () => {
    render(<Heading level={6}>Heading 6</Heading>);

    expect(getHeadingByContent('Heading 6').tagName).toBe('H6');
  });

  it('applies level-1 visual class when level={1} and no visualLevel', () => {
    render(<Heading level={1}>Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(levelClassNames[1]);
  });

  it('applies level-1 visual class when visualLevel={1} regardless of semantic level', () => {
    render(
      <Heading level={6} visualLevel={1}>
        Heading
      </Heading>
    );

    expect(getHeadingByContent('Heading')).toHaveClass(levelClassNames[1]);
  });

  it('renders <h3> element but level-1 visual styles when level={3} visualLevel={1}', () => {
    render(
      <Heading level={3} visualLevel={1}>
        Heading
      </Heading>
    );

    const heading = getHeadingByContent('Heading');

    expect(heading.tagName).toBe('H3');
    expect(heading).toHaveClass(levelClassNames[1]);
    expect(heading).not.toHaveClass(levelClassNames[3]);
  });

  it('applies display font for h1 by default', () => {
    render(<Heading level={1}>Heading</Heading>);

    const heading = getHeadingByContent('Heading');

    expect(heading).toHaveClass(fontClassNames.display);
    expect(heading).toHaveClass(semanticDisplayClassName);
  });

  it('applies display font for h2 by default', () => {
    render(<Heading level={2}>Heading</Heading>);

    const heading = getHeadingByContent('Heading');

    expect(heading).toHaveClass(fontClassNames.display);
    expect(heading).toHaveClass(semanticDisplayClassName);
  });

  it('applies sans font for h3 by default', () => {
    render(<Heading level={3}>Heading</Heading>);

    const heading = getHeadingByContent('Heading');

    expect(heading).toHaveClass(fontClassNames.sans);
    expect(heading).not.toHaveClass(semanticDisplayClassName);
  });

  it('applies sans font for h4-h6 by default', () => {
    render(
      <div>
        <Heading level={4}>Heading 4</Heading>
        <Heading level={5}>Heading 5</Heading>
        <Heading level={6}>Heading 6</Heading>
      </div>
    );

    [4, 5, 6].forEach((level) => {
      const heading = getHeadingByContent(`Heading ${level}`);

      expect(heading).toHaveClass(fontClassNames.sans);
      expect(heading).not.toHaveClass(semanticDisplayClassName);
    });
  });

  it('applies display font when font="display" is explicit on h3', () => {
    render(
      <Heading level={3} font="display">
        Heading
      </Heading>
    );

    const heading = getHeadingByContent('Heading');

    expect(heading).toHaveClass(fontClassNames.display);
    expect(heading).not.toHaveClass(semanticDisplayClassName);
  });

  it('applies sans font when font="sans" is explicit on h1', () => {
    render(
      <Heading level={1} font="sans">
        Heading
      </Heading>
    );

    const heading = getHeadingByContent('Heading');

    expect(heading).toHaveClass(fontClassNames.sans);
    expect(heading).not.toHaveClass(semanticDisplayClassName);
  });

  it('applies color-default by default', () => {
    render(<Heading level={1}>Heading</Heading>);

    expect(getHeadingByContent('Heading')).toHaveClass(colorClassNames.default);
  });

  it('applies color-muted', () => {
    render(
      <Heading level={1} color="muted">
        Heading
      </Heading>
    );

    expect(getHeadingByContent('Heading')).toHaveClass(colorClassNames.muted);
  });

  it('applies color-on-primary', () => {
    render(
      <Heading level={1} color="on-primary">
        Heading
      </Heading>
    );

    expect(getHeadingByContent('Heading')).toHaveClass(colorClassNames['on-primary']);
  });

  it('forwards className', () => {
    render(
      <Heading level={1} className="custom">
        Heading
      </Heading>
    );

    expect(getHeadingByContent('Heading')).toHaveClass('custom');
  });

  it('forwards ref to the heading element', () => {
    const ref = React.createRef<HTMLHeadingElement>();

    render(
      <Heading level={2} ref={ref}>
        Heading
      </Heading>
    );

    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    expect(ref.current?.tagName).toBe('H2');
    expect(ref.current).toBe(getHeadingByContent('Heading'));
  });

  it('spreads additional HTML attributes', () => {
    render(
      <Heading level={1} id="title" data-testid="heading" title="Additional context">
        Heading
      </Heading>
    );

    const heading = getHeadingByContent('Heading');

    expect(heading).toHaveAttribute('id', 'title');
    expect(heading).toHaveAttribute('data-testid', 'heading');
    expect(heading).toHaveAttribute('title', 'Additional context');
  });

  it('has no a11y violations - h1', async () => {
    const { container } = render(<Heading level={1}>Heading</Heading>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations - all levels h1 through h6 in document order', async () => {
    const { container } = render(
      <div>
        {levels.map((level) => (
          <Heading key={level} level={level}>
            Heading {level}
          </Heading>
        ))}
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations - with visualLevel override', async () => {
    const { container } = render(
      <Heading level={3} visualLevel={1}>
        Heading
      </Heading>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('applies each visual level class from visualLevel', () => {
    render(
      <div>
        {levels.map((level) => (
          <Heading key={level} level={1} visualLevel={level}>
            Visual {level}
          </Heading>
        ))}
      </div>
    );

    levels.forEach((level) => {
      expect(getHeadingByContent(`Visual ${level}`)).toHaveClass(levelClassNames[level]);
    });
  });

  it('applies each semantic level class by default', () => {
    render(
      <div>
        {levels.map((level) => (
          <Heading key={level} level={level}>
            Heading {level}
          </Heading>
        ))}
      </div>
    );

    levels.forEach((level) => {
      expect(getHeadingByContent(`Heading ${level}`)).toHaveClass(levelClassNames[level]);
    });
  });
});

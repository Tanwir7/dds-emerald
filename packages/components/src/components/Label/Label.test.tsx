import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { Label } from './Label';
import styles from './Label.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const rootClassName = getRequiredClassName(styles, 'root');
const smClassName = getRequiredClassName(styles, 'sm');
const baseClassName = getRequiredClassName(styles, 'base');
const disabledClassName = getRequiredClassName(styles, 'disabled');

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

const getLabelByText = (text: string) => {
  const label = Array.from(document.querySelectorAll(`.${rootClassName}`)).find((element) =>
    element.textContent?.includes(text)
  );

  expect(label).toBeTruthy();
  return label as HTMLLabelElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Label', () => {
  it('renders children text', () => {
    render(<Label>content</Label>);

    expect(getLabelByText('content')).toBeInTheDocument();
  });

  it('renders as a label element', () => {
    render(<Label>content</Label>);

    expect(getLabelByText('content').tagName).toBe('LABEL');
  });

  it('forwards htmlFor to the label htmlFor attribute', () => {
    render(<Label htmlFor="email">Email</Label>);

    expect(getLabelByText('Email')).toHaveAttribute('for', 'email');
  });

  it('forwards className', () => {
    render(<Label className="custom">content</Label>);

    expect(getLabelByText('content')).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLLabelElement>();

    render(<Label ref={ref}>content</Label>);

    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    expect(ref.current).toBe(getLabelByText('content'));
  });

  it('does not render a required indicator by default', () => {
    render(<Label>content</Label>);

    expect(getLabelByText('content').querySelector('span')).not.toBeInTheDocument();
  });

  it('does not render a required indicator when required is false', () => {
    render(<Label required={false}>content</Label>);

    expect(getLabelByText('content').querySelector('span')).not.toBeInTheDocument();
  });

  it('renders a required indicator span when required is true', () => {
    render(<Label required>content</Label>);

    expect(getLabelByText('content').querySelector('span')).toBeInstanceOf(HTMLSpanElement);
  });

  it('sets aria-hidden on the required indicator', () => {
    render(<Label required>content</Label>);

    expect(getLabelByText('content').querySelector('span')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the required indicator with a star', () => {
    render(<Label required>content</Label>);

    expect(getLabelByText('content').querySelector('span')).toHaveTextContent('*');
  });

  it('does not add aria-required to the label when required is true', () => {
    render(<Label required>content</Label>);

    expect(getLabelByText('content')).not.toHaveAttribute('aria-required');
  });

  it('applies the disabled class when disabled is true', () => {
    render(<Label disabled>content</Label>);

    expect(getLabelByText('content')).toHaveClass(disabledClassName);
  });

  it('does not apply the disabled class when disabled is false', () => {
    render(<Label disabled={false}>content</Label>);

    expect(getLabelByText('content')).not.toHaveClass(disabledClassName);
  });

  it('applies the sm class by default', () => {
    render(<Label>content</Label>);

    expect(getLabelByText('content')).toHaveClass(smClassName);
  });

  it('applies the sm class when size is sm', () => {
    render(<Label size="sm">content</Label>);

    expect(getLabelByText('content')).toHaveClass(smClassName);
  });

  it('applies the base class when size is base', () => {
    render(<Label size="base">content</Label>);

    expect(getLabelByText('content')).toHaveClass(baseClassName);
  });

  it('forwards arbitrary HTML props', () => {
    render(<Label data-testid="field-label">content</Label>);

    expect(getLabelByText('content')).toHaveAttribute('data-testid', 'field-label');
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Label>content</Label>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations when required', async () => {
    const { container } = render(<Label required>content</Label>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations when disabled', async () => {
    const { container } = render(<Label disabled>content</Label>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations when associated with an input', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="email">Email</Label>
        <input id="email" aria-required="true" />
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

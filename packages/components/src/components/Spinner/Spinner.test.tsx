import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import styles from './Spinner.module.scss';
import { Spinner } from './Spinner';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
} as const;

describe('Spinner', () => {
  it('renders a span element', () => {
    const { container } = render(<Spinner />);

    expect(container.firstElementChild?.tagName).toBe('SPAN');
    expect(container.firstElementChild).toHaveClass(classNames.root);
  });

  it('forwards ref to HTMLSpanElement', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('applies .md class by default', () => {
    const { container } = render(<Spinner />);

    expect(container.firstElementChild).toHaveClass(classNames.md);
  });

  it('applies requested size class', () => {
    const { rerender, container } = render(<Spinner size="sm" />);

    expect(container.firstElementChild).toHaveClass(classNames.sm);

    rerender(<Spinner size="lg" />);
    expect(container.firstElementChild).toHaveClass(classNames.lg);
  });

  it('exposes a status role and accessible name when label is provided', () => {
    render(<Spinner label="Loading suggestions" />);

    expect(screen.getByRole('status', { name: 'Loading suggestions' })).toBeInTheDocument();
  });

  it('has no named accessibility role when label is omitted', () => {
    const { container } = render(<Spinner />);

    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument();
  });

  it('axe: passes with label', async () => {
    const { container } = render(<Spinner label="Loading suggestions" />);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});

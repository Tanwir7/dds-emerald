import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { getByRole, getByText } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { Divider } from './Divider';
import styles from './Divider.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const horizontalClassName = getRequiredClassName(styles, 'horizontal');
const verticalClassName = getRequiredClassName(styles, 'vertical');
const labelledClassName = getRequiredClassName(styles, 'labelled');

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

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Divider', () => {
  it('renders horizontal by default', () => {
    const { container } = render(<Divider />);
    const divider = getByRole(container, 'separator');

    expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
    expect(divider).toHaveClass(horizontalClassName);
  });

  it('renders vertical', () => {
    const { container } = render(<Divider orientation="vertical" />);
    const divider = getByRole(container, 'separator');

    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    expect(divider).toHaveClass(verticalClassName);
  });

  it('renders with label using the labelled horizontal pattern', () => {
    const { container } = render(<Divider label="Details" />);
    const divider = getByRole(container, 'separator');
    const label = getByText(container, 'Details');

    expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
    expect(divider).toHaveClass(labelledClassName);
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('Details');
    expect(divider.querySelectorAll('[data-divider-line]')).toHaveLength(2);
  });

  it('has role=separator', () => {
    const { container } = render(<Divider />);

    expect(getByRole(container, 'separator')).toBeInTheDocument();
  });

  it('has correct aria-orientation', () => {
    const { container } = render(<Divider orientation="vertical" />);

    expect(getByRole(container, 'separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Divider ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('forwards className', () => {
    const { container } = render(<Divider className="custom" />);

    expect(getByRole(container, 'separator')).toHaveClass('custom');
  });

  it('axe passes for horizontal', async () => {
    const { container } = render(<Divider />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('axe passes for vertical', async () => {
    const { container } = render(<Divider orientation="vertical" />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('axe passes for labelled horizontal', async () => {
    const { container } = render(<Divider label="Details" />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});

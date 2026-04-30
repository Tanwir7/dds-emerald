import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import styles from './StatusIndicator.module.scss';
import { StatusIndicator, type StatusIndicatorStatus } from './StatusIndicator';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  dot: getRequiredClassName(styles, 'dot'),
  pulse: getRequiredClassName(styles, 'pulse'),
  xs: getRequiredClassName(styles, 'xs'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  online: getRequiredClassName(styles, 'online'),
  offline: getRequiredClassName(styles, 'offline'),
  away: getRequiredClassName(styles, 'away'),
  busy: getRequiredClassName(styles, 'busy'),
  pending: getRequiredClassName(styles, 'pending'),
  success: getRequiredClassName(styles, 'success'),
  warning: getRequiredClassName(styles, 'warning'),
  error: getRequiredClassName(styles, 'error'),
  info: getRequiredClassName(styles, 'info'),
  neutral: getRequiredClassName(styles, 'neutral'),
} as const;

const statuses = [
  'online',
  'offline',
  'away',
  'busy',
  'pending',
  'success',
  'warning',
  'error',
  'info',
  'neutral',
] as const satisfies readonly StatusIndicatorStatus[];

describe('StatusIndicator', () => {
  it('renders a span root element', () => {
    const { container } = render(<StatusIndicator status="online" />);

    expect(container.firstElementChild?.tagName).toBe('SPAN');
    expect(container.firstElementChild).toHaveClass(classNames.root);
  });

  it('renders a dot child span', () => {
    const { container } = render(<StatusIndicator status="online" />);

    expect(container.firstElementChild?.querySelector('span')).toHaveClass(classNames.dot);
  });

  it('forwards className to the root', () => {
    render(<StatusIndicator status="online" className="custom" />);

    expect(document.querySelector(`.${classNames.root}`)).toHaveClass('custom');
  });

  it('forwards ref to HTMLSpanElement', () => {
    const ref = React.createRef<HTMLSpanElement>();

    render(<StatusIndicator status="online" ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('has aria-hidden="true" when no label is provided', () => {
    render(<StatusIndicator status="online" />);

    expect(document.querySelector(`.${classNames.root}`)).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not have role when no label is provided', () => {
    render(<StatusIndicator status="online" />);

    expect(document.querySelector(`.${classNames.root}`)).not.toHaveAttribute('role');
  });

  it('does not have aria-label when no label is provided', () => {
    render(<StatusIndicator status="online" />);

    expect(document.querySelector(`.${classNames.root}`)).not.toHaveAttribute('aria-label');
  });

  it('has role="img" when label is provided', () => {
    render(<StatusIndicator status="online" label="System is online" />);

    expect(screen.getByRole('img', { name: 'System is online' })).toBeInTheDocument();
  });

  it('has aria-label matching the label prop', () => {
    render(<StatusIndicator status="online" label="System is online" />);

    expect(screen.getByRole('img', { name: 'System is online' })).toHaveAttribute(
      'aria-label',
      'System is online'
    );
  });

  it('does not have aria-hidden when label is provided', () => {
    render(<StatusIndicator status="online" label="System is online" />);

    expect(screen.getByRole('img', { name: 'System is online' })).not.toHaveAttribute(
      'aria-hidden'
    );
  });

  it('renders a visually hidden label span with the correct text', () => {
    render(<StatusIndicator status="online" label="System is online" />);

    expect(screen.getByText('System is online')).toBeInTheDocument();
  });

  it.each(statuses)('applies the %s class', (status) => {
    render(<StatusIndicator status={status} />);

    expect(document.querySelector(`.${classNames.root}`)).toHaveClass(classNames[status]);
  });

  it('applies .sm by default', () => {
    render(<StatusIndicator status="online" />);

    expect(document.querySelector(`.${classNames.root}`)).toHaveClass(classNames.sm);
  });

  it('applies .xs when size is xs', () => {
    render(<StatusIndicator status="online" size="xs" />);

    expect(document.querySelector(`.${classNames.root}`)).toHaveClass(classNames.xs);
  });

  it('applies .md when size is md', () => {
    render(<StatusIndicator status="online" size="md" />);

    expect(document.querySelector(`.${classNames.root}`)).toHaveClass(classNames.md);
  });

  it('does not apply .pulse by default', () => {
    render(<StatusIndicator status="online" />);

    expect(document.querySelector(`.${classNames.root}`)).not.toHaveClass(classNames.pulse);
  });

  it('applies .pulse when pulse is true', () => {
    render(<StatusIndicator status="online" pulse />);

    expect(document.querySelector(`.${classNames.root}`)).toHaveClass(classNames.pulse);
  });

  it('forwards data-testid and arbitrary props', () => {
    render(<StatusIndicator status="online" data-testid="indicator" title="Presence status" />);

    expect(screen.getByTestId('indicator')).toHaveAttribute('title', 'Presence status');
  });

  it('axe: passes for all decorative statuses', async () => {
    const { container } = render(
      <div>
        {statuses.map((status) => (
          <StatusIndicator key={status} status={status} />
        ))}
      </div>
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes for all sizes', async () => {
    const { container } = render(
      <div>
        <StatusIndicator status="online" size="xs" />
        <StatusIndicator status="online" size="sm" />
        <StatusIndicator status="online" size="md" />
      </div>
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes when label is provided', async () => {
    const { container } = render(<StatusIndicator status="online" label="System is online" />);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes with pulse enabled', async () => {
    const { container } = render(<StatusIndicator status="error" pulse />);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes inside an avatar-like container', async () => {
    const { container } = render(
      <div>
        <img src="avatar.png" alt="Sarah Chen" />
        <StatusIndicator status="online" />
      </div>
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});

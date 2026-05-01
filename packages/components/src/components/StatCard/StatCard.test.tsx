import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Activity } from 'lucide-react';
import styles from './StatCard.module.scss';
import { StatCard } from './StatCard';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  labelRow: getRequiredClassName(styles, 'labelRow'),
  label: getRequiredClassName(styles, 'label'),
  value: getRequiredClassName(styles, 'value'),
  valueSkeleton: getRequiredClassName(styles, 'valueSkeleton'),
  delta: getRequiredClassName(styles, 'delta'),
  deltaValue: getRequiredClassName(styles, 'deltaValue'),
  deltaLabel: getRequiredClassName(styles, 'deltaLabel'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
  loading: getRequiredClassName(styles, 'loading'),
  trendUp: getRequiredClassName(styles, 'trendUp'),
  trendDown: getRequiredClassName(styles, 'trendDown'),
  trendNeutral: getRequiredClassName(styles, 'trendNeutral'),
} as const;

describe('StatCard', () => {
  it('renders label text', () => {
    render(<StatCard label="Monthly Revenue" value="$48,295" />);

    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
  });

  it('renders value', () => {
    render(<StatCard label="Monthly Revenue" value="$48,295" />);

    expect(screen.getByText('$48,295')).toBeInTheDocument();
    expect(screen.getByText('$48,295')).toHaveClass(classNames.value);
  });

  it('renders icon when icon prop provided', () => {
    const { container } = render(
      <StatCard label="Monthly Revenue" value="$48,295" icon={Activity} />
    );

    const icon = container.querySelector(`.${classNames.labelRow} svg`);

    expect(icon).toBeInTheDocument();
    expect(container.querySelector(`.${classNames.labelRow}`)).toContainElement(
      icon?.parentElement ?? null
    );
  });

  it('icon has aria-hidden="true"', () => {
    const { container } = render(
      <StatCard label="Monthly Revenue" value="$48,295" icon={Activity} />
    );

    expect(container.querySelector(`.${classNames.labelRow} svg`)).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('does NOT render delta section when delta omitted', () => {
    const { container } = render(<StatCard label="Monthly Revenue" value="$48,295" />);

    expect(container.querySelector(`.${classNames.delta}`)).not.toBeInTheDocument();
  });

  it('renders delta value when delta provided', () => {
    render(<StatCard label="Monthly Revenue" value="$48,295" delta={{ value: '+12.4%' }} />);

    expect(screen.getByText('+12.4%')).toBeInTheDocument();
  });

  it('renders delta label when delta.label provided', () => {
    render(
      <StatCard
        label="Monthly Revenue"
        value="$48,295"
        delta={{ value: '+12.4%', label: 'vs last month' }}
      />
    );

    expect(screen.getByText('vs last month')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toHaveClass(classNames.deltaLabel);
  });

  it('does NOT render delta label when delta.label omitted', () => {
    const { container } = render(
      <StatCard label="Monthly Revenue" value="$48,295" delta={{ value: '+12.4%' }} />
    );

    expect(container.querySelector(`.${classNames.deltaLabel}`)).not.toBeInTheDocument();
  });

  it('forwards className to root', () => {
    const { container } = render(
      <StatCard label="Monthly Revenue" value="$48,295" className="custom-card" />
    );

    expect(container.firstElementChild).toHaveClass(classNames.root, 'custom-card');
  });

  it('forwards ref to HTMLDivElement', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<StatCard label="Monthly Revenue" value="$48,295" ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('applies .md class by default', () => {
    const { container } = render(<StatCard label="Monthly Revenue" value="$48,295" />);

    expect(container.firstElementChild).toHaveClass(classNames.md);
  });

  it('applies .sm class when size="sm"', () => {
    const { container } = render(<StatCard label="Monthly Revenue" value="$48,295" size="sm" />);

    expect(container.firstElementChild).toHaveClass(classNames.sm);
  });

  it('applies .lg class when size="lg"', () => {
    const { container } = render(<StatCard label="Monthly Revenue" value="$48,295" size="lg" />);

    expect(container.firstElementChild).toHaveClass(classNames.lg);
  });

  it('applies .trendUp when trend="up"', () => {
    const { container } = render(
      <StatCard label="Monthly Revenue" value="$48,295" delta={{ value: '+12.4%', trend: 'up' }} />
    );

    expect(container.querySelector(`.${classNames.delta}`)).toHaveClass(classNames.trendUp);
  });

  it('applies .trendDown when trend="down"', () => {
    const { container } = render(
      <StatCard label="Monthly Revenue" value="$48,295" delta={{ value: '-3.1%', trend: 'down' }} />
    );

    expect(container.querySelector(`.${classNames.delta}`)).toHaveClass(classNames.trendDown);
  });

  it('applies .trendNeutral when trend="neutral"', () => {
    const { container } = render(
      <StatCard label="Monthly Revenue" value="$48,295" delta={{ value: '0%', trend: 'neutral' }} />
    );

    expect(container.querySelector(`.${classNames.delta}`)).toHaveClass(classNames.trendNeutral);
  });

  it('no trend class when trend omitted', () => {
    const { container } = render(
      <StatCard label="Monthly Revenue" value="$48,295" delta={{ value: '+12.4%' }} />
    );

    expect(container.querySelector(`.${classNames.delta}`)).not.toHaveClass(classNames.trendUp);
    expect(container.querySelector(`.${classNames.delta}`)).not.toHaveClass(classNames.trendDown);
    expect(container.querySelector(`.${classNames.delta}`)).not.toHaveClass(
      classNames.trendNeutral
    );
  });

  it('delta value span has aria-label="Change: {value}"', () => {
    render(<StatCard label="Monthly Revenue" value="$48,295" delta={{ value: '+12.4%' }} />);

    expect(screen.getByText('+12.4%')).toHaveAttribute('aria-label', 'Change: +12.4%');
  });

  it('applies .loading class when loading={true}', () => {
    const { container } = render(<StatCard label="Monthly Revenue" value="$48,295" loading />);

    expect(container.firstElementChild).toHaveClass(classNames.loading);
  });

  it('renders value skeleton when loading={true}', () => {
    const { container } = render(<StatCard label="Monthly Revenue" value="$48,295" loading />);

    expect(container.querySelector(`.${classNames.valueSkeleton}`)).toBeInTheDocument();
  });

  it('skeleton has aria-hidden="true"', () => {
    const { container } = render(<StatCard label="Monthly Revenue" value="$48,295" loading />);

    expect(container.querySelector(`.${classNames.valueSkeleton}`)).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('does not render value text while loading', () => {
    render(<StatCard label="Monthly Revenue" value="$48,295" loading />);

    expect(screen.queryByText('$48,295')).not.toBeInTheDocument();
  });

  it('does not render delta while loading', () => {
    const { container } = render(
      <StatCard
        label="Monthly Revenue"
        value="$48,295"
        loading
        delta={{ value: '+12.4%', label: 'vs last month', trend: 'up' }}
      />
    );

    expect(container.querySelector(`.${classNames.delta}`)).not.toBeInTheDocument();
  });

  it('forwards arbitrary div props', () => {
    render(
      <StatCard
        label="Monthly Revenue"
        value="$48,295"
        data-testid="stat-card"
        title="Revenue summary"
      />
    );

    expect(screen.getByTestId('stat-card')).toHaveAttribute('title', 'Revenue summary');
  });

  it('axe passes with delta and icon', async () => {
    const { container } = render(
      <StatCard
        label="Monthly Revenue"
        value="$48,295"
        icon={Activity}
        delta={{ value: '+12.4%', label: 'vs last month', trend: 'up' }}
      />
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe passes while loading', async () => {
    const { container } = render(<StatCard label="Monthly Revenue" value="$48,295" loading />);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});

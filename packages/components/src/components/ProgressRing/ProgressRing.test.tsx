import { getByRole, getByText } from '@testing-library/react';
import { axe } from 'jest-axe';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { ProgressRing } from './ProgressRing';
import styles from './ProgressRing.module.scss';

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  svg: getRequiredClassName(styles, 'svg'),
  track: getRequiredClassName(styles, 'track'),
  arc: getRequiredClassName(styles, 'arc'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
  indeterminate: getRequiredClassName(styles, 'indeterminate'),
  noAnimation: getRequiredClassName(styles, 'noAnimation'),
  valueLabel: getRequiredClassName(styles, 'valueLabel'),
  variantDefault: getRequiredClassName(styles, 'variantDefault'),
  variantSuccess: getRequiredClassName(styles, 'variantSuccess'),
  variantWarning: getRequiredClassName(styles, 'variantWarning'),
  variantDanger: getRequiredClassName(styles, 'variantDanger'),
  variantInfo: getRequiredClassName(styles, 'variantInfo'),
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

const renderProgressRing = (props: React.ComponentProps<typeof ProgressRing> = {}) =>
  render(<ProgressRing label="Upload progress" value={50} {...props} />);

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('ProgressRing', () => {
  it('renders a span with role="progressbar"', () => {
    const { container } = renderProgressRing();
    expect(getByRole(container, 'progressbar')).toBeInstanceOf(HTMLSpanElement);
  });

  it('renders an SVG inside the span', () => {
    const { container } = renderProgressRing();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('SVG has aria-hidden="true"', () => {
    const { container } = renderProgressRing();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards className to root span', () => {
    const { container } = renderProgressRing({ className: 'custom-ring' });
    expect(getByRole(container, 'progressbar')).toHaveClass('custom-ring');
  });

  it('forwards ref to root HTMLSpanElement', () => {
    const ref = React.createRef<HTMLSpanElement>();
    const { container } = renderProgressRing({ ref });

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toBe(getByRole(container, 'progressbar'));
  });

  it('has aria-valuenow=0 when value={0}', () => {
    const { container } = renderProgressRing({ value: 0 });
    expect(getByRole(container, 'progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('has aria-valuenow=50 when value={50}', () => {
    const { container } = renderProgressRing({ value: 50 });
    expect(getByRole(container, 'progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('has aria-valuenow=100 when value={100}', () => {
    const { container } = renderProgressRing({ value: 100 });
    expect(getByRole(container, 'progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('does not have aria-valuenow when value is undefined', () => {
    const { container } = render(<ProgressRing label="Upload progress" />);
    expect(getByRole(container, 'progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('has aria-valuemin=0', () => {
    const { container } = renderProgressRing();
    expect(getByRole(container, 'progressbar')).toHaveAttribute('aria-valuemin', '0');
  });

  it('has aria-valuemax=100 by default', () => {
    const { container } = renderProgressRing();
    expect(getByRole(container, 'progressbar')).toHaveAttribute('aria-valuemax', '100');
  });

  it('has aria-valuemax=50 when max={50}', () => {
    const { container } = renderProgressRing({ max: 50 });
    expect(getByRole(container, 'progressbar')).toHaveAttribute('aria-valuemax', '50');
  });

  it('has aria-label matching label prop', () => {
    const { container } = renderProgressRing({ label: 'Download progress' });
    expect(getByRole(container, 'progressbar')).toHaveAccessibleName('Download progress');
  });

  it('applies .md class by default', () => {
    const { container } = renderProgressRing();
    expect(getByRole(container, 'progressbar')).toHaveClass(classNames.md);
  });

  it('applies .sm class when size="sm"', () => {
    const { container } = renderProgressRing({ size: 'sm' });
    expect(getByRole(container, 'progressbar')).toHaveClass(classNames.sm);
  });

  it('applies .lg class when size="lg"', () => {
    const { container } = renderProgressRing({ size: 'lg' });
    expect(getByRole(container, 'progressbar')).toHaveClass(classNames.lg);
  });

  it('applies .variantDefault by default', () => {
    const { container } = renderProgressRing();
    expect(container.querySelector(`.${classNames.arc}`)).toHaveClass(classNames.variantDefault);
  });

  it('applies .variantSuccess when variant="success"', () => {
    const { container } = renderProgressRing({ variant: 'success' });
    expect(container.querySelector(`.${classNames.arc}`)).toHaveClass(classNames.variantSuccess);
  });

  it('applies .variantWarning when variant="warning"', () => {
    const { container } = renderProgressRing({ variant: 'warning' });
    expect(container.querySelector(`.${classNames.arc}`)).toHaveClass(classNames.variantWarning);
  });

  it('applies .variantDanger when variant="danger"', () => {
    const { container } = renderProgressRing({ variant: 'danger' });
    expect(container.querySelector(`.${classNames.arc}`)).toHaveClass(classNames.variantDanger);
  });

  it('applies .variantInfo when variant="info"', () => {
    const { container } = renderProgressRing({ variant: 'info' });
    expect(container.querySelector(`.${classNames.arc}`)).toHaveClass(classNames.variantInfo);
  });

  it('applies .indeterminate class to SVG when value is undefined', () => {
    const { container } = render(<ProgressRing label="Upload progress" />);
    expect(container.querySelector('svg')).toHaveClass(classNames.indeterminate);
  });

  it('does not apply .indeterminate when value is a number', () => {
    const { container } = renderProgressRing();
    expect(container.querySelector('svg')).not.toHaveClass(classNames.indeterminate);
  });

  it('does not render value label by default', () => {
    const { container } = renderProgressRing();
    expect(container.querySelector(`.${classNames.valueLabel}`)).not.toBeInTheDocument();
  });

  it('renders "50%" label when showValue={true} and value={50}', () => {
    const { container } = renderProgressRing({ showValue: true, value: 50 });
    expect(getByText(container, '50%')).toBeInTheDocument();
  });

  it('value label has aria-hidden="true"', () => {
    const { container } = renderProgressRing({ showValue: true, value: 50 });
    expect(getByText(container, '50%')).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render value label when indeterminate', () => {
    const { container } = render(<ProgressRing label="Upload progress" showValue />);
    expect(container.querySelector(`.${classNames.valueLabel}`)).not.toBeInTheDocument();
  });

  it('applies .noAnimation class when animated={false}', () => {
    const { container } = renderProgressRing({ animated: false });
    expect(container.querySelector('svg')).toHaveClass(classNames.noAnimation);
  });

  it('warns in development when neither label nor aria-labelledby is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<ProgressRing value={50} />);

    expect(warn).toHaveBeenCalledWith(
      'ProgressRing expects a label or aria-labelledby prop for accessibility.'
    );
  });

  it('does not warn when aria-labelledby is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <>
        <span id="progress-ring-label">Upload progress</span>
        <ProgressRing value={50} aria-labelledby="progress-ring-label" />
      </>
    );

    expect(warn).not.toHaveBeenCalled();
  });

  it('axe: passes for value=50', async () => {
    const { container } = renderProgressRing({ value: 50 });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes for indeterminate', async () => {
    const { container } = render(<ProgressRing label="Upload progress" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes for all size variants', async () => {
    const { container } = render(
      <>
        <ProgressRing label="Small upload progress" value={50} size="sm" />
        <ProgressRing label="Medium upload progress" value={50} size="md" />
        <ProgressRing label="Large upload progress" value={50} size="lg" />
      </>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes for all variant modifiers', async () => {
    const { container } = render(
      <>
        <ProgressRing label="Default upload progress" value={50} variant="default" />
        <ProgressRing label="Success upload progress" value={50} variant="success" />
        <ProgressRing label="Warning upload progress" value={50} variant="warning" />
        <ProgressRing label="Danger upload progress" value={50} variant="danger" />
        <ProgressRing label="Info upload progress" value={50} variant="info" />
      </>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes with showValue={true}', async () => {
    const { container } = renderProgressRing({ showValue: true, value: 50 });
    expect(await axe(container)).toHaveNoViolations();
  });
});

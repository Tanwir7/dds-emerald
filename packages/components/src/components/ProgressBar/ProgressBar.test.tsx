import { getByRole, getByText } from '@testing-library/react';
import { axe } from 'jest-axe';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { ProgressBar } from './ProgressBar';
import styles from './ProgressBar.module.scss';

const classNames = {
  wrapper: getRequiredClassName(styles, 'wrapper'),
  root: getRequiredClassName(styles, 'root'),
  indicator: getRequiredClassName(styles, 'indicator'),
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

const renderProgressBar = (props: React.ComponentProps<typeof ProgressBar> = {}) =>
  render(<ProgressBar label="Upload progress" value={50} {...props} />);

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('ProgressBar', () => {
  it('renders a progressbar role element', () => {
    const { container } = renderProgressBar();
    expect(getByRole(container, 'progressbar')).toBeInTheDocument();
  });

  it('renders Progress.Indicator inside root', () => {
    const { container } = renderProgressBar();
    const root = getByRole(container, 'progressbar');
    const indicator = container.querySelector(`.${classNames.indicator}`) as HTMLDivElement | null;

    expect(indicator).toBeInTheDocument();
    expect(root).toContainElement(indicator);
  });

  it('forwards className to wrapper div', () => {
    const { container } = renderProgressBar({ className: 'custom-progress' });
    const wrapper = container.firstElementChild as HTMLElement | null;

    expect(wrapper).toHaveClass(classNames.wrapper, 'custom-progress');
  });

  it('forwards ref to Radix root HTMLDivElement', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = renderProgressBar({ ref });

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(getByRole(container, 'progressbar'));
  });

  it('has aria-valuenow=0 when value={0}', () => {
    const { container } = renderProgressBar({ value: 0 });
    expect(getByRole(container, 'progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('has aria-valuenow=50 when value={50}', () => {
    const { container } = renderProgressBar({ value: 50 });
    expect(getByRole(container, 'progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('translates the indicator based on the current percentage', () => {
    const { container } = renderProgressBar({ value: 50 });
    const indicator = container.querySelector(`.${classNames.indicator}`) as HTMLDivElement | null;

    expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
  });

  it('has aria-valuenow=100 when value={100}', () => {
    const { container } = renderProgressBar({ value: 100 });
    expect(getByRole(container, 'progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('does not have aria-valuenow when value is undefined', () => {
    const { container } = render(<ProgressBar label="Upload progress" />);
    expect(getByRole(container, 'progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('has aria-valuemin=0', () => {
    const { container } = renderProgressBar();
    expect(getByRole(container, 'progressbar')).toHaveAttribute('aria-valuemin', '0');
  });

  it('has aria-valuemax=100', () => {
    const { container } = renderProgressBar();
    expect(getByRole(container, 'progressbar')).toHaveAttribute('aria-valuemax', '100');
  });

  it('has aria-valuemax=200 when max={200}', () => {
    const { container } = renderProgressBar({ max: 200 });
    expect(getByRole(container, 'progressbar')).toHaveAttribute('aria-valuemax', '200');
  });

  it('scales the indicator transform against a custom max', () => {
    const { container } = renderProgressBar({ value: 50, max: 200 });
    const indicator = container.querySelector(`.${classNames.indicator}`) as HTMLDivElement | null;

    expect(indicator).toHaveStyle({ transform: 'translateX(-75%)' });
  });

  it('has aria-label matching label prop', () => {
    const { container } = renderProgressBar({ label: 'Download progress' });
    expect(getByRole(container, 'progressbar')).toHaveAccessibleName('Download progress');
  });

  it('applies .md class by default', () => {
    const { container } = renderProgressBar();
    expect(getByRole(container, 'progressbar')).toHaveClass(classNames.md);
  });

  it('applies .sm class when size="sm"', () => {
    const { container } = renderProgressBar({ size: 'sm' });
    expect(getByRole(container, 'progressbar')).toHaveClass(classNames.sm);
  });

  it('applies .lg class when size="lg"', () => {
    const { container } = renderProgressBar({ size: 'lg' });
    expect(getByRole(container, 'progressbar')).toHaveClass(classNames.lg);
  });

  it('applies .variantDefault by default', () => {
    const { container } = renderProgressBar();
    expect(container.querySelector(`.${classNames.indicator}`)).toHaveClass(
      classNames.variantDefault
    );
  });

  it('applies .variantSuccess when variant="success"', () => {
    const { container } = renderProgressBar({ variant: 'success' });
    expect(container.querySelector(`.${classNames.indicator}`)).toHaveClass(
      classNames.variantSuccess
    );
  });

  it('applies .variantWarning when variant="warning"', () => {
    const { container } = renderProgressBar({ variant: 'warning' });
    expect(container.querySelector(`.${classNames.indicator}`)).toHaveClass(
      classNames.variantWarning
    );
  });

  it('applies .variantDanger when variant="danger"', () => {
    const { container } = renderProgressBar({ variant: 'danger' });
    expect(container.querySelector(`.${classNames.indicator}`)).toHaveClass(
      classNames.variantDanger
    );
  });

  it('applies .variantInfo when variant="info"', () => {
    const { container } = renderProgressBar({ variant: 'info' });
    expect(container.querySelector(`.${classNames.indicator}`)).toHaveClass(classNames.variantInfo);
  });

  it('applies .indeterminate class when value is undefined', () => {
    const { container } = render(<ProgressBar label="Upload progress" />);
    expect(getByRole(container, 'progressbar')).toHaveClass(classNames.indeterminate);
  });

  it('does not apply .indeterminate when value is a number', () => {
    const { container } = renderProgressBar();
    expect(getByRole(container, 'progressbar')).not.toHaveClass(classNames.indeterminate);
  });

  it('does not render value label by default', () => {
    const { container } = renderProgressBar();
    expect(container.querySelector(`.${classNames.valueLabel}`)).not.toBeInTheDocument();
  });

  it('renders "50%" label when showValue={true} and value={50}', () => {
    const { container } = renderProgressBar({ showValue: true, value: 50 });
    expect(getByText(container, '50%')).toBeInTheDocument();
  });

  it('value label has aria-hidden="true"', () => {
    const { container } = renderProgressBar({ showValue: true, value: 50 });
    expect(getByText(container, '50%')).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render value label when indeterminate', () => {
    const { container } = render(<ProgressBar label="Upload progress" showValue />);
    expect(container.querySelector(`.${classNames.valueLabel}`)).not.toBeInTheDocument();
  });

  it('does not apply .noAnimation by default', () => {
    const { container } = renderProgressBar();
    expect(getByRole(container, 'progressbar')).not.toHaveClass(classNames.noAnimation);
  });

  it('applies .noAnimation when animated={false}', () => {
    const { container } = renderProgressBar({ animated: false });
    expect(getByRole(container, 'progressbar')).toHaveClass(classNames.noAnimation);
  });

  it('warns in development when neither label nor aria-labelledby is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<ProgressBar value={50} />);

    expect(warn).toHaveBeenCalledWith(
      'ProgressBar expects a label or aria-labelledby prop for accessibility.'
    );
  });

  it('does not warn when aria-labelledby is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <>
        <span id="progress-label">Upload progress</span>
        <ProgressBar value={50} aria-labelledby="progress-label" />
      </>
    );

    expect(warn).not.toHaveBeenCalled();
  });

  it('axe: passes for value=50', async () => {
    const { container } = renderProgressBar({ value: 50 });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes for value=0', async () => {
    const { container } = renderProgressBar({ value: 0 });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes for value=100', async () => {
    const { container } = renderProgressBar({ value: 100 });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes for indeterminate', async () => {
    const { container } = render(<ProgressBar label="Upload progress" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes for all size variants', async () => {
    const { container } = render(
      <>
        <ProgressBar label="Small upload progress" value={50} size="sm" />
        <ProgressBar label="Medium upload progress" value={50} size="md" />
        <ProgressBar label="Large upload progress" value={50} size="lg" />
      </>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes for all variant modifiers', async () => {
    const { container } = render(
      <>
        <ProgressBar label="Default upload progress" value={50} variant="default" />
        <ProgressBar label="Success upload progress" value={50} variant="success" />
        <ProgressBar label="Warning upload progress" value={50} variant="warning" />
        <ProgressBar label="Danger upload progress" value={50} variant="danger" />
        <ProgressBar label="Info upload progress" value={50} variant="info" />
      </>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes with showValue={true}', async () => {
    const { container } = renderProgressBar({ showValue: true, value: 50 });
    expect(await axe(container)).toHaveNoViolations();
  });
});

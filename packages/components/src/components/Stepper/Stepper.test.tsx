// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { Step, Stepper } from './Stepper';
import styles from './Stepper.module.scss';

expect.extend(toHaveNoViolations);

const classNames = {
  stepper: getRequiredClassName(styles, 'stepper'),
  step: getRequiredClassName(styles, 'step'),
  horizontal: getRequiredClassName(styles, 'horizontal'),
  vertical: getRequiredClassName(styles, 'vertical'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  pending: getRequiredClassName(styles, 'pending'),
  active: getRequiredClassName(styles, 'active'),
  completed: getRequiredClassName(styles, 'completed'),
  error: getRequiredClassName(styles, 'error'),
  disabled: getRequiredClassName(styles, 'disabled'),
  clickable: getRequiredClassName(styles, 'clickable'),
  indicator: getRequiredClassName(styles, 'indicator'),
  connector: getRequiredClassName(styles, 'connector'),
  connectorCompleted: getRequiredClassName(styles, 'connectorCompleted'),
} as const;

afterEach(() => {
  cleanup();
});

const renderStepper = (props: Partial<React.ComponentProps<typeof Stepper>> = {}) =>
  render(
    <Stepper activeStep={1} {...props}>
      <Step label="Account" />
      <Step label="Billing" />
      <Step label="Review" />
    </Stepper>
  );

describe('Stepper', () => {
  describe('rendering', () => {
    it('renders a div with role="list"', () => {
      renderStepper();
      expect(screen.getByRole('list', { name: 'Progress steps' })).toBeInTheDocument();
    });

    it('has aria-label="Progress steps"', () => {
      renderStepper();
      expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Progress steps');
    });

    it('renders the correct number of Step children', () => {
      renderStepper();
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    it('renders connectors between steps', () => {
      const { container } = renderStepper();
      expect(container.querySelectorAll(`.${classNames.connector}`)).toHaveLength(2);
    });

    it('does not render a connector after the last step', () => {
      const { container } = renderStepper();
      const root = screen.getByRole('list');

      expect(root.lastElementChild).toHaveClass(classNames.step);
      expect(container.querySelectorAll(`.${classNames.connector}`)).toHaveLength(2);
    });

    it('forwards className to the stepper root', () => {
      renderStepper({ className: 'custom-stepper' });
      expect(screen.getByRole('list')).toHaveClass('custom-stepper');
    });

    it('forwards ref to the stepper div', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Stepper ref={ref} activeStep={0}>
          <Step label="Account" />
        </Stepper>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toBe(screen.getByRole('list'));
    });
  });

  describe('status derivation', () => {
    it('marks steps before activeStep as completed', () => {
      renderStepper({ activeStep: 1 });
      expect(screen.getAllByRole('listitem')[0]).toHaveClass(classNames.completed);
    });

    it('marks the step at activeStep as active', () => {
      renderStepper({ activeStep: 1 });
      expect(screen.getAllByRole('listitem')[1]).toHaveClass(classNames.active);
    });

    it('marks steps after activeStep as pending', () => {
      renderStepper({ activeStep: 1 });
      expect(screen.getAllByRole('listitem')[2]).toHaveClass(classNames.pending);
    });

    it('lets an explicit Step status override the derived status', () => {
      render(
        <Stepper activeStep={1}>
          <Step label="Account" status="error" />
          <Step label="Billing" />
          <Step label="Review" />
        </Stepper>
      );

      expect(screen.getAllByRole('listitem')[0]).toHaveClass(classNames.error);
      expect(screen.getAllByRole('listitem')[0]).not.toHaveClass(classNames.completed);
    });
  });

  describe('orientation', () => {
    it('applies the horizontal class by default', () => {
      renderStepper();
      expect(screen.getByRole('list')).toHaveClass(classNames.horizontal);
    });

    it('applies the vertical class when orientation="vertical"', () => {
      renderStepper({ orientation: 'vertical' });
      expect(screen.getByRole('list')).toHaveClass(classNames.vertical);
    });
  });

  describe('connector completion', () => {
    it('marks the connector after a completed step as completed', () => {
      const { container } = renderStepper({ activeStep: 1 });
      expect(container.querySelectorAll(`.${classNames.connectorCompleted}`)).toHaveLength(1);
    });

    it('does not mark the connector after the active step as completed', () => {
      const { container } = renderStepper({ activeStep: 1 });
      const connectors = Array.from(container.querySelectorAll(`.${classNames.connector}`));

      expect(connectors[0]).toHaveClass(classNames.connectorCompleted);
      expect(connectors[1]).not.toHaveClass(classNames.connectorCompleted);
    });
  });

  describe('Step rendering', () => {
    it('renders a div with role="listitem"', () => {
      render(<Step label="Account" />);
      expect(screen.getByRole('listitem')).toBeInTheDocument();
    });

    it('renders the label text', () => {
      render(<Step label="Account" />);
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('renders the description when provided', () => {
      render(<Step label="Account" description="Create your login" />);
      expect(screen.getByText('Create your login')).toBeInTheDocument();
    });

    it('does not render the description when omitted', () => {
      render(<Step label="Account" />);
      expect(screen.queryByText('Create your login')).not.toBeInTheDocument();
    });

    it('renders the step number for pending and active steps', () => {
      const { rerender } = render(<Step label="Account" stepNumber={2} status="pending" />);
      expect(screen.getByText('2')).toBeInTheDocument();

      rerender(<Step label="Account" stepNumber={2} status="active" />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders a check icon for completed steps', () => {
      const { container } = render(<Step label="Account" status="completed" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });

    it('renders an alert icon for error steps', () => {
      const { container } = render(<Step label="Account" status="error" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });

    it('renders a custom icon when provided', () => {
      render(<Step label="Account" icon={<svg data-testid="custom-icon" />} />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('marks the indicator as aria-hidden', () => {
      const { container } = render(<Step label="Account" />);
      expect(container.querySelector(`.${classNames.indicator}`)).toHaveAttribute(
        'aria-hidden',
        'true'
      );
    });
  });

  describe('Step status', () => {
    it('has aria-current="step" when active', () => {
      render(<Step label="Account" status="active" />);
      expect(screen.getByRole('listitem')).toHaveAttribute('aria-current', 'step');
    });

    it('does not have aria-current when not active', () => {
      render(<Step label="Account" status="completed" />);
      expect(screen.getByRole('listitem')).not.toHaveAttribute('aria-current');
    });

    it('applies the active class when active', () => {
      render(<Step label="Account" status="active" />);
      expect(screen.getByRole('listitem')).toHaveClass(classNames.active);
    });

    it('applies the completed class when completed', () => {
      render(<Step label="Account" status="completed" />);
      expect(screen.getByRole('listitem')).toHaveClass(classNames.completed);
    });

    it('applies the pending class when pending', () => {
      render(<Step label="Account" status="pending" />);
      expect(screen.getByRole('listitem')).toHaveClass(classNames.pending);
    });

    it('applies the error class when error', () => {
      render(<Step label="Account" status="error" />);
      expect(screen.getByRole('listitem')).toHaveClass(classNames.error);
    });
  });

  describe('screen-reader status text', () => {
    it('renders visually hidden status text beside the label', () => {
      render(<Step label="Account" status="completed" />);
      expect(screen.getByText('completed')).toBeInTheDocument();
    });

    it('announces "current step" for the active step', () => {
      render(<Step label="Account" status="active" />);
      expect(screen.getByText('current step')).toBeInTheDocument();
    });

    it('announces "error" for an error step', () => {
      render(<Step label="Account" status="error" />);
      expect(screen.getByText('error')).toBeInTheDocument();
    });
  });

  describe('disabled steps', () => {
    it('has aria-disabled="true" on the interactive control when disabled', () => {
      render(<Step label="Account" disabled />);
      expect(screen.getByRole('button', { name: /Account/i })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('applies the disabled class when disabled', () => {
      render(<Step label="Account" disabled />);
      expect(screen.getByRole('listitem')).toHaveClass(classNames.disabled);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<Step label="Account" disabled onClick={onClick} />);
      await user.click(screen.getByRole('button', { name: /Account/i }));

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('clickable steps', () => {
    it('applies the clickable class when onClick is provided', () => {
      render(<Step label="Account" onClick={() => undefined} />);
      expect(screen.getByRole('listitem')).toHaveClass(classNames.clickable);
    });

    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<Step label="Account" onClick={onClick} />);
      await user.click(screen.getByRole('button', { name: /Account/i }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('inherits clickable behavior from nonLinear stepper context', () => {
      render(
        <Stepper activeStep={0} nonLinear>
          <Step label="Account" />
        </Stepper>
      );

      expect(screen.getByRole('listitem')).toHaveClass(classNames.clickable);
    });
  });

  describe('keyboard support', () => {
    it('renders a focusable button when clickable', () => {
      render(<Step label="Account" onClick={() => undefined} />);
      expect(screen.getByRole('button', { name: /Account/i })).toBeInTheDocument();
    });

    it('activates on Enter', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<Step label="Account" onClick={onClick} />);
      const step = screen.getByRole('button', { name: /Account/i });
      step.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('activates on Space', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<Step label="Account" onClick={onClick} />);
      const step = screen.getByRole('button', { name: /Account/i });
      step.focus();
      await user.keyboard('{Space}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('sizes', () => {
    it('applies the md size by default', () => {
      render(<Step label="Account" />);
      expect(screen.getByRole('listitem')).toHaveClass(classNames.md);
    });

    it('applies the sm size from Stepper context', () => {
      render(
        <Stepper activeStep={0} size="sm">
          <Step label="Account" />
        </Stepper>
      );

      expect(screen.getByRole('listitem')).toHaveClass(classNames.sm);
    });
  });

  describe('connector', () => {
    it('has the completed class when completed=true', () => {
      const { container } = renderStepper({ activeStep: 1 });
      expect(container.querySelector(`.${classNames.connectorCompleted}`)).toBeInTheDocument();
    });

    it('is aria-hidden', () => {
      const { container } = renderStepper();
      expect(container.querySelector(`.${classNames.connector}`)).toHaveAttribute(
        'aria-hidden',
        'true'
      );
    });
  });

  describe('axe', () => {
    it('passes for a 3-step horizontal stepper', async () => {
      const { container } = renderStepper({ activeStep: 1 });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes for vertical orientation', async () => {
      const { container } = renderStepper({ orientation: 'vertical' });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes with an error step', async () => {
      const { container } = render(
        <Stepper activeStep={1}>
          <Step label="Account" status="completed" />
          <Step label="Billing" status="error" />
          <Step label="Review" />
        </Stepper>
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes with completed steps', async () => {
      const { container } = render(
        <Stepper activeStep={3}>
          <Step label="Account" />
          <Step label="Billing" />
          <Step label="Review" />
        </Stepper>
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes with a disabled step', async () => {
      const { container } = render(
        <Stepper activeStep={1}>
          <Step label="Account" />
          <Step label="Billing" disabled />
          <Step label="Review" />
        </Stepper>
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes with nonLinear clickable steps', async () => {
      const { container } = render(
        <Stepper activeStep={1} nonLinear>
          <Step label="Account" onClick={() => undefined} />
          <Step label="Billing" onClick={() => undefined} />
          <Step label="Review" onClick={() => undefined} />
        </Stepper>
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

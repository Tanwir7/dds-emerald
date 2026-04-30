import clsx from 'clsx';
import { AlertCircle, Check } from 'lucide-react';
import React from 'react';
import { VisuallyHidden } from '../VisuallyHidden';
import styles from './Stepper.module.scss';

export type StepStatus = 'pending' | 'active' | 'completed' | 'error';

type StepperOrientation = 'horizontal' | 'vertical';
type StepperSize = 'sm' | 'md';

type StepperContextValue = {
  orientation: StepperOrientation;
  size: StepperSize;
  nonLinear: boolean;
};

const StepperContext = React.createContext<StepperContextValue>({
  orientation: 'horizontal',
  size: 'md',
  nonLinear: false,
});

export interface StepProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onClick'
> {
  status?: StepStatus;
  stepNumber?: number;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface StepperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  activeStep: number;
  orientation?: StepperOrientation;
  size?: StepperSize;
  nonLinear?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface StepConnectorProps {
  completed: boolean;
  orientation: StepperOrientation;
}

const isStepElement = (child: React.ReactNode): child is React.ReactElement<StepProps> =>
  React.isValidElement(child) && child.type === Step;

const getStepStatusLabel = (status: StepStatus) => {
  if (status === 'active') {
    return 'current step';
  }

  return status;
};

const renderDefaultIndicator = (status: StepStatus, stepNumber: number) => {
  switch (status) {
    case 'completed':
      return (
        <span className={styles.indicatorIcon}>
          <Check aria-hidden="true" />
        </span>
      );
    case 'error':
      return (
        <span className={styles.indicatorIcon}>
          <AlertCircle aria-hidden="true" />
        </span>
      );
    case 'active':
    case 'pending':
    default:
      return <span className={styles.stepNumber}>{stepNumber}</span>;
  }
};

const StepConnector = ({ completed, orientation }: StepConnectorProps) => (
  <div
    aria-hidden="true"
    className={clsx(
      styles.connector,
      completed && styles.connectorCompleted,
      orientation === 'vertical' && styles.connectorVertical
    )}
  />
);

export const Step = React.forwardRef<HTMLDivElement, StepProps>(
  (
    {
      status = 'pending',
      stepNumber = 1,
      label,
      description,
      icon,
      disabled = false,
      onClick,
      className,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const { orientation, size, nonLinear } = React.useContext(StepperContext);
    const isInteractive = Boolean(onClick) || nonLinear || disabled;
    const handleControlKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event as React.KeyboardEvent<HTMLDivElement>);

      if (event.defaultPrevented || disabled || !onClick) {
        return;
      }

      if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Space') {
        event.preventDefault();
        onClick();
      }
    };

    return (
      <div
        ref={ref}
        role="listitem"
        aria-current={status === 'active' ? 'step' : undefined}
        className={clsx(
          styles.step,
          styles[orientation],
          styles[status],
          styles[size],
          disabled && styles.disabled,
          isInteractive && styles.clickable,
          className
        )}
        {...props}
      >
        {isInteractive ? (
          <button
            type="button"
            className={styles.control}
            onClick={!disabled ? onClick : undefined}
            onKeyDown={handleControlKeyDown}
            disabled={disabled}
            aria-disabled={disabled ? true : undefined}
          >
            <div className={styles.indicator} aria-hidden="true">
              {icon ? (
                <span className={styles.indicatorIcon}>{icon}</span>
              ) : (
                renderDefaultIndicator(status, stepNumber)
              )}
            </div>

            <div className={styles.content}>
              <span className={styles.label}>
                {label} <VisuallyHidden>{getStepStatusLabel(status)}</VisuallyHidden>
              </span>
              {description ? <span className={styles.description}>{description}</span> : null}
            </div>
          </button>
        ) : (
          <div className={styles.control}>
            <div className={styles.indicator} aria-hidden="true">
              {icon ? (
                <span className={styles.indicatorIcon}>{icon}</span>
              ) : (
                renderDefaultIndicator(status, stepNumber)
              )}
            </div>

            <div className={styles.content}>
              <span className={styles.label}>
                {label} <VisuallyHidden>{getStepStatusLabel(status)}</VisuallyHidden>
              </span>
              {description ? <span className={styles.description}>{description}</span> : null}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Step.displayName = 'Step';

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      activeStep,
      orientation = 'horizontal',
      size = 'md',
      nonLinear = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const steps = React.Children.toArray(children).filter(isStepElement);
    const enrichedSteps = steps.map((child, index) => {
      const derivedStatus: StepStatus =
        child.props.status ??
        (index < activeStep ? 'completed' : index === activeStep ? 'active' : 'pending');

      return React.cloneElement(child, {
        status: derivedStatus,
        stepNumber: index + 1,
      });
    });

    return (
      <div
        ref={ref}
        role="list"
        aria-label="Progress steps"
        className={clsx(styles.stepper, styles[orientation], styles[size], className)}
        {...props}
      >
        <StepperContext.Provider value={{ orientation, size, nonLinear }}>
          {enrichedSteps.map((step, index) => {
            const stepStatus = step.props.status ?? 'pending';

            return (
              <React.Fragment key={step.key ?? index}>
                {step}
                {index < enrichedSteps.length - 1 ? (
                  <StepConnector completed={stepStatus === 'completed'} orientation={orientation} />
                ) : null}
              </React.Fragment>
            );
          })}
        </StepperContext.Provider>
      </div>
    );
  }
);

Stepper.displayName = 'Stepper';

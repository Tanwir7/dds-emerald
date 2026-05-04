import clsx from 'clsx';
import { CheckCircle, Info, OctagonAlert, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import React from 'react';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { Icon } from '../Icon';
import { Text } from '../Text';
import styles from './Alert.module.scss';

export type AlertIntent = 'info' | 'success' | 'warning' | 'danger';
export type AlertAlign = 'center' | 'start';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'align'> {
  intent?: AlertIntent;
  align?: AlertAlign;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const intentClassName: Record<AlertIntent, string> = {
  info: getRequiredClassName(styles, 'intentInfo'),
  success: getRequiredClassName(styles, 'intentSuccess'),
  warning: getRequiredClassName(styles, 'intentWarning'),
  danger: getRequiredClassName(styles, 'intentDanger'),
};

const alignClassName: Record<AlertAlign, string> = {
  center: getRequiredClassName(styles, 'alignCenter'),
  start: getRequiredClassName(styles, 'alignStart'),
};

const defaultAlertIcon: Record<AlertIntent, LucideIcon> = {
  info: Info,
  success: CheckCircle,
  warning: TriangleAlert,
  danger: OctagonAlert,
};

const getAlertAccessibilityProps = (intent: AlertIntent) => {
  const isAssertive = intent === 'warning' || intent === 'danger';
  const role: 'alert' | 'status' = isAssertive ? 'alert' : 'status';
  const ariaLive: 'assertive' | 'polite' = isAssertive ? 'assertive' : 'polite';

  return {
    role,
    'aria-live': ariaLive,
    'aria-atomic': 'true' as const,
  };
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      intent = 'info',
      align = 'center',
      title,
      dismissible = false,
      onDismiss,
      icon,
      showIcon = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const hasBodyContent = children !== undefined && children !== null;
    const dismissLabel = title ? `Dismiss: ${title}` : 'Dismiss alert';

    return (
      <div
        ref={ref}
        className={clsx(
          getRequiredClassName(styles, 'root'),
          intentClassName[intent],
          alignClassName[align],
          className
        )}
        {...props}
        {...getAlertAccessibilityProps(intent)}
      >
        {showIcon ? (
          <span className={getRequiredClassName(styles, 'icon')} aria-hidden="true">
            {icon ?? <Icon icon={defaultAlertIcon[intent]} size="lg" />}
          </span>
        ) : null}

        <div className={getRequiredClassName(styles, 'content')}>
          {title ? (
            <Text size="sm" weight="semibold" className={getRequiredClassName(styles, 'title')}>
              {title}
            </Text>
          ) : null}
          {hasBodyContent ? (
            <Text as="div" size="sm" className={getRequiredClassName(styles, 'body')}>
              {children}
            </Text>
          ) : null}
        </div>

        {dismissible ? (
          <button
            type="button"
            className={getRequiredClassName(styles, 'dismiss')}
            aria-label={dismissLabel}
            onClick={onDismiss}
          >
            <Icon icon={X} size="lg" />
          </button>
        ) : null}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

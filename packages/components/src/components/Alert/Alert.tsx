import clsx from 'clsx';
import { BadgeAlert, CheckCircle, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import React from 'react';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { Icon } from '../Icon';
import styles from './Alert.module.scss';

export type AlertIntent = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  intent?: AlertIntent;
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

const defaultAlertIcon: Record<AlertIntent, LucideIcon> = {
  info: Info,
  success: CheckCircle,
  warning: TriangleAlert,
  danger: BadgeAlert,
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
        className={clsx(styles.root, intentClassName[intent], className)}
        {...props}
        {...getAlertAccessibilityProps(intent)}
      >
        {showIcon ? (
          <span className={styles.icon} aria-hidden="true">
            {icon ?? <Icon icon={defaultAlertIcon[intent]} size="lg" />}
          </span>
        ) : null}

        <div className={styles.content}>
          {title ? <p className={styles.title}>{title}</p> : null}
          {hasBodyContent ? <div className={styles.body}>{children}</div> : null}
        </div>

        {dismissible ? (
          <button
            type="button"
            className={styles.dismiss}
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

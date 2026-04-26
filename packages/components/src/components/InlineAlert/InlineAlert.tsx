import clsx from 'clsx';
import { BadgeAlert, CheckCircle, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import React from 'react';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { Icon } from '../Icon';
import { Text, type TextColor } from '../Text';
import styles from './InlineAlert.module.scss';

type AlertIntent = 'info' | 'success' | 'warning' | 'danger';

export interface InlineAlertProps extends React.HTMLAttributes<HTMLSpanElement> {
  intent?: AlertIntent;
  showIcon?: boolean;
  className?: string;
  children: React.ReactNode;
}

const intentClassName: Record<AlertIntent, string> = {
  info: getRequiredClassName(styles, 'intentInfo'),
  success: getRequiredClassName(styles, 'intentSuccess'),
  warning: getRequiredClassName(styles, 'intentWarning'),
  danger: getRequiredClassName(styles, 'intentDanger'),
};

const intentTextColor: Record<AlertIntent, TextColor> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
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

export const InlineAlert = React.forwardRef<HTMLSpanElement, InlineAlertProps>(
  ({ intent = 'info', showIcon = true, className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(styles.root, intentClassName[intent], className)}
        {...props}
        {...getAlertAccessibilityProps(intent)}
      >
        {showIcon ? (
          <span className={styles.icon} aria-hidden="true">
            <Icon icon={defaultAlertIcon[intent]} />
          </span>
        ) : null}
        <Text as="span" size="sm" color={intentTextColor[intent]} className={styles.message}>
          {children}
        </Text>
      </span>
    );
  }
);

InlineAlert.displayName = 'InlineAlert';

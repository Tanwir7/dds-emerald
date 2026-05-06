import React from 'react';
import styles from './CheckboxField.module.scss';
import clsx from 'clsx';
import { Checkbox, type CheckboxProps, type CheckboxSize } from '../Checkbox';
import { InlineAlert } from '../InlineAlert';
import { Label } from '../Label';
import { Text } from '../Text';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import type { FieldInlineAlert } from '../../types/fieldInlineAlert';

export interface CheckboxFieldProps extends Omit<
  CheckboxProps,
  'aria-describedby' | 'aria-invalid' | 'aria-required' | 'children' | 'className' | 'id'
> {
  label: string;
  required?: boolean;
  disabled?: boolean;
  helper?: string;
  inlineAlert?: FieldInlineAlert;
  id?: string;
  className?: string;
}

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  row: getRequiredClassName(styles, 'row'),
  helper: getRequiredClassName(styles, 'helper'),
  helperSm: getRequiredClassName(styles, 'helperSm'),
  helperMd: getRequiredClassName(styles, 'helperMd'),
} as const;

const helperSizeClassName: Record<CheckboxSize, string> = {
  sm: classNames.helperSm,
  md: classNames.helperMd,
};

export const CheckboxField = React.forwardRef<HTMLDivElement, CheckboxFieldProps>(
  (
    {
      label,
      required = false,
      disabled = false,
      helper,
      inlineAlert,
      id,
      size = 'md',
      invalid = false,
      className,
      ...checkboxProps
    },
    ref
  ) => {
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;
    const helperId = helper ? `${checkboxId}-helper` : undefined;
    const inlineAlertId = inlineAlert ? `${checkboxId}-inline-alert` : undefined;
    const describedBy = [helperId, inlineAlertId].filter(Boolean).join(' ') || undefined;
    const isInvalid = invalid || inlineAlert?.intent === 'danger';

    return (
      <div ref={ref} className={clsx(classNames.root, className)}>
        <div className={classNames.row}>
          <Checkbox
            id={checkboxId}
            size={size}
            disabled={disabled}
            invalid={isInvalid}
            aria-describedby={describedBy}
            aria-required={required ? true : undefined}
            aria-invalid={isInvalid ? true : undefined}
            {...checkboxProps}
          />
          <Label htmlFor={checkboxId} required={required}>
            {label}
          </Label>
        </div>

        {helper ? (
          <Text
            as="p"
            id={helperId}
            size="xs"
            color="muted"
            className={clsx(classNames.helper, helperSizeClassName[size])}
          >
            {helper}
          </Text>
        ) : null}

        {inlineAlert ? (
          <InlineAlert
            id={inlineAlertId}
            intent={inlineAlert.intent}
            className={clsx(classNames.helper, helperSizeClassName[size])}
            {...(inlineAlert.showIcon !== undefined ? { showIcon: inlineAlert.showIcon } : {})}
          >
            {inlineAlert.children}
          </InlineAlert>
        ) : null}
      </div>
    );
  }
);

CheckboxField.displayName = 'CheckboxField';

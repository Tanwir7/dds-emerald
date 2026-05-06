import React from 'react';
import styles from './SwitchField.module.scss';
import clsx from 'clsx';
import { InlineAlert } from '../InlineAlert';
import { Label } from '../Label';
import { Switch, type SwitchProps, type SwitchSize } from '../Switch';
import { Text } from '../Text';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import type { FieldInlineAlert } from '../../types/fieldInlineAlert';

export type SwitchFieldLabelPosition = 'right' | 'left';

export interface SwitchFieldProps extends Omit<
  SwitchProps,
  'aria-describedby' | 'aria-invalid' | 'aria-required' | 'children' | 'className' | 'id'
> {
  label: string;
  labelPosition?: SwitchFieldLabelPosition;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  instruction?: string;
  helper?: string;
  inlineAlert?: FieldInlineAlert;
  id?: string;
  className?: string;
}

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  row: getRequiredClassName(styles, 'row'),
  labelLeft: getRequiredClassName(styles, 'labelLeft'),
  labelGroup: getRequiredClassName(styles, 'labelGroup'),
  instruction: getRequiredClassName(styles, 'instruction'),
  description: getRequiredClassName(styles, 'description'),
  helper: getRequiredClassName(styles, 'helper'),
  helperSm: getRequiredClassName(styles, 'helperSm'),
  helperMd: getRequiredClassName(styles, 'helperMd'),
} as const;

const helperSizeClassName: Record<SwitchSize, string> = {
  sm: classNames.helperSm,
  md: classNames.helperMd,
};

const mergeIds = (...ids: Array<string | undefined>) => ids.filter(Boolean).join(' ') || undefined;

export const SwitchField = React.forwardRef<HTMLDivElement, SwitchFieldProps>(
  (
    {
      label,
      labelPosition = 'right',
      description,
      required = false,
      disabled = false,
      instruction,
      helper,
      inlineAlert,
      id,
      size = 'md',
      invalid = false,
      className,
      ...switchProps
    },
    ref
  ) => {
    const generatedId = React.useId();
    const switchId = id ?? generatedId;
    const instructionId = instruction ? `${switchId}-instruction` : undefined;
    const helperId = helper ? `${switchId}-helper` : undefined;
    const inlineAlertId = inlineAlert ? `${switchId}-inline-alert` : undefined;
    const descriptionId = description ? `${switchId}-desc` : undefined;
    const describedBy = mergeIds(instructionId, descriptionId, helperId, inlineAlertId);
    const isInvalid = invalid || inlineAlert?.intent === 'danger';

    return (
      <div ref={ref} className={clsx(classNames.root, className)}>
        {instruction ? (
          <Text
            as="p"
            id={instructionId}
            size="xs"
            color="muted"
            className={classNames.instruction}
          >
            {instruction}
          </Text>
        ) : null}

        <div className={clsx(classNames.row, labelPosition === 'left' && classNames.labelLeft)}>
          <Switch
            id={switchId}
            size={size}
            disabled={disabled}
            invalid={isInvalid}
            aria-describedby={describedBy}
            aria-required={required ? true : undefined}
            aria-invalid={isInvalid ? true : undefined}
            {...switchProps}
          />

          <div className={classNames.labelGroup}>
            <Label htmlFor={switchId} required={required}>
              {label}
            </Label>
            {description ? (
              <Text
                as="span"
                id={descriptionId}
                size="xs"
                color="muted"
                className={classNames.description}
              >
                {description}
              </Text>
            ) : null}
          </div>
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

SwitchField.displayName = 'SwitchField';

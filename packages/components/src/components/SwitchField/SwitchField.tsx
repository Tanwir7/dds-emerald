import React from 'react';
import styles from './SwitchField.module.scss';
import clsx from 'clsx';
import { Label } from '../Label';
import { Switch, type SwitchProps, type SwitchSize } from '../Switch';
import { Text, type TextColor } from '../Text';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type SwitchFieldLabelPosition = 'right' | 'left';
export type SwitchFieldHelperIntent = 'default' | 'error' | 'success';

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
  helperIntent?: SwitchFieldHelperIntent;
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

const helperColor: Record<SwitchFieldHelperIntent, TextColor> = {
  default: 'muted',
  error: 'danger',
  success: 'success',
};

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
      helperIntent = 'default',
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
    const descriptionId = description ? `${switchId}-desc` : undefined;
    const describedBy = mergeIds(instructionId, descriptionId, helperId);
    const isInvalid = invalid || helperIntent === 'error';

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
            <Label htmlFor={switchId} required={required} disabled={disabled}>
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
            color={helperColor[helperIntent]}
            className={clsx(classNames.helper, helperSizeClassName[size])}
          >
            {helper}
          </Text>
        ) : null}
      </div>
    );
  }
);

SwitchField.displayName = 'SwitchField';

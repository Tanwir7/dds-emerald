import React from 'react';
import styles from './RadioGroupField.module.scss';
import clsx from 'clsx';
import { RadioGroup, type RadioGroupOrientation, type RadioGroupProps } from '../Radio';
import { Text, type TextColor } from '../Text';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type RadioGroupFieldHelperIntent = 'default' | 'error' | 'success';

export interface RadioGroupFieldProps extends Omit<
  RadioGroupProps,
  | 'aria-describedby'
  | 'aria-invalid'
  | 'aria-labelledby'
  | 'aria-required'
  | 'children'
  | 'className'
  | 'disabled'
  | 'id'
  | 'required'
> {
  label: string;
  required?: boolean;
  disabled?: boolean;
  instruction?: string;
  helper?: string;
  helperIntent?: RadioGroupFieldHelperIntent;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  groupLabel: getRequiredClassName(styles, 'groupLabel'),
  groupLabelNoInstruction: getRequiredClassName(styles, 'groupLabelNoInstruction'),
  groupLabelDisabled: getRequiredClassName(styles, 'groupLabelDisabled'),
  requiredMark: getRequiredClassName(styles, 'requiredMark'),
  instruction: getRequiredClassName(styles, 'instruction'),
  helper: getRequiredClassName(styles, 'helper'),
} as const;

const helperColor: Record<RadioGroupFieldHelperIntent, TextColor> = {
  default: 'muted',
  error: 'danger',
  success: 'success',
};

const mergeIds = (...ids: Array<string | undefined>) => ids.filter(Boolean).join(' ') || undefined;

export const RadioGroupField = React.forwardRef<HTMLDivElement, RadioGroupFieldProps>(
  (
    {
      label,
      required = false,
      disabled = false,
      instruction,
      helper,
      helperIntent = 'default',
      id,
      orientation = 'vertical',
      className,
      children,
      ...radioGroupProps
    },
    ref
  ) => {
    const generatedId = React.useId();
    const baseId = id ?? generatedId;
    const labelId = `${baseId}-label`;
    const instructionId = instruction ? `${baseId}-instruction` : undefined;
    const helperId = helper ? `${baseId}-helper` : undefined;
    const describedBy = mergeIds(instructionId, helperId);
    const isInvalid = helperIntent === 'error';

    return (
      <div ref={ref} className={clsx(classNames.root, className)}>
        <span
          id={labelId}
          className={clsx(
            classNames.groupLabel,
            !instruction && classNames.groupLabelNoInstruction,
            disabled && classNames.groupLabelDisabled
          )}
        >
          {label}
          {required ? (
            <span className={classNames.requiredMark} aria-hidden="true">
              *
            </span>
          ) : null}
        </span>

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

        <RadioGroup
          id={baseId}
          orientation={orientation}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-required={required ? true : undefined}
          aria-invalid={isInvalid ? true : undefined}
          {...radioGroupProps}
        >
          {children}
        </RadioGroup>

        {helper ? (
          <Text
            as="p"
            id={helperId}
            size="xs"
            color={helperColor[helperIntent]}
            className={classNames.helper}
          >
            {helper}
          </Text>
        ) : null}
      </div>
    );
  }
);

RadioGroupField.displayName = 'RadioGroupField';

export type { RadioGroupOrientation };

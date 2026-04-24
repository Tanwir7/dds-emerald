import React from 'react';
import styles from './CheckboxField.module.scss';
import clsx from 'clsx';
import { Checkbox, type CheckboxProps, type CheckboxSize } from '../Checkbox';
import { Label } from '../Label';
import { Text, type TextColor } from '../Text';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type CheckboxFieldHelperIntent = 'default' | 'error' | 'success';

export interface CheckboxFieldProps extends Omit<
  CheckboxProps,
  'aria-describedby' | 'aria-invalid' | 'aria-required' | 'children' | 'className' | 'id'
> {
  label: string;
  required?: boolean;
  disabled?: boolean;
  helper?: string;
  helperIntent?: CheckboxFieldHelperIntent;
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

const helperColor: Record<CheckboxFieldHelperIntent, TextColor> = {
  default: 'muted',
  error: 'danger',
  success: 'success',
};

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
      helperIntent = 'default',
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
    const isInvalid = invalid || helperIntent === 'error';

    return (
      <div ref={ref} className={clsx(classNames.root, className)}>
        <div className={classNames.row}>
          <Checkbox
            id={checkboxId}
            size={size}
            disabled={disabled}
            invalid={isInvalid}
            aria-describedby={helperId}
            aria-required={required ? true : undefined}
            aria-invalid={isInvalid ? true : undefined}
            {...checkboxProps}
          />
          <Label htmlFor={checkboxId} required={required} disabled={disabled}>
            {label}
          </Label>
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

CheckboxField.displayName = 'CheckboxField';

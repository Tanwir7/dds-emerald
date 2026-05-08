import React from 'react';
import clsx from 'clsx';
import styles from './SelectField.module.scss';
import { InlineAlert } from '../InlineAlert';
import { Select, SelectContent, SelectTrigger, SelectValue, type SelectProps } from '../Select';
import { Text } from '../Text';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import type { FieldInlineAlert } from '../../types/fieldInlineAlert';

type SelectRootProps = Omit<SelectProps, 'children' | 'disabled' | 'required'>;
type TriggerProps = React.ComponentPropsWithoutRef<typeof SelectTrigger>;
type ContentProps = React.ComponentPropsWithoutRef<typeof SelectContent>;

export interface SelectFieldProps
  extends Omit<SelectRootProps, 'name'>, Pick<SelectRootProps, 'name'> {
  label: string;
  required?: boolean;
  disabled?: boolean;
  helper?: string;
  inlineAlert?: FieldInlineAlert;
  id?: string;
  className?: string;
  size?: TriggerProps['size'];
  invalid?: boolean;
  placeholder?: string;
  contentContainer?: ContentProps['container'];
  contentPosition?: ContentProps['position'];
  contentSide?: ContentProps['side'];
  contentSideOffset?: ContentProps['sideOffset'];
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  label: getRequiredClassName(styles, 'label'),
  labelDisabled: getRequiredClassName(styles, 'labelDisabled'),
  control: getRequiredClassName(styles, 'control'),
  requiredMark: getRequiredClassName(styles, 'requiredMark'),
  helper: getRequiredClassName(styles, 'helper'),
} as const;

const mergeIds = (...ids: Array<string | undefined>) => ids.filter(Boolean).join(' ') || undefined;

export const SelectField = React.forwardRef<HTMLDivElement, SelectFieldProps>(
  (
    {
      label,
      required = false,
      disabled = false,
      helper,
      inlineAlert,
      id,
      className,
      size = 'md',
      invalid = false,
      placeholder,
      contentContainer,
      contentPosition = 'popper',
      contentSide = 'bottom',
      contentSideOffset = 4,
      onBlur,
      children,
      ...selectProps
    },
    ref
  ) => {
    const generatedId = React.useId();
    const baseId = id ?? generatedId;
    const labelId = `${baseId}-label`;
    const helperId = helper ? `${baseId}-helper` : undefined;
    const inlineAlertId = inlineAlert ? `${baseId}-inline-alert` : undefined;
    const describedBy = mergeIds(helperId, inlineAlertId);
    const isInvalid = invalid || inlineAlert?.intent === 'danger';

    return (
      <div ref={ref} className={clsx(classNames.root, className)} onBlur={onBlur}>
        <span id={labelId} className={clsx(classNames.label, disabled && classNames.labelDisabled)}>
          {label}
          {required ? (
            <span className={classNames.requiredMark} aria-hidden="true">
              *
            </span>
          ) : null}
        </span>

        <div className={classNames.control}>
          <Select disabled={disabled} required={required} {...selectProps}>
            <SelectTrigger
              id={baseId}
              size={size}
              invalid={isInvalid}
              aria-labelledby={labelId}
              {...(describedBy ? { 'aria-describedby': describedBy } : {})}
              {...(required ? { 'aria-required': true } : {})}
              {...(isInvalid ? { 'aria-invalid': true } : {})}
              {...(placeholder ? { placeholder } : {})}
            >
              <SelectValue {...(placeholder ? { placeholder } : {})} />
            </SelectTrigger>
            <SelectContent
              position={contentPosition}
              side={contentSide}
              sideOffset={contentSideOffset}
              {...(contentContainer !== undefined ? { container: contentContainer } : {})}
            >
              {children}
            </SelectContent>
          </Select>
        </div>

        {helper ? (
          <Text as="p" id={helperId} size="xs" color="muted" className={classNames.helper}>
            {helper}
          </Text>
        ) : null}

        {inlineAlert ? (
          <InlineAlert
            id={inlineAlertId}
            intent={inlineAlert.intent}
            className={classNames.helper}
            {...(inlineAlert.showIcon !== undefined ? { showIcon: inlineAlert.showIcon } : {})}
          >
            {inlineAlert.children}
          </InlineAlert>
        ) : null}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

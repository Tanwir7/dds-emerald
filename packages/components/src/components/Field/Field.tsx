import React from 'react';
import styles from './Field.module.scss';
import clsx from 'clsx';
import { Label } from '../Label';
import { Text, type TextColor } from '../Text';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type FieldLayout = 'stack' | 'inline';
export type FieldHelperIntent = 'default' | 'error' | 'success';

export interface FieldProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  instruction?: string;
  helper?: string;
  helperIntent?: FieldHelperIntent;
  layout?: FieldLayout;
  inlineLabelWidth?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

const layoutClassName: Record<FieldLayout, string> = {
  stack: getRequiredClassName(styles, 'stack'),
  inline: getRequiredClassName(styles, 'inline'),
};

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  noInstruction: getRequiredClassName(styles, 'noInstruction'),
  label: getRequiredClassName(styles, 'label'),
  instruction: getRequiredClassName(styles, 'instruction'),
  control: getRequiredClassName(styles, 'control'),
  labelCol: getRequiredClassName(styles, 'labelCol'),
  controlCol: getRequiredClassName(styles, 'controlCol'),
  inputRow: getRequiredClassName(styles, 'inputRow'),
  helper: getRequiredClassName(styles, 'helper'),
} as const;

const getNodeEnv = () => {
  const globalWithProcess = globalThis as typeof globalThis & {
    process?: { env?: { NODE_ENV?: string } };
  };

  return globalWithProcess.process?.env?.NODE_ENV;
};

const mergeIds = (...ids: Array<string | undefined>) => ids.filter(Boolean).join(' ') || undefined;

const helperColor: Record<FieldHelperIntent, TextColor> = {
  default: 'muted',
  error: 'danger',
  success: 'success',
};

/**
 * Field wires a single form control to a required visible label, optional instruction text,
 * optional helper text, and inline-layout instruction text beside the control. The inline
 * `--field-label-width` custom property is a documented layout-variable exception so consumers
 * can size the label column while runtime styling remains in `Field.module.scss`.
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      label,
      required = false,
      disabled = false,
      instruction,
      helper,
      helperIntent = 'default',
      layout = 'stack',
      inlineLabelWidth,
      id,
      className,
      children,
    },
    ref
  ) => {
    const generatedId = React.useId();
    const childCount = React.Children.count(children);

    if (childCount !== 1) {
      if (getNodeEnv() !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('Field expects exactly one child control.');
      }

      return null;
    }

    const child = React.Children.only(children);

    if (!React.isValidElement<Record<string, unknown>>(child)) {
      if (getNodeEnv() !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('Field expects exactly one child control.');
      }

      return null;
    }

    const childId = typeof child.props.id === 'string' ? child.props.id : undefined;
    const fieldId = childId ?? id ?? generatedId;
    const instructionId = instruction ? `${fieldId}-instruction` : undefined;
    const helperId = helper ? `${fieldId}-helper` : undefined;
    const describedBy = mergeIds(
      typeof child.props['aria-describedby'] === 'string'
        ? child.props['aria-describedby']
        : undefined,
      instructionId,
      helperId
    );
    const controlProps: Record<string, unknown> = {
      id: fieldId,
    };

    if (describedBy) {
      controlProps['aria-describedby'] = describedBy;
    }

    if (required) {
      controlProps['aria-required'] = true;
    }

    if (helperIntent === 'error') {
      controlProps['aria-invalid'] = true;
    }

    if (disabled) {
      controlProps.disabled = true;
    }

    const control = React.cloneElement(child, controlProps);
    const isInline = layout === 'inline';
    const inlineStyle =
      isInline && inlineLabelWidth
        ? ({
            '--field-label-width': inlineLabelWidth,
          } as React.CSSProperties)
        : undefined;

    if (isInline) {
      return (
        <div
          ref={ref}
          className={clsx(
            classNames.root,
            layoutClassName[layout],
            !instruction && classNames.noInstruction,
            className
          )}
          style={inlineStyle}
        >
          <div className={classNames.labelCol}>
            <Label
              className={classNames.label}
              htmlFor={fieldId}
              required={required}
              disabled={disabled}
            >
              {label}
            </Label>
          </div>

          <div className={classNames.controlCol}>
            <div className={classNames.inputRow}>
              {control}
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
            </div>
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
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx(
          classNames.root,
          layoutClassName[layout],
          !instruction && classNames.noInstruction,
          className
        )}
      >
        <Label
          className={classNames.label}
          htmlFor={fieldId}
          required={required}
          disabled={disabled}
        >
          {label}
        </Label>

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

        <div className={classNames.control}>{control}</div>

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

Field.displayName = 'Field';

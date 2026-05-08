import React from 'react';
import clsx from 'clsx';
import { Text } from '../Text';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import styles from './Fieldset.module.scss';

export interface FieldsetProps extends Omit<
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  'children'
> {
  legend?: React.ReactNode;
  helper?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  header: getRequiredClassName(styles, 'header'),
  legend: getRequiredClassName(styles, 'legend'),
  helper: getRequiredClassName(styles, 'helper'),
} as const;

export const Fieldset = React.forwardRef<HTMLFieldSetElement, FieldsetProps>(
  ({ legend, helper, className, children, ...props }, ref) => {
    return (
      <fieldset ref={ref} className={clsx(classNames.root, className)} {...props}>
        {legend || helper ? (
          <div className={classNames.header}>
            {legend ? (
              <Text
                as="legend"
                className={classNames.legend}
                color="muted"
                size="xs"
                weight="semibold"
              >
                {legend}
              </Text>
            ) : null}

            {helper ? (
              <Text as="p" className={classNames.helper} color="muted" size="xs">
                {helper}
              </Text>
            ) : null}
          </div>
        ) : null}

        {children}
      </fieldset>
    );
  }
);

Fieldset.displayName = 'Fieldset';

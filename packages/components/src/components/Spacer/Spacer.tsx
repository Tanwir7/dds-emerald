import React from 'react';
import clsx from 'clsx';
import styles from './Spacer.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'flex';
export type SpacerAxis = 'horizontal' | 'vertical' | 'both';
export type SpacerElement = 'div' | 'span';

export type SpacerProps = Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> & {
  size?: SpacerSize;
  axis?: SpacerAxis;
  as?: SpacerElement;
  className?: string;
};

const sizeClassNames: Record<SpacerSize, string> = {
  xs: getRequiredClassName(styles, 'sizeXs'),
  sm: getRequiredClassName(styles, 'sizeSm'),
  md: getRequiredClassName(styles, 'sizeMd'),
  lg: getRequiredClassName(styles, 'sizeLg'),
  xl: getRequiredClassName(styles, 'sizeXl'),
  flex: getRequiredClassName(styles, 'sizeFlex'),
};

const axisClassNames: Record<Exclude<SpacerAxis, 'both'>, string> = {
  horizontal: getRequiredClassName(styles, 'axisHorizontal'),
  vertical: getRequiredClassName(styles, 'axisVertical'),
};

export const Spacer = React.forwardRef<HTMLSpanElement, SpacerProps>(
  ({ size = 'md', axis = 'both', as: Component = 'span', className, ...props }, ref) => {
    const sharedProps = {
      'aria-hidden': 'true',
      className: clsx(
        styles.root,
        sizeClassNames[size],
        axis !== 'both' && axisClassNames[axis],
        className
      ),
      ...props,
    } as const;

    if (Component === 'div') {
      return <div ref={ref as unknown as React.Ref<HTMLDivElement>} {...sharedProps} />;
    }

    return <span ref={ref} {...sharedProps} />;
  }
);

Spacer.displayName = 'Spacer';

import React from 'react';
import clsx from 'clsx';
import styles from './Text.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextColor = 'default' | 'muted' | 'on-primary';
export type TextAlign = 'left' | 'center' | 'right';
export type TextElement = 'p' | 'span' | 'div' | 'label' | 'legend' | 'strong' | 'em' | 'small';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: TextElement;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  align?: TextAlign;
  truncate?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const sizeClassName: Record<TextSize, string> = {
  xs: getRequiredClassName(styles, 'sizeXs'),
  sm: getRequiredClassName(styles, 'sizeSm'),
  base: getRequiredClassName(styles, 'sizeBase'),
  lg: getRequiredClassName(styles, 'sizeLg'),
  xl: getRequiredClassName(styles, 'sizeXl'),
};

const weightClassName: Record<TextWeight, string> = {
  normal: getRequiredClassName(styles, 'weightNormal'),
  medium: getRequiredClassName(styles, 'weightMedium'),
  semibold: getRequiredClassName(styles, 'weightSemibold'),
  bold: getRequiredClassName(styles, 'weightBold'),
};

const colorClassName: Record<TextColor, string> = {
  default: getRequiredClassName(styles, 'colorDefault'),
  muted: getRequiredClassName(styles, 'colorMuted'),
  'on-primary': getRequiredClassName(styles, 'colorOnPrimary'),
};

const alignClassName: Record<TextAlign, string> = {
  left: getRequiredClassName(styles, 'alignLeft'),
  center: getRequiredClassName(styles, 'alignCenter'),
  right: getRequiredClassName(styles, 'alignRight'),
};

export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      as: Component = 'p',
      size = 'base',
      weight = 'normal',
      color = 'default',
      align,
      truncate = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return React.createElement(
      Component,
      {
        ref,
        className: clsx(
          styles.root,
          sizeClassName[size],
          weightClassName[weight],
          colorClassName[color],
          align && alignClassName[align],
          truncate && styles.truncate,
          className
        ),
        ...props,
      },
      children
    );
  }
);

Text.displayName = 'Text';

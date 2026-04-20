import React from 'react';
import clsx from 'clsx';
import styles from './Text.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextColor = 'default' | 'muted' | 'on-primary';
export type TextFont = 'sans' | 'mono';
export type TextTransform = 'none' | 'capitalize' | 'uppercase' | 'lowercase';
export type TextAlign = 'left' | 'center' | 'right';
export type TextElement =
  | 'p'
  | 'span'
  | 'div'
  | 'li'
  | 'label'
  | 'legend'
  | 'strong'
  | 'em'
  | 'small';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: TextElement;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  font?: TextFont;
  textTransform?: TextTransform;
  align?: TextAlign;
  truncate?: boolean;
  className?: string;
  children: React.ReactNode;
}

const sizeClassName: Record<TextSize, string> = {
  xs: getRequiredClassName(styles, 'xs'),
  sm: getRequiredClassName(styles, 'sm'),
  base: getRequiredClassName(styles, 'base'),
  lg: getRequiredClassName(styles, 'lg'),
  xl: getRequiredClassName(styles, 'xl'),
};

const weightClassName: Record<TextWeight, string> = {
  normal: getRequiredClassName(styles, 'normal'),
  medium: getRequiredClassName(styles, 'medium'),
  semibold: getRequiredClassName(styles, 'semibold'),
  bold: getRequiredClassName(styles, 'bold'),
};

const colorClassName: Record<TextColor, string> = {
  default: getRequiredClassName(styles, 'colorDefault'),
  muted: getRequiredClassName(styles, 'colorMuted'),
  'on-primary': getRequiredClassName(styles, 'colorOnPrimary'),
};

const fontClassName: Record<TextFont, string> = {
  sans: getRequiredClassName(styles, 'fontSans'),
  mono: getRequiredClassName(styles, 'fontMono'),
};

const textTransformClassName: Record<TextTransform, string> = {
  none: getRequiredClassName(styles, 'textTransformNone'),
  capitalize: getRequiredClassName(styles, 'textTransformCapitalize'),
  uppercase: getRequiredClassName(styles, 'textTransformUppercase'),
  lowercase: getRequiredClassName(styles, 'textTransformLowercase'),
};

const alignClassName: Record<TextAlign, string> = {
  left: getRequiredClassName(styles, 'alignLeft'),
  center: getRequiredClassName(styles, 'alignCenter'),
  right: getRequiredClassName(styles, 'alignRight'),
};

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  (
    {
      as: Component = 'p',
      size = 'base',
      weight = 'normal',
      color = 'default',
      font = 'sans',
      textTransform = 'none',
      align = 'left',
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
        ref: ref as React.ForwardedRef<HTMLElement>,
        className: clsx(
          styles.root,
          sizeClassName[size],
          weightClassName[weight],
          colorClassName[color],
          fontClassName[font],
          textTransformClassName[textTransform],
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

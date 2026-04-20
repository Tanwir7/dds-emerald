import React from 'react';
import clsx from 'clsx';
import styles from './Heading.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type HeadingSize = '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
export type HeadingFont = 'display' | 'sans';
export type HeadingWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type HeadingColor = 'default' | 'muted' | 'on-primary';
export type HeadingAlign = 'left' | 'center' | 'right';
export type HeadingTextTransform = 'none' | 'capitalize' | 'uppercase' | 'lowercase';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingElement;
  size?: HeadingSize;
  font?: HeadingFont;
  weight?: HeadingWeight;
  color?: HeadingColor;
  align?: HeadingAlign;
  textTransform?: HeadingTextTransform;
  truncate?: boolean;
  className?: string;
  children: React.ReactNode;
}

const sizeClassName: Record<HeadingSize, string> = {
  '2xl': getRequiredClassName(styles, 'size2xl'),
  '3xl': getRequiredClassName(styles, 'size3xl'),
  '4xl': getRequiredClassName(styles, 'size4xl'),
  '5xl': getRequiredClassName(styles, 'size5xl'),
  '6xl': getRequiredClassName(styles, 'size6xl'),
  '7xl': getRequiredClassName(styles, 'size7xl'),
};

const fontClassName: Record<HeadingFont, string> = {
  display: getRequiredClassName(styles, 'display'),
  sans: getRequiredClassName(styles, 'sans'),
};

const weightClassName: Record<HeadingWeight, string> = {
  normal: getRequiredClassName(styles, 'normal'),
  medium: getRequiredClassName(styles, 'medium'),
  semibold: getRequiredClassName(styles, 'semibold'),
  bold: getRequiredClassName(styles, 'bold'),
};

const colorClassName: Record<HeadingColor, string> = {
  default: getRequiredClassName(styles, 'colorDefault'),
  muted: getRequiredClassName(styles, 'colorMuted'),
  'on-primary': getRequiredClassName(styles, 'colorOnPrimary'),
};

const alignClassName: Record<HeadingAlign, string> = {
  left: getRequiredClassName(styles, 'alignLeft'),
  center: getRequiredClassName(styles, 'alignCenter'),
  right: getRequiredClassName(styles, 'alignRight'),
};

const textTransformClassName: Record<HeadingTextTransform, string> = {
  none: getRequiredClassName(styles, 'textTransformNone'),
  capitalize: getRequiredClassName(styles, 'textTransformCapitalize'),
  uppercase: getRequiredClassName(styles, 'textTransformUppercase'),
  lowercase: getRequiredClassName(styles, 'textTransformLowercase'),
};

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      as: Component = 'h2',
      size = '3xl',
      font = 'display',
      weight = 'bold',
      color = 'default',
      align = 'left',
      textTransform = 'none',
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
          fontClassName[font],
          weightClassName[weight],
          colorClassName[color],
          alignClassName[align],
          textTransformClassName[textTransform],
          truncate && styles.truncate,
          className
        ),
        ...props,
      },
      children
    );
  }
);

Heading.displayName = 'Heading';

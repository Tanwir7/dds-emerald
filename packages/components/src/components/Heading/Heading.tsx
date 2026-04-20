import React from 'react';
import clsx from 'clsx';
import styles from './Heading.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingFont = 'display' | 'sans';
export type HeadingColor = 'default' | 'muted' | 'on-primary';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: HeadingLevel;
  visualLevel?: HeadingLevel;
  font?: HeadingFont;
  color?: HeadingColor;
  className?: string;
  children?: React.ReactNode;
}

const elementByLevel: Record<HeadingLevel, `h${HeadingLevel}`> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};

const levelClassName: Record<HeadingLevel, string> = {
  1: getRequiredClassName(styles, 'level1'),
  2: getRequiredClassName(styles, 'level2'),
  3: getRequiredClassName(styles, 'level3'),
  4: getRequiredClassName(styles, 'level4'),
  5: getRequiredClassName(styles, 'level5'),
  6: getRequiredClassName(styles, 'level6'),
};

const fontClassName: Record<HeadingFont, string> = {
  display: getRequiredClassName(styles, 'fontDisplay'),
  sans: getRequiredClassName(styles, 'fontSans'),
};

const colorClassName: Record<HeadingColor, string> = {
  default: getRequiredClassName(styles, 'colorDefault'),
  muted: getRequiredClassName(styles, 'colorMuted'),
  'on-primary': getRequiredClassName(styles, 'colorOnPrimary'),
};

const defaultFont = (level: HeadingLevel): HeadingFont => (level <= 2 ? 'display' : 'sans');

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    { level, visualLevel, font, color = 'default', className, children, ...props }: HeadingProps,
    ref
  ) => {
    const Component = elementByLevel[level];
    const resolvedFont = font ?? defaultFont(level);
    const resolvedVisualLevel = visualLevel ?? level;

    return React.createElement(
      Component,
      {
        ref,
        className: clsx(
          styles.root,
          levelClassName[resolvedVisualLevel],
          fontClassName[resolvedFont],
          colorClassName[color],
          resolvedFont === 'display' && level <= 2 && styles.semanticDisplay,
          className
        ),
        ...props,
      },
      children
    );
  }
);

Heading.displayName = 'Heading';

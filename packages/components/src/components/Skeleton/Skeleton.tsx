import clsx from 'clsx';
import React from 'react';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import styles from './Skeleton.module.scss';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
}

type SkeletonStyle = React.CSSProperties & {
  '--skeleton-width'?: string;
  '--skeleton-height'?: string;
};

const variantClassName: Record<SkeletonVariant, string> = {
  text: getRequiredClassName(styles, 'text'),
  circular: getRequiredClassName(styles, 'circular'),
  rectangular: getRequiredClassName(styles, 'rectangular'),
};

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  group: getRequiredClassName(styles, 'group'),
} as const;

const toDimension = (value: string | number | undefined) => {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === 'number' ? `${value}px` : value;
};

const getLineCount = (lines: number | undefined) => {
  if (!Number.isFinite(lines)) {
    return 1;
  }

  return Math.max(1, Math.floor(lines as number));
};

const createSkeletonStyle = (
  widthValue: string | undefined,
  heightValue?: string,
  baseStyle?: React.CSSProperties
) => {
  const nextStyle: SkeletonStyle = {
    ...(baseStyle ?? {}),
  };

  if (widthValue !== undefined) {
    nextStyle['--skeleton-width'] = widthValue;
  }

  if (heightValue !== undefined) {
    nextStyle['--skeleton-height'] = heightValue;
  }

  return nextStyle;
};

export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(
  ({ variant = 'rectangular', width, height, lines = 1, className, style, ...props }, ref) => {
    const normalizedWidth = toDimension(width);
    const normalizedHeight = toDimension(height);
    const lineCount = variant === 'text' ? getLineCount(lines) : 1;

    if (variant === 'text' && lineCount > 1) {
      return (
        <span
          ref={ref}
          className={clsx(classNames.group, className)}
          style={style}
          {...props}
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, index) => (
            <span
              key={index}
              className={clsx(classNames.root, variantClassName.text)}
              style={createSkeletonStyle(index === lineCount - 1 ? '75%' : '100%')}
              aria-hidden="true"
            />
          ))}
        </span>
      );
    }

    const resolvedWidth =
      variant === 'circular' && normalizedHeight && !normalizedWidth
        ? normalizedHeight
        : (normalizedWidth ?? (variant === 'circular' ? undefined : '100%'));
    const resolvedHeight =
      variant === 'circular' && normalizedWidth && !normalizedHeight
        ? normalizedWidth
        : normalizedHeight;
    const inlineStyle = createSkeletonStyle(resolvedWidth, resolvedHeight, style);

    return (
      <span
        ref={ref}
        className={clsx(classNames.root, variantClassName[variant], className)}
        style={inlineStyle}
        {...props}
        aria-hidden="true"
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

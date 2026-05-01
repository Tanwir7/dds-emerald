import React from 'react';
import clsx from 'clsx';
import styles from './MediaObject.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type MediaObjectAlign = 'top' | 'center' | 'bottom';
export type MediaObjectPosition = 'left' | 'right';
export type MediaObjectGap = 'xs' | 'sm' | 'md' | 'lg';
export type MediaObjectStackAt = 'sm' | 'md' | 'lg' | 'xl';

export interface MediaObjectProps extends React.HTMLAttributes<HTMLDivElement> {
  media: React.ReactNode;
  mediaAlign?: MediaObjectAlign;
  mediaPosition?: MediaObjectPosition;
  gap?: MediaObjectGap;
  stackAt?: MediaObjectStackAt;
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}

const mediaPositionClassName: Record<MediaObjectPosition, string> = {
  left: getRequiredClassName(styles, 'mediaLeft'),
  right: getRequiredClassName(styles, 'mediaRight'),
};

const mediaAlignClassName: Record<MediaObjectAlign, string> = {
  top: getRequiredClassName(styles, 'alignTop'),
  center: getRequiredClassName(styles, 'alignCenter'),
  bottom: getRequiredClassName(styles, 'alignBottom'),
};

const gapClassName: Record<MediaObjectGap, string> = {
  xs: getRequiredClassName(styles, 'gapXs'),
  sm: getRequiredClassName(styles, 'gapSm'),
  md: getRequiredClassName(styles, 'gapMd'),
  lg: getRequiredClassName(styles, 'gapLg'),
};

const stackAtClassName: Record<MediaObjectStackAt, string> = {
  sm: getRequiredClassName(styles, 'stackBelowSm'),
  md: getRequiredClassName(styles, 'stackBelowMd'),
  lg: getRequiredClassName(styles, 'stackBelowLg'),
  xl: getRequiredClassName(styles, 'stackBelowXl'),
};

export const MediaObject = React.forwardRef<HTMLDivElement, MediaObjectProps>(
  (
    {
      media,
      mediaAlign = 'top',
      mediaPosition = 'left',
      gap = 'md',
      stackAt,
      as: Component = 'div',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref as React.ForwardedRef<HTMLElement>}
        className={clsx(
          styles.root,
          mediaPositionClassName[mediaPosition],
          mediaAlignClassName[mediaAlign],
          gapClassName[gap],
          stackAt && stackAtClassName[stackAt],
          className
        )}
        {...props}
      >
        {mediaPosition === 'right' ? (
          <>
            <div className={styles.content}>{children}</div>
            <div className={styles.media}>{media}</div>
          </>
        ) : (
          <>
            <div className={styles.media}>{media}</div>
            <div className={styles.content}>{children}</div>
          </>
        )}
      </Component>
    );
  }
);

MediaObject.displayName = 'MediaObject';

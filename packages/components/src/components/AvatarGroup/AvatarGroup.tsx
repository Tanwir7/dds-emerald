import React from 'react';
import clsx from 'clsx';
import styles from './AvatarGroup.module.scss';
import { type AvatarProps, type AvatarSize } from '../Avatar';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarSize;
  className?: string;
  children: React.ReactNode;
}

const sizeClassName: Record<AvatarSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
};

const groupItemClassName = getRequiredClassName(styles, 'groupItem');

type AvatarElement = React.ReactElement<AvatarProps>;

type FragmentElement = React.ReactElement<{ children?: React.ReactNode }>;

const isFragment = (child: React.ReactNode): child is FragmentElement =>
  React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment;

const flattenChildren = (children: React.ReactNode): React.ReactNode[] =>
  React.Children.toArray(children).flatMap((child) => {
    if (isFragment(child)) {
      return flattenChildren(child.props.children);
    }

    return child;
  });

const renderAvatar = (child: React.ReactNode, size: AvatarSize) => {
  if (!React.isValidElement<AvatarProps>(child)) {
    return child;
  }

  const avatar = child as AvatarElement;

  return React.cloneElement(avatar, {
    size,
    className: clsx(groupItemClassName, avatar.props.className),
  });
};

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max = 5, size = 'md', className, children, ...props }, ref) => {
    const avatars = flattenChildren(children);
    const visibleCount = Math.max(0, Math.min(avatars.length, Math.floor(max)));
    const visibleAvatars = avatars.slice(0, visibleCount);
    const overflowCount = avatars.length - visibleAvatars.length;

    return (
      <div
        ref={ref}
        className={clsx(styles.group, sizeClassName[size], className)}
        data-avatar-group=""
        {...props}
      >
        {visibleAvatars.map((avatar) => renderAvatar(avatar, size))}
        {overflowCount > 0 ? (
          <span className={styles.overflow} aria-label={`${overflowCount} more`}>
            +{overflowCount}
          </span>
        ) : null}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

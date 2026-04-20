import React from 'react';
import styles from './AvatarGroup.module.scss';
import clsx from 'clsx';
import { Avatar, type AvatarSize } from '../Avatar';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export interface AvatarGroupItem {
  src?: string;
  fallback: string;
  alt?: string;
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: AvatarGroupItem[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}

const sizeClassName: Record<AvatarSize, string> = {
  sm: getRequiredClassName(styles, 'sizeSm'),
  md: getRequiredClassName(styles, 'sizeMd'),
  lg: getRequiredClassName(styles, 'sizeLg'),
};

const itemClassName = getRequiredClassName(styles, 'item');

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ avatars, max = 3, size = 'md', className, ...props }, ref) => {
    const visibleCount = Math.max(0, Math.min(avatars.length, Math.floor(max)));
    const visibleAvatars = avatars.slice(0, visibleCount);
    const overflowCount = avatars.length - visibleAvatars.length;

    return (
      <div
        ref={ref}
        className={clsx(styles.root, sizeClassName[size], className)}
        data-avatar-group=""
        {...props}
      >
        {visibleAvatars.map((avatar, index) => (
          <Avatar
            key={`${avatar.fallback}-${avatar.src ?? avatar.alt ?? index}`}
            className={itemClassName}
            fallback={avatar.fallback}
            size={size}
            {...(avatar.src ? { src: avatar.src } : {})}
            {...(avatar.alt ? { alt: avatar.alt } : {})}
          />
        ))}
        {overflowCount > 0 ? (
          <span className={styles.overflow} aria-label={`${overflowCount} more avatars`}>
            +{overflowCount}
          </span>
        ) : null}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

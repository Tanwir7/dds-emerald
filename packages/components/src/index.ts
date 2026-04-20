import './styles/base.css';

// DDS Emerald — Public API
// Components are added here as they are implemented
export { Button } from './components/Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './components/Button/Button';
export { Badge } from './components/Badge';
export type { BadgeProps, BadgeSize, BadgeVariant } from './components/Badge/Badge';
export { VisuallyHidden } from './components/VisuallyHidden';
export type { VisuallyHiddenProps } from './components/VisuallyHidden/VisuallyHidden';
export { Divider } from './components/Divider';
export type { DividerOrientation, DividerProps } from './components/Divider/Divider';
export { Text } from './components/Text';
export type {
  TextAlign,
  TextColor,
  TextElement,
  TextFont,
  TextProps,
  TextSize,
  TextTransform,
  TextWeight,
} from './components/Text';
export { Heading } from './components/Heading';
export type { HeadingColor, HeadingFont, HeadingLevel, HeadingProps } from './components/Heading';
export { Avatar } from './components/Avatar';
export type { AvatarProps, AvatarSize } from './components/Avatar';
export { AvatarGroup } from './components/AvatarGroup';
export type { AvatarGroupItem, AvatarGroupProps } from './components/AvatarGroup';

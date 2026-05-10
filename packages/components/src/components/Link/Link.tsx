import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import styles from './Link.module.scss';
import { Icon } from '../Icon';
import { VisuallyHidden } from '../VisuallyHidden';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type LinkVariant =
  | 'default'
  | 'muted'
  | 'destructive'
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline';
export type LinkSize = 'sm' | 'base' | 'lg';
export type LinkUnderline = 'always' | 'hover' | 'none';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  size?: LinkSize;
  underline?: LinkUnderline;
  external?: boolean;
  asChild?: boolean;
  className?: string;
  icon?: LucideIcon;
  iconPosition?: 'start' | 'end';
  children: React.ReactNode;
}

const variantClassName: Record<LinkVariant, string> = {
  default: getRequiredClassName(styles, 'default'),
  muted: getRequiredClassName(styles, 'muted'),
  destructive: getRequiredClassName(styles, 'destructive'),
  primary: getRequiredClassName(styles, 'primary'),
  secondary: getRequiredClassName(styles, 'secondary'),
  ghost: getRequiredClassName(styles, 'ghost'),
  outline: getRequiredClassName(styles, 'outline'),
};

const underlineClassName: Record<LinkUnderline, string> = {
  always: getRequiredClassName(styles, 'underlineAlways'),
  hover: getRequiredClassName(styles, 'underlineHover'),
  none: getRequiredClassName(styles, 'underlineNone'),
};

const sizeClassName: Record<LinkSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  base: getRequiredClassName(styles, 'base'),
  lg: getRequiredClassName(styles, 'lg'),
};

const iconClassName = getRequiredClassName(styles, 'icon');
const ctaClassName = getRequiredClassName(styles, 'cta');
const ctaVariants = new Set<LinkVariant>(['primary', 'secondary', 'ghost', 'outline']);

const getNodeEnv = () => {
  const globalWithProcess = globalThis as typeof globalThis & {
    process?: { env?: { NODE_ENV?: string } };
  };

  return globalWithProcess.process?.env?.NODE_ENV;
};

const ExternalIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={styles.externalIcon}
  >
    <path d="M2 10L10 2M10 2H5M10 2V7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      variant = 'default',
      size,
      underline,
      external = false,
      asChild = false,
      className,
      icon: IconComponent,
      iconPosition = 'start',
      children,
      href,
      target,
      rel,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    if (!href && !asChild && getNodeEnv() !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('Link expects an href prop unless asChild is true.');
    }

    const resolvedUnderline = underline ?? (ctaVariants.has(variant) ? 'always' : 'hover');
    const isCtaVariant = ctaVariants.has(variant);

    const rootClassName = clsx(
      styles.root,
      isCtaVariant && ctaClassName,
      variantClassName[variant],
      underlineClassName[resolvedUnderline],
      size && sizeClassName[size],
      className
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
      onKeyDown?.(event);

      if (event.defaultPrevented) {
        return;
      }

      if (event.key === ' ' || event.key === 'Spacebar' || event.code === 'Space') {
        event.preventDefault();
        event.currentTarget.click();
      }
    };

    const content = (
      <>
        {IconComponent && iconPosition === 'start' ? (
          <Icon icon={IconComponent} className={iconClassName} aria-hidden="true" />
        ) : null}
        {children}
        {IconComponent && iconPosition === 'end' ? (
          <Icon icon={IconComponent} className={iconClassName} aria-hidden="true" />
        ) : null}
        {external ? (
          <>
            <VisuallyHidden> (opens in new tab)</VisuallyHidden>
            <ExternalIcon />
          </>
        ) : null}
      </>
    );

    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement<{
        children?: React.ReactNode;
      }>;

      return (
        <Slot
          ref={ref as React.ForwardedRef<HTMLElement>}
          className={rootClassName}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {React.isValidElement(child) && (IconComponent || external)
            ? React.cloneElement(
                child,
                undefined,
                <>
                  {IconComponent && iconPosition === 'start' ? (
                    <Icon icon={IconComponent} className={iconClassName} aria-hidden="true" />
                  ) : null}
                  {child.props.children}
                  {IconComponent && iconPosition === 'end' ? (
                    <Icon icon={IconComponent} className={iconClassName} aria-hidden="true" />
                  ) : null}
                  {external ? (
                    <>
                      <VisuallyHidden> (opens in new tab)</VisuallyHidden>
                      <ExternalIcon />
                    </>
                  ) : null}
                </>
              )
            : child}
        </Slot>
      );
    }

    const resolvedTarget = external ? (target ?? '_blank') : target;
    const resolvedRel = external ? (rel ?? 'noopener noreferrer') : rel;

    return (
      <a
        ref={ref}
        href={href}
        target={resolvedTarget}
        rel={resolvedRel}
        className={rootClassName}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {content}
      </a>
    );
  }
);

Link.displayName = 'Link';

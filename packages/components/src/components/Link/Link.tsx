import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import styles from './Link.module.scss';
import { VisuallyHidden } from '../VisuallyHidden';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type LinkVariant = 'default' | 'muted' | 'destructive';
export type LinkSize = 'sm' | 'base' | 'lg';
export type LinkUnderline = 'always' | 'hover' | 'none';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  size?: LinkSize;
  underline?: LinkUnderline;
  external?: boolean;
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantClassName: Record<LinkVariant, string> = {
  default: getRequiredClassName(styles, 'default'),
  muted: getRequiredClassName(styles, 'muted'),
  destructive: getRequiredClassName(styles, 'destructive'),
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
      underline = 'hover',
      external = false,
      asChild = false,
      className,
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

    const rootClassName = clsx(
      styles.root,
      variantClassName[variant],
      underlineClassName[underline],
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

    if (asChild) {
      return (
        <Slot
          ref={ref as React.ForwardedRef<HTMLElement>}
          className={rootClassName}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {children}
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
        {children}
        {external ? (
          <>
            <VisuallyHidden> (opens in new tab)</VisuallyHidden>
            <ExternalIcon />
          </>
        ) : null}
      </a>
    );
  }
);

Link.displayName = 'Link';

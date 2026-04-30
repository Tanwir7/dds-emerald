import clsx from 'clsx';
import React from 'react';
import styles from './NavItem.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

type NavItemLevel = 0 | 1 | 2;
type NavItemVariant = 'default' | 'sidebar';
type NavItemSize = 'sm' | 'md';
type NavItemChildProps = {
  children?: React.ReactNode;
  className?: string | undefined;
  onClick?: React.MouseEventHandler<HTMLElement> | undefined;
  'aria-current'?: React.AriaAttributes['aria-current'];
  'aria-disabled'?: React.AriaAttributes['aria-disabled'];
};

type NavItemSharedProps = {
  href?: string;
  asChild?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  endSlot?: React.ReactNode;
  level?: NavItemLevel;
  variant?: NavItemVariant;
  size?: NavItemSize;
  className?: string;
  children: React.ReactNode;
};

type NavItemAnchorProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof NavItemSharedProps | 'onClick'
> &
  NavItemSharedProps & {
    href: string;
    asChild?: false;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  };

type NavItemButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  keyof NavItemSharedProps | 'onClick' | 'type'
> &
  NavItemSharedProps & {
    href?: undefined;
    asChild?: false;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  };

type NavItemAsChildProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  keyof NavItemSharedProps | 'onClick'
> &
  NavItemSharedProps & {
    asChild: true;
    onClick?: React.MouseEventHandler<HTMLElement>;
  };

export type NavItemProps = NavItemAnchorProps | NavItemButtonProps | NavItemAsChildProps;

const variantClassName: Record<NavItemVariant, string> = {
  default: getRequiredClassName(styles, 'default'),
  sidebar: getRequiredClassName(styles, 'sidebar'),
};

const sizeClassName: Record<NavItemSize, string> = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
};

const levelClassName: Partial<Record<Exclude<NavItemLevel, 0>, string>> = {
  1: getRequiredClassName(styles, 'level1'),
  2: getRequiredClassName(styles, 'level2'),
};

/**
 * NavItem is a single navigation row and should be rendered inside a nav, list,
 * or comparable landmark supplied by the consumer.
 */
export const NavItem = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, NavItemProps>(
  (
    {
      href,
      asChild = false,
      isActive = false,
      disabled = false,
      icon,
      endSlot,
      level = 0,
      variant = 'default',
      size = 'md',
      className,
      children,
      onClick,
      ...rest
    },
    ref
  ) => {
    const levelClass =
      level === 1 ? levelClassName[1] : level === 2 ? levelClassName[2] : undefined;
    const rootClassName = clsx(
      styles.root,
      sizeClassName[size],
      variantClassName[variant],
      isActive && styles.active,
      disabled && styles.disabled,
      levelClass,
      className
    );

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      (onClick as React.MouseEventHandler<HTMLElement> | undefined)?.(event);
    };

    const content = (
      <>
        {icon ? (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className={styles.label}>{children}</span>
        {endSlot ? <span className={styles.endSlot}>{endSlot}</span> : null}
      </>
    );

    if (asChild) {
      if (!React.isValidElement(children)) {
        return null;
      }

      const childElement = children as React.ReactElement<NavItemChildProps>;
      const childOnClick = childElement.props.onClick;

      return React.cloneElement(childElement, {
        ...rest,
        className: clsx(rootClassName, childElement.props.className),
        'aria-current': isActive ? 'page' : undefined,
        'aria-disabled': disabled ? true : undefined,
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          handleClick(event);

          if (!event.defaultPrevented) {
            childOnClick?.(event);
          }
        },
        children: (
          <>
            {icon ? (
              <span className={styles.icon} aria-hidden="true">
                {icon}
              </span>
            ) : null}
            <span className={styles.label}>{childElement.props.children}</span>
            {endSlot ? <span className={styles.endSlot}>{endSlot}</span> : null}
          </>
        ),
      } satisfies NavItemChildProps);
    }

    if (href) {
      const anchorRest = rest as Omit<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        keyof NavItemSharedProps | 'onClick'
      >;
      const anchorProps: React.AnchorHTMLAttributes<HTMLAnchorElement> = {
        ...anchorRest,
        className: rootClassName,
        href,
        'aria-current': isActive ? 'page' : undefined,
        'aria-disabled': disabled ? true : undefined,
        onClick: handleClick as React.MouseEventHandler<HTMLAnchorElement>,
      };

      return (
        <a ref={ref as React.ForwardedRef<HTMLAnchorElement>} {...anchorProps}>
          {content}
        </a>
      );
    }

    const buttonRest = rest as Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      keyof NavItemSharedProps | 'onClick' | 'type'
    >;
    const buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {
      ...buttonRest,
      className: rootClassName,
      type: 'button' as const,
      disabled,
      'aria-current': isActive ? 'page' : undefined,
      'aria-disabled': disabled ? true : undefined,
      onClick: handleClick as React.MouseEventHandler<HTMLButtonElement>,
    };

    return (
      <button ref={ref as React.ForwardedRef<HTMLButtonElement>} {...buttonProps}>
        {content}
      </button>
    );
  }
);

NavItem.displayName = 'NavItem';

import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Tag } from '../Tag';
import styles from './FlyoutMenu.module.scss';

export type FlyoutMenuLayout = 'list' | 'two-col' | 'four-col' | 'list-featured' | 'simple';

export interface FlyoutMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openOnHover?: boolean;
  closeOnClickOutside?: boolean;
  children: React.ReactNode;
}

interface FlyoutMenuTriggerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  className?: string;
  children: React.ReactElement;
}

export interface FlyoutMenuContentProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  layout?: FlyoutMenuLayout;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  label?: string;
  className?: string;
  children: React.ReactNode;
}

export interface FlyoutMenuLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'children'
> {
  icon?: LucideIcon;
  label: string;
  description?: string;
  badge?: string;
  active?: boolean;
  external?: boolean;
  className?: string;
}

export interface FlyoutMenuFeaturedCardProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'children'
> {
  href: string;
  image: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

export interface FlyoutMenuFeaturedHighlightProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  image?: string;
  imageAlt?: string;
  className?: string;
}

export interface FlyoutMenuCTABarProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end' | 'between';
  className?: string;
  children: React.ReactNode;
}

export interface FlyoutMenuFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

type InternalFlyoutMenuTriggerProps = FlyoutMenuTriggerProps & {
  _hoverHandlers?:
    | Pick<React.HTMLAttributes<HTMLElement>, 'onMouseEnter' | 'onMouseLeave'>
    | undefined;
  _onFocus?: React.FocusEventHandler<HTMLElement> | undefined;
};

type InternalFlyoutMenuContentProps = FlyoutMenuContentProps & {
  _hoverHandlers?:
    | Pick<React.HTMLAttributes<HTMLDivElement>, 'onMouseEnter' | 'onMouseLeave'>
    | undefined;
  _closeOnClickOutside?: boolean | undefined;
};

type Handler<E> = ((event: E) => void) | undefined;

interface FlyoutMenuContextValue {
  triggerHoverHandlers?:
    | Pick<React.HTMLAttributes<HTMLElement>, 'onMouseEnter' | 'onMouseLeave'>
    | undefined;
  contentHoverHandlers?:
    | Pick<React.HTMLAttributes<HTMLDivElement>, 'onMouseEnter' | 'onMouseLeave'>
    | undefined;
  closeOnClickOutside: boolean;
  onTriggerFocus: React.FocusEventHandler<HTMLElement>;
}

const widthMap: Record<NonNullable<FlyoutMenuContentProps['width']>, string> = {
  sm: '280px',
  md: '400px',
  lg: '560px',
  xl: '800px',
  full: '100vw',
};

const composeEventHandlers = <E,>(theirHandler: Handler<E>, ourHandler: Handler<E>): Handler<E> => {
  if (!theirHandler) {
    return ourHandler;
  }

  if (!ourHandler) {
    return theirHandler;
  }

  return (event: E) => {
    theirHandler(event);
    ourHandler(event);
  };
};

const FlyoutMenuContext = React.createContext<FlyoutMenuContextValue | null>(null);

const useFlyoutMenuContext = () => {
  const context = React.useContext(FlyoutMenuContext);

  if (!context) {
    throw new Error('FlyoutMenu subcomponents must be used within FlyoutMenu');
  }

  return context;
};

export const FlyoutMenu = ({
  open,
  defaultOpen,
  onOpenChange,
  openOnHover = true,
  closeOnClickOutside = true,
  children,
}: FlyoutMenuProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const hoverDelayRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressNextTriggerFocusRef = React.useRef(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const clearHoverDelay = React.useCallback(() => {
    if (hoverDelayRef.current !== null) {
      clearTimeout(hoverDelayRef.current);
      hoverDelayRef.current = null;
    }
  }, []);

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      clearHoverDelay();

      if (!isControlled) {
        setInternalOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [clearHoverDelay, isControlled, onOpenChange]
  );

  const closeMenu = React.useCallback(() => {
    suppressNextTriggerFocusRef.current = true;
    setOpen(false);
  }, [setOpen]);

  const scheduleClose = React.useCallback(() => {
    clearHoverDelay();
    hoverDelayRef.current = setTimeout(() => {
      closeMenu();
    }, 160);
  }, [clearHoverDelay, closeMenu]);

  React.useEffect(
    () => () => {
      clearHoverDelay();
    },
    [clearHoverDelay]
  );

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenu, isOpen]);

  const hoverHandlers = React.useMemo(
    () =>
      openOnHover
        ? {
            onMouseEnter: () => {
              suppressNextTriggerFocusRef.current = false;
              clearHoverDelay();
              setOpen(true);
            },
            onMouseLeave: () => {
              scheduleClose();
            },
          }
        : undefined,
    [clearHoverDelay, openOnHover, scheduleClose, setOpen]
  );

  const contentHoverHandlers = React.useMemo(
    () =>
      openOnHover
        ? {
            onMouseEnter: () => {
              clearHoverDelay();
            },
            onMouseLeave: () => {
              scheduleClose();
            },
          }
        : undefined,
    [clearHoverDelay, openOnHover, scheduleClose]
  );

  const contextValue = React.useMemo<FlyoutMenuContextValue>(
    () => ({
      triggerHoverHandlers: hoverHandlers,
      contentHoverHandlers,
      closeOnClickOutside,
      onTriggerFocus: () => {
        if (suppressNextTriggerFocusRef.current) {
          suppressNextTriggerFocusRef.current = false;
          return;
        }

        setOpen(true);
      },
    }),
    [closeOnClickOutside, contentHoverHandlers, hoverHandlers, setOpen]
  );

  return (
    <FlyoutMenuContext.Provider value={contextValue}>
      <PopoverPrimitive.Root open={isOpen} onOpenChange={setOpen} modal={false}>
        {children}
      </PopoverPrimitive.Root>
    </FlyoutMenuContext.Provider>
  );
};

FlyoutMenu.displayName = 'FlyoutMenu';

export const FlyoutMenuTrigger = React.forwardRef<HTMLElement, InternalFlyoutMenuTriggerProps>(
  ({ children, _hoverHandlers, _onFocus, ...props }, ref) => {
    const { onTriggerFocus, triggerHoverHandlers } = useFlyoutMenuContext();
    const childProps = children.props as React.HTMLAttributes<HTMLElement>;
    const { onFocus, onMouseEnter, onMouseLeave, ...restProps } = props;

    return (
      <PopoverPrimitive.Trigger
        ref={ref as unknown as React.ForwardedRef<HTMLButtonElement>}
        asChild
      >
        {React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          ...restProps,
          onMouseEnter: composeEventHandlers(
            onMouseEnter,
            composeEventHandlers(
              childProps.onMouseEnter,
              _hoverHandlers?.onMouseEnter ?? triggerHoverHandlers?.onMouseEnter
            )
          ),
          onMouseLeave: composeEventHandlers(
            onMouseLeave,
            composeEventHandlers(
              childProps.onMouseLeave,
              _hoverHandlers?.onMouseLeave ?? triggerHoverHandlers?.onMouseLeave
            )
          ),
          onFocus: composeEventHandlers(
            onFocus,
            composeEventHandlers(childProps.onFocus, _onFocus ?? onTriggerFocus)
          ),
          'aria-haspopup': 'true',
        })}
      </PopoverPrimitive.Trigger>
    );
  }
);

FlyoutMenuTrigger.displayName = 'FlyoutMenuTrigger';

export const FlyoutMenuContent = React.forwardRef<HTMLDivElement, InternalFlyoutMenuContentProps>(
  (
    {
      layout = 'list',
      width = 'md',
      align = 'start',
      sideOffset = 8,
      label,
      className,
      children,
      _hoverHandlers,
      _closeOnClickOutside,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const { closeOnClickOutside, contentHoverHandlers } = useFlyoutMenuContext();

    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={8}
          role="navigation"
          aria-label={label}
          className={clsx(styles.content, styles[`layout-${layout}`], className)}
          style={{ '--flyout-width': widthMap[width] } as React.CSSProperties}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
          }}
          onMouseEnter={composeEventHandlers(
            onMouseEnter,
            _hoverHandlers?.onMouseEnter ?? contentHoverHandlers?.onMouseEnter
          )}
          onMouseLeave={composeEventHandlers(
            onMouseLeave,
            _hoverHandlers?.onMouseLeave ?? contentHoverHandlers?.onMouseLeave
          )}
          onPointerDownOutside={(event) => {
            if (!(_closeOnClickOutside ?? closeOnClickOutside)) {
              event.preventDefault();
            }
          }}
          {...props}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    );
  }
);

FlyoutMenuContent.displayName = 'FlyoutMenuContent';

export const FlyoutMenuGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={clsx(styles.group, className)} role="group" {...props}>
    {children}
  </div>
));

FlyoutMenuGroup.displayName = 'FlyoutMenuGroup';

export const FlyoutMenuGroupLabel = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p ref={ref} className={clsx(styles.groupLabel, className)} {...props}>
    {children}
  </p>
));

FlyoutMenuGroupLabel.displayName = 'FlyoutMenuGroupLabel';

export const FlyoutMenuLink = React.forwardRef<HTMLAnchorElement, FlyoutMenuLinkProps>(
  (
    {
      icon: Icon,
      label,
      description,
      badge,
      active = false,
      external = false,
      className,
      href,
      ...props
    },
    ref
  ) => (
    <a
      ref={ref}
      href={href}
      className={clsx(styles.link, active && styles.linkActive, className)}
      aria-current={active ? 'page' : undefined}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {Icon ? (
        <span className={styles.linkIconWrapper} aria-hidden="true">
          <Icon className={styles.linkIcon} aria-hidden="true" />
        </span>
      ) : null}
      <span className={styles.linkText}>
        <span className={styles.linkLabel}>
          <span>{label}</span>
          {badge ? (
            <Tag
              size="sm"
              variant="accent"
              {...(styles.linkBadge ? { className: styles.linkBadge } : {})}
            >
              {badge}
            </Tag>
          ) : null}
          {external ? <span className={styles.srOnly}> (opens in new tab)</span> : null}
        </span>
        {description ? <span className={styles.linkDescription}>{description}</span> : null}
      </span>
    </a>
  )
);

FlyoutMenuLink.displayName = 'FlyoutMenuLink';

export const FlyoutMenuFeaturedCard = React.forwardRef<
  HTMLAnchorElement,
  FlyoutMenuFeaturedCardProps
>(({ href, image, imageAlt, title, subtitle, description, className, ...props }, ref) => (
  <a ref={ref} href={href} className={clsx(styles.featuredCard, className)} {...props}>
    <div className={styles.featuredCardImage}>
      <img src={image} alt={imageAlt} className={styles.featuredCardImg} />
    </div>
    <div className={styles.featuredCardBody}>
      {subtitle ? <span className={styles.featuredCardSubtitle}>{subtitle}</span> : null}
      <span className={styles.featuredCardTitle}>{title}</span>
      {description ? <span className={styles.featuredCardDescription}>{description}</span> : null}
    </div>
  </a>
));

FlyoutMenuFeaturedCard.displayName = 'FlyoutMenuFeaturedCard';

export const FlyoutMenuFeaturedHighlight = React.forwardRef<
  HTMLDivElement,
  FlyoutMenuFeaturedHighlightProps
>(({ title, description, href, linkLabel, image, imageAlt, className, ...props }, ref) => (
  <div ref={ref} className={clsx(styles.featuredHighlight, className)} {...props}>
    {image ? (
      <img src={image} alt={imageAlt ?? ''} className={styles.featuredHighlightImage} />
    ) : null}
    <div className={styles.featuredHighlightBody}>
      <p className={styles.featuredHighlightTitle}>{title}</p>
      {description ? <p className={styles.featuredHighlightDescription}>{description}</p> : null}
      {href && linkLabel ? (
        <a href={href} className={styles.featuredHighlightLink}>
          {linkLabel}
        </a>
      ) : null}
    </div>
  </div>
));

FlyoutMenuFeaturedHighlight.displayName = 'FlyoutMenuFeaturedHighlight';

export const FlyoutMenuCTABar = React.forwardRef<HTMLDivElement, FlyoutMenuCTABarProps>(
  ({ align = 'start', className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.ctaBar, styles[`ctaBar-${align}`], className)} {...props}>
      {children}
    </div>
  )
);

FlyoutMenuCTABar.displayName = 'FlyoutMenuCTABar';

export const FlyoutMenuFooter = React.forwardRef<HTMLDivElement, FlyoutMenuFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.footer, className)} {...props}>
      {children}
    </div>
  )
);

FlyoutMenuFooter.displayName = 'FlyoutMenuFooter';

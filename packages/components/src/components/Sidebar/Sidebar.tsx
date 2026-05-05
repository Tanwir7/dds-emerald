import clsx from 'clsx';
import * as RadixPopover from '@radix-ui/react-popover';
import { ChevronDown, PanelLeftClose, PanelLeftOpen, type LucideIcon } from 'lucide-react';
import React from 'react';
import { Icon } from '../Icon';
import { NavItem } from '../NavItem';
import { Sheet, SheetContent } from '../Sheet';
import { Tag, type TagVariant } from '../Tag';
import { Tooltip, TooltipProvider } from '../Tooltip';
import styles from './Sidebar.module.scss';

export interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
  desktopOverlayOpen: boolean;
  setDesktopOverlayOpen: (value: boolean) => void;
  desktopOverlayPresentation: boolean;
  desktopCollapsePhase: 'idle' | 'collapsing' | 'expanding';
  isMobile: boolean;
  collapsible: boolean;
  collapsedOverlay: boolean;
}

export interface SidebarProps {
  collapsed?: boolean | undefined;
  defaultCollapsed?: boolean | undefined;
  onCollapsedChange?: ((value: boolean) => void) | undefined;
  mobileOpen?: boolean | undefined;
  defaultMobileOpen?: boolean | undefined;
  onMobileOpenChange?: ((value: boolean) => void) | undefined;
  desktopOverlayOpen?: boolean | undefined;
  defaultDesktopOverlayOpen?: boolean | undefined;
  onDesktopOverlayOpenChange?: ((value: boolean) => void) | undefined;
  mobileBreakpoint?: number | undefined;
  collapsible?: boolean | undefined;
  collapsedOverlay?: boolean | undefined;
  overlayPortalContainer?: HTMLElement | null | undefined;
  className?: string | undefined;
  children: React.ReactNode;
}

export interface SidebarGroupProps {
  label?: string | undefined;
  icon?: LucideIcon | undefined;
  defaultOpen?: boolean | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  collapsible?: boolean | undefined;
  className?: string | undefined;
  children: React.ReactNode;
}

export interface SidebarItemProps {
  icon?: LucideIcon | undefined;
  label: string;
  href?: string | undefined;
  onClick?: (() => void) | undefined;
  active?: boolean | undefined;
  disabled?: boolean | undefined;
  badge?: string | number | undefined;
  badgeVariant?: TagVariant | undefined;
  collapsible?: boolean | undefined;
  className?: string | undefined;
  children?: React.ReactNode | undefined;
}

export interface SidebarSubItemProps {
  label: string;
  href?: string | undefined;
  onClick?: (() => void) | undefined;
  active?: boolean | undefined;
  disabled?: boolean | undefined;
  badge?: string | number | undefined;
  badgeVariant?: TagVariant | undefined;
  className?: string | undefined;
}

type SidebarRegionProps = React.HTMLAttributes<HTMLDivElement>;
type SidebarItemElement = HTMLAnchorElement | HTMLButtonElement;
type SidebarCollapseToggleProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'aria-label' | 'aria-labelledby'
> & {
  className?: string | undefined;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);
const flyoutCloseDelay = 120;
const desktopCollapseMotionDurationMs = 220;
const desktopOverlayTriggerSelector = '[data-sidebar-overlay-trigger="true"]';
const isDesktopRailPresentation = ({
  collapsed,
  desktopCollapsePhase,
  desktopOverlayPresentation,
}: Pick<
  SidebarContextValue,
  'collapsed' | 'desktopCollapsePhase' | 'desktopOverlayPresentation'
>) =>
  !desktopOverlayPresentation &&
  desktopCollapsePhase !== 'collapsing' &&
  (collapsed || desktopCollapsePhase === 'expanding');

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(query);
    const update = () => setMatches(mediaQueryList.matches);

    update();
    mediaQueryList.addEventListener('change', update);

    return () => mediaQueryList.removeEventListener('change', update);
  }, [query]);

  return matches;
};

const mergeRefs =
  <T,>(...refs: Array<React.Ref<T> | undefined>) =>
  (value: T | null) => {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        ref(value);
        return;
      }

      (ref as React.MutableRefObject<T | null>).current = value;
    });
  };

const getBadgeAriaLabel = (badge: string | number) =>
  typeof badge === 'number' ? `${badge} notifications` : `${badge}`;

const renderBadge = (badge: string | number, badgeVariant: TagVariant = 'accent') => (
  <Tag
    className={clsx(styles.tag, badgeVariant === 'accent' && styles.tagAccent)}
    size="sm"
    variant={badgeVariant}
    aria-label={getBadgeAriaLabel(badge)}
  >
    {badge}
  </Tag>
);

const SidebarGroupLabel = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p ref={ref} className={clsx(styles.groupLabel, className)} {...props}>
    {children}
  </p>
));

SidebarGroupLabel.displayName = 'SidebarGroupLabel';

const SidebarGroupItems = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.groupItems, className)} {...props}>
      {children}
    </div>
  )
);

SidebarGroupItems.displayName = 'SidebarGroupItems';

export const useSidebar = (): SidebarContextValue => {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }

  return context;
};

export const SidebarProvider = ({
  children,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  mobileOpen,
  defaultMobileOpen = false,
  onMobileOpenChange,
  desktopOverlayOpen,
  defaultDesktopOverlayOpen = false,
  onDesktopOverlayOpenChange,
  mobileBreakpoint = 768,
  collapsible = true,
  collapsedOverlay = false,
}: SidebarProps) => {
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  const [internalMobileOpen, setInternalMobileOpen] = React.useState(defaultMobileOpen);
  const [internalDesktopOverlayOpen, setInternalDesktopOverlayOpen] =
    React.useState(defaultDesktopOverlayOpen);
  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);
  const lastMobileFocusedElementRef = React.useRef<HTMLElement | null>(null);
  const lastDesktopOverlayFocusedElementRef = React.useRef<HTMLElement | null>(null);
  const desktopCollapseTimerRef = React.useRef<number | null>(null);
  const previousCollapsedRef = React.useRef<boolean | null>(null);
  const [desktopCollapsePhase, setDesktopCollapsePhase] = React.useState<
    'idle' | 'collapsing' | 'expanding'
  >('idle');
  const resolvedCollapsed = collapsible ? (collapsed ?? internalCollapsed) : false;
  const resolvedDesktopOverlayOpen = desktopOverlayOpen ?? internalDesktopOverlayOpen;
  const desktopOverlayEnabled = collapsible && collapsedOverlay;

  const clearDesktopCollapseTimer = React.useCallback(() => {
    if (desktopCollapseTimerRef.current !== null) {
      window.clearTimeout(desktopCollapseTimerRef.current);
      desktopCollapseTimerRef.current = null;
    }
  }, []);

  const beginDesktopCollapsePhase = React.useCallback(
    (nextCollapsed: boolean) => {
      if (isMobile) {
        clearDesktopCollapseTimer();
        setDesktopCollapsePhase('idle');
        return;
      }

      setDesktopCollapsePhase(nextCollapsed ? 'collapsing' : 'expanding');
      clearDesktopCollapseTimer();
      desktopCollapseTimerRef.current = window.setTimeout(() => {
        setDesktopCollapsePhase('idle');
        desktopCollapseTimerRef.current = null;
      }, desktopCollapseMotionDurationMs);
    },
    [clearDesktopCollapseTimer, isMobile]
  );

  React.useEffect(() => {
    if (!desktopOverlayEnabled || isMobile || !resolvedCollapsed || !resolvedDesktopOverlayOpen) {
      if (desktopOverlayOpen === undefined) {
        setInternalDesktopOverlayOpen(false);
      }

      if (resolvedDesktopOverlayOpen) {
        onDesktopOverlayOpenChange?.(false);
      }
    }
  }, [
    desktopOverlayEnabled,
    desktopOverlayOpen,
    isMobile,
    onDesktopOverlayOpenChange,
    resolvedCollapsed,
    resolvedDesktopOverlayOpen,
  ]);

  React.useEffect(() => {
    if (previousCollapsedRef.current === null) {
      previousCollapsedRef.current = resolvedCollapsed;
      return;
    }

    if (isMobile) {
      clearDesktopCollapseTimer();
      setDesktopCollapsePhase('idle');
      previousCollapsedRef.current = resolvedCollapsed;
      return;
    }

    if (previousCollapsedRef.current !== resolvedCollapsed && desktopCollapsePhase === 'idle') {
      beginDesktopCollapsePhase(resolvedCollapsed);
    }

    previousCollapsedRef.current = resolvedCollapsed;
  }, [
    beginDesktopCollapsePhase,
    clearDesktopCollapseTimer,
    desktopCollapsePhase,
    isMobile,
    resolvedCollapsed,
  ]);

  React.useEffect(
    () => () => {
      clearDesktopCollapseTimer();
    },
    [clearDesktopCollapseTimer]
  );

  const sidebarContextValue: SidebarContextValue = {
    collapsed: resolvedCollapsed,
    setCollapsed: (value) => {
      if (!collapsible) {
        return;
      }

      if (value !== resolvedCollapsed) {
        beginDesktopCollapsePhase(value);
      }

      if (collapsed === undefined) {
        setInternalCollapsed(value);
      }

      onCollapsedChange?.(value);
    },
    mobileOpen: mobileOpen ?? internalMobileOpen,
    setMobileOpen: (value) => {
      if (value) {
        lastMobileFocusedElementRef.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
      }

      if (mobileOpen === undefined) {
        setInternalMobileOpen(value);
      }

      onMobileOpenChange?.(value);

      if (!value) {
        window.setTimeout(() => {
          lastMobileFocusedElementRef.current?.focus();
          lastMobileFocusedElementRef.current = null;
        }, 0);
      }
    },
    desktopOverlayOpen: resolvedDesktopOverlayOpen,
    setDesktopOverlayOpen: (value) => {
      if (!desktopOverlayEnabled || isMobile || !resolvedCollapsed) {
        return;
      }

      if (value) {
        lastDesktopOverlayFocusedElementRef.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
      }

      if (desktopOverlayOpen === undefined) {
        setInternalDesktopOverlayOpen(value);
      }

      onDesktopOverlayOpenChange?.(value);

      if (!value) {
        window.setTimeout(() => {
          if (lastDesktopOverlayFocusedElementRef.current?.isConnected) {
            lastDesktopOverlayFocusedElementRef.current.focus();
          } else {
            document.querySelector<HTMLElement>(desktopOverlayTriggerSelector)?.focus();
          }
          lastDesktopOverlayFocusedElementRef.current = null;
        }, 0);
      }
    },
    desktopOverlayPresentation: false,
    desktopCollapsePhase,
    isMobile,
    collapsible,
    collapsedOverlay: desktopOverlayEnabled,
  };

  return <SidebarContext.Provider value={sidebarContextValue}>{children}</SidebarContext.Provider>;
};

export const Sidebar = React.forwardRef<
  HTMLElement,
  Pick<SidebarProps, 'className' | 'children' | 'overlayPortalContainer'>
>(({ className, children, overlayPortalContainer }, ref) => {
  const sidebar = useSidebar();
  const {
    collapsed,
    collapsedOverlay,
    desktopCollapsePhase,
    desktopOverlayPresentation,
    desktopOverlayOpen,
    isMobile,
    mobileOpen,
    setDesktopOverlayOpen,
    setMobileOpen,
  } = sidebar;
  const railPresentation = isDesktopRailPresentation({
    collapsed,
    desktopCollapsePhase,
    desktopOverlayPresentation,
  });

  const sidebarContent = (
    <nav
      ref={ref}
      aria-label="Main navigation"
      className={clsx(styles.sidebar, collapsed && styles.sidebarCollapsed, className)}
      data-desktop-phase={desktopCollapsePhase}
      data-rail-presentation={railPresentation ? 'true' : 'false'}
    >
      {children}
    </nav>
  );

  if (isMobile) {
    return (
      <TooltipProvider>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            size="sm"
            portalContainer={overlayPortalContainer}
            showCloseButton
            closeOnOverlayClick
            aria-label="Navigation"
            aria-describedby={undefined}
            className={clsx(styles.sidebarSheet, className)}
            style={{ width: 'var(--dds-sidebar-width)', maxWidth: '100vw' }}
          >
            <div className={styles.mobilePanel}>{children}</div>
          </SheetContent>
        </Sheet>
      </TooltipProvider>
    );
  }

  if (collapsed && collapsedOverlay) {
    const overlayContextValue: SidebarContextValue = {
      ...sidebar,
      collapsed: false,
      desktopOverlayPresentation: true,
      desktopCollapsePhase: 'idle',
    };

    return (
      <TooltipProvider>
        <div
          aria-hidden={desktopOverlayOpen ? 'true' : undefined}
          className={clsx(
            styles.sidebarOverlayRail,
            desktopOverlayOpen && styles.sidebarOverlayRailHidden
          )}
        >
          {sidebarContent}
        </div>
        <Sheet open={desktopOverlayOpen} onOpenChange={setDesktopOverlayOpen}>
          <SheetContent
            side="left"
            size="sm"
            portalContainer={overlayPortalContainer}
            showCloseButton={false}
            closeOnOverlayClick
            aria-label="Navigation"
            aria-describedby={undefined}
            className={clsx(styles.sidebarSheet, styles.sidebarOverlaySheet, className)}
            style={{ width: 'var(--dds-sidebar-width)', maxWidth: '100vw' }}
          >
            <SidebarContext.Provider value={overlayContextValue}>
              <nav
                aria-label="Main navigation"
                className={clsx(styles.sidebar, styles.sidebarOverlay)}
              >
                {children}
              </nav>
            </SidebarContext.Provider>
          </SheetContent>
        </Sheet>
      </TooltipProvider>
    );
  }

  return <TooltipProvider>{sidebarContent}</TooltipProvider>;
});

Sidebar.displayName = 'Sidebar';

export const SidebarTop = React.forwardRef<HTMLDivElement, SidebarRegionProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.sidebarTop, className)} {...props}>
      {children}
    </div>
  )
);

SidebarTop.displayName = 'SidebarTop';

export const SidebarContent = React.forwardRef<HTMLDivElement, SidebarRegionProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.sidebarContent, className)} {...props}>
      {children}
    </div>
  )
);

SidebarContent.displayName = 'SidebarContent';

export const SidebarBottom = React.forwardRef<HTMLDivElement, SidebarRegionProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.sidebarBottom, className)} {...props}>
      {children}
    </div>
  )
);

SidebarBottom.displayName = 'SidebarBottom';

export const SidebarCollapseToggle = React.forwardRef<
  HTMLButtonElement,
  SidebarCollapseToggleProps
>(({ className, ...props }, ref) => {
  const {
    collapsed,
    collapsedOverlay,
    collapsible,
    desktopCollapsePhase,
    desktopOverlayPresentation,
    desktopOverlayOpen,
    isMobile,
    setCollapsed,
    setDesktopOverlayOpen,
  } = useSidebar();

  if (!collapsible) {
    return null;
  }

  const isDesktopOverlayTrigger = collapsedOverlay && !isMobile;
  const closesDesktopOverlay =
    isDesktopOverlayTrigger && desktopOverlayPresentation && desktopOverlayOpen;
  const compactToggle = isDesktopRailPresentation({
    collapsed,
    desktopCollapsePhase,
    desktopOverlayPresentation,
  });
  const railOverlayToggle = isDesktopOverlayTrigger && compactToggle;
  const toggleIcon = collapsed && !desktopOverlayOpen ? PanelLeftOpen : PanelLeftClose;
  const toggleLabel = railOverlayToggle
    ? 'Expand sidebar'
    : closesDesktopOverlay
      ? 'Collapse sidebar'
      : collapsed
        ? 'Expand sidebar'
        : 'Collapse sidebar';
  const handleClick = () => {
    if (railOverlayToggle) {
      setDesktopOverlayOpen(!desktopOverlayOpen);
      return;
    }

    if (closesDesktopOverlay) {
      setDesktopOverlayOpen(false);
      return;
    }

    setCollapsed(!collapsed);
  };
  const toggleButton = (
    <button
      ref={ref}
      type="button"
      aria-label={toggleLabel}
      aria-expanded={railOverlayToggle || closesDesktopOverlay ? desktopOverlayOpen : !collapsed}
      className={clsx(
        styles.navItem,
        styles.collapseToggle,
        compactToggle ? styles.railItem : styles.collapseToggleExpanded,
        className
      )}
      onClick={handleClick}
      data-compact={compactToggle ? 'true' : undefined}
      data-sidebar-motion={desktopCollapsePhase}
      data-sidebar-overlay-trigger={railOverlayToggle ? 'true' : undefined}
      {...props}
    >
      <span className={styles.collapseToggleIcon}>
        <Icon icon={toggleIcon} aria-hidden="true" />
      </span>
      {compactToggle ? null : <span className={styles.collapseToggleLabel}>{toggleLabel}</span>}
    </button>
  );

  if (compactToggle && !isMobile) {
    return (
      <TooltipProvider>
        <Tooltip content={toggleLabel} side="right">
          {toggleButton}
        </Tooltip>
      </TooltipProvider>
    );
  }

  return toggleButton;
});

SidebarCollapseToggle.displayName = 'SidebarCollapseToggle';

export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  (
    {
      label,
      icon: _icon,
      defaultOpen = true,
      open,
      onOpenChange,
      collapsible = true,
      className,
      children,
    },
    ref
  ) => {
    const { collapsed, desktopCollapsePhase, desktopOverlayPresentation } = useSidebar();
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const isOpen = collapsible ? (open ?? internalOpen) : true;
    const groupId = React.useId();
    const railPresentation = isDesktopRailPresentation({
      collapsed,
      desktopCollapsePhase,
      desktopOverlayPresentation,
    });

    const handleToggle = () => {
      if (!collapsible) {
        return;
      }

      const nextOpen = !isOpen;

      if (open === undefined) {
        setInternalOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    };

    if (railPresentation) {
      return (
        <section ref={ref} className={clsx(styles.group, styles.groupCollapsed, className)}>
          <SidebarGroupItems role="group" aria-label={label}>
            {children}
          </SidebarGroupItems>
        </section>
      );
    }

    return (
      <section ref={ref} className={clsx(styles.group, className)}>
        {label && collapsible ? (
          <button
            type="button"
            className={styles.groupToggle}
            onClick={handleToggle}
            aria-expanded={isOpen}
            aria-controls={groupId}
          >
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <ChevronDown
              className={clsx(styles.groupChevron, !isOpen && styles.groupChevronClosed)}
              aria-hidden="true"
            />
          </button>
        ) : label ? (
          <SidebarGroupLabel className={styles.groupHeading} aria-hidden="true">
            {label}
          </SidebarGroupLabel>
        ) : null}
        <SidebarGroupItems
          id={groupId}
          className={clsx(!isOpen && styles.groupItemsHidden)}
          role="group"
          aria-label={label}
        >
          {children}
        </SidebarGroupItems>
      </section>
    );
  }
);

SidebarGroup.displayName = 'SidebarGroup';

export const SidebarSubItem = React.forwardRef<SidebarItemElement, SidebarSubItemProps>(
  (
    { label, href, onClick, active = false, disabled = false, badge, badgeVariant, className },
    ref
  ) => {
    const { collapsed, desktopCollapsePhase, desktopOverlayPresentation } = useSidebar();
    const endSlot = badge != null ? renderBadge(badge, badgeVariant) : undefined;
    const baseClassName = clsx(styles.navItem, styles.subItem, className);
    const railPresentation = isDesktopRailPresentation({
      collapsed,
      desktopCollapsePhase,
      desktopOverlayPresentation,
    });

    if (href) {
      return (
        <NavItem
          ref={ref}
          href={href}
          isActive={active}
          disabled={disabled}
          variant="sidebar"
          level={railPresentation ? 0 : 1}
          className={baseClassName}
          data-sidebar-motion={desktopCollapsePhase}
          {...(endSlot ? { endSlot } : {})}
        >
          {label}
        </NavItem>
      );
    }

    return (
      <NavItem
        ref={ref}
        isActive={active}
        disabled={disabled}
        variant="sidebar"
        level={railPresentation ? 0 : 1}
        className={baseClassName}
        data-sidebar-motion={desktopCollapsePhase}
        {...(onClick ? { onClick } : {})}
        {...(endSlot ? { endSlot } : {})}
      >
        {label}
      </NavItem>
    );
  }
);

SidebarSubItem.displayName = 'SidebarSubItem';

const RailFlyoutItem = React.forwardRef<
  SidebarItemElement,
  Omit<SidebarItemProps, 'href' | 'onClick'> & { children: React.ReactNode }
>(({ icon, label, active = false, disabled = false, badge, className, children }, ref) => {
  const [flyoutOpen, setFlyoutOpen] = React.useState(false);
  const triggerRef = React.useRef<SidebarItemElement | null>(null);
  const flyoutContentRef = React.useRef<HTMLDivElement | null>(null);
  const closeTimerRef = React.useRef<number | null>(null);
  const suppressFocusOpenRef = React.useRef(false);
  const flyoutId = React.useId();
  const iconNode = icon ? <Icon icon={icon} aria-hidden="true" /> : undefined;

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openFlyout = React.useCallback(() => {
    clearCloseTimer();
    setFlyoutOpen(true);
  }, [clearCloseTimer]);

  const getFirstFocusableFlyoutItem = React.useCallback(() => {
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    return flyoutContentRef.current?.querySelector<HTMLElement>(focusableSelector) ?? null;
  }, []);

  const focusFirstFlyoutItem = React.useCallback(() => {
    const firstFocusableItem = getFirstFocusableFlyoutItem();

    if (firstFocusableItem) {
      firstFocusableItem.focus();
      return true;
    }

    return false;
  }, [getFirstFocusableFlyoutItem]);

  const openFlyoutAndFocusFirstItem = React.useCallback(() => {
    openFlyout();

    window.requestAnimationFrame(() => {
      focusFirstFlyoutItem();
    });
  }, [focusFirstFlyoutItem, openFlyout]);

  const closeFlyout = React.useCallback(
    (restoreFocus = false) => {
      clearCloseTimer();
      suppressFocusOpenRef.current = restoreFocus;
      setFlyoutOpen(false);

      if (restoreFocus) {
        window.requestAnimationFrame(() => {
          triggerRef.current?.focus();
        });
      }
    },
    [clearCloseTimer]
  );

  const scheduleClose = React.useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setFlyoutOpen(false);
    }, flyoutCloseDelay);
  }, [clearCloseTimer]);

  const containsFlyoutFocusTarget = React.useCallback((target: EventTarget | null) => {
    if (!(target instanceof Node)) {
      return false;
    }

    return flyoutContentRef.current?.contains(target) ?? false;
  }, []);

  React.useEffect(
    () => () => {
      clearCloseTimer();
    },
    [clearCloseTimer]
  );

  return (
    <RadixPopover.Root open={flyoutOpen} onOpenChange={setFlyoutOpen}>
      <RadixPopover.Trigger asChild>
        <NavItem
          ref={mergeRefs(ref, triggerRef)}
          isActive={active}
          disabled={disabled}
          variant="sidebar"
          className={clsx(
            styles.navItem,
            styles.railItem,
            styles.railFlyoutTrigger,
            badge != null && styles.railNotificationItem,
            className
          )}
          aria-label={label}
          aria-controls={flyoutId}
          aria-expanded={flyoutOpen}
          aria-haspopup="dialog"
          data-flyout-trigger="true"
          data-rail-notification={badge != null ? 'true' : undefined}
          data-compact="true"
          onFocus={() => {
            if (suppressFocusOpenRef.current) {
              suppressFocusOpenRef.current = false;
              return;
            }

            openFlyout();
          }}
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null) &&
              !containsFlyoutFocusTarget(event.relatedTarget)
            ) {
              scheduleClose();
            }
          }}
          onMouseEnter={openFlyout}
          onMouseLeave={scheduleClose}
          onKeyDown={(event) => {
            if (event.key === 'Tab' && !event.shiftKey && flyoutOpen && focusFirstFlyoutItem()) {
              event.preventDefault();
              return;
            }

            if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openFlyoutAndFocusFirstItem();
              return;
            }

            if (event.key === 'Escape') {
              event.preventDefault();
              closeFlyout(true);
            }
          }}
          {...(iconNode ? { icon: iconNode } : {})}
        >
          {label}
        </NavItem>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          id={flyoutId}
          ref={flyoutContentRef}
          side="right"
          sideOffset={4}
          align="start"
          className={styles.railFlyout}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onEscapeKeyDown={() => closeFlyout(true)}
          onFocusOutside={() => closeFlyout(false)}
          onInteractOutside={() => closeFlyout(false)}
          onFocusCapture={clearCloseTimer}
          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null) &&
              !triggerRef.current?.contains(event.relatedTarget as Node | null)
            ) {
              scheduleClose();
            }
          }}
          onMouseEnter={openFlyout}
          onMouseLeave={scheduleClose}
        >
          <p className={styles.railFlyoutLabel}>{label}</p>
          <div className={styles.railFlyoutItems}>{children}</div>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
});

RailFlyoutItem.displayName = 'RailFlyoutItem';

export const SidebarItem = React.forwardRef<SidebarItemElement, SidebarItemProps>(
  (
    {
      icon,
      label,
      href,
      onClick,
      active = false,
      disabled = false,
      badge,
      badgeVariant,
      collapsible = true,
      className,
      children,
    },
    ref
  ) => {
    const { collapsed, desktopCollapsePhase, desktopOverlayPresentation } = useSidebar();
    const hasChildren = React.Children.count(children) > 0;
    const [subOpen, setSubOpen] = React.useState(false);
    const subId = React.useId();
    const iconNode = icon ? <Icon icon={icon} aria-hidden="true" /> : null;
    const railPresentation = isDesktopRailPresentation({
      collapsed,
      desktopCollapsePhase,
      desktopOverlayPresentation,
    });

    if (railPresentation && hasChildren) {
      return (
        <RailFlyoutItem
          ref={ref}
          icon={icon}
          label={label}
          active={active}
          disabled={disabled}
          badge={badge}
          badgeVariant={badgeVariant}
          className={className}
        >
          {children}
        </RailFlyoutItem>
      );
    }

    if (railPresentation) {
      return (
        <Tooltip content={label} side="right">
          {href ? (
            <NavItem
              ref={ref}
              href={href}
              isActive={active}
              disabled={disabled}
              variant="sidebar"
              aria-label={label}
              className={clsx(
                styles.navItem,
                styles.railItem,
                badge != null && styles.railNotificationItem,
                className
              )}
              data-rail-notification={badge != null ? 'true' : undefined}
              data-compact="true"
              data-sidebar-motion={desktopCollapsePhase}
              {...(iconNode ? { icon: iconNode } : {})}
            >
              {label}
            </NavItem>
          ) : (
            <NavItem
              ref={ref}
              isActive={active}
              disabled={disabled}
              variant="sidebar"
              aria-label={label}
              className={clsx(
                styles.navItem,
                styles.railItem,
                badge != null && styles.railNotificationItem,
                className
              )}
              data-rail-notification={badge != null ? 'true' : undefined}
              data-compact="true"
              data-sidebar-motion={desktopCollapsePhase}
              {...(onClick ? { onClick } : {})}
              {...(iconNode ? { icon: iconNode } : {})}
            >
              {label}
            </NavItem>
          )}
        </Tooltip>
      );
    }

    if (hasChildren) {
      if (!collapsible) {
        const itemProps = {
          ref,
          isActive: active,
          disabled,
          variant: 'sidebar' as const,
          className: clsx(styles.navItem),
          'data-sidebar-motion': desktopCollapsePhase,
          ...(iconNode ? { icon: iconNode } : {}),
          ...(badge != null ? { endSlot: renderBadge(badge, badgeVariant) } : {}),
        };

        return (
          <div className={clsx(styles.itemWrapper, className)}>
            {href ? (
              <NavItem href={href} {...itemProps}>
                {label}
              </NavItem>
            ) : (
              <NavItem {...itemProps} {...(onClick ? { onClick } : {})}>
                {label}
              </NavItem>
            )}
            <div
              id={subId}
              className={clsx(styles.subItems, styles.subItemsOpen)}
              role="group"
              aria-label={`${label} submenu`}
            >
              {children}
            </div>
          </div>
        );
      }

      return (
        <div className={clsx(styles.itemWrapper, className)}>
          <NavItem
            ref={ref}
            onClick={() => setSubOpen((currentOpen) => !currentOpen)}
            isActive={active}
            disabled={disabled}
            icon={iconNode}
            variant="sidebar"
            className={clsx(styles.navItem, styles.itemToggle)}
            aria-expanded={subOpen}
            aria-controls={subId}
            data-sidebar-motion={desktopCollapsePhase}
            endSlot={
              <span className={styles.itemEndSlot}>
                {badge != null ? renderBadge(badge, badgeVariant) : null}
                <ChevronDown
                  className={clsx(styles.itemChevron, subOpen && styles.itemChevronOpen)}
                  aria-hidden="true"
                />
              </span>
            }
          >
            {label}
          </NavItem>
          <div
            id={subId}
            className={clsx(styles.subItems, subOpen && styles.subItemsOpen)}
            role="group"
            aria-label={`${label} submenu`}
          >
            {children}
          </div>
        </div>
      );
    }

    const endSlot = badge != null ? renderBadge(badge, badgeVariant) : undefined;

    if (href) {
      return (
        <NavItem
          ref={ref}
          href={href}
          isActive={active}
          disabled={disabled}
          variant="sidebar"
          className={clsx(styles.navItem, className)}
          data-sidebar-motion={desktopCollapsePhase}
          {...(iconNode ? { icon: iconNode } : {})}
          {...(endSlot ? { endSlot } : {})}
        >
          {label}
        </NavItem>
      );
    }

    return (
      <NavItem
        ref={ref}
        isActive={active}
        disabled={disabled}
        variant="sidebar"
        className={clsx(styles.navItem, className)}
        data-sidebar-motion={desktopCollapsePhase}
        {...(onClick ? { onClick } : {})}
        {...(iconNode ? { icon: iconNode } : {})}
        {...(endSlot ? { endSlot } : {})}
      >
        {label}
      </NavItem>
    );
  }
);

SidebarItem.displayName = 'SidebarItem';

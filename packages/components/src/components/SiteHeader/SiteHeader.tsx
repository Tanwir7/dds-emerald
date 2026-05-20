import clsx from 'clsx';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../Avatar';
import { Dropdown, DropdownContent, DropdownSeparator, DropdownTrigger } from '../Dropdown';
import { FlyoutMenu, FlyoutMenuContent, FlyoutMenuTrigger } from '../FlyoutMenu';
import { Input } from '../Input';
import { Sheet, SheetContent } from '../Sheet';
import styles from './SiteHeader.module.scss';

export type SiteHeaderTheme = 'light' | 'brand';
export type SiteHeaderVariant = 'default' | 'underline' | 'transparent';

export interface SiteHeaderProps extends React.HTMLAttributes<HTMLElement> {
  theme?: SiteHeaderTheme;
  variant?: SiteHeaderVariant;
  sticky?: boolean;
  bordered?: boolean;
  compact?: boolean;
  mobileBreakpoint?: number;
  className?: string;
  children: React.ReactNode;
  'aria-label'?: string;
}

export interface SiteHeaderNavItemProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'children' | 'className' | 'href'
> {
  href: string;
  active?: boolean;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface SiteHeaderNavFlyoutItemProps extends Omit<
  React.LiHTMLAttributes<HTMLLIElement>,
  'children' | 'className'
> {
  label: string;
  flyoutLabel?: string;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface SiteHeaderSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  defaultExpanded?: boolean;
  className?: string;
}

export interface SiteHeaderUserMenuProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  name: string;
  email?: string;
  avatarSrc?: string;
  avatarFallback?: string;
  children: React.ReactNode;
}

type SiteHeaderBrandProps = React.ComponentPropsWithoutRef<'a'>;

type SiteHeaderNavProps = React.ComponentPropsWithoutRef<'nav'>;

type SiteHeaderActionsProps = React.ComponentPropsWithoutRef<'div'>;

type SiteHeaderSubNavProps = React.ComponentPropsWithoutRef<'nav'>;

type SiteHeaderMobileTriggerProps = React.ComponentPropsWithoutRef<'button'>;

type SiteHeaderMobileMenuProps = React.ComponentPropsWithoutRef<'div'>;

interface SiteHeaderContextValue {
  theme: SiteHeaderTheme;
  variant: SiteHeaderVariant;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileMenuId: string;
}

const SiteHeaderContext = React.createContext<SiteHeaderContextValue | null>(null);

const useSiteHeader = (): SiteHeaderContextValue => {
  const context = React.useContext(SiteHeaderContext);

  if (!context) {
    throw new Error('useSiteHeader must be used within SiteHeader');
  }

  return context;
};

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

export const SiteHeader = React.forwardRef<HTMLElement, SiteHeaderProps>(
  (
    {
      theme = 'light',
      variant = 'default',
      sticky = false,
      bordered = true,
      compact = false,
      mobileBreakpoint = 1024,
      className,
      children,
      'aria-label': ariaLabel = 'Site navigation',
      ...props
    },
    ref
  ) => {
    const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const mobileMenuId = React.useId();

    React.useEffect(() => {
      if (variant !== 'transparent') {
        setScrolled(false);
        return undefined;
      }

      const handleScroll = () => setScrolled(window.scrollY > 8);

      handleScroll();
      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => window.removeEventListener('scroll', handleScroll);
    }, [variant]);

    React.useEffect(() => {
      if (!isMobile) {
        setMobileOpen(false);
      }
    }, [isMobile]);

    return (
      <SiteHeaderContext.Provider
        value={{ theme, variant, isMobile, mobileOpen, setMobileOpen, mobileMenuId }}
      >
        <header
          ref={ref}
          className={clsx(
            styles.header,
            theme === 'brand' && styles.themeBrand,
            styles[`variant${variant.charAt(0).toUpperCase()}${variant.slice(1)}`],
            sticky && styles.sticky,
            bordered && styles.bordered,
            compact && styles.compact,
            scrolled && styles.scrolled,
            className
          )}
          aria-label={ariaLabel}
          {...props}
        >
          <div className={styles.inner}>{children}</div>
        </header>
      </SiteHeaderContext.Provider>
    );
  }
);

SiteHeader.displayName = 'SiteHeader';

export const SiteHeaderBrand = React.forwardRef<HTMLAnchorElement, SiteHeaderBrandProps>(
  ({ className, children, href = '/', ...props }, ref) => (
    <a ref={ref} href={href} className={clsx(styles.brand, className)} {...props}>
      {children}
    </a>
  )
);

SiteHeaderBrand.displayName = 'SiteHeaderBrand';

export const SiteHeaderNav = React.forwardRef<HTMLElement, SiteHeaderNavProps>((props, ref) => {
  const { className, children, ...restProps } = props;
  const ariaLabel = props['aria-label'];
  const { isMobile } = useSiteHeader();

  if (isMobile) {
    return null;
  }

  return (
    <nav
      ref={ref}
      className={clsx(styles.nav, className)}
      aria-label={ariaLabel ?? 'Main navigation'}
      {...restProps}
    >
      <ul className={styles.navList}>{children}</ul>
    </nav>
  );
});

SiteHeaderNav.displayName = 'SiteHeaderNav';

export const SiteHeaderNavItem = React.forwardRef<HTMLAnchorElement, SiteHeaderNavItemProps>(
  ({ href, active = false, external = false, className, children, ...props }, ref) => {
    const { variant } = useSiteHeader();

    return (
      <li className={styles.navItem}>
        <a
          ref={ref}
          href={href}
          className={clsx(
            styles.navLink,
            active && styles.navLinkActive,
            variant === 'underline' && styles.navLinkUnderline,
            className
          )}
          aria-current={active ? 'page' : undefined}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {children}
          {external ? <span className={styles.srOnly}> (opens in new tab)</span> : null}
        </a>
      </li>
    );
  }
);

SiteHeaderNavItem.displayName = 'SiteHeaderNavItem';

export const SiteHeaderNavFlyoutItem = React.forwardRef<
  HTMLLIElement,
  SiteHeaderNavFlyoutItemProps
>(({ label, flyoutLabel, active = false, className, children, ...props }, ref) => {
  const { variant } = useSiteHeader();

  return (
    <li ref={ref} className={clsx(styles.navItem, className)} {...props}>
      <FlyoutMenu>
        <FlyoutMenuTrigger>
          <button
            type="button"
            className={clsx(
              styles.navLink,
              styles.navLinkFlyout,
              active && styles.navLinkActive,
              variant === 'underline' && styles.navLinkUnderline
            )}
          >
            {label}
            <ChevronDown className={styles.navLinkChevron} aria-hidden="true" />
          </button>
        </FlyoutMenuTrigger>
        <FlyoutMenuContent sideOffset={0} label={flyoutLabel ?? `${label} navigation`}>
          {children}
        </FlyoutMenuContent>
      </FlyoutMenu>
    </li>
  );
});

SiteHeaderNavFlyoutItem.displayName = 'SiteHeaderNavFlyoutItem';

export const SiteHeaderActions = React.forwardRef<HTMLDivElement, SiteHeaderActionsProps>(
  ({ className, children, ...props }, ref) => {
    const { isMobile } = useSiteHeader();

    if (isMobile) {
      return null;
    }

    return (
      <div ref={ref} className={clsx(styles.actions, className)} {...props}>
        {children}
      </div>
    );
  }
);

SiteHeaderActions.displayName = 'SiteHeaderActions';

export const SiteHeaderSearch = React.forwardRef<HTMLDivElement, SiteHeaderSearchProps>(
  ({ placeholder = 'Search…', onSearch, defaultExpanded = false, className }, ref) => {
    const [expanded, setExpanded] = React.useState(defaultExpanded);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleExpand = React.useCallback(() => {
      setExpanded(true);
      requestAnimationFrame(() => inputRef.current?.focus());
    }, []);

    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setExpanded(false);
      }
    };

    return (
      <div
        ref={ref}
        className={clsx(styles.search, expanded && styles.searchExpanded, className)}
        onBlur={handleBlur}
      >
        {expanded ? (
          <div className={styles.searchInputWrapper}>
            <Input
              ref={inputRef}
              placeholder={placeholder}
              size="sm"
              startIcon={Search}
              aria-label={placeholder}
              {...(styles.searchInput ? { className: styles.searchInput } : {})}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onSearch?.(event.currentTarget.value);
                }

                if (event.key === 'Escape') {
                  setExpanded(false);
                }
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            className={styles.searchToggle}
            aria-label="Open search"
            aria-expanded={false}
            onClick={handleExpand}
          >
            <Search className={styles.searchIcon} aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);

SiteHeaderSearch.displayName = 'SiteHeaderSearch';

export const SiteHeaderUserMenu = React.forwardRef<HTMLDivElement, SiteHeaderUserMenuProps>(
  ({ name, email, avatarSrc, avatarFallback, children, className, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      <Dropdown>
        <DropdownTrigger asChild>
          <button
            type="button"
            className={styles.userMenuTriggerAnchor}
            aria-label={`Account menu for ${name}`}
          >
            <span className={styles.userMenuTrigger}>
              <Avatar size="sm">
                {avatarSrc ? <AvatarImage src={avatarSrc} alt={name} /> : null}
                <AvatarFallback>{avatarFallback ?? name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <ChevronDown className={styles.userMenuChevron} aria-hidden="true" />
            </span>
          </button>
        </DropdownTrigger>
        <DropdownContent align="end" sideOffset={0}>
          <div className={styles.userMenuHeader}>
            <p className={styles.userMenuName}>{name}</p>
            {email ? <p className={styles.userMenuEmail}>{email}</p> : null}
          </div>
          <DropdownSeparator />
          {children}
        </DropdownContent>
      </Dropdown>
    </div>
  )
);

SiteHeaderUserMenu.displayName = 'SiteHeaderUserMenu';

export const SiteHeaderSubNav = React.forwardRef<HTMLElement, SiteHeaderSubNavProps>(
  (props, ref) => {
    const { className, children, ...restProps } = props;
    const ariaLabel = props['aria-label'];

    return (
      <nav
        ref={ref}
        className={clsx(styles.subNav, className)}
        aria-label={ariaLabel ?? 'Secondary navigation'}
        {...restProps}
      >
        <div className={styles.subNavInner}>{children}</div>
      </nav>
    );
  }
);

SiteHeaderSubNav.displayName = 'SiteHeaderSubNav';

export const SiteHeaderMobileTrigger = React.forwardRef<
  HTMLButtonElement,
  SiteHeaderMobileTriggerProps
>(({ className, onClick, ...props }, ref) => {
  const { isMobile, mobileOpen, setMobileOpen, mobileMenuId } = useSiteHeader();

  if (!isMobile) {
    return null;
  }

  return (
    <button
      ref={ref}
      type="button"
      className={clsx(styles.mobileTrigger, className)}
      aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={mobileOpen}
      aria-controls={mobileMenuId}
      onClick={(event) => {
        setMobileOpen((current) => !current);
        onClick?.(event);
      }}
      {...props}
    >
      {mobileOpen ? (
        <X className={styles.mobileTriggerIcon} aria-hidden="true" />
      ) : (
        <Menu className={styles.mobileTriggerIcon} aria-hidden="true" />
      )}
    </button>
  );
});

SiteHeaderMobileTrigger.displayName = 'SiteHeaderMobileTrigger';

export const SiteHeaderMobileMenu = React.forwardRef<HTMLDivElement, SiteHeaderMobileMenuProps>(
  (props, ref) => {
    const { className, children, 'aria-label': ariaLabel, ...restProps } = props;
    const { isMobile, mobileOpen, setMobileOpen, mobileMenuId } = useSiteHeader();

    if (!isMobile) {
      return null;
    }

    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          ref={ref}
          id={mobileMenuId}
          side="left"
          size="full"
          showCloseButton={false}
          className={clsx(styles.mobileContent, className)}
          {...(ariaLabel ? { 'aria-label': ariaLabel } : { 'aria-label': 'Navigation menu' })}
          {...restProps}
        >
          {children}
        </SheetContent>
      </Sheet>
    );
  }
);

SiteHeaderMobileMenu.displayName = 'SiteHeaderMobileMenu';

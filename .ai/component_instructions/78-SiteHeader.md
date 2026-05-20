# SiteHeader · node scaffolding.mjs SiteHeader

---

## AGENT TASK: Read `AGENTS.md`, `packages/tokens/src/tokens.css`, and `74-FlyoutMenu.md` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/FlyoutMenu/   ← must exist first
packages/components/src/components/Button/
packages/components/src/components/Input/
packages/components/src/components/Avatar/
packages/components/src/components/Dropdown/
packages/components/src/components/Sheet/
packages/components/src/components/
```

- `FlyoutMenu` must be implemented before `SiteHeader`. SiteHeader composes `FlyoutMenu` for dropdown nav items.
- Use `Button` for CTA actions (Sign In, Get Started, etc.).
- Use `Input` for the expandable search field.
- Use `Avatar` + `Dropdown` for the signed-in user menu.
- Use `Sheet` with `side="left"` for the mobile full-screen menu (if `Sheet` exists), or `@radix-ui/react-dialog` directly.
- No Radix primitive for the header itself — it is a plain `<header>` element.

### Token additions required

Verify these exist in `packages/tokens/src/tokens.css`, add if missing:

```css
/* Tier 1 — Site header */
--dds-site-header-height: 64px;
--dds-site-header-height-sm: 56px; /* compact variant */
```

---

## Scaffold location

```
packages/components/src/components/SiteHeader/
  SiteHeader.tsx
  SiteHeader.module.scss
  SiteHeader.test.tsx
  SiteHeader.stories.tsx
  index.ts
```

---

## Purpose

`SiteHeader` is the top navigation bar for marketing sites and product pages. It sits at the top of the viewport and can be sticky. It contains a brand/logo slot, horizontal navigation links (plain links or FlyoutMenu triggers), an optional secondary nav, a right-side actions area (auth buttons, search, user menu), and a mobile hamburger menu.

**SiteHeader vs Sidebar:** SiteHeader is for top-level marketing/product site navigation. Sidebar is for persistent application-level navigation within an app shell.

---

## Exports from `index.ts`

```ts
export {
  SiteHeader,
  SiteHeaderBrand,
  SiteHeaderNav,
  SiteHeaderNavItem,
  SiteHeaderNavFlyoutItem,
  SiteHeaderActions,
  SiteHeaderSearch,
  SiteHeaderUserMenu,
  SiteHeaderSubNav,
  SiteHeaderMobileMenu,
  SiteHeaderMobileTrigger,
};
export type {
  SiteHeaderProps,
  SiteHeaderNavItemProps,
  SiteHeaderNavFlyoutItemProps,
  SiteHeaderSearchProps,
  SiteHeaderUserMenuProps,
  SiteHeaderVariant,
  SiteHeaderTheme,
};
```

---

## Types

```ts
type SiteHeaderTheme = 'light' | 'dark' | 'brand';
// 'light'  — white/card bg, dark text (default)
// 'dark'   — dark bg, white text
// 'brand'  — uses brand/primary colour bg, white text

type SiteHeaderVariant =
  | 'default' // standard white header
  | 'underline' // nav links show active underline indicator
  | 'transparent'; // no bg/border — for hero sections (becomes light on scroll)

export interface SiteHeaderProps {
  theme?: SiteHeaderTheme; // default: 'light'
  variant?: SiteHeaderVariant; // default: 'default'
  sticky?: boolean; // default: false
  bordered?: boolean; // default: true — bottom border
  compact?: boolean; // default: false — reduces height to sm
  mobileBreakpoint?: number; // default: 1024 — px
  className?: string;
  children: React.ReactNode;
  'aria-label'?: string; // default: 'Site navigation'
}

export interface SiteHeaderNavItemProps {
  href: string;
  active?: boolean;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface SiteHeaderNavFlyoutItemProps {
  label: string;
  flyoutLabel?: string; // aria-label for the flyout panel
  active?: boolean;
  className?: string;
  children: React.ReactNode; // FlyoutMenu sub-components
}

export interface SiteHeaderSearchProps {
  placeholder?: string; // default: 'Search…'
  onSearch?: (query: string) => void;
  defaultExpanded?: boolean;
  className?: string;
}

export interface SiteHeaderUserMenuProps {
  name: string;
  email?: string;
  avatarSrc?: string;
  avatarFallback?: string;
  children: React.ReactNode; // Dropdown items
}
```

---

## Architecture

```
SiteHeader                           <header> (sticky or static)
  ├── SiteHeaderBrand                <a> or <div> — logo slot
  ├── SiteHeaderNav                  <nav aria-label="Main navigation">
  │     ├── SiteHeaderNavItem        <a> — plain nav link
  │     └── SiteHeaderNavFlyoutItem  FlyoutMenu (trigger + content)
  ├── SiteHeaderActions              <div> — right-side action area
  │     ├── SiteHeaderSearch         expandable search
  │     ├── SiteHeaderUserMenu       Avatar + Dropdown (signed-in state)
  │     └── consumer Button children (Sign In, Get Started, etc.)
  ├── SiteHeaderSubNav               <nav aria-label="Secondary navigation"> (optional)
  └── SiteHeaderMobileMenu           hamburger + full-screen overlay
        └── SiteHeaderMobileTrigger  hamburger button
```

### Inner layout

```scss
// Desktop layout:
// [Brand]  [Nav links …]              [Actions: search, user, CTAs]
// flex row, brand left, nav centre/left, actions right (margin-left: auto)

// Sticky + transparent variant:
// transparent until scroll > 0px — JS scroll listener adds .scrolled class
// .scrolled: background switches from transparent to var(--dds-color-bg-card)
```

### Transparent variant on scroll

```tsx
// Inside SiteHeader when variant="transparent":
const [scrolled, setScrolled] = React.useState(false);
React.useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 8);
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

---

## Component structure

```tsx
// SiteHeader.tsx
import clsx from 'clsx';
import styles from './SiteHeader.module.scss';
import { FlyoutMenu, FlyoutMenuTrigger, FlyoutMenuContent } from '../FlyoutMenu';

// ─── Context ──────────────────────────────────────────────────────────────────

interface SiteHeaderContextValue {
  theme: SiteHeaderTheme;
  variant: SiteHeaderVariant;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}
const SiteHeaderContext = React.createContext<SiteHeaderContextValue | null>(null);
const useSiteHeader = () => {
  const ctx = React.useContext(SiteHeaderContext);
  if (!ctx) throw new Error('useSiteHeader must be used within SiteHeader');
  return ctx;
};

// ─── Root ─────────────────────────────────────────────────────────────────────

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
    },
    ref
  ) => {
    const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
      if (variant !== 'transparent') return;
      const handleScroll = () => setScrolled(window.scrollY > 8);
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }, [variant]);

    return (
      <SiteHeaderContext.Provider value={{ theme, variant, isMobile, mobileOpen, setMobileOpen }}>
        <header
          ref={ref}
          className={clsx(
            styles.header,
            styles[`theme-${theme}`],
            styles[`variant-${variant}`],
            sticky && styles.sticky,
            bordered && styles.bordered,
            compact && styles.compact,
            scrolled && styles.scrolled,
            className
          )}
          aria-label={ariaLabel}
        >
          <div className={styles.inner}>{children}</div>
        </header>
      </SiteHeaderContext.Provider>
    );
  }
);
SiteHeader.displayName = 'SiteHeader';

// ─── Brand ────────────────────────────────────────────────────────────────────

export const SiteHeaderBrand = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, children, href = '/', ...props }, ref) => (
  <a ref={ref} href={href} className={clsx(styles.brand, className)} {...props}>
    {children}
  </a>
));
SiteHeaderBrand.displayName = 'SiteHeaderBrand';

// ─── Nav ──────────────────────────────────────────────────────────────────────

export const SiteHeaderNav = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, children, ...props }, ref) => {
    const { isMobile } = useSiteHeader();
    // Desktop: visible nav. Mobile: hidden (mobile menu handles navigation)
    return (
      <nav
        ref={ref}
        className={clsx(styles.nav, isMobile && styles.navHidden, className)}
        aria-label="Main navigation"
        {...props}
      >
        <ul className={styles.navList} role="list">
          {children}
        </ul>
      </nav>
    );
  }
);
SiteHeaderNav.displayName = 'SiteHeaderNav';

// ─── Plain nav link ───────────────────────────────────────────────────────────

export const SiteHeaderNavItem = React.forwardRef<HTMLAnchorElement, SiteHeaderNavItemProps>(
  ({ href, active, external, className, children, ...props }, ref) => {
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
          {external && <span className={styles.srOnly}> (opens in new tab)</span>}
        </a>
      </li>
    );
  }
);
SiteHeaderNavItem.displayName = 'SiteHeaderNavItem';

// ─── Flyout nav item ──────────────────────────────────────────────────────────

export const SiteHeaderNavFlyoutItem = React.forwardRef<
  HTMLLIElement,
  SiteHeaderNavFlyoutItemProps
>(({ label, flyoutLabel, active, className, children, ...props }, ref) => {
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
            aria-haspopup="true"
          >
            {label}
            <ChevronDown className={styles.navLinkChevron} aria-hidden="true" />
          </button>
        </FlyoutMenuTrigger>
        <FlyoutMenuContent label={flyoutLabel ?? `${label} navigation`}>
          {children}
        </FlyoutMenuContent>
      </FlyoutMenu>
    </li>
  );
});
SiteHeaderNavFlyoutItem.displayName = 'SiteHeaderNavFlyoutItem';

// ─── Actions ──────────────────────────────────────────────────────────────────

export const SiteHeaderActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={clsx(styles.actions, className)} {...props}>
    {children}
  </div>
));
SiteHeaderActions.displayName = 'SiteHeaderActions';

// ─── Search ───────────────────────────────────────────────────────────────────

export const SiteHeaderSearch = React.forwardRef<HTMLDivElement, SiteHeaderSearchProps>(
  ({ placeholder = 'Search…', onSearch, defaultExpanded = false, className }, ref) => {
    const [expanded, setExpanded] = React.useState(defaultExpanded);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleExpand = () => {
      setExpanded(true);
      // Focus input after expand transition
      requestAnimationFrame(() => inputRef.current?.focus());
    };

    const handleBlur = (e: React.FocusEvent) => {
      // Collapse only if focus leaves the entire search widget
      if (!e.currentTarget.contains(e.relatedTarget)) {
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
          // Expanded: show input
          <div className={styles.searchInputWrapper}>
            <Input
              ref={inputRef}
              placeholder={placeholder}
              leftIcon={Search}
              size="sm"
              aria-label={placeholder}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSearch?.((e.target as HTMLInputElement).value);
                if (e.key === 'Escape') {
                  setExpanded(false);
                }
              }}
              className={styles.searchInput}
            />
          </div>
        ) : (
          // Collapsed: show icon button
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

// ─── User menu ────────────────────────────────────────────────────────────────

export const SiteHeaderUserMenu = React.forwardRef<HTMLDivElement, SiteHeaderUserMenuProps>(
  ({ name, email, avatarSrc, avatarFallback, children, ...props }, ref) => (
    <div ref={ref} {...props}>
      <Dropdown>
        <DropdownTrigger asChild>
          <button
            type="button"
            className={styles.userMenuTrigger}
            aria-label={`Account menu for ${name}`}
            aria-haspopup="menu"
          >
            <Avatar
              src={avatarSrc}
              fallback={avatarFallback ?? name.charAt(0).toUpperCase()}
              size="sm"
              alt={name}
            />
            <ChevronDown className={styles.userMenuChevron} aria-hidden="true" />
          </button>
        </DropdownTrigger>
        <DropdownContent align="end">
          <div className={styles.userMenuHeader}>
            <p className={styles.userMenuName}>{name}</p>
            {email && <p className={styles.userMenuEmail}>{email}</p>}
          </div>
          <DropdownSeparator />
          {children}
        </DropdownContent>
      </Dropdown>
    </div>
  )
);
SiteHeaderUserMenu.displayName = 'SiteHeaderUserMenu';

// ─── Sub-nav ──────────────────────────────────────────────────────────────────

export const SiteHeaderSubNav = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, children, ...props }, ref) => (
    <nav
      ref={ref}
      className={clsx(styles.subNav, className)}
      aria-label="Secondary navigation"
      {...props}
    >
      <div className={styles.subNavInner}>{children}</div>
    </nav>
  )
);
SiteHeaderSubNav.displayName = 'SiteHeaderSubNav';

// ─── Mobile trigger (hamburger) ───────────────────────────────────────────────

export const SiteHeaderMobileTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { mobileOpen, setMobileOpen } = useSiteHeader();
  return (
    <button
      ref={ref}
      type="button"
      className={clsx(styles.mobileTrigger, className)}
      aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={mobileOpen}
      aria-controls="site-header-mobile-menu"
      onClick={() => setMobileOpen(!mobileOpen)}
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

// ─── Mobile menu (full-screen overlay) ────────────────────────────────────────

export const SiteHeaderMobileMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { mobileOpen, setMobileOpen } = useSiteHeader();
  return (
    <RadixDialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={styles.mobileOverlay} />
        <RadixDialog.Content
          ref={ref}
          id="site-header-mobile-menu"
          className={clsx(styles.mobileContent, className)}
          aria-label="Navigation menu"
          {...props}
        >
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
});
SiteHeaderMobileMenu.displayName = 'SiteHeaderMobileMenu';
```

---

## SCSS — SiteHeader.module.scss

```scss
@use '../../../styles/mixins' as *;

// ─── Header root ──────────────────────────────────────────────────────────────

.header {
  width: 100%;
  position: relative;
  z-index: var(--dds-z-menubar); // use existing menubar z-index token
  transition:
    background-color var(--dds-duration-fast) var(--dds-ease-standard),
    border-color var(--dds-duration-fast) var(--dds-ease-standard),
    box-shadow var(--dds-duration-fast) var(--dds-ease-standard);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.sticky {
  position: sticky;
  top: 0;
}

.bordered {
  border-bottom: 1px solid var(--dds-color-border-default);
}

// ─── Inner container ──────────────────────────────────────────────────────────

.inner {
  display: flex;
  align-items: center;
  gap: var(--dds-space-6);
  height: var(--dds-site-header-height);
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--dds-space-6);
}

.compact .inner {
  height: var(--dds-site-header-height-sm);
}

// ─── Themes ───────────────────────────────────────────────────────────────────

.theme-light {
  background-color: var(--dds-color-bg-card);
  color: var(--dds-color-text-default);
}

.theme-dark {
  background-color: var(--dds-color-bg-inverse);
  color: var(--dds-color-text-inverse);
  border-bottom-color: oklch(from var(--dds-color-border-default) l c h / 0.2);
}

.theme-brand {
  background-color: var(--dds-color-action-primary);
  color: var(--dds-color-action-primary-foreground);
  border-bottom-color: oklch(from var(--dds-color-action-primary) l c h / 0.8);
}

// ─── Transparent variant ──────────────────────────────────────────────────────

.variant-transparent {
  background-color: transparent;
  border-bottom-color: transparent;
}

.variant-transparent.scrolled {
  background-color: var(--dds-color-bg-card);
  border-bottom-color: var(--dds-color-border-default);
  box-shadow: var(--dds-shadow-xs);
}

// ─── Brand ────────────────────────────────────────────────────────────────────

.brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;
  color: inherit;
  gap: var(--dds-space-2);

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

.nav {
  flex: 1 1 0;
  min-width: 0;
}

.navHidden {
  display: none;
}

.navList {
  display: flex;
  align-items: center;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navItem {
  list-style: none;
}

// ─── Nav link ─────────────────────────────────────────────────────────────────

.navLink {
  display: inline-flex;
  align-items: center;
  gap: var(--dds-space-1);
  height: var(--dds-site-header-height);
  padding: 0 var(--dds-space-3);
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-medium);
  color: inherit;
  text-decoration: none;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition:
    color var(--dds-duration-fast) var(--dds-ease-standard),
    border-color var(--dds-duration-fast) var(--dds-ease-standard),
    background-color var(--dds-duration-fast) var(--dds-ease-standard);

  &:hover {
    color: var(--dds-color-action-primary);
    .theme-dark &,
    .theme-brand & {
      color: var(--dds-color-action-primary-foreground);
      opacity: 0.85;
    }
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: -2px;
  }
}

// Active state
.navLinkActive {
  color: var(--dds-color-action-primary);

  .theme-dark &,
  .theme-brand & {
    color: inherit;
    opacity: 1;
    font-weight: var(--dds-font-weight-semibold);
  }
}

// Underline variant — bottom border indicator
.navLinkUnderline.navLinkActive {
  border-bottom-color: var(--dds-color-action-primary);

  .theme-dark &,
  .theme-brand & {
    border-bottom-color: currentColor;
  }
}

// Flyout trigger chevron
.navLinkChevron {
  width: var(--dds-icon-size-sm);
  height: var(--dds-icon-size-sm);
  transition: transform var(--dds-duration-fast) var(--dds-ease-standard);

  [aria-expanded='true'] > & {
    transform: rotate(180deg);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────────

.actions {
  display: flex;
  align-items: center;
  gap: var(--dds-space-2);
  margin-left: auto;
  flex-shrink: 0;
}

// ─── Search ───────────────────────────────────────────────────────────────────

.search {
  display: flex;
  align-items: center;
}

.searchToggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--dds-color-text-muted);
  border-radius: var(--dds-radius-none);

  &:hover {
    color: var(--dds-color-text-default);
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

.searchIcon {
  width: var(--dds-icon-size-md);
  height: var(--dds-icon-size-md);
}

.searchExpanded {
  width: 240px;
  transition: width var(--dds-duration-normal) var(--dds-ease-out);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.searchInput {
  width: 100%;
}

// ─── User menu ────────────────────────────────────────────────────────────────

.userMenuTrigger {
  display: flex;
  align-items: center;
  gap: var(--dds-space-1-5);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--dds-space-1);
  border-radius: var(--dds-radius-none);

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

.userMenuChevron {
  width: var(--dds-icon-size-sm);
  height: var(--dds-icon-size-sm);
  color: var(--dds-color-text-muted);
}

.userMenuHeader {
  padding: var(--dds-space-2-5) var(--dds-space-3);
}

.userMenuName {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-default);
  margin: 0;
}

.userMenuEmail {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-text-muted);
  margin: 0;
}

// ─── Sub-nav ──────────────────────────────────────────────────────────────────

.subNav {
  border-bottom: 1px solid var(--dds-color-border-default);
  background-color: var(--dds-color-bg-subtle);
}

.subNavInner {
  display: flex;
  align-items: center;
  gap: var(--dds-space-1);
  height: 40px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--dds-space-6);
}

// ─── Mobile trigger ───────────────────────────────────────────────────────────

.mobileTrigger {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: 1px solid var(--dds-color-border-default);
  color: var(--dds-color-text-default);
  cursor: pointer;
  margin-left: auto;

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }

  // Show on mobile
  @media (max-width: 1024px) {
    display: flex;
  }
}

.mobileTriggerIcon {
  width: var(--dds-icon-size-md);
  height: var(--dds-icon-size-md);
}

// ─── Mobile nav hidden on desktop ─────────────────────────────────────────────

.nav,
.actions {
  @media (max-width: 1024px) {
    display: none;
  }
}

// ─── Mobile overlay ───────────────────────────────────────────────────────────

.mobileOverlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background-color: oklch(from var(--dds-color-bg-default) l c h / 0.6);

  &[data-state='open'] {
    animation: overlayIn var(--dds-duration-fast) var(--dds-ease-out);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

@keyframes overlayIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.mobileContent {
  position: fixed;
  inset: 0;
  z-index: 61;
  background-color: var(--dds-color-bg-card);
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  &[data-state='open'] {
    animation: mobileMenuIn var(--dds-duration-normal) var(--dds-ease-out);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

@keyframes mobileMenuIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ─── Screen reader only ───────────────────────────────────────────────────────

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Accessibility

### Landmark structure

- `<header aria-label="Site navigation">` — site header landmark.
- `<nav aria-label="Main navigation">` — primary nav landmark.
- `<nav aria-label="Secondary navigation">` — sub-nav landmark (when present).
- Two nav elements have distinct `aria-labels`.
- Mobile overlay: `role="dialog"` + `aria-label="Navigation menu"` (Radix Dialog).

### Nav links

- `<a>` for links, `<button>` for flyout triggers — never `<div onClick>`.
- Active: `aria-current="page"`.
- External: `target="_blank"` + `rel` + sr-only "(opens in new tab)".
- Flyout trigger: `aria-haspopup="true"` + `aria-expanded` (from FlyoutMenu).
- Chevron: `aria-hidden="true"`.

### Dark / brand themes

- White text on dark/brand backgrounds must meet WCAG AA 4.5:1 for body text, 3:1 for large/UI. Verify all text tokens against their theme backgrounds using oklch values from `tokens.css`.
- Focus ring is visible on all three themes — the `oklch(…/ 0.5)` opacity ring must pass 3:1 against both light and dark backgrounds. If it doesn't pass on dark/brand themes, adjust to a white ring: `outline-color: white` with appropriate opacity.

### Search

- Collapsed: `aria-label="Open search"`, `aria-expanded="false"`.
- Expanded: Input with `aria-label` matching placeholder.
- Escape collapses search and returns focus to toggle button.

### User menu

- Avatar button: `aria-label="Account menu for [name]"`, `aria-haspopup="menu"`.
- Dropdown managed by Radix DropdownMenu — ARIA handled automatically.

### Mobile hamburger

- `aria-label` toggles: "Open navigation menu" / "Close navigation menu".
- `aria-expanded` reflects overlay state.
- `aria-controls="site-header-mobile-menu"`.
- Focus trap in overlay: Radix Dialog handles this.
- Focus returns to hamburger after overlay closes: Radix Dialog handles this.

### Keyboard interactions

| Element        | Key             | Behaviour                                  |
| -------------- | --------------- | ------------------------------------------ |
| Brand link     | `Enter`         | Navigates to home                          |
| Nav link       | `Tab`           | Standard tab order                         |
| Nav link       | `Enter`         | Navigates to href                          |
| Flyout trigger | `Tab`/focus     | Opens flyout                               |
| Flyout trigger | `Enter`/`Space` | Toggles flyout                             |
| Inside flyout  | `Tab`           | Cycles through flyout links                |
| Inside flyout  | `Escape`        | Closes flyout, returns focus to trigger    |
| Search toggle  | `Enter`/`Space` | Expands search input                       |
| Search input   | `Escape`        | Collapses search                           |
| Hamburger      | `Enter`/`Space` | Opens mobile overlay                       |
| Mobile overlay | `Escape`        | Closes overlay, returns focus to hamburger |

---

## TDD — write ALL tests before implementing

```
describe('SiteHeader — rendering')
  - renders <header> element
  - header has aria-label="Site navigation" (default)
  - custom aria-label renders
  - renders SiteHeaderBrand as <a>
  - renders SiteHeaderNav with aria-label="Main navigation"
  - renders SiteHeaderNavItem as <a> with href
  - renders SiteHeaderActions
  - renders SiteHeaderMobileTrigger button
  - SiteHeaderSubNav has aria-label="Secondary navigation"

describe('SiteHeader — themes')
  - applies theme-light class by default
  - applies theme-dark class when theme="dark"
  - applies theme-brand class when theme="brand"

describe('SiteHeader — variants')
  - applies variant-default class by default
  - applies variant-underline class
  - applies variant-transparent class
  - scrolled class added when window.scrollY > 8 with variant="transparent"

describe('SiteHeader — sticky')
  - applies sticky class when sticky={true}

describe('SiteHeader — nav links')
  - SiteHeaderNavItem has aria-current="page" when active=true
  - external link has target="_blank" and rel
  - external link has sr-only "(opens in new tab)"
  - navLinkActive class applied when active=true
  - navLinkUnderline class applied when variant="underline"

describe('SiteHeader — flyout nav item')
  - SiteHeaderNavFlyoutItem renders FlyoutMenu
  - trigger has aria-haspopup="true"
  - trigger chevron has aria-hidden
  - flyout opens on trigger focus
  - flyout closes on Escape

describe('SiteHeader — search')
  - search toggle renders with aria-label="Open search"
  - clicking toggle shows search input
  - search input has aria-label
  - Escape collapses search

describe('SiteHeader — user menu')
  - renders Avatar + dropdown trigger
  - trigger has aria-label including name
  - trigger has aria-haspopup="menu"
  - clicking trigger opens dropdown
  - user name and email render in dropdown header

describe('SiteHeader — mobile')
  - mobileTrigger hidden above mobileBreakpoint (CSS)
  - nav and actions hidden below mobileBreakpoint (CSS)
  - hamburger has correct aria-label when closed
  - hamburger has correct aria-label when open
  - hamburger has aria-expanded
  - hamburger has aria-controls matching overlay id
  - clicking hamburger opens mobile overlay
  - mobile overlay has role="dialog"
  - mobile overlay has aria-label="Navigation menu"
  - Escape closes overlay
  - focus returns to hamburger after overlay closes

describe('axe')
  - axe: default light header
  - axe: theme="dark"
  - axe: theme="brand"
  - axe: variant="underline" with active link
  - axe: variant="transparent"
  - axe: sticky={true}
  - axe: with flyout open
  - axe: with search expanded
  - axe: with user menu open
  - axe: with sub-nav
  - axe: mobile overlay open
  - axe: compact={true}
```

---

## Stories — `SiteHeader.stories.tsx`

Title: `App Patterns/SiteHeader`

All stories render the SiteHeader at the top of a full-width canvas (`parameters.layout = 'fullscreen'`).

Named exports required (matching all design reference variants):

- `WithFlyout` — light theme, 4 nav items (2 plain, 2 with flyout using `FlyoutMenu` `layout="list"`), Sign In + Get Started buttons. Matches header Image 2 variant 1.
- `UnderlineNav` — `variant="underline"`, one active link. Matches Image 2 variant 2.
- `BrandBackground` — `theme="brand"`. White text on primary colour bg. Matches Image 2 variant 3.
- `WithMegaMenu` — flyout using `layout="four-col"` (4 columns, CTA bar). Matches Image 2 variant 4.
- `Dark` — `theme="dark"`. White nav links. Matches Image 2 variant 5.
- `WithActionButton` — one primary CTA button in actions. Matches Image 2 variant 6.
- `WithFlyoutDark` — `theme="dark"` + flyout open. Matches Image 2 variant 7.
- `WithFlyoutAndCTA` — light + flyout open + highlighted CTA button. Matches Image 2 variant 8.
- `WithSubNav` — main header + `SiteHeaderSubNav` below it with secondary links. Matches Image 2 variant 9.
- `WithUserMenu` — `SiteHeaderUserMenu` with name, email, avatar, dropdown items (Profile, Settings, Sign Out). Matches Image 2 variant 10.
- `WithSearch` — `SiteHeaderSearch` in actions. Matches Image 2 variant 11.
- `Transparent` — `variant="transparent"` over a coloured div. Shows scroll-to-opaque behaviour.
- `Compact` — `compact={true}`.
- `MobileOpen` — force `mobileBreakpoint={9999}` to show hamburger. `play()` clicks hamburger to open overlay.
- `FullFeatured` — combines: flyout nav, search, user menu, Sign In button, sub-nav. Closest to a real production header.

`FlyoutKeyboard` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: /products/i });
  trigger.focus();
  await expect(within(document.body).getByRole('dialog')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
  await expect(trigger).toHaveFocus();
};
```

`MobileMenuOpen` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const hamburger = within(canvasElement).getByRole('button', { name: /open navigation/i });
  await userEvent.click(hamburger);
  const overlay = within(document.body).getByRole('dialog', { name: /navigation menu/i });
  await expect(overlay).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect(overlay).not.toBeInTheDocument();
  await expect(hamburger).toHaveFocus();
};
```

Use `autodocs`. Storybook group: `App Patterns/SiteHeader`.

---

## Definition of done

- [ ] `FlyoutMenu` implemented and verified before starting SiteHeader
- [ ] Token additions verified in `tokens.css`
- [ ] All Vitest tests pass
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all themes, variants, and states
- [ ] Storybook builds without error
- [ ] `<header aria-label="…">` wraps everything — unique landmark
- [ ] Two `<nav>` elements have distinct `aria-labels`
- [ ] Active links: `aria-current="page"`
- [ ] External links: `rel="noopener noreferrer"` + sr-only "(opens in new tab)"
- [ ] Flyout triggers: `aria-haspopup="true"` + `aria-expanded` (from FlyoutMenu)
- [ ] Chevrons: `aria-hidden="true"`
- [ ] Dark/brand theme text contrast verified against WCAG AA
- [ ] Focus ring visible on all three themes
- [ ] Search Escape collapses input
- [ ] User menu trigger: `aria-label` includes name
- [ ] Mobile hamburger: `aria-expanded` + `aria-controls` + focus return
- [ ] Mobile overlay: `role="dialog"` + focus trap + Escape closes
- [ ] Transparent variant: scroll listener adds `.scrolled` class
- [ ] All 15 story variants render correctly
- [ ] `border-radius: var(--dds-radius-none)` everywhere
- [ ] No Tailwind. No hardcoded colour or spacing values in SCSS.
- [ ] Both components exported from `packages/components/src/index.ts`

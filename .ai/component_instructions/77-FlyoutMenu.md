# FlyoutMenu · node scaffolding.mjs FlyoutMenu

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/Button/
packages/components/src/components/Badge/
packages/components/src/components/
```

- Use `Button` for CTA actions inside flyout panels.
- Use `Badge`/`Tag` if available for item badges.
- Radix primitive: `@radix-ui/react-popover` — FlyoutMenu is a non-modal popover panel triggered by hover or click on a nav link. Do NOT use `@radix-ui/react-dropdown-menu` — that is for action menus. This is a navigation flyout, semantically different.
- FlyoutMenu is consumed by `SiteHeader` — but is also a standalone export so consumers can compose it into any navigation context.

---

## Scaffold location

```
packages/components/src/components/FlyoutMenu/
  FlyoutMenu.tsx
  FlyoutMenu.module.scss
  FlyoutMenu.test.tsx
  FlyoutMenu.stories.tsx
  index.ts
```

---

## Purpose

`FlyoutMenu` is a horizontally-wide navigation panel that drops below a trigger link in a site header. It presents rich navigation content — icon+label+description link groups, featured cards, CTAs — in a variety of layout configurations.

**FlyoutMenu vs Dropdown:** A `Dropdown` contains action items (things to do). A `FlyoutMenu` contains navigation destinations (places to go). Semantically: Dropdown uses `role="menu"` + `role="menuitem"`. FlyoutMenu uses `role="navigation"` or `role="group"` with standard `<a>` links.

**FlyoutMenu vs MegaMenu (MarketingNav):** FlyoutMenu is the standalone primitive. `SiteHeader`/`MarketingNav` composes it.

---

## Exports from `index.ts`

```ts
export {
  FlyoutMenu,
  FlyoutMenuTrigger,
  FlyoutMenuContent,
  FlyoutMenuGroup,
  FlyoutMenuGroupLabel,
  FlyoutMenuLink,
  FlyoutMenuFeaturedCard,
  FlyoutMenuFeaturedHighlight,
  FlyoutMenuCTABar,
  FlyoutMenuFooter,
};
export type {
  FlyoutMenuProps,
  FlyoutMenuContentProps,
  FlyoutMenuLinkProps,
  FlyoutMenuFeaturedCardProps,
  FlyoutMenuFeaturedHighlightProps,
  FlyoutMenuCTABarProps,
  FlyoutMenuLayout,
};
```

---

## Types

```ts
type FlyoutMenuLayout =
  | 'list' // single column — icon + label + description links
  | 'two-col' // two-column link grid
  | 'four-col' // four equal columns (flat/wide)
  | 'list-featured' // left: link list, right: featured card(s) or highlight
  | 'simple'; // plain links, no icons, no descriptions

export interface FlyoutMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openOnHover?: boolean; // default: true — opens on trigger hover/focus
  closeOnClickOutside?: boolean; // default: true
  children: React.ReactNode;
}

export interface FlyoutMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: FlyoutMenuLayout; // default: 'list'
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; // default: 'md'
  align?: 'start' | 'center' | 'end'; // default: 'start' — aligns panel to trigger
  sideOffset?: number; // default: 8
  label?: string; // aria-label for the navigation region
  className?: string;
  children: React.ReactNode;
}

export interface FlyoutMenuLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: LucideIcon;
  label: string;
  description?: string;
  badge?: string;
  active?: boolean; // aria-current="page"
  external?: boolean;
  className?: string;
}

export interface FlyoutMenuFeaturedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  href: string;
  image: string; // img src
  imageAlt: string;
  title: string;
  subtitle?: string; // date, category, etc.
  description?: string;
  className?: string;
}

export interface FlyoutMenuFeaturedHighlightProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string; // CTA link text, e.g. "Learn More →"
  image?: string;
  imageAlt?: string;
  className?: string;
}

export interface FlyoutMenuCTABarProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end' | 'between'; // default: 'start'
  className?: string;
  children: React.ReactNode; // Button components
}
```

---

## Architecture

```
FlyoutMenu                           Radix Popover.Root
  ├── FlyoutMenuTrigger              Radix Popover.Trigger (asChild — wraps nav link/button)
  └── FlyoutMenuContent              Radix Popover.Content (portal, the panel)
        ├── FlyoutMenuGroup          <div role="group" aria-labelledby>  (optional grouping)
        │     ├── FlyoutMenuGroupLabel  <p id="...">  (group heading)
        │     └── FlyoutMenuLink ×N  <a> or <li><a>
        ├── FlyoutMenuFeaturedCard   <a> card with image
        ├── FlyoutMenuFeaturedHighlight  highlight box
        ├── FlyoutMenuCTABar         action button row
        └── FlyoutMenuFooter         bottom link row
```

### Hover + focus open behaviour

`openOnHover={true}` (default): the flyout opens on `mouseenter` of the trigger and on `focus` (keyboard). It closes on `mouseleave` of either the trigger or the content panel, after a short delay. Uses the same `dragCounter`-style delay pattern to prevent flicker:

```tsx
const hoverDelay = React.useRef<ReturnType<typeof setTimeout>>();

const handleTriggerMouseEnter = () => {
  clearTimeout(hoverDelay.current);
  setOpen(true);
};
const handleMouseLeave = () => {
  hoverDelay.current = setTimeout(() => setOpen(false), 150);
};
const handleContentMouseEnter = () => {
  clearTimeout(hoverDelay.current);
};
```

Focus open: when trigger receives focus via keyboard (`onFocus`), open immediately. When focus leaves the entire flyout (Radix `onFocusOutside`), close.

Escape: always closes, returns focus to trigger (Radix handles this).

### Layout variants

**`list`** — single column, up to ~6 links with icon + label + description. Width: `md` (400px). Seen in Image 1 variant 1 and variant 6.

**`two-col`** — two-column grid of links. Each link: icon + label + description. Width: `lg` (560px). Seen in Image 1 variant 5.

**`four-col`** — four equal columns. Each column: icon + label + description. Full width. CTA bar at bottom. Width: `xl` (800px). Seen in Image 1 variant 4.

**`list-featured`** — left: link list, right: featured content (cards or highlight box). Width: `xl`. Seen in Image 1 variants 2 and 3.

**`simple`** — plain `<a>` links only, no icons, no descriptions. Compact. Width: `sm` (280px). Seen in Image 1 variant 6.

---

## Component structure

```tsx
// FlyoutMenu.tsx
import * as RadixPopover from '@radix-ui/react-popover';
import clsx from 'clsx';
import styles from './FlyoutMenu.module.scss';

// Width map — CSS custom property exception (dynamic layout values)
const widthMap = {
  sm: '280px',
  md: '400px',
  lg: '560px',
  xl: '800px',
  full: '100vw',
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export const FlyoutMenu = ({
  open,
  defaultOpen,
  onOpenChange,
  openOnHover = true,
  children,
}: FlyoutMenuProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const hoverDelay = React.useRef<ReturnType<typeof setTimeout>>();

  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  const hoverHandlers = openOnHover
    ? {
        onMouseEnter: () => {
          clearTimeout(hoverDelay.current);
          setOpen(true);
        },
        onMouseLeave: () => {
          hoverDelay.current = setTimeout(() => setOpen(false), 150);
        },
      }
    : {};

  return (
    <RadixPopover.Root open={isOpen} onOpenChange={setOpen}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        if ((child.type as any).displayName === 'FlyoutMenuTrigger') {
          return React.cloneElement(child as React.ReactElement<any>, {
            _hoverHandlers: hoverHandlers,
            _onFocus: () => setOpen(true),
          });
        }
        if ((child.type as any).displayName === 'FlyoutMenuContent') {
          return React.cloneElement(child as React.ReactElement<any>, {
            _hoverHandlers: {
              onMouseEnter: () => clearTimeout(hoverDelay.current),
              onMouseLeave: hoverHandlers.onMouseLeave,
            },
          });
        }
        return child;
      })}
    </RadixPopover.Root>
  );
};
FlyoutMenu.displayName = 'FlyoutMenu';

// ─── Trigger ─────────────────────────────────────────────────────────────────

export const FlyoutMenuTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & {
    _hoverHandlers?: Record<string, React.EventHandler<any>>;
    _onFocus?: () => void;
  }
>(({ children, _hoverHandlers, _onFocus, ...props }, ref) => (
  <RadixPopover.Trigger asChild ref={ref}>
    {React.cloneElement(children as React.ReactElement, {
      ..._hoverHandlers,
      onFocus: _onFocus,
      'aria-haspopup': 'true',
    })}
  </RadixPopover.Trigger>
));
FlyoutMenuTrigger.displayName = 'FlyoutMenuTrigger';

// ─── Content ─────────────────────────────────────────────────────────────────

export const FlyoutMenuContent = React.forwardRef<
  HTMLDivElement,
  FlyoutMenuContentProps & {
    _hoverHandlers?: Record<string, React.EventHandler<any>>;
  }
>(
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
      ...props
    },
    ref
  ) => (
    <RadixPopover.Portal>
      <RadixPopover.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        onFocusOutside={() => {
          /* Radix closes automatically */
        }}
        className={clsx(styles.content, styles[`layout-${layout}`], className)}
        style={{ '--flyout-width': widthMap[width] } as React.CSSProperties}
        aria-label={label}
        {..._hoverHandlers}
        {...props}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  )
);
FlyoutMenuContent.displayName = 'FlyoutMenuContent';

// ─── Group ────────────────────────────────────────────────────────────────────

export const FlyoutMenuGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={clsx(styles.group, className)} role="group" {...props}>
    {children}
  </div>
));
FlyoutMenuGroup.displayName = 'FlyoutMenuGroup';

// ─── Group label ─────────────────────────────────────────────────────────────

export const FlyoutMenuGroupLabel = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p ref={ref} className={clsx(styles.groupLabel, className)} {...props}>
    {children}
  </p>
));
FlyoutMenuGroupLabel.displayName = 'FlyoutMenuGroupLabel';

// ─── Link ────────────────────────────────────────────────────────────────────

export const FlyoutMenuLink = React.forwardRef<HTMLAnchorElement, FlyoutMenuLinkProps>(
  ({ icon: Icon, label, description, badge, active, external, className, href, ...props }, ref) => (
    <a
      ref={ref}
      href={href}
      className={clsx(styles.link, active && styles.linkActive, className)}
      aria-current={active ? 'page' : undefined}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {Icon && (
        <span className={styles.linkIconWrapper} aria-hidden="true">
          <Icon className={styles.linkIcon} />
        </span>
      )}
      <span className={styles.linkText}>
        <span className={styles.linkLabel}>
          {label}
          {badge && <span className={styles.linkBadge}>{badge}</span>}
          {external && <span className={styles.srOnly}> (opens in new tab)</span>}
        </span>
        {description && <span className={styles.linkDescription}>{description}</span>}
      </span>
    </a>
  )
);
FlyoutMenuLink.displayName = 'FlyoutMenuLink';

// ─── Featured card ────────────────────────────────────────────────────────────

export const FlyoutMenuFeaturedCard = React.forwardRef<
  HTMLAnchorElement,
  FlyoutMenuFeaturedCardProps
>(({ href, image, imageAlt, title, subtitle, description, className, ...props }, ref) => (
  <a ref={ref} href={href} className={clsx(styles.featuredCard, className)} {...props}>
    <div className={styles.featuredCardImage}>
      <img src={image} alt={imageAlt} className={styles.featuredCardImg} />
    </div>
    <div className={styles.featuredCardBody}>
      {subtitle && <span className={styles.featuredCardSubtitle}>{subtitle}</span>}
      <span className={styles.featuredCardTitle}>{title}</span>
      {description && <span className={styles.featuredCardDescription}>{description}</span>}
    </div>
  </a>
));
FlyoutMenuFeaturedCard.displayName = 'FlyoutMenuFeaturedCard';

// ─── Featured highlight ───────────────────────────────────────────────────────

export const FlyoutMenuFeaturedHighlight = React.forwardRef<
  HTMLDivElement,
  FlyoutMenuFeaturedHighlightProps
>(({ title, description, href, linkLabel, image, imageAlt, className, ...props }, ref) => (
  <div ref={ref} className={clsx(styles.featuredHighlight, className)} {...props}>
    {image && <img src={image} alt={imageAlt ?? ''} className={styles.featuredHighlightImage} />}
    <div className={styles.featuredHighlightBody}>
      <p className={styles.featuredHighlightTitle}>{title}</p>
      {description && <p className={styles.featuredHighlightDescription}>{description}</p>}
      {href && linkLabel && (
        <a href={href} className={styles.featuredHighlightLink}>
          {linkLabel}
        </a>
      )}
    </div>
  </div>
));
FlyoutMenuFeaturedHighlight.displayName = 'FlyoutMenuFeaturedHighlight';

// ─── CTA bar ──────────────────────────────────────────────────────────────────

export const FlyoutMenuCTABar = React.forwardRef<HTMLDivElement, FlyoutMenuCTABarProps>(
  ({ align = 'start', className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.ctaBar, styles[`ctaBar-${align}`], className)} {...props}>
      {children}
    </div>
  )
);
FlyoutMenuCTABar.displayName = 'FlyoutMenuCTABar';

// ─── Footer ───────────────────────────────────────────────────────────────────

export const FlyoutMenuFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={clsx(styles.footer, className)} {...props}>
    {children}
  </div>
));
FlyoutMenuFooter.displayName = 'FlyoutMenuFooter';
```

---

## SCSS — FlyoutMenu.module.scss

```scss
@use '../../../styles/mixins' as *;

// ─── Panel ────────────────────────────────────────────────────────────────────

.content {
  width: var(--flyout-width, 400px);
  max-width: calc(100vw - var(--dds-space-8));
  background-color: var(--dds-color-bg-popover);
  border: 1px solid var(--dds-color-border-default);
  box-shadow: var(--dds-shadow-sm);
  z-index: 50;
  outline: none;

  &[data-state='open'] {
    animation: flyoutIn var(--dds-duration-fast) var(--dds-ease-out);
  }
  &[data-state='closed'] {
    animation: flyoutOut var(--dds-duration-fast) var(--dds-ease-standard);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

@keyframes flyoutIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes flyoutOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-6px);
  }
}

// ─── Layout variants ──────────────────────────────────────────────────────────

// list — single column
.layout-list {
  padding: var(--dds-space-3) 0;
  display: flex;
  flex-direction: column;
}

// two-col — two-column grid
.layout-two-col {
  padding: var(--dds-space-4);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dds-space-1);

  // Group labels and CTA bar span both columns
  .groupLabel,
  .ctaBar,
  .footer {
    grid-column: 1 / -1;
  }
}

// four-col — four equal columns
.layout-four-col {
  padding: var(--dds-space-5);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--dds-space-4);

  .ctaBar,
  .footer {
    grid-column: 1 / -1;
  }
}

// list-featured — left links, right featured content
.layout-list-featured {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0;

  // Left link column
  .group:first-child,
  .link:not(.featuredCard) {
    padding: var(--dds-space-3) 0;
  }

  // Right featured column
  .featuredColumn {
    background-color: var(--dds-color-bg-subtle);
    border-left: 1px solid var(--dds-color-border-default);
    padding: var(--dds-space-4);
    min-width: 280px;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    gap: var(--dds-space-3);
  }
}

// simple — plain links
.layout-simple {
  padding: var(--dds-space-2) 0;
  display: flex;
  flex-direction: column;
}

// ─── Group ────────────────────────────────────────────────────────────────────

.group {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.groupLabel {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--dds-tracking-wider);
  padding: var(--dds-space-2) var(--dds-space-4) var(--dds-space-1);
  margin: 0;
}

// ─── Link ────────────────────────────────────────────────────────────────────

.link {
  display: flex;
  align-items: flex-start;
  gap: var(--dds-space-3);
  padding: var(--dds-space-2-5) var(--dds-space-4);
  text-decoration: none;
  color: var(--dds-color-text-default);
  transition: background-color var(--dds-duration-fast) var(--dds-ease-standard);

  &:hover {
    background-color: var(--dds-color-bg-card-hover);
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: -3px;
  }
}

.linkActive {
  background-color: oklch(from var(--dds-color-action-primary) l c h / 0.06);

  .linkLabel {
    color: var(--dds-color-action-primary);
  }
}

// Icon wrapper — fixed size box so icons of different sizes align
.linkIconWrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  background-color: var(--dds-color-bg-subtle);

  .link:hover & {
    background-color: oklch(from var(--dds-color-action-primary) l c h / 0.1);
  }
  .linkActive & {
    background-color: oklch(from var(--dds-color-action-primary) l c h / 0.1);
  }
}

.linkIcon {
  width: var(--dds-icon-size-md);
  height: var(--dds-icon-size-md);
  color: var(--dds-color-action-primary);
}

.linkText {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-0-5);
  min-width: 0;
}

.linkLabel {
  display: flex;
  align-items: center;
  gap: var(--dds-space-1-5);
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-medium);
  color: var(--dds-color-text-default);
  line-height: var(--dds-line-height-snug);
}

.linkDescription {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-text-muted);
  line-height: var(--dds-line-height-normal);
}

// Simple layout — plainer link styling
.layout-simple .link {
  padding: var(--dds-space-2) var(--dds-space-4);
  align-items: center;
}

.layout-simple .linkLabel {
  font-weight: var(--dds-font-weight-normal);
}

// ─── Link badge ───────────────────────────────────────────────────────────────

.linkBadge {
  display: inline-flex;
  align-items: center;
  padding: 0 var(--dds-space-1-5);
  height: 18px;
  background-color: oklch(from var(--dds-color-action-primary) l c h / 0.12);
  color: var(--dds-color-action-primary);
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  font-weight: var(--dds-font-weight-semibold);
  border-radius: var(--dds-radius-full); // documented exception — pill badge
}

// ─── Featured card ────────────────────────────────────────────────────────────

.featuredCard {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-2);
  text-decoration: none;
  color: inherit;
  transition: background-color var(--dds-duration-fast) var(--dds-ease-standard);

  &:hover .featuredCardImage {
    opacity: 0.9;
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

.featuredCardImage {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: var(--dds-color-bg-subtle);
  transition: opacity var(--dds-duration-fast) var(--dds-ease-standard);
}

.featuredCardImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.featuredCardBody {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-0-5);
  padding: 0 var(--dds-space-1);
}

.featuredCardSubtitle {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--dds-tracking-wide);
}

.featuredCardTitle {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-default);
  line-height: var(--dds-line-height-snug);
}

.featuredCardDescription {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-text-muted);
  line-height: var(--dds-line-height-normal);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// ─── Featured highlight ───────────────────────────────────────────────────────

.featuredHighlight {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-3);
  padding: var(--dds-space-3);
  background-color: var(--dds-color-bg-subtle);
  border: 1px solid var(--dds-color-border-default);
}

.featuredHighlightImage {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

.featuredHighlightBody {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-1);
}

.featuredHighlightTitle {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-default);
  margin: 0;
  line-height: var(--dds-line-height-snug);
}

.featuredHighlightDescription {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-text-muted);
  margin: 0;
  line-height: var(--dds-line-height-normal);
}

.featuredHighlightLink {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-medium);
  color: var(--dds-color-action-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  align-self: flex-start;

  &:hover {
    text-decoration: none;
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

// ─── CTA bar ──────────────────────────────────────────────────────────────────

.ctaBar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dds-space-2);
  padding: var(--dds-space-3) var(--dds-space-4);
  border-top: 1px solid var(--dds-color-border-default);
}

.ctaBar-start {
  justify-content: flex-start;
}
.ctaBar-center {
  justify-content: center;
}
.ctaBar-end {
  justify-content: flex-end;
}
.ctaBar-between {
  justify-content: space-between;
}

// ─── Footer ───────────────────────────────────────────────────────────────────

.footer {
  display: flex;
  align-items: center;
  gap: var(--dds-space-4);
  padding: var(--dds-space-2-5) var(--dds-space-4);
  border-top: 1px solid var(--dds-color-border-default);
  background-color: var(--dds-color-bg-subtle);
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

## CSS custom property exceptions (documented)

| Property         | Element    | Reason                                            |
| ---------------- | ---------- | ------------------------------------------------- |
| `--flyout-width` | `.content` | Dynamic per-width-variant value — no static token |

---

## Accessibility

- `FlyoutMenuContent` is a Radix Popover.Content — it renders as a `<div>` by default. Pass `aria-label` via the `label` prop to give it an accessible name as a navigation region.
- `FlyoutMenuLink` renders as `<a>` — correct semantic for navigation destinations.
- Active link: `aria-current="page"`.
- External links: `target="_blank"` + `rel="noopener noreferrer"` + visually-hidden "(opens in new tab)".
- Icons: `aria-hidden="true"` — decorative.
- Link badges: inline in label text — announced as part of the link text by screen readers.
- Hover open: also opens on keyboard `focus` — keyboard users who Tab to the trigger open the flyout.
- `Escape`: closes the flyout and returns focus to trigger (Radix handles this).
- Focus leaves the panel (Tab past last item): flyout closes via Radix `onFocusOutside`.
- `FlyoutMenuGroup` uses `role="group"` — groups related links without adding a navigation landmark.

### Keyboard interactions

| Element          | Key             | Behaviour                                               |
| ---------------- | --------------- | ------------------------------------------------------- |
| Trigger          | `Tab`/focus     | Opens flyout                                            |
| Trigger          | `Enter`/`Space` | Toggles flyout (if no href; if href, follows link)      |
| Flyout links     | `Tab`           | Cycles through all focusable items in flyout            |
| Flyout           | `Escape`        | Closes flyout, returns focus to trigger                 |
| Last flyout item | `Tab`           | Closes flyout (Radix onFocusOutside), moves to next nav |

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders trigger child
- does not render content when closed
- renders content when open (controlled)
- renders FlyoutMenuLink with label
- renders FlyoutMenuLink with icon (aria-hidden)
- renders FlyoutMenuLink with description
- renders FlyoutMenuLink with badge
- renders FlyoutMenuGroup with role="group"
- renders FlyoutMenuFeaturedCard with image and title
- renders FlyoutMenuFeaturedHighlight with title and description link
- renders FlyoutMenuCTABar with children
- renders FlyoutMenuFooter

// Layout classes
- layout-list class applied by default
- layout-two-col class applied
- layout-four-col class applied
- layout-list-featured class applied
- layout-simple class applied

// Open/close — hover
- opens after mouseenter on trigger
- closes after mouseleave from trigger (after delay)
- stays open when pointer moves from trigger to content
- closes after mouseleave from content
- opens on trigger focus (keyboard)
- closes on focus leaving content (onFocusOutside)
- closes on Escape

// Controlled
- controlled open prop renders content
- onOpenChange called on open/close

// Links
- FlyoutMenuLink renders as <a>
- active link has aria-current="page"
- external link has target="_blank" and rel="noopener noreferrer"
- external link has sr-only "(opens in new tab)" text
- link icon is aria-hidden
- aria-label on content when label prop provided
- trigger has aria-haspopup="true"

// axe
- axe: closed state
- axe: layout="list" open
- axe: layout="two-col" open
- axe: layout="four-col" open
- axe: layout="list-featured" open with featured card
- axe: layout="list-featured" open with featured highlight
- axe: layout="simple" open
- axe: with active link
- axe: with external link
- axe: with CTA bar
- axe: with footer
- axe: with badge
```

---

## Stories — `FlyoutMenu.stories.tsx`

Title: `Core Components/FlyoutMenu`

All stories render the trigger inline in the story canvas with room below for the panel to expand. Use `parameters.layout = 'padded'`.

Named exports required (matching all variants from the design reference):

- `ListWithCTAs` — `layout="list"`, 5 links (all with icon + description), `FlyoutMenuCTABar` with two `Button` components ("Watch More" secondary, "Contact Sales" primary). Matches Image 1 variant 1.
- `TwoColWithFeaturedCards` — `layout="list-featured"`, left: 5 icon links, right: 2 `FlyoutMenuFeaturedCard` items (use placeholder images). Matches Image 1 variant 2.
- `ListWithFeaturedHighlight` — `layout="list-featured"`, left: 3 icon links with descriptions, right: `FlyoutMenuFeaturedHighlight` with image + title + description + "Learn More →" link + `FlyoutMenuFooter` with a text link. Matches Image 1 variant 3.
- `FourColumn` — `layout="four-col"`, 4 groups of 1 link each (icon + label + description), `FlyoutMenuCTABar` with 3 buttons. Matches Image 1 variant 4.
- `TwoColWithBadge` — `layout="two-col"`, 6 links (icon + label + description), one link has a `badge="New"`. `FlyoutMenuFooter` with a text link. Matches Image 1 variant 5.
- `SimpleList` — `layout="simple"`, 5 plain text links, no icons, no descriptions. Matches Image 1 variant 6.
- `WithActiveLink` — `layout="list"`, one link marked `active={true}`.
- `ClickToOpen` — `openOnHover={false}` — trigger must be clicked, not hovered.
- `Controlled` — open state managed via `useState`, external toggle button.

`HoverOpen` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: /products/i });
  await userEvent.hover(trigger);
  const panel = within(document.body).getByRole('dialog'); // Radix Popover.Content
  await expect(panel).toBeVisible();
  await userEvent.unhover(trigger);
};
```

`KeyboardOpen` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: /products/i });
  trigger.focus();
  await expect(within(document.body).getByRole('dialog')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
};
```

Use `autodocs`. Storybook group: `Core Components/FlyoutMenu`.

---

## Definition of done

- [ ] All Vitest tests pass
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all layouts
- [ ] Storybook builds without error
- [ ] All 6 layout variants render correctly matching design reference
- [ ] Hover opens flyout; pointer moving to panel keeps it open (no flicker)
- [ ] Keyboard focus on trigger opens flyout
- [ ] Escape closes flyout and returns focus to trigger
- [ ] Tab past last item closes flyout
- [ ] `FlyoutMenuLink` always renders as `<a>` — never `<button>`
- [ ] External links: `target="_blank"` + `rel` + sr-only text
- [ ] Active link: `aria-current="page"`
- [ ] Icons are `aria-hidden`
- [ ] `--flyout-width` is the only inline custom property
- [ ] `border-radius: var(--dds-radius-none)` everywhere — badge the only exception
- [ ] No Tailwind. No hardcoded colour or spacing values in SCSS.
- [ ] Exported from `packages/components/src/index.ts`

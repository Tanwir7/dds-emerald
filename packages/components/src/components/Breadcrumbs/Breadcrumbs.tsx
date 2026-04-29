import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import React from 'react';
import styles from './Breadcrumbs.module.scss';

type BreadcrumbsSize = 'sm' | 'md';

type BreadcrumbsContextValue = {
  size: BreadcrumbsSize;
};

const BreadcrumbsContext = React.createContext<BreadcrumbsContextValue>({
  size: 'md',
});

const DefaultSeparator = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    width="12"
    height="12"
  >
    <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface BreadcrumbsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  separator?: React.ReactNode;
  maxItems?: number;
  size?: BreadcrumbsSize;
  className?: string;
  children: React.ReactNode;
}

export interface BreadcrumbItemProps extends Omit<
  React.LiHTMLAttributes<HTMLLIElement>,
  'children'
> {
  href?: string;
  asChild?: boolean;
  isCurrent?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface BreadcrumbSeparatorProps extends Omit<
  React.LiHTMLAttributes<HTMLLIElement>,
  'children'
> {
  className?: string;
  children?: React.ReactNode;
}

type BreadcrumbElement = React.ReactElement<BreadcrumbItemProps, typeof BreadcrumbItem>;

const isBreadcrumbItemElement = (child: React.ReactNode): child is BreadcrumbElement =>
  React.isValidElement(child) && child.type === BreadcrumbItem;

const renderSeparator = (separator: React.ReactNode, key: React.Key) => (
  <BreadcrumbSeparator key={key}>{separator}</BreadcrumbSeparator>
);

export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  (
    { separator = <DefaultSeparator />, maxItems, size = 'md', className, children, ...props },
    ref
  ) => {
    const [expanded, setExpanded] = React.useState(false);

    const items = React.Children.toArray(children).filter(isBreadcrumbItemElement);
    const lastItemIndex = items.length - 1;
    const clampedMaxItems = maxItems === undefined ? undefined : Math.max(3, maxItems);
    const shouldTruncate =
      !expanded && clampedMaxItems !== undefined && items.length > clampedMaxItems;

    const visibleEntries: Array<
      { type: 'item'; element: BreadcrumbElement; originalIndex: number } | { type: 'ellipsis' }
    > = shouldTruncate
      ? [
          { type: 'item', element: items[0]!, originalIndex: 0 },
          { type: 'ellipsis' },
          ...items.slice(-2).map((element, offset) => ({
            type: 'item' as const,
            element,
            originalIndex: items.length - 2 + offset,
          })),
        ]
      : items.map((element, index) => ({
          type: 'item' as const,
          element,
          originalIndex: index,
        }));

    return (
      <BreadcrumbsContext.Provider value={{ size }}>
        <nav
          aria-label="Breadcrumb"
          className={clsx(styles.root, className)}
          ref={ref as React.ForwardedRef<HTMLElement>}
          {...props}
        >
          <ol className={styles.list}>
            {visibleEntries.map((entry, visibleIndex) => {
              const isLastVisibleEntry = visibleIndex === visibleEntries.length - 1;

              if (entry.type === 'ellipsis') {
                return (
                  <React.Fragment key="ellipsis">
                    <li className={styles.item}>
                      <button
                        type="button"
                        className={clsx(styles.ellipsisBtn, styles[size])}
                        aria-label="Show full breadcrumb path"
                        onClick={() => setExpanded(true)}
                      >
                        …
                      </button>
                    </li>
                    {!isLastVisibleEntry ? renderSeparator(separator, 'ellipsis-separator') : null}
                  </React.Fragment>
                );
              }

              const { element, originalIndex } = entry;
              const resolvedIsCurrent = element.props.isCurrent ?? originalIndex === lastItemIndex;
              const itemKey = element.key ?? `item-${originalIndex}`;

              return (
                <React.Fragment key={itemKey}>
                  {React.cloneElement(element, {
                    isCurrent: resolvedIsCurrent,
                  })}
                  {!isLastVisibleEntry
                    ? renderSeparator(separator, `separator-${originalIndex}`)
                    : null}
                </React.Fragment>
              );
            })}
          </ol>
        </nav>
      </BreadcrumbsContext.Provider>
    );
  }
);

Breadcrumbs.displayName = 'Breadcrumbs';

export const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ href, asChild = false, isCurrent, className, children, ...props }, ref) => {
    const { size } = React.useContext(BreadcrumbsContext);
    const resolvedIsCurrent = isCurrent ?? !href;

    return (
      <li className={clsx(styles.item, styles[size], className)} ref={ref} {...props}>
        {resolvedIsCurrent ? (
          <span aria-current="page" className={clsx(styles.current, styles[size])}>
            {children}
          </span>
        ) : asChild ? (
          <Slot className={clsx(styles.link, styles[size])}>{children}</Slot>
        ) : (
          <a href={href} className={clsx(styles.link, styles[size])}>
            {children}
          </a>
        )}
      </li>
    );
  }
);

BreadcrumbItem.displayName = 'BreadcrumbItem';

export const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  ({ className, children, ...props }, ref) => (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={clsx(styles.separator, className)}
      {...props}
    >
      {children ?? <DefaultSeparator />}
    </li>
  )
);

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import clsx from 'clsx';
import styles from './Tabs.module.scss';

type TabsVariant = 'line' | 'pill';
type TabsSize = 'sm' | 'md';

type TabsContextValue = {
  variant: TabsVariant;
  size: TabsSize;
};

const TabsContext = React.createContext<TabsContextValue>({
  variant: 'line',
  size: 'md',
});

export interface TabsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'defaultValue'
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  orientation?: 'horizontal' | 'vertical';
  dir?: 'ltr' | 'rtl';
  className?: string;
  children: React.ReactNode;
}

export interface TabListProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> {
  className?: string;
  children: React.ReactNode;
}

export interface TabProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'className' | 'value'
> {
  value: string;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  endSlot?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

interface TabPanelsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> {
  className?: string;
  children: React.ReactNode;
}

export interface TabPanelProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> {
  value: string;
  forceMount?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantClassName: Record<TabsVariant, string> = {
  line: styles.line!,
  pill: styles.pill!,
};

const sizeClassName: Record<TabsSize, string> = {
  sm: styles.sm!,
  md: styles.md!,
};

const orientationClassName = {
  horizontal: styles.horizontal!,
  vertical: styles.vertical!,
} as const;

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      variant = 'line',
      size = 'md',
      orientation = 'horizontal',
      className,
      children,
      ...props
    },
    ref
  ) => (
    <TabsContext.Provider value={{ variant, size }}>
      <TabsPrimitive.Root
        ref={ref}
        className={clsx(
          styles.root,
          variantClassName[variant],
          sizeClassName[size],
          orientationClassName[orientation],
          className
        )}
        orientation={orientation}
        {...(value !== undefined ? { value } : {})}
        {...(defaultValue !== undefined ? { defaultValue } : {})}
        {...(onValueChange !== undefined ? { onValueChange } : {})}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    </TabsContext.Provider>
  )
);
Tabs.displayName = 'Tabs';

export const TabList = React.forwardRef<HTMLDivElement, TabListProps>(
  ({ className, children, ...props }, ref) => (
    <TabsPrimitive.List ref={ref} className={clsx(styles.list, className)} {...props}>
      {children}
    </TabsPrimitive.List>
  )
);
TabList.displayName = 'TabList';

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  ({ value, disabled, startIcon, endSlot, className, children, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      className={clsx(styles.tab, className)}
      {...(disabled !== undefined ? { disabled } : {})}
      {...props}
    >
      {startIcon ? <span className={styles.startIcon}>{startIcon}</span> : null}
      <span className={styles.label}>{children}</span>
      {endSlot ? <span className={styles.endSlot}>{endSlot}</span> : null}
    </TabsPrimitive.Trigger>
  )
);
Tab.displayName = 'Tab';

export const TabPanels = React.forwardRef<HTMLDivElement, TabPanelsProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.panels, className)} {...props}>
      {children}
    </div>
  )
);
TabPanels.displayName = 'TabPanels';

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(
  ({ value, forceMount, className, children, ...props }, ref) => {
    const { variant } = React.useContext(TabsContext);

    return (
      <TabsPrimitive.Content
        ref={ref}
        value={value}
        className={clsx(styles.panel, variant === 'pill' && styles.panelPill, className)}
        {...(forceMount ? { forceMount: true } : {})}
        {...props}
      >
        <div className={styles.panelInner}>{children}</div>
      </TabsPrimitive.Content>
    );
  }
);
TabPanel.displayName = 'TabPanel';

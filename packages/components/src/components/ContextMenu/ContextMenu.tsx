import * as RadixContextMenu from '@radix-ui/react-context-menu';
import clsx from 'clsx';
import { Check, ChevronRight, Minus, type LucideIcon } from 'lucide-react';
import React from 'react';
import styles from './ContextMenu.module.scss';

type MenuCollisionPadding = number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;

export interface ContextMenuProps {
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children: React.ReactNode;
}

interface ContextMenuTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  className?: string;
  disabled?: boolean;
  children: React.ReactElement;
}

export interface ContextMenuContentProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  alignOffset?: number;
  collisionPadding?: MenuCollisionPadding;
  loop?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface ContextMenuItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onSelect'
> {
  icon?: LucideIcon;
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  inset?: boolean;
  className?: string;
  children: React.ReactNode;
  onSelect?: (event: Event) => void;
}

export interface ContextMenuCheckboxItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onSelect'
> {
  checked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  shortcut?: string;
  inset?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface ContextMenuRadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export interface ContextMenuRadioItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onSelect'
> {
  value: string;
  disabled?: boolean;
  shortcut?: string;
  inset?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface ContextMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface ContextMenuSubProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export interface ContextMenuSubTriggerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  icon?: LucideIcon;
  inset?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface ContextMenuSubContentProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  sideOffset?: number;
  alignOffset?: number;
  collisionPadding?: MenuCollisionPadding;
  loop?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface ContextMenuItemIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  children?: React.ReactNode;
}

type ContextMenuRootContextValue = {
  setOpen: (open: boolean) => void;
};

const ContextMenuRootContext = React.createContext<ContextMenuRootContextValue | null>(null);

export const ContextMenu = ({ onOpenChange, modal = true, children }: ContextMenuProps) => {
  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      onOpenChange?.(nextOpen);
    },
    [onOpenChange]
  );

  return (
    <ContextMenuRootContext.Provider value={{ setOpen }}>
      <RadixContextMenu.Root onOpenChange={setOpen} modal={modal}>
        {children}
      </RadixContextMenu.Root>
    </ContextMenuRootContext.Provider>
  );
};

ContextMenu.displayName = 'ContextMenu';

export const ContextMenuTrigger = React.forwardRef<HTMLButtonElement, ContextMenuTriggerProps>(
  ({ className, children, disabled, ...props }, ref) => (
    <RadixContextMenu.Trigger
      ref={ref as React.ForwardedRef<HTMLSpanElement>}
      asChild
      className={clsx(styles.trigger, className)}
      {...(disabled !== undefined ? { disabled } : {})}
      {...props}
    >
      {children}
    </RadixContextMenu.Trigger>
  )
);

ContextMenuTrigger.displayName = 'ContextMenuTrigger';

export const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  (
    {
      alignOffset = 0,
      collisionPadding = 8,
      loop = true,
      className,
      children,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const rootContext = React.useContext(ContextMenuRootContext);

    return (
      <RadixContextMenu.Portal>
        <RadixContextMenu.Content
          ref={ref}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          loop={loop}
          className={clsx(styles.content, className)}
          onKeyDownCapture={(event) => {
            if (event.key === 'Tab') {
              rootContext?.setOpen(false);
            }
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);

            if (event.key === 'Tab') {
              rootContext?.setOpen(false);
            }
          }}
          {...props}
        >
          {children}
        </RadixContextMenu.Content>
      </RadixContextMenu.Portal>
    );
  }
);

ContextMenuContent.displayName = 'ContextMenuContent';

export const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(
  (
    {
      icon: Icon,
      shortcut,
      destructive = false,
      disabled,
      inset = false,
      className,
      children,
      onSelect,
      ...props
    },
    ref
  ) => (
    <RadixContextMenu.Item
      ref={ref}
      className={clsx(
        styles.item,
        destructive && styles.itemDestructive,
        inset && styles.itemInset,
        className
      )}
      {...(disabled !== undefined ? { disabled } : {})}
      {...(onSelect !== undefined ? { onSelect } : {})}
      {...props}
    >
      {Icon ? <Icon className={styles.itemIcon} aria-hidden="true" /> : null}
      <span className={styles.itemLabel}>{children}</span>
      {shortcut ? (
        <span className={styles.shortcut} aria-hidden="true">
          {shortcut}
        </span>
      ) : null}
    </RadixContextMenu.Item>
  )
);

ContextMenuItem.displayName = 'ContextMenuItem';

export const ContextMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  ContextMenuCheckboxItemProps
>(
  (
    { checked, onCheckedChange, disabled, shortcut, inset = false, className, children, ...props },
    ref
  ) => (
    <RadixContextMenu.CheckboxItem
      ref={ref}
      className={clsx(styles.item, styles.itemCheckbox, inset && styles.itemInset, className)}
      {...(checked !== undefined ? { checked } : {})}
      {...(onCheckedChange !== undefined
        ? {
            onCheckedChange: (nextChecked: boolean | 'indeterminate') => {
              onCheckedChange(nextChecked === true);
            },
          }
        : {})}
      {...(disabled !== undefined ? { disabled } : {})}
      {...props}
    >
      <span className={styles.itemIndicatorSlot}>
        <RadixContextMenu.ItemIndicator>
          {checked === 'indeterminate' ? (
            <Minus className={styles.indicatorIcon} aria-hidden="true" />
          ) : (
            <Check className={styles.indicatorIcon} aria-hidden="true" />
          )}
        </RadixContextMenu.ItemIndicator>
      </span>
      <span className={styles.itemLabel}>{children}</span>
      {shortcut ? (
        <span className={styles.shortcut} aria-hidden="true">
          {shortcut}
        </span>
      ) : null}
    </RadixContextMenu.CheckboxItem>
  )
);

ContextMenuCheckboxItem.displayName = 'ContextMenuCheckboxItem';

export const ContextMenuRadioGroup = React.forwardRef<HTMLDivElement, ContextMenuRadioGroupProps>(
  ({ value, defaultValue, onValueChange, children }, ref) => (
    <RadixContextMenu.RadioGroup
      ref={ref}
      {...(value !== undefined ? { value } : {})}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
      {...(onValueChange !== undefined ? { onValueChange } : {})}
    >
      {children}
    </RadixContextMenu.RadioGroup>
  )
);

ContextMenuRadioGroup.displayName = 'ContextMenuRadioGroup';

export const ContextMenuRadioItem = React.forwardRef<HTMLDivElement, ContextMenuRadioItemProps>(
  ({ value, disabled, shortcut, inset = false, className, children, ...props }, ref) => (
    <RadixContextMenu.RadioItem
      ref={ref}
      value={value}
      className={clsx(styles.item, styles.itemRadio, inset && styles.itemInset, className)}
      {...(disabled !== undefined ? { disabled } : {})}
      {...props}
    >
      <span className={styles.itemIndicatorSlot}>
        <RadixContextMenu.ItemIndicator>
          <span className={styles.radioDot} aria-hidden="true" />
        </RadixContextMenu.ItemIndicator>
      </span>
      <span className={styles.itemLabel}>{children}</span>
      {shortcut ? (
        <span className={styles.shortcut} aria-hidden="true">
          {shortcut}
        </span>
      ) : null}
    </RadixContextMenu.RadioItem>
  )
);

ContextMenuRadioItem.displayName = 'ContextMenuRadioItem';

export const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <RadixContextMenu.Separator ref={ref} className={clsx(styles.separator, className)} {...props} />
));

ContextMenuSeparator.displayName = 'ContextMenuSeparator';

export const ContextMenuLabel = React.forwardRef<HTMLDivElement, ContextMenuLabelProps>(
  ({ inset = false, className, children, ...props }, ref) => (
    <RadixContextMenu.Label
      ref={ref}
      className={clsx(styles.label, inset && styles.labelInset, className)}
      {...props}
    >
      {children}
    </RadixContextMenu.Label>
  )
);

ContextMenuLabel.displayName = 'ContextMenuLabel';

export const ContextMenuSub = ({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: ContextMenuSubProps) => (
  <RadixContextMenu.Sub
    {...(open !== undefined ? { open } : {})}
    {...(defaultOpen !== undefined ? { defaultOpen } : {})}
    {...(onOpenChange !== undefined ? { onOpenChange } : {})}
  >
    {children}
  </RadixContextMenu.Sub>
);

ContextMenuSub.displayName = 'ContextMenuSub';

export const ContextMenuSubTrigger = React.forwardRef<HTMLDivElement, ContextMenuSubTriggerProps>(
  ({ icon: Icon, inset = false, className, children, disabled, ...props }, ref) => (
    <RadixContextMenu.SubTrigger
      ref={ref}
      className={clsx(styles.item, styles.subTrigger, inset && styles.itemInset, className)}
      {...(disabled !== undefined ? { disabled } : {})}
      {...props}
    >
      {Icon ? <Icon className={styles.itemIcon} aria-hidden="true" /> : null}
      <span className={styles.itemLabel}>{children}</span>
      <ChevronRight className={styles.subTriggerChevron} aria-hidden="true" />
    </RadixContextMenu.SubTrigger>
  )
);

ContextMenuSubTrigger.displayName = 'ContextMenuSubTrigger';

export const ContextMenuSubContent = React.forwardRef<HTMLDivElement, ContextMenuSubContentProps>(
  (
    {
      sideOffset = 4,
      alignOffset = -4,
      collisionPadding = 8,
      loop = true,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <RadixContextMenu.Portal>
      <RadixContextMenu.SubContent
        ref={ref}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        loop={loop}
        className={clsx(styles.content, className)}
        {...props}
      >
        {children}
      </RadixContextMenu.SubContent>
    </RadixContextMenu.Portal>
  )
);

ContextMenuSubContent.displayName = 'ContextMenuSubContent';

export const ContextMenuShortcut = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={clsx(styles.shortcut, className)} aria-hidden="true" {...props}>
    {children}
  </span>
);

ContextMenuShortcut.displayName = 'ContextMenuShortcut';

export const ContextMenuItemIndicator = React.forwardRef<
  HTMLSpanElement,
  ContextMenuItemIndicatorProps
>(({ className, children, ...props }, ref) => (
  <RadixContextMenu.ItemIndicator ref={ref} className={className} {...props}>
    {children}
  </RadixContextMenu.ItemIndicator>
));

ContextMenuItemIndicator.displayName = 'ContextMenuItemIndicator';

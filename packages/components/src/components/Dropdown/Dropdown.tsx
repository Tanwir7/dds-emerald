import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import { Check, ChevronRight } from 'lucide-react';
import styles from './Dropdown.module.scss';

export interface DropdownProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children: React.ReactNode;
}

export const Dropdown = React.forwardRef<HTMLButtonElement, DropdownProps>(
  ({ open, defaultOpen, onOpenChange, modal = true, children }, _ref) => (
    <DropdownMenuPrimitive.Root
      {...(open !== undefined ? { open } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange !== undefined ? { onOpenChange } : {})}
      modal={modal}
    >
      {children}
    </DropdownMenuPrimitive.Root>
  )
);
Dropdown.displayName = 'Dropdown';

export interface DropdownTriggerProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Trigger
> {
  className?: string;
  children: React.ReactNode;
}

export const DropdownTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  DropdownTriggerProps
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger ref={ref} className={className} {...props}>
    {children}
  </DropdownMenuPrimitive.Trigger>
));
DropdownTrigger.displayName = 'DropdownTrigger';

export interface DropdownContentProps extends Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>,
  'side' | 'align'
> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
  children: React.ReactNode;
}

export const DropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownContentProps
>(({ side = 'bottom', align = 'start', sideOffset = 4, className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      side={side}
      align={align}
      sideOffset={sideOffset}
      className={clsx(styles.content, className)}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Content>
  </DropdownMenuPrimitive.Portal>
));
DropdownContent.displayName = 'DropdownContent';

export interface DropdownItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>,
  'children'
> {
  intent?: 'default' | 'destructive';
  startIcon?: React.ReactNode;
  endText?: string;
  inset?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const DropdownItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownItemProps
>(
  (
    { intent = 'default', startIcon, endText, inset = false, className, children, ...props },
    ref
  ) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={clsx(
        styles.item,
        intent === 'destructive' && styles.intentDestructive,
        inset && styles.inset,
        className
      )}
      {...props}
    >
      {startIcon ? (
        <span className={styles.startIcon} aria-hidden="true">
          {startIcon}
        </span>
      ) : null}
      <span className={styles.itemText}>{children}</span>
      {endText ? <span className={styles.endText}>{endText}</span> : null}
    </DropdownMenuPrimitive.Item>
  )
);
DropdownItem.displayName = 'DropdownItem';

export interface DropdownCheckboxItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  'children'
> {
  className?: string;
  children: React.ReactNode;
}

export const DropdownCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  DropdownCheckboxItemProps
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={clsx(styles.item, styles.checkboxItem, className)}
    {...props}
  >
    <span className={styles.itemIndicatorSlot} aria-hidden="true">
      <DropdownMenuPrimitive.ItemIndicator className={styles.itemIndicator}>
        <Check className={styles.indicatorIcon} aria-hidden="true" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    <span className={styles.itemText}>{children}</span>
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownCheckboxItem.displayName = 'DropdownCheckboxItem';

export interface DropdownRadioGroupProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.RadioGroup
> {
  children: React.ReactNode;
}

export const DropdownRadioGroup = React.forwardRef<HTMLDivElement, DropdownRadioGroupProps>(
  ({ children, ...props }, _ref) => (
    <DropdownMenuPrimitive.RadioGroup {...props}>{children}</DropdownMenuPrimitive.RadioGroup>
  )
);
DropdownRadioGroup.displayName = 'DropdownRadioGroup';

export interface DropdownRadioItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>,
  'children'
> {
  className?: string;
  children: React.ReactNode;
}

const DotIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
    <circle cx="8" cy="8" r="3" />
  </svg>
);

export const DropdownRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  DropdownRadioItemProps
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={clsx(styles.item, styles.radioItem, className)}
    {...props}
  >
    <span className={styles.itemIndicatorSlot} aria-hidden="true">
      <DropdownMenuPrimitive.ItemIndicator className={styles.itemIndicator}>
        <DotIcon className={styles.indicatorIcon} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    <span className={styles.itemText}>{children}</span>
  </DropdownMenuPrimitive.RadioItem>
));
DropdownRadioItem.displayName = 'DropdownRadioItem';

export interface DropdownLabelProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Label
> {
  className?: string;
}

export const DropdownLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  DropdownLabelProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label ref={ref} className={clsx(styles.label, className)} {...props} />
));
DropdownLabel.displayName = 'DropdownLabel';

export interface DropdownSeparatorProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Separator
> {
  className?: string;
}

export const DropdownSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  DropdownSeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={clsx(styles.separator, className)}
    {...props}
  />
));
DropdownSeparator.displayName = 'DropdownSeparator';

export interface DropdownSubProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const DropdownSub = React.forwardRef<HTMLDivElement, DropdownSubProps>(
  ({ open, defaultOpen, onOpenChange, children }, _ref) => (
    <DropdownMenuPrimitive.Sub
      {...(open !== undefined ? { open } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange !== undefined ? { onOpenChange } : {})}
    >
      {children}
    </DropdownMenuPrimitive.Sub>
  )
);
DropdownSub.displayName = 'DropdownSub';

export interface DropdownSubTriggerProps extends Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>,
  'children'
> {
  className?: string;
  children: React.ReactNode;
}

export const DropdownSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  DropdownSubTriggerProps
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={clsx(styles.item, styles.subTrigger, className)}
    {...props}
  >
    <span className={styles.itemText}>{children}</span>
    <ChevronRight className={styles.subArrow} aria-hidden="true" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownSubTrigger.displayName = 'DropdownSubTrigger';

export interface DropdownSubContentProps extends Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>,
  'sideOffset'
> {
  sideOffset?: number;
  className?: string;
  children: React.ReactNode;
}

export const DropdownSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  DropdownSubContentProps
>(({ sideOffset = 4, className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      sideOffset={sideOffset}
      className={clsx(styles.content, styles.subContent, className)}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.SubContent>
  </DropdownMenuPrimitive.Portal>
));
DropdownSubContent.displayName = 'DropdownSubContent';

export interface DropdownGroupProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Group
> {
  children?: React.ReactNode;
}

export const DropdownGroup = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Group>,
  DropdownGroupProps
>(({ children, ...props }, ref) => (
  <DropdownMenuPrimitive.Group ref={ref} {...props}>
    {children}
  </DropdownMenuPrimitive.Group>
));
DropdownGroup.displayName = 'DropdownGroup';

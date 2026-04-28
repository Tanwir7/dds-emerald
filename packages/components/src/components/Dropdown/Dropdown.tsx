import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import styles from './Dropdown.module.scss';

export interface DropdownProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children: React.ReactNode;
}

export interface DropdownTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface DropdownContentProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
  children: React.ReactNode;
}

export interface DropdownItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onSelect'
> {
  intent?: 'default' | 'destructive';
  disabled?: boolean;
  onSelect?: (event: Event) => void;
  startIcon?: React.ReactNode;
  endText?: string;
  inset?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface DropdownCheckboxItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onSelect'
> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface DropdownRadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export interface DropdownRadioItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onSelect'
> {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface DropdownSubProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export interface DropdownSubTriggerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  startIcon?: React.ReactNode;
  inset?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface DropdownSubContentProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  sideOffset?: number;
  className?: string;
  children: React.ReactNode;
}

export interface DropdownLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface DropdownSeparatorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  children?: never;
}

export interface DropdownGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const CheckIcon = ({ className }: { className?: string | undefined }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    <path d="M3.5 8L6.5 11L12.5 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DotIcon = ({ className }: { className?: string | undefined }) => (
  <svg
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    <circle cx="8" cy="8" r="3" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string | undefined }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    <path d="M6 4L10 8L6 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const renderItemText = (
  children: React.ReactNode,
  startIcon?: React.ReactNode,
  endText?: string
) => (
  <>
    {startIcon ? <span className={styles.startIcon}>{startIcon}</span> : null}
    <span className={styles.itemText}>{children}</span>
    {endText ? <span className={styles.endText}>{endText}</span> : null}
  </>
);

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

export const DropdownTrigger = React.forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ asChild = false, className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.Trigger ref={ref} asChild={asChild} className={className} {...props}>
      {children}
    </DropdownMenuPrimitive.Trigger>
  )
);
DropdownTrigger.displayName = 'DropdownTrigger';

export const DropdownContent = React.forwardRef<HTMLDivElement, DropdownContentProps>(
  ({ side = 'bottom', align = 'start', sideOffset = 4, className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        loop
        collisionPadding={8}
        className={clsx(styles.content, className)}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
);
DropdownContent.displayName = 'DropdownContent';

export const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
  (
    {
      intent = 'default',
      disabled,
      onSelect,
      startIcon,
      endText,
      inset = false,
      className,
      children,
      ...props
    },
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
      {...(disabled !== undefined ? { disabled } : {})}
      {...(onSelect !== undefined ? { onSelect } : {})}
      {...props}
    >
      {renderItemText(children, startIcon, endText)}
    </DropdownMenuPrimitive.Item>
  )
);
DropdownItem.displayName = 'DropdownItem';

export const DropdownCheckboxItem = React.forwardRef<HTMLDivElement, DropdownCheckboxItemProps>(
  ({ checked, onCheckedChange, disabled, className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={clsx(styles.item, styles.checkboxItem, className)}
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
      <DropdownMenuPrimitive.ItemIndicator className={styles.itemIndicator}>
        <CheckIcon className={styles.itemIndicatorIcon} />
      </DropdownMenuPrimitive.ItemIndicator>
      <span className={styles.itemText}>{children}</span>
    </DropdownMenuPrimitive.CheckboxItem>
  )
);
DropdownCheckboxItem.displayName = 'DropdownCheckboxItem';

export const DropdownRadioGroup = React.forwardRef<HTMLDivElement, DropdownRadioGroupProps>(
  ({ value, defaultValue, onValueChange, children }, ref) => (
    <DropdownMenuPrimitive.RadioGroup
      ref={ref}
      {...(value !== undefined ? { value } : {})}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
      {...(onValueChange !== undefined ? { onValueChange } : {})}
    >
      {children}
    </DropdownMenuPrimitive.RadioGroup>
  )
);
DropdownRadioGroup.displayName = 'DropdownRadioGroup';

export const DropdownRadioItem = React.forwardRef<HTMLDivElement, DropdownRadioItemProps>(
  ({ value, disabled, className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      value={value}
      className={clsx(styles.item, styles.radioItem, className)}
      {...(disabled !== undefined ? { disabled } : {})}
      {...props}
    >
      <DropdownMenuPrimitive.ItemIndicator className={styles.itemIndicator}>
        <DotIcon className={styles.itemIndicatorIcon} />
      </DropdownMenuPrimitive.ItemIndicator>
      <span className={styles.itemText}>{children}</span>
    </DropdownMenuPrimitive.RadioItem>
  )
);
DropdownRadioItem.displayName = 'DropdownRadioItem';

export const DropdownLabel = React.forwardRef<HTMLDivElement, DropdownLabelProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Label ref={ref} className={clsx(styles.label, className)} {...props} />
  )
);
DropdownLabel.displayName = 'DropdownLabel';

export const DropdownSeparator = React.forwardRef<HTMLDivElement, DropdownSeparatorProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={clsx(styles.separator, className)}
      {...props}
    />
  )
);
DropdownSeparator.displayName = 'DropdownSeparator';

export const DropdownGroup = React.forwardRef<HTMLDivElement, DropdownGroupProps>(
  ({ children, ...props }, ref) => (
    <DropdownMenuPrimitive.Group ref={ref} {...props}>
      {children}
    </DropdownMenuPrimitive.Group>
  )
);
DropdownGroup.displayName = 'DropdownGroup';

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

export const DropdownSubTrigger = React.forwardRef<HTMLDivElement, DropdownSubTriggerProps>(
  ({ startIcon, inset = false, className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={clsx(styles.item, styles.subTrigger, inset && styles.inset, className)}
      {...props}
    >
      {renderItemText(children, startIcon)}
      <ChevronRightIcon className={styles.subArrow} />
    </DropdownMenuPrimitive.SubTrigger>
  )
);
DropdownSubTrigger.displayName = 'DropdownSubTrigger';

export const DropdownSubContent = React.forwardRef<HTMLDivElement, DropdownSubContentProps>(
  ({ sideOffset = 4, className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      sideOffset={sideOffset}
      loop
      collisionPadding={8}
      className={clsx(styles.subContent, className)}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.SubContent>
  )
);
DropdownSubContent.displayName = 'DropdownSubContent';

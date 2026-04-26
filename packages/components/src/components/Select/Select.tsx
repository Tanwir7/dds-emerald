import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import clsx from 'clsx';
import styles from './Select.module.scss';

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      open,
      defaultOpen,
      onOpenChange,
      disabled,
      required,
      name,
      children,
    },
    _ref
  ) => (
    <SelectPrimitive.Root
      {...(value !== undefined ? { value } : {})}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
      {...(onValueChange !== undefined ? { onValueChange } : {})}
      {...(open !== undefined ? { open } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange !== undefined ? { onOpenChange } : {})}
      {...(disabled !== undefined ? { disabled } : {})}
      {...(required !== undefined ? { required } : {})}
      {...(name !== undefined ? { name } : {})}
    >
      {children}
    </SelectPrimitive.Root>
  )
);
Select.displayName = 'Select';

interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const SelectGroup = React.forwardRef<HTMLDivElement, SelectGroupProps>(
  ({ children, ...props }, ref) => (
    <SelectPrimitive.Group ref={ref} {...props}>
      {children}
    </SelectPrimitive.Group>
  )
);
SelectGroup.displayName = 'SelectGroup';

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  placeholder?: string;
}

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ children, placeholder, ...props }, ref) => (
    <SelectPrimitive.Value ref={ref} placeholder={placeholder} {...props}>
      {children}
    </SelectPrimitive.Value>
  )
);
SelectValue.displayName = 'SelectValue';

/* eslint-disable react/prop-types */
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    width="16"
    height="16"
    className={props.className}
    {...props}
  >
    <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    width="16"
    height="16"
    className={props.className}
    {...props}
  >
    <path d="M4 10l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    width="16"
    height="16"
    className={props.className}
    {...props}
  >
    <path d="M3.5 8L6.5 11L12.5 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
/* eslint-enable react/prop-types */

interface SelectTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'size'
> {
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, size = 'md', invalid = false, placeholder, children, ...props }, ref) => {
    return (
      <SelectPrimitive.Trigger
        ref={ref}
        className={clsx(styles.trigger, styles[size], invalid && styles.invalid, className)}
        {...props}
      >
        {children || <SelectPrimitive.Value placeholder={placeholder} className={styles.value} />}
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className={styles.chevron} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'item-aligned' | 'popper';
  side?: 'top' | 'bottom';
  sideOffset?: number;
  children: React.ReactNode;
}

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  (
    { className, children, position = 'popper', side = 'bottom', sideOffset = 4, ...props },
    ref
  ) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        side={side}
        sideOffset={sideOffset}
        className={clsx(styles.content, className)}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className={styles.scrollBtn}>
          <ChevronUpIcon aria-hidden="true" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className={styles.viewport}>{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className={styles.scrollBtn}>
          <ChevronDownIcon aria-hidden="true" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);
SelectContent.displayName = 'SelectContent';

interface SelectItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={clsx(styles.item, className)}
      value={value}
      {...(disabled !== undefined ? { disabled } : {})}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className={styles.itemIndicator}>
        <CheckIcon aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
);
SelectItem.displayName = 'SelectItem';

interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const SelectLabel = React.forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Label ref={ref} className={clsx(styles.groupLabel, className)} {...props} />
  )
);
SelectLabel.displayName = 'SelectLabel';

interface SelectSeparatorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: never;
}

export const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Separator ref={ref} className={clsx(styles.separator, className)} {...props} />
  )
);
SelectSeparator.displayName = 'SelectSeparator';

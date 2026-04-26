import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import clsx from 'clsx';
import styles from './Select.module.scss';

export type SelectProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>;

export const Select = SelectPrimitive.Root;
Select.displayName = 'Select';

export const SelectGroup = SelectPrimitive.Group;
SelectGroup.displayName = 'SelectGroup';

export const SelectValue = SelectPrimitive.Value;
SelectValue.displayName = 'SelectValue';

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    width="16"
    height="16"
    className={className}
  >
    <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    width="16"
    height="16"
    className={className}
  >
    <path d="M4 10l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    width="16"
    height="16"
    className={className}
  >
    <path d="M3.5 8L6.5 11L12.5 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface SelectTriggerProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Trigger
> {
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  placeholder?: string;
}

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, size = 'md', invalid = false, placeholder, children, ...props }, ref) => {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={clsx(styles.trigger, styles[size], invalid && styles.invalid, className)}
      data-placeholder={!children ? '' : undefined}
      {...props}
    >
      {children || <SelectPrimitive.Value placeholder={placeholder} className={styles.value} />}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className={styles.chevron} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

export interface SelectContentProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Content
> {
  position?: 'item-aligned' | 'popper';
  side?: 'top' | 'bottom';
  sideOffset?: number;
}

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(
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

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item ref={ref} className={clsx(styles.item, className)} {...props}>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className={styles.itemIndicator}>
      <CheckIcon aria-hidden="true" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={clsx(styles.groupLabel, className)} {...props} />
));
SelectLabel.displayName = 'SelectLabel';

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={clsx(styles.separator, className)} {...props} />
));
SelectSeparator.displayName = 'SelectSeparator';

import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import styles from './Accordion.module.scss';

type AccordionVariant = 'default' | 'flush';

type AccordionRootSharedProps = Omit<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>,
  'children' | 'className' | 'type' | 'value' | 'defaultValue' | 'onValueChange' | 'collapsible'
> & {
  variant?: AccordionVariant;
  className?: string;
  children: React.ReactNode;
};

type AccordionSingleModeProps = {
  type?: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  collapsible?: boolean;
};

type AccordionMultipleModeProps = {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  collapsible?: never;
};

export type AccordionProps = AccordionRootSharedProps &
  (AccordionSingleModeProps | AccordionMultipleModeProps);

export type AccordionItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>,
  'children' | 'className'
> & {
  value: string;
  className?: string;
  children: React.ReactNode;
};

export type AccordionTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>,
  'children' | 'className'
> & {
  className?: string;
  children: React.ReactNode;
};

export type AccordionContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>,
  'children' | 'className'
> & {
  className?: string;
  children: React.ReactNode;
};

const variantClassNames: Record<AccordionVariant, string> = {
  default: styles.variantDefault!,
  flush: styles.variantFlush!,
};

export const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(({ type = 'single', variant = 'default', className, children, ...props }, ref) => {
  if (type === 'multiple') {
    const { value, defaultValue, onValueChange, ...rootProps } = props as AccordionRootSharedProps &
      AccordionMultipleModeProps;

    return (
      <AccordionPrimitive.Root
        ref={ref}
        className={clsx(styles.root, variantClassNames[variant], className)}
        {...rootProps}
        type="multiple"
        {...(value !== undefined ? { value } : {})}
        {...(defaultValue !== undefined ? { defaultValue } : {})}
        {...(onValueChange !== undefined ? { onValueChange } : {})}
      >
        {children}
      </AccordionPrimitive.Root>
    );
  }

  const {
    collapsible = true,
    value,
    defaultValue,
    onValueChange,
    ...rootProps
  } = props as AccordionRootSharedProps & AccordionSingleModeProps;

  return (
    <AccordionPrimitive.Root
      ref={ref}
      className={clsx(styles.root, variantClassNames[variant], className)}
      {...rootProps}
      type="single"
      collapsible={collapsible}
      {...(value !== undefined ? { value } : {})}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
      {...(onValueChange !== undefined ? { onValueChange } : {})}
    >
      {children}
    </AccordionPrimitive.Root>
  );
});
Accordion.displayName = 'Accordion';

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={clsx(styles.item, className)} {...props}>
    {children}
  </AccordionPrimitive.Item>
));
AccordionItem.displayName = 'AccordionItem';

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className={styles.header}>
    <AccordionPrimitive.Trigger ref={ref} className={clsx(styles.trigger, className)} {...props}>
      {children}
      <ChevronDown className={styles.chevron} aria-hidden="true" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content ref={ref} className={clsx(styles.content, className)} {...props}>
    <div className={styles.contentInner}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = 'AccordionContent';

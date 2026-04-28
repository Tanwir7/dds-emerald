import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import styles from './Accordion.module.scss';

type AccordionVariant = 'default' | 'flush';

type AccordionRootSharedProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> & {
  variant?: AccordionVariant;
  dir?: 'ltr' | 'rtl';
  orientation?: 'horizontal' | 'vertical';
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
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> & {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

export type AccordionTriggerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'className'
> & {
  className?: string;
  children: React.ReactNode;
};

export type AccordionContentProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> & {
  forceMount?: true;
  className?: string;
  children: React.ReactNode;
};

const variantClassNames: Record<AccordionVariant, string> = {
  default: styles.variantDefault!,
  flush: styles.variantFlush!,
};

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = 'single', variant = 'default', className, children, ...props }, ref) => {
    if (type === 'multiple') {
      const { value, defaultValue, onValueChange, ...rootProps } =
        props as AccordionRootSharedProps & AccordionMultipleModeProps;

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
  }
);
Accordion.displayName = 'Accordion';

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Item ref={ref} className={clsx(styles.item, className)} {...props}>
      {children}
    </AccordionPrimitive.Item>
  )
);
AccordionItem.displayName = 'AccordionItem';

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className={styles.header}>
      <AccordionPrimitive.Trigger ref={ref} className={clsx(styles.trigger, className)} {...props}>
        {children}
        <ChevronDown className={styles.chevron} aria-hidden="true" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
);
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content ref={ref} className={clsx(styles.content, className)} {...props}>
      <div className={styles.contentInner}>{children}</div>
    </AccordionPrimitive.Content>
  )
);
AccordionContent.displayName = 'AccordionContent';

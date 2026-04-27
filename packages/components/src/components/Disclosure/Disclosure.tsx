import React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import styles from './Disclosure.module.scss';

export interface DisclosureProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Disclosure = React.forwardRef<HTMLDivElement, DisclosureProps>(
  ({ open, defaultOpen, onOpenChange, disabled, className, children }, ref) => (
    <CollapsiblePrimitive.Root
      ref={ref}
      className={clsx(styles.root, className)}
      {...(open !== undefined ? { open } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange !== undefined ? { onOpenChange } : {})}
      {...(disabled !== undefined ? { disabled } : {})}
    >
      {children}
    </CollapsiblePrimitive.Root>
  )
);
Disclosure.displayName = 'Disclosure';

export interface DisclosureTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  showChevron?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}

export const DisclosureTrigger = React.forwardRef<HTMLButtonElement, DisclosureTriggerProps>(
  ({ showChevron = true, size = 'md', className, children, ...props }, ref) => (
    <CollapsiblePrimitive.Trigger
      ref={ref}
      className={clsx(styles.trigger, styles[size], className)}
      {...props}
    >
      <span className={styles.triggerContent}>{children}</span>
      {showChevron && <ChevronDown className={styles.chevron} aria-hidden="true" />}
    </CollapsiblePrimitive.Trigger>
  )
);
DisclosureTrigger.displayName = 'DisclosureTrigger';

export interface DisclosureContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const DisclosureContent = React.forwardRef<HTMLDivElement, DisclosureContentProps>(
  ({ className, children, ...props }, ref) => (
    <CollapsiblePrimitive.Content ref={ref} className={clsx(styles.content, className)} {...props}>
      <div className={styles.contentInner}>{children}</div>
    </CollapsiblePrimitive.Content>
  )
);
DisclosureContent.displayName = 'DisclosureContent';

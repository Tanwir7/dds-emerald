import clsx from 'clsx';
import { X } from 'lucide-react';
import React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Icon } from '../Icon';
import styles from './Popover.module.scss';

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children: React.ReactNode;
}

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface PopoverContentProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'content'
> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  width?: 'trigger' | 'auto' | string;
  showArrow?: boolean;
  showCloseButton?: boolean;
  closeButtonLabel?: string;
  className?: string;
  children: React.ReactNode;
}

export interface PopoverCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

export interface PopoverAnchorProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children?: React.ReactNode;
}

export const Popover = React.forwardRef<HTMLButtonElement, PopoverProps>(
  ({ open, defaultOpen, onOpenChange, modal = false, children }, _ref) => (
    <PopoverPrimitive.Root
      {...(open !== undefined ? { open } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange !== undefined ? { onOpenChange } : {})}
      modal={modal}
    >
      {children}
    </PopoverPrimitive.Root>
  )
);

Popover.displayName = 'Popover';

export const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ asChild = false, className, children, ...props }, ref) => (
    <PopoverPrimitive.Trigger ref={ref} asChild={asChild} className={className} {...props}>
      {children}
    </PopoverPrimitive.Trigger>
  )
);

PopoverTrigger.displayName = 'PopoverTrigger';

/**
 * `width` uses an inline style only for documented layout cases:
 * matching the Radix trigger width or applying a consumer-provided CSS width string.
 */
export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {
      side = 'bottom',
      align = 'start',
      sideOffset = 6,
      alignOffset = 0,
      width = 'auto',
      showArrow = false,
      showCloseButton = false,
      closeButtonLabel = 'Close',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const widthStyle =
      width === 'trigger'
        ? { width: 'var(--radix-popover-trigger-width)' }
        : width !== 'auto'
          ? { width }
          : undefined;

    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className={clsx(styles.content, className)}
          data-close-button={showCloseButton ? 'true' : undefined}
          style={widthStyle}
          {...props}
        >
          {showCloseButton ? (
            <PopoverPrimitive.Close className={styles.closeButton} aria-label={closeButtonLabel}>
              <Icon icon={X} aria-hidden="true" />
            </PopoverPrimitive.Close>
          ) : null}

          {children}

          {showArrow ? <PopoverPrimitive.Arrow className={styles.arrow} /> : null}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    );
  }
);

PopoverContent.displayName = 'PopoverContent';

export const PopoverClose = React.forwardRef<HTMLButtonElement, PopoverCloseProps>(
  ({ asChild = false, children, ...props }, ref) => (
    <PopoverPrimitive.Close ref={ref} asChild={asChild} {...props}>
      {children}
    </PopoverPrimitive.Close>
  )
);

PopoverClose.displayName = 'PopoverClose';

export const PopoverAnchor = React.forwardRef<HTMLDivElement, PopoverAnchorProps>(
  ({ asChild = false, children, ...props }, ref) => (
    <PopoverPrimitive.Anchor ref={ref} asChild={asChild} {...props}>
      {children}
    </PopoverPrimitive.Anchor>
  )
);

PopoverAnchor.displayName = 'PopoverAnchor';

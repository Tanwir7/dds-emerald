import clsx from 'clsx';
import React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import styles from './AlertDialog.module.scss';

export type AlertDialogVariant = 'destructive' | 'warning' | 'info';
export type AlertDialogSize = 'sm' | 'md';

export interface AlertDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export interface AlertDialogTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface AlertDialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface AlertDialogContentProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  variant?: AlertDialogVariant;
  size?: AlertDialogSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface AlertDialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end' | 'between';
  className?: string;
  children: React.ReactNode;
}

const sizeMap: Record<AlertDialogSize, string> = {
  sm: '400px',
  md: '560px',
};

export const AlertDialog = React.forwardRef<HTMLButtonElement, AlertDialogProps>(
  ({ open, defaultOpen, onOpenChange, children }, _ref) => (
    <RadixDialog.Root
      {...(open !== undefined ? { open } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange !== undefined ? { onOpenChange } : {})}
      modal
    >
      {children}
    </RadixDialog.Root>
  )
);
AlertDialog.displayName = 'AlertDialog';

export const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(
  ({ asChild = false, className, children, ...props }, ref) => (
    <RadixDialog.Trigger ref={ref} asChild={asChild} className={className} {...props}>
      {children}
    </RadixDialog.Trigger>
  )
);
AlertDialogTrigger.displayName = 'AlertDialogTrigger';

export const AlertDialogOverlay = React.forwardRef<HTMLDivElement, AlertDialogOverlayProps>(
  ({ className, ...props }, ref) => (
    <RadixDialog.Overlay ref={ref} className={clsx(styles.overlay, className)} {...props} />
  )
);
AlertDialogOverlay.displayName = 'AlertDialogOverlay';

export const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  (
    {
      variant = 'destructive',
      size = 'sm',
      closeOnOverlayClick = false,
      closeOnEscape = false,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => (
    <RadixDialog.Portal>
      <AlertDialogOverlay />
      <RadixDialog.Content
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        className={clsx(
          styles.content,
          styles[`size-${size}`],
          styles[`variant-${variant}`],
          className
        )}
        style={
          {
            ...style,
            '--dialog-max-width': sizeMap[size],
          } as React.CSSProperties
        }
        onPointerDownOutside={(event) => {
          if (!closeOnOverlayClick) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (!closeOnEscape) {
            event.preventDefault();
          }
        }}
        {...props}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
);
AlertDialogContent.displayName = 'AlertDialogContent';

export const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <RadixDialog.Title ref={ref} className={clsx(styles.title, className)} {...props}>
    {children}
  </RadixDialog.Title>
));
AlertDialogTitle.displayName = 'AlertDialogTitle';

export const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <RadixDialog.Description ref={ref} className={clsx(styles.description, className)} {...props}>
    {children}
  </RadixDialog.Description>
));
AlertDialogDescription.displayName = 'AlertDialogDescription';

export const AlertDialogHeader = React.forwardRef<HTMLDivElement, AlertDialogHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.header, className)} {...props}>
      {children}
    </div>
  )
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

export const AlertDialogBody = React.forwardRef<HTMLDivElement, AlertDialogBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.body, className)} {...props}>
      {children}
    </div>
  )
);
AlertDialogBody.displayName = 'AlertDialogBody';

export const AlertDialogFooter = React.forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  ({ align = 'end', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(styles.footer, styles[`footerAlign-${align}`], className)}
      {...props}
    >
      {children}
    </div>
  )
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

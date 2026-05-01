import clsx from 'clsx';
import { X } from 'lucide-react';
import React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Button } from '../Button';
import { VisuallyHidden } from '../VisuallyHidden';
import styles from './Dialog.module.scss';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children: React.ReactNode;
}

export interface DialogTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface DialogContentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  size?: DialogSize;
  scrollable?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  'aria-label'?: string;
  className?: string;
  children: React.ReactNode;
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end' | 'between';
  className?: string;
  children: React.ReactNode;
}

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

const sizeMap: Record<DialogSize, string> = {
  sm: '400px',
  md: '560px',
  lg: '720px',
  xl: '960px',
  fullscreen: '100vw',
};

export const Dialog = React.forwardRef<HTMLButtonElement, DialogProps>(
  ({ open, defaultOpen, onOpenChange, modal = true, children }, _ref) => (
    <RadixDialog.Root
      {...(open !== undefined ? { open } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange !== undefined ? { onOpenChange } : {})}
      modal={modal}
    >
      {children}
    </RadixDialog.Root>
  )
);
Dialog.displayName = 'Dialog';

export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild = false, className, children, ...props }, ref) => (
    <RadixDialog.Trigger ref={ref} asChild={asChild} className={className} {...props}>
      {children}
    </RadixDialog.Trigger>
  )
);
DialogTrigger.displayName = 'DialogTrigger';

export const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, ...props }, ref) => (
    <RadixDialog.Overlay ref={ref} className={clsx(styles.overlay, className)} {...props} />
  )
);
DialogOverlay.displayName = 'DialogOverlay';

/**
 * `--dialog-max-width` is a documented layout-variable exception used to map
 * component sizes to panel widths without introducing token-specific classes.
 */
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  (
    {
      size = 'md',
      scrollable = false,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const accessibleLabel = props['aria-label'];
    const hasTitle = React.Children.toArray(children).some((child) => {
      if (!React.isValidElement<{ children?: React.ReactNode }>(child)) {
        return false;
      }

      if (child.type === DialogTitle) {
        return true;
      }

      if (child.type !== DialogHeader) {
        return false;
      }

      return React.Children.toArray(child.props.children).some(
        (nestedChild) => React.isValidElement(nestedChild) && nestedChild.type === DialogTitle
      );
    });

    return (
      <RadixDialog.Portal>
        <DialogOverlay />
        <RadixDialog.Content
          ref={ref}
          aria-modal="true"
          className={clsx(
            styles.content,
            styles[`size-${size}`],
            scrollable && styles.scrollable,
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
          {!hasTitle && typeof accessibleLabel === 'string' && accessibleLabel.length > 0 ? (
            <VisuallyHidden>
              <DialogTitle>{accessibleLabel}</DialogTitle>
            </VisuallyHidden>
          ) : null}
          {showCloseButton ? (
            <RadixDialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                icon={X}
                aria-label="Close dialog"
                className={styles.closeButton ?? ''}
              />
            </RadixDialog.Close>
          ) : null}
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    );
  }
);
DialogContent.displayName = 'DialogContent';

export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ asChild = false, children, ...props }, ref) => (
    <RadixDialog.Close ref={ref} asChild={asChild} {...props}>
      {children}
    </RadixDialog.Close>
  )
);
DialogClose.displayName = 'DialogClose';

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <RadixDialog.Title ref={ref} className={clsx(styles.title, className)} {...props}>
    {children}
  </RadixDialog.Title>
));
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <RadixDialog.Description ref={ref} className={clsx(styles.description, className)} {...props}>
    {children}
  </RadixDialog.Description>
));
DialogDescription.displayName = 'DialogDescription';

export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.header, className)} {...props}>
      {children}
    </div>
  )
);
DialogHeader.displayName = 'DialogHeader';

export const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.body, className)} {...props}>
      {children}
    </div>
  )
);
DialogBody.displayName = 'DialogBody';

export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
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
DialogFooter.displayName = 'DialogFooter';

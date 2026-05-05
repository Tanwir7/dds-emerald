import clsx from 'clsx';
import { X } from 'lucide-react';
import React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Button } from '../Button';
import { VisuallyHidden } from '../VisuallyHidden';
import styles from './Sheet.module.scss';

export type SheetSide = 'left' | 'right';
export type SheetSize = 'sm' | 'md' | 'lg' | 'full';

export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children: React.ReactNode;
}

interface SheetTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface SheetOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface SheetContentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  side?: SheetSide;
  size?: SheetSize;
  portalContainer?: HTMLElement | null | undefined;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  'aria-label'?: string;
  className?: string;
  children: React.ReactNode;
}

export interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface SheetBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end' | 'between';
  className?: string;
  children: React.ReactNode;
}

interface SheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

const sizeMap: Record<SheetSize, string> = {
  sm: '320px',
  md: '480px',
  lg: '640px',
  full: '100vw',
};

export const Sheet = React.forwardRef<HTMLButtonElement, SheetProps>(
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
Sheet.displayName = 'Sheet';

export const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ asChild = false, className, children, ...props }, ref) => (
    <RadixDialog.Trigger ref={ref} asChild={asChild} className={className} {...props}>
      {children}
    </RadixDialog.Trigger>
  )
);
SheetTrigger.displayName = 'SheetTrigger';

export const SheetOverlay = React.forwardRef<HTMLDivElement, SheetOverlayProps>(
  ({ className, ...props }, ref) => (
    <RadixDialog.Overlay ref={ref} className={clsx(styles.overlay, className)} {...props} />
  )
);
SheetOverlay.displayName = 'SheetOverlay';

/**
 * `--sheet-width` is a documented layout-variable exception used to map the
 * component size prop to panel width without introducing token-specific classes.
 */
export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  (
    {
      side = 'right',
      size = 'md',
      portalContainer,
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

      if (child.type === SheetTitle) {
        return true;
      }

      if (child.type !== SheetHeader) {
        return false;
      }

      return React.Children.toArray(child.props.children).some(
        (nestedChild) => React.isValidElement(nestedChild) && nestedChild.type === SheetTitle
      );
    });

    return (
      <RadixDialog.Portal container={portalContainer ?? undefined}>
        <SheetOverlay />
        <RadixDialog.Content
          ref={ref}
          aria-modal="true"
          className={clsx(
            styles.content,
            styles[`side-${side}`],
            styles[`size-${size}`],
            className
          )}
          style={
            {
              ...style,
              '--sheet-width': sizeMap[size],
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
              <SheetTitle>{accessibleLabel}</SheetTitle>
            </VisuallyHidden>
          ) : null}
          {showCloseButton ? (
            <RadixDialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                icon={X}
                aria-label="Close sheet"
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
SheetContent.displayName = 'SheetContent';

export const SheetClose = React.forwardRef<HTMLButtonElement, SheetCloseProps>(
  ({ asChild = false, children, ...props }, ref) => (
    <RadixDialog.Close ref={ref} asChild={asChild} {...props}>
      {children}
    </RadixDialog.Close>
  )
);
SheetClose.displayName = 'SheetClose';

export const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <RadixDialog.Title ref={ref} className={clsx(styles.title, className)} {...props}>
    {children}
  </RadixDialog.Title>
));
SheetTitle.displayName = 'SheetTitle';

export const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <RadixDialog.Description ref={ref} className={clsx(styles.description, className)} {...props}>
    {children}
  </RadixDialog.Description>
));
SheetDescription.displayName = 'SheetDescription';

export const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.header, className)} {...props}>
      {children}
    </div>
  )
);
SheetHeader.displayName = 'SheetHeader';

export const SheetBody = React.forwardRef<HTMLDivElement, SheetBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.body, className)} {...props}>
      {children}
    </div>
  )
);
SheetBody.displayName = 'SheetBody';

export const SheetFooter = React.forwardRef<HTMLDivElement, SheetFooterProps>(
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
SheetFooter.displayName = 'SheetFooter';

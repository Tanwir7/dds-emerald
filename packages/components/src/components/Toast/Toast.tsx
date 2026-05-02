import clsx from 'clsx';
import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from 'lucide-react';
import React from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { Button } from '../Button';
import { Icon } from '../Icon';
import styles from './Toast.module.scss';

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLLIElement>, 'children'> {
  variant?: ToastVariant;
  duration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

export interface ToastActionProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'aria-labelledby' | 'children'
> {
  altText: string;
  className?: string;
  children: React.ReactNode;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    altText: string;
    onClick: () => void;
  };
}

export interface ToastConfig extends ToastOptions {
  id: string;
  open: boolean;
}

export interface UseToastReturn {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  toasts: ToastConfig[];
}

export interface ToastProviderProps {
  children: React.ReactNode;
}

export interface ToastViewportProps extends React.OlHTMLAttributes<HTMLOListElement> {
  className?: string;
}

export interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface ToastCloseProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'aria-labelledby' | 'children'
> {
  className?: string;
}

const toastClassName = getRequiredClassName(styles, 'toast');
const viewportClassName = getRequiredClassName(styles, 'viewport');
const contentClassName = getRequiredClassName(styles, 'toastContent');
const titleClassName = getRequiredClassName(styles, 'title');
const descriptionClassName = getRequiredClassName(styles, 'description');
const variantIconClassName = getRequiredClassName(styles, 'variantIcon');
const closeButtonClassName = getRequiredClassName(styles, 'closeButton');
const actionClassName = getRequiredClassName(styles, 'action');

const variantClassName: Record<ToastVariant, string> = {
  default: getRequiredClassName(styles, 'variantDefault'),
  success: getRequiredClassName(styles, 'variantSuccess'),
  warning: getRequiredClassName(styles, 'variantWarning'),
  danger: getRequiredClassName(styles, 'variantDanger'),
  info: getRequiredClassName(styles, 'variantInfo'),
};

const variantIconMap: Record<Exclude<ToastVariant, 'default'>, LucideIcon> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
};

const ToastContext = React.createContext<UseToastReturn | null>(null);

const createToastId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `toast-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const useToast = (): UseToastReturn => {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};

/**
 * Render `ToastProvider` once at the application root so `useToast()` can enqueue
 * notifications from anywhere in the subtree. The provider renders its own viewport.
 */
export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = React.useState<ToastConfig[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((previousToasts) => previousToasts.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback((options: ToastOptions) => {
    const id = createToastId();

    setToasts((previousToasts) => [
      ...previousToasts,
      {
        ...options,
        id,
        open: true,
      },
    ]);

    return id;
  }, []);

  const contextValue = React.useMemo<UseToastReturn>(
    () => ({
      toast,
      dismiss,
      toasts,
    }),
    [dismiss, toast, toasts]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map((toastConfig) => (
          <Toast
            key={toastConfig.id}
            open={toastConfig.open}
            {...(toastConfig.variant !== undefined ? { variant: toastConfig.variant } : {})}
            {...(toastConfig.duration !== undefined ? { duration: toastConfig.duration } : {})}
            onOpenChange={(open) => {
              if (!open) {
                dismiss(toastConfig.id);
              }
            }}
          >
            {toastConfig.title ? <ToastTitle>{toastConfig.title}</ToastTitle> : null}
            {toastConfig.description ? (
              <ToastDescription>{toastConfig.description}</ToastDescription>
            ) : null}
            {toastConfig.action ? (
              <ToastAction
                altText={toastConfig.action.altText}
                onClick={toastConfig.action.onClick}
              >
                {toastConfig.action.label}
              </ToastAction>
            ) : null}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
};

ToastProvider.displayName = 'ToastProvider';

export const ToastViewport = React.forwardRef<HTMLOListElement, ToastViewportProps>(
  ({ className, ...props }, ref) => (
    <RadixToast.Viewport ref={ref} className={clsx(viewportClassName, className)} {...props} />
  )
);

ToastViewport.displayName = 'ToastViewport';

export const Toast = React.forwardRef<HTMLLIElement, ToastProps>(
  (
    {
      variant = 'default',
      duration = 5000,
      open,
      defaultOpen = true,
      onOpenChange,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const IconComponent = variant === 'default' ? null : variantIconMap[variant];
    const radixProps = props as Omit<
      React.ComponentPropsWithoutRef<typeof RadixToast.Root>,
      'children' | 'className' | 'defaultOpen' | 'duration' | 'onOpenChange' | 'open' | 'type'
    >;

    return (
      <RadixToast.Root
        ref={ref}
        duration={duration}
        className={clsx(toastClassName, variantClassName[variant], className)}
        {...(variant === 'danger' ? { type: 'foreground' as const } : {})}
        {...(open !== undefined ? { open } : {})}
        {...(defaultOpen !== undefined ? { defaultOpen } : {})}
        {...(onOpenChange !== undefined ? { onOpenChange } : {})}
        {...radixProps}
      >
        {IconComponent ? (
          <span className={variantIconClassName} aria-hidden="true">
            <Icon icon={IconComponent} size="md" />
          </span>
        ) : null}
        <div className={contentClassName}>{children}</div>
      </RadixToast.Root>
    );
  }
);

Toast.displayName = 'Toast';

export const ToastTitle = React.forwardRef<HTMLDivElement, ToastTitleProps>(
  ({ className, children, ...props }, ref) => (
    <RadixToast.Title ref={ref} className={clsx(titleClassName, className)} {...props}>
      {children}
    </RadixToast.Title>
  )
);

ToastTitle.displayName = 'ToastTitle';

export const ToastDescription = React.forwardRef<HTMLDivElement, ToastDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <RadixToast.Description ref={ref} className={clsx(descriptionClassName, className)} {...props}>
      {children}
    </RadixToast.Description>
  )
);

ToastDescription.displayName = 'ToastDescription';

export const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(
  ({ className, ...props }, ref) => (
    <RadixToast.Close asChild>
      <Button
        ref={ref}
        variant="ghost"
        size="icon-sm"
        icon={X}
        aria-label="Dismiss notification"
        className={clsx(closeButtonClassName, className)}
        {...props}
      />
    </RadixToast.Close>
  )
);

ToastClose.displayName = 'ToastClose';

export const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ altText, className, children, ...props }, ref) => (
    <RadixToast.Action altText={altText} asChild>
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={clsx(actionClassName, className)}
        {...props}
      >
        {children}
      </Button>
    </RadixToast.Action>
  )
);

ToastAction.displayName = 'ToastAction';

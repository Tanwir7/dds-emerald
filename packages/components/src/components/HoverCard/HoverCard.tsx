import clsx from 'clsx';
import React from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import styles from './HoverCard.module.scss';

export interface HoverCardProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  children: React.ReactNode;
}

interface HoverCardTriggerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  className?: string;
  children: React.ReactElement;
}

export interface HoverCardContentProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  showArrow?: boolean;
  className?: string;
  children: React.ReactNode;
}

type HoverCardArrowProps = Omit<React.SVGAttributes<SVGSVGElement>, 'width' | 'height'>;

export const HoverCard = ({
  open,
  defaultOpen,
  onOpenChange,
  openDelay = 400,
  closeDelay = 200,
  children,
}: HoverCardProps) => (
  <HoverCardPrimitive.Root
    {...(open !== undefined ? { open } : {})}
    {...(defaultOpen !== undefined ? { defaultOpen } : {})}
    {...(onOpenChange !== undefined ? { onOpenChange } : {})}
    openDelay={openDelay}
    closeDelay={closeDelay}
  >
    {children}
  </HoverCardPrimitive.Root>
);

HoverCard.displayName = 'HoverCard';

export const HoverCardTrigger = React.forwardRef<HTMLElement, HoverCardTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <HoverCardPrimitive.Trigger
      ref={ref as React.ForwardedRef<HTMLAnchorElement>}
      asChild
      className={className}
      {...props}
    >
      {children}
    </HoverCardPrimitive.Trigger>
  )
);

HoverCardTrigger.displayName = 'HoverCardTrigger';

export const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  (
    {
      side = 'bottom',
      sideOffset = 8,
      align = 'center',
      alignOffset = 0,
      showArrow = true,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        ref={ref}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={clsx(styles.content, className)}
        {...props}
      >
        {showArrow ? <HoverCardArrow /> : null}
        {children}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  )
);

HoverCardContent.displayName = 'HoverCardContent';

export const HoverCardArrow = React.forwardRef<SVGSVGElement, HoverCardArrowProps>(
  ({ className, ...props }, ref) => (
    <HoverCardPrimitive.Arrow
      ref={ref}
      className={clsx(styles.arrow, className)}
      width={12}
      height={6}
      {...props}
    />
  )
);

HoverCardArrow.displayName = 'HoverCardArrow';

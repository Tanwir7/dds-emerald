import clsx from 'clsx';
import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import styles from './Tooltip.module.scss';

export interface TooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  delayDuration?: number;
  disableHoverableContent?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactElement;
}

export interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
}

/**
 * Wrap the application or a subtree in `TooltipProvider` once so related tooltips
 * share consistent open and close timing behavior.
 */
export const TooltipProvider = ({
  children,
  delayDuration,
  skipDelayDuration,
  disableHoverableContent,
}: TooltipProviderProps) => (
  <TooltipPrimitive.Provider
    {...(delayDuration !== undefined ? { delayDuration } : {})}
    {...(skipDelayDuration !== undefined ? { skipDelayDuration } : {})}
    {...(disableHoverableContent !== undefined ? { disableHoverableContent } : {})}
  >
    {children}
  </TooltipPrimitive.Provider>
);
TooltipProvider.displayName = 'TooltipProvider';

export const Tooltip = ({
  content,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  delayDuration,
  disableHoverableContent = true,
  disabled = false,
  className,
  children,
}: TooltipProps) => {
  if (disabled) {
    return children;
  }

  return (
    <TooltipPrimitive.Root
      {...(delayDuration !== undefined ? { delayDuration } : {})}
      disableHoverableContent={disableHoverableContent}
    >
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={clsx(styles.content, className)}
        >
          {content}
          <TooltipPrimitive.Arrow className={styles.arrow} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};

Tooltip.displayName = 'Tooltip';

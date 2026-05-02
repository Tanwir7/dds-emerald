import clsx from 'clsx';
import React from 'react';
import styles from './Timeline.module.scss';

export type TimelineLayout = 'default' | 'alternate';
export type TimelineStatus = 'completed' | 'active' | 'pending' | 'error';

type TimelineTitleElement = 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';

type TimelineContextValue = {
  layout: TimelineLayout;
};

type TimelineItemContextValue = {
  status: TimelineStatus;
};

const TimelineContext = React.createContext<TimelineContextValue>({
  layout: 'default',
});

const TimelineItemContext = React.createContext<TimelineItemContextValue>({
  status: 'pending',
});

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  layout?: TimelineLayout;
  className?: string | undefined;
  children: React.ReactNode;
}

export interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {
  status?: TimelineStatus;
  last?: boolean;
  className?: string | undefined;
  children: React.ReactNode;
}

export interface TimelineNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: TimelineStatus;
  className?: string | undefined;
  children?: React.ReactNode;
}

export interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string | undefined;
  children: React.ReactNode;
}

export interface TimelineTitleProps extends React.HTMLAttributes<HTMLElement> {
  as?: TimelineTitleElement;
  className?: string | undefined;
  children: React.ReactNode;
}

export interface TimelineDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string | undefined;
  children: React.ReactNode;
}

export interface TimelineTimestampProps extends React.HTMLAttributes<HTMLElement> {
  dateTime?: string;
  className?: string | undefined;
  children: React.ReactNode;
}

export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ layout = 'default', className, children, ...props }, ref) => (
    <TimelineContext.Provider value={{ layout }}>
      <ol
        ref={ref}
        className={clsx(styles.timeline, styles[`layout-${layout}`], className)}
        {...props}
      >
        {children}
      </ol>
    </TimelineContext.Provider>
  )
);

Timeline.displayName = 'Timeline';

export const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ status = 'pending', last = false, className, children, ...props }, ref) => {
    const { layout } = React.useContext(TimelineContext);

    return (
      <TimelineItemContext.Provider value={{ status }}>
        <li
          ref={ref}
          className={clsx(
            styles.item,
            styles[`status-${status}`],
            last && styles.itemLast,
            layout === 'alternate' && styles.itemAlternate,
            className
          )}
          {...props}
        >
          {children}
        </li>
      </TimelineItemContext.Provider>
    );
  }
);

TimelineItem.displayName = 'TimelineItem';

export const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { status } = React.useContext(TimelineItemContext);

  return (
    <div
      ref={ref}
      className={clsx(styles.connector, styles[`connector-${status}`], className)}
      aria-hidden="true"
      {...props}
    />
  );
});

TimelineConnector.displayName = 'TimelineConnector';

export const TimelineNode = React.forwardRef<HTMLDivElement, TimelineNodeProps>(
  ({ status: statusProp, className, children, ...props }, ref) => {
    const { status: inheritedStatus } = React.useContext(TimelineItemContext);
    const status = statusProp ?? inheritedStatus;

    const defaultDot = (
      <span className={clsx(styles.dot, styles[`dot-${status}`])} aria-hidden="true">
        {status === 'error' ? (
          <span className={styles.dotErrorGlyph} aria-hidden="true">
            ×
          </span>
        ) : null}
      </span>
    );

    return (
      <div ref={ref} className={clsx(styles.node, styles[`node-${status}`], className)} {...props}>
        {children ?? defaultDot}
      </div>
    );
  }
);

TimelineNode.displayName = 'TimelineNode';

export const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.content, className)} {...props}>
      {children}
    </div>
  )
);

TimelineContent.displayName = 'TimelineContent';

export const TimelineTitle = React.forwardRef<HTMLElement, TimelineTitleProps>(
  ({ as: Component = 'p', className, children, ...props }, ref) => (
    <Component
      ref={ref as React.ForwardedRef<HTMLParagraphElement>}
      className={clsx(styles.title, className)}
      {...props}
    >
      {children}
    </Component>
  )
);

TimelineTitle.displayName = 'TimelineTitle';

export const TimelineDescription = React.forwardRef<HTMLParagraphElement, TimelineDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={clsx(styles.description, className)} {...props}>
      {children}
    </p>
  )
);

TimelineDescription.displayName = 'TimelineDescription';

export const TimelineTimestamp = React.forwardRef<HTMLElement, TimelineTimestampProps>(
  ({ dateTime, className, children, ...props }, ref) => (
    <time
      ref={ref as React.ForwardedRef<HTMLTimeElement>}
      dateTime={dateTime}
      className={clsx(styles.timestamp, className)}
      {...props}
    >
      {children}
    </time>
  )
);

TimelineTimestamp.displayName = 'TimelineTimestamp';

import clsx from 'clsx';
import React from 'react';
import type { LucideIcon } from 'lucide-react';
import styles from './StatCard.module.scss';

export type StatCardDelta = {
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  label?: string;
};

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  delta?: StatCardDelta;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
}

const trendClassName = {
  up: styles.trendUp,
  down: styles.trendDown,
  neutral: styles.trendNeutral,
} as const;

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, delta, icon: Icon, size = 'md', loading = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(styles.root, styles[size], loading && styles.loading, className)}
      {...props}
    >
      <div className={styles.labelRow}>
        {Icon ? (
          <span className={styles.icon} aria-hidden="true">
            <Icon />
          </span>
        ) : null}
        <span className={styles.label}>{label}</span>
      </div>

      {loading ? (
        <div className={styles.valueSkeleton} aria-hidden="true" />
      ) : (
        <p className={styles.value}>{value}</p>
      )}

      {!loading && delta ? (
        <div className={clsx(styles.delta, delta.trend && trendClassName[delta.trend])}>
          <span className={styles.deltaValue} aria-label={`Change: ${delta.value}`}>
            {delta.value}
          </span>
          {delta.label ? <span className={styles.deltaLabel}>{delta.label}</span> : null}
        </div>
      ) : null}
    </div>
  )
);

StatCard.displayName = 'StatCard';

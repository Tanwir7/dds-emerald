import clsx from 'clsx';
import { Check, Copy } from 'lucide-react';
import React from 'react';
import styles from './KeyValueRow.module.scss';
import { Icon } from '../Icon';

export type KeyValueRowLayout = 'stacked' | 'inline';
export type KeyValueRowSize = 'sm' | 'md';

type KeyValueContextValue = {
  layout: KeyValueRowLayout;
  labelWidth: string;
  size: KeyValueRowSize;
};

const KeyValueContext = React.createContext<KeyValueContextValue>({
  layout: 'inline',
  labelWidth: '140px',
  size: 'md',
});

const copyTextWithSelectionFallback = async (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.setAttribute('aria-hidden', 'true');
  textarea.tabIndex = -1;
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.opacity = '0';

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  try {
    if (typeof document.execCommand !== 'function') {
      return false;
    }

    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
};

export interface KeyValueRowProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onCopy'
> {
  label: string;
  layout?: KeyValueRowLayout;
  labelWidth?: string;
  copyable?: boolean;
  onCopy?: (value: string) => void;
  valueAs?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}

export interface KeyValueListProps extends Omit<
  React.HTMLAttributes<HTMLDListElement>,
  'children'
> {
  layout?: KeyValueRowLayout;
  labelWidth?: string;
  dividers?: boolean;
  size?: KeyValueRowSize;
  className?: string;
  children: React.ReactNode;
}

export const KeyValueList = React.forwardRef<HTMLDListElement, KeyValueListProps>(
  (
    {
      layout = 'inline',
      labelWidth = '140px',
      dividers = false,
      size = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const contextValue = React.useMemo(
      () => ({
        layout,
        labelWidth,
        size,
      }),
      [labelWidth, layout, size]
    );

    return (
      <KeyValueContext.Provider value={contextValue}>
        <dl
          ref={ref}
          className={clsx(styles.list, styles[size], dividers && styles.dividers, className)}
          {...props}
        >
          {children}
        </dl>
      </KeyValueContext.Provider>
    );
  }
);

KeyValueList.displayName = 'KeyValueList';

export const KeyValueRow = React.forwardRef<HTMLDivElement, KeyValueRowProps>(
  (
    {
      label,
      layout,
      labelWidth,
      copyable = false,
      onCopy,
      valueAs: ValueTag = 'dd',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const context = React.useContext(KeyValueContext);
    const [copied, setCopied] = React.useState(false);
    const valueContentRef = React.useRef<HTMLSpanElement>(null);
    const resetTimeoutRef = React.useRef<number | null>(null);

    const effectiveLayout = layout ?? context.layout;
    const effectiveLabelWidth = labelWidth ?? context.labelWidth;
    const effectiveSize = context.size;
    const inlineStyle =
      effectiveLayout === 'inline'
        ? ({
            '--dds-key-value-row-label-width': effectiveLabelWidth,
          } as React.CSSProperties)
        : undefined;

    React.useEffect(() => {
      return () => {
        if (resetTimeoutRef.current !== null) {
          window.clearTimeout(resetTimeoutRef.current);
        }
      };
    }, []);

    const handleCopy = async () => {
      const text = valueContentRef.current?.textContent ?? '';

      try {
        if (navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(text);
          } catch {
            const didCopy = await copyTextWithSelectionFallback(text);

            if (!didCopy) {
              return;
            }
          }
        } else {
          const didCopy = await copyTextWithSelectionFallback(text);

          if (!didCopy) {
            return;
          }
        }

        setCopied(true);
        onCopy?.(text);

        if (resetTimeoutRef.current !== null) {
          window.clearTimeout(resetTimeoutRef.current);
        }

        resetTimeoutRef.current = window.setTimeout(() => {
          setCopied(false);
          resetTimeoutRef.current = null;
        }, 2000);
      } catch {
        // Clipboard access can be unavailable in restricted environments.
      }
    };

    return (
      <div
        ref={ref}
        className={clsx(styles.row, styles[effectiveLayout], styles[effectiveSize], className)}
        style={inlineStyle}
        {...props}
      >
        <dt className={styles.label}>{label}</dt>
        <ValueTag className={clsx(styles.value, copyable && styles.hasCopy)}>
          <span ref={valueContentRef} className={styles.valueContent}>
            {children}
          </span>
          {copyable ? (
            <button
              type="button"
              className={styles.copyBtn}
              onClick={handleCopy}
              aria-label={`Copy ${label}`}
            >
              <Icon icon={copied ? Check : Copy} size="md" aria-hidden="true" />
            </button>
          ) : null}
          {copyable ? (
            <span role="status" aria-live="polite" className={styles.srOnly}>
              {copied ? 'Copied!' : ''}
            </span>
          ) : null}
        </ValueTag>
      </div>
    );
  }
);

KeyValueRow.displayName = 'KeyValueRow';

import * as ScrollArea from '@radix-ui/react-scroll-area';
import clsx from 'clsx';
import { Check, Copy } from 'lucide-react';
import React from 'react';
import styles from './CodeBlock.module.scss';
import { Icon } from '../Icon';

interface CodeBlockBaseProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onCopy'
> {
  language?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  onCopy?: (code: string) => void;
  maxHeight?: string;
  wrapLong?: boolean;
  className?: string;
}

interface CodeBlockPlainTextProps extends Omit<CodeBlockBaseProps, 'code'> {
  code: string;
  highlightedHtml?: never;
}

interface CodeBlockHighlightedHtmlProps extends Omit<CodeBlockBaseProps, 'code'> {
  code?: string;
  highlightedHtml: string;
}

export type CodeBlockProps = CodeBlockPlainTextProps | CodeBlockHighlightedHtmlProps;

type CodeBlockStyle = React.CSSProperties & {
  '--dds-code-block-max-height'?: string;
};

const getPlainTextFromHtml = (html: string) => html.replace(/<[^>]+>/g, '');

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

/**
 * Display-only block code container with optional language label, copy affordance,
 * line numbers, and scrollable overflow.
 *
 * This component renders plain text in a semantic `<pre><code>` structure and does
 * not bundle syntax highlighting. Consumers can either pass plain text via `code`
 * or provide pre-highlighted markup via `highlightedHtml`.
 */
export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      code,
      highlightedHtml,
      language,
      showLineNumbers = false,
      showCopyButton = true,
      onCopy,
      maxHeight,
      wrapLong = false,
      className,
      ...props
    },
    ref
  ) => {
    const [copied, setCopied] = React.useState(false);
    const resetTimeoutRef = React.useRef<number | null>(null);
    const plainTextCode = code ?? getPlainTextFromHtml(highlightedHtml ?? '');

    React.useEffect(() => {
      return () => {
        if (resetTimeoutRef.current !== null) {
          window.clearTimeout(resetTimeoutRef.current);
        }
      };
    }, []);

    const handleCopy = async () => {
      const codeToCopy = plainTextCode;

      try {
        if (navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(codeToCopy);
          } catch {
            const didCopy = await copyTextWithSelectionFallback(codeToCopy);

            if (!didCopy) {
              return;
            }
          }
        } else {
          const didCopy = await copyTextWithSelectionFallback(codeToCopy);

          if (!didCopy) {
            return;
          }
        }

        setCopied(true);
        onCopy?.(codeToCopy);

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

    const inlineStyle: CodeBlockStyle | undefined = maxHeight
      ? {
          '--dds-code-block-max-height': maxHeight,
        }
      : undefined;

    const lineCount = plainTextCode.split('\n');

    return (
      <div
        ref={ref}
        className={clsx(styles.root, wrapLong && styles.wrapLong, className)}
        style={inlineStyle}
        {...props}
      >
        {(language || showCopyButton) && (
          <div className={styles.header}>
            {language ? <span className={styles.language}>{language}</span> : <span />}
            {showCopyButton ? (
              <button
                type="button"
                className={styles.copyBtn}
                onClick={handleCopy}
                aria-label="Copy code"
              >
                <Icon icon={copied ? Check : Copy} aria-hidden="true" />
                <span className={styles.copyLabel}>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            ) : null}
          </div>
        )}

        <ScrollArea.Root className={styles.scrollRoot} type="always">
          <ScrollArea.Viewport className={styles.scrollViewport} tabIndex={0}>
            <pre className={styles.pre}>
              {showLineNumbers ? (
                <span className={styles.lineNumbers} aria-hidden="true">
                  {lineCount.map((_, index) => (
                    <span key={index} className={styles.lineNumber}>
                      {index + 1}
                    </span>
                  ))}
                </span>
              ) : null}
              <code
                className={styles.code}
                dangerouslySetInnerHTML={highlightedHtml ? { __html: highlightedHtml } : undefined}
              >
                {highlightedHtml ? undefined : plainTextCode}
              </code>
            </pre>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar forceMount orientation="horizontal" className={styles.scrollbar}>
            <ScrollArea.Thumb className={styles.scrollThumb} />
          </ScrollArea.Scrollbar>
          <ScrollArea.Scrollbar forceMount orientation="vertical" className={styles.scrollbar}>
            <ScrollArea.Thumb className={styles.scrollThumb} />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner className={styles.corner} />
        </ScrollArea.Root>

        <span role="status" aria-live="polite" className={styles.srOnly}>
          {copied ? 'Code copied to clipboard' : ''}
        </span>
      </div>
    );
  }
);

CodeBlock.displayName = 'CodeBlock';

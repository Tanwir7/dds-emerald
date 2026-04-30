import React from 'react';
import clsx from 'clsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Select';
import styles from './Pagination.module.scss';

type PaginationSize = 'sm' | 'md';
type PageRangeItem = number | 'ellipsis-left' | 'ellipsis-right';

type PaginationBaseProps = Omit<React.ComponentPropsWithoutRef<'nav'>, 'children' | 'onChange'> & {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  size?: PaginationSize;
  disabled?: boolean;
};

type PaginationWithoutPageSizeProps = {
  showPageSize?: false;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
};

type PaginationWithPageSizeProps = {
  showPageSize: true;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageSizeChange: (size: number) => void;
};

export type PaginationProps = PaginationBaseProps &
  (PaginationWithoutPageSizeProps | PaginationWithPageSizeProps);

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index);

const FirstIcon = ({ className }: { className?: string | undefined }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    <path d="M11 4L7 8l4 4M5 4v8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronLeftIcon = ({ className }: { className?: string | undefined }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string | undefined }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LastIcon = ({ className }: { className?: string | undefined }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    <path d="M5 4l4 4-4 4M11 4v8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      siblingCount = 1,
      boundaryCount = 1,
      showFirstLast = true,
      showPrevNext = true,
      showPageSize = false,
      pageSize,
      pageSizeOptions = [...DEFAULT_PAGE_SIZE_OPTIONS],
      onPageSizeChange,
      size = 'md',
      disabled = false,
      className,
      'aria-label': ariaLabel = 'Pagination',
      ...props
    },
    ref
  ) => {
    const pageSizeId = React.useId();
    const pageSizeLabelId = React.useId();

    const pageRange = React.useMemo<PageRangeItem[]>(() => {
      const totalDisplayed = siblingCount * 2 + 3 + boundaryCount * 2;

      if (totalDisplayed >= totalPages) {
        return range(1, totalPages);
      }

      const leftSiblingIndex = Math.max(currentPage - siblingCount, boundaryCount + 1);
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - boundaryCount);

      const showLeftDots = leftSiblingIndex > boundaryCount + 2;
      const showRightDots = rightSiblingIndex < totalPages - boundaryCount - 1;

      const leftBoundary = range(1, boundaryCount);
      const rightBoundary = range(totalPages - boundaryCount + 1, totalPages);
      const middle = range(leftSiblingIndex, rightSiblingIndex);

      if (!showLeftDots && showRightDots) {
        return [...range(1, 3 + siblingCount * 2), 'ellipsis-right', ...rightBoundary];
      }

      if (showLeftDots && !showRightDots) {
        return [
          ...leftBoundary,
          'ellipsis-left',
          ...range(totalPages - (3 + siblingCount * 2) + 1, totalPages),
        ];
      }

      return [...leftBoundary, 'ellipsis-left', ...middle, 'ellipsis-right', ...rightBoundary];
    }, [boundaryCount, currentPage, siblingCount, totalPages]);

    const handlePageChange = (page: number) => {
      if (disabled) {
        return;
      }

      onPageChange(page);
    };

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={clsx(styles.root, styles[size], disabled && styles.disabled, className)}
        {...props}
      >
        <div className={styles.controls}>
          {showFirstLast ? (
            <button
              type="button"
              className={clsx(styles.btn, styles.navBtn)}
              onClick={() => handlePageChange(1)}
              disabled={disabled || currentPage === 1}
              aria-label="First page"
            >
              <FirstIcon className={styles.icon} />
            </button>
          ) : null}

          {showPrevNext ? (
            <button
              type="button"
              className={clsx(styles.btn, styles.navBtn)}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={disabled || currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeftIcon className={styles.icon} />
            </button>
          ) : null}

          {pageRange.map((item) =>
            typeof item === 'string' ? (
              <span key={item} className={styles.ellipsis} aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={clsx(styles.btn, styles.pageBtn, item === currentPage && styles.current)}
                onClick={() => handlePageChange(item)}
                disabled={disabled}
                aria-label={`Page ${item}`}
                aria-current={item === currentPage ? 'page' : undefined}
              >
                {item}
              </button>
            )
          )}

          {showPrevNext ? (
            <button
              type="button"
              className={clsx(styles.btn, styles.navBtn)}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={disabled || currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRightIcon className={styles.icon} />
            </button>
          ) : null}

          {showFirstLast ? (
            <button
              type="button"
              className={clsx(styles.btn, styles.navBtn)}
              onClick={() => handlePageChange(totalPages)}
              disabled={disabled || currentPage === totalPages}
              aria-label="Last page"
            >
              <LastIcon className={styles.icon} />
            </button>
          ) : null}
        </div>

        {showPageSize ? (
          <div className={styles.pageSizeRow}>
            <span id={pageSizeLabelId} className={styles.pageSizeLabel}>
              Items per page
            </span>
            <Select
              value={String(pageSize)}
              {...(showPageSize
                ? { onValueChange: (value: string) => onPageSizeChange?.(Number(value)) }
                : {})}
              disabled={disabled}
            >
              <SelectTrigger
                id={pageSizeId}
                aria-labelledby={pageSizeLabelId}
                className={styles.pageSizeSelect}
                size={size}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </nav>
    );
  }
);

Pagination.displayName = 'Pagination';

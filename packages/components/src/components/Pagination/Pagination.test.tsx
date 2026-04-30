// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { Pagination } from './Pagination';
import styles from './Pagination.module.scss';

expect.extend(toHaveNoViolations);

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  disabled: getRequiredClassName(styles, 'disabled'),
  current: getRequiredClassName(styles, 'current'),
  pageSizeLabel: getRequiredClassName(styles, 'pageSizeLabel'),
} as const;

const renderPagination = (props: Partial<React.ComponentProps<typeof Pagination>> = {}) => {
  const onPageChange = vi.fn();
  const paginationProps = {
    currentPage: 3,
    totalPages: 10,
    onPageChange,
    ...props,
  } as React.ComponentProps<typeof Pagination>;

  const view = render(<Pagination {...paginationProps} />);

  return {
    ...view,
    onPageChange,
  };
};

afterEach(() => {
  cleanup();
});

describe('Pagination', () => {
  describe('rendering', () => {
    it('renders a nav element', () => {
      renderPagination();
      expect(screen.getByRole('navigation', { name: 'Pagination' }).tagName).toBe('NAV');
    });

    it('nav has aria-label="Pagination" by default', () => {
      renderPagination();
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Pagination');
    });

    it('nav has custom aria-label when provided', () => {
      renderPagination({ 'aria-label': 'Table pagination' });
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Table pagination');
    });

    it('forwards className to nav', () => {
      renderPagination({ className: 'custom-pagination' });
      expect(screen.getByRole('navigation')).toHaveClass('custom-pagination');
    });

    it('forwards ref to nav HTMLElement', () => {
      const ref = React.createRef<HTMLElement>();
      render(<Pagination ref={ref} currentPage={2} totalPages={5} onPageChange={vi.fn()} />);

      expect(ref.current).toBe(screen.getByRole('navigation'));
      expect(ref.current?.tagName).toBe('NAV');
    });
  });

  describe('page buttons', () => {
    it('renders correct page number buttons for small totalPages without ellipsis', () => {
      renderPagination({ totalPages: 5, currentPage: 3 });

      expect(screen.queryByText('…')).not.toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /page /i })).toHaveLength(5);
      expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument();
    });

    it('current page button has aria-current="page" and current class', () => {
      renderPagination();
      const currentButton = screen.getByRole('button', { name: 'Page 3' });

      expect(currentButton).toHaveAttribute('aria-current', 'page');
      expect(currentButton).toHaveClass(classNames.current);
    });

    it('non-current page buttons do not have aria-current', () => {
      renderPagination();
      expect(screen.getByRole('button', { name: 'Page 4' })).not.toHaveAttribute('aria-current');
    });

    it('each page button has aria-label="Page N"', () => {
      renderPagination();
      expect(screen.getByRole('button', { name: 'Page 4' })).toBeInTheDocument();
    });

    it('clicking a page button calls onPageChange with that page number', async () => {
      const user = userEvent.setup();
      const { onPageChange } = renderPagination();

      await user.click(screen.getByRole('button', { name: 'Page 5' }));
      expect(onPageChange).toHaveBeenCalledWith(5);
    });

    it('current page button is still rendered as a button', () => {
      renderPagination();
      expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
    });
  });

  describe('previous and next controls', () => {
    it('renders previous and next buttons by default', () => {
      renderPagination();
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    });

    it('previous button is disabled when currentPage is 1', () => {
      renderPagination({ currentPage: 1 });
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    });

    it('next button is disabled when currentPage is totalPages', () => {
      renderPagination({ currentPage: 10 });
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    });

    it('clicking previous calls onPageChange(currentPage - 1)', async () => {
      const user = userEvent.setup();
      const { onPageChange } = renderPagination({ currentPage: 4 });

      await user.click(screen.getByRole('button', { name: 'Previous page' }));
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('clicking next calls onPageChange(currentPage + 1)', async () => {
      const user = userEvent.setup();
      const { onPageChange } = renderPagination({ currentPage: 4 });

      await user.click(screen.getByRole('button', { name: 'Next page' }));
      expect(onPageChange).toHaveBeenCalledWith(5);
    });

    it('showPrevNext=false hides previous and next buttons', () => {
      renderPagination({ showPrevNext: false });
      expect(screen.queryByRole('button', { name: 'Previous page' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
    });
  });

  describe('first and last controls', () => {
    it('renders first and last buttons by default', () => {
      renderPagination();
      expect(screen.getByRole('button', { name: 'First page' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Last page' })).toBeInTheDocument();
    });

    it('first button is disabled when currentPage is 1', () => {
      renderPagination({ currentPage: 1 });
      expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled();
    });

    it('last button is disabled when currentPage is totalPages', () => {
      renderPagination({ currentPage: 10 });
      expect(screen.getByRole('button', { name: 'Last page' })).toBeDisabled();
    });

    it('clicking first calls onPageChange(1)', async () => {
      const user = userEvent.setup();
      const { onPageChange } = renderPagination();

      await user.click(screen.getByRole('button', { name: 'First page' }));
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('clicking last calls onPageChange(totalPages)', async () => {
      const user = userEvent.setup();
      const { onPageChange } = renderPagination({ totalPages: 12 });

      await user.click(screen.getByRole('button', { name: 'Last page' }));
      expect(onPageChange).toHaveBeenCalledWith(12);
    });

    it('showFirstLast=false hides first and last buttons', () => {
      renderPagination({ showFirstLast: false });
      expect(screen.queryByRole('button', { name: 'First page' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Last page' })).not.toBeInTheDocument();
    });
  });

  describe('ellipsis algorithm', () => {
    it('renders ellipsis when totalPages exceeds the visible range', () => {
      renderPagination({ currentPage: 25, totalPages: 50 });
      expect(screen.getAllByText('…')).toHaveLength(2);
    });

    it('ellipsis items are aria-hidden', () => {
      renderPagination({ currentPage: 25, totalPages: 50 });
      for (const ellipsis of screen.getAllByText('…')) {
        expect(ellipsis).toHaveAttribute('aria-hidden', 'true');
      }
    });

    it('shows only right ellipsis when currentPage is near the start', () => {
      renderPagination({ currentPage: 2, totalPages: 10 });

      expect(screen.getAllByText('…')).toHaveLength(1);
      expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Page 6' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 10' })).toBeInTheDocument();
    });

    it('shows only left ellipsis when currentPage is near the end', () => {
      renderPagination({ currentPage: 9, totalPages: 10 });

      expect(screen.getAllByText('…')).toHaveLength(1);
      expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 6' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Page 5' })).not.toBeInTheDocument();
    });

    it('boundary pages remain visible without duplicates', () => {
      renderPagination({ currentPage: 25, totalPages: 50, boundaryCount: 2 });

      expect(screen.getAllByRole('button', { name: 'Page 1' })).toHaveLength(1);
      expect(screen.getAllByRole('button', { name: 'Page 2' })).toHaveLength(1);
      expect(screen.getAllByRole('button', { name: 'Page 49' })).toHaveLength(1);
      expect(screen.getAllByRole('button', { name: 'Page 50' })).toHaveLength(1);
    });
  });

  describe('page size selector', () => {
    it('does not render the page size selector by default', () => {
      renderPagination();
      expect(screen.queryByLabelText('Items per page')).not.toBeInTheDocument();
    });

    it('renders the page size selector when showPageSize is true', () => {
      renderPagination({ showPageSize: true, pageSize: 25, onPageSizeChange: vi.fn() });
      expect(screen.getByRole('combobox', { name: 'Items per page' })).toBeInTheDocument();
    });

    it('associates the label and select trigger via aria-labelledby and id', () => {
      renderPagination({ showPageSize: true, pageSize: 25, onPageSizeChange: vi.fn() });

      const select = screen.getByRole('combobox', { name: 'Items per page' });
      const label = screen.getByText('Items per page');

      expect(label).toHaveClass(classNames.pageSizeLabel);
      expect(label).toHaveAttribute('id');
      expect(select).toHaveAttribute('aria-labelledby', label.getAttribute('id'));
      expect(select).toHaveAttribute('id');
    });

    it('shows the correct page size and options', async () => {
      const user = userEvent.setup();
      renderPagination({
        showPageSize: true,
        pageSize: 25,
        pageSizeOptions: [10, 25, 50],
        onPageSizeChange: vi.fn(),
      });

      const select = screen.getByRole('combobox', { name: 'Items per page' });

      expect(select).toHaveTextContent('25');

      await user.click(select);

      const options = screen.getAllByRole('option');
      expect(options.map((option) => option.textContent)).toEqual(['10', '25', '50']);
    });

    it('changing the selector calls onPageSizeChange with a numeric value', async () => {
      const user = userEvent.setup();
      const onPageSizeChange = vi.fn();

      renderPagination({
        showPageSize: true,
        pageSize: 10,
        pageSizeOptions: [10, 25, 50],
        onPageSizeChange,
      });

      await user.click(screen.getByRole('combobox', { name: 'Items per page' }));
      await user.click(screen.getByRole('option', { name: '50' }));

      expect(onPageSizeChange).toHaveBeenCalledWith(50);
    });
  });

  describe('sizes', () => {
    it('applies the md class by default', () => {
      renderPagination();
      expect(screen.getByRole('navigation')).toHaveClass(classNames.root, classNames.md);
    });

    it('applies the sm class when size="sm"', () => {
      renderPagination({ size: 'sm' });
      expect(screen.getByRole('navigation')).toHaveClass(classNames.sm);
    });
  });

  describe('disabled state', () => {
    it('applies the disabled class when disabled is true', () => {
      renderPagination({ disabled: true });
      expect(screen.getByRole('navigation')).toHaveClass(classNames.disabled);
    });

    it('disables all buttons and the selector when disabled', async () => {
      const user = userEvent.setup();
      const onPageSizeChange = vi.fn();
      const { onPageChange } = renderPagination({
        disabled: true,
        showPageSize: true,
        pageSize: 25,
        pageSizeOptions: [10, 25, 50],
        onPageSizeChange,
      });

      for (const button of screen.getAllByRole('button')) {
        expect(button).toBeDisabled();
        await user.click(button);
      }

      expect(screen.getByRole('combobox', { name: 'Items per page' })).toBeDisabled();
      expect(onPageChange).not.toHaveBeenCalled();
      expect(onPageSizeChange).not.toHaveBeenCalled();
    });
  });

  describe('axe', () => {
    it('passes axe for basic pagination', async () => {
      const { container } = renderPagination({ totalPages: 5, currentPage: 3 });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes axe with ellipsis', async () => {
      const { container } = renderPagination({ totalPages: 50, currentPage: 25 });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes axe when currentPage is the first page', async () => {
      const { container } = renderPagination({ currentPage: 1, totalPages: 10 });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes axe when currentPage is the last page', async () => {
      const { container } = renderPagination({ currentPage: 10, totalPages: 10 });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes axe with page size controls', async () => {
      const { container } = renderPagination({
        showPageSize: true,
        pageSize: 25,
        onPageSizeChange: vi.fn(),
      });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes axe for size="sm"', async () => {
      const { container } = renderPagination({ size: 'sm' });
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

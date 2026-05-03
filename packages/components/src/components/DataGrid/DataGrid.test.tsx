import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi, beforeAll } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import buttonStyles from '../Button/Button.module.scss';
import type { DataGridColumn } from './DataGrid';
import { DataGrid } from './DataGrid';
import styles from './DataGrid.module.scss';

expect.extend(toHaveNoViolations);

beforeAll(() => {
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ??
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

afterEach(() => {
  cleanup();
});

interface PersonRow {
  id: string;
  name: string;
  role: string;
  team: string;
  status: string;
}

const rows: PersonRow[] = [
  {
    id: 'maya',
    name: 'Maya Chen',
    role: 'Engineering Manager',
    team: 'Platform',
    status: 'Active',
  },
  { id: 'ava', name: 'Ava Martinez', role: 'Support Lead', team: 'Operations', status: 'Pending' },
  {
    id: 'noah',
    name: 'Noah Patel',
    role: 'Product Designer',
    team: 'Design Systems',
    status: 'Active',
  },
];

const columns: DataGridColumn<PersonRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    filterable: true,
    filterPlaceholder: 'Filter names',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'team',
    header: 'Team',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

const renderDataGrid = (props: Partial<React.ComponentProps<typeof DataGrid<PersonRow>>> = {}) =>
  render(
    <DataGrid
      aria-label="Team data grid"
      columns={columns}
      data={rows}
      getRowId={(row) => row.id}
      {...props}
    />
  );

describe('DataGrid', () => {
  it('renders a grid with headers, rows, toolbar, and pagination', () => {
    renderDataGrid();

    expect(screen.getByRole('grid', { name: 'Team data grid' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sort by name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filter Name' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search all columns' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Maya Chen' })).toBeInTheDocument();
  });

  it('updates sort state and aria-sort when a sortable header is activated', async () => {
    const user = userEvent.setup();

    renderDataGrid();

    const nameSortButton = screen.getByRole('button', { name: /sort by name/i });
    const nameHeader = screen.getByRole('columnheader', { name: /name/i });

    expect(nameHeader).toHaveAttribute('aria-sort', 'none');

    await user.click(nameSortButton);
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

    await user.click(nameSortButton);
    expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
  });

  it('filters rows from the global search input', async () => {
    const user = userEvent.setup();

    renderDataGrid();

    await user.type(screen.getByRole('searchbox', { name: 'Search all columns' }), 'Support');

    expect(screen.getByRole('cell', { name: 'Ava Martinez' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Maya Chen' })).not.toBeInTheDocument();
  });

  it('opens a column filter popover and filters rows from the header trigger', async () => {
    const user = userEvent.setup();

    renderDataGrid();

    expect(screen.queryByRole('textbox', { name: 'Filter Name' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filter Name' }));

    const filterInput = await screen.findByRole('textbox', { name: 'Filter Name' });

    await user.type(filterInput, 'Ava');

    expect(screen.getByRole('cell', { name: 'Ava Martinez' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Maya Chen' })).not.toBeInTheDocument();
  });

  it('does not sort a column when opening its filter popover', async () => {
    const user = userEvent.setup();

    renderDataGrid();

    const nameHeader = screen.getByRole('columnheader', { name: /name/i });

    expect(nameHeader).toHaveAttribute('aria-sort', 'none');

    await user.click(screen.getByRole('button', { name: 'Filter Name' }));

    expect(nameHeader).toHaveAttribute('aria-sort', 'none');
  });

  it('supports explicit header alignment per column', () => {
    const alignedColumns: DataGridColumn<PersonRow>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
        headerAlign: 'center',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        headerAlign: 'right',
      },
    ];

    render(
      <DataGrid
        aria-label="Aligned data grid"
        columns={alignedColumns}
        data={rows}
        getRowId={(row) => row.id}
      />
    );

    expect(styles.alignCenter).toBeDefined();
    expect(styles.alignRight).toBeDefined();
    expect(screen.getByRole('columnheader', { name: /name/i })).toHaveClass(styles.alignCenter!);
    expect(screen.getByRole('columnheader', { name: /status/i })).toHaveClass(styles.alignRight!);
  });

  it('renders row selection controls and updates row selection state', async () => {
    const user = userEvent.setup();

    renderDataGrid({ enableRowSelection: true });

    const selectRow = screen.getByRole('checkbox', { name: 'Select row 1' });

    await user.click(selectRow);

    expect(screen.getAllByRole('row')[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('invokes row click from keyboard interaction', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    renderDataGrid({ onRowClick });

    const row = screen.getAllByRole('row')[1];

    if (!row) {
      throw new Error('Expected at least one data row');
    }

    row.focus();
    await user.keyboard('{Enter}');

    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it('toggles column visibility from the toolbar menu', async () => {
    const user = userEvent.setup();

    renderDataGrid();

    const toggleButton = screen.getByRole('button', { name: 'Toggle column visibility' });

    expect(toggleButton).toHaveClass(buttonStyles.variantGhost!);
    expect(toggleButton).not.toHaveAttribute('title');

    await user.click(toggleButton);
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Status' }));

    expect(screen.queryByRole('columnheader', { name: /status/i })).not.toBeInTheDocument();
  });

  it('uses the DDS tooltip for the column visibility button', async () => {
    const user = userEvent.setup();

    renderDataGrid();

    const toggleButton = screen.getByRole('button', { name: 'Toggle column visibility' });

    await user.hover(toggleButton);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Columns');
    expect(toggleButton).toHaveAttribute(
      'aria-describedby',
      screen.getByRole('tooltip').getAttribute('id')
    );
  });

  it('does not render a resize handle on the last visible header column', () => {
    renderDataGrid();

    expect(screen.queryByRole('separator', { name: 'Resize Status' })).not.toBeInTheDocument();
    expect(screen.getByRole('separator', { name: 'Resize Name' })).toBeInTheDocument();
  });

  it('renders row actions with a dropdown trigger', async () => {
    const user = userEvent.setup();
    const onInspect = vi.fn();

    renderDataGrid({
      rowActions: [
        {
          label: 'Inspect',
          onClick: onInspect,
        },
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Actions for row 1' }));
    await user.click(screen.getByRole('menuitem', { name: 'Inspect' }));

    expect(onInspect).toHaveBeenCalledTimes(1);
  });

  it('renders loading skeleton rows and marks the grid busy', () => {
    renderDataGrid({ isLoading: true, loadingRowCount: 3 });

    const grid = screen.getByRole('grid', { name: 'Team data grid' });

    expect(grid).toHaveAttribute('aria-busy', 'true');
    expect(screen.getAllByRole('row', { hidden: true }).length).toBeGreaterThanOrEqual(4);
  });

  it('renders the empty state when no rows are available', () => {
    renderDataGrid({
      data: [],
      emptyMessage: 'Nothing here',
      emptyDescription: 'Adjust your filters and try again.',
    });

    const status = screen.getByRole('status');

    expect(within(status).getByText('Nothing here')).toBeInTheDocument();
    expect(within(status).getByText('Adjust your filters and try again.')).toBeInTheDocument();
  });

  it('supports expandable rows with custom sub-row content', async () => {
    const user = userEvent.setup();

    renderDataGrid({
      enableExpanding: true,
      renderSubRow: (row) => <div>Expanded details for {row.original.name}</div>,
    });

    await user.click(screen.getByRole('button', { name: 'Expand row 1' }));

    expect(screen.getByText('Expanded details for Maya Chen')).toBeInTheDocument();
  });

  it('passes axe accessibility checks', async () => {
    const { container } = renderDataGrid({
      enableRowSelection: true,
      rowActions: [{ label: 'Inspect', onClick: vi.fn() }],
    });

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});

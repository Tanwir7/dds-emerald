import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import storyStyles from './DataGrid.stories.module.scss';
import { DataGrid, type DataGridColumn } from './DataGrid';
import { storySourceParameters } from '../../utils/storySource';

type InvoiceRow = {
  id: string;
  account: string;
  owner: string;
  stage: string;
  value: string;
};

const rows: InvoiceRow[] = [
  {
    id: 'inv-1',
    account: 'Northline Energy',
    owner: 'Maya Chen',
    stage: 'Review',
    value: '$182,000',
  },
  {
    id: 'inv-2',
    account: 'Emerald Cloud',
    owner: 'Noah Patel',
    stage: 'Approved',
    value: '$94,500',
  },
  { id: 'inv-3', account: 'Atlas Retail', owner: 'Ava Martinez', stage: 'Draft', value: '$48,250' },
  { id: 'inv-4', account: 'Signal Labs', owner: 'Ethan Brown', stage: 'Review', value: '$63,900' },
];

const columns: DataGridColumn<InvoiceRow>[] = [
  {
    accessorKey: 'account',
    header: 'Account',
    sticky: 'left',
    filterable: true,
  },
  {
    accessorKey: 'owner',
    header: 'Owner',
    filterable: true,
  },
  {
    accessorKey: 'stage',
    header: 'Stage',
  },
  {
    accessorKey: 'value',
    header: 'Value',
    numeric: true,
  },
];

const meta: Meta<typeof DataGrid<InvoiceRow>> = {
  title: 'App Patterns/DataGrid',
  component: DataGrid<InvoiceRow>,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
};

export default meta;

type Story = StoryObj<typeof DataGrid<InvoiceRow>>;

const renderStory = (args: React.ComponentProps<typeof DataGrid<InvoiceRow>>, stack = false) => (
  <div className={storyStyles.storyA11yScope}>
    <div className={stack ? storyStyles.stackFrame : storyStyles.storyFrame}>
      <DataGrid {...args} />
    </div>
  </div>
);

export const Default: Story = {
  render: (args) =>
    renderStory({
      ...args,
      'aria-label': 'Invoices data grid',
      columns,
      data: rows,
      getRowId: (row) => row.id,
    }),
  parameters: storySourceParameters(
    `<DataGrid aria-label="Invoices data grid" columns={columns} data={rows} getRowId={(row) => row.id} />`
  ),
  play: async ({ canvasElement }) => {
    const grid = within(canvasElement).getByRole('grid', { name: 'Invoices data grid' });
    const accountHeader = within(grid).getByRole('columnheader', { name: /Account/ });
    await expect(accountHeader).toHaveAttribute('aria-sort', 'none');

    await userEvent.click(within(grid).getByRole('button', { name: /^Sort by Account/ }));
    await waitFor(() => expect(accountHeader).toHaveAttribute('aria-sort', 'ascending'));
  },
};

export const SelectableRows: Story = {
  render: (args) =>
    renderStory({
      ...args,
      'aria-label': 'Selectable invoices data grid',
      columns,
      data: rows,
      getRowId: (row) => row.id,
      enableRowSelection: true,
      rowActions: [
        { label: 'Preview', icon: Eye, onClick: () => undefined },
        { label: 'Edit', icon: Pencil, onClick: () => undefined },
        { label: 'Delete', icon: Trash2, destructive: true, onClick: () => undefined },
      ],
    }),
  parameters: storySourceParameters(
    `<DataGrid aria-label="Selectable invoices data grid" columns={columns} data={rows} enableRowSelection rowActions={rowActions} />`
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstRow = canvas.getByRole('checkbox', { name: 'Select row 1' });
    await expect(firstRow).not.toBeChecked();
    await userEvent.click(firstRow);
    await expect(firstRow).toBeChecked();

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all rows' }));
    await expect(canvas.getByRole('checkbox', { name: 'Select row 4' })).toBeChecked();
  },
};

export const ExpandableRows: Story = {
  render: (args) =>
    renderStory({
      ...args,
      'aria-label': 'Expandable invoices data grid',
      columns,
      data: rows,
      getRowId: (row) => row.id,
      enableExpanding: true,
      renderSubRow: (row) => (
        <div className={storyStyles.subRowContent}>
          <strong>{row.original.account}</strong>
          <span>Owner: {row.original.owner}</span>
          <span>Stage: {row.original.stage}</span>
        </div>
      ),
    }),
  parameters: storySourceParameters(
    `<DataGrid aria-label="Expandable invoices data grid" columns={columns} data={rows} enableExpanding renderSubRow={(row) => <Details row={row} />} />`
  ),
};

export const Loading: Story = {
  render: (args) =>
    renderStory({
      ...args,
      'aria-label': 'Loading invoices data grid',
      columns,
      data: rows,
      getRowId: (row) => row.id,
      isLoading: true,
    }),
  parameters: storySourceParameters(
    `<DataGrid aria-label="Loading invoices data grid" columns={columns} data={rows} isLoading />`
  ),
};

export const Empty: Story = {
  render: (args) =>
    renderStory({
      ...args,
      'aria-label': 'Empty invoices data grid',
      columns,
      data: [],
      emptyMessage: 'No invoices match the current filters',
      emptyDescription: 'Clear the search or adjust a column filter to broaden the results.',
    }),
  parameters: storySourceParameters(
    `<DataGrid aria-label="Empty invoices data grid" columns={columns} data={[]} emptyMessage="No invoices match the current filters" />`
  ),
};

export const ResponsiveStack: Story = {
  render: (args) =>
    renderStory(
      {
        ...args,
        'aria-label': 'Responsive invoices data grid',
        columns,
        data: rows,
        getRowId: (row) => row.id,
        responsiveMode: 'stack',
      },
      true
    ),
  parameters: storySourceParameters(
    `<DataGrid aria-label="Responsive invoices data grid" columns={columns} data={rows} responsiveMode="stack" />`
  ),
};

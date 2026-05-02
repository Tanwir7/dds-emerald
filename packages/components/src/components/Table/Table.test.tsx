import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import styles from './Table.module.scss';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeader,
  TableRow,
  TableScrollWrapper,
} from './Table';

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

const classNames = {
  table: getRequiredClassName(styles, 'table'),
  thead: getRequiredClassName(styles, 'thead'),
  tbody: getRequiredClassName(styles, 'tbody'),
  tfoot: getRequiredClassName(styles, 'tfoot'),
  row: getRequiredClassName(styles, 'row'),
  rowSelected: getRequiredClassName(styles, 'rowSelected'),
  rowDisabled: getRequiredClassName(styles, 'rowDisabled'),
  th: getRequiredClassName(styles, 'th'),
  td: getRequiredClassName(styles, 'td'),
  scrollWrapper: getRequiredClassName(styles, 'scrollWrapper'),
  stickyHeader: getRequiredClassName(styles, 'stickyHeader'),
  stickyCol: getRequiredClassName(styles, 'stickyCol'),
  striped: getRequiredClassName(styles, 'striped'),
  hoverable: getRequiredClassName(styles, 'hoverable'),
  bordered: getRequiredClassName(styles, 'bordered'),
  numeric: getRequiredClassName(styles, 'numeric'),
  truncate: getRequiredClassName(styles, 'truncate'),
  sortIconActive: getRequiredClassName(styles, 'sortIconActive'),
  'density-compact': getRequiredClassName(styles, 'density-compact'),
  'density-default': getRequiredClassName(styles, 'density-default'),
  'density-comfortable': getRequiredClassName(styles, 'density-comfortable'),
  'layout-auto': getRequiredClassName(styles, 'layout-auto'),
  'layout-fixed': getRequiredClassName(styles, 'layout-fixed'),
  'align-left': getRequiredClassName(styles, 'align-left'),
  'align-center': getRequiredClassName(styles, 'align-center'),
  'align-right': getRequiredClassName(styles, 'align-right'),
  'caption-top': getRequiredClassName(styles, 'caption-top'),
  'caption-bottom': getRequiredClassName(styles, 'caption-bottom'),
} as const;

const BasicTable = ({
  caption,
  ariaLabel,
  stickyHeader,
  striped,
  density,
}: {
  caption?: string;
  ariaLabel?: string;
  stickyHeader?: boolean;
  striped?: boolean;
  density?: React.ComponentProps<typeof Table>['density'];
}) => (
  <Table
    {...(caption ? { caption } : {})}
    {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
    {...(typeof stickyHeader === 'boolean' ? { stickyHeader } : {})}
    {...(typeof striped === 'boolean' ? { striped } : {})}
    {...(density ? { density } : {})}
  >
    <TableHead>
      <TableRow>
        <TableHeader>Name</TableHeader>
        <TableHeader sortable sortDirection="none">
          Role
        </TableHeader>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell>Maya Chen</TableCell>
        <TableCell>Engineering Manager</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

describe('Table', () => {
  it('renders as table', () => {
    const { container } = render(<BasicTable caption="Employee directory" />);

    expect(container.querySelector('table')).toBeInTheDocument();
  });

  it('TableHead renders as thead', () => {
    render(<BasicTable caption="Employee directory" />);

    expect(screen.getByRole('table').querySelector('thead')).toHaveClass(classNames.thead);
  });

  it('TableBody renders as tbody', () => {
    render(<BasicTable caption="Employee directory" />);

    expect(screen.getByRole('table').querySelector('tbody')).toHaveClass(classNames.tbody);
  });

  it('TableFoot renders as tfoot', () => {
    const { container } = render(
      <Table caption="Totals">
        <TableFoot>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFoot>
      </Table>
    );

    expect(container.querySelector('tfoot')).toHaveClass(classNames.tfoot);
  });

  it('TableRow renders as tr', () => {
    render(<BasicTable caption="Employee directory" />);

    const firstRow = screen.getAllByRole('row')[0];

    expect(firstRow).toBeDefined();
    expect(firstRow?.tagName).toBe('TR');
  });

  it('TableHeader renders as th', () => {
    render(<BasicTable caption="Employee directory" />);

    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveClass(classNames.th);
  });

  it('TableCell renders as td', () => {
    render(<BasicTable caption="Employee directory" />);

    expect(screen.getByRole('cell', { name: 'Maya Chen' })).toHaveClass(classNames.td);
  });

  it('TableCaption renders as caption', () => {
    render(<BasicTable caption="Employee directory" />);

    expect(screen.getByText('Employee directory').tagName).toBe('CAPTION');
  });

  it('TableHeader has scope="col" by default', () => {
    render(<BasicTable caption="Employee directory" />);

    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('scope', 'col');
  });

  it('applies density-compact class', () => {
    render(<BasicTable caption="Employee directory" density="compact" />);

    expect(screen.getByRole('table')).toHaveClass(classNames['density-compact']);
  });

  it('applies density-default class by default', () => {
    render(<BasicTable caption="Employee directory" />);

    expect(screen.getByRole('table')).toHaveClass(classNames['density-default']);
  });

  it('applies density-comfortable class', () => {
    render(<BasicTable caption="Employee directory" density="comfortable" />);

    expect(screen.getByRole('table')).toHaveClass(classNames['density-comfortable']);
  });

  it('applies striped class when striped is true', () => {
    render(<BasicTable caption="Employee directory" striped />);

    expect(screen.getByRole('table')).toHaveClass(classNames.striped);
  });

  it('applies hoverable class by default', () => {
    render(<BasicTable caption="Employee directory" />);

    expect(screen.getByRole('table')).toHaveClass(classNames.hoverable);
  });

  it('applies bordered class when bordered is true', () => {
    render(
      <Table caption="Employee directory" bordered>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByRole('table')).toHaveClass(classNames.bordered);
  });

  it('applies stickyHeader class when stickyHeader is true', () => {
    render(<BasicTable caption="Employee directory" stickyHeader />);

    expect(screen.getByRole('table')).toHaveClass(classNames.stickyHeader);
  });

  it('applies layout-fixed when layout is fixed', () => {
    render(
      <Table caption="Employee directory" layout="fixed">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByRole('table')).toHaveClass(classNames['layout-fixed']);
  });

  it('renders caption when caption prop is provided', () => {
    render(<BasicTable caption="Employee directory" />);

    expect(screen.getByText('Employee directory')).toBeInTheDocument();
  });

  it('forwards ref to table', () => {
    const ref = React.createRef<HTMLTableElement>();
    render(
      <Table ref={ref} caption="Employee directory">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(ref.current).toBeInstanceOf(HTMLTableElement);
  });

  it('forwards className', () => {
    render(
      <Table caption="Employee directory" className="custom-table">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByRole('table')).toHaveClass('custom-table');
  });

  it('TableHeader applies align-left by default', () => {
    render(<TableHeader>Name</TableHeader>);

    expect(screen.getByRole('columnheader')).toHaveClass(classNames['align-left']);
  });

  it('TableHeader applies align-right when align is right', () => {
    render(<TableHeader align="right">Revenue</TableHeader>);

    expect(screen.getByRole('columnheader')).toHaveClass(classNames['align-right']);
  });

  it('TableHeader applies align-center when align is center', () => {
    render(<TableHeader align="center">Status</TableHeader>);

    expect(screen.getByRole('columnheader')).toHaveClass(classNames['align-center']);
  });

  it('TableHeader applies numeric class when numeric is true', () => {
    render(<TableHeader numeric>Revenue</TableHeader>);

    expect(screen.getByRole('columnheader')).toHaveClass(
      classNames.numeric,
      classNames['align-right']
    );
  });

  it('renders ChevronsUpDown icon when sortable is true and sortDirection is none', () => {
    const { container } = render(
      <table>
        <thead>
          <tr>
            <TableHeader sortable sortDirection="none">
              Name
            </TableHeader>
          </tr>
        </thead>
      </table>
    );

    expect(container.querySelector('svg.lucide-chevrons-up-down')).toBeInTheDocument();
  });

  it('renders ChevronUp icon when sortDirection is asc', () => {
    const { container } = render(
      <table>
        <thead>
          <tr>
            <TableHeader sortable sortDirection="asc">
              Name
            </TableHeader>
          </tr>
        </thead>
      </table>
    );

    expect(container.querySelector('svg.lucide-chevron-up')).toBeInTheDocument();
  });

  it('renders ChevronDown icon when sortDirection is desc', () => {
    const { container } = render(
      <table>
        <thead>
          <tr>
            <TableHeader sortable sortDirection="desc">
              Name
            </TableHeader>
          </tr>
        </thead>
      </table>
    );

    expect(container.querySelector('svg.lucide-chevron-down')).toBeInTheDocument();
  });

  it('sort icon has aria-hidden true', () => {
    const { container } = render(
      <table>
        <thead>
          <tr>
            <TableHeader sortable sortDirection="asc">
              Name
            </TableHeader>
          </tr>
        </thead>
      </table>
    );

    expect(container.querySelector('svg.lucide-chevron-up')).toHaveAttribute('aria-hidden', 'true');
  });

  it('has aria-sort ascending when sortDirection is asc', () => {
    render(
      <TableHeader sortable sortDirection="asc">
        Name
      </TableHeader>
    );

    expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'ascending');
  });

  it('has aria-sort descending when sortDirection is desc', () => {
    render(
      <TableHeader sortable sortDirection="desc">
        Name
      </TableHeader>
    );

    expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'descending');
  });

  it('has aria-sort none when sortDirection is none', () => {
    render(
      <TableHeader sortable sortDirection="none">
        Name
      </TableHeader>
    );

    expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'none');
  });

  it('has no aria-sort when sortable is false', () => {
    render(<TableHeader>Name</TableHeader>);

    expect(screen.getByRole('columnheader')).not.toHaveAttribute('aria-sort');
  });

  it('TableHeader applies stickyCol class when sticky is true', () => {
    render(<TableHeader sticky>Name</TableHeader>);

    expect(screen.getByRole('columnheader')).toHaveClass(classNames.stickyCol);
  });

  it('TableCell applies numeric class and align-right when numeric is true', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell numeric>$40</TableCell>
          </tr>
        </tbody>
      </table>
    );

    expect(screen.getByRole('cell')).toHaveClass(classNames.numeric, classNames['align-right']);
  });

  it('TableCell applies truncate class when truncate is true', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell truncate>Very long value</TableCell>
          </tr>
        </tbody>
      </table>
    );

    expect(screen.getByRole('cell')).toHaveClass(classNames.truncate);
  });

  it('TableCell applies stickyCol class when sticky is true', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell sticky>Name</TableCell>
          </tr>
        </tbody>
      </table>
    );

    expect(screen.getByRole('cell')).toHaveClass(classNames.stickyCol);
  });

  it('TableRow sets aria-selected when selected is true', () => {
    render(
      <table>
        <tbody>
          <TableRow selected>
            <TableCell>Name</TableCell>
          </TableRow>
        </tbody>
      </table>
    );

    expect(screen.getByRole('row')).toHaveAttribute('aria-selected', 'true');
  });

  it('TableRow omits aria-selected when selected is false', () => {
    render(
      <table>
        <tbody>
          <TableRow>
            <TableCell>Name</TableCell>
          </TableRow>
        </tbody>
      </table>
    );

    expect(screen.getByRole('row')).not.toHaveAttribute('aria-selected');
  });

  it('TableRow sets aria-disabled when disabled is true', () => {
    render(
      <table>
        <tbody>
          <TableRow disabled>
            <TableCell>Name</TableCell>
          </TableRow>
        </tbody>
      </table>
    );

    expect(screen.getByRole('row')).toHaveAttribute('aria-disabled', 'true');
  });

  it('TableRow applies rowSelected class when selected is true', () => {
    render(
      <table>
        <tbody>
          <TableRow selected>
            <TableCell>Name</TableCell>
          </TableRow>
        </tbody>
      </table>
    );

    expect(screen.getByRole('row')).toHaveClass(classNames.rowSelected);
  });

  it('TableRow applies rowDisabled class when disabled is true', () => {
    render(
      <table>
        <tbody>
          <TableRow disabled>
            <TableCell>Name</TableCell>
          </TableRow>
        </tbody>
      </table>
    );

    expect(screen.getByRole('row')).toHaveClass(classNames.rowDisabled);
  });

  it('TableScrollWrapper renders with role region', () => {
    render(<TableScrollWrapper>content</TableScrollWrapper>);

    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('TableScrollWrapper has tabIndex 0', () => {
    render(<TableScrollWrapper>content</TableScrollWrapper>);

    expect(screen.getByRole('region')).toHaveAttribute('tabindex', '0');
  });

  it('TableScrollWrapper has aria-label', () => {
    render(<TableScrollWrapper>content</TableScrollWrapper>);

    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Scrollable table');
  });

  it('table has accessible name via caption', () => {
    render(<BasicTable caption="Employee directory" />);

    expect(screen.getByRole('table', { name: 'Employee directory' })).toBeInTheDocument();
  });

  it('table has accessible name via aria-label', () => {
    render(<BasicTable ariaLabel="Revenue table" />);

    expect(screen.getByRole('table', { name: 'Revenue table' })).toBeInTheDocument();
  });

  it('TableCaption applies caption-top class when side is top', () => {
    render(<TableCaption side="top">Top caption</TableCaption>);

    expect(screen.getByText('Top caption')).toHaveClass(classNames['caption-top']);
  });

  it('axe passes for a basic table with caption', async () => {
    const { container } = render(<BasicTable caption="Employee directory" />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes for a table with aria-label', async () => {
    const { container } = render(<BasicTable ariaLabel="Employee directory" />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes for stickyHeader', async () => {
    const { container } = render(<BasicTable caption="Employee directory" stickyHeader />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes for striped table', async () => {
    const { container } = render(<BasicTable caption="Employee directory" striped />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes for selected row', async () => {
    const { container } = render(
      <Table caption="Selected employee directory">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow selected>
            <TableCell>Maya Chen</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes for disabled row', async () => {
    const { container } = render(
      <Table caption="Disabled employee directory">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow disabled>
            <TableCell>Maya Chen</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes for sortable headers across sort directions', async () => {
    const { container } = render(
      <Table caption="Sortable employee directory">
        <TableHead>
          <TableRow>
            <TableHeader sortable sortDirection="asc">
              Name
            </TableHeader>
            <TableHeader sortable sortDirection="desc">
              Role
            </TableHeader>
            <TableHeader sortable sortDirection="none">
              Department
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Maya Chen</TableCell>
            <TableCell>Engineering Manager</TableCell>
            <TableCell>Platform</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes for sticky column', async () => {
    const { container } = render(
      <Table caption="Sticky employee directory">
        <TableHead>
          <TableRow>
            <TableHeader sticky>Name</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell sticky>Maya Chen</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes for numeric cells', async () => {
    const { container } = render(
      <Table caption="Revenue table">
        <TableHead>
          <TableRow>
            <TableHeader numeric>Revenue</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell numeric>$40</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes for table with TableFoot', async () => {
    const { container } = render(
      <Table caption="Totals">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Maya Chen</TableCell>
          </TableRow>
        </TableBody>
        <TableFoot>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFoot>
      </Table>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes for all density variants', async () => {
    const { container } = render(
      <>
        <BasicTable caption="Compact" density="compact" />
        <BasicTable caption="Default" density="default" />
        <BasicTable caption="Comfortable" density="comfortable" />
      </>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes inside TableScrollWrapper', async () => {
    const { container } = render(
      <TableScrollWrapper>
        <BasicTable caption="Employee directory" />
      </TableScrollWrapper>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

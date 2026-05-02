import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarFallback } from '../Avatar';
import { Button } from '../Button';
import { StatusIndicator } from '../StatusIndicator';
import { Tag } from '../Tag';
import storyStyles from './Table.stories.module.scss';
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
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const componentDescription = `Table is a lightweight semantic table primitive for static, read-only tabular data.

### Accessibility contract

- Keyboard: the table itself uses native table semantics, while \`TableScrollWrapper\` is keyboard-focusable so overflow content remains reachable.
- Screen readers: provide either a visible caption or an \`aria-label\` so the table has a clear accessible name; sortable headers communicate state through \`aria-sort\`.
- Focus: interactive content inside cells keeps its native focus behavior, and the scroll wrapper uses the standard DDS outline focus ring.
- Designers: use Table for read-only comparison, reporting, and directory layouts; move to a richer grid when you need sorting, filtering, or selection logic.
- QA: verify caption or label presence, \`scope\` on headers, sticky overflow behavior, numeric alignment, and axe coverage across variants.`;

const employees = [
  ['Maya Chen', 'Engineering Manager', 'Platform', 'Active', 'Jan 14, 2022'],
  ['Noah Patel', 'Product Designer', 'Design Systems', 'Active', 'Apr 03, 2023'],
  ['Ava Martinez', 'Support Lead', 'Operations', 'Pending', 'Nov 18, 2021'],
  ['Liam Johnson', 'Solutions Architect', 'Enterprise', 'Active', 'Jul 29, 2020'],
  ['Sophia Kim', 'Finance Analyst', 'Finance', 'Offline', 'May 09, 2024'],
  ['Ethan Brown', 'Content Strategist', 'Marketing', 'Active', 'Feb 26, 2022'],
] as const;

const financialRows = [
  ['Emerald Cloud', '$128.42', '+2.1%', '12.4M', '$4.1B'],
  ['Northline Energy', '$82.07', '-0.4%', '8.8M', '$2.7B'],
  ['Atlas Retail', '$56.19', '+1.8%', '18.9M', '$6.9B'],
] as const;

const meta: Meta<typeof Table> = {
  title: 'Core Components/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Table>;

const statusToVariant = {
  Active: 'success',
  Pending: 'warning',
  Offline: 'default',
} as const;

const EmployeeDirectoryTable = ({
  scrollLabel = 'Scrollable employee directory table',
  tableCaption = 'Employee directory',
  ...props
}: Partial<React.ComponentProps<typeof Table>> & {
  scrollLabel?: string;
  tableCaption?: string;
}) => (
  <TableScrollWrapper aria-label={scrollLabel}>
    <Table caption={tableCaption} {...props}>
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Role</TableHeader>
          <TableHeader>Department</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Joined</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {employees.map(([name, role, department, status, joined]) => (
          <TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell>{role}</TableCell>
            <TableCell>{department}</TableCell>
            <TableCell>
              <Tag size="sm" variant={statusToVariant[status]}>
                {status}
              </Tag>
            </TableCell>
            <TableCell>{joined}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableScrollWrapper>
);

export const Default: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <EmployeeDirectoryTable />
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<TableScrollWrapper>',
      '  <Table caption="Employee directory">',
      '    <TableHead>',
      '      <TableRow>',
      '        <TableHeader>Name</TableHeader>',
      '        <TableHeader>Role</TableHeader>',
      '        <TableHeader>Department</TableHeader>',
      '        <TableHeader>Status</TableHeader>',
      '        <TableHeader>Joined</TableHeader>',
      '      </TableRow>',
      '    </TableHead>',
      '    <TableBody>',
      '      <TableRow>',
      '        <TableCell>Maya Chen</TableCell>',
      '        <TableCell>Engineering Manager</TableCell>',
      '        <TableCell>Platform</TableCell>',
      '        <TableCell><Tag size="sm" variant="success">Active</Tag></TableCell>',
      '        <TableCell>Jan 14, 2022</TableCell>',
      '      </TableRow>',
      '    </TableBody>',
      '  </Table>',
      '</TableScrollWrapper>'
    )
  ),
};

export const Densities: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyGrid}>
        <EmployeeDirectoryTable
          density="compact"
          scrollLabel="Scrollable compact employee directory table"
          tableCaption="Employee directory compact density"
        />
        <EmployeeDirectoryTable
          density="default"
          scrollLabel="Scrollable default density employee directory table"
          tableCaption="Employee directory default density"
        />
        <EmployeeDirectoryTable
          density="comfortable"
          scrollLabel="Scrollable comfortable employee directory table"
          tableCaption="Employee directory comfortable density"
        />
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Table density="compact" caption="Employee directory">...</Table>',
      '<Table density="default" caption="Employee directory">...</Table>',
      '<Table density="comfortable" caption="Employee directory">...</Table>'
    )
  ),
};

export const Striped: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <TableScrollWrapper>
        <Table caption="Striped employee directory" striped>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Team</TableHeader>
              <TableHeader>Shift</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 8 }, (_, index) => (
              <TableRow key={`striped-${index + 1}`}>
                <TableCell>Employee {index + 1}</TableCell>
                <TableCell>Operations</TableCell>
                <TableCell>{index % 2 === 0 ? 'Morning' : 'Evening'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableScrollWrapper>
    </div>
  ),
  parameters: storySourceParameters(
    '<Table caption="Striped employee directory" striped>...</Table>'
  ),
};

export const Bordered: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <EmployeeDirectoryTable bordered />
    </div>
  ),
  parameters: storySourceParameters('<Table caption="Employee directory" bordered>...</Table>'),
};

export const StickyHeader: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <TableScrollWrapper className={storyStyles.stickyWrapper ?? ''}>
        <Table caption="Quarterly capacity planning" stickyHeader>
          <TableHead>
            <TableRow>
              <TableHeader>Region</TableHeader>
              <TableHeader>Owner</TableHeader>
              <TableHeader>Forecast</TableHeader>
              <TableHeader>Utilization</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 20 }, (_, index) => (
              <TableRow key={`sticky-${index + 1}`}>
                <TableCell>Region {index + 1}</TableCell>
                <TableCell>Manager {index + 1}</TableCell>
                <TableCell>{80 + index}%</TableCell>
                <TableCell>{55 + index}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableScrollWrapper>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<TableScrollWrapper style={{ maxHeight: 300, overflowY: "auto" }}>',
      '  <Table caption="Quarterly capacity planning" stickyHeader>',
      '    ...',
      '  </Table>',
      '</TableScrollWrapper>'
    )
  ),
};

export const StickyColumn: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <TableScrollWrapper>
        <Table caption="Product comparison matrix">
          <TableHead>
            <TableRow>
              <TableHeader sticky>Name</TableHeader>
              <TableHeader>Plan</TableHeader>
              <TableHeader>Seats</TableHeader>
              <TableHeader>Region</TableHeader>
              <TableHeader>Owner</TableHeader>
              <TableHeader>Renewal</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map(([name, role, department, status, joined]) => (
              <TableRow key={`${name}-sticky`}>
                <TableCell sticky>{name}</TableCell>
                <TableCell>{role}</TableCell>
                <TableCell>{department}</TableCell>
                <TableCell>{status}</TableCell>
                <TableCell>Regional pod</TableCell>
                <TableCell>{joined}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableScrollWrapper>
    </div>
  ),
  parameters: storySourceParameters(
    '<Table caption="Product comparison matrix"><TableHeader sticky>Name</TableHeader>...</Table>'
  ),
};

export const SortableHeaders: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <TableScrollWrapper>
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
              <TableHeader sortable sortDirection="none">
                Status
              </TableHeader>
              <TableHeader sortable sortDirection="none">
                Joined
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.slice(0, 4).map(([name, role, department, status, joined]) => (
              <TableRow key={`${name}-sortable`}>
                <TableCell>{name}</TableCell>
                <TableCell>{role}</TableCell>
                <TableCell>{department}</TableCell>
                <TableCell>{status}</TableCell>
                <TableCell>{joined}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableScrollWrapper>
    </div>
  ),
  parameters: storySourceParameters(
    '<Table caption="Sortable employee directory"><TableHeader sortable sortDirection="asc">Name</TableHeader>...</Table>'
  ),
};

export const NumericCells: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <TableScrollWrapper>
        <Table caption="Market snapshot">
          <TableHead>
            <TableRow>
              <TableHeader>Asset</TableHeader>
              <TableHeader numeric>Price</TableHeader>
              <TableHeader numeric>Change</TableHeader>
              <TableHeader numeric>Volume</TableHeader>
              <TableHeader numeric>Market Cap</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {financialRows.map(([asset, price, change, volume, marketCap]) => (
              <TableRow key={asset}>
                <TableCell>{asset}</TableCell>
                <TableCell numeric>{price}</TableCell>
                <TableCell numeric>{change}</TableCell>
                <TableCell numeric>{volume}</TableCell>
                <TableCell numeric>{marketCap}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFoot>
            <TableRow>
              <TableCell>Total tracked</TableCell>
              <TableCell numeric>$266.68</TableCell>
              <TableCell numeric>+3.5%</TableCell>
              <TableCell numeric>40.1M</TableCell>
              <TableCell numeric>$13.7B</TableCell>
            </TableRow>
          </TableFoot>
        </Table>
      </TableScrollWrapper>
    </div>
  ),
  parameters: storySourceParameters(
    '<Table caption="Market snapshot"><TableHeader numeric>Price</TableHeader>...</Table>'
  ),
};

export const SelectedRows: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <TableScrollWrapper>
        <Table caption="Selected employees">
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Role</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow selected>
              <TableCell>Maya Chen</TableCell>
              <TableCell>Engineering Manager</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Noah Patel</TableCell>
              <TableCell>Product Designer</TableCell>
            </TableRow>
            <TableRow selected>
              <TableCell>Ava Martinez</TableCell>
              <TableCell>Support Lead</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableScrollWrapper>
    </div>
  ),
  parameters: storySourceParameters('<Table caption="Selected employees">...</Table>'),
};

export const DisabledRows: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <TableScrollWrapper>
        <Table caption="Disabled rows example">
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Role</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Maya Chen</TableCell>
              <TableCell>Engineering Manager</TableCell>
            </TableRow>
            <TableRow disabled>
              <TableCell>Sophia Kim</TableCell>
              <TableCell>Finance Analyst</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Ethan Brown</TableCell>
              <TableCell>Content Strategist</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableScrollWrapper>
    </div>
  ),
  parameters: storySourceParameters('<Table caption="Disabled rows example">...</Table>'),
};

export const WithRichCellContent: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <TableScrollWrapper>
        <Table caption="Rich cell content example">
          <TableHead>
            <TableRow>
              <TableHeader>Owner</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Stage</TableHeader>
              <TableHeader>Action</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <div className={storyStyles.richCell}>
                  <Avatar size="sm">
                    <AvatarFallback>MC</AvatarFallback>
                  </Avatar>
                  <div className={storyStyles.richMeta}>
                    <span className={storyStyles.richName}>Maya Chen</span>
                    <span className={storyStyles.richSubtle}>Platform lead</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusIndicator status="success" label="Healthy account" />
              </TableCell>
              <TableCell>
                <Tag size="sm" variant="accent">
                  Review
                </Tag>
              </TableCell>
              <TableCell>
                <Button variant="secondary" size="sm">
                  Open
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className={storyStyles.richCell}>
                  <Avatar size="sm">
                    <AvatarFallback>NP</AvatarFallback>
                  </Avatar>
                  <div className={storyStyles.richMeta}>
                    <span className={storyStyles.richName}>Noah Patel</span>
                    <span className={storyStyles.richSubtle}>Design systems</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusIndicator status="warning" label="Pending confirmation" />
              </TableCell>
              <TableCell>
                <Tag size="sm" variant="warning">
                  Pending
                </Tag>
              </TableCell>
              <TableCell>
                <Button variant="secondary" size="sm">
                  Nudge
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableScrollWrapper>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Table caption="Rich cell content example">',
      '  <TableBody>',
      '    <TableRow>',
      '      <TableCell>',
      '        <Avatar size="sm"><AvatarFallback>MC</AvatarFallback></Avatar>',
      '      </TableCell>',
      '      <TableCell><StatusIndicator status="success" label="Healthy account" /></TableCell>',
      '      <TableCell><Tag size="sm" variant="accent">Review</Tag></TableCell>',
      '      <TableCell><Button variant="secondary" size="sm">Open</Button></TableCell>',
      '    </TableRow>',
      '  </TableBody>',
      '</Table>'
    )
  ),
};

export const Responsive: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.responsiveWrapper}>
        <TableScrollWrapper aria-label="Responsive performance table">
          <Table layout="fixed" aria-label="Responsive performance table">
            <TableCaption side="top">Responsive performance table</TableCaption>
            <TableHead>
              <TableRow>
                {[
                  'Account',
                  'Owner',
                  'Region',
                  'Plan',
                  'MRR',
                  'Renewal',
                  'Health',
                  'Pipeline',
                  'CSAT',
                  'NPS',
                ].map((label) => (
                  <TableHeader key={label}>{label}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 8 }, (_, index) => (
                <TableRow key={`responsive-${index + 1}`}>
                  <TableCell truncate>Account {index + 1} Holdings</TableCell>
                  <TableCell>Owner {index + 1}</TableCell>
                  <TableCell>North America</TableCell>
                  <TableCell>Enterprise</TableCell>
                  <TableCell numeric>${(index + 2) * 18}k</TableCell>
                  <TableCell>Q{(index % 4) + 1}</TableCell>
                  <TableCell>Healthy</TableCell>
                  <TableCell>{42 + index}%</TableCell>
                  <TableCell>{88 + index}%</TableCell>
                  <TableCell>{45 + index}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScrollWrapper>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    '<TableScrollWrapper aria-label="Responsive performance table"><Table aria-label="Responsive performance table">...</Table></TableScrollWrapper>'
  ),
};

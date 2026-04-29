import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Text } from '../Text';
import {
  FacetedFilter,
  FacetGroup,
  FacetItem,
  type FacetedFilterState,
  type FacetedFilterProps,
} from './FacetedFilter';
import { storySource, storySourceParameters } from '../../utils/storySource';
import storyStyles from './FacetedFilter.stories.module.scss';

const defaultState: FacetedFilterState = {
  priority: ['high'],
  status: ['open'],
};

const baseFilter = (props?: Partial<FacetedFilterProps>) => (
  <FacetedFilter {...props}>
    <FacetGroup groupKey="status" label="Status">
      <FacetItem value="open">Open</FacetItem>
      <FacetItem value="in-progress">In progress</FacetItem>
      <FacetItem value="closed">Closed</FacetItem>
    </FacetGroup>
    <FacetGroup groupKey="priority" label="Priority">
      <FacetItem value="low">Low</FacetItem>
      <FacetItem value="medium">Medium</FacetItem>
      <FacetItem value="high">High</FacetItem>
    </FacetGroup>
    <FacetGroup groupKey="assignee" label="Assignee">
      <FacetItem value="ada">Ada Lovelace</FacetItem>
      <FacetItem value="grace">Grace Hopper</FacetItem>
      <FacetItem value="margaret">Margaret Hamilton</FacetItem>
    </FacetGroup>
  </FacetedFilter>
);

const meta: Meta<typeof FacetedFilter> = {
  title: 'Grouped Components/FacetedFilter',
  component: FacetedFilter,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
};

export default meta;

type Story = StoryObj<typeof FacetedFilter>;

function ControlledExample() {
  const [value, setValue] = useState<FacetedFilterState>({
    status: ['open'],
    assignee: ['grace'],
  });

  return (
    <div className={storyStyles.storyA11yScope}>
      <FacetedFilter value={value} onChange={setValue}>
        <FacetGroup groupKey="status" label="Status">
          <FacetItem value="open">Open</FacetItem>
          <FacetItem value="in-progress">In progress</FacetItem>
          <FacetItem value="closed">Closed</FacetItem>
        </FacetGroup>
        <FacetGroup groupKey="assignee" label="Assignee">
          <FacetItem value="ada">Ada Lovelace</FacetItem>
          <FacetItem value="grace">Grace Hopper</FacetItem>
          <FacetItem value="margaret">Margaret Hamilton</FacetItem>
        </FacetGroup>
      </FacetedFilter>
      <pre className={storyStyles.storySelectionSummary}>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}

export const Default: Story = {
  render: () => <div className={storyStyles.storyA11yScope}>{baseFilter()}</div>,
  parameters: storySourceParameters(
    storySource(
      '<FacetedFilter>',
      '  <FacetGroup groupKey="status" label="Status">',
      '    <FacetItem value="open">Open</FacetItem>',
      '    <FacetItem value="in-progress">In progress</FacetItem>',
      '    <FacetItem value="closed">Closed</FacetItem>',
      '  </FacetGroup>',
      '  <FacetGroup groupKey="priority" label="Priority">',
      '    <FacetItem value="low">Low</FacetItem>',
      '    <FacetItem value="medium">Medium</FacetItem>',
      '    <FacetItem value="high">High</FacetItem>',
      '  </FacetGroup>',
      '  <FacetGroup groupKey="assignee" label="Assignee">',
      '    <FacetItem value="ada">Ada Lovelace</FacetItem>',
      '    <FacetItem value="grace">Grace Hopper</FacetItem>',
      '    <FacetItem value="margaret">Margaret Hamilton</FacetItem>',
      '  </FacetGroup>',
      '</FacetedFilter>'
    )
  ),
};

export const WithSelections: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>{baseFilter({ defaultValue: defaultState })}</div>
  ),
  parameters: storySourceParameters(
    '<FacetedFilter defaultValue={{ status: ["open"], priority: ["high"] }} />'
  ),
};

export const WithCounts: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <FacetedFilter>
        <FacetGroup groupKey="status" label="Status">
          <FacetItem value="open" count={24}>
            Open
          </FacetItem>
          <FacetItem value="in-progress" count={12}>
            In progress
          </FacetItem>
          <FacetItem value="closed" count={3}>
            Closed
          </FacetItem>
        </FacetGroup>
      </FacetedFilter>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<FacetedFilter>',
      '  <FacetGroup groupKey="status" label="Status">',
      '    <FacetItem value="open" count={24}>Open</FacetItem>',
      '    <FacetItem value="in-progress" count={12}>In progress</FacetItem>',
      '    <FacetItem value="closed" count={3}>Closed</FacetItem>',
      '  </FacetGroup>',
      '</FacetedFilter>'
    )
  ),
};

export const Searchable: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <FacetedFilter>
        <FacetGroup groupKey="priority" label="Priority" searchable>
          <FacetItem value="low">Low</FacetItem>
          <FacetItem value="medium">Medium</FacetItem>
          <FacetItem value="high">High</FacetItem>
          <FacetItem value="highest">Highest priority</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<FacetedFilter>',
      '  <FacetGroup groupKey="priority" label="Priority" searchable>',
      '    <FacetItem value="low">Low</FacetItem>',
      '    <FacetItem value="medium">Medium</FacetItem>',
      '    <FacetItem value="high">High</FacetItem>',
      '    <FacetItem value="highest">Highest priority</FacetItem>',
      '  </FacetGroup>',
      '</FacetedFilter>'
    )
  ),
};

export const MaxVisible: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <FacetedFilter>
        <FacetGroup groupKey="labels" label="Labels" maxVisible={4}>
          <FacetItem value="backend">Backend</FacetItem>
          <FacetItem value="frontend">Frontend</FacetItem>
          <FacetItem value="design">Design</FacetItem>
          <FacetItem value="ops">Ops</FacetItem>
          <FacetItem value="research">Research</FacetItem>
          <FacetItem value="qa">QA</FacetItem>
          <FacetItem value="docs">Docs</FacetItem>
          <FacetItem value="growth">Growth</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    </div>
  ),
  parameters: storySourceParameters(
    '<FacetGroup groupKey="labels" label="Labels" maxVisible={4}>...</FacetGroup>'
  ),
};

export const NonCollapsible: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <FacetedFilter>
        <FacetGroup groupKey="status" label="Status" collapsible={false}>
          <FacetItem value="open">Open</FacetItem>
          <FacetItem value="closed">Closed</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<FacetedFilter>',
      '  <FacetGroup groupKey="status" label="Status" collapsible={false}>',
      '    <FacetItem value="open">Open</FacetItem>',
      '    <FacetItem value="closed">Closed</FacetItem>',
      '  </FacetGroup>',
      '</FacetedFilter>'
    )
  ),
};

export const AllGroupsCollapsed: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <FacetedFilter>
        <FacetGroup groupKey="status" label="Status" defaultOpen={false}>
          <FacetItem value="open">Open</FacetItem>
          <FacetItem value="closed">Closed</FacetItem>
        </FacetGroup>
        <FacetGroup groupKey="priority" label="Priority" defaultOpen={false}>
          <FacetItem value="low">Low</FacetItem>
          <FacetItem value="high">High</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    </div>
  ),
  parameters: storySourceParameters(
    '<FacetGroup groupKey="status" label="Status" defaultOpen={false}>...</FacetGroup>'
  ),
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
  parameters: storySourceParameters(
    storySource(
      'const [value, setValue] = useState({ status: ["open"], assignee: ["grace"] });',
      '',
      '<FacetedFilter value={value} onChange={setValue}>',
      '  ...',
      '</FacetedFilter>'
    )
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <FacetedFilter defaultValue={{ status: ['open'] }}>
        <FacetGroup groupKey="status" label="Status">
          <FacetItem value="open">Open</FacetItem>
          <FacetItem value="blocked" disabled>
            Blocked
          </FacetItem>
          <FacetItem value="closed" disabled>
            Closed
          </FacetItem>
        </FacetGroup>
      </FacetedFilter>
    </div>
  ),
  parameters: storySourceParameters('<FacetItem value="blocked" disabled>Blocked</FacetItem>'),
};

export const SingleGroup: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <FacetedFilter>
        <FacetGroup groupKey="status" label="Status">
          <FacetItem value="open">Open</FacetItem>
          <FacetItem value="in-progress">In progress</FacetItem>
          <FacetItem value="closed">Closed</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    </div>
  ),
  parameters: storySourceParameters(
    '<FacetedFilter><FacetGroup groupKey="status" label="Status">...</FacetGroup></FacetedFilter>'
  ),
};

export const InSidebar: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storySidebarLayout}>
        <aside className={storyStyles.storySidebar}>
          {baseFilter({ defaultValue: defaultState })}
        </aside>
        <div className={storyStyles.storyContent}>
          <Text size="sm">Content area representing the filtered results pane.</Text>
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters('<aside><FacetedFilter>...</FacetedFilter></aside>'),
};

export const SelectAndClear: Story = {
  render: () => <div className={storyStyles.storyA11yScope}>{baseFilter()}</div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstCheckbox = canvas.getAllByRole('checkbox')[0];

    if (!firstCheckbox) {
      throw new Error('Expected at least one checkbox in the FacetedFilter story.');
    }

    await userEvent.click(firstCheckbox);
    await expect(firstCheckbox).toHaveAttribute('aria-checked', 'true');
    const clearButton = canvas.getByRole('button', { name: /clear all filters/i });
    await userEvent.click(clearButton);
    await expect(firstCheckbox).toHaveAttribute('aria-checked', 'false');
  },
  parameters: storySourceParameters('<FacetedFilter>...</FacetedFilter>'),
};

export const SearchFilter: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <FacetedFilter>
        <FacetGroup groupKey="priority" label="Priority" searchable>
          <FacetItem value="low">Low</FacetItem>
          <FacetItem value="medium">Medium</FacetItem>
          <FacetItem value="high">High</FacetItem>
          <FacetItem value="highest">Highest priority</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByRole('textbox', { name: /filter priority options/i });
    await userEvent.type(searchInput, 'high');
    await expect(canvas.getByText('High')).toBeInTheDocument();
    await expect(canvas.getByText('Highest priority')).toBeInTheDocument();
    await expect(canvas.queryByText('Low')).not.toBeInTheDocument();
  },
  parameters: storySourceParameters(
    '<FacetGroup groupKey="priority" label="Priority" searchable>...</FacetGroup>'
  ),
};

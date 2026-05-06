import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './FacetedFilter.module.scss';
import { FacetedFilter, FacetGroup, FacetItem, type FacetedFilterProps } from './FacetedFilter';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  group: getRequiredClassName(styles, 'group'),
  item: getRequiredClassName(styles, 'item'),
  itemDisabled: getRequiredClassName(styles, 'itemDisabled'),
  count: getRequiredClassName(styles, 'count'),
  clearAllBtn: getRequiredClassName(styles, 'clearAllBtn'),
  groupSearchInput: getRequiredClassName(styles, 'groupSearchInput'),
  showMoreBtn: getRequiredClassName(styles, 'showMoreBtn'),
} as const;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const renderFilter = (props: Partial<FacetedFilterProps> = {}) =>
  render(
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
    </FacetedFilter>
  );

describe('FacetedFilter', () => {
  it('renders root div', () => {
    const { container } = renderFilter();

    expect(container.firstChild).toHaveClass(classNames.root);
  });

  it('forwards className to root', () => {
    renderFilter({ className: 'custom-filter' });

    expect(screen.getByText('Status').closest(`.${classNames.root}`)).toHaveClass('custom-filter');
  });

  it('forwards ref to HTMLDivElement', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <FacetedFilter ref={ref}>
        <FacetGroup groupKey="status" label="Status">
          <FacetItem value="open">Open</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('clear all button not rendered when no items are selected', () => {
    renderFilter();

    expect(screen.queryByRole('button', { name: /clear all filters/i })).not.toBeInTheDocument();
  });

  it('clear all button rendered when at least one item is selected', () => {
    renderFilter({ defaultValue: { status: ['open'] } });

    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
  });

  it('clear all button not rendered when showClearAll is false', () => {
    renderFilter({ defaultValue: { status: ['open'] }, showClearAll: false });

    expect(screen.queryByRole('button', { name: /clear all filters/i })).not.toBeInTheDocument();
  });

  it('clicking clear all calls onClearAll', async () => {
    const user = userEvent.setup();
    const onClearAll = vi.fn();
    renderFilter({ defaultValue: { status: ['open'] }, onClearAll });

    await user.click(screen.getByRole('button', { name: /clear all filters/i }));

    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it('clicking clear all resets all selected values to empty arrays', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilter({
      defaultValue: {
        status: ['open'],
        priority: ['high'],
      },
      onChange,
    });

    await user.click(screen.getByRole('button', { name: /clear all filters/i }));

    expect(onChange).toHaveBeenLastCalledWith({
      status: [],
      priority: [],
    });
  });

  it('facet item checked state reflects parent faceted filter state', () => {
    renderFilter({ value: { status: ['open'] } });

    expect(screen.getAllByRole('checkbox')[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('toggling a facet item updates faceted filter state for the correct group', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilter({ onChange });

    await user.click(screen.getByText('High'));

    expect(onChange).toHaveBeenLastCalledWith({
      priority: ['high'],
    });
  });

  it('controlled value prop is respected', () => {
    renderFilter({ value: { priority: ['medium'] } });

    expect(screen.getAllByRole('checkbox')[4]).toHaveAttribute('aria-checked', 'true');
  });

  it('onChange is called with full state on every change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilter({ defaultValue: { status: ['open'] }, onChange });

    await user.click(screen.getByText('High'));

    expect(onChange).toHaveBeenLastCalledWith({
      status: ['open'],
      priority: ['high'],
    });
  });

  it('axe: passes with no items selected', async () => {
    const { container } = renderFilter();

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes with some items selected', async () => {
    const { container } = renderFilter({ defaultValue: { status: ['open'] } });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes with clear all visible', async () => {
    const { container } = renderFilter({ defaultValue: { priority: ['high'] } });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('FacetGroup', () => {
  it('renders group with label heading', () => {
    renderFilter();

    expect(screen.getByRole('button', { name: /status/i })).toBeInTheDocument();
  });

  it('renders children facet item elements', () => {
    renderFilter();

    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('group is open by default', () => {
    renderFilter();

    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('group can be closed by clicking the trigger', async () => {
    const user = userEvent.setup();
    renderFilter();

    const trigger = screen.getByRole('button', { name: /status/i });
    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapsible false renders without disclosure', () => {
    render(
      <FacetedFilter>
        <FacetGroup groupKey="status" label="Status" collapsible={false}>
          <FacetItem value="open">Open</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    expect(screen.queryByRole('button', { name: /status/i })).not.toBeInTheDocument();
    expect(screen.getByText('Status').closest(`.${classNames.group}`)).toBeInTheDocument();
  });

  it('badge not shown when no items are selected in the group', () => {
    renderFilter();

    expect(screen.queryByText('1', { selector: 'span' })).not.toBeInTheDocument();
  });

  it('badge shows count of selected items in that group', () => {
    renderFilter({ defaultValue: { status: ['open', 'closed'] } });

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('search input not rendered by default', () => {
    renderFilter();

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('search input rendered when searchable is true', () => {
    render(
      <FacetedFilter>
        <FacetGroup groupKey="priority" label="Priority" searchable>
          <FacetItem value="low">Low</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    expect(screen.getByRole('textbox', { name: /filter priority options/i })).toHaveClass(
      classNames.groupSearchInput
    );
  });

  it('typing in search input filters visible items', async () => {
    const user = userEvent.setup();
    render(
      <FacetedFilter>
        <FacetGroup groupKey="priority" label="Priority" searchable>
          <FacetItem value="low">Low</FacetItem>
          <FacetItem value="high">High</FacetItem>
          <FacetItem value="highest">Highest priority</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    await user.type(screen.getByRole('textbox', { name: /filter priority options/i }), 'high');

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Highest priority')).toBeInTheDocument();
    expect(screen.queryByText('Low')).not.toBeInTheDocument();
  });

  it('cleared search shows all items again', async () => {
    const user = userEvent.setup();
    render(
      <FacetedFilter>
        <FacetGroup groupKey="priority" label="Priority" searchable>
          <FacetItem value="low">Low</FacetItem>
          <FacetItem value="high">High</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    const input = screen.getByRole('textbox', { name: /filter priority options/i });
    await user.type(input, 'high');
    await user.clear(input);

    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('all items shown when count is less than or equal to maxVisible', () => {
    render(
      <FacetedFilter>
        <FacetGroup groupKey="status" label="Status" maxVisible={3}>
          <FacetItem value="open">Open</FacetItem>
          <FacetItem value="closed">Closed</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /show \d+ more/i })).not.toBeInTheDocument();
  });

  it('items beyond maxVisible are hidden when maxVisible is set', () => {
    render(
      <FacetedFilter>
        <FacetGroup groupKey="labels" label="Labels" maxVisible={2}>
          <FacetItem value="one">One</FacetItem>
          <FacetItem value="two">Two</FacetItem>
          <FacetItem value="three">Three</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.queryByText('Three')).not.toBeInTheDocument();
  });

  it('show more button is shown when hidden items exist', () => {
    render(
      <FacetedFilter>
        <FacetGroup groupKey="labels" label="Labels" maxVisible={2}>
          <FacetItem value="one">One</FacetItem>
          <FacetItem value="two">Two</FacetItem>
          <FacetItem value="three">Three</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    expect(screen.getByRole('button', { name: /show 1 more/i })).toHaveClass(
      classNames.showMoreBtn
    );
  });

  it('clicking show more reveals all items', async () => {
    const user = userEvent.setup();
    render(
      <FacetedFilter>
        <FacetGroup groupKey="labels" label="Labels" maxVisible={2}>
          <FacetItem value="one">One</FacetItem>
          <FacetItem value="two">Two</FacetItem>
          <FacetItem value="three">Three</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    await user.click(screen.getByRole('button', { name: /show 1 more/i }));

    expect(screen.getByText('Three')).toBeInTheDocument();
  });

  it('button changes to show less when expanded', async () => {
    const user = userEvent.setup();
    render(
      <FacetedFilter>
        <FacetGroup groupKey="labels" label="Labels" maxVisible={2}>
          <FacetItem value="one">One</FacetItem>
          <FacetItem value="two">Two</FacetItem>
          <FacetItem value="three">Three</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    await user.click(screen.getByRole('button', { name: /show 1 more/i }));

    expect(screen.getByRole('button', { name: /show less/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('axe: passes with searchable group', async () => {
    const { container } = render(
      <FacetedFilter>
        <FacetGroup groupKey="priority" label="Priority" searchable>
          <FacetItem value="low">Low</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes with collapsed group', async () => {
    const { container } = render(
      <FacetedFilter>
        <FacetGroup groupKey="priority" label="Priority" defaultOpen={false}>
          <FacetItem value="low">Low</FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('FacetItem', () => {
  it('renders checkbox with role checkbox', () => {
    renderFilter();

    expect(screen.getAllByRole('checkbox')[0]).toBeInTheDocument();
  });

  it('renders label text', () => {
    renderFilter();

    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('count is shown when count prop is provided', () => {
    render(
      <FacetedFilter>
        <FacetGroup groupKey="status" label="Status">
          <FacetItem value="open" count={42}>
            Open
          </FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    expect(screen.getByText('42')).toHaveClass(classNames.count);
  });

  it('count is not shown when count is omitted', () => {
    renderFilter();

    const countElements = document.querySelectorAll(`.${classNames.count}`);
    expect(countElements).toHaveLength(0);
  });

  it('count has aria-label for result count', () => {
    render(
      <FacetedFilter>
        <FacetGroup groupKey="status" label="Status">
          <FacetItem value="open" count={42}>
            Open
          </FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    expect(screen.getByLabelText('42 results')).toBeInTheDocument();
  });

  it('disabled facet item has disabled class and no interaction', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FacetedFilter onChange={onChange}>
        <FacetGroup groupKey="status" label="Status">
          <FacetItem value="open" disabled>
            Open
          </FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    await user.click(screen.getByText('Open'));

    expect(screen.getByText('Open').closest(`.${classNames.item}`)).toHaveClass(
      classNames.itemDisabled
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disabled facet item keeps text visible through muted token styling', () => {
    render(
      <FacetedFilter>
        <FacetGroup groupKey="status" label="Status">
          <FacetItem value="open" count={42} disabled>
            Open
          </FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    expect(screen.getByText('Open').closest(`.${classNames.item}`)).toHaveClass(
      classNames.itemDisabled
    );
    expect(screen.getByText('42')).toHaveClass(classNames.count);
  });

  it('clicking label toggles checkbox on', async () => {
    const user = userEvent.setup();
    renderFilter();

    await user.click(screen.getByText('Open'));

    expect(screen.getAllByRole('checkbox')[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('clicking checked label toggles checkbox off', async () => {
    const user = userEvent.setup();
    renderFilter({ defaultValue: { status: ['open'] } });

    await user.click(screen.getByText('Open'));

    expect(screen.getAllByRole('checkbox')[0]).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange with updated state on toggle', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilter({ onChange });

    await user.click(screen.getByText('Open'));

    expect(onChange).toHaveBeenCalledWith({ status: ['open'] });
  });

  it('checked state reflects controlled value', () => {
    renderFilter({ value: { status: ['closed'] } });

    expect(screen.getAllByRole('checkbox')[2]).toHaveAttribute('aria-checked', 'true');
  });

  it('axe: passes with disabled item', async () => {
    const { container } = render(
      <FacetedFilter>
        <FacetGroup groupKey="status" label="Status">
          <FacetItem value="open" disabled>
            Open
          </FacetItem>
        </FacetGroup>
      </FacetedFilter>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('uses muted text instead of opacity for disabled facet items', () => {
    const stylesheet = readFileSync(
      'src/components/FacetedFilter/FacetedFilter.module.scss',
      'utf8'
    );

    expect(stylesheet).toContain('color: var(--dds-color-text-muted);');
    expect(stylesheet).not.toContain('opacity: 0.5;');
  });
});

describe('Keyboard', () => {
  it('checkbox in facet item receives tab focus', async () => {
    const user = userEvent.setup();
    renderFilter();

    await user.tab();
    await user.tab();

    expect(screen.getAllByRole('checkbox')[0]).toHaveFocus();
  });

  it('space toggles the checkbox', async () => {
    const user = userEvent.setup();
    renderFilter();

    await user.tab();
    await user.tab();
    await user.keyboard(' ');

    expect(screen.getAllByRole('checkbox')[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('group trigger receives tab focus', async () => {
    const user = userEvent.setup();
    renderFilter();

    await user.tab();

    expect(screen.getByRole('button', { name: /status/i })).toHaveFocus();
  });

  it('space and enter toggle group open and closed', async () => {
    const user = userEvent.setup();
    renderFilter();

    const trigger = screen.getByRole('button', { name: /status/i });
    trigger.focus();

    await user.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});

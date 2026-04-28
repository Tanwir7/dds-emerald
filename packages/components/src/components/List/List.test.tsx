import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './List.module.scss';
import {
  List,
  ListItem,
  SelectableList,
  SelectableListItem,
  type ListProps,
  type SelectableListProps,
} from './List';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  list: getRequiredClassName(styles, 'list'),
  item: getRequiredClassName(styles, 'item'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
  dividers: getRequiredClassName(styles, 'dividers'),
  flush: getRequiredClassName(styles, 'flush'),
  selected: getRequiredClassName(styles, 'selected'),
  multipleSelected: getRequiredClassName(styles, 'multipleSelected'),
  itemDisabled: getRequiredClassName(styles, 'itemDisabled'),
  clickable: getRequiredClassName(styles, 'clickable'),
  horizontal: getRequiredClassName(styles, 'horizontal'),
  active: getRequiredClassName(styles, 'active'),
  startSlot: getRequiredClassName(styles, 'startSlot'),
  endSlot: getRequiredClassName(styles, 'endSlot'),
  description: getRequiredClassName(styles, 'description'),
  label: getRequiredClassName(styles, 'label'),
} as const;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const renderList = (props: Partial<ListProps> = {}) =>
  render(
    <List {...props}>
      <ListItem>Alpha</ListItem>
      <ListItem>Beta</ListItem>
    </List>
  );

const renderSelectableList = (props: Partial<SelectableListProps> = {}) =>
  render(
    <SelectableList aria-label="Frameworks" {...props}>
      <SelectableListItem value="react">React</SelectableListItem>
      <SelectableListItem value="vue">Vue</SelectableListItem>
      <SelectableListItem value="svelte">Svelte</SelectableListItem>
    </SelectableList>
  );

describe('List', () => {
  it('renders <ul> by default', () => {
    renderList();

    const list = screen.getByRole('list');

    expect(list.tagName).toBe('UL');
    expect(list).toHaveClass(classNames.list);
  });

  it('renders <ol> when as="ol"', () => {
    renderList({ as: 'ol' });

    expect(screen.getByRole('list').tagName).toBe('OL');
  });

  it('renders <div> when as="div"', () => {
    const { container } = render(
      <List as="div">
        <ListItem as="div">Alpha</ListItem>
      </List>
    );

    const list = container.querySelector(`.${classNames.list}`);

    expect(list?.tagName).toBe('DIV');
  });

  it('renders children', () => {
    renderList();

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('forwards className to list root', () => {
    renderList({ className: 'custom-list' });

    expect(screen.getByRole('list')).toHaveClass('custom-list');
  });

  it('forwards ref to list root element', () => {
    const ref = React.createRef<HTMLUListElement>();

    render(
      <List ref={ref}>
        <ListItem>Alpha</ListItem>
      </List>
    );

    expect(ref.current).toBeInstanceOf(HTMLUListElement);
    expect(ref.current).toBe(screen.getByRole('list'));
  });

  it('applies .md class by default', () => {
    renderList();

    expect(screen.getByRole('list')).toHaveClass(classNames.md);
  });

  it('applies .sm class when size="sm"', () => {
    renderList({ size: 'sm' });

    expect(screen.getByRole('list')).toHaveClass(classNames.sm);
  });

  it('applies .lg class when size="lg"', () => {
    renderList({ size: 'lg' });

    expect(screen.getByRole('list')).toHaveClass(classNames.lg);
  });

  it('has no divider class by default', () => {
    renderList();

    expect(screen.getByRole('list')).not.toHaveClass(classNames.dividers);
  });

  it('applies .dividers class when dividers is true', () => {
    renderList({ dividers: true });

    expect(screen.getByRole('list')).toHaveClass(classNames.dividers);
  });

  it('has no flush class by default', () => {
    renderList();

    expect(screen.getByRole('list')).not.toHaveClass(classNames.flush);
  });

  it('applies .flush class when flush is true', () => {
    renderList({ flush: true });

    expect(screen.getByRole('list')).toHaveClass(classNames.flush);
  });

  it('passes size from List context to ListItem via the list root class', () => {
    renderList({ size: 'lg' });

    expect(screen.getByRole('list')).toHaveClass(classNames.lg);
    expect(screen.getByText('Alpha').closest(`.${classNames.item}`)).toBeInTheDocument();
  });

  it('passes dividers from List context to ListItem via the list root class', () => {
    renderList({ dividers: true });

    expect(screen.getByRole('list')).toHaveClass(classNames.dividers);
    expect(screen.getByText('Alpha').closest(`.${classNames.item}`)).toBeInTheDocument();
  });

  it('lets explicit ListItem props override List context for size and flush', () => {
    render(
      <List size="lg" flush>
        <ListItem size="sm" flush={false}>
          Alpha
        </ListItem>
      </List>
    );

    const item = screen.getByText('Alpha').closest(`.${classNames.item}`);

    expect(item).toHaveClass(classNames.sm);
    expect(item).not.toHaveClass(classNames.flush);
  });

  it('axe: passes for ul list', async () => {
    const { container } = renderList();

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes for ol list', async () => {
    const { container } = renderList({ as: 'ol' });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes with dividers', async () => {
    const { container } = renderList({ dividers: true });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes with startSlot containing icon', async () => {
    const { container } = render(
      <List>
        <ListItem startSlot={<span aria-hidden="true">•</span>}>Alpha</ListItem>
      </List>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('ListItem', () => {
  it('renders <li> by default', () => {
    render(
      <List>
        <ListItem>Alpha</ListItem>
      </List>
    );

    expect(screen.getByText('Alpha').closest('li')).toBeInTheDocument();
  });

  it('renders startSlot when provided', () => {
    render(
      <List>
        <ListItem startSlot={<span data-testid="start">S</span>}>Alpha</ListItem>
      </List>
    );

    expect(screen.getByTestId('start').parentElement).toHaveClass(classNames.startSlot);
  });

  it('renders endSlot when provided', () => {
    render(
      <List>
        <ListItem endSlot={<span data-testid="end">E</span>}>Alpha</ListItem>
      </List>
    );

    expect(screen.getByTestId('end').parentElement).toHaveClass(classNames.endSlot);
  });

  it('renders description when provided', () => {
    render(
      <List>
        <ListItem description="Secondary copy">Alpha</ListItem>
      </List>
    );

    expect(screen.getByText('Secondary copy')).toHaveClass(classNames.description);
  });

  it('renders children as label', () => {
    render(
      <List>
        <ListItem>Alpha</ListItem>
      </List>
    );

    expect(screen.getByText('Alpha')).toHaveClass(classNames.label);
  });

  it('forwards className to item', () => {
    render(
      <List>
        <ListItem className="custom-item">Alpha</ListItem>
      </List>
    );

    expect(screen.getByText('Alpha').closest(`.${classNames.item}`)).toHaveClass('custom-item');
  });

  it('forwards ref to li element', () => {
    const ref = React.createRef<HTMLLIElement>();

    render(
      <List>
        <ListItem ref={ref}>Alpha</ListItem>
      </List>
    );

    expect(ref.current).toBeInstanceOf(HTMLLIElement);
    expect(ref.current).toBe(screen.getByText('Alpha').closest('li'));
  });

  it('applies .selected class when selected is true', () => {
    render(
      <List>
        <ListItem selected>Alpha</ListItem>
      </List>
    );

    expect(screen.getByText('Alpha').closest(`.${classNames.item}`)).toHaveClass(
      classNames.selected
    );
  });

  it('applies .itemDisabled class when disabled is true', () => {
    render(
      <List>
        <ListItem disabled>Alpha</ListItem>
      </List>
    );

    expect(screen.getByText('Alpha').closest(`.${classNames.item}`)).toHaveClass(
      classNames.itemDisabled
    );
  });

  it('applies .clickable class when onClick provided', () => {
    render(
      <List>
        <ListItem onClick={() => undefined}>Alpha</ListItem>
      </List>
    );

    expect(screen.getByText('Alpha').closest(`.${classNames.item}`)).toHaveClass(
      classNames.clickable
    );
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <List>
        <ListItem disabled onClick={onClick}>
          Alpha
        </ListItem>
      </List>
    );

    await user.click(screen.getByText('Alpha'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onClick when clicked and not disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <List>
        <ListItem onClick={onClick}>Alpha</ListItem>
      </List>
    );

    await user.click(screen.getByText('Alpha'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('SelectableList', () => {
  it('renders <ul> with role="listbox"', () => {
    renderSelectableList();

    const listbox = screen.getByRole('listbox');

    expect(listbox.tagName).toBe('UL');
    expect(listbox).toHaveClass(classNames.list);
  });

  it('has aria-multiselectable="false" in single mode', () => {
    renderSelectableList();

    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'false');
  });

  it('has aria-multiselectable="true" in multiple mode', () => {
    renderSelectableList({ selectionMode: 'multiple' });

    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
  });

  it('has aria-orientation="vertical" by default', () => {
    renderSelectableList();

    expect(screen.getByRole('listbox')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('has aria-label when provided', () => {
    renderSelectableList({ 'aria-label': 'Libraries' });

    expect(screen.getByRole('listbox')).toHaveAttribute('aria-label', 'Libraries');
  });

  it('forwards ref to HTMLUListElement', () => {
    const ref = React.createRef<HTMLUListElement>();

    render(
      <SelectableList ref={ref} aria-label="Frameworks">
        <SelectableListItem value="react">React</SelectableListItem>
      </SelectableList>
    );

    expect(ref.current).toBeInstanceOf(HTMLUListElement);
    expect(ref.current).toBe(screen.getByRole('listbox'));
  });

  it('warns in dev mode when aria-label and aria-labelledby are both missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    render(
      <SelectableList>
        <SelectableListItem value="react">React</SelectableListItem>
      </SelectableList>
    );

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('does not warn when aria-labelledby is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    render(
      <>
        <span id="frameworks-label">Frameworks</span>
        <SelectableList aria-labelledby="frameworks-label">
          <SelectableListItem value="react">React</SelectableListItem>
        </SelectableList>
      </>
    );

    expect(warn).not.toHaveBeenCalled();
  });
});

describe('SelectableListItem', () => {
  it('renders <li> with role="option"', () => {
    renderSelectableList();

    expect(screen.getByRole('option', { name: 'React' }).tagName).toBe('LI');
  });

  it('has aria-selected="false" when not selected', () => {
    renderSelectableList();

    expect(screen.getByRole('option', { name: 'React' })).toHaveAttribute('aria-selected', 'false');
  });

  it('has aria-selected="true" when selected', () => {
    renderSelectableList({ value: 'react' });

    expect(screen.getByRole('option', { name: 'React' })).toHaveAttribute('aria-selected', 'true');
  });

  it('has aria-disabled="true" when disabled', () => {
    render(
      <SelectableList aria-label="Frameworks">
        <SelectableListItem value="react" disabled>
          React
        </SelectableListItem>
      </SelectableList>
    );

    expect(screen.getByRole('option', { name: 'React' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('first item has tabIndex=0 by default', () => {
    renderSelectableList();

    expect(screen.getByRole('option', { name: 'React' })).toHaveAttribute('tabindex', '0');
  });

  it('non-active items have tabIndex=-1', () => {
    renderSelectableList();

    expect(screen.getByRole('option', { name: 'Vue' })).toHaveAttribute('tabindex', '-1');
  });
});

describe('SelectableList selection', () => {
  it('clicking item selects it', async () => {
    const user = userEvent.setup();
    renderSelectableList();

    await user.click(screen.getByRole('option', { name: 'Vue' }));

    expect(screen.getByRole('option', { name: 'Vue' })).toHaveAttribute('aria-selected', 'true');
  });

  it('clicking different item deselects previous in single mode', async () => {
    const user = userEvent.setup();
    renderSelectableList({ defaultValue: 'react' });

    await user.click(screen.getByRole('option', { name: 'Vue' }));

    expect(screen.getByRole('option', { name: 'React' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('option', { name: 'Vue' })).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onChange with new value string', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderSelectableList({ onChange });

    await user.click(screen.getByRole('option', { name: 'Vue' }));

    expect(onChange).toHaveBeenCalledWith('vue');
  });

  it('clicking item selects it in multiple mode', async () => {
    const user = userEvent.setup();
    renderSelectableList({ selectionMode: 'multiple' });

    await user.click(screen.getByRole('option', { name: 'React' }));

    expect(screen.getByRole('option', { name: 'React' })).toHaveAttribute('aria-selected', 'true');
  });

  it('clicking another item adds to selection in multiple mode', async () => {
    const user = userEvent.setup();
    renderSelectableList({ selectionMode: 'multiple', defaultValue: ['react'] });

    await user.click(screen.getByRole('option', { name: 'Vue' }));

    expect(screen.getByRole('option', { name: 'React' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Vue' })).toHaveAttribute('aria-selected', 'true');
  });

  it('clicking selected item deselects it in multiple mode', async () => {
    const user = userEvent.setup();
    renderSelectableList({ selectionMode: 'multiple', defaultValue: ['react'] });

    await user.click(screen.getByRole('option', { name: 'React' }));

    expect(screen.getByRole('option', { name: 'React' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with string[] of all selected values in multiple mode', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderSelectableList({ selectionMode: 'multiple', onChange });

    await user.click(screen.getByRole('option', { name: 'React' }));
    await user.click(screen.getByRole('option', { name: 'Vue' }));

    expect(onChange).toHaveBeenLastCalledWith(['react', 'vue']);
  });

  it('disabled item cannot be selected', async () => {
    const user = userEvent.setup();

    render(
      <SelectableList aria-label="Frameworks">
        <SelectableListItem value="react" disabled>
          React
        </SelectableListItem>
        <SelectableListItem value="vue">Vue</SelectableListItem>
      </SelectableList>
    );

    await user.click(screen.getByRole('option', { name: 'React' }));

    expect(screen.getByRole('option', { name: 'React' })).toHaveAttribute('aria-selected', 'false');
  });
});

describe('SelectableList keyboard', () => {
  it('Tab focuses first enabled item', async () => {
    const user = userEvent.setup();

    render(
      <>
        <button type="button">Before</button>
        <SelectableList aria-label="Frameworks">
          <SelectableListItem value="react">React</SelectableListItem>
          <SelectableListItem value="vue">Vue</SelectableListItem>
        </SelectableList>
      </>
    );

    await user.tab();
    await user.tab();

    expect(screen.getByRole('option', { name: 'React' })).toHaveFocus();
  });

  it('ArrowDown moves focus to next item', async () => {
    const user = userEvent.setup();
    renderSelectableList();

    await user.tab();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Vue' })).toHaveFocus();
    expect(screen.getByRole('option', { name: 'Vue' })).toHaveClass(classNames.active);
  });

  it('ArrowUp moves focus to previous item', async () => {
    const user = userEvent.setup();
    renderSelectableList();

    await user.tab();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowUp}');

    expect(screen.getByRole('option', { name: 'React' })).toHaveFocus();
  });

  it('ArrowDown at last item stays on last', async () => {
    const user = userEvent.setup();
    renderSelectableList();

    await user.tab();
    await user.keyboard('{End}');
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Svelte' })).toHaveFocus();
  });

  it('ArrowUp at first item stays on first', async () => {
    const user = userEvent.setup();
    renderSelectableList();

    await user.tab();
    await user.keyboard('{ArrowUp}');

    expect(screen.getByRole('option', { name: 'React' })).toHaveFocus();
  });

  it('Home moves focus to first item', async () => {
    const user = userEvent.setup();
    renderSelectableList();

    await user.tab();
    await user.keyboard('{End}');
    await user.keyboard('{Home}');

    expect(screen.getByRole('option', { name: 'React' })).toHaveFocus();
  });

  it('End moves focus to last item', async () => {
    const user = userEvent.setup();
    renderSelectableList();

    await user.tab();
    await user.keyboard('{End}');

    expect(screen.getByRole('option', { name: 'Svelte' })).toHaveFocus();
  });

  it('Enter selects focused item', async () => {
    const user = userEvent.setup();
    renderSelectableList();

    await user.tab();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(screen.getByRole('option', { name: 'Vue' })).toHaveAttribute('aria-selected', 'true');
  });

  it('Space selects focused item', async () => {
    const user = userEvent.setup();
    renderSelectableList();

    await user.tab();
    await user.keyboard('{ArrowDown}');
    await user.keyboard(' ');

    expect(screen.getByRole('option', { name: 'Vue' })).toHaveAttribute('aria-selected', 'true');
  });

  it('disabled item skipped during keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <SelectableList aria-label="Frameworks">
        <SelectableListItem value="react">React</SelectableListItem>
        <SelectableListItem value="vue" disabled>
          Vue
        </SelectableListItem>
        <SelectableListItem value="svelte">Svelte</SelectableListItem>
      </SelectableList>
    );

    await user.tab();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Svelte' })).toHaveFocus();
  });
});

describe('SelectableList orientation and control', () => {
  it('applies .horizontal class when orientation="horizontal"', () => {
    renderSelectableList({ orientation: 'horizontal' });

    expect(screen.getByRole('listbox')).toHaveClass(classNames.horizontal);
  });

  it('ArrowRight navigates forward in horizontal orientation', async () => {
    const user = userEvent.setup();
    renderSelectableList({ orientation: 'horizontal' });

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('option', { name: 'Vue' })).toHaveFocus();
  });

  it('ArrowLeft navigates backward in horizontal orientation', async () => {
    const user = userEvent.setup();
    renderSelectableList({ orientation: 'horizontal' });

    await user.tab();
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowLeft}');

    expect(screen.getByRole('option', { name: 'React' })).toHaveFocus();
  });

  it('reflects controlled value prop', () => {
    renderSelectableList({ value: 'vue' });

    expect(screen.getByRole('option', { name: 'Vue' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'React' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange when item selected in controlled mode', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderSelectableList({ value: 'react', onChange });

    await user.click(screen.getByRole('option', { name: 'Vue' }));

    expect(onChange).toHaveBeenCalledWith('vue');
  });
});

describe('SelectableList axe', () => {
  it('axe: passes for single mode (vertical)', async () => {
    const { container } = renderSelectableList();

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes for multiple mode', async () => {
    const { container } = renderSelectableList({ selectionMode: 'multiple' });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes for horizontal orientation', async () => {
    const { container } = renderSelectableList({ orientation: 'horizontal' });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes with one item selected', async () => {
    const { container } = renderSelectableList({ value: 'react' });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes with disabled item', async () => {
    const { container } = render(
      <SelectableList aria-label="Frameworks">
        <SelectableListItem value="react">React</SelectableListItem>
        <SelectableListItem value="vue" disabled>
          Vue
        </SelectableListItem>
      </SelectableList>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe: passes with aria-label', async () => {
    const { container } = renderSelectableList({ 'aria-label': 'Libraries' });

    expect(await axe(container)).toHaveNoViolations();
  });
});

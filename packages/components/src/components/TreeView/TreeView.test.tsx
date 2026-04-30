import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './TreeView.module.scss';
import {
  TreeItem,
  TreeItemGroup,
  TreeView,
  type TreeItemProps,
  type TreeViewProps,
} from './TreeView';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  item: getRequiredClassName(styles, 'item'),
  row: getRequiredClassName(styles, 'row'),
  group: getRequiredClassName(styles, 'group'),
  label: getRequiredClassName(styles, 'label'),
  toggle: getRequiredClassName(styles, 'toggle'),
  toggleOpen: getRequiredClassName(styles, 'toggleOpen'),
  toggleSpacer: getRequiredClassName(styles, 'toggleSpacer'),
  startIcon: getRequiredClassName(styles, 'startIcon'),
  endSlot: getRequiredClassName(styles, 'endSlot'),
  itemDisabled: getRequiredClassName(styles, 'itemDisabled'),
  selected: getRequiredClassName(styles, 'selected'),
  focused: getRequiredClassName(styles, 'focused'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
} as const;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

type RenderTreeOptions = Partial<TreeViewProps>;

function BasicTree(props: RenderTreeOptions = {}) {
  return (
    <TreeView aria-label="Project files" {...props}>
      <TreeItem value="readme" label="README.md" />
      <TreeItem value="src" label="src">
        <TreeItemGroup>
          <TreeItem value="components" label="components">
            <TreeItemGroup>
              <TreeItem value="button" label="Button.tsx" />
            </TreeItemGroup>
          </TreeItem>
          <TreeItem value="styles" label="styles.css" />
        </TreeItemGroup>
      </TreeItem>
      <TreeItem value="tests" label="tests">
        <TreeItemGroup>
          <TreeItem value="button-test" label="Button.test.tsx" />
        </TreeItemGroup>
      </TreeItem>
    </TreeView>
  );
}

function renderTree(props: RenderTreeOptions = {}) {
  return render(<BasicTree {...props} />);
}

function getTreeItems() {
  return screen.getAllByRole('treeitem');
}

function getTreeItem(name: string | RegExp) {
  return screen.getByRole('treeitem', { name });
}

describe('TreeView', () => {
  describe('Rendering', () => {
    it('renders <ul role="tree">', () => {
      renderTree();

      const tree = screen.getByRole('tree');

      expect(tree.tagName).toBe('UL');
      expect(tree).toHaveClass(classNames.root);
    });

    it('tree has aria-label when provided', () => {
      renderTree({ 'aria-label': 'Repository tree' });

      expect(screen.getByRole('tree', { name: 'Repository tree' })).toBeInTheDocument();
    });

    it('tree has aria-labelledby when provided', () => {
      render(
        <>
          <span id="tree-label">Assets</span>
          <TreeView aria-labelledby="tree-label">
            <TreeItem value="assets" label="Assets" />
          </TreeView>
        </>
      );

      expect(screen.getByRole('tree', { name: 'Assets' })).toBeInTheDocument();
    });

    it('forwards className to root ul', () => {
      renderTree({ className: 'custom-tree' });

      expect(screen.getByRole('tree')).toHaveClass('custom-tree');
    });

    it('forwards ref to root HTMLUListElement', () => {
      const ref = React.createRef<HTMLUListElement>();

      render(
        <TreeView ref={ref} aria-label="Project files">
          <TreeItem value="readme" label="README.md" />
        </TreeView>
      );

      expect(ref.current).toBeInstanceOf(HTMLUListElement);
      expect(ref.current).toBe(screen.getByRole('tree'));
    });
  });

  describe('TreeItem leaf', () => {
    it('renders <li role="treeitem">', () => {
      renderTree();

      expect(getTreeItem(/README\.md/i).tagName).toBe('LI');
    });

    it('has aria-level="1" at root depth', () => {
      renderTree();

      expect(getTreeItem(/README\.md/i)).toHaveAttribute('aria-level', '1');
    });

    it('has aria-level="2" when nested one level deep', () => {
      renderTree({ defaultExpandedValues: ['src'] });

      expect(getTreeItem(/styles\.css/i)).toHaveAttribute('aria-level', '2');
    });

    it('renders label text', () => {
      renderTree();

      expect(screen.getByText('README.md')).toBeInTheDocument();
    });

    it('renders startIcon when provided', () => {
      render(
        <TreeView aria-label="Icons">
          <TreeItem
            value="file"
            label="File.tsx"
            startIcon={<span data-testid="start-icon">F</span>}
          />
        </TreeView>
      );

      expect(screen.getByTestId('start-icon').parentElement).toHaveClass(classNames.startIcon);
    });

    it('renders endSlot when provided', () => {
      render(
        <TreeView aria-label="End slot">
          <TreeItem value="file" label="File.tsx" endSlot={<span data-testid="end-slot">3</span>} />
        </TreeView>
      );

      expect(screen.getByTestId('end-slot').parentElement).toHaveClass(classNames.endSlot);
    });

    it('no expand toggle rendered for leaf nodes', () => {
      render(
        <TreeView aria-label="Leaf only">
          <TreeItem value="file" label="File.tsx" />
        </TreeView>
      );

      expect(screen.queryByTestId('tree-toggle-file')).not.toBeInTheDocument();
    });

    it('toggle spacer rendered for leaf to maintain alignment', () => {
      render(
        <TreeView aria-label="Leaf only">
          <TreeItem value="file" label="File.tsx" />
        </TreeView>
      );

      expect(screen.getByTestId('tree-toggle-spacer-file')).toHaveClass(classNames.toggleSpacer);
    });
  });

  describe('TreeItem branch', () => {
    it('renders expand toggle icon', () => {
      renderTree();

      expect(screen.getByTestId('tree-toggle-src')).toHaveClass(classNames.toggle);
    });

    it('has aria-expanded="false" when collapsed by default', () => {
      renderTree();

      expect(getTreeItem(/^src$/i)).toHaveAttribute('aria-expanded', 'false');
    });

    it('has aria-expanded="true" when expanded', () => {
      renderTree({ defaultExpandedValues: ['src'] });

      expect(getTreeItem(/^src$/i)).toHaveAttribute('aria-expanded', 'true');
    });

    it('clicking row expands collapsed branch', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.click(getTreeItem(/^src$/i));

      expect(getTreeItem(/^src$/i)).toHaveAttribute('aria-expanded', 'true');
    });

    it('clicking row collapses expanded branch', async () => {
      const user = userEvent.setup();
      renderTree({ defaultExpandedValues: ['src'] });

      await user.click(getTreeItem(/^src$/i));

      expect(getTreeItem(/^src$/i)).toHaveAttribute('aria-expanded', 'false');
    });

    it('children rendered when expanded', () => {
      renderTree({ defaultExpandedValues: ['src'] });

      expect(getTreeItem(/styles\.css/i)).toBeInTheDocument();
    });

    it('children not rendered when collapsed', () => {
      renderTree();

      expect(screen.queryByRole('treeitem', { name: /styles\.css/i })).not.toBeInTheDocument();
    });
  });

  describe('Selection single', () => {
    it('clicking leaf item selects it', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.click(getTreeItem(/README\.md/i));

      expect(getTreeItem(/README\.md/i)).toHaveAttribute('aria-selected', 'true');
    });

    it('clicking another item deselects previous', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.click(getTreeItem(/README\.md/i));
      await user.click(getTreeItem(/^src$/i));

      expect(getTreeItem(/README\.md/i)).toHaveAttribute('aria-selected', 'false');
      expect(getTreeItem(/^src$/i)).toHaveAttribute('aria-selected', 'true');
    });

    it('onChange called with selected value string', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderTree({ onChange });

      await user.click(getTreeItem(/README\.md/i));

      expect(onChange).toHaveBeenCalledWith('readme');
    });
  });

  describe('Selection multiple', () => {
    it('clicking item selects it', async () => {
      const user = userEvent.setup();
      renderTree({ selectionMode: 'multiple' });

      await user.click(getTreeItem(/README\.md/i));

      expect(getTreeItem(/README\.md/i)).toHaveAttribute('aria-selected', 'true');
    });

    it('clicking another item adds to selection', async () => {
      const user = userEvent.setup();
      renderTree({ selectionMode: 'multiple' });

      await user.click(getTreeItem(/README\.md/i));
      await user.click(getTreeItem(/^src$/i));

      expect(getTreeItem(/README\.md/i)).toHaveAttribute('aria-selected', 'true');
      expect(getTreeItem(/^src$/i)).toHaveAttribute('aria-selected', 'true');
    });

    it('clicking selected item deselects it', async () => {
      const user = userEvent.setup();
      renderTree({ selectionMode: 'multiple', defaultValue: ['readme'] });

      await user.click(getTreeItem(/README\.md/i));

      expect(getTreeItem(/README\.md/i)).toHaveAttribute('aria-selected', 'false');
    });

    it('onChange called with string[] of all selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderTree({ selectionMode: 'multiple', onChange });

      await user.click(getTreeItem(/README\.md/i));
      await user.click(getTreeItem(/^src$/i));

      expect(onChange).toHaveBeenLastCalledWith(['readme', 'src']);
    });

    it('aria-multiselectable="true" on root', () => {
      renderTree({ selectionMode: 'multiple' });

      expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');
    });
  });

  describe('Selection none', () => {
    it('aria-selected absent on all items when selectionMode="none"', () => {
      renderTree({ selectionMode: 'none' });

      for (const item of getTreeItems()) {
        expect(item).not.toHaveAttribute('aria-selected');
      }
    });
  });

  describe('Disabled', () => {
    it('disabled item has aria-disabled="true"', () => {
      render(
        <TreeView aria-label="Disabled tree">
          <TreeItem value="enabled" label="Enabled" />
          <TreeItem value="disabled" label="Disabled" disabled />
        </TreeView>
      );

      expect(getTreeItem(/Disabled/i)).toHaveAttribute('aria-disabled', 'true');
    });

    it('disabled item cannot be selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TreeView aria-label="Disabled tree" onChange={onChange}>
          <TreeItem value="enabled" label="Enabled" />
          <TreeItem value="disabled" label="Disabled" disabled />
        </TreeView>
      );

      await user.click(getTreeItem(/Disabled/i));

      expect(getTreeItem(/Disabled/i)).toHaveAttribute('aria-selected', 'false');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('disabled item skipped during keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <TreeView aria-label="Disabled tree">
          <TreeItem value="alpha" label="Alpha" />
          <TreeItem value="bravo" label="Bravo" disabled />
          <TreeItem value="charlie" label="Charlie" />
        </TreeView>
      );

      await user.tab();
      expect(getTreeItem(/Alpha/i)).toHaveFocus();

      await user.keyboard('{ArrowDown}');

      expect(getTreeItem(/Charlie/i)).toHaveFocus();
    });
  });

  describe('Expand collapse controlled', () => {
    it('expandedValues prop controls which branches are open', () => {
      renderTree({ expandedValues: ['src'] });

      expect(getTreeItem(/^src$/i)).toHaveAttribute('aria-expanded', 'true');
      expect(getTreeItem(/styles\.css/i)).toBeInTheDocument();
    });

    it('onExpandedChange called when branch toggled', async () => {
      const user = userEvent.setup();
      const onExpandedChange = vi.fn();
      renderTree({ onExpandedChange });

      await user.click(getTreeItem(/^src$/i));

      expect(onExpandedChange).toHaveBeenCalledWith(['src']);
    });
  });

  describe('Sizes', () => {
    it('applies .md class by default', () => {
      renderTree();

      expect(screen.getByRole('tree')).toHaveClass(classNames.md);
    });

    it('applies .sm class when size="sm"', () => {
      renderTree({ size: 'sm' });

      expect(screen.getByRole('tree')).toHaveClass(classNames.sm);
    });
  });

  describe('Keyboard navigation', () => {
    it('Tab focuses first visible item', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.tab();

      expect(getTreeItem(/README\.md/i)).toHaveFocus();
    });

    it('ArrowDown moves focus to next visible item', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.tab();
      await user.keyboard('{ArrowDown}');

      expect(getTreeItem(/^src$/i)).toHaveFocus();
    });

    it('ArrowUp moves focus to previous visible item', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.tab();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');

      expect(getTreeItem(/README\.md/i)).toHaveFocus();
    });

    it('ArrowDown skips items inside collapsed branches', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.tab();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');

      expect(getTreeItem(/^tests$/i)).toHaveFocus();
    });

    it('ArrowDown stays at last visible item at bottom', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.tab();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');

      expect(getTreeItem(/^tests$/i)).toHaveFocus();
    });

    it('ArrowUp stays at first item', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.tab();
      await user.keyboard('{ArrowUp}');

      expect(getTreeItem(/README\.md/i)).toHaveFocus();
    });

    it('Home moves focus to first item', async () => {
      const user = userEvent.setup();
      renderTree({ defaultExpandedValues: ['src'] });

      await user.tab();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Home}');

      expect(getTreeItem(/README\.md/i)).toHaveFocus();
    });

    it('End moves focus to last visible item', async () => {
      const user = userEvent.setup();
      renderTree({ defaultExpandedValues: ['src'] });

      await user.tab();
      await user.keyboard('{End}');

      expect(getTreeItem(/^tests$/i)).toHaveFocus();
    });
  });

  describe('Keyboard expand collapse', () => {
    it('ArrowRight on collapsed branch expands it', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.tab();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowRight}');

      expect(getTreeItem(/^src$/i)).toHaveAttribute('aria-expanded', 'true');
    });

    it('ArrowRight on expanded branch moves focus to first child', async () => {
      const user = userEvent.setup();
      renderTree({ defaultExpandedValues: ['src'] });

      await user.tab();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowRight}');

      expect(getTreeItem(/^components$/i)).toHaveFocus();
    });

    it('ArrowRight on leaf does nothing', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.tab();
      await user.keyboard('{ArrowRight}');

      expect(getTreeItem(/README\.md/i)).toHaveFocus();
      expect(getTreeItems()).toHaveLength(3);
    });

    it('ArrowLeft on expanded branch collapses it', async () => {
      const user = userEvent.setup();
      renderTree({ defaultExpandedValues: ['src'] });

      await user.tab();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowLeft}');

      expect(getTreeItem(/^src$/i)).toHaveAttribute('aria-expanded', 'false');
    });

    it('ArrowLeft on collapsed branch moves focus to parent', async () => {
      const user = userEvent.setup();
      renderTree({ defaultExpandedValues: ['src', 'components'] });

      await user.tab();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowLeft}');

      expect(getTreeItem(/^components$/i)).toHaveFocus();
    });

    it('ArrowLeft at root-level item with no parent does nothing', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.tab();
      await user.keyboard('{ArrowLeft}');

      expect(getTreeItem(/README\.md/i)).toHaveFocus();
    });
  });

  describe('Keyboard selection', () => {
    it('Enter on item selects it', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.tab();
      await user.keyboard('{Enter}');

      expect(getTreeItem(/README\.md/i)).toHaveAttribute('aria-selected', 'true');
    });

    it('Space on item selects it', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.tab();
      await user.keyboard(' ');

      expect(getTreeItem(/README\.md/i)).toHaveAttribute('aria-selected', 'true');
    });

    it('Enter on branch toggles expansion and selects', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.tab();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(getTreeItem(/^src$/i)).toHaveAttribute('aria-expanded', 'true');
      expect(getTreeItem(/^src$/i)).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Keyboard expand siblings', () => {
    it('* key expands all sibling branches at the same level', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.tab();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('*');

      expect(getTreeItem(/^src$/i)).toHaveAttribute('aria-expanded', 'true');
      expect(getTreeItem(/^tests$/i)).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Depth indentation', () => {
    it('root items have depth 0 with no left padding from depth', () => {
      renderTree();

      const row = getTreeItem(/README\.md/i).querySelector(`.${classNames.row}`);

      expect(row).toHaveStyle({ paddingLeft: 'calc(0 * var(--dds-space-4))' });
    });

    it('depth-1 items have paddingLeft matching --dds-space-4', () => {
      renderTree({ defaultExpandedValues: ['src'] });

      const row = getTreeItem(/styles\.css/i).querySelector(`.${classNames.row}`);

      expect(row).toHaveStyle({ paddingLeft: 'calc(1 * var(--dds-space-4))' });
    });

    it('depth-2 items have paddingLeft matching 2 * --dds-space-4', () => {
      renderTree({ defaultExpandedValues: ['src', 'components'] });

      const row = getTreeItem(/Button\.tsx/i).querySelector(`.${classNames.row}`);

      expect(row).toHaveStyle({ paddingLeft: 'calc(2 * var(--dds-space-4))' });
    });
  });

  describe('Axe', () => {
    it('axe: passes for flat list (all leaves)', async () => {
      const { container } = render(
        <TreeView aria-label="Flat tree">
          <TreeItem value="alpha" label="Alpha" />
          <TreeItem value="beta" label="Beta" />
        </TreeView>
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('axe: passes for nested tree (branches and leaves)', async () => {
      const { container } = renderTree({ defaultExpandedValues: ['src', 'components'] });

      expect(await axe(container)).toHaveNoViolations();
    });

    it('axe: passes with one item selected', async () => {
      const { container } = renderTree({ defaultValue: 'readme' });

      expect(await axe(container)).toHaveNoViolations();
    });

    it('axe: passes for multiple selection mode', async () => {
      const { container } = renderTree({ selectionMode: 'multiple', defaultValue: ['readme'] });

      expect(await axe(container)).toHaveNoViolations();
    });

    it('axe: passes with disabled item', async () => {
      const { container } = render(
        <TreeView aria-label="Disabled tree">
          <TreeItem value="enabled" label="Enabled" />
          <TreeItem value="disabled" label="Disabled" disabled />
        </TreeView>
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('axe: passes with expanded branch', async () => {
      const { container } = renderTree({ defaultExpandedValues: ['src'] });

      expect(await axe(container)).toHaveNoViolations();
    });

    it('axe: passes for size="sm"', async () => {
      const { container } = renderTree({ size: 'sm' });

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('TreeItemGroup', () => {
    it('renders role="group" when branch is expanded', () => {
      renderTree({ defaultExpandedValues: ['src'] });

      const group = getTreeItem(/^src$/i).querySelector(`.${classNames.group}`);

      expect(group).toHaveAttribute('role', 'group');
    });
  });

  describe('Controlled selection', () => {
    it('respects controlled value in single selection mode', () => {
      renderTree({ value: 'src' });

      expect(getTreeItem(/^src$/i)).toHaveAttribute('aria-selected', 'true');
      expect(getTreeItem(/README\.md/i)).toHaveAttribute('aria-selected', 'false');
    });

    it('respects controlled value in multiple selection mode', () => {
      renderTree({ selectionMode: 'multiple', value: ['readme', 'src'] });

      expect(getTreeItem(/README\.md/i)).toHaveAttribute('aria-selected', 'true');
      expect(getTreeItem(/^src$/i)).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Focus styling state', () => {
    it('applies focused class to the active item', async () => {
      const user = userEvent.setup();
      renderTree();

      await user.tab();

      expect(getTreeItem(/README\.md/i)).toHaveClass(classNames.focused);
    });

    it('applies selected class to selected item', () => {
      renderTree({ defaultValue: 'readme' });

      expect(getTreeItem(/README\.md/i)).toHaveClass(classNames.selected);
    });

    it('applies disabled class to disabled item', () => {
      render(
        <TreeView aria-label="Disabled tree">
          <TreeItem value="disabled" label="Disabled" disabled />
        </TreeView>
      );

      expect(getTreeItem(/Disabled/i)).toHaveClass(classNames.itemDisabled);
    });
  });

  describe('Type shape smoke checks', () => {
    it('accepts declared TreeItem props', () => {
      const props: TreeItemProps = {
        value: 'smoke',
        label: 'Smoke',
      };

      expect(props.value).toBe('smoke');
    });
  });
});

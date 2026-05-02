import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { File, Folder } from 'lucide-react';
import { TreeItem, TreeItemGroup, TreeView } from './TreeView';
import storyStyles from './TreeView.stories.module.scss';
import { Text } from '../Text';
import { storySource, storySourceParameters } from '../../utils/storySource';

const meta: Meta<typeof TreeView> = {
  title: 'Core Components/TreeView',
  component: TreeView,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
};
export default meta;

type Story = StoryObj<typeof TreeView>;
type BaseTreeProps = Omit<React.ComponentProps<typeof TreeView>, 'aria-label' | 'children'>;

function CountBadge({ count }: { count: number }) {
  return <span className={storyStyles.countBadge}>{count}</span>;
}

function BaseTree(props: BaseTreeProps) {
  return (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyFrame}>
        <TreeView aria-label="Project tree" {...props}>
          <TreeItem value="readme" label="README.md" />
          <TreeItem value="src" label="src">
            <TreeItemGroup>
              <TreeItem value="components" label="components">
                <TreeItemGroup>
                  <TreeItem value="button" label="Button.tsx" />
                  <TreeItem value="input" label="Input.tsx" />
                  <TreeItem value="tree-view" label="TreeView.tsx" />
                </TreeItemGroup>
              </TreeItem>
              <TreeItem value="stories" label="stories" />
              <TreeItem value="styles" label="styles.css" />
            </TreeItemGroup>
          </TreeItem>
          <TreeItem value="tests" label="tests">
            <TreeItemGroup>
              <TreeItem value="button-test" label="Button.test.tsx" />
              <TreeItem value="input-test" label="Input.test.tsx" />
              <TreeItem value="tree-test" label="TreeView.test.tsx" />
            </TreeItemGroup>
          </TreeItem>
        </TreeView>
      </div>
    </div>
  );
}

function FileSystemTree(props: BaseTreeProps) {
  return (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyFrame}>
        <TreeView aria-label="File system" {...props}>
          <TreeItem value="src" label="src" startIcon={<Folder />}>
            <TreeItemGroup>
              <TreeItem value="components" label="components" startIcon={<Folder />}>
                <TreeItemGroup>
                  <TreeItem value="button-file" label="Button.tsx" startIcon={<File />} />
                  <TreeItem value="input-file" label="Input.tsx" startIcon={<File />} />
                </TreeItemGroup>
              </TreeItem>
              <TreeItem value="stories-dir" label="stories" startIcon={<Folder />}>
                <TreeItemGroup>
                  <TreeItem value="button-story" label="Button.stories.tsx" startIcon={<File />} />
                </TreeItemGroup>
              </TreeItem>
              <TreeItem value="tests-dir" label="tests" startIcon={<Folder />}>
                <TreeItemGroup>
                  <TreeItem value="button-spec" label="Button.test.tsx" startIcon={<File />} />
                </TreeItemGroup>
              </TreeItem>
              <TreeItem value="assets-dir" label="assets" startIcon={<Folder />}>
                <TreeItemGroup>
                  <TreeItem value="logo-file" label="logo.svg" startIcon={<File />} />
                </TreeItemGroup>
              </TreeItem>
            </TreeItemGroup>
          </TreeItem>
        </TreeView>
      </div>
    </div>
  );
}

function ControlledTree() {
  const [value, setValue] = useState<string>('src');
  const [expandedValues, setExpandedValues] = useState<string[]>(['src']);

  return (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Text size="sm" color="muted">
          Selected: {value} | Expanded: {expandedValues.join(', ') || 'none'}
        </Text>
        <div className={storyStyles.storyFrame}>
          <TreeView
            aria-label="Controlled tree"
            value={value}
            expandedValues={expandedValues}
            onChange={(nextValue) => {
              if (typeof nextValue === 'string') {
                setValue(nextValue);
              }
            }}
            onExpandedChange={setExpandedValues}
          >
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
        </div>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <BaseTree />,
  parameters: storySourceParameters(
    storySource(
      '<TreeView aria-label="Project tree">',
      '  <TreeItem value="readme" label="README.md" />',
      '  <TreeItem value="src" label="src">',
      '    <TreeItemGroup>',
      '      <TreeItem value="components" label="components" />',
      '      <TreeItem value="stories" label="stories" />',
      '      <TreeItem value="styles" label="styles.css" />',
      '    </TreeItemGroup>',
      '  </TreeItem>',
      '  <TreeItem value="tests" label="tests" />',
      '</TreeView>'
    )
  ),
};

export const FileSystem: Story = {
  render: () => <FileSystemTree defaultExpandedValues={['src', 'components']} />,
};

export const MultipleSelection: Story = {
  render: () => <BaseTree selectionMode="multiple" defaultValue={['readme', 'src']} />,
};

export const NoSelection: Story = {
  render: () => <BaseTree selectionMode="none" defaultExpandedValues={['src']} />,
};

export const WithIcons: Story = {
  render: () => <FileSystemTree defaultExpandedValues={['src']} />,
};

export const WithEndSlots: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyFrame}>
        <TreeView aria-label="Counts" defaultExpandedValues={['src']}>
          <TreeItem value="src" label="src" endSlot={<CountBadge count={12} />}>
            <TreeItemGroup>
              <TreeItem value="components" label="components" endSlot={<CountBadge count={8} />} />
              <TreeItem value="stories" label="stories" endSlot={<CountBadge count={3} />} />
              <TreeItem value="styles" label="styles.css" endSlot={<CountBadge count={1} />} />
            </TreeItemGroup>
          </TreeItem>
          <TreeItem value="tests" label="tests" endSlot={<CountBadge count={6} />} />
        </TreeView>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyColumn}>
        <BaseTree size="sm" defaultExpandedValues={['src']} />
        <BaseTree size="md" defaultExpandedValues={['src']} />
      </div>
    </div>
  ),
};

export const DefaultExpanded: Story = {
  render: () => <BaseTree defaultExpandedValues={['src', 'components']} />,
};

export const Controlled: Story = {
  render: () => <ControlledTree />,
};

export const DisabledItems: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyFrame}>
        <TreeView aria-label="Disabled items" defaultExpandedValues={['src']}>
          <TreeItem value="src" label="src" disabled>
            <TreeItemGroup>
              <TreeItem value="components" label="components" />
            </TreeItemGroup>
          </TreeItem>
          <TreeItem value="readme" label="README.md" />
          <TreeItem value="draft" label="draft.md" disabled />
        </TreeView>
      </div>
    </div>
  ),
};

export const DeepNesting: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyFrame}>
        <TreeView
          aria-label="Deep nesting"
          defaultExpandedValues={['src', 'components', 'forms', 'tree']}
        >
          <TreeItem value="src" label="src">
            <TreeItemGroup>
              <TreeItem value="components" label="components">
                <TreeItemGroup>
                  <TreeItem value="forms" label="forms">
                    <TreeItemGroup>
                      <TreeItem value="tree" label="Tree">
                        <TreeItemGroup>
                          <TreeItem value="tree-node" label="TreeNode.tsx" />
                        </TreeItemGroup>
                      </TreeItem>
                    </TreeItemGroup>
                  </TreeItem>
                </TreeItemGroup>
              </TreeItem>
            </TreeItemGroup>
          </TreeItem>
        </TreeView>
      </div>
    </div>
  ),
};

export const ExpandBranch: Story = {
  render: () => <BaseTree />,
  play: async ({ canvasElement }) => {
    const branchItem = within(canvasElement).getByRole('treeitem', { name: /^src$/i });
    await expect(branchItem).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(branchItem);
    await expect(branchItem).toHaveAttribute('aria-expanded', 'true');
  },
};

export const KeyboardExpand: Story = {
  render: () => <BaseTree />,
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
  },
};

export const SelectItem: Story = {
  render: () => <BaseTree defaultExpandedValues={['src', 'components']} />,
  play: async ({ canvasElement }) => {
    const leaf = within(canvasElement).getByRole('treeitem', { name: /Button\.tsx/i });
    await userEvent.click(leaf);
    await waitFor(() => {
      expect(leaf).toHaveAttribute('aria-selected', 'true');
    });
  },
};

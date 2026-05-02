import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy, FolderOpen, Pencil, Trash2 } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';
import { storySource, storySourceParameters } from '../../utils/storySource';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './ContextMenu';
import storyStyles from './ContextMenu.stories.module.scss';

const componentDescription = `ContextMenu renders a right-click or long-press action menu at the pointer position.

### Accessibility contract

- Keyboard: Arrow keys move between items, Enter or Space activates an item, ArrowRight opens sub-menus, ArrowLeft closes them, and Escape closes the current menu.
- Screen readers: Radix supplies the menu, menuitem, menuitemcheckbox, menuitemradio, and separator semantics.
- Focus: keyboard navigation is contained within the open menu and Tab closes the menu per the standard menu pattern.
- Designers: use ContextMenu for contextual actions on an existing surface, not as a visible trigger button.
- Trigger contract: because \`ContextMenuTrigger\` uses Radix \`asChild\`, any custom trigger component must forward the injected props and ref to its underlying DOM element.
- QA: verify portal rendering, destructive styling, disabled behavior, submenu navigation, and axe coverage for open states.`;

const meta: Meta<typeof ContextMenu> = {
  title: 'Core Components/ContextMenu',
  component: ContextMenu,
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

type Story = StoryObj<typeof ContextMenu>;

type TriggerZoneProps = React.HTMLAttributes<HTMLDivElement> & {
  tall?: boolean;
};

const TriggerZone = React.forwardRef<HTMLDivElement, TriggerZoneProps>(
  ({ tall = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={[
        storyStyles.storyTriggerZone,
        tall ? storyStyles.storyTriggerZoneTall : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      Right-click here
    </div>
  )
);

TriggerZone.displayName = 'TriggerZone';

const StoryShell = ({ children }: { children: React.ReactNode }) => (
  <div className={storyStyles.storyA11yScope}>{children}</div>
);

const BasicMenu = () => (
  <>
    <ContextMenuItem>Open</ContextMenuItem>
    <ContextMenuItem>Rename</ContextMenuItem>
    <ContextMenuItem>Duplicate</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem destructive>Delete</ContextMenuItem>
  </>
);

const CheckboxItemsStory = () => {
  const [checked, setChecked] = React.useState({
    lineNumbers: true,
    minimap: false,
    whitespace: true,
  });

  return (
    <StoryShell>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerZone />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>View options</ContextMenuLabel>
          <ContextMenuCheckboxItem
            checked={checked.lineNumbers}
            onCheckedChange={(value) => setChecked((state) => ({ ...state, lineNumbers: value }))}
          >
            Show line numbers
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={checked.minimap}
            onCheckedChange={(value) => setChecked((state) => ({ ...state, minimap: value }))}
          >
            Show minimap
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={checked.whitespace}
            onCheckedChange={(value) => setChecked((state) => ({ ...state, whitespace: value }))}
          >
            Render whitespace
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    </StoryShell>
  );
};

const RadioGroupStory = () => {
  const [sortBy, setSortBy] = React.useState('name');

  return (
    <StoryShell>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerZone />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Sort by</ContextMenuLabel>
          <ContextMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
            <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
            <ContextMenuRadioItem value="modified">Date modified</ContextMenuRadioItem>
            <ContextMenuRadioItem value="created">Date created</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    </StoryShell>
  );
};

const MixedContentStory = () => {
  const [showMinimap, setShowMinimap] = React.useState(true);
  const [showWhitespace, setShowWhitespace] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('name');

  return (
    <StoryShell>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerZone tall />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>File actions</ContextMenuLabel>
          <ContextMenuItem icon={FolderOpen}>Open</ContextMenuItem>
          <ContextMenuItem icon={Pencil}>Rename</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger icon={Copy}>Move to</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Roadmap</ContextMenuItem>
              <ContextMenuItem>Archive</ContextMenuItem>
              <ContextMenuItem>Shared workspace</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuLabel>View options</ContextMenuLabel>
          <ContextMenuCheckboxItem checked={showMinimap} onCheckedChange={setShowMinimap}>
            Show minimap
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={showWhitespace} onCheckedChange={setShowWhitespace}>
            Render whitespace
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuLabel>Sort by</ContextMenuLabel>
          <ContextMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
            <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
            <ContextMenuRadioItem value="modified">Date modified</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
          <ContextMenuSeparator />
          <ContextMenuItem destructive>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </StoryShell>
  );
};

export const Default: Story = {
  render: () => (
    <StoryShell>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerZone />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <BasicMenu />
        </ContextMenuContent>
      </ContextMenu>
    </StoryShell>
  ),
  parameters: storySourceParameters(
    storySource(
      '<ContextMenu>',
      '  <ContextMenuTrigger>',
      '    <div>Right-click here</div>',
      '  </ContextMenuTrigger>',
      '  <ContextMenuContent>',
      '    <ContextMenuItem>Open</ContextMenuItem>',
      '    <ContextMenuItem>Rename</ContextMenuItem>',
      '    <ContextMenuItem>Duplicate</ContextMenuItem>',
      '    <ContextMenuSeparator />',
      '    <ContextMenuItem destructive>Delete</ContextMenuItem>',
      '  </ContextMenuContent>',
      '</ContextMenu>'
    )
  ),
};

export const WithIcons: Story = {
  render: () => (
    <StoryShell>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerZone />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem icon={FolderOpen}>Open</ContextMenuItem>
          <ContextMenuItem icon={Pencil}>Rename</ContextMenuItem>
          <ContextMenuItem icon={Copy}>Duplicate</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem destructive icon={Trash2}>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </StoryShell>
  ),
  parameters: storySourceParameters(
    '<ContextMenu><ContextMenuTrigger><div>Right-click here</div></ContextMenuTrigger><ContextMenuContent><ContextMenuItem icon={FolderOpen}>Open</ContextMenuItem></ContextMenuContent></ContextMenu>'
  ),
};

export const WithShortcuts: Story = {
  render: () => (
    <StoryShell>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerZone />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem shortcut="⌘O">Open</ContextMenuItem>
          <ContextMenuItem shortcut="F2">Rename</ContextMenuItem>
          <ContextMenuItem shortcut="⌘D">Duplicate</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem destructive shortcut="Del">
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </StoryShell>
  ),
  parameters: storySourceParameters(
    '<ContextMenu><ContextMenuTrigger><div>Right-click here</div></ContextMenuTrigger><ContextMenuContent><ContextMenuItem shortcut="⌘O">Open</ContextMenuItem></ContextMenuContent></ContextMenu>'
  ),
};

export const WithCheckboxItems: Story = {
  render: () => <CheckboxItemsStory />,
  parameters: storySourceParameters(
    '<ContextMenu><ContextMenuTrigger><div>Right-click here</div></ContextMenuTrigger><ContextMenuContent><ContextMenuLabel>View options</ContextMenuLabel><ContextMenuCheckboxItem checked>Show line numbers</ContextMenuCheckboxItem></ContextMenuContent></ContextMenu>'
  ),
};

export const WithRadioGroup: Story = {
  render: () => <RadioGroupStory />,
  parameters: storySourceParameters(
    '<ContextMenu><ContextMenuTrigger><div>Right-click here</div></ContextMenuTrigger><ContextMenuContent><ContextMenuLabel>Sort by</ContextMenuLabel><ContextMenuRadioGroup value="name"><ContextMenuRadioItem value="name">Name</ContextMenuRadioItem></ContextMenuRadioGroup></ContextMenuContent></ContextMenu>'
  ),
};

export const WithSubMenu: Story = {
  render: () => (
    <StoryShell>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerZone />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Open</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger icon={Copy}>Move to</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Roadmap</ContextMenuItem>
              <ContextMenuItem>Archive</ContextMenuItem>
              <ContextMenuItem>Shared workspace</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem>Duplicate</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </StoryShell>
  ),
  parameters: storySourceParameters(
    '<ContextMenu><ContextMenuTrigger><div>Right-click here</div></ContextMenuTrigger><ContextMenuContent><ContextMenuSub><ContextMenuSubTrigger icon={Copy}>Move to</ContextMenuSubTrigger><ContextMenuSubContent><ContextMenuItem>Roadmap</ContextMenuItem></ContextMenuSubContent></ContextMenuSub></ContextMenuContent></ContextMenu>'
  ),
};

export const MixedContent: Story = {
  render: () => <MixedContentStory />,
  parameters: storySourceParameters(
    '<ContextMenu><ContextMenuTrigger><div>Right-click here</div></ContextMenuTrigger><ContextMenuContent><ContextMenuLabel>File actions</ContextMenuLabel><ContextMenuItem icon={FolderOpen}>Open</ContextMenuItem><ContextMenuSeparator /><ContextMenuCheckboxItem checked>Show minimap</ContextMenuCheckboxItem><ContextMenuRadioGroup value="name"><ContextMenuRadioItem value="name">Name</ContextMenuRadioItem></ContextMenuRadioGroup></ContextMenuContent></ContextMenu>'
  ),
};

export const DisabledItems: Story = {
  render: () => (
    <StoryShell>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerZone />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Open</ContextMenuItem>
          <ContextMenuItem disabled>Rename</ContextMenuItem>
          <ContextMenuItem disabled>Duplicate</ContextMenuItem>
          <ContextMenuItem destructive>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </StoryShell>
  ),
  parameters: storySourceParameters(
    '<ContextMenu><ContextMenuTrigger><div>Right-click here</div></ContextMenuTrigger><ContextMenuContent><ContextMenuItem disabled>Rename</ContextMenuItem></ContextMenuContent></ContextMenu>'
  ),
};

export const Inset: Story = {
  render: () => (
    <StoryShell>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerZone />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel inset>Aligned items</ContextMenuLabel>
          <ContextMenuItem inset>Open</ContextMenuItem>
          <ContextMenuItem inset>Rename</ContextMenuItem>
          <ContextMenuItem inset>Duplicate</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </StoryShell>
  ),
  parameters: storySourceParameters(
    '<ContextMenu><ContextMenuTrigger><div>Right-click here</div></ContextMenuTrigger><ContextMenuContent><ContextMenuItem inset>Open</ContextMenuItem></ContextMenuContent></ContextMenu>'
  ),
};

export const OpenAndNavigate: Story = {
  render: () => (
    <StoryShell>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerZone />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <BasicMenu />
        </ContextMenuContent>
      </ContextMenu>
    </StoryShell>
  ),
  play: async ({ canvasElement }) => {
    const triggerZone = within(canvasElement).getByText(/right-click here/i);
    await userEvent.pointer([{ target: triggerZone, keys: '[MouseRight]' }]);
    const menu = within(document.body).getByRole('menu');
    await expect(menu).toBeVisible();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await expect(within(document.body).queryByRole('menu')).not.toBeInTheDocument();
  },
  parameters: storySourceParameters(
    '<ContextMenu><ContextMenuTrigger><div>Right-click here</div></ContextMenuTrigger><ContextMenuContent><ContextMenuItem>Open</ContextMenuItem></ContextMenuContent></ContextMenu>'
  ),
};

export const EscapeCloses: Story = {
  render: () => (
    <StoryShell>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerZone />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <BasicMenu />
        </ContextMenuContent>
      </ContextMenu>
    </StoryShell>
  ),
  play: async ({ canvasElement }) => {
    const triggerZone = within(canvasElement).getByText(/right-click here/i);
    await userEvent.pointer([{ target: triggerZone, keys: '[MouseRight]' }]);
    await expect(within(document.body).getByRole('menu')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(within(document.body).queryByRole('menu')).not.toBeInTheDocument();
  },
  parameters: storySourceParameters(
    '<ContextMenu><ContextMenuTrigger><div>Right-click here</div></ContextMenuTrigger><ContextMenuContent><ContextMenuItem>Open</ContextMenuItem></ContextMenuContent></ContextMenu>'
  ),
};

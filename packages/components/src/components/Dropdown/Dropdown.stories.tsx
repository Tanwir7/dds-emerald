import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy, Edit3, Ellipsis, FolderTree, Link2, Mail, Trash2, UserRound } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import { storySource, storySourceParameters } from '../../utils/storySource';
import {
  Dropdown,
  DropdownCheckboxItem,
  DropdownContent,
  DropdownGroup,
  DropdownItem,
  DropdownLabel,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownSeparator,
  DropdownSub,
  DropdownSubContent,
  DropdownSubTrigger,
  DropdownTrigger,
} from './Dropdown';
import storyStyles from './Dropdown.stories.module.scss';

const componentDescription = `Dropdown renders contextual action menus anchored to an interactive trigger.

### Accessibility contract

- Keyboard: Enter or Space opens the menu, arrow keys move between items, ArrowRight opens sub-menus, ArrowLeft closes them, and Escape closes the current menu.
- Screen readers: Radix supplies menu semantics and item roles for standard, checkbox, radio, and submenu items.
- Focus: \`modal={true}\` traps focus while the menu is open and returns focus to the trigger on close.
- Designers: use Dropdown for contextual actions, not value selection. Use \`Select\` for form-bound choices.
- QA: verify portal rendering, destructive item styling, disabled states, submenu behavior, and axe coverage for open states.`;

const meta: Meta<typeof Dropdown> = {
  title: 'Core Components/Dropdown',
  component: Dropdown,
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

type Story = StoryObj<typeof Dropdown>;

const BasicMenu = () => (
  <>
    <DropdownItem>Edit</DropdownItem>
    <DropdownItem>Duplicate</DropdownItem>
    <DropdownItem>Share</DropdownItem>
    <DropdownItem>Archive</DropdownItem>
  </>
);

const CheckboxItemsStory = () => {
  const [checked, setChecked] = React.useState({
    comments: true,
    mentions: false,
    releases: true,
  });

  return (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Notifications</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownCheckboxItem
            checked={checked.comments}
            onCheckedChange={(value) => setChecked((state) => ({ ...state, comments: value }))}
          >
            Comment alerts
          </DropdownCheckboxItem>
          <DropdownCheckboxItem
            checked={checked.mentions}
            onCheckedChange={(value) => setChecked((state) => ({ ...state, mentions: value }))}
          >
            Mentions
          </DropdownCheckboxItem>
          <DropdownCheckboxItem
            checked={checked.releases}
            onCheckedChange={(value) => setChecked((state) => ({ ...state, releases: value }))}
          >
            Release notes
          </DropdownCheckboxItem>
        </DropdownContent>
      </Dropdown>
    </div>
  );
};

const RadioItemsStory = () => {
  const [assignee, setAssignee] = React.useState('ada');

  return (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Assign owner</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownLabel>Owner</DropdownLabel>
          <DropdownRadioGroup value={assignee} onValueChange={setAssignee}>
            <DropdownRadioItem value="ada">Ada Lovelace</DropdownRadioItem>
            <DropdownRadioItem value="grace">Grace Hopper</DropdownRadioItem>
            <DropdownRadioItem value="radia">Radia Perlman</DropdownRadioItem>
          </DropdownRadioGroup>
        </DropdownContent>
      </Dropdown>
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Actions</Button>
        </DropdownTrigger>
        <DropdownContent>
          <BasicMenu />
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Dropdown>',
      '  <DropdownTrigger asChild>',
      '    <Button variant="secondary">Actions</Button>',
      '  </DropdownTrigger>',
      '  <DropdownContent>',
      '    <DropdownItem>Edit</DropdownItem>',
      '    <DropdownItem>Duplicate</DropdownItem>',
      '    <DropdownItem>Share</DropdownItem>',
      '    <DropdownItem>Archive</DropdownItem>',
      '  </DropdownContent>',
      '</Dropdown>'
    )
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary" icon={Ellipsis}>
            More
          </Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem startIcon={<Edit3 aria-hidden="true" />}>Edit</DropdownItem>
          <DropdownItem startIcon={<Copy aria-hidden="true" />}>Duplicate</DropdownItem>
          <DropdownItem startIcon={<Mail aria-hidden="true" />}>Email owner</DropdownItem>
          <DropdownItem startIcon={<Link2 aria-hidden="true" />}>Copy link</DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(
    '<Dropdown><DropdownTrigger asChild><Button variant="secondary" icon={Ellipsis}>More</Button></DropdownTrigger><DropdownContent><DropdownItem startIcon={<Edit3 aria-hidden="true" />}>Edit</DropdownItem></DropdownContent></Dropdown>'
  ),
};

export const WithEndText: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Shortcuts</Button>
        </DropdownTrigger>
        <DropdownContent align="end">
          <DropdownItem endText="E">Edit</DropdownItem>
          <DropdownItem endText="Shift+D">Duplicate</DropdownItem>
          <DropdownItem endText="Cmd+K">Copy link</DropdownItem>
          <DropdownItem endText="Del">Archive</DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(
    '<Dropdown><DropdownTrigger asChild><Button variant="secondary">Shortcuts</Button></DropdownTrigger><DropdownContent align="end"><DropdownItem endText="Cmd+K">Copy link</DropdownItem></DropdownContent></Dropdown>'
  ),
};

export const Destructive: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Manage</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem startIcon={<UserRound aria-hidden="true" />}>Assign owner</DropdownItem>
          <DropdownSeparator />
          <DropdownItem intent="destructive" startIcon={<Trash2 aria-hidden="true" />}>
            Delete project
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(
    '<Dropdown><DropdownTrigger asChild><Button variant="secondary">Manage</Button></DropdownTrigger><DropdownContent><DropdownItem intent="destructive" startIcon={<Trash2 aria-hidden="true" />}>Delete project</DropdownItem></DropdownContent></Dropdown>'
  ),
};

export const WithSeparators: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Organize</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownGroup>
            <DropdownLabel>File</DropdownLabel>
            <DropdownItem>Edit</DropdownItem>
            <DropdownItem>Rename</DropdownItem>
          </DropdownGroup>
          <DropdownSeparator />
          <DropdownGroup>
            <DropdownLabel>Sharing</DropdownLabel>
            <DropdownItem>Invite collaborators</DropdownItem>
            <DropdownItem>Copy link</DropdownItem>
          </DropdownGroup>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(
    '<Dropdown><DropdownTrigger asChild><Button variant="secondary">Organize</Button></DropdownTrigger><DropdownContent><DropdownLabel>File</DropdownLabel><DropdownItem>Edit</DropdownItem><DropdownSeparator /><DropdownLabel>Sharing</DropdownLabel></DropdownContent></Dropdown>'
  ),
};

export const WithCheckboxItems: Story = {
  render: () => <CheckboxItemsStory />,
  parameters: storySourceParameters(
    '<Dropdown><DropdownTrigger asChild><Button variant="secondary">Notifications</Button></DropdownTrigger><DropdownContent><DropdownCheckboxItem checked>Comment alerts</DropdownCheckboxItem></DropdownContent></Dropdown>'
  ),
};

export const WithRadioItems: Story = {
  render: () => <RadioItemsStory />,
  parameters: storySourceParameters(
    '<Dropdown><DropdownTrigger asChild><Button variant="secondary">Assign owner</Button></DropdownTrigger><DropdownContent><DropdownRadioGroup value="ada"><DropdownRadioItem value="ada">Ada Lovelace</DropdownRadioItem></DropdownRadioGroup></DropdownContent></Dropdown>'
  ),
};

export const WithSubMenu: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Project actions</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Edit</DropdownItem>
          <DropdownSub>
            <DropdownSubTrigger startIcon={<FolderTree aria-hidden="true" />}>
              Move to
            </DropdownSubTrigger>
            <DropdownSubContent>
              <DropdownItem>Roadmap</DropdownItem>
              <DropdownItem>Archive</DropdownItem>
              <DropdownItem>Shared workspace</DropdownItem>
            </DropdownSubContent>
          </DropdownSub>
          <DropdownItem>Duplicate</DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(
    '<Dropdown><DropdownTrigger asChild><Button variant="secondary">Project actions</Button></DropdownTrigger><DropdownContent><DropdownSub><DropdownSubTrigger>Move to</DropdownSubTrigger><DropdownSubContent><DropdownItem>Roadmap</DropdownItem></DropdownSubContent></DropdownSub></DropdownContent></Dropdown>'
  ),
};

export const DisabledItems: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Permissions</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem>View analytics</DropdownItem>
          <DropdownItem disabled>Edit billing</DropdownItem>
          <DropdownItem disabled>Transfer ownership</DropdownItem>
          <DropdownItem>Export report</DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(
    '<Dropdown><DropdownTrigger asChild><Button variant="secondary">Permissions</Button></DropdownTrigger><DropdownContent><DropdownItem disabled>Edit billing</DropdownItem></DropdownContent></Dropdown>'
  ),
};

export const AsChildTrigger: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary" icon={Ellipsis}>
            Open menu
          </Button>
        </DropdownTrigger>
        <DropdownContent>
          <BasicMenu />
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(
    '<Dropdown><DropdownTrigger asChild><Button variant="secondary" icon={Ellipsis}>Open menu</Button></DropdownTrigger><DropdownContent><DropdownItem>Edit</DropdownItem></DropdownContent></Dropdown>'
  ),
};

export const AlignEnd: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Aligned end</Button>
        </DropdownTrigger>
        <DropdownContent align="end">
          <BasicMenu />
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(
    '<Dropdown><DropdownTrigger asChild><Button variant="secondary">Aligned end</Button></DropdownTrigger><DropdownContent align="end"><DropdownItem>Edit</DropdownItem></DropdownContent></Dropdown>'
  ),
};

export const OpenAndSelectItem: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Open actions</Button>
        </DropdownTrigger>
        <DropdownContent>
          <BasicMenu />
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Open actions' });
    await userEvent.click(trigger);
    const item = within(document.body).getByRole('menuitem', { name: 'Edit' });
    await userEvent.click(item);
  },
  parameters: storySourceParameters(
    '<Dropdown><DropdownTrigger asChild><Button variant="secondary">Open actions</Button></DropdownTrigger><DropdownContent><DropdownItem>Edit</DropdownItem></DropdownContent></Dropdown>'
  ),
};

export const KeyboardNavigation: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Keyboard menu</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Edit</DropdownItem>
          <DropdownItem>Share</DropdownItem>
          <DropdownItem>Archive</DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Keyboard menu' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{ArrowDown}');
    const items = within(document.body).getAllByRole('menuitem');
    await expect(items[0]).toHaveFocus();
  },
  parameters: storySourceParameters(
    '<Dropdown><DropdownTrigger asChild><Button variant="secondary">Keyboard menu</Button></DropdownTrigger><DropdownContent><DropdownItem>Edit</DropdownItem><DropdownItem>Share</DropdownItem></DropdownContent></Dropdown>'
  ),
};

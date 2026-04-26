import React from 'react';
import { MoreHorizontal, Pencil, Share2, Trash2 } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import storyStyles from './Dropdown.stories.module.scss';
import { storySourceParameters } from '../../utils/storySource';
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

const meta: Meta<typeof Dropdown> = {
  title: 'Core Components/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
};
export default meta;

type Story = StoryObj<typeof Dropdown>;

const CheckboxItemsDemo = () => {
  const [revenue, setRevenue] = React.useState(true);
  const [margin, setMargin] = React.useState(false);
  const [volume, setVolume] = React.useState(true);

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button variant="secondary">Columns</Button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownCheckboxItem checked={revenue} onCheckedChange={setRevenue}>
          Revenue
        </DropdownCheckboxItem>
        <DropdownCheckboxItem checked={margin} onCheckedChange={setMargin}>
          Margin
        </DropdownCheckboxItem>
        <DropdownCheckboxItem checked={volume} onCheckedChange={setVolume}>
          Volume
        </DropdownCheckboxItem>
      </DropdownContent>
    </Dropdown>
  );
};

const RadioItemsDemo = () => {
  const [value, setValue] = React.useState('daily');

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button variant="secondary">Cadence</Button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownRadioGroup value={value} onValueChange={setValue}>
          <DropdownRadioItem value="daily">Daily</DropdownRadioItem>
          <DropdownRadioItem value="weekly">Weekly</DropdownRadioItem>
          <DropdownRadioItem value="monthly">Monthly</DropdownRadioItem>
        </DropdownRadioGroup>
      </DropdownContent>
    </Dropdown>
  );
};

const baseSource = `<Dropdown>
  <DropdownTrigger>Actions</DropdownTrigger>
  <DropdownContent>
    <DropdownItem>Edit</DropdownItem>
    <DropdownItem>Duplicate</DropdownItem>
    <DropdownItem>Share</DropdownItem>
    <DropdownItem intent="destructive">Delete</DropdownItem>
  </DropdownContent>
</Dropdown>`;

export const Default: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button icon={MoreHorizontal} aria-label="Open actions menu" />
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Edit</DropdownItem>
          <DropdownItem>Duplicate</DropdownItem>
          <DropdownItem>Share</DropdownItem>
          <DropdownItem intent="destructive">Delete</DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(baseSource),
};

export const WithIcons: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Actions</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem startIcon={<Pencil aria-hidden="true" />}>Edit</DropdownItem>
          <DropdownItem startIcon={<Share2 aria-hidden="true" />}>Share</DropdownItem>
          <DropdownItem intent="destructive" startIcon={<Trash2 aria-hidden="true" />}>
            Delete
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(`<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="secondary">Actions</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem startIcon={<Pencil aria-hidden="true" />}>Edit</DropdownItem>
    <DropdownItem startIcon={<Share2 aria-hidden="true" />}>Share</DropdownItem>
    <DropdownItem intent="destructive" startIcon={<Trash2 aria-hidden="true" />}>
      Delete
    </DropdownItem>
  </DropdownContent>
</Dropdown>`),
};

export const WithEndText: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Shortcuts</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem endText="⌘E">Edit</DropdownItem>
          <DropdownItem endText="⌘⇧S">Share</DropdownItem>
          <DropdownItem endText="⌫" intent="destructive">
            Delete
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(`<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="secondary">Shortcuts</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem endText="⌘E">Edit</DropdownItem>
    <DropdownItem endText="⌘⇧S">Share</DropdownItem>
    <DropdownItem endText="⌫" intent="destructive">
      Delete
    </DropdownItem>
  </DropdownContent>
</Dropdown>`),
};

export const Destructive: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Danger zone</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Edit</DropdownItem>
          <DropdownSeparator />
          <DropdownItem intent="destructive" startIcon={<Trash2 aria-hidden="true" />}>
            Delete project
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(`<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="secondary">Danger zone</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem>Edit</DropdownItem>
    <DropdownSeparator />
    <DropdownItem intent="destructive" startIcon={<Trash2 aria-hidden="true" />}>
      Delete project
    </DropdownItem>
  </DropdownContent>
</Dropdown>`),
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
            <DropdownLabel>Content</DropdownLabel>
            <DropdownItem>Edit</DropdownItem>
            <DropdownItem>Duplicate</DropdownItem>
          </DropdownGroup>
          <DropdownSeparator />
          <DropdownGroup>
            <DropdownLabel>Share</DropdownLabel>
            <DropdownItem>Email</DropdownItem>
            <DropdownItem>Copy link</DropdownItem>
          </DropdownGroup>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(`<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="secondary">Organize</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownGroup>
      <DropdownLabel>Content</DropdownLabel>
      <DropdownItem>Edit</DropdownItem>
      <DropdownItem>Duplicate</DropdownItem>
    </DropdownGroup>
    <DropdownSeparator />
    <DropdownGroup>
      <DropdownLabel>Share</DropdownLabel>
      <DropdownItem>Email</DropdownItem>
      <DropdownItem>Copy link</DropdownItem>
    </DropdownGroup>
  </DropdownContent>
</Dropdown>`),
};

export const WithCheckboxItems: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <CheckboxItemsDemo />
    </div>
  ),
  parameters: storySourceParameters(`const [revenue, setRevenue] = React.useState(true);
const [margin, setMargin] = React.useState(false);
const [volume, setVolume] = React.useState(true);

<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="secondary">Columns</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownCheckboxItem checked={revenue} onCheckedChange={setRevenue}>
      Revenue
    </DropdownCheckboxItem>
    <DropdownCheckboxItem checked={margin} onCheckedChange={setMargin}>
      Margin
    </DropdownCheckboxItem>
    <DropdownCheckboxItem checked={volume} onCheckedChange={setVolume}>
      Volume
    </DropdownCheckboxItem>
  </DropdownContent>
</Dropdown>`),
};

export const WithRadioItems: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <RadioItemsDemo />
    </div>
  ),
  parameters: storySourceParameters(`const [value, setValue] = React.useState('daily');

<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="secondary">Cadence</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownRadioGroup value={value} onValueChange={setValue}>
      <DropdownRadioItem value="daily">Daily</DropdownRadioItem>
      <DropdownRadioItem value="weekly">Weekly</DropdownRadioItem>
      <DropdownRadioItem value="monthly">Monthly</DropdownRadioItem>
    </DropdownRadioGroup>
  </DropdownContent>
</Dropdown>`),
};

export const WithSubMenu: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Share</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Edit</DropdownItem>
          <DropdownSub>
            <DropdownSubTrigger>Share</DropdownSubTrigger>
            <DropdownSubContent>
              <DropdownItem>Email</DropdownItem>
              <DropdownItem>Copy link</DropdownItem>
              <DropdownItem>Export PDF</DropdownItem>
            </DropdownSubContent>
          </DropdownSub>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(`<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="secondary">Share</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem>Edit</DropdownItem>
    <DropdownSub>
      <DropdownSubTrigger>Share</DropdownSubTrigger>
      <DropdownSubContent>
        <DropdownItem>Email</DropdownItem>
        <DropdownItem>Copy link</DropdownItem>
        <DropdownItem>Export PDF</DropdownItem>
      </DropdownSubContent>
    </DropdownSub>
  </DropdownContent>
</Dropdown>`),
};

export const DisabledItems: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Actions</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Edit</DropdownItem>
          <DropdownItem disabled>Archive</DropdownItem>
          <DropdownItem disabled intent="destructive">
            Delete
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(`<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="secondary">Actions</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem>Edit</DropdownItem>
    <DropdownItem disabled>Archive</DropdownItem>
    <DropdownItem disabled intent="destructive">
      Delete
    </DropdownItem>
  </DropdownContent>
</Dropdown>`),
};

export const AsChildTrigger: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="primary">Open menu</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Edit</DropdownItem>
          <DropdownItem>Share</DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(`<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="primary">Open menu</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem>Edit</DropdownItem>
    <DropdownItem>Share</DropdownItem>
  </DropdownContent>
</Dropdown>`),
};

export const AlignEnd: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Aligned end</Button>
        </DropdownTrigger>
        <DropdownContent align="end">
          <DropdownItem>Edit</DropdownItem>
          <DropdownItem>Share</DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  parameters: storySourceParameters(`<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="secondary">Aligned end</Button>
  </DropdownTrigger>
  <DropdownContent align="end">
    <DropdownItem>Edit</DropdownItem>
    <DropdownItem>Share</DropdownItem>
  </DropdownContent>
</Dropdown>`),
};

export const OpenAndSelectItem: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Actions</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Edit</DropdownItem>
          <DropdownItem>Duplicate</DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.click(trigger);
    const item = within(document.body).getByRole('menuitem', { name: 'Edit' });
    await userEvent.click(item);
  },
  parameters: storySourceParameters(`<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="secondary">Actions</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem>Edit</DropdownItem>
    <DropdownItem>Duplicate</DropdownItem>
  </DropdownContent>
</Dropdown>`),
};

export const KeyboardNavigation: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="secondary">Actions</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Edit</DropdownItem>
          <DropdownItem>Duplicate</DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const items = within(document.body).getAllByRole('menuitem');
    await userEvent.keyboard('{ArrowDown}');
    await expect(items[0]).toHaveFocus();
  },
  parameters: storySourceParameters(`<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="secondary">Actions</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem>Edit</DropdownItem>
    <DropdownItem>Duplicate</DropdownItem>
  </DropdownContent>
</Dropdown>`),
};

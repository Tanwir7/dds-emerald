import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Folder, Inbox, User } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarFallback } from '../Avatar';
import { Icon } from '../Icon';
import { Tag } from '../Tag';
import {
  List,
  ListItem,
  SelectableList,
  SelectableListItem,
  type ListProps,
  type SelectableListProps,
} from './List';
import storyStyles from './List.stories.module.scss';
import {
  storySource,
  storySourceBlock,
  storySourceFragment,
  storySourceParameters,
} from '../../utils/storySource';

const componentDescription = `List provides a display-only list API, while SelectableList adds listbox selection and roving tabindex keyboard navigation.

Import the display-only API with \`List\` and \`ListItem\`. Import the interactive API separately with \`SelectableList\` and \`SelectableListItem\`.

### Accessibility contract

- Keyboard: List has no custom keyboard behavior. SelectableList keeps DOM focus on the active option, supports Arrow keys, Home, End, Enter, and Space, and skips disabled options.
- Screen readers: List relies on native list semantics. SelectableList requires \`aria-label\` or \`aria-labelledby\`, exposes \`role="listbox"\`, and each item exposes \`role="option"\` with selection state.
- Focus management: only one SelectableList item is tabbable at a time.
- Designers: use List for display rows and SelectableList only when users are choosing from a visible set.
- QA: verify disabled options are skipped, the selection state is announced, and consumer-facing source blocks stay free of Storybook wrapper markup.`;

const renderListStory = (args: ListProps) => (
  <div className={storyStyles.storyA11yScope}>
    <div className={storyStyles.storyStack}>
      <List {...args} />
    </div>
  </div>
);

const meta: Meta<typeof List> = {
  title: 'Core Components/List',
  component: List,
  tags: ['autodocs'],
  subcomponents: {
    ListItem,
    SelectableList,
    SelectableListItem,
  },
  render: renderListStory,
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof List>;

const InboxIcon = () => <Icon icon={Inbox} aria-hidden="true" />;
const FolderIcon = () => <Icon icon={Folder} aria-hidden="true" />;
const BellIcon = () => <Icon icon={Bell} aria-hidden="true" />;

const SingleSelectExample = (args: Omit<SelectableListProps, 'children'>) => {
  const [value, setValue] = React.useState<string>('support');

  return (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <SelectableList
          {...args}
          value={value}
          onChange={(nextValue) => setValue(String(nextValue))}
        >
          <SelectableListItem value="support" description="Customer issues and escalations">
            Support
          </SelectableListItem>
          <SelectableListItem value="sales" description="Outbound and inbound activity">
            Sales
          </SelectableListItem>
          <SelectableListItem value="success" description="Renewals and onboarding">
            Success
          </SelectableListItem>
          <SelectableListItem value="ops" description="Operations planning">
            Ops
          </SelectableListItem>
          <SelectableListItem value="finance" description="Budget and approvals">
            Finance
          </SelectableListItem>
        </SelectableList>
      </div>
    </div>
  );
};

const MultipleSelectExample = (args: Omit<SelectableListProps, 'children'>) => {
  const [value, setValue] = React.useState<string[]>(['alerts']);

  return (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <SelectableList
          {...args}
          selectionMode="multiple"
          value={value}
          onChange={(nextValue) => setValue(Array.isArray(nextValue) ? nextValue : [nextValue])}
        >
          <SelectableListItem value="alerts" endSlot={<Tag size="sm">On</Tag>}>
            Alerts
          </SelectableListItem>
          <SelectableListItem value="digests" endSlot={<Tag size="sm">Daily</Tag>}>
            Digests
          </SelectableListItem>
          <SelectableListItem value="mentions" endSlot={<Tag size="sm">Team</Tag>}>
            Mentions
          </SelectableListItem>
          <SelectableListItem value="deployments" endSlot={<Tag size="sm">Prod</Tag>}>
            Deployments
          </SelectableListItem>
          <SelectableListItem value="billing" endSlot={<Tag size="sm">Monthly</Tag>}>
            Billing
          </SelectableListItem>
        </SelectableList>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <List>
          <ListItem>Overview</ListItem>
          <ListItem>Activity</ListItem>
          <ListItem>Reports</ListItem>
          <ListItem>Settings</ListItem>
          <ListItem>Billing</ListItem>
        </List>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<List>',
      '  <ListItem>Overview</ListItem>',
      '  <ListItem>Activity</ListItem>',
      '  <ListItem>Reports</ListItem>',
      '  <ListItem>Settings</ListItem>',
      '  <ListItem>Billing</ListItem>',
      '</List>'
    )
  ),
};

export const Ordered: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <List as="ol">
          <ListItem>Prepare scope</ListItem>
          <ListItem>Review implementation</ListItem>
          <ListItem>Approve release</ListItem>
        </List>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<List as="ol">',
      '  <ListItem>Prepare scope</ListItem>',
      '  <ListItem>Review implementation</ListItem>',
      '  <ListItem>Approve release</ListItem>',
      '</List>'
    )
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <div className={storyStyles.storyListStack}>
          <List size="sm">
            <ListItem>Small list item</ListItem>
          </List>
          <List size="md">
            <ListItem>Medium list item</ListItem>
          </List>
          <List size="lg">
            <ListItem>Large list item</ListItem>
          </List>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySourceFragment(
          '<List size="sm"><ListItem>Small list item</ListItem></List>',
          '<List size="md"><ListItem>Medium list item</ListItem></List>',
          '<List size="lg"><ListItem>Large list item</ListItem></List>'
        )
      ),
    },
  },
};

export const WithDividers: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <List dividers>
          <ListItem>Queue</ListItem>
          <ListItem>In progress</ListItem>
          <ListItem>Complete</ListItem>
        </List>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<List dividers>',
      '  <ListItem>Queue</ListItem>',
      '  <ListItem>In progress</ListItem>',
      '  <ListItem>Complete</ListItem>',
      '</List>'
    )
  ),
};

export const Flush: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <div className={storyStyles.storyPanel}>
          <List flush dividers>
            <ListItem>Edge to edge row</ListItem>
            <ListItem>Useful inside padded shells</ListItem>
          </List>
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<List flush dividers>',
      '  <ListItem>Edge to edge row</ListItem>',
      '  <ListItem>Useful inside padded shells</ListItem>',
      '</List>'
    )
  ),
};

export const WithStartSlot: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <List>
          <ListItem startSlot={<InboxIcon />}>Inbox</ListItem>
          <ListItem startSlot={<FolderIcon />}>Projects</ListItem>
          <ListItem startSlot={<BellIcon />}>Notifications</ListItem>
        </List>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<List>',
      '  <ListItem startSlot={<Icon icon={Inbox} aria-hidden="true" />}>Inbox</ListItem>',
      '  <ListItem startSlot={<Icon icon={Folder} aria-hidden="true" />}>Projects</ListItem>',
      '  <ListItem startSlot={<Icon icon={Bell} aria-hidden="true" />}>Notifications</ListItem>',
      '</List>'
    )
  ),
};

export const WithEndSlot: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <List>
          <ListItem endSlot={<Tag size="sm">12</Tag>}>Backlog</ListItem>
          <ListItem endSlot={<Tag size="sm">4</Tag>}>In review</ListItem>
          <ListItem endSlot={<Tag size="sm">2</Tag>}>Blocked</ListItem>
        </List>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<List>',
      '  <ListItem endSlot={<Tag size="sm">12</Tag>}>Backlog</ListItem>',
      '  <ListItem endSlot={<Tag size="sm">4</Tag>}>In review</ListItem>',
      '  <ListItem endSlot={<Tag size="sm">2</Tag>}>Blocked</ListItem>',
      '</List>'
    )
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <List>
          <ListItem description="Escalations, inbox triage, and SLA monitoring">Support</ListItem>
          <ListItem description="Release calendars and deployment readiness">Operations</ListItem>
          <ListItem description="Renewal tracking and expansion planning">Success</ListItem>
        </List>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<List>',
      '  <ListItem description="Escalations, inbox triage, and SLA monitoring">Support</ListItem>',
      '  <ListItem description="Release calendars and deployment readiness">Operations</ListItem>',
      '  <ListItem description="Renewal tracking and expansion planning">Success</ListItem>',
      '</List>'
    )
  ),
};

export const WithBothSlots: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <List dividers>
          <ListItem
            startSlot={
              <Avatar size="sm">
                <AvatarFallback>TC</AvatarFallback>
              </Avatar>
            }
            description="12 open issues"
            endSlot={<Tag size="sm">Owner</Tag>}
          >
            Tanwir Chowdhury
          </ListItem>
          <ListItem
            startSlot={
              <Avatar size="sm">
                <AvatarFallback>DS</AvatarFallback>
              </Avatar>
            }
            description="8 open issues"
            endSlot={<Tag size="sm">Reviewer</Tag>}
          >
            Dana Singh
          </ListItem>
        </List>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<List dividers>',
      '  <ListItem',
      '    startSlot={',
      '      <Avatar size="sm">',
      '        <AvatarFallback>TC</AvatarFallback>',
      '      </Avatar>',
      '    }',
      '    description="12 open issues"',
      '    endSlot={<Tag size="sm">Owner</Tag>}',
      '  >',
      '    Tanwir Chowdhury',
      '  </ListItem>',
      '</List>'
    )
  ),
};

export const WithSelected: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <List>
          <ListItem>Draft</ListItem>
          <ListItem selected>Published</ListItem>
          <ListItem>Archived</ListItem>
        </List>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<List>',
      '  <ListItem>Draft</ListItem>',
      '  <ListItem selected>Published</ListItem>',
      '  <ListItem>Archived</ListItem>',
      '</List>'
    )
  ),
};

export const Clickable: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <List>
          <ListItem onClick={() => undefined}>Overview</ListItem>
          <ListItem onClick={() => undefined}>Analytics</ListItem>
          <ListItem onClick={() => undefined}>Exports</ListItem>
        </List>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<List>',
      '  <ListItem onClick={handleOverviewClick}>Overview</ListItem>',
      '  <ListItem onClick={handleAnalyticsClick}>Analytics</ListItem>',
      '  <ListItem onClick={handleExportsClick}>Exports</ListItem>',
      '</List>'
    )
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <List>
          <ListItem>Current sprint</ListItem>
          <ListItem disabled>Archived sprint</ListItem>
          <ListItem>Upcoming sprint</ListItem>
        </List>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<List>',
      '  <ListItem>Current sprint</ListItem>',
      '  <ListItem disabled>Archived sprint</ListItem>',
      '  <ListItem>Upcoming sprint</ListItem>',
      '</List>'
    )
  ),
};

export const SingleSelect: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <SelectableList aria-label="Teams">
          <SelectableListItem value="support">Support</SelectableListItem>
          <SelectableListItem value="sales">Sales</SelectableListItem>
          <SelectableListItem value="success">Success</SelectableListItem>
          <SelectableListItem value="ops">Ops</SelectableListItem>
          <SelectableListItem value="finance">Finance</SelectableListItem>
        </SelectableList>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<SelectableList aria-label="Teams">',
      '  <SelectableListItem value="support">Support</SelectableListItem>',
      '  <SelectableListItem value="sales">Sales</SelectableListItem>',
      '  <SelectableListItem value="success">Success</SelectableListItem>',
      '  <SelectableListItem value="ops">Ops</SelectableListItem>',
      '  <SelectableListItem value="finance">Finance</SelectableListItem>',
      '</SelectableList>'
    )
  ),
};

export const SingleSelectSelected: Story = {
  render: () => <SingleSelectExample aria-label="Teams" />,
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          'const [value, setValue] = useState("support");',
          '',
          '<SelectableList aria-label="Teams" value={value} onChange={setValue}>',
          '  <SelectableListItem value="support">Support</SelectableListItem>',
          '  <SelectableListItem value="sales">Sales</SelectableListItem>',
          '  <SelectableListItem value="success">Success</SelectableListItem>',
          '</SelectableList>'
        )
      ),
    },
  },
};

export const MultipleSelect: Story = {
  render: () => <MultipleSelectExample aria-label="Notification categories" />,
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          'const [value, setValue] = useState<string[]>(["alerts"]);',
          '',
          '<SelectableList',
          '  aria-label="Notification categories"',
          '  selectionMode="multiple"',
          '  value={value}',
          '  onChange={setValue}',
          '>',
          '  <SelectableListItem value="alerts">Alerts</SelectableListItem>',
          '  <SelectableListItem value="digests">Digests</SelectableListItem>',
          '  <SelectableListItem value="mentions">Mentions</SelectableListItem>',
          '</SelectableList>'
        )
      ),
    },
  },
};

export const DisabledOptions: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <SelectableList aria-label="Deployment targets" defaultValue="staging">
          <SelectableListItem value="local">Local</SelectableListItem>
          <SelectableListItem value="staging">Staging</SelectableListItem>
          <SelectableListItem value="production" disabled>
            Production
          </SelectableListItem>
        </SelectableList>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<SelectableList aria-label="Deployment targets" defaultValue="staging">',
      '  <SelectableListItem value="local">Local</SelectableListItem>',
      '  <SelectableListItem value="staging">Staging</SelectableListItem>',
      '  <SelectableListItem value="production" disabled>Production</SelectableListItem>',
      '</SelectableList>'
    )
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <SelectableList aria-label="Views" orientation="horizontal" dividers>
          <SelectableListItem value="board">Board</SelectableListItem>
          <SelectableListItem value="table">Table</SelectableListItem>
          <SelectableListItem value="calendar">Calendar</SelectableListItem>
        </SelectableList>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<SelectableList aria-label="Views" orientation="horizontal" dividers>',
      '  <SelectableListItem value="board">Board</SelectableListItem>',
      '  <SelectableListItem value="table">Table</SelectableListItem>',
      '  <SelectableListItem value="calendar">Calendar</SelectableListItem>',
      '</SelectableList>'
    )
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <SelectableList aria-label="People">
          <SelectableListItem
            value="tanwir"
            startSlot={
              <Avatar size="sm">
                <AvatarFallback>TC</AvatarFallback>
              </Avatar>
            }
            description="Design system lead"
            endSlot={<Icon icon={User} aria-hidden="true" />}
          >
            Tanwir Chowdhury
          </SelectableListItem>
          <SelectableListItem
            value="dana"
            startSlot={
              <Avatar size="sm">
                <AvatarFallback>DS</AvatarFallback>
              </Avatar>
            }
            description="Frontend engineer"
            endSlot={<Icon icon={User} aria-hidden="true" />}
          >
            Dana Singh
          </SelectableListItem>
        </SelectableList>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<SelectableList aria-label="People">',
      '  <SelectableListItem',
      '    value="tanwir"',
      '    startSlot={',
      '      <Avatar size="sm">',
      '        <AvatarFallback>TC</AvatarFallback>',
      '      </Avatar>',
      '    }',
      '    description="Design system lead"',
      '    endSlot={<Icon icon={User} aria-hidden="true" />}',
      '  >',
      '    Tanwir Chowdhury',
      '  </SelectableListItem>',
      '</SelectableList>'
    )
  ),
};

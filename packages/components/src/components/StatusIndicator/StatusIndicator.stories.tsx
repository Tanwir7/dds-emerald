import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '../Avatar';
import { Icon } from '../Icon';
import { NavItem } from '../NavItem';
import storyStyles from './StatusIndicator.stories.module.scss';
import { StatusIndicator } from './StatusIndicator';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const statuses = [
  'online',
  'offline',
  'away',
  'busy',
  'pending',
  'success',
  'warning',
  'error',
  'info',
  'neutral',
] as const;

const meta: Meta<typeof StatusIndicator> = {
  title: 'Core Components/StatusIndicator',
  component: StatusIndicator,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof StatusIndicator>) => (
    <div className={storyStyles.storyA11yScope}>
      <StatusIndicator {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
  args: {
    status: 'online',
    size: 'sm',
    pulse: false,
  },
  argTypes: {
    status: {
      control: 'select',
      options: statuses,
    },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof StatusIndicator>;

export const AllStatuses: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        {statuses.map((status) => (
          <div key={status} className={storyStyles.storyLine}>
            <StatusIndicator status={status} />
            <span>{status}</span>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(...statuses.map((status) => `<StatusIndicator status="${status}" />`))
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <div className={storyStyles.storyLine}>
          <StatusIndicator status="online" size="xs" />
          <span>xs</span>
        </div>
        <div className={storyStyles.storyLine}>
          <StatusIndicator status="online" size="sm" />
          <span>sm</span>
        </div>
        <div className={storyStyles.storyLine}>
          <StatusIndicator status="online" size="md" />
          <span>md</span>
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<StatusIndicator status="online" size="xs" />',
      '<StatusIndicator status="online" size="sm" />',
      '<StatusIndicator status="online" size="md" />'
    )
  ),
};

export const Pulse: Story = {
  args: {
    status: 'online',
    pulse: true,
    label: 'System is online',
  },
  parameters: storySourceParameters(
    '<StatusIndicator status="online" pulse label="System is online" />'
  ),
};

export const PulseError: Story = {
  args: {
    status: 'error',
    pulse: true,
    label: 'System is in an error state',
  },
  parameters: storySourceParameters(
    '<StatusIndicator status="error" pulse label="System is in an error state" />'
  ),
};

export const Standalone: Story = {
  args: {
    status: 'online',
    label: 'System is online',
  },
  parameters: storySourceParameters('<StatusIndicator status="online" label="System is online" />'),
};

export const OnAvatar: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.avatarWrapper}>
        <Avatar>
          <AvatarFallback delayMs={0}>SC</AvatarFallback>
        </Avatar>
        <StatusIndicator status="online" size="xs" className={storyStyles.avatarBadge!} />
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<div className="avatarWrapper">',
      '  <Avatar>',
      '    <AvatarFallback delayMs={0}>SC</AvatarFallback>',
      '  </Avatar>',
      '  <StatusIndicator status="online" size="xs" className={styles.avatarBadge} />',
      '</div>'
    )
  ),
};

export const OnNavItem: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <NavItem
        href="#"
        icon={<Icon icon={Bell} aria-hidden="true" />}
        endSlot={<StatusIndicator status="warning" />}
      >
        Alerts
      </NavItem>
    </div>
  ),
  parameters: storySourceParameters(
    '<NavItem href="#" icon={<Icon icon={Bell} aria-hidden="true" />} endSlot={<StatusIndicator status="warning" />}>Alerts</NavItem>'
  ),
};

export const PresenceList: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <div className={storyStyles.storyLine}>
          <StatusIndicator status="online" />
          <span>Sarah Chen</span>
        </div>
        <div className={storyStyles.storyLine}>
          <StatusIndicator status="away" />
          <span>Marcus Lee</span>
        </div>
        <div className={storyStyles.storyLine}>
          <StatusIndicator status="busy" />
          <span>Nina Patel</span>
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<>',
      '  <div><StatusIndicator status="online" /> Sarah Chen</div>',
      '  <div><StatusIndicator status="away" /> Marcus Lee</div>',
      '  <div><StatusIndicator status="busy" /> Nina Patel</div>',
      '</>'
    )
  ),
};

export const SystemHealth: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.healthGrid}>
        <div className={storyStyles.storyLine}>
          <StatusIndicator status="online" label="API is online" />
          <span>API</span>
        </div>
        <div className={storyStyles.storyLine}>
          <StatusIndicator status="warning" label="Database needs attention" />
          <span>Database</span>
        </div>
        <div className={storyStyles.storyLine}>
          <StatusIndicator status="error" label="Cache is failing" />
          <span>Cache</span>
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<>',
      '  <StatusIndicator status="online" label="API is online" />',
      '  <StatusIndicator status="warning" label="Database needs attention" />',
      '  <StatusIndicator status="error" label="Cache is failing" />',
      '</>'
    )
  ),
};

export const PulseAnimation: Story = {
  args: {
    status: 'online',
    pulse: true,
    label: 'Online',
  },
  play: async ({ canvasElement }) => {
    const dot = within(canvasElement).getByRole('img', { name: /online/i });
    await expect(dot).toBeInTheDocument();
    const inner = dot.querySelector('[class*="dot"]');
    await expect(inner).toBeInTheDocument();
  },
  parameters: storySourceParameters('<StatusIndicator status="online" pulse label="Online" />'),
};

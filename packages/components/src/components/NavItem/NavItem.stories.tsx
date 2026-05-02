import type { ComponentProps } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { LucideIcon } from 'lucide-react';
import { Bell, FolderOpen, House, Settings } from 'lucide-react';
import { Icon } from '../Icon';
import { Tag } from '../Tag';
import storyStyles from './NavItem.stories.module.scss';
import { NavItem } from './NavItem';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const componentDescription = `NavItem renders a single navigation row for sidebars, top navigation, and grouped navigation lists.

### Accessibility contract

- Keyboard: native link and button semantics apply; Tab reaches enabled rows, disabled buttons leave the tab order, and disabled links remain focusable with \`aria-disabled="true"\`.
- Screen readers: active items expose \`aria-current="page"\`, icons stay decorative, and consumers must place NavItem inside a \`<nav>\`, \`<ul>\`, or equivalent landmark.
- Focus: focus uses an inset outline ring so the row stays visually contained inside dense navigation layouts.
- Designers: choose the sidebar variant only on the dark sidebar surface and keep label text concise enough to avoid truncation where possible.
- QA: verify active state, disabled behavior, slot content alignment, router-link composition via \`asChild\`, and axe coverage for both variants.`;

const MockRouterLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ children, ...props }, ref) => (
  <a ref={ref} {...props}>
    {children}
  </a>
));

MockRouterLink.displayName = 'MockRouterLink';

const navIcon = (IconComponent: LucideIcon) => <Icon icon={IconComponent} aria-hidden="true" />;

const meta: Meta<typeof NavItem> = {
  title: 'Core Components/NavItem',
  component: NavItem,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof NavItem>) => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyFrame}>
        <NavItem {...args} />
      </div>
    </div>
  ),
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
  args: {
    href: '#',
    children: 'Overview',
    variant: 'default',
    size: 'md',
    level: 0,
    isActive: false,
    disabled: false,
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'sidebar'],
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
    },
    level: {
      control: 'inline-radio',
      options: [0, 1, 2],
    },
    icon: {
      control: false,
    },
    endSlot: {
      control: false,
    },
    asChild: {
      control: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof NavItem>;

export const Default: Story = {
  args: {
    href: '#',
    children: 'Overview',
  },
  parameters: storySourceParameters('<NavItem href="#">Overview</NavItem>'),
};

export const Active: Story = {
  args: {
    href: '#',
    children: 'Overview',
    isActive: true,
  },
  parameters: storySourceParameters('<NavItem href="#" isActive>Overview</NavItem>'),
};

export const WithIcon: Story = {
  args: {
    href: '#',
    children: 'Overview',
    icon: navIcon(House),
  },
  parameters: storySourceParameters(
    '<NavItem href="#" icon={<Icon icon={House} aria-hidden="true" />}>Overview</NavItem>'
  ),
};

export const WithEndSlot: Story = {
  args: {
    href: '#',
    children: 'Notifications',
    icon: navIcon(Bell),
    endSlot: <Tag size="sm">12</Tag>,
  },
  parameters: storySourceParameters(
    '<NavItem href="#" icon={<Icon icon={Bell} aria-hidden="true" />} endSlot={<Tag size="sm">12</Tag>}>Notifications</NavItem>'
  ),
};

export const Disabled: Story = {
  args: {
    children: 'Settings',
    disabled: true,
  },
  parameters: storySourceParameters('<NavItem disabled>Settings</NavItem>'),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <NavItem href="#" size="sm">
          Small item
        </NavItem>
        <NavItem href="#" size="md">
          Medium item
        </NavItem>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<NavItem href="#" size="sm">Small item</NavItem>',
      '<NavItem href="#" size="md">Medium item</NavItem>'
    )
  ),
};

export const Variants: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <NavItem href="#">Default nav</NavItem>
        <div className={storyStyles.storySidebar}>
          <NavItem href="#" variant="sidebar">
            Sidebar nav
          </NavItem>
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<>',
      '  <NavItem href="#">Default nav</NavItem>',
      '  <div className="sidebar-surface">',
      '    <NavItem href="#" variant="sidebar">Sidebar nav</NavItem>',
      '  </div>',
      '</>'
    )
  ),
};

export const IndentLevels: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <NavItem href="#" icon={navIcon(FolderOpen)} level={0}>
          Workspace
        </NavItem>
        <NavItem href="#" level={1}>
          Projects
        </NavItem>
        <NavItem href="#" level={2}>
          Release notes
        </NavItem>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<>',
      '  <NavItem href="#" icon={<Icon icon={FolderOpen} aria-hidden="true" />} level={0}>Workspace</NavItem>',
      '  <NavItem href="#" level={1}>Projects</NavItem>',
      '  <NavItem href="#" level={2}>Release notes</NavItem>',
      '</>'
    )
  ),
};

export const AsButtonAction: Story = {
  args: {
    children: 'Refresh data',
    onClick: fn(),
  },
  parameters: storySourceParameters('<NavItem onClick={handleRefresh}>Refresh data</NavItem>'),
};

export const AsChildNextLink: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyFrame}>
        <NavItem asChild icon={navIcon(House)}>
          <MockRouterLink href="/dashboard">Dashboard</MockRouterLink>
        </NavItem>
      </div>
    </div>
  ),
  parameters: {
    ...storySourceParameters(
      storySource(
        '<NavItem asChild icon={<Icon icon={House} aria-hidden="true" />}>',
        '  <NextLink href="/dashboard">Dashboard</NextLink>',
        '</NavItem>'
      )
    ),
    docs: {
      ...storySourceParameters(
        storySource(
          '<NavItem asChild icon={<Icon icon={House} aria-hidden="true" />}>',
          '  <NextLink href="/dashboard">Dashboard</NextLink>',
          '</NavItem>'
        )
      ).docs,
      description: {
        story:
          'Storybook uses a plain anchor to simulate a router link. In app code, swap in your router component as the child.',
      },
    },
  },
};

export const SidebarNav: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <nav className={storyStyles.storySidebar} aria-label="Sidebar navigation">
        <div className={storyStyles.storyStack}>
          <NavItem href="#" variant="sidebar" icon={navIcon(House)} isActive>
            Overview
          </NavItem>
          <NavItem href="#" variant="sidebar" icon={navIcon(FolderOpen)}>
            Projects
          </NavItem>
          <NavItem href="#" variant="sidebar" icon={navIcon(Bell)} endSlot={<Tag size="sm">3</Tag>}>
            Alerts
          </NavItem>
          <NavItem href="#" variant="sidebar" icon={navIcon(Settings)}>
            Settings
          </NavItem>
        </div>
      </nav>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<nav aria-label="Sidebar navigation">',
      '  <NavItem href="#" variant="sidebar" icon={<Icon icon={House} aria-hidden="true" />} isActive>Overview</NavItem>',
      '  <NavItem href="#" variant="sidebar" icon={<Icon icon={FolderOpen} aria-hidden="true" />}>Projects</NavItem>',
      '  <NavItem href="#" variant="sidebar" icon={<Icon icon={Bell} aria-hidden="true" />} endSlot={<Tag size="sm">3</Tag>}>Alerts</NavItem>',
      '  <NavItem href="#" variant="sidebar" icon={<Icon icon={Settings} aria-hidden="true" />}>Settings</NavItem>',
      '</nav>'
    )
  ),
};

export const TopNav: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <nav className={storyStyles.storyTopNav} aria-label="Top navigation">
        <NavItem href="#">Overview</NavItem>
        <NavItem href="#" isActive>
          Reports
        </NavItem>
        <NavItem href="#">Activity</NavItem>
      </nav>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<nav aria-label="Top navigation">',
      '  <NavItem href="#">Overview</NavItem>',
      '  <NavItem href="#" isActive>Reports</NavItem>',
      '  <NavItem href="#">Activity</NavItem>',
      '</nav>'
    )
  ),
};

export const FocusAndActivate: Story = {
  args: {
    href: '#',
    children: 'Focusable nav item',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const item = canvas.getByRole('link', { name: 'Focusable nav item' });
    await userEvent.tab();
    await expect(item).toHaveFocus();
  },
  parameters: storySourceParameters('<NavItem href="#">Focusable nav item</NavItem>'),
};

export const DisabledNotClickable: Story = {
  render: (_args, { args }) => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyFrame}>
        <NavItem
          disabled
          {...(args.onClick
            ? { onClick: args.onClick as React.MouseEventHandler<HTMLButtonElement> }
            : {})}
        >
          Disabled action
        </NavItem>
      </div>
    </div>
  ),
  args: {
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const item = canvas.getByRole('button', { name: 'Disabled action' });
    await expect(item).toBeDisabled();
    await userEvent.click(item);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
  parameters: storySourceParameters(
    '<NavItem disabled onClick={handleDisabledClick}>Disabled action</NavItem>'
  ),
};

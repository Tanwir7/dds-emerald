import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bell,
  BriefcaseBusiness,
  ChartColumn,
  CircleHelp,
  CreditCard,
  FolderKanban,
  House,
  Settings,
  Users,
} from 'lucide-react';
import { storySource, storySourceParameters } from '../../utils/storySource';
import storyStyles from './Sidebar.stories.module.scss';
import {
  Sidebar,
  SidebarBottom,
  SidebarCollapseToggle,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
  SidebarProvider,
  SidebarSubItem,
  SidebarTop,
  useSidebar,
} from './Sidebar';

const componentDescription = `Sidebar composes DDS navigation primitives into a persistent application shell with expanded, collapsed, and mobile drawer behaviors.

### Accessibility contract

- Keyboard: all items remain in the normal tab order, expandable rows expose \`aria-expanded\`, and collapsed flyouts close on \`Escape\`.
- Screen readers: desktop navigation renders a labeled \`<nav>\`, mobile navigation uses the Sheet dialog semantics, and active rows delegate \`aria-current="page"\` to \`NavItem\`.
- Layout: \`SidebarTop\` is optional, so the same primitives work with an in-sidebar brand block or alongside a future top navigation bar.
- QA: verify expanded and collapsed modes, group disclosure state, mobile drawer state, rail flyouts, and axe coverage for composed navigation.`;

const SidebarBrand = () => {
  const { collapsed } = useSidebar();

  return (
    <div
      className={[storyStyles.brandBlock, collapsed ? storyStyles.brandBlockCollapsed : null]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={storyStyles.brandMark} aria-hidden="true">
        DDS
      </div>
      {!collapsed ? (
        <div>
          <p className={storyStyles.brandEyebrow}>Emerald OS</p>
          <p className={storyStyles.brandTitle}>Operations Hub</p>
        </div>
      ) : null}
    </div>
  );
};

const SidebarNavigation = ({ withTop = true }: { withTop?: boolean }) => {
  return (
    <Sidebar className={storyStyles.storySidebar}>
      <SidebarTop className={storyStyles.brandTop}>
        {withTop ? <SidebarBrand /> : null}
        <div className={storyStyles.toggleRow}>
          <SidebarCollapseToggle />
        </div>
      </SidebarTop>
      <SidebarContent>
        <SidebarGroup label="Workspace" icon={House}>
          <SidebarItem href="#" icon={House} label="Overview" active />
          <SidebarItem href="#" icon={ChartColumn} label="Analytics" />
          <SidebarItem icon={FolderKanban} label="Programs" badge={4}>
            <SidebarSubItem href="#" label="Delivery roadmap" />
            <SidebarSubItem
              href="#"
              label="Change requests"
              active
              badge="Warning"
              badgeVariant="warning"
            />
          </SidebarItem>
        </SidebarGroup>
        <SidebarGroup label="Operations" icon={BriefcaseBusiness}>
          <SidebarItem href="#" icon={Users} label="Teams" />
          <SidebarItem href="#" icon={CreditCard} label="Billing" badge={2} />
          <SidebarItem href="#" icon={Bell} label="Alerts" badge="Error" badgeVariant="danger" />
        </SidebarGroup>
      </SidebarContent>
      <SidebarBottom>
        <SidebarItem href="#" icon={CircleHelp} label="Support" />
        <SidebarItem href="#" icon={Settings} label="Settings" />
      </SidebarBottom>
    </Sidebar>
  );
};

const StoryShell = ({
  defaultCollapsed = false,
  withTop = true,
}: {
  defaultCollapsed?: boolean;
  withTop?: boolean;
}) => (
  <div className={storyStyles.storyA11yScope}>
    <div className={storyStyles.canvas}>
      <SidebarProvider defaultCollapsed={defaultCollapsed} mobileBreakpoint={0}>
        <div className={storyStyles.storyFrame}>
          <SidebarNavigation withTop={withTop} />
          <section className={storyStyles.contentPanel}>
            <header className={storyStyles.contentHeader}>
              <div>
                <p className={storyStyles.contentEyebrow}>Quarterly review</p>
                <h2 className={storyStyles.contentTitle}>Regional delivery performance</h2>
              </div>
              <div className={storyStyles.headerMetrics}>
                <span>52 teams</span>
                <span>94.2% SLA</span>
              </div>
            </header>
            <div className={storyStyles.contentGrid}>
              <article className={storyStyles.heroCard}>
                <p className={storyStyles.cardEyebrow}>Current focus</p>
                <h3>
                  Program health is stable, but change requests are clustering in two regions.
                </h3>
                <p>
                  The shell is intentionally spacious so sidebar hierarchy, text rhythm, and rail
                  flyouts can be reviewed against a realistic adjacent content layout.
                </p>
              </article>
              <article className={storyStyles.metricCard}>
                <span>Escalations</span>
                <strong>12</strong>
              </article>
              <article className={storyStyles.metricCard}>
                <span>Open launches</span>
                <strong>08</strong>
              </article>
              <article className={storyStyles.tableCard}>
                <div className={storyStyles.tableRow}>
                  <span>North America</span>
                  <strong>On track</strong>
                </div>
                <div className={storyStyles.tableRow}>
                  <span>Europe</span>
                  <strong>Needs review</strong>
                </div>
                <div className={storyStyles.tableRow}>
                  <span>APAC</span>
                  <strong>On track</strong>
                </div>
              </article>
            </div>
          </section>
        </div>
      </SidebarProvider>
    </div>
  </div>
);

const meta: Meta<typeof Sidebar> = {
  title: 'Core Components/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  render: () => <StoryShell />,
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

type Story = StoryObj<typeof Sidebar>;

export const StandaloneBranded: Story = {
  parameters: storySourceParameters(
    storySource(
      '<SidebarProvider>',
      '  <Sidebar>',
      '    <SidebarTop>',
      '      <BrandBlock />',
      '      <SidebarCollapseToggle />',
      '    </SidebarTop>',
      '    <SidebarContent>',
      '      <SidebarGroup label="Workspace" icon={House}>',
      '        <SidebarItem href="#" icon={House} label="Overview" active />',
      '        <SidebarItem icon={FolderKanban} label="Programs">',
      '          <SidebarSubItem href="#" label="Delivery roadmap" />',
      '          <SidebarSubItem href="#" label="Change requests" />',
      '        </SidebarItem>',
      '      </SidebarGroup>',
      '    </SidebarContent>',
      '    <SidebarBottom>',
      '      <SidebarItem href="#" icon={Settings} label="Settings" />',
      '    </SidebarBottom>',
      '  </Sidebar>',
      '</SidebarProvider>'
    )
  ),
};

export const CollapsedRail: Story = {
  render: () => <StoryShell defaultCollapsed />,
  parameters: storySourceParameters(
    storySource(
      '<SidebarProvider defaultCollapsed>',
      '  <Sidebar>{/* ... */}</Sidebar>',
      '</SidebarProvider>'
    )
  ),
};

export const NavigationOnly: Story = {
  render: () => <StoryShell withTop={false} />,
  parameters: storySourceParameters(
    storySource(
      '<SidebarProvider>',
      '  <Sidebar>',
      '    <SidebarTop>',
      '      <SidebarCollapseToggle />',
      '    </SidebarTop>',
      '    <SidebarContent>{/* navigation starts immediately */}</SidebarContent>',
      '    <SidebarBottom>',
      '      <SidebarItem href="#" icon={Settings} label="Settings" />',
      '    </SidebarBottom>',
      '  </Sidebar>',
      '</SidebarProvider>'
    )
  ),
};

export const PersistentTopLevelItems: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.canvas}>
        <SidebarProvider mobileBreakpoint={0}>
          <div className={storyStyles.storyFrame}>
            <Sidebar className={storyStyles.storySidebar}>
              <SidebarTop className={storyStyles.brandTop}>
                <SidebarBrand />
                <div className={storyStyles.toggleRow}>
                  <SidebarCollapseToggle />
                </div>
              </SidebarTop>
              <SidebarContent>
                <SidebarGroup label="Workspace" icon={House}>
                  <SidebarItem href="#" icon={House} label="Overview" active />
                  <SidebarItem
                    href="#"
                    icon={FolderKanban}
                    label="Programs"
                    badge={4}
                    collapsible={false}
                  >
                    <SidebarSubItem href="#" label="Delivery roadmap" />
                    <SidebarSubItem href="#" label="Change requests" active />
                  </SidebarItem>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <section className={storyStyles.contentPanel} />
          </div>
        </SidebarProvider>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<SidebarProvider>',
      '  <Sidebar>',
      '    <SidebarContent>',
      '      <SidebarGroup label="Workspace" icon={House}>',
      '        <SidebarItem',
      '          href="#"',
      '          icon={FolderKanban}',
      '          label="Programs"',
      '          collapsible={false}',
      '        >',
      '          <SidebarSubItem href="#" label="Delivery roadmap" />',
      '          <SidebarSubItem href="#" label="Change requests" />',
      '        </SidebarItem>',
      '      </SidebarGroup>',
      '    </SidebarContent>',
      '  </Sidebar>',
      '</SidebarProvider>'
    )
  ),
};

export const PersistentGroups: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.canvas}>
        <SidebarProvider mobileBreakpoint={0}>
          <div className={storyStyles.storyFrame}>
            <Sidebar className={storyStyles.storySidebar}>
              <SidebarTop className={storyStyles.brandTop}>
                <SidebarBrand />
                <div className={storyStyles.toggleRow}>
                  <SidebarCollapseToggle />
                </div>
              </SidebarTop>
              <SidebarContent>
                <SidebarGroup
                  label="Workspace"
                  icon={House}
                  collapsible={false}
                  defaultOpen={false}
                >
                  <SidebarItem href="#" icon={House} label="Overview" active />
                  <SidebarItem href="#" icon={ChartColumn} label="Analytics" />
                </SidebarGroup>
                <SidebarGroup label="Operations" icon={BriefcaseBusiness}>
                  <SidebarItem href="#" icon={Users} label="Teams" />
                  <SidebarItem href="#" icon={Bell} label="Alerts" />
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <section className={storyStyles.contentPanel} />
          </div>
        </SidebarProvider>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<SidebarProvider>',
      '  <Sidebar>',
      '    <SidebarContent>',
      '      <SidebarGroup',
      '        label="Workspace"',
      '        icon={House}',
      '        collapsible={false}',
      '      >',
      '        <SidebarItem href="#" icon={House} label="Overview" active />',
      '        <SidebarItem href="#" icon={ChartColumn} label="Analytics" />',
      '      </SidebarGroup>',
      '    </SidebarContent>',
      '  </Sidebar>',
      '</SidebarProvider>'
    )
  ),
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bell,
  BriefcaseBusiness,
  ChartColumn,
  ClipboardList,
  CircleHelp,
  CreditCard,
  FileClock,
  FolderKanban,
  House,
  LayoutDashboard,
  MessagesSquare,
  PackageCheck,
  ReceiptText,
  Settings,
  ShieldCheck,
  Target,
  TriangleAlert,
  Users,
  Wrench,
} from 'lucide-react';
import React from 'react';
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '../Card';
import { Container } from '../Container';
import { Grid, GridItem } from '../Grid';
import { Heading } from '../Heading';
import { KeyValueList, KeyValueRow } from '../KeyValueRow';
import { Stack } from '../Stack';
import { StatCard } from '../StatCard';
import { Tag } from '../Tag';
import { Text } from '../Text';
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

const offsetNavbarHeight = '72px';

const SidebarBrand = () => {
  const { collapsed, desktopCollapsePhase, desktopOverlayPresentation } = useSidebar();
  const compactPresentation =
    !desktopOverlayPresentation && (collapsed || desktopCollapsePhase !== 'idle');

  return (
    <div
      className={[
        storyStyles.brandBlock,
        compactPresentation ? storyStyles.brandBlockCollapsed : null,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={storyStyles.brandMark} aria-hidden="true">
        DDS
      </div>
      {!compactPresentation ? (
        <div className={storyStyles.brandCopy}>
          <p className={storyStyles.brandEyebrow}>Emerald OS</p>
          <p className={storyStyles.brandTitle}>Operations Hub</p>
        </div>
      ) : null}
    </div>
  );
};

const SidebarNavigation = ({
  withTop = true,
  overlayPortalContainer,
}: {
  withTop?: boolean;
  overlayPortalContainer?: HTMLElement | null;
}) => {
  return (
    <Sidebar className={storyStyles.storySidebar} overlayPortalContainer={overlayPortalContainer}>
      <SidebarTop className={withTop ? storyStyles.brandTop : storyStyles.navigationOnlyTop}>
        {withTop ? <SidebarBrand /> : null}
        <div className={storyStyles.toggleRow}>
          <SidebarCollapseToggle />
        </div>
      </SidebarTop>
      <SidebarContent
        className={withTop ? storyStyles.brandedContent : storyStyles.navigationOnlyContent}
      >
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
  collapsedOverlay = false,
  withTop = true,
}: {
  defaultCollapsed?: boolean;
  collapsedOverlay?: boolean;
  withTop?: boolean;
}) => {
  const [overlayPortalContainer, setOverlayPortalContainer] = React.useState<HTMLElement | null>(
    null
  );

  return (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.canvas}>
        <SidebarProvider
          defaultCollapsed={defaultCollapsed}
          collapsedOverlay={collapsedOverlay}
          mobileBreakpoint={0}
        >
          <div className={storyStyles.storyViewport}>
            <div className={storyStyles.storyFrame}>
              <SidebarNavigation
                withTop={withTop}
                overlayPortalContainer={overlayPortalContainer}
              />
              <Container
                as="main"
                padding="xl"
                className={storyStyles.contentPanel ?? ''}
                aria-label="Sidebar story content"
              >
                <Stack gap="lg">
                  <Stack gap="sm">
                    <Text
                      as="p"
                      size="xs"
                      weight="semibold"
                      color="muted"
                      textTransform="uppercase"
                    >
                      Quarterly review
                    </Text>
                    <Grid columns={{ default: 1, lg: 2 }} gap="md" align="start">
                      <GridItem>
                        <Stack gap="xs">
                          <Heading as="h2" size="5xl">
                            Regional delivery performance
                          </Heading>
                          <Text size="lg" color="muted">
                            A compact content pane to review sidebar hierarchy alongside realistic
                            DDS surfaces.
                          </Text>
                        </Stack>
                      </GridItem>
                      <GridItem>
                        <Container className={storyStyles.headerTags ?? ''}>
                          <Tag>52 teams</Tag>
                          <Tag>94.2% SLA</Tag>
                        </Container>
                      </GridItem>
                    </Grid>
                  </Stack>

                  <Grid
                    columns={{ default: 1, lg: 3 }}
                    gap="md"
                    className={storyStyles.summaryGrid ?? ''}
                  >
                    <GridItem colSpan={1}>
                      <Card variant="outlined">
                        <CardHeader>
                          <Text
                            as="p"
                            size="xs"
                            weight="semibold"
                            color="muted"
                            textTransform="uppercase"
                          >
                            Current focus
                          </Text>
                          <CardTitle as="h3">
                            Program health is stable, but change requests are clustering in two
                            regions.
                          </CardTitle>
                        </CardHeader>
                        <CardBody>
                          <CardDescription>
                            The story keeps the content intentionally compact so the sidebar remains
                            the primary review surface without relying on custom story-only cards.
                          </CardDescription>
                        </CardBody>
                      </Card>
                    </GridItem>
                    <GridItem colSpan={1}>
                      <Container padding="md" background="card" border>
                        <StatCard
                          label="Escalations"
                          value="12"
                          delta={{ value: '+3', trend: 'up', label: 'this week' }}
                        />
                      </Container>
                    </GridItem>
                    <GridItem colSpan={1}>
                      <Container padding="md" background="card" border>
                        <StatCard
                          label="Open launches"
                          value="08"
                          delta={{ value: '-2', trend: 'down', label: 'from last review' }}
                        />
                      </Container>
                    </GridItem>
                  </Grid>

                  <Card variant="outlined">
                    <CardHeader>
                      <CardTitle as="h3">Regional status</CardTitle>
                      <CardDescription>
                        Delivery signals remain concise and responsive while using DDS content
                        primitives only.
                      </CardDescription>
                    </CardHeader>
                    <CardBody>
                      <KeyValueList dividers>
                        <KeyValueRow label="North America">
                          <Tag variant="success">On track</Tag>
                        </KeyValueRow>
                        <KeyValueRow label="Europe">
                          <Tag variant="warning">Needs review</Tag>
                        </KeyValueRow>
                        <KeyValueRow label="APAC">
                          <Tag variant="success">On track</Tag>
                        </KeyValueRow>
                      </KeyValueList>
                    </CardBody>
                  </Card>
                </Stack>
              </Container>
            </div>
            <div ref={setOverlayPortalContainer} className={storyStyles.overlayPortal} />
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

const SidebarWithTopOffsetShell = () => (
  <div className={storyStyles.storyA11yScope}>
    <div className={storyStyles.canvas}>
      <SidebarProvider mobileBreakpoint={0}>
        <div className={storyStyles.storyViewport}>
          <div className={storyStyles.offsetLayout}>
            <header className={storyStyles.offsetNavbar}>
              <div className={storyStyles.offsetNavbarBrand}>
                <Text as="p" size="xs" weight="semibold" color="muted" textTransform="uppercase">
                  Emerald OS
                </Text>
                <Heading as="h2" size="2xl">
                  Global operations shell
                </Heading>
              </div>
              <div className={storyStyles.offsetNavbarMeta}>
                <Tag>Fixed top bar</Tag>
                <Tag>72px offset</Tag>
              </div>
            </header>
            <div className={storyStyles.offsetFrame}>
              <Sidebar className={storyStyles.storySidebar} topOffset={offsetNavbarHeight}>
                <SidebarTop className={storyStyles.brandTop}>
                  <SidebarBrand />
                  <div className={storyStyles.toggleRow}>
                    <SidebarCollapseToggle />
                  </div>
                </SidebarTop>
                <SidebarContent className={storyStyles.brandedContent}>
                  <SidebarGroup label="Workspace" icon={LayoutDashboard}>
                    <SidebarItem href="#" icon={House} label="Overview" active />
                    <SidebarItem href="#" icon={ChartColumn} label="Analytics" />
                    <SidebarItem href="#" icon={ClipboardList} label="Approvals" badge={12} />
                    <SidebarItem href="#" icon={MessagesSquare} label="Requests" badge={8} />
                  </SidebarGroup>
                  <SidebarGroup label="Delivery" icon={FolderKanban}>
                    <SidebarItem href="#" icon={FolderKanban} label="Programs">
                      <SidebarSubItem href="#" label="Delivery roadmap" />
                      <SidebarSubItem href="#" label="Regional launches" />
                      <SidebarSubItem href="#" label="Change requests" active />
                      <SidebarSubItem href="#" label="Exceptions queue" badge={6} />
                      <SidebarSubItem href="#" label="Release notes" />
                      <SidebarSubItem href="#" label="Backlog intake" />
                    </SidebarItem>
                    <SidebarItem href="#" icon={PackageCheck} label="Fulfillment" />
                    <SidebarItem href="#" icon={Target} label="Milestones" />
                    <SidebarItem href="#" icon={FileClock} label="Approvals log" />
                  </SidebarGroup>
                  <SidebarGroup label="Operations" icon={BriefcaseBusiness}>
                    <SidebarItem href="#" icon={Users} label="Teams" />
                    <SidebarItem
                      href="#"
                      icon={Bell}
                      label="Alerts"
                      badge="Error"
                      badgeVariant="danger"
                    />
                    <SidebarItem href="#" icon={TriangleAlert} label="Incidents" />
                    <SidebarItem href="#" icon={ShieldCheck} label="Compliance" />
                    <SidebarItem href="#" icon={ReceiptText} label="Billing review" />
                    <SidebarItem href="#" icon={CreditCard} label="Vendor spend" />
                    <SidebarItem href="#" icon={Wrench} label="Maintenance" />
                  </SidebarGroup>
                </SidebarContent>
                <SidebarBottom>
                  <SidebarItem href="#" icon={CircleHelp} label="Support" />
                  <SidebarItem href="#" icon={Settings} label="Settings" />
                </SidebarBottom>
              </Sidebar>
              <Container
                as="main"
                padding="xl"
                className={storyStyles.offsetContentPanel ?? ''}
                aria-label="Sidebar offset story content"
              >
                <Stack gap="lg">
                  <Stack gap="xs">
                    <Text
                      as="p"
                      size="xs"
                      weight="semibold"
                      color="muted"
                      textTransform="uppercase"
                    >
                      Offset behavior
                    </Text>
                    <Heading as="h2" size="4xl">
                      The sidebar clears the navbar and keeps only its middle region scrollable.
                    </Heading>
                    <Text size="lg" color="muted">
                      Add more navigation items or expand nested rows to verify that the footer
                      stays pinned while the central navigation region takes the overflow.
                    </Text>
                  </Stack>
                  <Card variant="outlined">
                    <CardHeader>
                      <CardTitle as="h3">Review checklist</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <KeyValueList dividers>
                        <KeyValueRow label="Desktop top edge">
                          <Text size="sm">Aligned below the fixed navbar</Text>
                        </KeyValueRow>
                        <KeyValueRow label="Desktop bottom edge">
                          <Text size="sm">Ends at the viewport bottom</Text>
                        </KeyValueRow>
                        <KeyValueRow label="Overflow behavior">
                          <Text size="sm">Only `SidebarContent` should scroll</Text>
                        </KeyValueRow>
                      </KeyValueList>
                    </CardBody>
                  </Card>
                </Stack>
              </Container>
            </div>
          </div>
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

export const CollapsedRailOverlay: Story = {
  render: () => <StoryShell defaultCollapsed collapsedOverlay />,
  parameters: storySourceParameters(
    storySource(
      '<SidebarProvider defaultCollapsed collapsedOverlay>',
      '  <Sidebar>{/* ... */}</Sidebar>',
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

export const OffsetWithOverflowContent: Story = {
  render: () => <SidebarWithTopOffsetShell />,
  parameters: storySourceParameters(
    storySource(
      '<header className="top-navbar">...</header>',
      '<SidebarProvider>',
      `  <Sidebar topOffset="${offsetNavbarHeight}">`,
      '    <SidebarTop>',
      '      <BrandBlock />',
      '      <SidebarCollapseToggle />',
      '    </SidebarTop>',
      '    <SidebarContent>',
      '      <SidebarGroup label="Delivery" icon={FolderKanban}>',
      '        <SidebarItem icon={FolderKanban} label="Programs">',
      '          <SidebarSubItem href="#" label="Delivery roadmap" />',
      '          <SidebarSubItem href="#" label="Regional launches" />',
      '          <SidebarSubItem href="#" label="Change requests" active />',
      '        </SidebarItem>',
      '        {/* enough items to force SidebarContent scrolling */}',
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

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronRight } from 'lucide-react';
import { Button } from '../Button';
import { DropdownItem } from '../Dropdown';
import { FlyoutMenuGroup, FlyoutMenuLink } from '../FlyoutMenu';
import {
  SiteHeader,
  SiteHeaderActions,
  SiteHeaderBrand,
  SiteHeaderMobileMenu,
  SiteHeaderMobileTrigger,
  SiteHeaderNav,
  SiteHeaderNavFlyoutItem,
  SiteHeaderNavItem,
  SiteHeaderSearch,
  SiteHeaderSubNav,
  SiteHeaderUserMenu,
} from './SiteHeader';
import storyStyles from './SiteHeader.stories.module.scss';
import { storySourceParameters } from '../../utils/storySource';

const meta: Meta<typeof SiteHeader> = {
  title: 'Grouped Components/SiteHeader',
  component: SiteHeader,
  tags: ['autodocs'],
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <SiteHeader {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
};
export default meta;

type Story = StoryObj<typeof SiteHeader>;

export const Default: Story = {
  args: {
    children: (
      <>
        <SiteHeaderBrand href="/">Emerald</SiteHeaderBrand>
        <SiteHeaderNav>
          <SiteHeaderNavItem href="/product" active>
            Product
          </SiteHeaderNavItem>
          <SiteHeaderNavFlyoutItem label="Resources">
            <FlyoutMenuGroup>
              <FlyoutMenuLink
                href="/docs"
                label="Documentation"
                description="Implementation guides and API references."
              />
              <FlyoutMenuLink
                href="/patterns"
                label="Patterns"
                description="Production-ready examples for common flows."
              />
            </FlyoutMenuGroup>
          </SiteHeaderNavFlyoutItem>
          <SiteHeaderNavItem href="/pricing">Pricing</SiteHeaderNavItem>
        </SiteHeaderNav>
        <SiteHeaderActions>
          <SiteHeaderSearch />
          <Button variant="ghost">Sign in</Button>
          <Button>Get started</Button>
          <SiteHeaderUserMenu name="Ada Lovelace" email="ada@example.com">
            <DropdownItem>Profile</DropdownItem>
            <DropdownItem>Settings</DropdownItem>
          </SiteHeaderUserMenu>
        </SiteHeaderActions>
        <SiteHeaderMobileTrigger />
        <SiteHeaderMobileMenu>
          <a href="/product">Product</a>
          <a href="/docs">Documentation</a>
          <a href="/pricing">Pricing</a>
          <Button fullWidth>Get started</Button>
        </SiteHeaderMobileMenu>
      </>
    ),
  },
  parameters: storySourceParameters(
    [
      '<SiteHeader>',
      '  <SiteHeaderBrand href="/">Emerald</SiteHeaderBrand>',
      '  <SiteHeaderNav>',
      '    <SiteHeaderNavItem href="/product" active>Product</SiteHeaderNavItem>',
      '    <SiteHeaderNavFlyoutItem label="Resources">',
      '      <FlyoutMenuGroup>',
      '        <FlyoutMenuLink href="/docs" label="Documentation" description="Implementation guides and API references." />',
      '        <FlyoutMenuLink href="/patterns" label="Patterns" description="Production-ready examples for common flows." />',
      '      </FlyoutMenuGroup>',
      '    </SiteHeaderNavFlyoutItem>',
      '    <SiteHeaderNavItem href="/pricing">Pricing</SiteHeaderNavItem>',
      '  </SiteHeaderNav>',
      '  <SiteHeaderActions>',
      '    <SiteHeaderSearch />',
      '    <Button variant="ghost">Sign in</Button>',
      '    <Button>Get started</Button>',
      '  </SiteHeaderActions>',
      '  <SiteHeaderMobileTrigger />',
      '  <SiteHeaderMobileMenu>',
      '    <a href="/product">Product</a>',
      '    <a href="/docs">Documentation</a>',
      '    <a href="/pricing">Pricing</a>',
      '    <Button fullWidth>Get started</Button>',
      '  </SiteHeaderMobileMenu>',
      '</SiteHeader>',
    ].join('\n')
  ),
};

export const Transparent: Story = {
  args: {
    variant: 'transparent',
    sticky: true,
    children: (
      <>
        <SiteHeaderBrand href="/">Emerald</SiteHeaderBrand>
        <SiteHeaderNav>
          <SiteHeaderNavItem href="/platform">Platform</SiteHeaderNavItem>
          <SiteHeaderNavItem href="/customers">Customers</SiteHeaderNavItem>
        </SiteHeaderNav>
        <SiteHeaderActions>
          <Button variant="ghost" icon={ChevronRight} iconPosition="end">
            Explore
          </Button>
        </SiteHeaderActions>
      </>
    ),
  },
};

export const Brand: Story = {
  args: {
    theme: 'brand',
    children: (
      <>
        <SiteHeaderBrand href="/">Emerald</SiteHeaderBrand>
        <SiteHeaderNav>
          <SiteHeaderNavItem href="/platform">Platform</SiteHeaderNavItem>
          <SiteHeaderNavItem href="/customers">Customers</SiteHeaderNavItem>
        </SiteHeaderNav>
        <SiteHeaderActions>
          <Button variant="ghost" icon={ChevronRight} iconPosition="end">
            Explore
          </Button>
        </SiteHeaderActions>
      </>
    ),
  },
};

export const Compact: Story = {
  args: {
    compact: true,
    children: (
      <>
        <SiteHeaderBrand href="/">Emerald</SiteHeaderBrand>
        <SiteHeaderNav>
          <SiteHeaderNavItem href="/workspace" active>
            Workspace
          </SiteHeaderNavItem>
          <SiteHeaderNavFlyoutItem label="Resources">
            <FlyoutMenuGroup>
              <FlyoutMenuLink
                href="/docs"
                label="Documentation"
                description="Implementation guides and API references."
              />
            </FlyoutMenuGroup>
          </SiteHeaderNavFlyoutItem>
        </SiteHeaderNav>
        <SiteHeaderActions>
          <SiteHeaderSearch />
          <SiteHeaderUserMenu name="Ada Lovelace" email="ada@example.com">
            <DropdownItem>Profile</DropdownItem>
          </SiteHeaderUserMenu>
        </SiteHeaderActions>
      </>
    ),
  },
};

export const DarkMode: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope} data-theme="dark">
      <SiteHeader>
        <SiteHeaderBrand href="/">Emerald</SiteHeaderBrand>
        <SiteHeaderNav>
          <SiteHeaderNavItem href="/workspace" active>
            Workspace
          </SiteHeaderNavItem>
          <SiteHeaderNavItem href="/analytics">Analytics</SiteHeaderNavItem>
        </SiteHeaderNav>
        <SiteHeaderActions>
          <Button variant="ghost">Support</Button>
        </SiteHeaderActions>
      </SiteHeader>
    </div>
  ),
};

export const WithSubNav: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <SiteHeader>
        <SiteHeaderBrand href="/">Emerald</SiteHeaderBrand>
        <SiteHeaderNav>
          <SiteHeaderNavItem href="/workspace" active>
            Workspace
          </SiteHeaderNavItem>
          <SiteHeaderNavItem href="/analytics">Analytics</SiteHeaderNavItem>
        </SiteHeaderNav>
        <SiteHeaderActions>
          <Button variant="ghost">Support</Button>
        </SiteHeaderActions>
      </SiteHeader>
      <SiteHeaderSubNav>
        <a href="/workspace/overview">Overview</a>
        <a href="/workspace/releases">Releases</a>
      </SiteHeaderSubNav>
    </div>
  ),
};

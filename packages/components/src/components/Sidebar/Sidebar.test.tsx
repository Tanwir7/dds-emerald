// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Folder, House, Settings } from 'lucide-react';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import tagStyles from '../Tag/Tag.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
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

expect.extend(toHaveNoViolations);

const warningTagClassName = getRequiredClassName(tagStyles, 'variantWarning');
const dangerTagClassName = getRequiredClassName(tagStyles, 'variantDanger');

const mediaListeners = new Set<(event: MediaQueryListEvent) => void>();
const mediaQueryLists = new Set<{
  matches: boolean;
  media: string;
}>();
let mediaMatches = false;

beforeAll(() => {
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ??
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

  Object.defineProperty(globalThis, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => {
      const mediaQueryList = {
        matches: mediaMatches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            mediaListeners.add(listener);
          }
        }),
        removeEventListener: vi.fn(
          (event: string, listener: (event: MediaQueryListEvent) => void) => {
            if (event === 'change') {
              mediaListeners.delete(listener);
            }
          }
        ),
        dispatchEvent: vi.fn(),
      };

      mediaQueryLists.add(mediaQueryList);

      return mediaQueryList;
    }),
  });
});

afterEach(() => {
  cleanup();
  mediaMatches = false;
  mediaListeners.clear();
  mediaQueryLists.clear();
});

const emitMediaChange = (matches: boolean) => {
  mediaMatches = matches;
  mediaQueryLists.forEach((mediaQueryList) => {
    mediaQueryList.matches = matches;
  });
  const event = { matches } as MediaQueryListEvent;
  mediaListeners.forEach((listener) => listener(event));
};

const SidebarStateProbe = () => {
  const { collapsed, mobileOpen, isMobile, collapsible, setCollapsed, setMobileOpen } =
    useSidebar();

  return (
    <div>
      <span>collapsed:{collapsed ? 'true' : 'false'}</span>
      <span>mobile:{mobileOpen ? 'true' : 'false'}</span>
      <span>isMobile:{isMobile ? 'true' : 'false'}</span>
      <span>collapsible:{collapsible ? 'true' : 'false'}</span>
      <button type="button" onClick={() => setCollapsed(!collapsed)}>
        toggle collapsed
      </button>
      <button type="button" onClick={() => setMobileOpen(!mobileOpen)}>
        toggle mobile
      </button>
    </div>
  );
};

const renderSidebarShell = ({
  providerProps,
  includeTop = true,
}: {
  providerProps?: Partial<React.ComponentProps<typeof SidebarProvider>>;
  includeTop?: boolean;
} = {}) =>
  render(
    <SidebarProvider {...providerProps}>
      <Sidebar>
        {includeTop ? (
          <SidebarTop>
            <span>Brand</span>
            <SidebarCollapseToggle />
          </SidebarTop>
        ) : null}
        <SidebarContent>
          <SidebarGroup label="Workspace" icon={House}>
            <SidebarItem href="#" icon={House} label="Overview" active badge={3} />
            <SidebarItem icon={Folder} label="Projects">
              <SidebarSubItem href="#" label="Roadmap" />
              <SidebarSubItem href="#" label="Launches" active />
            </SidebarItem>
          </SidebarGroup>
        </SidebarContent>
        <SidebarBottom>
          <SidebarItem href="#" icon={Settings} label="Settings" />
        </SidebarBottom>
      </Sidebar>
    </SidebarProvider>
  );

const renderRailFlyoutShell = () =>
  render(
    <>
      <button type="button">Before sidebar</button>
      <SidebarProvider defaultCollapsed>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup label="Workspace" icon={House}>
              <SidebarItem icon={Folder} label="Projects">
                <SidebarSubItem href="#" label="Roadmap" />
                <SidebarSubItem href="#" label="Launches" />
              </SidebarItem>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </>
  );

describe('Sidebar', () => {
  describe('SidebarProvider / useSidebar', () => {
    it('useSidebar throws outside SidebarProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<SidebarStateProbe />)).toThrow(
        'useSidebar must be used within SidebarProvider'
      );

      consoleError.mockRestore();
    });

    it('provides collapsed=false by default and updates collapsed state', async () => {
      const user = userEvent.setup();

      render(
        <SidebarProvider>
          <SidebarStateProbe />
        </SidebarProvider>
      );

      expect(screen.getByText('collapsed:false')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'toggle collapsed' }));

      expect(screen.getByText('collapsed:true')).toBeInTheDocument();
    });

    it('calls onCollapsedChange callback', async () => {
      const user = userEvent.setup();
      const onCollapsedChange = vi.fn();

      render(
        <SidebarProvider onCollapsedChange={onCollapsedChange}>
          <SidebarStateProbe />
        </SidebarProvider>
      );

      await user.click(screen.getByRole('button', { name: 'toggle collapsed' }));

      expect(onCollapsedChange).toHaveBeenCalledWith(true);
    });

    it('controlled collapsed prop overrides internal state', async () => {
      const user = userEvent.setup();
      const onCollapsedChange = vi.fn();

      render(
        <SidebarProvider collapsed onCollapsedChange={onCollapsedChange}>
          <SidebarStateProbe />
        </SidebarProvider>
      );

      expect(screen.getByText('collapsed:true')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'toggle collapsed' }));

      expect(screen.getByText('collapsed:true')).toBeInTheDocument();
      expect(onCollapsedChange).toHaveBeenCalledWith(false);
    });

    it('does not collapse when collapsible=false', async () => {
      const user = userEvent.setup();
      const onCollapsedChange = vi.fn();

      render(
        <SidebarProvider collapsible={false} onCollapsedChange={onCollapsedChange}>
          <SidebarStateProbe />
        </SidebarProvider>
      );

      await user.click(screen.getByRole('button', { name: 'toggle collapsed' }));

      expect(screen.getByText('collapsed:false')).toBeInTheDocument();
      expect(screen.getByText('collapsible:false')).toBeInTheDocument();
      expect(onCollapsedChange).not.toHaveBeenCalled();
    });

    it('updates isMobile when the media query changes', async () => {
      render(
        <SidebarProvider>
          <SidebarStateProbe />
        </SidebarProvider>
      );

      expect(screen.getByText('isMobile:false')).toBeInTheDocument();

      act(() => {
        emitMediaChange(true);
      });

      await waitFor(() => {
        expect(screen.getByText('isMobile:true')).toBeInTheDocument();
      });
    });
  });

  describe('desktop rendering', () => {
    it('renders nav with aria-label Main navigation', () => {
      renderSidebarShell();

      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    });

    it('applies collapsed class when collapsed=true', () => {
      renderSidebarShell({ providerProps: { defaultCollapsed: true } });

      expect(screen.getByRole('navigation').className).toMatch(/sidebarCollapsed/);
    });

    it('renders without SidebarTop when omitted', () => {
      renderSidebarShell({ includeTop: false });

      expect(screen.queryByText('Brand')).not.toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Workspace' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
    });
  });

  describe('mobile rendering', () => {
    it('renders Sheet when isMobile=true', async () => {
      mediaMatches = true;

      renderSidebarShell({ providerProps: { defaultMobileOpen: true } });

      expect(await screen.findByRole('dialog', { name: 'Navigation' })).toBeInTheDocument();
    });

    it('closes the sheet when the close button is clicked and restores focus to trigger', async () => {
      mediaMatches = true;
      const user = userEvent.setup();

      render(
        <SidebarProvider defaultMobileOpen={false}>
          <MobileHarness />
        </SidebarProvider>
      );

      const trigger = screen.getByRole('button', { name: 'Open navigation' });
      await user.click(trigger);
      expect(await screen.findByRole('dialog', { name: 'Navigation' })).toBeInTheDocument();

      await user.click(await screen.findByRole('button', { name: 'Close sheet' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: 'Navigation' })).not.toBeInTheDocument();
      });
      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });
  });

  describe('SidebarGroup', () => {
    it('renders group label and children', () => {
      renderSidebarShell();

      expect(screen.getByRole('button', { name: 'Workspace' })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Workspace' })).toContainElement(
        screen.getByRole('link', { name: /Overview/ })
      );
    });

    it('group label is aria-hidden when not a toggle button', () => {
      render(
        <SidebarProvider>
          <SidebarGroup label="Utilities" collapsible={false}>
            <SidebarItem href="#" label="Reports" />
          </SidebarGroup>
        </SidebarProvider>
      );

      expect(screen.getByText('Utilities')).toHaveAttribute('aria-hidden', 'true');
    });

    it('non-collapsible group keeps items visible even when defaultOpen is false', () => {
      render(
        <SidebarProvider>
          <SidebarGroup label="Utilities" collapsible={false} defaultOpen={false}>
            <SidebarItem href="#" label="Reports" />
          </SidebarGroup>
        </SidebarProvider>
      );

      expect(screen.queryByRole('button', { name: 'Utilities' })).not.toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Utilities' })).toContainElement(
        screen.getByRole('link', { name: 'Reports' })
      );
    });

    it('clicking toggle collapses and expands the group', async () => {
      const user = userEvent.setup();
      renderSidebarShell();

      const toggle = screen.getByRole('button', { name: 'Workspace' });
      expect(toggle).toHaveAttribute('aria-expanded', 'true');

      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByRole('group', { name: 'Workspace' }).className).toMatch(
        /groupItemsHidden/
      );

      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    it('controlled open prop works', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <SidebarProvider>
          <SidebarGroup label="Utilities" open={false} onOpenChange={onOpenChange}>
            <SidebarItem href="#" label="Reports" />
          </SidebarGroup>
        </SidebarProvider>
      );

      const toggle = screen.getByRole('button', { name: 'Utilities' });
      await user.click(toggle);

      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('SidebarItem', () => {
    it('leaf expanded mode renders active state and badge', () => {
      renderSidebarShell();

      const overview = screen.getByRole('link', { name: /Overview/ });
      expect(overview).toHaveAttribute('aria-current', 'page');
      expect(screen.getByLabelText('3 notifications')).toBeInTheDocument();
    });

    it('renders badge variants with Tag status styles', () => {
      render(
        <SidebarProvider>
          <SidebarGroup label="Workspace">
            <SidebarItem href="#" label="Incidents" badge="Error" badgeVariant="danger" />
            <SidebarSubItem href="#" label="Approvals" badge="Warning" badgeVariant="warning" />
          </SidebarGroup>
        </SidebarProvider>
      );

      expect(screen.getByLabelText('Error')).toHaveClass(dangerTagClassName);
      expect(screen.getByLabelText('Warning')).toHaveClass(warningTagClassName);
    });

    it('parent with children expanded mode toggles sub-items as a button', async () => {
      const user = userEvent.setup();
      render(
        <SidebarProvider>
          <SidebarItem href="#ignored" icon={Folder} label="Projects">
            <SidebarSubItem href="#" label="Roadmap" />
          </SidebarItem>
        </SidebarProvider>
      );

      const parent = screen.getByRole('button', { name: 'Projects' });
      expect(parent).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('link', { name: 'Projects' })).not.toBeInTheDocument();

      await user.click(parent);

      expect(parent).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('link', { name: 'Roadmap' })).toBeInTheDocument();
    });

    it('non-collapsible parent keeps sub-items visible and renders the parent as a link', async () => {
      const user = userEvent.setup();

      render(
        <SidebarProvider>
          <SidebarItem href="#" icon={Folder} label="Projects" collapsible={false}>
            <SidebarSubItem href="#" label="Roadmap" />
          </SidebarItem>
        </SidebarProvider>
      );

      const parent = screen.getByRole('link', { name: 'Projects' });
      expect(parent).not.toHaveAttribute('aria-expanded');
      expect(screen.getByRole('link', { name: 'Roadmap' })).toBeInTheDocument();

      await user.click(parent);

      expect(screen.getByRole('link', { name: 'Roadmap' })).toBeInTheDocument();
    });

    it('rail mode leaf renders aria-label and tooltip', async () => {
      const user = userEvent.setup();
      renderSidebarShell({ providerProps: { defaultCollapsed: true } });

      const overview = screen.getByRole('link', { name: 'Overview' });
      expect(overview).toHaveAttribute('aria-label', 'Overview');
      expect(overview).toHaveAttribute('data-rail-notification', 'true');

      await user.hover(overview);

      expect(await screen.findByRole('tooltip')).toHaveTextContent('Overview');
    });

    it('rail mode parent opens flyout when tabbed to', async () => {
      const user = userEvent.setup();
      renderRailFlyoutShell();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Before sidebar' })).toHaveFocus();

      await user.tab();

      const projects = screen.getByRole('button', { name: 'Projects' });
      expect(projects).toHaveFocus();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Roadmap' })).toBeInTheDocument();
      });

      expect(projects).toHaveAttribute('aria-expanded', 'true');
    });

    it('rail mode parent tabs into the first flyout sub-item', async () => {
      const user = userEvent.setup();
      renderRailFlyoutShell();

      await user.tab();
      await user.tab();

      const projects = screen.getByRole('button', { name: 'Projects' });
      expect(projects).toHaveFocus();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Roadmap' })).toBeInTheDocument();
      });

      await user.tab();

      expect(screen.getByRole('link', { name: 'Roadmap' })).toHaveFocus();
    });

    it('rail mode flyout tabs through sub-items in DOM order', async () => {
      const user = userEvent.setup();
      renderRailFlyoutShell();

      await user.tab();
      await user.tab();
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Roadmap' })).toBeInTheDocument();
      });

      await user.tab();
      expect(screen.getByRole('link', { name: 'Roadmap' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Launches' })).toHaveFocus();
    });

    it('rail mode flyout stays open while keyboard focus is inside it', async () => {
      const user = userEvent.setup();
      renderRailFlyoutShell();

      await user.tab();
      await user.tab();
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Roadmap' })).toBeInTheDocument();
      });

      await user.tab();

      const roadmap = screen.getByRole('link', { name: 'Roadmap' });
      expect(roadmap).toHaveFocus();

      await act(async () => {
        await new Promise((resolve) => window.setTimeout(resolve, 160));
      });

      expect(roadmap).toHaveFocus();
      expect(screen.getByRole('link', { name: 'Launches' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Projects' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });

    it('rail mode parent supports keyboard entry into the flyout', async () => {
      const user = userEvent.setup();
      renderRailFlyoutShell();

      const projects = screen.getByRole('button', { name: 'Projects' });

      await act(async () => {
        projects.focus();
      });

      await user.keyboard('{ArrowRight}');
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Roadmap' })).toHaveFocus();
      });

      await act(async () => {
        projects.focus();
      });

      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Roadmap' })).toHaveFocus();
      });

      await act(async () => {
        projects.focus();
      });

      await user.keyboard(' ');
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Roadmap' })).toHaveFocus();
      });
    });

    it('rail mode flyout closes on Escape and restores focus to the parent trigger', async () => {
      const user = userEvent.setup();
      renderRailFlyoutShell();

      await user.tab();
      await user.tab();
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Roadmap' })).toBeInTheDocument();
      });

      await user.tab();

      const projects = screen.getByRole('button', { name: 'Projects' });
      const roadmap = screen.getByRole('link', { name: 'Roadmap' });

      expect(roadmap).toHaveFocus();

      expect(projects).toHaveAttribute('aria-haspopup', 'dialog');
      expect(projects).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('link', { name: 'Roadmap' })).not.toBeInTheDocument();
      });
      await waitFor(() => {
        expect(projects).toHaveFocus();
      });
    });

    it('rail mode parent shift-tabs backward without entering the flyout', async () => {
      const user = userEvent.setup();
      renderRailFlyoutShell();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Before sidebar' })).toHaveFocus();

      await user.tab();

      const projects = screen.getByRole('button', { name: 'Projects' });
      expect(projects).toHaveFocus();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Roadmap' })).toBeInTheDocument();
      });

      await user.tab({ shift: true });

      expect(screen.getByRole('button', { name: 'Before sidebar' })).toHaveFocus();
      expect(screen.queryByRole('link', { name: 'Roadmap' })).not.toBeInTheDocument();
    });

    it('disabled item remains disabled', () => {
      render(
        <SidebarProvider>
          <SidebarItem label="Disabled item" disabled />
        </SidebarProvider>
      );

      expect(screen.getByRole('button', { name: 'Disabled item' })).toBeDisabled();
    });
  });

  describe('SidebarSubItem', () => {
    it('renders as anchor when href provided and as button when onClick provided', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();

      render(
        <SidebarProvider>
          <SidebarSubItem href="#" label="Reports" active />
          <SidebarSubItem label="Refresh" onClick={onClick} />
        </SidebarProvider>
      );

      expect(screen.getByRole('link', { name: 'Reports' })).toHaveAttribute('aria-current', 'page');

      await user.click(screen.getByRole('button', { name: 'Refresh' }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('SidebarCollapseToggle', () => {
    it('renders a visible label in expanded mode and toggles collapsed state', async () => {
      const user = userEvent.setup();

      render(
        <SidebarProvider>
          <SidebarCollapseToggle />
          <SidebarStateProbe />
        </SidebarProvider>
      );

      const toggle = screen.getByRole('button', { name: 'Collapse sidebar' });
      expect(toggle).toHaveTextContent('Collapse');
      expect(toggle).toHaveAttribute('aria-expanded', 'true');

      await user.click(toggle);

      expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
      expect(screen.getByText('collapsed:true')).toBeInTheDocument();
    });

    it('shows a tooltip in collapsed rail mode', async () => {
      const user = userEvent.setup();

      render(
        <SidebarProvider defaultCollapsed>
          <SidebarCollapseToggle />
        </SidebarProvider>
      );

      const toggle = screen.getByRole('button', { name: 'Expand sidebar' });
      expect(toggle).not.toHaveTextContent('Expand');

      await user.hover(toggle);

      expect(await screen.findByRole('tooltip')).toHaveTextContent('Expand sidebar');
    });

    it('does not render when provider collapsible=false', () => {
      render(
        <SidebarProvider collapsible={false}>
          <SidebarCollapseToggle />
        </SidebarProvider>
      );

      expect(screen.queryByRole('button', { name: /sidebar/i })).not.toBeInTheDocument();
    });
  });

  it('has no a11y violations in expanded mode', async () => {
    const { container } = renderSidebarShell();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations in collapsed mode', async () => {
    const { container } = renderSidebarShell({ providerProps: { defaultCollapsed: true } });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations in mobile mode', async () => {
    mediaMatches = true;
    const { container } = renderSidebarShell({ providerProps: { defaultMobileOpen: true } });
    expect(await screen.findByRole('dialog', { name: 'Navigation' })).toBeInTheDocument();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations without SidebarTop', async () => {
    const { container } = renderSidebarShell({ includeTop: false });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

const MobileHarness = () => {
  const { setMobileOpen } = useSidebar();

  return (
    <>
      <button type="button" onClick={() => setMobileOpen(true)}>
        Open navigation
      </button>
      <Sidebar>
        <SidebarTop>
          <span>Brand</span>
        </SidebarTop>
        <SidebarContent>
          <SidebarGroup label="Workspace" icon={House}>
            <SidebarItem href="#" icon={House} label="Overview" active />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
};

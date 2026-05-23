// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
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
  type SiteHeaderProps,
  SiteHeaderUserMenu,
} from './SiteHeader';
import styles from './SiteHeader.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const compactClassName = getRequiredClassName(styles, 'compact');
const navLinkClassName = getRequiredClassName(styles, 'navLink');
const userMenuTriggerAnchorClassName = getRequiredClassName(styles, 'userMenuTriggerAnchor');
const userMenuTriggerClassName = getRequiredClassName(styles, 'userMenuTrigger');

const axeOptions = {
  rules: {
    region: {
      enabled: false,
    },
  },
};

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

  Object.defineProperty(globalThis, 'scrollY', {
    configurable: true,
    writable: true,
    value: 0,
  });
});

afterEach(() => {
  cleanup();
  mediaMatches = false;
  mediaListeners.clear();
  mediaQueryLists.clear();
  globalThis.scrollY = 0;
  document.documentElement.removeAttribute('data-theme');
});

const emitMediaChange = (matches: boolean) => {
  mediaMatches = matches;
  mediaQueryLists.forEach((mediaQueryList) => {
    mediaQueryList.matches = matches;
  });

  const event = { matches } as MediaQueryListEvent;
  mediaListeners.forEach((listener) => listener(event));
};

const renderDesktopHeader = () =>
  render(
    <>
      <SiteHeader variant="underline">
        <SiteHeaderBrand href="/home">DDS</SiteHeaderBrand>
        <SiteHeaderNav>
          <SiteHeaderNavItem href="/product" active>
            Product
          </SiteHeaderNavItem>
          <SiteHeaderNavFlyoutItem label="Resources">
            <FlyoutMenuGroup>
              <FlyoutMenuLink href="/docs" label="Documentation" />
            </FlyoutMenuGroup>
          </SiteHeaderNavFlyoutItem>
          <SiteHeaderNavItem href="https://example.com" external>
            External
          </SiteHeaderNavItem>
        </SiteHeaderNav>
        <SiteHeaderActions>
          <SiteHeaderSearch onSearch={vi.fn()} />
          <SiteHeaderUserMenu name="Ada Lovelace" email="ada@example.com">
            <DropdownItem>Profile</DropdownItem>
          </SiteHeaderUserMenu>
        </SiteHeaderActions>
      </SiteHeader>
      <SiteHeaderSubNav>
        <a href="/overview">Overview</a>
      </SiteHeaderSubNav>
    </>
  );

const renderInDarkMode = (ui: React.ReactElement) => {
  document.documentElement.setAttribute('data-theme', 'dark');

  return render(ui);
};

describe('SiteHeader', () => {
  it('rejects the removed dark theme at the type level', () => {
    const props: SiteHeaderProps = {
      // @ts-expect-error SiteHeader no longer accepts an explicit dark theme.
      theme: 'dark',
      children: 'content',
    };

    expect(props.children).toBe('content');
  });

  it('renders the root header and brand link', () => {
    render(
      <SiteHeader>
        <SiteHeaderBrand>Emerald</SiteHeaderBrand>
      </SiteHeader>
    );

    expect(screen.getByLabelText('Site navigation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Emerald' })).toHaveAttribute('href', '/');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLElement>();

    render(<SiteHeader ref={ref}>content</SiteHeader>);

    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('applies sticky and bordered classes', () => {
    render(
      <SiteHeader sticky bordered className="custom">
        content
      </SiteHeader>
    );

    expect(screen.getByLabelText('Site navigation')).toHaveClass('custom');
  });

  it('applies compact sizing classes', () => {
    render(
      <SiteHeader compact>
        <SiteHeaderBrand href="/home">DDS</SiteHeaderBrand>
        <SiteHeaderNav>
          <SiteHeaderNavItem href="/product">Product</SiteHeaderNavItem>
        </SiteHeaderNav>
        <SiteHeaderActions>
          <SiteHeaderUserMenu name="Ada Lovelace">
            <DropdownItem>Profile</DropdownItem>
          </SiteHeaderUserMenu>
        </SiteHeaderActions>
      </SiteHeader>
    );

    const header = screen.getByLabelText('Site navigation');
    const navLink = screen.getByRole('link', { name: 'Product' });
    const userMenuTrigger = screen.getByRole('button', { name: 'Account menu for Ada Lovelace' });

    expect(header).toHaveClass(compactClassName);
    expect(navLink).toHaveClass(navLinkClassName);
    expect(userMenuTrigger).toHaveClass(userMenuTriggerAnchorClassName);
  });

  it('uses the default theme styling path without a theme class', () => {
    render(<SiteHeader>content</SiteHeader>);

    expect(screen.getByLabelText('Site navigation').className).not.toMatch(/theme/i);
  });

  it('inherits dark mode through the repo theme mechanism without a theme prop', () => {
    renderInDarkMode(<SiteHeader>content</SiteHeader>);

    expect(screen.getByLabelText('Site navigation')).not.toHaveClass('themeDark');
  });

  it('keeps the brand theme explicit in dark mode', () => {
    renderInDarkMode(<SiteHeader theme="brand">content</SiteHeader>);

    expect(screen.getByLabelText('Site navigation').className).toMatch(/themeBrand/);
  });

  it('marks active nav links and external links correctly', () => {
    renderDesktopHeader();

    expect(screen.getByRole('link', { name: 'Product' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /External/i })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: /External/i })).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
  });

  it('opens flyout navigation content', async () => {
    const user = userEvent.setup();

    renderDesktopHeader();

    await user.hover(screen.getByRole('button', { name: 'Resources' }));

    expect(await screen.findByRole('navigation', { name: 'Resources navigation' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Documentation' })).toBeInTheDocument();
  });

  it('expands search, focuses the input, and calls onSearch on Enter', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(
      <SiteHeader>
        <SiteHeaderActions>
          <SiteHeaderSearch onSearch={onSearch} />
        </SiteHeaderActions>
      </SiteHeader>
    );

    await user.click(screen.getByRole('button', { name: 'Open search' }));

    const input = await screen.findByRole('textbox', { name: 'Search…' });
    expect(input).toHaveFocus();

    await user.type(input, 'tokens{enter}');

    expect(onSearch).toHaveBeenCalledWith('tokens');
  });

  it('closes expanded search on Escape', async () => {
    const user = userEvent.setup();

    render(
      <SiteHeader>
        <SiteHeaderActions>
          <SiteHeaderSearch defaultExpanded />
        </SiteHeaderActions>
      </SiteHeader>
    );

    const input = screen.getByRole('textbox', { name: 'Search…' });

    await user.type(input, '{escape}');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Open search' })).toBeInTheDocument();
    });
  });

  it('moves focus to the search toggle button after closing with Escape', async () => {
    const user = userEvent.setup();

    render(
      <SiteHeader>
        <SiteHeaderActions>
          <SiteHeaderSearch defaultExpanded />
        </SiteHeaderActions>
      </SiteHeader>
    );

    const input = screen.getByRole('textbox', { name: 'Search…' });

    await user.type(input, '{escape}');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Open search' })).toHaveFocus();
    });
  });

  it('opens the user menu and renders account details', async () => {
    const user = userEvent.setup();

    render(
      <SiteHeader>
        <SiteHeaderActions>
          <SiteHeaderUserMenu name="Ada Lovelace" email="ada@example.com">
            <DropdownItem>Profile</DropdownItem>
          </SiteHeaderUserMenu>
        </SiteHeaderActions>
      </SiteHeader>
    );

    await user.click(screen.getByRole('button', { name: 'Account menu for Ada Lovelace' }));

    expect(await screen.findByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('uses a full-height user menu trigger anchor while keeping the compact inner trigger content', () => {
    render(
      <SiteHeader>
        <SiteHeaderActions>
          <SiteHeaderUserMenu name="Ada Lovelace" email="ada@example.com">
            <DropdownItem>Profile</DropdownItem>
          </SiteHeaderUserMenu>
        </SiteHeaderActions>
      </SiteHeader>
    );

    const trigger = screen.getByRole('button', { name: 'Account menu for Ada Lovelace' });

    expect(trigger).toHaveClass(userMenuTriggerAnchorClassName);
    expect(trigger.firstElementChild).toHaveClass(userMenuTriggerClassName);
  });

  it('shows the mobile trigger and opens the mobile menu on mobile', async () => {
    const user = userEvent.setup();
    mediaMatches = true;

    render(
      <SiteHeader>
        <SiteHeaderBrand>DDS</SiteHeaderBrand>
        <SiteHeaderMobileTrigger />
        <SiteHeaderMobileMenu>
          <nav aria-label="Mobile navigation">
            <a href="/product">Product</a>
          </nav>
        </SiteHeaderMobileMenu>
      </SiteHeader>
    );

    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));

    expect(await screen.findByRole('dialog', { name: 'Navigation menu' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Product' })).toBeInTheDocument();
  });

  it('closes the mobile menu when the viewport leaves mobile', async () => {
    const user = userEvent.setup();
    mediaMatches = true;

    render(
      <SiteHeader>
        <SiteHeaderMobileTrigger />
        <SiteHeaderMobileMenu>
          <div>Mobile content</div>
        </SiteHeaderMobileMenu>
      </SiteHeader>
    );

    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    expect(await screen.findByRole('dialog', { name: 'Navigation menu' })).toBeVisible();

    act(() => {
      emitMediaChange(false);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Navigation menu' })).not.toBeInTheDocument();
    });
  });

  it('applies the transparent scrolled state after scroll', () => {
    render(<SiteHeader variant="transparent">content</SiteHeader>);

    const header = screen.getByLabelText('Site navigation');
    const initialClassName = header.className;

    globalThis.scrollY = 12;
    fireEvent.scroll(window);

    expect(header.className).not.toBe(initialClassName);
  });

  it('throws when a compound subcomponent is used outside SiteHeader', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<SiteHeaderNav>Invalid</SiteHeaderNav>)).toThrow(
      'useSiteHeader must be used within SiteHeader'
    );

    consoleError.mockRestore();
  });

  it('has no accessibility violations for a representative composition', async () => {
    const { container } = renderDesktopHeader();
    const results = await axe(container, axeOptions);

    expect(results).toHaveNoViolations();
  });
});

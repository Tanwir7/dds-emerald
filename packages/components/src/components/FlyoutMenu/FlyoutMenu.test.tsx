// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BookOpen } from 'lucide-react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';
import {
  FlyoutMenu,
  FlyoutMenuCTABar,
  FlyoutMenuContent,
  FlyoutMenuFeaturedCard,
  FlyoutMenuFeaturedHighlight,
  FlyoutMenuFooter,
  FlyoutMenuGroup,
  FlyoutMenuGroupLabel,
  FlyoutMenuLink,
  FlyoutMenuTrigger,
  type FlyoutMenuContentProps,
  type FlyoutMenuProps,
} from './FlyoutMenu';

expect.extend(toHaveNoViolations);

const testImageDataUri = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const axeOptions = {
  rules: {
    region: {
      enabled: false,
    },
  },
};

beforeAll(() => {
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ??
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

afterEach(async () => {
  cleanup();

  if (vi.isFakeTimers()) {
    vi.runOnlyPendingTimers();
    vi.clearAllTimers();
    vi.useRealTimers();
  }

  await act(async () => {
    await Promise.resolve();
  });
});

const renderTriggerLink = (label = 'Open flyout') => <a href="#trigger">{label}</a>;

const renderFlyout = (
  rootProps: Partial<FlyoutMenuProps> = {},
  contentProps: Partial<FlyoutMenuContentProps> = {}
) => {
  render(
    <main>
      <button type="button">Before</button>
      <FlyoutMenu {...rootProps}>
        <FlyoutMenuTrigger>{renderTriggerLink()}</FlyoutMenuTrigger>
        <FlyoutMenuContent label="Primary navigation" {...contentProps}>
          <FlyoutMenuGroup>
            <FlyoutMenuGroupLabel>Explore</FlyoutMenuGroupLabel>
            <FlyoutMenuLink
              href="#docs"
              icon={BookOpen}
              label="Documentation"
              description="Read the implementation guide."
              badge="New"
            />
            <FlyoutMenuLink href="#api" label="API reference" external />
          </FlyoutMenuGroup>
        </FlyoutMenuContent>
      </FlyoutMenu>
      <button type="button">After</button>
    </main>
  );

  return {
    trigger: screen.getByRole('link', { name: 'Open flyout' }),
    before: screen.getByRole('button', { name: 'Before' }),
    after: screen.getByRole('button', { name: 'After' }),
  };
};

const getFlyoutContent = () => screen.queryByRole('navigation');

const getOpenFlyoutContent = async () => {
  await waitFor(() => {
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  return screen.getByRole('navigation');
};

const wait = async (duration: number) => {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  });
};

const hoverElement = (element: Element) => {
  fireEvent.pointerEnter(element);
  fireEvent.mouseEnter(element);
};

const unhoverElement = (element: Element) => {
  fireEvent.pointerLeave(element);
  fireEvent.mouseLeave(element);
};

describe('FlyoutMenu', () => {
  describe('Rendering', () => {
    it('renders the trigger child', () => {
      const { trigger } = renderFlyout();

      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName).toBe('A');
    });

    it('does not render content when closed', () => {
      renderFlyout();

      expect(getFlyoutContent()).not.toBeInTheDocument();
    });

    it('renders content when controlled open', () => {
      renderFlyout({ open: true });

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('renders FlyoutMenuLink with label, icon, description, and badge', () => {
      renderFlyout({ open: true });

      const link = screen.getByRole('link', { name: /Documentation/i });
      const icon = link.querySelector('svg.lucide-book-open');

      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent('Documentation');
      expect(link).toHaveTextContent('Read the implementation guide.');
      expect(link).toHaveTextContent('New');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders FlyoutMenuGroup with role="group"', () => {
      renderFlyout({ open: true });

      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('renders FlyoutMenuFeaturedCard with image and title', () => {
      render(
        <FlyoutMenu open>
          <FlyoutMenuTrigger>{renderTriggerLink()}</FlyoutMenuTrigger>
          <FlyoutMenuContent layout="list-featured" width="xl" label="Featured navigation">
            <FlyoutMenuGroup>
              <FlyoutMenuLink href="#docs" label="Documentation" />
            </FlyoutMenuGroup>
            <FlyoutMenuFeaturedCard
              href="#feature"
              image={testImageDataUri}
              imageAlt="Preview graphic"
              title="Launch checklist"
            />
          </FlyoutMenuContent>
        </FlyoutMenu>
      );

      expect(screen.getByRole('img', { name: 'Preview graphic' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Launch checklist/i })).toBeInTheDocument();
    });

    it('renders FlyoutMenuFeaturedHighlight with title, description, and link', () => {
      render(
        <FlyoutMenu open>
          <FlyoutMenuTrigger>{renderTriggerLink()}</FlyoutMenuTrigger>
          <FlyoutMenuContent layout="list-featured" width="xl" label="Highlight navigation">
            <FlyoutMenuGroup>
              <FlyoutMenuLink href="#docs" label="Documentation" />
            </FlyoutMenuGroup>
            <FlyoutMenuFeaturedHighlight
              title="Migration office hours"
              description="Bring your component backlog."
              href="#office-hours"
              linkLabel="Reserve a slot"
            />
          </FlyoutMenuContent>
        </FlyoutMenu>
      );

      expect(screen.getByText('Migration office hours')).toBeInTheDocument();
      expect(screen.getByText('Bring your component backlog.')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Reserve a slot' })).toBeInTheDocument();
    });

    it('renders FlyoutMenuCTABar with children', () => {
      render(
        <FlyoutMenu open>
          <FlyoutMenuTrigger>{renderTriggerLink()}</FlyoutMenuTrigger>
          <FlyoutMenuContent label="CTA navigation">
            <FlyoutMenuLink href="#docs" label="Documentation" />
            <FlyoutMenuCTABar>
              <Button>Book a review</Button>
            </FlyoutMenuCTABar>
          </FlyoutMenuContent>
        </FlyoutMenu>
      );

      expect(screen.getByRole('button', { name: 'Book a review' })).toBeInTheDocument();
    });

    it('renders FlyoutMenuFooter', () => {
      render(
        <FlyoutMenu open>
          <FlyoutMenuTrigger>{renderTriggerLink()}</FlyoutMenuTrigger>
          <FlyoutMenuContent label="Footer navigation">
            <FlyoutMenuLink href="#docs" label="Documentation" />
            <FlyoutMenuFooter>
              <a href="#legal">Legal</a>
            </FlyoutMenuFooter>
          </FlyoutMenuContent>
        </FlyoutMenu>
      );

      expect(screen.getByRole('link', { name: 'Legal' })).toBeInTheDocument();
    });
  });

  describe('Layout classes', () => {
    it('applies the list layout class by default', () => {
      renderFlyout({ open: true });

      expect(screen.getByRole('navigation').className).toMatch(/layout-list/);
    });

    it('applies the two-col layout class', () => {
      renderFlyout({ open: true }, { layout: 'two-col' });

      expect(screen.getByRole('navigation').className).toMatch(/layout-two-col/);
    });

    it('applies the four-col layout class', () => {
      renderFlyout({ open: true }, { layout: 'four-col' });

      expect(screen.getByRole('navigation').className).toMatch(/layout-four-col/);
    });

    it('applies the list-featured layout class', () => {
      renderFlyout({ open: true }, { layout: 'list-featured' });

      expect(screen.getByRole('navigation').className).toMatch(/layout-list-featured/);
    });

    it('applies the simple layout class', () => {
      renderFlyout({ open: true }, { layout: 'simple' });

      expect(screen.getByRole('navigation').className).toMatch(/layout-simple/);
    });
  });

  describe('Open and close', () => {
    it('opens after mouseenter on trigger', async () => {
      const user = userEvent.setup();
      const { trigger } = renderFlyout();

      await user.hover(trigger);

      expect(await getOpenFlyoutContent()).toBeInTheDocument();
    });

    it('closes after mouseleave from trigger after delay', async () => {
      const { trigger } = renderFlyout();

      hoverElement(trigger);
      await getOpenFlyoutContent();

      unhoverElement(trigger);
      await wait(149);
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      await wait(20);
      await waitFor(() => {
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      });
    });

    it('stays open when pointer moves from trigger to content', async () => {
      const { trigger } = renderFlyout();

      hoverElement(trigger);
      const content = await getOpenFlyoutContent();

      unhoverElement(trigger);
      hoverElement(content);
      await wait(180);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('stays open when the pointer re-enters the trigger before the close delay finishes', async () => {
      const { trigger } = renderFlyout();

      hoverElement(trigger);
      await getOpenFlyoutContent();

      unhoverElement(trigger);
      await wait(75);
      hoverElement(trigger);
      await wait(120);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('closes after mouseleave from content', async () => {
      const { trigger } = renderFlyout();

      hoverElement(trigger);
      const content = await getOpenFlyoutContent();

      hoverElement(content);
      unhoverElement(content);
      await wait(180);

      await waitFor(() => {
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      });
    });

    it('opens on trigger focus', async () => {
      const { trigger } = renderFlyout();

      await act(async () => {
        trigger.focus();
      });

      expect(await getOpenFlyoutContent()).toBeInTheDocument();
    });

    it('closes when focus leaves the content', async () => {
      const user = userEvent.setup();
      const { trigger, after } = renderFlyout();

      await act(async () => {
        trigger.focus();
      });

      const content = await getOpenFlyoutContent();
      const links = content.querySelectorAll('a');
      expect(links.length).toBeGreaterThan(0);

      await act(async () => {
        (links[0] as HTMLAnchorElement).focus();
      });

      await user.click(after);

      await waitFor(() => {
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      });
    });

    it('closes on Escape', async () => {
      const user = userEvent.setup();
      renderFlyout({ defaultOpen: true });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      });
    });
  });

  describe('Controlled', () => {
    it('controlled open prop renders content', () => {
      renderFlyout({ open: true });

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('calls onOpenChange on open and close', async () => {
      const onOpenChange = vi.fn();
      const { trigger } = renderFlyout({ onOpenChange });

      hoverElement(trigger);
      expect(onOpenChange).toHaveBeenCalledWith(true);

      unhoverElement(trigger);
      await wait(180);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Links and semantics', () => {
    it('FlyoutMenuLink renders as an anchor', () => {
      renderFlyout({ open: true });

      expect(screen.getByRole('link', { name: /Documentation/i }).tagName).toBe('A');
    });

    it('active link has aria-current="page"', () => {
      render(
        <FlyoutMenu open>
          <FlyoutMenuTrigger>{renderTriggerLink()}</FlyoutMenuTrigger>
          <FlyoutMenuContent label="Active navigation">
            <FlyoutMenuLink href="#docs" label="Documentation" active />
          </FlyoutMenuContent>
        </FlyoutMenu>
      );

      expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute(
        'aria-current',
        'page'
      );
    });

    it('external link has target, rel, and screen-reader text', () => {
      renderFlyout({ open: true });

      const link = screen.getByRole('link', { name: /API reference/i });

      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveTextContent('(opens in new tab)');
    });

    it('applies aria-label to content when label prop is provided', () => {
      renderFlyout({ open: true }, { label: 'Solutions navigation' });

      expect(screen.getByRole('navigation', { name: 'Solutions navigation' })).toBeInTheDocument();
    });

    it('trigger has aria-haspopup="true"', () => {
      const { trigger } = renderFlyout();

      expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    });
  });

  describe('Accessibility', () => {
    it('has no axe violations in the closed state', async () => {
      const { container } = render(
        <FlyoutMenu>
          <FlyoutMenuTrigger>{renderTriggerLink()}</FlyoutMenuTrigger>
          <FlyoutMenuContent label="Closed navigation">
            <FlyoutMenuLink href="#docs" label="Documentation" />
          </FlyoutMenuContent>
        </FlyoutMenu>
      );

      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });

    it.each([
      ['list', undefined],
      ['two-col', 'two-col'],
      ['four-col', 'four-col'],
      ['list-featured', 'list-featured'],
      ['simple', 'simple'],
    ] as const)('has no axe violations for layout %s', async (_name, layout) => {
      const { container } = render(
        <FlyoutMenu open>
          <FlyoutMenuTrigger>{renderTriggerLink()}</FlyoutMenuTrigger>
          <FlyoutMenuContent
            label={`${layout ?? 'list'} navigation`}
            {...(layout ? { layout } : {})}
            {...(layout === 'list-featured' ? { width: 'xl' } : {})}
          >
            <FlyoutMenuGroup>
              <FlyoutMenuGroupLabel>Explore</FlyoutMenuGroupLabel>
              <FlyoutMenuLink href="#docs" icon={BookOpen} label="Documentation" badge="New" />
              <FlyoutMenuLink href="#api" label="API reference" external />
            </FlyoutMenuGroup>
            {layout === 'list-featured' ? (
              <FlyoutMenuFeaturedCard
                href="#feature"
                image={testImageDataUri}
                imageAlt="Preview graphic"
                title="Launch checklist"
              />
            ) : null}
            {layout === 'four-col' ? (
              <FlyoutMenuCTABar>
                <Button variant="secondary">Talk to DDS</Button>
              </FlyoutMenuCTABar>
            ) : null}
            {layout === 'simple' ? (
              <FlyoutMenuFooter>
                <a href="#legal">Legal</a>
              </FlyoutMenuFooter>
            ) : null}
          </FlyoutMenuContent>
        </FlyoutMenu>
      );

      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });

    it('has no axe violations with a featured highlight', async () => {
      const { container } = render(
        <FlyoutMenu open>
          <FlyoutMenuTrigger>{renderTriggerLink()}</FlyoutMenuTrigger>
          <FlyoutMenuContent layout="list-featured" width="xl" label="Highlight navigation">
            <FlyoutMenuGroup>
              <FlyoutMenuLink href="#docs" label="Documentation" />
            </FlyoutMenuGroup>
            <FlyoutMenuFeaturedHighlight
              title="Migration office hours"
              description="Bring your component backlog."
              href="#office-hours"
              linkLabel="Reserve a slot"
            />
          </FlyoutMenuContent>
        </FlyoutMenu>
      );

      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });
  });
});

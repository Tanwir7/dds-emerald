// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Copy, FolderOpen, Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import styles from './ContextMenu.module.scss';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './ContextMenu';

expect.extend(toHaveNoViolations);

const itemDestructiveClassName = getRequiredClassName(styles, 'itemDestructive');
const itemInsetClassName = getRequiredClassName(styles, 'itemInset');
const radioDotClassName = getRequiredClassName(styles, 'radioDot');

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

  await act(async () => {
    await Promise.resolve();
  });
});

const renderContextMenu = (
  menuContent: React.ReactNode = (
    <>
      <ContextMenuItem>Open</ContextMenuItem>
      <ContextMenuItem>Rename</ContextMenuItem>
      <ContextMenuItem>Duplicate</ContextMenuItem>
    </>
  ),
  rootProps: Partial<React.ComponentProps<typeof ContextMenu>> = {}
) => {
  render(
    <main>
      <button type="button">Before</button>
      <ContextMenu {...rootProps}>
        <ContextMenuTrigger>
          <div>Right-click here</div>
        </ContextMenuTrigger>
        <ContextMenuContent>{menuContent}</ContextMenuContent>
      </ContextMenu>
      <button type="button">After</button>
    </main>
  );

  return {
    before: screen.getByRole('button', { name: 'Before' }),
    after: screen.getByRole('button', { name: 'After' }),
    triggerZone: screen.getByText('Right-click here'),
  };
};

const openMenu = async (triggerText = 'Right-click here') => {
  const user = userEvent.setup();
  const triggerZone = screen.getByText(triggerText);

  await user.pointer([{ target: triggerZone, keys: '[MouseRight]' }]);
  await screen.findByRole('menu');

  return { user, triggerZone, menu: screen.getByRole('menu') };
};

describe('ContextMenu', () => {
  describe('Rendering', () => {
    it('does not render menu content by default', () => {
      renderContextMenu();

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(screen.queryByText('Open')).not.toBeInTheDocument();
    });

    it('renders menu content when trigger is right-clicked', async () => {
      renderContextMenu();

      await openMenu();

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Open' })).toBeInTheDocument();
    });

    it('renders ContextMenuLabel text and ContextMenuSeparator', async () => {
      renderContextMenu(
        <>
          <ContextMenuLabel>File actions</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem>Open</ContextMenuItem>
        </>
      );

      const { menu } = await openMenu();
      expect(within(menu).getByText('File actions')).toBeInTheDocument();
      expect(within(menu).getByRole('separator')).toBeInTheDocument();
    });

    it('renders ContextMenuItem with icon and shortcut text', async () => {
      renderContextMenu(
        <ContextMenuItem icon={FolderOpen} shortcut="⌘O">
          Open
        </ContextMenuItem>
      );

      await openMenu();

      const item = screen.getByRole('menuitem', { name: 'Open' });
      const icon = item.querySelector('svg.lucide-folder-open');
      const shortcut = within(item).getByText('⌘O');

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(shortcut).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders checked and indeterminate checkbox indicators', async () => {
      renderContextMenu(
        <>
          <ContextMenuCheckboxItem checked>Show line numbers</ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked="indeterminate">Sync enabled</ContextMenuCheckboxItem>
        </>
      );

      await openMenu();

      expect(
        screen
          .getByRole('menuitemcheckbox', { name: 'Show line numbers' })
          .querySelector('svg.lucide-check')
      ).toBeInTheDocument();
      expect(
        screen
          .getByRole('menuitemcheckbox', { name: 'Sync enabled' })
          .querySelector('svg.lucide-minus')
      ).toBeInTheDocument();
    });

    it('renders selected radio item dot indicator', async () => {
      renderContextMenu(
        <ContextMenuRadioGroup value="name">
          <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
          <ContextMenuRadioItem value="date">Date modified</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      );

      await openMenu();

      expect(
        screen.getByRole('menuitemradio', { name: 'Name' }).querySelector(`.${radioDotClassName}`)
      ).toBeInTheDocument();
    });

    it('renders submenu trigger chevron with aria-hidden', async () => {
      renderContextMenu(
        <ContextMenuSub>
          <ContextMenuSubTrigger icon={Copy}>Move to</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Archive</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      );

      await openMenu();

      const submenuTrigger = screen.getByRole('menuitem', { name: 'Move to' });
      const chevron = submenuTrigger.querySelector('svg.lucide-chevron-right');

      expect(chevron).toBeInTheDocument();
      expect(chevron).toHaveAttribute('aria-hidden', 'true');
    });

    it('forwards ref and className to ContextMenuContent', async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div>Right-click here</div>
          </ContextMenuTrigger>
          <ContextMenuContent ref={ref} className="custom-content">
            <ContextMenuItem>Open</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );

      await user.pointer([{ target: screen.getByText('Right-click here'), keys: '[MouseRight]' }]);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveClass('custom-content');
    });
  });

  describe('Open / close', () => {
    it('opens on right-click on the trigger zone', async () => {
      renderContextMenu();

      const { menu } = await openMenu();

      expect(menu).toBeVisible();
    });

    it('closes on Escape key', async () => {
      renderContextMenu();
      const { user } = await openMenu();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('closes when an item is selected', async () => {
      renderContextMenu();
      const { user } = await openMenu();

      await user.click(screen.getByRole('menuitem', { name: 'Open' }));

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('closes when clicking outside', async () => {
      const { after } = renderContextMenu(undefined, { modal: false });
      const { user } = await openMenu();

      await user.click(after);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Items', () => {
    it('calls onSelect when item is clicked', async () => {
      const onSelect = vi.fn();

      renderContextMenu(<ContextMenuItem onSelect={onSelect}>Open</ContextMenuItem>);
      const { user } = await openMenu();

      await user.click(screen.getByRole('menuitem', { name: 'Open' }));

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect.mock.calls[0]?.[0]).toBeInstanceOf(Event);
    });

    it('does not call onSelect when disabled item is clicked', async () => {
      const onSelect = vi.fn();

      renderContextMenu(
        <ContextMenuItem disabled onSelect={onSelect}>
          Open
        </ContextMenuItem>
      );
      const { user } = await openMenu();
      const item = screen.getByRole('menuitem', { name: 'Open' });

      await user.click(item);

      expect(onSelect).not.toHaveBeenCalled();
      expect(item).toHaveAttribute('aria-disabled', 'true');
    });

    it('destructive and inset items apply their classes', async () => {
      renderContextMenu(
        <>
          <ContextMenuItem destructive>Delete</ContextMenuItem>
          <ContextMenuItem inset>Rename</ContextMenuItem>
        </>
      );

      await openMenu();

      expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveClass(
        itemDestructiveClassName
      );
      expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveClass(itemInsetClassName);
    });
  });

  describe('CheckboxItem', () => {
    it('calls onCheckedChange with true when an unchecked item is clicked', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div>Right-click here</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
              Show line numbers
            </ContextMenuCheckboxItem>
          </ContextMenuContent>
        </ContextMenu>
      );

      await user.pointer([{ target: screen.getByText('Right-click here'), keys: '[MouseRight]' }]);
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Show line numbers' }));

      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('calls onCheckedChange with false when a checked item is clicked', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div>Right-click here</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuCheckboxItem checked onCheckedChange={onCheckedChange}>
              Show line numbers
            </ContextMenuCheckboxItem>
          </ContextMenuContent>
        </ContextMenu>
      );

      await user.pointer([{ target: screen.getByText('Right-click here'), keys: '[MouseRight]' }]);
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Show line numbers' }));

      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });

    it('has correct checkbox roles and aria-checked states', async () => {
      renderContextMenu(
        <>
          <ContextMenuCheckboxItem checked>Checked</ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={false}>Unchecked</ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked="indeterminate">Mixed</ContextMenuCheckboxItem>
        </>
      );

      await openMenu();

      expect(screen.getByRole('menuitemcheckbox', { name: 'Checked' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
      expect(screen.getByRole('menuitemcheckbox', { name: 'Unchecked' })).toHaveAttribute(
        'aria-checked',
        'false'
      );
      expect(screen.getByRole('menuitemcheckbox', { name: 'Mixed' })).toHaveAttribute(
        'aria-checked',
        'mixed'
      );
    });
  });

  describe('RadioItem', () => {
    it('has correct radio roles and aria-checked states', async () => {
      renderContextMenu(
        <ContextMenuRadioGroup value="name">
          <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
          <ContextMenuRadioItem value="date">Date modified</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      );

      await openMenu();

      expect(screen.getByRole('menuitemradio', { name: 'Name' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
      expect(screen.getByRole('menuitemradio', { name: 'Date modified' })).toHaveAttribute(
        'aria-checked',
        'false'
      );
    });

    it('selecting a radio item calls onValueChange on the group', async () => {
      const onValueChange = vi.fn();

      renderContextMenu(
        <ContextMenuRadioGroup value="name" onValueChange={onValueChange}>
          <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
          <ContextMenuRadioItem value="date">Date modified</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      );

      const { user } = await openMenu();
      await user.click(screen.getByRole('menuitemradio', { name: 'Date modified' }));

      expect(onValueChange).toHaveBeenCalledWith('date');
    });
  });

  describe('Sub-menu', () => {
    it('ArrowRight opens a sub-menu and ArrowLeft closes it', async () => {
      renderContextMenu(
        <>
          <ContextMenuItem>Open</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger icon={Copy}>Move to</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Archive</ContextMenuItem>
              <ContextMenuItem>Shared workspace</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </>
      );

      const { user } = await openMenu();

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowRight}');

      expect(await screen.findByRole('menuitem', { name: 'Archive' })).toBeInTheDocument();

      await user.keyboard('{ArrowLeft}');

      await waitFor(() => {
        expect(screen.queryByRole('menuitem', { name: 'Archive' })).not.toBeInTheDocument();
      });
      expect(screen.getByRole('menuitem', { name: 'Move to' })).toHaveAttribute('data-highlighted');
    });
  });

  describe('Keyboard navigation', () => {
    it('ArrowDown and ArrowUp move between items', async () => {
      renderContextMenu();
      const { user } = await openMenu();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitem', { name: 'Open' })).toHaveAttribute('data-highlighted');

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveAttribute('data-highlighted');

      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('menuitem', { name: 'Open' })).toHaveAttribute('data-highlighted');
    });

    it('Enter activates the focused item', async () => {
      const onSelect = vi.fn();

      renderContextMenu(
        <>
          <ContextMenuItem onSelect={onSelect}>Open</ContextMenuItem>
          <ContextMenuItem>Rename</ContextMenuItem>
        </>
      );

      const { user } = await openMenu();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('uses the expected Radix-managed menu roles', async () => {
      renderContextMenu(
        <>
          <ContextMenuLabel>File actions</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem icon={Pencil}>Rename</ContextMenuItem>
          <ContextMenuItem destructive icon={Trash2}>
            Delete
          </ContextMenuItem>
        </>
      );

      const { menu } = await openMenu();
      const label = within(menu).getByText('File actions');

      expect(menu).toHaveAttribute('role', 'menu');
      expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeInTheDocument();
      expect(screen.getByRole('separator')).toBeInTheDocument();
      expect([null, 'none', 'presentation']).toContain(label.getAttribute('role'));
    });

    it('passes axe when closed', async () => {
      const { container } = render(
        <main>
          <ContextMenu>
            <ContextMenuTrigger>
              <div>Right-click here</div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Open</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </main>
      );

      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });

    it('passes axe when open with standard items', async () => {
      renderContextMenu(
        <>
          <ContextMenuItem icon={FolderOpen}>Open</ContextMenuItem>
          <ContextMenuItem icon={Pencil}>Rename</ContextMenuItem>
          <ContextMenuItem icon={Copy}>Duplicate</ContextMenuItem>
        </>
      );

      await openMenu();

      expect(await axe(document.body, axeOptions)).toHaveNoViolations();
    });

    it('passes axe with checkbox, radio, destructive, disabled, and grouped content', async () => {
      renderContextMenu(
        <>
          <ContextMenuLabel>View options</ContextMenuLabel>
          <ContextMenuCheckboxItem checked>Show line numbers</ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked="indeterminate">Sync enabled</ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuLabel>Sort by</ContextMenuLabel>
          <ContextMenuRadioGroup value="name">
            <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
            <ContextMenuRadioItem value="date">Date modified</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
          <ContextMenuSeparator />
          <ContextMenuItem destructive>Delete</ContextMenuItem>
          <ContextMenuItem disabled>Archive</ContextMenuItem>
        </>
      );

      await openMenu();

      expect(await axe(document.body, axeOptions)).toHaveNoViolations();
    });

    it('passes axe with an open sub-menu', async () => {
      renderContextMenu(
        <ContextMenuSub defaultOpen>
          <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Archive</ContextMenuItem>
            <ContextMenuItem>Shared workspace</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      );

      await openMenu();

      expect(await axe(document.body, axeOptions)).toHaveNoViolations();
    });
  });
});

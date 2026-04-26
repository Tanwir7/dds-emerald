import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ChevronRight } from 'lucide-react';
import { vi, describe, expect, it } from 'vitest';
import {
  Dropdown,
  DropdownCheckboxItem,
  DropdownContent,
  DropdownGroup,
  DropdownItem,
  DropdownLabel,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownSeparator,
  DropdownSub,
  DropdownSubContent,
  DropdownSubTrigger,
  DropdownTrigger,
} from './Dropdown';

const renderDropdown = (props: Partial<React.ComponentProps<typeof Dropdown>> = {}) =>
  render(
    <Dropdown {...props}>
      <DropdownTrigger>Actions</DropdownTrigger>
      <DropdownContent>
        <DropdownItem>Edit</DropdownItem>
        <DropdownItem startIcon={<ChevronRight data-testid="share-icon" />} endText="⌘K">
          Share
        </DropdownItem>
        <DropdownItem disabled>Archive</DropdownItem>
      </DropdownContent>
    </Dropdown>
  );

const renderWithCheckboxItems = (props: Partial<React.ComponentProps<typeof Dropdown>> = {}) => {
  const onCheckedChange = vi.fn();

  const view = render(
    <Dropdown {...props}>
      <DropdownTrigger>Columns</DropdownTrigger>
      <DropdownContent>
        <DropdownCheckboxItem checked onCheckedChange={onCheckedChange}>
          Revenue
        </DropdownCheckboxItem>
        <DropdownCheckboxItem>Margin</DropdownCheckboxItem>
      </DropdownContent>
    </Dropdown>
  );

  return { ...view, onCheckedChange };
};

const renderWithRadioItems = (props: Partial<React.ComponentProps<typeof Dropdown>> = {}) =>
  render(
    <Dropdown {...props}>
      <DropdownTrigger>Sort</DropdownTrigger>
      <DropdownContent>
        <DropdownRadioGroup value="newest">
          <DropdownRadioItem value="newest">Newest</DropdownRadioItem>
          <DropdownRadioItem value="oldest">Oldest</DropdownRadioItem>
        </DropdownRadioGroup>
      </DropdownContent>
    </Dropdown>
  );

const renderWithSubmenu = (props: Partial<React.ComponentProps<typeof Dropdown>> = {}) =>
  render(
    <Dropdown {...props}>
      <DropdownTrigger>More actions</DropdownTrigger>
      <DropdownContent>
        <DropdownItem>Edit</DropdownItem>
        <DropdownSub>
          <DropdownSubTrigger>Share</DropdownSubTrigger>
          <DropdownSubContent>
            <DropdownItem>Email</DropdownItem>
            <DropdownItem>Copy link</DropdownItem>
          </DropdownSubContent>
        </DropdownSub>
      </DropdownContent>
    </Dropdown>
  );

describe('Dropdown', () => {
  describe('Rendering', () => {
    it('renders trigger element', () => {
      renderDropdown();
      expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument();
    });

    it('trigger has aria-haspopup="menu"', () => {
      renderDropdown();
      expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute(
        'aria-haspopup',
        'menu'
      );
    });

    it('trigger has aria-expanded="false" when closed', () => {
      renderDropdown();
      expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });

    it('content is not in DOM when closed', () => {
      renderDropdown();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('forwards ref to DropdownContent HTMLDivElement', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownContent ref={ref}>
            <DropdownItem>Edit</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveAttribute('role', 'menu');
    });
  });

  describe('Open/close', () => {
    it('clicking trigger opens the menu', async () => {
      const user = userEvent.setup();
      renderDropdown();

      const trigger = screen.getByRole('button', { name: 'Actions' });
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('content has role="menu" when open', async () => {
      const user = userEvent.setup();
      renderDropdown();

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('pressing Escape closes the menu', async () => {
      const user = userEvent.setup();
      renderDropdown();

      const trigger = screen.getByRole('button', { name: 'Actions' });
      await user.click(trigger);
      await user.keyboard('{Escape}');

      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('clicking outside closes the menu', async () => {
      const user = userEvent.setup();
      renderDropdown();

      const trigger = screen.getByRole('button', { name: 'Actions' });
      await user.click(trigger);
      await user.click(document.body);

      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Items', () => {
    it('DropdownItem renders with role="menuitem"', async () => {
      const user = userEvent.setup();
      renderDropdown();

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    });

    it('clicking item calls onSelect', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <Dropdown>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownContent>
            <DropdownItem onSelect={onSelect}>Edit</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('clicking item closes the menu', async () => {
      const user = userEvent.setup();
      renderDropdown();

      const trigger = screen.getByRole('button', { name: 'Actions' });
      await user.click(trigger);
      await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('preventing default in onSelect keeps the menu open', async () => {
      const user = userEvent.setup();

      render(
        <Dropdown>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownContent>
            <DropdownItem onSelect={(event) => event.preventDefault()}>Edit</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('disabled item has data-disabled and cannot be activated', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <Dropdown>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownContent>
            <DropdownItem disabled onSelect={onSelect}>
              Archive
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      const item = screen.getByRole('menuitem', { name: 'Archive' });

      expect(item).toHaveAttribute('data-disabled', '');
      await user.click(item);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Intent and adornments', () => {
    it('destructive item applies .intentDestructive class', async () => {
      const user = userEvent.setup();
      render(
        <Dropdown>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownContent>
            <DropdownItem intent="destructive">Delete</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      expect(screen.getByRole('menuitem', { name: 'Delete' }).className).toMatch(
        /intentDestructive/
      );
    });

    it('startIcon renders inside item', async () => {
      const user = userEvent.setup();
      renderDropdown();

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      const item = screen.getByRole('menuitem', { name: 'Share' });
      expect(within(item).getByTestId('share-icon')).toBeInTheDocument();
    });

    it('endText renders right-aligned inside item', async () => {
      const user = userEvent.setup();
      render(
        <Dropdown>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownContent>
            <DropdownItem endText="⌘K">Share</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      expect(screen.getByText('⌘K')).toBeInTheDocument();
    });

    it('applies .inset class when inset={true}', async () => {
      const user = userEvent.setup();
      render(
        <Dropdown>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownContent>
            <DropdownItem inset>Rename</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      expect(screen.getByRole('menuitem', { name: 'Rename' }).className).toMatch(/inset/);
    });
  });

  describe('Checkbox and radio items', () => {
    it('renders with role="menuitemcheckbox" and supports checked state', async () => {
      const user = userEvent.setup();
      const { onCheckedChange } = renderWithCheckboxItems();

      await user.click(screen.getByRole('button', { name: 'Columns' }));
      const item = screen.getByRole('menuitemcheckbox', { name: 'Revenue' });

      expect(item).toHaveAttribute('aria-checked', 'true');
      await user.click(item);
      expect(onCheckedChange).toHaveBeenCalled();
    });

    it('renders with role="menuitemradio" and marks selected value', async () => {
      const user = userEvent.setup();
      renderWithRadioItems();

      await user.click(screen.getByRole('button', { name: 'Sort' }));
      expect(screen.getByRole('menuitemradio', { name: 'Newest' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });
  });

  describe('Sub-menu and grouping', () => {
    it('DropdownSubTrigger renders with aria-haspopup="menu"', async () => {
      const user = userEvent.setup();
      renderWithSubmenu();

      await user.click(screen.getByRole('button', { name: 'More actions' }));
      expect(screen.getByRole('menuitem', { name: 'Share' })).toHaveAttribute(
        'aria-haspopup',
        'menu'
      );
    });

    it('sub-menu opens on ArrowRight and closes on ArrowLeft', async () => {
      const user = userEvent.setup();
      renderWithSubmenu();

      await user.click(screen.getByRole('button', { name: 'More actions' }));
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('menuitem', { name: 'Email' })).toBeInTheDocument();

      await user.keyboard('{ArrowLeft}');
      expect(screen.queryByRole('menuitem', { name: 'Email' })).not.toBeInTheDocument();
    });

    it('DropdownLabel and DropdownSeparator render correctly', async () => {
      const user = userEvent.setup();
      render(
        <Dropdown>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownContent>
            <DropdownGroup>
              <DropdownLabel>Primary</DropdownLabel>
              <DropdownItem>Edit</DropdownItem>
            </DropdownGroup>
            <DropdownSeparator />
            <DropdownGroup>
              <DropdownLabel>Danger zone</DropdownLabel>
              <DropdownItem intent="destructive">Delete</DropdownItem>
            </DropdownGroup>
          </DropdownContent>
        </Dropdown>
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });

  describe('Keyboard', () => {
    it('Tab reaches the trigger and Enter opens the menu', async () => {
      const user = userEvent.setup();
      renderDropdown();

      await user.tab();
      const trigger = screen.getByRole('button', { name: 'Actions' });

      expect(trigger).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('ArrowDown highlights first item, then the next item', async () => {
      const user = userEvent.setup();
      renderDropdown();

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitem', { name: 'Share' })).toHaveFocus();
    });

    it('ArrowUp wraps to the last enabled item from the first item', async () => {
      const user = userEvent.setup();
      renderDropdown();

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();

      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('menuitem', { name: 'Share' })).toHaveFocus();
    });

    it('Enter activates the highlighted item', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <Dropdown>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownContent>
            <DropdownItem onSelect={onSelect}>Edit</DropdownItem>
            <DropdownItem>Archive</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('Escape closes without activating the highlighted item', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <Dropdown>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownContent>
            <DropdownItem onSelect={onSelect}>Edit</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Escape}');

      expect(onSelect).not.toHaveBeenCalled();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Axe', () => {
    it('passes when closed', async () => {
      const { container } = renderDropdown();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes when open', async () => {
      const user = userEvent.setup();
      renderDropdown();

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      expect(await axe(document.body)).toHaveNoViolations();
    });

    it('passes with checkbox items', async () => {
      const user = userEvent.setup();
      renderWithCheckboxItems();

      await user.click(screen.getByRole('button', { name: 'Columns' }));
      expect(await axe(document.body)).toHaveNoViolations();
    });

    it('passes with radio items', async () => {
      const user = userEvent.setup();
      renderWithRadioItems();

      await user.click(screen.getByRole('button', { name: 'Sort' }));
      expect(await axe(document.body)).toHaveNoViolations();
    });

    it('passes with sub-menu', async () => {
      const user = userEvent.setup();
      renderWithSubmenu();

      await user.click(screen.getByRole('button', { name: 'More actions' }));
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowRight}');

      expect(await axe(document.body)).toHaveNoViolations();
    });

    it('passes with disabled items', async () => {
      const user = userEvent.setup();
      renderDropdown();

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      expect(await axe(document.body)).toHaveNoViolations();
    });
  });
});

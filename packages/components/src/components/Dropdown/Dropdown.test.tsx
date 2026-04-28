// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { existsSync, readFileSync } from 'node:fs';
import React from 'react';
import { resolve } from 'node:path';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
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

expect.extend(toHaveNoViolations);

beforeAll(() => {
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ??
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

afterEach(() => {
  cleanup();
});

const stylesheetPath = existsSync(
  resolve(process.cwd(), 'packages/components/src/components/Dropdown/Dropdown.module.scss')
)
  ? resolve(process.cwd(), 'packages/components/src/components/Dropdown/Dropdown.module.scss')
  : resolve(process.cwd(), 'src/components/Dropdown/Dropdown.module.scss');

const stylesheet = readFileSync(stylesheetPath, 'utf8');
const axeOptions = {
  rules: {
    region: {
      enabled: false,
    },
  },
};

const renderDropdown = (
  rootProps: Partial<Omit<React.ComponentProps<typeof Dropdown>, 'children'>> = {}
) => {
  const onSelect = vi.fn();

  render(
    <main>
      <button type="button">Before</button>
      <Dropdown {...rootProps}>
        <DropdownTrigger>Open menu</DropdownTrigger>
        <DropdownContent>
          <DropdownItem onSelect={onSelect}>Edit</DropdownItem>
          <DropdownItem disabled>Archive</DropdownItem>
          <DropdownItem>Share</DropdownItem>
        </DropdownContent>
      </Dropdown>
      <button type="button">After</button>
    </main>
  );

  return {
    trigger: screen.getByRole('button', { name: 'Open menu' }),
    before: screen.getByRole('button', { name: 'Before' }),
    after: screen.getByRole('button', { name: 'After' }),
    onSelect,
  };
};

const openMenu = async (triggerName = 'Open menu') => {
  const user = userEvent.setup();
  const trigger = screen.getByRole('button', { name: triggerName });
  await user.click(trigger);
  await screen.findByRole('menu');
  return { user, trigger };
};

describe('Dropdown', () => {
  describe('Rendering', () => {
    it('renders trigger element', () => {
      const { trigger } = renderDropdown();
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName).toBe('BUTTON');
    });

    it('trigger has aria-haspopup="menu"', () => {
      const { trigger } = renderDropdown();
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('trigger has aria-expanded="false" when closed', () => {
      const { trigger } = renderDropdown();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('content is not in DOM when closed', () => {
      renderDropdown();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('forwards ref to DropdownContent HTMLDivElement', async () => {
      const user = userEvent.setup();
      const contentRef = React.createRef<HTMLDivElement>();

      render(
        <Dropdown>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent ref={contentRef}>Menu content</DropdownContent>
        </Dropdown>
      );

      await user.click(screen.getByRole('button', { name: 'Open menu' }));

      expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
      expect(contentRef.current).toHaveTextContent('Menu content');
    });
  });

  describe('Open/close', () => {
    it('clicking trigger opens the menu (aria-expanded="true")', async () => {
      renderDropdown();
      const { trigger } = await openMenu();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('content has role="menu" when open', async () => {
      renderDropdown();
      await openMenu();
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('pressing Escape closes the menu', async () => {
      renderDropdown();
      const { user, trigger } = await openMenu();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('clicking outside closes the menu', async () => {
      const { after } = renderDropdown({ modal: false });
      const { user } = await openMenu();

      await user.click(after);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Items', () => {
    it('DropdownItem renders with role="menuitem"', async () => {
      renderDropdown();
      await openMenu();
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    });

    it('clicking item calls onSelect', async () => {
      const { onSelect } = renderDropdown();
      const { user } = await openMenu();

      await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect.mock.calls[0]![0]).toBeInstanceOf(Event);
    });

    it('clicking item closes the menu', async () => {
      renderDropdown();
      const { user } = await openMenu();

      await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('disabled item has data-disabled and cannot be activated', async () => {
      const { onSelect } = renderDropdown();
      const { user, trigger } = await openMenu();
      const item = screen.getByRole('menuitem', { name: 'Archive' });

      expect(item).toHaveAttribute('data-disabled');

      await user.click(item);

      expect(onSelect).not.toHaveBeenCalled();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Intent', () => {
    it('default item has default text colour class', async () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownItem>Default action</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      expect(screen.getByRole('menuitem', { name: 'Default action' }).className).toMatch(/item/);
      expect(screen.getByRole('menuitem', { name: 'Default action' }).className).not.toMatch(
        /intentDestructive/
      );
    });

    it('destructive item applies .intentDestructive class', async () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownItem intent="destructive">Delete</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      expect(screen.getByRole('menuitem', { name: 'Delete' }).className).toMatch(
        /intentDestructive/
      );
    });

    it('destructive item highlighted state uses danger background', () => {
      expect(stylesheet).toContain('background-color: var(--dds-badge-danger-bg);');
    });
  });

  describe('Icons and end text', () => {
    it('startIcon renders inside item', async () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownItem startIcon={<Pencil aria-hidden="true" />}>Edit</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      const item = screen.getByRole('menuitem', { name: 'Edit' });
      expect(item.querySelector('svg')).toBeTruthy();
    });

    it('endText renders right-aligned inside item', async () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownItem endText="Cmd+K">Copy link</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      expect(screen.getByText('Cmd+K')).toBeInTheDocument();
      expect(stylesheet).toContain('margin-left: auto;');
    });
  });

  describe('Inset', () => {
    it('.inset class applied when inset={true}', async () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownItem inset>Indented</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      expect(screen.getByRole('menuitem', { name: 'Indented' }).className).toMatch(/inset/);
    });
  });

  describe('CheckboxItem', () => {
    it('renders with role="menuitemcheckbox"', () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownCheckboxItem checked>Show previews</DropdownCheckboxItem>
          </DropdownContent>
        </Dropdown>
      );

      expect(screen.getByRole('menuitemcheckbox', { name: 'Show previews' })).toBeInTheDocument();
    });

    it('has aria-checked="true" when checked', () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownCheckboxItem checked>Show previews</DropdownCheckboxItem>
          </DropdownContent>
        </Dropdown>
      );

      expect(screen.getByRole('menuitemcheckbox', { name: 'Show previews' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });

    it('clicking calls onCheckedChange', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownCheckboxItem onCheckedChange={onCheckedChange}>
              Show previews
            </DropdownCheckboxItem>
          </DropdownContent>
        </Dropdown>
      );

      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Show previews' }));

      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('RadioGroup + RadioItem', () => {
    it('renders with role="menuitemradio"', () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownRadioGroup value="ada">
              <DropdownRadioItem value="ada">Ada</DropdownRadioItem>
              <DropdownRadioItem value="grace">Grace</DropdownRadioItem>
            </DropdownRadioGroup>
          </DropdownContent>
        </Dropdown>
      );

      expect(screen.getByRole('menuitemradio', { name: 'Ada' })).toBeInTheDocument();
    });

    it('has aria-checked="true" for selected value', () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownRadioGroup value="ada">
              <DropdownRadioItem value="ada">Ada</DropdownRadioItem>
              <DropdownRadioItem value="grace">Grace</DropdownRadioItem>
            </DropdownRadioGroup>
          </DropdownContent>
        </Dropdown>
      );

      expect(screen.getByRole('menuitemradio', { name: 'Ada' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });
  });

  describe('Sub-menu', () => {
    it('DropdownSubTrigger renders with aria-haspopup="menu"', async () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownSub>
              <DropdownSubTrigger>Move to</DropdownSubTrigger>
              <DropdownSubContent>
                <DropdownItem>Roadmap</DropdownItem>
              </DropdownSubContent>
            </DropdownSub>
          </DropdownContent>
        </Dropdown>
      );

      expect(screen.getByRole('menuitem', { name: 'Move to' })).toHaveAttribute(
        'aria-haspopup',
        'menu'
      );
    });

    it('sub-menu opens on ArrowRight', async () => {
      const user = userEvent.setup();

      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownSub>
              <DropdownSubTrigger>Move to</DropdownSubTrigger>
              <DropdownSubContent>
                <DropdownItem>Roadmap</DropdownItem>
              </DropdownSubContent>
            </DropdownSub>
          </DropdownContent>
        </Dropdown>
      );

      const trigger = screen.getByRole('menuitem', { name: 'Move to' });
      trigger.focus();
      await user.keyboard('{ArrowRight}');

      expect(await screen.findByRole('menuitem', { name: 'Roadmap' })).toBeInTheDocument();
    });

    it('sub-menu closes on ArrowLeft', async () => {
      const user = userEvent.setup();

      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownSub>
              <DropdownSubTrigger>Move to</DropdownSubTrigger>
              <DropdownSubContent>
                <DropdownItem>Roadmap</DropdownItem>
              </DropdownSubContent>
            </DropdownSub>
          </DropdownContent>
        </Dropdown>
      );

      const trigger = screen.getByRole('menuitem', { name: 'Move to' });
      trigger.focus();
      await user.keyboard('{ArrowRight}');

      const item = await screen.findByRole('menuitem', { name: 'Roadmap' });
      item.focus();
      await user.keyboard('{ArrowLeft}');

      await waitFor(() => {
        expect(screen.queryByRole('menuitem', { name: 'Roadmap' })).not.toBeInTheDocument();
      });
    });
  });

  describe('Label and separator', () => {
    it('DropdownLabel renders with correct styles', () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownLabel>Actions</DropdownLabel>
          </DropdownContent>
        </Dropdown>
      );

      expect(screen.getByText('Actions').className).toMatch(/label/);
    });

    it('DropdownSeparator renders a divider', () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownGroup>
              <DropdownLabel>Actions</DropdownLabel>
              <DropdownItem>Edit</DropdownItem>
            </DropdownGroup>
            <DropdownSeparator data-testid="separator" />
          </DropdownContent>
        </Dropdown>
      );

      expect(screen.getByTestId('separator').className).toMatch(/separator/);
    });
  });

  describe('Keyboard', () => {
    it('Tab focuses the trigger, then Enter opens menu', async () => {
      const user = userEvent.setup();
      renderDropdown();
      const trigger = screen.getByRole('button', { name: 'Open menu' });

      await user.tab();
      await user.tab();
      expect(trigger).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });

    it('opening from the keyboard highlights the first enabled item', async () => {
      const user = userEvent.setup();
      renderDropdown();
      const trigger = screen.getByRole('button', { name: 'Open menu' });

      trigger.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
    });

    it('ArrowDown highlights the next enabled item', async () => {
      const user = userEvent.setup();
      renderDropdown();
      const trigger = screen.getByRole('button', { name: 'Open menu' });

      trigger.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('menuitem', { name: 'Share' })).toHaveFocus();
    });

    it('ArrowUp wraps to last item from first', async () => {
      const user = userEvent.setup();
      renderDropdown();
      const trigger = screen.getByRole('button', { name: 'Open menu' });

      trigger.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowUp}');

      expect(screen.getByRole('menuitem', { name: 'Share' })).toHaveFocus();
    });

    it('Enter activates highlighted item', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <Dropdown>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownItem onSelect={onSelect}>Edit</DropdownItem>
            <DropdownItem>Share</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      screen.getByRole('button', { name: 'Open menu' }).focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('Escape closes without activating', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <Dropdown>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownItem onSelect={onSelect}>Edit</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      screen.getByRole('button', { name: 'Open menu' }).focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{Escape}');

      expect(onSelect).not.toHaveBeenCalled();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Axe', () => {
    it('passes when closed', async () => {
      const { container } = render(
        <Dropdown>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownItem>Edit</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });

    it('passes when open', async () => {
      renderDropdown();
      await openMenu();

      expect(await axe(document.body, axeOptions)).toHaveNoViolations();
    });

    it('passes with checkbox items', async () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownCheckboxItem checked>Show previews</DropdownCheckboxItem>
            <DropdownCheckboxItem>Show totals</DropdownCheckboxItem>
          </DropdownContent>
        </Dropdown>
      );

      expect(await axe(document.body, axeOptions)).toHaveNoViolations();
    });

    it('passes with radio items', async () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownRadioGroup value="checked">
              <DropdownRadioItem value="checked">Checked</DropdownRadioItem>
              <DropdownRadioItem value="unchecked">Unchecked</DropdownRadioItem>
            </DropdownRadioGroup>
          </DropdownContent>
        </Dropdown>
      );

      expect(await axe(document.body, axeOptions)).toHaveNoViolations();
    });

    it('passes with sub-menu', async () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownSub defaultOpen>
              <DropdownSubTrigger startIcon={<Check aria-hidden="true" />}>
                Move to
              </DropdownSubTrigger>
              <DropdownSubContent>
                <DropdownItem>Roadmap</DropdownItem>
              </DropdownSubContent>
            </DropdownSub>
          </DropdownContent>
        </Dropdown>
      );

      expect(await axe(document.body, axeOptions)).toHaveNoViolations();
    });

    it('passes with disabled items', async () => {
      render(
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent>
            <DropdownItem disabled startIcon={<Trash2 aria-hidden="true" />}>
              Delete
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      expect(await axe(document.body, axeOptions)).toHaveNoViolations();
    });
  });
});

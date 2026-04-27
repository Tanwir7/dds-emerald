import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './Select';

const renderSelect = (props = {}, triggerProps = {}, contentProps = {}) => {
  const portalContainer = document.createElement('div');

  const view = render(
    <main data-testid="select-test-root">
      <Select {...props}>
        <SelectTrigger aria-label="Fruit" {...triggerProps} />
        <SelectContent container={portalContainer} {...contentProps}>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana" disabled>
            Banana
          </SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>
      <button type="button">Next field</button>
    </main>
  );

  view.container.querySelector('main')?.appendChild(portalContainer);

  return { ...view, portalContainer };
};

const renderSelectWithGroups = () => {
  const portalContainer = document.createElement('div');

  const view = render(
    <main data-testid="select-group-test-root">
      <Select>
        <SelectTrigger aria-label="Food" />
        <SelectContent container={portalContainer}>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            <SelectItem value="carrot">Carrot</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <button type="button">Next field</button>
    </main>
  );

  view.container.querySelector('main')?.appendChild(portalContainer);

  return { ...view, portalContainer };
};

const renderSelectInForm = (props = {}, triggerProps = {}, contentProps = {}) => {
  const portalContainer = document.createElement('div');

  const view = render(
    <main data-testid="select-form-test-root">
      <form aria-label="Select form">
        <Select {...props}>
          <SelectTrigger aria-label="Fruit" {...triggerProps} />
          <SelectContent container={portalContainer} {...contentProps}>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana" disabled>
              Banana
            </SelectItem>
            <SelectItem value="cherry">Cherry</SelectItem>
          </SelectContent>
        </Select>
      </form>
      <button type="button">Next field</button>
    </main>
  );

  view.container.querySelector('main')?.appendChild(portalContainer);

  return { ...view, portalContainer };
};

afterEach(() => {
  cleanup();
});

describe('Select', () => {
  describe('Rendering', () => {
    it('renders SelectTrigger as a button', () => {
      renderSelect();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('combobox').tagName).toBe('BUTTON');
    });

    it('trigger has aria-haspopup="listbox"', () => {
      renderSelect();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('trigger has aria-expanded="false" when closed', () => {
      renderSelect();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });

    it('forwards className to trigger', () => {
      renderSelect({}, { className: 'test-class' });
      expect(screen.getByRole('combobox')).toHaveClass('test-class');
    });
  });

  describe('Placeholder', () => {
    it('trigger shows placeholder text when no value selected', () => {
      renderSelect({}, { placeholder: 'Select a fruit' });
      expect(screen.getByText('Select a fruit')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveAttribute('data-placeholder');
    });
  });

  describe('Sizes', () => {
    it('applies .md class by default', () => {
      renderSelect();
      expect(screen.getByRole('combobox').className).toMatch(/md/);
    });

    it('applies .sm class when size="sm"', () => {
      renderSelect({}, { size: 'sm' });
      expect(screen.getByRole('combobox').className).toMatch(/sm/);
    });

    it('applies .lg class when size="lg"', () => {
      renderSelect({}, { size: 'lg' });
      expect(screen.getByRole('combobox').className).toMatch(/lg/);
    });
  });

  describe('Invalid', () => {
    it('applies .invalid class when invalid={true}', () => {
      renderSelect({}, { invalid: true });
      expect(screen.getByRole('combobox').className).toMatch(/invalid/);
    });
  });

  describe('Open/close', () => {
    it('clicking trigger opens the content (aria-expanded="true")', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('pressing Escape closes the content', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('clicking an item selects it and closes dropdown', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderSelect({ onValueChange });

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      const option = screen.getByRole('option', { name: 'Apple' });
      await user.click(option);

      expect(onValueChange).toHaveBeenCalledWith('apple');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Disabled', () => {
    it('trigger has data-disabled when disabled={true}', () => {
      renderSelect({ disabled: true });
      expect(screen.getByRole('combobox')).toHaveAttribute('data-disabled');
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('disabled items cannot be selected', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderSelect({ onValueChange });
      const trigger = screen.getByRole('combobox');

      await user.click(trigger);

      const disabledOption = screen.getByRole('option', { name: 'Banana' });
      expect(disabledOption).toHaveAttribute('aria-disabled', 'true');

      await user.click(disabledOption);
      expect(onValueChange).not.toHaveBeenCalled();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Groups', () => {
    it('SelectGroup + SelectLabel renders group with label', async () => {
      const user = userEvent.setup();
      renderSelectWithGroups();
      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
      expect(
        screen.getByText('Vegetables').closest('[role="group"]')?.previousElementSibling
      ).not.toBeNull();
    });
  });

  describe('Keyboard', () => {
    it('Space opens the select', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard(' ');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('Enter opens the select', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('ArrowDown highlights next item and Enter selects highlighted item', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderSelect({ onValueChange });

      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(onValueChange).toHaveBeenCalledWith('cherry');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('Tab does not dismiss the open listbox', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await user.tab();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('Form participation', () => {
    it('hidden input rendered with correct name and value', () => {
      renderSelectInForm({ name: 'fruit', value: 'apple' });
      const input = document.querySelector('select[name="fruit"], input[name="fruit"]');
      expect(input).toBeInTheDocument();
    });

    it('required prop forwarded', () => {
      renderSelect({ required: true });
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Axe', () => {
    it('passes when closed', async () => {
      renderSelect();
      expect(await axe(screen.getByTestId('select-test-root'))).toHaveNoViolations();
    });

    it('passes when open with items', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      expect(await axe(screen.getByTestId('select-test-root'))).toHaveNoViolations();
    });

    it('passes with disabled trigger', async () => {
      renderSelect({ disabled: true });
      expect(await axe(screen.getByTestId('select-test-root'))).toHaveNoViolations();
    });

    it('passes with groups and labels', async () => {
      const user = userEvent.setup();
      renderSelectWithGroups();
      await user.click(screen.getByRole('combobox'));
      expect(await axe(screen.getByTestId('select-group-test-root'))).toHaveNoViolations();
    });

    it('passes with invalid={true}', async () => {
      renderSelect({}, { invalid: true });
      expect(await axe(screen.getByTestId('select-test-root'))).toHaveNoViolations();
    });
  });
});

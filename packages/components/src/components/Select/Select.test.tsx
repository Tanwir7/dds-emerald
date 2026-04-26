import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
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
  return render(
    <Select {...props}>
      <SelectTrigger aria-label="Fruit" {...triggerProps} />
      <SelectContent {...contentProps}>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana" disabled>
          Banana
        </SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
      </SelectContent>
    </Select>
  );
};

const renderSelectWithGroups = () => {
  return render(
    <Select>
      <SelectTrigger aria-label="Food" />
      <SelectContent>
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
  );
};

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

      await user.click(screen.getByRole('combobox'));

      const disabledOption = screen.getByRole('option', { name: 'Banana' });
      expect(disabledOption).toHaveAttribute('aria-disabled', 'true');

      await user.click(disabledOption);
      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Groups', () => {
    it('SelectGroup + SelectLabel renders group with label', async () => {
      const user = userEvent.setup();
      renderSelectWithGroups();
      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
      expect(screen.getByRole('separator')).toBeInTheDocument();
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
      await user.keyboard('{Enter}'); // open
      await user.keyboard('{ArrowDown}'); // highlight first item (apple)
      await user.keyboard('{ArrowDown}'); // highlight second item (banana - disabled)
      await user.keyboard('{ArrowDown}'); // highlight third item (cherry)

      await user.keyboard('{Enter}'); // select cherry

      expect(onValueChange).toHaveBeenCalledWith('cherry');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('Tab closes the select and moves focus out', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await user.tab();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Form participation', () => {
    it('hidden input rendered with correct name and value', () => {
      renderSelect({ name: 'fruit', value: 'apple' });
      // The hidden input is rendered by Radix, we can find it by name
      const input =
        document.querySelector('select[name="fruit"]') ||
        document.querySelector('input[name="fruit"]');
      expect(input).toBeInTheDocument();
    });

    it('required prop forwarded', () => {
      renderSelect({ required: true });
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Axe', () => {
    it('passes when closed', async () => {
      const { container } = renderSelect();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes when open with items', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByRole('combobox'));
      // Wait for animation frame maybe? Radix can take a tick
      expect(await axe(document.body)).toHaveNoViolations();
    });

    it('passes with disabled trigger', async () => {
      const { container } = renderSelect({ disabled: true });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes with groups and labels', async () => {
      const user = userEvent.setup();
      renderSelectWithGroups();
      await user.click(screen.getByRole('combobox'));
      expect(await axe(document.body)).toHaveNoViolations();
    });

    it('passes with invalid={true}', async () => {
      const { container } = renderSelect({}, { invalid: true });
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

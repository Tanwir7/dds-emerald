import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PinInput } from './PinInput';
import styles from './PinInput.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  slot: getRequiredClassName(styles, 'slot'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
  invalid: getRequiredClassName(styles, 'invalid'),
  disabled: getRequiredClassName(styles, 'disabled'),
} as const;

const getSlots = () => {
  const group = screen.getByRole('group');

  return Array.from(group.querySelectorAll('input')) as HTMLInputElement[];
};

const getSlot = (index: number) => {
  const slot = getSlots()[index];

  if (!slot) {
    throw new Error(`Expected slot at index ${index}`);
  }

  return slot;
};

afterEach(() => {
  cleanup();
});

describe('PinInput', () => {
  it('renders six input slots by default', () => {
    render(<PinInput />);

    expect(getSlots()).toHaveLength(6);
  });

  it('renders the requested number of slots', () => {
    render(<PinInput length={4} />);

    expect(getSlots()).toHaveLength(4);
  });

  it('labels each slot with its position', () => {
    render(<PinInput length={4} />);

    expect(screen.getByLabelText('PIN digit 1 of 4')).toBeInTheDocument();
    expect(screen.getByLabelText('PIN digit 2 of 4')).toBeInTheDocument();
    expect(screen.getByLabelText('PIN digit 3 of 4')).toBeInTheDocument();
    expect(screen.getByLabelText('PIN digit 4 of 4')).toBeInTheDocument();
  });

  it('renders the wrapper with role group', () => {
    render(<PinInput />);

    expect(screen.getByRole('group', { name: 'PIN input' })).toBeInTheDocument();
  });

  it('forwards className to the wrapper div', () => {
    render(<PinInput className="custom-pin-input" />);

    expect(screen.getByRole('group')).toHaveClass('custom-pin-input');
  });

  it('forwards ref to the wrapper HTMLDivElement', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<PinInput ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByRole('group'));
  });

  it('uses numeric inputMode by default', () => {
    render(<PinInput />);

    expect(getSlots()[0]).toHaveAttribute('inputmode', 'numeric');
  });

  it('uses tel inputs by default', () => {
    render(<PinInput />);

    expect(getSlots()[0]).toHaveAttribute('type', 'tel');
  });

  it('uses text inputs for alphanumeric pins', () => {
    render(<PinInput type="alphanumeric" />);

    expect(getSlots()[0]).toHaveAttribute('type', 'text');
    expect(getSlots()[0]).toHaveAttribute('inputmode', 'text');
  });

  it('uses password inputs when mask is true', () => {
    render(<PinInput mask />);

    expect(getSlots()[0]).toHaveAttribute('type', 'password');
  });

  it('applies the medium size class by default', () => {
    render(<PinInput />);

    expect(getSlots()[0]).toHaveClass(classNames.md);
  });

  it('applies the small size class when requested', () => {
    render(<PinInput size="sm" />);

    expect(getSlots()[0]).toHaveClass(classNames.sm);
  });

  it('applies the large size class when requested', () => {
    render(<PinInput size="lg" />);

    expect(getSlots()[0]).toHaveClass(classNames.lg);
  });

  it('splits a controlled value across slots', () => {
    render(<PinInput length={4} value="1234" />);

    expect(getSlots().map((slot) => slot.value)).toEqual(['1', '2', '3', '4']);
  });

  it('calls onChange with the full value in controlled mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<PinInput length={4} value="" onChange={onChange} />);

    await user.type(getSlot(0), '1');

    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('renders defaultValue in uncontrolled mode', () => {
    render(<PinInput length={4} defaultValue="1234" />);

    expect(getSlots().map((slot) => slot.value)).toEqual(['1', '2', '3', '4']);
  });

  it('updates its own state in uncontrolled mode', async () => {
    const user = userEvent.setup();

    render(<PinInput length={4} />);

    await user.type(getSlot(0), '1');

    expect(getSlot(0)).toHaveValue('1');
  });

  it('fills a slot and moves focus to the next slot when typing', async () => {
    const user = userEvent.setup();

    render(<PinInput length={4} />);

    await user.type(getSlot(0), '1');

    expect(getSlot(0)).toHaveValue('1');
    expect(getSlot(1)).toHaveFocus();
  });

  it('does not advance focus beyond the last slot', async () => {
    const user = userEvent.setup();

    render(<PinInput length={1} />);

    await user.type(getSlot(0), '1');

    expect(getSlot(0)).toHaveFocus();
  });

  it('clears a filled slot and stays on it when Backspace is pressed', async () => {
    const user = userEvent.setup();

    render(<PinInput length={4} defaultValue="1" />);

    await user.click(getSlot(0));
    await user.keyboard('[Backspace]');

    expect(getSlot(0)).toHaveValue('');
    expect(getSlot(0)).toHaveFocus();
  });

  it('moves focus to the previous slot and clears it when Backspace is pressed on an empty slot', async () => {
    const user = userEvent.setup();

    render(<PinInput length={4} defaultValue="12" />);

    await user.click(getSlot(2));
    await user.keyboard('[Backspace]');

    expect(getSlot(1)).toHaveValue('');
    expect(getSlot(1)).toHaveFocus();
  });

  it('moves focus to the next slot on ArrowRight', async () => {
    const user = userEvent.setup();

    render(<PinInput length={4} />);

    await user.click(getSlot(0));
    await user.keyboard('[ArrowRight]');

    expect(getSlot(1)).toHaveFocus();
  });

  it('moves focus to the previous slot on ArrowLeft', async () => {
    const user = userEvent.setup();

    render(<PinInput length={4} />);

    await user.click(getSlot(1));
    await user.keyboard('[ArrowLeft]');

    expect(getSlot(0)).toHaveFocus();
  });

  it('calls onChange when typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<PinInput length={4} onChange={onChange} />);

    await user.type(getSlot(0), '1');

    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('calls onComplete when all slots are filled', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<PinInput length={4} onComplete={onComplete} />);

    await user.type(getSlot(0), '1234');

    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('does not call onComplete when only part of the pin is filled', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<PinInput length={4} onComplete={onComplete} />);

    await user.type(getSlot(0), '12');

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('fills all slots from a full paste', async () => {
    const user = userEvent.setup();

    render(<PinInput length={6} />);

    await user.click(getSlot(0));
    await user.paste('123456');

    expect(getSlots().map((slot) => slot.value)).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('fills only the available slots from a partial paste', async () => {
    const user = userEvent.setup();

    render(<PinInput length={6} />);

    await user.click(getSlot(0));
    await user.paste('12');

    expect(getSlots().map((slot) => slot.value)).toEqual(['1', '2', '', '', '', '']);
  });

  it('calls onChange after paste', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<PinInput length={4} onChange={onChange} />);

    await user.click(getSlot(0));
    await user.paste('1234');

    expect(onChange).toHaveBeenCalledWith('1234');
  });

  it('calls onComplete after paste when every slot is filled', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<PinInput length={4} onComplete={onComplete} />);

    await user.click(getSlot(0));
    await user.paste('1234');

    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('applies the invalid class to every slot when invalid is true', () => {
    render(<PinInput invalid />);

    for (const slot of getSlots()) {
      expect(slot).toHaveClass(classNames.invalid);
    }
  });

  it('sets aria-invalid on every slot when invalid is true', () => {
    render(<PinInput invalid />);

    for (const slot of getSlots()) {
      expect(slot).toHaveAttribute('aria-invalid', 'true');
    }
  });

  it('applies the disabled class to every slot when disabled is true', () => {
    render(<PinInput disabled />);

    for (const slot of getSlots()) {
      expect(slot).toHaveClass(classNames.disabled);
    }
  });

  it('disables every slot when disabled is true', () => {
    render(<PinInput disabled />);

    for (const slot of getSlots()) {
      expect(slot).toBeDisabled();
    }
  });

  it('places the first slot in the tab order and lets the next Tab leave the component', async () => {
    const user = userEvent.setup();

    render(
      <>
        <PinInput length={4} />
        <button type="button">After</button>
      </>
    );

    await user.tab();
    expect(getSlot(0)).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('passes axe for the default render', async () => {
    const { container } = render(<PinInput />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe when all slots are filled', async () => {
    const { container } = render(<PinInput defaultValue="123456" />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe when invalid', async () => {
    const { container } = render(<PinInput invalid />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe when disabled', async () => {
    const { container } = render(<PinInput disabled />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe when masked', async () => {
    const { container } = render(<PinInput mask defaultValue="123456" />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders root and slot styling hooks', () => {
    render(<PinInput />);

    expect(screen.getByRole('group')).toHaveClass(classNames.root);

    for (const slot of getSlots()) {
      expect(slot).toHaveClass(classNames.slot);
    }
  });
});

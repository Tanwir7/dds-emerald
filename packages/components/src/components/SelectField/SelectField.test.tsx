import React from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectItem } from '../Select';
import { SelectField } from './SelectField';

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

const renderSelectField = (props: Partial<React.ComponentProps<typeof SelectField>> = {}) => {
  const portalContainer = document.createElement('div');

  const view = render(
    <main>
      <SelectField
        label="Country"
        placeholder="Select your country"
        contentContainer={portalContainer}
        {...props}
      >
        <SelectItem value="ca">Canada</SelectItem>
        <SelectItem value="de">Germany</SelectItem>
        <SelectItem value="us">United States</SelectItem>
      </SelectField>
      <button type="button">Next field</button>
    </main>
  );

  view.container.querySelector('main')?.appendChild(portalContainer);

  return { ...view, portalContainer };
};

afterEach(() => {
  cleanup();
});

describe('SelectField', () => {
  it('renders the label and exposes it as the accessible name', () => {
    renderSelectField({ id: 'country' });

    expect(screen.getByText('Country')).toHaveAttribute('id', 'country-label');
    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveAttribute(
      'aria-labelledby',
      'country-label'
    );
  });

  it('wires helper and inline alert ids into aria-describedby', () => {
    renderSelectField({
      id: 'country',
      helper: 'Choose the country tied to your account profile.',
      inlineAlert: { intent: 'danger', children: 'Select a country before continuing.' },
    });

    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveAttribute(
      'aria-describedby',
      'country-helper country-inline-alert'
    );
  });

  it('forwards required and invalid state to the trigger', () => {
    renderSelectField({
      required: true,
      invalid: true,
    });

    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveAttribute(
      'aria-required',
      'true'
    );
    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('treats a danger inline alert as invalid', () => {
    renderSelectField({
      inlineAlert: { intent: 'danger', children: 'Select a country before continuing.' },
    });

    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('forwards disabled to the select trigger and styles the label as disabled', () => {
    renderSelectField({
      disabled: true,
    });

    expect(screen.getByRole('combobox', { name: 'Country' })).toBeDisabled();
    expect(screen.getByText('Country').className).toContain('labelDisabled');
  });

  it('uses the provided id for trigger and generated helper ids', () => {
    renderSelectField({
      id: 'country',
      helper: 'Choose the country tied to your account profile.',
    });

    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveAttribute('id', 'country');
    expect(screen.getByText('Choose the country tied to your account profile.')).toHaveAttribute(
      'id',
      'country-helper'
    );
  });

  it('generates ids when none are provided', () => {
    renderSelectField({
      helper: 'Choose the country tied to your account profile.',
    });

    const trigger = screen.getByRole('combobox', { name: 'Country' });
    const label = screen.getByText('Country');
    const helper = screen.getByText('Choose the country tied to your account profile.');

    expect(trigger.id).toBeTruthy();
    expect(label).toHaveAttribute('id', `${trigger.id}-label`);
    expect(helper).toHaveAttribute('id', `${trigger.id}-helper`);
  });

  it('has no axe violations when closed', async () => {
    const { container } = renderSelectField({
      helper: 'Choose the country tied to your account profile.',
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations when open', async () => {
    const user = userEvent.setup();
    renderSelectField({
      helper: 'Choose the country tied to your account profile.',
    });

    await user.click(screen.getByRole('combobox', { name: 'Country' }));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

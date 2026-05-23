import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { Fieldset } from './Fieldset';
import { Input } from '../Input';

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

describe('Fieldset', () => {
  it('renders a native fieldset', () => {
    const { container } = render(
      <Fieldset legend="Personal details">
        <Input aria-label="Full name" />
      </Fieldset>
    );

    expect(container.querySelector('fieldset')).toBeInTheDocument();
  });

  it('renders legend content when provided', () => {
    const { container } = render(
      <Fieldset legend="Personal details">
        <Input aria-label="Full name" />
      </Fieldset>
    );

    expect(within(container).getByText('Personal details').tagName).toBe('LEGEND');
  });

  it('does not render a legend when omitted', () => {
    const { container } = render(
      <Fieldset>
        <Input aria-label="Full name" />
      </Fieldset>
    );

    expect(container.querySelector('legend')).not.toBeInTheDocument();
  });

  it('renders helper text when provided', () => {
    render(
      <Fieldset helper="These details appear on your account profile." legend="Personal details">
        <Input aria-label="Full name" />
      </Fieldset>
    );

    expect(screen.getByText('These details appear on your account profile.')).toBeInTheDocument();
  });

  it('preserves child content', () => {
    const { container } = render(
      <Fieldset legend="Personal details">
        <Input aria-label="Full name" placeholder="Jane Smith" />
      </Fieldset>
    );

    expect(within(container).getByRole('textbox', { name: 'Full name' })).toBeInTheDocument();
  });

  it('forwards className and ref', () => {
    const ref = React.createRef<HTMLFieldSetElement>();
    const { container } = render(
      <Fieldset ref={ref} className="custom-fieldset" legend="Personal details">
        <Input aria-label="Full name" />
      </Fieldset>
    );

    expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
    expect(container.querySelector('fieldset')).toHaveClass('custom-fieldset');
  });

  it('has no accessibility violations with legend only', async () => {
    const { container } = render(
      <Fieldset legend="Personal details">
        <Input aria-label="Full name" />
      </Fieldset>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations with legend and helper', async () => {
    const { container } = render(
      <Fieldset helper="These details appear on your account profile." legend="Personal details">
        <Input aria-label="Full name" />
      </Fieldset>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations without a legend', async () => {
    const { container } = render(
      <Fieldset>
        <Input aria-label="Full name" />
      </Fieldset>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

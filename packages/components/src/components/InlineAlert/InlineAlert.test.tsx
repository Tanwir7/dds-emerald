import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import styles from './InlineAlert.module.scss';
import { InlineAlert } from './InlineAlert';
import iconStyles from '../Icon/Icon.module.scss';
import textStyles from '../Text/Text.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const intentClassNames = {
  info: getRequiredClassName(styles, 'intentInfo'),
  success: getRequiredClassName(styles, 'intentSuccess'),
  warning: getRequiredClassName(styles, 'intentWarning'),
  danger: getRequiredClassName(styles, 'intentDanger'),
} as const;

const textColorClassNames = {
  info: getRequiredClassName(textStyles, 'colorInfo'),
  success: getRequiredClassName(textStyles, 'colorSuccess'),
  warning: getRequiredClassName(textStyles, 'colorWarning'),
  danger: getRequiredClassName(textStyles, 'colorDanger'),
} as const;

const render = (ui: React.ReactNode) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  let root!: Root;
  act(() => {
    root = createRoot(container);
    root.render(ui);
  });

  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};

const getStatus = () => document.querySelector('[role="status"]') as HTMLSpanElement | null;

const getAlert = () => document.querySelector('[role="alert"]') as HTMLSpanElement | null;

const getMessage = () => document.querySelector(`.${styles.message}`) as HTMLSpanElement | null;

const getIconRoot = () =>
  document.querySelector(`.${getRequiredClassName(iconStyles, 'root')}`) as HTMLSpanElement | null;

afterEach(() => {
  document.body.innerHTML = '';
});

describe('InlineAlert', () => {
  it('renders a span element', () => {
    render(<InlineAlert>content</InlineAlert>);
    expect(getStatus()?.tagName).toBe('SPAN');
  });

  it('renders children as message text', () => {
    render(<InlineAlert>content</InlineAlert>);
    expect(document.body).toHaveTextContent('content');
  });

  it('renders icon by default', () => {
    const { container } = render(<InlineAlert>content</InlineAlert>);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('does not render icon when showIcon is false', () => {
    const { container } = render(<InlineAlert showIcon={false}>content</InlineAlert>);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders the icon as decorative', () => {
    const { container } = render(<InlineAlert>content</InlineAlert>);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the shared Icon component for the default icon', () => {
    render(<InlineAlert>content</InlineAlert>);
    expect(getIconRoot()).toBeTruthy();
  });

  it('uses the danger octagon-alert Lucide icon for danger intent', () => {
    const { container } = render(<InlineAlert intent="danger">content</InlineAlert>);
    expect(getIconRoot()).toBeTruthy();
    expect(container.querySelector('svg')).toHaveClass('lucide-octagon-alert');
  });

  it('forwards className to the root span', () => {
    render(<InlineAlert className="custom">content</InlineAlert>);
    expect(getStatus()).toHaveClass('custom');
  });

  it('forwards ref to HTMLSpanElement', () => {
    const ref = React.createRef<HTMLSpanElement>();

    render(<InlineAlert ref={ref}>content</InlineAlert>);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toBe(getStatus());
  });

  it('has role="status" and aria-live="polite" for intent="info" by default', () => {
    render(<InlineAlert>content</InlineAlert>);
    expect(getStatus()).toHaveAttribute('aria-live', 'polite');
  });

  it('has role="status" and aria-live="polite" for intent="success"', () => {
    render(<InlineAlert intent="success">content</InlineAlert>);
    expect(getStatus()).toHaveAttribute('aria-live', 'polite');
  });

  it('has role="alert" and aria-live="assertive" for intent="warning"', () => {
    render(<InlineAlert intent="warning">content</InlineAlert>);
    expect(getAlert()).toHaveAttribute('aria-live', 'assertive');
  });

  it('has role="alert" and aria-live="assertive" for intent="danger"', () => {
    render(<InlineAlert intent="danger">content</InlineAlert>);
    expect(getAlert()).toHaveAttribute('aria-live', 'assertive');
  });

  it('has aria-atomic="true" for all intents', () => {
    render(<InlineAlert>content</InlineAlert>);
    expect(getStatus()).toHaveAttribute('aria-atomic', 'true');
  });

  it('applies the info intent class by default', () => {
    render(<InlineAlert>content</InlineAlert>);
    expect(getStatus()).toHaveClass(intentClassNames.info);
  });

  it('applies the success intent class', () => {
    render(<InlineAlert intent="success">content</InlineAlert>);
    expect(getStatus()).toHaveClass(intentClassNames.success);
  });

  it('applies the warning intent class', () => {
    render(<InlineAlert intent="warning">content</InlineAlert>);
    expect(getAlert()).toHaveClass(intentClassNames.warning);
  });

  it('applies the danger intent class', () => {
    render(<InlineAlert intent="danger">content</InlineAlert>);
    expect(getAlert()).toHaveClass(intentClassNames.danger);
  });

  it('uses the info Text color variant for the message by default', () => {
    render(<InlineAlert>content</InlineAlert>);
    expect(getMessage()).toHaveClass(textColorClassNames.info);
  });

  it('uses the success Text color variant for the message', () => {
    render(<InlineAlert intent="success">content</InlineAlert>);
    expect(getMessage()).toHaveClass(textColorClassNames.success);
  });

  it('uses the warning Text color variant for the message', () => {
    render(<InlineAlert intent="warning">content</InlineAlert>);
    expect(getMessage()).toHaveClass(textColorClassNames.warning);
  });

  it('uses the danger Text color variant for the message', () => {
    render(<InlineAlert intent="danger">content</InlineAlert>);
    expect(getMessage()).toHaveClass(textColorClassNames.danger);
  });

  it('forwards id, data-testid, and aria-label', () => {
    const { container } = render(
      <InlineAlert id="inline-alert-id" data-testid="inline-alert" aria-label="Status message">
        content
      </InlineAlert>
    );

    const inlineAlert = container.querySelector('[data-testid="inline-alert"]');

    expect(inlineAlert).toHaveAttribute('id', 'inline-alert-id');
    expect(inlineAlert).toHaveAttribute('aria-label', 'Status message');
  });

  it('passes axe for intent="info"', async () => {
    const { container } = render(<InlineAlert>content</InlineAlert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe for intent="success"', async () => {
    const { container } = render(<InlineAlert intent="success">content</InlineAlert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe for intent="warning"', async () => {
    const { container } = render(<InlineAlert intent="warning">content</InlineAlert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe for intent="danger"', async () => {
    const { container } = render(<InlineAlert intent="danger">content</InlineAlert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe with showIcon={false}', async () => {
    const { container } = render(<InlineAlert showIcon={false}>content</InlineAlert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe when used inside a paragraph element', async () => {
    const { container } = render(
      <p>
        Copy saved. <InlineAlert intent="success">The latest draft is now available.</InlineAlert>
      </p>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

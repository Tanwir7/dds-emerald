import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './Alert.module.scss';
import { Alert } from './Alert';
import iconStyles from '../Icon/Icon.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const intentClassNames = {
  info: getRequiredClassName(styles, 'intentInfo'),
  success: getRequiredClassName(styles, 'intentSuccess'),
  warning: getRequiredClassName(styles, 'intentWarning'),
  danger: getRequiredClassName(styles, 'intentDanger'),
} as const;

const alignClassNames = {
  center: getRequiredClassName(styles, 'alignCenter'),
  start: getRequiredClassName(styles, 'alignStart'),
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
    rerender: (nextUi: React.ReactNode) => {
      act(() => {
        root.render(nextUi);
      });
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};

const getStatus = () => document.querySelector('[role="status"]') as HTMLDivElement | null;

const getAlert = () => document.querySelector('[role="alert"]') as HTMLDivElement | null;

const getIconRoot = () =>
  document.querySelector(`.${getRequiredClassName(iconStyles, 'root')}`) as HTMLSpanElement | null;

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Alert', () => {
  it('renders a div with role="status" for intent="info" by default', () => {
    render(<Alert>content</Alert>);
    expect(getStatus()).toBeInstanceOf(HTMLDivElement);
  });

  it('renders a div with role="status" for intent="success"', () => {
    render(<Alert intent="success">content</Alert>);
    expect(getStatus()).toBeInTheDocument();
  });

  it('renders a div with role="alert" for intent="warning"', () => {
    render(<Alert intent="warning">content</Alert>);
    expect(getAlert()).toBeInTheDocument();
  });

  it('renders a div with role="alert" for intent="danger"', () => {
    render(<Alert intent="danger">content</Alert>);
    expect(getAlert()).toBeInTheDocument();
  });

  it('has aria-live="polite" for info and success', () => {
    const view = render(<Alert>content</Alert>);

    expect(getStatus()).toHaveAttribute('aria-live', 'polite');

    view.rerender(<Alert intent="success">content</Alert>);

    expect(getStatus()).toHaveAttribute('aria-live', 'polite');
  });

  it('has aria-live="assertive" for warning and danger', () => {
    const view = render(<Alert intent="warning">content</Alert>);

    expect(getAlert()).toHaveAttribute('aria-live', 'assertive');

    view.rerender(<Alert intent="danger">content</Alert>);

    expect(getAlert()).toHaveAttribute('aria-live', 'assertive');
  });

  it('has aria-atomic="true"', () => {
    render(<Alert>content</Alert>);
    expect(getStatus()).toHaveAttribute('aria-atomic', 'true');
  });

  it('renders children as body content', () => {
    render(<Alert>content</Alert>);
    expect(document.body).toHaveTextContent('content');
  });

  it('renders title when title prop is provided', () => {
    render(<Alert title="Heads up">content</Alert>);
    expect(document.body).toHaveTextContent('Heads up');
  });

  it('does not render a title element when title is omitted', () => {
    render(<Alert>content</Alert>);
    expect(document.querySelector(`.${getRequiredClassName(styles, 'title')}`)).toBeNull();
  });

  it('forwards className to the root', () => {
    render(<Alert className="custom">content</Alert>);
    expect(getStatus()).toHaveClass('custom');
  });

  it('forwards ref to HTMLDivElement', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<Alert ref={ref}>content</Alert>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(getStatus());
  });

  it('applies the info intent class by default', () => {
    render(<Alert>content</Alert>);
    expect(getStatus()).toHaveClass(intentClassNames.info);
  });

  it('applies the success intent class', () => {
    render(<Alert intent="success">content</Alert>);
    expect(getStatus()).toHaveClass(intentClassNames.success);
  });

  it('applies the warning intent class', () => {
    render(<Alert intent="warning">content</Alert>);
    expect(getAlert()).toHaveClass(intentClassNames.warning);
  });

  it('applies the danger intent class', () => {
    render(<Alert intent="danger">content</Alert>);
    expect(getAlert()).toHaveClass(intentClassNames.danger);
  });

  it('applies centered alignment by default', () => {
    render(<Alert>content</Alert>);
    expect(getStatus()).toHaveClass(alignClassNames.center);
  });

  it('applies start alignment when align="start"', () => {
    render(<Alert align="start">content</Alert>);
    expect(getStatus()).toHaveClass(alignClassNames.start);
  });

  it('renders the default icon when showIcon is true by default', () => {
    const { container } = render(<Alert>content</Alert>);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('does not render an icon when showIcon is false', () => {
    const { container } = render(<Alert showIcon={false}>content</Alert>);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders a custom icon when icon is provided', () => {
    render(<Alert icon={<svg data-testid="custom-icon" viewBox="0 0 16 16" />}>content</Alert>);

    expect(document.querySelector('[data-testid="custom-icon"]')).toBeInTheDocument();
  });

  it('renders the icon as decorative', () => {
    const { container } = render(<Alert>content</Alert>);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the shared Icon component for the default icon', () => {
    render(<Alert>content</Alert>);
    expect(getIconRoot()).toBeTruthy();
  });

  it('uses the octagon alert Lucide icon for danger intent', () => {
    const { container } = render(<Alert intent="danger">content</Alert>);
    expect(getIconRoot()).toBeTruthy();
    expect(container.querySelector('svg')).toHaveClass('lucide-octagon-alert');
  });

  it('does not render a dismiss button by default', () => {
    render(<Alert>content</Alert>);
    expect(document.querySelector('button')).toBeNull();
  });

  it('renders a dismiss button when dismissible is true', () => {
    render(<Alert dismissible>content</Alert>);
    expect(document.querySelector('button')).toHaveAccessibleName('Dismiss alert');
  });

  it('renders the dismiss icon with the shared Icon component', () => {
    render(<Alert dismissible>content</Alert>);
    const button = document.querySelector('button');
    expect(button?.querySelector(`.${getRequiredClassName(iconStyles, 'root')}`)).toBeTruthy();
  });

  it('renders the dismiss button as type button', () => {
    render(<Alert dismissible>content</Alert>);
    expect(document.querySelector('button')).toHaveAttribute('type', 'button');
  });

  it('uses the default dismiss aria-label when title is absent', () => {
    render(<Alert dismissible>content</Alert>);
    expect(document.querySelector('button')).toHaveAccessibleName('Dismiss alert');
  });

  it('includes the title in the dismiss aria-label when title is provided', () => {
    render(
      <Alert dismissible title="Connection issue">
        content
      </Alert>
    );

    expect(document.querySelector('button')).toHaveAccessibleName('Dismiss: Connection issue');
  });

  it('clicking dismiss calls onDismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <Alert dismissible onDismiss={onDismiss}>
        content
      </Alert>
    );

    await user.click(document.querySelector('button') as HTMLButtonElement);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('dismiss button is focusable', async () => {
    const user = userEvent.setup();

    render(<Alert dismissible>content</Alert>);

    await user.tab();

    expect(document.querySelector('button')).toHaveFocus();
  });

  it('Enter activates dismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <Alert dismissible onDismiss={onDismiss}>
        content
      </Alert>
    );

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('Space activates dismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <Alert dismissible onDismiss={onDismiss}>
        content
      </Alert>
    );

    await user.tab();
    await user.keyboard(' ');

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('forwards id, data-testid, and aria-labelledby', () => {
    const { container } = render(
      <Alert id="alert-id" data-testid="alert" aria-labelledby="alert-heading">
        content
      </Alert>
    );

    const alert = container.querySelector('[data-testid="alert"]');

    expect(alert).toHaveAttribute('id', 'alert-id');
    expect(alert).toHaveAttribute('aria-labelledby', 'alert-heading');
  });

  it('passes axe for intent="info"', async () => {
    const { container } = render(<Alert>content</Alert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe for intent="success"', async () => {
    const { container } = render(<Alert intent="success">content</Alert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe for intent="warning"', async () => {
    const { container } = render(<Alert intent="warning">content</Alert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe for intent="danger"', async () => {
    const { container } = render(<Alert intent="danger">content</Alert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe with title', async () => {
    const { container } = render(<Alert title="Heads up">content</Alert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe when dismissible', async () => {
    const { container } = render(<Alert dismissible>content</Alert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe when showIcon is false', async () => {
    const { container } = render(<Alert showIcon={false}>content</Alert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

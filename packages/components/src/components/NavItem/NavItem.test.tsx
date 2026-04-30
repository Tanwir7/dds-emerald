import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { House } from 'lucide-react';
import styles from './NavItem.module.scss';
import { NavItem } from './NavItem';
import { Icon } from '../Icon';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  active: getRequiredClassName(styles, 'active'),
  default: getRequiredClassName(styles, 'default'),
  sidebar: getRequiredClassName(styles, 'sidebar'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  level1: getRequiredClassName(styles, 'level1'),
  level2: getRequiredClassName(styles, 'level2'),
  disabled: getRequiredClassName(styles, 'disabled'),
  icon: getRequiredClassName(styles, 'icon'),
  endSlot: getRequiredClassName(styles, 'endSlot'),
} as const;

const renderIcon = () => <Icon icon={House} aria-hidden="true" />;

describe('NavItem', () => {
  it('renders an <a> when href is provided', () => {
    render(<NavItem href="/dashboard">Dashboard</NavItem>);

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders a <button> when href is not provided', () => {
    render(<NavItem>Dashboard</NavItem>);

    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders via Slot child when asChild is true', () => {
    render(
      <NavItem asChild>
        <a href="/dashboard">Dashboard</a>
      </NavItem>
    );

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveClass(classNames.root);
  });

  it('button has type="button"', () => {
    render(<NavItem>Dashboard</NavItem>);

    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveAttribute('type', 'button');
  });

  it('renders children as label text', () => {
    render(<NavItem href="/dashboard">Dashboard</NavItem>);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders icon when icon prop is provided', () => {
    render(
      <NavItem href="/dashboard" icon={renderIcon()}>
        Dashboard
      </NavItem>
    );

    expect(screen.getByRole('link', { name: 'Dashboard' }).querySelector('svg')).toBeTruthy();
  });

  it('icon wrapper is aria-hidden', () => {
    render(
      <NavItem href="/dashboard" icon={renderIcon()}>
        Dashboard
      </NavItem>
    );

    expect(
      screen.getByRole('link', { name: 'Dashboard' }).querySelector(`.${classNames.icon}`)
    ).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders endSlot when provided', () => {
    render(
      <NavItem href="/dashboard" endSlot={<span data-testid="count">4</span>}>
        Dashboard
      </NavItem>
    );

    expect(screen.getByTestId('count').parentElement).toHaveClass(classNames.endSlot);
  });

  it('forwards className to the root', () => {
    render(
      <NavItem href="/dashboard" className="custom">
        Dashboard
      </NavItem>
    );

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveClass('custom');
  });

  it('forwards ref to the root element', () => {
    const ref = React.createRef<HTMLAnchorElement>();

    render(
      <NavItem href="/dashboard" ref={ref}>
        Dashboard
      </NavItem>
    );

    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('has aria-current="page" when isActive is true', () => {
    render(
      <NavItem href="/dashboard" isActive>
        Dashboard
      </NavItem>
    );

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
  });

  it('does not have aria-current when isActive is false', () => {
    render(<NavItem href="/dashboard">Dashboard</NavItem>);

    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
  });

  it('applies .active class when isActive is true', () => {
    render(
      <NavItem href="/dashboard" isActive>
        Dashboard
      </NavItem>
    );

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveClass(classNames.active);
  });

  it('anchor has aria-disabled when disabled', () => {
    render(
      <NavItem href="/dashboard" disabled>
        Dashboard
      </NavItem>
    );

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('disabled');
  });

  it('button has disabled attribute when disabled', () => {
    render(<NavItem disabled>Dashboard</NavItem>);

    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeDisabled();
  });

  it('disabled link onClick is suppressed', () => {
    const onClick = vi.fn();

    render(
      <NavItem href="/dashboard" disabled onClick={onClick}>
        Dashboard
      </NavItem>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Dashboard' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies .disabled class when disabled', () => {
    render(<NavItem disabled>Dashboard</NavItem>);

    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveClass(classNames.disabled);
  });

  it('applies the default class by default', () => {
    render(<NavItem>Dashboard</NavItem>);

    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveClass(classNames.default);
  });

  it('applies the sidebar class when variant is sidebar', () => {
    render(<NavItem variant="sidebar">Dashboard</NavItem>);

    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveClass(classNames.sidebar);
  });

  it('applies the md class by default', () => {
    render(<NavItem>Dashboard</NavItem>);

    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveClass(classNames.md);
  });

  it('applies the sm class when size is sm', () => {
    render(<NavItem size="sm">Dashboard</NavItem>);

    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveClass(classNames.sm);
  });

  it('applies no level class when level is 0', () => {
    render(<NavItem>Dashboard</NavItem>);

    const item = screen.getByRole('button', { name: 'Dashboard' });
    expect(item).not.toHaveClass(classNames.level1);
    expect(item).not.toHaveClass(classNames.level2);
  });

  it('applies .level1 when level is 1', () => {
    render(<NavItem level={1}>Dashboard</NavItem>);

    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveClass(classNames.level1);
  });

  it('applies .level2 when level is 2', () => {
    render(<NavItem level={2}>Dashboard</NavItem>);

    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveClass(classNames.level2);
  });

  it('forwards href to <a>', () => {
    render(<NavItem href="/dashboard">Dashboard</NavItem>);

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
  });

  it('forwards onClick to the root element', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<NavItem onClick={onClick}>Dashboard</NavItem>);

    await user.click(screen.getByRole('button', { name: 'Dashboard' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards aria-label and data-testid', () => {
    render(
      <NavItem aria-label="Open dashboard" data-testid="nav-item">
        Dashboard
      </NavItem>
    );

    expect(screen.getByTestId('nav-item')).toHaveAccessibleName('Open dashboard');
  });

  it('anchor receives Tab focus', async () => {
    const user = userEvent.setup();

    render(
      <>
        <button type="button">Before</button>
        <NavItem href="/dashboard">Dashboard</NavItem>
      </>
    );

    await user.tab();
    await user.tab();

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveFocus();
  });

  it('button receives Tab focus', async () => {
    const user = userEvent.setup();

    render(
      <>
        <a href="#before">Before</a>
        <NavItem>Dashboard</NavItem>
      </>
    );

    await user.tab();
    await user.tab();

    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveFocus();
  });

  it('disabled button is not in the tab order', async () => {
    const user = userEvent.setup();

    render(
      <>
        <a href="#before">Before</a>
        <NavItem disabled>Dashboard</NavItem>
        <button type="button">After</button>
      </>
    );

    await user.tab();
    await user.tab();

    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('disabled anchor is still in the tab order', async () => {
    const user = userEvent.setup();

    render(
      <>
        <button type="button">Before</button>
        <NavItem href="/dashboard" disabled>
          Dashboard
        </NavItem>
      </>
    );

    await user.tab();
    await user.tab();

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveFocus();
  });

  it('Enter activates <a>', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <>
        <button type="button">Before</button>
        <NavItem href="/dashboard" onClick={onClick}>
          Dashboard
        </NavItem>
      </>
    );

    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Enter activates <button>', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<NavItem onClick={onClick}>Dashboard</NavItem>);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Space activates <button>', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<NavItem onClick={onClick}>Dashboard</NavItem>);

    await user.tab();
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('axe: passes for a link', async () => {
    const { container } = render(<NavItem href="/dashboard">Dashboard</NavItem>);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes for an active link', async () => {
    const { container } = render(
      <NavItem href="/dashboard" isActive>
        Dashboard
      </NavItem>
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes for a button', async () => {
    const { container } = render(<NavItem>Dashboard</NavItem>);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes for a disabled link', async () => {
    const { container } = render(
      <NavItem href="/dashboard" disabled>
        Dashboard
      </NavItem>
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes for a disabled button', async () => {
    const { container } = render(<NavItem disabled>Dashboard</NavItem>);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes for the sidebar variant', async () => {
    const { container } = render(<NavItem variant="sidebar">Dashboard</NavItem>);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes with icon', async () => {
    const { container } = render(
      <NavItem href="/dashboard" icon={renderIcon()}>
        Dashboard
      </NavItem>
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it.each([0, 1, 2] as const)('axe: passes for level %s', async (level) => {
    const { container } = render(<NavItem level={level}>Dashboard</NavItem>);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});

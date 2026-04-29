import '@testing-library/jest-dom/vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import {
  BreadcrumbItem,
  Breadcrumbs,
  BreadcrumbSeparator,
  type BreadcrumbItemProps,
} from './Breadcrumbs';
import styles from './Breadcrumbs.module.scss';

expect.extend(toHaveNoViolations);

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  list: getRequiredClassName(styles, 'list'),
  item: getRequiredClassName(styles, 'item'),
  link: getRequiredClassName(styles, 'link'),
  current: getRequiredClassName(styles, 'current'),
  separator: getRequiredClassName(styles, 'separator'),
  ellipsisBtn: getRequiredClassName(styles, 'ellipsisBtn'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
} as const;

const renderBreadcrumbs = (props: Partial<React.ComponentProps<typeof Breadcrumbs>> = {}) =>
  render(
    <Breadcrumbs {...props}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/components">Components</BreadcrumbItem>
      <BreadcrumbItem>Breadcrumbs</BreadcrumbItem>
    </Breadcrumbs>
  );

afterEach(() => {
  cleanup();
});

describe('Breadcrumbs', () => {
  it('renders a navigation landmark labelled Breadcrumb', () => {
    renderBreadcrumbs();

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders an ordered list', () => {
    renderBreadcrumbs();

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const list = nav.querySelector('ol');

    expect(list).toBeInTheDocument();
    expect(list).toHaveClass(classNames.list);
  });

  it('forwards ref to the nav element', () => {
    const ref = React.createRef<HTMLElement>();

    renderBreadcrumbs({ ref });

    expect(ref.current).toBe(screen.getByRole('navigation', { name: 'Breadcrumb' }));
  });

  it('forwards className to the nav element', () => {
    renderBreadcrumbs({ className: 'custom-root' });

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveClass(
      classNames.root,
      'custom-root'
    );
  });

  it('renders non-current items as links and the last item as the current page', () => {
    renderBreadcrumbs();

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Components' })).toHaveAttribute('href', '/components');
    expect(screen.getByText('Breadcrumbs')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Breadcrumbs' })).not.toBeInTheDocument();
  });

  it('renders separators between breadcrumb items', () => {
    const { container } = renderBreadcrumbs();

    expect(container.querySelectorAll(`.${classNames.separator}`)).toHaveLength(2);
  });

  it('hides separators from assistive technology', () => {
    renderBreadcrumbs();

    const separators = document.querySelectorAll(`.${classNames.separator}`);

    separators.forEach((separator) => {
      expect(separator).toHaveAttribute('aria-hidden', 'true');
      expect(separator).toHaveAttribute('role', 'presentation');
    });
  });

  it('applies md size classes by default', () => {
    const { container } = renderBreadcrumbs();

    expect(container.querySelector(`.${classNames.link}`)).toHaveClass(classNames.md);
    expect(container.querySelector(`.${classNames.current}`)).toHaveClass(classNames.md);
  });

  it('applies sm size classes when size is sm', () => {
    const { container } = renderBreadcrumbs({ size: 'sm' });

    expect(container.querySelector(`.${classNames.link}`)).toHaveClass(classNames.sm);
    expect(container.querySelector(`.${classNames.current}`)).toHaveClass(classNames.sm);
  });

  it('renders a custom separator from the root separator prop', () => {
    renderBreadcrumbs({ separator: <span>/</span> });

    expect(screen.getAllByText('/')).toHaveLength(2);
  });

  it('truncates middle items when maxItems is exceeded', () => {
    render(
      <Breadcrumbs maxItems={4}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/products">Products</BreadcrumbItem>
        <BreadcrumbItem href="/products/platform">Platform</BreadcrumbItem>
        <BreadcrumbItem href="/products/platform/navigation">Navigation</BreadcrumbItem>
        <BreadcrumbItem>Breadcrumbs</BreadcrumbItem>
      </Breadcrumbs>
    );

    expect(screen.getByRole('button', { name: 'Show full breadcrumb path' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Products' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Platform' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Navigation' })).toBeInTheDocument();
    expect(screen.getByText('Breadcrumbs')).toHaveAttribute('aria-current', 'page');
  });

  it('expands the full path when the ellipsis button is activated', () => {
    render(
      <Breadcrumbs maxItems={4}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/products">Products</BreadcrumbItem>
        <BreadcrumbItem href="/products/platform">Platform</BreadcrumbItem>
        <BreadcrumbItem href="/products/platform/navigation">Navigation</BreadcrumbItem>
        <BreadcrumbItem>Breadcrumbs</BreadcrumbItem>
      </Breadcrumbs>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show full breadcrumb path' }));

    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Platform' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Show full breadcrumb path' })
    ).not.toBeInTheDocument();
  });

  it('clamps maxItems values below three to the supported truncation minimum', () => {
    render(
      <Breadcrumbs maxItems={2}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/products">Products</BreadcrumbItem>
        <BreadcrumbItem href="/products/platform">Platform</BreadcrumbItem>
        <BreadcrumbItem href="/products/platform/navigation">Navigation</BreadcrumbItem>
        <BreadcrumbItem>Breadcrumbs</BreadcrumbItem>
      </Breadcrumbs>
    );

    expect(screen.getByRole('button', { name: 'Show full breadcrumb path' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Navigation' })).toBeInTheDocument();
    expect(screen.getByText('Breadcrumbs')).toHaveAttribute('aria-current', 'page');
  });

  it('passes axe checks', async () => {
    const { container } = renderBreadcrumbs();

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('BreadcrumbItem', () => {
  const renderItem = (props: Partial<BreadcrumbItemProps> = {}) =>
    render(
      <Breadcrumbs>
        <BreadcrumbItem {...props}>{props.children ?? 'Standalone item'}</BreadcrumbItem>
      </Breadcrumbs>
    );

  it('forwards ref to the li element', () => {
    const ref = React.createRef<HTMLLIElement>();

    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/" ref={ref}>
          Home
        </BreadcrumbItem>
      </Breadcrumbs>
    );

    expect(ref.current).toBeInstanceOf(HTMLLIElement);
    expect(ref.current).toHaveClass(classNames.item);
  });

  it('renders as current page text when href is omitted', () => {
    renderItem();

    expect(screen.getByText('Standalone item')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Standalone item' })).not.toBeInTheDocument();
  });

  it('renders a link when href is provided', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumbs>
    );

    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
  });

  it('renders slotted link content when asChild is true', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem asChild>
          <a href="/docs">Docs</a>
        </BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumbs>
    );

    const link = screen.getByRole('link', { name: 'Docs' });

    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveClass(classNames.link);
  });

  it('respects explicit isCurrent', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/" isCurrent>
          Home
        </BreadcrumbItem>
      </Breadcrumbs>
    );

    expect(screen.getByText('Home')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
  });
});

describe('BreadcrumbSeparator', () => {
  it('renders the default separator icon', () => {
    const { container } = render(
      <ol>
        <BreadcrumbSeparator />
      </ol>
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders custom children', () => {
    render(
      <ol>
        <BreadcrumbSeparator>
          <span>/</span>
        </BreadcrumbSeparator>
      </ol>
    );

    expect(screen.getByText('/')).toBeInTheDocument();
  });
});

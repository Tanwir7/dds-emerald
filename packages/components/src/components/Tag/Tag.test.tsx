import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './Tag.module.scss';
import { Tag } from './Tag';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const variantClassNames = {
  default: getRequiredClassName(styles, 'variantDefault'),
  accent: getRequiredClassName(styles, 'variantAccent'),
  success: getRequiredClassName(styles, 'variantSuccess'),
  warning: getRequiredClassName(styles, 'variantWarning'),
  danger: getRequiredClassName(styles, 'variantDanger'),
  info: getRequiredClassName(styles, 'variantInfo'),
} as const;

const variants = Object.keys(variantClassNames) as Array<keyof typeof variantClassNames>;

const sizeClassNames = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
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

const getTagByText = (text: string) => {
  const rootClassName = getRequiredClassName(styles, 'root');

  const tag = Array.from(document.querySelectorAll('span')).find(
    (element) => element.className.includes(rootClassName) && element.textContent === text
  );

  expect(tag).toBeTruthy();
  return tag as HTMLSpanElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Tag', () => {
  it('renders a span by default', () => {
    render(<Tag>react</Tag>);

    const tag = getTagByText('react');

    expect(tag.tagName).toBe('SPAN');
  });

  it('renders children text', () => {
    render(<Tag>react</Tag>);

    expect(getTagByText('react')).toBeInTheDocument();
  });

  it('forwards className to the root', () => {
    render(<Tag className="custom">react</Tag>);

    expect(getTagByText('react')).toHaveClass('custom');
  });

  it('forwards ref to the root span element', () => {
    const ref = React.createRef<HTMLSpanElement>();

    render(<Tag ref={ref}>react</Tag>);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toBe(getTagByText('react'));
  });

  it('does not render a remove button by default', () => {
    render(<Tag>react</Tag>);

    expect(document.querySelector('button')).toBeNull();
  });

  it('renders a remove button when removable is true', () => {
    render(<Tag removable>react</Tag>);

    expect(document.querySelector('button')).toHaveAccessibleName('Remove react');
  });

  it('applies the default variant class by default', () => {
    render(<Tag>react</Tag>);

    expect(getTagByText('react')).toHaveClass(variantClassNames.default);
  });

  it.each(variants.filter((variant) => variant !== 'default'))(
    'applies the %s variant class',
    (variant) => {
      render(<Tag variant={variant}>react</Tag>);

      expect(getTagByText('react')).toHaveClass(variantClassNames[variant]);
    }
  );

  it('applies the md size class by default', () => {
    render(<Tag>react</Tag>);

    expect(getTagByText('react')).toHaveClass(sizeClassNames.md);
  });

  it('applies the sm size class when requested', () => {
    render(<Tag size="sm">react</Tag>);

    expect(getTagByText('react')).toHaveClass(sizeClassNames.sm);
  });

  it('renders the remove button as type button', () => {
    render(<Tag removable>react</Tag>);

    expect(document.querySelector('button')).toHaveAttribute('type', 'button');
  });

  it('sets a descriptive remove button aria-label from the tag text', () => {
    render(<Tag removable>react</Tag>);

    expect(document.querySelector('button')).toHaveAccessibleName('Remove react');
  });

  it('clicking the remove button calls onRemove', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <Tag removable onRemove={onRemove}>
        react
      </Tag>
    );

    await user.click(document.querySelector('button') as HTMLButtonElement);

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('clicking remove does not bubble to onClick when interactive', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();

    render(
      // @ts-expect-error interactive and removable are mutually exclusive.
      <Tag interactive removable onClick={onClick} onRemove={onRemove}>
        react
      </Tag>
    );

    await user.click(getTagByText('react'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('does not render a remove button when disabled', () => {
    render(
      <Tag removable disabled>
        react
      </Tag>
    );

    expect(document.querySelector('button')).toBeNull();
  });

  it('does not apply the interactive class by default', () => {
    render(<Tag>react</Tag>);

    expect(getTagByText('react')).not.toHaveClass(getRequiredClassName(styles, 'interactive'));
  });

  it('applies the interactive class when interactive is true', () => {
    render(<Tag interactive>react</Tag>);

    expect(getTagByText('react')).toHaveClass(getRequiredClassName(styles, 'interactive'));
  });

  it('adds role button when interactive is true', () => {
    render(<Tag interactive>react</Tag>);

    expect(getTagByText('react')).toHaveAttribute('role', 'button');
  });

  it('adds tabIndex 0 when interactive is true', () => {
    render(<Tag interactive>react</Tag>);

    expect(getTagByText('react')).toHaveAttribute('tabindex', '0');
  });

  it('calls onClick when an interactive tag is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Tag interactive onClick={onClick}>
        react
      </Tag>
    );

    await user.click(getTagByText('react'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick on Enter when interactive', () => {
    const onClick = vi.fn();

    render(
      <Tag interactive onClick={onClick}>
        react
      </Tag>
    );

    fireEvent.keyDown(getTagByText('react'), { key: 'Enter' });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick on Space when interactive', () => {
    const onClick = vi.fn();

    render(
      <Tag interactive onClick={onClick}>
        react
      </Tag>
    );

    fireEvent.keyDown(getTagByText('react'), { key: ' ' });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies the disabled class when disabled', () => {
    render(<Tag disabled>react</Tag>);

    expect(getTagByText('react')).toHaveClass(getRequiredClassName(styles, 'disabled'));
  });

  it('uses pointer-events none in the disabled styles', () => {
    const stylesheet = readFileSync('src/components/Tag/Tag.module.scss', 'utf8');

    expect(stylesheet).toContain('.disabled');
    expect(stylesheet).toContain('pointer-events: none;');
  });

  it('the remove button receives focus on tab when removable', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <a href="/">before</a>
        <Tag removable>react</Tag>
      </div>
    );

    await user.tab();
    await user.tab();

    expect(document.querySelector('button')).toHaveFocus();
  });

  it('Enter activates the remove button', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <Tag removable onRemove={onRemove}>
        react
      </Tag>
    );

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('Space activates the remove button', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <Tag removable onRemove={onRemove}>
        react
      </Tag>
    );

    await user.tab();
    await user.keyboard(' ');

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('an interactive tag receives focus on tab', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <a href="/">before</a>
        <Tag interactive>react</Tag>
      </div>
    );

    await user.tab();
    await user.tab();

    expect(getTagByText('react')).toHaveFocus();
  });

  it('passes axe for the default tag', async () => {
    const { container } = render(<Tag>react</Tag>);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe when removable', async () => {
    const { container } = render(<Tag removable>react</Tag>);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe when interactive', async () => {
    const { container } = render(<Tag interactive>react</Tag>);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe when interactive and removable', async () => {
    const { container } = render(
      // @ts-expect-error interactive and removable are mutually exclusive.
      <Tag interactive removable>
        react
      </Tag>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('does not render a remove button when interactive and removable are both passed', () => {
    render(
      // @ts-expect-error interactive and removable are mutually exclusive.
      <Tag interactive removable>
        react
      </Tag>
    );

    expect(document.querySelector('button')).toBeNull();
  });

  it.each(variants)('passes axe for the %s variant', async (variant) => {
    const { container } = render(<Tag variant={variant}>react</Tag>);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe when disabled', async () => {
    const { container } = render(<Tag disabled>react</Tag>);

    expect(await axe(container)).toHaveNoViolations();
  });
});

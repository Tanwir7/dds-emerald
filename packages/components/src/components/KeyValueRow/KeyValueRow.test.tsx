import React, { act, createRef } from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './KeyValueRow.module.scss';
import { KeyValueList, KeyValueRow } from './KeyValueRow';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  list: getRequiredClassName(styles, 'list'),
  row: getRequiredClassName(styles, 'row'),
  inline: getRequiredClassName(styles, 'inline'),
  stacked: getRequiredClassName(styles, 'stacked'),
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  dividers: getRequiredClassName(styles, 'dividers'),
  label: getRequiredClassName(styles, 'label'),
  value: getRequiredClassName(styles, 'value'),
  valueContent: getRequiredClassName(styles, 'valueContent'),
  hasCopy: getRequiredClassName(styles, 'hasCopy'),
  copyBtn: getRequiredClassName(styles, 'copyBtn'),
  srOnly: getRequiredClassName(styles, 'srOnly'),
} as const;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const renderStandaloneRow = (ui: React.ReactElement) => render(<dl>{ui}</dl>);

const mockClipboard = () => {
  if (!globalThis.navigator.clipboard) {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn(),
      },
    });
  }

  return vi.spyOn(globalThis.navigator.clipboard, 'writeText').mockResolvedValue(undefined);
};

describe('KeyValueList', () => {
  it('renders a <dl> element', () => {
    const { container } = render(
      <KeyValueList>
        <KeyValueRow label="Email">ada@example.com</KeyValueRow>
      </KeyValueList>
    );

    const list = container.querySelector('dl');

    expect(list).toBeInstanceOf(HTMLDListElement);
    expect(list).toHaveClass(classNames.list);
  });

  it('forwards className to dl', () => {
    const { container } = render(
      <KeyValueList className="custom-list">
        <KeyValueRow label="Email">ada@example.com</KeyValueRow>
      </KeyValueList>
    );

    expect(container.querySelector('dl')).toHaveClass('custom-list');
  });

  it('forwards ref to HTMLDListElement', () => {
    const ref = createRef<HTMLDListElement>();

    render(
      <KeyValueList ref={ref}>
        <KeyValueRow label="Email">ada@example.com</KeyValueRow>
      </KeyValueList>
    );

    expect(ref.current).toBeInstanceOf(HTMLDListElement);
  });

  it('has no divider class by default', () => {
    const { container } = render(
      <KeyValueList>
        <KeyValueRow label="Email">ada@example.com</KeyValueRow>
      </KeyValueList>
    );

    expect(container.querySelector('dl')).not.toHaveClass(classNames.dividers);
  });

  it('applies .dividers class when dividers is true', () => {
    const { container } = render(
      <KeyValueList dividers>
        <KeyValueRow label="Email">ada@example.com</KeyValueRow>
      </KeyValueList>
    );

    expect(container.querySelector('dl')).toHaveClass(classNames.dividers);
  });

  it('applies .md class by default', () => {
    const { container } = render(
      <KeyValueList>
        <KeyValueRow label="Email">ada@example.com</KeyValueRow>
      </KeyValueList>
    );

    expect(container.querySelector('dl')).toHaveClass(classNames.md);
  });

  it('applies .sm class when size is sm', () => {
    const { container } = render(
      <KeyValueList size="sm">
        <KeyValueRow label="Email">ada@example.com</KeyValueRow>
      </KeyValueList>
    );

    expect(container.querySelector('dl')).toHaveClass(classNames.sm);
  });
});

describe('KeyValueRow', () => {
  it('renders <dt> with label text', () => {
    renderStandaloneRow(<KeyValueRow label="Email">ada@example.com</KeyValueRow>);

    expect(screen.getByText('Email').tagName).toBe('DT');
  });

  it('renders children as value (<dd> by default)', () => {
    renderStandaloneRow(<KeyValueRow label="Email">ada@example.com</KeyValueRow>);

    expect(screen.getByText('ada@example.com').closest('dd')).toBeInTheDocument();
  });

  it('forwards className to row div', () => {
    const { container } = renderStandaloneRow(
      <KeyValueRow label="Email" className="custom-row">
        ada@example.com
      </KeyValueRow>
    );

    expect(container.querySelector(`.${classNames.row}`)).toHaveClass('custom-row');
  });

  it('forwards ref to row HTMLDivElement', () => {
    const ref = createRef<HTMLDivElement>();

    renderStandaloneRow(
      <KeyValueRow ref={ref} label="Email">
        ada@example.com
      </KeyValueRow>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('applies .inline class by default', () => {
    const { container } = renderStandaloneRow(
      <KeyValueRow label="Email">ada@example.com</KeyValueRow>
    );

    expect(container.querySelector(`.${classNames.row}`)).toHaveClass(classNames.inline);
  });

  it('sets the default label width CSS variable in inline layout', () => {
    const { container } = renderStandaloneRow(
      <KeyValueRow label="Email">ada@example.com</KeyValueRow>
    );
    const row = container.querySelector(`.${classNames.row}`) as HTMLDivElement;

    expect(row.style.getPropertyValue('--dds-key-value-row-label-width')).toBe('140px');
  });

  it('sets the provided label width CSS variable value', () => {
    const { container } = renderStandaloneRow(
      <KeyValueRow label="Email" labelWidth="200px">
        ada@example.com
      </KeyValueRow>
    );
    const row = container.querySelector(`.${classNames.row}`) as HTMLDivElement;

    expect(row.style.getPropertyValue('--dds-key-value-row-label-width')).toBe('200px');
  });

  it('renders label and value in a row for inline layout', () => {
    const { container } = renderStandaloneRow(
      <KeyValueRow label="Email">ada@example.com</KeyValueRow>
    );
    const row = container.querySelector(`.${classNames.row}`) as HTMLDivElement;

    expect(row.firstElementChild?.tagName).toBe('DT');
    expect(row.lastElementChild?.tagName).toBe('DD');
  });

  it('applies .stacked class when layout is stacked', () => {
    const { container } = renderStandaloneRow(
      <KeyValueRow label="Email" layout="stacked">
        ada@example.com
      </KeyValueRow>
    );

    expect(container.querySelector(`.${classNames.row}`)).toHaveClass(classNames.stacked);
  });

  it('renders the label above the value in stacked layout', () => {
    const { container } = renderStandaloneRow(
      <KeyValueRow label="Email" layout="stacked">
        ada@example.com
      </KeyValueRow>
    );
    const row = container.querySelector(`.${classNames.row}`) as HTMLDivElement;

    expect(row.firstElementChild).toHaveTextContent('Email');
    expect(row.lastElementChild).toHaveTextContent('ada@example.com');
  });

  it('receives layout from KeyValueList context', () => {
    const { container } = render(
      <KeyValueList layout="stacked">
        <KeyValueRow label="Email">ada@example.com</KeyValueRow>
      </KeyValueList>
    );

    expect(container.querySelector(`.${classNames.row}`)).toHaveClass(classNames.stacked);
  });

  it('receives size from KeyValueList context', () => {
    const { container } = render(
      <KeyValueList size="sm">
        <KeyValueRow label="Email">ada@example.com</KeyValueRow>
      </KeyValueList>
    );

    expect(container.querySelector(`.${classNames.row}`)).toHaveClass(classNames.sm);
  });

  it('receives label width from KeyValueList context', () => {
    const { container } = render(
      <KeyValueList labelWidth="180px">
        <KeyValueRow label="Email">ada@example.com</KeyValueRow>
      </KeyValueList>
    );
    const row = container.querySelector(`.${classNames.row}`) as HTMLDivElement;

    expect(row.style.getPropertyValue('--dds-key-value-row-label-width')).toBe('180px');
  });

  it('lets explicit row layout override KeyValueList context', () => {
    const { container } = render(
      <KeyValueList layout="inline">
        <KeyValueRow label="Email" layout="stacked">
          ada@example.com
        </KeyValueRow>
      </KeyValueList>
    );

    expect(container.querySelector(`.${classNames.row}`)).toHaveClass(classNames.stacked);
    expect(container.querySelector(`.${classNames.row}`)).not.toHaveClass(classNames.inline);
  });

  it('renders the provided valueAs element', () => {
    renderStandaloneRow(
      <KeyValueRow label="Status" valueAs="div">
        Active
      </KeyValueRow>
    );

    expect(screen.getByText('Active').closest('div')).toBeInTheDocument();
  });

  it('does not render a copy button by default', () => {
    renderStandaloneRow(<KeyValueRow label="Email">ada@example.com</KeyValueRow>);

    expect(screen.queryByRole('button', { name: 'Copy Email' })).not.toBeInTheDocument();
  });

  it('renders a copy button when copyable is true', () => {
    renderStandaloneRow(
      <KeyValueRow label="Email" copyable>
        ada@example.com
      </KeyValueRow>
    );

    expect(screen.getByRole('button', { name: 'Copy Email' })).toBeInTheDocument();
  });

  it('calls onCopy with the copied value text', async () => {
    mockClipboard();
    const onCopy = vi.fn();
    const user = userEvent.setup();

    renderStandaloneRow(
      <KeyValueRow label="Email" copyable onCopy={onCopy}>
        ada@example.com
      </KeyValueRow>
    );

    await user.click(screen.getByRole('button', { name: 'Copy Email' }));

    expect(onCopy).toHaveBeenCalledWith('ada@example.com');
  });

  it('changes the copy icon after copying and reverts after 2000ms', async () => {
    vi.useFakeTimers();

    mockClipboard();

    renderStandaloneRow(
      <KeyValueRow label="Email" copyable>
        ada@example.com
      </KeyValueRow>
    );

    const button = screen.getByRole('button', { name: 'Copy Email' });
    const beforeCopy = button.innerHTML;

    await act(async () => {
      button.click();
    });

    expect(button.innerHTML).not.toBe(beforeCopy);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(button.innerHTML).toBe(beforeCopy);
  });

  it('renders an empty live region initially', () => {
    renderStandaloneRow(
      <KeyValueRow label="Email" copyable>
        ada@example.com
      </KeyValueRow>
    );

    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('announces Copied! in the live region after a successful copy', async () => {
    mockClipboard();
    const user = userEvent.setup();

    renderStandaloneRow(
      <KeyValueRow label="Email" copyable>
        ada@example.com
      </KeyValueRow>
    );

    await user.click(screen.getByRole('button', { name: 'Copy Email' }));

    expect(screen.getByRole('status')).toHaveTextContent('Copied!');
  });

  it('falls back to document.execCommand when clipboard API is unavailable', async () => {
    const user = userEvent.setup();
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn(() => true),
    });
    const execCommand = vi.mocked(document.execCommand);

    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    renderStandaloneRow(
      <KeyValueRow label="Email" copyable>
        ada@example.com
      </KeyValueRow>
    );

    await user.click(screen.getByRole('button', { name: 'Copy Email' }));

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(screen.getByRole('status')).toHaveTextContent('Copied!');
  });

  it('copy button receives Tab focus when copyable is true', async () => {
    const user = userEvent.setup();

    renderStandaloneRow(
      <KeyValueRow label="Email" copyable>
        ada@example.com
      </KeyValueRow>
    );

    await user.tab();

    expect(screen.getByRole('button', { name: 'Copy Email' })).toHaveFocus();
  });

  it('copy button activates on Enter', async () => {
    const writeText = mockClipboard();
    const user = userEvent.setup();

    renderStandaloneRow(
      <KeyValueRow label="Email" copyable>
        ada@example.com
      </KeyValueRow>
    );

    await user.tab();
    await user.keyboard('{Enter}');

    expect(writeText).toHaveBeenCalledWith('ada@example.com');
  });

  it('copy button activates on Space', async () => {
    const writeText = mockClipboard();
    const user = userEvent.setup();

    renderStandaloneRow(
      <KeyValueRow label="Email" copyable>
        ada@example.com
      </KeyValueRow>
    );

    await user.tab();
    await user.keyboard(' ');

    expect(writeText).toHaveBeenCalledWith('ada@example.com');
  });

  it('uses the required focus outline styling and dds-prefixed layout variable', () => {
    const stylesheet = readFileSync('src/components/KeyValueRow/KeyValueRow.module.scss', 'utf8');

    expect(stylesheet).toContain('--dds-key-value-row-label-width');
    expect(stylesheet).not.toContain('--kv-label-width');
    expect(stylesheet).toContain('&:focus-visible');
    expect(stylesheet).toContain(
      'outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5);'
    );
    expect(stylesheet).not.toContain('.storyA11yScope');
  });

  it('axe: passes for the default inline list', async () => {
    const { container } = render(
      <KeyValueList>
        <KeyValueRow label="Email">ada@example.com</KeyValueRow>
      </KeyValueList>
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes for stacked layout', async () => {
    const { container } = render(
      <KeyValueList layout="stacked">
        <KeyValueRow label="Email">ada@example.com</KeyValueRow>
      </KeyValueList>
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes with dividers', async () => {
    const { container } = render(
      <KeyValueList dividers>
        <KeyValueRow label="Email">ada@example.com</KeyValueRow>
        <KeyValueRow label="Status">Active</KeyValueRow>
      </KeyValueList>
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes with copyable rows', async () => {
    const { container } = render(
      <KeyValueList>
        <KeyValueRow label="Email" copyable>
          ada@example.com
        </KeyValueRow>
      </KeyValueList>
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes after copy', async () => {
    mockClipboard();
    const user = userEvent.setup();
    const { container } = render(
      <KeyValueList>
        <KeyValueRow label="Email" copyable>
          ada@example.com
        </KeyValueRow>
      </KeyValueList>
    );

    await user.click(screen.getByRole('button', { name: 'Copy Email' }));

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes for size sm', async () => {
    const { container } = render(
      <KeyValueList size="sm">
        <KeyValueRow label="Email">ada@example.com</KeyValueRow>
      </KeyValueList>
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});

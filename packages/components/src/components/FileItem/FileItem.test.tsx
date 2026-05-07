import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './FileItem.module.scss';
import { FileItem, type FileItemStatus } from './FileItem';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  fileItem: getRequiredClassName(styles, 'fileItem'),
  statusIcon: getRequiredClassName(styles, 'statusIcon'),
  iconUploading: getRequiredClassName(styles, 'iconUploading'),
  progressFill: getRequiredClassName(styles, 'progressFill'),
  progressFillPaused: getRequiredClassName(styles, 'progressFillPaused'),
  removeButton: getRequiredClassName(styles, 'removeButton'),
  statusLabel: getRequiredClassName(styles, 'statusLabel'),
  srOnly: getRequiredClassName(styles, 'srOnly'),
} as const;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('FileItem', () => {
  it('renders file name', () => {
    render(<FileItem name="report.pdf" />);

    expect(screen.getByText('report.pdf')).toBeInTheDocument();
  });

  it('renders formatted file size when size provided', () => {
    render(<FileItem name="report.pdf" size={1258291} />);

    expect(screen.getByText('1.2 MB')).toBeInTheDocument();
  });

  it.each([
    ['idle', 'lucide-file'],
    ['waiting', 'lucide-clock'],
    ['uploading', 'lucide-refresh-cw'],
    ['paused', 'lucide-circle-pause'],
    ['complete', 'lucide-circle-check'],
    ['error', 'lucide-circle-alert'],
  ] satisfies Array<[FileItemStatus, string]>)(
    'renders correct icon for %s status',
    (status, iconClass) => {
      const { container } = render(
        <FileItem name="report.pdf" status={status} error="File too large" progress={45} />
      );

      expect(container.querySelector(`.${classNames.statusIcon} svg`)).toHaveClass(iconClass);
    }
  );

  it('all icons are aria-hidden', () => {
    const { container } = render(<FileItem name="report.pdf" status="waiting" />);

    expect(container.querySelector(`.${classNames.statusIcon}`)).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('renders progress bar when status is uploading', () => {
    render(<FileItem name="report.pdf" status="uploading" progress={45} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders progress bar when status is paused', () => {
    render(<FileItem name="report.pdf" status="paused" progress={60} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('does not render progress bar when status is idle', () => {
    render(<FileItem name="report.pdf" status="idle" progress={45} />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('does not render progress bar when status is complete', () => {
    render(<FileItem name="report.pdf" status="complete" progress={45} />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('progress bar fill width matches progress prop', () => {
    const { container } = render(<FileItem name="report.pdf" status="uploading" progress={45} />);

    expect(container.querySelector(`.${classNames.progressFill}`)).toHaveStyle({ width: '45%' });
  });

  it('renders percentage label when uploading', () => {
    render(<FileItem name="report.pdf" status="uploading" progress={45} />);

    expect(screen.getByText('45% complete')).toBeInTheDocument();
  });

  it('renders percentage label when paused', () => {
    render(<FileItem name="report.pdf" status="paused" progress={60} />);

    expect(screen.getByText('60% complete')).toBeInTheDocument();
  });

  it('renders waiting label', () => {
    render(<FileItem name="report.pdf" status="waiting" />);

    expect(screen.getByText('Waiting…')).toBeInTheDocument();
  });

  it('renders error message when status is error', () => {
    render(<FileItem name="report.pdf" status="error" error="Network timeout" />);

    expect(screen.getByText('Network timeout')).toBeInTheDocument();
  });

  it('does not render status label when status is idle', () => {
    const { container } = render(<FileItem name="report.pdf" status="idle" />);

    expect(container.querySelector(`.${classNames.statusLabel}`)).not.toBeInTheDocument();
  });

  it('does not render status label when status is complete', () => {
    const { container } = render(<FileItem name="report.pdf" status="complete" />);

    expect(container.querySelector(`.${classNames.statusLabel}`)).not.toBeInTheDocument();
  });

  it('renders remove button when onRemove provided', () => {
    render(<FileItem name="report.pdf" onRemove={() => undefined} />);

    expect(screen.getByRole('button', { name: 'Remove report.pdf' })).toBeInTheDocument();
  });

  it('does not render remove button when onRemove omitted', () => {
    render(<FileItem name="report.pdf" />);

    expect(screen.queryByRole('button', { name: 'Remove report.pdf' })).not.toBeInTheDocument();
  });

  it('remove button aria-label includes filename', () => {
    render(<FileItem name="report.pdf" onRemove={() => undefined} />);

    expect(screen.getByRole('button', { name: 'Remove report.pdf' })).toHaveClass(
      classNames.removeButton
    );
  });

  it('renders filename as link when downloadUrl provided', () => {
    render(<FileItem name="report.pdf" downloadUrl="/downloads/report.pdf" />);

    expect(screen.getByRole('link', { name: 'report.pdf' })).toBeInTheDocument();
  });

  it('renders filename as span when no downloadUrl', () => {
    render(<FileItem name="report.pdf" />);

    expect(screen.getByText('report.pdf').tagName).toBe('SPAN');
  });

  it('progress bar has accessible attributes', () => {
    render(<FileItem name="report.pdf" status="uploading" progress={45} />);

    const progressbar = screen.getByRole('progressbar', { name: 'report.pdf upload progress' });
    expect(progressbar).toHaveAttribute('aria-valuenow', '45');
    expect(progressbar).toHaveAttribute('aria-valuetext', '45% complete');
  });

  it('spinning animation class applied when uploading', () => {
    const { container } = render(<FileItem name="report.pdf" status="uploading" progress={45} />);

    expect(container.querySelector(`.${classNames.statusIcon}`)).toHaveClass(
      classNames.iconUploading
    );
  });

  it('spinning animation class not applied for other statuses', () => {
    const { container } = render(<FileItem name="report.pdf" status="waiting" />);

    expect(container.querySelector(`.${classNames.statusIcon}`)).not.toHaveClass(
      classNames.iconUploading
    );
  });

  it('paused progress fill applies paused class', () => {
    const { container } = render(<FileItem name="report.pdf" status="paused" progress={60} />);

    expect(container.querySelector(`.${classNames.progressFill}`)).toHaveClass(
      classNames.progressFillPaused
    );
  });

  it('sr-only live region announces upload complete when status changes to complete', () => {
    const { rerender } = render(<FileItem name="report.pdf" status="uploading" progress={45} />);

    rerender(<FileItem name="report.pdf" status="complete" />);

    expect(screen.getByText('report.pdf upload complete')).toHaveClass(classNames.srOnly);
  });

  it('sr-only live region announces upload failed when status changes to error', () => {
    const { rerender } = render(<FileItem name="report.pdf" status="uploading" progress={45} />);

    rerender(<FileItem name="report.pdf" status="error" error="File too large" />);

    expect(screen.getByText('report.pdf upload failed: File too large')).toHaveClass(
      classNames.srOnly
    );
  });

  it('forwards className to root', () => {
    const { container } = render(<FileItem name="report.pdf" className="custom" />);

    expect(container.firstElementChild).toHaveClass(classNames.fileItem, 'custom');
  });

  it('forwards ref to root element', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<FileItem ref={ref} name="report.pdf" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('axe: status idle', async () => {
    const { container } = render(<FileItem name="report.pdf" size={1024} />);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: status waiting', async () => {
    const { container } = render(<FileItem name="report.pdf" size={1024} status="waiting" />);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: status uploading', async () => {
    const { container } = render(
      <FileItem name="report.pdf" size={1024} status="uploading" progress={45} />
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: status paused', async () => {
    const { container } = render(
      <FileItem name="report.pdf" size={1024} status="paused" progress={60} />
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: status complete', async () => {
    const { container } = render(<FileItem name="report.pdf" size={1024} status="complete" />);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: status error', async () => {
    const { container } = render(
      <FileItem name="report.pdf" size={1024} status="error" error="File too large" />
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: with downloadUrl', async () => {
    const { container } = render(
      <FileItem name="report.pdf" size={1024} downloadUrl="/downloads/report.pdf" />
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: without onRemove', async () => {
    const { container } = render(<FileItem name="report.pdf" size={1024} />);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});

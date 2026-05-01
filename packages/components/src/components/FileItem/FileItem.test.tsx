import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './FileItem.module.scss';
import { FileItem } from './FileItem';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  idle: getRequiredClassName(styles, 'idle'),
  uploading: getRequiredClassName(styles, 'uploading'),
  complete: getRequiredClassName(styles, 'complete'),
  error: getRequiredClassName(styles, 'error'),
  clickable: getRequiredClassName(styles, 'clickable'),
  fileIcon: getRequiredClassName(styles, 'fileIcon'),
  fileIconText: getRequiredClassName(styles, 'fileIconText'),
  typePdf: getRequiredClassName(styles, 'typePdf'),
  typeImage: getRequiredClassName(styles, 'typeImage'),
  typeCode: getRequiredClassName(styles, 'typeCode'),
  typeArchive: getRequiredClassName(styles, 'typeArchive'),
  typeUnknown: getRequiredClassName(styles, 'typeUnknown'),
  progressFill: getRequiredClassName(styles, 'progressFill'),
  errorMessage: getRequiredClassName(styles, 'errorMessage'),
  statusIcon: getRequiredClassName(styles, 'statusIcon'),
  removeBtn: getRequiredClassName(styles, 'removeBtn'),
  nameLink: getRequiredClassName(styles, 'nameLink'),
} as const;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('FileItem', () => {
  it('renders the filename', () => {
    render(<FileItem name="report.pdf" />);

    expect(screen.getByText('report.pdf')).toBeInTheDocument();
  });

  it('renders FileTypeIcon', () => {
    const { container } = render(<FileItem name="report.pdf" />);

    expect(container.querySelector(`.${classNames.fileIcon}`)).toBeInTheDocument();
  });

  it('forwards className to root', () => {
    const { container } = render(<FileItem name="report.pdf" className="custom" />);

    expect(container.firstElementChild).toHaveClass('custom');
  });

  it('forwards ref to root HTMLDivElement', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<FileItem ref={ref} name="report.pdf" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders formatted file size when size provided', () => {
    render(<FileItem name="report.pdf" size={245 * 1024} />);

    expect(screen.getByText('245 KB')).toBeInTheDocument();
  });

  it('does not render size when size omitted', () => {
    render(<FileItem name="report.pdf" />);

    expect(screen.queryByText(/KB|MB|GB| B/)).not.toBeInTheDocument();
  });

  it('formats bytes correctly: 1024 -> 1 KB', () => {
    render(<FileItem name="report.pdf" size={1024} />);

    expect(screen.getByText('1 KB')).toBeInTheDocument();
  });

  it('formats MB values correctly', () => {
    render(<FileItem name="report.pdf" size={1024 * 1024} />);

    expect(screen.getByText('1 MB')).toBeInTheDocument();
  });

  it('formats sub-KB values correctly', () => {
    render(<FileItem name="report.pdf" size={512} />);

    expect(screen.getByText('512 B')).toBeInTheDocument();
  });

  it('icon has correct type class for pdf files', () => {
    const { container } = render(<FileItem name="report.pdf" />);

    expect(container.querySelector(`.${classNames.fileIcon}`)).toHaveClass(classNames.typePdf);
  });

  it('icon has correct type class for png files', () => {
    const { container } = render(<FileItem name="preview.png" />);

    expect(container.querySelector(`.${classNames.fileIcon}`)).toHaveClass(classNames.typeImage);
  });

  it('icon has correct type class for ts files', () => {
    const { container } = render(<FileItem name="index.ts" />);

    expect(container.querySelector(`.${classNames.fileIcon}`)).toHaveClass(classNames.typeCode);
  });

  it('icon has correct type class for zip files', () => {
    const { container } = render(<FileItem name="bundle.zip" />);

    expect(container.querySelector(`.${classNames.fileIcon}`)).toHaveClass(classNames.typeArchive);
  });

  it('icon has typeUnknown class for unknown extensions', () => {
    const { container } = render(<FileItem name="notes.foobar" />);

    expect(container.querySelector(`.${classNames.fileIcon}`)).toHaveClass(classNames.typeUnknown);
  });

  it('extension text is uppercase and capped at 4 chars', () => {
    const { container } = render(<FileItem name="notes.markdown" />);

    expect(container.querySelector(`.${classNames.fileIconText}`)).toHaveTextContent('MARK');
  });

  it('file icon is aria-hidden', () => {
    const { container } = render(<FileItem name="report.pdf" />);

    expect(container.querySelector(`.${classNames.fileIcon}`)).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('applies .idle class by default', () => {
    const { container } = render(<FileItem name="report.pdf" />);

    expect(container.firstElementChild).toHaveClass(classNames.idle);
  });

  it('applies .uploading class when status is uploading', () => {
    const { container } = render(<FileItem name="report.pdf" status="uploading" progress={62} />);

    expect(container.firstElementChild).toHaveClass(classNames.uploading);
  });

  it('applies .complete class when status is complete', () => {
    const { container } = render(<FileItem name="report.pdf" status="complete" />);

    expect(container.firstElementChild).toHaveClass(classNames.complete);
  });

  it('applies .error class when status is error', () => {
    const { container } = render(
      <FileItem name="report.pdf" status="error" errorMessage="Upload failed." />
    );

    expect(container.firstElementChild).toHaveClass(classNames.error);
  });

  it('does not render the progress bar when status is not uploading', () => {
    render(<FileItem name="report.pdf" progress={62} />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders the progress bar when status is uploading and progress is provided', () => {
    render(<FileItem name="report.pdf" status="uploading" progress={62} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('progress bar exposes the expected accessible attributes', () => {
    render(<FileItem name="report.pdf" status="uploading" progress={62} />);

    expect(screen.getByRole('progressbar', { name: 'Uploading report.pdf' })).toHaveAttribute(
      'aria-valuenow',
      '62'
    );
  });

  it('progress fill uses the matching inline width style', () => {
    const { container } = render(<FileItem name="report.pdf" status="uploading" progress={62} />);

    expect(container.querySelector(`.${classNames.progressFill}`)).toHaveStyle({ width: '62%' });
  });

  it('does not render an error message when status is not error', () => {
    render(<FileItem name="report.pdf" errorMessage="Upload failed." />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not render an error message when errorMessage is omitted', () => {
    render(<FileItem name="report.pdf" status="error" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders an alert error message when status is error and errorMessage is provided', () => {
    render(<FileItem name="report.pdf" status="error" errorMessage="Upload failed." />);

    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed.');
  });

  it('renders a check icon when status is complete', () => {
    const { container } = render(<FileItem name="report.pdf" status="complete" />);

    expect(container.querySelector(`.${classNames.statusIcon} svg`)).toHaveClass(
      'lucide-circle-check-big'
    );
  });

  it('renders a spinner when status is uploading', () => {
    render(<FileItem name="report.pdf" status="uploading" progress={62} />);

    expect(screen.getByRole('status', { name: 'Uploading report.pdf' })).toBeInTheDocument();
  });

  it('renders an alert icon when status is error', () => {
    const { container } = render(
      <FileItem name="report.pdf" status="error" errorMessage="Upload failed." />
    );

    expect(container.querySelector(`.${classNames.statusIcon} svg`)).toHaveClass(
      'lucide-circle-alert'
    );
  });

  it('renders no status icon when status is idle', () => {
    const { container } = render(<FileItem name="report.pdf" />);

    expect(container.querySelector(`.${classNames.statusIcon}`)).not.toBeInTheDocument();
  });

  it('does not render a remove button by default', () => {
    render(<FileItem name="report.pdf" />);

    expect(screen.queryByRole('button', { name: 'Remove report.pdf' })).not.toBeInTheDocument();
  });

  it('renders a remove button when removable is true', () => {
    render(<FileItem name="report.pdf" removable />);

    expect(screen.getByRole('button', { name: 'Remove report.pdf' })).toBeInTheDocument();
  });

  it('clicking the remove button calls onRemove without triggering root onClick', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onClick = vi.fn();

    render(<FileItem name="report.pdf" removable onRemove={onRemove} onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Remove report.pdf' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders filename as span when no downloadUrl is provided', () => {
    render(<FileItem name="report.pdf" />);

    expect(screen.getByText('report.pdf').tagName).toBe('SPAN');
  });

  it('renders filename as a download link when downloadUrl is provided', () => {
    render(<FileItem name="report.pdf" downloadUrl="/downloads/report.pdf" />);

    expect(screen.getByRole('link', { name: 'report.pdf' })).toHaveClass(classNames.nameLink);
  });

  it('download link forwards href and download attributes', () => {
    render(<FileItem name="report.pdf" downloadUrl="/downloads/report.pdf" />);

    expect(screen.getByRole('link', { name: 'report.pdf' })).toHaveAttribute(
      'href',
      '/downloads/report.pdf'
    );
    expect(screen.getByRole('link', { name: 'report.pdf' })).toHaveAttribute(
      'download',
      'report.pdf'
    );
  });

  it('download link click does not trigger root onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<FileItem name="report.pdf" downloadUrl="/downloads/report.pdf" onClick={onClick} />);

    await user.click(screen.getByRole('link', { name: 'report.pdf' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('sets role button and tabIndex when onClick is provided', () => {
    render(<FileItem name="report.pdf" onClick={() => undefined} />);

    const root = screen.getByRole('button', { name: 'report.pdf' });
    expect(root).toHaveAttribute('tabindex', '0');
    expect(root).toHaveClass(classNames.clickable);
  });

  it('does not set role button when onClick is not provided', () => {
    const { container } = render(<FileItem name="report.pdf" />);

    expect(container.firstElementChild).not.toHaveAttribute('role');
  });

  it('clicking the root calls onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<FileItem name="report.pdf" onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'report.pdf' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Enter key calls onClick when the root has focus', () => {
    const onClick = vi.fn();

    render(<FileItem name="report.pdf" onClick={onClick} />);

    fireEvent.keyDown(screen.getByRole('button', { name: 'report.pdf' }), { key: 'Enter' });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Space key calls onClick when the root has focus', () => {
    const onClick = vi.fn();

    render(<FileItem name="report.pdf" onClick={onClick} />);

    fireEvent.keyDown(screen.getByRole('button', { name: 'report.pdf' }), { key: ' ' });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('axe: passes in idle state', async () => {
    const { container } = render(<FileItem name="report.pdf" size={1024} />);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes in uploading state', async () => {
    const { container } = render(
      <FileItem name="report.pdf" size={1024} status="uploading" progress={62} />
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes in complete state', async () => {
    const { container } = render(<FileItem name="report.pdf" size={1024} status="complete" />);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes in error state', async () => {
    const { container } = render(
      <FileItem name="report.pdf" size={1024} status="error" errorMessage="Upload failed." />
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes when removable', async () => {
    const { container } = render(
      <FileItem name="report.pdf" size={1024} removable onRemove={() => undefined} />
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes with downloadUrl', async () => {
    const { container } = render(
      <FileItem name="report.pdf" size={1024} downloadUrl="/downloads/report.pdf" />
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: passes when clickable', async () => {
    const { container } = render(
      <FileItem name="report.pdf" size={1024} onClick={() => undefined} />
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});

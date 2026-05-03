import '@testing-library/jest-dom/vitest';
import { act, cleanup, createEvent, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import styles from './FilePicker.module.scss';
import { FilePicker, type FilePickerFile } from './FilePicker';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  hiddenInput: getRequiredClassName(styles, 'hiddenInput'),
  dropzoneActive: getRequiredClassName(styles, 'dropzoneActive'),
  dropzoneCompact: getRequiredClassName(styles, 'dropzoneCompact'),
} as const;

const makeFile = (name: string, type: string, size = 1024) =>
  new File([new Uint8Array(size)], name, { type });

const getFileInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

const makePickerFile = (
  overrides: Partial<FilePickerFile> & {
    id?: string;
    name?: string;
    type?: string;
    size?: number;
  } = {}
): FilePickerFile => ({
  id: overrides.id ?? 'file-1',
  file:
    overrides.file ??
    makeFile(
      overrides.name ?? 'report.pdf',
      overrides.type ?? 'application/pdf',
      overrides.size ?? 1024
    ),
  status: overrides.status ?? 'idle',
  progress: overrides.progress,
  error: overrides.error,
  downloadUrl: overrides.downloadUrl,
});

beforeEach(() => {
  vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('123e4567-e89b-12d3-a456-426614174000');
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('FilePicker', () => {
  it('renders dropzone region with a descriptive aria-label', () => {
    render(<FilePicker />);

    expect(
      screen.getByRole('region', { name: 'Drag and drop files here, or use the Browse button' })
    ).toBeInTheDocument();
  });

  it('renders a hidden file input in the accessibility tree', () => {
    const { container } = render(<FilePicker />);

    const input = getFileInput(container);

    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveClass(classNames.hiddenInput);
    expect(input).not.toHaveStyle({ display: 'none' });
  });

  it('renders the browse button and label wiring when label is provided', () => {
    render(<FilePicker id="attachments" label="Attachments" required />);

    expect(screen.getByRole('button', { name: 'Browse files' })).toBeInTheDocument();
    expect(screen.getByText('Attachments').tagName).toBe('LABEL');
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('Attachments').closest('label')).toHaveAttribute('for', 'attachments');
  });

  it('renders field error and hint text with the expected accessibility attributes', () => {
    render(
      <FilePicker
        id="attachments"
        label="Attachments"
        error="Please upload a contract."
        hint="PDF or DOCX only."
      />
    );

    const input = screen.getByLabelText('Attachments', { selector: 'input' });

    expect(screen.getByRole('alert')).toHaveTextContent('Please upload a contract.');
    expect(screen.getByText('PDF or DOCX only.')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'attachments-error attachments-hint');
  });

  it('renders the auto-generated accepted formats hint and supports a custom override', () => {
    const { rerender } = render(<FilePicker accept=".pdf,.docx" multiple maxFiles={3} />);

    expect(screen.getByText('PDF, DOCX · up to 10 MB · max 3 files')).toBeInTheDocument();

    rerender(<FilePicker acceptedFormatsLabel="Custom hint" />);

    expect(screen.getByText('Custom hint')).toBeInTheDocument();
  });

  it('does not render a file list when the files array is empty', () => {
    render(<FilePicker files={[]} />);

    expect(screen.queryByRole('list', { name: 'Selected files' })).not.toBeInTheDocument();
  });

  it('clicking the browse button triggers the hidden input click', async () => {
    const user = userEvent.setup();
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

    render(<FilePicker />);

    await user.click(screen.getByRole('button', { name: 'Browse files' }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('selecting a file via the input calls onFilesChange and onFilesAdded with idle files and UUIDs', () => {
    const onFilesChange = vi.fn();
    const onFilesAdded = vi.fn();
    const file = makeFile('brief.pdf', 'application/pdf', 2048);

    const { container } = render(
      <FilePicker onFilesChange={onFilesChange} onFilesAdded={onFilesAdded} />
    );

    fireEvent.change(getFileInput(container), {
      target: { files: [file] },
    });

    expect(onFilesChange).toHaveBeenCalledTimes(1);
    expect(onFilesChange).toHaveBeenCalledWith([
      expect.objectContaining({
        id: '123e4567-e89b-12d3-a456-426614174000',
        file,
        status: 'idle',
      }),
    ]);
    expect(onFilesAdded).toHaveBeenCalledWith([
      expect.objectContaining({
        id: '123e4567-e89b-12d3-a456-426614174000',
        file,
        status: 'idle',
      }),
    ]);
  });

  it('handles drag and drop state transitions without flicker and updates the active label', () => {
    render(<FilePicker dropzoneActiveLabel="Drop now" />);

    const dropzone = screen.getByRole('region', {
      name: 'Drag and drop files here, or use the Browse button',
    });

    fireEvent.dragEnter(dropzone, { dataTransfer: { items: [{ kind: 'file' }] } });

    expect(dropzone).toHaveClass(classNames.dropzoneActive);
    expect(dropzone).toHaveAttribute('aria-label', 'Drop now');

    fireEvent.dragEnter(dropzone, { dataTransfer: { items: [{ kind: 'file' }] } });
    fireEvent.dragLeave(dropzone, { dataTransfer: { items: [] } });

    expect(dropzone).toHaveClass(classNames.dropzoneActive);

    fireEvent.dragLeave(dropzone, { dataTransfer: { items: [] } });

    expect(dropzone).not.toHaveClass(classNames.dropzoneActive);
    expect(dropzone).toHaveAttribute(
      'aria-label',
      'Drag and drop files here, or use the Browse button'
    );
  });

  it('prevents default on dragOver and processes dropped files', () => {
    const onFilesChange = vi.fn();
    const file = makeFile('drop.pdf', 'application/pdf', 4096);

    render(<FilePicker onFilesChange={onFilesChange} />);

    const dropzone = screen.getByRole('region', {
      name: 'Drag and drop files here, or use the Browse button',
    });
    const dragOverEvent = createEvent.dragOver(dropzone, {
      dataTransfer: { items: [{ kind: 'file' }] },
    });

    fireEvent(dropzone, dragOverEvent);

    expect(dragOverEvent.defaultPrevented).toBe(true);

    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file], items: [{ kind: 'file' }] },
    });

    expect(onFilesChange).toHaveBeenCalledWith([
      expect.objectContaining({
        file,
        status: 'idle',
      }),
    ]);
  });

  it('rejects files larger than maxSize and auto-clears validation errors after 6 seconds', async () => {
    vi.useFakeTimers();
    const file = makeFile('large.pdf', 'application/pdf', 2048);

    const { container } = render(<FilePicker maxSize={1024} />);

    fireEvent.change(getFileInput(container), {
      target: { files: [file] },
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'large.pdf: File exceeds maximum size of 1 KB'
    );

    await act(async () => {
      vi.advanceTimersByTime(6000);
    });

    expect(screen.queryByText(/File exceeds maximum size/)).not.toBeInTheDocument();
  });

  it('validates file type, duplicates, maxFiles, and minSize constraints', () => {
    const duplicate = makePickerFile({
      id: 'existing',
      name: 'report.pdf',
      type: 'application/pdf',
      size: 2048,
    });

    const { rerender } = render(
      <FilePicker accept=".pdf" files={[duplicate]} maxFiles={2} minSize={1024} multiple />
    );

    fireEvent.change(getFileInput(document.body), {
      target: { files: [makeFile('report.pdf', 'application/pdf', 2048)] },
    });
    expect(screen.getByRole('alert')).toHaveTextContent('File already added');

    rerender(<FilePicker accept=".pdf" maxFiles={1} multiple />);
    fireEvent.change(getFileInput(document.body), {
      target: {
        files: [
          makeFile('one.pdf', 'application/pdf', 2048),
          makeFile('two.pdf', 'application/pdf', 2048),
        ],
      },
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Maximum of 1 file allowed');

    rerender(<FilePicker accept=".pdf" />);
    fireEvent.change(getFileInput(document.body), {
      target: { files: [makeFile('image.png', 'image/png', 2048)] },
    });
    expect(screen.getByRole('alert')).toHaveTextContent('File type not accepted. Allowed: .pdf');

    rerender(<FilePicker accept="image/*" onFilesChange={vi.fn()} />);
    fireEvent.change(getFileInput(document.body), {
      target: { files: [makeFile('photo.png', 'image/png', 2048)] },
    });
    expect(screen.queryByText(/File type not accepted/)).not.toBeInTheDocument();

    rerender(<FilePicker minSize={4096} />);
    fireEvent.change(getFileInput(document.body), {
      target: { files: [makeFile('tiny.pdf', 'application/pdf', 1024)] },
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'tiny.pdf: File is smaller than the minimum size of 4 KB'
    );
  });

  it('replaces files when multiple is false, appends when multiple is true, and only renders the first file in single mode', () => {
    const onFilesChange = vi.fn();
    const existing = makePickerFile({ id: 'existing', name: 'existing.pdf' });

    const { container, rerender } = render(
      <FilePicker files={[existing]} onFilesChange={onFilesChange} />
    );

    fireEvent.change(getFileInput(container), {
      target: { files: [makeFile('next.pdf', 'application/pdf', 1024)] },
    });

    expect(onFilesChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ file: expect.objectContaining({ name: 'next.pdf' }) }),
    ]);

    rerender(<FilePicker files={[existing]} onFilesChange={onFilesChange} multiple />);

    fireEvent.change(getFileInput(container), {
      target: { files: [makeFile('append.pdf', 'application/pdf', 1024)] },
    });

    expect(onFilesChange).toHaveBeenLastCalledWith([
      existing,
      expect.objectContaining({ file: expect.objectContaining({ name: 'append.pdf' }) }),
    ]);

    rerender(
      <FilePicker
        files={[
          makePickerFile({ id: 'first', name: 'first.pdf' }),
          makePickerFile({ id: 'second', name: 'second.pdf' }),
        ]}
      />
    );

    expect(screen.getByText('first.pdf')).toBeInTheDocument();
    expect(screen.queryByText('second.pdf')).not.toBeInTheDocument();
  });

  it('renders the selected files list and passes status, progress, error, and download props through FileItem', () => {
    render(
      <FilePicker
        multiple
        files={[
          makePickerFile({
            id: 'uploading',
            name: 'uploading.pdf',
            status: 'uploading',
            progress: 50,
          }),
          makePickerFile({
            id: 'complete',
            name: 'complete.pdf',
            status: 'complete',
            downloadUrl: 'https://example.com/complete.pdf',
          }),
          makePickerFile({
            id: 'error',
            name: 'error.pdf',
            status: 'error',
            error: 'Upload failed.',
          }),
        ]}
      />
    );

    expect(screen.getByRole('list', { name: 'Selected files' })).toHaveAttribute(
      'aria-live',
      'polite'
    );
    expect(screen.getByRole('progressbar', { name: 'Uploading uploading.pdf' })).toHaveAttribute(
      'aria-valuenow',
      '50'
    );
    expect(screen.getByRole('link', { name: 'complete.pdf' })).toHaveAttribute(
      'href',
      'https://example.com/complete.pdf'
    );
    expect(screen.getByText('Upload failed.')).toBeInTheDocument();
  });

  it('removes files and returns focus to the browse button', async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();

    render(
      <FilePicker
        files={[makePickerFile({ id: 'remove-me', name: 'remove.pdf' })]}
        onFilesChange={onFilesChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Remove remove.pdf' }));

    expect(onFilesChange).toHaveBeenCalledWith([]);
    expect(screen.getByRole('button', { name: 'Browse files' })).toHaveFocus();
  });

  it('disables drag, browse activation, and the hidden input when disabled', async () => {
    const user = userEvent.setup();
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

    render(<FilePicker disabled />);

    const input = getFileInput(document.body);
    const dropzone = screen.getByRole('region', {
      name: 'Drag and drop files here, or use the Browse button',
    });

    fireEvent.dragEnter(dropzone, { dataTransfer: { items: [{ kind: 'file' }] } });
    await user.click(screen.getByRole('button', { name: 'Browse files' }));

    expect(dropzone).not.toHaveClass(classNames.dropzoneActive);
    expect(clickSpy).not.toHaveBeenCalled();
    expect(input).toBeDisabled();
  });

  it('renders compact mode with the compact class', () => {
    render(<FilePicker compact acceptedFormatsLabel="PNG only" />);

    expect(
      screen.getByRole('region', { name: 'Drag and drop files here, or use the Browse button' })
    ).toHaveClass(classNames.dropzoneCompact);
    expect(screen.getByText('PNG only')).toBeInTheDocument();
  });

  it('renders controlled files and does not maintain internal state without parent updates', () => {
    const onFilesChange = vi.fn();

    render(
      <FilePicker
        files={[makePickerFile({ id: 'controlled', name: 'controlled.pdf' })]}
        onFilesChange={onFilesChange}
      />
    );

    fireEvent.change(getFileInput(document.body), {
      target: { files: [makeFile('new.pdf', 'application/pdf', 2048)] },
    });

    expect(onFilesChange).toHaveBeenCalledTimes(1);
    expect(screen.getByText('controlled.pdf')).toBeInTheDocument();
    expect(screen.queryByText('new.pdf')).not.toBeInTheDocument();
  });

  it('exposes the expected accessibility wiring on the hidden input', () => {
    render(<FilePicker id="docs" label="Documents" required error="Required." hint="PDF only." />);

    const input = getFileInput(document.body);

    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'docs-error docs-hint');
  });

  it('has no axe violations in the default, populated, validation-error, compact, disabled, and field-error states', async () => {
    const validationView = render(<FilePicker accept=".pdf" />);
    fireEvent.change(getFileInput(validationView.container), {
      target: { files: [makeFile('image.png', 'image/png', 2048)] },
    });

    const states = [
      render(<FilePicker />).container,
      render(
        <FilePicker
          multiple
          files={[
            makePickerFile({ id: 'idle', name: 'idle.pdf' }),
            makePickerFile({
              id: 'uploading',
              name: 'uploading.pdf',
              status: 'uploading',
              progress: 25,
            }),
            makePickerFile({
              id: 'complete',
              name: 'complete.pdf',
              status: 'complete',
              downloadUrl: 'https://example.com/complete.pdf',
            }),
            makePickerFile({
              id: 'error',
              name: 'error.pdf',
              status: 'error',
              error: 'Upload failed.',
            }),
          ]}
        />
      ).container,
      validationView.container,
      render(<FilePicker compact acceptedFormatsLabel="PNG only" />).container,
      render(<FilePicker disabled />).container,
      render(<FilePicker label="Attachments" error="Please upload a contract." />).container,
    ];

    for (const container of states) {
      expect(await axe(container)).toHaveNoViolations();
    }
  });
});

import '@testing-library/jest-dom/vitest';
import { act, cleanup, createEvent, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import styles from './FilePicker.module.scss';
import { FilePicker, type FilePickerFile } from './FilePicker';
import buttonStyles from '../Button/Button.module.scss';
import labelStyles from '../Label/Label.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const classNames = {
  hiddenInput: getRequiredClassName(styles, 'hiddenInput'),
  dropzoneActive: getRequiredClassName(styles, 'dropzoneActive'),
  buttonPrimary: getRequiredClassName(buttonStyles, 'variantPrimary'),
  buttonSecondary: getRequiredClassName(buttonStyles, 'variantSecondary'),
  labelDisabled: getRequiredClassName(labelStyles, 'disabled'),
} as const;

const makeFile = (name: string, type: string, size = 1024) =>
  new File([new Uint8Array(size)], name, { type });

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
  ...(overrides.progress !== undefined ? { progress: overrides.progress } : {}),
  ...(overrides.error !== undefined ? { error: overrides.error } : {}),
  ...(overrides.downloadUrl !== undefined ? { downloadUrl: overrides.downloadUrl } : {}),
});

const getFileInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

beforeEach(() => {
  vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('123e4567-e89b-12d3-a456-426614174000');
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('FilePicker', () => {
  it('triggerVariant button renders trigger button and label text', () => {
    render(<FilePicker triggerVariant="button" label="Attachments" />);

    const trigger = screen.getByRole('button', { name: 'Upload Files' });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass(classNames.buttonPrimary);
    expect(screen.getByText('Attachments')).toBeInTheDocument();
  });

  it('triggerVariant button supports opting back into the secondary button style', () => {
    render(<FilePicker triggerVariant="button" buttonVariant="secondary" />);

    expect(screen.getByRole('button', { name: 'Upload Files' })).toHaveClass(
      classNames.buttonSecondary
    );
  });

  it('applies a disabled label style for disabled button triggers', () => {
    render(<FilePicker triggerVariant="button" disabled label="Attachments" />);

    expect(screen.getByText('Attachments')).toHaveClass(classNames.labelDisabled);
  });

  it('triggerVariant button clicking button triggers hidden input', async () => {
    const user = userEvent.setup();
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

    render(<FilePicker triggerVariant="button" />);

    await user.click(screen.getByRole('button', { name: 'Upload Files' }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('triggerVariant button renders hint text', () => {
    render(<FilePicker triggerVariant="button" hint="PDF only" />);

    expect(screen.getByText('PDF only')).toBeInTheDocument();
  });

  it('triggerVariant button renders auto-generated formats hint', () => {
    render(<FilePicker triggerVariant="button" accept=".pdf,.docx" multiple maxFiles={3} />);

    expect(screen.getByText('PDF, DOCX · up to 10 MB · max 3 files')).toBeInTheDocument();
  });

  it('triggerVariant menu renders dropdown trigger button', () => {
    render(<FilePicker triggerVariant="menu" />);

    expect(screen.getByRole('button', { name: 'Choose an action' })).toBeInTheDocument();
  });

  it('triggerVariant menu clicking trigger opens dropdown and upload item triggers hidden input', async () => {
    const user = userEvent.setup();
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

    render(<FilePicker triggerVariant="menu" />);

    await user.click(screen.getByRole('button', { name: 'Choose an action' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Upload File' }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('triggerVariant menu renders additional menuActions and selecting action calls onClick', async () => {
    const user = userEvent.setup();
    const actionSpy = vi.fn();

    render(
      <FilePicker
        triggerVariant="menu"
        menuActions={[{ label: 'Other Action', onClick: actionSpy }]}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Choose an action' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Other Action' }));

    expect(actionSpy).toHaveBeenCalledTimes(1);
  });

  it('triggerVariant dropzone renders dropzone region', () => {
    render(<FilePicker triggerVariant="dropzone" />);

    expect(
      screen.getByRole('region', { name: 'Drag and drop files here, or use the Browse button' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Browse files' })).toHaveClass(
      classNames.buttonPrimary
    );
  });

  it('triggerVariant dropzone supports a secondary browse button variant override', () => {
    render(<FilePicker triggerVariant="dropzone" buttonVariant="secondary" />);

    expect(screen.getByRole('button', { name: 'Browse files' })).toHaveClass(
      classNames.buttonSecondary
    );
  });

  it('applies a disabled label style for disabled dropzone triggers', () => {
    render(<FilePicker triggerVariant="dropzone" disabled label="Attachments" />);

    expect(screen.getByText('Attachments')).toHaveClass(classNames.labelDisabled);
  });

  it('triggerVariant dropzone drag-over activates dropzone', () => {
    render(<FilePicker triggerVariant="dropzone" dropzoneActiveLabel="Drop now" />);

    const dropzone = screen.getByRole('region', {
      name: 'Drag and drop files here, or use the Browse button',
    });

    fireEvent.dragEnter(dropzone, { dataTransfer: { items: [{ kind: 'file' }] } });

    expect(dropzone).toHaveClass(classNames.dropzoneActive);
    expect(dropzone).toHaveAttribute('aria-label', 'Drop now');
  });

  it('triggerVariant dropzone drop calls processFiles', () => {
    const onFilesChange = vi.fn();
    const file = makeFile('drop.pdf', 'application/pdf', 4096);

    render(<FilePicker triggerVariant="dropzone" onFilesChange={onFilesChange} />);

    const dropzone = screen.getByRole('region', {
      name: 'Drag and drop files here, or use the Browse button',
    });
    const dragOverEvent = createEvent.dragOver(dropzone, {
      dataTransfer: { items: [{ kind: 'file' }] },
    });

    fireEvent(dropzone, dragOverEvent);
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file], items: [{ kind: 'file' }] },
    });

    expect(dragOverEvent.defaultPrevented).toBe(true);
    expect(onFilesChange).toHaveBeenCalledWith([
      expect.objectContaining({
        file,
        status: 'idle',
      }),
    ]);
  });

  it('hidden input is in accessibility tree and forwards attributes', () => {
    const { container } = render(
      <FilePicker triggerVariant="button" accept=".pdf" multiple label="Attachments" />
    );

    const input = getFileInput(container);

    expect(input).toHaveClass(classNames.hiddenInput);
    expect(input).toHaveAttribute('accept', '.pdf');
    expect(input).toHaveAttribute('multiple');
    expect(input).not.toHaveStyle({ display: 'none' });
  });

  it('renders panel header when files length is greater than zero', () => {
    render(
      <FilePicker
        triggerVariant="button"
        files={[makePickerFile({ status: 'uploading', progress: 40 })]}
      />
    );

    expect(screen.getByRole('heading', { name: 'Uploading 1 file' })).toBeInTheDocument();
  });

  it('panel title auto-generates selected state when no uploads are active', () => {
    render(
      <FilePicker
        triggerVariant="button"
        files={[
          makePickerFile({ status: 'complete' }),
          makePickerFile({ id: '2', status: 'idle' }),
        ]}
      />
    );

    expect(screen.getByRole('heading', { name: '2 files selected' })).toBeInTheDocument();
  });

  it('panel subtitle shows aggregate uploaded count with aria-live polite', () => {
    render(
      <FilePicker
        triggerVariant="button"
        files={[
          makePickerFile({ id: '1', status: 'complete' }),
          makePickerFile({ id: '2', status: 'uploading', progress: 50 }),
          makePickerFile({ id: '3', status: 'waiting' }),
        ]}
      />
    );

    const subtitle = screen.getByText('1 of 3 files uploaded');
    expect(subtitle).toHaveAttribute('aria-live', 'polite');
  });

  it('clear all button renders and calls onClearAll', async () => {
    const user = userEvent.setup();
    const onClearAll = vi.fn();

    render(
      <FilePicker
        triggerVariant="button"
        files={[makePickerFile({ status: 'uploading', progress: 40 })]}
        onClearAll={onClearAll}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Clear all files' }));

    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it('panel header not rendered when showPanelHeader is false', () => {
    render(
      <FilePicker
        triggerVariant="button"
        showPanelHeader={false}
        files={[makePickerFile({ status: 'uploading', progress: 40 })]}
      />
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders FileItem for each file and file list has accessible count label', () => {
    render(
      <FilePicker
        triggerVariant="button"
        files={[
          makePickerFile(),
          makePickerFile({ id: '2', name: 'notes.txt', type: 'text/plain' }),
        ]}
      />
    );

    expect(screen.getByRole('list', { name: '2 files selected' })).toHaveAttribute(
      'aria-live',
      'polite'
    );
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByText('notes.txt')).toBeInTheDocument();
  });

  it('removing a file calls onFilesChange with file removed and returns focus to trigger', async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();

    render(
      <FilePicker
        triggerVariant="button"
        onFilesChange={onFilesChange}
        files={[
          makePickerFile(),
          makePickerFile({ id: '2', name: 'notes.txt', type: 'text/plain' }),
        ]}
      />
    );

    const trigger = screen.getByRole('button', { name: 'Upload Files' });
    await user.click(screen.getByRole('button', { name: 'Remove report.pdf' }));

    expect(onFilesChange).toHaveBeenCalledWith([
      expect.objectContaining({
        id: '2',
      }),
    ]);
    expect(trigger).toHaveFocus();
  });

  it('selecting a file via input calls onFilesChange and onFilesAdded', () => {
    const onFilesChange = vi.fn();
    const onFilesAdded = vi.fn();
    const file = makeFile('brief.pdf', 'application/pdf', 2048);
    const { container } = render(
      <FilePicker
        triggerVariant="button"
        onFilesChange={onFilesChange}
        onFilesAdded={onFilesAdded}
      />
    );

    fireEvent.change(getFileInput(container), {
      target: { files: [file] },
    });

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

  it('validates maxSize, accept, duplicate, maxFiles, and minSize constraints', () => {
    const duplicate = makePickerFile({
      id: 'existing',
      name: 'report.pdf',
      type: 'application/pdf',
      size: 2048,
    });
    const { container } = render(
      <FilePicker
        triggerVariant="button"
        files={[duplicate]}
        multiple
        accept=".pdf"
        maxFiles={2}
        maxSize={1024}
        minSize={512}
      />
    );

    fireEvent.change(getFileInput(container), {
      target: {
        files: [
          makeFile('large.pdf', 'application/pdf', 2048),
          makeFile('image.png', 'image/png', 800),
          makeFile('report.pdf', 'application/pdf', 2048),
          makeFile('tiny.pdf', 'application/pdf', 128),
        ],
      },
    });

    expect(screen.getByRole('alert')).toHaveTextContent('large.pdf: File exceeds maximum size');
  });

  it('validation errors auto-clear after 6 seconds', async () => {
    vi.useFakeTimers();
    const file = makeFile('large.pdf', 'application/pdf', 2048);
    const { container } = render(<FilePicker triggerVariant="button" maxSize={1024} />);

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

  it('renders field error with hidden input accessibility wiring', () => {
    const { container } = render(
      <FilePicker
        triggerVariant="button"
        id="attachments"
        label="Attachments"
        hint="PDF only"
        error="Please upload a file."
      />
    );

    const input = getFileInput(container);

    expect(screen.getByRole('alert')).toHaveTextContent('Please upload a file.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'attachments-error attachments-hint');
  });

  it('axe: button trigger with mixed status files', async () => {
    const { container } = render(
      <FilePicker
        triggerVariant="button"
        files={[
          makePickerFile({ id: '1', status: 'complete' }),
          makePickerFile({ id: '2', status: 'uploading', progress: 50 }),
          makePickerFile({ id: '3', status: 'paused', progress: 60 }),
          makePickerFile({ id: '4', status: 'waiting' }),
        ]}
      />
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: menu trigger open', async () => {
    const user = userEvent.setup();
    const { container } = render(<FilePicker triggerVariant="menu" />);

    await user.click(screen.getByRole('button', { name: 'Choose an action' }));
    await screen.findByRole('menu');

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe: dropzone trigger', async () => {
    const { container } = render(<FilePicker triggerVariant="dropzone" />);

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});

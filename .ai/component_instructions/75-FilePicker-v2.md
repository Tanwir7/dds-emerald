# FilePicker + FileItem · node scaffolding.mjs FilePicker && node scaffolding.mjs FileItem

> **This instruction supersedes `70-FilePicker.md` entirely.**
> If `FileItem` was previously implemented, read it first and update it to match this spec.
> If `FilePicker` was previously implemented, replace it.

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/Button/
packages/components/src/components/Dropdown/
packages/components/src/components/ProgressBar/
packages/components/src/components/
```

- Use `Button` for the button trigger variant and any action buttons.
- Use `Dropdown` + `DropdownItem` for the menu trigger variant — if Dropdown exists, compose it. If not, use `@radix-ui/react-dropdown-menu` directly.
- Do NOT use a separate `ProgressBar` component inside `FileItem` — the progress bar is an inline CSS-only implementation (see FileItem spec below).
- No third-party upload library.

### Token additions required

Add to `packages/tokens/src/tokens.css` if not already present:

```css
/* Tier 2 — File upload status colours */
--dds-color-upload-progress: var(--dds-color-action-primary);
--dds-color-upload-paused: var(--dds-color-text-muted);
--dds-color-upload-waiting: var(--dds-color-text-muted);
```

---

## Scaffold locations

```
packages/components/src/components/FileItem/
  FileItem.tsx
  FileItem.module.scss
  FileItem.test.tsx
  FileItem.stories.tsx
  index.ts

packages/components/src/components/FilePicker/
  FilePicker.tsx
  FilePicker.module.scss
  FilePicker.test.tsx
  FilePicker.stories.tsx
  index.ts
```

---

## Design reference — what these screenshots show

Four design patterns observed:

1. **Single FileItem row** (Image 1) — Compact horizontal row: status icon left, filename centre-left, full-width progress bar spanning the entire row width below the text, "45% complete" label + trash icon right. No card/panel wrapper — pure row.

2. **Dropdown menu trigger** (Image 2) — "Choose an action ∨" button that opens a dropdown with "Upload File" and "Other Action" items. Selecting "Upload File" triggers the hidden file input. Focus ring is a solid blue outline on the highlighted item.

3. **Multi-file upload panel** (Image 3) — Panel with bold header "Uploading 6 files", subtitle "2 of 6 files uploaded", "Clear all" button top right. Each file is a `FileItem` row. Status icons: ✓ (complete), 🔄 spinning (uploading), ⏸ (paused), ⏱ (waiting). Progress bar is full-width inline.

4. **Button-only trigger** (Image 4) — Label above as plain text with constraints (accepted types, max size, max files). A single styled button with upload icon and bold label "Upload Files". No dropzone visible.

---

## Part 1 — FileItem

### Purpose

`FileItem` is the row-level display component for a single file in an upload list. It renders a status icon, filename, inline progress bar, status label, and a remove button. It is used by `FilePicker` but can also be used standalone.

### Exports from `FileItem/index.ts`

```ts
export { FileItem };
export type { FileItemProps, FileItemStatus };
```

### Types

```ts
export type FileItemStatus =
  | 'idle' // selected but not yet uploading — no progress bar shown
  | 'waiting' // queued, not yet started — shows clock icon + "Waiting…" label
  | 'uploading' // actively uploading — shows spinning icon + progress bar + "N% complete"
  | 'paused' // upload paused — shows pause icon + progress bar (greyed) + "N% complete"
  | 'complete' // upload finished — shows check icon, no progress bar
  | 'error'; // upload failed — shows error icon + error message

export interface FileItemProps {
  name: string; // file name displayed
  size?: number; // bytes — formatted as "1.2 MB" etc.
  status?: FileItemStatus; // default: 'idle'
  progress?: number; // 0–100 — shown when status is uploading or paused
  error?: string; // error message when status="error"
  downloadUrl?: string; // when present, filename becomes a download link
  onRemove?: () => void; // called when trash button clicked — omit to hide button
  className?: string;
}
```

### Status icon map

| Status      | Icon (lucide-react) | Colour token                 | Animation         |
| ----------- | ------------------- | ---------------------------- | ----------------- |
| `idle`      | `File`              | `--dds-color-text-muted`     | none              |
| `waiting`   | `Clock`             | `--dds-color-text-muted`     | none              |
| `uploading` | `RefreshCw`         | `--dds-color-action-primary` | `spin` continuous |
| `paused`    | `PauseCircle`       | `--dds-color-text-muted`     | none              |
| `complete`  | `CheckCircle2`      | `--dds-color-status-success` | none              |
| `error`     | `AlertCircle`       | `--dds-color-status-danger`  | none              |

Status is NEVER conveyed by colour alone — each status has a distinct icon shape in addition to colour.

### Status label (right side)

| Status      | Label                            |
| ----------- | -------------------------------- |
| `idle`      | — (no label)                     |
| `waiting`   | `"Waiting…"`                     |
| `uploading` | `"45% complete"` (from progress) |
| `paused`    | `"45% complete"` (from progress) |
| `complete`  | — (no label — icon is enough)    |
| `error`     | error message string             |

### Progress bar

Shown when `status === 'uploading'` or `status === 'paused'`. It is a full-width inline bar spanning the entire item row — NOT the DDS `ProgressBar` component. Implemented as two nested `<div>` elements:

```tsx
{
  (status === 'uploading' || status === 'paused') && (
    <div
      className={styles.progressTrack}
      role="progressbar"
      aria-valuenow={progress ?? 0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${name} upload progress`}
      aria-valuetext={`${progress ?? 0}% complete`}
    >
      <div
        className={clsx(styles.progressFill, status === 'paused' && styles.progressFillPaused)}
        style={{ width: `${progress ?? 0}%` } as React.CSSProperties}
      />
    </div>
  );
}
```

The `width` is the only inline style — a documented exception (dynamic numeric layout value).

### Component structure

```
FileItem root <div>
  ├── .itemRow                         ← horizontal flex row
  │     ├── .statusIcon                ← lucide icon (animated when uploading)
  │     ├── .fileInfo                  ← flex column (name + size)
  │     │     ├── .fileName            ← <a> when downloadUrl, else <span>
  │     │     └── .fileSize            ← formatted size string (optional)
  │     ├── .statusLabel               ← right-aligned label / error text
  │     └── .removeButton              ← trash icon Button (when onRemove provided)
  └── .progressTrack                   ← full-width bar below the row (when uploading/paused)
        └── .progressFill
```

```tsx
// FileItem.tsx
import {
  File,
  Clock,
  RefreshCw,
  PauseCircle,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../Button';
import styles from './FileItem.module.scss';

const statusIconMap = {
  idle: { Icon: File, className: styles.iconIdle },
  waiting: { Icon: Clock, className: styles.iconWaiting },
  uploading: { Icon: RefreshCw, className: styles.iconUploading },
  paused: { Icon: PauseCircle, className: styles.iconPaused },
  complete: { Icon: CheckCircle2, className: styles.iconComplete },
  error: { Icon: AlertCircle, className: styles.iconError },
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
};

export const FileItem = React.forwardRef<HTMLDivElement, FileItemProps>(
  ({ name, size, status = 'idle', progress = 0, error, downloadUrl, onRemove, className }, ref) => {
    const { Icon, className: iconClass } = statusIconMap[status];
    const showProgress = status === 'uploading' || status === 'paused';

    const statusLabel = (() => {
      if (status === 'uploading' || status === 'paused') return `${progress}% complete`;
      if (status === 'waiting') return 'Waiting…';
      if (status === 'error') return error;
      return null;
    })();

    return (
      <div ref={ref} className={clsx(styles.fileItem, styles[`status-${status}`], className)}>
        {/* ── Main row ───────────────────────────────────────────────── */}
        <div className={styles.itemRow}>
          {/* Status icon */}
          <span className={clsx(styles.statusIcon, iconClass)} aria-hidden="true">
            <Icon />
          </span>

          {/* File info */}
          <div className={styles.fileInfo}>
            {downloadUrl ? (
              <a href={downloadUrl} download={name} className={styles.fileName}>
                {name}
              </a>
            ) : (
              <span className={styles.fileName}>{name}</span>
            )}
            {size != null && <span className={styles.fileSize}>{formatFileSize(size)}</span>}
          </div>

          {/* Status label */}
          {statusLabel && (
            <span
              className={clsx(styles.statusLabel, status === 'error' && styles.statusLabelError)}
              aria-live={status === 'uploading' ? 'off' : 'polite'}
            >
              {statusLabel}
            </span>
          )}

          {/* Remove button */}
          {onRemove && (
            <Button
              variant="ghost"
              iconOnly
              icon={Trash2}
              aria-label={`Remove ${name}`}
              onClick={onRemove}
              className={styles.removeButton}
            />
          )}
        </div>

        {/* ── Progress bar ───────────────────────────────────────────── */}
        {showProgress && (
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${name} upload progress`}
            aria-valuetext={`${progress}% complete`}
          >
            <div
              className={clsx(
                styles.progressFill,
                status === 'paused' && styles.progressFillPaused
              )}
              style={{ width: `${progress}%` } as React.CSSProperties}
            />
          </div>
        )}

        {/* Screen reader status announcement */}
        <span className={styles.srOnly} aria-live="polite" aria-atomic="true">
          {status === 'complete' ? `${name} upload complete` : ''}
          {status === 'error' ? `${name} upload failed: ${error}` : ''}
        </span>
      </div>
    );
  }
);
FileItem.displayName = 'FileItem';
```

### SCSS — FileItem.module.scss

```scss
@use '../../../styles/mixins' as *;

// ─── Root ─────────────────────────────────────────────────────────────────────

.fileItem {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  padding: var(--dds-space-2-5) 0;
  border-bottom: 1px solid var(--dds-color-border-default);

  &:last-child {
    border-bottom: none;
  }
}

// ─── Main row ────────────────────────────────────────────────────────────────

.itemRow {
  display: flex;
  align-items: center;
  gap: var(--dds-space-2-5);
  min-height: 32px;
}

// ─── Status icon ─────────────────────────────────────────────────────────────

.statusIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--dds-icon-size-md);
  height: var(--dds-icon-size-md);

  svg {
    width: var(--dds-icon-size-md);
    height: var(--dds-icon-size-md);
  }
}

.iconIdle {
  color: var(--dds-color-text-muted);
}
.iconWaiting {
  color: var(--dds-color-text-muted);
}
.iconPaused {
  color: var(--dds-color-text-muted);
}
.iconComplete {
  color: var(--dds-color-status-success);
}
.iconError {
  color: var(--dds-color-status-danger);
}

// Uploading — spinning animation
.iconUploading {
  color: var(--dds-color-action-primary);
  animation: spin 1s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    // In reduced motion: keep colour but add a pulsing opacity instead
    animation: pulse 2s ease-in-out infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

// ─── File info ────────────────────────────────────────────────────────────────

.fileInfo {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-0-5);
  flex: 1 1 0;
  min-width: 0; // allows text-overflow: ellipsis to work
}

.fileName {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-medium);
  color: var(--dds-color-text-default);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;

  a& {
    color: var(--dds-color-action-primary);
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      text-decoration: none;
    }
    &:focus-visible {
      outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
      outline-offset: 2px;
    }
  }
}

.fileSize {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-text-muted);
}

// ─── Status label ─────────────────────────────────────────────────────────────

.statusLabel {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.statusLabelError {
  color: var(--dds-color-status-danger);
}

// ─── Remove button ────────────────────────────────────────────────────────────

.removeButton {
  flex-shrink: 0;
  color: var(--dds-color-text-muted);

  &:hover {
    color: var(--dds-color-status-danger);
  }
}

// ─── Progress bar — full width, below the row ─────────────────────────────────

.progressTrack {
  width: 100%;
  height: 3px;
  background-color: var(--dds-color-border-default);
  overflow: hidden;
  margin-top: var(--dds-space-1-5);
  // No border-radius — consistent with DDS radius-none rule
}

.progressFill {
  height: 100%;
  background-color: var(--dds-color-upload-progress);
  transition: width var(--dds-duration-fast) var(--dds-ease-standard);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

// Paused state — greyed progress fill
.progressFillPaused {
  background-color: var(--dds-color-upload-paused);
}

// ─── Status-level modifiers ───────────────────────────────────────────────────

.status-error {
  .fileName {
    color: var(--dds-color-text-default);
  }
}

// ─── Screen reader only ───────────────────────────────────────────────────────

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Part 2 — FilePicker

### Purpose

`FilePicker` is a form input for selecting and uploading one or more files. It supports three trigger variants (button, menu, dropzone), validates files client-side, renders selected files as `FileItem` rows, and includes a panel-level header when multiple files are present (showing aggregate upload status and a "Clear all" button).

### Exports from `FilePicker/index.ts`

```ts
export { FilePicker };
export type { FilePickerProps, FilePickerFile, FilePickerFileStatus, FilePickerTriggerVariant };
```

### Types

```ts
export type FilePickerTriggerVariant = 'button' | 'menu' | 'dropzone';
export type FilePickerFileStatus = FileItemStatus; // re-export from FileItem

export interface FilePickerFile {
  id: string;
  file: File;
  status: FilePickerFileStatus;
  progress?: number;
  error?: string;
  downloadUrl?: string;
}

export interface FilePickerMenuAction {
  label: string;
  onClick?: () => void; // if omitted, this action triggers file selection
  icon?: LucideIcon;
}

export interface FilePickerProps {
  // ─── Value ────────────────────────────────────────────────────────────────
  files?: FilePickerFile[];
  onFilesChange?: (files: FilePickerFile[]) => void;
  onFilesAdded?: (newFiles: FilePickerFile[]) => void;

  // ─── Trigger variant ──────────────────────────────────────────────────────
  triggerVariant?: FilePickerTriggerVariant; // default: 'dropzone'

  // Button variant props
  buttonLabel?: string; // default: 'Upload Files'
  buttonIcon?: LucideIcon; // default: UploadCloud

  // Menu variant props — requires triggerVariant="menu"
  menuLabel?: string; // default: 'Choose an action'
  menuActions?: FilePickerMenuAction[]; // other non-upload actions in the menu
  // The "Upload File" action is always injected as the first item

  // ─── Constraints ──────────────────────────────────────────────────────────
  multiple?: boolean; // default: false
  accept?: string;
  maxSize?: number; // bytes — default: 10MB
  minSize?: number;
  maxFiles?: number;

  // ─── Display ──────────────────────────────────────────────────────────────
  id?: string;
  label?: string; // field label above trigger
  hint?: string; // plain text hint (accepts types, max size)
  error?: string; // field-level error
  required?: boolean;
  disabled?: boolean;

  // Panel header (shown when files.length > 0 and showPanelHeader=true)
  showPanelHeader?: boolean; // default: true when files.length > 0
  panelTitle?: string; // default: auto-generated "Uploading N files"
  showClearAll?: boolean; // default: true
  onClearAll?: () => void;

  // Dropzone-specific (triggerVariant="dropzone")
  dropzoneLabel?: string;
  browseLabel?: string;
  dropzoneActiveLabel?: string;
  acceptedFormatsLabel?: string;
  compact?: boolean;

  className?: string;
}
```

---

### Trigger variant 1 — Button (`triggerVariant="button"`)

Renders a styled `Button` with an upload icon and label. Below the button, optional label + hint text (as plain text, not inside the button). Matches Image 4.

```tsx
// Layout:
// [label text — bold]
// [hint text — "Accepted file types: Images, PDF, DOC, DOCX. Max size: 1MB. Max files: 6."]
// [🡅 Upload Files] ← Button component

<div className={styles.buttonTriggerWrapper}>
  {label && (
    <p className={styles.buttonTriggerLabel}>
      {label}
      {required && (
        <span className={styles.required} aria-hidden="true">
          {' '}
          *
        </span>
      )}
    </p>
  )}
  {(hint ?? autoFormatsHint) && (
    <p className={styles.buttonTriggerHint} id={`${id}-hint`}>
      {hint ?? autoFormatsHint}
    </p>
  )}
  <Button
    variant="secondary"
    icon={buttonIcon ?? UploadCloud}
    onClick={() => inputRef.current?.click()}
    disabled={disabled}
    aria-describedby={
      [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
    }
  >
    {buttonLabel ?? 'Upload Files'}
  </Button>
</div>
```

### Trigger variant 2 — Menu (`triggerVariant="menu"`)

Renders a `Button` that opens a `Dropdown` menu. The first item is always "Upload File" (triggers file input). Additional consumer-provided `menuActions` appear below. Matches Image 2.

The highlighted item in the menu uses the standard DDS focus ring: `outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5)` — the blue outline visible in Image 2 is this focus ring in action (the item is highlighted via keyboard focus, not a selected state).

```tsx
<Dropdown>
  <DropdownTrigger asChild>
    <Button
      variant="secondary"
      icon={ChevronDown}
      iconPosition="right"
      disabled={disabled}
      aria-haspopup="menu"
    >
      {menuLabel ?? 'Choose an action'}
    </Button>
  </DropdownTrigger>
  <DropdownContent align="start">
    {/* Upload action — always first */}
    <DropdownItem icon={UploadCloud} onSelect={() => inputRef.current?.click()}>
      Upload File
    </DropdownItem>
    {/* Consumer-provided additional actions */}
    {menuActions?.map((action) => (
      <DropdownItem key={action.label} icon={action.icon} onSelect={action.onClick}>
        {action.label}
      </DropdownItem>
    ))}
  </DropdownContent>
</Dropdown>
```

### Trigger variant 3 — Dropzone (`triggerVariant="dropzone"`)

Existing dropzone implementation from `70-FilePicker.md` — drag-and-drop zone + browse button + hidden input. Retain this variant fully. The `dragCounter` ref pattern, `processFiles`, and validation logic are unchanged.

---

### Panel header

Shown when `files.length > 0` and `showPanelHeader !== false`. Matches Image 3 header.

```tsx
// Aggregate status counts
const completeCount = files.filter((f) => f.status === 'complete').length;
const totalCount = files.length;
const activeCount = files.filter(
  (f) => f.status === 'uploading' || f.status === 'waiting' || f.status === 'paused'
).length;

// Auto-generated title
const autoTitle =
  activeCount > 0
    ? `Uploading ${totalCount} file${totalCount === 1 ? '' : 's'}`
    : `${totalCount} file${totalCount === 1 ? '' : 's'} selected`;

return (
  <div className={styles.panelHeader}>
    <div className={styles.panelHeaderText}>
      <h2 className={styles.panelTitle} aria-live="polite" aria-atomic="true">
        {panelTitle ?? autoTitle}
      </h2>
      {activeCount > 0 && (
        <p className={styles.panelSubtitle} aria-live="polite" aria-atomic="true">
          {completeCount} of {totalCount} file{totalCount === 1 ? '' : 's'} uploaded
        </p>
      )}
    </div>
    {showClearAll !== false && onClearAll && (
      <Button variant="secondary" size="sm" onClick={onClearAll} aria-label="Clear all files">
        Clear all
      </Button>
    )}
  </div>
);
```

`aria-live="polite"` on both the title and subtitle — when file counts change (uploads complete), screen readers announce the updated status automatically.

---

### File list

Render `FilePickerFile` array as `FileItem` components inside a `<ul>`:

```tsx
{
  files.length > 0 && (
    <ul
      className={styles.fileList}
      aria-label={`${files.length} file${files.length === 1 ? '' : 's'} selected`}
      aria-live="polite"
    >
      {files.map((f) => (
        <li key={f.id} className={styles.fileListItem}>
          <FileItem
            name={f.file.name}
            size={f.file.size}
            status={f.status}
            progress={f.progress}
            error={f.error}
            downloadUrl={f.downloadUrl}
            onRemove={onRemove ? () => handleRemove(f.id) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
```

---

### Full FilePicker component structure

```tsx
// FilePicker.tsx
export const FilePicker = React.forwardRef<HTMLDivElement, FilePickerProps>((props, ref) => {
  const {
    files = [],
    onFilesChange,
    onFilesAdded,
    triggerVariant = 'dropzone',
    multiple = false,
    accept,
    maxSize = 10 * 1024 * 1024,
    minSize,
    maxFiles,
    id,
    label,
    hint,
    error,
    required = false,
    disabled = false,
    showPanelHeader = true,
    panelTitle,
    showClearAll = true,
    onClearAll,
    className,
    // button variant
    buttonLabel,
    buttonIcon,
    // menu variant
    menuLabel,
    menuActions,
    // dropzone variant
    dropzoneLabel,
    browseLabel,
    dropzoneActiveLabel,
    acceptedFormatsLabel,
    compact,
  } = props;

  const inputRef = React.useRef<HTMLInputElement>(null);
  const browseButtonRef = React.useRef<HTMLButtonElement>(null);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const dragCounter = React.useRef(0);
  const [validationErrors, setValidationErrors] = React.useState<
    Array<{ file: File; reason: string }>
  >([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    processFiles(incoming);
    // Reset input so selecting same file again fires onChange
    e.target.value = '';
  };

  const processFiles = (incoming: File[]) => {
    const { accepted, rejected } = validateFiles(incoming, {
      files,
      multiple,
      accept,
      maxSize,
      minSize,
      maxFiles,
    });

    if (rejected.length > 0) {
      setValidationErrors(rejected);
      setTimeout(() => setValidationErrors([]), 6000);
    }

    if (accepted.length === 0) return;

    const newPickerFiles: FilePickerFile[] = accepted.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'idle' as const,
    }));

    const next = multiple ? [...files, ...newPickerFiles] : newPickerFiles;
    onFilesChange?.(next);
    onFilesAdded?.(newPickerFiles);
  };

  const handleRemove = (id: string) => {
    const next = files.filter((f) => f.id !== id);
    onFilesChange?.(next);
    browseButtonRef.current?.focus();
  };

  const showHeader = showPanelHeader && files.length > 0;

  return (
    <div ref={ref} className={clsx(styles.root, className)}>
      {/* ── Trigger area ───────────────────────────────────────────── */}
      {triggerVariant === 'button' && (
        <ButtonTrigger
          id={id}
          label={label}
          hint={hint}
          error={error}
          required={required}
          disabled={disabled}
          buttonLabel={buttonLabel}
          buttonIcon={buttonIcon}
          accept={accept}
          maxSize={maxSize}
          maxFiles={maxFiles}
          multiple={multiple}
          inputRef={inputRef}
          browseButtonRef={browseButtonRef}
          onInputChange={handleInputChange}
          autoFormatsHint={getFormatsHint({ accept, maxSize, maxFiles, multiple })}
        />
      )}

      {triggerVariant === 'menu' && (
        <MenuTrigger
          id={id}
          label={label}
          disabled={disabled}
          menuLabel={menuLabel}
          menuActions={menuActions}
          inputRef={inputRef}
          onInputChange={handleInputChange}
          accept={accept}
          multiple={multiple}
        />
      )}

      {triggerVariant === 'dropzone' && (
        <DropzoneTrigger
          id={id}
          label={label}
          hint={hint}
          error={error}
          required={required}
          disabled={disabled}
          dropzoneLabel={dropzoneLabel}
          browseLabel={browseLabel}
          dropzoneActiveLabel={dropzoneActiveLabel}
          acceptedFormatsLabel={acceptedFormatsLabel}
          compact={compact}
          isDraggingOver={isDraggingOver}
          dragCounter={dragCounter}
          setIsDraggingOver={setIsDraggingOver}
          inputRef={inputRef}
          browseButtonRef={browseButtonRef}
          onInputChange={handleInputChange}
          onDrop={(incoming) => processFiles(incoming)}
          accept={accept}
          multiple={multiple}
          autoFormatsHint={getFormatsHint({ accept, maxSize, maxFiles, multiple })}
        />
      )}

      {/* ── Validation errors ──────────────────────────────────────── */}
      {validationErrors.length > 0 && (
        <div role="alert" className={styles.validationErrors} aria-atomic="true">
          {validationErrors.map(({ file, reason }) => (
            <p key={file.name} className={styles.validationError}>
              <AlertCircle className={styles.validationErrorIcon} aria-hidden="true" />
              <span>
                <strong>{file.name}</strong>: {reason}
              </span>
            </p>
          ))}
        </div>
      )}

      {/* ── Panel + file list ──────────────────────────────────────── */}
      {files.length > 0 && (
        <div className={styles.panel}>
          {showHeader && (
            <PanelHeader
              files={files}
              panelTitle={panelTitle}
              showClearAll={showClearAll}
              onClearAll={onClearAll}
            />
          )}
          <ul
            className={styles.fileList}
            aria-label={`${files.length} file${files.length === 1 ? '' : 's'} selected`}
            aria-live="polite"
          >
            {files.map((f) => (
              <li key={f.id} className={styles.fileListItem}>
                <FileItem
                  name={f.file.name}
                  size={f.file.size}
                  status={f.status}
                  progress={f.progress}
                  error={f.error}
                  downloadUrl={f.downloadUrl}
                  onRemove={() => handleRemove(f.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Field error ────────────────────────────────────────────── */}
      {error && (
        <p id={`${id}-error`} className={styles.fieldError} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
FilePicker.displayName = 'FilePicker';
```

---

## SCSS — FilePicker.module.scss

```scss
@use '../../../styles/mixins' as *;

// ─── Root ─────────────────────────────────────────────────────────────────────

.root {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-3);
}

// ─── Button trigger ───────────────────────────────────────────────────────────

.buttonTriggerWrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dds-space-2);
}

.buttonTriggerLabel {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-default);
  margin: 0;
}

.buttonTriggerHint {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-muted);
  margin: 0;
  line-height: var(--dds-line-height-normal);
}

.required {
  color: var(--dds-color-status-danger);
}

// ─── Menu trigger ─────────────────────────────────────────────────────────────

.menuTriggerWrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dds-space-2);
}

// ─── Hidden file input ────────────────────────────────────────────────────────

.hiddenInput {
  // Visually hidden but in accessibility tree — NOT display:none
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

// ─── Dropzone (unchanged from 70-FilePicker.md) ───────────────────────────────

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--dds-space-2);
  padding: var(--dds-space-8) var(--dds-space-6);
  border: 2px dashed var(--dds-color-border-default);
  background-color: var(--dds-color-bg-subtle);
  cursor: default;
  transition:
    border-color var(--dds-duration-fast) var(--dds-ease-standard),
    background-color var(--dds-duration-fast) var(--dds-ease-standard);

  &:hover:not(.dropzoneDisabled) {
    border-color: var(--dds-color-action-primary);
    background-color: oklch(from var(--dds-color-action-primary) l c h / 0.03);
  }
}

.dropzoneActive {
  border-color: var(--dds-color-action-primary);
  border-style: solid;
  background-color: oklch(from var(--dds-color-action-primary) l c h / 0.06);
}

.dropzoneError {
  border-color: var(--dds-color-status-danger);
}
.dropzoneDisabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.dropzoneCompact {
  flex-direction: row;
  padding: var(--dds-space-3) var(--dds-space-4);
  gap: var(--dds-space-3);
  justify-content: flex-start;
}

// ─── Validation errors ────────────────────────────────────────────────────────

.validationErrors {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-1);
}

.validationError {
  display: flex;
  align-items: flex-start;
  gap: var(--dds-space-1-5);
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-status-danger);
  margin: 0;
}

.validationErrorIcon {
  width: var(--dds-icon-size-md);
  height: var(--dds-icon-size-md);
  flex-shrink: 0;
  margin-top: 1px;
}

// ─── Panel (header + file list) ───────────────────────────────────────────────

.panel {
  border: 1px solid var(--dds-color-border-default);
  background-color: var(--dds-color-bg-card);
}

// ─── Panel header ─────────────────────────────────────────────────────────────

.panelHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--dds-space-4);
  padding: var(--dds-space-4) var(--dds-space-5);
  border-bottom: 1px solid var(--dds-color-border-default);
}

.panelHeaderText {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-0-5);
}

.panelTitle {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-base);
  font-weight: var(--dds-font-weight-bold);
  color: var(--dds-color-text-default);
  margin: 0;
  line-height: var(--dds-line-height-snug);
}

.panelSubtitle {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-muted);
  margin: 0;
}

// ─── File list ────────────────────────────────────────────────────────────────

.fileList {
  list-style: none;
  margin: 0;
  padding: 0 var(--dds-space-5);
}

.fileListItem {
  // FileItem owns its own border-bottom
}

// ─── Field error ──────────────────────────────────────────────────────────────

.fieldError {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-status-danger);
  margin: 0;
}
```

---

## Accessibility

### FileItem

- Status icon: `aria-hidden="true"` — status communicated via icon shape + colour + text label, never colour alone.
- Progress bar: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext` (e.g. "45% complete"), `aria-label` includes filename.
- Status transitions (complete/error): visually hidden `<span aria-live="polite">` announces "filename upload complete" / "filename upload failed: reason" — fires once per status change, not on every progress tick.
- `aria-live="off"` on the visible percentage label — announcing "46% complete" "47% complete" on every tick would overwhelm screen readers. Only the hidden live region fires on state changes.
- Remove button: `aria-label="Remove filename.jpg"` — unique per file.
- Download link: standard `<a href download>` — no extra ARIA needed.

### FilePicker — all trigger variants

- Hidden `<input type="file">`: visually hidden (not `display:none`), `aria-required`, `aria-invalid`, `aria-describedby`.
- Validation errors: `role="alert"` — announced immediately, auto-clear after 6 seconds.
- File list: `<ul aria-label="N files selected" aria-live="polite">`.

### Button trigger

- Button uses existing `Button` component — all accessibility handled there.
- Hint text referenced via `aria-describedby` on the button.

### Menu trigger

- Dropdown uses existing `Dropdown` component — Radix handles `role="menu"`, `role="menuitem"`, keyboard navigation.
- The highlighted "Upload File" item in Image 2 shows the DDS focus ring (`outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5)`) — this is the `data-highlighted` state from Radix DropdownMenu.
- `aria-haspopup="menu"` on the trigger button.

### Panel header

- `<h2>` for panel title — consumers must ensure heading hierarchy is correct in their page context (may need `as="h3"` or similar — expose an `as` prop on the panel title if needed).
- `aria-live="polite"` on both title and subtitle — announces count changes as uploads complete.
- "Clear all" button: `aria-label="Clear all files"`.

### Contrast verification

All status colours used in FileItem must meet WCAG AA (4.5:1 for text, 3:1 for UI):

| Element                    | Token                         | Must pass against                    |
| -------------------------- | ----------------------------- | ------------------------------------ |
| Uploading icon             | `--dds-color-action-primary`  | `--dds-color-bg-card`                |
| Complete icon              | `--dds-color-status-success`  | `--dds-color-bg-card`                |
| Error icon + label         | `--dds-color-status-danger`   | `--dds-color-bg-card`                |
| Muted icon / waiting label | `--dds-color-text-muted`      | `--dds-color-bg-card`                |
| Progress bar fill          | `--dds-color-upload-progress` | `--dds-color-border-default` (track) |
| Paused bar fill            | `--dds-color-upload-paused`   | `--dds-color-border-default` (track) |
| Filename text              | `--dds-color-text-default`    | `--dds-color-bg-card`                |
| Panel title                | `--dds-color-text-default`    | `--dds-color-bg-card`                |
| Panel subtitle             | `--dds-color-text-muted`      | `--dds-color-bg-card`                |

The agent must verify each pairing passes using the oklch values in `tokens.css`. If any pairing fails, escalate to a darker/lighter token variant — do not hardcode a colour fix.

---

## TDD — write ALL tests before implementing

### FileItem tests (`FileItem.test.tsx`)

```
// Rendering
- renders file name
- renders formatted file size when size provided
- renders correct icon for each status (idle/waiting/uploading/paused/complete/error)
- all icons are aria-hidden
- renders progress bar when status="uploading"
- renders progress bar when status="paused"
- does NOT render progress bar when status="idle"
- does NOT render progress bar when status="complete"
- progress bar fill width matches progress prop (inline style)
- renders "N% complete" label when uploading
- renders "N% complete" label when paused
- renders "Waiting…" label when status="waiting"
- renders error message when status="error"
- does NOT render status label when status="idle"
- does NOT render status label when status="complete"
- renders remove button when onRemove provided
- does NOT render remove button when onRemove omitted
- remove button aria-label includes filename
- renders filename as <a> when downloadUrl provided
- renders filename as <span> when no downloadUrl
- progress bar has role="progressbar"
- progress bar has aria-valuenow matching progress prop
- progress bar has aria-valuetext "N% complete"
- progress bar has aria-label including filename
- spinning animation class applied when status="uploading"
- spinning animation not applied for other statuses
- paused progress fill applies paused class
- sr-only live region announces "upload complete" when status changes to complete
- sr-only live region announces "upload failed" when status changes to error

// axe
- axe: status="idle"
- axe: status="waiting"
- axe: status="uploading" progress=45
- axe: status="paused" progress=60
- axe: status="complete"
- axe: status="error" error="File too large"
- axe: with downloadUrl
- axe: without onRemove
```

### FilePicker tests (`FilePicker.test.tsx`)

```
// Trigger variants
- triggerVariant="button" renders Button with upload icon
- triggerVariant="button" clicking Button triggers hidden input
- triggerVariant="button" renders label text
- triggerVariant="button" renders hint text
- triggerVariant="button" renders auto-generated formats hint
- triggerVariant="menu" renders dropdown trigger button
- triggerVariant="menu" clicking trigger opens dropdown
- triggerVariant="menu" "Upload File" item triggers hidden input
- triggerVariant="menu" additional menuActions render in dropdown
- triggerVariant="menu" selecting non-upload action calls its onClick
- triggerVariant="dropzone" renders dropzone region with role="region"
- triggerVariant="dropzone" drag-over activates dropzone
- triggerVariant="dropzone" drop calls processFiles

// Hidden input
- hidden input is in accessibility tree (not display:none)
- hidden input has accept attribute
- hidden input has multiple attribute when multiple=true

// Panel header
- renders panel header when files.length > 0 and showPanelHeader=true
- panel title auto-generates "Uploading N files" when uploads active
- panel title auto-generates "N files selected" when no uploads active
- panel subtitle shows "X of N files uploaded"
- panel title and subtitle have aria-live="polite"
- "Clear all" button renders when showClearAll=true and onClearAll provided
- clicking "Clear all" calls onClearAll
- panel header NOT rendered when showPanelHeader=false
- panel header NOT rendered when files is empty

// File list
- renders FileItem for each file
- file list has aria-label with count
- file list has aria-live="polite"
- removing a file calls onFilesChange with file removed
- focus returns to browse/trigger after removal

// Validation (same as 70-FilePicker.md — retain all)
- maxSize rejects oversized files
- accept rejects wrong types (extension, MIME, wildcard)
- maxFiles rejects excess files
- duplicate detection rejects same-name+size files
- minSize rejects undersized files
- validation errors have role="alert"
- validation errors auto-clear after 6s (fake timers)

// axe
- axe: triggerVariant="button", no files
- axe: triggerVariant="button", with files (all statuses)
- axe: triggerVariant="menu", closed
- axe: triggerVariant="menu", open
- axe: triggerVariant="dropzone", no files
- axe: triggerVariant="dropzone", drag active
- axe: with panel header, mixed statuses
- axe: validation error visible
- axe: disabled
- axe: with field error
```

---

## Stories

### FileItem.stories.tsx

Title: `Core Components/FileItem`

- `AllStatuses` — six FileItems in a list, one per status. Shows the complete status vocabulary.
- `UploadingProgress` — `status="uploading"`, `progress=45`. Progress bar visible.
- `PausedProgress` — `status="paused"`, `progress=60`. Greyed bar.
- `WaitingState` — `status="waiting"`. Clock icon, "Waiting…" label.
- `ErrorState` — `status="error"`, `error="Network timeout. Please try again."`.
- `WithDownloadUrl` — `status="complete"`, filename is a download link.
- `WithoutRemoveButton` — `onRemove` omitted.
- `LongFilename` — 80-character filename to demonstrate text-overflow ellipsis.

### FilePicker.stories.tsx

Title: `Core Components/FilePicker`

- `ButtonTrigger` — `triggerVariant="button"`, label, hint. Matches Image 4.
- `MenuTrigger` — `triggerVariant="menu"`, `menuLabel="Choose an action"`, two additional `menuActions`. Matches Image 2.
- `DropzoneTrigger` — `triggerVariant="dropzone"`. Standard dropzone.
- `DropzoneTriggerCompact` — `triggerVariant="dropzone"` `compact={true}`.
- `MultiFilePanel` — `triggerVariant="button"`, controlled `files` with 4 entries at different statuses (complete, uploading@63%, paused@60%, waiting). `showPanelHeader={true}`. Matches Image 3.
- `UploadSimulation` — `triggerVariant="button"`, `multiple={true}`, `files` managed with `useState`. After selection, status cycles idle → waiting → uploading (progress increments via `setInterval`) → complete. Includes a "Simulate error" button on one file.
- `WithConstraints` — `accept="image/*,.pdf,.doc,.docx"`, `maxSize={1048576}` (1MB), `maxFiles={6}`. Button trigger. Auto-generated hint shows constraint summary.
- `MenuWithCustomActions` — `triggerVariant="menu"` with three non-upload menu items (View Files, Open Gallery, Cancel). "Upload File" remains first.
- `Disabled` — all three trigger variants shown disabled.

`MenuTriggerKeyboard` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('button', { name: /choose an action/i });
  await userEvent.click(trigger);
  const uploadItem = within(document.body).getByRole('menuitem', { name: /upload file/i });
  await expect(uploadItem).toBeVisible();
  // Escape closes menu
  await userEvent.keyboard('{Escape}');
  await expect(within(document.body).queryByRole('menu')).not.toBeInTheDocument();
};
```

`PanelHeaderUpdates` with `play()`:

```ts
play: async ({ canvasElement }) => {
  // Verify panel header shows correct aggregate status
  const title = within(canvasElement).getByRole('heading', { name: /uploading/i });
  await expect(title).toBeVisible();
  const subtitle = within(canvasElement).getByText(/of \d+ files? uploaded/i);
  await expect(subtitle).toBeVisible();
};
```

Use `autodocs`. FileItem: `Core Components/FileItem`. FilePicker: `Core Components/FilePicker`.

---

## Definition of done

### FileItem

- [ ] Six statuses implemented: idle, waiting, uploading, paused, complete, error
- [ ] Spinning animation on uploading icon — `prefers-reduced-motion` switches to pulse
- [ ] Progress bar is inline CSS (not DDS ProgressBar component) — full-width below row
- [ ] Progress bar has correct ARIA: role, aria-valuenow, aria-valuetext, aria-label
- [ ] `aria-live="off"` on visible percentage — NOT announcing every tick
- [ ] Hidden `aria-live="polite"` region announces complete/error state transitions once
- [ ] All status icons are `aria-hidden="true"`
- [ ] Remove button `aria-label` includes filename
- [ ] All colour pairings verified against WCAG AA contrast thresholds
- [ ] `border-radius: var(--dds-radius-none)` on all elements
- [ ] No Tailwind. No hardcoded colours in SCSS.
- [ ] All FileItem axe tests pass

### FilePicker

- [ ] Three trigger variants: button, menu, dropzone — all functional
- [ ] `triggerVariant="menu"` uses Dropdown component — "Upload File" always first item
- [ ] Hidden input visually hidden (not `display:none`) — in accessibility tree
- [ ] Panel header renders when `files.length > 0`
- [ ] Panel title auto-generates correctly for active vs idle states
- [ ] Panel title and subtitle have `aria-live="polite"`
- [ ] "Clear all" button calls `onClearAll`
- [ ] File list: `<ul>` with `aria-label` (count) and `aria-live="polite"`
- [ ] Validation errors: `role="alert"`, auto-clear after 6s
- [ ] `dragCounter` ref prevents dropzone flicker
- [ ] Focus returns to trigger button after file removal
- [ ] All FilePicker axe tests pass
- [ ] `MultiFilePanel` story matches Image 3 layout
- [ ] `ButtonTrigger` story matches Image 4 layout
- [ ] `MenuTrigger` story matches Image 2 layout
- [ ] No Tailwind. No hardcoded colours in SCSS.
- [ ] Both components exported from `packages/components/src/index.ts`

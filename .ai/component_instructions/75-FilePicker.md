# FilePicker · node scaffolding.mjs FilePicker

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/Button/
packages/components/src/components/FileItem/
packages/components/src/components/
```

### FileItem dependency — read before proceeding

`FileItem` (component 60) must already exist at:

```
packages/components/src/components/FileItem/
```

**Read `FileItem`'s existing implementation before writing any FilePicker code.** FilePicker composes `FileItem` for the file list — it must use `FileItem` exactly as implemented, not re-implement it.

#### Required FileItem API review

Confirm that `FileItem` currently supports:

1. `status: 'idle' | 'uploading' | 'complete' | 'error'` — FilePicker needs all four states.
2. `progress: number` — 0–100 for the uploading progress bar.
3. `onRemove: () => void` — called when the remove button is clicked.
4. `error: string` — error message displayed below the file name.
5. `name: string` — file name.
6. `size: number` — file size in bytes (FileItem formats it).
7. `downloadUrl?: string` — optional download link.

**If any of these props are missing from the current FileItem implementation, update `FileItem` first** — add the missing props, SCSS, and tests to the FileItem component before implementing FilePicker. Document which props were added as a comment at the top of `FilePicker.tsx`.

- No third-party file upload library. FilePicker manages file selection and validation. Upload logic is the consumer's responsibility — FilePicker fires callbacks and accepts external status/progress updates.
- No Radix primitive required.

---

## Scaffold location

```
packages/components/src/components/FilePicker/
  FilePicker.tsx
  FilePicker.module.scss
  FilePicker.test.tsx
  FilePicker.stories.tsx
  index.ts
```

---

## Purpose

`FilePicker` is a form input for selecting one or more files. It combines a drag-and-drop dropzone with a click-to-browse affordance, validates files against type/size constraints, and renders the selected file list using `FileItem` sub-components with upload progress, status, and error states per file.

**FilePicker is a UI component, not an upload manager.** It handles:

- Drag-and-drop and click-to-browse selection
- Client-side validation (type, size, count)
- Rendering the file list via `FileItem`
- Firing `onFilesChange` when the file list changes

It does NOT handle: HTTP requests, chunked upload, retry logic. Consumers drive upload state via the `files` prop.

---

## Exports from `index.ts`

```ts
export { FilePicker };
export type { FilePickerProps, FilePickerFile, FilePickerFileStatus };
```

---

## Types

```ts
export type FilePickerFileStatus = 'idle' | 'uploading' | 'complete' | 'error';

export interface FilePickerFile {
  id: string; // unique — consumer assigns; use crypto.randomUUID() as default
  file: File; // the native File object
  status: FilePickerFileStatus; // default: 'idle'
  progress?: number; // 0–100 — used when status="uploading"
  error?: string; // per-file error message — used when status="error"
  downloadUrl?: string; // available after successful upload
}

export interface FilePickerProps {
  // ─── Value ────────────────────────────────────────────────────────────────
  files?: FilePickerFile[]; // controlled file list
  onFilesChange?: (files: FilePickerFile[]) => void; // called when files added or removed
  onFilesAdded?: (newFiles: FilePickerFile[]) => void; // called only when new files are added

  // ─── Selection constraints ────────────────────────────────────────────────
  multiple?: boolean; // default: false
  accept?: string; // MIME types or extensions: "image/*", ".pdf,.docx"
  maxSize?: number; // bytes — default: 10 * 1024 * 1024 (10MB)
  maxFiles?: number; // default: undefined (unlimited when multiple=true)
  minSize?: number; // default: 0

  // ─── Display ──────────────────────────────────────────────────────────────
  id?: string;
  label?: string;
  hint?: string;
  error?: string; // field-level error (distinct from per-file errors)
  required?: boolean; // default: false
  disabled?: boolean; // default: false

  // ─── Dropzone content ─────────────────────────────────────────────────────
  dropzoneLabel?: string; // default: 'Drag and drop files here'
  browseLabel?: string; // default: 'Browse files'
  dropzoneActiveLabel?: string; // default: 'Drop files to upload'
  acceptedFormatsLabel?: string; // hint shown below — e.g. "PDF, DOCX up to 10MB"
  // auto-generated from accept + maxSize if not provided

  // ─── Compact mode ─────────────────────────────────────────────────────────
  compact?: boolean; // default: false — renders small single-line zone instead of full dropzone

  className?: string;
}
```

---

## Architecture

### Three zones

```
FilePicker
  ├── <label>                          (when label prop provided)
  ├── DropzoneZone                     (the interactive drag-drop area)
  │     ├── Upload icon (decorative)
  │     ├── Primary label text
  │     ├── Browse button              (<button> that triggers hidden input click)
  │     ├── Accepted formats hint
  │     └── <input type="file">        (visually hidden — the real input)
  ├── ValidationErrors                 (per-rejected-file inline errors, cleared after delay)
  ├── FileList                         (list of FilePickerFile rendered as FileItem)
  └── <p> field-level error / hint
```

### Hidden file input

The actual file selection mechanism is a `<input type="file">` that is visually hidden but accessible:

```tsx
<input
  ref={inputRef}
  type="file"
  id={id}
  accept={accept}
  multiple={multiple}
  disabled={disabled}
  onChange={handleInputChange}
  className={styles.hiddenInput} // visually hidden, not display:none
  aria-describedby={
    [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined
  }
  aria-required={required}
  aria-invalid={!!error}
/>
```

Do NOT use `display: none` or `visibility: hidden` — these remove the input from the accessibility tree. Use the standard visually-hidden technique so screen readers can still find and interact with it.

The "Browse files" button calls `inputRef.current?.click()` — it does not replace the input.

### Dropzone interaction

The dropzone `<div>` handles drag events:

```tsx
<div
  className={clsx(
    styles.dropzone,
    isDraggingOver && styles.dropzoneActive,
    disabled && styles.dropzoneDisabled,
    !!error && styles.dropzoneError,
    compact && styles.dropzoneCompact,
  )}
  onDragEnter={handleDragEnter}
  onDragLeave={handleDragLeave}
  onDragOver={(e) => e.preventDefault()}  // required to allow drop
  onDrop={handleDrop}
  role="region"
  aria-label={isDraggingOver
    ? (dropzoneActiveLabel ?? 'Drop files to upload')
    : (dropzoneLabel ?? 'Drag and drop files here, or use the Browse button')
  }
>
```

`role="region"` with a descriptive `aria-label` announces the drop target to screen readers. Do NOT make the dropzone a button or interactive element — the real interaction point is the hidden `<input>` and the browse button.

### Drag state

```ts
const [isDraggingOver, setIsDraggingOver] = React.useState(false);
const dragCounter = React.useRef(0); // counter prevents flicker on child element re-entry

const handleDragEnter = (e: React.DragEvent) => {
  e.preventDefault();
  dragCounter.current++;
  if (e.dataTransfer.items.length > 0) setIsDraggingOver(true);
};

const handleDragLeave = () => {
  dragCounter.current--;
  if (dragCounter.current === 0) setIsDraggingOver(false);
};

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  dragCounter.current = 0;
  setIsDraggingOver(false);
  processFiles(Array.from(e.dataTransfer.files));
};
```

The `dragCounter` ref prevents the `isDraggingOver` state from flickering to false when the pointer moves over child elements within the dropzone (a common drag-and-drop bug).

### File validation

```ts
interface ValidationResult {
  accepted: File[];
  rejected: Array<{ file: File; reason: string }>;
}

const validateFiles = (incoming: File[]): ValidationResult => {
  const accepted: File[] = [];
  const rejected: Array<{ file: File; reason: string }> = [];

  // Check maxFiles — if adding these would exceed limit
  const currentCount = (files ?? []).filter((f) => f.status !== 'error').length;
  const allowedCount = maxFiles ? maxFiles - currentCount : Infinity;

  incoming.forEach((file, idx) => {
    // Count check first
    if (idx >= allowedCount) {
      rejected.push({
        file,
        reason: `Maximum of ${maxFiles} file${maxFiles === 1 ? '' : 's'} allowed`,
      });
      return;
    }
    // Duplicate check
    if ((files ?? []).some((f) => f.file.name === file.name && f.file.size === file.size)) {
      rejected.push({ file, reason: 'File already added' });
      return;
    }
    // Size check
    if (maxSize && file.size > maxSize) {
      rejected.push({ file, reason: `File exceeds maximum size of ${formatFileSize(maxSize)}` });
      return;
    }
    if (minSize && file.size < minSize) {
      rejected.push({
        file,
        reason: `File is smaller than the minimum size of ${formatFileSize(minSize)}`,
      });
      return;
    }
    // Type check
    if (accept && !isFileTypeAccepted(file, accept)) {
      rejected.push({ file, reason: `File type not accepted. Allowed: ${accept}` });
      return;
    }
    accepted.push(file);
  });

  return { accepted, rejected };
};
```

### Type checking

```ts
const isFileTypeAccepted = (file: File, accept: string): boolean => {
  const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());
  return acceptedTypes.some((type) => {
    if (type.startsWith('.')) {
      // Extension check: ".pdf" matches "document.pdf"
      return file.name.toLowerCase().endsWith(type);
    }
    if (type.endsWith('/*')) {
      // Wildcard MIME: "image/*" matches "image/jpeg"
      return file.type.startsWith(type.slice(0, -1));
    }
    // Exact MIME match
    return file.type === type;
  });
};
```

### processFiles

```ts
const processFiles = (incoming: File[]) => {
  const { accepted, rejected } = validateFiles(incoming);

  if (rejected.length > 0) {
    setValidationErrors(rejected);
    // Auto-clear validation errors after 6 seconds
    setTimeout(() => setValidationErrors([]), 6000);
  }

  if (accepted.length === 0) return;

  const newPickerFiles: FilePickerFile[] = accepted.map((file) => ({
    id: crypto.randomUUID(),
    file,
    status: 'idle' as const,
  }));

  const next = multiple ? [...(files ?? []), ...newPickerFiles] : newPickerFiles;
  onFilesChange?.(next);
  onFilesAdded?.(newPickerFiles);
};
```

### Auto-generated accepted formats label

When `acceptedFormatsLabel` is not provided, auto-generate a human-readable string:

```ts
const getFormatsHint = (): string => {
  const parts: string[] = [];
  if (accept) {
    const extensions = accept
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.startsWith('.'))
      .map((t) => t.toUpperCase().slice(1));
    if (extensions.length > 0) parts.push(extensions.join(', '));
    else parts.push(accept);
  }
  if (maxSize) parts.push(`up to ${formatFileSize(maxSize)}`);
  if (maxFiles && multiple) parts.push(`max ${maxFiles} file${maxFiles === 1 ? '' : 's'}`);
  return parts.join(' · ') || '';
};
```

### FileList

Render accepted files as `FileItem` components:

```tsx
{
  (files ?? []).length > 0 && (
    <ul className={styles.fileList} aria-label="Selected files" aria-live="polite">
      {(files ?? []).map((f) => (
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
  );
}
```

`aria-live="polite"` on the file list announces additions and removals to screen readers.

### handleRemove

```ts
const handleRemove = (id: string) => {
  const next = (files ?? []).filter((f) => f.id !== id);
  onFilesChange?.(next);
  // Return focus to the dropzone browse button after removal
  browseButtonRef.current?.focus();
};
```

### Compact mode

When `compact={true}`, render a single-line zone:

```
[📎 icon] [Drop files or Browse] [accepted formats hint]
```

Used when the dropzone is embedded in a form row alongside other fields (e.g. attachment on a comment form).

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

// ─── Label ────────────────────────────────────────────────────────────────────

.label {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-medium);
  color: var(--dds-color-text-default);
}

.required {
  color: var(--dds-color-status-danger);
}

// ─── Visually hidden input ─────────────────────────────────────────────────────

.hiddenInput {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
  // NOT display:none — must remain in accessibility tree
}

// ─── Dropzone ────────────────────────────────────────────────────────────────

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--dds-space-2);
  padding: var(--dds-space-8) var(--dds-space-6);
  border: 2px dashed var(--dds-color-border-default);
  background-color: var(--dds-color-bg-subtle);
  transition:
    border-color var(--dds-duration-fast) var(--dds-ease-standard),
    background-color var(--dds-duration-fast) var(--dds-ease-standard);
  cursor: default;

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

// ─── Compact mode ────────────────────────────────────────────────────────────

.dropzoneCompact {
  flex-direction: row;
  padding: var(--dds-space-3) var(--dds-space-4);
  gap: var(--dds-space-3);
  justify-content: flex-start;
}

// ─── Dropzone icon ────────────────────────────────────────────────────────────

.dropzoneIcon {
  width: var(--dds-icon-size-lg);
  height: var(--dds-icon-size-lg);
  color: var(--dds-color-text-muted);

  .dropzoneActive & {
    color: var(--dds-color-action-primary);
  }
  .dropzoneCompact & {
    width: var(--dds-icon-size-md);
    height: var(--dds-icon-size-md);
  }
}

// ─── Dropzone text ────────────────────────────────────────────────────────────

.dropzoneText {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dds-space-1);

  .dropzoneCompact & {
    flex-direction: row;
    align-items: center;
    gap: var(--dds-space-2);
  }
}

.dropzoneLabel {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-medium);
  color: var(--dds-color-text-default);
  margin: 0;
}

.dropzoneFormatsHint {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-text-muted);
  margin: 0;
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

  svg {
    width: var(--dds-icon-size-md);
    height: var(--dds-icon-size-md);
    flex-shrink: 0;
    margin-top: 1px;
  }
}

// ─── File list ────────────────────────────────────────────────────────────────

.fileList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-2);
}

.fileListItem {
  // No extra styles — FileItem owns its own layout
}

// ─── Field error / hint ───────────────────────────────────────────────────────

.fieldError {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-status-danger);
  margin: 0;
}

.fieldHint {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-text-muted);
  margin: 0;
}
```

---

## Accessibility

### Hidden input

- Visually hidden but IN the accessibility tree (not `display: none`).
- `aria-required`, `aria-invalid`, `aria-describedby` wired from props.
- Clicking the "Browse files" `<button>` triggers `inputRef.current?.click()` — the button itself is the labelled interactive element, the input is the mechanism.
- The `<label>` (when provided) references the hidden `<input>` via `htmlFor={id}` — clicking the label also triggers file selection. This is correct and standard browser behaviour for `<input type="file">`.

### Dropzone region

- `role="region"` with descriptive `aria-label` — announces as a landmark: "Drag and drop files here, or use the Browse button, region".
- `aria-label` updates dynamically when files are being dragged over: "Drop files to upload".
- The dropzone itself is NOT interactive via keyboard — keyboard users use the Browse button or the hidden input.

### Browse button

- Standard `<button type="button">` — fully keyboard accessible.
- Use the existing `Button` component: `<Button variant="secondary" onClick={() => inputRef.current?.click()}>Browse files</Button>`.
- `ref={browseButtonRef}` — receives focus after a file is removed.

### File list

- `<ul>` with `aria-label="Selected files"` and `aria-live="polite"` — additions and removals announced.
- Each `<li>` wraps a `FileItem` — `FileItem` manages its own accessible name and remove button.

### Validation errors

- Validation error messages for rejected files: render with `role="alert"` on the container so they are announced immediately when they appear.
- Auto-clear after 6 seconds — this is the standard pattern for transient error announcements.
- Each rejected file shows: file name + rejection reason.

```tsx
{
  validationErrors.length > 0 && (
    <div role="alert" className={styles.validationErrors} aria-atomic="true">
      {validationErrors.map(({ file, reason }) => (
        <p key={file.name} className={styles.validationError}>
          <AlertCircle aria-hidden="true" />
          <strong>{file.name}</strong>: {reason}
        </p>
      ))}
    </div>
  );
}
```

### Field-level error

- `role="alert"` on the error paragraph — announced immediately.
- `aria-invalid` on the hidden input references the field-level error state.

### Keyboard interactions

| Element          | Key             | Behaviour                                           |
| ---------------- | --------------- | --------------------------------------------------- |
| Hidden `<input>` | `Enter`/`Space` | Opens OS file picker (browser-native)               |
| Browse button    | `Enter`/`Space` | Triggers hidden input click → opens OS file picker  |
| Remove button    | `Enter`/`Space` | Removes file, focus returns to Browse button        |
| `Tab`            | —               | Cycles: Browse button → FileItem remove buttons     |
| Dropzone         | —               | Not keyboard-focusable (browse button handles this) |

### WCAG 1.4.11 — Non-text contrast

- The dashed border of the dropzone must meet 3:1 contrast against the background — use `--dds-color-border-default` which is designed to meet this threshold.
- The active/hover state uses `--dds-color-action-primary` border — also designed to meet threshold.
- Active state uses both border style change (dashed → solid) AND colour change — never colour alone.

### WCAG 2.5.3 — Label in Name

- The "Browse files" button visible text must match or be contained within its accessible name — do not use `aria-label` that differs from visible text.

---

## TDD — write ALL tests before implementing

Run scaffolding first: `node scaffolding.mjs FilePicker`

```
describe('Rendering')
  - renders dropzone region with role="region"
  - dropzone has descriptive aria-label
  - renders hidden file input
  - hidden input is in accessibility tree (not display:none)
  - renders browse button
  - renders label when label prop provided
  - label htmlFor matches input id
  - renders field error when error prop provided
  - field error has role="alert"
  - renders hint text when hint prop provided
  - renders accepted formats hint (auto-generated)
  - renders custom acceptedFormatsLabel
  - renders required asterisk when required={true}
  - does NOT render file list when files array is empty

describe('File selection — browse button')
  - clicking browse button triggers hidden input click
  - selecting file via input calls onFilesChange with new FilePickerFile
  - selected FilePickerFile has status="idle"
  - selected FilePickerFile has a unique id (uuid format)

describe('File selection — drag and drop')
  - dragEnter sets dropzone active state
  - dragLeave clears dropzone active state
  - dragLeave from child element does NOT clear active state (dragCounter pattern)
  - drop event calls processFiles with dropped files
  - dragOver preventDefault called (allows drop)
  - dropzone aria-label updates to active label when dragging over

describe('Validation — maxSize')
  - file exceeding maxSize is rejected
  - rejection shows validation error with file name and reason
  - accepted file is NOT rejected
  - validation error has role="alert"
  - validation error auto-clears after 6 seconds (use fake timers)

describe('Validation — accept')
  - file with wrong extension is rejected
  - file with wrong MIME type is rejected
  - file with accepted MIME wildcard (image/*) is accepted
  - file with accepted extension is accepted

describe('Validation — maxFiles')
  - adding files beyond maxFiles rejects excess files
  - rejection reason mentions maxFiles limit

describe('Validation — duplicates')
  - adding a file already in the list is rejected
  - rejection reason says "File already added"

describe('Validation — minSize')
  - file below minSize is rejected

describe('multiple')
  - multiple=false replaces files array on new selection
  - multiple=true appends to files array
  - multiple=false hides additional files beyond first

describe('File list')
  - renders FileItem for each file in files prop
  - FileItem receives correct name, size, status, progress, error props
  - file list has aria-label="Selected files"
  - file list has aria-live="polite"

describe('File removal')
  - clicking remove on FileItem calls onFilesChange with file removed
  - focus returns to browse button after removal

describe('Status / progress')
  - FileItem receives status="uploading" and progress=50 from files prop
  - FileItem receives status="complete" from files prop
  - FileItem receives status="error" and error string from files prop

describe('Disabled')
  - disabled dropzone does not respond to drag events
  - disabled browse button is not clickable
  - hidden input is disabled

describe('Compact mode')
  - compact={true} renders single-line layout
  - compact={true} uses compact CSS class

describe('Controlled mode')
  - renders files from files prop
  - calls onFilesChange when files are added
  - calls onFilesAdded only for newly added files
  - does not maintain internal file state when controlled

describe('Auto-generated formats hint')
  - accept=".pdf,.docx" generates "PDF, DOCX"
  - maxSize=10MB generates "up to 10 MB"
  - both combined generates "PDF, DOCX · up to 10 MB"
  - maxFiles=3 + multiple generates "max 3 files"

describe('Accessibility')
  - dropzone has role="region"
  - file list has role (ul), aria-label, aria-live
  - validation errors have role="alert"
  - field error has role="alert"
  - hidden input has aria-required when required={true}
  - hidden input has aria-invalid when error prop set
  - hidden input has aria-describedby pointing to error id

describe('axe')
  - axe: empty, no files
  - axe: with files, all statuses (idle/uploading/complete/error)
  - axe: validation error visible
  - axe: compact=true
  - axe: disabled
  - axe: with field error
  - axe: dragging over (active state)
  - axe: multiple=true, 3 files
```

---

## Stories — `FilePicker.stories.tsx`

Title: `Core Components/FilePicker`

Named exports required:

- `Default` — single file, no constraints. `onFilesChange` logs to actions.
- `Multiple` — `multiple={true}`, `maxFiles={5}`.
- `WithTypeConstraint` — `accept=".pdf,.docx,.xlsx"`. Accepted formats hint auto-generated.
- `WithSizeConstraint` — `maxSize={2 * 1024 * 1024}` (2MB).
- `WithAllConstraints` — `accept="image/*"`, `maxSize={5MB}`, `maxFiles={3}`, `multiple={true}`.
- `WithLabel` — `label="Attach documents"`, `id="attach"`, `required={true}`.
- `WithError` — `error="At least one file is required"`.
- `WithHint` — `hint="Upload your project brief and supporting materials"`.
- `Compact` — `compact={true}`.
- `Disabled` — `disabled={true}`.
- `Controlled` — `files` and `onFilesChange` managed with `useState`. Simulates upload lifecycle:
  - After file added: status becomes `"uploading"` with progress incrementing from 0→100 over 3 seconds (using `setInterval`).
  - After 100%: status becomes `"complete"`.
  - Includes a "Simulate error" button that sets a file to `status="error"`.
  - This story is the canonical demonstration of FilePicker + upload state management.
- `WithUploadProgress` — pre-populated `files` prop with one file at each status (idle, uploading at 60%, complete, error). Shows all four FileItem states simultaneously.
- `MultipleWithRemoval` — `multiple={true}`, controlled. Demonstrates removing files from the list.

`DragAndDropSimulation` with `play()` — cannot fully simulate drag-and-drop in Storybook play functions. Add a note comment in the story file explaining this limitation and point to the `Default` story for manual testing.

`BrowseAndSelect` with `play()`:

```ts
play: async ({ canvasElement }) => {
  // Can't simulate OS file picker — test browse button is focusable and triggers input
  const browseButton = within(canvasElement).getByRole('button', { name: /browse files/i });
  await expect(browseButton).not.toBeDisabled();
  await userEvent.tab();
  await expect(browseButton).toHaveFocus();
};
```

Use `autodocs`. Storybook group: `Core Components/FilePicker`.

---

## Definition of done

- [ ] FileItem dependency verified — missing props added to FileItem first if needed
- [ ] Any FileItem changes documented as a comment at the top of `FilePicker.tsx`
- [ ] All Vitest tests pass (FilePicker + any updated FileItem tests)
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants and states
- [ ] Storybook builds without error
- [ ] Hidden `<input type="file">` uses visually-hidden technique — NOT `display:none`
- [ ] `dragCounter` ref pattern prevents flickering on child element re-entry
- [ ] Duplicate file detection works correctly (name + size check)
- [ ] Type checking handles extensions, MIME types, and wildcards (`image/*`)
- [ ] Auto-generated formats hint covers extension, size, and count constraints
- [ ] Validation errors auto-clear after 6 seconds — verified with fake timers in tests
- [ ] Validation errors have `role="alert"` — announced immediately
- [ ] File list has `aria-live="polite"` — additions/removals announced
- [ ] Focus returns to browse button after file removal
- [ ] Dropzone aria-label updates dynamically during drag-over
- [ ] Active drag state uses border-style change (dashed → solid) + colour — not colour alone
- [ ] `Controlled` story demonstrates full upload lifecycle (idle → uploading → complete / error)
- [ ] No Tailwind. No hardcoded color or spacing values in SCSS.
- [ ] Exported from `packages/components/src/index.ts`

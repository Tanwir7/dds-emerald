# FileItem · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `FileItem` component.
- Scaffold: `packages/components/src/components/FileItem/`
- Radix primitive: none (native HTML)

---

## Purpose

`FileItem` displays a single file attachment in a row: a file type icon, the file name (with extension), optional file size, optional status (uploading, error, complete), and an optional remove/action button. Used in file upload previews, email attachment lists, document management panels, and any context where a file reference is shown.

---

## Exports from `index.ts`

```ts
export { FileItem };
export type { FileItemProps, FileItemStatus };
```

---

## Types

```ts
export type FileItemStatus = 'idle' | 'uploading' | 'complete' | 'error';

export interface FileItemProps {
  name: string; // full filename including extension e.g. "report.pdf"
  size?: number; // file size in bytes — formatted automatically
  status?: FileItemStatus; // default: 'idle'
  progress?: number; // 0–100, shown when status="uploading"
  errorMessage?: string; // shown when status="error"
  removable?: boolean; // default: false — shows remove button
  onRemove?: () => void;
  downloadUrl?: string; // if provided, filename becomes a download link
  onClick?: React.MouseEventHandler<HTMLElement>; // makes the whole item clickable
  className?: string;
}
```

---

## File size formatting

```tsx
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
};
```

---

## File type icon

Derive a file type category from the extension and render a corresponding SVG icon or coloured extension label:

```tsx
const getFileType = (
  name: string
):
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'code'
  | 'spreadsheet'
  | 'document'
  | 'archive'
  | 'unknown' => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return 'audio';
  if (
    [
      'js',
      'ts',
      'jsx',
      'tsx',
      'py',
      'rb',
      'go',
      'rs',
      'java',
      'cpp',
      'c',
      'html',
      'css',
      'scss',
      'json',
      'yaml',
      'yml',
      'md',
    ].includes(ext)
  )
    return 'code';
  if (['xls', 'xlsx', 'csv', 'numbers'].includes(ext)) return 'spreadsheet';
  if (['doc', 'docx', 'txt', 'rtf', 'pages'].includes(ext)) return 'document';
  if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)) return 'archive';
  return 'unknown';
};
```

Each file type has a colour token assigned:
| Type | Colour |
|---|---|
| `pdf` | `var(--dds-color-status-danger)` |
| `image` | `var(--dds-color-status-info)` |
| `video` | `var(--dds-color-accent)` |
| `audio` | `var(--dds-color-status-warning)` |
| `code` | `var(--dds-color-status-success)` |
| `spreadsheet` | `var(--dds-color-status-success)` |
| `document` | `var(--dds-color-status-info)` |
| `archive` | `var(--dds-color-text-muted)` |
| `unknown` | `var(--dds-color-text-muted)` |

Render the icon as a small rectangle with the extension label as text (no external icon library dependency):

```tsx
const FileTypeIcon = ({ name }: { name: string }) => {
  const type = getFileType(name);
  const ext = (name.split('.').pop() ?? 'file').toUpperCase().slice(0, 4);
  return (
    <span className={clsx(styles.fileIcon, styles[`type${capitalise(type)}`])} aria-hidden="true">
      <span className={styles.fileIconText}>{ext}</span>
    </span>
  );
};
```

---

## Structure

```tsx
<div
  ref={ref}
  className={clsx(styles.root, styles[status ?? 'idle'], onClick && styles.clickable, className)}
  onClick={onClick}
  role={onClick ? 'button' : undefined}
  tabIndex={onClick ? 0 : undefined}
  onKeyDown={onClick ? handleKeyDown : undefined}
>
  {/* File type icon */}
  <FileTypeIcon name={name} />

  {/* File info column */}
  <div className={styles.info}>
    <div className={styles.nameRow}>
      {downloadUrl ? (
        <a
          href={downloadUrl}
          download={name}
          className={styles.nameLink}
          onClick={(e) => e.stopPropagation()}
        >
          {name}
        </a>
      ) : (
        <span className={styles.name}>{name}</span>
      )}
      {size !== undefined && <span className={styles.size}>{formatFileSize(size)}</span>}
    </div>

    {/* Progress bar when uploading */}
    {status === 'uploading' && progress !== undefined && (
      <div
        className={styles.progressBar}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Uploading ${name}`}
      >
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
    )}

    {/* Error message */}
    {status === 'error' && errorMessage && (
      <span className={styles.errorMessage} role="alert">
        {errorMessage}
      </span>
    )}
  </div>

  {/* Status icon (right side) */}
  <span className={styles.statusIcon} aria-hidden="true">
    {status === 'complete' && <CheckCircleIcon />}
    {status === 'uploading' && <Spinner size="sm" label={`Uploading ${name}`} />}
    {status === 'error' && <AlertCircleIcon />}
  </span>

  {/* Remove button */}
  {removable && (
    <button
      type="button"
      className={styles.removeBtn}
      onClick={(e) => {
        e.stopPropagation();
        onRemove?.();
      }}
      aria-label={`Remove ${name}`}
    >
      <CloseIcon aria-hidden="true" />
    </button>
  )}
</div>
```

`progressFill` width is an inline style — **documented exception** because `progress` is a dynamic value (0–100) that cannot be expressed as a SCSS class.

---

## Keyboard handling for clickable items

```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onClick?.(e as unknown as React.MouseEvent<HTMLElement>);
  }
};
```

---

## Styles — `FileItem.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: flex`
- `align-items: center`
- `gap: var(--dds-space-3)`
- `padding: var(--dds-space-2) var(--dds-space-3)`
- `background-color: var(--dds-color-bg-subtle)`
- `border: 1px solid var(--dds-color-border-default)`
- `border-radius: var(--dds-radius-none)`
- `width: 100%`
- `min-width: 0`
- `transition: background-color var(--dds-duration-fast) var(--dds-ease-standard)`

`.clickable`:

- `cursor: pointer`
- `outline: 3px solid transparent; outline-offset: -3px`
- `&:hover` → `background-color: var(--dds-color-action-ghost-hover)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`

`.error`:

- `border-color: var(--dds-color-status-danger)`
- `background-color: var(--dds-badge-danger-bg)`

### File icon

`.fileIcon`:

- `flex-shrink: 0`
- `display: flex; align-items: center; justify-content: center`
- `width: 36px; height: 44px`
- `border-radius: var(--dds-radius-none)`
- `border: 1px solid currentColor`
- `position: relative`

File type colour modifiers (set `color` on `.fileIcon`):

```scss
.typePdf {
  color: var(--dds-color-status-danger);
}
.typeImage {
  color: var(--dds-color-status-info);
}
.typeVideo {
  color: var(--dds-color-accent);
}
.typeAudio {
  color: var(--dds-color-status-warning);
}
.typeCode {
  color: var(--dds-color-status-success);
}
.typeSpreadsheet {
  color: var(--dds-color-status-success);
}
.typeDocument {
  color: var(--dds-color-status-info);
}
.typeArchive {
  color: var(--dds-color-text-muted);
}
.typeUnknown {
  color: var(--dds-color-text-muted);
}
```

`.fileIconText`:

- `font-family: var(--dds-font-mono)`
- `font-size: 8px` — intentionally tiny (fixed, not a token — document this as an exception)
- `font-weight: var(--dds-font-weight-bold)`
- `color: inherit`
- `text-transform: uppercase`
- `letter-spacing: 0` — avoid tracking on tiny text

### Info column

`.info`:

- `flex: 1; min-width: 0`
- `display: flex; flex-direction: column; gap: var(--dds-space-1)`

`.nameRow`:

- `display: flex; align-items: baseline; gap: var(--dds-space-2)`
- `flex-wrap: wrap`

`.name`, `.nameLink`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)`
- `font-weight: var(--dds-font-weight-medium)`
- `color: var(--dds-color-text-default)`
- `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`

`.nameLink`:

- `text-decoration: none`
- `&:hover` → `text-decoration: underline; text-underline-offset: 3px`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent; outline-offset: 2px`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`

`.size`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `color: var(--dds-color-text-muted)`
- `flex-shrink: 0`
- `font-variant-numeric: tabular-nums`

### Progress bar

`.progressBar`:

- `height: 4px`
- `background-color: var(--dds-color-bg-muted)`
- `border-radius: var(--dds-radius-none)`
- `overflow: hidden`

`.progressFill`:

- `height: 100%`
- `background-color: var(--dds-color-action-primary)`
- `border-radius: var(--dds-radius-none)`
- `transition: width var(--dds-duration-fast) var(--dds-ease-standard)`

### Error message

`.errorMessage`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `color: var(--dds-color-status-danger)`

### Status icon and remove button

`.statusIcon`:

- `flex-shrink: 0`
- `display: flex; align-items: center`
- `width: 20px; height: 20px`
- `.complete &` → `color: var(--dds-color-status-success)`
- `.error &` → `color: var(--dds-color-status-danger)`

`.removeBtn`:

- `flex-shrink: 0`
- `display: inline-flex; align-items: center; justify-content: center`
- `width: 24px; height: 24px`
- `padding: 0; border: none; background: transparent`
- `color: var(--dds-color-text-muted)`
- `cursor: pointer`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent; outline-offset: 2px`
- `&:hover` → `color: var(--dds-color-text-default)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`

No hardcoded values (except `8px` on `.fileIconText` — documented exception for extreme small size not in token scale). No Tailwind. No inline styles (except progress bar `width` — documented exception).

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on root, file icon, progress bar — all rectangular.
- The `8px` file icon text size is a **documented exception** — it is below the token scale minimum (`xs` = 12px) and intentionally tiny to fit an extension label within the 36×44px icon container. Document in SCSS comment.
- Progress bar fill `width` is an inline style — documented exception for a dynamic 0–100% value.
- Remove button `e.stopPropagation()` is mandatory when `onClick` is also set on root — prevent double-firing.
- Download link `e.stopPropagation()` — same reason.
- Status icon `aria-hidden="true"` — the `Spinner` has its own `label` prop for screen readers; the check/alert icons are decorative.

---

## Accessibility

- Clickable `FileItem` (when `onClick` is set): `role="button"`, `tabIndex={0}`, keyboard Enter+Space activate.
- Download link: native `<a download>` — screen readers announce it as a link.
- Progress bar: `role="progressbar"`, `aria-valuenow`, `aria-label="Uploading {name}"`.
- Error message: `role="alert"` — announced immediately when status changes to error.
- Remove button: `aria-label="Remove {name}"` — includes the filename for context.
- File type icon: `aria-hidden="true"` — the filename provides the content type context.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders the filename
- renders FileTypeIcon
- forwards className to root
- forwards ref to root HTMLDivElement

// File size
- renders formatted file size when size provided
- does NOT render size when size omitted
- formats bytes correctly: 1024 → "1 KB"
- formats MB: 1048576 → "1 MB"
- formats sub-KB: 512 → "512 B"

// File type icon
- icon has correct type class for pdf file
- icon has correct type class for .png image
- icon has correct type class for .ts code file
- icon has correct type class for .zip archive
- icon has typeUnknown class for unknown extension
- extension text is uppercase and max 4 chars
- file icon is aria-hidden

// Status
- applies .idle class by default
- applies .uploading class when status="uploading"
- applies .complete class when status="complete"
- applies .error class when status="error"

// Progress bar
- progress bar NOT rendered when status is not "uploading"
- progress bar rendered when status="uploading" and progress provided
- progress bar has role="progressbar"
- progress bar has aria-valuenow matching progress prop
- progress bar has aria-label="Uploading {name}"
- progressFill has width inline style matching progress%

// Error message
- error message NOT rendered when status is not "error"
- error message NOT rendered when errorMessage omitted
- error message rendered when status="error" and errorMessage provided
- error message has role="alert"

// Status icons
- check icon rendered when status="complete"
- spinner rendered when status="uploading"
- alert icon rendered when status="error"
- no status icon when status="idle"

// Removable
- remove button NOT rendered when removable={false} (default)
- remove button rendered when removable={true}
- remove button has aria-label="Remove {name}"
- clicking remove button calls onRemove
- remove button click does NOT trigger root onClick (stopPropagation)

// Download link
- filename renders as <span> when no downloadUrl
- filename renders as <a download> when downloadUrl provided
- download link has correct href and download attributes
- download link click does NOT trigger root onClick (stopPropagation)

// Clickable root
- role="button" when onClick provided
- tabIndex={0} when onClick provided
- no role when onClick not provided
- clicking root calls onClick
- Enter key calls onClick when root has focus
- Space key calls onClick when root has focus

// axe
- axe: passes for idle state
- axe: passes for status="uploading" with progress
- axe: passes for status="complete"
- axe: passes for status="error" with errorMessage
- axe: passes with removable={true}
- axe: passes with downloadUrl
- axe: passes when clickable (onClick provided)
```

---

## Stories — `FileItem.stories.tsx`

Named exports required:

- `Default` — idle state, report.pdf, 245KB
- `Uploading` — status="uploading", progress=62
- `Complete` — status="complete"
- `Error` — status="error", errorMessage="Upload failed. File too large."
- `Removable` — removable={true}
- `WithDownload` — downloadUrl provided, filename is a link
- `Clickable` — onClick handler, whole row clickable
- `FileTypes` — one FileItem per file type (pdf, image, video, audio, code, spreadsheet, document, archive)
- `UploadList` — a list of 4 FileItems in various states (idle, uploading, complete, error)
- `NoSize` — name only, no size

`RemoveFile` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const removeBtn = within(canvasElement).getByRole('button', { name: /remove/i });
  await userEvent.click(removeBtn);
  // Verify onRemove was called
};
```

`ProgressUpdate` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const progressBar = within(canvasElement).getByRole('progressbar');
  await expect(progressBar).toHaveAttribute('aria-valuenow', '62');
};
```

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants and states
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] All 9 file type categories covered with correct colour token
- [ ] Progress bar `width` inline style — documented exception in JSDoc
- [ ] File icon `8px` text — documented exception in SCSS comment
- [ ] `role="alert"` on error message — announced immediately
- [ ] `border-radius: var(--dds-radius-none)` on all parts
- [ ] No Tailwind. No hardcoded values in SCSS (except documented 8px)
- [ ] Exported from `packages/components/src/index.ts`

# CodeBlock · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `CodeBlock` component.
- Scaffold: `packages/components/src/components/CodeBlock/`
- Radix primitive: `@radix-ui/react-scroll-area` (for the scrollable code region)

---

## Purpose

`CodeBlock` displays multi-line syntax-highlighted source code in a styled container with a copy button, optional language label, and optional line numbers. It is the display-only code container — not an editor (use `AICodeEditor` for that). It is the block-level companion to the `Code` atom (inline monospace).

---

## Exports from `index.ts`

```ts
export { CodeBlock };
export type { CodeBlockProps };
```

---

## Props

```ts
interface CodeBlockProps {
  code: string; // required — the source code string
  language?: string; // optional display label e.g. "typescript", "bash"
  showLineNumbers?: boolean; // default: false
  showCopyButton?: boolean; // default: true
  onCopy?: (code: string) => void;
  maxHeight?: string; // default: undefined (natural height). e.g. "400px"
  // CSS custom property injection — documented exception
  wrapLong?: boolean; // default: false — wraps long lines vs horizontal scroll
  className?: string;
}
```

**No syntax highlighting library is bundled.** `CodeBlock` renders the code as plain text inside a `<pre><code>` structure. Consumers who need syntax highlighting should either:

1. Pre-process the code string into HTML and use `dangerouslySetInnerHTML` inside the `code` prop (advanced).
2. Use a library like `shiki` or `highlight.js` and pass the highlighted HTML.

Document this clearly in JSDoc and stories.

---

## Structure

```tsx
<div
  ref={ref}
  className={clsx(styles.root, wrapLong && styles.wrapLong, className)}
  style={maxHeight ? ({ '--codeblock-max-height': maxHeight } as React.CSSProperties) : undefined}
>
  {/* Header bar: language label + copy button */}
  {(language || showCopyButton) && (
    <div className={styles.header}>
      {language && <span className={styles.language}>{language}</span>}
      {showCopyButton && (
        <button
          type="button"
          className={styles.copyBtn}
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
          <span className={styles.copyLabel}>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      )}
    </div>
  )}

  {/* Scrollable code region */}
  <ScrollArea.Root className={styles.scrollRoot}>
    <ScrollArea.Viewport className={styles.scrollViewport}>
      <pre className={styles.pre}>
        {showLineNumbers && (
          <span className={styles.lineNumbers} aria-hidden="true">
            {code.split('\n').map((_, i) => (
              <span key={i} className={styles.lineNumber}>
                {i + 1}
              </span>
            ))}
          </span>
        )}
        <code className={styles.code}>{code}</code>
      </pre>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar orientation="horizontal" className={styles.scrollbar}>
      <ScrollArea.Thumb className={styles.scrollThumb} />
    </ScrollArea.Scrollbar>
    <ScrollArea.Scrollbar orientation="vertical" className={styles.scrollbar}>
      <ScrollArea.Thumb className={styles.scrollThumb} />
    </ScrollArea.Scrollbar>
  </ScrollArea.Root>

  {/* Screen reader live region for copy confirmation */}
  <span role="status" aria-live="polite" className={styles.srOnly}>
    {copied ? 'Code copied to clipboard' : ''}
  </span>
</div>
```

---

## Copy behaviour

```tsx
const [copied, setCopied] = React.useState(false);

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy?.(code);
    setTimeout(() => setCopied(false), 2000);
  } catch {
    // silently fail — clipboard API unavailable
  }
};
```

---

## Styles — `CodeBlock.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `position: relative`
- `width: 100%`
- `background-color: var(--dds-color-bg-muted)`
- `border: 1px solid var(--dds-color-border-default)`
- `border-radius: var(--dds-radius-none)`
- `overflow: hidden`

`.header`:

- `display: flex`
- `align-items: center`
- `justify-content: space-between`
- `padding: var(--dds-space-2) var(--dds-space-3)`
- `border-bottom: 1px solid var(--dds-color-border-default)`
- `background-color: var(--dds-color-bg-subtle)`
- `min-height: 36px`

`.language`:

- `font-family: var(--dds-font-mono)`
- `font-size: var(--dds-font-size-xs)`
- `color: var(--dds-color-text-muted)`
- `font-weight: var(--dds-font-weight-medium)`
- `text-transform: lowercase`

`.copyBtn`:

- `display: inline-flex; align-items: center; gap: var(--dds-space-1)`
- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `color: var(--dds-color-text-muted)`
- `background: transparent; border: none`
- `cursor: pointer`
- `padding: var(--dds-space-0-5) var(--dds-space-1-5)`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent; outline-offset: 2px`
- `transition: color var(--dds-duration-fast) var(--dds-ease-standard)`
- `&:hover` → `color: var(--dds-color-text-default)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`

`.copyLabel`:

- `font-size: var(--dds-font-size-xs)`

`.scrollRoot`:

- `width: 100%`
- `max-height: var(--codeblock-max-height, none)`

`.scrollViewport`:

- `width: 100%; height: 100%`

`.pre`:

- `margin: 0`
- `padding: var(--dds-space-4)`
- `display: flex`
- `gap: var(--dds-space-4)` — between line numbers and code
- `tab-size: 2`
- `overflow: visible` — scroll handled by ScrollArea

`.wrapLong .pre`:

- `white-space: pre-wrap`
- `word-break: break-all`

`.code`:

- `font-family: var(--dds-font-mono)`
- `font-size: var(--dds-font-size-sm)`
- `line-height: var(--dds-line-height-relaxed)`
- `color: var(--dds-color-text-default)`
- `white-space: pre`
- `flex: 1; min-width: 0`
- `.wrapLong &` → `white-space: pre-wrap`

`.lineNumbers`:

- `display: flex; flex-direction: column`
- `flex-shrink: 0`
- `user-select: none`
- `text-align: right`

`.lineNumber`:

- `display: block`
- `font-family: var(--dds-font-mono)`
- `font-size: var(--dds-font-size-sm)`
- `line-height: var(--dds-line-height-relaxed)`
- `color: var(--dds-color-text-muted)`
- `padding-right: var(--dds-space-2)`
- `border-right: 1px solid var(--dds-color-border-default)`

### Scrollbar styling

`.scrollbar`:

- `display: flex`
- `user-select: none`
- `touch-action: none`
- `padding: 2px`
- `background: transparent`
- `transition: background var(--dds-duration-fast) var(--dds-ease-standard)`
- `&[data-orientation="horizontal"]` → `flex-direction: column; height: 8px`
- `&[data-orientation="vertical"]` → `width: 8px`

`.scrollThumb`:

- `flex: 1`
- `background: var(--dds-color-border-default)`
- `border-radius: var(--dds-radius-full)` — **documented exception: scrollbar thumb uses full radius**
- `position: relative`
- `&:hover` → `background: var(--dds-color-text-muted)`

No hardcoded values. No Tailwind. No inline styles (except `--codeblock-max-height` — documented exception).

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on the root container, header, and code elements.
- `border-radius: var(--dds-radius-full)` on scrollbar thumb — **documented exception**; scrollbar thumbs are universally pill-shaped for usability.
- `white-space: pre` on `.code` — preserves all whitespace and indentation. Do NOT use `pre-wrap` by default (breaks horizontal scroll experience). Only `wrapLong={true}` enables wrapping.
- Line numbers are `aria-hidden="true"` — they are decorative. Line count information is not semantically meaningful to screen readers.
- No syntax highlighting bundled — document clearly in stories and JSDoc.
- `tab-size: 2` on `.pre` — normalises tab characters in code strings.

---

## Accessibility

- `<pre><code>` structure — `<pre>` signals preformatted text, `<code>` signals computer code. Screen readers may announce "code block" depending on configuration.
- The Radix `ScrollArea` adds `tabIndex={0}` to the viewport so keyboard users can scroll it.
- Copy button: `aria-label="Copy code"` — unambiguous.
- Live region: `role="status"` announces "Code copied to clipboard" after copy.
- Line numbers: `aria-hidden="true"` — decorative counter, not content.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders root div
- renders <pre> element
- renders <code> element with the code string
- forwards className to root
- forwards ref to root HTMLDivElement

// Header
- header NOT rendered when no language and showCopyButton=false
- header rendered when language provided
- header rendered when showCopyButton=true (default)
- language label rendered when language provided
- language label NOT rendered when language omitted

// Copy button
- copy button rendered by default (showCopyButton=true)
- copy button has aria-label="Copy code"
- copy button NOT rendered when showCopyButton=false
- clicking copy button calls navigator.clipboard.writeText with code string
- copy button label changes to "Copied!" after click
- onCopy called with code string after click
- copy label reverts to "Copy" after 2000ms
- live region announces "Code copied to clipboard" after copy
- live region is empty initially

// Line numbers
- line numbers NOT rendered by default
- line numbers rendered when showLineNumbers={true}
- correct number of line number spans (one per line in code)
- line numbers have aria-hidden="true"

// maxHeight
- no --codeblock-max-height style by default
- --codeblock-max-height set to maxHeight prop value when provided

// wrapLong
- .wrapLong class NOT applied by default
- .wrapLong class applied when wrapLong={true}

// Scroll area
- Radix ScrollArea renders horizontal scrollbar
- Radix ScrollArea renders vertical scrollbar

// axe
- axe: passes for default render
- axe: passes with language label
- axe: passes with showLineNumbers={true}
- axe: passes with showCopyButton={false}
- axe: passes after copy (live region populated)
```

---

## Stories — `CodeBlock.stories.tsx`

Named exports required:

- `Default` — short snippet, no language label, copy button
- `WithLanguage` — language="typescript"
- `WithLineNumbers` — showLineNumbers={true}
- `BashSnippet` — language="bash", single-line install command
- `MaxHeight` — maxHeight="200px" with long code, scrollable
- `WrapLong` — wrapLong={true}, long unbroken line
- `NoCopyButton` — showCopyButton={false}
- `LongFile` — 80+ lines, line numbers + max height
- `InDocs` — CodeBlock inside a prose documentation layout

`CopyCode` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const copyBtn = within(canvasElement).getByRole('button', { name: /copy code/i });
  await userEvent.click(copyBtn);
  const liveRegion = within(canvasElement).getByRole('status');
  await expect(liveRegion).toHaveTextContent(/copied/i);
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
- [ ] `white-space: pre` on `.code` — horizontal scroll works
- [ ] Line numbers are `aria-hidden="true"`
- [ ] Live region announces copy confirmation
- [ ] `border-radius: var(--dds-radius-none)` on root and code elements
- [ ] Scrollbar thumb `border-radius: var(--dds-radius-full)` — documented exception
- [ ] No syntax highlighting bundled — documented in JSDoc
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

# KeyValueRow · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `KeyValueRow` and `KeyValueList` components.
- Scaffold: `packages/components/src/components/KeyValueRow/`
- Radix primitive: none (native HTML — `<dl>`, `<dt>`, `<dd>`)

---

## Purpose

`KeyValueRow` displays a single property label + value pair. `KeyValueList` composes multiple rows into a semantic description list (`<dl>`). Used in detail panels, entity sidebars, settings summaries, and profile pages.

---

## Exports from `index.ts`

```ts
export { KeyValueRow, KeyValueList };
export type { KeyValueRowProps, KeyValueListProps };
```

---

## Props

### `KeyValueRow`:

```ts
interface KeyValueRowProps {
  label: string; // property name
  layout?: 'stacked' | 'inline'; // default: 'inline' — stacked puts label above value
  labelWidth?: string; // default: '140px' — only applies to inline layout
  // CSS custom property injection, documented exception
  copyable?: boolean; // default: false — shows copy-to-clipboard button beside value
  onCopy?: (value: string) => void; // called after copying; value is the text content
  valueAs?: React.ElementType; // default: 'dd' — element for the value
  className?: string;
  children: React.ReactNode; // the value content
}
```

### `KeyValueList`:

```ts
interface KeyValueListProps {
  layout?: 'stacked' | 'inline'; // default: 'inline' — cascades to all child KeyValueRows via context
  labelWidth?: string; // default: '140px' — cascades to all child rows
  dividers?: boolean; // default: false — separator between rows
  size?: 'sm' | 'md'; // default: 'md'
  className?: string;
  children: React.ReactNode; // KeyValueRow elements
}
```

---

## Architecture

`KeyValueList` provides layout, labelWidth, and size to all child `KeyValueRow` elements via context:

```tsx
const KeyValueContext = React.createContext<{
  layout: 'stacked' | 'inline';
  labelWidth: string;
  size: 'sm' | 'md';
}>({ layout: 'inline', labelWidth: '140px', size: 'md' });
```

`KeyValueRow` reads from context but its own props override context values.

---

## Structure

### KeyValueList

```tsx
<dl ref={ref} className={clsx(styles.list, styles[size], dividers && styles.dividers, className)}>
  <KeyValueContext.Provider value={{ layout, labelWidth, size }}>
    {children}
  </KeyValueContext.Provider>
</dl>
```

### KeyValueRow — inline layout

```tsx
<div
  ref={ref}
  className={clsx(styles.row, styles[effectiveLayout], styles[effectiveSize], className)}
  style={
    effectiveLayout === 'inline'
      ? ({ '--kv-label-width': effectiveLabelWidth } as React.CSSProperties)
      : undefined
  }
>
  <dt className={styles.label}>{label}</dt>
  <ValueTag className={clsx(styles.value, copyable && styles.hasCopy)}>
    {children}
    {copyable && (
      <button
        type="button"
        className={styles.copyBtn}
        onClick={handleCopy}
        aria-label={`Copy ${label}`}
      >
        {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
      </button>
    )}
  </ValueTag>
</div>
```

The `--kv-label-width` inline style is a **documented exception** — it is a dynamic layout variable, not a design token value.

---

## Copy behaviour

```tsx
const [copied, setCopied] = React.useState(false);

const handleCopy = async () => {
  const text = valueRef.current?.textContent ?? '';
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy?.(text);
    setTimeout(() => setCopied(false), 2000);
  } catch {
    // Clipboard API unavailable — silently fail
  }
};
```

After 2 seconds, the copy icon reverts from check back to copy.

---

## Styles — `KeyValueRow.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

### List

`.list`:

- `display: flex; flex-direction: column`
- `gap: 0`
- `margin: 0; padding: 0`
- `width: 100%`

`.dividers .row`:

- `border-bottom: 1px solid var(--dds-color-border-default)`
- `&:last-child` → `border-bottom: none`

### Row

`.row`:

- `display: flex`
- `align-items: baseline`

### Inline layout

`.inline`:

- `flex-direction: row`
- `align-items: baseline`
- `gap: var(--dds-space-2)`
- `padding: var(--dds-space-1-5) 0`

`.inline .label`:

- `flex-shrink: 0`
- `width: var(--kv-label-width, 140px)`

### Stacked layout

`.stacked`:

- `flex-direction: column`
- `gap: var(--dds-space-0-5)`
- `padding: var(--dds-space-2) 0`

`.stacked .label`:

- `width: auto`

### Label

`.label`:

- `font-family: var(--dds-font-sans)`
- `font-weight: var(--dds-font-weight-medium)`
- `color: var(--dds-color-text-muted)`

Size modifiers:

- `.sm .label` → `font-size: var(--dds-font-size-xs)`
- `.md .label` → `font-size: var(--dds-font-size-sm)` (default)

### Value

`.value`:

- `font-family: var(--dds-font-sans)`
- `font-weight: var(--dds-font-weight-normal)`
- `color: var(--dds-color-text-default)`
- `min-width: 0`
- `flex: 1`
- `display: flex`
- `align-items: center`
- `gap: var(--dds-space-1-5)`

Size modifiers:

- `.sm .value` → `font-size: var(--dds-font-size-xs)`
- `.md .value` → `font-size: var(--dds-font-size-sm)` (default)

### Copy button

`.copyBtn`:

- `display: inline-flex; align-items: center; justify-content: center`
- `flex-shrink: 0`
- `width: 16px; height: 16px`
- `padding: 0; border: none; background: transparent`
- `color: var(--dds-color-text-muted)`
- `cursor: pointer`
- `border-radius: var(--dds-radius-none)`
- `outline: 3px solid transparent; outline-offset: 2px`
- `opacity: 0`
- `transition: opacity, color var(--dds-duration-fast) var(--dds-ease-standard)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5); opacity: 1`
- `.row:hover &` → `opacity: 1` — reveal on row hover
- `&:hover` → `color: var(--dds-color-text-default)`

`.hasCopy`:

- Show copy button on row hover — handled via the `.row:hover .copyBtn` rule above

No hardcoded values. No Tailwind. No inline styles (except `--kv-label-width` — documented exception).

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on copy button.
- `<dl>` + `<dt>` + `<dd>` semantic structure — description list is semantically correct for key/value pairs. Do NOT use a `<table>` or `<div>` rows with no ARIA.
- `align-items: baseline` in inline layout — label and value align on the text baseline, not the box edge. This matters when value is multi-line or contains a component like a `Badge`.
- Copy button is hidden by default, revealed on row hover AND always visible on focus — keyboard users can still access it.
- `--kv-label-width` inline style exception — set on the `.row` not the `.label`, consumed via `var()` in SCSS. This follows the same pattern as `--field-label-width` in the `Field` molecule.

---

## Accessibility

- `<dl>` is the correct HTML element for key/value display — screen readers announce "definition list, N items".
- `<dt>` (label): the term being defined.
- `<dd>` (value): the definition/value.
- Copy button: `aria-label="Copy {label}"` — descriptive, includes the property name.
- Copy confirmation: the icon swap from copy→check is visual only. A visually-hidden live region should announce "Copied!" after a successful copy:
  ```tsx
  <span role="status" aria-live="polite" className={styles.srOnly}>
    {copied ? 'Copied!' : ''}
  </span>
  ```

---

## TDD — write ALL tests before implementing

```
// KeyValueList — rendering
- renders a <dl> element
- forwards className to dl
- forwards ref to HTMLDListElement

// KeyValueList — dividers
- no divider class by default
- applies .dividers class when dividers={true}

// KeyValueList — size
- applies .md class by default
- applies .sm class when size="sm"

// KeyValueRow — rendering
- renders <dt> with label text
- renders children as value (<dd> by default)
- forwards className to row div
- forwards ref to row HTMLDivElement

// Layout — inline (default)
- applies .inline class by default
- label has fixed width via CSS custom property
- label and value are in a row

// Layout — stacked
- applies .stacked class when layout="stacked"
- label is above value in stacked layout

// Layout — custom labelWidth
- --kv-label-width CSS var set to provided labelWidth value
- default 140px when no labelWidth provided

// Context propagation
- KeyValueRow receives layout from KeyValueList context
- KeyValueRow receives size from KeyValueList context
- explicit layout on KeyValueRow overrides context

// Copyable
- copy button NOT rendered when copyable={false} (default)
- copy button rendered when copyable={true}
- copy button has aria-label="Copy {label}"
- clicking copy button copies value text to clipboard (mock navigator.clipboard)
- copy icon changes to check icon after copying
- onCopy called with value text after copy
- check icon reverts to copy icon after 2000ms
- sr-only live region announces "Copied!" after copy
- live region is empty initially

// Keyboard
- copy button receives Tab focus when copyable={true}
- copy button activates on Enter
- copy button activates on Space
- copy button focus-visible shows outline

// axe
- axe: passes for default inline list
- axe: passes for stacked layout
- axe: passes with dividers
- axe: passes with copyable={true}
- axe: passes after copy (check icon + live region)
- axe: passes for size="sm"
```

---

## Stories — `KeyValueRow.stories.tsx`

Named exports required:

- `Default` — inline, single row standalone
- `Stacked` — layout="stacked", single row
- `InList` — KeyValueList with 5 rows, inline
- `WithDividers` — KeyValueList, dividers={true}
- `StackedList` — KeyValueList, layout="stacked"
- `Copyable` — copyable={true} on selected rows
- `CustomLabelWidth` — labelWidth="200px"
- `Sizes` — sm and md
- `WithComponents` — value slots contain Badge, StatusIndicator, Avatar
- `EntityDetail` — full detail panel mock with 8 rows (name, status, created, assigned, etc.)

`CopyValue` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const copyBtn = within(canvasElement).getByRole('button', { name: /copy/i });
  await userEvent.click(copyBtn);
  const liveRegion = within(canvasElement).getByRole('status');
  await expect(liveRegion).toHaveTextContent('Copied!');
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
- [ ] `<dl>` + `<dt>` + `<dd>` semantic structure
- [ ] Copy button hidden on default, visible on hover AND focus
- [ ] Live region announces "Copied!" — verified in test
- [ ] `border-radius: var(--dds-radius-none)` on copy button
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] Both `KeyValueRow` and `KeyValueList` exported from `packages/components/src/index.ts`

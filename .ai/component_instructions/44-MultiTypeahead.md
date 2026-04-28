# MultiTypeahead · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `MultiTypeahead` component.
- Scaffold: `packages/components/src/components/MultiTypeahead/`
- Radix primitive: none — composes `Tag` atom and inline input.
- Depends on: `Tag` atom, `Spinner` atom (must be built first).
- Closely related to: `Typeahead` (#43) — share the suggestion list SCSS or extract to a shared partial.

---

## Purpose

`MultiTypeahead` is a multi-value tag input with live suggestions. The user types to see suggestions, selects one, and it becomes a `Tag` chip inside the input container. Multiple values accumulate as chips. Typing again shows new suggestions. Each chip can be removed individually. The final value is an array of selected suggestion values.

Common uses: recipient fields (email composer), skill tags, filter chips, label assignment.

---

## Exports from `index.ts`

```ts
export { MultiTypeahead };
export type { MultiTypeaheadProps, MultiTypeaheadSuggestion };
```

---

## Types

```ts
export interface MultiTypeaheadSuggestion {
  value: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

export interface MultiTypeaheadProps {
  suggestions: MultiTypeaheadSuggestion[];
  value?: string[]; // controlled selected values
  defaultValue?: string[]; // uncontrolled, default: []
  onChange?: (values: string[]) => void; // called when selection changes
  onInputChange?: (query: string) => void; // for async suggestion fetching
  maxItems?: number; // default: undefined (no limit)
  allowCustomValues?: boolean; // default: false — if true, Enter on unmatched input adds as custom tag
  size?: 'sm' | 'md'; // default: 'md'
  invalid?: boolean; // default: false
  disabled?: boolean; // default: false
  loading?: boolean; // default: false
  placeholder?: string; // shown when no tags and input is empty
  emptyMessage?: string; // default: 'No suggestions'
  highlightMatch?: boolean; // default: true
  id?: string;
  name?: string; // base name; hidden inputs get name="name[]"
  className?: string;
}
```

---

## Architecture

```tsx
const [inputValue, setInputValue] = React.useState('');
const [open, setOpen] = React.useState(false);
const [activeIndex, setActiveIndex] = React.useState(-1);
const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue ?? []);
const isControlled = value !== undefined;
const currentSelected = isControlled ? value : selectedValues;

// Exclude already-selected values from suggestions
const availableSuggestions = suggestions
  .filter((s) => !currentSelected.includes(s.value))
  .filter((s) =>
    onInputChange
      ? true // caller handles filtering
      : (s.label ?? s.value).toLowerCase().includes(inputValue.toLowerCase())
  )
  .slice(0, 8);

const isOpen = open && inputValue.length > 0 && (loading || availableSuggestions.length > 0);
```

---

## Structure

```tsx
<div
  ref={ref}
  className={clsx(
    styles.root,
    styles[size],
    invalid && styles.invalid,
    disabled && styles.disabled,
    className
  )}
  onClick={() => inputRef.current?.focus()}
  role="group"
  aria-label="Selected values"
>
  {/* Hidden inputs for form participation — one per selected value */}
  {name && currentSelected.map((v) => <input key={v} type="hidden" name={`${name}[]`} value={v} />)}

  {/* Tag chips for selected values */}
  {currentSelected.map((val) => {
    const suggestion = suggestions.find((s) => s.value === val);
    return (
      <Tag
        key={val}
        size={size === 'md' ? 'md' : 'sm'}
        removable={!disabled}
        onRemove={() => handleRemove(val)}
        disabled={disabled}
      >
        {suggestion?.label ?? val}
      </Tag>
    );
  })}

  {/* Inline text input */}
  {(!maxItems || currentSelected.length < maxItems) && (
    <input
      ref={inputRef}
      type="text"
      id={id}
      value={inputValue}
      disabled={disabled}
      placeholder={currentSelected.length === 0 ? placeholder : undefined}
      autoComplete="off"
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls={isOpen ? listboxId : undefined}
      aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
      className={styles.input}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={() => {
        if (inputValue) setOpen(true);
      }}
      onBlur={() => setTimeout(() => setOpen(false), 150)}
    />
  )}

  {/* Suggestion listbox */}
  {isOpen && (
    <div
      role="listbox"
      id={listboxId}
      aria-label="Suggestions"
      aria-multiselectable="false"
      className={styles.listbox}
    >
      {/* Same option rendering as Typeahead — loading, empty, grouped options */}
      {/* See Typeahead task for option rendering detail */}
    </div>
  )}
</div>
```

---

## Keyboard handling

```tsx
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Backspace on empty input removes last tag
  if (e.key === 'Backspace' && inputValue === '') {
    e.preventDefault();
    if (currentSelected.length > 0) {
      handleRemove(currentSelected[currentSelected.length - 1]);
    }
    return;
  }

  // Enter on unmatched input adds custom tag (if allowCustomValues)
  if (e.key === 'Enter' && allowCustomValues && inputValue.trim() && activeIndex === -1) {
    e.preventDefault();
    handleAddValue(inputValue.trim());
    return;
  }

  // Rest mirrors Typeahead keyboard handling:
  // ArrowDown/Up navigate suggestions, Enter selects, Escape closes
};
```

---

## Selection and removal

```tsx
const handleSelect = (suggestion: MultiTypeaheadSuggestion) => {
  if (suggestion.disabled) return;
  const next = [...currentSelected, suggestion.value];
  if (!isControlled) setSelectedValues(next);
  onChange?.(next);
  setInputValue('');
  setOpen(false);
  setActiveIndex(-1);
  inputRef.current?.focus();
};

const handleRemove = (val: string) => {
  const next = currentSelected.filter((v) => v !== val);
  if (!isControlled) setSelectedValues(next);
  onChange?.(next);
  inputRef.current?.focus();
};

const handleAddValue = (val: string) => {
  if (currentSelected.includes(val)) return;
  handleSelect({ value: val, label: val });
};
```

---

## Styles — `MultiTypeahead.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: flex`
- `flex-wrap: wrap`
- `align-items: center`
- `gap: var(--dds-space-1)`
- `min-height: 36px` — matches Input md height
- `padding: var(--dds-space-1-5) var(--dds-space-2)`
- `background-color: var(--dds-color-bg-input)`
- `border: 1px solid var(--dds-color-border-input)`
- `border-radius: var(--dds-radius-none)`
- `cursor: text`
- `outline: 3px solid transparent`
- `outline-offset: 2px`
- `position: relative`
- `transition: border-color, outline-color var(--dds-duration-fast) var(--dds-ease-standard)`
- `&:focus-within` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5); border-color: var(--dds-color-focus-ring)`

Size modifiers:

- `.sm` → `min-height: 32px; padding: var(--dds-space-1) var(--dds-space-1-5)`
- `.md` → as above (default)

`.invalid`:

- `border-color: var(--dds-color-status-danger)`
- `&:focus-within` → `outline-color: oklch(from var(--dds-color-status-danger) l c h / 0.5)`

`.disabled`:

- `opacity: 0.5; cursor: not-allowed; pointer-events: none`

`.input`:

- `flex: 1`
- `min-width: 120px`
- `border: none`
- `background: transparent`
- `outline: none`
- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)` (md) / `var(--dds-font-size-xs)` (sm)
- `color: var(--dds-color-text-default)`
- `&::placeholder` → `color: var(--dds-color-text-muted)`
- `&:disabled` → `cursor: not-allowed`

`.listbox`:

- `position: absolute`
- `top: calc(100% + var(--dds-space-1))`
- `left: 0; right: 0`
- Same floating panel styles as Typeahead listbox (bg-popover, border, shadow, z-index, max-height, animation)

Option styles: identical to Typeahead — reuse SCSS classes or extract to a shared `_suggestion-list.scss` partial.

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on the root container and listbox.
- `onMouseDown={e => e.preventDefault()}` on every option — prevents `onBlur` on the input from firing before the click.
- `focus-within` on root drives the focus ring — the inner `<input>` does NOT have its own visible focus ring (it's borderless).
- Backspace on empty input removes the LAST tag — this is the universal multi-tag keyboard convention.
- Already-selected values are excluded from the suggestion list — never show a suggestion the user has already picked.
- When `maxItems` is reached, the inline input is removed from the DOM — the component becomes display-only until a tag is removed.
- `name[]` naming convention for multiple form values — each hidden input has the same `name` with `[]` suffix for PHP/Rails-style form array parsing.

---

## Accessibility

- Root: `role="group"`, `aria-label="Selected values"` — announces the container.
- Inline input: `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls`, `aria-activedescendant`.
- Listbox: `role="listbox"`, `aria-multiselectable="false"` (each selection adds to the group, not the listbox).
- Options: `role="option"`, `aria-selected`, `aria-disabled`.
- Each `Tag` chip has its own remove button with `aria-label="Remove {label}"` (handled by the Tag atom).
- Focus returns to the input after every selection and removal — keyboard flow is uninterrupted.
- Screen reader flow: "Selected values group. [tag chip 1] remove. [tag chip 2] remove. Combobox. Type to search."

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders root as a group
- root has role="group"
- root has aria-label="Selected values"
- inline input has role="combobox"
- no tags rendered when value=[] (default)
- forwards ref to root HTMLDivElement
- forwards className to root

// Tags / selected values
- renders Tag for each value in value array
- Tag shows label when suggestion found for value
- Tag shows raw value when no matching suggestion
- each Tag has remove button

// Adding values
- typing and selecting a suggestion adds a Tag
- selecting adds value to onChange array
- selecting clears input value
- selecting keeps focus in input
- already-selected values excluded from suggestions

// Removing values
- clicking Tag remove button removes that tag
- Backspace on empty input removes last tag
- removal calls onChange with updated array
- focus returns to input after removal

// Custom values (allowCustomValues)
- Enter on unmatched input adds custom tag when allowCustomValues={true}
- Enter does NOT add custom tag when allowCustomValues={false}

// maxItems
- inline input hidden when currentSelected.length >= maxItems
- can remove a tag when at maxItems to unlock input again

// Suggestion list
- list opens when typing
- list closes on Escape
- list excludes already-selected values
- disabled suggestions cannot be selected
- emptyMessage shown when no available suggestions
- loading spinner shown when loading={true}

// Keyboard
- ArrowDown highlights first suggestion
- ArrowDown/Up navigate suggestions
- ArrowUp at first option resets to activeIndex=-1
- Enter selects highlighted suggestion
- Escape closes list
- Backspace removes last tag when input empty

// Form
- hidden inputs rendered with name="name[]"
- one hidden input per selected value
- name not rendered when name prop not provided

// Controlled
- controlled value prop respected
- onChange called with full updated array

// axe
- axe: passes with no tags
- axe: passes with 3 tags
- axe: passes with open suggestion list
- axe: passes when disabled
- axe: passes when invalid={true}
- axe: passes at maxItems (no input visible)
```

---

## Stories — `MultiTypeahead.stories.tsx`

Named exports required:

- `Default` — empty, framework suggestions
- `WithValues` — defaultValue=["react", "typescript"] pre-filled
- `AllowCustom` — allowCustomValues={true}
- `MaxItems` — maxItems={3}
- `Sizes` — sm / md stacked
- `Invalid` — invalid={true}
- `Disabled` — disabled, pre-filled tags
- `Loading` — loading={true}
- `AsyncSearch` — onInputChange with simulated server delay
- `WithGroups` — suggestions with group
- `InField` — wrapped in Field molecule

`AddAndRemoveTags` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const input = within(canvasElement).getByRole('combobox');
  await userEvent.type(input, 'react');
  const option = within(canvasElement).getByRole('option', { name: /react/i });
  await userEvent.click(option);
  expect(within(canvasElement).getByText('React')).toBeInTheDocument();
  const removeBtn = within(canvasElement).getByRole('button', { name: /remove react/i });
  await userEvent.click(removeBtn);
  expect(within(canvasElement).queryByText('React')).not.toBeInTheDocument();
};
```

`BackspaceRemovesTag` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const input = within(canvasElement).getByRole('combobox');
  await userEvent.tab();
  await expect(input).toHaveFocus();
  await userEvent.keyboard('{Backspace}');
  // last tag removed — verified by tag count
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
- [ ] Backspace removes last tag when input is empty — verified in tests
- [ ] Already-selected values excluded from suggestions — verified in tests
- [ ] `focus-within` drives the root focus ring (not inner input)
- [ ] `border-radius: var(--dds-radius-none)` on root and listbox
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

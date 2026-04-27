# Combobox · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Combobox` component.
- Scaffold: `packages/components/src/components/Combobox/`
- Radix primitive: `@radix-ui/react-popover` + `@radix-ui/react-visually-hidden`
  (Radix does not ship a Combobox primitive — compose from Popover + internal list management)

---

## Purpose

`Combobox` is a searchable single-value selector. The user types to filter a list of options, then clicks or keyboards to select one. It combines a text input with a floating dropdown list. It is a **form control** — it participates in forms via `name` + `value`.

Use `Select` when the user should pick from a static list with no filtering. Use `Combobox` when the list is long, dynamic, or requires search.

---

## Exports from `index.ts`

```ts
export { Combobox };
export type { ComboboxProps, ComboboxOption };
```

---

## Types

```ts
export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string; // optional group label for grouping options
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string; // controlled selected value
  defaultValue?: string; // uncontrolled
  onChange?: (value: string) => void; // called when selection changes
  onInputChange?: (query: string) => void; // called on every keystroke (for async filtering)
  placeholder?: string; // default: 'Select…'
  searchPlaceholder?: string; // default: 'Search…'
  size?: 'sm' | 'md' | 'lg'; // default: 'md'
  invalid?: boolean; // default: false
  disabled?: boolean; // default: false
  clearable?: boolean; // default: false — shows clear button when value selected
  loading?: boolean; // default: false — shows Spinner in list
  emptyMessage?: string; // default: 'No results found.'
  name?: string; // native form name
  id?: string;
  className?: string;
}
```

---

## Architecture

`Combobox` manages its own open/filter state internally. It is a self-contained component (not a compound like Select). This simplifies usage for the 95% case.

```tsx
const [open, setOpen] = React.useState(false);
const [query, setQuery] = React.useState('');
const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
const isControlled = value !== undefined;
const selectedValue = isControlled ? value : internalValue;

const filteredOptions = React.useMemo(
  () =>
    query.trim() === ''
      ? options
      : options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
  [options, query]
);
```

When `onInputChange` is provided, filtering is the caller's responsibility — do not filter internally. The `query` state is still maintained and forwarded.

---

## Structure

```tsx
<Popover.Root open={open} onOpenChange={setOpen}>
  {/* Hidden native input for form participation */}
  <input type="hidden" name={name} value={selectedValue} />

  {/* Trigger */}
  <Popover.Trigger asChild>
    <button
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listboxId}
      aria-autocomplete="list"
      disabled={disabled}
      id={id}
      className={clsx(styles.trigger, styles[size], invalid && styles.invalid, className)}
    >
      <span className={clsx(styles.triggerText, !selectedLabel && styles.placeholder)}>
        {selectedLabel ?? placeholder}
      </span>
      <span className={styles.triggerActions}>
        {clearable && selectedValue && !disabled && (
          <span
            role="button"
            aria-label="Clear selection"
            className={styles.clearBtn}
            onClick={handleClear}
            tabIndex={-1}
          >
            <ClearIcon />
          </span>
        )}
        <ChevronDownIcon className={clsx(styles.chevron, open && styles.chevronOpen)} />
      </span>
    </button>
  </Popover.Trigger>

  {/* Popover Content */}
  <Popover.Portal>
    <Popover.Content
      align="start"
      sideOffset={4}
      style={{ width: 'var(--radix-popover-trigger-width)' }}
      className={styles.content}
      onOpenAutoFocus={(e) => e.preventDefault()} // prevent focus leaving trigger
      onInteractOutside={() => {
        setOpen(false);
        setQuery('');
      }}
    >
      {/* Search input */}
      <div className={styles.searchWrapper}>
        <SearchIcon className={styles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          role="searchbox"
          aria-label="Search options"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onInputChange?.(e.target.value);
          }}
          placeholder={searchPlaceholder}
          className={styles.searchInput}
          autoFocus
        />
      </div>

      <div className={styles.divider} />

      {/* Listbox */}
      <ul id={listboxId} role="listbox" aria-label="Options" className={styles.listbox}>
        {loading && (
          <li className={styles.emptyState} aria-live="polite">
            <Spinner size="sm" label="Loading options…" />
          </li>
        )}
        {!loading && filteredOptions.length === 0 && (
          <li className={styles.emptyState} role="option" aria-disabled="true">
            {emptyMessage}
          </li>
        )}
        {!loading &&
          groupedOptions.map(({ group, items }) => (
            <React.Fragment key={group ?? '_default'}>
              {group && (
                <li role="presentation" className={styles.groupLabel}>
                  {group}
                </li>
              )}
              {items.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === selectedValue}
                  aria-disabled={option.disabled}
                  className={clsx(
                    styles.option,
                    option.value === selectedValue && styles.optionSelected,
                    option.disabled && styles.optionDisabled
                  )}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  onMouseDown={(e) => e.preventDefault()} // prevent popover close on click
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  {option.value === selectedValue && (
                    <CheckIcon className={styles.checkIcon} aria-hidden="true" />
                  )}
                </li>
              ))}
            </React.Fragment>
          ))}
      </ul>
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
```

---

## Keyboard handling inside the listbox

Add `onKeyDown` to the search input:

```tsx
const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    // Move focus to first listbox option
    listRef.current
      ?.querySelector<HTMLElement>('[role="option"]:not([aria-disabled="true"])')
      ?.focus();
  }
  if (e.key === 'Escape') {
    setOpen(false);
    setQuery('');
    triggerRef.current?.focus();
  }
  if (e.key === 'Enter' && filteredOptions.length > 0) {
    const first = filteredOptions.find((o) => !o.disabled);
    if (first) handleSelect(first.value);
  }
};
```

Add `onKeyDown` to each option `<li>`:

```tsx
const handleOptionKeyDown = (e: React.KeyboardEvent, option: ComboboxOption) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    focusNextOption();
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    focusPrevOption() || searchInputRef.current?.focus();
  }
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleSelect(option.value);
  }
  if (e.key === 'Escape') {
    setOpen(false);
    triggerRef.current?.focus();
  }
};
```

---

## Styles — `Combobox.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

### Trigger — identical token mapping to `Select.trigger`:

`.trigger`: same as Select trigger (layout, colour, border, focus ring, sizes, invalid)

`.triggerText`:

- `flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap`

`.placeholder` → `color: var(--dds-color-text-muted)`

`.triggerActions`:

- `display: flex; align-items: center; gap: var(--dds-space-1); flex-shrink: 0`

`.clearBtn`:

- `display: inline-flex; align-items: center; justify-content: center`
- `width: 16px; height: 16px`
- `color: var(--dds-color-text-muted)`
- `border-radius: var(--dds-radius-none)`
- `&:hover` → `color: var(--dds-color-text-default)`

`.chevron`: same as Select chevron
`.chevronOpen` → `transform: rotate(180deg)`

### Content

`.content`:

- `background-color: var(--dds-color-bg-popover)`
- `border: 1px solid var(--dds-color-border-default)`
- `border-radius: var(--dds-radius-none)`
- `box-shadow: var(--dds-shadow-sm)`
- `overflow: hidden`
- `z-index: 50`
- Animation: same fade+translate pattern as Select

### Search

`.searchWrapper`:

- `display: flex; align-items: center; gap: var(--dds-space-2)`
- `padding: var(--dds-space-2) var(--dds-space-3)`
- `border-bottom: 1px solid var(--dds-color-border-default)`

`.searchIcon`:

- `flex-shrink: 0; width: 14px; height: 14px; color: var(--dds-color-text-muted)`

`.searchInput`:

- `flex: 1; border: none; background: transparent; outline: none`
- `font-family: var(--dds-font-sans); font-size: var(--dds-font-size-sm)`
- `color: var(--dds-color-text-default)`
- `&::placeholder` → `color: var(--dds-color-text-muted)`

### Listbox

`.listbox`:

- `list-style: none; margin: 0; padding: var(--dds-space-1) 0`
- `max-height: 240px; overflow-y: auto`

`.option`:

- `display: flex; align-items: center; gap: var(--dds-space-2)`
- `padding: var(--dds-space-1-5) var(--dds-space-3)`
- `font-family: var(--dds-font-sans); font-size: var(--dds-font-size-sm)`
- `color: var(--dds-color-text-default)`
- `cursor: default; outline: none`
- `&:hover, &:focus` → `background-color: var(--dds-color-action-ghost-hover)`

`.optionSelected` → `font-weight: var(--dds-font-weight-medium)`

`.optionDisabled` → `opacity: 0.5; pointer-events: none`

`.checkIcon`:

- `margin-left: auto; flex-shrink: 0; width: 14px; height: 14px`
- `color: var(--dds-color-action-primary)`

`.groupLabel`:

- Same as Select `.groupLabel`

`.emptyState`:

- `padding: var(--dds-space-3); font-size: var(--dds-font-size-sm); color: var(--dds-color-text-muted)`
- `display: flex; justify-content: center`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on all parts.
- `onOpenAutoFocus={e => e.preventDefault()}` on Popover.Content — prevents Radix from stealing focus from the search input on open. The search input gets `autoFocus` instead.
- `onMouseDown={e => e.preventDefault()}` on option `<li>` — prevents the popover from closing when the user clicks an option (mousedown fires before blur on the trigger).
- The hidden `<input type="hidden">` enables native form participation without a visible input.
- `width: var(--radix-popover-trigger-width)` via inline style on `Popover.Content` — documented CSS custom property exception.
- Options must be `<li role="option">` inside `<ul role="listbox">` for correct ARIA tree structure.

---

## Accessibility

- Trigger: `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls={listboxId}`, `aria-autocomplete="list"`.
- Listbox: `role="listbox"`, `aria-label`.
- Options: `role="option"`, `aria-selected`, `aria-disabled`.
- Search input: `role="searchbox"`, `aria-label="Search options"`.
- Clear button: `aria-label="Clear selection"`.
- Keyboard flow: Tab → trigger → Enter/Space opens → focus goes to search input → ArrowDown into list → ArrowUp back to search → Enter selects → Escape closes.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a combobox trigger button
- trigger has role="combobox"
- trigger has aria-haspopup="listbox"
- trigger has aria-expanded="false" when closed
- trigger shows placeholder when no value selected
- trigger shows selected label when value is set
- hidden input rendered with correct name
- hidden input value matches selected value

// Open/close
- clicking trigger opens the popover
- search input has focus when open
- pressing Escape closes the popover and refocuses trigger
- clicking outside closes the popover

// Filtering
- typing in search input filters options
- all options shown when query is empty
- no options shown when query matches nothing
- emptyMessage shown when no results
- onInputChange called on every keystroke

// Selection
- clicking an option selects it and closes popover
- selected option has aria-selected="true"
- selected option shows checkmark
- selecting calls onChange with the option value
- trigger text updates to show selected label

// Clearable
- clear button not shown when clearable={false} (default)
- clear button shown when clearable={true} and value is selected
- clicking clear removes selection and calls onChange('')
- clear button has aria-label="Clear selection"

// Loading
- Spinner shown when loading={true}
- options not shown when loading={true}

// Disabled
- trigger is disabled when disabled={true}
- disabled options have aria-disabled and cannot be selected

// Groups
- options with group property are grouped under a group label

// Keyboard
- ArrowDown in search moves focus to first option
- ArrowDown in list moves to next option
- ArrowUp from first option returns focus to search
- Enter in search selects first non-disabled option
- Enter on option selects it
- Escape closes popover from search input
- Escape closes popover from option list

// Axe
- axe: passes when closed
- axe: passes when open with options
- axe: passes when open with no results
- axe: passes with loading={true}
- axe: passes with disabled options
- axe: passes with clearable and value selected
```

---

## Stories — `Combobox.stories.tsx`

Named exports required:

- `Default` — 10 options, no value
- `WithValue` — pre-selected value
- `Sizes` — sm / md / lg stacked
- `Invalid` — invalid={true}
- `Disabled`
- `Clearable` — clearable={true}, pre-selected
- `Loading` — loading={true}
- `EmptyState` — options=[], emptyMessage="No frameworks found"
- `WithGroups` — options with group property
- `ManyOptions` — 50 options to test scroll
- `AsyncSearch` — uses onInputChange to simulate server filtering (setTimeout)
- `InField` — wrapped in Field molecule

`SearchAndSelect` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole('combobox');
  await userEvent.click(trigger);
  const search = within(document.body).getByRole('searchbox');
  await userEvent.type(search, 'react');
  const option = within(document.body).getByRole('option', { name: /react/i });
  await userEvent.click(option);
  await expect(trigger).toHaveTextContent(/react/i);
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
- [ ] Focus goes to search input on open
- [ ] ArrowUp from first option returns to search input
- [ ] `border-radius: var(--dds-radius-none)` on all parts
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

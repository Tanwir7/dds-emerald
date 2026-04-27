# Typeahead · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Typeahead` component.
- Scaffold: `packages/components/src/components/Typeahead/`
- Radix primitive: `@radix-ui/react-popover` (for the floating suggestion list)
- Depends on: `Input` atom, `Spinner` atom (both must be built first).

---

## Purpose

`Typeahead` is a single-value inline search input with a live suggestion dropdown. The user types freely into the input and sees matching suggestions below. Selecting a suggestion fills the input. The final value is the full text string — either typed directly or chosen from suggestions. It is NOT a form-bound `Select` replacement — use `Combobox` when the value must be constrained to a predefined option set.

**Typeahead vs Combobox:**

- `Combobox`: closed value set, trigger-based, selection replaces trigger label, non-typed values are rejected.
- `Typeahead`: open value, user can type anything, suggestions are helpful hints not constraints.

---

## Exports from `index.ts`

```ts
export { Typeahead };
export type { TypeaheadProps, TypeaheadSuggestion };
```

---

## Types

```ts
export interface TypeaheadSuggestion {
  value: string; // unique key and the text filled into the input on selection
  label?: string; // display label (defaults to value if omitted)
  description?: string; // optional secondary line below the label
  disabled?: boolean;
  group?: string; // optional group heading
}

export interface TypeaheadProps {
  suggestions: TypeaheadSuggestion[];
  value?: string; // controlled input value
  defaultValue?: string; // uncontrolled
  onChange?: (value: string) => void; // called on every keystroke
  onSelect?: (suggestion: TypeaheadSuggestion) => void; // called when suggestion selected
  onInputChange?: (query: string) => void; // alias for onChange, for async use cases
  minChars?: number; // default: 1 — minimum chars before showing suggestions
  maxSuggestions?: number; // default: 8 — max items to show
  size?: 'sm' | 'md' | 'lg'; // default: 'md'
  invalid?: boolean; // default: false
  disabled?: boolean; // default: false
  loading?: boolean; // default: false
  placeholder?: string;
  emptyMessage?: string; // default: 'No suggestions'
  highlightMatch?: boolean; // default: true — bold-highlights matched substring
  id?: string;
  name?: string; // native form name
  className?: string;
  // All remaining native <input> props forwarded (aria-*, onBlur, onFocus, etc.)
}
```

---

## Architecture

`Typeahead` manages its own open/filter state. The suggestion list opens when `inputValue.length >= minChars` AND `suggestions.length > 0` (or `loading`). It closes on Escape, on blur (with delay), and on selection.

```tsx
const [inputValue, setInputValue] = React.useState(defaultValue ?? '');
const [open, setOpen] = React.useState(false);
const [activeIndex, setActiveIndex] = React.useState<number>(-1);
const isControlled = value !== undefined;
const currentValue = isControlled ? value : inputValue;

const isOpen = open && currentValue.length >= minChars && (loading || suggestions.length > 0);

// Internal filtering — only when onInputChange is NOT provided
// When onInputChange is provided, caller handles filtering
const displaySuggestions = onInputChange
  ? suggestions.slice(0, maxSuggestions)
  : suggestions
      .filter(
        (s) =>
          s.label?.toLowerCase().includes(currentValue.toLowerCase()) ||
          s.value.toLowerCase().includes(currentValue.toLowerCase())
      )
      .slice(0, maxSuggestions);
```

---

## Structure

```tsx
<div className={clsx(styles.root, className)} ref={ref}>
  {/* Hidden native input for form participation */}
  {name && <input type="hidden" name={name} value={currentValue} />}

  {/* Visible text input */}
  <Input
    ref={inputRef}
    id={id}
    value={currentValue}
    size={size}
    invalid={invalid}
    disabled={disabled}
    placeholder={placeholder}
    role="combobox"
    aria-autocomplete="list"
    aria-expanded={isOpen}
    aria-haspopup="listbox"
    aria-controls={isOpen ? listboxId : undefined}
    aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
    autoComplete="off"
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    onFocus={() => {
      if (currentValue.length >= minChars) setOpen(true);
    }}
    onBlur={handleBlur}
    endIcon={loading ? <Spinner size="sm" label="Loading suggestions…" /> : undefined}
    {...inputProps}
  />

  {/* Suggestion list — rendered in a portal-free div below input */}
  {isOpen && (
    <div role="listbox" id={listboxId} aria-label="Suggestions" className={styles.listbox}>
      {loading && !displaySuggestions.length && (
        <div className={styles.emptyState}>
          <Spinner size="sm" label="Loading…" />
        </div>
      )}
      {!loading && displaySuggestions.length === 0 && (
        <div className={styles.emptyState} role="option" aria-disabled="true">
          {emptyMessage}
        </div>
      )}
      {groupedSuggestions.map(({ group, items }) => (
        <React.Fragment key={group ?? '_default'}>
          {group && (
            <div role="presentation" className={styles.groupLabel}>
              {group}
            </div>
          )}
          {items.map((suggestion, idx) => (
            <div
              key={suggestion.value}
              id={`${listboxId}-${idx}`}
              role="option"
              aria-selected={suggestion.value === currentValue}
              aria-disabled={suggestion.disabled}
              className={clsx(
                styles.option,
                activeIndex === idx && styles.optionActive,
                suggestion.value === currentValue && styles.optionSelected,
                suggestion.disabled && styles.optionDisabled
              )}
              onMouseDown={(e) => e.preventDefault()} // prevent input blur before select
              onClick={() => !suggestion.disabled && handleSelect(suggestion)}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <span className={styles.optionLabel}>
                {highlightMatch
                  ? renderHighlighted(suggestion.label ?? suggestion.value, currentValue)
                  : (suggestion.label ?? suggestion.value)}
              </span>
              {suggestion.description && (
                <span className={styles.optionDescription}>{suggestion.description}</span>
              )}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  )}
</div>
```

**Note:** The suggestion list is NOT in a Radix portal — it is absolutely positioned below the input using CSS. This avoids z-index complexity for a component that is always inline in the document flow. If the consumer needs portal behaviour (e.g. inside a modal), they should use `Combobox` instead.

---

## Highlight helper

```tsx
const renderHighlighted = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <strong className={styles.highlight}>{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </>
  );
};
```

---

## Keyboard handling

```tsx
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (!isOpen) {
    if (e.key === 'ArrowDown') {
      setOpen(true);
      setActiveIndex(0);
    }
    return;
  }
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, displaySuggestions.length - 1));
      break;
    case 'ArrowUp':
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? -1 : i - 1));
      // activeIndex -1 means focus returns to the input (no selection highlighted)
      break;
    case 'Enter':
      e.preventDefault();
      if (
        activeIndex >= 0 &&
        displaySuggestions[activeIndex] &&
        !displaySuggestions[activeIndex].disabled
      ) {
        handleSelect(displaySuggestions[activeIndex]);
      }
      break;
    case 'Escape':
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
      break;
    case 'Tab':
      setOpen(false);
      setActiveIndex(-1);
      break;
  }
};
```

Blur handler with delay (allows click on suggestion to fire before blur closes list):

```tsx
const handleBlur = () => {
  setTimeout(() => setOpen(false), 150);
};
```

---

## Styles — `Typeahead.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `position: relative`
- `width: 100%`

`.listbox`:

- `position: absolute`
- `top: calc(100% + var(--dds-space-1))`
- `left: 0; right: 0`
- `background-color: var(--dds-color-bg-popover)`
- `border: 1px solid var(--dds-color-border-default)`
- `border-radius: var(--dds-radius-none)`
- `box-shadow: var(--dds-shadow-sm)`
- `max-height: 240px`
- `overflow-y: auto`
- `z-index: 50`
- `padding: var(--dds-space-1) 0`
- Entry animation:
  ```scss
  animation: typeaheadIn var(--dds-duration-fast) var(--dds-ease-out);
  @keyframes typeaheadIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
  ```

`.option`:

- `display: flex; flex-direction: column`
- `padding: var(--dds-space-1-5) var(--dds-space-3)`
- `cursor: default; outline: none`
- `user-select: none`

`.optionActive`:

- `background-color: var(--dds-color-action-ghost-hover)`

`.optionSelected`:

- `font-weight: var(--dds-font-weight-medium)`

`.optionDisabled`:

- `opacity: 0.5; pointer-events: none`

`.optionLabel`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-sm)`
- `color: var(--dds-color-text-default)`
- `line-height: var(--dds-line-height-snug)`

`.optionDescription`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `color: var(--dds-color-text-muted)`
- `margin-top: var(--dds-space-0-5)`

`.highlight` (the matched text `<strong>`):

- `font-weight: var(--dds-font-weight-semibold)`
- `color: var(--dds-color-action-primary)`
- `background: transparent` — colour only, no background highlight

`.groupLabel`:

- `padding: var(--dds-space-1-5) var(--dds-space-3)`
- `font-size: var(--dds-font-size-xs)`
- `font-weight: var(--dds-font-weight-semibold)`
- `color: var(--dds-color-text-muted)`
- `text-transform: uppercase`
- `letter-spacing: var(--dds-tracking-wider)`

`.emptyState`:

- `padding: var(--dds-space-3) var(--dds-space-3)`
- `font-size: var(--dds-font-size-sm)`
- `color: var(--dds-color-text-muted)`
- `display: flex; align-items: center; justify-content: center; gap: var(--dds-space-2)`

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on the listbox and all option items.
- `onMouseDown={e => e.preventDefault()}` on options — prevents input `onBlur` from firing before the click registers.
- The blur handler delay (150ms) must match or exceed the mousedown→click gap to avoid the suggestion list closing before selection.
- `aria-activedescendant` on the input points to the active option's `id` — do not move DOM focus to options.
- `activeIndex === -1` means the input has virtual focus (no option highlighted) — ArrowUp from index 0 returns to -1.
- The suggestion list is NOT in a portal — it uses absolute positioning. This is intentional for the inline use case.
- `autoComplete="off"` on the input — browser autocomplete conflicts with the custom suggestion list.

---

## Accessibility

- Input: `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls={listboxId}`, `aria-activedescendant`.
- Listbox: `role="listbox"`, `aria-label="Suggestions"`.
- Options: `role="option"`, `aria-selected`, `aria-disabled`.
- Focus stays in the input at all times — options are navigated via `aria-activedescendant`, NOT by moving DOM focus.
- `<strong>` inside option labels carries `font-weight` only — no `aria-label` needed since screen readers read the full text naturally.
- `Escape` closes the list and announces the closed state via `aria-expanded="false"`.

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders an input element
- input has role="combobox"
- input has aria-autocomplete="list"
- input has aria-expanded="false" when no suggestions visible
- suggestion list not in DOM when input empty (minChars=1)
- forwards ref to root HTMLDivElement
- forwards className to root

// Suggestions open/close
- typing 1+ chars shows suggestion list (aria-expanded="true")
- suggestion list has role="listbox"
- list closes on Escape
- list closes on blur (with delay)
- list does not open when fewer chars than minChars
- list does not open when disabled

// Filtering (internal)
- typing "re" shows only suggestions containing "re"
- case-insensitive filtering
- shows emptyMessage when no matches
- respects maxSuggestions limit

// External filtering (onInputChange provided)
- onInputChange called on every keystroke
- does not filter internally when onInputChange provided
- shows all provided suggestions when onInputChange set

// Selection
- clicking suggestion fills input with suggestion value
- clicking suggestion calls onSelect with suggestion object
- clicking suggestion closes the list
- onChange called with new value after selection
- disabled suggestion cannot be selected

// Highlight
- matching text is wrapped in <strong> when highlightMatch={true} (default)
- highlight class applied to <strong>
- no highlight when highlightMatch={false}

// Description
- optionDescription rendered when suggestion has description
- description not rendered when suggestion has no description

// Groups
- group heading rendered when suggestion has group
- grouped suggestions appear under correct heading

// Loading
- Spinner shown in input endIcon when loading={true}
- loading spinner in list when loading={true} and no suggestions

// Active index / keyboard
- ArrowDown opens list and sets activeIndex=0
- ArrowDown increments activeIndex
- ArrowDown stops at last option
- ArrowUp decrements activeIndex
- ArrowUp at index 0 sets activeIndex=-1 (no highlight)
- aria-activedescendant matches active option id
- Enter selects active option
- Enter does nothing when activeIndex=-1
- Escape closes list, resets activeIndex

// ARIA wiring
- aria-controls set to listbox id when open
- aria-controls absent when closed
- each option has id matching ${listboxId}-${index}
- active option id matches aria-activedescendant

// axe
- axe: passes when closed
- axe: passes when open with suggestions
- axe: passes with loading={true}
- axe: passes with disabled suggestions
- axe: passes with groups
- axe: passes when invalid={true}
```

---

## Stories — `Typeahead.stories.tsx`

Named exports required:

- `Default` — 10 country suggestions, internal filtering
- `WithDescriptions` — suggestions with secondary description line
- `WithGroups` — suggestions grouped by category
- `HighlightOff` — highlightMatch={false}
- `Sizes` — sm / md / lg stacked
- `Loading` — loading={true}
- `Invalid` — invalid={true}
- `MinChars` — minChars={3}, shows hint until 3 chars typed
- `AsyncSearch` — onInputChange simulates server fetch with setTimeout + loading state
- `EmptyState` — onInputChange provided, returns empty array
- `InField` — wrapped in Field molecule with label and helper

`TypeAndSelect` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const input = within(canvasElement).getByRole('combobox');
  await userEvent.type(input, 'fra');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  const option = within(canvasElement).getByRole('option', { name: /france/i });
  await userEvent.click(option);
  await expect(input).toHaveValue('France');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
};
```

`KeyboardNavigation` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const input = within(canvasElement).getByRole('combobox');
  await userEvent.type(input, 'fr');
  await userEvent.keyboard('{ArrowDown}');
  await expect(input).toHaveAttribute('aria-activedescendant');
  await userEvent.keyboard('{Enter}');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
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
- [ ] DOM focus never leaves the input — aria-activedescendant pattern only
- [ ] `onMouseDown` preventDefault on options verified in tests
- [ ] Blur delay does not cause race condition on selection
- [ ] `border-radius: var(--dds-radius-none)` on listbox and options
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] Exported from `packages/components/src/index.ts`

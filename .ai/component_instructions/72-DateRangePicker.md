# DateRangePicker · node scaffolding.mjs DateRangePicker

---

## AGENT TASK: Read `AGENTS.md`, `packages/tokens/src/tokens.css`, and `66-DatePicker.md` first.

Before writing any code, verify the following exist from the DatePicker implementation:

1. `react-day-picker@^8` in `packages/components/package.json`
2. Shared partial at `packages/components/src/styles/_calendar.scss`
3. The internal `CalendarPanel` component — DateRangePicker re-uses it directly.

Also check the repo for:

```
packages/components/src/components/Button/
packages/components/src/components/Input/
packages/components/src/components/Popover/
packages/components/src/components/DatePicker/   ← must exist first
```

- Import and reuse `CalendarPanel` from the DatePicker component directory. Do NOT re-implement the calendar grid.
- All shared calendar styles come from `_calendar.scss` — do not duplicate them here.
- Radix primitive: `@radix-ui/react-popover` — same as DatePicker.

---

## Scaffold location

```
packages/components/src/components/DateRangePicker/
  DateRangePicker.tsx
  DateRangePicker.module.scss
  DateRangePicker.test.tsx
  DateRangePicker.stories.tsx
  index.ts
```

---

## Purpose

`DateRangePicker` allows users to select a start date and an end date, defining a contiguous date range. The selected range is highlighted across the calendar grid with start/end markers and a filled middle band.

**Key differences from DatePicker:**

- Value is `{ from: Date; to: Date | undefined }` not a single `Date`.
- Defaults to `numberOfMonths={2}` — two-month view is the industry standard for range selection because it lets users see both the start and end in a single view.
- Selection is two-step: first click sets `from`, second click sets `to`. If the user clicks a date before `from`, it resets the selection and becomes the new `from`.
- Two separate trigger input displays — one for the start date, one for the end date — separated by a visual arrow separator.
- A single popover contains both calendar months.

---

## Exports from `index.ts`

```ts
export { DateRangePicker };
export type { DateRangePickerProps, DateRange };
```

---

## Types

```ts
export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface DateRangePickerProps {
  // ─── Value ────────────────────────────────────────────────────────────────
  value?: DateRange; // controlled
  defaultValue?: DateRange; // uncontrolled
  onChange?: (range: DateRange) => void;

  // ─── Constraints ──────────────────────────────────────────────────────────
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabledDayOfWeek?: number[]; // 0=Sun…6=Sat
  disabledDateRanges?: Array<{ from: Date; to: Date }>;

  // ─── Display ──────────────────────────────────────────────────────────────
  startPlaceholder?: string; // default: 'Start date'
  endPlaceholder?: string; // default: 'End date'
  dateFormat?: string; // date-fns format — default: 'dd/MM/yyyy'
  locale?: Locale; // date-fns Locale
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  numberOfMonths?: 1 | 2; // default: 2
  defaultMonth?: Date;
  month?: Date; // controlled displayed month (left/first month)
  onMonthChange?: (month: Date) => void;

  // ─── Input trigger ────────────────────────────────────────────────────────
  id?: string; // base id — start gets `${id}-start`, end gets `${id}-end`
  name?: string; // base name — produces hidden inputs: `${name}[from]` and `${name}[to]`
  label?: string; // single label above both inputs
  startLabel?: string; // accessible label for start input (visually hidden if label exists)
  endLabel?: string; // accessible label for end input (visually hidden if label exists)
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  hint?: string;
  clearable?: boolean; // default: true
  className?: string;

  // ─── Popover ──────────────────────────────────────────────────────────────
  align?: 'start' | 'center' | 'end'; // default: 'start'
  side?: 'top' | 'bottom'; // default: 'bottom'
}
```

---

## Architecture

### Two-step selection state machine

```
State: IDLE
  → User clicks first date → sets from, state: SELECTING_END
State: SELECTING_END
  → User hovers days → hoverDate updates (range preview)
  → User clicks date AFTER from → sets to, state: COMPLETE, popover closes
  → User clicks date BEFORE/EQUAL from → resets, sets new from, stays in SELECTING_END
  → User clicks same date as from → sets to=from (single-day range), state: COMPLETE
State: COMPLETE
  → User reopens → returns to IDLE with existing selection displayed
  → User clicks any date → resets, begins new selection from IDLE
```

Implement this with a `selectionPhase: 'from' | 'to'` state variable:

```ts
const [selectionPhase, setSelectionPhase] = React.useState<'from' | 'to'>('from');
const [hoverDate, setHoverDate] = React.useState<Date | null>(null);

const handleDayClick = (day: Date) => {
  if (selectionPhase === 'from' || !range.from) {
    setRange({ from: day, to: undefined });
    setSelectionPhase('to');
    return;
  }
  // selectionPhase === 'to'
  if (isBefore(day, range.from)) {
    // Clicked before from — reset and start over
    setRange({ from: day, to: undefined });
    setSelectionPhase('to');
    return;
  }
  // Valid end date
  const next = { from: range.from, to: day };
  setRange(next);
  onChange?.(next);
  setSelectionPhase('from');
  setOpen(false);
};

const handleDayMouseEnter = (day: Date) => {
  if (selectionPhase === 'to') setHoverDate(day);
};

const handleDayMouseLeave = () => setHoverDate(null);
```

### Range preview during hover

While in `selectionPhase === 'to'`, pass a preview range to react-day-picker so the user can see the range they're about to select:

```ts
// The `selected` prop on DayPicker in range mode:
const previewRange: DateRange = React.useMemo(() => {
  if (selectionPhase !== 'to' || !range.from) return range;
  if (!hoverDate) return range;
  if (isBefore(hoverDate, range.from)) {
    return { from: hoverDate, to: range.from };
  }
  return { from: range.from, to: hoverDate };
}, [range, selectionPhase, hoverDate]);
```

### Trigger — two input fields

Unlike `DatePicker`'s single button trigger, `DateRangePicker` renders two adjacent trigger buttons (start + end), connected by a visual arrow separator (→). They share a single popover:

```tsx
<RadixPopover.Trigger asChild>
  {/* Wrapping div is the Popover trigger — not individual inputs */}
  <div className={styles.triggerGroup} role="group" aria-label={label ?? 'Date range'}>
    <button
      type="button"
      id={`${id}-start`}
      role="combobox"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={
        range.from
          ? `Start date: ${formatDate(range.from, dateFormat)}. Press to change`
          : (startPlaceholder ?? 'Start date')
      }
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      aria-invalid={!!error}
      className={clsx(
        styles.triggerInput,
        styles.triggerStart,
        open && selectionPhase === 'from' && styles.triggerActive
      )}
    >
      <CalendarIcon aria-hidden="true" className={styles.triggerIcon} />
      <span className={clsx(styles.triggerText, !range.from && styles.triggerPlaceholder)}>
        {range.from ? formatDate(range.from, dateFormat) : (startPlaceholder ?? 'Start date')}
      </span>
    </button>

    <span className={styles.triggerSeparator} aria-hidden="true">
      →
    </span>

    <button
      type="button"
      id={`${id}-end`}
      role="combobox"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={
        range.to
          ? `End date: ${formatDate(range.to, dateFormat)}. Press to change`
          : (endPlaceholder ?? 'End date')
      }
      className={clsx(
        styles.triggerInput,
        styles.triggerEnd,
        open && selectionPhase === 'to' && styles.triggerActive
      )}
    >
      <span className={clsx(styles.triggerText, !range.to && styles.triggerPlaceholder)}>
        {range.to ? formatDate(range.to, dateFormat) : (endPlaceholder ?? 'End date')}
      </span>
    </button>

    {clearable && (range.from || range.to) && !disabled && !readOnly && (
      <button
        type="button"
        onClick={handleClear}
        aria-label="Clear date range"
        className={styles.clearButton}
        tabIndex={-1}
      >
        <X aria-hidden="true" />
      </button>
    )}
  </div>
</RadixPopover.Trigger>
```

**Note:** Both buttons share one `RadixPopover.Trigger`. Radix supports `asChild` on a wrapper `div` — but for clarity the `asChild` is applied to a container `div` that holds both input buttons. Both buttons open the same popover on click; which `selectionPhase` is active when the popover opens depends on which button the user clicked:

```tsx
const handleStartClick = () => {
  setSelectionPhase('from');
  setOpen(true);
};
const handleEndClick = () => {
  if (range.from) {
    setSelectionPhase('to');
  } else {
    setSelectionPhase('from');
  }
  setOpen(true);
};
```

### Active step indicator

The currently active selection step (from vs to) highlights the corresponding trigger input with a `triggerActive` class — `border-color: var(--dds-color-action-primary)` — to guide the user through the two-step selection.

### Popover calendar

The calendar in `DateRangePicker` uses react-day-picker's `mode="range"` with the previewRange computed above:

```tsx
<CalendarPanel
  mode="range"
  selected={previewRange}
  onSelect={/* not used — we handle via onDayClick */}
  onDayClick={handleDayClick}
  onDayMouseEnter={handleDayMouseEnter}
  onDayMouseLeave={handleDayMouseLeave}
  disabled={disabledMatcher}
  locale={locale}
  weekStartsOn={weekStartsOn}
  numberOfMonths={numberOfMonths ?? 2}
  month={month}
  defaultMonth={defaultMonth ?? range.from ?? undefined}
  onMonthChange={onMonthChange}
/>
```

### Hidden inputs for form submission

```tsx
{
  name && (
    <>
      <input
        type="hidden"
        name={`${name}[from]`}
        value={range.from ? format(range.from, 'yyyy-MM-dd') : ''}
      />
      <input
        type="hidden"
        name={`${name}[to]`}
        value={range.to ? format(range.to, 'yyyy-MM-dd') : ''}
      />
    </>
  );
}
```

---

## SCSS — DateRangePicker.module.scss

```scss
@use '../../../styles/mixins' as *;
@use '../../../styles/calendar' as *;

// ─── Root ─────────────────────────────────────────────────────────────────────

.root {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-1-5);
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

// ─── Trigger group ────────────────────────────────────────────────────────────

.triggerGroup {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid var(--dds-color-border-input);
  background-color: var(--dds-color-bg-input);
  transition: border-color var(--dds-duration-fast) var(--dds-ease-standard);

  &:hover:not(.triggerGroupDisabled) {
    border-color: var(--dds-color-action-primary);
  }

  &.triggerGroupError {
    border-color: var(--dds-color-status-danger);
  }

  &.triggerGroupDisabled {
    opacity: 0.5;
    pointer-events: none;
  }

  // Focus-within: show focus ring on the group when either button is focused
  &:focus-within {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

// ─── Individual trigger input buttons ─────────────────────────────────────────

.triggerInput {
  display: flex;
  align-items: center;
  gap: var(--dds-space-2);
  flex: 1 1 0;
  min-width: 0;
  height: 40px;
  padding: 0 var(--dds-space-3);
  background: none;
  border: none;
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-default);
  cursor: pointer;
  text-align: left;

  // Individual button focus ring suppressed — group handles it via :focus-within
  &:focus-visible {
    outline: none;
  }

  // Active step indicator — highlights the input currently awaiting selection
  &.triggerActive {
    background-color: oklch(from var(--dds-color-action-primary) l c h / 0.05);
  }
}

.triggerStart {
  border-right: 1px solid var(--dds-color-border-default);
}

.triggerIcon {
  width: var(--dds-icon-size-md);
  height: var(--dds-icon-size-md);
  color: var(--dds-color-text-muted);
  flex-shrink: 0;
}

.triggerText {
  flex: 1 1 0;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}

.triggerPlaceholder {
  color: var(--dds-color-text-muted);
}

// ─── Separator arrow ─────────────────────────────────────────────────────────

.triggerSeparator {
  flex-shrink: 0;
  padding: 0 var(--dds-space-1);
  color: var(--dds-color-text-muted);
  font-size: var(--dds-font-size-sm);
  pointer-events: none;
}

// ─── Clear button ─────────────────────────────────────────────────────────────

.clearButton {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: var(--dds-space-1);
  padding: 0;
  background: none;
  border: none;
  color: var(--dds-color-text-muted);
  cursor: pointer;

  &:hover {
    color: var(--dds-color-text-default);
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }

  svg {
    width: var(--dds-icon-size-sm);
    height: var(--dds-icon-size-sm);
  }
}

// ─── Popover content ─────────────────────────────────────────────────────────

.popoverContent {
  z-index: 50;
  background-color: var(--dds-color-bg-popover);
  border: 1px solid var(--dds-color-border-default);
  border-radius: var(--dds-radius-none);
  box-shadow: var(--dds-shadow-sm);

  &[data-state='open'] {
    animation: popoverIn var(--dds-duration-fast) var(--dds-ease-out);
  }
  &[data-state='closed'] {
    animation: popoverOut var(--dds-duration-fast) var(--dds-ease-standard);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

@keyframes popoverIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes popoverOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
}

// ─── Calendar — extend shared partial ────────────────────────────────────────

.calendar {
  @extend %calendar;
}
.rdpRoot {
}
.rdpMonths {
  @extend %rdpMonths;
}
.rdpMonth {
  @extend %rdpMonth;
}
.rdpCaption {
  @extend %rdpCaption;
}
.rdpCaptionLabel {
  @extend %rdpCaptionLabel;
}
.rdpNav {
  @extend %rdpNav;
}
.rdpNavButton {
  @extend %rdpNavButton;
}
.rdpNavButtonPrev {
}
.rdpNavButtonNext {
}
.rdpTable {
  @extend %rdpTable;
}
.rdpHeadRow {
  @extend %rdpHeadRow;
}
.rdpHeadCell {
  @extend %rdpHeadCell;
}
.rdpRow {
  @extend %rdpRow;
}
.rdpCell {
  @extend %rdpCell;
}
.rdpDay {
  @extend %rdpDay;
}
.rdpDaySelected {
  @extend %rdpDaySelected;
}
.rdpDayToday {
  @extend %rdpDayToday;
}
.rdpDayOutside {
  @extend %rdpDayOutside;
}
.rdpDayDisabled {
  @extend %rdpDayDisabled;
}
.rdpDayHidden {
  @extend %rdpDayHidden;
}
.rdpDayRangeStart {
  @extend %rdpDayRangeStart;
}
.rdpDayRangeEnd {
  @extend %rdpDayRangeEnd;
}
.rdpDayRangeMiddle {
  @extend %rdpDayRangeMiddle;
}

// ─── Range middle fill ────────────────────────────────────────────────────────
// Extend the range fill to the full cell width (not just the day button width)
// so the highlight spans edge-to-edge across the calendar row.

.rdpCell:has(.rdpDayRangeMiddle) {
  background-color: oklch(from var(--dds-color-action-primary) l c h / 0.1);
}

// Round the cell background at range start and end edges for a pill-like range
// Note: the day BUTTON itself still uses var(--dds-radius-none).
// The cell background rounding is applied via clip-path, not border-radius,
// so it does not violate the DDS radius-none rule on interactive elements.
.rdpCell:has(.rdpDayRangeStart) {
  background: linear-gradient(
    to right,
    transparent 50%,
    oklch(from var(--dds-color-action-primary) l c h / 0.1) 50%
  );
}

.rdpCell:has(.rdpDayRangeEnd) {
  background: linear-gradient(
    to left,
    transparent 50%,
    oklch(from var(--dds-color-action-primary) l c h / 0.1) 50%
  );
}

// ─── Selection phase instructions ────────────────────────────────────────────

.selectionHint {
  padding: var(--dds-space-2) var(--dds-space-4) var(--dds-space-3);
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-text-muted);
  border-top: 1px solid var(--dds-color-border-default);
  text-align: center;
}

// ─── Error / hint ─────────────────────────────────────────────────────────────

.error {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-status-danger);
  margin: 0;
}

.hint {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  color: var(--dds-color-text-muted);
  margin: 0;
}
```

---

## Selection hint text

Below the calendar, render a visually subtle instruction that updates based on selection phase:

```tsx
<p className={styles.selectionHint} aria-live="polite" aria-atomic="true">
  {selectionPhase === 'from'
    ? 'Select a start date'
    : `Start: ${formatDate(range.from!, dateFormat)} — Select an end date`}
</p>
```

`aria-live="polite"` announces phase changes to screen readers without interrupting.

---

## Accessibility

All rules from DatePicker apply plus the following:

### Two-trigger group

- The trigger group `<div>` has `role="group"` and `aria-label` (the `label` prop or `"Date range"`).
- Both `<button>` triggers have `role="combobox"` and `aria-haspopup="dialog"`.
- Each has a distinct `aria-label`: "Start date: Jan 15, 2025. Press to change" / "End date: not selected".
- Both have `aria-expanded` reflecting the shared popover state.
- `aria-invalid` only on the group if error is present — not individually on each button unless you have field-level errors (not the case here).

### Selection phase guidance

- Selection hint paragraph: `aria-live="polite"` — announced when phase changes.
- Screen reader users know to select a second date because the hint announces "Select an end date" after the first click.

### Range in calendar

- react-day-picker v8 in `mode="range"` sets `aria-selected="true"` on all days in the selected range, and day buttons include the full date in their accessible name. Do not override.
- During hover preview, the range preview is visual only — do not update `aria-selected` for hovered preview days, only for the committed selection.

### Keyboard multi-step

- Tab order: start trigger → end trigger → clear button → outside.
- After first date selection (from), focus stays in the calendar to continue to end date.
- After second date selection (to), popover closes and focus returns to the start trigger.
- Escape at any point closes the popover and returns focus to whichever trigger was last focused.

### RTL

- Same RTL logic as DatePicker — `dir="rtl"` on calendar panel.
- In RTL, the separator arrow becomes ← (left arrow).
- Trigger group order: end field left, start field right in RTL (visual mirror).
  - Implement via `flex-direction: row-reverse` on `.triggerGroup` when `dir="rtl"`.

---

## TDD — write ALL tests before implementing

Run scaffolding first: `node scaffolding.mjs DateRangePicker`

```
// Rendering
- renders start trigger with placeholder when no value
- renders end trigger with placeholder when no value
- renders start trigger with formatted date when from is set
- renders end trigger with formatted date when to is set
- renders label when label prop provided
- renders error when error prop provided
- error has role="alert"
- renders hint text when hint prop provided
- clear button renders when range has at least one date set
- clear button NOT rendered when no dates selected
- hidden from input renders when name provided
- hidden to input renders when name provided
- hidden inputs have ISO date values

// Two-step selection
- clicking start trigger opens popover, selectionPhase="from"
- clicking end trigger opens popover, selectionPhase="to" (when from is set)
- clicking end trigger opens popover, selectionPhase="from" (when no from)
- clicking first date sets from, phase becomes "to"
- clicking second date (after from) sets to, popover closes
- clicking date BEFORE from resets from to new date, to cleared
- clicking same date as from sets to=from (single-day range)
- after selection popover closes and onChange called with {from, to}

// Clear
- clear button click calls onChange({ from: undefined, to: undefined })
- clear button click clears displayed values

// Hover preview
- hovering a date while in "to" phase shows preview range
- preview range does not persist after mouse leaves
- preview range is NOT reflected in aria-selected (committed range only)

// Controlled
- renders controlled value
- calls onChange on selection
- does not mutate internal state when controlled

// Constraints
- minDate disables dates before it
- maxDate disables dates after it
- disabledDayOfWeek disables specific days
- disabledDates disables specific dates
- disabledDateRanges disables ranges

// numberOfMonths
- defaults to 2 months
- numberOfMonths=1 renders single month

// Locale / i18n
- weekStartsOn=1 starts week on Monday
- locale prop formats month names correctly
- RTL locale applies dir="rtl" and reverses separator arrow

// Selection hint
- hint text is "Select a start date" when phase="from"
- hint text includes start date and "Select an end date" when phase="to"
- hint has aria-live="polite"

// Accessibility
- trigger group has role="group"
- start trigger has role="combobox" and aria-haspopup="dialog"
- end trigger has role="combobox" and aria-haspopup="dialog"
- both triggers have aria-expanded reflecting popover state
- start trigger aria-label includes from date when set
- end trigger aria-label includes to date when set
- clear button has aria-label="Clear date range"
- calendar panel has role="dialog"

// axe
- axe: no selection
- axe: from selected only
- axe: full range selected
- axe: with error
- axe: with hint
- axe: disabled={true}
- axe: minDate constraint
- axe: disabledDayOfWeek
- axe: numberOfMonths=1
- axe: numberOfMonths=2
- axe: RTL locale
- axe: popover open, phase="from"
- axe: popover open, phase="to"
```

---

## Stories — `DateRangePicker.stories.tsx`

Title: `Core Components/DateRangePicker`

Named exports required:

- `Default` — uncontrolled, two months, no constraints.
- `WithLabel` — `label="Booking period"`, `id="booking"`.
- `WithError` — `error="End date must be after start date"`.
- `WithHint` — `hint="Select the start and end of your stay"`.
- `Controlled` — value managed with `useState`. Displays selected `from` and `to` as formatted text below the picker.
- `SingleMonth` — `numberOfMonths={1}`.
- `WithMinMax` — `minDate={today}`, `maxDate` 90 days from today. Useful for booking UIs.
- `DisabledWeekends` — `disabledDayOfWeek={[0, 6]}`.
- `DisabledSpecificRange` — a pre-defined blocked range (e.g. site maintenance window).
- `MondayStart` — `weekStartsOn={1}`.
- `FrenchLocale` — `locale={fr}` from `date-fns/locale`.
- `Disabled` — `disabled={true}` with a pre-filled range.
- `ReadOnly` — `readOnly={true}` with a pre-filled range.
- `ClearableOff` — `clearable={false}`.
- `InForm` — Inside a `<form>`, `name="stay"` prop. Submit shows `stay[from]` and `stay[to]` values from `FormData`.
- `SelectionFlow` — `play()` story that automates the two-step selection:

```ts
play: async ({ canvasElement }) => {
  const startTrigger = within(canvasElement).getByRole('combobox', { name: /start date/i });
  await userEvent.click(startTrigger);
  // Calendar opens — click a day button
  const day15 = within(document.body).getByRole('button', { name: /15/i });
  await userEvent.click(day15);
  // Hint should now say "Select an end date"
  await expect(within(document.body).getByText(/select an end date/i)).toBeVisible();
  // Click end date
  const day20 = within(document.body).getByRole('button', { name: /20/i });
  await userEvent.click(day20);
  // Popover should close
  await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
  // Start trigger should show date
  await expect(startTrigger).not.toHaveTextContent('Start date');
};
```

Use `autodocs`. Storybook group: `Core Components/DateRangePicker`.

---

## Definition of done

- [ ] DatePicker and its `_calendar.scss` partial exist and are verified before starting
- [ ] `CalendarPanel` re-used from DatePicker — not re-implemented
- [ ] All Vitest tests pass
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all states including both selection phases and RTL
- [ ] Storybook builds without error
- [ ] Two-step selection state machine implemented correctly
- [ ] Hover range preview is visual only — does not set `aria-selected` on preview days
- [ ] Both trigger buttons have `role="combobox"`, `aria-haspopup="dialog"`, `aria-expanded`
- [ ] Selection hint has `aria-live="polite"` and updates on phase change
- [ ] Focus returns to start trigger after range is fully selected and popover closes
- [ ] RTL: `dir="rtl"` on calendar, separator arrow flips, trigger order mirrors
- [ ] Range fill spans full cell width via CSS cell background (not button border-radius)
- [ ] Hidden inputs submit `yyyy-MM-dd` ISO format
- [ ] `border-radius: var(--dds-radius-none)` on all interactive elements — today dot the only exception
- [ ] No Tailwind. No hardcoded color, spacing, or font values.
- [ ] Exported from `packages/components/src/index.ts`

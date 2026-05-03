# DatePicker · node scaffolding.mjs DatePicker

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/Button/
packages/components/src/components/Input/
packages/components/src/components/Popover/
packages/components/src/components/
```

- Use the existing `Button` component for prev/next month navigation and the trigger input clear button.
- Use the existing `Input` component (or its internal SCSS patterns) for the date input trigger field.
- Use the existing `Popover` component for the calendar flyout — if it exists and is built on `@radix-ui/react-popover`, use it directly. If it does not yet exist, use `@radix-ui/react-popover` directly in this component.
- Do NOT use `@radix-ui/react-dialog` — the calendar panel is a non-modal popover, not a modal.

### Required dependency

Add to `packages/components/package.json` if not already present:

```json
"react-day-picker": "^8"
```

Do NOT use react-day-picker v9 — API differs significantly. Pin to v8.

### Shared calendar infrastructure

`DatePicker` and `DateRangePicker` both render a calendar grid. Extract shared calendar SCSS into a **shared partial** at:

```
packages/components/src/styles/_calendar.scss
```

Both `DatePicker.module.scss` and `DateRangePicker.module.scss` `@use` this partial. Do not duplicate calendar styles between the two components.

---

## Scaffold location

```
packages/components/src/components/DatePicker/
  DatePicker.tsx
  DatePicker.module.scss
  DatePicker.test.tsx
  DatePicker.stories.tsx
  index.ts
```

---

## Purpose

`DatePicker` is a form input that allows the user to select a single calendar date. It consists of a text input trigger that displays the selected date, and a popover calendar panel for visual date selection.

**DatePicker vs DateRangePicker:** DatePicker selects one date. DateRangePicker selects a start + end date range. They share the calendar grid infrastructure.

**DatePicker vs TimePicker:** DatePicker is date-only. Time is handled separately by `TimePicker`. They can be composed together by consumers.

---

## Exports from `index.ts`

```ts
export { DatePicker };
export type { DatePickerProps };
```

---

## Types

```ts
export interface DatePickerProps {
  // ─── Value ────────────────────────────────────────────────────────────────
  value?: Date | null; // controlled
  defaultValue?: Date | null; // uncontrolled
  onChange?: (date: Date | null) => void;

  // ─── Constraints ──────────────────────────────────────────────────────────
  minDate?: Date; // dates before this are disabled
  maxDate?: Date; // dates after this are disabled
  disabledDates?: Date[]; // specific dates to disable
  disabledDayOfWeek?: number[]; // 0=Sun … 6=Sat — disable specific weekdays
  disabledDateRanges?: Array<{ from: Date; to: Date }>; // disable date ranges

  // ─── Display ──────────────────────────────────────────────────────────────
  placeholder?: string; // default: 'Select date'
  dateFormat?: string; // date-fns format string — default: 'dd/MM/yyyy'
  locale?: Locale; // date-fns Locale object — default: enUS
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // default: derived from locale
  numberOfMonths?: 1 | 2; // default: 1 — 2 shows side-by-side months
  defaultMonth?: Date; // initial displayed month (uncontrolled)
  month?: Date; // controlled displayed month
  onMonthChange?: (month: Date) => void;

  // ─── Input trigger ────────────────────────────────────────────────────────
  id?: string; // wired to input for label association
  name?: string; // for form submission
  label?: string; // renders a visible <label> above the input
  required?: boolean; // default: false
  disabled?: boolean; // default: false
  readOnly?: boolean; // default: false — shows value, no popover
  error?: string; // renders error message below input
  hint?: string; // renders hint text below input
  clearable?: boolean; // default: true — shows × button when value is set
  inputClassName?: string;
  className?: string;

  // ─── Popover ──────────────────────────────────────────────────────────────
  align?: 'start' | 'center' | 'end'; // default: 'start' — popover alignment
  side?: 'top' | 'bottom'; // default: 'bottom'
}
```

---

## Architecture

### Component breakdown

```
DatePicker
  ├── <label>                    (when label prop provided)
  ├── Popover.Root               (Radix — controls open state)
  │     ├── Popover.Trigger asChild
  │     │     └── DateInputTrigger   (input + calendar icon + clear button)
  │     └── Popover.Content
  │           └── CalendarPanel      (react-day-picker + nav header)
  └── <p> error / hint
```

### DateInputTrigger (internal)

The trigger is a styled read-only `<input>` (not a real text input — the user selects via the calendar, not by typing). It displays the formatted date or the placeholder.

```tsx
// Internal component — not exported
const DateInputTrigger = React.forwardRef<HTMLButtonElement, DateInputTriggerProps>(
  ({ value, placeholder, disabled, readOnly, clearable, onClear, id, ...props }, ref) => (
    <div className={styles.triggerWrapper}>
      <button
        ref={ref}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={/* passed from Popover state */}
        aria-label={value ? `Selected date: ${value}. Press to change` : placeholder}
        disabled={disabled}
        className={clsx(
          styles.trigger,
          disabled && styles.triggerDisabled
          /* error class when error prop present */
        )}
        {...props}
      >
        <CalendarIcon className={styles.triggerIcon} aria-hidden="true" />
        <span className={clsx(styles.triggerText, !value && styles.triggerPlaceholder)}>
          {value ?? placeholder}
        </span>
      </button>
      {clearable && value && !disabled && !readOnly && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear selected date"
          className={styles.clearButton}
          tabIndex={-1}
        >
          <X aria-hidden="true" />
        </button>
      )}
    </div>
  )
);
```

**Why a `<button>` not an `<input>`:** The user cannot type into this field — date selection is calendar-only. A `<button role="combobox">` is semantically correct for a trigger that opens a selection panel. Do NOT use `<input readOnly>` — read-only inputs still suggest editability to screen readers.

### CalendarPanel (internal, shared with DateRangePicker)

```tsx
// Internal — not exported. Used by both DatePicker and DateRangePicker.
// Accepts react-day-picker DayPicker props + DDS nav header.

const CalendarPanel = ({
  mode, // 'single' | 'range'
  locale,
  weekStartsOn,
  numberOfMonths,
  month,
  onMonthChange,
  ...dayPickerProps
}: CalendarPanelProps) => (
  <div className={styles.calendar} role="dialog" aria-label="Date picker calendar">
    <DayPicker
      mode={mode}
      locale={locale}
      weekStartsOn={weekStartsOn}
      numberOfMonths={numberOfMonths}
      month={month}
      onMonthChange={onMonthChange}
      showOutsideDays
      fixedWeeks
      classNames={{
        root: styles.rdpRoot,
        months: styles.rdpMonths,
        month: styles.rdpMonth,
        caption: styles.rdpCaption,
        caption_label: styles.rdpCaptionLabel,
        nav: styles.rdpNav,
        nav_button: styles.rdpNavButton,
        nav_button_previous: styles.rdpNavButtonPrev,
        nav_button_next: styles.rdpNavButtonNext,
        table: styles.rdpTable,
        head_row: styles.rdpHeadRow,
        head_cell: styles.rdpHeadCell,
        row: styles.rdpRow,
        cell: styles.rdpCell,
        day: styles.rdpDay,
        day_selected: styles.rdpDaySelected,
        day_today: styles.rdpDayToday,
        day_outside: styles.rdpDayOutside,
        day_disabled: styles.rdpDayDisabled,
        day_range_start: styles.rdpDayRangeStart,
        day_range_end: styles.rdpDayRangeEnd,
        day_range_middle: styles.rdpDayRangeMiddle,
        day_hidden: styles.rdpDayHidden,
      }}
      {...dayPickerProps}
    />
  </div>
);
```

### react-day-picker integration notes

- Pass `classNames` map to override ALL default rdp-\* CSS classes with DDS SCSS module classes. Never import `react-day-picker/dist/style.css` — DDS owns all styles.
- `showOutsideDays`: renders days from adjacent months (greyed out) — necessary for a full 6×7 grid.
- `fixedWeeks`: ensures the calendar always shows 6 weeks, preventing height shift between months.
- Disabled dates are passed via the `disabled` prop on `DayPicker`:

```tsx
const disabledMatcher = [
  ...(minDate ? [{ before: minDate }] : []),
  ...(maxDate ? [{ after: maxDate }] : []),
  ...(disabledDates ?? []),
  ...(disabledDayOfWeek ? [{ dayOfWeek: disabledDayOfWeek }] : []),
  ...(disabledDateRanges ?? []),
];
// Pass as: disabled={disabledMatcher}
```

### Date formatting

Use `date-fns` for formatting — it is a peer dependency of `react-day-picker` and will already be installed. Do NOT use `new Date().toLocaleDateString()` — it is locale-inconsistent across environments.

```ts
import { format, isValid } from 'date-fns';

const formatDate = (date: Date | null, formatStr: string): string => {
  if (!date || !isValid(date)) return '';
  return format(date, formatStr);
};
```

### Popover open/close behaviour

- Opens when trigger button is clicked.
- Closes when a date is selected (after `onDayClick` fires).
- Closes on Escape (Radix handles this).
- Closes on click outside (Radix handles this).
- Does NOT close on month navigation.

```tsx
const [open, setOpen] = React.useState(false);

const handleDaySelect = (date: Date | undefined) => {
  onChange?.(date ?? null);
  if (date) setOpen(false); // close on selection
};
```

---

## Component structure

```tsx
// DatePicker.tsx
import { DayPicker } from 'react-day-picker';
import * as RadixPopover from '@radix-ui/react-popover';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isValid } from 'date-fns';
import clsx from 'clsx';
import { Button } from '../Button';
import styles from './DatePicker.module.scss';

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      minDate,
      maxDate,
      disabledDates,
      disabledDayOfWeek,
      disabledDateRanges,
      placeholder = 'Select date',
      dateFormat = 'dd/MM/yyyy',
      locale,
      weekStartsOn,
      numberOfMonths = 1,
      defaultMonth,
      month,
      onMonthChange,
      id,
      name,
      label,
      required = false,
      disabled = false,
      readOnly = false,
      error,
      hint,
      clearable = true,
      align = 'start',
      side = 'bottom',
      inputClassName,
      className,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<Date | null>(defaultValue ?? null);
    const isControlled = value !== undefined;
    const selectedDate = isControlled ? value : internalValue;

    const handleSelect = (date: Date | undefined) => {
      const next = date ?? null;
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
      if (date) setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) setInternalValue(null);
      onChange?.(null);
    };

    const displayValue = selectedDate ? formatDate(selectedDate, dateFormat) : '';

    const disabledMatcher = buildDisabledMatcher({
      minDate,
      maxDate,
      disabledDates,
      disabledDayOfWeek,
      disabledDateRanges,
    });

    // Hidden input for form submission
    const hiddenInputValue = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

    return (
      <div className={clsx(styles.root, className)}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
            {required && (
              <span className={styles.required} aria-hidden="true">
                {' '}
                *
              </span>
            )}
          </label>
        )}
        <RadixPopover.Root open={open} onOpenChange={readOnly ? undefined : setOpen}>
          <RadixPopover.Trigger asChild>
            <DateInputTrigger
              ref={ref}
              id={id}
              value={displayValue}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              clearable={clearable}
              hasError={!!error}
              onClear={handleClear}
              aria-required={required}
              aria-invalid={!!error}
              aria-describedby={
                [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') ||
                undefined
              }
              className={inputClassName}
            />
          </RadixPopover.Trigger>
          <RadixPopover.Portal>
            <RadixPopover.Content
              side={side}
              align={align}
              sideOffset={4}
              className={styles.popoverContent}
              onOpenAutoFocus={(e) => e.preventDefault()} // we manage focus manually
            >
              <CalendarPanel
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={handleSelect}
                disabled={disabledMatcher}
                locale={locale}
                weekStartsOn={weekStartsOn}
                numberOfMonths={numberOfMonths}
                month={month}
                defaultMonth={defaultMonth ?? selectedDate ?? undefined}
                onMonthChange={onMonthChange}
              />
            </RadixPopover.Content>
          </RadixPopover.Portal>
        </RadixPopover.Root>
        {name && <input type="hidden" name={name} value={hiddenInputValue} />}
        {error && (
          <p id={`${id}-error`} className={styles.error} role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${id}-hint`} className={styles.hint}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';
```

---

## Shared SCSS partial — `packages/components/src/styles/_calendar.scss`

This partial is `@use`d by both `DatePicker.module.scss` and `DateRangePicker.module.scss`. Define all calendar grid styles here once.

```scss
// _calendar.scss — shared by DatePicker and DateRangePicker

// ─── Calendar panel wrapper ───────────────────────────────────────────────────

%calendar {
  padding: var(--dds-space-4);
  background-color: var(--dds-color-bg-popover);
  user-select: none;
}

// ─── Months layout ────────────────────────────────────────────────────────────

%rdpMonths {
  display: flex;
  gap: var(--dds-space-6);
}

%rdpMonth {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-3);
}

// ─── Caption (month + year label + nav) ───────────────────────────────────────

%rdpCaption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--dds-space-2);
}

%rdpCaptionLabel {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-default);
}

// ─── Nav buttons ─────────────────────────────────────────────────────────────

%rdpNav {
  display: flex;
  gap: var(--dds-space-1);
}

%rdpNavButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--dds-radius-none);
  color: var(--dds-color-text-muted);
  cursor: pointer;
  transition:
    background-color var(--dds-duration-fast) var(--dds-ease-standard),
    color var(--dds-duration-fast) var(--dds-ease-standard);

  &:hover:not(:disabled) {
    background-color: var(--dds-color-action-ghost-hover);
    color: var(--dds-color-text-default);
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  svg {
    width: var(--dds-icon-size-md);
    height: var(--dds-icon-size-md);
  }
}

// ─── Table ────────────────────────────────────────────────────────────────────

%rdpTable {
  width: 100%;
  border-collapse: collapse;
}

// ─── Weekday headers ─────────────────────────────────────────────────────────

%rdpHeadRow {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: var(--dds-space-1);
}

%rdpHeadCell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 28px;
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--dds-tracking-wide);
}

// ─── Day rows and cells ───────────────────────────────────────────────────────

%rdpRow {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

%rdpCell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
}

// ─── Day button ───────────────────────────────────────────────────────────────

%rdpDay {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  margin: 1px;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--dds-radius-none);
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-default);
  cursor: pointer;
  font-variant-numeric: tabular-nums;
  transition: background-color var(--dds-duration-fast) var(--dds-ease-standard);

  &:hover:not(.rdpDayDisabled):not(.rdpDaySelected) {
    background-color: var(--dds-color-action-ghost-hover);
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
    z-index: 1;
  }
}

// ─── Day states ───────────────────────────────────────────────────────────────

%rdpDaySelected {
  background-color: var(--dds-color-action-primary);
  color: var(--dds-color-action-primary-foreground);
  font-weight: var(--dds-font-weight-semibold);

  &:hover {
    background-color: var(--dds-color-action-primary-hover);
  }
}

%rdpDayToday {
  font-weight: var(--dds-font-weight-bold);
  border-color: var(--dds-color-action-primary);

  // Today that is also selected: selected bg wins, today indicator via underline
  &.rdpDaySelected::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: var(--dds-radius-full); // documented exception — indicator dot
    background-color: var(--dds-color-action-primary-foreground);
  }
}

%rdpDayOutside {
  color: var(--dds-color-text-muted);
  opacity: 0.4;
}

%rdpDayDisabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

%rdpDayHidden {
  visibility: hidden;
}

// ─── Range states (used by DateRangePicker) ───────────────────────────────────

%rdpDayRangeStart {
  background-color: var(--dds-color-action-primary);
  color: var(--dds-color-action-primary-foreground);
  font-weight: var(--dds-font-weight-semibold);
}

%rdpDayRangeEnd {
  background-color: var(--dds-color-action-primary);
  color: var(--dds-color-action-primary-foreground);
  font-weight: var(--dds-font-weight-semibold);
}

%rdpDayRangeMiddle {
  background-color: oklch(from var(--dds-color-action-primary) l c h / 0.1);
  color: var(--dds-color-text-default);
  border-radius: var(--dds-radius-none);
  margin: 1px 0; // no horizontal margin — range fill spans full cell width
}
```

## SCSS — DatePicker.module.scss

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

// ─── Trigger wrapper ─────────────────────────────────────────────────────────

.triggerWrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.trigger {
  display: flex;
  align-items: center;
  gap: var(--dds-space-2);
  width: 100%;
  height: 40px;
  padding: 0 var(--dds-space-3);
  padding-right: var(--dds-space-9); // space for clear button
  background-color: var(--dds-color-bg-input);
  border: 1px solid var(--dds-color-border-input);
  border-radius: var(--dds-radius-none);
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-default);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--dds-duration-fast) var(--dds-ease-standard);

  &:hover:not(.triggerDisabled) {
    border-color: var(--dds-color-action-primary);
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }

  &.triggerError {
    border-color: var(--dds-color-status-danger);
  }
}

.triggerDisabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
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

// ─── Clear button ─────────────────────────────────────────────────────────────

.clearButton {
  position: absolute;
  right: var(--dds-space-2);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--dds-radius-none);
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

// ─── Calendar (extends shared partial) ───────────────────────────────────────

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

## Accessibility

### Roles and labels

- Trigger button: `role="combobox"`, `aria-haspopup="dialog"`, `aria-expanded`, `aria-label` describing selected date or placeholder.
- Calendar panel: `role="dialog"`, `aria-label="Date picker calendar"` — Radix Popover.Content renders a `div`; set `role` and `aria-label` explicitly on the inner `CalendarPanel` wrapper.
- react-day-picker v8 renders the calendar as a `<table>` with full ARIA: `role="grid"` on the table, day buttons with `aria-label` including the full date string (e.g. "Wednesday, January 15, 2025"), `aria-selected` on selected days, `aria-disabled` on disabled days. **Do not suppress or override these.** They are correct.
- Weekday header cells: react-day-picker renders `abbr title="Wednesday">We</abbr>` — the full weekday name is in `title`. Do not override this pattern.
- Clear button: `aria-label="Clear selected date"`.
- Error message: `role="alert"` — announced immediately on appearance.
- `aria-invalid={!!error}` on trigger button.
- `aria-required={required}` on trigger button.
- `aria-describedby` on trigger: points to error id and/or hint id.
- Hidden `<input type="hidden">` for form submission — `ISO 8601 yyyy-MM-dd` format for consistent server parsing.

### Keyboard interactions

| Element        | Key               | Behaviour                                        |
| -------------- | ----------------- | ------------------------------------------------ |
| Trigger button | `Enter`/`Space`   | Opens calendar popover                           |
| Trigger button | `Tab`             | Moves to clear button (if visible), then outside |
| Calendar       | `ArrowLeft/Right` | Moves focus to previous/next day                 |
| Calendar       | `ArrowUp/Down`    | Moves focus to same day previous/next week       |
| Calendar       | `PageUp/Down`     | Navigates to previous/next month                 |
| Calendar       | `Shift+PageUp`    | Navigates to previous year                       |
| Calendar       | `Shift+PageDown`  | Navigates to next year                           |
| Calendar       | `Home`            | Moves focus to first day of week                 |
| Calendar       | `End`             | Moves focus to last day of week                  |
| Calendar       | `Enter`/`Space`   | Selects focused day, closes popover              |
| Calendar       | `Escape`          | Closes popover, returns focus to trigger         |

react-day-picker v8 implements all calendar keyboard navigation natively. Do not re-implement it.

### RTL support

- Pass `dir="rtl"` to the `CalendarPanel` div when `locale` has an RTL script. Detect via `locale.options?.dir ?? 'ltr'` from date-fns locale.
- react-day-picker v8 supports RTL layout natively when `dir="rtl"` is on a parent element — nav buttons flip automatically.
- Popover alignment: in RTL, default to `align="end"` instead of `align="start"`.

---

## TDD — write ALL tests before implementing

Run scaffolding first: `node scaffolding.mjs DatePicker`

```
// Rendering
- renders trigger button with placeholder when no value
- renders trigger button with formatted date when value provided
- renders label when label prop provided
- label has htmlFor matching id prop
- required asterisk renders when required={true}
- renders error message when error prop provided
- error message has role="alert"
- renders hint text when hint prop provided
- error and hint not both visible simultaneously (error takes precedence)
- hidden input renders when name prop provided
- hidden input has ISO date value when date selected
- clear button renders when value is set and clearable={true}
- clear button does NOT render when no value
- clear button does NOT render when clearable={false}
- clear button does NOT render when disabled={true}

// Open/close
- calendar popover opens when trigger is clicked
- calendar popover closes when Escape is pressed
- calendar popover closes when a date is selected
- calendar popover does NOT open when disabled={true}
- calendar popover does NOT open when readOnly={true}

// Date selection
- selecting a date calls onChange with Date object
- selecting same date again does not duplicate calls
- clicking clear button calls onChange(null)
- clicking clear button clears the displayed value

// Controlled mode
- renders controlled value
- does not update internal state when controlled
- calls onChange when date selected in controlled mode

// Constraints
- minDate disables all dates before it
- maxDate disables all dates after it
- disabledDates disables specific dates
- disabledDayOfWeek disables specific weekdays (e.g. Saturday=6, Sunday=0)
- disabledDateRanges disables date ranges

// Locale / i18n
- weekStartsOn=1 renders Monday as first column
- weekStartsOn=0 renders Sunday as first column
- locale prop formats month names in the correct language
- RTL locale sets dir="rtl" on calendar panel

// numberOfMonths
- numberOfMonths=2 renders two month grids

// Accessibility (ARIA)
- trigger has role="combobox"
- trigger has aria-haspopup="dialog"
- trigger has aria-expanded="false" when closed
- trigger has aria-expanded="true" when open
- trigger has aria-label including date when selected
- trigger has aria-invalid="true" when error prop set
- trigger has aria-required="true" when required={true}
- trigger has aria-describedby pointing to error id
- calendar panel has role="dialog"
- clear button has aria-label="Clear selected date"

// axe
- axe: closed state
- axe: open state, no value
- axe: open state, value selected
- axe: with error prop
- axe: with hint prop
- axe: disabled={true}
- axe: with minDate constraint
- axe: with disabledDayOfWeek (weekends)
- axe: numberOfMonths=2
- axe: RTL locale
```

---

## Stories — `DatePicker.stories.tsx`

Title: `Core Components/DatePicker`

Named exports required:

- `Default` — uncontrolled, no constraints.
- `WithLabel` — `label="Start date"`, `id="start-date"`.
- `WithLabelRequired` — `required={true}`, `label="Date of birth"`.
- `WithError` — `error="Please select a valid date"`.
- `WithHint` — `hint="Select your preferred appointment date"`.
- `Controlled` — `value` and `onChange` managed with `useState`. Shows selected date outside the picker.
- `ClearableOff` — `clearable={false}`.
- `Disabled` — `disabled={true}`.
- `ReadOnly` — `readOnly={true}`, `defaultValue={new Date()}`.
- `WithMinMax` — `minDate={new Date()}` `maxDate` 30 days from now. Past dates and future dates beyond 30 days disabled.
- `DisabledWeekends` — `disabledDayOfWeek={[0, 6]}`.
- `DisabledSpecificDates` — three specific dates disabled.
- `TwoMonths` — `numberOfMonths={2}`.
- `MondayStart` — `weekStartsOn={1}`.
- `FrenchLocale` — `locale={fr}` from `date-fns/locale`. Month names and weekday headers in French.
- `CustomFormat` — `dateFormat="MMMM d, yyyy"`.
- `InForm` — DatePicker inside a `<form>`. Submit button logs form data to `actions`. Uses `name` prop to demonstrate hidden input submission.

Use `autodocs`. Storybook group: `Core Components/DatePicker`.

---

## Definition of done

- [ ] `react-day-picker@^8` added to `package.json`
- [ ] Shared `_calendar.scss` partial created at `packages/components/src/styles/`
- [ ] Never imports `react-day-picker/dist/style.css` — all styles via DDS SCSS
- [ ] All Vitest tests pass
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants including RTL
- [ ] Storybook builds without error
- [ ] Trigger is `<button role="combobox">` — NOT `<input readOnly>`
- [ ] Calendar panel has `role="dialog"` and `aria-label`
- [ ] `aria-expanded` toggles correctly on trigger
- [ ] `aria-invalid` set from `error` prop
- [ ] `aria-describedby` wires to error/hint ids
- [ ] Hidden `<input type="hidden">` submits ISO `yyyy-MM-dd` value
- [ ] RTL: `dir="rtl"` on calendar panel when locale is RTL
- [ ] `weekStartsOn` respects locale and explicit prop
- [ ] `border-radius: var(--dds-radius-none)` everywhere — only exception: today dot indicator uses `var(--dds-radius-full)`
- [ ] No Tailwind. No hardcoded color or spacing values in SCSS.
- [ ] Exported from `packages/components/src/index.ts`

# TimePicker · node scaffolding.mjs TimePicker

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/Button/
packages/components/src/components/Input/
packages/components/src/components/
```

- No Radix primitive and no third-party library. TimePicker is a custom compound component built from native `<select>` elements and optional `<input type="number">` fields, styled with SCSS modules.
- No react-day-picker dependency — this component has nothing to do with date selection.
- Use the existing `Button` component for the optional increment/decrement buttons if present.

---

## Scaffold location

```
packages/components/src/components/TimePicker/
  TimePicker.tsx
  TimePicker.module.scss
  TimePicker.test.tsx
  TimePicker.stories.tsx
  index.ts
```

---

## Purpose

`TimePicker` is a form input for selecting a time value. It uses dropdown `<select>` elements for hour, minute, and optionally second segments — the most keyboard-accessible approach across all devices and assistive technologies.

**Composition with DatePicker:**
`TimePicker` and `DatePicker` are intentionally separate. Consumers compose them side-by-side when a full datetime is needed:

```tsx
<DatePicker id="appt-date" label="Date" value={date} onChange={setDate} />
<TimePicker id="appt-time" label="Time" value={time} onChange={setTime} />
```

---

## Exports from `index.ts`

```ts
export { TimePicker };
export type { TimePickerProps, TimeValue, TimePrecision };
```

---

## Types

```ts
export type TimePrecision = 'minutes' | 'seconds'; // default: 'minutes'

export interface TimeValue {
  hours: number; // 0–23 (always 24h internally; display format is consumer-controlled)
  minutes: number; // 0–59
  seconds?: number; // 0–59 — only present when precision="seconds"
}

export interface TimePickerProps {
  // ─── Value ────────────────────────────────────────────────────────────────
  value?: TimeValue | null; // controlled
  defaultValue?: TimeValue | null; // uncontrolled
  onChange?: (value: TimeValue | null) => void;

  // ─── Granularity ─────────────────────────────────────────────────────────
  precision?: TimePrecision; // default: 'minutes'
  minuteStep?: number; // default: 1 — options: 1, 5, 10, 15, 30
  secondStep?: number; // default: 1 — used when precision="seconds"

  // ─── Display ──────────────────────────────────────────────────────────────
  use12Hour?: boolean; // default: false — shows AM/PM select when true
  hourLabel?: string; // default: 'Hour' — aria-label on hour select
  minuteLabel?: string; // default: 'Minute'
  secondLabel?: string; // default: 'Second' — shown when precision="seconds"
  amPmLabel?: string; // default: 'AM/PM' — shown when use12Hour=true
  placeholder?: string; // default: '--:--' shown when no value

  // ─── Form ─────────────────────────────────────────────────────────────────
  id?: string; // base id — segments get ${id}-hour, ${id}-minute etc.
  name?: string; // hidden input gets this name in HH:mm[:ss] format
  label?: string; // visible <label> above the field
  required?: boolean; // default: false
  disabled?: boolean; // default: false
  readOnly?: boolean; // default: false
  error?: string;
  hint?: string;

  // ─── Constraints ──────────────────────────────────────────────────────────
  minTime?: TimeValue; // times before this are disabled
  maxTime?: TimeValue; // times after this are disabled
  disabledTimes?: TimeValue[]; // specific times to disable

  className?: string;
}
```

---

## Architecture

### Internal representation

Time is stored internally in 24-hour format (`hours: 0–23`) regardless of `use12Hour`. The 12-hour display is a view concern only — conversion happens at the select render and onChange boundary.

### Segment selects

TimePicker renders a group of `<select>` elements, one per time segment. Each select contains `<option>` elements generated from the valid range and step:

```
[Hour select] : [Minute select] [:] [Second select — if precision="seconds"] [AM/PM select — if use12Hour]
```

Colons between segments are `aria-hidden="true"` decorative separators.

### Hour options

When `use12Hour={false}` (default, 24h):

```ts
// 0–23, displayed as "00"–"23"
Array.from({ length: 24 }, (_, i) => ({ value: i, label: String(i).padStart(2, '0') }));
```

When `use12Hour={true}` (12h):

```ts
// Display: 12, 1–11, displayed with AM/PM separate
// Internal value: still 0–23
// 12 AM = 0, 1 AM = 1, … 11 AM = 11, 12 PM = 12, 1 PM = 13, … 11 PM = 23
const twelveHourOptions = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => ({
  value: h, // display hour (1–12)
  label: String(h).padStart(2, '0'),
}));
```

Conversion helpers (implement as pure functions in the component file):

```ts
const to24Hour = (hour12: number, ampm: 'AM' | 'PM'): number => {
  if (ampm === 'AM') return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
};

const to12Hour = (hour24: number): { hour12: number; ampm: 'AM' | 'PM' } => {
  if (hour24 === 0) return { hour12: 12, ampm: 'AM' };
  if (hour24 < 12) return { hour12: hour24, ampm: 'AM' };
  if (hour24 === 12) return { hour12: 12, ampm: 'PM' };
  return { hour12: hour24 - 12, ampm: 'PM' };
};
```

### Minute options

```ts
const minuteOptions = Array.from({ length: Math.ceil(60 / (minuteStep ?? 1)) }, (_, i) => {
  const v = i * (minuteStep ?? 1);
  return { value: v, label: String(v).padStart(2, '0') };
});
```

### Second options

Same pattern as minutes, using `secondStep`.

### Constraints

`minTime` and `maxTime` disable individual `<option>` elements:

```ts
const isTimeDisabled = (h: number, m: number, s: number = 0): boolean => {
  const total = h * 3600 + m * 60 + s;
  if (minTime) {
    const minTotal = minTime.hours * 3600 + minTime.minutes * 60 + (minTime.seconds ?? 0);
    if (total < minTotal) return true;
  }
  if (maxTime) {
    const maxTotal = maxTime.hours * 3600 + maxTime.minutes * 60 + (maxTime.seconds ?? 0);
    if (total > maxTotal) return true;
  }
  if (disabledTimes?.some((t) => t.hours === h && t.minutes === m && (t.seconds ?? 0) === s))
    return true;
  return false;
};
```

For the hour select, disable an hour if ALL minute options within it are disabled (prevents confusing partial-hour availability). For the minute select, disable options based on the currently selected hour.

### onChange

Emit `onChange` on every segment change. If all required segments have a value, emit a complete `TimeValue`. If any required segment is unset (user hasn't selected yet), emit `null`:

```ts
const handleSegmentChange = (
  segment: 'hours' | 'minutes' | 'seconds' | 'ampm',
  rawValue: string
) => {
  // Merge into current value
  // If all required segments are present, call onChange(complete TimeValue)
  // If not, call onChange(null)
};
```

### Hidden input for form submission

Format: `HH:mm` (24h) for `precision="minutes"` and `HH:mm:ss` for `precision="seconds"`.

```tsx
{
  name && value && (
    <input
      type="hidden"
      name={name}
      value={`${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}${
        precision === 'seconds' ? `:${String(value.seconds ?? 0).padStart(2, '0')}` : ''
      }`}
    />
  );
}
```

---

## Component structure

```tsx
// TimePicker.tsx
import clsx from 'clsx';
import styles from './TimePicker.module.scss';

export const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      precision = 'minutes',
      minuteStep = 1,
      secondStep = 1,
      use12Hour = false,
      hourLabel = 'Hour',
      minuteLabel = 'Minute',
      secondLabel = 'Second',
      amPmLabel = 'AM/PM',
      id,
      name,
      label,
      required = false,
      disabled = false,
      readOnly = false,
      error,
      hint,
      minTime,
      maxTime,
      disabledTimes,
      className,
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<TimeValue | null>(
      defaultValue ?? null
    );
    const current = isControlled ? value : internalValue;

    // 12h display state — only relevant when use12Hour=true
    const [ampm, setAmpm] = React.useState<'AM' | 'PM'>(() => {
      if (current) return to12Hour(current.hours).ampm;
      return 'AM';
    });

    const hourOptions = buildHourOptions(use12Hour);
    const minuteOptions = buildMinuteOptions(minuteStep);
    const secondOptions = buildSecondOptions(secondStep);

    const displayHour = current ? (use12Hour ? to12Hour(current.hours).hour12 : current.hours) : '';

    const handleChange = (segment: string, rawValue: string) => {
      // Build updated TimeValue, call onChange
      // ...implementation detail left to agent
    };

    return (
      <div ref={ref} className={clsx(styles.root, className)}>
        {label && (
          <label className={styles.label}>
            {label}
            {required && (
              <span className={styles.required} aria-hidden="true">
                {' '}
                *
              </span>
            )}
          </label>
        )}

        <div
          className={clsx(
            styles.segmentGroup,
            disabled && styles.segmentGroupDisabled,
            !!error && styles.segmentGroupError
          )}
          role="group"
          aria-label={label ?? 'Time'}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={
            [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined
          }
        >
          {/* Hour */}
          <select
            id={`${id}-hour`}
            value={displayHour}
            onChange={(e) => handleChange('hours', e.target.value)}
            disabled={disabled}
            aria-label={hourLabel}
            className={clsx(styles.segment, styles.segmentHour)}
          >
            <option value="" disabled hidden>
              --
            </option>
            {hourOptions.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <span className={styles.separator} aria-hidden="true">
            :
          </span>

          {/* Minute */}
          <select
            id={`${id}-minute`}
            value={current?.minutes ?? ''}
            onChange={(e) => handleChange('minutes', e.target.value)}
            disabled={disabled}
            aria-label={minuteLabel}
            className={clsx(styles.segment, styles.segmentMinute)}
          >
            <option value="" disabled hidden>
              --
            </option>
            {minuteOptions.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={isTimeDisabled(current?.hours ?? 0, opt.value)}
              >
                {opt.label}
              </option>
            ))}
          </select>

          {/* Second */}
          {precision === 'seconds' && (
            <>
              <span className={styles.separator} aria-hidden="true">
                :
              </span>
              <select
                id={`${id}-second`}
                value={current?.seconds ?? ''}
                onChange={(e) => handleChange('seconds', e.target.value)}
                disabled={disabled}
                aria-label={secondLabel}
                className={clsx(styles.segment, styles.segmentSecond)}
              >
                <option value="" disabled hidden>
                  --
                </option>
                {secondOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* AM/PM */}
          {use12Hour && (
            <>
              <span className={styles.ampmSpacer} aria-hidden="true" />
              <select
                id={`${id}-ampm`}
                value={ampm}
                onChange={(e) => handleChange('ampm', e.target.value)}
                disabled={disabled}
                aria-label={amPmLabel}
                className={clsx(styles.segment, styles.segmentAmPm)}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </>
          )}
        </div>

        {name && current && (
          <input type="hidden" name={name} value={formatTimeValue(current, precision)} />
        )}

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
TimePicker.displayName = 'TimePicker';
```

---

## SCSS — TimePicker.module.scss

```scss
@use '../../../styles/mixins' as *;

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

// ─── Segment group ────────────────────────────────────────────────────────────

.segmentGroup {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--dds-color-border-input);
  background-color: var(--dds-color-bg-input);
  height: 40px;
  transition: border-color var(--dds-duration-fast) var(--dds-ease-standard);

  &:hover:not(.segmentGroupDisabled) {
    border-color: var(--dds-color-action-primary);
  }

  // Focus-within — shows focus ring when any segment is focused
  &:focus-within {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }

  &.segmentGroupError {
    border-color: var(--dds-color-status-danger);
  }

  &.segmentGroupDisabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

// ─── Individual segment select ────────────────────────────────────────────────

.segment {
  // Remove browser default select styling
  appearance: none;
  -webkit-appearance: none;
  background: none;
  border: none;
  border-radius: var(--dds-radius-none);

  height: 100%;
  padding: 0 var(--dds-space-2);

  font-family: var(--dds-font-mono);
  font-size: var(--dds-font-size-sm);
  font-variant-numeric: tabular-nums;
  color: var(--dds-color-text-default);
  text-align: center;
  cursor: pointer;

  // Individual focus ring suppressed — group handles it via :focus-within
  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: none;
  }

  // Hover highlight on individual segment
  &:hover:not(:disabled) {
    background-color: var(--dds-color-action-ghost-hover);
  }
}

// Widths — fixed per segment to prevent layout shift as values change
.segmentHour {
  width: 44px;
}
.segmentMinute {
  width: 44px;
}
.segmentSecond {
  width: 44px;
}
.segmentAmPm {
  width: 52px;
}

// ─── Separator ────────────────────────────────────────────────────────────────

.separator {
  font-family: var(--dds-font-mono);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-muted);
  padding: 0 var(--dds-space-0-5);
  pointer-events: none;
  user-select: none;
}

.ampmSpacer {
  width: var(--dds-space-2);
  flex-shrink: 0;
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

### Why `<select>` not custom dropdowns

Native `<select>` elements are the most accessible time input pattern:

- Built-in keyboard navigation (Arrow keys, type-to-jump) on all platforms.
- Full screen reader support on all platforms — VoiceOver, NVDA, JAWS all announce `<select>` label, current value, and available options correctly.
- Mobile: opens native OS picker (scroll wheel on iOS, dropdown on Android) — far superior to any custom implementation.
- Do not replace with custom dropdown components — the accessibility cost is high and the visual gain is negligible within DDS constraints.

### Role and label structure

- Segment group `<div>`: `role="group"`, `aria-label` — announces as "Time, group" to screen readers, making the context clear before navigating into individual selects.
- Each `<select>` has its own `aria-label` (hourLabel, minuteLabel, etc.) — this is the accessible name for the individual control. Do NOT rely on adjacent text or placeholder-style options for the name.
- `aria-required` on the group div — not on individual selects (the required constraint is for the time value as a whole).
- `aria-invalid` on the group div — error state applies to the whole time value.
- `aria-describedby` on the group div — points to error and/or hint paragraph ids.
- Error paragraph: `role="alert"` — announced immediately.
- Hidden `<input type="hidden">` for form submission — `HH:mm` or `HH:mm:ss` format (ISO 8601 time).

### `<option disabled>` for constraints

- `minTime`/`maxTime` disabled options have `disabled` attribute — screen readers announce them as "dimmed" or "unavailable".
- Do not remove disabled options from the DOM — removing them would confuse users about what values exist.

### Label association

- When `label` prop is provided, the visible `<label>` should reference the group with `htmlFor` pointing to the group div's `id` — OR use `aria-labelledby` on the group div. The group div does not render as a form control so `htmlFor` technically does not associate programmatically. Instead:
  - Give the `<label>` an `id` (e.g. `${id}-label`).
  - Add `aria-labelledby={`${id}-label`}` to the group div.
  - This makes the label click do nothing useful (no focusable control to jump to) — compensate by making the `<label>` click focus the first segment select: use `onClick={() => document.getElementById(`${id}-hour`)?.focus()}` on the label.

### Keyboard interactions

| Element      | Key             | Behaviour                                                     |
| ------------ | --------------- | ------------------------------------------------------------- |
| Hour select  | `Tab`           | Moves to minute select                                        |
| Any select   | `↑` / `↓`       | Increments / decrements value (browser-native for `<select>`) |
| Any select   | Printable chars | Type-ahead jumps to matching option (browser-native)          |
| AM/PM select | `a` / `p`       | Jumps to AM / PM option                                       |
| Any select   | `Shift+Tab`     | Moves to previous segment                                     |

### RTL support

- Segment order (hour : minute : second AM/PM) stays the same in RTL — time notation does not mirror.
- The container `flex-direction` does NOT reverse in RTL.
- Separators remain visually between segments regardless of text direction.
- The `<select>` elements themselves handle their own RTL text rendering.

---

## TDD — write ALL tests before implementing

Run scaffolding first: `node scaffolding.mjs TimePicker`

```
// Rendering
- renders hour select
- renders minute select
- does NOT render second select when precision="minutes" (default)
- renders second select when precision="seconds"
- does NOT render AM/PM select when use12Hour=false (default)
- renders AM/PM select when use12Hour=true
- renders label when label prop provided
- label click focuses hour select
- renders error when error prop provided
- error has role="alert"
- renders hint when hint prop provided
- renders hidden input when name prop provided
- hidden input value is HH:mm when precision="minutes"
- hidden input value is HH:mm:ss when precision="seconds"
- required asterisk renders when required={true}

// Options
- hour select renders 24 options (0–23) in 24h mode
- hour select renders 12 options (12, 1–11) in 12h mode
- minute select renders 60 options when minuteStep=1
- minute select renders 12 options when minuteStep=5
- minute select renders 6 options when minuteStep=10
- minute select renders 4 options when minuteStep=15
- minute select renders 2 options when minuteStep=30
- second select renders options matching secondStep

// Selection
- selecting hour calls onChange with updated hours
- selecting minute calls onChange with updated minutes
- selecting second calls onChange with updated seconds
- onChange is not called when only hour is selected (minutes not set)
- onChange is called with full TimeValue when all required segments are set
- selecting AM/PM updates hours correctly (12AM→0, 12PM→12, 1PM→13)
- clearing hour segment calls onChange(null)

// Controlled mode
- renders controlled value in selects
- calls onChange on segment change
- does not update internal state when controlled

// 12-hour mode
- hour value 0 displays as 12 AM
- hour value 12 displays as 12 PM
- hour value 13 displays as 1 PM
- hour value 23 displays as 11 PM

// Constraints
- minTime disables earlier times in hour select
- maxTime disables later times in hour select
- disabledTimes disables specific time options
- disabled hour where ALL minutes are disabled
- minute options disabled based on selected hour + minTime

// minuteStep
- minuteStep=15 produces options 0, 15, 30, 45

// Disabled / readOnly
- disabled={true} disables all selects
- segmentGroup has disabled styling

// Accessibility
- segment group has role="group"
- segment group has aria-label
- segment group has aria-required when required={true}
- segment group has aria-invalid when error present
- segment group has aria-describedby pointing to error id
- hour select has aria-label matching hourLabel
- minute select has aria-label matching minuteLabel
- second select has aria-label matching secondLabel
- AM/PM select has aria-label matching amPmLabel
- separator spans are aria-hidden
- error has role="alert"

// axe
- axe: empty (no value)
- axe: with value set
- axe: precision="seconds"
- axe: use12Hour=true
- axe: use12Hour=true with value in PM
- axe: with error
- axe: with hint
- axe: disabled={true}
- axe: minTime constraint
- axe: minuteStep=15
- axe: composed with DatePicker (both in a form)
```

---

## Stories — `TimePicker.stories.tsx`

Title: `Core Components/TimePicker`

Named exports required:

- `Default` — 24h, precision="minutes", no constraints.
- `WithLabel` — `label="Appointment time"`, `id="appt-time"`.
- `TwelveHour` — `use12Hour={true}`.
- `WithSeconds` — `precision="seconds"`.
- `TwelveHourWithSeconds` — `use12Hour={true}`, `precision="seconds"`.
- `MinuteStep5` — `minuteStep={5}`.
- `MinuteStep15` — `minuteStep={15}`.
- `MinuteStep30` — `minuteStep={30}`.
- `WithError` — `error="Please select a valid time"`.
- `WithHint` — `hint="Opening hours: 09:00–17:00"`.
- `Controlled` — value managed with `useState`. Shows formatted time string below.
- `WithMinMax` — `minTime={{ hours: 9, minutes: 0 }}` `maxTime={{ hours: 17, minutes: 0 }}`. Simulates business hours constraint.
- `DisabledTimes` — `disabledTimes={[{ hours: 12, minutes: 0 }, { hours: 12, minutes: 30 }]}`. Lunch break blocked.
- `Disabled` — `disabled={true}` with pre-filled value.
- `Required` — `required={true}`, `label="Meeting time"`.
- `ComposedWithDatePicker` — side-by-side `DatePicker` + `TimePicker` in a `<form>`. Label "Schedule appointment". Submit button logs combined datetime. This is the canonical composition pattern story.
- `InForm` — `name="start-time"` prop. Submit button shows hidden input value in actions.

`SelectTime` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const hourSelect = within(canvasElement).getByRole('combobox', { name: /hour/i });
  const minuteSelect = within(canvasElement).getByRole('combobox', { name: /minute/i });
  await userEvent.selectOptions(hourSelect, ['9']);
  await userEvent.selectOptions(minuteSelect, ['30']);
  // onChange should have been called — verify via args.onChange in actions
  await expect(hourSelect).toHaveValue('9');
  await expect(minuteSelect).toHaveValue('30');
};
```

`TwelveHourPM` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const hourSelect = within(canvasElement).getByRole('combobox', { name: /hour/i });
  const ampmSelect = within(canvasElement).getByRole('combobox', { name: /am\/pm/i });
  await userEvent.selectOptions(hourSelect, ['2']);
  await userEvent.selectOptions(ampmSelect, ['PM']);
  // Internal value should be hours: 14
  const minuteSelect = within(canvasElement).getByRole('combobox', { name: /minute/i });
  await userEvent.selectOptions(minuteSelect, ['0']);
  // onChange called with { hours: 14, minutes: 0 }
};
```

Use `autodocs`. Storybook group: `Core Components/TimePicker`.

---

## Definition of done

- [ ] All Vitest tests pass
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants
- [ ] Storybook builds without error
- [ ] Uses native `<select>` elements — no custom dropdown replacement
- [ ] 12h ↔ 24h conversion is correct for all edge cases (12 AM = 0, 12 PM = 12)
- [ ] `minuteStep` / `secondStep` generate correct options
- [ ] `minTime` / `maxTime` disable correct options — verified in tests
- [ ] Hour disabled when ALL its minute options are disabled
- [ ] `onChange` called only when all required segments have a value
- [ ] `onChange(null)` called when any segment is cleared
- [ ] Hidden input outputs `HH:mm` (24h) or `HH:mm:ss` ISO format
- [ ] Segment group has `role="group"` and `aria-label`
- [ ] Each `<select>` has individual `aria-label`
- [ ] Error has `role="alert"`
- [ ] Label click focuses the hour `<select>`
- [ ] Separators and spacers are `aria-hidden="true"`
- [ ] Segment widths fixed — no layout shift when value changes
- [ ] `appearance: none` applied to remove browser default select chrome
- [ ] `border-radius: var(--dds-radius-none)` everywhere — no exceptions
- [ ] No Tailwind. No hardcoded color, spacing, or font values in SCSS.
- [ ] `ComposedWithDatePicker` story demonstrates canonical composition pattern
- [ ] Exported from `packages/components/src/index.ts`

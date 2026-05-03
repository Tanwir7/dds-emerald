import React from 'react';
import clsx from 'clsx';
import { format, isBefore, isValid } from 'date-fns';
import type { Locale } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar, X } from 'lucide-react';
import type { DateRange as DayPickerDateRange, Matcher } from 'react-day-picker';
import { Label } from '../Label';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { Popover, PopoverAnchor, PopoverContent } from '../Popover';
import { VisuallyHidden } from '../VisuallyHidden';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { CalendarPanel } from '../DatePicker/CalendarPanel';
import styles from './DateRangePicker.module.scss';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface DateRangePickerProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabledDayOfWeek?: number[];
  disabledDateRanges?: Array<{ from: Date; to: Date }>;
  startPlaceholder?: string;
  endPlaceholder?: string;
  dateFormat?: string;
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  numberOfMonths?: 1 | 2;
  defaultMonth?: Date;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  id?: string;
  name?: string;
  label?: string;
  startLabel?: string;
  endLabel?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  hint?: string;
  clearable?: boolean;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom';
}

type SelectionPhase = 'from' | 'to';

const EMPTY_RANGE: DateRange = { from: undefined, to: undefined };

const formatDateValue = (date: Date | undefined, formatString: string, locale: Locale) => {
  if (!date || !isValid(date)) {
    return '';
  }

  return format(date, formatString, { locale });
};

const buildDisabledMatchers = ({
  minDate,
  maxDate,
  disabledDates,
  disabledDayOfWeek,
  disabledDateRanges,
}: {
  minDate?: Date | undefined;
  maxDate?: Date | undefined;
  disabledDates?: Date[] | undefined;
  disabledDayOfWeek?: number[] | undefined;
  disabledDateRanges?: Array<{ from: Date; to: Date }> | undefined;
}): Matcher[] => {
  const matchers: Matcher[] = [];

  if (minDate) {
    matchers.push({ before: minDate });
  }

  if (maxDate) {
    matchers.push({ after: maxDate });
  }

  if (disabledDates?.length) {
    matchers.push(...disabledDates);
  }

  if (disabledDayOfWeek?.length) {
    matchers.push({ dayOfWeek: disabledDayOfWeek });
  }

  if (disabledDateRanges?.length) {
    matchers.push(...disabledDateRanges);
  }

  return matchers;
};

const classNames = {
  clearButton: getRequiredClassName(styles, 'clearButton'),
  message: getRequiredClassName(styles, 'message'),
  popoverContent: getRequiredClassName(styles, 'popoverContent'),
  selectionHint: getRequiredClassName(styles, 'selectionHint'),
  triggerGroup: getRequiredClassName(styles, 'triggerGroup'),
  triggerGroupDisabled: getRequiredClassName(styles, 'triggerGroupDisabled'),
  triggerGroupError: getRequiredClassName(styles, 'triggerGroupError'),
  triggerGroupReadOnly: getRequiredClassName(styles, 'triggerGroupReadOnly'),
  triggerIcon: getRequiredClassName(styles, 'triggerIcon'),
  triggerInput: getRequiredClassName(styles, 'triggerInput'),
  triggerPlaceholder: getRequiredClassName(styles, 'triggerPlaceholder'),
  triggerReadOnly: getRequiredClassName(styles, 'triggerReadOnly'),
  triggerSeparator: getRequiredClassName(styles, 'triggerSeparator'),
  triggerStart: getRequiredClassName(styles, 'triggerStart'),
  triggerText: getRequiredClassName(styles, 'triggerText'),
  triggerWithClear: getRequiredClassName(styles, 'triggerWithClear'),
  triggerActive: getRequiredClassName(styles, 'triggerActive'),
} as const;

export const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      value,
      defaultValue = EMPTY_RANGE,
      onChange,
      minDate,
      maxDate,
      disabledDates,
      disabledDayOfWeek,
      disabledDateRanges,
      startPlaceholder = 'Start date',
      endPlaceholder = 'End date',
      dateFormat = 'dd/MM/yyyy',
      locale = enUS,
      weekStartsOn,
      numberOfMonths = 2,
      defaultMonth,
      month,
      onMonthChange,
      id,
      name,
      label,
      startLabel = 'Start date',
      endLabel = 'End date',
      required = false,
      disabled = false,
      readOnly = false,
      error,
      hint,
      clearable = true,
      className,
      align = 'start',
      side = 'bottom',
    },
    ref
  ) => {
    const generatedId = React.useId();
    const baseId = id ?? generatedId;
    const [open, setOpen] = React.useState(false);
    const [selectionPhase, setSelectionPhase] = React.useState<SelectionPhase>('from');
    const [hoverDate, setHoverDate] = React.useState<Date | null>(null);
    const [uncontrolledRange, setUncontrolledRange] = React.useState<DateRange>(defaultValue);
    const previousOpenRef = React.useRef(false);
    const isControlled = value !== undefined;
    const range = isControlled ? value : uncontrolledRange;
    const normalizedRange = range ?? EMPTY_RANGE;
    const disabledMatcher = buildDisabledMatchers({
      minDate,
      maxDate,
      disabledDates,
      disabledDayOfWeek,
      disabledDateRanges,
    });
    const startId = `${baseId}-start`;
    const endId = `${baseId}-end`;
    const groupId = `${baseId}-group`;
    const labelId = label ? `${baseId}-label` : undefined;
    const errorId = error ? `${baseId}-error` : undefined;
    const hintId = hint && !error ? `${baseId}-hint` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
    const calendarId = `${baseId}-calendar`;
    const selectionHintId = `${baseId}-selection-hint`;
    const startTriggerRef = React.useRef<HTMLButtonElement>(null);
    const endTriggerRef = React.useRef<HTMLButtonElement>(null);
    const lastFocusedTriggerRef = React.useRef<HTMLButtonElement | null>(null);

    const setRangeValue = (nextRange: DateRange) => {
      if (!isControlled) {
        setUncontrolledRange(nextRange);
      }
    };

    const previewRange: DayPickerDateRange | undefined = React.useMemo(() => {
      if (selectionPhase !== 'to' || !normalizedRange.from) {
        return normalizedRange.from || normalizedRange.to ? normalizedRange : undefined;
      }

      if (!hoverDate) {
        return normalizedRange;
      }

      if (isBefore(hoverDate, normalizedRange.from)) {
        return { from: hoverDate, to: normalizedRange.from };
      }

      return { from: normalizedRange.from, to: hoverDate };
    }, [hoverDate, normalizedRange, selectionPhase]);

    const startValueText = formatDateValue(normalizedRange.from, dateFormat, locale);
    const endValueText = formatDateValue(normalizedRange.to, dateFormat, locale);
    const startLabelText = formatDateValue(normalizedRange.from, 'PPPP', locale);
    const endLabelText = formatDateValue(normalizedRange.to, 'PPPP', locale);
    const canClear =
      clearable &&
      (Boolean(normalizedRange.from) || Boolean(normalizedRange.to)) &&
      !disabled &&
      !readOnly;
    const initialMonth = defaultMonth ?? normalizedRange.from ?? normalizedRange.to ?? null;

    const closePopover = () => {
      setOpen(false);
      setSelectionPhase('from');
      setHoverDate(null);
    };

    React.useEffect(() => {
      if (previousOpenRef.current && !open) {
        requestAnimationFrame(() => {
          lastFocusedTriggerRef.current?.focus();
        });
      }

      previousOpenRef.current = open;
    }, [open]);

    const handleOpenChange = (nextOpen: boolean) => {
      if (disabled || readOnly) {
        setOpen(false);
        return;
      }

      setOpen(nextOpen);

      if (!nextOpen) {
        setSelectionPhase('from');
        setHoverDate(null);
      }
    };

    const handleStartTriggerClick = () => {
      lastFocusedTriggerRef.current = startTriggerRef.current;

      if (readOnly || disabled) {
        return;
      }

      setSelectionPhase('from');
      setHoverDate(null);
      setOpen(true);
    };

    const handleEndTriggerClick = () => {
      lastFocusedTriggerRef.current = endTriggerRef.current;

      if (readOnly || disabled) {
        return;
      }

      setSelectionPhase(normalizedRange.from ? 'to' : 'from');
      setHoverDate(null);
      setOpen(true);
    };

    const handleDayClick = (day: Date) => {
      if (selectionPhase === 'from' || !normalizedRange.from || normalizedRange.to) {
        setRangeValue({ from: day, to: undefined });
        setSelectionPhase('to');
        return;
      }

      if (isBefore(day, normalizedRange.from)) {
        setRangeValue({ from: day, to: undefined });
        setSelectionPhase('to');
        return;
      }

      const nextRange = { from: normalizedRange.from, to: day };
      setRangeValue(nextRange);
      onChange?.(nextRange);
      lastFocusedTriggerRef.current = startTriggerRef.current;
      closePopover();
    };

    const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setRangeValue(EMPTY_RANGE);
      onChange?.(EMPTY_RANGE);
      setSelectionPhase('from');
      setHoverDate(null);
    };

    const selectionHint =
      selectionPhase === 'from' || !normalizedRange.from
        ? 'Select a start date'
        : `Start: ${formatDateValue(normalizedRange.from, dateFormat, locale)} — Select an end date`;

    const startTriggerLabel = label
      ? startLabelText
        ? `${label}, ${startLabel}: ${startLabelText}. Press to change`
        : `${label}, ${startLabel}, ${startPlaceholder}`
      : startLabelText
        ? `${startLabel}: ${startLabelText}. Press to change`
        : startPlaceholder;

    const endTriggerLabel = label
      ? endLabelText
        ? `${label}, ${endLabel}: ${endLabelText}. Press to change`
        : `${label}, ${endLabel}, ${endPlaceholder}`
      : endLabelText
        ? `${endLabel}: ${endLabelText}. Press to change`
        : endPlaceholder;

    const calendarPanelProps = {
      disabled: disabledMatcher,
      locale,
      mode: 'range' as const,
      numberOfMonths,
      onDayClick: (day: Date) => handleDayClick(day),
      onDayMouseEnter: (day: Date) => {
        if (selectionPhase === 'to') {
          setHoverDate(day);
        }
      },
      onDayMouseLeave: () => setHoverDate(null),
      selected: previewRange,
      ...(initialMonth ? { defaultMonth: initialMonth } : {}),
      ...(month ? { month } : {}),
      ...(onMonthChange ? { onMonthChange } : {}),
      ...(weekStartsOn !== undefined ? { weekStartsOn } : {}),
    };

    return (
      <div className={clsx(styles.root, className)} ref={ref}>
        {label ? (
          <Label htmlFor={startId} id={labelId} required={required}>
            {label}
          </Label>
        ) : null}

        <Popover onOpenChange={handleOpenChange} open={open}>
          <PopoverAnchor asChild>
            <div
              aria-describedby={describedBy}
              aria-labelledby={labelId}
              className={clsx(
                classNames.triggerGroup,
                error && classNames.triggerGroupError,
                disabled && classNames.triggerGroupDisabled,
                readOnly && classNames.triggerGroupReadOnly
              )}
              id={groupId}
              role="group"
            >
              {label ? (
                <>
                  <VisuallyHidden>{startLabel}</VisuallyHidden>
                  <VisuallyHidden>{endLabel}</VisuallyHidden>
                </>
              ) : null}

              <button
                ref={startTriggerRef}
                aria-controls={open ? calendarId : undefined}
                aria-describedby={describedBy}
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-label={startTriggerLabel}
                aria-readonly={readOnly ? true : undefined}
                className={clsx(
                  classNames.triggerInput,
                  classNames.triggerStart,
                  canClear && classNames.triggerWithClear,
                  readOnly && classNames.triggerReadOnly,
                  open && selectionPhase === 'from' && classNames.triggerActive
                )}
                disabled={disabled}
                id={startId}
                onClick={handleStartTriggerClick}
                role="combobox"
                type="button"
              >
                <Icon aria-hidden="true" className={classNames.triggerIcon} icon={Calendar} />
                <span
                  className={clsx(
                    classNames.triggerText,
                    !startValueText && classNames.triggerPlaceholder
                  )}
                >
                  {startValueText || startPlaceholder}
                </span>
              </button>

              <span aria-hidden="true" className={classNames.triggerSeparator}>
                →
              </span>

              <button
                ref={endTriggerRef}
                aria-controls={open ? calendarId : undefined}
                aria-describedby={describedBy}
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-label={endTriggerLabel}
                aria-readonly={readOnly ? true : undefined}
                className={clsx(
                  classNames.triggerInput,
                  canClear && classNames.triggerWithClear,
                  readOnly && classNames.triggerReadOnly,
                  open && selectionPhase === 'to' && classNames.triggerActive
                )}
                disabled={disabled}
                id={endId}
                onClick={handleEndTriggerClick}
                role="combobox"
                type="button"
              >
                <span
                  className={clsx(
                    classNames.triggerText,
                    !endValueText && classNames.triggerPlaceholder
                  )}
                >
                  {endValueText || endPlaceholder}
                </span>
              </button>

              {canClear ? (
                <button
                  aria-label="Clear date range"
                  className={classNames.clearButton}
                  onClick={handleClear}
                  type="button"
                >
                  <Icon aria-hidden="true" icon={X} />
                </button>
              ) : null}
            </div>
          </PopoverAnchor>

          <PopoverContent
            align={align}
            className={classNames.popoverContent}
            id={calendarId}
            side={side}
            sideOffset={4}
            width="auto"
          >
            <CalendarPanel {...calendarPanelProps} />
            <p
              aria-atomic="true"
              aria-live="polite"
              className={classNames.selectionHint}
              id={selectionHintId}
            >
              {selectionHint}
            </p>
          </PopoverContent>
        </Popover>

        {name ? (
          <>
            <input
              disabled={disabled}
              name={`${name}[from]`}
              type="hidden"
              value={normalizedRange.from ? format(normalizedRange.from, 'yyyy-MM-dd') : ''}
            />
            <input
              disabled={disabled}
              name={`${name}[to]`}
              type="hidden"
              value={normalizedRange.to ? format(normalizedRange.to, 'yyyy-MM-dd') : ''}
            />
          </>
        ) : null}

        {error ? (
          <Text
            as="p"
            className={classNames.message}
            color="danger"
            id={errorId}
            role="alert"
            size="xs"
          >
            {error}
          </Text>
        ) : null}

        {hintId ? (
          <Text as="p" className={classNames.message} color="muted" id={hintId} size="xs">
            {hint}
          </Text>
        ) : null}
      </div>
    );
  }
);

DateRangePicker.displayName = 'DateRangePicker';

import React from 'react';
import clsx from 'clsx';
import { format, isValid } from 'date-fns';
import type { Locale } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar, X } from 'lucide-react';
import type { CaptionLayout, Matcher } from 'react-day-picker';
import { Label } from '../Label';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { InlineAlert } from '../InlineAlert';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import type { FieldInlineAlert } from '../../types/fieldInlineAlert';
import { CalendarPanel } from './CalendarPanel';
import styles from './DatePicker.module.scss';

export interface DatePickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabledDayOfWeek?: number[];
  disabledDateRanges?: Array<{ from: Date; to: Date }>;
  placeholder?: string;
  dateFormat?: string;
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  numberOfMonths?: 1 | 2;
  defaultMonth?: Date;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  captionLayout?: CaptionLayout;
  fromYear?: number;
  toYear?: number;
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  inlineAlert?: FieldInlineAlert;
  hint?: string;
  clearable?: boolean;
  inputClassName?: string;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom';
}

interface DateInputTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'value'
> {
  valueText: string;
  valueTextId: string;
  placeholder: string;
  disabled?: boolean;
  readOnly?: boolean;
  hasError?: boolean;
  canClear?: boolean;
}

const formatDateValue = (date: Date | null | undefined, formatString: string, locale: Locale) => {
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
  message: getRequiredClassName(styles, 'message'),
  popoverContent: getRequiredClassName(styles, 'popoverContent'),
  triggerIcon: getRequiredClassName(styles, 'triggerIcon'),
} as const;

const DateInputTrigger = React.forwardRef<HTMLButtonElement, DateInputTriggerProps>(
  (
    {
      valueText,
      valueTextId,
      placeholder,
      disabled = false,
      readOnly = false,
      hasError = false,
      canClear = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          styles.trigger,
          canClear && styles.triggerWithClear,
          disabled && styles.triggerDisabled,
          readOnly && styles.triggerReadOnly,
          hasError && styles.triggerError,
          className
        )}
        disabled={disabled}
        type="button"
        {...props}
      >
        <Icon aria-hidden="true" className={classNames.triggerIcon} icon={Calendar} />
        <span
          className={clsx(styles.triggerText, !valueText && styles.triggerPlaceholder)}
          id={valueTextId}
        >
          {valueText || placeholder}
        </span>
      </button>
    );
  }
);

DateInputTrigger.displayName = 'DateInputTrigger';

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      defaultValue = null,
      onChange,
      minDate,
      maxDate,
      disabledDates,
      disabledDayOfWeek,
      disabledDateRanges,
      placeholder = 'Select date',
      dateFormat = 'dd/MM/yyyy',
      locale = enUS,
      weekStartsOn,
      numberOfMonths = 1,
      defaultMonth,
      month,
      onMonthChange,
      captionLayout = 'buttons',
      fromYear,
      toYear,
      id,
      name,
      label,
      required = false,
      disabled = false,
      readOnly = false,
      inlineAlert,
      hint,
      clearable = true,
      inputClassName,
      className,
      align = 'start',
      side = 'bottom',
    },
    ref
  ) => {
    const generatedId = React.useId();
    const [open, setOpen] = React.useState(false);
    const [uncontrolledValue, setUncontrolledValue] = React.useState<Date | null>(defaultValue);
    const triggerId = id ?? generatedId;
    const isControlled = value !== undefined;
    const selectedDate = isControlled ? value : uncontrolledValue;
    const labelId = label ? `${triggerId}-label` : undefined;
    const inlineAlertId = inlineAlert ? `${triggerId}-inline-alert` : undefined;
    const hintId = hint && !inlineAlert ? `${triggerId}-hint` : undefined;
    const valueTextId = `${triggerId}-value`;
    const describedBy = [inlineAlertId, hintId].filter(Boolean).join(' ') || undefined;
    const calendarId = `${triggerId}-calendar`;
    const disabledMatcher = buildDisabledMatchers({
      minDate,
      maxDate,
      disabledDates,
      disabledDayOfWeek,
      disabledDateRanges,
    });
    const displayValue = formatDateValue(selectedDate, dateFormat, locale);
    const selectedDateLabel = formatDateValue(selectedDate, 'PPPP', locale);
    const hiddenInputValue = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    const canClear = clearable && Boolean(selectedDate) && !disabled && !readOnly;
    const initialMonth = defaultMonth ?? selectedDate ?? null;
    const isInvalid = inlineAlert?.intent === 'danger';

    const handleOpenChange = (nextOpen: boolean) => {
      if (disabled || readOnly) {
        setOpen(false);
        return;
      }

      setOpen(nextOpen);
    };

    const handleSelect = (date: Date | undefined) => {
      const nextValue = date ?? null;

      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onChange?.(nextValue);

      if (date) {
        setOpen(false);
      }
    };

    const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (!isControlled) {
        setUncontrolledValue(null);
      }

      onChange?.(null);
    };

    const handleTriggerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (readOnly) {
        event.preventDefault();
      }
    };

    const triggerLabel = label
      ? selectedDateLabel
        ? `${label}, selected date: ${selectedDateLabel}. Press to change`
        : `${label}, ${placeholder}`
      : selectedDateLabel
        ? `Selected date: ${selectedDateLabel}. Press to change`
        : placeholder;

    const calendarPanelProps = {
      disabled: disabledMatcher,
      locale,
      mode: 'single' as const,
      numberOfMonths,
      onSelect: handleSelect,
      ...(initialMonth ? { defaultMonth: initialMonth } : {}),
      ...(month ? { month } : {}),
      ...(onMonthChange ? { onMonthChange } : {}),
      captionLayout,
      ...(fromYear !== undefined ? { fromYear } : {}),
      ...(selectedDate ? { selected: selectedDate } : {}),
      ...(toYear !== undefined ? { toYear } : {}),
      ...(weekStartsOn !== undefined ? { weekStartsOn } : {}),
    };

    return (
      <div className={clsx(styles.root, className)}>
        {label ? (
          <Label htmlFor={triggerId} id={labelId} required={required}>
            {label}
          </Label>
        ) : null}

        <div className={styles.triggerWrapper}>
          <Popover onOpenChange={handleOpenChange} open={open}>
            <PopoverTrigger asChild>
              <DateInputTrigger
                ref={ref}
                aria-controls={open ? calendarId : undefined}
                aria-describedby={describedBy}
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-invalid={isInvalid ? true : undefined}
                aria-label={triggerLabel}
                aria-readonly={readOnly ? true : undefined}
                canClear={canClear}
                className={inputClassName}
                disabled={disabled}
                hasError={isInvalid}
                id={triggerId}
                onClick={handleTriggerClick}
                placeholder={placeholder}
                readOnly={readOnly}
                role="combobox"
                valueText={displayValue}
                valueTextId={valueTextId}
              />
            </PopoverTrigger>
            <PopoverContent
              align={align}
              className={classNames.popoverContent}
              id={calendarId}
              side={side}
              sideOffset={4}
              width="auto"
            >
              <CalendarPanel {...calendarPanelProps} />
            </PopoverContent>
          </Popover>

          {canClear ? (
            <button
              aria-label="Clear selected date"
              className={styles.clearButton}
              onClick={handleClear}
              type="button"
            >
              <Icon aria-hidden="true" icon={X} />
            </button>
          ) : null}
        </div>

        {name ? (
          <input disabled={disabled} name={name} type="hidden" value={hiddenInputValue} />
        ) : null}

        {inlineAlert ? (
          <InlineAlert
            className={classNames.message}
            id={inlineAlertId}
            intent={inlineAlert.intent}
            {...(inlineAlert.showIcon !== undefined ? { showIcon: inlineAlert.showIcon } : {})}
          >
            {inlineAlert.children}
          </InlineAlert>
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

DatePicker.displayName = 'DatePicker';

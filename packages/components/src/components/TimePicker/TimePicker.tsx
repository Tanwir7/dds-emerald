import React from 'react';
import clsx from 'clsx';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import type { FieldInlineAlert } from '../../types/fieldInlineAlert';
import { InlineAlert } from '../InlineAlert';
import { Label } from '../Label';
import { Text } from '../Text';
import styles from './TimePicker.module.scss';

export type TimePrecision = 'minutes' | 'seconds';

export interface TimeValue {
  hours: number;
  minutes: number;
  seconds?: number;
}

export interface TimePickerProps {
  value?: TimeValue | null;
  defaultValue?: TimeValue | null;
  onChange?: (value: TimeValue | null) => void;
  precision?: TimePrecision;
  minuteStep?: number;
  secondStep?: number;
  use12Hour?: boolean;
  hourLabel?: string;
  minuteLabel?: string;
  secondLabel?: string;
  amPmLabel?: string;
  placeholder?: string;
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  inlineAlert?: FieldInlineAlert;
  hint?: string;
  minTime?: TimeValue;
  maxTime?: TimeValue;
  disabledTimes?: TimeValue[];
  className?: string;
}

interface SelectOption {
  value: number;
  label: string;
  disabled?: boolean;
}

interface SegmentDraft {
  hour: string;
  minute: string;
  second: string;
  ampm: 'AM' | 'PM';
}

const TWELVE_HOUR_OPTIONS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const to24Hour = (hour12: number, ampm: 'AM' | 'PM'): number => {
  if (ampm === 'AM') {
    return hour12 === 12 ? 0 : hour12;
  }

  return hour12 === 12 ? 12 : hour12 + 12;
};

const to12Hour = (hour24: number): { hour12: number; ampm: 'AM' | 'PM' } => {
  if (hour24 === 0) {
    return { hour12: 12, ampm: 'AM' };
  }

  if (hour24 < 12) {
    return { hour12: hour24, ampm: 'AM' };
  }

  if (hour24 === 12) {
    return { hour12: 12, ampm: 'PM' };
  }

  return { hour12: hour24 - 12, ampm: 'PM' };
};

const normalizeStep = (step: number | undefined) => {
  if (!step || Number.isNaN(step) || step < 1) {
    return 1;
  }

  return Math.min(step, 60);
};

const buildStepOptions = (step: number) => {
  const normalizedStep = normalizeStep(step);
  const values: SelectOption[] = [];

  for (let value = 0; value < 60; value += normalizedStep) {
    values.push({
      value,
      label: String(value).padStart(2, '0'),
    });
  }

  return values;
};

const buildHourOptions = (use12Hour: boolean) => {
  if (use12Hour) {
    return TWELVE_HOUR_OPTIONS.map((hour) => ({
      value: hour,
      label: String(hour).padStart(2, '0'),
    }));
  }

  return Array.from({ length: 24 }, (_, hour) => ({
    value: hour,
    label: String(hour).padStart(2, '0'),
  }));
};

const getHourPlaceholder = (use12Hour: boolean) => (use12Hour ? 'HH' : 'HH');

const getTotalSeconds = (time: TimeValue) =>
  time.hours * 3600 + time.minutes * 60 + (time.seconds ?? 0);

const buildDisabledTimeSet = (disabledTimes: TimeValue[] | undefined) =>
  new Set((disabledTimes ?? []).map((time) => getTotalSeconds(time)));

const formatTimeValue = (value: TimeValue, precision: TimePrecision) => {
  const base = `${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}`;

  if (precision === 'seconds') {
    return `${base}:${String(value.seconds ?? 0).padStart(2, '0')}`;
  }

  return base;
};

const getDraftFromValue = (
  value: TimeValue | null | undefined,
  use12Hour: boolean,
  precision: TimePrecision
): SegmentDraft => {
  if (!value) {
    return {
      hour: '',
      minute: '',
      second: '',
      ampm: 'AM',
    };
  }

  if (use12Hour) {
    const { hour12, ampm } = to12Hour(value.hours);
    return {
      hour: String(hour12),
      minute: String(value.minutes),
      second: precision === 'seconds' ? String(value.seconds ?? 0) : '',
      ampm,
    };
  }

  return {
    hour: String(value.hours),
    minute: String(value.minutes),
    second: precision === 'seconds' ? String(value.seconds ?? 0) : '',
    ampm: to12Hour(value.hours).ampm,
  };
};

const getSerializedValue = (value: TimeValue | null | undefined, precision: TimePrecision) => {
  if (!value) {
    return 'null';
  }

  return formatTimeValue(value, precision);
};

export const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  (
    {
      value,
      defaultValue = null,
      onChange,
      precision = 'minutes',
      minuteStep = 1,
      secondStep = 1,
      use12Hour = false,
      hourLabel = 'Hour',
      minuteLabel = 'Minute',
      secondLabel = 'Second',
      amPmLabel = 'AM/PM',
      placeholder = '--:--',
      id,
      name,
      label,
      required = false,
      disabled = false,
      readOnly = false,
      inlineAlert,
      hint,
      minTime,
      maxTime,
      disabledTimes,
      className,
    },
    ref
  ) => {
    const generatedId = React.useId();
    const baseId = id ?? generatedId;
    const isControlled = value !== undefined;
    const initialValue = isControlled ? value : defaultValue;
    const [draft, setDraft] = React.useState<SegmentDraft>(() =>
      getDraftFromValue(initialValue, use12Hour, precision)
    );
    const lastControlledValue = React.useRef<string>(getSerializedValue(value, precision));
    const disabledTimeSet = React.useMemo(
      () => buildDisabledTimeSet(disabledTimes),
      [disabledTimes]
    );
    const hourOptions = React.useMemo(() => buildHourOptions(use12Hour), [use12Hour]);
    const minuteOptions = React.useMemo(() => buildStepOptions(minuteStep), [minuteStep]);
    const secondOptions = React.useMemo(() => buildStepOptions(secondStep), [secondStep]);
    const labelId = label ? `${baseId}-label` : undefined;
    const inlineAlertId = inlineAlert ? `${baseId}-inline-alert` : undefined;
    const hintId = hint && !inlineAlert ? `${baseId}-hint` : undefined;
    const describedBy = [inlineAlertId, hintId].filter(Boolean).join(' ') || undefined;
    const hourSelectId = `${baseId}-hour`;
    const messageClassName = getRequiredClassName(styles, 'message');
    const isInvalid = inlineAlert?.intent === 'danger';

    React.useEffect(() => {
      const nextSerializedValue = getSerializedValue(value, precision);
      if (!isControlled || nextSerializedValue === lastControlledValue.current) {
        return;
      }

      setDraft(getDraftFromValue(value, use12Hour, precision));
      lastControlledValue.current = nextSerializedValue;
    }, [isControlled, precision, use12Hour, value]);

    React.useEffect(() => {
      setDraft((currentDraft) => {
        if (precision === 'minutes' && currentDraft.second !== '') {
          return {
            ...currentDraft,
            second: '',
          };
        }

        return currentDraft;
      });
    }, [precision]);

    React.useEffect(() => {
      setDraft((currentDraft) => {
        if (currentDraft.hour === '') {
          return currentDraft;
        }

        const hours24 = use12Hour
          ? to24Hour(Number(currentDraft.hour), currentDraft.ampm)
          : Number(currentDraft.hour);
        const normalized = getDraftFromValue(
          precision === 'seconds'
            ? {
                hours: hours24,
                minutes: currentDraft.minute === '' ? 0 : Number(currentDraft.minute),
                seconds: Number(currentDraft.second || 0),
              }
            : {
                hours: hours24,
                minutes: currentDraft.minute === '' ? 0 : Number(currentDraft.minute),
              },
          use12Hour,
          precision
        );

        return {
          ...currentDraft,
          hour: normalized.hour,
          ampm: normalized.ampm,
        };
      });
    }, [precision, use12Hour]);

    const isTimeDisabled = React.useCallback(
      (hours: number, minutes: number, seconds = 0) => {
        const total = hours * 3600 + minutes * 60 + seconds;

        if (minTime && total < getTotalSeconds(minTime)) {
          return true;
        }

        if (maxTime && total > getTotalSeconds(maxTime)) {
          return true;
        }

        return disabledTimeSet.has(total);
      },
      [disabledTimeSet, maxTime, minTime]
    );

    const currentHour24 =
      draft.hour === ''
        ? undefined
        : use12Hour
          ? to24Hour(Number(draft.hour), draft.ampm)
          : Number(draft.hour);
    const currentMinute = draft.minute === '' ? undefined : Number(draft.minute);

    const isHourDisabled = React.useCallback(
      (candidateHour: number) => {
        return minuteOptions.every((minuteOption) => {
          if (precision === 'seconds') {
            return secondOptions.every((secondOption) =>
              isTimeDisabled(candidateHour, minuteOption.value, secondOption.value)
            );
          }

          return isTimeDisabled(candidateHour, minuteOption.value);
        });
      },
      [isTimeDisabled, minuteOptions, precision, secondOptions]
    );

    const isMinuteDisabled = React.useCallback(
      (candidateMinute: number) => {
        if (currentHour24 === undefined) {
          return false;
        }

        if (precision === 'seconds') {
          return secondOptions.every((secondOption) =>
            isTimeDisabled(currentHour24, candidateMinute, secondOption.value)
          );
        }

        return isTimeDisabled(currentHour24, candidateMinute);
      },
      [currentHour24, isTimeDisabled, precision, secondOptions]
    );

    const isSecondDisabled = React.useCallback(
      (candidateSecond: number) => {
        if (currentHour24 === undefined || currentMinute === undefined) {
          return false;
        }

        return isTimeDisabled(currentHour24, currentMinute, candidateSecond);
      },
      [currentHour24, currentMinute, isTimeDisabled]
    );

    const getCompleteValue = React.useCallback(
      (nextDraft: SegmentDraft): TimeValue | null => {
        if (nextDraft.hour === '' || nextDraft.minute === '') {
          return null;
        }

        const hours = use12Hour
          ? to24Hour(Number(nextDraft.hour), nextDraft.ampm)
          : Number(nextDraft.hour);
        const minutes = Number(nextDraft.minute);

        if (precision === 'seconds') {
          if (nextDraft.second === '') {
            return null;
          }

          return {
            hours,
            minutes,
            seconds: Number(nextDraft.second),
          };
        }

        return {
          hours,
          minutes,
        };
      },
      [precision, use12Hour]
    );

    const currentValue = getCompleteValue(draft);

    const handleSegmentChange = (
      segment: 'hour' | 'minute' | 'second' | 'ampm',
      rawValue: string
    ) => {
      if (disabled || readOnly) {
        return;
      }

      setDraft((currentDraft) => {
        const nextDraft: SegmentDraft =
          segment === 'ampm'
            ? {
                ...currentDraft,
                ampm: rawValue === 'PM' ? 'PM' : 'AM',
              }
            : {
                ...currentDraft,
                [segment]: rawValue,
              };

        const nextValue = getCompleteValue(nextDraft);

        lastControlledValue.current = getSerializedValue(nextValue, precision);

        onChange?.(nextValue);
        return nextDraft;
      });
    };

    const handleLabelClick = () => {
      document.getElementById(hourSelectId)?.focus();
    };

    return (
      <div className={clsx(styles.root, className)} ref={ref}>
        {label ? (
          <Label disabled={disabled} id={labelId} onClick={handleLabelClick}>
            {label}
          </Label>
        ) : null}

        <div
          aria-describedby={describedBy}
          aria-label={label ?? placeholder}
          aria-labelledby={labelId}
          className={clsx(
            styles.segmentGroup,
            (disabled || readOnly) && styles.segmentGroupDisabled,
            isInvalid && styles.segmentGroupError
          )}
          data-placeholder-visible={draft.hour === '' && draft.minute === '' ? 'true' : undefined}
          role="group"
        >
          <select
            aria-label={hourLabel}
            aria-describedby={describedBy}
            aria-invalid={isInvalid ? true : undefined}
            className={clsx(styles.segment, styles.segmentHour)}
            disabled={disabled || readOnly}
            id={hourSelectId}
            onChange={(event) => handleSegmentChange('hour', event.target.value)}
            required={required}
            value={draft.hour}
          >
            <option value="">{getHourPlaceholder(use12Hour)}</option>
            {hourOptions.map((option) => {
              const hours24 = use12Hour ? to24Hour(option.value, draft.ampm) : option.value;

              return (
                <option disabled={isHourDisabled(hours24)} key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </select>

          <span aria-hidden="true" className={styles.separator}>
            :
          </span>

          <select
            aria-label={minuteLabel}
            aria-describedby={describedBy}
            aria-invalid={isInvalid ? true : undefined}
            className={clsx(styles.segment, styles.segmentMinute)}
            disabled={disabled || readOnly}
            id={`${baseId}-minute`}
            onChange={(event) => handleSegmentChange('minute', event.target.value)}
            required={required}
            value={draft.minute}
          >
            <option value="">MM</option>
            {minuteOptions.map((option) => (
              <option
                disabled={isMinuteDisabled(option.value)}
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          {precision === 'seconds' ? (
            <>
              <span aria-hidden="true" className={styles.separator}>
                :
              </span>

              <select
                aria-label={secondLabel}
                aria-describedby={describedBy}
                aria-invalid={isInvalid ? true : undefined}
                className={clsx(styles.segment, styles.segmentSecond)}
                disabled={disabled || readOnly}
                id={`${baseId}-second`}
                onChange={(event) => handleSegmentChange('second', event.target.value)}
                required={required}
                value={draft.second}
              >
                <option value="">SS</option>
                {secondOptions.map((option) => (
                  <option
                    disabled={isSecondDisabled(option.value)}
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </>
          ) : null}

          {use12Hour ? (
            <>
              <span aria-hidden="true" className={styles.ampmSpacer} />

              <select
                aria-label={amPmLabel}
                aria-describedby={describedBy}
                aria-invalid={isInvalid ? true : undefined}
                className={clsx(styles.segment, styles.segmentAmPm)}
                disabled={disabled || readOnly}
                id={`${baseId}-ampm`}
                onChange={(event) => handleSegmentChange('ampm', event.target.value)}
                value={draft.ampm}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </>
          ) : null}
        </div>

        {name && currentValue ? (
          <input name={name} type="hidden" value={formatTimeValue(currentValue, precision)} />
        ) : null}

        {inlineAlert ? (
          <InlineAlert
            className={messageClassName}
            id={inlineAlertId}
            intent={inlineAlert.intent}
            {...(inlineAlert.showIcon !== undefined ? { showIcon: inlineAlert.showIcon } : {})}
          >
            {inlineAlert.children}
          </InlineAlert>
        ) : null}

        {hintId ? (
          <Text as="p" className={messageClassName} color="muted" id={hintId} size="xs">
            {hint}
          </Text>
        ) : null}
      </div>
    );
  }
);

TimePicker.displayName = 'TimePicker';

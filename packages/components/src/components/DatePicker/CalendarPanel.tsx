import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, type CaptionProps, useDayPicker, useNavigation } from 'react-day-picker';
import clsx from 'clsx';
import { Button } from '../Button';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import styles from './DatePicker.module.scss';

type CalendarPanelProps = React.ComponentProps<typeof DayPicker> & {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  numberOfMonths?: 1 | 2;
  className?: string;
};

const classNames = {
  calendar: getRequiredClassName(styles, 'calendar'),
  rdpRoot: getRequiredClassName(styles, 'rdpRoot'),
  rdpMonths: getRequiredClassName(styles, 'rdpMonths'),
  rdpMonth: getRequiredClassName(styles, 'rdpMonth'),
  rdpCaption: getRequiredClassName(styles, 'rdpCaption'),
  rdpCaptionLabel: getRequiredClassName(styles, 'rdpCaptionLabel'),
  rdpNav: getRequiredClassName(styles, 'rdpNav'),
  rdpNavButton: getRequiredClassName(styles, 'rdpNavButton'),
  rdpNavButtonPrev: getRequiredClassName(styles, 'rdpNavButtonPrev'),
  rdpNavButtonNext: getRequiredClassName(styles, 'rdpNavButtonNext'),
  rdpNavSpacer: getRequiredClassName(styles, 'rdpNavSpacer'),
  rdpTable: getRequiredClassName(styles, 'rdpTable'),
  rdpHeadRow: getRequiredClassName(styles, 'rdpHeadRow'),
  rdpHeadCell: getRequiredClassName(styles, 'rdpHeadCell'),
  rdpRow: getRequiredClassName(styles, 'rdpRow'),
  rdpCell: getRequiredClassName(styles, 'rdpCell'),
  rdpDay: getRequiredClassName(styles, 'rdpDay'),
  rdpDaySelected: getRequiredClassName(styles, 'rdpDaySelected'),
  rdpDayToday: getRequiredClassName(styles, 'rdpDayToday'),
  rdpDayOutside: getRequiredClassName(styles, 'rdpDayOutside'),
  rdpDayDisabled: getRequiredClassName(styles, 'rdpDayDisabled'),
  rdpDayRangeStart: getRequiredClassName(styles, 'rdpDayRangeStart'),
  rdpDayRangeEnd: getRequiredClassName(styles, 'rdpDayRangeEnd'),
  rdpDayRangeMiddle: getRequiredClassName(styles, 'rdpDayRangeMiddle'),
  rdpDayHidden: getRequiredClassName(styles, 'rdpDayHidden'),
} as const;

const CalendarCaption = ({ displayMonth, displayIndex = 0 }: CaptionProps) => {
  const { locale, labels } = useDayPicker();
  const { displayMonths, nextMonth, previousMonth, goToMonth } = useNavigation();
  const isFirstMonth = displayIndex === 0;
  const isLastMonth = displayIndex === displayMonths.length - 1;

  return (
    <div className={classNames.rdpCaption}>
      <span className={classNames.rdpCaptionLabel}>
        {format(displayMonth, 'MMMM yyyy', { locale })}
      </span>
      <div className={classNames.rdpNav}>
        {isFirstMonth ? (
          <Button
            aria-label={labels.labelPrevious(previousMonth, { locale })}
            className={clsx(classNames.rdpNavButton, classNames.rdpNavButtonPrev)}
            disabled={!previousMonth}
            icon={ChevronLeft}
            onClick={() => previousMonth && goToMonth(previousMonth)}
            size="icon-sm"
            variant="ghost"
          />
        ) : (
          <span className={classNames.rdpNavSpacer} aria-hidden="true" />
        )}
        {isLastMonth ? (
          <Button
            aria-label={labels.labelNext(nextMonth, { locale })}
            className={clsx(classNames.rdpNavButton, classNames.rdpNavButtonNext)}
            disabled={!nextMonth}
            icon={ChevronRight}
            onClick={() => nextMonth && goToMonth(nextMonth)}
            size="icon-sm"
            variant="ghost"
          />
        ) : (
          <span className={classNames.rdpNavSpacer} aria-hidden="true" />
        )}
      </div>
    </div>
  );
};

export const CalendarPanel = ({
  className,
  locale,
  weekStartsOn,
  numberOfMonths = 1,
  ...props
}: CalendarPanelProps) => {
  const dayPickerProps = {
    captionLayout: 'buttons' as const,
    classNames: {
      root: classNames.rdpRoot,
      months: classNames.rdpMonths,
      month: classNames.rdpMonth,
      caption: classNames.rdpCaption,
      caption_label: classNames.rdpCaptionLabel,
      nav: classNames.rdpNav,
      nav_button: classNames.rdpNavButton,
      nav_button_previous: classNames.rdpNavButtonPrev,
      nav_button_next: classNames.rdpNavButtonNext,
      table: classNames.rdpTable,
      head_row: classNames.rdpHeadRow,
      head_cell: classNames.rdpHeadCell,
      row: classNames.rdpRow,
      cell: classNames.rdpCell,
      day: classNames.rdpDay,
      day_selected: classNames.rdpDaySelected,
      day_today: classNames.rdpDayToday,
      day_outside: classNames.rdpDayOutside,
      day_disabled: classNames.rdpDayDisabled,
      day_range_start: classNames.rdpDayRangeStart,
      day_range_end: classNames.rdpDayRangeEnd,
      day_range_middle: classNames.rdpDayRangeMiddle,
      day_hidden: classNames.rdpDayHidden,
    },
    components: {
      Caption: CalendarCaption,
    },
    fixedWeeks: true,
    numberOfMonths,
    showOutsideDays: true,
    ...(locale ? { locale } : {}),
    ...(weekStartsOn !== undefined ? { weekStartsOn } : {}),
    ...props,
  };

  return (
    <div
      aria-label="Date picker calendar"
      className={clsx(classNames.calendar, className)}
      data-month-count={numberOfMonths}
      role="dialog"
    >
      <DayPicker {...dayPickerProps} />
    </div>
  );
};

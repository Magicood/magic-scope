import type { KeyboardEvent, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import {
  addDays,
  addMonths,
  addYears,
  buildMonthMatrix,
  buildYearGrid,
  type CalendarView,
  clampDate,
  type DateConstraints,
  type DateRange,
  decadeStart,
  isBefore,
  isDateDisabled,
  isInRange,
  isMonthFullyDisabled,
  isSameDay,
  isSameMonth,
  startOfDay,
  toISO,
  type WeekStart,
  weekdayOrder,
} from './logic';

/** Calendar 各部件细粒度 className。 */
export interface CalendarClassNames {
  root?: string;
  header?: string;
  grid?: string;
  cell?: string;
}

export interface CalendarProps {
  /** single 选单日;range 选区间。默认 single。 */
  mode?: 'single' | 'range';
  /** 当前选中(single)。 */
  value?: Date | null;
  /** 当前选中区间(range)。 */
  rangeValue?: DateRange;
  /** single 选中回调。 */
  onSelect?: (date: Date) => void;
  /** range 完成一次完整选择(start+end)的回调。 */
  onRangeChange?: (range: DateRange) => void;
  /** 初始展示月(不传按 value/today)。 */
  defaultViewDate?: Date;
  /** 可选下限。 */
  min?: Date | null | undefined;
  /** 可选上限。 */
  max?: Date | null | undefined;
  /** 自定义禁用判定。 */
  disabledDate?: ((date: Date) => boolean) | undefined;
  /** 一周起始(0=周日 … 6=周一)。默认 1(周一)。 */
  weekStart?: WeekStart;
  /** BCP-47 locale(月名/周名经 Intl 取)。不传用运行时默认。 */
  locale?: string | undefined;
  /** 「今天」基准(便于测试注入;不传用 new Date)。 */
  today?: Date | undefined;
  /**
   * 容器开合信号(如 DatePicker 的浮层 open)。false 时复位 range 半选草稿与视图层级,
   * 避免「半选→关闭→重开」残留草稿拼出错误区间。standalone 内联使用可不传。
   */
  open?: boolean;
  /** 各部件 className。 */
  classNames?: CalendarClassNames;
  /** 根 className。 */
  className?: string;
}

const VIEW_BASE = new Date(2023, 0, 1); // 周日,用于生成周名

/**
 * Calendar —— 自含日历面板(date / month / year 三视图 + 键盘导航 + 范围悬停预览)。
 * 纯展示 + 本地交互;日期数学全走同目录 logic.ts(可平移 core),本地化月名/周名经 Intl 按 locale 取。
 * 既被 DatePicker 包进 Popover,也可单独内联使用。样式见 DatePicker.css。
 */
export function Calendar({
  mode = 'single',
  value = null,
  rangeValue,
  onSelect,
  onRangeChange,
  defaultViewDate,
  min,
  max,
  disabledDate,
  weekStart = 1,
  locale,
  today: todayProp,
  open,
  classNames,
  className,
}: CalendarProps) {
  const t = useMessages();
  const today = useMemo(() => startOfDay(todayProp ?? new Date()), [todayProp]);
  const constraints: DateConstraints = { min, max, disabledDate };

  const initial = defaultViewDate ?? value ?? rangeValue?.start ?? today;
  const [viewDate, setViewDate] = useState<Date>(() => startOfDay(initial));
  const [view, setView] = useState<CalendarView>('date');
  const [focused, setFocused] = useState<Date>(() =>
    startOfDay(value ?? rangeValue?.start ?? today),
  );
  const [draftStart, setDraftStart] = useState<Date | null>(null);
  const [hover, setHover] = useState<Date | null>(null);
  const [focusVersion, setFocusVersion] = useState(0);
  const gridRef = useRef<HTMLTableElement>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    return weekdayOrder(weekStart).map((wd) => fmt.format(addDays(VIEW_BASE, wd)));
  }, [locale, weekStart]);

  const monthShort = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: 'short' });
    return Array.from({ length: 12 }, (_, m) => fmt.format(new Date(2023, m, 1)));
  }, [locale]);

  const headerLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(viewDate),
    [locale, viewDate],
  );
  const dayLabelFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'full' }),
    [locale],
  );

  const cells = useMemo(
    () => buildMonthMatrix(year, month, weekStart, today),
    [year, month, weekStart, today],
  );

  // 键盘移动后把焦点落到对应日格
  useEffect(() => {
    if (focusVersion === 0) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${toISO(focused)}"]`)?.focus();
  }, [focusVersion, focused]);

  // 受控 value / range 起点外部变更:翻到对应月(用户手动翻月不受影响)
  const valueKey = value ? toISO(value) : rangeValue?.start ? toISO(rangeValue.start) : '';
  const prevValueKeyRef = useRef(valueKey);
  useEffect(() => {
    if (valueKey === prevValueKeyRef.current) return;
    prevValueKeyRef.current = valueKey;
    const v = value ?? rangeValue?.start ?? null;
    if (v && !isSameMonth(v, viewDate)) {
      setViewDate(startOfDay(new Date(v.getFullYear(), v.getMonth(), 1)));
    }
  }, [valueKey, value, rangeValue, viewDate]);

  // 容器(如 DatePicker 浮层)关闭:复位 range 半选草稿与视图,避免残留拼出错误区间
  useEffect(() => {
    if (open === false) {
      setDraftStart(null);
      setHover(null);
      setView('date');
    }
  }, [open]);

  const commitSingle = (date: Date) => {
    if (isDateDisabled(date, constraints)) return;
    onSelect?.(startOfDay(date));
  };

  const commitRange = (date: Date) => {
    if (isDateDisabled(date, constraints)) return;
    const day = startOfDay(date);
    if (!draftStart) {
      setDraftStart(day);
      setHover(day);
      return;
    }
    const start = isBefore(day, draftStart) ? day : draftStart;
    const end = isBefore(day, draftStart) ? draftStart : day;
    setDraftStart(null);
    setHover(null);
    onRangeChange?.({ start, end });
  };

  const pickDay = (date: Date) => (mode === 'range' ? commitRange(date) : commitSingle(date));

  const moveFocus = (next: Date) => {
    const dir = startOfDay(next).getTime() >= startOfDay(focused).getTime() ? 1 : -1;
    let target = clampDate(next, min, max);
    // 跳过被 disabledDate / 边界禁用的日:沿移动方向找最近可选;触界则放弃移动(保持原焦点)
    if (isDateDisabled(target, constraints)) {
      let found: Date | null = null;
      let probe = target;
      for (let i = 0; i < 366; i++) {
        const stepped = addDays(probe, dir);
        const c = clampDate(stepped, min, max);
        if (!isSameDay(c, stepped)) break; // 被夹住 = 触界
        probe = c;
        if (!isDateDisabled(c, constraints)) {
          found = c;
          break;
        }
      }
      if (!found) return;
      target = found;
    }
    setFocused(target);
    if (!isSameMonth(target, viewDate))
      setViewDate(startOfDay(new Date(target.getFullYear(), target.getMonth(), 1)));
    setFocusVersion((v) => v + 1);
  };

  const onGridKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    let handled = true;
    switch (e.key) {
      case 'ArrowLeft':
        moveFocus(addDays(focused, -1));
        break;
      case 'ArrowRight':
        moveFocus(addDays(focused, 1));
        break;
      case 'ArrowUp':
        moveFocus(addDays(focused, -7));
        break;
      case 'ArrowDown':
        moveFocus(addDays(focused, 7));
        break;
      case 'PageUp':
        moveFocus(e.shiftKey ? addYears(focused, -1) : addMonths(focused, -1));
        break;
      case 'PageDown':
        moveFocus(e.shiftKey ? addYears(focused, 1) : addMonths(focused, 1));
        break;
      case 'Home':
        moveFocus(addDays(focused, -((focused.getDay() - weekStart + 7) % 7)));
        break;
      case 'End':
        moveFocus(addDays(focused, 6 - ((focused.getDay() - weekStart + 7) % 7)));
        break;
      case 'Enter':
      case ' ':
        pickDay(focused);
        break;
      default:
        handled = false;
    }
    if (handled) e.preventDefault();
  };

  const navBtn = (label: string, onClick: () => void, glyph: string, disabled = false) => (
    <button
      type="button"
      className="ms-calendar__nav"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      tabIndex={-1}
    >
      {glyph}
    </button>
  );

  const rootClass = ['ms-calendar', className, classNames?.root].filter(Boolean).join(' ');

  // ── header ──
  let header: ReactNode;
  if (view === 'date') {
    header = (
      <div className={['ms-calendar__header', classNames?.header].filter(Boolean).join(' ')}>
        {navBtn(t('datePicker.prevYear'), () => setViewDate(addYears(viewDate, -1)), '«')}
        {navBtn(t('datePicker.prevMonth'), () => setViewDate(addMonths(viewDate, -1)), '‹')}
        <button
          type="button"
          className="ms-calendar__label"
          aria-label={t('datePicker.selectMonthYear')}
          onClick={() => setView('year')}
        >
          {headerLabel}
        </button>
        {navBtn(t('datePicker.nextMonth'), () => setViewDate(addMonths(viewDate, 1)), '›')}
        {navBtn(t('datePicker.nextYear'), () => setViewDate(addYears(viewDate, 1)), '»')}
      </div>
    );
  } else if (view === 'month') {
    header = (
      <div className={['ms-calendar__header', classNames?.header].filter(Boolean).join(' ')}>
        {navBtn(t('datePicker.prevYear'), () => setViewDate(addYears(viewDate, -1)), '‹')}
        <button type="button" className="ms-calendar__label" onClick={() => setView('year')}>
          {year}
        </button>
        {navBtn(t('datePicker.nextYear'), () => setViewDate(addYears(viewDate, 1)), '›')}
      </div>
    );
  } else {
    const base = decadeStart(year);
    header = (
      <div className={['ms-calendar__header', classNames?.header].filter(Boolean).join(' ')}>
        {navBtn(t('datePicker.prevYear'), () => setViewDate(addYears(viewDate, -10)), '‹')}
        <span className="ms-calendar__label ms-calendar__label--static">{`${base}–${base + 9}`}</span>
        {navBtn(t('datePicker.nextYear'), () => setViewDate(addYears(viewDate, 10)), '›')}
      </div>
    );
  }

  // ── body ──
  let body: ReactNode;
  if (view === 'date') {
    const weeks: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    body = (
      <table
        ref={gridRef}
        className={['ms-calendar__grid', classNames?.grid].filter(Boolean).join(' ')}
        onKeyDown={onGridKeyDown}
      >
        <thead>
          <tr className="ms-calendar__weekdays">
            {weekdays.map((w, i) => (
              <th key={weekdayOrder(weekStart)[i]} scope="col" className="ms-calendar__weekday">
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="ms-calendar__days">
          {weeks.map((week) => (
            <tr key={week[0]?.iso}>
              {week.map((c) => {
                const disabled = isDateDisabled(c.date, constraints);
                const selectedSingle = mode === 'single' && isSameDay(c.date, value);
                const rStart = rangeValue?.start ?? null;
                const rEnd = rangeValue?.end ?? null;
                const isStart =
                  mode === 'range' && (isSameDay(c.date, rStart) || isSameDay(c.date, draftStart));
                const isEnd = mode === 'range' && isSameDay(c.date, rEnd);
                const inR =
                  mode === 'range' &&
                  (isInRange(c.date, rStart, rEnd) ||
                    (draftStart != null && hover != null && isInRange(c.date, draftStart, hover)));
                const isFocusable = isSameDay(c.date, focused);
                const cls = [
                  'ms-calendar__cell',
                  !c.inMonth && 'ms-calendar__cell--outside',
                  c.isToday && 'ms-calendar__cell--today',
                  (selectedSingle || isStart || isEnd) && 'ms-calendar__cell--selected',
                  inR && 'ms-calendar__cell--in-range',
                  isStart && 'ms-calendar__cell--range-start',
                  isEnd && 'ms-calendar__cell--range-end',
                  classNames?.cell,
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <td key={c.iso} className="ms-calendar__cell-wrap">
                    <button
                      type="button"
                      data-iso={c.iso}
                      className={cls}
                      disabled={disabled}
                      aria-pressed={selectedSingle || isStart || isEnd}
                      aria-current={c.isToday ? 'date' : undefined}
                      aria-label={dayLabelFmt.format(c.date)}
                      tabIndex={isFocusable ? 0 : -1}
                      onClick={() => pickDay(c.date)}
                      onMouseEnter={() => mode === 'range' && draftStart && setHover(c.date)}
                      onFocus={() => {
                        if (!isSameDay(c.date, focused)) setFocused(startOfDay(c.date));
                      }}
                    >
                      {c.day}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else if (view === 'month') {
    body = (
      <div className="ms-calendar__panel">
        {monthShort.map((label, m) => {
          const disabled = isMonthFullyDisabled(year, m, constraints);
          const current = isSameMonth(new Date(year, m, 1), value ?? rangeValue?.start ?? null);
          return (
            <button
              key={label}
              type="button"
              className={['ms-calendar__panel-cell', current && 'ms-calendar__cell--selected']
                .filter(Boolean)
                .join(' ')}
              disabled={disabled}
              onClick={() => {
                setViewDate(new Date(year, m, 1));
                setView('date');
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  } else {
    body = (
      <div className="ms-calendar__panel">
        {buildYearGrid(year).map((y) => {
          const outside = y < decadeStart(year) || y > decadeStart(year) + 9;
          const disabledY =
            (min && y < min.getFullYear()) || (max && y > max.getFullYear()) || false;
          return (
            <button
              key={y}
              type="button"
              className={['ms-calendar__panel-cell', outside && 'ms-calendar__cell--outside']
                .filter(Boolean)
                .join(' ')}
              disabled={disabledY}
              onClick={() => {
                setViewDate(new Date(y, month, 1));
                setView('month');
              }}
            >
              {y}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={rootClass}>
      {header}
      {body}
    </div>
  );
}
Calendar.displayName = 'Calendar';

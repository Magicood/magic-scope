import type { ComponentPropsWithoutRef, ElementType, KeyboardEvent, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import {
  addDays,
  addMonths,
  addYears,
  buildMonthMatrix,
  type CalendarMode,
  chunkWeeks,
  clampFocusIntoMonth,
  type DateBounds,
  type DateTuple,
  isDateDisabled,
  isInMultiple,
  isInRange,
  isSameDay,
  isSameMonth,
  type MonthCell,
  type MoveDir,
  moveFocus,
  normalizeRange,
  startOfDay,
  toggleMultiple,
  toISO,
  type WeekStart,
  weekdayOrder,
} from './logic';

export type { CalendarMode, DateTuple, WeekStart } from './logic';

/** 月历尺寸:fullscreen(大,占满)/ compact(紧凑卡片)。 */
export type CalendarSize = 'fullscreen' | 'compact';

/** 各部件细粒度 className 槽位。 */
export interface CalendarClassNames {
  /** 根容器。 */
  root?: string;
  /** 顶部导航栏。 */
  header?: string;
  /** 导航按钮(上/下月、上/下年)。 */
  nav?: string;
  /** 年月标题。 */
  title?: string;
  /** 日期网格 table。 */
  grid?: string;
  /** 周几表头单元格。 */
  weekday?: string;
  /** 单个日格(button)。 */
  cell?: string;
  /** 日格内的渲染容器(renderCell 注入处)。 */
  cellContent?: string;
}

/** renderCell 回调拿到的上下文信息。 */
export interface CalendarCellInfo {
  /** 该格日期。 */
  date: Date;
  /** 是否属于当前展示月。 */
  inCurrentMonth: boolean;
  /** 是否今天。 */
  isToday: boolean;
  /** 是否被选中(任一模式)。 */
  isSelected: boolean;
  /** 是否落在范围内(range 模式)。 */
  inRange: boolean;
  /** 是否禁用。 */
  isDisabled: boolean;
}

export interface CalendarProps {
  /** 选择模式:single 单选 / range 范围 / multiple 多选。默认 single。 */
  mode?: CalendarMode;

  /** 受控值(single)。null=未选。 */
  value?: Date | null | undefined;
  /** 非受控初值(single)。 */
  defaultValue?: Date | null | undefined;
  /**
   * single 模式选中回调。
   * @param date 选中的日期(本地 0 点)
   */
  onChange?: ((date: Date) => void) | undefined;

  /** 受控值(range)。 */
  rangeValue?: DateTuple | null | undefined;
  /** 非受控初值(range)。 */
  defaultRangeValue?: DateTuple | null | undefined;
  /**
   * range 模式完成一次完整选择(start+end)的回调。
   * @param range 升序归一后的 [start, end]
   */
  onRangeChange?: ((range: DateTuple) => void) | undefined;

  /** 受控值(multiple)。 */
  multipleValue?: Date[] | undefined;
  /** 非受控初值(multiple)。 */
  defaultMultipleValue?: Date[] | undefined;
  /**
   * multiple 模式切换回调。
   * @param dates 切换后的升序日期数组
   */
  onMultipleChange?: ((dates: Date[]) => void) | undefined;

  /** 受控展示面板(决定当前展示的年月)。 */
  panelDate?: Date | undefined;
  /** 非受控展示面板初值。 */
  defaultPanelDate?: Date | undefined;
  /**
   * 翻页回调(切月 / 切年 / 跨月边界自动翻页时触发)。
   * @param date 新展示面板对应的月份首日
   */
  onPanelChange?: ((date: Date) => void) | undefined;

  /** 可选下限。 */
  minDate?: Date | null | undefined;
  /** 可选上限。 */
  maxDate?: Date | null | undefined;
  /** 自定义禁用判定(优先于 min/max 之外的额外规则)。 */
  disabledDate?: ((date: Date) => boolean) | undefined;

  /** 一周起始(0=周日 … 6=周六)。默认 1(周一)。 */
  weekStartsOn?: WeekStart;
  /** BCP-47 locale(月名 / 周名 / 日期 aria-label 经 Intl 取)。不传用运行时默认。 */
  locale?: string | undefined;
  /** 「今天」基准(测试注入;不传用 new Date)。 */
  referenceDate?: Date | undefined;

  /** 尺寸。默认 fullscreen。 */
  size?: CalendarSize;
  /** 聚焦发光 / 选中色调。默认 primary。 */
  tone?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

  /**
   * 自定义整格渲染(覆盖默认数字 + 注入徽标 / 事件圆点)。返回 ReactNode 渲染在日格内。
   * @param date 该格日期
   * @param info 该格状态(选中 / 今天 / 范围 / 禁用等)
   */
  renderCell?: ((date: Date, info: CalendarCellInfo) => ReactNode) | undefined;
  /**
   * 在默认数字**下方**附加内容(放事件圆点 / 徽标),不接管整格。与 renderCell 二选一(renderCell 优先)。
   * @param date 该格日期
   * @param info 该格状态
   */
  dateCellRender?: ((date: Date, info: CalendarCellInfo) => ReactNode) | undefined;

  /** 各部件 className。 */
  classNames?: CalendarClassNames;
  /** 根 className。 */
  className?: string;
  /** 多态根标签(默认 'div')。 */
  as?: ElementType;
  /** 无障碍标签(标到 role=grid 上)。 */
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

type DivProps = Omit<ComponentPropsWithoutRef<'div'>, keyof CalendarProps>;

/** 用于生成本地化周名的基准周(2023-01-01 是周日)。 */
const WEEK_BASE = new Date(2023, 0, 1);

/**
 * Calendar —— 独立月历(data-display)。区别于 DatePicker 的「输入 + 弹层」,这是直接铺在页面里的整月日历。
 *
 * 渲染周几表头 + 6×7 日格(含上/下月补位、弱化样式),顶部可切上/下月与上/下年。支持 single / range / multiple
 * 三种选择、today 高亮、minDate/maxDate/disabledDate 禁用、weekStartsOn 周起始、renderCell / dateCellRender
 * 留口(事件圆点 / 徽标)、fullscreen 与 compact 两种尺寸。
 *
 * 完整键盘网格导航(role=grid):← → 前后一天、↑ ↓ 前后一周、PageUp/Down 前后一月、Shift+PageUp/Down 前后一年、
 * Home/End 本周首尾、Enter/Space 选中;焦点日 roving(单一 tabIndex),跨月边界自动翻页。
 *
 * 日期数学全走同目录 logic.ts(零外部库,可平移 core);月名 / 周名 / 日期文案经 Intl 按 locale 取(不硬编码)。
 * 样式见 Calendar.css。受控 / 非受控 + 受控翻页面板(panelDate/onPanelChange)。
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps & DivProps>((props, ref) => {
  const {
    mode = 'single',
    value: valueProp,
    defaultValue = null,
    onChange,
    rangeValue: rangeProp,
    defaultRangeValue = null,
    onRangeChange,
    multipleValue: multipleProp,
    defaultMultipleValue,
    onMultipleChange,
    panelDate: panelProp,
    defaultPanelDate,
    onPanelChange,
    minDate,
    maxDate,
    disabledDate,
    weekStartsOn = 1,
    locale,
    referenceDate,
    size = 'fullscreen',
    tone = 'primary',
    renderCell,
    dateCellRender,
    classNames,
    className,
    as,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    onKeyDown,
    ...rest
  } = props;

  const t = useMessages();
  const today = useMemo(() => startOfDay(referenceDate ?? new Date()), [referenceDate]);
  const bounds: DateBounds = useMemo(
    () => ({ min: minDate, max: maxDate, disabledDate }),
    [minDate, maxDate, disabledDate],
  );

  /* ── 受控 / 非受控:single value ── */
  const isValueControlled = valueProp !== undefined;
  const [valueState, setValueState] = useState<Date | null>(defaultValue);
  const value = isValueControlled ? (valueProp ?? null) : valueState;

  /* ── range ── */
  const isRangeControlled = rangeProp !== undefined;
  const [rangeState, setRangeState] = useState<DateTuple | null>(defaultRangeValue);
  const range = isRangeControlled ? (rangeProp ?? null) : rangeState;
  // range 半选草稿(选了 start 等 end)
  const [draftStart, setDraftStart] = useState<Date | null>(null);
  const [hover, setHover] = useState<Date | null>(null);

  /* ── multiple ── */
  const isMultipleControlled = multipleProp !== undefined;
  const [multipleState, setMultipleState] = useState<Date[]>(defaultMultipleValue ?? []);
  const multiple = isMultipleControlled ? (multipleProp ?? []) : multipleState;

  /* ── 展示面板(受控翻页) ── */
  // lazy 初值:仅挂载时算一次(后续翻页走 state / 受控 prop),故只读首挂时的 props
  const isPanelControlled = panelProp !== undefined;
  const [panelState, setPanelState] = useState<Date>(() => {
    const base =
      defaultPanelDate ?? value ?? (Array.isArray(range) ? range[0] : null) ?? multiple[0] ?? today;
    return startOfDay(new Date(base.getFullYear(), base.getMonth(), 1));
  });
  const panel = isPanelControlled && panelProp ? startOfDay(panelProp) : panelState;
  const panelYear = panel.getFullYear();
  const panelMonth = panel.getMonth();

  const setPanel = useCallback(
    (next: Date) => {
      const firstOfMonth = startOfDay(new Date(next.getFullYear(), next.getMonth(), 1));
      if (!isPanelControlled) setPanelState(firstOfMonth);
      onPanelChange?.(firstOfMonth);
    },
    [isPanelControlled, onPanelChange],
  );

  /* ── 焦点日 roving ── */
  // lazy 初值:仅挂载时算一次
  const [focused, setFocused] = useState<Date>(() => {
    const base = value ?? (Array.isArray(range) ? range[0] : null) ?? multiple[0] ?? today;
    return startOfDay(base);
  });

  // 导航按钮翻页:除了切面板,还要把 roving 焦点夹进新展示月,避免 focused 落在新月 42 格之外
  // 导致整个网格没有任何一格拿到 tabIndex=0、退出 Tab 序(见 #1)。
  const goToPanel = useCallback(
    (next: Date) => {
      setPanel(next);
      setFocused((prev) => clampFocusIntoMonth(prev, next.getFullYear(), next.getMonth(), bounds));
    },
    [setPanel, bounds],
  );
  const [focusTick, setFocusTick] = useState(0);
  const gridRef = useRef<HTMLTableElement>(null);

  // 键盘移动后把 DOM 焦点落到对应日格(focusTick 触发,避免初次挂载抢焦点)
  useEffect(() => {
    if (focusTick === 0) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${toISO(focused)}"]`)?.focus();
  }, [focusTick, focused]);

  /* ── 本地化文案 ── */
  const weekdays = useMemo(() => {
    const fmtShort = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const fmtLong = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    return weekdayOrder(weekStartsOn).map((wd) => ({
      short: fmtShort.format(addDays(WEEK_BASE, wd)),
      long: fmtLong.format(addDays(WEEK_BASE, wd)),
    }));
  }, [locale, weekStartsOn]);

  const titleLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(panel),
    [locale, panel],
  );
  const dayLabelFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'full' }),
    [locale],
  );

  const cells = useMemo(
    () => buildMonthMatrix(panelYear, panelMonth, weekStartsOn, today),
    [panelYear, panelMonth, weekStartsOn, today],
  );
  const weeks = useMemo(() => chunkWeeks(cells), [cells]);

  // roving 唯一来源:网格里**永远且仅有一格**拿到 tabIndex=0。
  // focused 在可见 42 格内则用它;否则(受控翻页 / 父组件改 panelDate 后 focused 未跟随)
  // 把 focused 夹进当前展示月,保证键盘用户 Tab 进来始终有落脚点(见 #1)。
  const gridFocusDate = useMemo(() => {
    if (cells.some((c) => isSameDay(c.date, focused))) return focused;
    return clampFocusIntoMonth(focused, panelYear, panelMonth, bounds);
  }, [cells, focused, panelYear, panelMonth, bounds]);

  /* ── 选择提交 ── */
  const commit = (date: Date) => {
    if (isDateDisabled(date, bounds)) return;
    const day = startOfDay(date);
    if (mode === 'single') {
      if (!isValueControlled) setValueState(day);
      onChange?.(day);
      return;
    }
    if (mode === 'multiple') {
      const next = toggleMultiple(multiple, day);
      if (!isMultipleControlled) setMultipleState(next);
      onMultipleChange?.(next);
      return;
    }
    // range:第一次落 start(草稿),第二次归一升序提交
    if (!draftStart) {
      setDraftStart(day);
      setHover(day);
      return;
    }
    const tuple = normalizeRange(draftStart, day);
    setDraftStart(null);
    setHover(null);
    if (!isRangeControlled) setRangeState(tuple);
    onRangeChange?.(tuple);
  };

  /* ── 键盘网格导航 ── */
  const applyMove = (dir: MoveDir) => {
    // 从「当前可见的落脚格」(gridFocusDate)起步,而非可能停在月外的裸 focused:
    // 受控翻页后 focused 未跟随时,方向键应从用户实际看到的高亮格继续移动,保持 roving 一致。
    const res = moveFocus(gridFocusDate, dir, weekStartsOn, panelYear, panelMonth, bounds);
    if (!res) return;
    setFocused(res.date);
    if (res.shouldPaginate || !isSameMonth(res.date, panel)) setPanel(res.date);
    setFocusTick((v) => v + 1);
  };

  const handleGridKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    let handled = true;
    switch (e.key) {
      case 'ArrowLeft':
        applyMove('prevDay');
        break;
      case 'ArrowRight':
        applyMove('nextDay');
        break;
      case 'ArrowUp':
        applyMove('prevWeek');
        break;
      case 'ArrowDown':
        applyMove('nextWeek');
        break;
      case 'PageUp':
        applyMove(e.shiftKey ? 'prevYear' : 'prevMonth');
        break;
      case 'PageDown':
        applyMove(e.shiftKey ? 'nextYear' : 'nextMonth');
        break;
      case 'Home':
        applyMove('weekStart');
        break;
      case 'End':
        applyMove('weekEnd');
        break;
      case 'Enter':
      case ' ':
        // 提交当前可见落脚格(gridFocusDate),而非可能停在月外的裸 focused。
        commit(gridFocusDate);
        break;
      default:
        handled = false;
    }
    if (handled) e.preventDefault();
  };

  /* ── 渲染辅助 ── */
  const cellState = (c: MonthCell) => {
    const disabled = isDateDisabled(c.date, bounds);
    const rStart = range?.[0] ?? null;
    const rEnd = range?.[1] ?? null;
    const isStart =
      mode === 'range' && (isSameDay(c.date, rStart) || isSameDay(c.date, draftStart));
    const isEnd = mode === 'range' && isSameDay(c.date, rEnd);
    const selectedSingle = mode === 'single' && isSameDay(c.date, value);
    const selectedMultiple = mode === 'multiple' && isInMultiple(multiple, c.date);
    const inRange =
      mode === 'range' &&
      (isInRange(c.date, rStart, rEnd) ||
        (draftStart != null && hover != null && isInRange(c.date, draftStart, hover)));
    const isSelected = selectedSingle || selectedMultiple || isStart || isEnd;
    return { disabled, isStart, isEnd, inRange, isSelected };
  };

  // 导航按钮进入正常 Tab 序(不再硬编码 tabIndex=-1),保证纯键盘用户有可达、可发现的翻月 / 翻年入口(见 #2)。
  const navBtn = (label: string, glyph: string, onClick: () => void) => (
    <button
      type="button"
      className={['ms-cal__nav', classNames?.nav].filter(Boolean).join(' ')}
      aria-label={label}
      onClick={onClick}
    >
      <span aria-hidden="true">{glyph}</span>
    </button>
  );

  const Root = (as ?? 'div') as ElementType;
  const rootClass = ['ms-cal', `ms-cal--${size}`, `ms-tone-${tone}`, className, classNames?.root]
    .filter(Boolean)
    .join(' ');

  return (
    <Root ref={ref} className={rootClass} {...(rest as DivProps)}>
      <div className={['ms-cal__header', classNames?.header].filter(Boolean).join(' ')}>
        {navBtn(t('datePicker.prevYear'), '«', () => goToPanel(addYears(panel, -1)))}
        {navBtn(t('datePicker.prevMonth'), '‹', () => goToPanel(addMonths(panel, -1)))}
        <span
          className={['ms-cal__title', classNames?.title].filter(Boolean).join(' ')}
          aria-live="polite"
        >
          {titleLabel}
        </span>
        {navBtn(t('datePicker.nextMonth'), '›', () => goToPanel(addMonths(panel, 1)))}
        {navBtn(t('datePicker.nextYear'), '»', () => goToPanel(addYears(panel, 1)))}
      </div>

      <table
        ref={gridRef}
        className={['ms-cal__grid', classNames?.grid].filter(Boolean).join(' ')}
        // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: WAI-ARIA「日期网格」模式要求日历表用 role=grid 承载二维方向键导航,table 是其语义基底
        role="grid"
        aria-label={ariaLabel ?? titleLabel}
        aria-labelledby={ariaLabelledby}
        onKeyDown={composeEventHandlers(
          onKeyDown as ((e: KeyboardEvent<HTMLTableElement>) => void) | undefined,
          handleGridKeyDown,
        )}
      >
        <thead>
          {/* biome-ignore lint/a11y/noRedundantRoles: table 显式 role=grid 时,子元素的隐式表格角色被改写,需显式标 row/columnheader/gridcell 才能被 AT 与测试正确识别 */}
          <tr role="row" className="ms-cal__weekdays">
            {weekdays.map((w) => (
              <th
                key={w.long}
                scope="col"
                // biome-ignore lint/a11y/noRedundantRoles: 同上,role=grid 下需显式 columnheader
                role="columnheader"
                abbr={w.long}
                className={['ms-cal__weekday', classNames?.weekday].filter(Boolean).join(' ')}
              >
                {w.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className="ms-cal__weeks"
          // 鼠标移出网格时清掉 range 区间预览的 hover,避免「指针已离开却仍冻结高亮一段范围」(见 #4)。
          onMouseLeave={() => {
            if (mode === 'range' && draftStart) setHover(null);
          }}
        >
          {weeks.map((week) => (
            // biome-ignore lint/a11y/noRedundantRoles: 同上,role=grid 下需显式 row
            <tr role="row" key={week[0]?.iso}>
              {week.map((c) => {
                const { disabled, isStart, isEnd, inRange, isSelected } = cellState(c);
                // roving 唯一来源走派生的 gridFocusDate(而非裸 focused):受控翻页 / 父组件改
                // panelDate 后 focused 仍停在月外时,gridFocusDate 已夹回可见月,保证可见 42 格内
                // 恒有且仅有一格 tabIndex=0,网格不会整体退出 Tab 序(见 #1)。
                const isFocusable = isSameDay(c.date, gridFocusDate);
                const info: CalendarCellInfo = {
                  date: c.date,
                  inCurrentMonth: c.inCurrentMonth,
                  isToday: c.isToday,
                  isSelected,
                  inRange,
                  isDisabled: disabled,
                };
                const cellClass = [
                  'ms-cal__cell',
                  !c.inCurrentMonth && 'ms-cal__cell--outside',
                  c.isToday && 'ms-cal__cell--today',
                  isSelected && 'ms-cal__cell--selected',
                  inRange && 'ms-cal__cell--in-range',
                  isStart && 'ms-cal__cell--range-start',
                  isEnd && 'ms-cal__cell--range-end',
                  classNames?.cell,
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  // biome-ignore lint/a11y/useFocusableInteractive: 焦点落在内部 roving button(WAI-ARIA 网格「单 widget 单元格」模式),gridcell 自身不进 Tab 序
                  <td
                    key={c.iso}
                    // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: role=grid 下 td 的隐式角色就是 gridcell,显式标注让 AT 与测试都能识别
                    role="gridcell"
                    aria-selected={isSelected}
                    aria-current={c.isToday ? 'date' : undefined}
                    className="ms-cal__cell-wrap"
                  >
                    <button
                      type="button"
                      data-iso={c.iso}
                      className={cellClass}
                      disabled={disabled}
                      aria-disabled={disabled || undefined}
                      aria-label={dayLabelFmt.format(c.date)}
                      tabIndex={isFocusable ? 0 : -1}
                      onClick={() => commit(c.date)}
                      onKeyDown={(e) => {
                        // Enter/Space 的提交统一由 grid 的 onKeyDown 处理(commit(focused))。
                        // 这里在按钮源头 preventDefault,掐掉浏览器对 <button> 的原生激活:
                        // Enter 在 keydown 合成 click、Space 在 keyup 合成 click,二者都会再 commit 一次,
                        // 在 multiple 模式互相抵消、range 模式一步跳到空区间(见 #3)。只阻断、不在此提交。
                        if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
                      }}
                      onMouseEnter={() => {
                        if (mode === 'range' && draftStart) setHover(c.date);
                      }}
                      onFocus={() => {
                        if (!isSameDay(c.date, focused)) setFocused(startOfDay(c.date));
                      }}
                    >
                      {renderCell ? (
                        <span
                          className={['ms-cal__cell-content', classNames?.cellContent]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {renderCell(c.date, info)}
                        </span>
                      ) : (
                        <>
                          <span className="ms-cal__cell-day">{c.day}</span>
                          {dateCellRender && (
                            <span
                              className={['ms-cal__cell-content', classNames?.cellContent]
                                .filter(Boolean)
                                .join(' ')}
                            >
                              {dateCellRender(c.date, info)}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Root>
  );
});
Calendar.displayName = 'Calendar';

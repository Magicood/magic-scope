/**
 * Calendar 纯逻辑(零 React、零外部库、零 locale 硬编码)—— 独立月历的日期数学内核。
 *
 * 全部为纯函数,可平移 `@magic-scope/core`。月名 / 周名等本地化文案由 React 壳用
 * `Intl.DateTimeFormat` 按 locale 取(不在此硬编码)。日期一律按**本地时区**的年月日处理,
 * 不引入时间分量,避免跨时区偏一天。
 *
 * 刻意与 DatePicker/logic.ts 解耦(各写一份纯逻辑),互不 import,便于各自演进。
 */

/** 一周起始日(0=周日 … 6=周六)。 */
export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** 选择模式:单选 / 范围 / 多选。 */
export type CalendarMode = 'single' | 'range' | 'multiple';

/** 范围选择值(可半选:仅 start 有值)。 */
export type DateTuple = [Date, Date];

/** 日期可用性约束。 */
export interface DateBounds {
  min?: Date | null | undefined;
  max?: Date | null | undefined;
  disabledDate?: ((date: Date) => boolean) | undefined;
}

/** 月历单元格(一格一天)。 */
export interface MonthCell {
  /** 该格对应日期(本地 0 点)。 */
  date: Date;
  /** 当月第几天(1..31)。 */
  day: number;
  /** 月份(0..11);用于跨月判断。 */
  month: number;
  /** 年份。 */
  year: number;
  /** 是否属于当前展示月份(否则是上/下月补位,弱化样式)。 */
  inCurrentMonth: boolean;
  /** 是否今天(由调用方传入 referenceDate 判定,保持纯函数无「现在」依赖)。 */
  isToday: boolean;
  /** 本地 YYYY-MM-DD,用作稳定 key / data-iso。 */
  iso: string;
  /** 周内序号(0..6,已按 weekStart 折算到列)。 */
  weekday: number;
}

/* ─────────────────────────── 基础日期运算 ─────────────────────────── */

/** 归一到当天 0 点(去掉时分秒,避免时间分量干扰比较)。 */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** 同一天(忽略时间);任一为空返回 false。 */
export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** 同年同月。 */
export function isSameMonth(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** 某年某月的天数(monthIndex 0..11;依赖「下月第 0 天 = 本月最后一天」)。 */
export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** 加减天:跨月 / 跨年 / 闰年由 Date 构造器天然进位。 */
export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/**
 * 加减月:把 day 夹到目标月天数,避免 1/31 + 1 月 溢出跳到 3 月(跳过短月)。
 * 跨年由整除 / 取模处理(如 12 月 + 1 月 → 次年 1 月)。
 */
export function addMonths(d: Date, n: number): Date {
  const total = d.getMonth() + n;
  const y = d.getFullYear() + Math.floor(total / 12);
  const m = ((total % 12) + 12) % 12;
  return new Date(y, m, Math.min(d.getDate(), daysInMonth(y, m)));
}

/** 加减年:把 day 夹到目标月天数(2/29 平年 → 2/28)。 */
export function addYears(d: Date, n: number): Date {
  const y = d.getFullYear() + n;
  return new Date(y, d.getMonth(), Math.min(d.getDate(), daysInMonth(y, d.getMonth())));
}

/** a < b(按天)。 */
export function isBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

/** a > b(按天)。 */
export function isAfter(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

/** 夹在 [min, max] 之间(按天);min/max 可空。 */
export function clampDate(d: Date, min?: Date | null, max?: Date | null): Date {
  if (min && isBefore(d, min)) return startOfDay(min);
  if (max && isAfter(d, max)) return startOfDay(max);
  return startOfDay(d);
}

/* ─────────────────────────── ISO 序列化(本地) ─────────────────────────── */

const pad2 = (n: number): string => (n < 10 ? `0${n}` : String(n));

/** 本地 YYYY-MM-DD(非 UTC,避免跨时区偏一天)。 */
export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/* ─────────────────────────── 可用性 / 范围 ─────────────────────────── */

/** 该日期是否被禁用(超出 min/max 或命中 disabledDate)。 */
export function isDateDisabled(date: Date, b: DateBounds): boolean {
  if (b.min && isBefore(date, b.min)) return true;
  if (b.max && isAfter(date, b.max)) return true;
  if (b.disabledDate?.(date)) return true;
  return false;
}

/** date 是否落在 [start, end] 闭区间内(按天,start/end 可乱序)。 */
export function isInRange(
  date: Date,
  start: Date | null | undefined,
  end: Date | null | undefined,
): boolean {
  if (!start || !end) return false;
  const t = startOfDay(date).getTime();
  const a = startOfDay(start).getTime();
  const z = startOfDay(end).getTime();
  const lo = Math.min(a, z);
  const hi = Math.max(a, z);
  return t >= lo && t <= hi;
}

/** 把(可能乱序的)两端归一为升序范围 [start, end]。 */
export function normalizeRange(a: Date, b: Date): DateTuple {
  return isBefore(b, a) ? [startOfDay(b), startOfDay(a)] : [startOfDay(a), startOfDay(b)];
}

/* ─────────────────────────── 月历矩阵 ─────────────────────────── */

/** 按 weekStart 重排的周内序(如 weekStart=1 → [1,2,3,4,5,6,0])。 */
export function weekdayOrder(weekStart: WeekStart): number[] {
  return Array.from({ length: 7 }, (_, i) => (i + weekStart) % 7);
}

/** 某日相对 weekStart 落在第几列(0..6)。 */
export function columnOf(date: Date, weekStart: WeekStart): number {
  return (date.getDay() - weekStart + 7) % 7;
}

/**
 * 构建某年某月的 6×7=42 单元格矩阵(含上 / 下月补位),周列按 weekStart 排。
 * referenceDate 用于标 isToday(由调用方传入,保持纯函数无「现在」依赖)。
 * 固定 42 格(6 行)保证不同月份网格高度一致,避免布局抖动。
 */
export function buildMonthMatrix(
  year: number,
  monthIndex: number,
  weekStart: WeekStart,
  referenceDate: Date,
): MonthCell[] {
  const first = new Date(year, monthIndex, 1);
  // 当月 1 号相对 weekStart 的偏移,决定网格起点(回退到上月补位)
  const offset = columnOf(first, weekStart);
  const gridStart = new Date(year, monthIndex, 1 - offset);
  const today = startOfDay(referenceDate);
  const cells: MonthCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    cells.push({
      date,
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      inCurrentMonth: date.getMonth() === monthIndex && date.getFullYear() === year,
      isToday: isSameDay(date, today),
      iso: toISO(date),
      weekday: columnOf(date, weekStart),
    });
  }
  return cells;
}

/** 把 42 格切成 6 周(每周 7 格),便于按 role=row 渲染。 */
export function chunkWeeks(cells: MonthCell[]): MonthCell[][] {
  const weeks: MonthCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/* ─────────────────────────── 键盘焦点移动 ─────────────────────────── */

/** 网格键盘移动方向。 */
export type MoveDir =
  | 'prevDay'
  | 'nextDay'
  | 'prevWeek'
  | 'nextWeek'
  | 'prevMonth'
  | 'nextMonth'
  | 'prevYear'
  | 'nextYear'
  | 'weekStart'
  | 'weekEnd';

/** moveFocus 的结果:目标焦点日 + 是否需要翻页(目标不在当前展示月)。 */
export interface FocusMove {
  /** 移动后的焦点日(已按 min/max 夹取、跳过禁用日)。 */
  date: Date;
  /** 目标是否落在 panelYear/panelMonth 之外(需翻页)。 */
  shouldPaginate: boolean;
}

/** 单纯按方向把焦点日移动一步(不考虑禁用 / 边界)。 */
export function stepFocus(focused: Date, dir: MoveDir, weekStart: WeekStart): Date {
  switch (dir) {
    case 'prevDay':
      return addDays(focused, -1);
    case 'nextDay':
      return addDays(focused, 1);
    case 'prevWeek':
      return addDays(focused, -7);
    case 'nextWeek':
      return addDays(focused, 7);
    case 'prevMonth':
      return addMonths(focused, -1);
    case 'nextMonth':
      return addMonths(focused, 1);
    case 'prevYear':
      return addYears(focused, -1);
    case 'nextYear':
      return addYears(focused, 1);
    case 'weekStart':
      return addDays(focused, -columnOf(focused, weekStart));
    case 'weekEnd':
      return addDays(focused, 6 - columnOf(focused, weekStart));
  }
}

/**
 * 按键移动焦点日:夹到 [min,max]、跳过被禁用日(沿移动方向找最近可选;触界则放弃),
 * 并判断是否需要把展示面板翻到目标所在月(跨月边界自动翻页)。
 *
 * @param focused      当前焦点日
 * @param dir          移动方向
 * @param weekStart    一周起始(影响 Home/End)
 * @param panelYear    当前展示面板的年
 * @param panelMonth   当前展示面板的月(0..11)
 * @param bounds       min/max/disabledDate 约束
 * @returns            目标焦点日与是否翻页;null 表示无法移动(全被禁用 / 触界)
 */
export function moveFocus(
  focused: Date,
  dir: MoveDir,
  weekStart: WeekStart,
  panelYear: number,
  panelMonth: number,
  bounds: DateBounds,
): FocusMove | null {
  const raw = stepFocus(focused, dir, weekStart);
  const moveDir = startOfDay(raw).getTime() >= startOfDay(focused).getTime() ? 1 : -1;
  let target = clampDate(raw, bounds.min, bounds.max);

  if (isDateDisabled(target, bounds)) {
    let found: Date | null = null;
    let probe = target;
    // 沿移动方向逐日探测最近可选日;被边界夹住即停(不再越界)
    for (let i = 0; i < 366; i++) {
      const stepped = addDays(probe, moveDir);
      const clamped = clampDate(stepped, bounds.min, bounds.max);
      if (!isSameDay(clamped, stepped)) break; // 被夹住 = 触界
      probe = clamped;
      if (!isDateDisabled(clamped, bounds)) {
        found = clamped;
        break;
      }
    }
    if (!found) return null;
    target = found;
  }

  const shouldPaginate = target.getFullYear() !== panelYear || target.getMonth() !== panelMonth;
  return { date: target, shouldPaginate };
}

/**
 * 把焦点日夹进指定的展示月(panelYear/panelMonth),保证 roving 焦点永远落在可见网格里的一格。
 *
 * 翻页(点击导航按钮 / 受控父组件翻页)后,原 `focused` 可能落在新展示月的 42 格之外,
 * 导致没有任何一格拿到 tabIndex=0、整个网格退出 Tab 序。此函数把 `focused` 折算到目标月内的
 * 等价日(尽量保留「几号」,该月没有这一天则夹到月末),再夹到 [min,max] 并沿就近方向跳过禁用日;
 * 若目标月内全被禁用,退回 clampDate 后的目标日(调用方仍会渲染它为 focusable,只是该日 disabled)。
 *
 * 纯函数,零副作用,可平移 core。
 *
 * @param focused     当前焦点日(可能在展示月之外)
 * @param panelYear   展示面板的年
 * @param panelMonth  展示面板的月(0..11)
 * @param bounds      min/max/disabledDate 约束
 * @returns           落在 [panelYear, panelMonth] 内的焦点日(已就近避开禁用日)
 */
export function clampFocusIntoMonth(
  focused: Date,
  panelYear: number,
  panelMonth: number,
  bounds: DateBounds,
): Date {
  // 已在展示月内:仅做 min/max 夹取(夹取后若仍在本月则直接用,跳过禁用交给下方探测)
  const sameMonth = focused.getFullYear() === panelYear && focused.getMonth() === panelMonth;
  const day = sameMonth
    ? focused.getDate()
    : Math.min(focused.getDate(), daysInMonth(panelYear, panelMonth));
  const base = startOfDay(new Date(panelYear, panelMonth, day));
  let target = clampDate(base, bounds.min, bounds.max);
  // 夹取可能把日期推出展示月(min/max 在月外):再拉回月内的最近端点
  if (target.getFullYear() !== panelYear || target.getMonth() !== panelMonth) {
    const firstOfMonth = startOfDay(new Date(panelYear, panelMonth, 1));
    const lastOfMonth = startOfDay(
      new Date(panelYear, panelMonth, daysInMonth(panelYear, panelMonth)),
    );
    target = isBefore(target, firstOfMonth) ? firstOfMonth : lastOfMonth;
  }
  if (!isDateDisabled(target, bounds)) return target;
  // 目标日被禁用:在本月范围内向后、再向前就近找一个可选日
  const last = daysInMonth(panelYear, panelMonth);
  for (let probe = target.getDate() + 1; probe <= last; probe++) {
    const c = startOfDay(new Date(panelYear, panelMonth, probe));
    if (!isDateDisabled(c, bounds)) return c;
  }
  for (let probe = target.getDate() - 1; probe >= 1; probe--) {
    const c = startOfDay(new Date(panelYear, panelMonth, probe));
    if (!isDateDisabled(c, bounds)) return c;
  }
  // 本月全禁用:退回夹取后的目标日(仍 focusable,但渲染为 disabled)
  return target;
}

/* ─────────────────────────── 多选辅助 ─────────────────────────── */

/** 在多选数组中切换某日(已存在则移除,否则加入并按时间升序);纯函数,返回新数组。 */
export function toggleMultiple(list: readonly Date[], date: Date): Date[] {
  const day = startOfDay(date);
  const exists = list.some((d) => isSameDay(d, day));
  const next = exists
    ? list.filter((d) => !isSameDay(d, day))
    : [...list, day].sort((a, b) => a.getTime() - b.getTime());
  return next;
}

/** date 是否在多选数组中。 */
export function isInMultiple(list: readonly Date[], date: Date | null | undefined): boolean {
  if (!date) return false;
  return list.some((d) => isSameDay(d, date));
}

/**
 * DatePicker 纯逻辑(零 React、零 i18n、零 locale 硬编码)—— 日期数学 + 日历矩阵的框架无关内核。
 *
 * 全部纯函数,可平移 `@magic-scope/core`。月名/周名等本地化文案由 React 壳用 `Intl.DateTimeFormat`
 * 按 locale 取(不在此硬编码),UI 文案(今天/清除/预设)走全库 i18n 字典。
 * 日期一律按**本地时区**的年月日处理(toISO 用本地 Y-M-D,非 UTC),避免跨时区偏一天。
 */

/** 日历视图层级:日 / 月 / 年(年视图为「十年」格)。 */
export type CalendarView = 'date' | 'month' | 'year';

/** 一周起始日(0=周日 … 6=周六)。 */
export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** 范围选择值。 */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/** 日期可用性约束。 */
export interface DateConstraints {
  min?: Date | null | undefined;
  max?: Date | null | undefined;
  disabledDate?: ((date: Date) => boolean) | undefined;
}

/** 日历单元格。 */
export interface DayCell {
  date: Date;
  day: number;
  /** 是否属于当前展示的月份(否则是上/下月补位)。 */
  inMonth: boolean;
  /** 是否今天。 */
  isToday: boolean;
  /** YYYY-MM-DD(本地)。 */
  iso: string;
}

/* ─────────────────────────── 基础日期运算 ─────────────────────────── */

/** 归一到当天 0 点(去掉时分秒,避免时间分量干扰比较)。 */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** 同一天(忽略时间)。 */
export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** 同一月(同年同月)。 */
export function isSameMonth(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
/** 某年某月的天数。 */
function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}
/** 加减月:把 day 夹到目标月天数,避免 1/31+1月 溢出跳到 3 月(跳过短月)。 */
export function addMonths(d: Date, n: number): Date {
  const total = d.getMonth() + n;
  const y = d.getFullYear() + Math.floor(total / 12);
  const m = ((total % 12) + 12) % 12;
  return new Date(y, m, Math.min(d.getDate(), daysInMonth(y, m)));
}
/** 加减年:把 day 夹到目标月天数(2/29 平年→2/28)。 */
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

/** 夹在 [min, max] 之间(按天)。 */
export function clampDate(d: Date, min?: Date | null, max?: Date | null): Date {
  if (min && isBefore(d, min)) return startOfDay(min);
  if (max && isAfter(d, max)) return startOfDay(max);
  return startOfDay(d);
}

/* ─────────────────────────── ISO 解析 / 序列化(本地) ─────────────────────────── */

const pad2 = (n: number): string => (n < 10 ? `0${n}` : String(n));

/** 本地 YYYY-MM-DD。 */
export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** 解析 YYYY-MM-DD(本地);非法返回 null。 */
export function fromISO(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(y, mo, day);
  // 校验(避免 2 月 30 日被 JS 归一到 3 月)
  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== day) return null;
  return d;
}

/* ─────────────────────────── 可用性 / 范围 ─────────────────────────── */

/** 该日期是否被禁用(超出 min/max 或命中 disabledDate)。 */
export function isDateDisabled(date: Date, c: DateConstraints): boolean {
  if (c.min && isBefore(date, c.min)) return true;
  if (c.max && isAfter(date, c.max)) return true;
  if (c.disabledDate?.(date)) return true;
  return false;
}

/** date 是否落在 [start, end] 闭区间内(按天,start/end 可乱序)。 */
export function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = startOfDay(date).getTime();
  const a = startOfDay(start).getTime();
  const b = startOfDay(end).getTime();
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return t >= lo && t <= hi;
}

/* ─────────────────────────── 日历矩阵 ─────────────────────────── */

/** 按 weekStart 重排的周内序(如 weekStart=1 → [1,2,3,4,5,6,0])。 */
export function weekdayOrder(weekStart: WeekStart): number[] {
  return Array.from({ length: 7 }, (_, i) => (i + weekStart) % 7);
}

/**
 * 构建某年某月的 6×7=42 单元格矩阵(含上/下月补位),周列按 weekStart 排。
 * today 用于标 isToday(由调用方传入,保持纯函数无「现在」依赖)。
 */
export function buildMonthMatrix(
  year: number,
  monthIndex: number,
  weekStart: WeekStart,
  today: Date,
): DayCell[] {
  const first = new Date(year, monthIndex, 1);
  // 当月 1 号相对 weekStart 的偏移,决定网格起点(回退到上月)
  const offset = (first.getDay() - weekStart + 7) % 7;
  const gridStart = new Date(year, monthIndex, 1 - offset);
  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    cells.push({
      date,
      day: date.getDate(),
      inMonth: date.getMonth() === monthIndex && date.getFullYear() === year,
      isToday: isSameDay(date, today),
      iso: toISO(date),
    });
  }
  return cells;
}

/** 年视图的「十年」格:返回含前后补位的 12 个年份(以 startDecade 为基准)。 */
export function decadeStart(year: number): number {
  return Math.floor(year / 10) * 10;
}

/** 返回年视图 12 格年份(decadeStart-1 … decadeStart+10)。 */
export function buildYearGrid(year: number): number[] {
  const base = decadeStart(year);
  return Array.from({ length: 12 }, (_, i) => base - 1 + i);
}

/** 月视图是否整月不可选(用于灰显「上/下月」导航与月格)。 */
export function isMonthFullyDisabled(
  year: number,
  monthIndex: number,
  c: DateConstraints,
): boolean {
  if (!c.min && !c.max) return false;
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  if (c.max && isBefore(c.max, first)) return true;
  if (c.min && isAfter(c.min, last)) return true;
  return false;
}

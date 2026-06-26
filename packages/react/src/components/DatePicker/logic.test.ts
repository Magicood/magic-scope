import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  addYears,
  buildMonthMatrix,
  buildYearGrid,
  clampDate,
  decadeStart,
  fromISO,
  isAfter,
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

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('基础日期运算', () => {
  it('startOfDay 去掉时间分量', () => {
    const x = new Date(2026, 5, 26, 13, 45, 30);
    expect(startOfDay(x).getHours()).toBe(0);
    expect(startOfDay(x).getDate()).toBe(26);
  });

  it('isSameDay / isSameMonth', () => {
    expect(isSameDay(d(2026, 6, 26), new Date(2026, 5, 26, 9, 0))).toBe(true);
    expect(isSameDay(d(2026, 6, 26), d(2026, 6, 27))).toBe(false);
    expect(isSameDay(null, d(2026, 6, 26))).toBe(false);
    expect(isSameMonth(d(2026, 6, 1), d(2026, 6, 30))).toBe(true);
    expect(isSameMonth(d(2026, 6, 30), d(2026, 7, 1))).toBe(false);
  });

  it('addDays/Months/Years 跨界进位', () => {
    expect(toISO(addDays(d(2026, 1, 31), 1))).toBe('2026-02-01');
    expect(toISO(addMonths(d(2026, 1, 15), 1))).toBe('2026-02-15');
  });

  it('addMonths/addYears 月末夹取不跳月(不溢出)', () => {
    expect(toISO(addMonths(d(2025, 1, 31), 1))).toBe('2025-02-28'); // 不跳过 2 月
    expect(toISO(addMonths(d(2025, 1, 31), 2))).toBe('2025-03-31');
    expect(toISO(addMonths(d(2025, 3, 31), -1))).toBe('2025-02-28'); // 3/31 退一月→2/28
    expect(toISO(addYears(d(2024, 2, 29), 1))).toBe('2025-02-28'); // 闰日→平年夹到 28
  });

  it('isBefore/isAfter 按天忽略时间', () => {
    expect(isBefore(new Date(2026, 5, 26, 23), new Date(2026, 5, 27, 1))).toBe(true);
    expect(isAfter(d(2026, 6, 28), d(2026, 6, 27))).toBe(true);
    expect(isBefore(new Date(2026, 5, 26, 1), new Date(2026, 5, 26, 23))).toBe(false); // 同天
  });

  it('clampDate 夹到 [min,max]', () => {
    expect(toISO(clampDate(d(2026, 1, 1), d(2026, 6, 1), d(2026, 6, 30)))).toBe('2026-06-01');
    expect(toISO(clampDate(d(2026, 12, 1), d(2026, 6, 1), d(2026, 6, 30)))).toBe('2026-06-30');
    expect(toISO(clampDate(d(2026, 6, 15), d(2026, 6, 1), d(2026, 6, 30)))).toBe('2026-06-15');
  });
});

describe('ISO 解析/序列化(本地)', () => {
  it('toISO 本地年月日,非 UTC', () => {
    expect(toISO(d(2026, 6, 9))).toBe('2026-06-09');
  });
  it('fromISO 合法/非法', () => {
    expect(toISO(fromISO('2026-06-26') as Date)).toBe('2026-06-26');
    expect(fromISO('2026-02-30')).toBeNull(); // 2 月 30 日非法
    expect(fromISO('not-a-date')).toBeNull();
    expect(fromISO('2026/06/26')).toBeNull();
  });
});

describe('可用性 / 范围', () => {
  it('isDateDisabled:min/max/disabledDate', () => {
    const c = {
      min: d(2026, 6, 1),
      max: d(2026, 6, 30),
      disabledDate: (x: Date) => x.getDate() === 15,
    };
    expect(isDateDisabled(d(2026, 5, 31), c)).toBe(true); // < min
    expect(isDateDisabled(d(2026, 7, 1), c)).toBe(true); // > max
    expect(isDateDisabled(d(2026, 6, 15), c)).toBe(true); // disabledDate
    expect(isDateDisabled(d(2026, 6, 10), c)).toBe(false);
  });

  it('isInRange 乱序也对', () => {
    expect(isInRange(d(2026, 6, 15), d(2026, 6, 10), d(2026, 6, 20))).toBe(true);
    expect(isInRange(d(2026, 6, 15), d(2026, 6, 20), d(2026, 6, 10))).toBe(true); // start/end 乱序
    expect(isInRange(d(2026, 6, 25), d(2026, 6, 10), d(2026, 6, 20))).toBe(false);
    expect(isInRange(d(2026, 6, 15), null, d(2026, 6, 20))).toBe(false);
  });
});

describe('日历矩阵', () => {
  it('weekdayOrder 按 weekStart 重排', () => {
    expect(weekdayOrder(0)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(weekdayOrder(1 as WeekStart)).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });

  it('buildMonthMatrix:42 格、起点对齐 weekStart、inMonth 正确', () => {
    // 2026-06:6月1日是周一。weekStart=0(周日)→ 偏移 1,网格从 5/31(周日)起
    const today = d(2026, 6, 26);
    const cells = buildMonthMatrix(2026, 5, 0, today);
    expect(cells).toHaveLength(42);
    expect(cells[0]?.iso).toBe('2026-05-31'); // 周日补位
    expect(cells[0]?.inMonth).toBe(false);
    const first = cells.find((c) => c.iso === '2026-06-01');
    expect(first?.inMonth).toBe(true);
    expect(cells.find((c) => c.iso === '2026-06-26')?.isToday).toBe(true);
  });

  it('buildMonthMatrix:weekStart=1 起点为周一', () => {
    const cells = buildMonthMatrix(2026, 5, 1, d(2026, 6, 26));
    // 6/1 是周一,weekStart=1 → 偏移 0,网格从 6/1 起
    expect(cells[0]?.iso).toBe('2026-06-01');
    expect(cells[0]?.inMonth).toBe(true);
  });

  it('decadeStart / buildYearGrid', () => {
    expect(decadeStart(2026)).toBe(2020);
    const grid = buildYearGrid(2026);
    expect(grid).toHaveLength(12);
    expect(grid[0]).toBe(2019); // base-1
    expect(grid[11]).toBe(2030);
  });

  it('isMonthFullyDisabled', () => {
    const c = { min: d(2026, 6, 10), max: d(2026, 6, 20) };
    expect(isMonthFullyDisabled(2026, 4, c)).toBe(true); // 5 月整月在 min 前
    expect(isMonthFullyDisabled(2026, 6, c)).toBe(true); // 7 月整月在 max 后
    expect(isMonthFullyDisabled(2026, 5, c)).toBe(false); // 6 月部分可选
  });
});

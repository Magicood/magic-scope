import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  addYears,
  buildMonthMatrix,
  chunkWeeks,
  clampDate,
  clampFocusIntoMonth,
  columnOf,
  daysInMonth,
  isAfter,
  isBefore,
  isDateDisabled,
  isInMultiple,
  isInRange,
  isSameDay,
  isSameMonth,
  moveFocus,
  normalizeRange,
  startOfDay,
  stepFocus,
  toggleMultiple,
  toISO,
  type WeekStart,
  weekdayOrder,
} from './logic';

/** 本地日期工厂(month 用 1..12 易读)。 */
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

/** 断言非空并收窄类型(免非空断言)。 */
function present<T>(v: T | null | undefined): T {
  if (v == null) throw new Error('期望非空值');
  return v;
}

describe('基础日期运算', () => {
  it('startOfDay 去掉时间分量', () => {
    const x = new Date(2026, 5, 26, 13, 45, 30, 500);
    const s = startOfDay(x);
    expect(s.getHours()).toBe(0);
    expect(s.getMinutes()).toBe(0);
    expect(s.getDate()).toBe(26);
  });

  it('isSameDay 忽略时间 / 处理空值', () => {
    expect(isSameDay(d(2026, 6, 26), new Date(2026, 5, 26, 9, 0))).toBe(true);
    expect(isSameDay(d(2026, 6, 26), d(2026, 6, 27))).toBe(false);
    expect(isSameDay(null, d(2026, 6, 26))).toBe(false);
    expect(isSameDay(d(2026, 6, 26), undefined)).toBe(false);
  });

  it('isSameMonth 同年同月', () => {
    expect(isSameMonth(d(2026, 6, 1), d(2026, 6, 30))).toBe(true);
    expect(isSameMonth(d(2026, 6, 30), d(2026, 7, 1))).toBe(false);
    expect(isSameMonth(d(2025, 6, 1), d(2026, 6, 1))).toBe(false); // 同月不同年
  });

  it('daysInMonth:含闰年 2 月', () => {
    expect(daysInMonth(2024, 1)).toBe(29); // 2024 闰年 2 月 = 29 天
    expect(daysInMonth(2025, 1)).toBe(28); // 2025 平年 2 月 = 28 天
    expect(daysInMonth(2026, 0)).toBe(31); // 1 月
    expect(daysInMonth(2026, 3)).toBe(30); // 4 月
    expect(daysInMonth(2000, 1)).toBe(29); // 世纪闰年
    expect(daysInMonth(1900, 1)).toBe(28); // 世纪平年(整百不被 400 整除)
  });
});

describe('addDays / addMonths / addYears —— 月末 / 闰年 / 跨年', () => {
  it('addDays 跨月 / 跨年进位', () => {
    expect(toISO(addDays(d(2026, 1, 31), 1))).toBe('2026-02-01'); // 1/31 + 1 → 2/1
    expect(toISO(addDays(d(2026, 12, 31), 1))).toBe('2027-01-01'); // 跨年
    expect(toISO(addDays(d(2026, 1, 1), -1))).toBe('2025-12-31'); // 倒退跨年
    expect(toISO(addDays(d(2024, 2, 28), 1))).toBe('2024-02-29'); // 闰年含 2/29
    expect(toISO(addDays(d(2025, 2, 28), 1))).toBe('2025-03-01'); // 平年直接到 3/1
  });

  it('addMonths 月末夹取不跳月(不溢出)', () => {
    expect(toISO(addMonths(d(2025, 1, 31), 1))).toBe('2025-02-28'); // 1/31 + 1 月 → 2/28(不跳到 3 月)
    expect(toISO(addMonths(d(2024, 1, 31), 1))).toBe('2024-02-29'); // 闰年 → 2/29
    expect(toISO(addMonths(d(2025, 1, 31), 2))).toBe('2025-03-31'); // + 2 月正常到 3/31
    expect(toISO(addMonths(d(2025, 3, 31), -1))).toBe('2025-02-28'); // 3/31 退一月 → 2/28
  });

  it('addMonths 跨年进位 / 倒退', () => {
    expect(toISO(addMonths(d(2026, 12, 15), 1))).toBe('2027-01-15'); // 12 月 → 次年 1 月
    expect(toISO(addMonths(d(2026, 1, 15), -1))).toBe('2025-12-15'); // 1 月退一月 → 上年 12 月
    expect(toISO(addMonths(d(2026, 6, 15), -18))).toBe('2024-12-15'); // 多年跨度
  });

  it('addYears 闰日夹取', () => {
    expect(toISO(addYears(d(2024, 2, 29), 1))).toBe('2025-02-28'); // 闰日 → 平年夹到 28
    expect(toISO(addYears(d(2024, 2, 29), 4))).toBe('2028-02-29'); // 下一个闰年仍是 29
    expect(toISO(addYears(d(2026, 6, 15), -2))).toBe('2024-06-15');
  });

  it('isBefore / isAfter 按天忽略时间', () => {
    expect(isBefore(new Date(2026, 5, 26, 23), new Date(2026, 5, 27, 1))).toBe(true);
    expect(isAfter(d(2026, 6, 28), d(2026, 6, 27))).toBe(true);
    expect(isBefore(new Date(2026, 5, 26, 1), new Date(2026, 5, 26, 23))).toBe(false); // 同天非 before
  });

  it('clampDate 夹到 [min,max]', () => {
    expect(toISO(clampDate(d(2026, 1, 1), d(2026, 6, 1), d(2026, 6, 30)))).toBe('2026-06-01');
    expect(toISO(clampDate(d(2026, 12, 1), d(2026, 6, 1), d(2026, 6, 30)))).toBe('2026-06-30');
    expect(toISO(clampDate(d(2026, 6, 15), d(2026, 6, 1), d(2026, 6, 30)))).toBe('2026-06-15');
    expect(toISO(clampDate(d(2026, 6, 15)))).toBe('2026-06-15'); // 无 min/max
  });
});

describe('可用性 / 范围 / 多选', () => {
  it('isDateDisabled:min / max / disabledDate', () => {
    const b = {
      min: d(2026, 6, 1),
      max: d(2026, 6, 30),
      disabledDate: (x: Date) => x.getDate() === 15,
    };
    expect(isDateDisabled(d(2026, 5, 31), b)).toBe(true); // < min
    expect(isDateDisabled(d(2026, 7, 1), b)).toBe(true); // > max
    expect(isDateDisabled(d(2026, 6, 15), b)).toBe(true); // disabledDate 命中
    expect(isDateDisabled(d(2026, 6, 10), b)).toBe(false);
    expect(isDateDisabled(d(2026, 6, 10), {})).toBe(false); // 无约束
  });

  it('isInRange:乱序也对 / 跨月 / 半选', () => {
    expect(isInRange(d(2026, 6, 15), d(2026, 6, 10), d(2026, 6, 20))).toBe(true);
    expect(isInRange(d(2026, 6, 15), d(2026, 6, 20), d(2026, 6, 10))).toBe(true); // start/end 乱序
    expect(isInRange(d(2026, 6, 25), d(2026, 6, 10), d(2026, 6, 20))).toBe(false);
    expect(isInRange(d(2026, 6, 15), null, d(2026, 6, 20))).toBe(false); // 半选不算区间
    // 范围跨月:6/28 → 7/3,中间 6/30 与 7/1 都在内
    expect(isInRange(d(2026, 6, 30), d(2026, 6, 28), d(2026, 7, 3))).toBe(true);
    expect(isInRange(d(2026, 7, 1), d(2026, 6, 28), d(2026, 7, 3))).toBe(true);
    expect(isInRange(d(2026, 7, 4), d(2026, 6, 28), d(2026, 7, 3))).toBe(false);
  });

  it('normalizeRange 归一升序', () => {
    expect(normalizeRange(d(2026, 6, 20), d(2026, 6, 10)).map(toISO)).toEqual([
      '2026-06-10',
      '2026-06-20',
    ]);
    expect(normalizeRange(d(2026, 6, 10), d(2026, 6, 20)).map(toISO)).toEqual([
      '2026-06-10',
      '2026-06-20',
    ]);
  });

  it('toggleMultiple:增 / 删 / 升序', () => {
    const a = toggleMultiple([], d(2026, 6, 10));
    expect(a.map(toISO)).toEqual(['2026-06-10']);
    const b = toggleMultiple(a, d(2026, 6, 5));
    expect(b.map(toISO)).toEqual(['2026-06-05', '2026-06-10']); // 自动升序
    const c = toggleMultiple(b, d(2026, 6, 10));
    expect(c.map(toISO)).toEqual(['2026-06-05']); // 再点同日 → 移除
  });

  it('isInMultiple', () => {
    const list = [d(2026, 6, 5), d(2026, 6, 10)];
    expect(isInMultiple(list, d(2026, 6, 10))).toBe(true);
    expect(isInMultiple(list, d(2026, 6, 11))).toBe(false);
    expect(isInMultiple(list, null)).toBe(false);
  });
});

describe('月历矩阵 buildMonthMatrix —— 黄金边界', () => {
  it('weekdayOrder / columnOf 按 weekStart 重排', () => {
    expect(weekdayOrder(0)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(weekdayOrder(1)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    // 2026-06-01 是周一(getDay=1):weekStart=1 时落第 0 列;weekStart=0 时落第 1 列
    expect(columnOf(d(2026, 6, 1), 1)).toBe(0);
    expect(columnOf(d(2026, 6, 1), 0)).toBe(1);
  });

  it('固定 42 格、6 行', () => {
    const cells = buildMonthMatrix(2026, 5, 1, d(2026, 6, 26));
    expect(cells).toHaveLength(42);
    expect(chunkWeeks(cells)).toHaveLength(6);
    expect(chunkWeeks(cells).every((w) => w.length === 7)).toBe(true);
  });

  it('weekStart=0(周日) vs weekStart=1(周一)首格不同', () => {
    // 2026-06:6/1 是周一
    const sun = buildMonthMatrix(2026, 5, 0, d(2026, 6, 26)); // 周日起
    expect(sun[0]?.iso).toBe('2026-05-31'); // 上月周日补位
    expect(sun[0]?.inCurrentMonth).toBe(false);
    expect(sun[1]?.iso).toBe('2026-06-01'); // 周一在第 2 格

    const mon = buildMonthMatrix(2026, 5, 1, d(2026, 6, 26)); // 周一起
    expect(mon[0]?.iso).toBe('2026-06-01'); // 偏移 0,当月 1 号即首格
    expect(mon[0]?.inCurrentMonth).toBe(true);
  });

  it('月初补位(上月)/ 月末补位(下月)弱化标记', () => {
    // 2026-06,周一起:6/1 首格;末尾应补 7 月若干天
    const cells = buildMonthMatrix(2026, 5, 1, d(2026, 6, 26));
    const first = cells.find((c) => c.iso === '2026-06-01');
    expect(first?.inCurrentMonth).toBe(true);
    // 6 月 30 天,周一起占用 30 + 0 偏移,后续补 7 月
    const julyTail = cells.filter((c) => c.month === 6 && c.year === 2026);
    expect(julyTail.length).toBeGreaterThan(0);
    expect(julyTail.every((c) => c.inCurrentMonth === false)).toBe(true);
  });

  it('闰年 2 月:2024-02 含 29 天且 inCurrentMonth 标对', () => {
    const cells = buildMonthMatrix(2024, 1, 1, d(2024, 2, 15)); // 2 月,周一起
    const inMonth = cells.filter((c) => c.inCurrentMonth);
    expect(inMonth).toHaveLength(29); // 闰年 29 天
    expect(inMonth.at(-1)?.iso).toBe('2024-02-29'); // 最后一天是 29 日
    // 平年对照:2025-02 只有 28 天
    const cells25 = buildMonthMatrix(2025, 1, 1, d(2025, 2, 15));
    expect(cells25.filter((c) => c.inCurrentMonth)).toHaveLength(28);
  });

  it('12 月 → 次年 1 月跨年补位', () => {
    // 2026-12,周一起:末尾补位应落入 2027 年 1 月
    const cells = buildMonthMatrix(2026, 11, 1, d(2026, 12, 15));
    const dec = cells.filter((c) => c.inCurrentMonth);
    expect(dec.at(-1)?.iso).toBe('2026-12-31');
    const nextYearTail = cells.filter((c) => c.year === 2027);
    expect(nextYearTail.length).toBeGreaterThan(0);
    expect(nextYearTail[0]?.iso).toBe('2027-01-01'); // 跨年首格
    // 1 月视图反向:首格补位落入上年 12 月
    const jan = buildMonthMatrix(2027, 0, 1, d(2027, 1, 15));
    expect(jan.some((c) => c.year === 2026 && c.month === 11)).toBe(true);
  });

  it('isToday 由 referenceDate 注入(不依赖真实 today)', () => {
    const cells = buildMonthMatrix(2026, 5, 1, d(2026, 6, 26));
    expect(cells.find((c) => c.iso === '2026-06-26')?.isToday).toBe(true);
    expect(cells.find((c) => c.iso === '2026-06-25')?.isToday).toBe(false);
    // 同样的月份,换 referenceDate,isToday 跟着变
    const other = buildMonthMatrix(2026, 5, 1, d(2026, 6, 10));
    expect(other.find((c) => c.iso === '2026-06-26')?.isToday).toBe(false);
    expect(other.find((c) => c.iso === '2026-06-10')?.isToday).toBe(true);
  });
});

describe('键盘焦点移动 stepFocus / moveFocus', () => {
  const ws: WeekStart = 1;

  it('stepFocus 各方向', () => {
    const f = d(2026, 6, 15); // 周一
    expect(toISO(stepFocus(f, 'prevDay', ws))).toBe('2026-06-14');
    expect(toISO(stepFocus(f, 'nextDay', ws))).toBe('2026-06-16');
    expect(toISO(stepFocus(f, 'prevWeek', ws))).toBe('2026-06-08');
    expect(toISO(stepFocus(f, 'nextWeek', ws))).toBe('2026-06-22');
    expect(toISO(stepFocus(f, 'prevMonth', ws))).toBe('2026-05-15');
    expect(toISO(stepFocus(f, 'nextMonth', ws))).toBe('2026-07-15');
    expect(toISO(stepFocus(f, 'prevYear', ws))).toBe('2025-06-15');
    expect(toISO(stepFocus(f, 'nextYear', ws))).toBe('2027-06-15');
  });

  it('stepFocus weekStart / weekEnd 受 weekStart 影响', () => {
    const f = d(2026, 6, 17); // 周三
    // 周一起:本周首 = 周一 6/15,本周末 = 周日 6/21
    expect(toISO(stepFocus(f, 'weekStart', 1))).toBe('2026-06-15');
    expect(toISO(stepFocus(f, 'weekEnd', 1))).toBe('2026-06-21');
    // 周日起:本周首 = 周日 6/14,本周末 = 周六 6/20
    expect(toISO(stepFocus(f, 'weekStart', 0))).toBe('2026-06-14');
    expect(toISO(stepFocus(f, 'weekEnd', 0))).toBe('2026-06-20');
  });

  it('moveFocus 跨月边界标记翻页', () => {
    // 焦点在 6/30,nextDay → 7/1,跨出展示月(2026-06)
    const r = moveFocus(d(2026, 6, 30), 'nextDay', ws, 2026, 5, {});
    expect(r?.shouldPaginate).toBe(true);
    expect(toISO(present(r).date)).toBe('2026-07-01');
    // 月内移动不翻页
    const r2 = moveFocus(d(2026, 6, 15), 'nextDay', ws, 2026, 5, {});
    expect(r2?.shouldPaginate).toBe(false);
  });

  it('moveFocus 跳过禁用日(沿方向找最近可选)', () => {
    const bounds = { disabledDate: (x: Date) => x.getDate() === 16 || x.getDate() === 17 };
    // 从 15 向后:16、17 禁用 → 落到 18
    const r = moveFocus(d(2026, 6, 15), 'nextDay', ws, 2026, 5, bounds);
    expect(toISO(present(r).date)).toBe('2026-06-18');
  });

  it('moveFocus 越界夹回原地(目标可选则停在边界)', () => {
    // max=6/30,焦点 6/30,nextDay → 7/1 夹回 6/30(可选)→ 停在原地、不翻页
    const r = moveFocus(d(2026, 6, 30), 'nextDay', ws, 2026, 5, { max: d(2026, 6, 30) });
    expect(toISO(present(r).date)).toBe('2026-06-30');
    expect(r?.shouldPaginate).toBe(false);
  });

  it('moveFocus 触界且边界日被禁用时放弃移动(返回 null)', () => {
    // max=6/30 且 6/30 本身被 disabledDate 禁:nextDay 夹到 6/30 为禁用,沿方向无可选 → null
    const r = moveFocus(d(2026, 6, 29), 'nextDay', ws, 2026, 5, {
      max: d(2026, 6, 30),
      disabledDate: (x) => x.getDate() === 30,
    });
    expect(r).toBeNull();
  });

  it('moveFocus 把目标夹回 [min,max]', () => {
    // 焦点 6/15 向前一年到 2025-06-15,但 min=2026-06-01 → 夹回 2026-06-01
    const r = moveFocus(d(2026, 6, 15), 'prevYear', ws, 2026, 5, { min: d(2026, 6, 1) });
    expect(toISO(present(r).date)).toBe('2026-06-01');
    expect(r?.shouldPaginate).toBe(false); // 夹回当前月,不翻页
  });
});

describe('clampFocusIntoMonth —— 翻页后把焦点夹进可见月(#1 roving 不丢)', () => {
  it('focused 落在展示月之外:折算到该月的等价日(保留几号)', () => {
    // focused=6/26,展示月翻到 2026-07 → 落到 7/26
    expect(toISO(clampFocusIntoMonth(d(2026, 6, 26), 2026, 6, {}))).toBe('2026-07-26');
    // 翻到 2026-08 → 8/26
    expect(toISO(clampFocusIntoMonth(d(2026, 6, 26), 2026, 7, {}))).toBe('2026-08-26');
  });

  it('focused 已在展示月内:原样返回(无 min/max 干扰)', () => {
    expect(toISO(clampFocusIntoMonth(d(2026, 6, 15), 2026, 5, {}))).toBe('2026-06-15');
  });

  it('目标月没有这一天:夹到月末(31 号 → 短月最后一天)', () => {
    // focused=1/31,翻到 2026-02(28 天)→ 2/28
    expect(toISO(clampFocusIntoMonth(d(2026, 1, 31), 2026, 1, {}))).toBe('2026-02-28');
    // 闰年 2 月 → 2/29
    expect(toISO(clampFocusIntoMonth(d(2024, 1, 31), 2024, 1, {}))).toBe('2024-02-29');
  });

  it('等价日被 disabledDate 禁:本月内就近向后找可选日', () => {
    // 26 号禁用 → 夹进 7 月后落 7/26 被禁,向后找到 7/27
    const r = clampFocusIntoMonth(d(2026, 6, 26), 2026, 6, {
      disabledDate: (x) => x.getDate() === 26,
    });
    expect(toISO(r)).toBe('2026-07-27');
  });

  it('等价日在 min 之前:拉回月内并跳到首个可选日', () => {
    // 翻到 2026-07,但 focused=7/3 且 min=7/10 → 夹到 7/10
    const r = clampFocusIntoMonth(d(2026, 7, 3), 2026, 6, { min: d(2026, 7, 10) });
    expect(toISO(r)).toBe('2026-07-10');
  });

  it('min/max 把日期推出展示月:拉回月内最近端点', () => {
    // 展示 2026-07,focused=7/26,但 max=2026-06-30(整月都超上限)→ clampDate 推到 6/30(月外),
    // 再拉回展示月最近端点 7/1,保证网格内仍有一格 focusable(虽 disabled)。
    const r = clampFocusIntoMonth(d(2026, 7, 26), 2026, 6, { max: d(2026, 6, 30) });
    expect(r.getFullYear()).toBe(2026);
    expect(r.getMonth()).toBe(6); // 仍落在展示月 7 月内,保证有 focusable 格
    expect(toISO(r)).toBe('2026-07-01');
  });
});

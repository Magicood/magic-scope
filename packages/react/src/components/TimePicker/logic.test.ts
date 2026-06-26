import { describe, expect, it } from 'vitest';
import {
  buildHourOptions,
  buildOptions,
  clampNumber,
  clampTime,
  findEnabledOptionIndex,
  format12Hour,
  formatTime,
  hourOptions24From12h,
  nearestAllowed,
  normalizeValue,
  nowParts,
  pad2,
  parseTime,
  to12Hour,
  to24Hour,
  toDisabledSet,
} from './logic';

describe('TimePicker/logic pad2 & clampNumber', () => {
  it('pad2 补零到两位', () => {
    expect(pad2(0)).toBe('00');
    expect(pad2(9)).toBe('09');
    expect(pad2(23)).toBe('23');
  });

  it('clampNumber 夹住边界并把 NaN 归到 min', () => {
    expect(clampNumber(5, 0, 10)).toBe(5);
    expect(clampNumber(-3, 0, 10)).toBe(0);
    expect(clampNumber(99, 0, 10)).toBe(10);
    expect(clampNumber(Number.NaN, 2, 10)).toBe(2);
  });
});

describe('TimePicker/logic parseTime', () => {
  it('解析 HH:mm:ss', () => {
    expect(parseTime('09:30:15')).toEqual({ h: 9, m: 30, s: 15 });
  });

  it('解析 HH:mm 时秒补 0,并容忍单位数与空白', () => {
    expect(parseTime('  9:5 ')).toEqual({ h: 9, m: 5, s: 0 });
    expect(parseTime('23:59')).toEqual({ h: 23, m: 59, s: 0 });
  });

  it('越界 / 非法 / 空 返回 null', () => {
    expect(parseTime('24:00:00')).toBeNull();
    expect(parseTime('10:60')).toBeNull();
    expect(parseTime('abc')).toBeNull();
    expect(parseTime('')).toBeNull();
    expect(parseTime(null)).toBeNull();
    expect(parseTime(undefined)).toBeNull();
  });
});

describe('TimePicker/logic formatTime & normalizeValue', () => {
  it('formatTime 带/不带秒', () => {
    expect(formatTime({ h: 9, m: 5, s: 3 })).toBe('09:05:03');
    expect(formatTime({ h: 9, m: 5, s: 3 }, false)).toBe('09:05');
  });

  it('normalizeValue 接受 Date 与字符串,空与非法返回 null', () => {
    const d = new Date(2020, 0, 1, 8, 9, 10);
    expect(normalizeValue(d)).toEqual({ h: 8, m: 9, s: 10 });
    expect(normalizeValue('07:08:09')).toEqual({ h: 7, m: 8, s: 9 });
    expect(normalizeValue(null)).toBeNull();
    expect(normalizeValue('nope')).toBeNull();
    expect(normalizeValue(new Date('invalid'))).toBeNull();
  });
});

describe('TimePicker/logic 12 小时制互转', () => {
  it('to12Hour 处理 0 / 12 / 边界', () => {
    expect(to12Hour(0)).toEqual({ hour12: 12, meridiem: 'AM' });
    expect(to12Hour(11)).toEqual({ hour12: 11, meridiem: 'AM' });
    expect(to12Hour(12)).toEqual({ hour12: 12, meridiem: 'PM' });
    expect(to12Hour(13)).toEqual({ hour12: 1, meridiem: 'PM' });
    expect(to12Hour(23)).toEqual({ hour12: 11, meridiem: 'PM' });
  });

  it('to24Hour 是 to12Hour 的逆', () => {
    expect(to24Hour(12, 'AM')).toBe(0);
    expect(to24Hour(12, 'PM')).toBe(12);
    expect(to24Hour(1, 'PM')).toBe(13);
    expect(to24Hour(11, 'PM')).toBe(23);
    for (let h = 0; h < 24; h++) {
      const { hour12, meridiem } = to12Hour(h);
      expect(to24Hour(hour12, meridiem)).toBe(h);
    }
  });

  it('format12Hour 输出含 AM/PM', () => {
    expect(format12Hour({ h: 0, m: 0, s: 0 })).toBe('12:00:00 AM');
    expect(format12Hour({ h: 13, m: 5, s: 9 }, false)).toBe('01:05 PM');
  });
});

describe('TimePicker/logic 选项生成', () => {
  it('buildOptions 按 step 生成含 0 含末值', () => {
    expect(buildOptions(23, 1)).toHaveLength(24);
    expect(buildOptions(59, 15)).toEqual([0, 15, 30, 45]);
    // step ≤ 0 视为 1
    expect(buildOptions(3, 0)).toEqual([0, 1, 2, 3]);
  });

  it('buildHourOptions 区分 12/24 制', () => {
    expect(buildHourOptions(false, 1)).toEqual(buildOptions(23, 1));
    expect(buildHourOptions(true, 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(buildHourOptions(false, 6)).toEqual([0, 6, 12, 18]);
  });
});

describe('TimePicker/logic hourOptions24From12h', () => {
  it('把 12 制显示列反推回 24h 候选,且任一候选的 hour12 都落在显示列里', () => {
    const col12 = buildHourOptions(true, 2); // [1,3,5,7,9,11]
    const h24 = hourOptions24From12h(col12);
    expect(h24).toEqual([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]);
    // 关键不变式:clamp 出来的任一 24h 小时,其 hour12 一定能在显示列命中(有高亮)。
    for (const h of h24) {
      expect(col12).toContain(to12Hour(h).hour12);
    }
  });

  it('clampTime 用该 24h 网格,结果 hour12 必在 12 制显示列(step>1 也不丢高亮)', () => {
    const col12 = buildHourOptions(true, 2);
    const out = clampTime(
      { h: 9, m: 0, s: 0 },
      {
        hourOptions: hourOptions24From12h(col12),
        minuteOptions: buildOptions(59, 1),
        secondOptions: buildOptions(59, 1),
      },
    );
    expect(col12).toContain(to12Hour(out.h).hour12);
  });
});

describe('TimePicker/logic nearestAllowed & clampTime', () => {
  const minutes = buildOptions(59, 1);

  it('nearestAllowed 精确命中', () => {
    expect(nearestAllowed(30, minutes, undefined)).toBe(30);
  });

  it('nearestAllowed 避开禁用就近找,同差取较小', () => {
    const disabled = toDisabledSet([30]);
    // 30 禁用 → 29 与 31 同差,取较小 29
    expect(nearestAllowed(30, minutes, disabled)).toBe(29);
  });

  it('nearestAllowed 对齐 step 列', () => {
    const quarter = buildOptions(59, 15); // 0,15,30,45
    expect(nearestAllowed(20, quarter, undefined)).toBe(15);
    // 22 距 15 为 7、距 30 为 8 → 取 15
    expect(nearestAllowed(22, quarter, undefined)).toBe(15);
    // 23 距 15 为 8、距 30 为 7 → 取 30
    expect(nearestAllowed(23, quarter, undefined)).toBe(30);
  });

  it('nearestAllowed 全禁用返回 null', () => {
    expect(nearestAllowed(10, [10], toDisabledSet([10]))).toBeNull();
  });

  it('clampTime 把任意时间对齐到 step 列并避开禁用', () => {
    const out = clampTime(
      { h: 9, m: 22, s: 7 },
      {
        hourOptions: buildOptions(23, 1),
        minuteOptions: buildOptions(59, 15),
        secondOptions: buildOptions(59, 30),
      },
    );
    expect(out).toEqual({ h: 9, m: 15, s: 0 });
  });
});

describe('TimePicker/logic findEnabledOptionIndex', () => {
  const values = buildOptions(5, 1); // 0..5

  it('正向找下一个可用', () => {
    expect(findEnabledOptionIndex(values, undefined, 0, 1)).toBe(0);
    expect(findEnabledOptionIndex(values, toDisabledSet([0, 1]), 0, 1)).toBe(2);
  });

  it('环形回绕', () => {
    expect(findEnabledOptionIndex(values, undefined, 6, 1)).toBe(0);
    expect(findEnabledOptionIndex(values, undefined, -1, -1)).toBe(5);
  });

  it('全禁用返回 -1', () => {
    expect(findEnabledOptionIndex(values, toDisabledSet([0, 1, 2, 3, 4, 5]), 0, 1)).toBe(-1);
  });
});

describe('TimePicker/logic nowParts', () => {
  it('从注入的 Date 取本地时分秒', () => {
    expect(nowParts(new Date(2020, 5, 1, 14, 22, 33))).toEqual({ h: 14, m: 22, s: 33 });
  });
});

/**
 * TimePicker 纯逻辑 —— 零 React 依赖,可平移进 core / vue。
 * 时间解析/格式化、按 step 生成时分秒选项、clamp 边界、12/24 小时制互转、禁用判定,
 * 全是纯函数;组件只负责把它们接进状态/DOM/键盘。
 */

/** 时间值的内部规范表示(0-23 时 / 0-59 分秒)。 */
export interface TimeParts {
  /** 小时,24 小时制 0-23。 */
  h: number;
  /** 分钟 0-59。 */
  m: number;
  /** 秒 0-59。 */
  s: number;
}

/** 12 小时制的子午线(上午 / 下午)。 */
export type Meridiem = 'AM' | 'PM';

/** 时间列的类别。 */
export type TimeUnit = 'hour' | 'minute' | 'second' | 'meridiem';

/** 把数字补零到两位(负数/越界由调用方保证已 clamp)。 */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** 把数值夹在 [min, max] 闭区间内。 */
export function clampNumber(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) {
    return min;
  }
  return n < min ? min : n > max ? max : n;
}

/**
 * 解析 "HH:mm:ss" / "HH:mm" 文本为 TimeParts;非法/空返回 null。
 * 容忍前后空白、单位数(如 "9:5")、缺省的秒(补 0);超界数值会被丢弃返回 null。
 */
export function parseTime(input: string | null | undefined): TimeParts | null {
  if (input == null) {
    return null;
  }
  const text = input.trim();
  if (text === '') {
    return null;
  }
  const match = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(text);
  if (!match) {
    return null;
  }
  // 正则已保证三段都是数字串(第三段可选);noUncheckedIndexedAccess 下用 ?? 兜底。
  const h = Number(match[1] ?? '');
  const m = Number(match[2] ?? '');
  const s = match[3] != null ? Number(match[3]) : 0;
  if (h > 23 || m > 59 || s > 59) {
    return null;
  }
  return { h, m, s };
}

/** 从 Date 取出 TimeParts(本地时区);非法 Date 返回 null。 */
export function partsFromDate(date: Date): TimeParts | null {
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return { h: date.getHours(), m: date.getMinutes(), s: date.getSeconds() };
}

/**
 * 规范化任意受控 value(Date / "HH:mm:ss" 字符串 / 空)为 TimeParts;无法解析返回 null。
 */
export function normalizeValue(value: Date | string | null | undefined): TimeParts | null {
  if (value == null) {
    return null;
  }
  if (value instanceof Date) {
    return partsFromDate(value);
  }
  return parseTime(value);
}

/**
 * 格式化 TimeParts 为 "HH:mm:ss" 或 "HH:mm"(由 withSeconds 决定);各段补零。
 * @param parts 时间分量。
 * @param withSeconds 是否输出秒段;默认 true。
 */
export function formatTime(parts: TimeParts, withSeconds = true): string {
  const base = `${pad2(parts.h)}:${pad2(parts.m)}`;
  return withSeconds ? `${base}:${pad2(parts.s)}` : base;
}

/**
 * 按 12 小时制格式化(含 AM/PM),如 "09:30 AM" / "12:00 PM"。
 * @param parts 24 小时制时间分量。
 * @param withSeconds 是否输出秒段;默认 true。
 */
export function format12Hour(parts: TimeParts, withSeconds = true): string {
  const { hour12, meridiem } = to12Hour(parts.h);
  const body = withSeconds
    ? `${pad2(hour12)}:${pad2(parts.m)}:${pad2(parts.s)}`
    : `${pad2(hour12)}:${pad2(parts.m)}`;
  return `${body} ${meridiem}`;
}

/** 把 24 小时制的小时(0-23)拆成 12 小时制的 {1-12, AM/PM}。 */
export function to12Hour(hour24: number): { hour12: number; meridiem: Meridiem } {
  const meridiem: Meridiem = hour24 < 12 ? 'AM' : 'PM';
  const mod = hour24 % 12;
  const hour12 = mod === 0 ? 12 : mod;
  return { hour12, meridiem };
}

/** 把 12 小时制的 {1-12, AM/PM} 合回 24 小时制小时(0-23)。 */
export function to24Hour(hour12: number, meridiem: Meridiem): number {
  const base = hour12 % 12; // 12 → 0
  return meridiem === 'PM' ? base + 12 : base;
}

/**
 * 生成一列候选数值 [0, max] 按 step 间隔(含 0,含能整除到的末值)。
 * step ≤ 0 视为 1。用于时(max 23)/分秒(max 59)列。
 */
export function buildOptions(max: number, step: number): number[] {
  const s = step > 0 ? Math.floor(step) : 1;
  const out: number[] = [];
  for (let i = 0; i <= max; i += s) {
    out.push(i);
  }
  return out;
}

/** 生成小时列:12 小时制为 1-12(按 step,但 12 制 step 固定 1 更直观),24 制为 0-23 按 hourStep。 */
export function buildHourOptions(use12Hours: boolean, hourStep: number): number[] {
  if (use12Hours) {
    // 12 小时制:1..12(语义上 12 在最前还是最后随设计;此处 12,1,2..11 更贴近钟面,
    // 但为简单与可预测,采用 1..12 升序)。step 仍生效(对 1..12 取间隔)。
    const s = hourStep > 0 ? Math.floor(hourStep) : 1;
    const out: number[] = [];
    for (let i = 1; i <= 12; i += s) {
      out.push(i);
    }
    return out;
  }
  return buildOptions(23, hourStep);
}

/**
 * 把 12 小时制的显示列(1-12 的若干值)展开为它能表示的全部 24 小时制小时(升序去重)。
 * 用于让 12 制下的 clamp / 「此刻」基准与显示列同源:只要某 24h 小时的 hour12 落在显示列里,
 * 它就是合法候选,从而保证 to12Hour(h).hour12 一定能在显示列命中、有高亮。
 */
export function hourOptions24From12h(hourValues12: readonly number[]): number[] {
  const out = new Set<number>();
  for (const h12 of hourValues12) {
    out.add(to24Hour(h12, 'AM'));
    out.add(to24Hour(h12, 'PM'));
  }
  return Array.from(out).sort((a, b) => a - b);
}

/**
 * 把一组 disabled 数字规整为查找集合;入参可为数组或返回数组的函数(此处只处理数组,函数在组件层调用后传入)。
 */
export function toDisabledSet(list: readonly number[] | undefined): ReadonlySet<number> {
  return new Set(list ?? []);
}

/**
 * 判定某单位的某个值是否禁用。
 * @param unit 列类别。
 * @param val 候选值(hour 列在 12 制下传 24 制小时以便与 disabledHours 对齐)。
 * @param disabled 各单位禁用集合。
 */
export function isUnitDisabled(
  unit: TimeUnit,
  val: number,
  disabled: {
    hours?: ReadonlySet<number> | undefined;
    minutes?: ReadonlySet<number> | undefined;
    seconds?: ReadonlySet<number> | undefined;
  },
): boolean {
  switch (unit) {
    case 'hour':
      return disabled.hours?.has(val) ?? false;
    case 'minute':
      return disabled.minutes?.has(val) ?? false;
    case 'second':
      return disabled.seconds?.has(val) ?? false;
    default:
      return false;
  }
}

/**
 * 把任意 TimeParts 夹进合法范围,并对齐到各列 step、避开禁用值(就近向上找,找不到再向下)。
 * 用于 value / 「此刻」落到不在选项里的情况,保证高亮项总存在。
 */
export function clampTime(
  parts: TimeParts,
  opts: {
    hourOptions: readonly number[];
    minuteOptions: readonly number[];
    secondOptions: readonly number[];
    disabled?: {
      hours?: ReadonlySet<number> | undefined;
      minutes?: ReadonlySet<number> | undefined;
      seconds?: ReadonlySet<number> | undefined;
    };
  },
): TimeParts {
  const h = nearestAllowed(parts.h, opts.hourOptions, opts.disabled?.hours);
  const m = nearestAllowed(parts.m, opts.minuteOptions, opts.disabled?.minutes);
  const s = nearestAllowed(parts.s, opts.secondOptions, opts.disabled?.seconds);
  return {
    h: h ?? parts.h,
    m: m ?? parts.m,
    s: s ?? parts.s,
  };
}

/**
 * 在候选列里找与 target 最接近且未禁用的值;全禁用/空列返回 null。
 * 优先精确命中,否则按 |diff| 升序、同差取较小者。
 */
export function nearestAllowed(
  target: number,
  options: readonly number[],
  disabled: ReadonlySet<number> | undefined,
): number | null {
  let best: number | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const opt of options) {
    if (disabled?.has(opt)) {
      continue;
    }
    const diff = Math.abs(opt - target);
    if (diff < bestDiff || (diff === bestDiff && best !== null && opt < best)) {
      best = opt;
      bestDiff = diff;
    }
  }
  return best;
}

/** 取「此刻」的 TimeParts(本地时区);可注入 now 便于测试。 */
export function nowParts(now: Date = new Date()): TimeParts {
  return { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() };
}

/**
 * 在一列可见选项里,从 start 起按 dir(+1/-1)找下一个未禁用项的索引;环形,全禁用/空返回 -1。
 * 键盘 ↑↓ 在单列内导航用。
 */
export function findEnabledOptionIndex(
  values: readonly number[],
  disabled: ReadonlySet<number> | undefined,
  start: number,
  dir: 1 | -1,
): number {
  const n = values.length;
  if (n === 0) {
    return -1;
  }
  let i = start;
  for (let step = 0; step < n; step++) {
    if (i < 0) {
      i = n - 1;
    } else if (i >= n) {
      i = 0;
    }
    const v = values[i];
    if (v !== undefined && !disabled?.has(v)) {
      return i;
    }
    i += dir;
  }
  return -1;
}

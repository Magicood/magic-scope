/**
 * Statistic 纯逻辑 —— 零 React 依赖,可平移进 core。
 * 数值格式化(精度处理 + 千分位插入 + 拆整数/小数/符号三段)是纯函数;
 * 组件只负责把结果接进 DOM 与无障碍名,动画驱动另在组件层。
 */

/** 把一个数值按 precision 四舍五入并定位小数位;非有限数(NaN/Infinity)返回空串以便降级展示。 */
export function roundToPrecision(value: number, precision: number | undefined): string {
  if (!Number.isFinite(value)) {
    return '';
  }
  if (precision === undefined) {
    // 不指定精度:保留数字本身的字符串形态,但要避开 String(1e21) === '1e+21' 这类科学计数法泄漏。
    // toLocaleString(useGrouping:false) 给出定点串;极端情况仍带 'e' 时再兜底退回 toFixed 定点。
    const fixedPoint = value.toLocaleString('en-US', {
      useGrouping: false,
      maximumFractionDigits: 20,
    });
    if (/[eE]/.test(fixedPoint)) {
      // 兜底:用 toFixed 强制定点(20 位足够覆盖 double 可表示范围),再削掉尾部多余 0。
      return value.toFixed(20).replace(/\.?0+$/, '');
    }
    return fixedPoint;
  }
  const p = Math.max(0, Math.trunc(precision));
  // toFixed 在 (-1, 0) 区间会丢负号(如 -0.4.toFixed(0) === '0'),后续 sign 由原始 value 决定,这里只取数字面
  return Math.abs(value).toFixed(p);
}

/** 给「纯整数部分字符串」插入千分位分隔符。仅处理数字串(不含符号/小数点);空分隔符或空串原样返回。 */
export function groupThousands(intDigits: string, separator: string): string {
  if (separator === '' || intDigits.length <= 3) {
    return intDigits;
  }
  // 从右往左每 3 位插一个分隔符;用正则零宽断言避免手写指针
  return intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/** 格式化后的数值三段拆解,供组件分槽渲染(整数/小数分字号)与拼无障碍名。 */
export interface FormattedValue {
  /** 负号 '-' 或空串(数值为负时为 '-')。 */
  sign: string;
  /** 已插好千分位的整数部分(不含符号)。 */
  integer: string;
  /** 小数部分(不含小数点;无小数时为空串)。 */
  fraction: string;
  /** 小数点字符(有小数时为 '.',否则空串)。 */
  decimalPoint: string;
  /** 整段拼好的可读串(sign + integer + point + fraction),用于无障碍名与回退渲染。 */
  display: string;
  /** 是否数值型(false 表示传入的是非数字字符串,原样透传)。 */
  numeric: boolean;
}

/**
 * 把 value(number | string)格式化为可分槽渲染的三段结构。
 * - number:按 precision 处理小数、按 groupSeparator 插千分位、拆 sign/integer/fraction;
 * - string:若能解析成有限数则同上(便于传 "1234.5" 这类数字串);否则视为非数值,原样透传(numeric=false)。
 */
export function formatStatistic(
  value: number | string,
  options: {
    precision?: number | undefined;
    groupSeparator?: string | undefined;
  } = {},
): FormattedValue {
  const { precision, groupSeparator = ',' } = options;

  const asNumber = typeof value === 'number' ? value : parseNumeric(value);

  // 非数值:原样透传字符串(如 "N/A"、"——"),不插千分位、不拆段。
  // number 形态的 NaN / Infinity 也走这里(numeric=false),避免被吞成 "0"。
  if (asNumber === null || !Number.isFinite(asNumber)) {
    const raw = String(value);
    return {
      sign: '',
      integer: raw,
      fraction: '',
      decimalPoint: '',
      display: raw,
      numeric: false,
    };
  }

  const fixed = roundToPrecision(asNumber, precision);
  // fixed 已是 |value| 的字符串(precision 模式)或定点串(无 precision,可能带负号)
  const magnitude = fixed.startsWith('-') ? fixed.slice(1) : fixed;
  const dotIndex = magnitude.indexOf('.');
  const intDigits = dotIndex === -1 ? magnitude : magnitude.slice(0, dotIndex);
  const fraction = dotIndex === -1 ? '' : magnitude.slice(dotIndex + 1);

  // 符号:必须看四舍五入「之后」的数字面是否真为 0,避免 -0.4 precision=0 残留 "-0" 的虚假负号。
  const isZeroMagnitude = /^0*$/.test(intDigits) && /^0*$/.test(fraction);
  const sign = asNumber < 0 && !isZeroMagnitude ? '-' : '';

  // 千分位分隔符与小数点冲突消歧:存在小数位且分隔符恰为 '.' 时,
  // 千分位退回 ','(否则会得到歧义的 "1.234.5")。无小数位时 '.' 仍可作分隔符。
  const requestedSeparator = groupSeparator ?? ',';
  const effectiveSeparator =
    fraction !== '' && requestedSeparator === '.' ? ',' : requestedSeparator;

  const integer = groupThousands(intDigits === '' ? '0' : intDigits, effectiveSeparator);
  const decimalPoint = fraction === '' ? '' : '.';
  const display = `${sign}${integer}${decimalPoint}${fraction}`;

  return { sign, integer, fraction, decimalPoint, display, numeric: true };
}

/** 把字符串解析为有限数;解析失败或非有限返回 null。空串视为非数值。 */
export function parseNumeric(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

/** animateOnMount 的逐帧插值:给定起止与 [0,1] 进度,返回当前帧数值。 */
export function interpolate(from: number, to: number, progress: number): number {
  const t = progress <= 0 ? 0 : progress >= 1 ? 1 : progress;
  return from + (to - from) * t;
}

/** 缓出曲线(easeOutCubic),让滚动数字尾段自然减速。 */
export function easeOutCubic(t: number): number {
  const c = t <= 0 ? 0 : t >= 1 ? 1 : t;
  return 1 - (1 - c) ** 3;
}

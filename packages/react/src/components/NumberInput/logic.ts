/**
 * NumberInput 纯逻辑 —— 不依赖 React,便于将来平移到框架无关 core。
 * 解析 / 夹取 / 中间态判定 / 步进对齐都在这里,组件层只管渲染与事件 compose。
 */

/** 把数字渲染成显示文本;null/undefined → 空串。 */
export const toText = (n: number | null | undefined): string => (n == null ? '' : String(n));

/** 把文本解析成数字;空串与无法解析(中间态如 "-"、"1.")返回 null。 */
export const parseValue = (text: string): number | null => {
  if (text === '') return null;
  const n = Number(text);
  return Number.isNaN(n) ? null : n;
};

/** 是否「中间态」文本:非空、非可解析数字(如 "-"、"1."、"1e")。仅回显不应上报。 */
export const isIntermediate = (text: string): boolean => {
  if (text === '') return false;
  return Number.isNaN(Number(text));
};

/** 夹取到 [min, max]。 */
export const clampValue = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

/**
 * 步进对齐:在 base 基础上加 delta 并夹取。
 * 当 base 为 null(空/中间态)时,以 0 为基准起步(与原有语义一致)。
 */
export const stepValue = (base: number | null, delta: number, min: number, max: number): number => {
  const start = base != null && !Number.isNaN(base) ? base : 0;
  return clampValue(start + delta, min, max);
};

/** 修掉浮点累加误差(如 0.1 + 0.2),按 step 的小数位四舍五入。 */
export const fixPrecision = (n: number, step: number): number => {
  const stepStr = String(step);
  const dot = stepStr.indexOf('.');
  if (dot === -1) return n;
  const decimals = stepStr.length - dot - 1;
  return Number(n.toFixed(decimals));
};

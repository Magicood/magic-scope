/**
 * Slider 纯逻辑 —— 零 React 依赖,便于将来平移 `packages/core`(vue / web-component 共用同一套数值语义)。
 * 只做「数值夹取 / 步长对齐 / 百分比派生 / 刻度命中」,不碰任何渲染或状态。
 */

/** 一条刻度:落在轨道上的值 + 可选标签(标签缺省则只画 tick,不画文字)。 */
export interface SliderMark {
  /** 刻度对应的数值(应落在 [min, max] 内;越界会被夹取定位)。 */
  value: number;
  /** 刻度标签(ReactNode 由组件层承载,这里只声明数据契约用的最窄类型)。 */
  label?: unknown;
}

/** 把值夹取到 [min, max](容错 min>max 时返回 min)。 */
export function clampValue(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * 把值对齐到最近的步长格点(以 min 为基准网格),再夹取到 [min, max]。
 * step<=0 时不对齐,仅夹取。用于「点击刻度跳值 / 程序化设值」时与原生 range 的取整保持一致。
 */
export function snapToStep(value: number, min: number, max: number, step: number): number {
  if (!(step > 0)) return clampValue(value, min, max);
  const steps = Math.round((value - min) / step);
  const snapped = min + steps * step;
  // 浮点步长(如 0.1)累加误差:按 step 的小数位回正,避免 0.30000000000000004。
  const decimals = decimalPlaces(step);
  const fixed = decimals > 0 ? Number(snapped.toFixed(decimals)) : snapped;
  return clampValue(fixed, min, max);
}

/** 计算填充百分比(夹在 0–100),供 WebKit 轨道渐变与刻度定位用。max<=min 时返回 0。 */
export function valueToPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

/** 一条数值的小数位数(用于浮点步长回正)。整数 / 科学计数法回退 0。 */
export function decimalPlaces(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const s = String(n);
  const dot = s.indexOf('.');
  if (dot === -1 || s.includes('e') || s.includes('E')) return 0;
  return s.length - dot - 1;
}

/** 判定某刻度是否「已被填充覆盖」(value 越过它),用于命中高亮。含端点。 */
export function isMarkActive(markValue: number, current: number): boolean {
  return markValue <= current;
}

/**
 * Rate 纯逻辑 —— 零 React 依赖,可平移进 core。
 * 评分值的归一、步进、点击/指针落点判定、单颗星填充态判定都是纯函数;
 * 组件只负责把它们接进 React 状态 / DOM 事件。
 */

/** 单颗星相对当前评分值的填充态:满 / 半 / 空。 */
export type RateFillState = 'full' | 'half' | 'empty';

/** 步进单位:允许半星时 0.5,否则 1。 */
export function rateStep(allowHalf: boolean): number {
  return allowHalf ? 0.5 : 1;
}

/**
 * 把任意输入夹到合法评分区间并对齐步进。
 * - 夹到 [0, count];
 * - 按步进(0.5 / 1)就近取整,避免受控方传入越界或非整步进的脏值撑破渲染;
 * - NaN / undefined 归零。
 */
export function clampRate(value: number | undefined, count: number, allowHalf: boolean): number {
  if (value === undefined || Number.isNaN(value)) {
    return 0;
  }
  const step = rateStep(allowHalf);
  const clamped = Math.min(Math.max(value, 0), count);
  return Math.round(clamped / step) * step;
}

/**
 * 判定第 `index`(0 基)颗星在评分值 `value` 下的填充态。
 * 第 index 颗星覆盖的评分区间为 (index, index + 1]:
 * - value >= index + 1 → 满;
 * - allowHalf 且 value >= index + 0.5 → 半;
 * - 否则空。
 */
export function fillStateAt(index: number, value: number, allowHalf: boolean): RateFillState {
  const starValue = index + 1;
  if (value >= starValue) {
    return 'full';
  }
  if (allowHalf && value >= starValue - 0.5) {
    return 'half';
  }
  return 'empty';
}

/**
 * 根据点中第 `index`(0 基)颗星、以及指针是否落在该星左半区,算出本次点击对应的评分值。
 * - allowHalf 且落在左半 → index + 0.5(半星);
 * - 否则 → index + 1(整星)。
 */
export function valueFromPointer(index: number, isLeftHalf: boolean, allowHalf: boolean): number {
  return allowHalf && isLeftHalf ? index + 0.5 : index + 1;
}

/**
 * 计算键盘步进后的新值并夹到区间。
 * dir = +1(增)/ -1(减),步进随 allowHalf。环形不绕,触底/触顶即停。
 */
export function stepValue(value: number, dir: 1 | -1, count: number, allowHalf: boolean): number {
  const step = rateStep(allowHalf);
  return clampRate(value + dir * step, count, allowHalf);
}

/**
 * 点击落点的「清零」判定:allowClear 开启时,若点击算出的新值与当前值相等,则视为再次点击同一处 → 归零。
 * 返回最终应提交的值。
 */
export function resolveClickValue(current: number, next: number, allowClear: boolean): number {
  if (allowClear && next === current) {
    return 0;
  }
  return next;
}

/** 把 0 基星索引映射到 1 基序号(用于 tooltip / aria 文案)。纯小工具,语义化调用点。 */
export function starOrdinal(index: number): number {
  return index + 1;
}

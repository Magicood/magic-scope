/**
 * Steps 纯逻辑 —— 零 React 依赖,可平移进 core / vue / angular。
 *
 * 步态解析(每步相对 current 派生 wait/process/finish/error)、tone 映射、键盘导航语义都是纯函数;
 * 组件只负责把它们接进状态 / DOM / 事件。状态机集中在此,避免在 JSX 里散落条件分支。
 */

/** 单步状态:等待 / 进行中 / 已完成 / 出错。 */
export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

/** 步骤方向。 */
export type StepsDirection = 'horizontal' | 'vertical';

/** label 相对圆点的位置(horizontal 方向才有意义)。 */
export type StepsLabelPlacement = 'horizontal' | 'vertical';

/** tone 槽位色调(与全库 tone resolver 对齐)。 */
export type StepsTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** 步骤项的最小数据契约(逻辑层只关心这几个字段)。 */
export interface StepItemLike {
  /** 显式状态;省略则由 current 自动派生。 */
  status?: StepStatus | undefined;
  /** 是否禁用(不可点击跳步)。 */
  disabled?: boolean | undefined;
}

/**
 * 解析某一步相对 `current` 的状态:
 * - 该步显式声明 `status` 优先(允许逐步覆盖,如把第 2 步标 error);
 * - 否则:index < current → finish;index === current → currentStatus(当前步整体状态);index > current → wait。
 *
 * 这样既支持「线性向导自动派生」,又支持「单步显式覆盖」两种用法,与 AntD 语义一致。
 */
export function resolveStepStatus(
  item: StepItemLike,
  index: number,
  current: number,
  currentStatus: StepStatus,
): StepStatus {
  if (item.status) {
    return item.status;
  }
  if (index < current) {
    return 'finish';
  }
  if (index === current) {
    return currentStatus;
  }
  return 'wait';
}

/**
 * 解析「步与步之间连线(tail)」的状态:连接 index 与 index+1。
 * 线在 index 步已 finish 时才染色(代表流程已越过该步)。出错步之后的线保持未完成观感(用 wait)。
 */
export function resolveTailStatus(prevStatus: StepStatus): StepStatus {
  return prevStatus === 'finish' ? 'finish' : 'wait';
}

/** 状态 → tone:finish/process → primary 主色高亮,error → danger,wait → neutral 弱化。可被实例 tone 覆盖主色档。 */
export function statusToTone(status: StepStatus): StepsTone {
  switch (status) {
    case 'error':
      return 'danger';
    case 'finish':
    case 'process':
      return 'primary';
    default:
      return 'neutral';
  }
}

/** 该步是否可点击跳步:提供了 onChange、未禁用、且不是 disabled 项。 */
export function isStepClickable(item: StepItemLike, hasOnChange: boolean): boolean {
  return hasOnChange && !item.disabled;
}

/**
 * 从 `start`(含)起按 `dir`(+1/-1)找下一个可点击(未禁用)步的索引;不环形,越界返回 -1。
 * 供键盘 ←→/↑↓ 在可点击步之间移动焦点(跳过禁用步)。
 */
export function findClickableIndex<T extends StepItemLike>(
  items: readonly T[],
  start: number,
  dir: 1 | -1,
): number {
  for (let i = start; i >= 0 && i < items.length; i += dir) {
    if (!items[i]?.disabled) {
      return i;
    }
  }
  return -1;
}

/** 把百分比夹到 [0, 100],非有限值回退 undefined(不画进度环)。 */
export function clampPercent(percent: number | undefined): number | undefined {
  if (percent === undefined || !Number.isFinite(percent)) {
    return undefined;
  }
  return Math.max(0, Math.min(100, percent));
}

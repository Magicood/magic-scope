/**
 * Segmented 纯逻辑 —— 零 React 依赖,可平移进 core / vue / angular。
 * 选项归一、选中解析、键盘 step(跳过禁用、环形)都是纯函数;
 * 组件只把它们接进状态 / DOM / CSS 变量(indicator 偏移在组件层用 ref 量,不在此处)。
 */

import type { ReactNode } from 'react';

/** 选项的最小结构契约(逻辑层只关心这四个字段;label 在组件层可为 ReactNode)。 */
export interface SegmentedOptionLike {
  value: string;
  disabled?: boolean | undefined;
}

/** 对外的选项数据结构。label 支持 ReactNode(图标 + 文字混排)。 */
export interface SegmentedOption {
  /** 选项值(唯一)。 */
  value: string;
  /** 显示内容,支持任意 ReactNode。省略时回退用 value。 */
  label?: ReactNode;
  /** 选项前置图标。 */
  icon?: ReactNode;
  /** 是否禁用该段。 */
  disabled?: boolean | undefined;
}

/**
 * 把「简写值数组」或「对象数组」统一归一为 SegmentedOption[]。
 * 允许 options 传 ['a','b'] 这种纯值简写,降低样板。
 */
export function normalizeItems(
  options: ReadonlyArray<SegmentedOption | string | number>,
): SegmentedOption[] {
  return options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      const v = String(opt);
      return { value: v, label: v };
    }
    return opt;
  });
}

/** 在 items 里按 value 找索引;找不到返回 -1。`noUncheckedIndexedAccess` 安全。 */
export function indexOfValue<T extends SegmentedOptionLike>(
  items: readonly T[],
  value: string | undefined,
): number {
  if (value === undefined) {
    return -1;
  }
  return items.findIndex((o) => o.value === value);
}

/**
 * 从 `start`(含)起按 `dir`(+1/-1)找下一个可用(未禁用)项的索引。
 * 默认环形(wrap),便于 ArrowLeft/Right 循环;全禁用 / 空表返回 -1。
 */
export function findEnabledIndex<T extends SegmentedOptionLike>(
  items: readonly T[],
  start: number,
  dir: 1 | -1,
  wrap = true,
): number {
  const n = items.length;
  if (n === 0) {
    return -1;
  }
  let i = start;
  for (let step = 0; step < n; step++) {
    if (i < 0) {
      if (!wrap) {
        return -1;
      }
      i = n - 1;
    } else if (i >= n) {
      if (!wrap) {
        return -1;
      }
      i = 0;
    }
    if (!items[i]?.disabled) {
      return i;
    }
    i += dir;
  }
  return -1;
}

/** 选中态下,确定初始落焦的索引:有选中且可用则用选中,否则首个可用项。 */
export function resolveInitialIndex<T extends SegmentedOptionLike>(
  items: readonly T[],
  selectedValue: string | undefined,
): number {
  const selected = indexOfValue(items, selectedValue);
  if (selected >= 0 && !items[selected]?.disabled) {
    return selected;
  }
  return findEnabledIndex(items, 0, 1);
}

/** 键盘语义动作:由按键派生的导航意图(组件层据此移动 roving focus / 选中)。 */
export type SegmentedKeyAction =
  | { type: 'move'; dir: 1 | -1 }
  | { type: 'first' }
  | { type: 'last' }
  | { type: 'select' }
  | null;

/**
 * 把键盘事件 key 映射为导航动作(横向与纵向都支持:横向用 Left/Right,纵向用 Up/Down)。
 * orientation 决定哪一对方向键参与移动,避免与页面滚动 / 其它控件冲突。
 */
export function keyToAction(
  key: string,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
): SegmentedKeyAction {
  const prev = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
  const next = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
  switch (key) {
    case prev:
      return { type: 'move', dir: -1 };
    case next:
      return { type: 'move', dir: 1 };
    case 'Home':
      return { type: 'first' };
    case 'End':
      return { type: 'last' };
    case 'Enter':
    case ' ':
    case 'Spacebar':
      return { type: 'select' };
    default:
      return null;
  }
}

/**
 * 给定当前索引与一个键盘动作,算出键盘导航的目标索引(跳过禁用、环形)。
 * 返回 -1 表示无可用目标(全禁用)。`select` 动作不移动,返回 current。
 */
export function stepIndex<T extends SegmentedOptionLike>(
  items: readonly T[],
  current: number,
  action: Exclude<SegmentedKeyAction, null>,
): number {
  switch (action.type) {
    case 'move':
      return findEnabledIndex(items, current + action.dir, action.dir);
    case 'first':
      return findEnabledIndex(items, 0, 1);
    case 'last':
      return findEnabledIndex(items, items.length - 1, -1);
    case 'select':
      return current;
    default:
      return current;
  }
}

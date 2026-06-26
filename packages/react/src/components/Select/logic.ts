/**
 * Select 纯逻辑 —— 零 React 依赖,可平移进 core。
 * 选项遍历(跳过禁用)、查询过滤、键盘语义判定都是纯函数;组件只负责把它们接进状态/DOM。
 */

/** 选项的最小结构契约(逻辑层只关心这三个字段)。 */
export interface SelectOptionLike {
  value: string;
  label: string;
  disabled?: boolean | undefined;
}

/**
 * 从 `start`(含)起按 `dir`(+1/-1)找下一个可用(未禁用)项的索引;环形遍历,全禁用/空表返回 -1。
 * 与具体 React 状态无关,便于将来在 vue/core 复用同一导航语义。
 */
export function findEnabledIndex<T extends SelectOptionLike>(
  options: readonly T[],
  start: number,
  dir: 1 | -1,
): number {
  const n = options.length;
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
    if (!options[i]?.disabled) {
      return i;
    }
    i += dir;
  }
  return -1;
}

/** 默认过滤:大小写不敏感地匹配 label 或 value 包含查询串。query 为空时返回全部。 */
export function defaultFilter<T extends SelectOptionLike>(
  options: readonly T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (q === '') {
    return [...options];
  }
  return options.filter(
    (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
  );
}

/** 在 options 里按 value 找索引;找不到返回 -1。`noUncheckedIndexedAccess` 安全。 */
export function indexOfValue<T extends SelectOptionLike>(
  options: readonly T[],
  value: string | undefined,
): number {
  if (value === undefined) {
    return -1;
  }
  return options.findIndex((o) => o.value === value);
}

/** 关闭来源:区分用户从哪条路径关闭浮层,供 onClose 区分处理(如仅 select 才清搜索)。 */
export type SelectCloseReason = 'select' | 'escape' | 'outside' | 'tab' | 'trigger';

/** 把数组里的某个值切换进/出(多选用);返回新数组,不改原数组。 */
export function toggleValue(values: readonly string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

/** 规整受控/非受控可能传进来的 value 为字符串数组(多选)。 */
export function toValueArray(value: string | string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? [...value] : [value];
}

import { useState } from 'react';

/** 行 key 类型(与 Table.tsx 的 RowKey 等价,此处本地定义避免循环 import)。 */
type RowKey = string | number;

interface UseTableExpandOptions {
  /** 受控:已展开行 key 列表。传入即受控,组件不内置状态,仅回调。 */
  expandedKeys: RowKey[] | undefined;
  /** 非受控初始展开 key 列表。 */
  defaultExpandedKeys: RowKey[] | undefined;
  /** 展开变化回调,入参为新的 key 列表。 */
  onExpandedChange: ((keys: RowKey[]) => void) | undefined;
}

/**
 * 表格展开行逻辑:受控(传 expandedKeys)只回调、内置状态短路;非受控内置 Set 切换。
 * 纯逻辑(仅依赖 useState),便于将来平移 core。
 */
export function useTableExpand(options: UseTableExpandOptions) {
  const isControlled = options.expandedKeys !== undefined;
  const [internal, setInternal] = useState<RowKey[]>(options.defaultExpandedKeys ?? []);
  const expandedKeys = isControlled ? (options.expandedKeys ?? []) : internal;
  const expandedSet = new Set<RowKey>(expandedKeys);

  const setExpanded = (next: RowKey[]) => {
    if (!isControlled) setInternal(next);
    options.onExpandedChange?.(next);
  };

  const toggle = (key: RowKey) => {
    const next = new Set(expandedSet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpanded([...next]);
  };

  return { expandedSet, toggle };
}

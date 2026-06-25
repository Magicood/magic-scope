import { useMemo, useState } from 'react';
import type { SortState, TableColumn } from './Table';

interface UseTableSortOptions {
  /** 受控排序态(含 null = 无序);传入即受控,组件不内置重排,仅回调。 */
  sortState: SortState | null | undefined;
  /** 非受控初始排序态。 */
  defaultSortState: SortState | null | undefined;
  /** 排序变化回调。 */
  onSortChange: ((next: SortState | null) => void) | undefined;
}

function defaultSorter<T>(key: string) {
  return (a: T, b: T) => {
    const av = (a as Record<string, unknown>)[key];
    const bv = (b as Record<string, unknown>)[key];
    if (typeof av === 'number' && typeof bv === 'number') return av - bv;
    return String(av ?? '').localeCompare(String(bv ?? ''));
  };
}

/**
 * 表格排序逻辑:受控(传 sortState)只回调、内置算法短路;非受控内置 toSorted + 默认/自定义比较器。
 * 点击同列循环 asc → desc → null。
 */
export function useTableSort<T>(
  data: T[],
  columns: Array<TableColumn<T>>,
  options: UseTableSortOptions,
) {
  const isControlled = options.sortState !== undefined;
  const [internal, setInternal] = useState<SortState | null>(options.defaultSortState ?? null);
  const sort = isControlled ? (options.sortState ?? null) : internal;

  const setSort = (next: SortState | null) => {
    if (!isControlled) setInternal(next);
    options.onSortChange?.(next);
  };

  const toggle = (columnKey: string) => {
    let next: SortState | null;
    if (!sort || sort.columnKey !== columnKey) next = { columnKey, direction: 'asc' };
    else if (sort.direction === 'asc') next = { columnKey, direction: 'desc' };
    else next = null;
    setSort(next);
  };

  const sortedData = useMemo(() => {
    // 受控:外部已排好,组件不再重排
    if (isControlled || !sort) return data;
    const col = columns.find((c) => c.key === sort.columnKey);
    if (!col) return data;
    const cmp = col.sorter ?? defaultSorter<T>(col.key);
    const arr = [...data].sort(cmp);
    if (sort.direction === 'desc') arr.reverse();
    return arr;
  }, [data, columns, sort, isControlled]);

  return { sort, toggle, sortedData };
}

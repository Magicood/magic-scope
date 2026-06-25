import type { CSSProperties, ForwardedRef, ReactElement, ReactNode, Ref } from 'react';
import { forwardRef } from 'react';
import { Checkbox } from '../Checkbox/Checkbox';
import { Spinner } from '../Spinner/Spinner';
import { useTableSort } from './useTableSort';

export type SortDirection = 'asc' | 'desc';
export interface SortState {
  columnKey: string;
  direction: SortDirection;
}

/** 列定义。泛型 T 为行数据类型,默认 Record<string, ReactNode>(旧用法零改动)。 */
export interface TableColumn<T = Record<string, ReactNode>> {
  /** 字段键:默认取值 + React key + 排序键。render-only 虚拟列(如「操作」)可用任意唯一串。 */
  key: string;
  /** 表头内容。 */
  header: ReactNode;
  /** 列对齐:start(默认)/ center / end。 */
  align?: 'start' | 'end' | 'center';
  /** 自定义单元格渲染;缺省回退 row[key]。 */
  render?: (row: T, index: number) => ReactNode;
  /** 开启该列排序 UI(表头可点 + aria-sort)。 */
  sortable?: boolean;
  /** 自定义比较器;缺省按数值 / localeCompare。 */
  sorter?: (a: T, b: T) => number;
  /** 表头附加类名。 */
  headerClassName?: string;
  /** 单元格附加类名(可按行计算)。 */
  cellClassName?: string | ((row: T, index: number) => string);
}

/** 行选择(受控)。 */
export interface RowSelection<T = Record<string, ReactNode>> {
  /** 选择类型。默认 checkbox。radio 为单选。 */
  type?: 'checkbox' | 'radio';
  /** 受控:已选行 key 列表。 */
  selectedKeys: Array<string | number>;
  /** 选择变化回调,入参为新 key 列表与当前数据中对应的行。 */
  onChange: (keys: Array<string | number>, rows: T[]) => void;
  /** 定制某行选择框(禁用 / aria-label)。 */
  getCheckboxProps?: (row: T) => { disabled?: boolean; 'aria-label'?: string };
  /** 选择列宽。 */
  columnWidth?: number | string;
  /** 隐藏全选框(checkbox 类型)。 */
  hideSelectAll?: boolean;
}

export interface TableProps<T = Record<string, ReactNode>> {
  columns: Array<TableColumn<T>>;
  data: T[];
  /** 斑马纹。默认 false。 */
  stripe?: boolean;
  /** 行 hover 高亮。默认 false。 */
  hoverable?: boolean;
  /** 行 key 派生,默认行索引。 */
  getRowKey?: (row: T, index: number) => string | number;
  /** 无障碍标题。 */
  caption?: ReactNode;
  className?: string;
  /** —— 排序(受控:传 sortState 含 null;非受控:用 defaultSortState)。 */
  sortState?: SortState | null;
  defaultSortState?: SortState | null;
  onSortChange?: (next: SortState | null) => void;
  /** —— 行选择(受控)。 */
  rowSelection?: RowSelection<T>;
  /** —— 加载态:覆盖一层 Spinner 遮罩(aria-busy)。 */
  loading?: boolean;
  /** —— 空态内容,缺省「暂无数据」。 */
  empty?: ReactNode;
  /** —— 空数据 + loading 时渲染 N 行骨架,默认 0(仅遮罩)。 */
  skeletonRows?: number;
  /** —— 粘性表头:开启即限高可滚、表头吸顶。 */
  stickyHeader?: boolean;
  /** 配合 stickyHeader 的最大高度;缺省随动态视口。 */
  maxHeight?: number | string;
}

const toLen = (v: number | string | undefined) =>
  v == null ? undefined : typeof v === 'number' ? `${v}px` : v;

function TableImpl<T>(props: TableProps<T>, ref: ForwardedRef<HTMLTableElement>) {
  const {
    columns,
    data,
    stripe = false,
    hoverable = false,
    getRowKey,
    caption,
    className,
    sortState,
    defaultSortState,
    onSortChange,
    rowSelection,
    loading = false,
    empty,
    skeletonRows = 0,
    stickyHeader = false,
    maxHeight,
  } = props;

  // biome-ignore lint/correctness/useHookAtTopLevel: TableImpl 是 forwardRef 的渲染函数(即组件),此处调用 hook 合法
  const { sort, toggle, sortedData } = useTableSort<T>(data, columns, {
    sortState,
    defaultSortState,
    onSortChange,
  });

  const hasSelection = !!rowSelection;
  const selType = rowSelection?.type ?? 'checkbox';
  const selectedSet = new Set<string | number>(rowSelection?.selectedKeys ?? []);
  const rowKeyOf = (row: T, i: number) => (getRowKey ? getRowKey(row, i) : i);

  // 承重墙:列总数(选择列 + 用户列),所有 colSpan / 空态行都读它,杜绝漂移
  const totalColSpan = columns.length + (hasSelection ? 1 : 0);

  // 仅在启用选择时计算当前页 keys(避免无选择时多调 getRowKey)
  const currentKeys = hasSelection ? sortedData.map((r, i) => rowKeyOf(r, i)) : [];
  const allSelected = currentKeys.length > 0 && currentKeys.every((k) => selectedSet.has(k));
  const someSelected = currentKeys.some((k) => selectedSet.has(k));

  const toggleAll = (checked: boolean) => {
    if (checked) rowSelection?.onChange(currentKeys, sortedData);
    else rowSelection?.onChange([], []);
  };
  const toggleRow = (key: string | number, checked: boolean) => {
    if (!rowSelection) return;
    if (selType === 'radio') {
      const row = sortedData.find((r, i) => rowKeyOf(r, i) === key);
      rowSelection.onChange(checked && row ? [key] : [], checked && row ? [row] : []);
      return;
    }
    const next = new Set(selectedSet);
    if (checked) next.add(key);
    else next.delete(key);
    const rows = sortedData.filter((r, i) => next.has(rowKeyOf(r, i)));
    rowSelection.onChange([...next], rows);
  };

  const selWidth = toLen(rowSelection?.columnWidth);

  const wrapClassName = [
    'ms-table-wrap',
    stripe && 'ms-table-wrap--stripe',
    hoverable && 'ms-table-wrap--hoverable',
    stickyHeader && 'ms-table-wrap--sticky-head',
    loading && 'ms-table-wrap--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const wrapStyle =
    stickyHeader && maxHeight != null
      ? ({ '--ms-table-max-block-size': toLen(maxHeight) } as CSSProperties)
      : undefined;

  // —— tbody 内容:数据 / 空态 / 骨架 三选一 ——
  let body: ReactNode;
  if (sortedData.length === 0) {
    if (loading && skeletonRows > 0) {
      body = Array.from({ length: skeletonRows }, (_, r) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 骨架行无身份,index 即可
        <tr key={`sk-${r}`} className="ms-table__row">
          {hasSelection && (
            <td className="ms-table__td ms-table__td--selection">
              <span className="ms-skeleton ms-skeleton--text" />
            </td>
          )}
          {columns.map((col) => (
            <td key={col.key} className="ms-table__td">
              <span className="ms-skeleton ms-skeleton--text" />
            </td>
          ))}
        </tr>
      ));
    } else if (!loading) {
      body = (
        <tr className="ms-table__row">
          <td className="ms-table__empty" colSpan={totalColSpan}>
            {empty ?? '暂无数据'}
          </td>
        </tr>
      );
    } else {
      body = null;
    }
  } else {
    body = sortedData.map((row, index) => {
      const key = rowKeyOf(row, index);
      const selected = selectedSet.has(key);
      return (
        <tr
          key={key}
          className={['ms-table__row', 'ms-table__row--data', selected && 'ms-table__row--selected']
            .filter(Boolean)
            .join(' ')}
          data-ms-selected={selected || undefined}
        >
          {hasSelection &&
            (() => {
              const cbProps = rowSelection?.getCheckboxProps?.(row) ?? {};
              return (
                <td className="ms-table__td ms-table__td--selection">
                  <Checkbox
                    aria-label={cbProps['aria-label'] ?? `选择第 ${index + 1} 行`}
                    checked={selected}
                    disabled={cbProps.disabled}
                    onChange={(e) => toggleRow(key, e.target.checked)}
                  />
                </td>
              );
            })()}
          {columns.map((col) => {
            const content = col.render
              ? col.render(row, index)
              : (row as Record<string, ReactNode>)[col.key];
            const extra =
              typeof col.cellClassName === 'function'
                ? col.cellClassName(row, index)
                : col.cellClassName;
            return (
              <td
                key={col.key}
                className={[
                  'ms-table__td',
                  col.align && col.align !== 'start' && `ms-table__td--${col.align}`,
                  extra,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {content}
              </td>
            );
          })}
        </tr>
      );
    });
  }

  return (
    <div className={wrapClassName} style={wrapStyle} aria-busy={loading || undefined}>
      <table ref={ref} className="ms-table">
        {caption ? <caption className="ms-table__caption">{caption}</caption> : null}
        <thead className="ms-table__head">
          <tr className="ms-table__row">
            {hasSelection && (
              <th
                scope="col"
                className="ms-table__th ms-table__th--selection"
                style={selWidth ? { inlineSize: selWidth } : undefined}
              >
                {selType === 'checkbox' && !rowSelection?.hideSelectAll ? (
                  <Checkbox
                    aria-label="全选"
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                ) : (
                  <span className="ms-sr-only">选择</span>
                )}
              </th>
            )}
            {columns.map((col) => {
              const active = sort?.columnKey === col.key;
              const ariaSort = col.sortable
                ? active
                  ? sort?.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
                : undefined;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={ariaSort}
                  className={[
                    'ms-table__th',
                    col.align && col.align !== 'start' && `ms-table__th--${col.align}`,
                    col.headerClassName,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="ms-table__sort-btn"
                      data-ms-sort={active ? sort?.direction : 'none'}
                      onClick={() => toggle(col.key)}
                    >
                      {col.header}
                      <span className="ms-table__sort-arrow" aria-hidden="true" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="ms-table__body">{body}</tbody>
      </table>
      {loading ? (
        <div className="ms-table__loading">
          <Spinner />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Table —— 数据表格。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 渲染语义化 <table>;支持排序(受控/非受控)、行选择(全选三态)、空态/加载态、粘性表头、
 * 列对齐 / 自定义渲染 / 斑马纹 / 行 hover。新能力默认关闭,旧 columns/data 用法零改动。
 * 样式见同目录 Table.css,需引入 @magic-scope/react/styles.css。
 */
export const Table = forwardRef(TableImpl) as (<T = Record<string, ReactNode>>(
  props: TableProps<T> & { ref?: Ref<HTMLTableElement> },
) => ReactElement) & { displayName?: string };
Table.displayName = 'Table';

import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ForwardedRef,
  ReactElement,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref,
} from 'react';
import { forwardRef } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { Checkbox } from '../Checkbox/Checkbox';
import { Spinner } from '../Spinner/Spinner';
import { useTableExpand } from './useTableExpand';
import { useTableSort } from './useTableSort';

export type SortDirection = 'asc' | 'desc';
export interface SortState {
  columnKey: string;
  direction: SortDirection;
}

/** 行 key 类型(选择 / 展开复用)。 */
export type RowKey = string | number;

/** 语义色调(经全库 tone resolver 派生配色)。 */
export type TableTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** 行高密度三档(在 token 密度之上叠加的组件级紧凑度)。默认 md。 */
export type TableSize = 'sm' | 'md' | 'lg';

/** 列固定方向(sticky 吸边)。 */
export type ColumnFixed = 'left' | 'right';

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
  /** 自定义汇总行单元格(传 summary 时生效)。 */
  renderSummary?: (rows: T[]) => ReactNode;
  /** 开启该列排序 UI(表头可点 + aria-sort)。 */
  sortable?: boolean;
  /** 自定义比较器;缺省按数值 / localeCompare。 */
  sorter?: (a: T, b: T) => number;
  /** 列固定:'left' 吸左 / 'right' 吸右(sticky)。需配合横向滚动。 */
  fixed?: ColumnFixed;
  /** 列宽(用于固定列偏移与基础宽度)。 */
  width?: number | string;
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
  selectedKeys: RowKey[];
  /** 选择变化回调,入参为新 key 列表与当前数据中对应的行。 */
  onChange: (keys: RowKey[], rows: T[]) => void;
  /** 单行勾选/取消时触发(细分回调):带本行、是否选中、变更后全量已选行。 */
  onSelect?: (row: T, selected: boolean, selectedRows: T[]) => void;
  /** 全选/取消全选时触发(细分回调):是否全选、变更后全量已选行、本次受影响的行。 */
  onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
  /** 定制某行选择框(禁用 / aria-label)。 */
  getCheckboxProps?: (row: T) => { disabled?: boolean; 'aria-label'?: string };
  /** 选择列宽。 */
  columnWidth?: number | string;
  /** 隐藏全选框(checkbox 类型)。 */
  hideSelectAll?: boolean;
}

/** 可展开行(受控/非受控)。 */
export interface Expandable<T = Record<string, ReactNode>> {
  /** 展开内容渲染器(返回展开区 ReactNode)。 */
  rowRender: (row: T, index: number) => ReactNode;
  /** 受控:已展开行 key 列表。 */
  expandedKeys?: RowKey[];
  /** 非受控初始展开 key 列表。 */
  defaultExpandedKeys?: RowKey[];
  /** 展开变化回调,入参为新的 key 列表。 */
  onExpandedChange?: (keys: RowKey[]) => void;
  /** 判断某行是否可展开(false 则不渲染展开按钮)。缺省全部可展开。 */
  rowExpandable?: (row: T) => boolean;
  /** 展开列宽。 */
  columnWidth?: number | string;
}

/** 行事件工厂返回值(Ant 式)。 */
export interface RowEventHandlers {
  onClick?: (e: ReactMouseEvent<HTMLTableRowElement>) => void;
  onDoubleClick?: (e: ReactMouseEvent<HTMLTableRowElement>) => void;
  onContextMenu?: (e: ReactMouseEvent<HTMLTableRowElement>) => void;
  onMouseEnter?: (e: ReactMouseEvent<HTMLTableRowElement>) => void;
  onMouseLeave?: (e: ReactMouseEvent<HTMLTableRowElement>) => void;
}

/** 关键子部件类名注入。 */
export interface TableClassNames {
  wrap?: string;
  table?: string;
  thead?: string;
  th?: string;
  tbody?: string;
  row?: string;
  td?: string;
  selectionCell?: string;
}

export interface TableProps<T = Record<string, ReactNode>>
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onSelect'> {
  columns: Array<TableColumn<T>>;
  data: T[];
  /** 语义色调(选中行/hover 强调条/排序箭头激活态读 tone 槽位)。默认 primary。 */
  tone?: TableTone;
  /** 行高密度三档(组件级,叠加在 token 密度上)。默认 md。 */
  size?: TableSize;
  /** 斑马纹。默认 false。 */
  stripe?: boolean;
  /** 行 hover 高亮。默认 false。 */
  hoverable?: boolean;
  /** 行 key 派生,默认行索引。 */
  getRowKey?: (row: T, index: number) => RowKey;
  /** 无障碍标题。 */
  caption?: ReactNode;
  className?: string;
  /** 关键子部件类名注入。 */
  classNames?: TableClassNames;
  /** 透传给内层 <table> 的属性(rest 默认落到外层 wrap)。 */
  tableProps?: ComponentPropsWithoutRef<'table'>;
  /** —— 排序(受控:传 sortState 含 null;非受控:用 defaultSortState)。 */
  sortState?: SortState | null;
  defaultSortState?: SortState | null;
  onSortChange?: (next: SortState | null) => void;
  /** —— 行选择(受控)。 */
  rowSelection?: RowSelection<T>;
  /** —— 可展开行(受控/非受控)。 */
  expandable?: Expandable<T>;
  /** —— 行级点击。 */
  onRowClick?: (row: T, index: number, e: ReactMouseEvent<HTMLTableRowElement>) => void;
  /** —— 行级双击(双击编辑场景)。 */
  onRowDoubleClick?: (row: T, index: number, e: ReactMouseEvent<HTMLTableRowElement>) => void;
  /** —— 行级右键(右键菜单场景)。 */
  onRowContextMenu?: (row: T, index: number, e: ReactMouseEvent<HTMLTableRowElement>) => void;
  /** —— Ant 式行事件工厂:返回该行的多个事件处理器。 */
  onRow?: (row: T, index: number) => RowEventHandlers;
  /** —— 加载态:覆盖一层 Spinner 遮罩(aria-busy)。 */
  loading?: boolean;
  /** —— 空态内容,缺省走 i18n table.empty。 */
  empty?: ReactNode;
  /** —— 空数据 + loading 时渲染 N 行骨架,默认 0(仅遮罩)。 */
  skeletonRows?: number;
  /** —— 汇总/页脚行:渲染在 tfoot,接 column.renderSummary。 */
  summary?: boolean;
  /** —— 自定义页脚内容(覆盖 summary 的列式渲染,整行自渲染)。 */
  footer?: ReactNode;
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
    tone = 'primary',
    size = 'md',
    stripe = false,
    hoverable = false,
    getRowKey,
    caption,
    className,
    classNames,
    tableProps,
    sortState,
    defaultSortState,
    onSortChange,
    rowSelection,
    expandable,
    onRowClick,
    onRowDoubleClick,
    onRowContextMenu,
    onRow,
    loading = false,
    empty,
    skeletonRows = 0,
    summary = false,
    footer,
    stickyHeader = false,
    maxHeight,
    ...rest
  } = props;

  // biome-ignore lint/correctness/useHookAtTopLevel: TableImpl 是 forwardRef 的渲染函数(即组件),此处调用 hook 合法
  const t = useMessages();

  // biome-ignore lint/correctness/useHookAtTopLevel: TableImpl 是 forwardRef 的渲染函数(即组件),此处调用 hook 合法
  const { sort, toggle, sortedData } = useTableSort<T>(data, columns, {
    sortState,
    defaultSortState,
    onSortChange,
  });

  const hasSelection = !!rowSelection;
  const hasExpand = !!expandable;
  const selType = rowSelection?.type ?? 'checkbox';
  const selectedSet = new Set<RowKey>(rowSelection?.selectedKeys ?? []);
  const rowKeyOf = (row: T, i: number): RowKey => (getRowKey ? getRowKey(row, i) : i);

  // biome-ignore lint/correctness/useHookAtTopLevel: 同上,forwardRef 渲染函数内调用 hook 合法
  const { expandedSet, toggle: toggleExpand } = useTableExpand({
    expandedKeys: expandable?.expandedKeys,
    defaultExpandedKeys: expandable?.defaultExpandedKeys,
    onExpandedChange: expandable?.onExpandedChange,
  });

  // 承重墙:列总数(展开列 + 选择列 + 用户列),所有 colSpan / 空态行都读它,杜绝漂移
  const totalColSpan = columns.length + (hasSelection ? 1 : 0) + (hasExpand ? 1 : 0);

  // 仅在启用选择时计算当前页 keys(避免无选择时多调 getRowKey)
  const currentKeys = hasSelection ? sortedData.map((r, i) => rowKeyOf(r, i)) : [];
  const allSelected = currentKeys.length > 0 && currentKeys.every((k) => selectedSet.has(k));
  const someSelected = currentKeys.some((k) => selectedSet.has(k));

  const toggleAll = (checked: boolean) => {
    if (!rowSelection) return;
    if (checked) {
      rowSelection.onChange(currentKeys, sortedData);
      rowSelection.onSelectAll?.(true, sortedData, sortedData);
    } else {
      rowSelection.onChange([], []);
      rowSelection.onSelectAll?.(false, [], sortedData);
    }
  };
  const toggleRow = (row: T, key: RowKey, checked: boolean) => {
    if (!rowSelection) return;
    if (selType === 'radio') {
      const found = checked ? row : undefined;
      rowSelection.onChange(checked ? [key] : [], found ? [found] : []);
      rowSelection.onSelect?.(row, checked, found ? [found] : []);
      return;
    }
    const next = new Set(selectedSet);
    if (checked) next.add(key);
    else next.delete(key);
    const rows = sortedData.filter((r, i) => next.has(rowKeyOf(r, i)));
    rowSelection.onChange([...next], rows);
    rowSelection.onSelect?.(row, checked, rows);
  };

  const selWidth = toLen(rowSelection?.columnWidth);
  const expandWidth = toLen(expandable?.columnWidth);

  const wrapClassName = [
    'ms-table-wrap',
    `ms-tone-${tone}`,
    `ms-table-wrap--${size}`,
    stripe && 'ms-table-wrap--stripe',
    hoverable && 'ms-table-wrap--hoverable',
    stickyHeader && 'ms-table-wrap--sticky-head',
    loading && 'ms-table-wrap--loading',
    classNames?.wrap,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const wrapStyle =
    stickyHeader && maxHeight != null
      ? ({ '--ms-table-max-block-size': toLen(maxHeight) } as CSSProperties)
      : (rest.style ?? undefined);

  const thClass = (extra?: string) =>
    ['ms-table__th', classNames?.th, extra].filter(Boolean).join(' ');
  const tdClass = (extra?: string) =>
    ['ms-table__td', classNames?.td, extra].filter(Boolean).join(' ');

  // —— tbody 内容:数据 / 空态 / 骨架 三选一 ——
  let body: ReactNode;
  if (sortedData.length === 0) {
    if (loading && skeletonRows > 0) {
      body = Array.from({ length: skeletonRows }, (_, r) => (
        <tr
          // biome-ignore lint/suspicious/noArrayIndexKey: 骨架行无身份,index 即可
          key={`sk-${r}`}
          className={['ms-table__row', classNames?.row].filter(Boolean).join(' ')}
        >
          {hasExpand && (
            <td className={tdClass('ms-table__td--expand')}>
              <span className="ms-skeleton ms-skeleton--text" />
            </td>
          )}
          {hasSelection && (
            <td className={tdClass(`ms-table__td--selection ${classNames?.selectionCell ?? ''}`)}>
              <span className="ms-skeleton ms-skeleton--text" />
            </td>
          )}
          {columns.map((col) => (
            <td key={col.key} className={tdClass()}>
              <span className="ms-skeleton ms-skeleton--text" />
            </td>
          ))}
        </tr>
      ));
    } else if (!loading) {
      body = (
        <tr className={['ms-table__row', classNames?.row].filter(Boolean).join(' ')}>
          <td className="ms-table__empty" colSpan={totalColSpan}>
            {empty ?? t('table.empty', undefined, '暂无数据')}
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
      const expanded = expandedSet.has(key);
      const canExpand = hasExpand && (expandable?.rowExpandable?.(row) ?? true);
      const rowEvents = onRow?.(row, index);

      // 行级事件:compose 用户工厂(onRow)的处理器,再叠加领域回调(onRowClick 等)
      const handleClick = composeEventHandlers(rowEvents?.onClick, (e) =>
        onRowClick?.(row, index, e),
      );
      const handleDoubleClick = composeEventHandlers(rowEvents?.onDoubleClick, (e) =>
        onRowDoubleClick?.(row, index, e),
      );
      const handleContextMenu = composeEventHandlers(rowEvents?.onContextMenu, (e) =>
        onRowContextMenu?.(row, index, e),
      );

      // stagger 进场:行序号供 CSS 计算延迟(装饰性,降级后归零)
      const rowStyle = { '--ms-table-row-index': index } as CSSProperties;

      const dataRow = (
        <tr
          key={key}
          className={[
            'ms-table__row',
            'ms-table__row--data',
            selected && 'ms-table__row--selected',
            expanded && 'ms-table__row--expanded',
            (onRowClick || onRow || hoverable) && 'ms-table__row--interactive',
            classNames?.row,
          ]
            .filter(Boolean)
            .join(' ')}
          style={rowStyle}
          data-ms-selected={selected || undefined}
          data-ms-expanded={expanded || undefined}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          onMouseEnter={rowEvents?.onMouseEnter}
          onMouseLeave={rowEvents?.onMouseLeave}
        >
          {hasExpand && (
            <td className={tdClass('ms-table__td--expand')}>
              {canExpand ? (
                <button
                  type="button"
                  className="ms-table__expand-btn"
                  data-ms-expanded={expanded || undefined}
                  aria-expanded={expanded}
                  aria-label={
                    expanded
                      ? t('table.collapseRow', { index: index + 1 })
                      : t('table.expandRow', { index: index + 1 })
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(key);
                  }}
                >
                  <span className="ms-table__expand-icon" aria-hidden="true" />
                </button>
              ) : null}
            </td>
          )}
          {hasSelection &&
            (() => {
              const cbProps = rowSelection?.getCheckboxProps?.(row) ?? {};
              return (
                <td
                  className={tdClass(
                    `ms-table__td--selection ${classNames?.selectionCell ?? ''}`.trim(),
                  )}
                >
                  <Checkbox
                    aria-label={
                      cbProps['aria-label'] ??
                      t('table.selectRow', { index: index + 1 }, `选择第 ${index + 1} 行`)
                    }
                    checked={selected}
                    disabled={cbProps.disabled}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => toggleRow(row, key, e.target.checked)}
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
                className={tdClass(
                  [
                    col.align && col.align !== 'start' && `ms-table__td--${col.align}`,
                    col.fixed && `ms-table__td--fixed ms-table__td--fixed-${col.fixed}`,
                    extra,
                  ]
                    .filter(Boolean)
                    .join(' '),
                )}
              >
                {content}
              </td>
            );
          })}
        </tr>
      );

      if (canExpand && expanded) {
        return [
          dataRow,
          <tr
            key={`${key}-expand`}
            className={['ms-table__row', 'ms-table__row--expansion'].filter(Boolean).join(' ')}
          >
            <td className="ms-table__expansion" colSpan={totalColSpan}>
              <div className="ms-table__expansion-inner">{expandable?.rowRender(row, index)}</div>
            </td>
          </tr>,
        ];
      }
      return dataRow;
    });
  }

  // —— tfoot:自定义 footer 优先,否则按列 renderSummary 汇总 ——
  let footNode: ReactNode = null;
  if (footer != null) {
    footNode = (
      <tr className="ms-table__row ms-table__row--summary">
        <td className="ms-table__td ms-table__td--summary" colSpan={totalColSpan}>
          {footer}
        </td>
      </tr>
    );
  } else if (summary) {
    footNode = (
      <tr className="ms-table__row ms-table__row--summary">
        {hasExpand && <td className="ms-table__td ms-table__td--summary ms-table__td--expand" />}
        {hasSelection && (
          <td className="ms-table__td ms-table__td--summary ms-table__td--selection" />
        )}
        {columns.map((col) => (
          <td
            key={col.key}
            className={[
              'ms-table__td',
              'ms-table__td--summary',
              col.align && col.align !== 'start' && `ms-table__td--${col.align}`,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {col.renderSummary ? col.renderSummary(sortedData) : null}
          </td>
        ))}
      </tr>
    );
  }

  return (
    <div
      {...rest}
      className={wrapClassName}
      style={wrapStyle}
      aria-busy={loading || undefined}
      data-ms-size={size}
    >
      <table
        {...tableProps}
        ref={ref}
        className={['ms-table', classNames?.table, tableProps?.className].filter(Boolean).join(' ')}
      >
        {caption ? <caption className="ms-table__caption">{caption}</caption> : null}
        <thead className={['ms-table__head', classNames?.thead].filter(Boolean).join(' ')}>
          <tr className={['ms-table__row', classNames?.row].filter(Boolean).join(' ')}>
            {hasExpand && (
              <th
                scope="col"
                className={thClass('ms-table__th--expand')}
                style={expandWidth ? { inlineSize: expandWidth } : undefined}
              >
                <span className="ms-sr-only">{t('table.expandColumn')}</span>
              </th>
            )}
            {hasSelection && (
              <th
                scope="col"
                className={thClass(
                  `ms-table__th--selection ${classNames?.selectionCell ?? ''}`.trim(),
                )}
                style={selWidth ? { inlineSize: selWidth } : undefined}
              >
                {selType === 'checkbox' && !rowSelection?.hideSelectAll ? (
                  <Checkbox
                    aria-label={t('table.selectAll', undefined, '全选')}
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                ) : (
                  <span className="ms-sr-only">
                    {t('table.selectionColumn', undefined, '选择')}
                  </span>
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
                  style={col.width ? { inlineSize: toLen(col.width) } : undefined}
                  className={thClass(
                    [
                      col.align && col.align !== 'start' && `ms-table__th--${col.align}`,
                      col.fixed && `ms-table__th--fixed ms-table__th--fixed-${col.fixed}`,
                      col.headerClassName,
                    ]
                      .filter(Boolean)
                      .join(' '),
                  )}
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
        <tbody className={['ms-table__body', classNames?.tbody].filter(Boolean).join(' ')}>
          {body}
        </tbody>
        {footNode ? <tfoot className="ms-table__foot">{footNode}</tfoot> : null}
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
 * Table —— 数据表格(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 渲染语义化 <table>;支持排序(受控/非受控)、行选择(全选三态 + onSelect/onSelectAll 细分)、
 * 可展开行(rowRender + expandedKeys 受控/非受控)、列固定(fixed left/right sticky)、
 * 行高三档密度、汇总/页脚行、空态/加载态、粘性表头、列对齐/自定义 render、斑马纹、行 hover。
 * 接全库 tone resolver(选中行/hover 强调条/排序箭头读 6 槽位);魔法动效:行 stagger 进场、
 * 排序箭头脉冲、loading 遮罩淡入微模糊、选中行 inset glow(均可一键降级)。
 * 行级事件 onRowClick/onRowDoubleClick/onRowContextMenu + Ant 式 onRow 工厂;
 * 根 wrap spread ...rest 透传所有原生属性/事件,classNames 注入关键子部件类名。
 * 新能力默认关闭,旧 columns/data 用法零改动。样式见同目录 Table.css。
 */
export const Table = forwardRef(TableImpl) as (<T = Record<string, ReactNode>>(
  props: TableProps<T> & { ref?: Ref<HTMLTableElement> },
) => ReactElement) & { displayName?: string };
Table.displayName = 'Table';

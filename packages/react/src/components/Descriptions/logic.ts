/**
 * Descriptions 纯逻辑层(零 React) —— 把「列数(单值 | 响应式断点对象)」与「items 的 span 跨列」
 * 解析成布局所需的数据:① 每断点的列数 CSS 变量;② 把扁平 items 按列数贪心折行成「行」结构,
 * 同时处理 span 跨列与行末截断(span 超出剩余列宽时收窄到本行剩余,避免溢出)。
 *
 * 设计动机(对齐 device.css / breakpoints / Grid 的范式):
 * - CSS 的 `@media`/`@container` 条件里 `var()` 不生效,无法运行时用变量驱动断点条件;
 *   故响应式列数不在条件上做文章,而是「每个断点各写一个 CSS 变量 --ms-desc-cols-<bp>」,
 *   由 Descriptions.css 里静态的 `@media` 块做移动优先级联(fallback 链)。
 * - 断点名复用 @magic-scope/tokens 的视口断点(base/sm/md/lg/xl/2xl),不另造一套。
 * - 行折叠(把 items 排进每行)是纯数据变换,在此可单测、可平移到其它框架(Vue / WC)。
 *
 * 注意:列数是「逻辑列数」(用于行折叠的 span 计算),CSS 真正的 grid-template-columns 由
 * Descriptions.tsx 用同一份列数变量驱动(horizontal 态每逻辑列 = label+content 两个 grid 轨道)。
 */

import type { ReactNode } from 'react';

/** 视口断点档(对齐 tokens breakpoints.viewport;base = 无媒体查询的基线)。 */
export type DescriptionsBreakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** 断点顺序(移动优先级联依赖此序;Descriptions.css 的 @media 顺序须与此一致)。 */
export const DESC_BREAKPOINTS: readonly DescriptionsBreakpoint[] = [
  'base',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
];

/** 列数:单值,或按断点给值的对象(部分断点可缺省,缺省走 CSS 级联继承)。 */
export type ResponsiveColumns = number | Partial<Record<DescriptionsBreakpoint, number>>;

/** 单条描述项(数据驱动入口形态;也可用 Descriptions.Item 复合子组件表达)。 */
export interface DescriptionsItem {
  /** 唯一键(列表渲染用;缺省回退索引)。 */
  key?: string | number | undefined;
  /** 项标签(键)。 */
  label?: ReactNode;
  /** 项内容(值)。`children` 是 `value` 的别名,二者择一。 */
  value?: ReactNode;
  /** 项内容(值)别名,与 `value` 等价(value 优先)。 */
  children?: ReactNode;
  /** 跨列数(占用多少逻辑列;默认 1)。超过本行剩余列会被收窄到剩余宽度。 */
  span?: number | undefined;
  /** 该项的内容部件附加 className。 */
  className?: string | undefined;
  /** 该项标签部件附加 className。 */
  labelClassName?: string | undefined;
}

/** 判断列数是否为响应式断点对象(而非单值数字)。 */
export function isResponsiveColumns(
  value: ResponsiveColumns | undefined,
): value is Partial<Record<DescriptionsBreakpoint, number>> {
  return (
    typeof value === 'object' &&
    value !== null &&
    DESC_BREAKPOINTS.some((bp) => bp in (value as Record<string, unknown>))
  );
}

/** 把列数归一成 `断点 -> 列数` 稀疏映射(单值落到 base)。 */
export function normalizeColumns(
  value: ResponsiveColumns | undefined,
  fallback: number,
): Partial<Record<DescriptionsBreakpoint, number>> {
  if (value === undefined) return { base: fallback };
  if (isResponsiveColumns(value)) {
    // 响应式对象未指定 base 时补一个 base 兜底,保证最窄屏有确定列数。
    return 'base' in value ? value : { base: fallback, ...value };
  }
  return { base: value };
}

/** 把列数映射摊成 `--ms-desc-cols-<bp>` CSS 变量集合(只为提供的断点写变量,级联在 CSS 里做)。 */
export function spreadColumnVars(
  value: ResponsiveColumns | undefined,
  fallback: number,
): Record<string, string> {
  const map = normalizeColumns(value, fallback);
  const out: Record<string, string> = {};
  for (const bp of DESC_BREAKPOINTS) {
    const n = map[bp];
    if (n !== undefined) {
      out[`--ms-desc-cols-${bp}`] = String(Math.max(1, Math.floor(n)));
    }
  }
  return out;
}

/** 一条已计算好跨列的项(供渲染:span 已截断到本行剩余,fill 标记是否为补满行末的占位)。 */
export interface ResolvedDescItem {
  /** 原始项数据(fill 占位时为合成空项)。 */
  item: DescriptionsItem;
  /** 实际占用列数(已按本行剩余截断,≥1)。 */
  span: number;
  /** 是否为补满行末的占位单元(无真实内容,仅撑满 grid 行)。 */
  filler: boolean;
  /** 稳定 key。 */
  key: string;
}

/** 一行(若干已解析项)。 */
export type ResolvedDescRow = ResolvedDescItem[];

/**
 * 把扁平 items 按「基线列数(base)」贪心折行:
 * - 每项 span 收窄到 [1, columns];
 * - 若当前行剩余列放不下本项 span,则把本行剩余补一个 filler 占位后换行;
 * - 末行不足列数时补 filler,保证 bordered 表格态每行单元整齐(无真实内容)。
 *
 * 注:这里用 base 列数做折行 —— 响应式收窄主要靠 CSS 重排 grid;折行是为 bordered 态的
 * 行边界与 filler 补齐服务(无边框态视觉上不依赖精确折行,但结构一致便于一致渲染)。
 */
export function resolveRows(items: DescriptionsItem[], columns: number): ResolvedDescRow[] {
  const cols = Math.max(1, Math.floor(columns));
  const rows: ResolvedDescRow[] = [];
  let current: ResolvedDescRow = [];
  let used = 0;

  const flushFiller = () => {
    const remain = cols - used;
    if (remain > 0) {
      current.push({
        item: {},
        span: remain,
        filler: true,
        key: `__filler-${rows.length}-${current.length}`,
      });
    }
    rows.push(current);
    current = [];
    used = 0;
  };

  items.forEach((item, index) => {
    const rawSpan = item.span ?? 1;
    const wantSpan = Math.max(1, Math.floor(rawSpan));
    // 单项 span 不能超过总列数。
    const cappedSpan = Math.min(wantSpan, cols);
    // 本行放不下 → 先补满当前行再换行。
    if (used > 0 && used + cappedSpan > cols) {
      flushFiller();
    }
    current.push({
      item,
      span: cappedSpan,
      filler: false,
      key: item.key != null ? String(item.key) : `item-${index}`,
    });
    used += cappedSpan;
    if (used >= cols) {
      // 行满,直接落行(used === cols 时 flushFiller 不补占位)。
      flushFiller();
    }
  });

  if (current.length > 0) {
    flushFiller();
  }
  return rows;
}

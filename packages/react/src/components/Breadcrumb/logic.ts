/**
 * Breadcrumb 纯逻辑 —— 零 React 依赖,便于将来平移到 core / 其它框架。
 * 负责「折叠省略」的计算:在条目超过上限时,保留头尾,中间折成一个可展开的省略占位。
 */

/** 一条规整后的渲染单元:要么是真实条目,要么是「中间省略」占位。 */
export interface BreadcrumbRenderEntry<TItem> {
  /** 占位项为 true,真实条目为 false。 */
  ellipsis: boolean;
  /** 真实条目(ellipsis=false 时存在)。 */
  item?: TItem;
  /** 该条目在原始 items 中的下标(ellipsis=false 时存在),供回调透出。 */
  index?: number;
  /** 被折叠掉的真实条目(ellipsis=true 时存在),供「展开」或 title 提示用。 */
  collapsed?: { item: TItem; index: number }[];
}

export interface CollapseOptions {
  /** 总条目数。 */
  total: number;
  /** 超过该数才折叠;<=0 或 >=total 视为不折叠。 */
  maxItems?: number | undefined;
  /** 折叠时头部保留的条目数。默认 1。 */
  itemsBeforeCollapse?: number | undefined;
  /** 折叠时尾部保留的条目数。默认 1。 */
  itemsAfterCollapse?: number | undefined;
}

/**
 * 计算折叠后的下标分布。返回 `null` 表示不折叠(直接全量渲染)。
 * 返回 `{ before, after }`:before 是头部保留的下标区间 [0, before),
 * after 是尾部保留的起始下标(含),中间 [before, after) 被折叠。
 */
export function resolveCollapse({
  total,
  maxItems,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 1,
}: CollapseOptions): { before: number; after: number } | null {
  if (maxItems == null || maxItems <= 0 || total <= maxItems) return null;

  // 头尾保留数做下限保护,避免负数 / 越界
  const before = Math.max(0, Math.min(itemsBeforeCollapse, total));
  const after = Math.max(0, Math.min(itemsAfterCollapse, total - before));

  // 头尾相加已覆盖全部(或仅差一个),折叠没有意义,直接全量
  if (before + after >= total - 1) return null;

  return { before, after: total - after };
}

/**
 * 把原始 items 规整成渲染单元序列:头部条目 + 省略占位(若折叠)+ 尾部条目。
 * 纯函数,无副作用;React 层只负责把它映射成 DOM。
 */
export function buildRenderEntries<TItem>(
  items: TItem[],
  options: Omit<CollapseOptions, 'total'>,
  expanded: boolean,
): BreadcrumbRenderEntry<TItem>[] {
  const total = items.length;
  const collapse = expanded ? null : resolveCollapse({ total, ...options });

  if (!collapse) {
    return items.map((item, index) => ({ ellipsis: false, item, index }));
  }

  const { before, after } = collapse;
  const head: BreadcrumbRenderEntry<TItem>[] = items
    .slice(0, before)
    .map((item, index) => ({ ellipsis: false, item, index }));

  const collapsed = items.slice(before, after).map((item, i) => ({ item, index: before + i }));

  const tail: BreadcrumbRenderEntry<TItem>[] = items
    .slice(after)
    .map((item, i) => ({ ellipsis: false, item, index: after + i }));

  return [...head, { ellipsis: true, collapsed }, ...tail];
}

/**
 * Pagination 纯逻辑 —— 零 React 依赖,便于将来平移 `packages/core`。
 * 只做「页码序列计算」与「数值夹取」,不碰任何渲染/状态。
 */

/** 页码序列项:具体页码 或 两侧省略号占位。 */
export type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

/** 把目标页夹取到 [1, total] 的合法区间(向下取整、容错 NaN/越界)。 */
export function clampPage(target: number, total: number): number {
  const safeTotal = Math.max(1, Math.floor(total) || 1);
  const floored = Math.floor(target);
  if (!Number.isFinite(floored)) return 1;
  return Math.min(Math.max(1, floored), safeTotal);
}

/**
 * 生成页码序列:首尾恒显,当前页两侧各 siblingCount 个,缺口处用省略号占位。
 * 不依赖 React,可单测、可平移。
 */
export function buildRange(page: number, total: number, siblingCount: number): PageItem[] {
  const safeSibling = Math.max(0, Math.floor(siblingCount));
  // 首页 + 尾页 + 当前页 + 两侧 + 两个省略号,最多展示的「页码槽」数量。
  const totalSlots = safeSibling * 2 + 5;
  if (total <= totalSlots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - safeSibling, 1);
  const rightSibling = Math.min(page + safeSibling, total);
  // 距首/尾仅差 1 时不画省略号(省略号只省掉 >=2 个时才有意义)。
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  const items: PageItem[] = [1];

  if (showLeftEllipsis) {
    items.push('ellipsis-start');
  } else {
    // 不画左省略号时,补齐 2..leftSibling-1 这段被跳过的页码。
    for (let p = 2; p < leftSibling; p++) items.push(p);
  }

  for (let p = leftSibling; p <= rightSibling; p++) {
    if (p !== 1 && p !== total) items.push(p);
  }

  if (showRightEllipsis) {
    items.push('ellipsis-end');
  } else {
    for (let p = rightSibling + 1; p < total; p++) items.push(p);
  }

  items.push(total);
  return items;
}

/** 计算「当前页覆盖的条目区间」[start, end](1 起,闭区间);total/pageSize 缺失时返回 null。 */
export function pageRange(
  page: number,
  pageSize: number | undefined,
  totalItems: number | undefined,
): [number, number] | null {
  if (pageSize === undefined || totalItems === undefined) return null;
  if (totalItems <= 0) return [0, 0];
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  return [start, end];
}

/** 由总条目数与每页条数推总页数(至少 1 页)。 */
export function pageCountFromItems(totalItems: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

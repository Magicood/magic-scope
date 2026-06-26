/**
 * Transfer 纯逻辑 —— 零 React 依赖,可平移进 core。
 * 把 dataSource 按 targetKeys 切成左右两栏、按关键词过滤、把选中 key 在两侧移动并算出方向,
 * 都是与具体框架状态无关的纯函数;组件只负责把它们接进 React 状态 / DOM。
 */

/** 穿梭项的最小结构契约(逻辑层只关心这三个字段;render 由组件层负责)。 */
export interface TransferItemLike {
  /** 唯一标识,移动 / 选中都以它为准。 */
  key: string;
  /** 默认展示文本(组件层可用 render 覆盖渲染)。 */
  title: string;
  /** 该项禁用:不可选中、不参与全选、不可被移动。 */
  disabled?: boolean | undefined;
}

/** 移动方向:`right` = 左 → 右(加入 targetKeys),`left` = 右 → 左(移出 targetKeys)。 */
export type TransferDirection = 'left' | 'right';

/** 切栏结果:左栏(不在 targetKeys 内)与右栏(在 targetKeys 内),均保持 dataSource 原序。 */
export interface TransferSplit<T extends TransferItemLike> {
  /** 左栏:不在 targetKeys 中的源项(源池)。 */
  left: T[];
  /** 右栏:在 targetKeys 中的目标项,且按 dataSource 原序。 */
  right: T[];
}

/**
 * 按 targetKeys 把 dataSource 切成左右两栏:命中 targetKeys 的进右栏,其余进左栏,两栏均保持原序。
 * targetKeys 里不存在于 dataSource 的「孤儿 key」被忽略(不凭空造项)。
 */
export function splitByTargetKeys<T extends TransferItemLike>(
  dataSource: readonly T[],
  targetKeys: readonly string[],
): TransferSplit<T> {
  const target = new Set(targetKeys);
  const left: T[] = [];
  const right: T[] = [];
  for (const item of dataSource) {
    if (target.has(item.key)) {
      right.push(item);
    } else {
      left.push(item);
    }
  }
  return { left, right };
}

/**
 * 关键词过滤:大小写不敏感地匹配 title 包含 query。query 为空 / 纯空白时返回全部(浅拷贝)。
 * filter 自定义匹配器可覆盖默认包含匹配(返回 true 即保留)。
 */
export function filterBySearch<T extends TransferItemLike>(
  items: readonly T[],
  query: string,
  filter?: ((query: string, item: T) => boolean) | undefined,
): T[] {
  const q = query.trim().toLowerCase();
  if (q === '') {
    return [...items];
  }
  if (filter) {
    return items.filter((item) => filter(query, item));
  }
  return items.filter((item) => item.title.toLowerCase().includes(q));
}

/** 把一组 key 从「源侧可选项」里筛出真正可移动的(存在且未禁用),保持 selectedKeys 不影响结果顺序。 */
function pickMovable<T extends TransferItemLike>(
  source: readonly T[],
  selectedKeys: readonly string[],
): string[] {
  const selected = new Set(selectedKeys);
  const movable: string[] = [];
  for (const item of source) {
    if (selected.has(item.key) && !item.disabled) {
      movable.push(item.key);
    }
  }
  return movable;
}

/** moveKeys 的结果:新的 targetKeys、本次实际移动的 key、方向。 */
export interface MoveResult {
  /** 移动后的新 targetKeys(右栏 key 集合);保持稳定去重。 */
  targetKeys: string[];
  /** 本次实际移动的 key(已剔除禁用 / 不存在的)。空数组表示无变化。 */
  moveKeys: string[];
  /** 本次移动方向。 */
  direction: TransferDirection;
}

/**
 * 把 selectedKeys 沿 direction 在两侧移动,基于当前 dataSource / targetKeys 计算新的 targetKeys。
 * - `direction='right'`:从左栏(源池)选中项加入 targetKeys;
 * - `direction='left'`:从右栏(目标)选中项移出 targetKeys。
 * 仅移动「存在于对应源侧且未禁用」的 key;禁用项 / 不存在项 / 已在目标态的 key 被忽略。
 * 返回的 targetKeys 保持 dataSource 原序的右栏顺序,纯函数不改入参。
 */
export function moveKeys<T extends TransferItemLike>(
  dataSource: readonly T[],
  targetKeys: readonly string[],
  selectedKeys: readonly string[],
  direction: TransferDirection,
): MoveResult {
  const { left, right } = splitByTargetKeys(dataSource, targetKeys);
  const source = direction === 'right' ? left : right;
  const moved = pickMovable(source, selectedKeys);

  if (moved.length === 0) {
    return { targetKeys: [...new Set(targetKeys)], moveKeys: [], direction };
  }

  const movedSet = new Set(moved);
  let nextTarget: Set<string>;
  if (direction === 'right') {
    nextTarget = new Set(targetKeys);
    for (const key of moved) {
      nextTarget.add(key);
    }
  } else {
    nextTarget = new Set([...targetKeys].filter((key) => !movedSet.has(key)));
  }

  // 以 dataSource 原序重排,保证右栏稳定不抖动。
  const ordered: string[] = [];
  for (const item of dataSource) {
    if (nextTarget.has(item.key)) {
      ordered.push(item.key);
    }
  }
  return { targetKeys: ordered, moveKeys: moved, direction };
}

/** 全选态:none(全未选)/ some(部分选)/ all(全选,且至少有一个可选项)。用于表头复选框 indeterminate / checked。 */
export type TransferCheckState = 'none' | 'some' | 'all';

/** 在一栏「可选项(未禁用)」范围内,按已选 key 计算全选态。无可选项恒为 none。 */
export function checkStateOf<T extends TransferItemLike>(
  items: readonly T[],
  selectedKeys: readonly string[],
): TransferCheckState {
  const selected = new Set(selectedKeys);
  const enabled = items.filter((item) => !item.disabled);
  if (enabled.length === 0) {
    return 'none';
  }
  const checkedCount = enabled.reduce((n, item) => (selected.has(item.key) ? n + 1 : n), 0);
  if (checkedCount === 0) {
    return 'none';
  }
  return checkedCount === enabled.length ? 'all' : 'some';
}

/**
 * 表头全选切换:checked=true 把该栏所有可选项 key 并入 selected;false 把它们从 selected 移除。
 * 只动「本栏可选项」,不波及另一栏已选 key(返回新数组,稳定去重,不改入参)。
 */
export function toggleSelectAll<T extends TransferItemLike>(
  items: readonly T[],
  selectedKeys: readonly string[],
  checked: boolean,
): string[] {
  const enabledKeys = items.filter((item) => !item.disabled).map((item) => item.key);
  if (checked) {
    return [...new Set([...selectedKeys, ...enabledKeys])];
  }
  const remove = new Set(enabledKeys);
  return selectedKeys.filter((key) => !remove.has(key));
}

/**
 * 表头全选切换(按 key 作用域版):checked=true 把 affectedKeys 并入 selected;false 把它们从 selected 移除。
 * 与 `toggleSelectAll` 的差异:作用域由调用方显式给定的 affectedKeys 决定,而非从整栏 items 重新推导——
 * 这样搜索激活时只需把「当前可见(已过滤)的可选项 key」传进来,全选就严格局限于看得见的项,
 * 绝不波及被搜索隐藏的项。返回新数组,稳定去重,不改入参。
 */
export function toggleSelectAllByKeys(
  selectedKeys: readonly string[],
  affectedKeys: readonly string[],
  checked: boolean,
): string[] {
  if (checked) {
    return [...new Set([...selectedKeys, ...affectedKeys])];
  }
  const remove = new Set(affectedKeys);
  return selectedKeys.filter((key) => !remove.has(key));
}

/** 切换单个 key 的选中态(在 selected 集合里加 / 减);返回新数组,不改入参。 */
export function toggleSelectedKey(selectedKeys: readonly string[], key: string): string[] {
  return selectedKeys.includes(key)
    ? selectedKeys.filter((k) => k !== key)
    : [...selectedKeys, key];
}

/** 统计一栏的「已选 / 可选总数」,用于表头「已选 X/Y」。total 含禁用项(展示总条数),checked 仅计可选已选。 */
export function countOf<T extends TransferItemLike>(
  items: readonly T[],
  selectedKeys: readonly string[],
): { checked: number; total: number } {
  const selected = new Set(selectedKeys);
  let checked = 0;
  for (const item of items) {
    if (!item.disabled && selected.has(item.key)) {
      checked += 1;
    }
  }
  return { checked, total: items.length };
}

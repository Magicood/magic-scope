/**
 * Tabs 纯逻辑 —— 不依赖 React,便于将来平移到 core / 其它框架。
 * 仅做「可用项查找」与「方向键 → 意图」的解析,渲染与副作用留给框架壳。
 */

/** 一项只需具备 disabled 标记即可参与导航计算(结构性约束,与 React 无关)。 */
export interface NavItem {
  disabled?: boolean | undefined;
}

/**
 * 从 from 起按 dir 找下一个可用项(循环,跳过 disabled),返回其索引。
 * 全部禁用或只有自己可用时回退 from。
 */
export function nextEnabledIndex<T extends NavItem>(
  items: readonly T[],
  from: number,
  dir: 1 | -1,
): number {
  const n = items.length;
  if (n === 0) {
    return from;
  }
  for (let step = 1; step <= n; step += 1) {
    // + n * step 保证取模前为非负(JS 负数取模会得负)。
    const i = (from + dir * step + n * step) % n;
    if (!items[i]?.disabled) {
      return i;
    }
  }
  return from;
}

/** 返回首个(dir=-1)或末个(dir=1)可用项索引;全禁用返回 -1。 */
export function edgeEnabledIndex<T extends NavItem>(items: readonly T[], dir: 1 | -1): number {
  if (dir === 1) {
    for (let i = items.length - 1; i >= 0; i -= 1) {
      if (!items[i]?.disabled) {
        return i;
      }
    }
  } else {
    for (let i = 0; i < items.length; i += 1) {
      if (!items[i]?.disabled) {
        return i;
      }
    }
  }
  return -1;
}

export type TabsOrientation = 'horizontal' | 'vertical';

/** 方向键解析出的导航意图(与具体键值/朝向解耦)。 */
export type TabsNavIntent = { type: 'move'; dir: 1 | -1 } | { type: 'edge'; dir: 1 | -1 } | null;

/**
 * 把按键映射为导航意图,随朝向切换主轴:
 * - horizontal:← / → 移动;
 * - vertical:↑ / ↓ 移动;
 * - Home / End 两朝向通用,跳首 / 尾。
 * 返回 null 表示不拦截(交回浏览器默认)。
 */
export function resolveNavIntent(key: string, orientation: TabsOrientation): TabsNavIntent {
  const horizontal = orientation === 'horizontal';
  switch (key) {
    case 'ArrowRight':
      return horizontal ? { type: 'move', dir: 1 } : null;
    case 'ArrowLeft':
      return horizontal ? { type: 'move', dir: -1 } : null;
    case 'ArrowDown':
      return horizontal ? null : { type: 'move', dir: 1 };
    case 'ArrowUp':
      return horizontal ? null : { type: 'move', dir: -1 };
    case 'Home':
      return { type: 'edge', dir: -1 };
    case 'End':
      return { type: 'edge', dir: 1 };
    default:
      return null;
  }
}

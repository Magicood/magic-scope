/**
 * FloatButton 纯逻辑 —— 零 React 依赖,可平移进 core。
 *
 * Group 的展开/堆叠是纯几何 + 纯状态判定:把它们抽成纯函数,组件只负责接状态/DOM。
 * 形状、类型、堆叠方向、错峰动画时延都不碰 React,便于将来 vue/core 复用同一套语义。
 */

/** 浮钮形状:圆形 / 方形(圆角)。 */
export type FloatButtonShape = 'circle' | 'square';
/** 浮钮类型:默认(中性面)/ 主色(实底发光)。 */
export type FloatButtonType = 'default' | 'primary';
/** Group 展开方向:子项从触发钮往哪个方位弹出。 */
export type FloatButtonExpandDirection = 'up' | 'down' | 'left' | 'right';
/** Group 触发方式:点击切换 / 悬停展开。 */
export type FloatButtonGroupTrigger = 'click' | 'hover';

/**
 * badge 的最小结构契约(逻辑层只关心这三个字段)。
 * - `count` 为数字时显示数字(配合 overflowCount 截断为 `N+`);
 * - `dot` 为 true 时显示小红点(忽略 count);
 * - 都不给则不显示。
 */
export interface FloatBadgeLike {
  count?: number | undefined;
  dot?: boolean | undefined;
  overflowCount?: number | undefined;
}

/**
 * 把 badge 规整成可直接渲染的结果:
 * - 仅点:`{ kind: 'dot' }`;
 * - 数字 > 0:`{ kind: 'count', text }`(超过 overflowCount 显示 `N+`,默认 99);
 * - 其它(undefined / count<=0 且非 dot):`null`(不渲染)。
 * 纯函数,无副作用,便于单测与跨框架复用。
 */
export function resolveBadge(
  badge: FloatBadgeLike | number | undefined,
): { kind: 'dot' } | { kind: 'count'; text: string } | null {
  if (badge === undefined) {
    return null;
  }
  const normalized: FloatBadgeLike = typeof badge === 'number' ? { count: badge } : badge;
  if (normalized.dot) {
    return { kind: 'dot' };
  }
  const count = normalized.count;
  if (count === undefined || !Number.isFinite(count) || count <= 0) {
    return null;
  }
  const overflow = normalized.overflowCount ?? 99;
  const text = overflow > 0 && count > overflow ? `${overflow}+` : `${Math.floor(count)}`;
  return { kind: 'count', text };
}

/**
 * 错峰入场:展开时第 `index` 个子项(从触发钮最近的算第 0)的动画延时(ms)。
 * 收起态(open=false)恒为 0,避免离场也错峰拖尾。`stagger<=0` 关闭错峰。
 */
export function staggerDelay(index: number, open: boolean, stagger: number): number {
  if (!open || stagger <= 0 || index < 0) {
    return 0;
  }
  return index * stagger;
}

/**
 * 判定是否应降级动效(reduced-motion / data-ms-motion=off 总闸)。
 * SSR / 不支持 matchMedia 时返回 false(按有动效渲染,首屏不闪)。
 * 组件在客户端调用以决定是否旁路错峰延时。
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }
  if (typeof document === 'undefined') {
    return false;
  }
  return document.querySelector('[data-ms-motion="off"]') !== null;
}

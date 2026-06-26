/**
 * Tooltip 纯逻辑层 —— 不依赖 React,便于将来平移 core(vue / web-component 等共用)。
 *
 * 只放「placement → CSS position-area / 主轴方位 / 副轴对齐」的派生与方位推导;
 * 组件层(Tooltip.tsx)只负责把这些结果接到 DOM 与事件上。与 Popover 的 logic 同构,
 * 保证多框架对等(同一套 position-area 语义,不各写一套)。
 */

/** Tooltip 方位:四主轴 ×(居中 / -start / -end)。 */
export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

/** 主轴方位(箭头朝向、入场位移方向都按此区分)。 */
export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

/** placement 的全部合法值(供运行时校验 / 枚举遍历)。 */
export const TOOLTIP_PLACEMENTS: readonly TooltipPlacement[] = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
];

/**
 * placement → CSS `position-area` 关键字(3×3 网格双轴关键字)。
 * 块轴方位(top/bottom):居中横向跨满、-start/-end 用 span 让气泡从对应边向中心展开。
 * 行内轴方位(left/right)对称处理。与 Popover 一致。
 */
export function placementToArea(placement: TooltipPlacement): string {
  switch (placement) {
    case 'top':
      return 'block-start span-inline';
    case 'top-start':
      return 'block-start span-inline-end';
    case 'top-end':
      return 'block-start span-inline-start';
    case 'bottom':
      return 'block-end span-inline';
    case 'bottom-start':
      return 'block-end span-inline-end';
    case 'bottom-end':
      return 'block-end span-inline-start';
    case 'left':
      return 'inline-start span-block';
    case 'left-start':
      return 'inline-start span-block-end';
    case 'left-end':
      return 'inline-start span-block-start';
    case 'right':
      return 'inline-end span-block';
    case 'right-start':
      return 'inline-end span-block-end';
    case 'right-end':
      return 'inline-end span-block-start';
    default:
      return 'block-start span-inline';
  }
}

/** placement → 主轴方位(箭头朝向 / 入场位移方向都按主轴区分)。 */
export function placementToSide(placement: TooltipPlacement): TooltipSide {
  if (placement.startsWith('top')) return 'top';
  if (placement.startsWith('bottom')) return 'bottom';
  if (placement.startsWith('left')) return 'left';
  return 'right';
}

/** placement → 副轴对齐('center' | 'start' | 'end'),用于箭头横向 / 纵向定位。 */
export function placementToAlign(placement: TooltipPlacement): 'center' | 'start' | 'end' {
  if (placement.endsWith('-start')) return 'start';
  if (placement.endsWith('-end')) return 'end';
  return 'center';
}

/** placement 是否合法,非法回退 'top'(防御用户传任意字符串)。 */
export function normalizePlacement(placement: string | undefined): TooltipPlacement {
  if (placement && (TOOLTIP_PLACEMENTS as readonly string[]).includes(placement)) {
    return placement as TooltipPlacement;
  }
  return 'top';
}

/** 触屏(无 hover)环境判定:tap-to-toggle 用,SSR 安全。 */
export const isCoarseNoHover = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: none)').matches;

/** 原生可聚焦标签(决定是否注入 tabindex 兜底键盘可达)。 */
const FOCUSABLE_TAGS = new Set(['a', 'button', 'input', 'select', 'textarea']);

/** 判定 children 是否为原生可聚焦元素(否则注入 tabindex 保键盘可达)。 */
export function isNativelyFocusable(
  type: unknown,
  props: { tabIndex?: number; href?: string },
): boolean {
  if (typeof props.tabIndex === 'number') {
    return true;
  }
  if (typeof type !== 'string') {
    // 自定义组件:无法静态判定,保守注入 tabindex 兜底键盘可达。
    return false;
  }
  if (type === 'a') {
    return props.href !== undefined;
  }
  return FOCUSABLE_TAGS.has(type);
}

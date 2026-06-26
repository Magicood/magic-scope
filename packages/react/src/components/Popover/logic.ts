/**
 * Popover 纯逻辑层 —— 不依赖 React,便于将来平移 core(vue / web-component 等共用)。
 *
 * 这里只放「placement → CSS position-area / 箭头朝向 / 翻转回退链」的派生,以及
 * trigger / 浮层方位推导。组件层(Popover.tsx)只负责把这些结果接到 DOM 与事件上。
 */

/** 12 向定位:四个主轴 × (居中 / -start / -end)。 */
export type PopoverPlacement =
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

/** 主轴方位(箭头朝向、位移方向都按此区分)。 */
export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';

/** 浮层触发方式。 */
export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'manual';

/** placement 的全部合法值(供运行时校验 / 枚举遍历)。 */
export const POPOVER_PLACEMENTS: readonly PopoverPlacement[] = [
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
 * placement → CSS `position-area` 关键字。
 *
 * position-area 用 3×3 网格的两个轴关键字描述。块轴方位(top/bottom)时:
 * - 居中:`block-* span-inline`(横向跨满,居中对齐 trigger)
 * - -start:`block-* inline-start`(浮层起始边对齐 trigger 起始边 → 用 span-* 让其向 end 展开)
 * - -end:`block-* inline-end`
 * 行内轴方位(left/right)对称处理(交换块/行内角色)。
 *
 * 注:-start / -end 用 `span-inline-start` / `span-inline-end` 让浮层从对应边
 *     向中心展开,视觉上「边对齐」,这是 anchor positioning 的对齐惯用法。
 */
export function placementToArea(placement: PopoverPlacement): string {
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
      return 'block-end span-inline';
  }
}

/** placement → 主轴方位(箭头朝向 / 入场位移方向都按主轴区分)。 */
export function placementToSide(placement: PopoverPlacement): PopoverSide {
  if (placement.startsWith('top')) return 'top';
  if (placement.startsWith('bottom')) return 'bottom';
  if (placement.startsWith('left')) return 'left';
  return 'right';
}

/** placement → 副轴对齐('center' | 'start' | 'end'),用于箭头横向定位。 */
export function placementToAlign(placement: PopoverPlacement): 'center' | 'start' | 'end' {
  if (placement.endsWith('-start')) return 'start';
  if (placement.endsWith('-end')) return 'end';
  return 'center';
}

/** placement 是否合法,非法回退 'bottom'(防御用户传任意字符串)。 */
export function normalizePlacement(placement: string | undefined): PopoverPlacement {
  if (placement && (POPOVER_PLACEMENTS as readonly string[]).includes(placement)) {
    return placement as PopoverPlacement;
  }
  return 'bottom';
}

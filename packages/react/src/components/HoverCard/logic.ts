/**
 * HoverCard 纯逻辑层 —— 不依赖 React,便于将来平移 core(vue / web-component 等共用)。
 *
 * 这里只放可单测的纯算法:
 * - open / close「意图」的计算(进入 trigger / 内容卡触发开;移出触发关;空白区桥接宽限不关）；
 * - placement → CSS position-area / 主轴方位 / 副轴对齐(复用与 Popover 同构的一套语义,不各写一套);
 * - 触屏(无 hover)环境判定(降级:触屏建议改用点击 / Popover）。
 *
 * 组件层(HoverCard.tsx)只负责把这些结果接到 DOM、定时器与事件上。
 */

/** HoverCard 方位:四主轴 ×（居中 / -start / -end)。与 Popover / Tooltip 完全对齐。 */
export type HoverCardPlacement =
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

/** 主轴方位（箭头朝向、入场位移方向都按此区分)。 */
export type HoverCardSide = 'top' | 'bottom' | 'left' | 'right';

/** placement 的全部合法值（供运行时校验 / 枚举遍历)。 */
export const HOVER_CARD_PLACEMENTS: readonly HoverCardPlacement[] = [
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
 * placement → CSS `position-area` 关键字（3×3 网格双轴关键字)。
 * 块轴方位（top/bottom）：居中横向跨满、-start/-end 用 span 让卡片从对应边向中心展开。
 * 行内轴方位（left/right）对称处理。与 Popover / Tooltip 一致，保证多框架对等。
 */
export function placementToArea(placement: HoverCardPlacement): string {
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

/** placement → 主轴方位（箭头朝向 / 入场位移方向都按主轴区分)。 */
export function placementToSide(placement: HoverCardPlacement): HoverCardSide {
  if (placement.startsWith('top')) return 'top';
  if (placement.startsWith('bottom')) return 'bottom';
  if (placement.startsWith('left')) return 'left';
  return 'right';
}

/** placement → 副轴对齐（'center' | 'start' | 'end'），用于箭头横向 / 纵向定位。 */
export function placementToAlign(placement: HoverCardPlacement): 'center' | 'start' | 'end' {
  if (placement.endsWith('-start')) return 'start';
  if (placement.endsWith('-end')) return 'end';
  return 'center';
}

/** placement 是否合法，非法回退 'bottom'（防御用户传任意字符串)。 */
export function normalizePlacement(placement: string | undefined): HoverCardPlacement {
  if (placement && (HOVER_CARD_PLACEMENTS as readonly string[]).includes(placement)) {
    return placement as HoverCardPlacement;
  }
  return 'bottom';
}

/** 触屏（无 hover）环境判定：HoverCard 主要靠 hover，触屏建议降级为点击 / Popover。SSR 安全。 */
export const isCoarseNoHover = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: none)').matches;

/** 原生可聚焦标签（决定是否给 trigger 注入 tabindex 兜底键盘可达，与 Tooltip 对齐）。 */
const FOCUSABLE_TAGS = new Set(['a', 'button', 'input', 'select', 'textarea']);

/**
 * 判定 trigger children 是否为原生可聚焦元素；否则需注入 tabindex 保键盘可达。
 *
 * - 用户已显式给了数值 `tabIndex` → 视为可聚焦（不再覆盖用户意图）。
 * - 自定义组件（type 非字符串）→ 无法静态判定，保守视为不可聚焦，注入 tabindex 兜底。
 * - `<a>` 仅在带 `href` 时才原生可聚焦。
 * - 其余原生标签按 FOCUSABLE_TAGS 判定。
 *
 * @param type children 的元素类型（字符串标签名或组件)。
 * @param props children 的 props（取 tabIndex / href)。
 */
export function isNativelyFocusable(
  type: unknown,
  props: { tabIndex?: number | undefined; href?: string | undefined },
): boolean {
  if (typeof props.tabIndex === 'number') {
    return true;
  }
  if (typeof type !== 'string') {
    return false;
  }
  if (type === 'a') {
    return props.href !== undefined;
  }
  return FOCUSABLE_TAGS.has(type);
}

/** 指针 / 焦点是否落在 HoverCard 的两块「活跃区」之一（trigger 或内容卡)。 */
export type HoverZone = 'trigger' | 'content' | 'outside';

/** 一次「该开 / 该关」意图的计算结果。 */
export interface IntentResult {
  /** 计算出的目标显隐：true 为该打开，false 为该关闭，null 表示维持现状（无动作)。 */
  next: boolean | null;
  /** 该意图需要的延时（毫秒)。next 为 null 时无意义（0)。 */
  delay: number;
}

/**
 * 进入某活跃区（pointerenter / focus）时的开启意图。
 * - 进入 trigger 或内容卡 → 该打开，带 openDelay（trigger 进入卡的「桥接」也走这里，但延时由调用方传 0)。
 * - 进入 outside → 无动作。
 *
 * 纯函数，便于单测桥接 / 宽限逻辑。
 *
 * @param zone 指针 / 焦点进入的活跃区。
 * @param openDelay 打开延时（毫秒)。
 */
export function computeEnterIntent(zone: HoverZone, openDelay: number): IntentResult {
  if (zone === 'trigger' || zone === 'content') {
    return { next: true, delay: Math.max(0, openDelay) };
  }
  return { next: null, delay: 0 };
}

/**
 * 离开某活跃区（pointerleave / blur）时的关闭意图，含「桥接宽限」判定。
 *
 * 关键：指针从 trigger 移向内容卡（或反向）时，会先 leave 当前区、再 enter 另一区。
 * 若离开的「去向」仍在另一块活跃区内，则不关闭（桥接），交给对侧的 enter 维持打开；
 * 仅当去向落在两块活跃区之外，才安排带 closeDelay 的关闭，给指针穿越空白间隙留宽限。
 *
 * @param from 指针 / 焦点离开的活跃区。
 * @param to 离开后的去向所属活跃区（pointerleave 的 relatedTarget 命中判定结果；focus 移出时通常为 outside)。
 * @param closeDelay 关闭延时（毫秒)。
 */
export function computeLeaveIntent(
  from: HoverZone,
  to: HoverZone,
  closeDelay: number,
): IntentResult {
  if (from === 'outside') {
    return { next: null, delay: 0 };
  }
  // 去向仍在 trigger / content 任一活跃区内 → 桥接，不关闭。
  if (to === 'trigger' || to === 'content') {
    return { next: null, delay: 0 };
  }
  return { next: false, delay: Math.max(0, closeDelay) };
}

/**
 * 受控 / 非受控开合态归并：受控值优先，否则取内部态。
 *
 * @param controlled 受控 open（undefined 表示非受控)。
 * @param internal 非受控内部态。
 */
export function resolveOpen(controlled: boolean | undefined, internal: boolean): boolean {
  return controlled !== undefined ? controlled : internal;
}

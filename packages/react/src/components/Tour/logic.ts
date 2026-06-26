/**
 * Tour 纯逻辑层 —— 零 React,框架无关(将来可平移进 packages/core,vue / web-component 共用)。
 *
 * 这里收口「引导漫游」里所有可抽出的算法 / 状态推导:
 * - resolveStep:解析某步的目标元素(支持 selector 字符串或 () => Element 取值器),容错。
 * - clampStepIndex:把任意索引夹到合法步区间(防越界 / 防空步集)。
 * - spotlightRect:目标元素 rect + padding → 高亮挖洞区(带四向 padding、边界夹取)。
 * - placementForStep:根据目标 rect 相对视口位置,自动算引导卡的弹出方位(目标显式 placement 优先)。
 *
 * 组件层(Tour.tsx)只负责把这些纯结果接到 DOM、滚动、焦点与事件上。
 */

/** 引导卡相对目标的方位(四主轴;无目标时居中)。 */
export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

/** 目标取值:CSS 选择器字符串,或返回元素 / null 的取值器(惰性,跟随 DOM 变化)。 */
export type TourTarget = string | (() => Element | null) | null | undefined;

/** 单步定义(纯数据形态,组件层 TourStep 与之对齐)。 */
export interface TourStepLike {
  /** 高亮目标:selector 字符串 / 取值器 / 省略(=无目标,居中展示)。 */
  target?: TourTarget;
  /** 显式方位;省略则由 placementForStep 依据目标在视口的位置自动推断。 */
  placement?: TourPlacement | undefined;
}

/** 简化的矩形(与 DOMRect 的 top/left/width/height 子集对齐,便于纯函数测试)。 */
export interface RectLike {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** 视口尺寸(纯函数入参,避免逻辑层直接读 window)。 */
export interface ViewportSize {
  width: number;
  height: number;
}

/**
 * 把任意（可能越界 / NaN）索引夹到 `[0, total - 1]`。
 * total <= 0 时统一回 0（空步集时索引无意义，调用方应据 total 判空）。
 */
export function clampStepIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  if (!Number.isFinite(index)) return 0;
  const floored = Math.floor(index);
  if (floored < 0) return 0;
  if (floored > total - 1) return total - 1;
  return floored;
}

/**
 * 解析某步的目标元素。支持：
 * - 函数取值器：调用并返回其结果（取值器内部抛错时吞掉，返回 null，不让一处坏目标炸掉整轮引导）。
 * - selector 字符串：在给定根（默认 document）上 querySelector；非法选择器吞掉返回 null。
 * - null / undefined / 空串：无目标，返回 null（该步居中展示）。
 *
 * @param target 目标取值器 / 选择器 / 空。
 * @param root 选择器查询根；省略时用 document（SSR 下 document 不存在则返回 null）。
 */
export function resolveStep(target: TourTarget, root?: Document | Element | null): Element | null {
  if (target == null) return null;
  if (typeof target === 'function') {
    try {
      return target() ?? null;
    } catch {
      return null;
    }
  }
  // 字符串选择器
  if (target.trim() === '') return null;
  const scope = root ?? (typeof document !== 'undefined' ? document : null);
  if (!scope) return null;
  try {
    return scope.querySelector(target);
  } catch {
    // 非法选择器（SyntaxError）等：不抛，降级为无目标。
    return null;
  }
}

/**
 * 目标 rect + padding → 高亮挖洞区（spotlight）。
 *
 * - padding 四向外扩高亮洞，让高亮略大于目标更醒目；可传单值或 {top,right,bottom,left}。
 * - 结果会夹到 `[0, viewport]` 区间内（若提供 viewport），避免洞溢出到负坐标 / 视口外。
 * - width / height 夹到非负。
 *
 * @param rect 目标的 RectLike（通常来自 getBoundingClientRect）。
 * @param padding 高亮外扩量；数字=四向相同，对象=分向。默认 0。
 * @param viewport 视口尺寸；提供则把洞夹进视口内（可选）。
 */
export function spotlightRect(
  rect: RectLike,
  padding: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>> = 0,
  viewport?: ViewportSize,
): RectLike {
  const pad =
    typeof padding === 'number'
      ? { top: padding, right: padding, bottom: padding, left: padding }
      : {
          top: padding.top ?? 0,
          right: padding.right ?? 0,
          bottom: padding.bottom ?? 0,
          left: padding.left ?? 0,
        };

  let top = rect.top - pad.top;
  let left = rect.left - pad.left;
  let width = rect.width + pad.left + pad.right;
  let height = rect.height + pad.top + pad.bottom;

  if (viewport) {
    // 先把左上角夹进视口，再据此收缩宽高，保证洞完全落在 [0, viewport] 内。
    if (left < 0) {
      width += left; // left 为负，等价于裁掉溢出部分
      left = 0;
    }
    if (top < 0) {
      height += top;
      top = 0;
    }
    if (left + width > viewport.width) {
      width = viewport.width - left;
    }
    if (top + height > viewport.height) {
      height = viewport.height - top;
    }
  }

  return {
    top,
    left,
    width: Math.max(0, width),
    height: Math.max(0, height),
  };
}

/**
 * 依据目标 rect 在视口中的位置，自动推断引导卡方位。
 *
 * 规则（在显式 placement 缺省时生效）：
 * - 无目标 rect → 'center'（居中卡，无锚点）。
 * - 目标下方空间足够（视口下半部留白 >= 上半部）→ 'bottom'，否则 'top'；
 * - 但当目标几乎占满竖向、横向却有富余时，改放 'left' / 'right'（择空间更大一侧）。
 *
 * 显式 `step.placement` 优先级最高（'center' 也尊重），仅在缺省时才走自动推断。
 *
 * @param step 步定义（取其显式 placement）。
 * @param rect 目标 rect；null = 无目标。
 * @param viewport 视口尺寸，用于比较上下 / 左右剩余空间。
 */
export function placementForStep(
  step: TourStepLike,
  rect: RectLike | null,
  viewport: ViewportSize,
): TourPlacement {
  if (step.placement) return step.placement;
  if (!rect) return 'center';

  const spaceAbove = rect.top;
  const spaceBelow = viewport.height - (rect.top + rect.height);
  const spaceLeft = rect.left;
  const spaceRight = viewport.width - (rect.left + rect.width);

  const maxVertical = Math.max(spaceAbove, spaceBelow);
  const maxHorizontal = Math.max(spaceLeft, spaceRight);

  // 竖向空间都很憋屈、横向更宽裕时，走左右。
  if (maxHorizontal > maxVertical) {
    return spaceRight >= spaceLeft ? 'right' : 'left';
  }
  return spaceBelow >= spaceAbove ? 'bottom' : 'top';
}

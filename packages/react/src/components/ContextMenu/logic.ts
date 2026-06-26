/**
 * ContextMenu 纯逻辑层 —— 零 React / 零 DOM 依赖,可平移进 packages/core。
 *
 * 只负责「光标坐标 + 浮层尺寸 + 视口尺寸 → 夹回视口后的坐标」这类纯计算。
 * 拍平 items / typeahead / 方向键找下一项复用 Menu/logic.ts(同一套语义,不重复实现)。
 */

/** 二维坐标。 */
export interface Point {
  x: number;
  y: number;
}

/** 一个矩形尺寸。 */
export interface Size {
  width: number;
  height: number;
}

/** 视口边界 + 边距。 */
export interface ClampViewport {
  /** 视口可用宽度。 */
  width: number;
  /** 视口可用高度。 */
  height: number;
  /** 浮层与视口边缘的最小间距(px)。 */
  pad?: number;
}

/**
 * 把光标坐标夹回视口内,保证浮层(给定尺寸)完整可见。
 * - 优先保持左上角在光标处;
 * - 右/下越界则左/上回拉;
 * - 浮层比视口还大时退回到 pad(左上对齐),不返回负坐标。
 *
 * 纯函数:不读 window / DOM,所有输入显式传入,便于测试与平移。
 */
export function clampToViewport(cursor: Point, size: Size, viewport: ClampViewport): Point {
  const pad = viewport.pad ?? 8;
  const maxX = Math.max(pad, viewport.width - size.width - pad);
  const maxY = Math.max(pad, viewport.height - size.height - pad);
  const x = Math.max(pad, Math.min(cursor.x, maxX));
  const y = Math.max(pad, Math.min(cursor.y, maxY));
  return { x, y };
}

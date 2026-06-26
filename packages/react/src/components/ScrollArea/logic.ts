/**
 * ScrollArea 纯逻辑 —— 零 React 依赖,可平移进 core / 其它框架壳。
 * 滚动条 thumb 的几何换算都是纯函数:由 viewport / content / 滚动位置算 thumb 尺寸与位置,
 * 以及拖拽 thumb 时反算回 scrollTop/scrollLeft。组件只负责把它们接进 DOM 测量与事件。
 */

/** 把 `value` 夹在 `[min, max]` 内(min>max 时取 min,保证有界)。 */
export function clamp(value: number, min: number, max: number): number {
  if (max < min) {
    return min;
  }
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

/** thumb 几何结果:沿滚动轴的像素尺寸与起点偏移(相对 track 起点)。 */
export interface ThumbGeometry {
  /** thumb 在滚动轴上的像素长度。 */
  thumbSize: number;
  /** thumb 起点相对 track 起点的像素偏移。 */
  thumbPos: number;
}

/** 内容不溢出(可整屏看完)时,逻辑上无需滚动条;用此阈值兜底浮点误差。 */
const OVERFLOW_EPSILON = 1;

/** 内容是否在该轴溢出(需要滚动条)。content 比 viewport 大出 1px 以上才算。 */
export function isOverflowing(viewportSize: number, contentSize: number): boolean {
  return contentSize - viewportSize > OVERFLOW_EPSILON;
}

/**
 * 由可视尺寸 / 内容尺寸 / 当前滚动位置,算出 thumb 的尺寸与位置(单位 px,沿滚动轴)。
 * - thumb 比例 = viewport / content,再乘 track(= viewport)长度;并夹一个最小可点尺寸 `minThumb`。
 * - thumb 位置 = scrollPos / maxScroll × (track − thumbSize),即把滚动进度线性映射到剩余轨道。
 * 内容不溢出时返回填满 track 的 thumb(thumbSize=track, pos=0),由调用方按 type 决定是否隐藏。
 *
 * @param viewportSize 可视区在该轴的像素长度(= track 长度)
 * @param contentSize 内容在该轴的滚动总长度(scrollWidth/scrollHeight)
 * @param scrollPos 当前滚动位置(scrollLeft/scrollTop)
 * @param minThumb thumb 最小像素长度,保证可命中。默认 20
 */
export function computeThumb(
  viewportSize: number,
  contentSize: number,
  scrollPos: number,
  minThumb = 20,
): ThumbGeometry {
  // 退化:无可视区 / 内容不溢出 → thumb 填满,无需移动。
  if (viewportSize <= 0 || !isOverflowing(viewportSize, contentSize)) {
    return { thumbSize: viewportSize > 0 ? viewportSize : 0, thumbPos: 0 };
  }
  const ratio = viewportSize / contentSize;
  // thumb 不短于 minThumb,也不长于 track 本身。
  const rawThumb = viewportSize * ratio;
  const thumbSize = clamp(rawThumb, Math.min(minThumb, viewportSize), viewportSize);
  const maxScroll = contentSize - viewportSize;
  const maxThumbTravel = viewportSize - thumbSize;
  // maxScroll 为 0 已被 isOverflowing 排除,这里恒 > 0。
  const progress = clamp(scrollPos / maxScroll, 0, 1);
  const thumbPos = progress * maxThumbTravel;
  return { thumbSize, thumbPos };
}

/**
 * 拖拽 thumb 反算 scrollPos:把 thumb 起点偏移线性映射回内容滚动量。
 * thumbPos ∈ [0, track−thumbSize] → scrollPos ∈ [0, content−viewport]。
 *
 * @param viewportSize 可视区像素长度(= track)
 * @param contentSize 内容滚动总长度
 * @param thumbPos 期望的 thumb 起点偏移(像素)
 * @param thumbSize 当前 thumb 像素长度
 */
export function scrollPosFromThumb(
  viewportSize: number,
  contentSize: number,
  thumbPos: number,
  thumbSize: number,
): number {
  const maxThumbTravel = viewportSize - thumbSize;
  const maxScroll = contentSize - viewportSize;
  if (maxThumbTravel <= 0 || maxScroll <= 0) {
    return 0;
  }
  const progress = clamp(thumbPos / maxThumbTravel, 0, 1);
  return progress * maxScroll;
}

/**
 * aria-valuenow:把当前滚动进度归一到 0..100 的整数,供 role=scrollbar 播报。
 * 内容不溢出(无法滚动)时返回 0。
 */
export function scrollValueNow(
  viewportSize: number,
  contentSize: number,
  scrollPos: number,
): number {
  const maxScroll = contentSize - viewportSize;
  if (maxScroll <= 0) {
    return 0;
  }
  return Math.round(clamp(scrollPos / maxScroll, 0, 1) * 100);
}

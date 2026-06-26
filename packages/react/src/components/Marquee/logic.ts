/**
 * Marquee 纯逻辑 —— 零 React 依赖,可平移进 core。
 *
 * 无缝无限滚动的本质是「内容克隆 N 份首尾相接,沿主轴 translate 位移一份的尺寸后回卷」:
 * 视觉上第 1 份滚走时第 2 份已无缝补位,动画结束(位移恰好一份)瞬间回到原点而视觉不变。
 * 这里把「需要克隆几份」「一圈跑多久」「位移百分比」等布局算法收成纯函数,组件只读结果接进 DOM/CSS。
 */

/** 主轴方向。`left`/`right` 为横向,`up`/`down` 为纵向。 */
export type MarqueeDirection = 'left' | 'right' | 'up' | 'down';

/** 方向是否为纵向(`up`/`down`)。 */
export function isVerticalDirection(direction: MarqueeDirection): boolean {
  return direction === 'up' || direction === 'down';
}

/**
 * 方向是否需要反向(content 朝主轴正方向移动)。
 * CSS 基准动画把内容从 0 位移到 -100%(即向 left/up 走);`right`/`down` 通过 `animation-direction: reverse` 实现,
 * 故这里返回「是否该 reverse」。`reverse` 形参再叠加一次异或(用户语义上的整体反向)。
 */
export function shouldReverseAnimation(direction: MarqueeDirection, reverse: boolean): boolean {
  const base = direction === 'right' || direction === 'down';
  // 异或:两者只要一个为真就 reverse,同真则抵消
  return base !== reverse;
}

/**
 * 由内容尺寸与速度(像素/秒)推算一圈(位移一份内容尺寸)所需秒数。
 * `contentSize <= 0` 或 `speed <= 0` 时回退到 `fallback`(默认 20s),避免除零 / 动画时长为 0 或负。
 *
 * 注意:这里的 `contentSize` 必须是「一圈真实位移距离」——即「单份内容 + 一个份间距(gap)」,
 * 见 `cycleDistance`。否则非零 gap 下 px/s 会偏快(少算了 gap 那段距离)。
 */
export function resolveDuration(contentSize: number, speed: number, fallback = 20): number {
  if (!Number.isFinite(contentSize) || contentSize <= 0) {
    return fallback;
  }
  if (!Number.isFinite(speed) || speed <= 0) {
    return fallback;
  }
  return contentSize / speed;
}

/**
 * 一圈真实位移距离 = 单份内容尺寸 + 一个份间距(gap)。
 *
 * 无缝循环里每个克隆份带一个等于 `gap` 的尾随间距,故重复周期(= 动画位移一份)为「单份 + gap」,
 * 而非仅「单份」。speed(px/s)→duration 换算必须用这个真实距离,否则非零 gap 下视觉速度偏快。
 * 任一入参非有限 / 为负时按 0 计入(`gap` 尚未测得时退化为「仅单份」,与旧行为一致)。
 */
export function cycleDistance(contentSize: number, gapSize: number): number {
  const content = Number.isFinite(contentSize) && contentSize > 0 ? contentSize : 0;
  const gap = Number.isFinite(gapSize) && gapSize > 0 ? gapSize : 0;
  return content + gap;
}

/**
 * 计算需要的克隆份数,保证内容铺满容器后仍有富余可无缝循环。
 * 至少 `min`(默认 2)份;当内容比容器窄时,按 `ceil(container / content) + 1` 补足到能填满 + 1 份冗余。
 * `contentSize <= 0` 时退回 `min`(尚未测得内容尺寸,先给安全值)。
 */
export function repeatCount(containerSize: number, contentSize: number, min = 2): number {
  const floor = Math.max(1, Math.floor(min));
  if (!Number.isFinite(contentSize) || contentSize <= 0) {
    return floor;
  }
  if (!Number.isFinite(containerSize) || containerSize <= 0) {
    return floor;
  }
  const needed = Math.ceil(containerSize / contentSize) + 1;
  return Math.max(floor, needed);
}

/**
 * 基准动画的结束位移百分比。内容克隆 `repeat` 份等分排布在 track 上,
 * 跑完一「份」= 位移 track 总长的 `1/repeat`,即 `-100 / repeat`%(取负,朝 left/up);
 * 动画无限循环,结束瞬间回到 0% 而视觉因克隆补位无缝。`repeat <= 0` 视为 1 份(无位移,退化为静态)。
 */
export function trackTranslatePercent(repeat: number): number {
  const n = Math.max(1, Math.floor(repeat));
  return -100 / n;
}

/**
 * 是否应当滚动:在 reduced-motion / data-ms-motion=off 关停时,或显式暂停时,返回 false(静态展示)。
 * 把「该不该跑动画」的判定收进纯函数,组件侧只读结果决定是否给 track 加播放态。
 */
export function shouldAnimate(opts: { motionOff: boolean; paused: boolean }): boolean {
  return !opts.motionOff && !opts.paused;
}

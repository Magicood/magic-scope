/**
 * BackTop 纯逻辑 —— 零 React 依赖,可平移进 core(vue / web-component 等共用同一缓动与可见性语义)。
 * 缓动函数、某时刻滚动位置插值、可见性判定都是纯函数;组件只负责把它们接进 rAF / DOM。
 */

/**
 * easeInOutCubic —— 标准三次方缓入缓出。入参 t ∈ [0,1] 进度,出参 ∈ [0,1] 已缓动进度。
 * t<0.5 加速、t>=0.5 减速;t=0→0、t=1→1、t=0.5→0.5(对称)。越界自动夹取到 [0,1]。
 */
export function easeInOutCubic(t: number): number {
  if (t <= 0) {
    return 0;
  }
  if (t >= 1) {
    return 1;
  }
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * scrollStep —— 平滑回顶动画在某时刻应处的 scrollTop。
 * 从 `start` 出发、目标恒为 0(回顶),按 `elapsed`/`duration` 的缓动进度插值。
 * duration<=0 或 elapsed>=duration 直接返回 0(到顶);用于 rAF 每帧求当前位置,可单测。
 */
export function scrollStep(start: number, elapsed: number, duration: number): number {
  if (duration <= 0 || elapsed >= duration) {
    return 0;
  }
  if (elapsed <= 0) {
    return start;
  }
  const progress = easeInOutCubic(elapsed / duration);
  // 目标为 0:start * (1 - progress),progress→1 时归零
  return start * (1 - progress);
}

/**
 * shouldShow —— 根据当前滚动位置与阈值判定回顶钮是否应可见。
 * scrollTop 严格大于 visibilityHeight 才显示(与「滚过一屏才出现」直觉一致)。
 */
export function shouldShow(scrollTop: number, visibilityHeight: number): boolean {
  return scrollTop > visibilityHeight;
}

/** 读取滚动容器(Window 或元素)当前的 scrollTop;对 Window 取 scrollY/pageYOffset,SSR/缺失安全归 0。 */
export function getScrollTop(target: Window | HTMLElement): number {
  // 以「是否带 document」区分 Window 与元素:TS 能据此收窄类型,且不依赖全局 HTMLElement(SSR 安全)
  if ('document' in target) {
    return target.scrollY ?? target.pageYOffset ?? target.document?.documentElement?.scrollTop ?? 0;
  }
  return target.scrollTop;
}

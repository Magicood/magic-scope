/**
 * Carousel 纯逻辑 —— 零 React 依赖,可平移进 core。
 *
 * 索引推进 / 环绕 / 夹取、是否应自动播放,都是与具体框架无关的纯函数;
 * 组件只负责把它们接进状态 / DOM / 定时器。
 */

/**
 * 把任意索引夹取进 `[0, count - 1]`。`count <= 0` 时返回 0(空轮播无可定位项)。
 * 不环绕(`loop=false` 时用它);`noUncheckedIndexedAccess` 安全。
 */
export function clampIndex(index: number, count: number): number {
  if (count <= 0) {
    return 0;
  }
  if (index < 0) {
    return 0;
  }
  if (index > count - 1) {
    return count - 1;
  }
  return index;
}

/**
 * 下一张的索引。`loop=true` 时到末尾环绕回首张(取模),否则停在末尾。
 * `count <= 0` 返回 0。
 */
export function nextIndex(current: number, count: number, loop: boolean): number {
  if (count <= 0) {
    return 0;
  }
  if (current >= count - 1) {
    return loop ? 0 : count - 1;
  }
  return current + 1;
}

/**
 * 上一张的索引。`loop=true` 时到首张环绕回末张(取模),否则停在首张。
 * `count <= 0` 返回 0。
 */
export function prevIndex(current: number, count: number, loop: boolean): number {
  if (count <= 0) {
    return 0;
  }
  if (current <= 0) {
    return loop ? count - 1 : 0;
  }
  return current - 1;
}

/**
 * 跳转目标索引归一化:`loop=true` 时按取模环绕(可接受任意整数,负数也环绕),
 * 否则夹取进边界。供 goTo(index) 复用。
 */
export function resolveGoTo(index: number, count: number, loop: boolean): number {
  if (count <= 0) {
    return 0;
  }
  if (!loop) {
    return clampIndex(index, count);
  }
  // 取模环绕,处理负数:((i % n) + n) % n
  return ((index % count) + count) % count;
}

/**
 * 是否应启动自动播放:开启 autoplay、间隔为正、至少两张、且未因 reduced-motion / 暂停而停。
 * 把所有「该不该跑定时器」的判定收进一个纯函数,组件侧只读结果。
 */
export function shouldAutoplay(opts: {
  autoplay: boolean;
  interval: number;
  count: number;
  paused: boolean;
  motionOff: boolean;
}): boolean {
  const { autoplay, interval, count, paused, motionOff } = opts;
  if (!autoplay || paused || motionOff) {
    return false;
  }
  if (interval <= 0) {
    return false;
  }
  return count >= 2;
}

/**
 * 由一次指针拖拽位移判定该不该翻页、往哪翻。
 * `delta` 为主轴位移(正=向终点方向移动内容,即想看上一张;这里以「内容被拖动的位移」为口径），
 * 超过阈值 `threshold` 才翻;返回 -1 / 0 / +1 表示相对当前的步进方向。
 */
export function dragToStep(delta: number, threshold: number): -1 | 0 | 1 {
  if (Math.abs(delta) < threshold) {
    return 0;
  }
  // delta > 0:内容被向「正方向」拖(手指向右/向下),意味着想看上一张 → -1
  return delta > 0 ? -1 : 1;
}

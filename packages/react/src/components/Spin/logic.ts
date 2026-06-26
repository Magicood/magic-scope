/**
 * Spin 纯逻辑 —— 零 React 依赖,可平移进 core(vue / web-component 等共用同一防闪烁语义)。
 *
 * 唯一的可测纯函数是 `shouldShow`:把「spinning 标志 × delay 毫秒 × 自 spinning 置真起已过去的时长」
 * 折叠成「此刻是否应显示遮罩」的布尔判定。组件只负责把它接进定时器 / 状态:spinning 翻真时记下
 * 时间戳并安排一个 delay 后的重渲染,渲染时用本函数裁决,从而实现「短促加载不闪一下遮罩」。
 */

/**
 * shouldShow —— 给定 spinning、防闪烁延迟、与「spinning 已持续的时长」,判定遮罩此刻是否应显示。
 *
 * 规则:
 * - `spinning` 为 false → 永远不显示(立即收起,delay 只影响「显」不影响「隐」)。
 * - `spinning` 为 true 且 `delay` <= 0(或非有限值)→ 立即显示(无防闪烁)。
 * - `spinning` 为 true 且 `delay` > 0 → 仅当已持续时长 `elapsed` 达到 `delay` 才显示。
 *
 * `elapsed` 与 `delay` 同单位(毫秒);`elapsed` 为负/缺省按 0 处理(刚置真、还没等够)。
 * 纯函数、无副作用,便于单测覆盖各分支与边界。
 */
export function shouldShow(spinning: boolean, delay = 0, elapsed = 0): boolean {
  if (!spinning) {
    return false;
  }
  if (!Number.isFinite(delay) || delay <= 0) {
    return true;
  }
  const waited = Number.isFinite(elapsed) && elapsed > 0 ? elapsed : 0;
  return waited >= delay;
}

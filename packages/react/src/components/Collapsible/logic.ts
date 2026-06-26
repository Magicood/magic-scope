/**
 * Collapsible 纯逻辑层 —— 零 React 耦合,便于将来平移 core(vue / web component 共用)。
 *
 * Collapsible 是单项开合原语(无互斥分组,故不涉及集合运算)。可抽取的纯逻辑只有两块:
 * - 受控/非受控的「下一个 open 值」与「是否需要回写内部 state」判定;
 * - 由「目标 open / 是否 forceMount / 是否处于退出动画」推导 content 当前「该不该挂载」。
 * 组件层只负责把这些接进 React 状态 / DOM。
 */

/** 解析当前生效的 open 值:受控取外部 open,非受控取内部 state。 */
export function resolveOpen(controlledOpen: boolean | undefined, internalOpen: boolean): boolean {
  return controlledOpen !== undefined ? controlledOpen : internalOpen;
}

/**
 * 计算一次 toggle 的结果。
 * @returns next 切换后的目标 open;changed 是否真正发生变化(disabled 时恒不变,用于决定是否触发回调)。
 */
export function computeToggle(
  current: boolean,
  disabled: boolean,
): { next: boolean; changed: boolean } {
  if (disabled) {
    return { next: current, changed: false };
  }
  return { next: !current, changed: true };
}

/**
 * content 是否需要保留在 DOM 中(纯逻辑,供「条件挂载」策略的框架壳复用)。
 * - open:始终挂载;
 * - forceMount:即便收起也挂载(供 SEO / 动画 / 锚点);
 * - exiting:收起动画尚未播完,暂留以播放退场过渡。
 *
 * 注:React 壳现采用「Content 始终常驻挂载 + inert 切换」(对齐 Accordion,避免收起即卸载导致的
 * 动画被跳过 / 子树 state 丢失),故不再调用本函数;保留它作为框架无关逻辑层的可复用判定,
 * 供将来可能采用条件挂载策略的其它框架壳使用。
 */
export function shouldRenderContent(open: boolean, forceMount: boolean, exiting: boolean): boolean {
  return open || forceMount || exiting;
}

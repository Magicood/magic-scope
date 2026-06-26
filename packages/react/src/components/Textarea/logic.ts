/**
 * Textarea 纯逻辑 —— 不依赖 React,可将来原样平移进 `packages/core`。
 * autosize 高度计算 / 行数→像素换算 / 提交快捷键判定,都是纯函数,便于跨框架复用与单测。
 */

/** autosize 配置归一化后的形态。 */
export interface AutosizeRange {
  /** 最少行数(下限);未设则不限。 */
  minRows?: number | undefined;
  /** 最多行数(上限,超出滚动);未设则不限。 */
  maxRows?: number | undefined;
}

/**
 * 把 `autosize` prop 归一化:
 * - `false` / `undefined` → null(不启用);
 * - `true` → 空范围(随内容自由增长);
 * - 对象 → 原样(可含 minRows/maxRows)。
 */
export function resolveAutosize(
  autosize: boolean | AutosizeRange | undefined,
): AutosizeRange | null {
  if (autosize == null || autosize === false) return null;
  if (autosize === true) return {};
  return autosize;
}

/** 从元素计算上控制框模型的「每行高度」与「上下竖向内边距+边框」基线(像素)。 */
export interface BoxMetrics {
  /** 单行内容高度(line-height,像素)。 */
  lineHeight: number;
  /** 竖向 padding + border 之和(box-sizing:border-box 下 scrollHeight 已含 padding,
   *  此值用于 rows→高度 换算时补齐外框)。 */
  verticalExtra: number;
}

/**
 * 读取一个 textarea 的盒模型基线(行高、竖向额外量)。
 * 抽成纯函数(传入 getComputedStyle 的结果)便于测试:不直接摸 DOM。
 */
export function readBoxMetrics(style: {
  lineHeight: string;
  fontSize: string;
  paddingTop: string;
  paddingBottom: string;
  borderTopWidth: string;
  borderBottomWidth: string;
  boxSizing: string;
}): BoxMetrics {
  const fontSize = Number.parseFloat(style.fontSize) || 16;
  // line-height 为 "normal" 时按 1.5 倍字号估算(与 CSS 的 line-height:1.5 对齐)
  const lh = Number.parseFloat(style.lineHeight);
  const lineHeight = Number.isFinite(lh) ? lh : fontSize * 1.5;
  const pt = Number.parseFloat(style.paddingTop) || 0;
  const pb = Number.parseFloat(style.paddingBottom) || 0;
  const bt = Number.parseFloat(style.borderTopWidth) || 0;
  const bb = Number.parseFloat(style.borderBottomWidth) || 0;
  // border-box:scrollHeight 含 padding 不含 border,设 height 时要补 border
  const verticalExtra = style.boxSizing === 'border-box' ? bt + bb : -(pt + pb);
  return { lineHeight, verticalExtra };
}

/**
 * 计算 autosize 后应设置的高度(像素)。纯函数。
 * @param scrollHeight 元素当前 scrollHeight(已含 padding)。
 * @param metrics      盒模型基线。
 * @param range        归一化后的行数范围。
 * @returns `{ height, overflow }`:height 为目标像素高度;overflow 为是否触达 maxRows 需要滚动。
 */
export function computeAutosizeHeight(
  scrollHeight: number,
  metrics: BoxMetrics,
  range: AutosizeRange,
): { height: number; overflow: boolean } {
  const { lineHeight, verticalExtra } = metrics;
  let height = scrollHeight + Math.max(0, verticalExtra);
  let overflow = false;

  if (range.minRows != null) {
    const min = range.minRows * lineHeight + Math.max(0, verticalExtra);
    if (height < min) height = min;
  }
  if (range.maxRows != null) {
    const max = range.maxRows * lineHeight + Math.max(0, verticalExtra);
    if (height > max) {
      height = max;
      overflow = true;
    }
  }
  return { height: Math.ceil(height), overflow };
}

/** 提交快捷键的判定结果。 */
export interface SubmitIntent {
  /** 裸 Enter(无修饰键)。 */
  pressEnter: boolean;
  /** Cmd/Ctrl + Enter 组合(常用于「换行框里也能发送」)。 */
  submitShortcut: boolean;
}

/**
 * 从键盘事件的关键字段判定提交意图。纯函数(只读 key 与修饰键布尔,不碰 DOM)。
 * - IME 组合输入中(isComposing/keyCode 229)的 Enter 不算提交,避免误触发。
 */
export function detectSubmitIntent(e: {
  key: string;
  shiftKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  isComposing?: boolean;
  keyCode?: number;
}): SubmitIntent {
  const composing = e.isComposing || e.keyCode === 229;
  if (e.key !== 'Enter' || composing) {
    return { pressEnter: false, submitShortcut: false };
  }
  const submitShortcut = (e.metaKey || e.ctrlKey) && !e.altKey;
  const pressEnter = !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey;
  return { pressEnter, submitShortcut };
}

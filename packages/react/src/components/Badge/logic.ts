/**
 * Badge 纯逻辑层 —— 不依赖 React,便于将来平移进 packages/core。
 * 只处理数字徽标的「显示文本 / 是否隐藏」推导,无副作用、可单测。
 */

/** 数字徽标推导的入参。 */
export interface CountInput {
  /** 计数值。 */
  count: number;
  /** 上限,超出显示 `${max}+`。默认 99。 */
  max?: number | undefined;
  /** count 为 0 时是否仍显示。默认 false(0 时隐藏)。 */
  showZero?: boolean | undefined;
}

/** 数字徽标推导结果。 */
export interface CountResult {
  /** 应渲染的文本(如 "5"、"99+");hidden 为真时为空串。 */
  display: string;
  /** 是否应隐藏(count<=0 且未 showZero)。 */
  hidden: boolean;
  /** 是否触顶溢出(count>max)。 */
  overflow: boolean;
}

/**
 * 推导数字徽标的展示文本与可见性。纯函数。
 * - count<=0 且未 showZero → 隐藏;
 * - count>max → `${max}+`(默认 max=99);
 * - 非整数向下取整;NaN/负数按 0 处理。
 */
export const resolveCount = ({ count, max = 99, showZero = false }: CountInput): CountResult => {
  const safe = Number.isFinite(count) ? Math.floor(count) : 0;
  const normalized = safe < 0 ? 0 : safe;
  const ceiling = Number.isFinite(max) && max >= 0 ? Math.floor(max) : 99;

  if (normalized <= 0 && !showZero) {
    return { display: '', hidden: true, overflow: false };
  }

  const overflow = normalized > ceiling;
  return {
    display: overflow ? `${ceiling}+` : String(normalized),
    hidden: false,
    overflow,
  };
};

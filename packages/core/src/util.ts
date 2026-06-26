/**
 * 纯函数样板 —— 体检标的"零风险首批"(从组件抽出的零依赖纯函数)。
 * 先在 core 立一份带测试的权威实现,组件将来迁移时直接复用。
 */

/** 把数值夹到 [min, max](Progress / Slider 等共用)。 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 从姓名取首字母缩写(Avatar fallback)。取前 max 个单词的首字母大写;
 * 空串 / 全空白返回空串。
 */
export function getInitials(name: string, max = 2): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '';
  }
  return words
    .slice(0, max)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

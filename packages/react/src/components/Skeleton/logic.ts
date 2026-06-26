/**
 * Skeleton 纯逻辑(零 React 依赖,便于平移 core)。
 * 仅做尺寸归一化与多行末行宽度计算这类无副作用的纯函数。
 */

/** 把便捷尺寸值归一为 CSS 长度:number → px 字符串;字符串原样返回。 */
export function resolveDimension(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * 多行文本骨架末行宽度:依行数收窄,模拟段落自然换行的参差感。
 * 行数越多收得越克制(下限 55%),行数少时收得更明显。返回 CSS 百分比字符串。
 */
export function lastLineWidth(lineCount: number): string {
  if (lineCount <= 1) return '100%';
  // 2 行 → 60%,逐行抬升,封顶 80%,下限 55%。
  const pct = Math.min(80, Math.max(55, 40 + lineCount * 8));
  return `${pct}%`;
}

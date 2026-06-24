export type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

interface Stop {
  shade: Shade;
  mix: 'white' | 'black' | null;
  pct: number;
}

/** 各档位相对 seed 的混合配比(white = 提亮,black = 加深,null = seed 原色)。 */
const STOPS: Stop[] = [
  { shade: 50, mix: 'white', pct: 95 },
  { shade: 100, mix: 'white', pct: 90 },
  { shade: 200, mix: 'white', pct: 78 },
  { shade: 300, mix: 'white', pct: 58 },
  { shade: 400, mix: 'white', pct: 30 },
  { shade: 500, mix: null, pct: 0 },
  { shade: 600, mix: 'black', pct: 12 },
  { shade: 700, mix: 'black', pct: 26 },
  { shade: 800, mix: 'black', pct: 42 },
  { shade: 900, mix: 'black', pct: 58 },
  { shade: 950, mix: 'black', pct: 72 },
];

/**
 * 从单一 seed 色派生 11 阶(50→950),用 `color-mix(in oklch)` 在感知均匀空间混白/黑。
 * 返回值是 CSS 字符串(浏览器运行时计算),不引入 JS 色彩库 → 零运行时依赖。
 * 注:运行时派生不做对比度自愈(决策 7);需精确达标可用 build-time(culori)校准。
 */
export function deriveScale(seed: string): Record<Shade, string> {
  const out = {} as Record<Shade, string>;
  for (const { shade, mix, pct } of STOPS) {
    out[shade] = mix === null ? seed : `color-mix(in oklch, ${mix} ${pct}%, ${seed})`;
  }
  return out;
}

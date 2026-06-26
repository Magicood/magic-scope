/**
 * Watermark 纯逻辑 —— 零 React / 零 DOM 依赖,可平移进 core 或别的框架壳。
 *
 * 水印的「画布单元布局」是一段纯计算:给定 gap(平铺间距)、单元尺寸(width/height,可缺省由文本估算)、
 * 旋转角度,推导出离屏画布应该多大、文本/图片该画在哪个原点。组件只负责把这段结果接进真实 canvas 绘制。
 * 抽出来后既能单测(jsdom 不实现 canvas 绘制,逻辑层不依赖它),也为将来 vue/wc 壳复用同一套尺寸语义。
 */

/** 二元组(x, y),用于 gap / offset / 尺寸。 */
export type Vec2 = readonly [number, number];

/** 归一后的水印几何输入(组件把可选 props 兜底后传入)。 */
export interface WatermarkGeometryInput {
  /** 平铺间距 [x, y](两个相邻单元锚点的横/纵距离),像素。 */
  gap: Vec2;
  /** 单元内容尺寸 [w, h](文本/图片占位的逻辑像素)。 */
  content: Vec2;
  /** 旋转角度(度),正为顺时针。 */
  rotate: number;
}

/** 单元画布的计算结果(逻辑像素,未乘 devicePixelRatio)。 */
export interface WatermarkUnitLayout {
  /** 离屏画布宽(= gapX + contentW),平铺一个完整周期。 */
  canvasWidth: number;
  /** 离屏画布高(= gapY + contentH)。 */
  canvasHeight: number;
  /** 内容绘制中心点 x(画布内容区中心,旋转围绕此点)。 */
  centerX: number;
  /** 内容绘制中心点 y。 */
  centerY: number;
  /** 内容占位宽(透传,便于绘制时定位)。 */
  contentWidth: number;
  /** 内容占位高。 */
  contentHeight: number;
}

/** 把可能为负 / 非有限的数兜成非负有限值(布局尺寸不允许 NaN / 负)。 */
function clampNonNeg(value: number, fallback = 0): number {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

/**
 * 计算单元画布布局:画布 = 一个 content 占位 + 一份 gap,正好平铺成无缝重复。
 * content 居中放在「content + gap」区域里;旋转在绘制时围绕中心点做,故只需给出中心坐标。
 *
 * 纯函数、可单测;不触碰 canvas / DOM。所有入参做防御(负 / NaN 兜 0),保证产出可直接喂给 canvas。
 */
export function computeUnitLayout(input: WatermarkGeometryInput): WatermarkUnitLayout {
  const gapX = clampNonNeg(input.gap[0]);
  const gapY = clampNonNeg(input.gap[1]);
  const contentW = clampNonNeg(input.content[0]);
  const contentH = clampNonNeg(input.content[1]);

  const canvasWidth = gapX + contentW;
  const canvasHeight = gapY + contentH;

  return {
    canvasWidth,
    canvasHeight,
    centerX: canvasWidth / 2,
    centerY: canvasHeight / 2,
    contentWidth: contentW,
    contentHeight: contentH,
  };
}

/**
 * 估算多行文本占位尺寸(在拿不到 canvas measureText 的环境 / 初次渲染时的保守估算)。
 * 宽 ≈ 最长行字符数 × 字号 × 经验系数(0.6,半角近似);高 ≈ 行数 × 行高。
 * 真有 canvas 时组件会用 measureText 精确测量覆盖此值,这里只兜底,保证 SSR / 无 canvas 也有合理布局。
 */
export function estimateTextSize(
  lines: readonly string[],
  fontSize: number,
  lineHeight = fontSize * 1.4,
): Vec2 {
  const safeFont = clampNonNeg(fontSize, 16);
  const safeLine = clampNonNeg(lineHeight, safeFont * 1.4);
  let maxChars = 0;
  for (const line of lines) {
    if (line.length > maxChars) maxChars = line.length;
  }
  const width = Math.ceil(maxChars * safeFont * 0.6);
  const height = Math.ceil(Math.max(lines.length, 1) * safeLine);
  return [width, height];
}

/** 把 content prop(string | string[] | undefined)归一为「行数组」(过滤无内容)。 */
export function toLines(content: string | readonly string[] | undefined): string[] {
  if (content == null) return [];
  const arr = Array.isArray(content) ? content : [content as string];
  return arr.map((s) => String(s));
}

/**
 * 把 [x, y] 形态的可选 prop 兜底成确定二元组。传 undefined / 非数组 / 元素非有限数时回退 fallback。
 * `noUncheckedIndexedAccess` 安全:逐元素判空。
 */
export function normalizeVec2(value: readonly [number, number] | undefined, fallback: Vec2): Vec2 {
  if (value == null) return fallback;
  const x = value[0];
  const y = value[1];
  return [Number.isFinite(x) ? x : fallback[0], Number.isFinite(y) ? y : fallback[1]];
}

/** 拼接类名(过滤假值)。局部自带,保持零跨组件耦合。 */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

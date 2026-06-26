/**
 * Image 纯逻辑 —— 零 React 依赖,可平移进 core。
 *
 * 两类纯算法:
 * 1. 预览灯箱的「变换状态机」—— 缩放 / 旋转的步进与夹取(nextZoom / nextRotate / clampZoom),
 *    组件层只持有 { zoom, rotate } 状态并把用户操作转交给这些纯函数,渲染时拼成 transform。
 * 2. 主图来源回退链解析(resolveSrc)—— 主 src 失败后按 fallback 链逐级降级,
 *    组件层只记录「当前失败到第几级」的索引,由本函数决定该显示哪个 src / 是否进入错误态。
 */

/** 缩放夹取的边界与步进常量(导出便于组件层显示「是否已到极限」并禁用按钮)。 */
export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 4;
export const ZOOM_STEP = 0.25;
/** 旋转步进(度)。正负号由调用方决定方向。 */
export const ROTATE_STEP = 90;

/** 把任意缩放值夹取到 [ZOOM_MIN, ZOOM_MAX];非有限数(NaN/Infinity)回落到 1(还原态)。 */
export function clampZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) {
    return 1;
  }
  if (zoom < ZOOM_MIN) {
    return ZOOM_MIN;
  }
  if (zoom > ZOOM_MAX) {
    return ZOOM_MAX;
  }
  return zoom;
}

/**
 * 在当前缩放上叠加一步并夹取。
 * @param zoom  当前缩放
 * @param direction  +1 放大 / -1 缩小(其它非零值按符号取步进方向)
 * @param step  自定义步进,默认 ZOOM_STEP
 */
export function nextZoom(zoom: number, direction: number, step: number = ZOOM_STEP): number {
  const base = Number.isFinite(zoom) ? zoom : 1;
  const sign = direction > 0 ? 1 : direction < 0 ? -1 : 0;
  // 用 toFixed 消除浮点累积误差(0.1+0.2 类),保留两位足够覆盖 0.25 步进
  const raw = base + sign * Math.abs(step);
  const rounded = Math.round(raw * 100) / 100;
  return clampZoom(rounded);
}

/**
 * 旋转角步进并归一到 [0, 360)。
 * @param rotate 当前角度
 * @param direction +1 顺时针 / -1 逆时针
 * @param step 步进角度,默认 ROTATE_STEP(90°)
 */
export function nextRotate(rotate: number, direction: number, step: number = ROTATE_STEP): number {
  const base = Number.isFinite(rotate) ? rotate : 0;
  const sign = direction > 0 ? 1 : direction < 0 ? -1 : 0;
  const raw = base + sign * Math.abs(step);
  // 归一到 [0, 360):JS % 对负数会留负号,+360 再取模消除
  const normalized = ((raw % 360) + 360) % 360;
  return normalized;
}

/** 预览变换的完整状态(组件层持有,渲染时由 transformString 拼接)。 */
export interface PreviewTransform {
  zoom: number;
  rotate: number;
}

/** 还原态(缩放 1、旋转 0)。 */
export const IDENTITY_TRANSFORM: PreviewTransform = { zoom: 1, rotate: 0 };

/** 把变换状态拼成 CSS transform 串(scale + rotate)。zoom 先夹取,rotate 直接用。 */
export function transformString({ zoom, rotate }: PreviewTransform): string {
  return `scale(${clampZoom(zoom)}) rotate(${rotate}deg)`;
}

/** 是否处于「未变换」的还原态(决定是否禁用「还原」按钮)。 */
export function isIdentityTransform({ zoom, rotate }: PreviewTransform): boolean {
  return clampZoom(zoom) === 1 && ((rotate % 360) + 360) % 360 === 0;
}

/**
 * 来源回退链解析的结果。
 * - `src`:当前应渲染的图片地址;若已耗尽所有候选则为 `null`(组件进入错误态)。
 * - `errored`:true 表示主图与所有 fallback 均失败,应显示错误占位。
 */
export interface ResolvedSrc {
  src: string | null;
  errored: boolean;
}

/**
 * 按「主 src + fallback 链」与「已失败级数」解析当前应展示的来源。
 *
 * 设计:组件层不直接换 src,而是维护一个「失败计数」failedCount(每次 <img> onError +1),
 * 把它连同候选链交给本纯函数,由它决定当前 src / 是否到达错误态。这样回退逻辑可单测、可平移。
 *
 * @param src 主图地址(可为空 —— 直接进错误态)
 * @param fallbacks 主图失败后依次尝试的备用地址链(按顺序)
 * @param failedCount 累计失败次数(0 = 还没失败,用主图)
 */
export function resolveSrc(
  src: string | undefined,
  fallbacks: readonly string[] | undefined,
  failedCount: number,
): ResolvedSrc {
  // 候选链:主图在前,fallback 依次在后;过滤掉空串/空白
  const chain = [src, ...(fallbacks ?? [])].filter(
    (s): s is string => typeof s === 'string' && s.trim() !== '',
  );

  if (chain.length === 0) {
    return { src: null, errored: true };
  }

  const index = Math.max(0, Math.trunc(failedCount));
  if (index >= chain.length) {
    // 所有候选都失败了 —— 错误态
    return { src: null, errored: true };
  }
  // chain[index] 在 noUncheckedIndexedAccess 下是 string | undefined,上面已确保 index 合法
  const current = chain[index];
  return { src: current ?? null, errored: current == null };
}

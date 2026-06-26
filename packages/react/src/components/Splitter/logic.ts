/**
 * Splitter 纯逻辑 —— 零 React 依赖,可平移进 `packages/core`(vue / web-component 共用同一套分栏数值语义)。
 * 只做「拖拽时把 delta 分摊到 gutter 两侧面板、夹取 min/max、保证总和守恒」与「尺寸规整 / 归一」,
 * 不碰任何 DOM / 渲染 / React 状态。所有尺寸用同一单位(像素或百分比),由调用方统一。
 */

/** 单个面板的尺寸约束(与尺寸同单位:px 或 %)。两端均可缺省(视作无界)。 */
export interface PanelConstraint {
  /** 下限(同单位)。缺省视作 0。 */
  min?: number | undefined;
  /** 上限(同单位)。缺省视作正无穷。 */
  max?: number | undefined;
  /** 是否可折叠到 0(折叠态允许突破 min 到 0)。仅 normalize 时参考,resize 不主动折叠。 */
  collapsible?: boolean | undefined;
}

const lowerBound = (c: PanelConstraint | undefined): number =>
  c && typeof c.min === 'number' && Number.isFinite(c.min) ? Math.max(0, c.min) : 0;

const upperBound = (c: PanelConstraint | undefined): number =>
  c && typeof c.max === 'number' && Number.isFinite(c.max) ? c.max : Number.POSITIVE_INFINITY;

/** 把单个值夹到 [min, max](容错 max<min 时取 min)。 */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * 拖动 `gutterIndex`(它分隔面板 i 与 i+1)时,把 `deltaPx` 从一侧搬到另一侧:
 * 左侧面板 i 加 delta、右侧面板 i+1 减 delta(总和守恒)。两侧都各自夹到自己的 [min, max],
 * 任一侧被夹住时,真正生效的位移取「两侧都能接受」的较小绝对值,保证两块尺寸之和恒定不变。
 *
 * @param sizes        当前各面板尺寸(像素或百分比,与 constraints / delta 同单位)。
 * @param gutterIndex  分隔条索引,等于其左侧面板索引(有效范围 0..sizes.length-2)。
 * @param deltaPx      位移量(正 = gutter 右移 / 下移,左侧变大;同单位)。
 * @param _containerPx 容器总尺寸,保留参数以兼容百分比换算调用方(本函数按同单位直接运算)。
 * @param constraints  各面板约束;缺省项视作 [0, +∞]。
 * @returns 新的 sizes(新数组,不改原数组);非法入参时原样返回拷贝。
 */
export function resizePanels(
  sizes: readonly number[],
  gutterIndex: number,
  deltaPx: number,
  _containerPx: number,
  constraints: readonly PanelConstraint[] = [],
): number[] {
  const next = [...sizes];
  const i = gutterIndex;
  const j = gutterIndex + 1;
  // 非法 gutter / 越界 / NaN delta:不动。
  if (i < 0 || j >= next.length || !Number.isFinite(deltaPx) || deltaPx === 0) {
    return next;
  }
  const aSize = next[i];
  const bSize = next[j];
  if (aSize === undefined || bSize === undefined) {
    return next;
  }

  const aMin = lowerBound(constraints[i]);
  const aMax = upperBound(constraints[i]);
  const bMin = lowerBound(constraints[j]);
  const bMax = upperBound(constraints[j]);

  // 左侧 a 想要的目标值(夹到 a 的界内),换算出 a 实际能接受的位移。
  const aTarget = clamp(aSize + deltaPx, aMin, aMax);
  const aAllowed = aTarget - aSize;
  // 右侧 b 反向变化,同样夹界,换算出 b 能接受的位移(以 a 视角的符号表示)。
  const bTarget = clamp(bSize - deltaPx, bMin, bMax);
  const bAllowed = bSize - bTarget;

  // 取两侧都能吃下的位移(同号时取绝对值更小者),保证 a+b 守恒。
  let applied: number;
  if (deltaPx > 0) {
    applied = Math.min(aAllowed, bAllowed);
    if (applied < 0) applied = 0;
  } else {
    applied = Math.max(aAllowed, bAllowed);
    if (applied > 0) applied = 0;
  }

  next[i] = aSize + applied;
  next[j] = bSize - applied;
  return next;
}

/**
 * 规整一组尺寸到目标总量(像素或百分比):
 * - 先把每块夹到自己的 [min, max];
 * - 再把「夹取后的总和」与 `total` 的差额,按各块可伸缩余量比例摊回去(多了往里收、少了往外放),
 *   迭代直到收敛或无可调整块,尽量贴近 total 且不破坏 min/max。
 * 用于初始化(把 defaultSize / 等分铺满容器)与容器尺寸变化后的再平衡。
 *
 * @param sizes       原始尺寸(可为 0 / 负 / NaN,会被夹正)。
 * @param total       目标总量(<=0 时退化为全 0)。
 * @param constraints 各面板约束;缺省项视作 [0, +∞]。
 */
export function normalizeSizes(
  sizes: readonly number[],
  total: number,
  constraints: readonly PanelConstraint[] = [],
): number[] {
  const n = sizes.length;
  if (n === 0) return [];
  if (!(total > 0)) return new Array(n).fill(0);

  const mins = sizes.map((_, idx) => lowerBound(constraints[idx]));
  const maxs = sizes.map((_, idx) => upperBound(constraints[idx]));

  // 起点:把每块夹到界内(NaN / 负 → 夹到 min)。
  const out = sizes.map((s, idx) => {
    const base = Number.isFinite(s) ? (s as number) : (mins[idx] as number);
    return clamp(base, mins[idx] as number, maxs[idx] as number);
  });

  // 按差额方向迭代分摊,最多 n+1 轮足够收敛(每轮至少夹定一块)。
  for (let pass = 0; pass <= n; pass++) {
    const sum = out.reduce((a, b) => a + b, 0);
    const diff = total - sum;
    if (Math.abs(diff) < 1e-6) break;

    // 各块在所需方向上的剩余余量:放大看离上界多远、缩小看离下界多远。
    const room =
      diff > 0
        ? out.map((v, idx) => (maxs[idx] as number) - v)
        : out.map((v, idx) => v - (mins[idx] as number));

    // 上界为 +∞(无 max)时余量是无限的:这些块视作「弹性块」,按均分吸收差额,
    // 避免 ∞/∞ 产生 NaN。否则按有限余量比例分摊。
    const flexibleIdx: number[] = [];
    let finiteRoom = 0;
    let hasInfinite = false;
    for (let idx = 0; idx < n; idx++) {
      const r = room[idx] as number;
      if (r > 0) {
        flexibleIdx.push(idx);
        if (Number.isFinite(r)) finiteRoom += r;
        else hasInfinite = true;
      }
    }
    if (flexibleIdx.length === 0) break;

    if (hasInfinite || finiteRoom <= 0) {
      // 含无限余量(或有限余量为 0 但仍有可调块):在弹性块间均分差额。
      const share = diff / flexibleIdx.length;
      for (const idx of flexibleIdx) {
        out[idx] = clamp((out[idx] as number) + share, mins[idx] as number, maxs[idx] as number);
      }
    } else {
      for (const idx of flexibleIdx) {
        const r = room[idx] as number;
        out[idx] = clamp(
          (out[idx] as number) + diff * (r / finiteRoom),
          mins[idx] as number,
          maxs[idx] as number,
        );
      }
    }
  }
  return out;
}

/** 把像素尺寸数组换算为占总量的百分比(total<=0 时全 0)。供受控/展示层取百分比表达。 */
export function sizesToPercents(sizes: readonly number[], total: number): number[] {
  if (!(total > 0)) return sizes.map(() => 0);
  return sizes.map((s) => (s / total) * 100);
}

/**
 * 把可能是百分比(0–100,带 % 语义)或像素的「约束/默认值」解析为像素。
 * 入参形如 80(px)或 '30%'(百分比)或 '120px';非法返回 undefined。
 */
export function resolveLength(
  value: number | string | undefined,
  containerPx: number,
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  const trimmed = value.trim();
  if (trimmed.endsWith('%')) {
    const pct = Number.parseFloat(trimmed);
    return Number.isFinite(pct) ? (pct / 100) * containerPx : undefined;
  }
  const px = Number.parseFloat(trimmed);
  return Number.isFinite(px) ? px : undefined;
}

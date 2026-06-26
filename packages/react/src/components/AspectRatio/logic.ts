/**
 * AspectRatio 纯逻辑(零 React 依赖,便于平移 core)。
 *
 * 把「ratio 单值 / 断点对象」「object-fit / object-position」这类入参,归一为
 * 一组 inline CSS 变量(交给静态 CSS 的 @media 断点消费)+ 工具类名。全是无副作用纯函数,可单测。
 *
 * 响应式实现要点(对齐 device.css / breakpoints 的「构建期常量、@media 里 var() 不生效」约束):
 * - 比例值经 CSS 变量 `--ms-ar-ratio` 驱动样式(`aspect-ratio: var(--ms-ar-ratio)`),变量值本身可由 var() 替换;
 * - 断点对象的每一档写成独立变量 `--ms-ar-ratio-<bp>`,静态 CSS 在对应 `@media (min-width)` 内把
 *   `--ms-ar-ratio` 重指到该档变量。条件里不出现 var(),只在「值」里出现,故合法且零运行时。
 */

/** 视口断点序(rem 字面量与 @magic-scope/tokens 的 breakpoints.viewport 对齐;此处复制为常量以保零依赖)。 */
export type AspectBreakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** 断点 → 最小宽度(rem),用于文档/测试断言;真正的媒体查询在 CSS 里静态展开。 */
export const ASPECT_BREAKPOINTS: Record<Exclude<AspectBreakpoint, 'base'>, string> = {
  sm: '30rem',
  md: '48rem',
  lg: '64rem',
  xl: '80rem',
  '2xl': '96rem',
};

/** ratio 取值:数字(如 16 / 9、1、4 / 3)或 `"16/9"` 这类比值字符串。 */
export type RatioValue = number | string;

/** ratio 响应式入参:单值,或按断点覆盖的对象(base 必填语义上即默认档)。 */
export type ResponsiveRatio = RatioValue | Partial<Record<AspectBreakpoint, RatioValue>>;

/**
 * 把单个 ratio 值归一为合法的 CSS `aspect-ratio` 值:
 * - 数字 → 原样(`16/9 === 1.777…`,CSS 接受数值比例);非有限/<=0 视为无效返回 undefined;
 * - 字符串:`"16/9"` / `"16 / 9"` 透传(CSS 原生支持 `<number> / <number>`),纯数字串转数值校验。
 */
export function normalizeRatio(value: RatioValue | undefined): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? String(value) : undefined;
  }
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  // "16/9" 或 "16 / 9":拆两段都为正有限数才合法
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/').map((p) => Number(p.trim()));
    if (parts.length === 2) {
      const [w, h] = parts as [number, number];
      if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
        return `${w} / ${h}`;
      }
    }
    return undefined;
  }
  // 纯数字字符串
  const num = Number(trimmed);
  return Number.isFinite(num) && num > 0 ? String(num) : undefined;
}

/** ratio 是否为断点对象(而非单值)。 */
export function isResponsiveRatio(
  value: ResponsiveRatio | undefined,
): value is Partial<Record<AspectBreakpoint, RatioValue>> {
  return value != null && typeof value === 'object';
}

/**
 * 把 ratio 入参解析为 inline CSS 变量集:
 * - 单值 → `{ '--ms-ar-ratio': '16/9' }`;
 * - 断点对象 → base 写 `--ms-ar-ratio`,其余档写 `--ms-ar-ratio-<bp>`,由 CSS @media 消费。
 *
 * 任一档非法(NaN/<=0)被跳过;无任何合法值时返回空对象(CSS 侧有默认比例兜底)。
 */
export function resolveRatioVars(value: ResponsiveRatio | undefined): Record<string, string> {
  const vars: Record<string, string> = {};
  if (value == null) return vars;

  if (!isResponsiveRatio(value)) {
    const base = normalizeRatio(value);
    if (base != null) vars['--ms-ar-ratio'] = base;
    return vars;
  }

  for (const bp of ['base', 'sm', 'md', 'lg', 'xl', '2xl'] as const) {
    const raw = value[bp];
    if (raw == null) continue;
    const norm = normalizeRatio(raw);
    if (norm == null) continue;
    if (bp === 'base') vars['--ms-ar-ratio'] = norm;
    else vars[`--ms-ar-ratio-${bp}`] = norm;
  }
  return vars;
}

/** 哪些断点档被实际指定(用于挂 `data-ms-ar-bp-*` 类名/属性,让静态 CSS 仅对存在档生效)。 */
export function activeRatioBreakpoints(value: ResponsiveRatio | undefined): AspectBreakpoint[] {
  if (!isResponsiveRatio(value)) return [];
  const out: AspectBreakpoint[] = [];
  for (const bp of ['sm', 'md', 'lg', 'xl', '2xl'] as const) {
    if (value[bp] != null && normalizeRatio(value[bp]) != null) out.push(bp);
  }
  return out;
}

/** object-fit 档(媒体子内容如何填充):cover 裁剪铺满 / contain 完整可见 / fill 拉伸 / none / scale-down。 */
export type ObjectFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

/** 拼接类名(过滤假值)。各组件局部自带,保持零跨组件耦合。 */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

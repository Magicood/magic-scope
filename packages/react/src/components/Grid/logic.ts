/**
 * Grid 纯逻辑层(零 React) —— 把「单值 | 响应式断点对象」解析成一组 CSS 自定义属性。
 *
 * 设计动机(对齐 device.css / breakpoints 真相源):
 * - CSS 的 `@media` 条件里 `var()` 不生效,无法在运行时用变量驱动断点条件;
 *   故响应式不在条件上做文章,而是「每个断点各写一个 CSS 变量」,由 Grid.css 里
 *   静态的 `@media`/`@container` 块做移动优先级联(fallback 链)。本文件只负责把
 *   断点对象摊成 `--ms-grid-<prop>-<bp>` 变量集合,可单测、可平移到其它框架(Vue/WC)。
 * - 断点名直接复用 @magic-scope/tokens 的视口断点(base/sm/md/lg/xl/2xl),不另造一套。
 *
 * 纯函数、无副作用:输入 props 值,输出 `Record<string, string>` 形态的 style 变量片段。
 */

/** 视口断点档(对齐 tokens breakpoints.viewport;base = 无媒体查询的基线)。 */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** 断点顺序(移动优先级联依赖此序;Grid.css 的 @media 顺序须与此一致)。 */
export const BREAKPOINTS: readonly Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];

/** 响应式值:单值,或按断点给值的对象(部分断点可缺省,缺省走级联继承)。 */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

/** 间距档位:tokens scale.space 暴露的索引(映射到 --ms-space-N),或任意 CSS 长度字符串。 */
export type SpaceScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
export type SpaceValue = SpaceScale | (string & {});

/** scale.space 暴露的离散档位(无变量的档位回退到 calc 推导,避免 token 缺口)。 */
const SPACE_SCALE_STEPS = new Set([0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16]);

/** 判断是否为响应式断点对象(而非单值)。null/数组/字符串/数字均视为单值。 */
export function isResponsiveObject<T>(
  value: Responsive<T> | undefined,
): value is Partial<Record<Breakpoint, T>> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    // 仅当至少含一个合法断点键才认作响应式对象
    BREAKPOINTS.some((bp) => bp in (value as Record<string, unknown>))
  );
}

/** 把任意响应式值归一成 `断点 -> 值` 的稀疏映射(单值落到 base)。 */
export function normalizeResponsive<T>(
  value: Responsive<T> | undefined,
): Partial<Record<Breakpoint, T>> {
  if (value === undefined) return {};
  if (isResponsiveObject(value)) return value;
  return { base: value as T };
}

/** 间距值 -> CSS 长度(数字档位走 --ms-space-N,缺口档位用 calc 推导,字符串原样)。 */
export function resolveSpace(value: SpaceValue): string {
  if (typeof value === 'number') {
    if (value === 0) return '0';
    if (SPACE_SCALE_STEPS.has(value)) return `var(--ms-space-${value})`;
    // 不在离散档位上(理论上类型已收口,运行时兜底):按 0.25rem 步长推导
    return `calc(${value} * 0.25rem)`;
  }
  return value;
}

/**
 * columns 解析:
 * - number  -> repeat(n, minmax(0, 1fr))(minmax(0,...) 防内容撑破列、保证等宽)
 * - string  -> 原样作为 grid-template-columns(如 "1fr auto 2fr" / "repeat(3, 100px)")
 */
export function resolveColumns(value: number | string): string {
  if (typeof value === 'number') {
    return `repeat(${value}, minmax(0, 1fr))`;
  }
  return value;
}

/** minChildWidth -> 自适应列(auto-fit 折行,每列至少 minChildWidth、最多均分 1fr)。 */
export function resolveMinChildWidth(value: SpaceValue): string {
  const w = resolveSpace(value);
  // min(100%, w) 防容器比单列还窄时溢出
  return `repeat(auto-fit, minmax(min(100%, ${w}), 1fr))`;
}

/** align/justify 关键字 -> 对应 grid 对齐值(直接透传合法关键字)。 */
export type AlignValue = 'start' | 'end' | 'center' | 'stretch' | 'baseline';
export type DistributeValue =
  | 'start'
  | 'end'
  | 'center'
  | 'stretch'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

/**
 * 把一个响应式属性摊成 `--ms-grid-<key>-<bp>` 变量集合。
 * resolver 把每档原始值转成最终 CSS 值;只为「实际提供的断点」写变量(级联在 CSS 里做)。
 */
export function spreadResponsive<T>(
  key: string,
  value: Responsive<T> | undefined,
  resolver: (v: T) => string,
): Record<string, string> {
  const map = normalizeResponsive(value);
  const out: Record<string, string> = {};
  for (const bp of BREAKPOINTS) {
    const v = map[bp];
    if (v !== undefined) {
      out[`--ms-grid-${key}-${bp}`] = resolver(v);
    }
  }
  return out;
}

/** Grid.Item 的跨度/定位值:数字(跨 n 列/行 或 起始线),或 "auto" / "span N" 等原生关键字。 */
export type GridLineValue = number | 'auto' | (string & {});

/** colSpan/rowSpan -> grid-column/row 的 span 值。 */
export function resolveSpan(value: GridLineValue): string {
  if (typeof value === 'number') return `span ${value}`;
  return value;
}

/** colStart/rowStart -> 起始网格线。 */
export function resolveStart(value: GridLineValue): string {
  return typeof value === 'number' ? String(value) : value;
}

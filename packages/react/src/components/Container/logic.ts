/**
 * Container 纯逻辑(零 React) —— 把 size / padding 的关键字档与「断点对象」解析成
 * CSS 自定义属性。可单测、可平移到其它框架内核(对齐 CLAUDE.md 多框架对等约定)。
 *
 * 响应式机制:CSS 的 @media 条件里 var() 不生效,故断点宽度由 breakpoints.ts 常量
 * 在 Container.css 里静态展开。本文件只负责把「断点对象」的每一档值写成对应的
 * --ms-container-px-{bp} 自定义属性,由 CSS 的媒体查询逐级消费、覆盖基础值。
 */

/** 视口断点键(对齐 @magic-scope/tokens 的 breakpoints.viewport,base 为无前缀的最小档)。 */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** 断点顺序(从小到大,base 最先)。CSS 媒体查询按此序逐级覆盖。 */
export const BREAKPOINT_ORDER: readonly Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];

/** 某属性的响应式取值:单值,或按断点给的对象(缺省档继承更小断点)。 */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

/** 间距档:0..16 的 space token 索引(映射 --ms-space-*),或任意 CSS 长度字符串。 */
export type SpaceToken = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | (string & {});

/** size 关键字 → 最大行内尺寸 token(对齐 breakpoints.viewport 宽度)。 */
export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | (string & {});

/** size 关键字 → max-inline-size。full 不限宽;非关键字视为自定义长度,原样透传。 */
const SIZE_MAP: Record<string, string> = {
  sm: '30rem',
  md: '48rem',
  lg: '64rem',
  xl: '80rem',
  full: 'none',
};

const isSizeKeyword = (s: string): boolean => s in SIZE_MAP;

/** 把 size 解析为 max-inline-size 的 CSS 值(关键字查表,自定义长度原样)。 */
export function resolveSize(size: ContainerSize): string {
  return typeof size === 'string' && isSizeKeyword(size)
    ? (SIZE_MAP[size] as string)
    : String(size);
}

/**
 * 把一个 space 档解析为 CSS 长度:
 * - 数字(含 0):映射到 var(--ms-space-N),随密度缩放;0 直接 0;
 * - 字符串:视为自定义 CSS 长度(如 '2rem' / 'clamp(...)'),原样透传。
 */
export function resolveSpace(value: SpaceToken): string {
  if (typeof value === 'number') {
    return value === 0 ? '0' : `calc(var(--ms-space-${value}) * var(--ms-density-scale, 1))`;
  }
  return value;
}

/** 判断是否为「断点对象」形式(用于把单值与响应式对象分流)。 */
function isResponsiveObject<T>(v: Responsive<T>): v is Partial<Record<Breakpoint, T>> {
  return typeof v === 'object' && v !== null;
}

/**
 * 把一个响应式属性解析成「CSS 变量名 → 值」映射。
 * 单值:只写 base 变量(`{varBase}`)。
 * 断点对象:base 写 `{varBase}`,其余断点写 `{varBase}-{bp}`,由 CSS 媒体查询消费。
 * 缺省的 base 用提供的 fallback(保证基础值总存在,避免变量未定义)。
 */
export function resolveResponsive<T>(
  value: Responsive<T> | undefined,
  varBase: string,
  resolve: (v: T) => string,
  fallback: T,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (value === undefined) {
    out[varBase] = resolve(fallback);
    return out;
  }
  if (!isResponsiveObject(value)) {
    out[varBase] = resolve(value);
    return out;
  }
  // 断点对象:base 缺省时回退到 fallback,保证基础变量永远有值。
  const base = value.base;
  out[varBase] = resolve(base !== undefined ? base : fallback);
  for (const bp of BREAKPOINT_ORDER) {
    if (bp === 'base') continue;
    const v = value[bp];
    if (v !== undefined) out[`${varBase}-${bp}`] = resolve(v);
  }
  return out;
}

/** 轻量 className 拼接(过滤假值)。本地实现,避免跨组件耦合。 */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

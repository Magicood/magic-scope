/**
 * Stack 纯逻辑层 —— 零 React 依赖,把「断点对象」props 解析成 CSS 变量映射。
 * 抽离于此是为了:① 可单测(无需渲染);② 可平移到 core / Vue / Web Component 薄壳,
 * 让多框架共享同一套响应式解析语义(对齐 CLAUDE.md 硬性约定 7「适配契约框架无关」)。
 *
 * 响应式实现思路:CSS 的 @media 条件里 var() 不生效,故无法在运行期改 @media 阈值。
 * 但「每个断点对应一个 CSS 变量槽位」是可行的 —— 这里把断点对象拍平成
 * `--ms-stack-<prop>`(base) 与 `--ms-stack-<prop>-<bp>`(各断点) 一组变量,
 * Stack.css 用静态 @media 在命中断点时把对应槽位的值升格为生效值(级联兜底)。
 */

/** 视口断点键(对齐 @magic-scope/tokens 的 breakpoints.viewport)。base 表示无媒体查询的默认值。 */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';

/** 断点对象:每个断点一个值,缺省断点向下继承(CSS 级联天然实现)。 */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

/** 间距 token 档(映射 --ms-space-*;0 = 无间距)。仅放实际 emit 成 CSS 变量的档位。 */
export type SpaceToken = 0 | 1 | 2 | 3 | 4 | 6 | 8;

export type StackDirection = 'vertical' | 'horizontal';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | 'stretch';
export type StackWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

/** 升序断点(base 在前,供生成稳定的变量键序)。 */
export const BREAKPOINTS: readonly Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl'] as const;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * 把「单值 或 断点对象」规整为 `Partial<Record<Breakpoint, T>>`。
 * 单值视作 `{ base: value }`。仅保留合法断点键。
 */
export function normalizeResponsive<T>(
  value: Responsive<T> | undefined,
): Partial<Record<Breakpoint, T>> {
  if (value == null) return {};
  if (isPlainObject(value)) {
    const out: Partial<Record<Breakpoint, T>> = {};
    for (const bp of BREAKPOINTS) {
      const v = (value as Partial<Record<Breakpoint, T>>)[bp];
      if (v !== undefined) out[bp] = v;
    }
    return out;
  }
  return { base: value as T };
}

/** space 档 → CSS 长度值(0 走字面 0,其余引用 token 变量)。 */
export function spaceVar(token: SpaceToken): string {
  return token === 0 ? '0' : `var(--ms-space-${token})`;
}

/** flexbox 对齐枚举 → CSS align-items / justify 关键字。 */
const ALIGN_MAP: Record<StackAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const JUSTIFY_MAP: Record<StackJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
  stretch: 'stretch',
};

/** direction → flex-direction(逻辑方向交给 CSS;RTL 由 row/column 在 writing-mode 下天然翻转)。 */
const DIRECTION_MAP: Record<StackDirection, string> = {
  vertical: 'column',
  horizontal: 'row',
};

const WRAP_MAP: Record<StackWrap, string> = {
  nowrap: 'nowrap',
  wrap: 'wrap',
  'wrap-reverse': 'wrap-reverse',
};

/**
 * 解析单个响应式属性为 CSS 变量键值对。
 * 产出形如 `{ '--ms-stack-gap': '...', '--ms-stack-gap-md': '...' }`。
 * @param prop CSS 变量短名(gap / dir / align / justify / wrap)
 * @param value 单值或断点对象
 * @param resolve 把档值转成 CSS 字符串(如 space 档 → var())
 */
export function resolveResponsiveVars<T>(
  prop: string,
  value: Responsive<T> | undefined,
  resolve: (v: T) => string,
): Record<string, string> {
  const map = normalizeResponsive(value);
  const out: Record<string, string> = {};
  for (const bp of BREAKPOINTS) {
    const v = map[bp];
    if (v === undefined) continue;
    const key = bp === 'base' ? `--ms-stack-${prop}` : `--ms-stack-${prop}-${bp}`;
    out[key] = resolve(v);
  }
  return out;
}

export interface StackStyleInput {
  direction?: Responsive<StackDirection>;
  gap?: Responsive<SpaceToken>;
  align?: Responsive<StackAlign>;
  justify?: Responsive<StackJustify>;
  wrap?: Responsive<StackWrap>;
}

/**
 * 把 Stack 的全部响应式 props 解析成一组 inline CSS 变量。
 * 这是组件 ↔ CSS 的唯一桥:组件只管把对象拍平成变量,断点级联完全由 Stack.css 的静态 @media 完成。
 */
export function buildStackVars(input: StackStyleInput): Record<string, string> {
  return {
    ...resolveResponsiveVars('dir', input.direction, (v) => DIRECTION_MAP[v]),
    ...resolveResponsiveVars('gap', input.gap, spaceVar),
    ...resolveResponsiveVars('align', input.align, (v) => ALIGN_MAP[v]),
    ...resolveResponsiveVars('justify', input.justify, (v) => JUSTIFY_MAP[v]),
    ...resolveResponsiveVars('wrap', input.wrap, (v) => WRAP_MAP[v]),
  };
}

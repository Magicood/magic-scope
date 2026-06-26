/**
 * Center 纯逻辑层 —— 零 React 依赖,可平移进 core / 给 vue·angular 薄壳复用。
 *
 * 只放「与渲染无关的派生计算」:断点对象解析成 CSS 变量、间距档映射到 token、
 * class 名拼装。组件层(Center.tsx)只把这些结果接到 JSX。
 *
 * 响应式策略(对齐 device.css「构建期常量注入」范式):
 * 断点对象的每一档值都写成一个带断点后缀的 CSS 变量(如 --ms-center-axis-md),
 * 配套 Center.css 在各 viewport 媒体查询里把「当前生效档」赋给真正消费的变量。
 * 这样 @media 条件用的是静态断点值(var() 在媒体查询条件里不生效),组件只产出变量。
 */

/** 居中轴:双轴 / 仅水平 / 仅垂直。决定 place-items 写法。 */
export type CenterAxis = 'both' | 'horizontal' | 'vertical';

/**
 * 间距档(映射到 @magic-scope/tokens 的 --ms-space-*)。
 * 仅列出 token 实际存在的档位(0/1/2/3/4/6/8),避免引用到未生成的变量。
 * 0 = 无间距;逃生舱:直接给 gap/padding 传任意 CSS 长度字符串。
 */
export type SpaceScale = 0 | 1 | 2 | 3 | 4 | 6 | 8;

/** 视口断点名(与 @magic-scope/tokens 的 breakpoints.viewport 对齐)。 */
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** 断点顺序(base 最先,其余按 min-width 升序;后者覆盖前者)。 */
export const BREAKPOINTS: readonly Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl'];

/**
 * 响应式取值:单值,或 `{ base, sm, md, lg, xl, 2xl }` 断点对象。
 * 单值等价于只填了 base 的对象。
 */
export type Responsive<T> = T | Partial<Record<'base' | Breakpoint, T>>;

const isFalse = (v: string | false | null | undefined): v is false | null | undefined =>
  v === false || v == null || v === '';

/** 拼 class:过滤掉 falsy 段,空格连接(与 List 的 cx 同语义,独立放逻辑层便于平移)。 */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter((p) => !isFalse(p)).join(' ');

/** 判断是否为断点对象(而非单值)。null/数组/非普通对象都视作单值。 */
const isResponsiveObject = <T>(
  value: Responsive<T>,
): value is Partial<Record<'base' | Breakpoint, T>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * 把响应式取值规整成 `[档位, 值]` 列表。
 * - 单值 → 只有 `base` 一档;
 * - 断点对象 → base 在前、其余按 BREAKPOINTS 顺序,跳过 undefined。
 */
export function expandResponsive<T>(
  value: Responsive<T> | undefined,
): Array<[bp: 'base' | Breakpoint, value: T]> {
  if (value === undefined) return [];
  if (!isResponsiveObject(value)) return [['base', value]];
  const out: Array<['base' | Breakpoint, T]> = [];
  if (value.base !== undefined) out.push(['base', value.base]);
  for (const bp of BREAKPOINTS) {
    const v = value[bp];
    if (v !== undefined) out.push([bp, v]);
  }
  return out;
}

/** 间距档 → token 表达式;0 给 0,其余引用 --ms-space-N。 */
export const spaceToken = (scale: SpaceScale): string =>
  scale === 0 ? '0' : `var(--ms-space-${scale})`;

/**
 * 把一个响应式 prop 解析成要注入根的 CSS 变量集合。
 * 变量名形如 `--ms-center-<key>`(base)与 `--ms-center-<key>-<bp>`(断点档),
 * 配套 Center.css 负责在媒体查询里逐档覆盖消费变量。
 *
 * @param key   变量短名(如 'axis' / 'gap' / 'pad' / 'minh')
 * @param value 响应式取值
 * @param toCss 把单档值转成 CSS 字面量(间距走 spaceToken,其余原样)
 */
export function responsiveVars<T>(
  key: string,
  value: Responsive<T> | undefined,
  toCss: (v: T) => string,
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [bp, v] of expandResponsive(value)) {
    const name = bp === 'base' ? `--ms-center-${key}` : `--ms-center-${key}-${bp}`;
    vars[name] = toCss(v);
  }
  return vars;
}

/** axis → place-items 的 CSS 值(双轴 center;单轴一边 center 一边 stretch 让另一向自然铺展)。 */
export const axisToPlaceItems = (axis: CenterAxis): string => {
  if (axis === 'horizontal') return 'stretch center';
  if (axis === 'vertical') return 'center stretch';
  return 'center center';
};

/** gap / padding 入参:间距档(映射 token)或任意 CSS 长度字符串(逃生舱)。 */
export type SpaceValue = SpaceScale | (string & {});

/** 解析 gap/padding 单档:数字走 token,字符串原样(逃生舱)。 */
export const resolveSpace = (v: SpaceValue): string =>
  typeof v === 'number' ? spaceToken(v as SpaceScale) : v;

/** minBlockSize 入参:数字(视为 token 档 → --ms-space-*?不,高度用原值)或 CSS 长度。 */
export type SizeValue = number | (string & {});

/** 解析高度单档:数字按 px(便捷),字符串原样(如 '100dvh' / 'var(--ms-viewport-h)')。 */
export const resolveSize = (v: SizeValue): string => (typeof v === 'number' ? `${v}px` : v);

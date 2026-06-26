/**
 * Flex 纯逻辑层 —— 零 React 依赖,把「单值 / 断点对象」属性解析成一组 inline CSS 变量。
 *
 * 为什么放这里:CSS 的 `@media` 条件里 `var()` 不生效(见 tokens/primitive/breakpoints.ts),
 * 故响应式不能靠运行时读 var,而是把每个断点的值写成「带断点后缀的 CSS 变量」(如
 * `--ms-flex-direction-md`),由 Flex.css 里预先展开的静态 @media 块逐级把后缀变量提升为
 * 生效变量(`--ms-flex-direction`)。本文件只负责「对象 → 变量字典」这一步,可单测、可平移到
 * 其它框架内核(Vue / Web Component 共用同一份解析)。
 */

/** 视口断点键(对齐 @magic-scope/tokens 的 breakpoints.viewport)。`base` 为无前缀基线。 */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** 除基线外、需要媒体查询覆盖的断点,顺序 = CSS 里 @media 的书写顺序(小→大,后者覆盖前者)。 */
export const RESPONSIVE_BREAKPOINTS = ['sm', 'md', 'lg', 'xl', '2xl'] as const;

/** 单值,或「断点 → 值」的响应式对象。值为 undefined 的断点会被跳过。 */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

/** 间距档:数字索引映射到 --ms-space-<n>(0..16,见 tokens scale.space),或直接给 CSS 长度串。 */
export type SpaceScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
export type GapValue = SpaceScale | (string & {});

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * 判断一个属性值是否为断点对象(而非单值)。
 * 单值含 string/number;断点对象是不带数组语义的纯对象。
 */
export function isResponsiveObject<T>(
  value: Responsive<T> | undefined,
): value is Partial<Record<Breakpoint, T>> {
  return isPlainObject(value);
}

/**
 * 把间距档转成 CSS 值:数字 → var(--ms-space-<n>);字符串原样返回(自定义长度逃生口)。
 * 注意:仅当数字落在 token 刻度内才走 var;其它数字按 px 兜底,避免静默丢值。
 */
const SPACE_STEPS = new Set([0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16]);
export function resolveGap(value: GapValue): string {
  if (typeof value === 'number') {
    return SPACE_STEPS.has(value) ? `var(--ms-space-${value})` : `${value}px`;
  }
  return value;
}

/**
 * 把单个属性的「单值 / 断点对象」展开成 CSS 变量字典。
 * - 基线(单值 或 base 键)写无后缀变量 `--${varBase}`;
 * - 其余断点写带后缀变量 `--${varBase}-${bp}`,由 CSS @media 块逐级提升。
 * @param varBase  变量基名(不含 `--` 前缀),如 `ms-flex-direction`
 * @param value    属性值
 * @param transform 值 → CSS 字符串的转换(默认 String)
 */
export function responsiveVars<T>(
  varBase: string,
  value: Responsive<T> | undefined,
  transform: (v: T) => string = (v) => String(v),
): Record<string, string> {
  const vars: Record<string, string> = {};
  if (value === undefined) return vars;

  if (isResponsiveObject<T>(value)) {
    if (value.base !== undefined) vars[`--${varBase}`] = transform(value.base);
    for (const bp of RESPONSIVE_BREAKPOINTS) {
      const v = value[bp];
      if (v !== undefined) vars[`--${varBase}-${bp}`] = transform(v);
    }
  } else {
    vars[`--${varBase}`] = transform(value);
  }
  return vars;
}

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | 'stretch';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse' | boolean;

/** align/justify 的简写 → CSS 关键字(start/end 走逻辑值 flex-start/flex-end,RTL 友好由 CSS 接管)。 */
const ALIGN_MAP: Record<FlexAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};
const JUSTIFY_MAP: Record<FlexJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
  stretch: 'stretch',
};

export const resolveAlign = (v: FlexAlign): string => ALIGN_MAP[v];
export const resolveJustify = (v: FlexJustify): string => JUSTIFY_MAP[v];
export const resolveWrap = (v: FlexWrap): string =>
  v === true ? 'wrap' : v === false ? 'nowrap' : v;
export const resolveDirection = (v: FlexDirection): string => v;

export interface FlexStyleInput {
  // 显式 | undefined:这些字段直接接收组件解构出的可选 prop(exactOptionalPropertyTypes 下需放行 undefined)
  direction?: Responsive<FlexDirection> | undefined;
  align?: Responsive<FlexAlign> | undefined;
  justify?: Responsive<FlexJustify> | undefined;
  wrap?: Responsive<FlexWrap> | undefined;
  gap?: Responsive<GapValue> | undefined;
  rowGap?: Responsive<GapValue> | undefined;
  columnGap?: Responsive<GapValue> | undefined;
}

/**
 * 汇总 Flex 全部布局属性 → 一份 inline CSS 变量字典(供 style 透传到根)。
 * CSS 侧的 .ms-flex 直接消费这些变量,媒体查询块负责把带后缀的变量提升为生效变量。
 */
export function buildFlexVars(input: FlexStyleInput): Record<string, string> {
  return {
    ...responsiveVars('ms-flex-direction', input.direction, resolveDirection),
    ...responsiveVars('ms-flex-align', input.align, resolveAlign),
    ...responsiveVars('ms-flex-justify', input.justify, resolveJustify),
    ...responsiveVars('ms-flex-wrap', input.wrap, resolveWrap),
    ...responsiveVars('ms-flex-gap', input.gap, resolveGap),
    ...responsiveVars('ms-flex-row-gap', input.rowGap, resolveGap),
    ...responsiveVars('ms-flex-column-gap', input.columnGap, resolveGap),
  };
}

export interface FlexItemStyleInput {
  // 显式 | undefined:同 FlexStyleInput,直接承接组件解构出的可选 prop
  grow?: number | boolean | undefined;
  shrink?: number | boolean | undefined;
  basis?: string | number | undefined;
  align?: FlexAlign | undefined;
  order?: number | undefined;
}

const toFlexNumber = (v: number | boolean): string =>
  v === true ? '1' : v === false ? '0' : String(v);

/** Flex.Item / item-级 prop 的 CSS 变量(item 不做响应式断点对象,保持轻量)。 */
export function buildFlexItemVars(input: FlexItemStyleInput): Record<string, string> {
  const vars: Record<string, string> = {};
  if (input.grow !== undefined) vars['--ms-flex-item-grow'] = toFlexNumber(input.grow);
  if (input.shrink !== undefined) vars['--ms-flex-item-shrink'] = toFlexNumber(input.shrink);
  if (input.basis !== undefined) {
    vars['--ms-flex-item-basis'] =
      typeof input.basis === 'number' ? `${input.basis}px` : input.basis;
  }
  if (input.align !== undefined) vars['--ms-flex-item-align'] = resolveAlign(input.align);
  if (input.order !== undefined) vars['--ms-flex-item-order'] = String(input.order);
  return vars;
}

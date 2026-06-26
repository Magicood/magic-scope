/**
 * ConfigProvider 纯逻辑(零 React)—— 把「全局设计开关 props」解析成根元素上的
 * `data-ms-*` 属性集合 + 默认值 context 值。抽到这里便于将来平移到其它框架
 * (vue / web component),各框架壳只做渲染与 context 注入。
 *
 * 架构是 CSS-first:density / motion / fx / tone 这些视觉开关全部经 data-ms-* 属性
 * 沿 CSS 级联下发(组件读祖先的 var(--ms-density-scale) / [data-ms-motion="off"] 等),
 * 不靠 JS prop 钻透。本文件只负责「props → data 属性」这层确定性映射。
 */

/** 密度档:控件高度 / 间距缩放(对应 device.css 的 [data-ms-density="*"])。 */
export type ConfigDensity = 'comfortable' | 'compact' | 'spacious';

/**
 * 动效档(对应 effects.css 的 [data-ms-motion="*"])。
 * 友好别名:`on` = full(满强度)、`reduced` = subtle(更克制)。
 */
export type ConfigMotion = 'on' | 'full' | 'subtle' | 'reduced' | 'off';

/**
 * 装饰发光档(对应 effects.css 的 [data-ms-fx="*"])。
 * 友好别名:`on` = full(满强度)。注意默认根基线是 0.6,介于 full(1)与 subtle(0.3)之间。
 */
export type ConfigFx = 'on' | 'full' | 'subtle' | 'off';

/** 全库统一 6 tone 槽位的语义色调名(与 Button/Alert/Text 同源)。 */
export type ConfigTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** 默认控件尺寸档,随 data-ms-density 缩放(供组件经 JS context 读默认值)。 */
export type ConfigSize = 'sm' | 'md' | 'lg';

/** motion 友好别名 → effects.css 实际 data 属性值。`on` 归一为 `full`、`reduced` 归一为 `subtle`。 */
const MOTION_ATTR: Record<ConfigMotion, 'full' | 'subtle' | 'off'> = {
  on: 'full',
  full: 'full',
  subtle: 'subtle',
  reduced: 'subtle',
  off: 'off',
};

/** fx 友好别名 → effects.css 实际 data 属性值。`on` 归一为 `full`。 */
const FX_ATTR: Record<ConfigFx, 'full' | 'subtle' | 'off'> = {
  on: 'full',
  full: 'full',
  subtle: 'subtle',
  off: 'off',
};

/** ConfigProvider 接受的全局开关入参(框架无关)。 */
export interface ConfigResolveInput {
  density?: ConfigDensity | undefined;
  motion?: ConfigMotion | undefined;
  fx?: ConfigFx | undefined;
  tone?: ConfigTone | undefined;
}

/**
 * 解析出根元素要落的 `data-ms-*` 属性集合(只含给定的开关,未给的不落属性 → 继承祖先 / 用根基线)。
 * 返回普通对象,React 壳直接展开到根元素,vue 壳用 v-bind,web component 壳用 setAttribute。
 */
export const resolveDataAttrs = (input: ConfigResolveInput): Record<string, string> => {
  const attrs: Record<string, string> = {};
  if (input.density != null) attrs['data-ms-density'] = input.density;
  if (input.motion != null) attrs['data-ms-motion'] = MOTION_ATTR[input.motion];
  if (input.fx != null) attrs['data-ms-fx'] = FX_ATTR[input.fx];
  if (input.tone != null) attrs['data-ms-tone'] = input.tone;
  return attrs;
};

/** 把 motion 友好别名归一到 effects.css 实际属性值(`on`→`full`、`reduced`→`subtle`)。 */
export const resolveMotionAttr = (motion: ConfigMotion): 'full' | 'subtle' | 'off' =>
  MOTION_ATTR[motion];

/** 把 fx 友好别名归一到 effects.css 实际属性值(`on`→`full`)。 */
export const resolveFxAttr = (fx: ConfigFx): 'full' | 'subtle' | 'off' => FX_ATTR[fx];

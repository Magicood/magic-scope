/**
 * Empty 纯逻辑 —— 零 React。预设插画名解析 + className 拼接工具。
 * 与 React 解耦,便于单测与将来平移 `packages/core`(各框架壳层复用同一套判定)。
 */

/** 内置插画预设名。`default` 信息更丰富(带文档/卡片轮廓),`simple` 极简(一根托盘线)。 */
export type EmptyPreset = 'default' | 'simple';

/** 尺寸档。随 data-ms-density 缩放(CSS 侧),此处仅作判定与默认插画边长基准。 */
export type EmptySize = 'sm' | 'md' | 'lg';

/** 全部合法预设名(运行时判定 image 是否为预设字符串用)。 */
export const EMPTY_PRESETS: readonly EmptyPreset[] = ['default', 'simple'];

/**
 * 判断 image 入参是否为「预设名字符串」(而非自定义 ReactNode)。
 * 纯函数:用于在渲染前把 string 入参分流到内置 SVG。
 */
export const isEmptyPreset = (value: unknown): value is EmptyPreset =>
  typeof value === 'string' && (EMPTY_PRESETS as readonly string[]).includes(value);

/**
 * 预设插画的视觉基准边长(px,viewBox 用)。size 缩放主要交给 CSS(密度联动),
 * 这里给 viewBox 一个稳定的内在比例基准,描边粗细据此推导。
 */
export const PRESET_VIEWBOX = 64;

/** 过滤空值并以空格连接 className(与全库其它组件一致的拼接范式)。 */
export const cx = (...parts: (string | false | null | undefined)[]): string =>
  parts.filter(Boolean).join(' ');

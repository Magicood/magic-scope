import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { composeRefs } from '../../utils/compose';
import {
  computeUnitLayout,
  cx,
  estimateTextSize,
  normalizeVec2,
  toLines,
  type Vec2,
} from './logic';

export type { Vec2 } from './logic';

/** classNames 槽位:对根容器与覆盖层做细粒度类名留口。 */
export interface WatermarkClassNames {
  /** 根容器(position:relative,包裹 children + 覆盖层)。 */
  root?: string | undefined;
  /** 平铺水印的覆盖层(绝对定位铺满、pointer-events:none)。 */
  overlay?: string | undefined;
}

export interface WatermarkProps extends Omit<ComponentPropsWithoutRef<'div'>, 'content'> {
  /** 水印文字;字符串单行,字符串数组多行(逐行叠放)。与 `image` 二选一,二者都给时 `image` 优先。 */
  content?: string | string[] | undefined;
  /** 水印图片 url(与 `content` 二选一,优先于 content)。图片按 `width`/`height` 绘制。 */
  image?: string | undefined;
  /** 单元内容宽(逻辑像素)。不传:文字按 measureText / 估算,图片默认 120。 */
  width?: number | undefined;
  /** 单元内容高(逻辑像素)。不传:文字按行数 × 行高,图片默认 64。 */
  height?: number | undefined;
  /** 旋转角(度,正为顺时针)。默认 -22。 */
  rotate?: number | undefined;
  /** 平铺间距 [x, y](像素)。默认 [100, 100]。 */
  gap?: [number, number] | undefined;
  /** 整体平铺偏移 [x, y](像素,错落起点)。默认 [0, 0]。 */
  offset?: [number, number] | undefined;
  /** 不透明度(0–1)。默认 0.15。 */
  opacity?: number | undefined;
  /** 文字颜色(CSS 颜色值)。默认取设计 token 前景弱化色。 */
  fontColor?: string | undefined;
  /** 文字字号(像素)。默认 16。 */
  fontSize?: number | undefined;
  /** 文字字体族。默认取设计 token sans。 */
  fontFamily?: string | undefined;
  /** 覆盖层层级。默认 9。 */
  zIndex?: number | undefined;
  /** 被覆盖的内容。 */
  children?: ReactNode;
  /** 子部件类名细粒度留口(root / overlay)。 */
  classNames?: WatermarkClassNames | undefined;
}

const DEFAULT_GAP: Vec2 = [100, 100];
const DEFAULT_OFFSET: Vec2 = [0, 0];
const DEFAULT_ROTATE = -22;
const DEFAULT_OPACITY = 0.15;
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_IMAGE_SIZE: Vec2 = [120, 64];

/** token 默认值(在 canvas 里 token 取不到,需具体颜色 → 用稳妥的弱前景近似;CSS 仍消费 token)。 */
const FALLBACK_FONT_COLOR = 'rgba(120, 120, 130, 1)';
const FALLBACK_FONT_FAMILY = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/**
 * 在离屏 canvas 上绘制一个水印单元 → toDataURL。考虑 devicePixelRatio 保证高 DPI 清晰。
 * 拿不到 2d 上下文(SSR / jsdom / 老引擎)时返回 null,组件据此降级为不渲染覆盖层背景。
 * 纯副作用收口在此(组件用 useEffect 调它重绘);返回 data URL 字符串或 null。
 */
function drawUnit(params: {
  lines: string[];
  image: string | undefined;
  imageEl: HTMLImageElement | null;
  width: number | undefined;
  height: number | undefined;
  rotate: number;
  gap: Vec2;
  fontSize: number;
  fontColor: string;
  fontFamily: string;
}): { url: string; cssWidth: number; cssHeight: number } | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  // jsdom / 老引擎下 getContext 可能返回 null:不绘制(覆盖层无背景图,功能降级但不报错)。
  if (ctx == null) return null;

  const ratio =
    typeof window !== 'undefined' && Number.isFinite(window.devicePixelRatio)
      ? Math.max(window.devicePixelRatio, 1)
      : 1;

  const useImage = params.image != null && params.imageEl != null;

  // 计算内容占位尺寸:图片优先用 width/height(兜默认),文字用 measureText / 估算。
  let contentW: number;
  let contentH: number;
  if (useImage) {
    contentW = params.width ?? DEFAULT_IMAGE_SIZE[0];
    contentH = params.height ?? DEFAULT_IMAGE_SIZE[1];
  } else {
    // measureText 需要先设好字体
    ctx.font = `${params.fontSize}px ${params.fontFamily}`;
    let measured = 0;
    for (const line of params.lines) {
      const w = ctx.measureText(line).width;
      if (w > measured) measured = w;
    }
    const lineHeight = params.fontSize * 1.4;
    const estimated = estimateTextSize(params.lines, params.fontSize, lineHeight);
    contentW = params.width ?? (Math.ceil(measured) || estimated[0]);
    contentH = params.height ?? estimated[1];
  }

  const layout = computeUnitLayout({
    gap: params.gap,
    content: [contentW, contentH],
    rotate: params.rotate,
  });

  const cssWidth = layout.canvasWidth;
  const cssHeight = layout.canvasHeight;
  if (cssWidth <= 0 || cssHeight <= 0) return null;

  canvas.width = Math.ceil(cssWidth * ratio);
  canvas.height = Math.ceil(cssHeight * ratio);

  ctx.scale(ratio, ratio);
  ctx.translate(layout.centerX, layout.centerY);
  ctx.rotate((params.rotate * Math.PI) / 180);

  if (useImage && params.imageEl != null) {
    ctx.drawImage(
      params.imageEl,
      -layout.contentWidth / 2,
      -layout.contentHeight / 2,
      layout.contentWidth,
      layout.contentHeight,
    );
  } else {
    ctx.font = `${params.fontSize}px ${params.fontFamily}`;
    ctx.fillStyle = params.fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lineHeight = params.fontSize * 1.4;
    const total = params.lines.length;
    const startY = -((total - 1) * lineHeight) / 2;
    params.lines.forEach((line, i) => {
      ctx.fillText(line, 0, startY + i * lineHeight);
    });
  }

  // 跨域图片(即便设了 crossOrigin='anonymous' 仍可能因服务端无 CORS 头而污染画布)
  // 会让 toDataURL 抛 SecurityError。捕获后降级返回 null(不渲染水印背景但不崩溃)。
  try {
    return { url: canvas.toDataURL('image/png'), cssWidth, cssHeight };
  } catch {
    return null;
  }
}

/**
 * Watermark —— 水印覆盖层(生产级 layout 原语)。自研、零依赖,样式消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 实现:用离屏 canvas 绘制一个水印「单元」(文字或图片,带旋转,按 devicePixelRatio 放大保清晰)→ toDataURL,
 * 作为覆盖层的 repeating background-image 平铺。覆盖层绝对定位铺满根容器、`pointer-events:none` 不挡交互;
 * 根容器 `position:relative` 包裹 children + 覆盖层,水印浮在内容之上但完全可穿透点击。
 *
 * 能力:
 * - **文字 / 图片**两种内容(`content` 多行 / `image`,image 优先);旋转 `rotate`、平铺 `gap`、错落 `offset`;
 *   `opacity` / `fontColor` / `fontSize` / `fontFamily` / `zIndex` 全可控。
 * - **高 DPI 清晰**:画布尺寸 ×devicePixelRatio 再 toDataURL,Retina 不糊。
 * - **降级安全**:拿不到 2d 上下文(SSR / 老引擎)时不渲染背景图但仍正常包裹 children,不报错。
 *
 * **a11y**:覆盖层 `aria-hidden=true`,不进可访问性树、不被读屏读到(纯装饰)。
 * **留口**:`...rest` 透传根容器原生属性与事件;`classNames.root` / `classNames.overlay` 细粒度槽位;
 * `className` / `style` 与组件计算值合并(用户 style 优先,但布局核心样式由类名兜底)。
 *
 * 诚实备注:**未做防删除加固**(主流库会用 MutationObserver 监听覆盖层被脚本删除/篡改后自动重建)。
 * 当前版本面向「视觉水印 / 溯源标注」场景,不承诺对抗恶意 DOM 篡改;防篡改加固留作 TODO(见目录 component.json)。
 *
 * 样式见同目录 Watermark.css,需引入 @magic-scope/react/styles.css。
 */
export const Watermark = forwardRef<HTMLDivElement, WatermarkProps>(function Watermark(
  {
    content,
    image,
    width,
    height,
    rotate = DEFAULT_ROTATE,
    gap,
    offset,
    opacity = DEFAULT_OPACITY,
    fontColor,
    fontSize = DEFAULT_FONT_SIZE,
    fontFamily,
    zIndex = 9,
    children,
    className,
    classNames,
    style,
    ...rest
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  // 绘制结果:背景图 data URL + 单元 css 尺寸(决定 background-size)。
  const [bg, setBg] = useState<{
    url: string;
    cssWidth: number;
    cssHeight: number;
  } | null>(null);

  const resolvedGap = normalizeVec2(gap, DEFAULT_GAP);
  const resolvedOffset = normalizeVec2(offset, DEFAULT_OFFSET);
  const resolvedColor = fontColor ?? FALLBACK_FONT_COLOR;
  const resolvedFamily = fontFamily ?? FALLBACK_FONT_FAMILY;

  // 把数组/对象型入参摊平成稳定字符串 key,作为 effect 依赖,避免引用每渲染变化导致的多余重绘。
  // effect 内再从 key 反解出 lines / gap,确保依赖列表「诚实且全标量」(无需 lint 抑制)。
  // 用 JSON 序列化作 key:content 含换行符时仍无损保留行边界(join('\n') + split 会丢失)。
  const linesKey = JSON.stringify(toLines(content));
  const gapKey = `${resolvedGap[0]},${resolvedGap[1]}`;

  useEffect(() => {
    let cancelled = false;

    // 从稳定 key 反解出绘制所需的行数组与间距(与渲染期等价,但引用稳定)。
    // JSON.parse 无损还原(含换行符的行边界完整保留)。
    const lines = JSON.parse(linesKey) as string[];
    const [gapX, gapY] = gapKey.split(',');
    const effGap: Vec2 = [Number(gapX), Number(gapY)];

    const paint = (imageEl: HTMLImageElement | null) => {
      if (cancelled) return;
      const result = drawUnit({
        lines,
        image,
        imageEl,
        width,
        height,
        rotate,
        gap: effGap,
        fontSize,
        fontColor: resolvedColor,
        fontFamily: resolvedFamily,
      });
      setBg(result);
    };

    // 无内容(既无文字也无图片):清空背景。
    if (image == null && lines.length === 0) {
      setBg(null);
      return;
    }

    if (image != null && typeof Image !== 'undefined') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => paint(img);
      // 图片加载失败:退化为不绘制(不抛错)。
      img.onerror = () => {
        if (!cancelled) setBg(null);
      };
      img.src = image;
    } else {
      paint(null);
    }

    return () => {
      cancelled = true;
    };
  }, [linesKey, image, width, height, rotate, gapKey, fontSize, resolvedColor, resolvedFamily]);

  const rootClasses = cx('ms-watermark', className, classNames?.root);
  const overlayClasses = cx('ms-watermark__overlay', classNames?.overlay);

  // 覆盖层样式:背景图 = 绘制结果;尺寸 = 单元 css 尺寸;偏移 = background-position。
  const overlayStyle: CSSProperties = {
    opacity,
    zIndex,
  };
  if (bg != null) {
    overlayStyle.backgroundImage = `url(${bg.url})`;
    overlayStyle.backgroundSize = `${bg.cssWidth}px ${bg.cssHeight}px`;
    overlayStyle.backgroundRepeat = 'repeat';
    if (resolvedOffset[0] !== 0 || resolvedOffset[1] !== 0) {
      overlayStyle.backgroundPosition = `${resolvedOffset[0]}px ${resolvedOffset[1]}px`;
    }
  }

  return (
    <div ref={composeRefs(ref, rootRef)} className={rootClasses} style={style} {...rest}>
      {children}
      <div
        className={overlayClasses}
        style={overlayStyle}
        aria-hidden="true"
        data-ms-watermark-overlay=""
      />
    </div>
  );
});
Watermark.displayName = 'Watermark';

import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  SyntheticEvent,
} from 'react';
import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import {
  IDENTITY_TRANSFORM,
  isIdentityTransform,
  nextRotate,
  nextZoom,
  type PreviewTransform,
  resolveSrc,
  transformString,
} from './logic';

export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
export type ImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

const cx = (...parts: Array<string | false | undefined>): string => parts.filter(Boolean).join(' ');

export interface ImageProps
  extends Omit<ComponentPropsWithoutRef<'img'>, 'width' | 'height' | 'onError' | 'className'> {
  /** 图片地址(主图)。 */
  src?: string | undefined;
  /** 替代文本(无障碍必填语义;装饰图传空串以从无障碍树移除)。 */
  alt?: string | undefined;
  /**
   * 主图加载失败后的兜底来源链(按顺序逐级尝试)。
   * 传单个字符串或数组;全部失败后进入错误占位态。
   */
  fallbackSrc?: string | string[] | undefined;
  /** 宽(数值按 px,或任意 CSS 长度串)。 */
  width?: number | string | undefined;
  /** 高(数值按 px,或任意 CSS 长度串)。 */
  height?: number | string | undefined;
  /**
   * 填充方式(object-fit)。默认 cover。
   * 备注:object-fit 仅对 <img> 这类替换元素生效。
   */
  fit?: ImageFit;
  /** 圆角档(走 --ms-radius-*);full=圆形(适合头像式裁切)。默认 none。 */
  rounded?: ImageRadius;
  /**
   * 懒加载。默认 true → loading="lazy"(浏览器原生,进视口才取图);
   * false → loading="eager"。原生不支持的旧引擎自动忽略该属性、照常加载(渐进增强)。
   */
  lazy?: boolean;
  /** 解码提示(透传 decoding,默认 async 不阻塞渲染)。 */
  decoding?: 'sync' | 'async' | 'auto';
  /**
   * 是否启用点击预览灯箱。默认 false。
   * 开启后图片可点击/回车放大到全屏遮罩,带缩放/旋转/还原工具栏。
   */
  preview?: boolean;
  /** 受控:预览灯箱是否打开(配合 onPreviewOpenChange)。 */
  previewOpen?: boolean | undefined;
  /**
   * 预览开合回调(受控或非受控均可监听)。
   * @param open 变化后的目标显隐:true 打开灯箱,false 关闭。
   */
  onPreviewOpenChange?: ((open: boolean) => void) | undefined;
  /** 加载中占位(自定义 skeleton / 内容);不传则用内建脉冲骨架。 */
  placeholder?: ReactNode;
  /** 错误态自定义内容;不传则显示内建图标 + i18n image.error 文案。 */
  fallback?: ReactNode;
  /**
   * 灯箱工具按钮的 aria-label 覆盖(本组件 i18n 字典仅预置 image.error/image.preview,
   * 这些更细的工具标签作为可覆盖 prop 给出中文默认值,便于按需本地化)。
   */
  toolbarLabels?:
    | {
        zoomIn?: string;
        zoomOut?: string;
        rotate?: string;
        reset?: string;
        close?: string;
      }
    | undefined;
  /**
   * 加载完成回调(图片解码并可显示后)。
   * @param event 原生 <img> 的 load 合成事件。
   */
  onLoad?: ((event: SyntheticEvent<HTMLImageElement>) => void) | undefined;
  /**
   * 全部来源(主图 + fallback 链)均失败后的回调。
   * @param event 最后一次失败的 <img> error 合成事件。
   */
  onError?: ((event: SyntheticEvent<HTMLImageElement>) => void) | undefined;
  /** 组件根 className(<figure> 包裹层)。 */
  className?: string | undefined;
  /** 分槽 className:根 / img / 骨架 / 错误态 / 灯箱遮罩 / 灯箱大图 / 工具栏。 */
  classNames?: {
    root?: string;
    img?: string;
    skeleton?: string;
    error?: string;
    preview?: string;
    previewImg?: string;
    toolbar?: string;
  };
}

const BrokenGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    width="28"
    height="28"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="m3 16 5-5 4 4 3-3 6 6" />
    <path d="M4 4l16 16" />
  </svg>
);

const iconProps = {
  viewBox: '0 0 24 24',
  width: 20,
  height: 20,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const ZoomInGlyph = () => (
  <svg {...iconProps} aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
  </svg>
);
const ZoomOutGlyph = () => (
  <svg {...iconProps} aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3M8 11h6" />
  </svg>
);
const RotateGlyph = () => (
  <svg {...iconProps} aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);
const ResetGlyph = () => (
  <svg {...iconProps} aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.4 2.6L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
const CloseGlyph = () => (
  <svg {...iconProps} aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/** 把宽/高 prop 归一为 CSS 长度串(数值→px)。 */
const toLength = (v: number | string | undefined): string | undefined => {
  if (v == null) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
};

/**
 * Image —— 图片(category: data-display)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 能力:原生懒加载(loading=lazy)、加载中脉冲骨架、onError 沿 fallbackSrc 链逐级兜底→错误占位、
 * width/height/fit(object-fit)/rounded(含 full 圆形)、点击预览灯箱(遮罩 + 大图 + 缩放/旋转/还原/关闭工具栏)。
 * 预览支持受控(previewOpen/onPreviewOpenChange);键盘 Esc 关闭、+/- 缩放、r 旋转、0 还原。
 *
 * **留口**:`...rest` 透传到 <img>;`classNames` 细粒度分槽;`placeholder`/`fallback` 自定义占位与错误态;
 * `onLoad`/`onError` 走 compose 不覆盖。a11y:img alt;灯箱 role=dialog + aria-modal,工具按钮 aria-label(i18n)。
 *
 * 诚实备注:
 * - 多图组预览(ImageGroup:一处打开、左右切换整组)暂未做,留待后续作为复合组件(见 component.json requirements)。
 * - 灯箱为自渲染 fixed 遮罩(非原生 <dialog>),不进 top-layer;若页面有更高 z-index 浮层需自行协调层级。
 * - 灯箱大图为同一 src(不额外请求高清原图);如需「缩略图 + 原图」分离,后续加 previewSrc。
 *
 * 样式见同目录 Image.css,需引入 @magic-scope/react/styles.css。
 */
export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src,
    alt = '',
    fallbackSrc,
    width,
    height,
    fit = 'cover',
    rounded = 'none',
    lazy = true,
    decoding = 'async',
    preview = false,
    previewOpen,
    onPreviewOpenChange,
    placeholder,
    fallback,
    toolbarLabels,
    onLoad,
    onError,
    className,
    classNames,
    style,
    ...rest
  },
  ref,
) {
  const t = useMessages();

  const toolLabels = {
    zoomOut: toolbarLabels?.zoomOut ?? '缩小',
    zoomIn: toolbarLabels?.zoomIn ?? '放大',
    rotate: toolbarLabels?.rotate ?? '旋转',
    reset: toolbarLabels?.reset ?? '还原',
    close: toolbarLabels?.close ?? '关闭',
  };

  // 来源回退:记录累计失败次数,交给纯函数 resolveSrc 决定当前 src / 是否错误态。
  const [failedCount, setFailedCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const fallbacks = useMemo<string[]>(
    () => (fallbackSrc == null ? [] : Array.isArray(fallbackSrc) ? fallbackSrc : [fallbackSrc]),
    [fallbackSrc],
  );

  // 内容稳定 key:内联数组 fallbackSrc 每次父渲染都是新引用,直接以 fallbacks 引用为依赖
  // 会导致每次无关父重渲染都复位 loaded/failedCount(已加载图被打回 shimmer 卡死)。
  // 改用 join 出的稳定字符串,仅当来源链「内容」真变化才触发复位。
  const fallbackKey = useMemo(() => fallbacks.join(' '), [fallbacks]);

  // src / fallback 内容变化时复位加载与失败状态(换图重新走加载流程)
  // biome-ignore lint/correctness/useExhaustiveDependencies: 故意以 src/fallbackKey 为触发,复位计数与 loaded
  useEffect(() => {
    setFailedCount(0);
    setLoaded(false);
  }, [src, fallbackKey]);

  const resolved = resolveSrc(src, fallbacks, failedCount);
  const errored = resolved.errored;
  const currentSrc = resolved.src;

  const handleLoad = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      setLoaded(true);
      onLoad?.(event);
    },
    [onLoad],
  );

  const handleError = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      setFailedCount((c) => {
        const next = c + 1;
        // 仅当本次失败已耗尽所有候选(进入错误态)时,派发 onError
        const after = resolveSrc(src, fallbacks, next);
        if (after.errored) {
          onError?.(event);
        }
        return next;
      });
    },
    [src, fallbacks, onError],
  );

  /* —— 预览灯箱:open 受控/非受控双模 —— */
  const isControlled = previewOpen != null;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? previewOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onPreviewOpenChange?.(next);
    },
    [isControlled, onPreviewOpenChange],
  );

  const [transform, setTransform] = useState<PreviewTransform>(IDENTITY_TRANSFORM);
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const labelId = useId();

  const canPreview = preview && !errored && currentSrc != null;

  const openPreview = useCallback(() => {
    if (!canPreview) return;
    setTransform(IDENTITY_TRANSFORM);
    setOpen(true);
  }, [canPreview, setOpen]);

  const closePreview = useCallback(() => setOpen(false), [setOpen]);

  const zoomBy = useCallback((dir: number) => {
    setTransform((prev) => ({ ...prev, zoom: nextZoom(prev.zoom, dir) }));
  }, []);
  const rotateBy = useCallback((dir: number) => {
    setTransform((prev) => ({ ...prev, rotate: nextRotate(prev.rotate, dir) }));
  }, []);
  const resetTransform = useCallback(() => setTransform(IDENTITY_TRANSFORM), []);

  // 灯箱打开:锁背景滚动 + 记忆/聚焦,关闭复位焦点
  useEffect(() => {
    if (!open) return;
    // open 由 false→true 时复位 transform:openPreview 只覆盖点击/回车路径,
    // 受控外部直接置 previewOpen=true 不经过 openPreview,这里兜底使受控/非受控打开都从初始态开始。
    setTransform(IDENTITY_TRANSFORM);
    previouslyFocused.current = (document.activeElement as HTMLElement) ?? null;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    // 把焦点移入灯箱(下一帧,等元素挂上)
    const raf = requestAnimationFrame(() => lightboxRef.current?.focus());
    return () => {
      root.style.overflow = prevOverflow;
      cancelAnimationFrame(raf);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // 灯箱键盘:Esc 关 / +-= 缩放 / r 旋转 / 0 还原
  const handleLightboxKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          closePreview();
          break;
        case '+':
        case '=':
          event.preventDefault();
          zoomBy(1);
          break;
        case '-':
        case '_':
          event.preventDefault();
          zoomBy(-1);
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          rotateBy(1);
          break;
        case '0':
          event.preventDefault();
          resetTransform();
          break;
        default:
          break;
      }
    },
    [closePreview, zoomBy, rotateBy, resetTransform],
  );

  /* —— 渲染:根 figure 内 img + 骨架 / 错误态;按需挂灯箱 —— */
  const rootStyle: CSSProperties = {
    ...(toLength(width) ? { width: toLength(width) } : {}),
    ...(toLength(height) ? { height: toLength(height) } : {}),
    ...style,
  };

  const rootClassName = cx(
    'ms-image',
    `ms-image--rounded-${rounded}`,
    canPreview && 'ms-image--previewable',
    errored && 'ms-image--errored',
    classNames?.root,
    className,
  );

  const showSkeleton = !loaded && !errored && currentSrc != null;

  return (
    <>
      <figure className={rootClassName} style={rootStyle} data-loaded={loaded || undefined}>
        {errored ? (
          <div
            className={cx('ms-image__error', classNames?.error)}
            role="img"
            aria-label={alt || t('image.error', undefined, '图片加载失败')}
          >
            {fallback ?? (
              <>
                <BrokenGlyph />
                <span className="ms-image__error-text">
                  {t('image.error', undefined, '图片加载失败')}
                </span>
              </>
            )}
          </div>
        ) : (
          <>
            {showSkeleton &&
              (placeholder != null ? (
                <div className={cx('ms-image__placeholder', classNames?.skeleton)}>
                  {placeholder}
                </div>
              ) : (
                <div
                  className={cx('ms-image__skeleton', classNames?.skeleton)}
                  aria-hidden="true"
                />
              ))}
            {currentSrc != null && (
              <img
                ref={ref}
                src={currentSrc}
                alt={alt}
                loading={lazy ? 'lazy' : 'eager'}
                decoding={decoding}
                className={cx(
                  'ms-image__img',
                  `ms-image__img--fit-${fit}`,
                  loaded && 'ms-image__img--loaded',
                  classNames?.img,
                )}
                {...(canPreview
                  ? {
                      role: 'button',
                      tabIndex: 0,
                      'aria-haspopup': 'dialog' as const,
                      'aria-label': t('image.preview', undefined, '预览'),
                    }
                  : {})}
                {...rest}
                onLoad={handleLoad}
                onError={handleError}
                onClick={composeEventHandlers(rest.onClick, canPreview ? openPreview : undefined)}
                onKeyDown={composeEventHandlers(
                  rest.onKeyDown,
                  canPreview
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openPreview();
                        }
                      }
                    : undefined,
                )}
              />
            )}
          </>
        )}
      </figure>

      {canPreview && open && (
        <div
          ref={lightboxRef}
          className={cx('ms-image__lightbox', classNames?.preview)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          tabIndex={-1}
          onKeyDown={handleLightboxKeyDown}
          onClick={(e) => {
            // 仅点到遮罩本身(非内部图片/工具栏)才关闭
            if (e.target === e.currentTarget) closePreview();
          }}
        >
          <span id={labelId} className="ms-image__lightbox-label">
            {alt || t('image.preview', undefined, '预览')}
          </span>

          <div className="ms-image__stage">
            {currentSrc != null && (
              <img
                src={currentSrc}
                alt={alt}
                className={cx('ms-image__preview-img', classNames?.previewImg)}
                style={{ transform: transformString(transform) }}
                draggable={false}
              />
            )}
          </div>

          <div
            className={cx('ms-image__toolbar', classNames?.toolbar)}
            role="toolbar"
            aria-label={t('image.preview', undefined, '预览')}
          >
            <button
              type="button"
              className="ms-image__tool"
              aria-label={toolLabels.zoomOut}
              onClick={() => zoomBy(-1)}
            >
              <ZoomOutGlyph />
            </button>
            <button
              type="button"
              className="ms-image__tool"
              aria-label={toolLabels.zoomIn}
              onClick={() => zoomBy(1)}
            >
              <ZoomInGlyph />
            </button>
            <button
              type="button"
              className="ms-image__tool"
              aria-label={toolLabels.rotate}
              onClick={() => rotateBy(1)}
            >
              <RotateGlyph />
            </button>
            <button
              type="button"
              className="ms-image__tool"
              aria-label={toolLabels.reset}
              disabled={isIdentityTransform(transform)}
              onClick={resetTransform}
            >
              <ResetGlyph />
            </button>
            <button
              type="button"
              className="ms-image__tool ms-image__tool--close"
              aria-label={toolLabels.close}
              onClick={closePreview}
            >
              <CloseGlyph />
            </button>
          </div>
        </div>
      )}
    </>
  );
});
Image.displayName = 'Image';

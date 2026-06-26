import type { ComponentPropsWithoutRef, CSSProperties, ReactElement, ReactNode, Ref } from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { composeRefs, mergeAsChildProps } from '../../utils/compose';
import { lastLineWidth, resolveDimension } from './logic';

export type SkeletonVariant = 'text' | 'rect' | 'circle';
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'wave' | 'none';

export interface SkeletonProps extends ComponentPropsWithoutRef<'div'> {
  /** 占位形状。text 为文本行(较矮 + 小圆角),circle 为等宽高圆形,rect 为矩形(默认)。 */
  variant?: SkeletonVariant;
  /** 动画类型:流光 / 脉冲呼吸 / 波浪 / 关闭。默认 shimmer。受 data-ms-motion 与 reduced-motion 再降级。 */
  animation?: SkeletonAnimation;
  /**
   * 多行文本骨架(仅在视觉上排成多行):>1 时渲染多个文本行,最后一行宽度自动收窄。
   * 仅当未传 children(纯骨架)时生效;传入会自动切到 variant="text"。
   */
  lines?: number;
  /** 便捷宽度:number 视作 px,字符串原样写入 inline-size。映射到根元素 inline-size。 */
  width?: number | string;
  /** 便捷高度:number 视作 px,字符串原样写入 block-size。映射到根元素 block-size。 */
  height?: number | string;
  /**
   * 内容感知:为 true 时显示骨架占位;为 false 时直接渲染 children(真实内容)。
   * 配合 children 使用,实现「加载中显骨架 / 加载完显内容」的开关而无需调用方写条件分支。
   * 不传时:有 children 即视为内容已就绪(loading 默认 false)。
   */
  loading?: boolean;
  /** 渲染为子元素并保留骨架样式(Radix Slot 风格;由子元素自带内容)。 */
  asChild?: boolean;
}

/** 把便捷尺寸 props 合到 style(用户 style 优先,不覆盖)。 */
function withDimensionStyle(
  style: CSSProperties | undefined,
  width: number | string | undefined,
  height: number | string | undefined,
): CSSProperties | undefined {
  if (width == null && height == null) return style;
  const next: CSSProperties = { ...style };
  if (width != null && next.inlineSize == null && next.width == null) {
    next.inlineSize = resolveDimension(width);
  }
  if (height != null && next.blockSize == null && next.height == null) {
    next.blockSize = resolveDimension(height);
  }
  return next;
}

/**
 * Skeleton —— 加载占位(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * surface-raised 底色叠加一道流光(linear-gradient + 移动 background-position),契合奥术魔法主题。
 * 能力:text/rect/circle 形态 · 四档动画(shimmer/pulse/wave/none) · 便捷 width/height ·
 * 多行文本骨架(lines,末行自动收窄) · 内容感知(loading + children,加载完显真实内容) · asChild 多态。
 * 动效受 data-ms-motion 调档(off 停成静态底色 / subtle 放慢),发光受 data-ms-fx 门控,尊重 reduced-motion。
 * 纯装饰故 aria-hidden、aria-busy 标注加载态;样式见同目录 Skeleton.css,需引入 @magic-scope/react/styles.css。
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'rect',
      animation = 'shimmer',
      lines,
      width,
      height,
      loading,
      asChild = false,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    // 内容感知:显式 loading 优先;未传时「有 children = 内容已就绪」,纯骨架默认加载中。
    // asChild 模式下 children 是样式载体(非真实内容),不参与内容感知短路。
    const isLoading = loading ?? children == null;

    // 加载完成:直接把真实内容透出(content-aware 模式),不再渲染骨架。
    if (!asChild && children != null && !isLoading) {
      return <>{children}</>;
    }

    // 多行文本骨架:lines>1 且无真实内容时,排多行,末行收窄(纯视觉,整体一个 aria-busy 区域)。
    const lineCount = lines != null && lines > 1 && children == null ? Math.floor(lines) : 0;
    const effectiveVariant = lineCount > 0 ? 'text' : variant;

    const rootClassName = [
      'ms-skeleton',
      `ms-skeleton--${effectiveVariant}`,
      `ms-skeleton--anim-${animation}`,
      lineCount > 0 && 'ms-skeleton--multiline',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const rootStyle = withDimensionStyle(style, width, height);

    // asChild:把骨架样式合并到子元素(由子元素自带内容),用于自定义容器/形状。
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const merged = mergeAsChildProps(
        {
          ...props,
          className: rootClassName,
          style: rootStyle,
          'aria-hidden': true,
          'aria-busy': true,
        },
        child.props,
      );
      return cloneElement(child, {
        ...merged,
        ref: composeRefs(ref as Ref<unknown>, childRef),
      } as Record<string, unknown>);
    }

    // 多行:外层是 aria-busy 容器,内部多个文本行(纯视觉)。
    if (lineCount > 0) {
      return (
        <div
          ref={ref}
          aria-hidden="true"
          aria-busy="true"
          className={rootClassName}
          style={rootStyle}
          {...props}
        >
          {Array.from({ length: lineCount }, (_unused, index) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: 行数稳定且纯装饰,无重排语义
              key={index}
              className="ms-skeleton__line"
              style={index === lineCount - 1 ? { inlineSize: lastLineWidth(lineCount) } : undefined}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        aria-hidden="true"
        aria-busy="true"
        className={rootClassName}
        style={rootStyle}
        {...props}
      />
    );
  },
);
Skeleton.displayName = 'Skeleton';

export interface SkeletonTextProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** 行数。默认 3。 */
  lines?: number;
  /** 动画类型。默认 shimmer。 */
  animation?: SkeletonAnimation;
}

/**
 * SkeletonText —— 多行文本骨架的便捷封装(等价 <Skeleton variant="text" lines={n} />)。
 * 渲染 n 行文本占位,末行自动收窄,模拟段落。
 */
export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ lines = 3, animation = 'shimmer', ...props }, ref) => (
    <Skeleton
      ref={ref}
      variant="text"
      lines={Math.max(2, lines)}
      animation={animation}
      {...props}
    />
  ),
);
SkeletonText.displayName = 'SkeletonText';

export interface SkeletonGroupProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * 内容感知:为 true 时整组显骨架;为 false 时渲染 children(真实内容)。
   * 不传时:有 children 即视为已就绪。一处开关控制整个组合的占位/内容切换。
   */
  loading?: boolean;
  /** 内容就绪后要展示的真实内容(loading=false 时透出)。 */
  children?: ReactNode;
}

/**
 * SkeletonGroup —— 骨架组合容器。统一一个 loading 开关控制内部所有骨架,
 * 加载完成则把 children(真实内容)整体透出。配合预制模板子部件搭出常见卡片骨架。
 */
export const SkeletonGroup = forwardRef<HTMLDivElement, SkeletonGroupProps>(
  ({ loading, className, children, ...props }, ref) => {
    const isLoading = loading ?? children == null;

    if (children != null && !isLoading) {
      return <>{children}</>;
    }

    return (
      <div
        ref={ref}
        aria-hidden="true"
        aria-busy="true"
        className={['ms-skeleton-group', className].filter(Boolean).join(' ')}
        {...props}
      >
        {isLoading && children == null ? <SkeletonMediaTemplate /> : children}
      </div>
    );
  },
);
SkeletonGroup.displayName = 'SkeletonGroup';

/**
 * SkeletonAvatarTemplate / SkeletonMediaTemplate —— 预制组合模板:
 * 头像 + 标题 + 正文,开箱即用的常见卡片骨架(也可作为 SkeletonGroup 无 children 时的默认占位)。
 */
function SkeletonMediaTemplate() {
  return (
    <div className="ms-skeleton-template">
      <Skeleton variant="circle" className="ms-skeleton-template__avatar" />
      <div className="ms-skeleton-template__body">
        <Skeleton variant="text" className="ms-skeleton-template__title" />
        <Skeleton variant="text" lines={3} />
      </div>
    </div>
  );
}

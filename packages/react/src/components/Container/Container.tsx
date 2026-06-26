import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactElement,
  Ref,
} from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { composeRefs, mergeAsChildProps } from '../../utils/compose';
import {
  type ContainerSize,
  cx,
  type Responsive,
  resolveResponsive,
  resolveSize,
  resolveSpace,
  type SpaceToken,
} from './logic';

export interface ContainerProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /**
   * 最大行内尺寸档:sm(30rem)/ md(48rem)/ lg(64rem)/ xl(80rem)/ full(不限宽),
   * 或任意自定义 CSS 长度(如 '72ch' / '900px')。档位对齐 @magic-scope/tokens 的视口断点。默认 lg。
   */
  size?: ContainerSize;
  /**
   * 满宽:不限制 max-inline-size(等价 size="full")。与 size 同传时 fluid 优先。默认 false。
   */
  fluid?: boolean;
  /**
   * 水平内边距(padding-inline,RTL 友好)。接受 space token 档(0..16,映射 --ms-space-*,
   * 随密度缩放)或任意 CSS 长度;支持断点对象 `{ base, sm, md, lg, xl }` 做响应式。
   * 默认走流式 clamp(随视口收放,无需逐档配置)。
   */
  padding?: Responsive<SpaceToken>;
  /**
   * 垂直内边距(padding-block)。同 padding 接受 token 档 / CSS 长度 / 断点对象。默认 0。
   */
  paddingBlock?: Responsive<SpaceToken>;
  /**
   * 垂直居中:容器撑到至少一屏高(min-block-size: 视口高),内容在交叉轴居中。
   * 用于落地页 / 空状态等需要内容垂直居中的整屏场景。默认 false。
   */
  centered?: boolean;
  /** 多态渲染标签(语义场景如 section / main / article)。默认 div。 */
  as?: ElementType;
  /** 渲染为唯一子元素并合并样式/props(Slot 模式;子元素自带内容)。 */
  asChild?: boolean;
  /** 内容(asChild 时为承载样式的唯一子元素)。 */
  children?: React.ReactNode;
}

/**
 * Container —— 居中定宽容器(layout 旗舰)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 把「限宽 + 水平居中 + 响应式内边距」这套页面骨架收口:
 * - `size`:最大行内尺寸档(对齐视口断点)或自定义长度;`fluid` 一键满宽;
 * - 始终 margin-inline:auto 水平居中;内边距用 CSS 逻辑属性(padding-inline / padding-block)RTL 友好;
 * - `padding` / `paddingBlock` 支持 space token 档与**断点对象**(`{ base, md, lg }`),
 *   由 logic.ts 解析成 CSS 变量、Container.css 的媒体查询(对齐 breakpoints 常量)逐级覆盖;
 * - `centered` 整屏垂直居中;不传 padding 时走流式 clamp,随视口平滑收放。
 *
 * **留口**:`forwardRef` 到根;`...rest` 透传所有原生属性与事件;`as` / `asChild` 多态;
 * className / style 给根(用户 style 优先合并,核心样式经 CSS 变量驱动不被覆盖)。
 * 样式见同目录 Container.css,需引入 @magic-scope/react/styles.css。
 */
export const Container = forwardRef<HTMLElement, ContainerProps>(function Container(
  {
    size = 'lg',
    fluid = false,
    padding,
    paddingBlock,
    centered = false,
    as,
    asChild = false,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const effectiveSize = fluid ? 'full' : size;

  // —— 把响应式属性解析成 CSS 自定义属性 ——
  const styleVars: Record<string, string> = {
    '--ms-container-max': resolveSize(effectiveSize),
  };
  // padding 缺省时不写 --ms-container-px,让 CSS 兜底流式 clamp(默认体验)。
  const hasPadding = padding !== undefined;
  if (hasPadding) {
    Object.assign(styleVars, resolveResponsive(padding, '--ms-container-px', resolveSpace, 4));
  }
  if (paddingBlock !== undefined) {
    Object.assign(styleVars, resolveResponsive(paddingBlock, '--ms-container-py', resolveSpace, 0));
  }

  const classes = cx(
    'ms-container',
    !hasPadding && 'ms-container--fluid-pad',
    centered && 'ms-container--centered',
    effectiveSize === 'full' && 'ms-container--full',
    className,
  );

  const mergedStyle: CSSProperties = {
    ...(styleVars as CSSProperties),
    ...style,
  };

  // asChild:把样式与 props 合并到唯一子元素(Slot 模式,参照 Button / List)。
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{
      className?: string;
      style?: CSSProperties;
      ref?: Ref<HTMLElement>;
    }>;
    const merged = mergeAsChildProps(
      { ...rest, className: classes, style: mergedStyle },
      child.props as Record<string, unknown>,
    );
    return cloneElement(child, {
      ...merged,
      ref: composeRefs(ref, child.props.ref),
    } as Record<string, unknown>);
  }

  const Comp = (as ?? 'div') as ElementType;
  return (
    <Comp ref={ref} className={classes} style={mergedStyle} {...rest}>
      {children}
    </Comp>
  );
});
Container.displayName = 'Container';

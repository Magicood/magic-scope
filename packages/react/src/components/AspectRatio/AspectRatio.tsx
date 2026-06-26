import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { composeRefs, mergeAsChildProps } from '../../utils/compose';
import {
  activeRatioBreakpoints,
  cx,
  type ObjectFit,
  type ResponsiveRatio,
  resolveRatioVars,
} from './logic';

export type { ObjectFit, ResponsiveRatio } from './logic';

export interface AspectRatioProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /**
   * 多态渲染标签。默认 `div`;语义场景可换 `figure`(配 figcaption)/ `section` 等。
   * 与 `asChild` 互斥(asChild 优先),`as` 在非 asChild 时生效。
   */
  as?: ElementType;
  /**
   * 宽高比。支持:
   * - 数字:`16 / 9`、`1`、`4 / 3`(直接写算式即可,JS 求值后传入);
   * - 字符串:`"16/9"` / `"16 / 9"`(CSS 原生比值);
   * - 断点对象:`{ base: 1, md: 16 / 9, lg: 21 / 9 }`,按视口断点切换(min-width 渐进覆盖)。
   *
   * 用 CSS `aspect-ratio` 维持比例;不支持 `aspect-ratio` 的旧引擎自动回退 padding-top 百分比技巧。
   * 默认 `16 / 9`。非法值(NaN / <=0)被忽略并回退默认。
   */
  ratio?: ResponsiveRatio;
  /**
   * 子内容(通常是 `img` / `video` / `iframe` / `picture`):被绝对定位铺满整个比例盒。
   * 媒体元素的 `object-fit` 由 `objectFit` 控制;非媒体内容(如叠加层)也会被拉满,可自行用 inset 调整。
   */
  children?: ReactNode;
  /**
   * 子媒体的填充方式(映射到子内容 `object-fit`)。
   * `cover`(默认,裁剪铺满不留边) / `contain`(完整可见可能留边) / `fill` / `none` / `scale-down`。
   * 备注:`object-fit` 仅对替换元素(img/video 等)生效;普通块级子元素请用自身布局。
   */
  objectFit?: ObjectFit;
  /**
   * 子媒体的对齐焦点(映射到子内容 `object-position`,逻辑同 CSS,如 `"center"` / `"top"` / `"50% 25%"`)。
   * 仅在 `objectFit` 为 cover / contain / scale-down 时有可见效果。
   */
  objectPosition?: string;
  /**
   * 圆角档(映射到 `--ms-radius-*`):`none` / `sm` / `md` / `lg` / `xl` / `full`。
   * 设置后自动 `overflow: hidden`,让裁剪的媒体跟随圆角。默认不裁剪(none)。
   */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * 是否裁剪溢出内容(`overflow: hidden`)。设了 `rounded`(非 none)时默认 true。
   * 显式传入可覆盖(如需让媒体的阴影/控件溢出可见时设 false)。
   */
  clip?: boolean;
  /** 渲染为子元素并保留比例盒样式(Radix Slot 风格;由子元素自带内容)。与 `as` 互斥,asChild 优先。 */
  asChild?: boolean;
}

/** 默认比例:16 / 9(最常见的媒体宽屏比)。 */
const DEFAULT_RATIO = '16 / 9';

/**
 * AspectRatio —— 宽高比盒(生产级 layout 原语)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 用 CSS `aspect-ratio` 维持任意宽高比,子内容(img / video / iframe)绝对定位铺满,`object-fit` 可选裁剪;
 * 旧引擎经 `@supports not (aspect-ratio: 1)` 自动回退 padding-top 百分比技巧,行为一致。
 *
 * 能力:
 * - **响应式比例**:ratio 支持断点对象(`{ base, sm, md, lg, xl, 2xl }`),按视口 min-width 渐进切换,
 *   纯静态 CSS @media 落地(零运行时、零 JS resize 监听),对齐本库「按能力不枚举机型」的多端适配。
 * - **多态 `as`** + **`asChild`**(mergeAsChildProps + composeRefs):换语义标签 / 套到自带元素。
 * - **填充控制**:objectFit / objectPosition 透到子媒体;rounded 圆角(token 档)+ clip 裁剪。
 *
 * **留口**:`...rest` 透传所有原生属性与事件;`className` / `style` 与组件计算值合并(用户 style 优先);
 * `forwardRef` 到根元素;比例等核心样式经 inline CSS 变量驱动,不会被用户 style 顺序覆盖比例语义。
 * 样式见同目录 AspectRatio.css,需引入 @magic-scope/react/styles.css。
 */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  {
    as,
    ratio = DEFAULT_RATIO,
    objectFit = 'cover',
    objectPosition,
    rounded = 'none',
    clip,
    asChild = false,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const ratioVars = resolveRatioVars(ratio);
  // ratio 解析后无任何合法档时回退默认,避免比例盒塌成 0 高。
  if (ratioVars['--ms-ar-ratio'] == null) ratioVars['--ms-ar-ratio'] = DEFAULT_RATIO;

  const activeBps = activeRatioBreakpoints(ratio);

  // 圆角非 none 时默认裁剪;clip 显式传入可覆盖。
  const shouldClip = clip ?? rounded !== 'none';

  // object-position 经 CSS 变量交给 .ms-aspect-ratio__content;objectFit 走类名(枚举可控)。
  const objectPositionVar = objectPosition != null ? { '--ms-ar-object-pos': objectPosition } : {};

  const rootStyle: CSSProperties = {
    ...(ratioVars as CSSProperties),
    ...(objectPositionVar as CSSProperties),
    ...style,
  };

  const classes = cx(
    'ms-aspect-ratio',
    `ms-aspect-ratio--fit-${objectFit}`,
    rounded !== 'none' && `ms-aspect-ratio--rounded-${rounded}`,
    shouldClip && 'ms-aspect-ratio--clip',
    // 仅对实际指定的断点档启用对应 @media 覆盖(避免空档误触发)。
    ...activeBps.map((bp) => `ms-aspect-ratio--bp-${bp}`),
    className,
  );

  // asChild:把比例盒样式合并到唯一子元素(Slot 模式;由子元素自带内容)。
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    const childRef = (child as { ref?: Ref<unknown> }).ref;
    const merged = mergeAsChildProps(
      { ...rest, className: classes, style: rootStyle },
      child.props,
    );
    return cloneElement(child, {
      ...merged,
      ref: composeRefs(ref as Ref<unknown>, childRef),
    } as Record<string, unknown>);
  }

  const Comp = (as ?? 'div') as ElementType;
  return (
    <Comp ref={ref} className={classes} style={rootStyle} {...rest}>
      <span className="ms-aspect-ratio__content">{children}</span>
    </Comp>
  );
});
AspectRatio.displayName = 'AspectRatio';

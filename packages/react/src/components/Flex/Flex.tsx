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
  buildFlexItemVars,
  buildFlexVars,
  type FlexAlign,
  type FlexDirection,
  type FlexItemStyleInput,
  type FlexJustify,
  type FlexStyleInput,
  type FlexWrap,
  type GapValue,
  type Responsive,
} from './logic';

// 仅 re-export Flex 专属类型;通用名(Responsive / Breakpoint)不经 barrel 泄露,避免与其它 layout
// 组件(Container / Center / Grid / Stack)的同名导出撞 TS2308。需要通用工具者从 Flex/logic 子路径取用。
export type { FlexAlign, FlexDirection, FlexJustify, FlexWrap, GapValue } from './logic';

/** Flex 根的多态属性:剔除会被 as 标签污染的内置 prop。 */
interface FlexOwnProps extends FlexStyleInput {
  /** 多态根标签(默认 div)。语义场景可传 section / nav / ul 等。 */
  as?: ElementType;
  /** 渲染为子元素并保留 flex 容器样式(Slot 风格,子元素自带内容)。 */
  asChild?: boolean;
  /** 用 display:inline-flex(随内容收缩,不独占一行)。默认 false。 */
  inline?: boolean;
  /** 主轴方向。支持断点对象。默认 row。 */
  direction?: Responsive<FlexDirection>;
  /** 交叉轴对齐(align-items)。支持断点对象。 */
  align?: Responsive<FlexAlign>;
  /** 主轴分布(justify-content)。支持断点对象。 */
  justify?: Responsive<FlexJustify>;
  /** 换行。支持断点对象;布尔简写 true=wrap / false=nowrap。 */
  wrap?: Responsive<FlexWrap>;
  /** 行列统一间距(数字档映射 --ms-space-*,或自定义 CSS 长度)。支持断点对象。 */
  gap?: Responsive<GapValue>;
  /** 仅行间距(覆盖 gap 的纵向分量)。支持断点对象。 */
  rowGap?: Responsive<GapValue>;
  /** 仅列间距(覆盖 gap 的横向分量)。支持断点对象。 */
  columnGap?: Responsive<GapValue>;
}

export type FlexProps = FlexOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof FlexOwnProps>;

/**
 * Flex —— 通用 flexbox 布局原语(生产级 layout 组件)。
 * display:flex 全部经 CSS 变量驱动;direction/align/justify/wrap/gap 均支持「单值 或 断点对象」
 * (如 `gap={{ base: 2, md: 4 }}`),响应式由 Flex.css 预展开的静态 @media 块逐级覆盖实现。
 * 多态 as(默认 div)+ asChild(mergeAsChildProps + composeRefs)+ forwardRef 到根 + 透传所有原生属性。
 * 间距用 --ms-space-* token、对齐走逻辑值(flex-start/end)故 RTL 友好。
 * 配套 Flex.Item(item 级 grow/shrink/basis/align/order)。样式见同目录 Flex.css。
 */
const FlexRoot = forwardRef<HTMLElement, FlexProps>(
  (
    {
      as,
      asChild = false,
      inline = false,
      direction,
      align,
      justify,
      wrap,
      gap,
      rowGap,
      columnGap,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const classes = ['ms-flex', inline && 'ms-flex--inline', className].filter(Boolean).join(' ');

    const mergedStyle: CSSProperties = {
      ...buildFlexVars({ direction, align, justify, wrap, gap, rowGap, columnGap }),
      // 用户 style 优先,但布局核心样式走上面的 CSS 变量,不会被这里覆盖
      ...style,
    };

    // asChild:把 flex 容器样式 + props 合并进子元素(子元素自带内容),用于已有语义节点接管渲染
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const merged = mergeAsChildProps(
        { ...rest, className: classes, style: mergedStyle },
        child.props,
      );
      return cloneElement(child, {
        ...merged,
        ref: composeRefs(ref as Ref<unknown>, childRef),
      } as Record<string, unknown>);
    }

    const Tag = (as ?? 'div') as ElementType;
    return (
      <Tag ref={ref} className={classes} style={mergedStyle} {...rest}>
        {children}
      </Tag>
    );
  },
);
FlexRoot.displayName = 'Flex';

interface FlexItemOwnProps extends FlexItemStyleInput {
  /** 多态根标签(默认 div)。 */
  as?: ElementType;
  /** 渲染为子元素并保留 item 样式(Slot 风格)。 */
  asChild?: boolean;
  /** flex-grow:布尔简写 true=1 / false=0,或具体数值。 */
  grow?: number | boolean;
  /** flex-shrink:布尔简写 true=1 / false=0,或具体数值。 */
  shrink?: number | boolean;
  /** flex-basis:数字按 px,字符串原样(如 '20%' / 'auto')。 */
  basis?: string | number;
  /** 单项交叉轴对齐(align-self),覆盖容器 align。 */
  align?: FlexAlign;
  /** 显示顺序(order)。 */
  order?: number;
}

export type FlexItemProps = FlexItemOwnProps &
  Omit<ComponentPropsWithoutRef<'div'>, keyof FlexItemOwnProps>;

/**
 * Flex.Item —— flex 子项级控制(grow/shrink/basis/align-self/order),经 CSS 变量驱动。
 * 同样支持多态 as 与 asChild。item 不做响应式断点对象,保持轻量;需要响应式时用嵌套 Flex。
 */
const FlexItem = forwardRef<HTMLElement, FlexItemProps>(
  (
    { as, asChild = false, grow, shrink, basis, align, order, className, style, children, ...rest },
    ref,
  ) => {
    const classes = ['ms-flex-item', className].filter(Boolean).join(' ');
    const mergedStyle: CSSProperties = {
      ...buildFlexItemVars({ grow, shrink, basis, align, order }),
      ...style,
    };

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const merged = mergeAsChildProps(
        { ...rest, className: classes, style: mergedStyle },
        child.props,
      );
      return cloneElement(child, {
        ...merged,
        ref: composeRefs(ref as Ref<unknown>, childRef),
      } as Record<string, unknown>);
    }

    const Tag = (as ?? 'div') as ElementType;
    return (
      <Tag ref={ref} className={classes} style={mergedStyle} {...rest}>
        {children}
      </Tag>
    );
  },
);
FlexItem.displayName = 'Flex.Item';

/** Flex 复合组件:Flex 根 + Flex.Item 子项。 */
export const Flex = Object.assign(FlexRoot, { Item: FlexItem });
export { FlexItem };

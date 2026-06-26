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
  axisToPlaceItems,
  type CenterAxis,
  cx,
  type Responsive,
  resolveSize,
  resolveSpace,
  responsiveVars,
  type SizeValue,
  type SpaceValue,
} from './logic';

// 仅对外暴露 Center 独有的语义类型;通用基建类型(Responsive / SpaceValue / Breakpoint)
// 保留在 logic.ts 内部复用,不从组件 barrel 导出,避免与 Grid 等其它 layout 组件同名冲突。
export type { CenterAxis, SizeValue } from './logic';

/** Center 自有 props(与多态根标签的原生属性合并)。 */
export interface CenterOwnProps {
  /**
   * 多态根标签。默认 `div`。语义需要时换 `section` / `main` / `article` 等。
   * 与 `asChild` 互斥(asChild 优先,渲染为传入的子元素)。
   */
  as?: ElementType;
  /**
   * 渲染为唯一子元素并把居中样式合并上去(Radix Slot 风格,由子元素自带内容)。
   * 用于「让一个已有元素直接成为居中盒」,不额外包一层 DOM。
   */
  asChild?: boolean;
  /**
   * 居中轴。`both`(默认,水平+垂直)/ `horizontal`(仅水平)/ `vertical`(仅垂直)。
   * 支持断点对象,如 `{ base: 'vertical', md: 'both' }`。
   */
  axis?: Responsive<CenterAxis>;
  /**
   * 行内居中盒:用 `inline-flex` 而非 `flex`,宽度收缩到内容、可与文字同行。默认 false。
   */
  inline?: boolean;
  /**
   * 子项间距(多个子节点时)。数字 = 间距档(映射 `--ms-space-*`,档位 0/1/2/3/4/6/8),
   * 字符串 = 任意 CSS 长度(逃生舱)。支持断点对象,如 `{ base: 2, md: 4 }`。
   */
  gap?: Responsive<SpaceValue>;
  /**
   * 内边距(逻辑属性 `padding`,RTL 友好)。同 `gap` 取值规则。支持断点对象。
   */
  padding?: Responsive<SpaceValue>;
  /**
   * 撑起最小高度(逻辑属性 `min-block-size`)。数字按 px,字符串原样
   * (如 `'100dvh'` / `'var(--ms-viewport-h)'`)。支持断点对象。常用于整屏垂直居中。
   */
  minBlockSize?: Responsive<SizeValue>;
}

/** 把 own props 之外的原生根标签属性都接上(默认 div)。 */
export type CenterProps = CenterOwnProps &
  Omit<ComponentPropsWithoutRef<'div'>, keyof CenterOwnProps>;

/**
 * Center —— 居中盒(生产级 layout 组件)。把子内容在水平 / 垂直 / 双轴上居中,
 * 底层用 flex + place-items,零依赖、消费 @magic-scope/tokens 的间距 token。
 *
 * 特性:多态 `as`(默认 div)+ `asChild`(Slot,mergeAsChildProps + composeRefs);
 * `axis`(both/horizontal/vertical)、`inline`(inline-flex)、`gap` / `padding`(间距 token 档)、
 * `minBlockSize`(撑高度)。`axis` / `gap` / `padding` / `minBlockSize` 均支持「单值或断点对象」
 * 响应式形式,断点解析在 logic.ts(零 React、可单测、可平移 core)。
 * 间距走 CSS 逻辑属性(gap/padding/min-block-size),RTL 友好。样式见同目录 Center.css,
 * 需引入 @magic-scope/react/styles.css。
 */
export const Center = forwardRef<HTMLElement, CenterProps>(
  (
    {
      as,
      asChild = false,
      axis = 'both',
      inline = false,
      gap,
      padding,
      minBlockSize,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    // 响应式各 prop → 注入根的 CSS 变量(base + 各断点档),由 Center.css 在媒体查询逐档消费。
    const cssVars: Record<string, string> = {
      ...responsiveVars('axis', axis, axisToPlaceItems),
      ...responsiveVars('gap', gap, resolveSpace),
      ...responsiveVars('pad', padding, resolveSpace),
      ...responsiveVars('minh', minBlockSize, resolveSize),
    };

    const classes = cx(
      'ms-center',
      inline && 'ms-center--inline',
      gap !== undefined && 'ms-center--has-gap',
      padding !== undefined && 'ms-center--has-pad',
      minBlockSize !== undefined && 'ms-center--has-minh',
      className,
    );

    // 用户 style 优先级最高,但核心居中变量在前(用户可显式覆盖任意一个)。
    const mergedStyle: CSSProperties = { ...cssVars, ...style };

    // asChild:把样式 / 变量 / 原生 props 合并到子元素(子元素自带内容),不额外包一层 DOM。
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const merged = mergeAsChildProps(
        { ...props, className: classes, style: mergedStyle },
        child.props,
      );
      return cloneElement(child, {
        ...merged,
        ref: composeRefs(ref as Ref<unknown>, childRef),
      } as Record<string, unknown>);
    }

    const Tag = (as ?? 'div') as ElementType;
    return (
      <Tag ref={ref} className={classes} style={mergedStyle} {...props}>
        {children}
      </Tag>
    );
  },
);
Center.displayName = 'Center';

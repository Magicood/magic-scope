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
  type AlignValue,
  type DistributeValue,
  type GridLineValue,
  type Responsive,
  resolveColumns,
  resolveMinChildWidth,
  resolveSpace,
  resolveSpan,
  resolveStart,
  type SpaceValue,
  spreadResponsive,
} from './logic';

// 仅 re-export Grid 专属类型;通用名(Responsive / Breakpoint)不经 barrel 泄露,
// 避免与其它 layout 组件(Flex 等)在 components 顶层 barrel 撞名(需要者从 './logic' 深引)。
export type { AlignValue, DistributeValue, GridLineValue, SpaceValue } from './logic';

/** grid-auto-flow 取值。 */
export type GridAutoFlow = 'row' | 'column' | 'dense' | 'row dense' | 'column dense';

/** Grid 根可用的多态标签子集(布局容器,默认 div)。 */
type GridElement =
  | 'div'
  | 'section'
  | 'main'
  | 'article'
  | 'aside'
  | 'ul'
  | 'ol'
  | 'nav'
  | 'header'
  | 'footer';

export interface GridOwnProps {
  /**
   * 列定义(响应式):
   * - `number` → `repeat(n, minmax(0, 1fr))`(等宽、不被内容撑破);
   * - 模板字符串 → 原样作为 `grid-template-columns`(如 `"1fr auto 2fr"`);
   * - 断点对象 → 各断点分别取上述形态(如 `{ base: 1, md: 2, lg: 4 }`)。
   */
  columns?: Responsive<number | string>;
  /**
   * 自适应列:每列至少 `minChildWidth` 宽、放不下自动折行(`auto-fit` + `minmax`)。
   * 提供后由它驱动列模板,优先级高于 `columns`。接 token 档位或任意 CSS 长度,支持响应式。
   */
  minChildWidth?: Responsive<SpaceValue>;
  /** 行列统一间距(token 档位或 CSS 长度,响应式)。被 rowGap/columnGap 覆盖。 */
  gap?: Responsive<SpaceValue>;
  /** 行间距(覆盖 gap 的行向分量)。 */
  rowGap?: Responsive<SpaceValue>;
  /** 列间距(覆盖 gap 的列向分量)。 */
  columnGap?: Responsive<SpaceValue>;
  /** 行模板(原样作为 grid-template-rows)。 */
  rows?: Responsive<string>;
  /** 隐式行高(grid-auto-rows,token 档位或 CSS 长度,响应式)。 */
  autoRows?: Responsive<SpaceValue>;
  /** 隐式列宽(grid-auto-columns,token 档位或 CSS 长度,响应式)。 */
  autoColumns?: Responsive<SpaceValue>;
  /** 自动布局流向 / dense 紧凑回填(grid-auto-flow,响应式)。 */
  autoFlow?: Responsive<GridAutoFlow>;
  /** 子项块向对齐(align-items,响应式)。 */
  align?: Responsive<AlignValue>;
  /** 子项行向对齐(justify-items,响应式)。 */
  justify?: Responsive<AlignValue>;
  /** 整体轨道块向分布(align-content,响应式)。 */
  alignContent?: Responsive<DistributeValue>;
  /** 整体轨道行向分布(justify-content,响应式)。 */
  justifyContent?: Responsive<DistributeValue>;
  /** 行内网格(display: inline-grid)。 */
  inline?: boolean;
  /**
   * 用容器查询而非视口媒体查询驱动响应式(@container):
   * 让 Grid 随「父容器宽度」而非视口自适应。开启后根设 container-type: inline-size。
   */
  container?: boolean;
  /** 多态:渲染为指定标签(默认 div)。 */
  as?: GridElement;
  /** 渲染为子元素并把样式/属性合并下去(Slot 风格,子元素自带内容)。 */
  asChild?: boolean;
}

export type GridProps = GridOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof GridOwnProps>;

/** 入参视图:可选字段显式带 undefined,适配 exactOptionalPropertyTypes 下的解构透传。 */
type WithUndefined<T> = { [K in keyof T]: T[K] | undefined };

/** 把 Grid 的响应式 props 摊成 CSS 变量集合(写进 inline style,由 Grid.css 级联消费)。 */
function buildGridVars(p: WithUndefined<GridOwnProps>): Record<string, string> {
  // minChildWidth 提供时驱动列模板,否则用 columns。
  const colVars =
    p.minChildWidth !== undefined
      ? spreadResponsive('cols', p.minChildWidth, resolveMinChildWidth)
      : spreadResponsive('cols', p.columns, resolveColumns);

  const identity = (v: string): string => v;

  return {
    ...colVars,
    ...spreadResponsive('rows', p.rows, identity),
    ...spreadResponsive('gap', p.gap, resolveSpace),
    ...spreadResponsive('row-gap', p.rowGap, resolveSpace),
    ...spreadResponsive('col-gap', p.columnGap, resolveSpace),
    ...spreadResponsive('auto-rows', p.autoRows, resolveSpace),
    ...spreadResponsive('auto-cols', p.autoColumns, resolveSpace),
    ...spreadResponsive('flow', p.autoFlow, identity),
    ...spreadResponsive('align', p.align, identity),
    ...spreadResponsive('justify', p.justify, identity),
    ...spreadResponsive('align-content', p.alignContent, identity),
    ...spreadResponsive('justify-content', p.justifyContent, identity),
  };
}

/**
 * Grid —— CSS Grid 原语(生产级 layout 组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 能力:columns(数字 → 等宽 repeat / 模板字符串 / 响应式断点对象)、minChildWidth 自适应列、
 * gap/rowGap/columnGap(间距 token,响应式)、align/justify(items)与 alignContent/justifyContent、
 * autoFlow / autoRows / autoColumns、inline-grid、容器查询模式;多态 as + asChild。
 *
 * 响应式靠「每断点一个 CSS 变量 + Grid.css 静态 @media/@container 级联」实现(条件里 var() 不生效),
 * 断点档对齐 tokens 视口断点。配套 Grid.Item(colSpan/rowSpan/colStart/rowStart,响应式)。
 * 样式见同目录 Grid.css,需引入 @magic-scope/react/styles.css。
 */
const GridRoot = forwardRef<HTMLDivElement, GridProps>((props, ref) => {
  const {
    columns,
    minChildWidth,
    gap,
    rowGap,
    columnGap,
    rows,
    autoRows,
    autoColumns,
    autoFlow,
    align,
    justify,
    alignContent,
    justifyContent,
    inline = false,
    container = false,
    as,
    asChild = false,
    className,
    style,
    ...rest
  } = props;

  const Tag = (as ?? 'div') as ElementType;

  const classes = [
    'ms-grid',
    inline && 'ms-grid--inline',
    container && 'ms-grid--container',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // 核心样式经 CSS 变量驱动,放在用户 style 之前 —— 用户 style 优先级更高仍可覆盖个别值。
  const mergedStyle: CSSProperties = {
    ...buildGridVars({
      columns,
      minChildWidth,
      gap,
      rowGap,
      columnGap,
      rows,
      autoRows,
      autoColumns,
      autoFlow,
      align,
      justify,
      alignContent,
      justifyContent,
    }),
    ...style,
  };

  if (asChild && isValidElement(rest.children)) {
    const child = rest.children as ReactElement<Record<string, unknown>>;
    const { children: _children, ...restNoChildren } = rest;
    const childRef = (child as { ref?: Ref<unknown> }).ref;
    const merged = mergeAsChildProps(
      { ...restNoChildren, className: classes, style: mergedStyle },
      child.props,
    );
    return cloneElement(child, {
      ...merged,
      ref: composeRefs(ref as Ref<unknown>, childRef),
    } as Record<string, unknown>);
  }

  return <Tag ref={ref} className={classes} style={mergedStyle} {...rest} />;
});
GridRoot.displayName = 'Grid';

/** Grid.Item 可用的多态标签子集(默认 div)。 */
type GridItemElement = 'div' | 'section' | 'article' | 'li' | 'header' | 'footer' | 'aside';

export interface GridItemOwnProps {
  /** 跨列:数字 → `span n`,或原生关键字(如 `"auto"`),响应式。 */
  colSpan?: Responsive<GridLineValue>;
  /** 跨行:数字 → `span n`,或原生关键字,响应式。 */
  rowSpan?: Responsive<GridLineValue>;
  /** 起始列网格线(数字或关键字),响应式。 */
  colStart?: Responsive<GridLineValue>;
  /** 起始行网格线(数字或关键字),响应式。 */
  rowStart?: Responsive<GridLineValue>;
  /** 自身块向对齐(align-self,覆盖父 align),响应式。 */
  alignSelf?: Responsive<AlignValue>;
  /** 自身行向对齐(justify-self,覆盖父 justify),响应式。 */
  justifySelf?: Responsive<AlignValue>;
  /** 多态:渲染为指定标签(默认 div)。 */
  as?: GridItemElement;
  /** 渲染为子元素并把样式/属性合并下去(Slot 风格)。 */
  asChild?: boolean;
}

export type GridItemProps = GridItemOwnProps &
  Omit<ComponentPropsWithoutRef<'div'>, keyof GridItemOwnProps>;

function buildItemVars(p: WithUndefined<GridItemOwnProps>): Record<string, string> {
  const identity = (v: string): string => v;
  return {
    ...spreadResponsive('item-col-span', p.colSpan, resolveSpan),
    ...spreadResponsive('item-row-span', p.rowSpan, resolveSpan),
    ...spreadResponsive('item-col-start', p.colStart, resolveStart),
    ...spreadResponsive('item-row-start', p.rowStart, resolveStart),
    ...spreadResponsive('item-align-self', p.alignSelf, identity),
    ...spreadResponsive('item-justify-self', p.justifySelf, identity),
  };
}

/**
 * Grid.Item —— Grid 子项定位原语。colSpan/rowSpan(数字→span)/colStart/rowStart 均支持响应式;
 * alignSelf/justifySelf 覆盖父级对齐。多态 as + asChild。可不用此组件,直接在任意子元素上用原生 grid-* 样式。
 */
export const GridItem = forwardRef<HTMLDivElement, GridItemProps>((props, ref) => {
  const {
    colSpan,
    rowSpan,
    colStart,
    rowStart,
    alignSelf,
    justifySelf,
    as,
    asChild = false,
    className,
    style,
    ...rest
  } = props;

  const Tag = (as ?? 'div') as ElementType;
  const classes = ['ms-grid__item', className].filter(Boolean).join(' ');

  const mergedStyle: CSSProperties = {
    ...buildItemVars({ colSpan, rowSpan, colStart, rowStart, alignSelf, justifySelf }),
    ...style,
  };

  if (asChild && isValidElement(rest.children)) {
    const child = rest.children as ReactElement<Record<string, unknown>>;
    const { children: _children, ...restNoChildren } = rest;
    const childRef = (child as { ref?: Ref<unknown> }).ref;
    const merged = mergeAsChildProps(
      { ...restNoChildren, className: classes, style: mergedStyle },
      child.props,
    );
    return cloneElement(child, {
      ...merged,
      ref: composeRefs(ref as Ref<unknown>, childRef),
    } as Record<string, unknown>);
  }

  return <Tag ref={ref} className={classes} style={mergedStyle} {...rest} />;
});
GridItem.displayName = 'Grid.Item';

/**
 * Grid 复合命名空间:`Grid` 既是根组件,又挂载 `Grid.Item` 子部件。
 * 同时保留具名导出 `GridItem`(便于 tree-shaking 与直接引用),与 ButtonGroup 范式一致。
 */
type GridComponent = typeof GridRoot & { Item: typeof GridItem };
export const Grid = GridRoot as GridComponent;
Grid.Item = GridItem;

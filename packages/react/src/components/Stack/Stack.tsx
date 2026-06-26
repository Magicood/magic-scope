import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import { Children, cloneElement, forwardRef, isValidElement } from 'react';
import { composeRefs, mergeAsChildProps } from '../../utils/compose';
import {
  buildStackVars,
  type Responsive,
  type SpaceToken,
  type StackAlign,
  type StackDirection,
  type StackJustify,
  type StackWrap,
} from './logic';

// 仅 re-export 带 Stack 前缀的专有类型(供消费方标注 props);
// 刻意不漏出 logic 里的通用名 Responsive / Breakpoint —— 它们与同批 layout 组件(Flex/Grid/Center)
// 的同名导出会在 components/index.ts 聚合层撞名,故把通用名约束在组件内部、不经 barrel 外泄。
export type {
  SpaceToken,
  StackAlign,
  StackDirection,
  StackJustify,
  StackWrap,
} from './logic';

/** Stack 自身 props(不含根标签原生属性,后者经多态 as 合并)。 */
export interface StackOwnProps {
  /** 多态根标签。默认 div。 */
  as?: ElementType;
  /**
   * 渲染为唯一子元素(Radix Slot 风格):把 Stack 的 class / style / 事件合并进子元素,
   * 不额外包一层 DOM。子元素需自带内容,且只能有一个。与 divider 互斥(无内部容器可间插)。
   */
  asChild?: boolean;
  /** 堆叠方向(响应式)。vertical 纵向(默认)| horizontal 横向。 */
  direction?: Responsive<StackDirection>;
  /** 子项间距档(响应式),映射 --ms-space-*;0 = 无间距。默认 4(1rem)。 */
  gap?: Responsive<SpaceToken>;
  /** 交叉轴对齐(响应式)。横向时控制竖直对齐,纵向时控制水平对齐。默认 stretch。 */
  align?: Responsive<StackAlign>;
  /** 主轴分布(响应式)。默认 start。 */
  justify?: Responsive<StackJustify>;
  /** 换行(响应式)。默认 nowrap。 */
  wrap?: Responsive<StackWrap>;
  /** 行内堆叠(inline-flex),让 Stack 随内容收缩、可并排于文本流。默认 false。 */
  inline?: boolean;
  /**
   * 在相邻子项之间插入分隔元素(如 <Divider /> 或任意 ReactNode)。
   * 用 Children 间插实现,分隔元素继承 Stack 方向(横向 Stack 给竖直分隔线)。
   * asChild 时忽略(无内部容器)。
   */
  divider?: ReactNode;
  /**
   * 递归反向:直接子 Stack 自动取相反方向(纵向父 → 横向子,反之亦然),
   * 便于零配置搭出「行内套列、列内套行」的交替栅格。仅作用于直接子 Stack。默认 false。
   */
  recursive?: boolean;
  children?: ReactNode;
}

/** 根标签原生属性 ∪ Stack 自身 props;同名以 Stack 为准(如 children)。 */
export type StackProps<E extends ElementType = 'div'> = StackOwnProps &
  Omit<ComponentPropsWithoutRef<E>, keyof StackOwnProps>;

const DIVIDER_CLASS = 'ms-stack__divider';

/**
 * 在子项之间间插 divider。保留每个子项的 key,divider 用稳定的索引 key。
 * 跳过 null/undefined/false 子项,避免在「条件渲染为空」的项两侧留下成对分隔线。
 */
function interleaveDivider(children: ReactNode, divider: ReactNode): ReactNode {
  // Children.toArray 给每个子项注入稳定 key(.$0 / .$自定义key),据此派生 divider 的稳定 key,
  // 避免用数组下标作 key(顺序变更会错位、影响 diff 与组件状态)。
  const items = (Children.toArray(children) as ReactElement[]).filter(
    (c) => c !== null && c !== undefined && (c as unknown) !== false && (c as unknown) !== '',
  );
  if (items.length <= 1) return items;
  const out: ReactNode[] = [];
  items.forEach((child, i) => {
    if (i > 0) {
      const prevKey = items[i - 1]?.key ?? String(i - 1);
      out.push(
        <span
          key={`ms-stack-divider-after-${prevKey}`}
          className={DIVIDER_CLASS}
          aria-hidden="true"
        >
          {divider}
        </span>,
      );
    }
    out.push(child);
  });
  return out;
}

/**
 * recursive:把直接子 Stack 的方向翻转(未显式指定 direction 时)。
 * 通过 cloneElement 注入翻转后的 direction,实现交替方向的零配置嵌套。
 */
function applyRecursive(children: ReactNode, parentDirection: StackDirection): ReactNode {
  const flipped: StackDirection = parentDirection === 'vertical' ? 'horizontal' : 'vertical';
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<StackOwnProps & { 'data-ms-stack'?: boolean }>;
    // 仅对子 Stack 生效:用 displayName 标记识别(Stack 渲染时挂 data-ms-stack)。
    const isStack =
      (el.type as { displayName?: string })?.displayName === 'Stack' ||
      el.props['data-ms-stack'] === true;
    if (!isStack) return child;
    if (el.props.direction !== undefined) return child; // 子已显式指定则不覆盖
    return cloneElement(el, { direction: flipped } as Partial<StackOwnProps>);
  });
}

/**
 * Stack —— 有主张的一维堆叠原语(layout 旗舰)。
 * flex 实现,纵/横向、间距 token、对齐、分布、换行、行内,全部支持「断点对象」响应式;
 * divider 子项间插、recursive 交替方向、多态 as、asChild Slot。自研零依赖,消费 @magic-scope/tokens 间距 token。
 * 样式见同目录 Stack.css,需引入 @magic-scope/react/styles.css。
 */
export const Stack = forwardRef<HTMLElement, StackProps>(
  (
    {
      as,
      asChild = false,
      direction = 'vertical',
      gap = 4,
      align = 'stretch',
      justify = 'start',
      wrap = 'nowrap',
      inline = false,
      divider,
      recursive = false,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    // 解析响应式 props → inline CSS 变量(纯逻辑层,可单测/可平移)。
    const vars = buildStackVars({ direction, gap, align, justify, wrap });
    // 用户 style 优先级最高,但核心布局靠 CSS 变量驱动(变量与用户 style 合并,用户可覆盖具体变量)。
    const mergedStyle: CSSProperties = { ...vars, ...style };

    const classes = ['ms-stack', inline && 'ms-stack--inline', className].filter(Boolean).join(' ');

    // base direction 用于 recursive 翻转 / divider 朝向(取断点对象的 base,或单值)。
    const baseDirection: StackDirection =
      typeof direction === 'object' ? (direction.base ?? 'vertical') : direction;

    let content = children;
    if (!asChild && recursive) content = applyRecursive(content, baseDirection);
    if (!asChild && divider != null) content = interleaveDivider(content, divider);

    // asChild:合并到唯一子元素(子元素自带内容),不额外包 DOM。divider/recursive 不适用。
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const merged = mergeAsChildProps(
        { ...rest, className: classes, style: mergedStyle, 'data-ms-stack': true },
        child.props,
      );
      return cloneElement(child, {
        ...merged,
        ref: composeRefs(ref as Ref<unknown>, childRef),
      } as Record<string, unknown>);
    }

    const Component = (as ?? 'div') as ElementType;

    return (
      <Component ref={ref} className={classes} style={mergedStyle} data-ms-stack={true} {...rest}>
        {content}
      </Component>
    );
  },
);
Stack.displayName = 'Stack';

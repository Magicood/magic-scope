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
  cx,
  defaultMarkerType,
  type ListMarkerType,
  type ListSpacing,
  type ListTone,
  type ListVariant,
  rootTagForVariant,
} from './logic';

export type { ListMarkerType, ListSpacing, ListTone, ListVariant };

/** List 关键子部件的 className 注入口(给用户精细定制内部节点)。 */
export interface ListClassNames {
  /** 列表项 <li>(unordered / ordered)。 */
  item?: string | undefined;
  /** 自定义标记容器(icon 模式下的 ::marker 替身)。 */
  marker?: string | undefined;
  /** 描述列表的 term <dt>。 */
  term?: string | undefined;
  /** 描述列表的 detail <dd>。 */
  detail?: string | undefined;
}

export interface ListOwnProps {
  /** 语义形态:unordered→ul / ordered→ol / description→dl。默认 unordered。 */
  variant?: ListVariant;
  /**
   * 标记:传 list-style-type 字符串(disc / decimal / lower-roman…)走原生 ::marker;
   * 传 ReactNode 则每项用该节点作自定义标记(list-style:none + 自绘标记列)。
   * 不传时按 variant 兜底(unordered=disc / ordered=decimal / description=none)。
   */
  marker?: ListMarkerType | ReactNode;
  /** 间距档(行距,随密度 --ms-density-scale 缩放)。默认 md。 */
  spacing?: ListSpacing;
  /** 语义色调(着色 ::marker 与自定义标记;复用 tone resolver 的 --ms-c)。 */
  tone?: ListTone;
  /** 标记发光(text-shadow,受全局 --ms-fx-glow 调制;data-ms-fx=off 时消失)。 */
  glow?: boolean | undefined;
  /** 标记位置:outside(默认,标记在内容框外)/ inside(标记随首行内嵌)。 */
  markerPosition?: 'outside' | 'inside';
  /** 多态渲染标签(覆盖 variant 推导的标签;少见,如语义化为 nav>ul 的内层)。 */
  as?: ElementType;
  /** 渲染为唯一子元素并合并样式/props(Slot 模式)。 */
  asChild?: boolean;
  /** 关键子部件 className 注入。 */
  classNames?: ListClassNames | undefined;
}

type ListRootTag = 'ul' | 'ol' | 'dl';

export type ListProps = ListOwnProps &
  Omit<ComponentPropsWithoutRef<ListRootTag>, keyof ListOwnProps>;

// 自定义标记(ReactNode)需要区分于 list-style-type 字符串
const isMarkerNode = (marker: unknown): marker is ReactNode =>
  isValidElement(marker) || (typeof marker !== 'string' && marker != null);

/**
 * List —— 列表排版旗舰(category: typography)。
 *
 * 一个 props 把三种语义列表(ul / ol / dl)、原生与自定义标记、间距密度、tone 着色、
 * 发光全收口。子部件走命名空间:`List.Item`(li)/ `List.Term`(dt)/ `List.Detail`(dd)。
 *
 * **嵌套友好**:List 嵌 List 时子列表标记/间距独立(CSS 不向下穿透),天然形成层级缩进。
 * **留口**:`forwardRef` 到根;`...rest` 透传所有原生属性与事件;`as`/`asChild` 多态;
 * `classNames` 注入关键子部件;魔法 glow 双降级(prefers-reduced-motion 不涉及,fx 总闸控制)。
 * 样式见 List.css + 共享 token(typography.css / tone.css / device.css 密度),需引入 styles.css。
 */
const ListRoot = forwardRef<HTMLElement, ListProps>(function List(
  {
    variant = 'unordered',
    marker,
    spacing = 'md',
    tone,
    glow,
    markerPosition = 'outside',
    as,
    asChild = false,
    classNames,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const customMarker = marker !== undefined && isMarkerNode(marker);
  const markerType = customMarker ? undefined : (marker as ListMarkerType | undefined);
  const effectiveType = markerType ?? defaultMarkerType(variant);

  // 标记着色 / 发光需要 tone 槽位;未显式给 tone 但要 glow 时兜底 primary
  const needsSlot = tone != null || glow === true;
  const effectiveTone = tone ?? (needsSlot ? 'primary' : undefined);

  const styleVars: Record<string, string> = {};
  // 原生 ::marker 走 list-style-type(自定义标记模式下置 none、由子项自绘)
  styleVars['--ms-list-marker-type'] = customMarker ? 'none' : effectiveType;

  const classes = cx(
    'ms-list',
    `ms-list--${variant}`,
    `ms-list--spacing-${spacing}`,
    `ms-list--marker-${markerPosition}`,
    customMarker && 'ms-list--custom-marker',
    effectiveTone && `ms-tone-${effectiveTone}`,
    tone && 'ms-list--toned',
    glow && 'ms-list--glow',
    className,
  );

  const mergedStyle: CSSProperties = {
    ...(styleVars as CSSProperties),
    ...style,
  };

  // 透传给子项:自定义标记模式把 marker 节点克隆进每个 List.Item(由其渲染进 aria-hidden 标记列);
  // 否则只注入子部件 classNames(item / term / detail)。非元素子节点(文本 / null)原样保留。
  const renderedChildren = customMarker
    ? injectCustomMarker(children, marker as ReactNode, classNames)
    : injectClassNames(children, classNames);

  // asChild:把样式与 props 合并到唯一子元素(Slot 模式,参照 Button/Text)
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

  const Comp = (as ?? rootTagForVariant(variant)) as ElementType;
  return (
    <Comp ref={ref} className={classes} style={mergedStyle} {...rest}>
      {renderedChildren}
    </Comp>
  );
});
ListRoot.displayName = 'List';

// —— 子部件 ——————————————————————————————————————————————

export interface ListItemProps extends ComponentPropsWithoutRef<'li'> {
  /** 渲染为唯一子元素并合并样式/props(Slot 模式,如包裹路由 Link)。 */
  asChild?: boolean;
  /** 自定义标记节点(由 List 在 marker 为 ReactNode 时注入;也可单项覆盖)。 */
  markerNode?: ReactNode;
  /** 自定义标记容器 className(由 List 的 classNames.marker 注入)。 */
  markerClassName?: string | undefined;
}

/** List.Item —— 列表项 <li>。自定义标记时把标记渲染进 aria-hidden 的标记列。 */
export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(function ListItem(
  { asChild = false, markerNode, markerClassName, className, children, ...rest },
  ref,
) {
  const classes = cx('ms-list__item', className);

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{
      className?: string;
      ref?: Ref<HTMLElement>;
    }>;
    const merged = mergeAsChildProps(
      { ...rest, className: classes },
      child.props as Record<string, unknown>,
    );
    return cloneElement(child, {
      ...merged,
      ref: composeRefs(ref as Ref<HTMLElement>, child.props.ref),
    } as Record<string, unknown>);
  }

  return (
    <li ref={ref} className={classes} {...rest}>
      {markerNode != null && (
        <span className={cx('ms-list__marker', markerClassName)} aria-hidden="true">
          {markerNode}
        </span>
      )}
      {markerNode != null ? <span className="ms-list__content">{children}</span> : children}
    </li>
  );
});
ListItem.displayName = 'List.Item';

export interface ListTermProps extends ComponentPropsWithoutRef<'dt'> {
  /** 渲染为唯一子元素并合并样式/props(Slot 模式)。 */
  asChild?: boolean;
}

/** List.Term —— 描述列表的术语 <dt>。 */
export const ListTerm = forwardRef<HTMLElement, ListTermProps>(function ListTerm(
  { asChild = false, className, children, ...rest },
  ref,
) {
  const classes = cx('ms-list__term', className);
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; ref?: Ref<HTMLElement> }>;
    const merged = mergeAsChildProps(
      { ...rest, className: classes },
      child.props as Record<string, unknown>,
    );
    return cloneElement(child, {
      ...merged,
      ref: composeRefs(ref, child.props.ref),
    } as Record<string, unknown>);
  }
  return (
    <dt ref={ref as Ref<HTMLElement>} className={classes} {...rest}>
      {children}
    </dt>
  );
});
ListTerm.displayName = 'List.Term';

export interface ListDetailProps extends ComponentPropsWithoutRef<'dd'> {
  /** 渲染为唯一子元素并合并样式/props(Slot 模式)。 */
  asChild?: boolean;
}

/** List.Detail —— 描述列表的释义 <dd>。 */
export const ListDetail = forwardRef<HTMLElement, ListDetailProps>(function ListDetail(
  { asChild = false, className, children, ...rest },
  ref,
) {
  const classes = cx('ms-list__detail', className);
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; ref?: Ref<HTMLElement> }>;
    const merged = mergeAsChildProps(
      { ...rest, className: classes },
      child.props as Record<string, unknown>,
    );
    return cloneElement(child, {
      ...merged,
      ref: composeRefs(ref, child.props.ref),
    } as Record<string, unknown>);
  }
  return (
    <dd ref={ref as Ref<HTMLElement>} className={classes} {...rest}>
      {children}
    </dd>
  );
});
ListDetail.displayName = 'List.Detail';

// —— 子节点注入工具(纯渲染,不出 logic.ts)————————————————————

/** 给直系 List.Item 注入自定义标记节点与 marker className(非 List.Item 子节点原样保留)。 */
function injectCustomMarker(
  children: ReactNode,
  markerNode: ReactNode,
  classNames: ListClassNames | undefined,
): ReactNode {
  return mapItems(children, (child) => {
    if (child.type !== ListItem) {
      // 非 List.Item(如嵌套 List 或裸 li)只补 item className,不强塞标记
      if (!classNames?.item) return child;
      const p = child.props as { className?: string };
      return cloneElement(child as ReactElement<{ className?: string }>, {
        className: cx(classNames.item, p.className),
      });
    }
    const childProps = child.props as ListItemProps;
    return cloneElement(child as ReactElement<ListItemProps>, {
      markerNode: childProps.markerNode ?? markerNode,
      markerClassName: childProps.markerClassName ?? classNames?.marker,
      className: cx(classNames?.item, childProps.className),
    });
  });
}

/** 只注入 classNames(item / term / detail),不动标记。 */
function injectClassNames(children: ReactNode, classNames: ListClassNames | undefined): ReactNode {
  if (!classNames?.item && !classNames?.term && !classNames?.detail) return children;
  return mapItems(children, (child) => {
    const childProps = child.props as { className?: string };
    let extra: string | undefined;
    if (child.type === ListItem) extra = classNames.item;
    else if (child.type === ListTerm) extra = classNames.term;
    else if (child.type === ListDetail) extra = classNames.detail;
    if (!extra) return child;
    return cloneElement(child as ReactElement<{ className?: string }>, {
      className: cx(extra, childProps.className),
    });
  });
}

/** 遍历直系子节点,对元素节点应用 fn(非元素如文本/null 原样保留)。
 * 用 Children.map 而非裸数组 map:它会自动生成稳定 key,避免克隆后丢 key 触发 React 警告。 */
function mapItems(children: ReactNode, fn: (child: ReactElement) => ReactNode): ReactNode {
  if (children == null) return children;
  return Children.map(children, (child) => (isValidElement(child) ? fn(child) : child));
}

// —— 命名空间挂载 ————————————————————————————————————————

// 把组合式子部件挂到 List 上(命名空间 API),并让导出类型携带子部件
// (否则 List.Item / List.Term / List.Detail 的类型不可见)。
type ListComponent = typeof ListRoot & {
  Item: typeof ListItem;
  Term: typeof ListTerm;
  Detail: typeof ListDetail;
};

const ListWithStatics = ListRoot as ListComponent;
ListWithStatics.Item = ListItem;
ListWithStatics.Term = ListTerm;
ListWithStatics.Detail = ListDetail;

/** List —— 带命名空间子部件(List.Item / List.Term / List.Detail)。 */
export const List = ListWithStatics;

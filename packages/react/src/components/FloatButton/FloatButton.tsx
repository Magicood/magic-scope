import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  PointerEvent as ReactPointerEvent,
  Ref,
} from 'react';
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { Tooltip, type TooltipPlacement, type TooltipTone } from '../Tooltip';
import {
  type FloatBadgeLike,
  type FloatButtonExpandDirection,
  type FloatButtonGroupTrigger,
  type FloatButtonShape,
  type FloatButtonType,
  prefersReducedMotion,
  resolveBadge,
  staggerDelay,
} from './logic';

export type {
  FloatBadgeLike,
  FloatButtonExpandDirection,
  FloatButtonGroupTrigger,
  FloatButtonShape,
  FloatButtonType,
} from './logic';

export type FloatButtonTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** badge:数字 / 小红点。数字(>0)显示计数,超 overflowCount 截断为 `N+`;dot 显示小红点。 */
export type FloatButtonBadge = FloatBadgeLike | number;

/** FloatButton 各部件的细粒度 className 槽位。 */
export interface FloatButtonClassNames {
  /** 内容包裹层(图标 + description)。 */
  body?: string | undefined;
  /** 图标槽位。 */
  icon?: string | undefined;
  /** 方形按钮内的文字 description 槽位。 */
  description?: string | undefined;
  /** badge(数字 / 点)槽位。 */
  badge?: string | undefined;
}

/** 单钮:button 与 anchor 两种宿主都可能透传的原生属性(交集,排除被内部接管的键)。 */
type FloatButtonHostProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>,
  'type' | 'children' | 'className' | 'style' | 'href' | 'target'
>;

export interface FloatButtonProps extends FloatButtonHostProps {
  /** 图标(默认内容)。 */
  icon?: ReactNode | undefined;
  /** 方形按钮内的文字(圆形按钮亦可,但方形更适配)。超长自动截断不撑破。 */
  description?: ReactNode | undefined;
  /** 提示文案:传入即用 Tooltip 包裹本钮(hover/focus 弹出)。 */
  tooltip?: ReactNode | undefined;
  /** tooltip 方位。默认 left(浮钮通常贴右下,提示朝左不出屏)。 */
  tooltipPlacement?: TooltipPlacement | undefined;
  /** 形状:圆形 / 方形(圆角)。默认 circle。 */
  shape?: FloatButtonShape | undefined;
  /** 类型:默认中性面 / 主色实底发光。默认 default。 */
  type?: FloatButtonType | undefined;
  /** 语义色调,经全库 tone resolver 派生配色与 glow。默认 primary。 */
  tone?: FloatButtonTone | undefined;
  /** 角标:数字(>0 显示,超 overflowCount 截为 `N+`)或 `{ dot: true }` 小红点。 */
  badge?: FloatButtonBadge | undefined;
  /** 传入即渲染为 `<a href>`(导航语义),否则渲染 `<button>`。 */
  href?: string | undefined;
  /** 链接打开方式(仅 href 时生效);`_blank` 自动补 rel 安全属性。 */
  target?: string | undefined;
  /**
   * 点击回调(button 与 a 都触发)。
   * @param event 点击的鼠标事件(button 上为 button 元素,href 时为 a 元素)。
   */
  onClick?: ((event: ReactMouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void) | undefined;
  /** 各部件细粒度 className 槽位。 */
  classNames?: FloatButtonClassNames | undefined;
  /** 透传到根元素的额外 className。 */
  className?: string | undefined;
  /** 透传到根元素的内联样式。 */
  style?: CSSProperties | undefined;
  /** 内容(等价 icon;同时给 icon 时以 icon 优先,children 作 description 兜底)。 */
  children?: ReactNode | undefined;
}

/** 默认占位图标(纯装饰加号图标,跟随 currentColor)。 */
function PlusRune() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

/**
 * 渲染单钮的内容(图标 + 方形内文字 + 角标),供 button / a 两种宿主复用。
 * badge 作纯视觉装饰(aria-hidden):计数 / 状态语义应进按钮可访问名(aria-label),
 * 避免读屏把孤立数字念成无意义内容。
 */
function renderBody(
  icon: ReactNode | undefined,
  description: ReactNode | undefined,
  badge: FloatButtonBadge | undefined,
  classNames: FloatButtonClassNames | undefined,
): ReactNode {
  const resolvedBadge = resolveBadge(badge);
  return (
    <>
      <span className={['ms-float-button__body', classNames?.body].filter(Boolean).join(' ')}>
        <span
          className={['ms-float-button__icon', classNames?.icon].filter(Boolean).join(' ')}
          aria-hidden="true"
        >
          {icon ?? <PlusRune />}
        </span>
        {description != null && (
          <span
            className={['ms-float-button__description', classNames?.description]
              .filter(Boolean)
              .join(' ')}
          >
            {description}
          </span>
        )}
      </span>
      {resolvedBadge !== null && (
        <span
          className={[
            'ms-float-button__badge',
            resolvedBadge.kind === 'dot' && 'ms-float-button__badge--dot',
            classNames?.badge,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        >
          {resolvedBadge.kind === 'count' ? resolvedBadge.text : null}
        </span>
      )}
    </>
  );
}

/**
 * FloatButton —— 悬浮操作钮(navigation,固定定位)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 单钮:圆/方形 × default/primary 类型 × 7 色调 tone(只读 6 槽位,零硬编码配色);可带 icon、方形内
 * description 文字(超长截断不撑破)、数字/点 badge;传 href 渲染 `<a>`(导航语义,_blank 自动补 rel)、
 * 否则 `<button>`;传 tooltip 自动用 Tooltip 包裹(hover/focus 弹出)。尺寸随 data-ms-density 缩放、
 * focus-visible 发光环;事件 composeEventHandlers 合并不丢用户处理器。
 * 配套 FloatButton.Group(堆叠 / 可展开菜单)。样式见同目录 FloatButton.css。
 */
const FloatButtonRoot = forwardRef<HTMLButtonElement | HTMLAnchorElement, FloatButtonProps>(
  (
    {
      icon,
      description,
      tooltip,
      tooltipPlacement = 'left',
      shape = 'circle',
      type = 'default',
      tone = 'primary',
      badge,
      href,
      target,
      onClick,
      classNames,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const classes = [
      'ms-float-button',
      `ms-float-button--${shape}`,
      `ms-float-button--${type}`,
      `ms-tone-${tone}`,
      description != null && 'ms-float-button--with-text',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // icon 优先,未给时回退 children 作图标内容;children 不再单独渲染避免重复。
    const iconContent = icon ?? children;
    const body = renderBody(iconContent, description, badge, classNames);

    let element: ReactElement;
    if (href !== undefined) {
      // _blank 默认补 rel 安全属性(可被用户显式 rel 覆盖)。
      const relProp = rest.rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined);
      element = (
        <a
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          style={style as CSSProperties}
          onClick={onClick}
          {...(target !== undefined ? { target } : {})}
          {...(relProp !== undefined ? { rel: relProp } : {})}
        >
          {body}
        </a>
      );
    } else {
      element = (
        <button
          {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
          ref={ref as Ref<HTMLButtonElement>}
          type="button"
          className={classes}
          style={style as CSSProperties}
          onClick={onClick}
        >
          {body}
        </button>
      );
    }

    if (tooltip != null) {
      return (
        <Tooltip content={tooltip} placement={tooltipPlacement} tone={tone as TooltipTone}>
          {element}
        </Tooltip>
      );
    }
    return element;
  },
);
FloatButtonRoot.displayName = 'FloatButton';

/** Group 根容器可透传的原生属性(排除被内部接管 / 重声明的键)。 */
type FloatButtonGroupHostProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'style' | 'onClick'
>;

export interface FloatButtonGroupProps extends FloatButtonGroupHostProps {
  /** 子项(多个 FloatButton),展开时沿 direction 弹出。 */
  children?: ReactNode | undefined;
  /** 展开触发方式:点击切换 / 悬停展开。默认 click。 */
  trigger?: FloatButtonGroupTrigger | undefined;
  /** 受控:是否展开。传入即进入受控模式。 */
  open?: boolean | undefined;
  /** 非受控初始展开态。默认 false。 */
  defaultOpen?: boolean | undefined;
  /**
   * 展开态变化回调(受控 / 非受控均触发)。
   * @param open 变化后的目标展开态:true 为展开,false 为收起。
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** 子项弹出方向。默认 up(贴右下时向上弹最稳)。 */
  direction?: FloatButtonExpandDirection | undefined;
  /** 形状:圆形 / 方形(同时作用触发钮与子项视觉)。默认 circle。 */
  shape?: FloatButtonShape | undefined;
  /** 触发钮类型。默认 primary(可展开菜单的主入口)。 */
  type?: FloatButtonType | undefined;
  /** 语义色调(触发钮)。默认 primary。 */
  tone?: FloatButtonTone | undefined;
  /** 收起态触发钮图标。默认加号图标。 */
  icon?: ReactNode | undefined;
  /** 展开态触发钮图标(收/展切换)。默认叉号图标。 */
  closeIcon?: ReactNode | undefined;
  /** 触发钮 tooltip(收起态提示)。 */
  tooltip?: ReactNode | undefined;
  /** 触发钮无障碍名(无可见文字时务必给;默认取 i18n)。 */
  'aria-label'?: string | undefined;
  /** 定位:距视口右侧距离(px)。默认 24。 */
  right?: number | undefined;
  /** 定位:距视口底部距离(px)。默认 24。 */
  bottom?: number | undefined;
  /** 错峰入场:相邻子项动画延时(ms)。默认 40,0 关闭。减弱动效时自动旁路。 */
  stagger?: number | undefined;
  /** 透传到根元素的额外 className。 */
  className?: string | undefined;
  /** 透传到根元素的内联样式。 */
  style?: CSSProperties | undefined;
}

/** 默认叉号图标(展开态触发钮,纯装饰)。 */
function CloseRune() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * FloatButton.Group —— 悬浮钮组(堆叠 / 可展开菜单)。固定定位,触发钮点击 / 悬停展开,
 * 子项沿 direction 纵向(或横向)错峰弹出;受控(open + onOpenChange)与非受控双通道。
 * a11y:触发钮 aria-expanded / aria-controls 关联子项面板;收起态子项 inert + 不可聚焦,
 * 展开态可 Tab 聚焦;Esc 收起。错峰入场在 reduced-motion / data-ms-motion=off 下自动降级。
 * 留口:触发钮 / 根全事件 compose 合并不丢用户处理器;...rest 透传根原生属性。
 */
const FloatButtonGroupRoot = forwardRef<HTMLDivElement, FloatButtonGroupProps>(
  (
    {
      children,
      trigger = 'click',
      open,
      defaultOpen = false,
      onOpenChange,
      direction = 'up',
      shape = 'circle',
      type = 'primary',
      tone = 'primary',
      icon,
      closeIcon,
      tooltip,
      'aria-label': ariaLabel,
      right = 24,
      bottom = 24,
      stagger = 40,
      className,
      style,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const t = useMessages();
    const reactId = useId();
    const safeId = reactId.replace(/[^a-zA-Z0-9_-]/g, '');
    const listId = `ms-float-group-${safeId}`;

    const isControlled = open !== undefined;
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isOpen = isControlled ? open : internalOpen;

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) {
          setInternalOpen(next);
        }
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );

    const groupRef = useRef<HTMLDivElement | null>(null);
    const setGroupRef = useCallback(
      (node: HTMLDivElement | null) => {
        groupRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as { current: HTMLDivElement | null }).current = node;
        }
      },
      [ref],
    );

    // —— 触发钮交互:click 切换显隐;hover 模式由容器层接管(见 rootHoverHandlers)——
    const triggerProps: Record<string, unknown> =
      trigger === 'click' ? { onClick: () => setOpen(!isOpen) } : {};

    // hover 模式:整个 group 容器响应 enter/leave(含子项区域),避免移到子项时误收。
    const rootHoverHandlers =
      trigger === 'hover'
        ? {
            onPointerEnter: composeEventHandlers<ReactPointerEvent<HTMLDivElement>>(
              onPointerEnter,
              () => setOpen(true),
            ),
            onPointerLeave: composeEventHandlers<ReactPointerEvent<HTMLDivElement>>(
              onPointerLeave,
              () => setOpen(false),
            ),
            onFocus: composeEventHandlers<ReactFocusEvent<HTMLDivElement>>(onFocus, () =>
              setOpen(true),
            ),
            onBlur: composeEventHandlers<ReactFocusEvent<HTMLDivElement>>(onBlur, (event) => {
              // 焦点移出整个 group 才收起(子项间移动不收)。
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setOpen(false);
              }
            }),
          }
        : {
            onPointerEnter,
            onPointerLeave,
            onFocus,
            onBlur,
          };

    // Esc 收起(展开态);键盘可达兜底。
    const onKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape' && isOpen) {
          event.stopPropagation();
          setOpen(false);
        }
      },
      [isOpen, setOpen],
    );

    // reduced-motion 判定放进 state:首帧按 SSR 一致的 false(有动效,不闪),
    // 挂载后再读浏览器环境修正。render 期不碰 window/document,保证注水一致。
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
      setReduced(prefersReducedMotion());
    }, []);

    // 子项:注入错峰延时 + 收起态不可聚焦(tabIndex=-1),保留各自原有 props。
    // 仅对 FloatButton 宿主子项注入框架专属 prop(shape/tone),非 FloatButton 子项
    // (div/a/span 等)只注通用 tabIndex/style,避免 React unknown prop 告警 + DOM 残留。
    const items = Children.toArray(children).filter(isValidElement);
    const renderedItems = items.map((child, index) => {
      const element = child as ReactElement<{
        style?: CSSProperties;
        tabIndex?: number;
        tone?: FloatButtonTone;
        shape?: FloatButtonShape;
      }>;
      const delay = staggerDelay(index, isOpen, reduced ? 0 : stagger);
      const childStyle = element.props.style;
      const isFloatButtonChild = element.type === FloatButtonRoot;
      const commonProps: Record<string, unknown> = {
        key: element.key ?? index,
        style: {
          ...childStyle,
          '--ms-float-item-delay': `${delay}ms`,
        } as CSSProperties,
        // 收起态移出 tab 序(配合 CSS inert 视觉),展开态恢复。
        tabIndex: isOpen ? element.props.tabIndex : -1,
      };
      const nextProps: Record<string, unknown> = isFloatButtonChild
        ? {
            ...commonProps,
            // 子项形状未显式给时继承 Group(可被子项自身覆盖)。
            shape: element.props.shape ?? shape,
          }
        : commonProps;
      return cloneElement(element, nextProps);
    });

    // inert:仅收起态条件 spread inert={true},展开态完全不渲染该属性。
    // 不用受控布尔 inert={!isOpen}:React 18.0–18.2 把 inert={false} 渲染成 inert="false"
    // (布尔属性「存在即生效」),会让展开态列表对 AT 永久隐藏。条件 spread 两版本皆安全。
    const inertProps: Pick<HTMLAttributes<HTMLUListElement>, 'inert'> = !isOpen
      ? { inert: true }
      : {};

    const closeIconResolved = closeIcon ?? <CloseRune />;
    const resolvedAriaLabel = ariaLabel ?? t('select.placeholder', undefined, '更多操作');

    const triggerButton = (
      <button
        type="button"
        className={[
          'ms-float-button',
          'ms-float-button__group-trigger',
          `ms-float-button--${shape}`,
          `ms-float-button--${type}`,
          `ms-tone-${tone}`,
        ].join(' ')}
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={resolvedAriaLabel}
        {...triggerProps}
      >
        <span className="ms-float-button__body">
          <span className="ms-float-button__icon" aria-hidden="true">
            <span className="ms-float-button__trigger-icon ms-float-button__trigger-icon--open">
              {icon ?? <PlusRune />}
            </span>
            <span className="ms-float-button__trigger-icon ms-float-button__trigger-icon--close">
              {closeIconResolved}
            </span>
          </span>
        </span>
      </button>
    );

    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: speed-dial 容器仅做事件委托 —— Esc 由内部可聚焦的 trigger/子项冒泡而来;hover 展开委托整个区域防误收。真正的交互语义在内部 <button>(aria-expanded/controls),容器本身不该有 role
      <div
        {...rest}
        ref={setGroupRef}
        className={[
          'ms-float-button-group',
          `ms-float-button-group--${direction}`,
          isOpen && 'ms-float-button-group--open',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-open={isOpen ? '' : undefined}
        style={
          {
            '--ms-float-group-right': `${right}px`,
            '--ms-float-group-bottom': `${bottom}px`,
            ...style,
          } as CSSProperties
        }
        onKeyDown={onKeyDown}
        {...rootHoverHandlers}
      >
        <ul
          id={listId}
          className="ms-float-button-group__list"
          // 收起态对辅助技术与焦点隐藏(inert);见上方 inertProps 注释 —— 条件 spread,
          // 仅收起态注入,展开态完全不渲染该属性,规避 React 18.0–18.2 的 inert="false" 残留。
          {...inertProps}
        >
          {renderedItems.map((node, index) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: 子项无稳定 id,顺序即语义,索引可作 key
              key={index}
              className="ms-float-button-group__item"
            >
              {node}
            </li>
          ))}
        </ul>
        {tooltip != null ? (
          <Tooltip content={tooltip} placement="left" tone={tone as TooltipTone}>
            {triggerButton}
          </Tooltip>
        ) : (
          triggerButton
        )}
      </div>
    );
  },
);
FloatButtonGroupRoot.displayName = 'FloatButton.Group';

/** FloatButton 复合组件:单钮 + FloatButton.Group(堆叠 / 可展开菜单)。 */
export const FloatButton = Object.assign(FloatButtonRoot, { Group: FloatButtonGroupRoot });
export { FloatButtonGroupRoot as FloatButtonGroup };

import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ForwardRefExoticComponent,
  ReactElement,
  FocusEvent as ReactFocusEvent,
  ReactNode,
  PointerEvent as ReactPointerEvent,
  Ref,
  RefAttributes,
} from 'react';
import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { composeEventHandlers, mergeAsChildProps } from '../../utils/compose';
import {
  computeEnterIntent,
  computeLeaveIntent,
  type HoverCardPlacement,
  type HoverZone,
  isCoarseNoHover,
  isNativelyFocusable,
  normalizePlacement,
  placementToAlign,
  placementToArea,
  placementToSide,
  resolveOpen,
} from './logic';

export type { HoverCardPlacement, HoverCardSide } from './logic';

export type HoverCardTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** anchor-name / position-anchor 不在标准 CSSProperties，这里做最小扩展。 */
interface AnchorStyle extends CSSProperties {
  anchorName?: string | undefined;
  positionAnchor?: string | undefined;
  [key: `--${string}`]: string | number | undefined;
}

/** 内容卡各部件的细粒度 className 槽位。 */
export interface HoverCardClassNames {
  /** 浮层根容器 .ms-hover-card（top-layer 元素)。 */
  root?: string | undefined;
  /** 卡片面板 .ms-hover-card__panel。 */
  panel?: string | undefined;
  /** 指向箭头 .ms-hover-card__arrow。 */
  arrow?: string | undefined;
}

interface HoverCardContextValue {
  /** 当前是否打开。 */
  open: boolean;
  /**
   * 内容卡是否「有效可见」= open && !coarse。
   * 触屏(coarse)下卡片被吞成不可见且置 inert，此时 trigger 不应再暴露 aria-describedby
   * (否则指向一个 inert / 不可达节点 → 悬空引用)。Trigger 的 aria-describedby 据此判定。
   */
  describable: boolean;
  /** 内容卡 id（供 trigger aria-describedby 关联)。 */
  contentId: string;
  /** trigger 与内容卡共用的 anchor-name（CSS Anchor Positioning)。 */
  anchorName: string;
  /** 触屏（无 hover）环境：HoverCard 主要靠 hover，触屏降级提示。 */
  coarse: boolean;
  /** 注册 trigger DOM 节点（zone 命中判定 / 焦点回收需要)。 */
  setTriggerEl: (node: HTMLElement | null) => void;
  /** 注册 content DOM 节点（zone 命中判定 / 桥接需要)。 */
  setContentEl: (node: HTMLElement | null) => void;
  /** 进入某活跃区（pointerenter / focus）：按 openDelay 安排打开。 */
  onEnter: (zone: HoverZone) => void;
  /** 离开某活跃区（pointerleave / blur）：按去向做桥接判定 + closeDelay 安排关闭。 */
  onLeave: (event: ReactPointerEvent | ReactFocusEvent, from: HoverZone) => void;
}

const HoverCardContext = createContext<HoverCardContextValue | null>(null);

/** 子部件在 <HoverCard> 之外渲染时给出清晰报错（而非静默 null 解构崩溃)。 */
function useHoverCardContext(component: string): HoverCardContextValue {
  const ctx = useContext(HoverCardContext);
  if (ctx === null) {
    throw new Error(`<HoverCard.${component}> 必须渲染在 <HoverCard> 内部。`);
  }
  return ctx;
}

/** 把 relatedTarget（指针去向 / 焦点去向）解析成所属活跃区。 */
function resolveZone(
  related: EventTarget | null,
  triggerEl: HTMLElement | null,
  contentEl: HTMLElement | null,
): HoverZone {
  // 只接受真正的 Node:relatedTarget 可能是 window / null / 非 Node 的 EventTarget,
  // 直接喂给 Node.contains 会抛 "parameter 1 is not of type 'Node'"。
  if (related instanceof Node) {
    if (triggerEl?.contains(related)) return 'trigger';
    if (contentEl?.contains(related)) return 'content';
  }
  return 'outside';
}

export interface HoverCardProps {
  /** 复合子树：<HoverCard.Trigger> + <HoverCard.Content>。 */
  children: ReactNode;
  /** 受控：是否打开。传入即进入受控模式（配合 onOpenChange)。 */
  open?: boolean | undefined;
  /** 非受控初始打开态。默认 false。 */
  defaultOpen?: boolean | undefined;
  /** hover / focus 到打开的延时（毫秒)。默认 700。 */
  openDelay?: number | undefined;
  /** 移出到关闭的延时（毫秒，给指针穿越间隙留宽限)。默认 300。 */
  closeDelay?: number | undefined;
  /**
   * 显隐变化回调（受控 / 非受控均触发)。
   * @param open 变化后的目标显隐状态：true 为打开，false 为关闭。
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
}

interface HoverCardComponent
  extends ForwardRefExoticComponent<HoverCardProps & RefAttributes<HTMLDivElement>> {
  Trigger: typeof HoverCardTrigger;
  Content: typeof HoverCardContent;
}

/**
 * HoverCard —— 悬停富预览卡（overlay，旗舰深度)。自研、零依赖，消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 复合结构：`HoverCard`（根，管开合 + 定时器 + 桥接)+ `HoverCard.Trigger`（asChild 注入到链接 / 头像)
 * + `HoverCard.Content`（富内容卡，placement / arrow / tone)。
 *
 * 与 Tooltip 的本质区别：HoverCard 承载**可交互富内容**（链接、按钮、图文)，是「补充信息」而非对话框 ——
 * **不抢焦、不困焦**(role 非 dialog，打开时焦点不转移进卡内)，trigger 经 aria-describedby 关联内容卡。
 *
 * 深度：
 * - 定位：CSS Anchor Positioning —— trigger 设 anchor-name(useId 唯一名)，卡片 position-anchor + position-area 贴合；
 *   12 向 placement(四主轴 × 居中/start/end)+ offset 间距 + 可选指向箭头(随主轴翻面)；@supports not 时降级居中(见 .css)。
 * - 进 top-layer：原生 Popover API(popover="manual"，组件接管 light-dismiss)，不支持时靠 data-open 兜底。
 * - 交互：hover trigger 延时 openDelay(默认 700)打开；移开延时 closeDelay(默认 300)关闭；
 *   指针可从 trigger 移入卡内而不关闭(纯逻辑 computeLeaveIntent 做「去向仍在活跃区→桥接不关」判定)。
 *   键盘 focus 也打开(可达性)，Esc 即时关闭。
 * - tone 色调经全库 tone resolver 驱动卡片边框 / 发光 / 箭头(只读 6 槽位)。
 * - 受控(open + onOpenChange)/ 非受控(defaultOpen)双通道。
 *
 * 留口 / 降级：
 * - Trigger asChild：把交互 / aria / ref / anchor 注入到用户自己的元素(链接 / Avatar)，全事件 compose 不丢用户处理器。
 *   children 为非原生可聚焦元素(如 <span> / 无 href 的自定义 Avatar)时自动注入 tabindex=0，保纯键盘 / AT 可达(focus-to-open 不丢)。
 * - Content spread ...rest 透传原生属性 / 事件；classNames 细粒度槽位。
 * - 触屏(无 hover)：诚实降级 —— 不靠 hover，建议改用点击触发的 Popover；触屏下 Content 自动 inert 隐藏，避免无法触达的悬空卡；
 *   且 trigger 不再暴露指向卡片的 aria-describedby(卡片 inert / 不可达，免悬空 ARIA 引用)。
 * - 无原生 Popover API 的浏览器：关闭态卡片显式置 inert —— 支持 Popover 时由 UA 规则 [popover]:not(:popover-open){display:none} 移出 tab 序；
 *   兜底分支该 UA 规则不生效，故组件主动 inert，把关闭态卡内链接 / 按钮真正移出 tab / a11y 树，杜绝「隐藏可聚焦元素」缺陷。
 * - 尊重 prefers-reduced-motion 与 [data-ms-motion=off](去位移/去过渡)、[data-ms-fx=off](去光晕)。
 * 样式见同目录 HoverCard.css，需引入 @magic-scope/react/styles.css。
 */
const HoverCardRoot = forwardRef<HTMLDivElement, HoverCardProps>(
  (
    {
      children,
      open: controlledOpen,
      defaultOpen = false,
      openDelay = 700,
      closeDelay = 300,
      onOpenChange,
    },
    _ref,
  ) => {
    const reactId = useId();
    // anchor-name / DOM id 不便含冒号，剥离非法字符；trigger 与内容卡共用一套 id。
    const safeId = reactId.replace(/[^a-zA-Z0-9_-]/g, '');
    const anchorName = `--ms-hover-card-${safeId}`;
    const contentId = `ms-hover-card-${safeId}`;

    const triggerElRef = useRef<HTMLElement | null>(null);
    const contentElRef = useRef<HTMLElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isControlled = controlledOpen !== undefined;
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const open = resolveOpen(controlledOpen, internalOpen);

    // coarse(无 hover)只在挂载后探测一次：HoverCard 是渐进增强，触屏降级。SSR 安全。
    const [coarse, setCoarse] = useState(false);
    useEffect(() => {
      setCoarse(isCoarseNoHover());
    }, []);

    const clearTimer = useCallback(() => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) {
          setInternalOpen(next);
        }
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );

    // 带延时的开合;延时为 0 立即同步(避免无谓的一帧延迟)。
    const schedule = useCallback(
      (next: boolean, delay: number) => {
        clearTimer();
        if (delay > 0) {
          timerRef.current = setTimeout(() => setOpen(next), delay);
        } else {
          setOpen(next);
        }
      },
      [clearTimer, setOpen],
    );

    const setTriggerEl = useCallback((node: HTMLElement | null) => {
      triggerElRef.current = node;
    }, []);
    const setContentEl = useCallback((node: HTMLElement | null) => {
      contentElRef.current = node;
    }, []);

    // 进入 trigger / content:按 openDelay 安排打开(纯逻辑判 zone → next/delay)。
    // 触屏(无 hover)不靠 hover 触发,避免悬空卡。
    const onEnter = useCallback(
      (zone: HoverZone) => {
        if (coarse) {
          return;
        }
        const { next, delay } = computeEnterIntent(zone, openDelay);
        if (next !== null) {
          schedule(next, delay);
        }
      },
      [coarse, openDelay, schedule],
    );

    // 离开 trigger / content:按去向(relatedTarget 命中)做桥接判定。
    // 去向仍在活跃区内 → 不关(交对侧 enter 维持);否则按 closeDelay 安排关闭。
    const onLeave = useCallback(
      (event: ReactPointerEvent | ReactFocusEvent, from: HoverZone) => {
        if (coarse) {
          return;
        }
        const related = (event as { relatedTarget?: EventTarget | null }).relatedTarget ?? null;
        const to = resolveZone(related, triggerElRef.current, contentElRef.current);
        const { next, delay } = computeLeaveIntent(from, to, closeDelay);
        if (next !== null) {
          schedule(next, delay);
        }
      },
      [coarse, closeDelay, schedule],
    );

    // Esc 即时关闭(popover="manual" 不自带 light-dismiss)。
    useEffect(() => {
      if (!open) {
        return;
      }
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          clearTimer();
          setOpen(false);
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, clearTimer, setOpen]);

    // 卸载时清掉定时器。
    useEffect(() => clearTimer, [clearTimer]);

    const ctx = useMemo<HoverCardContextValue>(
      () => ({
        open,
        // 与 Content 的 visible 语义一致:触屏下不暴露 aria-describedby,避免悬空引用。
        describable: open && !coarse,
        contentId,
        anchorName,
        coarse,
        setTriggerEl,
        setContentEl,
        onEnter,
        onLeave,
      }),
      [open, contentId, anchorName, coarse, setTriggerEl, setContentEl, onEnter, onLeave],
    );

    return <HoverCardContext.Provider value={ctx}>{children}</HoverCardContext.Provider>;
  },
);
HoverCardRoot.displayName = 'HoverCard';

/** Trigger 原有的可能被合并的属性。 */
interface TriggerOwnProps {
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
  tabIndex?: number;
  href?: string;
  onPointerEnter?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave?: (event: ReactPointerEvent<HTMLElement>) => void;
  onFocus?: (event: ReactFocusEvent<HTMLElement>) => void;
  onBlur?: (event: ReactFocusEvent<HTMLElement>) => void;
}

export interface HoverCardTriggerProps {
  /** 触发元素（单个 React 元素，通常是链接 / 头像)。被注入交互 / aria / anchor / ref。 */
  children: ReactElement;
}

/**
 * HoverCard.Trigger —— 触发器（asChild 注入)。把交互(pointerenter/leave、focus/blur)、
 * anchor-name、aria-describedby(打开时关联内容卡，作「补充信息」而非弹窗角色)、ref 注入到用户自己的元素。
 * 全事件经 composeEventHandlers 合并 —— 用户在自己的处理器里 preventDefault 可阻断内部开合。
 */
export const HoverCardTrigger = forwardRef<HTMLElement, HoverCardTriggerProps>(
  ({ children }, ref) => {
    const { describable, contentId, anchorName, setTriggerEl, onEnter, onLeave } =
      useHoverCardContext('Trigger');

    if (!isValidElement(children)) {
      return null;
    }
    const child = children as ReactElement<TriggerOwnProps>;
    const childProps = child.props;

    // 合并 child 原有 ref + 外部 forwardRef + 本组件 triggerEl 注册。
    // React 19 把 ref 放进 props.ref;旧版在 element.ref。两处都兼容。
    const childRef = childProps.ref ?? (child as { ref?: Ref<HTMLElement> }).ref;
    const setRef = (node: HTMLElement | null) => {
      setTriggerEl(node);
      if (typeof childRef === 'function') childRef(node);
      else if (childRef) (childRef as { current: HTMLElement | null }).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: HTMLElement | null }).current = node;
    };

    // anchor-name 与用户自带 style 合并:把 anchorName 放最后,确保它不被用户 style 覆盖。
    // 关键:mergeAsChildProps 的 style 合并是 { ...parentStyle, ...childStyle }(child 在后、会覆盖),
    // 若只把 { anchorName } 当 parent 交给它,用户若在 style 里带 anchorName(或同名 CSS 变量)就会盖掉锚点
    // → position-anchor 失配 → 卡片掉到 top-layer 左上角。故这里先自行合并好(anchorName 殿后),
    // 再作为单一 style 注入,且不把 style 列入 mergeAsChildProps 的 compose 路径让 child 再次覆盖。
    const mergedStyle: AnchorStyle = {
      ...(childProps.style as CSSProperties | undefined),
      anchorName,
    };

    // 只放「内部」处理器与注入属性;与 child 自带处理器的 compose 交给 mergeAsChildProps
    // (它会 child-first → 内部 的顺序 compose,用户 preventDefault 即阻断内部)。
    // 不在这里预先 compose,否则会与 mergeAsChildProps 二次合并导致 child handler 触发两次。
    const injected: Record<string, unknown> = {
      ref: setRef,
      // 补充信息关联:卡片「有效可见」(open && !coarse)时 trigger aria-describedby 指向内容卡。
      // 仅看裸 open 会在触屏(coarse)下指向一张 inert / 不可达的卡 → 悬空引用,故用 describable。
      'aria-describedby': describable ? contentId : undefined,
      style: mergedStyle,
      onPointerEnter: () => onEnter('trigger'),
      onPointerLeave: (event: ReactPointerEvent) => onLeave(event, 'trigger'),
      // 键盘可达:聚焦也打开、失焦也走桥接关闭判定。
      onFocus: () => onEnter('trigger'),
      onBlur: (event: ReactFocusEvent) => onLeave(event, 'trigger'),
    };

    // children 非原生可聚焦(如 <span>头像</span> / 无 href 的自定义 Avatar)时,
    // 注入 tabindex=0 保键盘 / AT 可达,否则纯键盘用户聚焦不到 trigger → focus-to-open 永远触发不了。
    // 用户已显式给 tabIndex 则尊重其值(isNativelyFocusable 已纳入此判断)。
    if (!isNativelyFocusable(child.type, childProps)) {
      injected.tabIndex = childProps.tabIndex ?? 0;
    }

    // mergeAsChildProps:on* 两边都有则 compose(child 先、injected 后);其它属性 child 优先(留住 href 等)。
    // style 已在上面手动合并为 mergedStyle(anchorName 殿后),故从交给 mergeAsChildProps 的 childProps 里
    // 剔除 style,避免它再做 { ...injected.style, ...child.style } 把用户 style 二次叠到 anchorName 之后覆盖锚点。
    const { style: _childStyle, ...childPropsForMerge } = childProps as Record<string, unknown>;
    return cloneElement(child, mergeAsChildProps(injected, childPropsForMerge));
  },
);
HoverCardTrigger.displayName = 'HoverCard.Trigger';

/** 内容卡根容器可透传的原生属性（排除会被内部接管 / 与本组件槽位冲突的键)。 */
type ContentRootProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'role' | 'id' | 'className' | 'style' | 'children'
>;

export interface HoverCardContentProps extends ContentRootProps {
  /** 卡片内容（可含链接 / 按钮等可交互富内容)。 */
  children: ReactNode;
  /** 卡片相对 trigger 的方位（12 向)。默认 bottom。 */
  placement?: HoverCardPlacement | undefined;
  /** 卡片与 trigger 的间距（像素)。默认 8。 */
  offset?: number | undefined;
  /** 是否显示指向箭头。默认 false。 */
  arrow?: boolean | undefined;
  /** 语义色调，经全库 tone resolver 派生卡片边框 / 发光 / 箭头。默认 neutral。 */
  tone?: HoverCardTone | undefined;
  /** 透传到卡片根的额外 className。 */
  className?: string | undefined;
  /** 各部件细粒度 className 槽位。 */
  classNames?: HoverCardClassNames | undefined;
}

/**
 * HoverCard.Content —— 富内容卡（浮层)。原生 Popover API 进 top-layer + CSS Anchor Positioning 贴合 trigger。
 *
 * **不是 dialog**：role 缺省(普通分组容器)、aria-modal 不设、不抢焦不困焦 —— 它是补充信息层，
 * 打开时焦点留在 trigger，卡内交互元素仍可正常 Tab 进出。指针 / 焦点在 trigger ↔ 卡之间移动经桥接逻辑不闪关。
 * 触屏(无 hover)下置 inert 并隐藏，避免无法关闭的悬空卡(诚实降级:触屏请改用点击触发的 Popover)。
 */
export const HoverCardContent = forwardRef<HTMLDivElement, HoverCardContentProps>(
  (
    {
      children,
      placement = 'bottom',
      offset = 8,
      arrow = false,
      tone = 'neutral',
      className,
      classNames,
      ...rest
    },
    ref,
  ) => {
    const { open, contentId, anchorName, coarse, setContentEl, onEnter, onLeave } =
      useHoverCardContext('Content');

    const localRef = useRef<HTMLDivElement | null>(null);

    const resolvedPlacement = normalizePlacement(placement);
    const side = placementToSide(resolvedPlacement);
    const align = placementToAlign(resolvedPlacement);

    // 把 open 同步到原生 popover 显隐;不支持 Popover API 的浏览器靠 data-open 兜底。
    useEffect(() => {
      const el = localRef.current;
      if (!el) {
        return;
      }
      const supportsPopover =
        typeof el.showPopover === 'function' && typeof el.hidePopover === 'function';
      // 触屏(无 hover):不展示(降级),即便受控 open=true 也吞掉,避免悬空卡。
      const visible = open && !coarse;
      if (visible) {
        el.dataset.open = 'true';
        if (supportsPopover && !el.matches(':popover-open')) {
          try {
            el.showPopover();
          } catch {
            // 已显示 / 不支持:忽略,靠 data-open 控制可见性。
          }
        }
      } else {
        delete el.dataset.open;
        if (supportsPopover && el.matches(':popover-open')) {
          try {
            el.hidePopover();
          } catch {
            // 已隐藏:忽略。
          }
        }
      }
      // a11y / tab 序兜底:
      // - 支持 Popover API 的浏览器,关闭态靠 UA 规则 [popover]:not(:popover-open){display:none}
      //   把卡片移出 tab 序,无需 inert。
      // - 不支持 Popover API 的兜底分支,popover 属性被忽略、该 UA 规则不生效,关闭态卡片仅靠
      //   CSS opacity/pointer-events 隐藏 → 卡内链接 / 按钮仍在 tab 序、仍被 AT 朗读(隐藏可聚焦缺陷)。
      //   故此处对「不可见且无原生 Popover」的兜底路径显式置 inert,真正移出 a11y / tab 树。
      // - 触屏(coarse)无论是否支持 Popover 都置 inert(避免无法关闭的悬空卡;与 JSX 静态 inert 一致)。
      const shouldInert = coarse || (!visible && !supportsPopover);
      // 用属性而非 .inert 属性写入:既能反映到可被测试 / AT 观察的 [inert] 属性,
      // 又在浏览器里真正生效(inert 属性反射为 idl 属性,从 a11y / tab 树摘除整棵子树)。
      if (shouldInert) {
        el.setAttribute('inert', '');
      } else {
        el.removeAttribute('inert');
      }
    }, [open, coarse]);

    const setRef = (node: HTMLDivElement | null) => {
      localRef.current = node;
      setContentEl(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
    };

    const rootClassName = [
      'ms-hover-card',
      `ms-hover-card--${side}`,
      `ms-tone-${tone}`,
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(' ');
    const panelClassName = ['ms-hover-card__panel', classNames?.panel].filter(Boolean).join(' ');
    const arrowClassName = ['ms-hover-card__arrow', classNames?.arrow].filter(Boolean).join(' ');

    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: HoverCard 内容卡是「补充信息」层而非 dialog,刻意不挂 role(不抢焦不困焦,符合 Radix HoverCard 语义);pointerenter/leave/focus/blur 仅用于 trigger ↔ 卡之间的 hover 桥接记账(防误关),真正的交互角色由卡内的链接 / 按钮承载,容器本身不该有交互 role
      <div
        {...rest}
        ref={setRef}
        id={contentId}
        // manual:不让浏览器自带 light-dismiss,关闭统一走组件桥接 / Esc 逻辑。
        popover="manual"
        // inert 由上方 useEffect 统一管理(单一真相源):触屏(coarse)恒置 inert;
        // 不支持原生 Popover 的兜底分支关闭态也置 inert,移出 a11y / tab 树(避免隐藏可聚焦元素缺陷)。
        // 不在 JSX 声明 inert,免与 effect 的 DOM 写入相互覆盖。
        data-ms-side={side}
        data-ms-align={align}
        className={rootClassName}
        style={
          {
            positionAnchor: anchorName,
            '--ms-hover-card-area': placementToArea(resolvedPlacement),
            '--ms-hover-card-offset': `${offset}px`,
          } as AnchorStyle
        }
        // 卡片自身也响应 pointerenter/leave,形成 trigger ↔ 卡桥接防误关;
        // compose 用户经 ...rest 传到根的处理器(先用户、未拦截再走桥接),不覆盖丢弃。
        onPointerEnter={composeEventHandlers(rest.onPointerEnter, () => onEnter('content'))}
        onPointerLeave={composeEventHandlers(rest.onPointerLeave, (event) =>
          onLeave(event, 'content'),
        )}
        // 卡内元素聚焦/失焦也维持开合(键盘从 trigger Tab 进卡内不关、Tab 出卡走桥接判定)。
        onFocus={composeEventHandlers(rest.onFocus, () => onEnter('content'))}
        onBlur={composeEventHandlers(rest.onBlur, (event) => onLeave(event, 'content'))}
      >
        <div className={panelClassName}>
          {children}
          {arrow && <span className={arrowClassName} aria-hidden="true" />}
        </div>
      </div>
    );
  },
);
HoverCardContent.displayName = 'HoverCard.Content';

export const HoverCard = HoverCardRoot as HoverCardComponent;
HoverCard.Trigger = HoverCardTrigger;
HoverCard.Content = HoverCardContent;

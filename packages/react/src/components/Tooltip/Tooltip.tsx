import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  FocusEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  PointerEvent as ReactPointerEvent,
  Ref,
} from 'react';
import {
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { composeEventHandlers } from '../../utils/compose';
import {
  isCoarseNoHover,
  isNativelyFocusable,
  normalizePlacement,
  placementToAlign,
  placementToArea,
  placementToSide,
  type TooltipPlacement,
} from './logic';

export type { TooltipPlacement, TooltipSide } from './logic';

export type TooltipTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * 气泡根容器可透传的原生属性(气泡是 <div role="tooltip">,排除会被内部接管的键)。
 * 额外排除 'content':原生 HTML 有同名 content 属性(string),会与本组件的 ReactNode content 槽位冲突,
 * 故 Omit 掉后由 TooltipProps 重声明为 ReactNode。
 */
type TooltipRootProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'role' | 'id' | 'children' | 'className' | 'style' | 'content'
>;

export interface TooltipProps extends TooltipRootProps {
  /** 提示内容。 */
  content: ReactNode;
  /** 单个触发元素(将被克隆以注入事件 / anchor / aria)。 */
  children: ReactElement;
  /**
   * 气泡相对 trigger 的方位。支持四主轴 ×(居中 / -start / -end)共 12 向。默认 "top"。
   * 旧值 "top" / "bottom" 仍合法,向后兼容。
   */
  placement?: TooltipPlacement;
  /** 气泡与 trigger 的间距(像素)。默认 8。 */
  offset?: number;
  /** 是否显示指向箭头。默认 false。 */
  arrow?: boolean;
  /** 语义色调,经全库 tone resolver 派生气泡边框 / 发光 / 箭头(如 danger 警示气泡)。默认 neutral。 */
  tone?: TooltipTone;
  /**
   * hover / focus 到显示的延时(毫秒)。默认 150。
   * 仅作 openDelay 的兜底默认;若显式传 openDelay 则以 openDelay 为准。
   */
  delay?: number;
  /** hover / focus 触发到显示的延时(毫秒)。未传则回退到 delay。 */
  openDelay?: number;
  /** 离开 / 失焦到隐藏的延时(毫秒)。默认 0(即时隐藏)。 */
  closeDelay?: number;
  /** 禁用:不弹出提示(常用于禁用态的 trigger)。 */
  disabled?: boolean;
  /** 受控:是否打开。传入即进入受控模式(如常驻打开的引导提示)。 */
  open?: boolean;
  /** 非受控初始打开态。默认 false。 */
  defaultOpen?: boolean;
  /** 显隐变化回调(受控 / 非受控均触发)。 */
  onOpenChange?: (open: boolean) => void;
  /** Esc 键按下回调;在回调内 preventDefault 可阻止默认的关闭。 */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** 触屏 tap-to-toggle 模式下点击气泡外部(pointerdown)回调;preventDefault 可阻止关闭。 */
  onPointerDownOutside?: (event: PointerEvent) => void;
  /** 透传到气泡容器的额外 className。 */
  className?: string;
}

/** trigger 原有的可能被合并的属性。 */
interface TriggerOwnProps {
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
  tabIndex?: number;
  href?: string;
  onPointerEnter?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave?: (event: ReactPointerEvent<HTMLElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

/**
 * Tooltip —— 提示气泡(旗舰深度组件)。用满平台原生能力、零第三方依赖:
 * - 气泡进 top-layer:Popover API(popover="manual" 手动控制 light-dismiss)。
 * - 定位:CSS Anchor Positioning —— trigger 设 anchor-name(useId 唯一名),气泡 position-anchor
 *   + position-area 贴合;12 向定位(四主轴 × 居中/start/end)+ offset 间距 + 可选指向箭头;
 *   @supports not 时降级为屏底 fixed(见 .css)。
 * - tone 色调经全库 tone resolver 驱动气泡边框 / 发光 / 箭头(只读 6 槽位,danger 即警示气泡)。
 * - hover / focus 触发(openDelay)、leave / blur 隐藏(closeDelay)、Esc 即时隐藏;键盘可达,
 *   focus-visible 发光环可见;disabled 时不弹。
 * - 触屏(无 hover):改 tap-to-toggle —— 点 trigger 切换显隐(旁路 delay),点外部关闭;
 *   桌面零变化。
 * - 留口:trigger 全事件 compose 合并 + ref 合并;气泡根 spread ...rest 透传原生属性 / 事件;
 *   onOpenChange 受控 / 非受控双通道;onEscapeKeyDown / onPointerDownOutside 可拦截关闭。
 * 样式见同目录 Tooltip.css,需引入 @magic-scope/react/styles.css。
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      children,
      placement = 'top',
      offset = 8,
      arrow = false,
      tone = 'neutral',
      delay = 150,
      openDelay,
      closeDelay = 0,
      disabled = false,
      open,
      defaultOpen = false,
      onOpenChange,
      onEscapeKeyDown,
      onPointerDownOutside,
      className,
      ...rest
    },
    ref,
  ) => {
    const bubbleRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const reactId = useId();
    // anchor-name 必须是 dashed-ident;useId 的冒号不合法,替换掉。
    const safeId = reactId.replace(/[^a-zA-Z0-9_-]/g, '');
    const anchorName = `--ms-tt-${safeId}`;
    const tooltipId = `ms-tt-${safeId}`;

    const resolvedPlacement = normalizePlacement(placement);
    const side = placementToSide(resolvedPlacement);
    const align = placementToAlign(resolvedPlacement);
    // openDelay 优先,未传则回退 delay(向后兼容旧 delay prop)。
    const resolvedOpenDelay = openDelay ?? delay;

    const isControlled = open !== undefined;
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    // disabled 时强制不显示(受控 open 也被吞掉,避免禁用态弹出)。
    const isOpen = (isControlled ? open : internalOpen) && !disabled;

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

    // 带延时的开合;延时为 0 时立即同步。
    const scheduleOpen = useCallback(
      (next: boolean, ms: number) => {
        clearTimer();
        if (disabled && next) {
          return;
        }
        if (ms > 0) {
          timerRef.current = setTimeout(() => setOpen(next), ms);
        } else {
          setOpen(next);
        }
      },
      [clearTimer, setOpen, disabled],
    );

    // 触屏(无 hover):tap-to-toggle —— 旁路 delay,立即切换显隐。
    const toggle = useCallback(() => {
      clearTimer();
      if (disabled) {
        return;
      }
      setOpen(!isOpen);
    }, [clearTimer, setOpen, isOpen, disabled]);

    // 同步 popover 显隐(showPopover / hidePopover),并兜底不支持 Popover API 的浏览器。
    useEffect(() => {
      const el = bubbleRef.current;
      if (!el) {
        return;
      }
      const supportsPopover =
        typeof el.showPopover === 'function' && typeof el.hidePopover === 'function';
      if (isOpen) {
        el.dataset.open = 'true';
        if (supportsPopover && !el.matches(':popover-open')) {
          try {
            el.showPopover();
          } catch {
            // 已显示或不支持:忽略,靠 data-open 控制可见性。
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
    }, [isOpen]);

    // Esc 即时隐藏(popover="manual" 不自带 light-dismiss);可被 onEscapeKeyDown 拦截。
    useEffect(() => {
      if (!isOpen) {
        return;
      }
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') {
          return;
        }
        onEscapeKeyDown?.(event);
        if (!event.defaultPrevented) {
          clearTimer();
          setOpen(false);
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onEscapeKeyDown, clearTimer, setOpen]);

    // 触屏(无 hover):open 时点外部关闭(light-dismiss 兜底);可被 onPointerDownOutside 拦截。
    useEffect(() => {
      if (!isOpen || !isCoarseNoHover()) {
        return;
      }
      const onPointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;
        const trigger = triggerRef.current;
        const bubble = bubbleRef.current;
        if (target && (trigger?.contains(target) || bubble?.contains(target))) {
          return;
        }
        onPointerDownOutside?.(event);
        if (!event.defaultPrevented) {
          clearTimer();
          setOpen(false);
        }
      };
      // 捕获阶段:trigger 自身的 onClick 切换不受影响(它先于此处的关闭判定命中自身)。
      document.addEventListener('pointerdown', onPointerDown, true);
      return () => document.removeEventListener('pointerdown', onPointerDown, true);
    }, [isOpen, onPointerDownOutside, clearTimer, setOpen]);

    // 卸载时清掉定时器。
    useEffect(() => clearTimer, [clearTimer]);

    if (!isValidElement(children)) {
      return null;
    }

    const child = children as ReactElement<TriggerOwnProps>;
    const childProps = child.props;

    // 合并 child 原有 ref 与本组件的 triggerRef(点外部关闭命中判定需要)。
    // React 19 把 ref 移到 props.ref;旧版在 element.ref。两处都兼容。
    const childRef = childProps.ref ?? (child as { ref?: Ref<HTMLElement> }).ref;
    const setTriggerRef = (node: HTMLElement | null) => {
      triggerRef.current = node;
      if (typeof childRef === 'function') {
        childRef(node);
      } else if (childRef) {
        (childRef as { current: HTMLElement | null }).current = node;
      }
    };

    const triggerProps: Record<string, unknown> = {
      ref: setTriggerRef,
      'aria-describedby': isOpen ? tooltipId : undefined,
      style: { ...childProps.style, anchorName } as CSSProperties,
      // hover 环境:pointerenter/leave 维持原行为(桌面零变化);
      // 触屏(无 hover)环境:跳过 pointer 路径,改由下面的 onClick 做 tap-to-toggle。
      // 全部用 composeEventHandlers:先调用户的,未 preventDefault 再走内部。
      onPointerEnter: composeEventHandlers(childProps.onPointerEnter, () => {
        if (!isCoarseNoHover()) {
          scheduleOpen(true, resolvedOpenDelay);
        }
      }),
      onPointerLeave: composeEventHandlers(childProps.onPointerLeave, () => {
        if (!isCoarseNoHover()) {
          scheduleOpen(false, closeDelay);
        }
      }),
      onFocus: composeEventHandlers(childProps.onFocus, () =>
        scheduleOpen(true, resolvedOpenDelay),
      ),
      onBlur: composeEventHandlers(childProps.onBlur, () => scheduleOpen(false, closeDelay)),
      // 触屏(无 hover):点击切换显隐,旁路 delay;hover 环境点击不动 tooltip。
      onClick: composeEventHandlers(childProps.onClick, () => {
        if (isCoarseNoHover()) {
          toggle();
        }
      }),
    };

    // children 非原生可聚焦时,注入 tabindex=0 保键盘可达(focus 触发兜底)。
    if (!isNativelyFocusable(child.type, childProps)) {
      triggerProps.tabIndex = childProps.tabIndex ?? 0;
    }

    const setBubbleRef = (node: HTMLDivElement | null) => {
      bubbleRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as { current: HTMLDivElement | null }).current = node;
      }
    };

    const bubbleClassName = ['ms-tooltip', `ms-tooltip--${side}`, `ms-tone-${tone}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <>
        {cloneElement(child, triggerProps)}
        <div
          {...rest}
          ref={setBubbleRef}
          id={tooltipId}
          role="tooltip"
          popover="manual"
          data-ms-side={side}
          data-ms-align={align}
          className={bubbleClassName}
          style={
            {
              positionAnchor: anchorName,
              '--ms-tooltip-area': placementToArea(resolvedPlacement),
              '--ms-tooltip-offset': `${offset}px`,
            } as CSSProperties
          }
          // hover 环境:气泡自身也响应 pointerenter/leave,形成 trigger ↔ 气泡桥接防误关。
          // compose 用户经 ...rest 传到气泡根的处理器(先用户、未拦截再走桥接),不覆盖丢弃。
          onPointerEnter={composeEventHandlers(rest.onPointerEnter, () => {
            if (!isCoarseNoHover()) {
              scheduleOpen(true, 0);
            }
          })}
          onPointerLeave={composeEventHandlers(rest.onPointerLeave, () => {
            if (!isCoarseNoHover()) {
              scheduleOpen(false, closeDelay);
            }
          })}
        >
          {content}
          {arrow && <span className="ms-tooltip__arrow" aria-hidden="true" />}
        </div>
      </>
    );
  },
);
Tooltip.displayName = 'Tooltip';

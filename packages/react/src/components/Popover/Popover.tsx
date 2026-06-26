import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  FocusEvent,
  MouseEvent,
  ReactElement,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  PointerEvent as ReactPointerEvent,
  Ref,
} from 'react';
import { cloneElement, forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import { composeEventHandlers } from '../../utils/compose';
import {
  normalizePlacement,
  type PopoverPlacement,
  type PopoverTrigger,
  placementToAlign,
  placementToArea,
  placementToSide,
} from './logic';

export type { PopoverPlacement, PopoverTrigger } from './logic';

export type PopoverTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** 浮层各部件的细粒度 className 槽位。 */
export interface PopoverClassNames {
  /** 浮层根容器(top-layer 元素)。 */
  root?: string | undefined;
  /** 浮层卡片面板。 */
  panel?: string | undefined;
  /** 指向箭头。 */
  arrow?: string | undefined;
}

/** 浮层根容器可透传的原生属性(浮层是 <div role="dialog">,排除会被内部接管的键)。 */
type PopoverRootProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'role' | 'id' | 'children' | 'className' | 'style'
>;

export interface PopoverProps extends PopoverRootProps {
  /** 触发元素(单个 React 元素)。会被注入 anchor / aria 属性,并按 triggerAction 合并交互事件。 */
  trigger: ReactElement;
  /** 浮层内容。 */
  children: ReactNode;
  /** 浮层相对 trigger 的方位(12 向)。默认 bottom。 */
  placement?: PopoverPlacement;
  /** 浮层与 trigger 的间距(像素)。默认 8。 */
  offset?: number;
  /** 是否显示指向箭头。默认 false。 */
  arrow?: boolean;
  /** 触发方式:点击 / 悬停 / 聚焦 / 完全手动(仅受控)。默认 click。 */
  triggerAction?: PopoverTrigger;
  /** hover / focus 触发时,开启的延时(毫秒)。默认 0。 */
  openDelay?: number;
  /** hover / focus 触发时,关闭的延时(毫秒,hover 模式建议留余量防误关)。默认 0。 */
  closeDelay?: number;
  /** 语义色调,经全库 tone resolver 派生 panel 边框 / 发光 / 箭头。默认 neutral。 */
  tone?: PopoverTone;
  /** 受控:是否打开。传入即进入受控模式。 */
  open?: boolean;
  /** 显隐变化回调(受控 / 非受控均触发)。 */
  onOpenChange?: (open: boolean) => void;
  /** Esc 键按下回调;在回调内 preventDefault 可阻止默认的关闭。 */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** 点击浮层外部(pointerdown)回调;preventDefault 可阻止关闭。 */
  onPointerDownOutside?: (event: PointerEvent) => void;
  /** 任意外部交互(点外 / Esc)导致关闭前回调;preventDefault 可阻止关闭。 */
  onInteractOutside?: (event: PointerEvent | KeyboardEvent) => void;
  /** 浮层根容器附加 className。 */
  className?: string;
  /** 各部件细粒度 className 槽位。 */
  classNames?: PopoverClassNames;
}

/** trigger 原有的可能被合并的属性。 */
interface TriggerOwnProps {
  style?: CSSProperties;
  id?: string;
  ref?: Ref<HTMLElement>;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onPointerEnter?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave?: (event: ReactPointerEvent<HTMLElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLElement>) => void;
}

/**
 * Popover —— 浮层(旗舰深度组件)。自研、零依赖,用满平台原生能力:
 * - 浮层进 top-layer:原生 Popover API(showPopover/hidePopover,manual 模式由组件接管 light-dismiss)。
 * - 定位:CSS Anchor Positioning —— trigger 设 anchor-name(useId 唯一名),
 *   浮层 position-anchor + position-area 贴合;@supports 降级为 fixed 居中。
 * - 12 向定位(主轴 × 居中/start/end)+ offset 间距 + 可选指向箭头(随 placement 翻面)。
 * - 触发方式 click / hover(带桥接区防误关)/ focus / manual,各带 openDelay/closeDelay。
 * - tone 色调经全库 tone resolver 驱动 panel 边框 / 发光 / 箭头(只读 6 槽位)。
 * - 留口:trigger 全事件 compose 合并 + ref 合并;浮层根 spread ...rest 透传原生属性 / 事件;
 *   classNames 细粒度槽位;onEscapeKeyDown / onPointerDownOutside / onInteractOutside 可拦截关闭。
 * 受控(open + onOpenChange)与非受控双通道。样式见同目录 Popover.css。
 */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      trigger,
      children,
      placement = 'bottom',
      offset = 8,
      arrow = false,
      triggerAction = 'click',
      openDelay = 0,
      closeDelay = 0,
      tone = 'neutral',
      open,
      onOpenChange,
      onEscapeKeyDown,
      onPointerDownOutside,
      onInteractOutside,
      className,
      classNames,
      ...rest
    },
    ref,
  ) => {
    // useId 含冒号,自定义标识符不允许冒号,故剥离;同一 anchor 名 trigger 与浮层共用。
    const rawId = useId();
    const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
    const anchorName = `--ms-popover-${safeId}`;
    const popoverId = `ms-popover-${safeId}`;
    const fallbackTriggerId = `ms-popover-trigger-${safeId}`;

    const resolvedPlacement = normalizePlacement(placement);
    const side = placementToSide(resolvedPlacement);
    const align = placementToAlign(resolvedPlacement);

    const popRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isControlled = open !== undefined;
    const [internalOpen, setInternalOpen] = useState(false);
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

    const clearTimer = useCallback(() => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    // hover / focus:带延时的开合(manual / click 直接同步,无延时)。
    const scheduleOpen = useCallback(
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

    // 把受控状态同步到原生 popover 的显隐(showPopover / hidePopover)。
    useEffect(() => {
      const el = popRef.current;
      if (!el || typeof el.showPopover !== 'function') {
        return;
      }
      // :popover-open 反映真实 top-layer 状态,避免对已同步状态重复调用而抛错。
      const nativeOpen = el.matches(':popover-open');
      try {
        if (isOpen && !nativeOpen) {
          el.showPopover();
        } else if (!isOpen && nativeOpen) {
          el.hidePopover();
        }
      } catch {
        // 已显示 / 已隐藏 / 不支持:忽略,靠 :popover-open 与 React 状态最终一致。
      }
    }, [isOpen]);

    // Esc 关闭:可被 onEscapeKeyDown / onInteractOutside 拦截(preventDefault)。
    useEffect(() => {
      if (!isOpen) {
        return;
      }
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') {
          return;
        }
        onEscapeKeyDown?.(event);
        onInteractOutside?.(event);
        if (!event.defaultPrevented) {
          clearTimer();
          setOpen(false);
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onEscapeKeyDown, onInteractOutside, clearTimer, setOpen]);

    // 点击外部关闭:可被 onPointerDownOutside / onInteractOutside 拦截。
    // 捕获阶段命中,先排除 trigger / 浮层自身,再回调,未拦截才关闭。
    useEffect(() => {
      if (!isOpen) {
        return;
      }
      const onPointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;
        const triggerEl = triggerRef.current;
        const popEl = popRef.current;
        if (target && (triggerEl?.contains(target) || popEl?.contains(target))) {
          return;
        }
        onPointerDownOutside?.(event);
        onInteractOutside?.(event);
        if (!event.defaultPrevented) {
          clearTimer();
          setOpen(false);
        }
      };
      document.addEventListener('pointerdown', onPointerDown, true);
      return () => document.removeEventListener('pointerdown', onPointerDown, true);
    }, [isOpen, onPointerDownOutside, onInteractOutside, clearTimer, setOpen]);

    // 卸载时清掉定时器。
    useEffect(() => clearTimer, [clearTimer]);

    const setPopRef = useCallback(
      (node: HTMLDivElement | null) => {
        popRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as { current: HTMLDivElement | null }).current = node;
        }
      },
      [ref],
    );

    const ownProps = trigger.props as TriggerOwnProps;
    // 合并 trigger 原有 ref 与本组件 triggerRef(点外部 / hover 桥接命中判定需要)。
    // React 19 把 ref 放进 props.ref;旧版在 element.ref。两处都兼容。
    const ownRef = ownProps.ref ?? (trigger as { ref?: Ref<HTMLElement> }).ref;
    const setTriggerRef = useCallback(
      (node: HTMLElement | null) => {
        triggerRef.current = node;
        if (typeof ownRef === 'function') {
          ownRef(node);
        } else if (ownRef) {
          (ownRef as { current: HTMLElement | null }).current = node;
        }
      },
      [ownRef],
    );

    // —— trigger 注入属性:anchor / aria 关联 + 按 triggerAction 合并交互事件(全量 compose) ——
    const triggerProps: Record<string, unknown> = {
      ref: setTriggerRef,
      style: { anchorName, ...ownProps.style } as CSSProperties,
      id: ownProps.id ?? fallbackTriggerId,
      'aria-haspopup': 'dialog',
      'aria-expanded': isOpen,
      'aria-controls': popoverId,
    };

    if (triggerAction === 'click') {
      triggerProps.onClick = composeEventHandlers(ownProps.onClick, () => {
        clearTimer();
        setOpen(!isOpen);
      });
    } else if (triggerAction === 'hover') {
      triggerProps.onPointerEnter = composeEventHandlers(ownProps.onPointerEnter, () =>
        scheduleOpen(true, openDelay),
      );
      triggerProps.onPointerLeave = composeEventHandlers(ownProps.onPointerLeave, () =>
        scheduleOpen(false, closeDelay),
      );
      // hover 也应键盘可达:聚焦同样开、失焦关。
      triggerProps.onFocus = composeEventHandlers(ownProps.onFocus, () =>
        scheduleOpen(true, openDelay),
      );
      triggerProps.onBlur = composeEventHandlers(ownProps.onBlur, () =>
        scheduleOpen(false, closeDelay),
      );
    } else if (triggerAction === 'focus') {
      triggerProps.onFocus = composeEventHandlers(ownProps.onFocus, () =>
        scheduleOpen(true, openDelay),
      );
      triggerProps.onBlur = composeEventHandlers(ownProps.onBlur, () =>
        scheduleOpen(false, closeDelay),
      );
    }
    // triggerAction === 'manual':不注入开合事件,完全交受控 open 控制。

    const rootClassName = ['ms-popover', `ms-popover--${side}`, `ms-tone-${tone}`, className]
      .filter(Boolean)
      .join(' ');
    const panelClassName = ['ms-popover__panel', classNames?.panel].filter(Boolean).join(' ');
    const arrowClassName = ['ms-popover__arrow', classNames?.arrow].filter(Boolean).join(' ');

    // hover 模式:浮层自身也响应 pointerenter/leave,形成「trigger ↔ 浮层」之间不闪关的桥接。
    // compose 用户经 ...rest 传到浮层根的 onPointerEnter/Leave(先用户、未拦截再走桥接),不覆盖丢弃。
    const panelHoverHandlers =
      triggerAction === 'hover'
        ? {
            onPointerEnter: composeEventHandlers(rest.onPointerEnter, () => scheduleOpen(true, 0)),
            onPointerLeave: composeEventHandlers(rest.onPointerLeave, () =>
              scheduleOpen(false, closeDelay),
            ),
          }
        : undefined;

    return (
      <>
        {cloneElement(trigger, triggerProps)}
        <div
          {...rest}
          ref={setPopRef}
          id={popoverId}
          role="dialog"
          aria-modal="false"
          // manual:不让浏览器自带 light-dismiss,改由组件 JS 接管 ——
          // 这样点外 / Esc 关闭能先过 onPointerDownOutside / onEscapeKeyDown / onInteractOutside,
          // 用户在回调里 preventDefault 即可拦截关闭(auto 模式无法拦截)。
          popover="manual"
          // data-open 兜底:不支持 Popover API 的浏览器靠它驱动可见性(:popover-open 永不命中)。
          data-open={isOpen ? '' : undefined}
          data-ms-side={side}
          data-ms-align={align}
          className={[rootClassName, classNames?.root].filter(Boolean).join(' ')}
          style={
            {
              positionAnchor: anchorName,
              '--ms-popover-area': placementToArea(resolvedPlacement),
              '--ms-popover-offset': `${offset}px`,
            } as CSSProperties
          }
          {...panelHoverHandlers}
        >
          <div className={panelClassName}>
            {children}
            {arrow && <span className={arrowClassName} aria-hidden="true" />}
          </div>
        </div>
      </>
    );
  },
);
Popover.displayName = 'Popover';

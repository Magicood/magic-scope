import type { CSSProperties, ReactElement, ReactNode } from 'react';
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

export interface TooltipProps {
  /** 提示内容。 */
  content: ReactNode;
  /** 单个触发元素(将被克隆以注入事件 / anchor / aria)。 */
  children: ReactElement;
  /** 气泡相对 trigger 的方位。默认 "top"。 */
  placement?: 'top' | 'bottom';
  /** hover / focus 到显示的延时(毫秒)。默认 150。 */
  delay?: number;
  /** 透传到气泡容器的额外 className。 */
  className?: string;
}

interface TriggerInjectedProps {
  ref?: React.Ref<HTMLElement>;
  style?: CSSProperties | undefined;
  tabIndex?: number | undefined;
  'aria-describedby'?: string | undefined;
  onPointerEnter?: ((e: React.PointerEvent<HTMLElement>) => void) | undefined;
  onPointerLeave?: ((e: React.PointerEvent<HTMLElement>) => void) | undefined;
  onFocus?: ((e: React.FocusEvent<HTMLElement>) => void) | undefined;
  onBlur?: ((e: React.FocusEvent<HTMLElement>) => void) | undefined;
  onClick?: ((e: React.MouseEvent<HTMLElement>) => void) | undefined;
}

/** 触屏(无 hover)环境判定:tap-to-toggle 用,SSR 安全。 */
const isCoarseNoHover = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: none)').matches;

/** 判定 children 是否为原生可聚焦元素(决定是否注入 tabindex 兜底键盘可达)。 */
const FOCUSABLE_TAGS = new Set(['a', 'button', 'input', 'select', 'textarea']);
const isNativelyFocusable = (el: ReactElement): boolean => {
  const props = el.props as { tabIndex?: number; href?: string };
  if (typeof props.tabIndex === 'number') {
    return true;
  }
  const type = el.type;
  if (typeof type !== 'string') {
    // 自定义组件:无法静态判定,保守注入 tabindex 兜底键盘可达。
    return false;
  }
  if (type === 'a') {
    return props.href !== undefined;
  }
  return FOCUSABLE_TAGS.has(type);
};

/**
 * Tooltip —— 提示气泡。用满平台原生能力、零第三方依赖:
 * - 气泡进 top-layer:Popover API(popover="manual" 手动控制,showPopover/hidePopover)。
 * - 定位:CSS Anchor Positioning —— trigger 设 anchor-name(useId 唯一名),
 *   气泡设 position-anchor + position-area;@supports not 时降级为相对定位(见 .css)。
 * - trigger 与气泡用 aria-describedby 关联(useId);hover / focus 触发(延时 delay),
 *   leave / blur 隐藏;Esc 即时隐藏。键盘可达,focus-visible 发光环可见。
 * - 触屏(无 hover,matchMedia('(hover: none)'))无法 hover:改 tap-to-toggle ——
 *   点 trigger 切换显隐(旁路 delay),点外部关闭;hover 环境此行为不触发,桌面零变化。
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, placement = 'top', delay = 150, className }, ref) => {
    const bubbleRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [open, setOpen] = useState(false);

    const reactId = useId();
    // anchor-name 必须是 dashed-ident;useId 的冒号不合法,替换掉。
    const anchorName = `--ms-tt-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const tooltipId = `ms-tt${reactId}`;

    const clearTimer = useCallback(() => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    const show = useCallback(() => {
      clearTimer();
      timerRef.current = setTimeout(() => setOpen(true), delay);
    }, [clearTimer, delay]);

    const hide = useCallback(() => {
      clearTimer();
      setOpen(false);
    }, [clearTimer]);

    // 触屏(无 hover):tap-to-toggle —— 旁路 delay,立即切换显隐。
    const toggle = useCallback(() => {
      clearTimer();
      setOpen((prev) => !prev);
    }, [clearTimer]);

    // 同步 popover 显隐(showPopover / hidePopover),并兜底不支持 Popover API 的浏览器。
    useEffect(() => {
      const el = bubbleRef.current;
      if (!el) {
        return;
      }
      const supportsPopover =
        typeof el.showPopover === 'function' && typeof el.hidePopover === 'function';
      if (open) {
        el.dataset.open = 'true';
        if (supportsPopover) {
          try {
            el.showPopover();
          } catch {
            // 已显示或不支持:忽略,靠 data-open 控制可见性。
          }
        }
      } else {
        delete el.dataset.open;
        if (supportsPopover) {
          try {
            el.hidePopover();
          } catch {
            // 已隐藏:忽略。
          }
        }
      }
    }, [open]);

    // Esc 即时隐藏(popover="manual" 不自带 light-dismiss)。
    useEffect(() => {
      if (!open) {
        return;
      }
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          hide();
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, hide]);

    // 触屏(无 hover):open 时点外部关闭(light-dismiss 兜底)。
    useEffect(() => {
      if (!open || !isCoarseNoHover()) {
        return;
      }
      const onPointerDown = (e: PointerEvent) => {
        const target = e.target as Node | null;
        const trigger = triggerRef.current;
        const bubble = bubbleRef.current;
        if (target && (trigger?.contains(target) || bubble?.contains(target))) {
          return;
        }
        hide();
      };
      // 捕获阶段:trigger 自身的 onClick 切换不受影响(它先于此处的关闭判定命中自身)。
      document.addEventListener('pointerdown', onPointerDown, true);
      return () => document.removeEventListener('pointerdown', onPointerDown, true);
    }, [open, hide]);

    // 卸载时清掉定时器。
    useEffect(() => clearTimer, [clearTimer]);

    if (!isValidElement(children)) {
      return null;
    }

    const child = children as ReactElement<TriggerInjectedProps>;
    const childProps = child.props;

    const mergeHandler =
      <E extends React.SyntheticEvent<HTMLElement>>(own: (e: E) => void, theirs?: (e: E) => void) =>
      (e: E) => {
        theirs?.(e);
        own(e);
      };

    // 合并 child 原有 ref 与本组件的 triggerRef(点外部关闭命中判定需要)。
    // React 19 把 ref 移到 props.ref;旧版在 element.ref。两处都兼容。
    const childRef = childProps.ref ?? (child as { ref?: React.Ref<HTMLElement> }).ref;
    const setTriggerRef = (node: HTMLElement | null) => {
      triggerRef.current = node;
      if (typeof childRef === 'function') {
        childRef(node);
      } else if (childRef) {
        (childRef as { current: HTMLElement | null }).current = node;
      }
    };

    const triggerProps: TriggerInjectedProps = {
      ref: setTriggerRef,
      'aria-describedby': open ? tooltipId : undefined,
      style: { ...childProps.style, anchorName } as CSSProperties,
      // hover 环境:pointerenter/leave 维持原行为(桌面零变化);
      // 触屏(无 hover)环境:跳过 pointer 路径,改由下面的 onClick 做 tap-to-toggle。
      onPointerEnter: mergeHandler<React.PointerEvent<HTMLElement>>(() => {
        if (!isCoarseNoHover()) {
          show();
        }
      }, childProps.onPointerEnter),
      onPointerLeave: mergeHandler<React.PointerEvent<HTMLElement>>(() => {
        if (!isCoarseNoHover()) {
          hide();
        }
      }, childProps.onPointerLeave),
      onFocus: mergeHandler<React.FocusEvent<HTMLElement>>(() => show(), childProps.onFocus),
      onBlur: mergeHandler<React.FocusEvent<HTMLElement>>(() => hide(), childProps.onBlur),
      // 触屏(无 hover):点击切换显隐,旁路 delay;hover 环境点击不动 tooltip。
      onClick: mergeHandler<React.MouseEvent<HTMLElement>>(() => {
        if (isCoarseNoHover()) {
          toggle();
        }
      }, childProps.onClick),
    };

    // children 非原生可聚焦时,注入 tabindex=0 保键盘可达(focus 触发兜底)。
    if (!isNativelyFocusable(child)) {
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

    const bubbleClassName = ['ms-tooltip', `ms-tooltip--${placement}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <>
        {cloneElement(child, triggerProps)}
        <div
          ref={setBubbleRef}
          id={tooltipId}
          role="tooltip"
          popover="manual"
          className={bubbleClassName}
          style={{ positionAnchor: anchorName } as CSSProperties}
          onPointerEnter={show}
          onPointerLeave={hide}
        >
          {content}
        </div>
      </>
    );
  },
);
Tooltip.displayName = 'Tooltip';

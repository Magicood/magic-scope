import type { CSSProperties, MouseEvent, ReactElement, ReactNode, ToggleEvent } from 'react';
import { cloneElement, forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverProps {
  /** 触发元素(单个 React 元素)。点击切换浮层显隐;会被注入 anchor / aria 属性。 */
  trigger: ReactElement;
  /** 浮层内容。 */
  children: ReactNode;
  /** 浮层相对 trigger 的方位。默认 bottom。 */
  placement?: PopoverPlacement;
  /** 受控:是否打开。传入即进入受控模式。 */
  open?: boolean;
  /** 显隐变化回调(受控 / 非受控均触发)。 */
  onOpenChange?: (open: boolean) => void;
  /** 浮层附加 className。 */
  className?: string;
}

/** placement → CSS position-area 关键字(锚定语法)。 */
const PLACEMENT_AREA: Record<PopoverPlacement, string> = {
  top: 'block-start',
  bottom: 'block-end',
  left: 'inline-start',
  right: 'inline-end',
};

/** trigger 被注入的属性(anchor 名 / aria 关联 / 点击切换)。 */
interface TriggerInjectedProps {
  style: CSSProperties;
  id: string;
  'aria-haspopup': 'dialog';
  'aria-expanded': boolean;
  'aria-controls': string;
  onClick: (event: MouseEvent<HTMLElement>) => void;
}

/** trigger 原有的可能被合并的属性。 */
interface TriggerOwnProps {
  style?: CSSProperties;
  id?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

/**
 * Popover —— 点击浮层。自研、零依赖,用满平台原生能力:
 * - 浮层进 top-layer:原生 Popover API(popover="auto" 自带点外 / Esc 关闭)。
 * - 定位:CSS Anchor Positioning —— trigger 设 anchor-name(useId 唯一名),
 *   浮层 position-anchor + position-area 贴合;@supports 降级为 fixed 居中。
 * 支持受控(open + onOpenChange)与非受控。样式见同目录 Popover.css。
 */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  ({ trigger, children, placement = 'bottom', open, onOpenChange, className }, ref) => {
    // useId 含冒号,自定义标识符不允许冒号,故剥离;同一 anchor 名 trigger 与浮层共用。
    const rawId = useId();
    const anchorName = `--ms-popover-${rawId.replace(/:/g, '')}`;
    const popoverId = `ms-popover-${rawId.replace(/:/g, '')}`;
    const fallbackTriggerId = `ms-popover-trigger-${rawId.replace(/:/g, '')}`;

    const popRef = useRef<HTMLDivElement | null>(null);
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

    // 把受控状态同步到原生 popover 的显隐(showPopover / hidePopover)。
    useEffect(() => {
      const el = popRef.current;
      if (!el || typeof el.showPopover !== 'function') {
        return;
      }
      // :popover-open 反映真实 top-layer 状态,避免对已同步状态重复调用而抛错。
      const nativeOpen = el.matches(':popover-open');
      if (isOpen && !nativeOpen) {
        el.showPopover();
      } else if (!isOpen && nativeOpen) {
        el.hidePopover();
      }
    }, [isOpen]);

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

    // 原生 popover 因点外 / Esc / 程序化关闭时,反向同步 React 状态。
    const handleToggle = useCallback(
      (event: ToggleEvent) => {
        // ToggleEvent.newState 为 'open' | 'closed';退化读 :popover-open 兜底类型缺失。
        const next =
          (event as ToggleEvent & { newState?: string }).newState === 'open' ||
          popRef.current?.matches(':popover-open') === true;
        if (next !== isOpen) {
          setOpen(next);
        }
      },
      [isOpen, setOpen],
    );

    const ownProps = trigger.props as TriggerOwnProps;

    const triggerProps: TriggerInjectedProps = {
      // anchor-name 经 style 注入;不支持锚定时此属性被忽略,走 @supports 降级。
      style: { anchorName, ...ownProps.style } as CSSProperties,
      id: ownProps.id ?? fallbackTriggerId,
      'aria-haspopup': 'dialog',
      'aria-expanded': isOpen,
      'aria-controls': popoverId,
      onClick: (event) => {
        ownProps.onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(!isOpen);
        }
      },
    };

    return (
      <>
        {cloneElement(trigger, triggerProps)}
        <div
          ref={setPopRef}
          id={popoverId}
          role="dialog"
          aria-modal="false"
          popover="auto"
          className={['ms-popover', `ms-popover--${placement}`, className]
            .filter(Boolean)
            .join(' ')}
          style={
            {
              positionAnchor: anchorName,
              '--ms-popover-area': PLACEMENT_AREA[placement],
            } as CSSProperties
          }
          onToggle={handleToggle}
        >
          <div className="ms-popover__panel">{children}</div>
        </div>
      </>
    );
  },
);
Popover.displayName = 'Popover';

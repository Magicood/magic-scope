import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useRef } from 'react';

export type DrawerSide = 'start' | 'end' | 'top' | 'bottom';

export interface DrawerProps extends Omit<ComponentPropsWithoutRef<'dialog'>, 'open' | 'title'> {
  /** 是否打开(受控)。 */
  open: boolean;
  /** 关闭时回调(Esc / 点击遮罩 / 关闭按钮)。 */
  onClose?: () => void;
  /** 滑入边:start(左)/ end(右,默认)/ top / bottom。 */
  side?: DrawerSide;
  /** 标题(可选);设置后渲染头部并与抽屉 aria-labelledby 关联。 */
  title?: ReactNode;
  /** 点击遮罩是否关闭。默认 true。 */
  dismissable?: boolean;
  children?: ReactNode;
}

let drawerSeq = 0;

/**
 * Drawer —— 侧边抽屉。基于原生 <dialog> + showModal():焦点陷阱、Esc、::backdrop、top-layer。
 * 自研封装:受控 open、四个方向滑入(start/end/top/bottom)、点击遮罩关闭、内建关闭按钮、
 * 锁背景滚动、安全区避让、尊重 reduced-motion。样式见同目录 Drawer.css。
 */
export const Drawer = forwardRef<HTMLDialogElement, DrawerProps>(
  (
    { open, onClose, side = 'end', title, dismissable = true, className, children, ...props },
    ref,
  ) => {
    const innerRef = useRef<HTMLDialogElement | null>(null);
    const titleId = useRef(`ms-drawer-title-${++drawerSeq}`).current;

    useEffect(() => {
      const d = innerRef.current;
      if (!d) return;
      if (open && !d.open) d.showModal();
      else if (!open && d.open) d.close();
    }, [open]);

    useEffect(() => {
      if (!open) return;
      const root = document.documentElement;
      const prev = root.style.overflow;
      root.style.overflow = 'hidden';
      return () => {
        root.style.overflow = prev;
      };
    }, [open]);

    const setRef = useCallback(
      (node: HTMLDialogElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as { current: HTMLDialogElement | null }).current = node;
      },
      [ref],
    );

    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: 键盘关闭由原生 <dialog> 的 Esc 提供;onClick 仅检测点击遮罩
      <dialog
        ref={setRef}
        className={['ms-drawer', `ms-drawer--${side}`, className].filter(Boolean).join(' ')}
        aria-labelledby={title != null ? titleId : undefined}
        onClose={() => onClose?.()}
        onClick={(e) => {
          if (dismissable && e.target === innerRef.current) onClose?.();
        }}
        {...props}
      >
        <div className="ms-drawer__panel">
          {title != null ? (
            <header className="ms-drawer__header">
              <h2 id={titleId} className="ms-drawer__title">
                {title}
              </h2>
              <button
                type="button"
                className="ms-drawer__close"
                aria-label="关闭"
                onClick={() => onClose?.()}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>
          ) : (
            <button
              type="button"
              className="ms-drawer__close ms-drawer__close--floating"
              aria-label="关闭"
              onClick={() => onClose?.()}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
          <div className="ms-drawer__body">{children}</div>
        </div>
      </dialog>
    );
  },
);
Drawer.displayName = 'Drawer';

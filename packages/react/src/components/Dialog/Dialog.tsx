import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useRef } from 'react';

export interface DialogProps extends Omit<ComponentPropsWithoutRef<'dialog'>, 'open'> {
  /** 是否打开(受控)。 */
  open: boolean;
  /** 关闭时回调(Esc / 点击遮罩 / 原生 close)。 */
  onClose?: () => void;
  /** 点击遮罩是否关闭。默认 true。 */
  dismissable?: boolean;
  children?: ReactNode;
}

/**
 * Dialog —— 模态对话框。基于原生 <dialog> + showModal():
 * 自带焦点陷阱、Esc 关闭、::backdrop 遮罩、top-layer(永远最上,无需 z-index)。
 * 自研封装:受控 open、点击遮罩关闭、@starting-style 入场动画(受 fx/motion 开关控制)。
 */
export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  ({ open, onClose, dismissable = true, className, children, ...props }, ref) => {
    const innerRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
      const d = innerRef.current;
      if (!d) {
        return;
      }
      if (open && !d.open) {
        d.showModal();
      } else if (!open && d.open) {
        d.close();
      }
    }, [open]);

    // open 时锁背景滚动(避免触屏穿透到 body),关闭/卸载时还原原值
    useEffect(() => {
      if (!open) {
        return;
      }
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
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as { current: HTMLDialogElement | null }).current = node;
        }
      },
      [ref],
    );

    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: 键盘关闭由原生 <dialog> 的 Esc 提供;onClick 仅用于检测点击遮罩关闭
      <dialog
        ref={setRef}
        className={['ms-dialog', className].filter(Boolean).join(' ')}
        onClose={() => onClose?.()}
        onClick={(e) => {
          if (dismissable && e.target === innerRef.current) {
            onClose?.();
          }
        }}
        {...props}
      >
        <div className="ms-dialog__panel">
          <button
            type="button"
            className="ms-dialog__close"
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
          {children}
        </div>
      </dialog>
    );
  },
);
Dialog.displayName = 'Dialog';

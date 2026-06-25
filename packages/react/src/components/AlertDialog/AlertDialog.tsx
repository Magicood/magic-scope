import type { ReactNode } from 'react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

export interface ConfirmOptions {
  /** 标题(可选)。 */
  title?: ReactNode;
  /** 确认按钮文案。默认「确定」。 */
  confirmText?: ReactNode;
  /** 取消按钮文案。默认「取消」。 */
  cancelText?: ReactNode;
  /** danger 时确认按钮染危险色、默认焦点落在取消(防误触销毁性操作)。 */
  variant?: 'default' | 'danger';
}

export interface AlertOptions {
  /** 标题(可选)。 */
  title?: ReactNode;
  /** 确认按钮文案。默认「确定」。 */
  confirmText?: ReactNode;
}

interface DialogRequest {
  id: number;
  kind: 'confirm' | 'alert';
  message: ReactNode;
  title: ReactNode | undefined;
  confirmText: ReactNode;
  cancelText: ReactNode;
  variant: 'default' | 'danger';
  resolve: (confirmed: boolean) => void;
}

/* —— 模块级队列:confirm()/alert() 任意处可调,AlertDialogHost 订阅渲染,无需 Provider —— */
const EMPTY: DialogRequest[] = [];
let queue: DialogRequest[] = EMPTY;
let seq = 0;
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) listener();
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getQueue = () => queue;
const getEmpty = () => EMPTY;

function enqueue(request: DialogRequest) {
  queue = [...queue, request];
  emit();
}

function settle(confirmed: boolean) {
  const active = queue[0];
  if (!active) return;
  active.resolve(confirmed);
  queue = queue.slice(1);
  emit();
}

/**
 * confirm() —— 命令式确认弹窗,返回 Promise<boolean>(确认 true / 取消·Esc·遮罩 false)。
 * 例:`if (await confirm('确定删除?', { variant: 'danger', confirmText: '删除' })) { ... }`
 * 需在应用根挂载一个 <AlertDialogHost />。
 */
export function confirm(message: ReactNode, options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    enqueue({
      id: ++seq,
      kind: 'confirm',
      message,
      title: options.title,
      confirmText: options.confirmText ?? '确定',
      cancelText: options.cancelText ?? '取消',
      variant: options.variant ?? 'default',
      resolve,
    });
  });
}

/**
 * alert() —— 命令式提示弹窗(仅一个确认按钮),返回 Promise<void>(确认/Esc/遮罩后 resolve)。
 */
export function alert(message: ReactNode, options: AlertOptions = {}): Promise<void> {
  return new Promise<void>((resolve) => {
    enqueue({
      id: ++seq,
      kind: 'alert',
      message,
      title: options.title,
      confirmText: options.confirmText ?? '确定',
      cancelText: '',
      variant: 'default',
      resolve: () => resolve(),
    });
  });
}

/**
 * AlertDialogHost —— confirm/alert 的渲染容器。基于原生 <dialog> + showModal()
 * (焦点陷阱、Esc、top-layer),portal 到 body,锁背景滚动。在应用根渲染一次即可。
 */
export function AlertDialogHost() {
  const items = useSyncExternalStore(subscribe, getQueue, getEmpty);
  const active = items[0];
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (active && !d.open) d.showModal();
    else if (!active && d.open) d.close();
    if (active) {
      // 默认焦点:危险确认落在取消(防误触),其余落在确认
      const target =
        active.variant === 'danger' && active.kind === 'confirm'
          ? cancelRef.current
          : confirmRef.current;
      target?.focus();
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
    };
  }, [active]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    // biome-ignore lint/a11y/useKeyWithClickEvents: 键盘关闭由原生 <dialog> 的 Esc(onCancel)提供;onClick 仅检测点击遮罩
    <dialog
      ref={dialogRef}
      className="ms-alert-dialog"
      onCancel={(event) => {
        event.preventDefault();
        settle(false);
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) settle(false);
      }}
    >
      {active && (
        <div
          key={active.id}
          className={[
            'ms-alert-dialog__panel',
            active.variant === 'danger' && 'ms-alert-dialog__panel--danger',
          ]
            .filter(Boolean)
            .join(' ')}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={active.title != null ? `ms-ad-title-${active.id}` : undefined}
          aria-describedby={`ms-ad-msg-${active.id}`}
        >
          {active.title != null && (
            <h2 id={`ms-ad-title-${active.id}`} className="ms-alert-dialog__title">
              {active.title}
            </h2>
          )}
          <div id={`ms-ad-msg-${active.id}`} className="ms-alert-dialog__message">
            {active.message}
          </div>
          <div className="ms-alert-dialog__actions">
            {active.kind === 'confirm' && (
              <button
                ref={cancelRef}
                type="button"
                className="ms-button ms-button--ghost ms-button--md ms-alert-dialog__cancel"
                onClick={() => settle(false)}
              >
                {active.cancelText}
              </button>
            )}
            <button
              ref={confirmRef}
              type="button"
              className="ms-button ms-button--solid ms-button--md ms-alert-dialog__confirm"
              onClick={() => settle(true)}
            >
              {active.confirmText}
            </button>
          </div>
        </div>
      )}
    </dialog>,
    document.body,
  );
}

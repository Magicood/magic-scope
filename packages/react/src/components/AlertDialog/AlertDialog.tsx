import type { ReactNode } from 'react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { translate } from '../../i18n';

/** 语义色调:面板挂 ms-tone-*,确认按钮(solid)与强调条/辉光经全库 tone resolver 派生,零硬编码配色。 */
export type AlertDialogTone = 'default' | 'danger' | 'warning' | 'success' | 'info';

/** prompt 输入类型(平移到原生 <input> type)。 */
export type PromptInputType = 'text' | 'password' | 'number';

export interface ConfirmOptions {
  /** 标题(可选)。 */
  title?: ReactNode;
  /** 确认按钮文案。默认走 i18n alertDialog.confirm。 */
  confirmText?: ReactNode;
  /** 取消按钮文案。默认走 i18n alertDialog.cancel。 */
  cancelText?: ReactNode;
  /**
   * 语义色调。danger 时确认按钮染危险色、默认焦点落在取消(防误触销毁性操作)。
   * 扩成完整 tone(default/danger/warning/success/info),面板挂 ms-tone-*。
   */
  variant?: AlertDialogTone;
  /** 警示图标槽位(ReactNode),渲染在标题/消息起始处,危险弹窗常用。 */
  icon?: ReactNode;
  /**
   * 点击确认时触发(与 Promise 双轨;不 await 也能挂回调)。返回 Promise 时进入异步态:
   * 确认按钮 loading + 禁用,resolve 才关闭,reject 保持打开便于重试。
   */
  onConfirm?: () => void | Promise<void>;
  /** 点取消时触发(主动取消语义,区别于 Esc / 点外关闭)。 */
  onCancel?: () => void;
  /** 受控 loading:为 true 时确认按钮 loading + 禁用(异步 onConfirm 期间内部也会自动置位)。 */
  confirmLoading?: boolean;
  /**
   * 按 Esc 关闭前触发;可拦截(危险操作禁 Esc 关闭)。
   * @param event 触发关闭的原生事件(Esc),在其上调用 preventDefault 可拦截默认关闭。
   */
  onEscapeKeyDown?: (event: Event) => void;
  /**
   * 点击遮罩(面板外)关闭前触发;可拦截(危险操作禁点外关)。
   * @param event 遮罩上按下的原生鼠标事件,在其上调用 preventDefault 可拦截关闭。
   */
  onPointerDownOutside?: (event: MouseEvent) => void;
}

export interface AlertOptions {
  /** 标题(可选)。 */
  title?: ReactNode;
  /** 确认按钮文案。默认走 i18n alertDialog.confirm。 */
  confirmText?: ReactNode;
  /** 语义色调,面板挂 ms-tone-*。 */
  variant?: AlertDialogTone;
  /** 警示图标槽位。 */
  icon?: ReactNode;
  /** 点击确认时触发;返回 Promise 时进入异步态。 */
  onConfirm?: () => void | Promise<void>;
  /** 受控 loading。 */
  confirmLoading?: boolean;
  /**
   * 按 Esc 关闭前触发,可拦截。
   * @param event 触发关闭的原生事件(Esc),在其上调用 preventDefault 可拦截默认关闭。
   */
  onEscapeKeyDown?: (event: Event) => void;
  /**
   * 点击遮罩关闭前触发,可拦截。
   * @param event 遮罩上按下的原生鼠标事件,在其上调用 preventDefault 可拦截关闭。
   */
  onPointerDownOutside?: (event: MouseEvent) => void;
}

export interface PromptOptions {
  /** 标题(可选)。 */
  title?: ReactNode;
  /** 确认按钮文案。默认走 i18n alertDialog.confirm。 */
  confirmText?: ReactNode;
  /** 取消按钮文案。默认走 i18n alertDialog.cancel。 */
  cancelText?: ReactNode;
  /** 语义色调,面板挂 ms-tone-*。 */
  variant?: AlertDialogTone;
  /** 警示图标槽位。 */
  icon?: ReactNode;
  /** 输入框占位符。 */
  placeholder?: string;
  /** 输入框初始值。 */
  defaultValue?: string;
  /** 输入类型:text(默认)/ password / number,平移到原生 <input> type。 */
  inputType?: PromptInputType;
  /**
   * 校验函数:返回非空字符串视为「无效」——拦截确认并把返回串作为错误提示展示,
   * 同时禁用确认按钮;返回 undefined / 空串视为「有效」。实时随输入运行。
   */
  validate?: (value: string) => string | undefined;
  /**
   * 输入值实时变化时触发(即时拿到当前值,可外部联动)。
   * @param value 输入框当前的实时值(变化后的字符串)。
   */
  onValueChange?: (value: string) => void;
  /**
   * 点击确认(校验通过)时触发;返回 Promise 时进入异步态。
   * @param value 确认时输入框的当前值(已通过校验)。
   */
  onConfirm?: (value: string) => void | Promise<void>;
  /** 点取消时触发。 */
  onCancel?: () => void;
  /** 受控 loading。 */
  confirmLoading?: boolean;
  /**
   * 按 Esc 关闭前触发,可拦截。
   * @param event 触发关闭的原生事件(Esc),在其上调用 preventDefault 可拦截默认关闭。
   */
  onEscapeKeyDown?: (event: Event) => void;
  /**
   * 点击遮罩关闭前触发,可拦截。
   * @param event 遮罩上按下的原生鼠标事件,在其上调用 preventDefault 可拦截关闭。
   */
  onPointerDownOutside?: (event: MouseEvent) => void;
}

type DialogKind = 'confirm' | 'alert' | 'prompt';

interface DialogRequest {
  id: number;
  kind: DialogKind;
  message: ReactNode;
  title: ReactNode | undefined;
  confirmText: ReactNode;
  cancelText: ReactNode;
  variant: AlertDialogTone;
  icon: ReactNode | undefined;
  placeholder: string | undefined;
  defaultValue: string | undefined;
  inputType: PromptInputType;
  validate: ((value: string) => string | undefined) | undefined;
  confirmLoading: boolean;
  onValueChange: ((value: string) => void) | undefined;
  onConfirm: ((value: string) => void | Promise<void>) | undefined;
  onCancel: (() => void) | undefined;
  onEscapeKeyDown: ((event: Event) => void) | undefined;
  onPointerDownOutside: ((event: MouseEvent) => void) | undefined;
  onSettle: (confirmed: boolean, value: string) => void;
}

/* —— 模块级队列:confirm()/alert()/prompt() 任意处可调,AlertDialogHost 订阅渲染,无需 Provider —— */
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

function settle(confirmed: boolean, value = '') {
  const active = queue[0];
  if (!active) return;
  active.onSettle(confirmed, value);
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
      confirmText: options.confirmText ?? translate('alertDialog.confirm'),
      cancelText: options.cancelText ?? translate('alertDialog.cancel'),
      variant: options.variant ?? 'default',
      icon: options.icon,
      placeholder: undefined,
      defaultValue: undefined,
      inputType: 'text',
      validate: undefined,
      confirmLoading: options.confirmLoading ?? false,
      onValueChange: undefined,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      onEscapeKeyDown: options.onEscapeKeyDown,
      onPointerDownOutside: options.onPointerDownOutside,
      onSettle: (confirmed) => resolve(confirmed),
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
      confirmText: options.confirmText ?? translate('alertDialog.confirm'),
      cancelText: '',
      variant: options.variant ?? 'default',
      icon: options.icon,
      placeholder: undefined,
      defaultValue: undefined,
      inputType: 'text',
      validate: undefined,
      confirmLoading: options.confirmLoading ?? false,
      onValueChange: undefined,
      onConfirm: options.onConfirm,
      onCancel: undefined,
      onEscapeKeyDown: options.onEscapeKeyDown,
      onPointerDownOutside: options.onPointerDownOutside,
      onSettle: () => resolve(),
    });
  });
}

/**
 * prompt() —— 命令式输入弹窗,返回 Promise<string | null>(确认返回输入值 / 取消·Esc·遮罩返回 null)。
 * 例:`const name = await prompt('请输入名称', { defaultValue: '未命名' });`
 */
export function prompt(message: ReactNode, options: PromptOptions = {}): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    enqueue({
      id: ++seq,
      kind: 'prompt',
      message,
      title: options.title,
      confirmText: options.confirmText ?? translate('alertDialog.confirm'),
      cancelText: options.cancelText ?? translate('alertDialog.cancel'),
      variant: options.variant ?? 'default',
      icon: options.icon,
      placeholder: options.placeholder,
      defaultValue: options.defaultValue,
      inputType: options.inputType ?? 'text',
      validate: options.validate,
      confirmLoading: options.confirmLoading ?? false,
      onValueChange: options.onValueChange,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      onEscapeKeyDown: options.onEscapeKeyDown,
      onPointerDownOutside: options.onPointerDownOutside,
      onSettle: (confirmed, value) => resolve(confirmed ? value : null),
    });
  });
}

const TONE_CLASS: Record<AlertDialogTone, string> = {
  default: 'ms-tone-primary',
  danger: 'ms-tone-danger',
  warning: 'ms-tone-warning',
  success: 'ms-tone-success',
  info: 'ms-tone-info',
};

/**
 * AlertDialogHost —— confirm/alert/prompt 的渲染容器。基于原生 <dialog> + showModal()
 * (焦点陷阱、Esc、top-layer),portal 到 body,锁背景滚动。在应用根渲染一次即可。
 */
export function AlertDialogHost() {
  const items = useSyncExternalStore(subscribe, getQueue, getEmpty);
  const active = items[0];
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  // 异步 onConfirm 进行中的内部 loading(以请求 id 标记,避免跨请求串台)
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 进入新请求时:同步 prompt 输入初值
  useEffect(() => {
    setInputValue(active?.kind === 'prompt' ? (active.defaultValue ?? '') : '');
  }, [active]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (active && !d.open) d.showModal();
    else if (!active && d.open) d.close();
    if (active) {
      // 默认焦点:prompt 落在输入框;危险确认落在取消(防误触);其余落在确认
      if (active.kind === 'prompt') {
        inputRef.current?.focus();
        inputRef.current?.select();
      } else {
        const target =
          active.variant === 'danger' && active.kind === 'confirm'
            ? cancelRef.current
            : confirmRef.current;
        target?.focus();
      }
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

  const hasCancel = active?.kind === 'confirm' || active?.kind === 'prompt';
  // 校验:prompt 且有 validate 时实时跑;非空返回串 = 无效(拦截确认 + 展示提示)
  const validationError =
    active?.kind === 'prompt' && active.validate ? active.validate(inputValue) : undefined;
  const isInvalid = validationError != null && validationError !== '';
  const loading = active != null && (active.confirmLoading || pendingId === active.id);
  const confirmDisabled = loading || isInvalid;

  /** 主动取消(点取消按钮):区别于 Esc / 点外关闭。 */
  const handleCancel = () => {
    if (loading) return;
    active?.onCancel?.();
    settle(false);
  };

  /** 点确认:跑 onConfirm(可异步),resolve 后 settle;reject 保持打开便于重试。 */
  const handleConfirm = () => {
    if (!active || confirmDisabled) return;
    const value = active.kind === 'prompt' ? inputValue : '';
    const result = active.onConfirm?.(value);
    if (result && typeof (result as Promise<void>).then === 'function') {
      const id = active.id;
      setPendingId(id);
      (result as Promise<void>).then(
        () => {
          setPendingId((cur) => (cur === id ? null : cur));
          settle(true, value);
        },
        () => {
          // 失败:保持打开,清 loading 便于重试(不吞错,交给上层 .catch / 全局处理)
          setPendingId((cur) => (cur === id ? null : cur));
        },
      );
      return;
    }
    settle(true, value);
  };

  const toneClass = active ? TONE_CLASS[active.variant] : '';

  return createPortal(
    // biome-ignore lint/a11y/useKeyWithClickEvents: 键盘关闭由原生 <dialog> 的 Esc(onCancel)提供;onClick 仅检测点击遮罩
    <dialog
      ref={dialogRef}
      className="ms-alert-dialog"
      onCancel={(event) => {
        // Esc 关闭:先给用户回调拦截机会(preventDefault 则不关)
        if (active?.onEscapeKeyDown) {
          active.onEscapeKeyDown(event.nativeEvent);
          if (event.nativeEvent.defaultPrevented) {
            event.preventDefault();
            return;
          }
        }
        event.preventDefault(); // 接管关闭,走队列 settle 而非原生 close
        if (loading) return; // 异步进行中不允许 Esc 关闭
        settle(false);
      }}
      onClick={(event) => {
        if (event.target !== dialogRef.current) return; // 仅遮罩(dialog 本体)
        // 点外关闭:先给用户回调拦截机会
        if (active?.onPointerDownOutside) {
          active.onPointerDownOutside(event.nativeEvent);
          if (event.nativeEvent.defaultPrevented) return;
        }
        if (loading) return;
        settle(false);
      }}
    >
      {active && (
        <div
          key={active.id}
          className={[
            'ms-alert-dialog__panel',
            toneClass,
            active.variant !== 'default' && 'ms-alert-dialog__panel--accent',
            // 向后兼容:danger 保留旧 class(样式由 tone resolver 驱动,此 class 仅作选择器钩子)
            active.variant === 'danger' && 'ms-alert-dialog__panel--danger',
          ]
            .filter(Boolean)
            .join(' ')}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={active.title != null ? `ms-ad-title-${active.id}` : undefined}
          aria-describedby={`ms-ad-msg-${active.id}`}
        >
          {active.icon != null && (
            <div className="ms-alert-dialog__icon" aria-hidden="true">
              {active.icon}
            </div>
          )}
          <div className="ms-alert-dialog__body">
            {active.title != null && (
              <h2 id={`ms-ad-title-${active.id}`} className="ms-alert-dialog__title">
                {active.title}
              </h2>
            )}
            <div id={`ms-ad-msg-${active.id}`} className="ms-alert-dialog__message">
              {active.message}
            </div>
            {active.kind === 'prompt' && (
              <>
                <input
                  ref={inputRef}
                  type={active.inputType}
                  className="ms-input ms-input--md ms-alert-dialog__input"
                  value={inputValue}
                  placeholder={active.placeholder}
                  aria-invalid={isInvalid || undefined}
                  aria-describedby={isInvalid ? `ms-ad-err-${active.id}` : undefined}
                  onChange={(event) => {
                    const next = event.target.value;
                    setInputValue(next);
                    active.onValueChange?.(next);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleConfirm();
                    }
                  }}
                />
                {isInvalid && (
                  <p id={`ms-ad-err-${active.id}`} className="ms-alert-dialog__error" role="alert">
                    {validationError}
                  </p>
                )}
              </>
            )}
          </div>
          <div className="ms-alert-dialog__actions">
            {hasCancel && (
              <button
                ref={cancelRef}
                type="button"
                className="ms-button ms-button--ghost ms-button--md ms-alert-dialog__cancel"
                disabled={loading}
                onClick={handleCancel}
              >
                {active.cancelText}
              </button>
            )}
            <button
              ref={confirmRef}
              type="button"
              className={[
                'ms-button',
                'ms-button--solid',
                'ms-button--md',
                'ms-alert-dialog__confirm',
                loading && 'ms-button--loading',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={confirmDisabled}
              aria-busy={loading || undefined}
              onClick={handleConfirm}
            >
              <span className="ms-button__content">{active.confirmText}</span>
              {loading && <span className="ms-button__spinner" aria-hidden="true" />}
            </button>
          </div>
        </div>
      )}
    </dialog>,
    document.body,
  );
}

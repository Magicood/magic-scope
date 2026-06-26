import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { translate, useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'loading';
export type ToastPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

/** 关闭来源:手动(关闭钮 / toast.dismiss)/ 自动到期 / 点 action / 同 id 替换。 */
export type ToastDismissReason = 'manual' | 'auto' | 'action' | 'replace';

/** 单条 toast 各部件的细粒度 className,便于深度定制而不丢内部布局。 */
export interface ToastClassNames {
  /** 根 <li>。 */
  root?: string;
  /** 图标列。 */
  icon?: string;
  /** 主消息行。 */
  message?: string;
  /** 描述行。 */
  description?: string;
  /** 行动按钮。 */
  action?: string;
  /** 关闭按钮。 */
  close?: string;
}

export interface ToastOptions {
  /** 指定 id(重复 id 会替换并重置寿命,用于更新进行中的提示如「上传中→完成」)。默认自动生成。 */
  id?: string;
  /** 语义变体。默认 default。 */
  variant?: ToastVariant;
  /** 自动消失时长(ms)。0 或 Infinity 表示常驻(需手动关闭)。默认 4000。 */
  duration?: number;
  /** 次级描述文字。 */
  description?: ReactNode;
  /** 行动按钮:点击后执行并关闭。 */
  action?: { label: ReactNode; onClick: () => void };
  /**
   * 图标:不传按 variant 给默认符文(loading 显示旋转符文);传 ReactNode 覆盖;传 false 完全关闭图标列。
   */
  icon?: ReactNode | false;
  /** 自定义关闭按钮内容(默认 ×)。 */
  closeIcon?: ReactNode;
  /** 各部件细粒度 className。 */
  classNames?: ToastClassNames;
  /** 任意关闭时触发(手动 / 自动 / action / 替换),携带关闭来源。 */
  onDismiss?: (id: string, reason: ToastDismissReason) => void;
  /** 仅自动到期消失时触发(区分手动关闭)。 */
  onAutoClose?: (id: string) => void;
  /** 点击 toast 主体(非 action / 关闭钮)时触发,用于跳转 / 查看详情。 */
  onClick?: (id: string) => void;
}

type VariantOptions = Omit<ToastOptions, 'variant'>;

/** toast.promise 的三态文案(可为 ReactNode,error 还可接收错误对象派生)。 */
export interface ToastPromiseMessages<T> {
  loading: ReactNode;
  success: ReactNode | ((value: T) => ReactNode);
  error: ReactNode | ((error: unknown) => ReactNode);
}

interface ToastRecord {
  id: string;
  message: ReactNode;
  variant: ToastVariant;
  duration: number;
  description: ReactNode | undefined;
  action: { label: ReactNode; onClick: () => void } | undefined;
  icon: ReactNode | false | undefined;
  closeIcon: ReactNode | undefined;
  classNames: ToastClassNames | undefined;
  onDismiss: ((id: string, reason: ToastDismissReason) => void) | undefined;
  onAutoClose: ((id: string) => void) | undefined;
  onClick: ((id: string) => void) | undefined;
  /** 每次 addToast 自增,同 id 替换时变化 → 强制 ToastView 重启计时。 */
  rev: number;
  dismissing?: boolean;
}

interface Announcement {
  text: string;
  assertive: boolean;
  key: number;
}

/* —— 模块级 store:toast() 可在任意处调用,Toaster 经 useSyncExternalStore 订阅,无需 Provider —— */
const DEFAULT_EXIT_MS = 200;
const DEFAULT_MAX_TOASTS = 5;
/** 退场动画时长 / 软上限:可由 Toaster 注入覆盖(挂载时 setToasterConfig)。 */
let EXIT_MS = DEFAULT_EXIT_MS;
let MAX_TOASTS = DEFAULT_MAX_TOASTS;
const EMPTY: ToastRecord[] = [];
let records: ToastRecord[] = EMPTY;
let announcement: Announcement | null = null;
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
const getRecords = () => records;
const getAnnouncement = () => announcement;
const getEmptyRecords = () => EMPTY;
const getNullAnnouncement = (): Announcement | null => null;

/** Toaster 挂载时注入软上限 / 退场时长;传 undefined 的项回退默认值。 */
function setToasterConfig(config: { max?: number | undefined; exitMs?: number | undefined }): void {
  MAX_TOASTS = config.max != null && config.max > 0 ? config.max : DEFAULT_MAX_TOASTS;
  EXIT_MS = config.exitMs != null && config.exitMs >= 0 ? config.exitMs : DEFAULT_EXIT_MS;
}

function buildAnnouncement(
  message: ReactNode,
  description: ReactNode,
  variant: ToastVariant,
): Announcement | null {
  // 仅对可读文本播报;非字符串(JSX)内容跳过,保持上一次播报不变
  const parts: string[] = [];
  if (typeof message === 'string') parts.push(message);
  if (typeof description === 'string') parts.push(description);
  if (parts.length === 0) return announcement;
  return {
    text: parts.join('。'),
    assertive: variant === 'danger' || variant === 'warning',
    key: ++seq,
  };
}

function addToast(message: ReactNode, options: ToastOptions = {}): string {
  const n = ++seq;
  const id = options.id ?? `ms-toast-${n}`;
  const variant = options.variant ?? 'default';
  const record: ToastRecord = {
    id,
    message,
    variant,
    duration: options.duration ?? 4000,
    description: options.description,
    action: options.action,
    icon: options.icon,
    closeIcon: options.closeIcon,
    classNames: options.classNames,
    onDismiss: options.onDismiss,
    onAutoClose: options.onAutoClose,
    onClick: options.onClick,
    rev: n,
  };
  records = records.some((r) => r.id === id)
    ? records.map((r) => (r.id === id ? record : r))
    : [...records, record];
  announcement = buildAnnouncement(message, options.description, variant);
  emit();
  // 软上限:超出后让最旧的非退场项正常退场,兜底防爆屏
  const live = records.filter((r) => !r.dismissing);
  const oldest = live[0];
  if (live.length > MAX_TOASTS && oldest) dismissToast(oldest.id);
  return id;
}

/**
 * 触发一条 toast 退场。`reason` 标记来源:
 * manual(关闭钮 / toast.dismiss)、auto(到期)、action(点行动钮)、replace(被同 id 顶替,内部用)。
 * 退场:先标 dismissing(走退场动画),EXIT_MS 后真正移除。回调在标记退场的同一拍触发。
 */
function dismissToast(id: string, reason: ToastDismissReason = 'manual'): void {
  const target = records.find((r) => r.id === id && !r.dismissing);
  if (!target) return;
  records = records.map((r) => (r.id === id ? { ...r, dismissing: true } : r));
  emit();
  // 来源回调:auto 额外触发 onAutoClose;onDismiss 始终携带来源触发
  if (reason === 'auto') target.onAutoClose?.(id);
  target.onDismiss?.(id, reason);
  setTimeout(() => {
    // 只删仍处于退场中的同 id;若窗口内被同 id 复活(新记录无 dismissing),不误删
    records = records.filter((r) => !(r.id === id && r.dismissing));
    emit();
  }, EXIT_MS);
}

/**
 * toast.promise —— 跟踪一个 Promise:先弹 loading 常驻提示,
 * resolve → 同 id 替换为 success(恢复计时)、reject → 同 id 替换为 danger。
 * 返回原 Promise 以便链式 / await。文案支持函数派生(拿到 value / error)。
 */
function toastPromise<T>(
  promise: Promise<T>,
  messages: ToastPromiseMessages<T>,
  options: VariantOptions = {},
): Promise<T> {
  // ...options 已带 options.id(可选);此处不再重复指定 id,避免 exactOptionalPropertyTypes 下 string|undefined 撞 string
  const id = addToast(messages.loading, {
    ...options,
    variant: 'loading',
    duration: 0,
  });
  promise.then(
    (value) => {
      const next =
        typeof messages.success === 'function' ? messages.success(value) : messages.success;
      addToast(next, { ...options, id, variant: 'success' });
    },
    (error) => {
      const next = typeof messages.error === 'function' ? messages.error(error) : messages.error;
      addToast(next, { ...options, id, variant: 'danger' });
    },
  );
  return promise;
}

/**
 * toast() —— 命令式弹出提示,返回 id。可在组件外任意处调用(无需 Provider)。
 * 变体快捷方法:toast.success / error / warning / info / loading;toast.dismiss(id) 主动关闭;
 * toast.promise(p, {loading,success,error}) 跟踪异步。
 * 需在应用根挂载一个 <Toaster /> 渲染容器。
 */
export const toast = Object.assign(
  (message: ReactNode, options?: ToastOptions) => addToast(message, options),
  {
    success: (message: ReactNode, options?: VariantOptions) =>
      addToast(message, { ...options, variant: 'success' }),
    error: (message: ReactNode, options?: VariantOptions) =>
      addToast(message, { ...options, variant: 'danger' }),
    warning: (message: ReactNode, options?: VariantOptions) =>
      addToast(message, { ...options, variant: 'warning' }),
    info: (message: ReactNode, options?: VariantOptions) =>
      addToast(message, { ...options, variant: 'info' }),
    loading: (message: ReactNode, options?: VariantOptions) =>
      addToast(message, { ...options, variant: 'loading', duration: options?.duration ?? 0 }),
    promise: toastPromise,
    dismiss: (id: string) => dismissToast(id, 'manual'),
  },
);

/** variant → tone 类(读统一 6 槽位,与 Button/Alert 同源)。default 走中性,loading 跟随 info。 */
const VARIANT_TONE: Record<ToastVariant, string> = {
  default: 'ms-tone-neutral',
  success: 'ms-tone-success',
  warning: 'ms-tone-warning',
  danger: 'ms-tone-danger',
  info: 'ms-tone-info',
  loading: 'ms-tone-info',
};

/** variant → 默认图标符文(可被 icon prop 覆盖或 false 关闭;default 无默认图标)。 */
const VARIANT_ICON: Record<ToastVariant, ReactNode> = {
  default: null,
  success: '✓',
  warning: '⚠',
  danger: '✕',
  info: 'ℹ',
  loading: <span className="ms-toast__spinner" aria-hidden="true" />,
};

export interface ToasterProps extends Omit<ComponentPropsWithoutRef<'ol'>, 'aria-label'> {
  /** 弹出位置。默认 bottom-end。 */
  position?: ToastPosition;
  /** 可访问的区域标签。默认走 i18n toaster.region(「通知」)。 */
  label?: string;
  /** 同屏最多保留的活跃 toast 数,超出让最旧的退场。默认 5。 */
  max?: number;
  /** 默认自动消失时长(ms),作为单条 toast 未显式指定 duration 时的兜底。默认 4000。 */
  duration?: number;
  /** toast 之间的间距(CSS 长度,如 "0.75rem")。默认走 token --ms-space-3。 */
  gap?: string;
  /** 是否展开堆叠(预留:为未来折叠态留口,当前恒展开)。默认 true。 */
  expand?: boolean;
}

/**
 * Toaster —— toast 渲染容器。订阅模块 store,portal 到 body,固定定位 + 安全区避让。
 * 同时渲染两个持久的视觉隐藏 live region(polite / assertive),把可读文本解耦播报给屏幕阅读器
 * (region 先于内容存在才能稳定播报)。在应用根渲染一次即可。
 * <ol> spread ...rest(原生事件 / data-* / aria-* 可挂),max / gap / expand 注入容器行为。
 */
export function Toaster({
  position = 'bottom-end',
  label,
  max,
  duration,
  gap,
  expand = true,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: ToasterProps) {
  const t = useMessages();
  const items = useSyncExternalStore(subscribe, getRecords, getEmptyRecords);
  const live = useSyncExternalStore(subscribe, getAnnouncement, getNullAnnouncement);
  const [mounted, setMounted] = useState(false);

  // 软上限 / 退场时长注入 store(命令式路径 addToast/dismissToast 据此运作)
  useEffect(() => {
    setToasterConfig({ max, exitMs: undefined });
    return () => setToasterConfig({});
  }, [max]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  const regionLabel = label ?? t('toaster.region', undefined, '通知');
  const mergedStyle: CSSProperties = {
    ...(gap != null ? { gap } : null),
    ...style,
  };

  return createPortal(
    <>
      <div className="ms-toaster-sr" aria-live="polite" aria-atomic="true">
        {live && !live.assertive ? live.text : ''}
      </div>
      <div className="ms-toaster-sr" aria-live="assertive" aria-atomic="true">
        {live?.assertive ? live.text : ''}
      </div>
      <ol
        className={['ms-toaster', `ms-toaster--${position}`, className].filter(Boolean).join(' ')}
        style={mergedStyle}
        data-expand={expand ? '' : undefined}
        aria-label={regionLabel}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        {...rest}
      >
        {items.map((record) => (
          <ToastView key={record.id} record={record} defaultDuration={duration} />
        ))}
      </ol>
    </>,
    document.body,
  );
}

function ToastView({
  record,
  defaultDuration,
}: {
  record: ToastRecord;
  defaultDuration: number | undefined;
}) {
  const {
    id,
    message,
    variant,
    description,
    action,
    icon,
    closeIcon,
    classNames,
    onClick,
    dismissing,
    rev,
  } = record;
  // 单条未显式给 duration 时,addToast 已落 4000;但若 Toaster 提供了 duration 兜底且该条用的是默认值,采用 Toaster 值
  const duration =
    record.duration === 4000 && defaultDuration != null ? defaultDuration : record.duration;
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const remainingRef = useRef(duration);
  const startRef = useRef(0);
  // 悬停与聚焦是两个独立的暂停维度;计数从 0→1 才真正暂停、1→0 才真正恢复,避免叠加重复扣减剩余时间
  const pauseCountRef = useRef(0);

  const persistent = !duration || duration === Number.POSITIVE_INFINITY;

  const pause = () => {
    if (persistent || dismissing) return;
    if (pauseCountRef.current++ > 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startRef.current));
  };
  const resume = () => {
    if (persistent || dismissing) return;
    if (pauseCountRef.current === 0) return;
    if (--pauseCountRef.current > 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    startRef.current = Date.now();
    timerRef.current = setTimeout(
      () => dismissToast(id, 'auto'),
      Math.max(0, remainingRef.current),
    );
  };

  // 进入 / duration 变化 / 同 id 重发(rev)时(重)启计时;退场或卸载时清理。
  // biome-ignore lint/correctness/useExhaustiveDependencies: rev 仅作同 id 重发的重启触发,不在体内直接引用
  useEffect(() => {
    remainingRef.current = duration;
    pauseCountRef.current = 0;
    if (dismissing || persistent) return;
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => dismissToast(id, 'auto'), duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, duration, dismissing, persistent, rev]);

  // 图标:false 关闭整列;未传按 variant 给默认符文(loading→旋转符文);传 ReactNode 覆盖
  const iconNode = icon === false ? null : (icon ?? VARIANT_ICON[variant]);
  const showIcon = iconNode != null;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: 整条点击是可选鼠标增强(onClick 透传);键盘用户走内部独立可聚焦的 action / close 按钮,主体不抢焦点,故不绑键盘
    <li
      className={[
        'ms-toast',
        `ms-toast--${variant}`,
        VARIANT_TONE[variant],
        onClick && 'ms-toast--clickable',
        dismissing && 'ms-toast--exiting',
        classNames?.root,
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onClick={onClick ? () => onClick(id) : undefined}
    >
      {showIcon && (
        <span
          className={['ms-toast__icon', classNames?.icon].filter(Boolean).join(' ')}
          aria-hidden="true"
        >
          {iconNode}
        </span>
      )}
      <div className="ms-toast__content">
        <p className={['ms-toast__message', classNames?.message].filter(Boolean).join(' ')}>
          {message}
        </p>
        {description != null && (
          <p
            className={['ms-toast__description', classNames?.description].filter(Boolean).join(' ')}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <button
          type="button"
          className={['ms-toast__action', classNames?.action].filter(Boolean).join(' ')}
          onClick={composeEventHandlers(
            (e) => e.stopPropagation(),
            () => {
              action.onClick();
              dismissToast(id, 'action');
            },
          )}
        >
          {action.label}
        </button>
      )}
      <button
        type="button"
        className={['ms-toast__close', classNames?.close].filter(Boolean).join(' ')}
        aria-label={translate('toast.close', undefined, '关闭')}
        onClick={composeEventHandlers(
          (e) => e.stopPropagation(),
          () => dismissToast(id, 'manual'),
        )}
      >
        {closeIcon ?? <span aria-hidden="true">×</span>}
      </button>
    </li>
  );
}

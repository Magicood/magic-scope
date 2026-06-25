import type { ReactNode } from 'react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type ToastPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

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
}

type VariantOptions = Omit<ToastOptions, 'variant'>;

interface ToastRecord {
  id: string;
  message: ReactNode;
  variant: ToastVariant;
  duration: number;
  description: ReactNode | undefined;
  action: { label: ReactNode; onClick: () => void } | undefined;
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
const EXIT_MS = 200;
const MAX_TOASTS = 5;
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

function dismissToast(id: string): void {
  // 仅对仍存活的 toast 触发一次退场:先标 dismissing(走退场动画),EXIT_MS 后真正移除
  if (!records.some((r) => r.id === id && !r.dismissing)) return;
  records = records.map((r) => (r.id === id ? { ...r, dismissing: true } : r));
  emit();
  setTimeout(() => {
    // 只删仍处于退场中的同 id;若窗口内被同 id 复活(新记录无 dismissing),不误删
    records = records.filter((r) => !(r.id === id && r.dismissing));
    emit();
  }, EXIT_MS);
}

/**
 * toast() —— 命令式弹出提示,返回 id。可在组件外任意处调用(无需 Provider)。
 * 变体快捷方法:toast.success / error / warning / info;toast.dismiss(id) 主动关闭。
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
    dismiss: (id: string) => dismissToast(id),
  },
);

export interface ToasterProps {
  /** 弹出位置。默认 bottom-end。 */
  position?: ToastPosition;
  /** 可访问的区域标签。默认「通知」。 */
  label?: string;
}

/**
 * Toaster —— toast 渲染容器。订阅模块 store,portal 到 body,固定定位 + 安全区避让。
 * 同时渲染两个持久的视觉隐藏 live region(polite / assertive),把可读文本解耦播报给屏幕阅读器
 * (region 先于内容存在才能稳定播报)。在应用根渲染一次即可。
 */
export function Toaster({ position = 'bottom-end', label = '通知' }: ToasterProps) {
  const items = useSyncExternalStore(subscribe, getRecords, getEmptyRecords);
  const live = useSyncExternalStore(subscribe, getAnnouncement, getNullAnnouncement);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div className="ms-toaster-sr" aria-live="polite" aria-atomic="true">
        {live && !live.assertive ? live.text : ''}
      </div>
      <div className="ms-toaster-sr" aria-live="assertive" aria-atomic="true">
        {live?.assertive ? live.text : ''}
      </div>
      <ol className={`ms-toaster ms-toaster--${position}`} aria-label={label}>
        {items.map((record) => (
          <ToastView key={record.id} record={record} />
        ))}
      </ol>
    </>,
    document.body,
  );
}

function ToastView({ record }: { record: ToastRecord }) {
  const { id, message, variant, duration, description, action, dismissing, rev } = record;
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
    timerRef.current = setTimeout(() => dismissToast(id), Math.max(0, remainingRef.current));
  };

  // 进入 / duration 变化 / 同 id 重发(rev)时(重)启计时;退场或卸载时清理。
  // biome-ignore lint/correctness/useExhaustiveDependencies: rev 仅作同 id 重发的重启触发,不在体内直接引用
  useEffect(() => {
    remainingRef.current = duration;
    pauseCountRef.current = 0;
    if (dismissing || persistent) return;
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => dismissToast(id), duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, duration, dismissing, persistent, rev]);

  return (
    <li
      className={['ms-toast', `ms-toast--${variant}`, dismissing && 'ms-toast--exiting']
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <div className="ms-toast__content">
        <p className="ms-toast__message">{message}</p>
        {description != null && <p className="ms-toast__description">{description}</p>}
      </div>
      {action && (
        <button
          type="button"
          className="ms-toast__action"
          onClick={() => {
            action.onClick();
            dismissToast(id);
          }}
        >
          {action.label}
        </button>
      )}
      <button
        type="button"
        className="ms-toast__close"
        aria-label="关闭"
        onClick={() => dismissToast(id)}
      >
        <span aria-hidden="true">×</span>
      </button>
    </li>
  );
}

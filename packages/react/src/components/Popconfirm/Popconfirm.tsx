import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { Button, type ButtonProps, type ButtonTone } from '../Button/Button';
import { Popover, type PopoverPlacement, type PopoverTone } from '../Popover/Popover';

/** 确认气泡的语义色调,经全库 tone resolver 派生确认按钮配色与浮层发光。 */
export type PopconfirmTone = PopoverTone;

/** 浮层内各部件的细粒度 className 槽位。 */
export interface PopconfirmClassNames {
  /** 内容容器(标题 / 描述 / 操作的外层)。 */
  body?: string | undefined;
  /** 标题行。 */
  title?: string | undefined;
  /** 描述行。 */
  desc?: string | undefined;
  /** 操作按钮行。 */
  actions?: string | undefined;
}

/** 浮层根容器(<div role="dialog">)可透传的原生属性,排除会被内部接管的键。 */
type PopconfirmRootProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  // title 是 ReactNode 槽位,与原生 HTML title 属性冲突,从根 props 排除后单独声明
  'title' | 'children' | 'className' | 'style' | 'role'
>;

export interface PopconfirmProps extends PopconfirmRootProps {
  /** 触发元素(单个 React 元素),点击弹出确认气泡。 */
  trigger: ReactElement;
  /** 确认标题 / 主问题(ReactNode 槽位,覆盖原生 title 属性)。 */
  title?: ReactNode;
  /** 次级描述。 */
  description?: ReactNode;
  /** 标题前的警示图标槽。 */
  icon?: ReactNode;
  /**
   * 点击确认时触发。返回 Promise 时进入异步态:确认按钮 loading + 禁用,
   * resolve 后自动关闭,reject(失败)则保持打开,便于重试。
   */
  onConfirm?: () => void | Promise<void>;
  /** 点击取消 / 点外 / Esc 关闭时触发。 */
  onCancel?: () => void;
  /** 确认按钮文案。默认走 i18n popconfirm.confirm(「确定」)。 */
  confirmText?: ReactNode;
  /** 取消按钮文案。默认走 i18n popconfirm.cancel(「取消」)。 */
  cancelText?: ReactNode;
  /** 语义色调,派生确认按钮配色与浮层发光。默认 primary。 */
  tone?: PopconfirmTone;
  /**
   * @deprecated 用 `tone="danger"` 替代。保留作向后兼容:danger 时确认按钮染危险色。
   * 当未显式传 `tone` 时,`variant="danger"` 仍会把 tone 收敛为 danger。
   */
  variant?: 'default' | 'danger';
  /** 受控:确认按钮是否处于 loading(异步确认期间内部也会自动置 loading)。 */
  confirmLoading?: boolean;
  /** 气泡相对 trigger 的方位。默认 top。 */
  placement?: PopoverPlacement;
  /** 受控:是否打开。传入即进入受控模式。 */
  open?: boolean;
  /** 非受控初始打开态。默认 false。 */
  defaultOpen?: boolean;
  /**
   * 显隐变化回调(受控 / 非受控均触发)。
   * @param open 变化后的目标显隐状态:true 为打开,false 为关闭。
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Esc 键按下回调;在回调内 preventDefault 可阻止默认的关闭。
   * @param event 触发关闭的原生键盘事件(Esc),在其上调用 preventDefault 可拦截默认关闭。
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /**
   * 点击浮层外部(pointerdown)回调;preventDefault 可阻止关闭。
   * @param event 浮层外部按下的原生指针事件,在其上调用 preventDefault 可拦截关闭。
   */
  onPointerDownOutside?: (event: PointerEvent) => void;
  /** 透传给确认按钮的属性(覆盖内部默认,事件 compose)。 */
  confirmButtonProps?: ButtonProps;
  /** 透传给取消按钮的属性。 */
  cancelButtonProps?: ButtonProps;
  /** 浮层根容器附加 className。 */
  className?: string;
  /** 浮层内各部件细粒度 className 槽位。 */
  classNames?: PopconfirmClassNames;
}

/**
 * Popconfirm —— 锚定在元素旁的轻量确认气泡(非全屏模态)。自研、零依赖。
 * 复用 Popover(原生 Popover API + CSS Anchor Positioning,点外 / Esc 关闭),内建确认 / 取消按钮流。
 * - tone 色调经全库 tone resolver 驱动确认按钮配色与浮层发光(只读 6 槽位,不写死);
 * - 异步确认:onConfirm 返回 Promise 时确认按钮 loading + 禁用,resolve 才关、reject 保持打开;
 * - 受控(open + onOpenChange)/ 非受控(defaultOpen)双通道,可程序化控制(异步中保持打开);
 * - 留口:根 spread ...rest 透传原生属性 / 事件;confirmButtonProps / cancelButtonProps 透传内部按钮;
 *   classNames 细粒度槽位;icon 警示槽;onEscapeKeyDown / onPointerDownOutside 可拦截关闭。
 * 常用于列表内联删除确认。需配合 @magic-scope/react/styles.css。
 */
export function Popconfirm({
  trigger,
  title,
  description,
  icon,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  tone,
  variant = 'default',
  confirmLoading,
  placement = 'top',
  open,
  defaultOpen = false,
  onOpenChange,
  onEscapeKeyDown,
  onPointerDownOutside,
  confirmButtonProps,
  cancelButtonProps,
  className,
  classNames,
  ...rest
}: PopconfirmProps) {
  const t = useMessages();

  // tone 优先;未显式传 tone 时 variant="danger" 向后兼容收敛为 danger
  const resolvedTone: PopconfirmTone = tone ?? (variant === 'danger' ? 'danger' : 'primary');

  // 受控 / 非受控双通道
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;

  // 异步确认进行中的内部 loading
  const [asyncPending, setAsyncPending] = useState(false);
  // 受控 open 下,onOpenChange 调用本身不会改 isOpen,关闭路径要去重(异步 resolve 与点取消可能撞)
  const pendingRef = useRef(false);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const handleCancel = useCallback(() => {
    if (pendingRef.current) {
      return;
    }
    onCancel?.();
    setOpen(false);
  }, [onCancel, setOpen]);

  const handleConfirm = useCallback(() => {
    if (pendingRef.current) {
      return;
    }
    const result = onConfirm?.();
    if (result && typeof result.then === 'function') {
      pendingRef.current = true;
      setAsyncPending(true);
      result.then(
        () => {
          pendingRef.current = false;
          setAsyncPending(false);
          setOpen(false);
        },
        () => {
          // 失败:保持打开,清掉 loading 便于重试(不吞错,交给上层的 .catch / 全局处理)
          pendingRef.current = false;
          setAsyncPending(false);
        },
      );
      return;
    }
    // 同步确认:直接关闭
    setOpen(false);
  }, [onConfirm, setOpen]);

  const loading = asyncPending || confirmLoading === true;

  // Button 的 tone 不含 neutral;确认按钮(solid)把 neutral 收敛回 primary,其余直接平移
  const confirmButtonTone: ButtonTone = resolvedTone === 'neutral' ? 'primary' : resolvedTone;

  const bodyClassName = ['ms-popconfirm__body', classNames?.body].filter(Boolean).join(' ');
  const titleClassName = ['ms-popconfirm__title', classNames?.title].filter(Boolean).join(' ');
  const descClassName = ['ms-popconfirm__desc', classNames?.desc].filter(Boolean).join(' ');
  const actionsClassName = ['ms-popconfirm__actions', classNames?.actions]
    .filter(Boolean)
    .join(' ');

  return (
    <Popover
      {...rest}
      open={isOpen}
      onOpenChange={(next) => {
        // 点外 / Esc 关闭也算取消;受控时 next 由 Popover 透传,这里仅做语义派发
        if (!next && isOpen) {
          // 异步进行中拦住关闭(Popover 内部不知道我们的 pending 态)
          if (pendingRef.current) {
            return;
          }
          onCancel?.();
        }
        setOpen(next);
      }}
      onEscapeKeyDown={(event) => {
        onEscapeKeyDown?.(event);
        // 异步进行中:拦截 Esc 关闭
        if (pendingRef.current && !event.defaultPrevented) {
          event.preventDefault();
        }
      }}
      onPointerDownOutside={(event) => {
        onPointerDownOutside?.(event);
        if (pendingRef.current && !event.defaultPrevented) {
          event.preventDefault();
        }
      }}
      trigger={trigger}
      placement={placement}
      tone={resolvedTone}
      className={['ms-popconfirm', className].filter(Boolean).join(' ')}
    >
      <div className={bodyClassName}>
        {(title != null || icon != null) && (
          <div className={titleClassName}>
            {icon != null && (
              <span className="ms-popconfirm__icon" aria-hidden="true">
                {icon}
              </span>
            )}
            {title != null && <span className="ms-popconfirm__title-text">{title}</span>}
          </div>
        )}
        {description != null && <div className={descClassName}>{description}</div>}
        <div className={actionsClassName}>
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            {...cancelButtonProps}
            className={['ms-popconfirm__cancel', cancelButtonProps?.className]
              .filter(Boolean)
              .join(' ')}
            onClick={composeEventHandlers(cancelButtonProps?.onClick, () => handleCancel())}
          >
            {cancelButtonProps?.children ?? cancelText ?? t('popconfirm.cancel', undefined, '取消')}
          </Button>
          <Button
            variant="solid"
            tone={confirmButtonTone}
            size="sm"
            loading={loading}
            {...confirmButtonProps}
            className={['ms-popconfirm__confirm', confirmButtonProps?.className]
              .filter(Boolean)
              .join(' ')}
            onClick={composeEventHandlers(confirmButtonProps?.onClick, () => handleConfirm())}
          >
            {confirmButtonProps?.children ??
              confirmText ??
              t('popconfirm.confirm', undefined, '确定')}
          </Button>
        </div>
      </div>
    </Popover>
  );
}
Popconfirm.displayName = 'Popconfirm';

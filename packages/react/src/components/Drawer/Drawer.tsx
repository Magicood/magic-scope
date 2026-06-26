import type {
  ComponentPropsWithoutRef,
  ReactElement,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  PointerEvent as ReactPointerEvent,
  Ref,
} from 'react';
import { cloneElement, forwardRef, isValidElement, useCallback, useEffect, useRef } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers, composeRefs, mergeAsChildProps } from '../../utils/compose';

export type DrawerSide = 'start' | 'end' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg';
export type DrawerTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** 各部件的细粒度 className,便于深度定制而不丢内部布局。 */
export interface DrawerClassNames {
  /** 遮罩(::backdrop 无法直接挂 class,这里作用于根 dialog,与 panel 区分语义)。 */
  backdrop?: string;
  /** 面板(贴边滑出的实体容器)。 */
  panel?: string;
  /** 头部区。 */
  header?: string;
  /** 标题文本。 */
  title?: string;
  /** 正文滚动区。 */
  body?: string;
  /** 底栏(固定操作区)。 */
  footer?: string;
  /** 关闭按钮。 */
  close?: string;
}

export interface DrawerProps extends Omit<ComponentPropsWithoutRef<'dialog'>, 'open' | 'title'> {
  /** 是否打开(受控)。 */
  open: boolean;
  /** 关闭时回调(Esc / 点击遮罩 / 关闭按钮 / 原生 close)。 */
  onClose?: () => void;
  /**
   * 开合状态变更(开合标配的受控/非受控双通道)。任意关闭路径都会以 false 触发;
   * 与 onClose 同时存在时两者都调用(onOpenChange 语义更通用)。
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * 按下 Esc 时触发(关闭前)。调用 event.preventDefault() 可阻止关闭,
   * 用于「抽屉内表单未保存」二次确认。
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /**
   * 在遮罩(面板之外)按下指针时触发(关闭前)。调用 event.preventDefault() 可阻止关闭。
   */
  onPointerDownOutside?: (event: ReactPointerEvent<HTMLDialogElement>) => void;
  /**
   * 与外部(遮罩)发生交互时触发(关闭前),是 onPointerDownOutside 的语义别名,
   * 任一调用 preventDefault 都会阻止关闭。便于与其它库的 onInteractOutside 习惯对齐。
   */
  onInteractOutside?: (event: ReactPointerEvent<HTMLDialogElement>) => void;
  /** 滑入边:start(左)/ end(右,默认)/ top / bottom。 */
  side?: DrawerSide;
  /** 尺寸:sm / md(默认)/ lg。控横向(start/end)或纵向(top/bottom)尺寸档位。 */
  size?: DrawerSize;
  /** 语义色调,经全库 tone resolver 派生(focus 环 / 贴边描边 / 辉光)。默认 primary。 */
  tone?: DrawerTone;
  /**
   * 头部整块(ReactNode)。优先于 title;传入后自行负责头部布局,
   * 仍会在其右侧渲染关闭按钮(除非 hideCloseButton)。
   */
  header?: ReactNode;
  /** 标题(可选);设置后渲染默认头部并与抽屉 aria-labelledby 关联。 */
  title?: ReactNode;
  /** 底栏(固定底部、安全区避让),常放主/次操作按钮。 */
  footer?: ReactNode;
  /** 点击遮罩是否关闭。默认 true。 */
  dismissable?: boolean;
  /** 隐藏内建关闭按钮(自带关闭入口时)。默认 false。 */
  hideCloseButton?: boolean;
  /** 自定义关闭图标(覆盖默认 ✕ 符文)。 */
  closeIcon?: ReactNode;
  /** 各部件细粒度 className。 */
  classNames?: DrawerClassNames;
  /** 把 panel 渲染为子元素(合并样式 / props 到子元素,Radix Slot 风格)。 */
  asChild?: boolean;
  children?: ReactNode;
}

let drawerSeq = 0;

const DefaultCloseIcon = () => (
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
);

/**
 * Drawer —— 侧边抽屉(旗舰深度组件)。基于原生 <dialog> + showModal():
 * 焦点陷阱、Esc、::backdrop、top-layer 全部白嫖。
 * 自研封装:受控 open + onOpenChange 双通道、四方向滑入(start/end/top/bottom)、
 * size 档位(sm/md/lg)、tone 色调(读统一 6 槽位)、可拦截的 Esc / 点遮罩关闭
 * (onEscapeKeyDown / onPointerDownOutside / onInteractOutside,preventDefault 阻止关闭)、
 * 头部整块 / title / Footer 固定底栏(安全区避让)、可换关闭图标 / 隐藏关闭钮、
 * classNames 细粒度定制、asChild 替换 panel、锁背景滚动、尊重 reduced-motion / fx 总闸。
 * 样式见同目录 Drawer.css,需引入 @magic-scope/react/styles.css。
 */
export const Drawer = forwardRef<HTMLDialogElement, DrawerProps>((props, ref) => {
  const {
    open,
    onClose,
    onOpenChange,
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    side = 'end',
    size = 'md',
    tone = 'primary',
    header,
    title,
    footer,
    dismissable = true,
    hideCloseButton = false,
    closeIcon,
    classNames,
    asChild = false,
    className,
    children,
    onClick,
    onPointerDown,
    onCancel,
    ...rest
  } = props as DrawerProps & {
    onClick?: ComponentPropsWithoutRef<'dialog'>['onClick'];
    onPointerDown?: ComponentPropsWithoutRef<'dialog'>['onPointerDown'];
    onCancel?: ComponentPropsWithoutRef<'dialog'>['onCancel'];
  };

  const t = useMessages();
  const innerRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useRef(`ms-drawer-title-${++drawerSeq}`).current;
  // 记录 pointerdown 是否落在遮罩上,避免「面板内按下、拖到遮罩松手」被误判为外部点击
  const pointerDownOnBackdrop = useRef(false);
  // 防重入:requestClose 触发受控方收 open → d.close() 又派发原生 close,避免回调被调两次
  const closing = useRef(false);

  // 统一关闭出口:onClose + onOpenChange(false) 双通道
  const requestClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    onClose?.();
    onOpenChange?.(false);
    // 同一 tick 内去抖;下一帧恢复,供下次开合
    queueMicrotask(() => {
      closing.current = false;
    });
  }, [onClose, onOpenChange]);

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

  // 原生 <dialog> 的 Esc 会先派发 cancel(可 preventDefault):走 onEscapeKeyDown 拦截
  const handleCancel = useCallback(
    (event: Parameters<NonNullable<ComponentPropsWithoutRef<'dialog'>['onCancel']>>[0]) => {
      // 还原成 KeyboardEvent 语义传给用户(原生 cancel 的 nativeEvent 即按 Esc 的事件)
      const keyboardEvent = event.nativeEvent as unknown as KeyboardEvent;
      onEscapeKeyDown?.(keyboardEvent);
      if (event.defaultPrevented || keyboardEvent.defaultPrevented) {
        // 用户拦截:阻止原生关闭,保持打开
        event.preventDefault();
        return;
      }
      // 阻止原生「直接 close 不经 React」,统一走 requestClose 让受控方收敛 open
      event.preventDefault();
      requestClose();
    },
    [onEscapeKeyDown, requestClose],
  );

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDialogElement>) => {
    pointerDownOnBackdrop.current = event.target === innerRef.current;
  }, []);

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLDialogElement>) => {
      if (!dismissable) return;
      // 仅当 down 与 up 都在遮罩上(纯点击遮罩,非拖拽/选词)才视为外部点击
      if (event.target !== innerRef.current || !pointerDownOnBackdrop.current) return;
      pointerDownOnBackdrop.current = false;
      const outsideEvent = event as unknown as ReactPointerEvent<HTMLDialogElement>;
      onPointerDownOutside?.(outsideEvent);
      onInteractOutside?.(outsideEvent);
      if (outsideEvent.defaultPrevented) return;
      requestClose();
    },
    [dismissable, onInteractOutside, onPointerDownOutside, requestClose],
  );

  const closeButton = hideCloseButton ? null : (
    <button
      type="button"
      className={['ms-drawer__close', classNames?.close].filter(Boolean).join(' ')}
      aria-label={t('drawer.close', undefined, '关闭')}
      onClick={requestClose}
    >
      {closeIcon ?? <DefaultCloseIcon />}
    </button>
  );

  const hasHeader = header != null || title != null;
  const labelledBy = title != null && header == null ? titleId : undefined;

  const panelChildren = (
    <>
      {hasHeader ? (
        <header className={['ms-drawer__header', classNames?.header].filter(Boolean).join(' ')}>
          {header != null ? (
            <div className="ms-drawer__header-content">{header}</div>
          ) : (
            <h2
              id={titleId}
              className={['ms-drawer__title', classNames?.title].filter(Boolean).join(' ')}
            >
              {title}
            </h2>
          )}
          {closeButton}
        </header>
      ) : (
        closeButton != null && (
          <button
            type="button"
            className={['ms-drawer__close', 'ms-drawer__close--floating', classNames?.close]
              .filter(Boolean)
              .join(' ')}
            aria-label={t('drawer.close', undefined, '关闭')}
            onClick={requestClose}
          >
            {closeIcon ?? <DefaultCloseIcon />}
          </button>
        )
      )}
      <div className={['ms-drawer__body', classNames?.body].filter(Boolean).join(' ')}>
        {children}
      </div>
      {footer != null && (
        <footer className={['ms-drawer__footer', classNames?.footer].filter(Boolean).join(' ')}>
          {footer}
        </footer>
      )}
    </>
  );

  const panelClassName = ['ms-drawer__panel', classNames?.panel].filter(Boolean).join(' ');

  // asChild:把 panel 样式 / props 合并到用户提供的子元素(Radix Slot 风格,子元素自带内容,
  // 完全接管面板内部布局)。需要内建 header/body/footer 时不要用 asChild,直接用默认 panel。
  let panel: ReactNode;
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    const childRef = (child as { ref?: Ref<unknown> }).ref;
    const merged = mergeAsChildProps({ className: panelClassName }, child.props);
    panel = cloneElement(child, {
      ...merged,
      ref: composeRefs(childRef),
    } as Record<string, unknown>);
  } else {
    panel = <div className={panelClassName}>{panelChildren}</div>;
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: 键盘关闭由原生 <dialog> 的 Esc(cancel)提供;onClick 仅检测点击遮罩
    <dialog
      ref={setRef}
      className={[
        'ms-drawer',
        `ms-drawer--${side}`,
        `ms-drawer--${size}`,
        `ms-tone-${tone}`,
        classNames?.backdrop,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby={labelledBy}
      onCancel={composeEventHandlers(onCancel, handleCancel)}
      onPointerDown={composeEventHandlers(onPointerDown, handlePointerDown)}
      onClick={composeEventHandlers(onClick, handleClick)}
      // 原生 close(含 method=dialog 表单提交、外部直接 d.close())统一收口到 requestClose;
      // closing 去抖确保「受控关闭 → d.close() → close 事件」不会二次触发回调
      onClose={requestClose}
      {...rest}
    >
      {panel}
    </dialog>
  );
});
Drawer.displayName = 'Drawer';

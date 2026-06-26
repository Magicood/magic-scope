import type {
  ComponentPropsWithoutRef,
  ReactElement,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref,
} from 'react';
import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
} from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers, composeRefs, mergeAsChildProps } from '../../utils/compose';

export type DialogTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type DialogSize = 'sm' | 'md' | 'lg' | 'full';
export type DialogPlacement = 'center' | 'top';

/** 由子部件共享的上下文:提供 title / description 的稳定 id,供子部件挂 id、根 <dialog> 关联 aria-*。 */
interface DialogContextValue {
  titleId: string;
  descriptionId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(part: string): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error(`<Dialog.${part}> 必须用在 <Dialog> 内部`);
  }
  return ctx;
}

/**
 * 纯函数:在 children 树里递归探测是否存在某个子部件(用 displayName 匹配)。
 * 用于根 <dialog> 决定是否输出 aria-labelledby / aria-describedby,不依赖渲染顺序与副作用。
 */
function hasPartInTree(node: ReactNode, displayName: string): boolean {
  let found = false;
  Children.forEach(node, (child) => {
    if (found || !isValidElement(child)) {
      return;
    }
    const type = child.type as { displayName?: string } | string;
    if (typeof type !== 'string' && type.displayName === displayName) {
      found = true;
      return;
    }
    const childChildren = (child.props as { children?: ReactNode } | null)?.children;
    if (childChildren != null && hasPartInTree(childChildren, displayName)) {
      found = true;
    }
  });
  return found;
}

/** 渲染 panel 外壳的 render-prop:接收已合好的 props,自行决定外层元素。 */
export type DialogPanelRender = (props: { className: string; children: ReactNode }) => ReactElement;

export interface DialogProps
  extends Omit<ComponentPropsWithoutRef<'dialog'>, 'open' | 'title' | 'onCancel'> {
  /** 是否打开(受控)。 */
  open: boolean;
  /** 关闭时回调(Esc / 点击遮罩 / 内建关闭按钮 / 原生 close)。 */
  onClose?: () => void;
  /**
   * 开合双通道:open 变化时回调,传入下一个 open 值。与受控 open 配合使用。
   * @param open 变化后的目标显隐状态:true 为打开,false 为关闭。
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Esc 触发关闭前回调(原生 cancel)。可 preventDefault 拦截关闭(如未保存内容时)。
   * @param event 触发关闭的原生键盘事件(Esc),在其上调用 preventDefault 可拦截默认关闭。
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /**
   * 遮罩按下(点击遮罩关闭前)回调。可 preventDefault 拦截关闭。
   * @param event 遮罩上按下的 React 鼠标事件,在其上调用 preventDefault 可拦截关闭。
   */
  onPointerDownOutside?: (event: ReactMouseEvent<HTMLDialogElement>) => void;
  /**
   * 外部交互(遮罩点击)回调,与 onPointerDownOutside 同时触发;可 preventDefault 拦截关闭。
   * @param event 遮罩点击的 React 鼠标事件,在其上调用 preventDefault 可拦截关闭。
   */
  onInteractOutside?: (event: ReactMouseEvent<HTMLDialogElement>) => void;
  /** 点击遮罩是否关闭。默认 true。 */
  dismissable?: boolean;
  /** 尺寸:sm / md(默认)/ lg / full(铺满视口)。 */
  size?: DialogSize;
  /** 位置:center(默认,垂直居中)/ top(贴顶,长表单更稳)。 */
  placement?: DialogPlacement;
  /** 语义色调:设置后根元素加 ms-tone-*,focus 环 / 面板辉光走 tone 槽位。 */
  tone?: DialogTone;
  /** 隐藏内建关闭按钮(自定义头部时)。 */
  hideCloseButton?: boolean;
  /** 自定义关闭按钮图标。 */
  closeIcon?: ReactNode;
  /** 分部位 className:遮罩(根 dialog)/ 面板 / 关闭按钮。 */
  classNames?: {
    backdrop?: string;
    panel?: string;
    close?: string;
  };
  /** 透传到 panel 外壳的原生属性 / 事件。 */
  panelProps?: ComponentPropsWithoutRef<'div'>;
  /** 用单个子元素替换 panel 外壳(保留 ms-dialog__panel 样式与 children),Slot 风格。 */
  asChild?: boolean;
  /** render-prop 替换 panel 外壳(优先级低于 asChild)。 */
  renderPanel?: DialogPanelRender;
  children?: ReactNode;
}

const CloseGlyph = () => (
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
 * Dialog —— 模态对话框(旗舰深度组件)。基于原生 <dialog> + showModal():
 * 自带焦点陷阱、Esc 关闭、::backdrop 遮罩、top-layer(永远最上,无需 z-index)。
 *
 * 深度:Header / Title / Description / Body / Footer 子部件(自动挂 id 关联 aria-labelledby/-describedby);
 * size(sm/md/lg/full)× placement(center/top)变体;tone 语义色(focus 环 / 面板辉光走 tone 槽位)。
 * 留口:classNames(backdrop/panel/close)、panelProps 透传、asChild / renderPanel 替换 panel 外壳、
 * closeIcon / hideCloseButton。事件:onOpenChange 双通道、onEscapeKeyDown / onPointerDownOutside /
 * onInteractOutside 可 preventDefault 拦截关闭;根 ...rest 透传所有原生事件,onClick / onClose / onCancel 走 compose。
 * 样式见同目录 Dialog.css,需引入 @magic-scope/react/styles.css。
 */
const DialogRoot = forwardRef<HTMLDialogElement, DialogProps>(
  (
    {
      open,
      onClose,
      onOpenChange,
      onEscapeKeyDown,
      onPointerDownOutside,
      onInteractOutside,
      dismissable = true,
      size = 'md',
      placement = 'center',
      tone,
      hideCloseButton = false,
      closeIcon,
      classNames,
      panelProps,
      asChild = false,
      renderPanel,
      className,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLDialogElement | null>(null);
    const t = useMessages();

    const baseId = useId();
    const titleId = `${baseId}-title`;
    const descriptionId = `${baseId}-desc`;

    const ctx = useMemo<DialogContextValue>(
      () => ({ titleId, descriptionId }),
      [titleId, descriptionId],
    );

    // 静态扫描 children:决定是否输出 aria-labelledby / aria-describedby(不依赖渲染顺序)。
    const hasTitle = hasPartInTree(children, 'Dialog.Title');
    const hasDescription = hasPartInTree(children, 'Dialog.Description');

    // 关闭去抖:Esc / 遮罩 / 关闭按钮触发关闭后,受控 open 翻 false 会令 effect 调 d.close(),
    // 进而触发原生 close 事件再次进入兜底关闭 —— 用 ref 保证一次关闭流程只派发一次回调。
    const closingRef = useRef(false);

    /** 统一的关闭路径:先 onOpenChange(false),再 onClose;同一流程内只派发一次。 */
    const requestClose = useCallback(() => {
      if (closingRef.current) {
        return;
      }
      closingRef.current = true;
      onOpenChange?.(false);
      onClose?.();
    }, [onOpenChange, onClose]);

    useEffect(() => {
      const d = innerRef.current;
      if (!d) {
        return;
      }
      if (open) {
        // 重新打开时复位关闭去抖标记
        closingRef.current = false;
        if (!d.open) {
          d.showModal();
        }
      } else if (d.open) {
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

    // 内部遮罩点击检测:仅当点到 dialog 本身(遮罩区)时,触发 outside 回调并按需关闭。
    const handleClick = useCallback(
      (event: ReactMouseEvent<HTMLDialogElement>) => {
        if (event.target !== innerRef.current) {
          return;
        }
        onPointerDownOutside?.(event);
        onInteractOutside?.(event);
        if (dismissable && !event.defaultPrevented) {
          requestClose();
        }
      },
      [dismissable, onPointerDownOutside, onInteractOutside, requestClose],
    );

    // 原生 cancel(Esc):把底层原生事件交给 onEscapeKeyDown,用户可在其上 preventDefault 拦截关闭;
    // 未拦截则阻止默认 close 并统一走 requestClose(由单一来源派发,避免与 onClose 双触发)。
    const handleCancel = useCallback(
      (reactEvent: { preventDefault: () => void; nativeEvent: Event }) => {
        const nativeEvent = reactEvent.nativeEvent as KeyboardEvent;
        onEscapeKeyDown?.(nativeEvent);
        // 以原生事件上的拦截状态为准(用户在 nativeEvent 上 preventDefault 即拦截)。
        if (nativeEvent.defaultPrevented) {
          return;
        }
        reactEvent.preventDefault();
        requestClose();
      },
      [onEscapeKeyDown, requestClose],
    );

    // 原生 close(showModal 之外的程序化关闭,或浏览器内置 Esc 在未走 cancel 时):兜底派发关闭。
    const handleClose = useCallback(() => {
      requestClose();
    }, [requestClose]);

    const dialogClassName = [
      'ms-dialog',
      `ms-dialog--${size}`,
      `ms-dialog--${placement}`,
      tone && `ms-tone-${tone}`,
      classNames?.backdrop,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const panelClassName = ['ms-dialog__panel', classNames?.panel, panelProps?.className]
      .filter(Boolean)
      .join(' ');

    const closeButton = !hideCloseButton && (
      <button
        type="button"
        className={['ms-dialog__close', classNames?.close].filter(Boolean).join(' ')}
        aria-label={t('dialog.close', undefined, '关闭')}
        onClick={requestClose}
      >
        {closeIcon ?? <CloseGlyph />}
      </button>
    );

    const panelInner = (
      <>
        {closeButton}
        {children}
      </>
    );

    // panel 外壳:asChild(单元素替换)> renderPanel(render-prop)> 默认 <div>。
    // 拆出 panelProps.className(已并入 panelClassName),其余原生属性/事件透传到 panel。
    const { className: _panelClassName, ...panelRest } = panelProps ?? {};

    let panel: ReactNode;
    if (asChild && isValidElement(children)) {
      // children 作为 panel 外壳(自带内容),把 panel 样式与透传 props 合并进去。
      // 关闭按钮无法注入到外部元素,asChild 模式下由调用者自行放置(Slot 风格)。
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const merged = mergeAsChildProps({ ...panelRest, className: panelClassName }, child.props);
      panel = cloneElement(child, {
        ...merged,
        ref: composeRefs(childRef),
      } as Record<string, unknown>);
    } else if (renderPanel) {
      panel = renderPanel({ className: panelClassName, children: panelInner });
    } else {
      panel = (
        <div className={panelClassName} {...panelRest}>
          {panelInner}
        </div>
      );
    }

    return (
      <DialogContext.Provider value={ctx}>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: 键盘关闭由原生 <dialog> 的 Esc(onCancel)提供;onClick 仅检测点击遮罩 */}
        <dialog
          ref={setRef}
          className={dialogClassName}
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-describedby={hasDescription ? descriptionId : undefined}
          onClose={handleClose}
          onCancel={handleCancel}
          onClick={composeEventHandlers(onClick, handleClick)}
          {...props}
        >
          {panel}
        </dialog>
      </DialogContext.Provider>
    );
  },
);
DialogRoot.displayName = 'Dialog';

/* —— 子部件:结构化内容区。Header/Title/Description/Body/Footer —— */

export interface DialogHeaderProps extends ComponentPropsWithoutRef<'header'> {
  children?: ReactNode;
}

/** Dialog.Header —— 头部容器(标题 + 描述的栅格区)。 */
export const DialogHeader = forwardRef<HTMLElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      className={['ms-dialog__header', className].filter(Boolean).join(' ')}
      {...props}
    />
  ),
);
DialogHeader.displayName = 'Dialog.Header';

export interface DialogTitleProps extends ComponentPropsWithoutRef<'h2'> {
  children?: ReactNode;
}

/** Dialog.Title —— 标题,自动挂 id 并被根 <dialog> 关联为 aria-labelledby。 */
export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, id, ...props }, ref) => {
    const ctx = useDialogContext('Title');
    return (
      <h2
        ref={ref}
        id={id ?? ctx.titleId}
        className={['ms-dialog__title', className].filter(Boolean).join(' ')}
        {...props}
      />
    );
  },
);
DialogTitle.displayName = 'Dialog.Title';

export interface DialogDescriptionProps extends ComponentPropsWithoutRef<'p'> {
  children?: ReactNode;
}

/** Dialog.Description —— 描述,自动挂 id 并被根 <dialog> 关联为 aria-describedby。 */
export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, id, ...props }, ref) => {
    const ctx = useDialogContext('Description');
    return (
      <p
        ref={ref}
        id={id ?? ctx.descriptionId}
        className={['ms-dialog__description', className].filter(Boolean).join(' ')}
        {...props}
      />
    );
  },
);
DialogDescription.displayName = 'Dialog.Description';

export interface DialogBodyProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
}

/** Dialog.Body —— 主体内容区(可滚动)。 */
export const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={['ms-dialog__body', className].filter(Boolean).join(' ')}
      {...props}
    />
  ),
);
DialogBody.displayName = 'Dialog.Body';

export interface DialogFooterProps extends ComponentPropsWithoutRef<'footer'> {
  children?: ReactNode;
}

/** Dialog.Footer —— 底部操作区,默认右对齐放操作按钮。 */
export const DialogFooter = forwardRef<HTMLElement, DialogFooterProps>(
  ({ className, ...props }, ref) => (
    <footer
      ref={ref}
      className={['ms-dialog__footer', className].filter(Boolean).join(' ')}
      {...props}
    />
  ),
);
DialogFooter.displayName = 'Dialog.Footer';

/* —— 命名空间挂载:Dialog.Header / Dialog.Title / ...(点号子部件 + 仍可独立 import) —— */
type DialogComponent = typeof DialogRoot & {
  Header: typeof DialogHeader;
  Title: typeof DialogTitle;
  Description: typeof DialogDescription;
  Body: typeof DialogBody;
  Footer: typeof DialogFooter;
};

const DialogWithParts = DialogRoot as DialogComponent;
DialogWithParts.Header = DialogHeader;
DialogWithParts.Title = DialogTitle;
DialogWithParts.Description = DialogDescription;
DialogWithParts.Body = DialogBody;
DialogWithParts.Footer = DialogFooter;

/** Dialog —— 根组件,带 .Header / .Title / .Description / .Body / .Footer 子部件。 */
export const Dialog = DialogWithParts;

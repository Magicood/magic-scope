import type {
  AnchorHTMLAttributes,
  ComponentPropsWithoutRef,
  ForwardRefExoticComponent,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  Ref,
  RefAttributes,
} from 'react';
import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { composeEventHandlers, composeRefs, mergeAsChildProps } from '../../utils/compose';
import {
  denormalizeToggleValue,
  edgeIndex,
  normalizeToggleValue,
  resolveToolbarIntent,
  stepIndex,
  type ToggleGroupType,
  type ToolbarOrientation,
  toggleValue,
} from './logic';

export type { ToggleGroupType, ToolbarOrientation };

export type ToolbarTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type ToolbarSize = 'sm' | 'md' | 'lg';
export type ToolbarVariant = 'plain' | 'solid' | 'outline';
export type ToolbarButtonVariant = 'ghost' | 'soft' | 'solid' | 'outline';

/** 每个可聚焦项打在 DOM 上的标记属性,roving 时据此从根查询「按 DOM 顺序」的项。 */
const ITEM_ATTR = 'data-ms-toolbar-item';

/** Toolbar 根透传给后代项的上下文(朝向 / 尺寸 / tone + roving 焦点登记)。 */
interface ToolbarContextValue {
  orientation: ToolbarOrientation;
  size: ToolbarSize;
  tone: ToolbarTone;
  /** 某项 focus 时把它登记为唯一 tabIndex=0 的 roving 落点。 */
  registerFocus: (node: HTMLElement | null) => void;
  /** 当前 roving 焦点落点(DOM 节点);决定哪一项 tabIndex=0,null 时由首项兜底。 */
  focusedNode: HTMLElement | null;
  /** 子树 / disabled 变化版本号;变化时各项重算「是否首项」以保证兜落点正确平移。 */
  itemsVersion: number;
}

const ToolbarContext = createContext<ToolbarContextValue | null>(null);

function useToolbarContext(component: string): ToolbarContextValue {
  const ctx = useContext(ToolbarContext);
  if (!ctx) {
    throw new Error(`<Toolbar.${component}> 必须用在 <Toolbar> 内部。`);
  }
  return ctx;
}

/**
 * 判断某项是否为根内 DOM 顺序的「首个可聚焦且未禁用」项(用于 roving 初始 / 兜底落点)。
 * 纯 DOM 查询,非 hook。跳过 disabled / aria-disabled 项,确保落点不会兜到禁用项上。
 */
function isFirstToolbarItem(node: HTMLElement | null): boolean {
  if (!node) {
    return false;
  }
  const root = node.closest('[role="toolbar"]');
  if (!root) {
    return false;
  }
  const items = Array.from(root.querySelectorAll<HTMLElement>(`[${ITEM_ATTR}]`));
  const firstEnabled = items.find(
    (el) => !(el as HTMLButtonElement).disabled && el.getAttribute('aria-disabled') !== 'true',
  );
  return firstEnabled === node;
}

/**
 * 判断某个 roving 落点节点是否仍是合法落点:仍挂在文档上且未被禁用。
 * 一旦落点被卸载 / 变 disabled(被 queryItems 过滤),它就不该再独占 tabIndex=0,
 * 否则整组都拿不到 0、Tab 进不来(全组跌出 Tab 序)。
 */
function isValidFocusTarget(node: HTMLElement | null): boolean {
  if (!node) {
    return false;
  }
  return (
    node.isConnected &&
    !(node as HTMLButtonElement).disabled &&
    node.getAttribute('aria-disabled') !== 'true'
  );
}

/**
 * roving tabIndex 钩子:当前 roving 落点(focusedNode)进 Tab 序(0),其余 -1;
 * 首帧还没有任何落点(focusedNode=null)时,DOM 顺序的首项进序。
 * 当落点已失效(被卸载 / 变 disabled)时,同样回落到「首项兜底」,
 * 避免整组都拿不到 tabIndex=0 而跌出 Tab 序。
 */
function useRovingItem(): {
  tabIndex: number;
  setNode: (node: HTMLElement | null) => void;
  onFocus: () => void;
} {
  const ctx = useToolbarContext('Item');
  const nodeRef = useRef<HTMLElement | null>(null);
  const [isFirst, setIsFirst] = useState(false);

  const setNode = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
    setIsFirst(isFirstToolbarItem(node));
  }, []);

  const onFocus = useCallback(() => {
    ctx.registerFocus(nodeRef.current);
  }, [ctx]);

  // 子树 / disabled 变化(itemsVersion 变)时,本项自身的 ref 回调可能不会重触发,
  // 故在此主动重算「是否首项」:否则首项被卸载 / 禁用后,剩余项的兜底落点判断会陈旧。
  // biome-ignore lint/correctness/useExhaustiveDependencies: 依赖 itemsVersion 仅为「DOM 变化时重算」的脉冲触发,nodeRef.current 为读取项故无需入依赖
  useEffect(() => {
    setIsFirst(isFirstToolbarItem(nodeRef.current));
  }, [ctx.itemsVersion]);

  // 落点有效(仍连接且未禁用)才认它独占 0;失效则当作无落点,回到首项兜底。
  const hasValidTarget = isValidFocusTarget(ctx.focusedNode);
  const isFocused = hasValidTarget && ctx.focusedNode === nodeRef.current;
  const tabIndex = !hasValidTarget ? (isFirst ? 0 : -1) : isFocused ? 0 : -1;

  return { tabIndex, setNode, onFocus };
}

/** 关键子部件类名集合,精准定制各层而不必覆盖整段。 */
export interface ToolbarClassNames {
  /** 根容器(同 className,叠加)。 */
  root?: string;
  /** 动作 / 链接 / toggle 项。 */
  item?: string;
  /** 分隔线。 */
  separator?: string;
  /** 逻辑分组。 */
  group?: string;
}

export interface ToolbarProps extends Omit<ComponentPropsWithoutRef<'div'>, 'role'> {
  /** 朝向:horizontal(横向,←/→ 移焦)| vertical(纵排,↑/↓ 移焦)。默认 horizontal。 */
  orientation?: ToolbarOrientation;
  /** 尺寸(随 data-ms-density 缩放,透传给后代项)。默认 md。 */
  size?: ToolbarSize;
  /** 语义色调,经全库 tone resolver 派生配色(透传给后代项)。默认 neutral。 */
  tone?: ToolbarTone;
  /** 根视觉变体:plain(无底)| solid(实底卡片)| outline(描边)。默认 plain。 */
  variant?: ToolbarVariant;
  /** 内容过多时换行(否则横向溢出可滚动)。默认 false。 */
  wrap?: boolean;
  /** 关键子部件类名。 */
  classNames?: ToolbarClassNames | undefined;
}

interface ToolbarComponent
  extends ForwardRefExoticComponent<ToolbarProps & RefAttributes<HTMLDivElement>> {
  /** 动作按钮(复用 Button 风格;asChild 可换 <a> / 路由 Link)。 */
  Button: typeof ToolbarButton;
  /** 链接项(渲染 <a>,进 roving 焦点序)。 */
  Link: typeof ToolbarLink;
  /** 分隔线(role=separator,不进焦点序)。 */
  Separator: typeof ToolbarSeparator;
  /** 逻辑分组(role=group;可吸附子项、加 label)。 */
  Group: typeof ToolbarGroup;
  /** 单 / 多选切换组(single→radiogroup 语义,multiple→group)。 */
  ToggleGroup: typeof ToolbarToggleGroup;
  /** 切换项(pressed 态,aria-pressed / radio)。 */
  ToggleItem: typeof ToolbarToggleItem;
}

/**
 * Toolbar —— 工具栏(旗舰复合容器)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * - role=toolbar + roving tabindex:整组只一个项进 Tab 序,←/→(横)或 ↑/↓(纵)在项间移焦,
 *   Home/End 跳首尾;keydown 时实时从根查询「按 DOM 顺序的可聚焦非禁用项」,故对 Group / ToggleGroup
 *   任意嵌套都成立(无需手工维护索引)。
 * - 复合子件:Toolbar.Button / Link / Separator / Group / ToggleGroup / ToggleItem;
 *   tone × 7 走全库 tone resolver(只读 --ms-c 槽位),尺寸随密度,变体 plain/solid/outline。
 * - 内容边界:wrap 换行或横向溢出可滚动,绝不撑破容器。
 * - 留口:根 ...rest 透传所有原生属性 / 事件;classNames 精准定制子层;Button/Link 支持 asChild。
 * - a11y:aria-orientation;ToggleGroup single 用 radiogroup/radio 语义;尊重 reduced-motion 与
 *   [data-ms-motion=off]。样式见同目录 Toolbar.css,需引入 @magic-scope/react/styles.css。
 */
const ToolbarRoot = forwardRef<HTMLDivElement, ToolbarProps>(
  (
    {
      orientation = 'horizontal',
      size = 'md',
      tone = 'neutral',
      variant = 'plain',
      wrap = false,
      classNames,
      className,
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    // roving 落点:当前应进焦点序(tabIndex=0)的节点;null 时由首项兜底。
    const [focusedNode, setFocusedNode] = useState<HTMLElement | null>(null);
    // 子树 / disabled 变化版本号:每次变化 +1,驱动各项重算「是否首项」兜底落点。
    const [itemsVersion, setItemsVersion] = useState(0);

    const registerFocus = useCallback((node: HTMLElement | null) => {
      setFocusedNode(node);
    }, []);

    // 观察子树增删与 disabled / aria-disabled 变化:落点失效时主动复位为 null(回首项兜底),
    // 并 bump 版本号让剩余项重算首项归属,避免整组跌出 Tab 序。
    useEffect(() => {
      const root = rootRef.current;
      if (!root || typeof MutationObserver === 'undefined') {
        return;
      }
      const observer = new MutationObserver(() => {
        setItemsVersion((v) => v + 1);
        setFocusedNode((current) => (isValidFocusTarget(current) ? current : null));
      });
      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled', 'aria-disabled'],
      });
      return () => observer.disconnect();
    }, []);

    // 从根按 DOM 顺序取所有可聚焦非禁用项(过滤掉 disabled / aria-disabled)。
    const queryItems = useCallback((): HTMLElement[] => {
      const root = rootRef.current;
      if (!root) {
        return [];
      }
      const all = Array.from(root.querySelectorAll<HTMLElement>(`[${ITEM_ATTR}]`));
      return all.filter(
        (el) => !(el as HTMLButtonElement).disabled && el.getAttribute('aria-disabled') !== 'true',
      );
    }, []);

    const internalKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        const intent = resolveToolbarIntent(e.key, orientation);
        if (!intent) {
          return;
        }
        const items = queryItems();
        if (items.length === 0) {
          return;
        }
        // 仅当焦点确实落在某个 toolbar 项上时才接管(避免抢走子输入控件的方向键)。
        const current = items.indexOf(e.target as HTMLElement);
        if (current < 0) {
          return;
        }
        e.preventDefault();
        const nextIndex =
          intent.type === 'edge'
            ? edgeIndex(items.length, intent.dir)
            : stepIndex(items.length, current, intent.dir);
        const next = nextIndex >= 0 ? items[nextIndex] : undefined;
        if (next) {
          setFocusedNode(next);
          next.focus();
        }
      },
      [orientation, queryItems],
    );

    const ctx = useMemo<ToolbarContextValue>(
      () => ({ orientation, size, tone, registerFocus, focusedNode, itemsVersion }),
      [orientation, size, tone, registerFocus, focusedNode, itemsVersion],
    );

    const classes = [
      'ms-toolbar',
      `ms-toolbar--${orientation}`,
      `ms-toolbar--${variant}`,
      `ms-toolbar--${size}`,
      `ms-tone-${tone}`,
      wrap && 'ms-toolbar--wrap',
      classNames?.root,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <ToolbarContext.Provider value={ctx}>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: 根 role=toolbar 即交互角色,onKeyDown 是 WAI-ARIA toolbar 模式要求的方向键 roving 委托 */}
        <div
          ref={composeRefs(ref, rootRef)}
          role="toolbar"
          aria-orientation={orientation}
          data-orientation={orientation}
          className={classes}
          onKeyDown={composeEventHandlers(
            onKeyDown as ((e: KeyboardEvent<HTMLDivElement>) => void) | undefined,
            internalKeyDown,
          )}
          {...rest}
        />
      </ToolbarContext.Provider>
    );
  },
);
ToolbarRoot.displayName = 'Toolbar';

export interface ToolbarButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'role'> {
  /** 视觉变体:ghost(默认,幽灵)| soft(柔色)| solid(实底)| outline(描边)。 */
  variant?: ToolbarButtonVariant;
  /** 仅图标(正方形紧凑);务必配 aria-label。 */
  iconOnly?: boolean;
  /** 前置图标。 */
  leftIcon?: ReactNode;
  /** 后置图标。 */
  rightIcon?: ReactNode;
  /** 渲染为子元素(如 <a> / 路由 Link)并保留按钮样式(Radix Slot 风格)。 */
  asChild?: boolean;
}

/**
 * Toolbar.Button —— 工具栏动作按钮。进 roving 焦点序;复用 Button 视觉风格的精简版。
 * @param onClick 点击回调,与内部行为经 composeEventHandlers 合并。
 * @param onFocus 聚焦回调,与内部 roving 登记经 composeEventHandlers 合并。
 */
export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  (
    {
      variant = 'ghost',
      iconOnly = false,
      leftIcon,
      rightIcon,
      asChild = false,
      type = 'button',
      className,
      children,
      onFocus: onFocusProp,
      disabled,
      ...props
    },
    ref,
  ) => {
    const roving = useRovingItem();

    const classes = [
      'ms-toolbar__item',
      'ms-toolbar__button',
      `ms-toolbar__button--${variant}`,
      iconOnly && 'ms-toolbar__button--icon-only',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const merged = mergeAsChildProps(
        {
          ...props,
          [ITEM_ATTR]: '',
          className: classes,
          tabIndex: roving.tabIndex,
          onFocus: composeEventHandlers(onFocusProp as undefined, roving.onFocus),
        },
        child.props,
      );
      return cloneElement(child, {
        ...merged,
        ref: composeRefs(ref as Ref<unknown>, childRef, roving.setNode as Ref<unknown>),
      } as Record<string, unknown>);
    }

    return (
      <button
        ref={composeRefs(ref, roving.setNode as Ref<HTMLButtonElement>)}
        type={type}
        disabled={disabled}
        tabIndex={roving.tabIndex}
        className={classes}
        onFocus={composeEventHandlers(onFocusProp, roving.onFocus)}
        {...{ [ITEM_ATTR]: '' }}
        {...props}
      >
        {leftIcon != null && (
          <span className="ms-toolbar__icon" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children != null && <span className="ms-toolbar__label">{children}</span>}
        {rightIcon != null && (
          <span className="ms-toolbar__icon" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  },
);
ToolbarButton.displayName = 'Toolbar.Button';

export interface ToolbarLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** 前置图标。 */
  leftIcon?: ReactNode;
  /** 渲染为子元素(如路由 Link)并保留链接样式。 */
  asChild?: boolean;
}

/**
 * Toolbar.Link —— 工具栏链接项,渲染 <a> 并进 roving 焦点序。
 * @param onClick 点击回调,与内部行为经 composeEventHandlers 合并。
 * @param onFocus 聚焦回调,与内部 roving 登记经 composeEventHandlers 合并。
 */
export const ToolbarLink = forwardRef<HTMLAnchorElement, ToolbarLinkProps>(
  ({ leftIcon, asChild = false, className, children, onFocus: onFocusProp, ...props }, ref) => {
    const roving = useRovingItem();
    const classes = ['ms-toolbar__item', 'ms-toolbar__link', className].filter(Boolean).join(' ');

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const merged = mergeAsChildProps(
        {
          ...props,
          [ITEM_ATTR]: '',
          className: classes,
          tabIndex: roving.tabIndex,
          onFocus: composeEventHandlers(onFocusProp as undefined, roving.onFocus),
        },
        child.props,
      );
      return cloneElement(child, {
        ...merged,
        ref: composeRefs(ref as Ref<unknown>, childRef, roving.setNode as Ref<unknown>),
      } as Record<string, unknown>);
    }

    return (
      // biome-ignore lint/a11y/useValidAnchor: href 由使用方经 ...props 传入(留口),Toolbar.Link 只补 roving 与样式
      // biome-ignore lint/a11y/noStaticElementInteractions: <a> 是天然可交互链接;onFocus 仅用于 roving 焦点登记,非把静态元素变交互
      <a
        ref={composeRefs(ref, roving.setNode as Ref<HTMLAnchorElement>)}
        tabIndex={roving.tabIndex}
        className={classes}
        onFocus={composeEventHandlers(onFocusProp, roving.onFocus)}
        {...{ [ITEM_ATTR]: '' }}
        {...props}
      >
        {leftIcon != null && (
          <span className="ms-toolbar__icon" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children != null && <span className="ms-toolbar__label">{children}</span>}
      </a>
    );
  },
);
ToolbarLink.displayName = 'Toolbar.Link';

export type ToolbarSeparatorProps = ComponentPropsWithoutRef<'hr'>;

/**
 * Toolbar.Separator —— 分隔线。渲染 <hr>(天然 role=separator),不进焦点序;
 * 按根朝向自动取正交方向(横向工具栏 → 竖向分隔,反之亦然)。
 */
export const ToolbarSeparator = forwardRef<HTMLHRElement, ToolbarSeparatorProps>(
  ({ className, ...props }, ref) => {
    const ctx = useToolbarContext('Separator');
    // 工具栏横向时分隔线是竖线(aria-orientation=vertical),反之亦然。
    const sepOrientation = ctx.orientation === 'horizontal' ? 'vertical' : 'horizontal';
    return (
      <hr
        ref={ref}
        aria-orientation={sepOrientation}
        className={['ms-toolbar__separator', className].filter(Boolean).join(' ')}
        {...props}
      />
    );
  },
);
ToolbarSeparator.displayName = 'Toolbar.Separator';

export interface ToolbarGroupProps extends ComponentPropsWithoutRef<'div'> {
  /** 分组无障碍名(无可见 label 时建议提供)。 */
  label?: string;
  /** 吸附:相邻项合并圆角与边界(连续控件观感)。默认 false。 */
  attached?: boolean;
}

/**
 * Toolbar.Group —— 逻辑分组(role=group)。把相关动作聚成一簇;attached 时吸附为连续控件。
 */
export const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(
  ({ label, attached = false, className, ...props }, ref) => (
    // biome-ignore lint/a11y/useSemanticElements: 工具栏内的动作分簇是控件分组,role="group" 是正确的 ARIA(非表单 fieldset)
    <div
      ref={ref}
      role="group"
      aria-label={label}
      className={['ms-toolbar__group', attached && 'ms-toolbar__group--attached', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  ),
);
ToolbarGroup.displayName = 'Toolbar.Group';

/** ToggleGroup 透传给 ToggleItem 的上下文(模式 + 当前值集合 + 切换回调)。 */
interface ToggleGroupContextValue {
  type: ToggleGroupType;
  values: string[];
  toggle: (value: string) => void;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export interface ToolbarToggleGroupProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  /** 单选(类 radiogroup)或多选。默认 single。 */
  type?: ToggleGroupType;
  /** 受控值(single 传 string|null,multiple 传 string[])。 */
  value?: string | string[] | null | undefined;
  /** 非受控初始值。 */
  defaultValue?: string | string[] | null | undefined;
  /**
   * 选中变化回调。
   * @param value single 模式为 string|null,multiple 模式为 string[]。
   */
  onValueChange?: (value: string | string[] | null) => void;
  /** single 模式下点击已选项是否允许取消(回到无选中)。默认 false。 */
  allowDeselect?: boolean;
  /** 分组无障碍名。 */
  label?: string;
  /** 吸附:相邻 toggle 项合并边界。默认 true。 */
  attached?: boolean;
}

/**
 * Toolbar.ToggleGroup —— 切换组。single→radiogroup 语义、multiple→group;受控 / 非受控双模式。
 * @param onValueChange 选中变化(single:string|null;multiple:string[])。
 */
export const ToolbarToggleGroup = forwardRef<HTMLDivElement, ToolbarToggleGroupProps>(
  (
    {
      type = 'single',
      value,
      defaultValue,
      onValueChange,
      allowDeselect = false,
      label,
      attached = true,
      className,
      ...props
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [uncontrolled, setUncontrolled] = useState<string[]>(() =>
      normalizeToggleValue(type, defaultValue),
    );
    const values = isControlled ? normalizeToggleValue(type, value) : uncontrolled;

    const toggle = useCallback(
      (itemValue: string) => {
        const next = toggleValue(type, values, itemValue, allowDeselect);
        if (!isControlled) {
          setUncontrolled(next);
        }
        onValueChange?.(denormalizeToggleValue(type, next));
      },
      [type, values, allowDeselect, isControlled, onValueChange],
    );

    const ctx = useMemo<ToggleGroupContextValue>(
      () => ({ type, values, toggle }),
      [type, values, toggle],
    );

    return (
      <ToggleGroupContext.Provider value={ctx}>
        {/* biome-ignore lint/a11y/useSemanticElements: 单选切换组是 WAI-ARIA radiogroup,多选是控件 group;均非表单 fieldset */}
        {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: biome 把 div 当 static 故误报;运行时 role=radiogroup/group 均支持 aria-label */}
        <div
          ref={ref}
          role={type === 'single' ? 'radiogroup' : 'group'}
          aria-label={label}
          className={[
            'ms-toolbar__group',
            'ms-toolbar__toggle-group',
            attached && 'ms-toolbar__group--attached',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
      </ToggleGroupContext.Provider>
    );
  },
);
ToolbarToggleGroup.displayName = 'Toolbar.ToggleGroup';

export interface ToolbarToggleItemProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'value' | 'role'> {
  /** 该项的值(在 ToggleGroup 内唯一)。 */
  value: string;
  /** 前置图标。 */
  leftIcon?: ReactNode;
  /** 仅图标(正方形);务必配 aria-label。 */
  iconOnly?: boolean;
}

/**
 * Toolbar.ToggleItem —— 切换项。single 组内为 radio(aria-checked),multiple 组内为按钮(aria-pressed)。
 * 必须用在 Toolbar.ToggleGroup 内。
 * @param onClick 点击回调,与内部切换经 composeEventHandlers 合并(先你的,未 preventDefault 再切换)。
 * @param onFocus 聚焦回调,与内部 roving 登记经 composeEventHandlers 合并。
 */
export const ToolbarToggleItem = forwardRef<HTMLButtonElement, ToolbarToggleItemProps>(
  (
    {
      value,
      leftIcon,
      iconOnly = false,
      className,
      children,
      onClick: onClickProp,
      onFocus: onFocusProp,
      disabled,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const group = useContext(ToggleGroupContext);
    if (!group) {
      throw new Error('<Toolbar.ToggleItem> 必须用在 <Toolbar.ToggleGroup> 内部。');
    }
    const roving = useRovingItem();
    const isSingle = group.type === 'single';
    const pressed = group.values.includes(value);

    const handleClick = useCallback(() => {
      group.toggle(value);
    }, [group, value]);

    const classes = [
      'ms-toolbar__item',
      'ms-toolbar__button',
      'ms-toolbar__toggle-item',
      pressed && 'ms-toolbar__toggle-item--on',
      iconOnly && 'ms-toolbar__button--icon-only',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      // biome-ignore lint/a11y/useAriaPropsSupportedByRole: role 在 single 时为 radio(支持 aria-checked)、multiple 时为按钮(支持 aria-pressed),按模式互斥设置
      <button
        ref={composeRefs(ref, roving.setNode as Ref<HTMLButtonElement>)}
        type={type}
        role={isSingle ? 'radio' : undefined}
        aria-checked={isSingle ? pressed : undefined}
        aria-pressed={isSingle ? undefined : pressed}
        disabled={disabled}
        data-state={pressed ? 'on' : 'off'}
        tabIndex={roving.tabIndex}
        className={classes}
        onClick={composeEventHandlers(onClickProp, handleClick)}
        onFocus={composeEventHandlers(onFocusProp, roving.onFocus)}
        {...{ [ITEM_ATTR]: '' }}
        {...props}
      >
        {leftIcon != null && (
          <span className="ms-toolbar__icon" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children != null && <span className="ms-toolbar__label">{children}</span>}
      </button>
    );
  },
);
ToolbarToggleItem.displayName = 'Toolbar.ToggleItem';

/**
 * 对外 Toolbar:在 forwardRef 根上挂载全部复合子件,并把类型收敛为携带子件的复合组件。
 */
export const Toolbar = Object.assign(ToolbarRoot, {
  Button: ToolbarButton,
  Link: ToolbarLink,
  Separator: ToolbarSeparator,
  Group: ToolbarGroup,
  ToggleGroup: ToolbarToggleGroup,
  ToggleItem: ToolbarToggleItem,
}) as ToolbarComponent;

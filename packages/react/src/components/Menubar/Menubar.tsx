import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  Ref,
} from 'react';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { Kbd } from '../Kbd/Kbd';
import {
  type FlatRow,
  firstFocusable,
  flattenItems,
  lastFocusable,
  type MenuItem,
  type MenuItemRole,
  nextFocusIndex,
  typeaheadMatch,
} from '../Menu/logic';
import { placementToArea } from '../Popover/logic';
import { adjacentMenu, type MenubarOpenIntent, resolveMenubarKey } from './logic';

export type { MenuItem } from '../Menu/logic';

export type MenubarTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * Menubar 的子菜单项 —— 在复用的 Menu `MenuItem` 上扩展一层子菜单 `submenu`(与 Dropdown 同口径)。
 * 复用 MenuItem 全字段(label/icon/onClick/disabled/danger/type='separator'/'group'/checked/shortcut/href…),
 * 仅额外加 `submenu`(一层)。深层嵌套留 TODO。
 */
export interface MenubarItem extends MenuItem {
  /** 子菜单项(一层)。给了非空数组的项渲染为「有子菜单」入口:hover / → 展开,← 收起。 */
  submenu?: MenubarItem[];
}

/** Menubar 各部件的细粒度 className 槽位。 */
export interface MenubarClassNames {
  /** 菜单栏根 .ms-menubar(role=menubar)。 */
  root?: string | undefined;
  /** 顶级触发器 .ms-menubar__trigger(role=menuitem)。 */
  trigger?: string | undefined;
  /** 菜单浮层根 .ms-menubar__menu(popover top-layer)。 */
  menu?: string | undefined;
  /** 菜单列表容器 .ms-menubar__list(role=menu)。 */
  list?: string | undefined;
  /** 菜单项 .ms-menubar__item。 */
  item?: string | undefined;
  /** 分隔线 .ms-menubar__separator。 */
  separator?: string | undefined;
  /** 分组标题 .ms-menubar__group-label。 */
  groupLabel?: string | undefined;
  /** 子菜单浮层 .ms-menubar__submenu。 */
  submenu?: string | undefined;
}

/** 顶级菜单出现的方位(主轴只有 top / bottom —— 菜单栏惯例向下展开)。 */
export type MenubarMenuPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

/** anchor-name / position-anchor 不在标准 CSSProperties,这里做最小扩展。 */
interface AnchorStyle extends CSSProperties {
  anchorName?: string | undefined;
  [key: `--${string}`]: string | number | undefined;
}

// —— 根 → 子菜单 的上下文:把「当前打开哪个顶级菜单」「顶层 roving」「注册」下发给每个 Menubar.Menu ——
interface MenubarContextValue {
  /** 菜单栏唯一前缀(派生触发器 / 面板 id)。 */
  baseId: string;
  /** tone 色调。 */
  tone: MenubarTone;
  /** 顶级菜单方位。 */
  placement: MenubarMenuPlacement;
  /** 与触发器的间距(px)。 */
  offset: number;
  /** 选中项后是否关闭菜单。 */
  closeOnSelect: boolean;
  /** 细粒度 classNames。 */
  classNames: MenubarClassNames | undefined;
  /** 整库禁用。 */
  disabled: boolean;
  /** 当前打开的菜单 value(null = 全关)。 */
  openValue: string | null;
  /** 注册一个顶级菜单,返回其索引(注册顺序 = 视觉顺序)。 */
  register: (value: string) => number;
  /** 注销。 */
  unregister: (value: string) => void;
  /** 把某菜单 value 映射到其顶层索引。 */
  indexOf: (value: string) => number;
  /** 顶级菜单总数。 */
  count: () => number;
  /** 按索引取菜单 value(用于相邻切换)。 */
  valueAt: (index: number) => string | null;
  /** 请求打开 / 关闭某菜单(null=全关);intent 决定面板打开后落焦首 / 末项。 */
  requestOpen: (value: string | null, intent: MenubarOpenIntent) => void;
  /** 聚焦某索引的顶级触发器(不打开)。 */
  focusTrigger: (index: number) => void;
  /** 注册触发器 DOM(供顶层 roving 聚焦)。 */
  setTriggerEl: (index: number, el: HTMLButtonElement | null) => void;
  /** 登记某索引触发器的 disabled 态(供顶层 roving / 相邻切换跳过禁用项)。 */
  setTriggerDisabled: (index: number, disabled: boolean) => void;
  /** 取当前顶层触发器的 disabled 掩码(长度 = count();供 logic 跳禁用项)。 */
  disabledMask: () => boolean[];
  /** 取「菜单打开后应落焦首 / 末项」的意图(消费一次后归零)。 */
  consumeIntent: () => MenubarOpenIntent;
  /** 当前是否有任意菜单打开(顶层 ←→ 据此决定切换打开态)。 */
  anyOpen: () => boolean;
}

const MenubarContext = createContext<MenubarContextValue | null>(null);

const useMenubar = (where: string): MenubarContextValue => {
  const ctx = useContext(MenubarContext);
  if (!ctx) {
    throw new Error(`<${where}> 必须用在 <Menubar> 内部`);
  }
  return ctx;
};

export interface MenubarProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'onSelect' | 'defaultValue'> {
  /** 顶级菜单(<Menubar.Menu>)。 */
  children?: ReactNode;
  /** 语义色调,经全库 tone resolver 派生 hover/focus/danger 配色与辉光。默认 primary。 */
  tone?: MenubarTone;
  /** 顶级菜单方位。默认 bottom-start(贴触发器左下展开)。 */
  placement?: MenubarMenuPlacement;
  /** 与触发器的间距(px)。默认 4。 */
  offset?: number | undefined;
  /** 选中项后是否关闭菜单。默认 true。选中态项(checked!==undefined)始终保持打开便于连续切换。 */
  closeOnSelect?: boolean;
  /** 整库禁用:所有触发器不可交互、菜单不展开。 */
  disabled?: boolean;
  /** 受控:当前打开的菜单 value(null = 全关)。传入即受控,需配合 onValueChange。 */
  value?: string | null | undefined;
  /** 非受控初始打开的菜单 value。默认 null(全关)。 */
  defaultValue?: string | null | undefined;
  /**
   * 打开的菜单变化回调(受控 / 非受控双通道都触发)。
   * @param value 变化后打开的菜单 value;null 表示全部关闭。
   */
  onValueChange?: ((value: string | null) => void) | undefined;
  /**
   * 任一菜单项被选中都触发(便于集中埋点 / 分发)。
   * @param item 被选中的菜单项数据。
   * @param menuValue 该项所属顶级菜单的 value。
   */
  onSelect?: ((item: MenubarItem, menuValue: string) => void) | undefined;
  /** 各部件细粒度 className 槽位。 */
  classNames?: MenubarClassNames | undefined;
}

/**
 * Menubar —— 应用菜单栏(navigation)。
 *
 * 横向一排顶级菜单触发器(文件 / 编辑 / 视图…),各自打开一个 Menu 面板;同一时刻至多一个打开。
 * 复合用法:<Menubar> 根(role=menubar,管理「当前打开哪个顶级菜单」+ 顶层 roving)+ 多个
 * <Menubar.Menu label="文件" items={…} /> 或 children 复合(<Menu.Item>)。
 *
 * 复用全库既有契约:菜单面板拍平 / typeahead / 方向键直接 import Menu/logic 纯函数;浮层定位复用
 * Popover/logic 的 placementToArea。浮层进 top-layer 用原生 popover="auto" + CSS Anchor
 * Positioning(自包含,不套 Popover/Dropdown 组件以免 aria-haspopup 被覆盖)。
 *
 * 键盘(ARIA APG menubar):
 * - 顶层:←→ 在触发器间 roving 移动(回绕);若已有菜单打开则切换到相邻菜单的打开态。
 *   ↓/Enter/Space 打开当前并聚焦首项,↑ 打开并聚焦末项。Home/End 跳首尾触发器。
 * - 菜单内:↑↓ 移焦(跳 disabled、回绕)、Home/End、typeahead、Esc 关闭回焦触发器、
 *   ←→ 在子菜单与父级或相邻顶级菜单间移动、Tab 关闭不抢焦。
 *
 * a11y:role=menubar;触发器 role=menuitem aria-haspopup=menu aria-expanded aria-controls;
 * 面板 role=menu;项 role=menuitem / menuitemcheckbox / menuitemradio + aria-checked。
 * 受控(value=打开的菜单 id / onValueChange)与非受控(defaultValue)双通道。
 *
 * 诚实备注:
 * - 子菜单 submenu 仅一层(hover / → 展开,← 收起),深层嵌套见文末 TODO。
 * - children 复合用法走原生 light-dismiss,不接管 roving/typeahead(自定义内容自负键盘可达)。
 *
 * 纯逻辑在同目录 logic.ts(零 React)。样式见同目录 Menubar.css,需引入 @magic-scope/react/styles.css。
 */
const MenubarRoot = forwardRef<HTMLDivElement, MenubarProps>(
  (
    {
      children,
      tone = 'primary',
      placement = 'bottom-start',
      offset = 4,
      closeOnSelect = true,
      disabled = false,
      value: valueProp,
      defaultValue = null,
      onValueChange,
      onSelect,
      className,
      classNames,
      ...rest
    },
    ref,
  ) => {
    const reactId = useId();
    const baseId = `ms-menubar-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    // 注册表:value → 索引(注册顺序 = 视觉顺序)。用 ref 持有以免每次注册都重渲。
    const orderRef = useRef<string[]>([]);
    // 触发版本号:注册 / 注销改变了顺序后 bump 一下,强制依赖它的子组件按新顺序重算 tabIndex。
    const [, setVersion] = useState(0);
    // 「注册表脏了」标记:register/unregister 在渲染期改 ref 后置脏,由 commit 后的 effect 统一 bump,
    // 避免「渲染中 setState」告警,也把 bump 收进 React commit 相位(测试里被 act 包裹)。
    const dirtyRef = useRef(false);
    const triggerEls = useRef<Array<HTMLButtonElement | null>>([]);
    // 每个顶层触发器的 disabled 态(索引对齐 orderRef)。供顶层 roving / 相邻切换跳过禁用项。
    const triggerDisabled = useRef<boolean[]>([]);
    const intentRef = useRef<MenubarOpenIntent>('none');

    const isControlled = valueProp !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(defaultValue);
    const openValue = disabled ? null : isControlled ? (valueProp ?? null) : uncontrolledValue;

    const register = useCallback((value: string): number => {
      const order = orderRef.current;
      const existing = order.indexOf(value);
      if (existing >= 0) {
        return existing;
      }
      order.push(value);
      dirtyRef.current = true;
      return order.length - 1;
    }, []);

    const unregister = useCallback((value: string): void => {
      const order = orderRef.current;
      const idx = order.indexOf(value);
      if (idx >= 0) {
        order.splice(idx, 1);
        triggerEls.current.splice(idx, 1);
        triggerDisabled.current.splice(idx, 1);
        dirtyRef.current = true;
        setVersion((v) => v + 1);
      }
    }, []);

    // 每次 commit 后:若注册表在本轮渲染里变脏(新增菜单),bump 一次让子组件重算 roving tabIndex。
    useEffect(() => {
      if (dirtyRef.current) {
        dirtyRef.current = false;
        setVersion((v) => v + 1);
      }
    });

    const indexOf = useCallback((value: string): number => orderRef.current.indexOf(value), []);
    const count = useCallback((): number => orderRef.current.length, []);
    const valueAt = useCallback(
      (index: number): string | null => orderRef.current[index] ?? null,
      [],
    );
    const anyOpen = useCallback((): boolean => openValue !== null, [openValue]);

    const setOpenValue = useCallback(
      (next: string | null) => {
        if (disabled && next !== null) {
          return;
        }
        if (next === openValue) {
          return;
        }
        if (!isControlled) {
          setUncontrolledValue(next);
        }
        onValueChange?.(next);
      },
      [disabled, openValue, isControlled, onValueChange],
    );

    const requestOpen = useCallback(
      (value: string | null, intent: MenubarOpenIntent) => {
        intentRef.current = value === null ? 'none' : intent;
        setOpenValue(value);
      },
      [setOpenValue],
    );

    const consumeIntent = useCallback((): MenubarOpenIntent => {
      const intent = intentRef.current;
      intentRef.current = 'none';
      return intent;
    }, []);

    const setTriggerEl = useCallback((index: number, el: HTMLButtonElement | null) => {
      triggerEls.current[index] = el;
    }, []);

    const setTriggerDisabled = useCallback((index: number, value: boolean) => {
      if (index >= 0) {
        triggerDisabled.current[index] = value;
      }
    }, []);

    const disabledMask = useCallback((): boolean[] => {
      const n = orderRef.current.length;
      const mask = triggerDisabled.current;
      // 显式整库 disabled 时,所有触发器都不可聚焦;否则按各自登记的 menuDisabled。
      return Array.from({ length: n }, (_, i) => disabled || mask[i] === true);
    }, [disabled]);

    const focusTrigger = useCallback((index: number) => {
      if (index >= 0) {
        triggerEls.current[index]?.focus();
      }
    }, []);

    // 整库 disabled:非受控内部态归零,避免「禁用→再启用」自动复现上次打开态。
    useEffect(() => {
      if (disabled && !isControlled) {
        setUncontrolledValue(null);
      }
    }, [disabled, isControlled]);

    const ctx = useMemo<MenubarContextValue>(
      () => ({
        baseId,
        tone,
        placement,
        offset,
        closeOnSelect,
        classNames,
        disabled,
        openValue,
        register,
        unregister,
        indexOf,
        count,
        valueAt,
        requestOpen,
        focusTrigger,
        setTriggerEl,
        setTriggerDisabled,
        disabledMask,
        consumeIntent,
        anyOpen,
      }),
      [
        baseId,
        tone,
        placement,
        offset,
        closeOnSelect,
        classNames,
        disabled,
        openValue,
        register,
        unregister,
        indexOf,
        count,
        valueAt,
        requestOpen,
        focusTrigger,
        setTriggerEl,
        setTriggerDisabled,
        disabledMask,
        consumeIntent,
        anyOpen,
      ],
    );

    // onSelect 通过 context 之外的 ref 转发(避免进 memo 依赖导致整树重建)。
    selectForwardRef.current = onSelect;

    const rootClass = ['ms-menubar', `ms-tone-${tone}`, className, classNames?.root]
      .filter(Boolean)
      .join(' ');

    return (
      <MenubarContext.Provider value={ctx}>
        {/* role=menubar 是本组件的 a11y 契约,固定不可覆盖;aria-orientation=horizontal 是
            ARIA APG 对 menubar 的推荐标注。 */}
        <div
          ref={ref}
          role="menubar"
          aria-orientation="horizontal"
          aria-disabled={disabled || undefined}
          data-ms-disabled={disabled || undefined}
          className={rootClass}
          {...rest}
        >
          {children}
        </div>
      </MenubarContext.Provider>
    );
  },
);
MenubarRoot.displayName = 'Menubar';

// onSelect 转发口:根组件写入,Menubar.Menu 读取(不进 context memo,避免引用变化炸树)。
const selectForwardRef: { current: ((item: MenubarItem, menuValue: string) => void) | undefined } =
  { current: undefined };

/** 渲染菜单项内部(图标 / 选中勾 / 标签 / 快捷键 / 子菜单箭头)—— 与 Menu / Dropdown 视觉一致。 */
function renderItemInner(item: MenubarItem, selectionRole: MenuItemRole | undefined): ReactNode {
  return (
    <>
      {selectionRole && (
        <span className="ms-menubar__check" aria-hidden="true">
          {item.checked ? (selectionRole === 'radio' ? '●' : '✓') : ''}
        </span>
      )}
      {item.icon != null && (
        <span className="ms-menubar__icon" aria-hidden="true">
          {item.icon}
        </span>
      )}
      <span className="ms-menubar__label">{item.label}</span>
      {item.shortcut != null && (
        <span className="ms-menubar__shortcut">
          {typeof item.shortcut === 'string' || Array.isArray(item.shortcut) ? (
            <Kbd size="sm" tone="neutral" keys={item.shortcut as string | readonly string[]} />
          ) : (
            (item.shortcut as ReactNode)
          )}
        </span>
      )}
      {hasSubmenu(item) && (
        <span className="ms-menubar__submenu-arrow" aria-hidden="true">
          ›
        </span>
      )}
    </>
  );
}

const hasSubmenu = (item: MenubarItem): boolean =>
  Array.isArray(item.submenu) && item.submenu.length > 0;

export interface MenubarMenuProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'value' | 'children' | 'onSelect'> {
  /** 触发器文本(顶级菜单名,如「文件」)。 */
  label: ReactNode;
  /**
   * 该菜单的唯一标识(受控 value / onValueChange 的取值)。不传则用注册顺序派生稳定 id;
   * 受控用法务必显式给 value。
   */
  value?: string | undefined;
  /** 数据驱动的菜单项(item / separator / group + 一层 submenu)。与 children 二选一,优先 items。 */
  items?: MenubarItem[] | undefined;
  /** 复合用法:直接塞自定义菜单内容(如 <Menu.Item>)。仅在不传 items 时生效。 */
  children?: ReactNode;
  /** 单菜单禁用(触发器不可交互)。 */
  disabled?: boolean;
  /** typeahead 用于匹配触发器纯文本(label 非字符串时提供)。 */
  textValue?: string;
}

/**
 * Menubar.Menu —— 一个顶级菜单(label 触发器 + 内容)。
 *
 * 触发器 role=menuitem aria-haspopup=menu;面板为原生 popover top-layer,CSS Anchor 锚定到触发器。
 * 顶层 roving:同一时刻只有「激活的」触发器 tabIndex=0,其余 -1,←→/Home/End 在触发器间移动。
 * 菜单内键盘复用 Menu/logic;←→ 在子菜单 / 相邻顶级菜单间移动。
 */
const MenubarMenu = forwardRef<HTMLButtonElement, MenubarMenuProps>(
  (
    {
      label,
      value: valueProp,
      items,
      children,
      disabled: menuDisabled = false,
      textValue,
      className,
      style,
      onClick,
      onKeyDown,
      onPointerEnter,
      ...rest
    },
    forwardedRef,
  ) => {
    const ctx = useMenubar('Menubar.Menu');
    const reactId = useId();
    // value:显式 > 自动派生(稳定,基于组件实例 id)。
    const value = valueProp ?? `menu-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    // 注册进根的顺序表,拿到自己的顶层索引(注册顺序 = 视觉顺序)。
    // 在渲染期同步注册(register 幂等:已注册则返回既有索引、不再 bump),确保 index 首帧即正确——
    // 否则 tabIndex / 顶层键盘导航在挂载首帧拿到 -1。卸载时在 effect 里注销。
    const index = ctx.register(value);
    useEffect(() => {
      ctx.register(value);
      return () => ctx.unregister(value);
    }, [ctx, value]);

    // 登记本菜单的 disabled 态进根注册表(供顶层 roving / 相邻切换跳过禁用触发器)。
    // 渲染期同步登记一次,确保首帧掩码即正确;index/disabled 变化时重登记。
    ctx.setTriggerDisabled(index, menuDisabled);
    useEffect(() => {
      ctx.setTriggerDisabled(index, menuDisabled);
    }, [ctx, index, menuDisabled]);

    const disabled = ctx.disabled || menuDisabled;
    const open = ctx.openValue === value && !disabled;

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const itemRefs = useRef<Array<HTMLElement | null>>([]);
    // 当前展开的子菜单的项 DOM(随 openSubmenu 变化重建,索引 = 子项在 submenu 数组中的位置)。
    const subItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const typeaheadRef = useRef<{ query: string; timer: number | null }>({
      query: '',
      timer: null,
    });
    // 子菜单独立 typeahead 焦点环(与父面板 typeahead 互不干扰)。
    const subTypeaheadRef = useRef<{ query: string; timer: number | null }>({
      query: '',
      timer: null,
    });
    const [openSubmenu, setOpenSubmenu] = useState(-1);

    const safeValue = value.replace(/[^a-zA-Z0-9_-]/g, '');
    const anchorName = `--${ctx.baseId}-${safeValue}`;
    const menuId = `${ctx.baseId}-${safeValue}-menu`;
    const triggerId = `${ctx.baseId}-${safeValue}-trigger`;

    const setTriggerRef = useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        ctx.setTriggerEl(index, node);
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as { current: HTMLButtonElement | null }).current = node;
        }
      },
      [ctx, index, forwardedRef],
    );

    const setPopoverRef = useCallback((node: HTMLDivElement | null) => {
      popoverRef.current = node;
    }, []);

    // 拍平 items(children 复合不拍平,交原生)。
    const { rows, focusable } = useMemo(
      () => (items ? flattenItems(items) : { rows: [] as FlatRow[], focusable: [] as MenuItem[] }),
      [items],
    );

    // open → 原生 popover 显隐。
    useEffect(() => {
      const el = popoverRef.current;
      if (!el || typeof el.showPopover !== 'function') {
        return;
      }
      const isShown = el.matches(':popover-open');
      try {
        if (open && !isShown) {
          el.showPopover();
        } else if (!open && isShown) {
          el.hidePopover();
        }
      } catch {
        // 已显示 / 已隐藏 / 不支持:忽略,靠 React 状态最终一致。
      }
    }, [open]);

    // 关闭时清子菜单态。
    useEffect(() => {
      if (!open) {
        setOpenSubmenu(-1);
      }
    }, [open]);

    const focusByIndex = useCallback((i: number) => {
      if (i >= 0) {
        itemRefs.current[i]?.focus();
      }
    }, []);

    // 当前展开子菜单的原始项数组(openSubmenu 指向父项的 focusIndex;映射回该父项的 submenu)。
    const openSubItems = useMemo<MenubarItem[]>(() => {
      if (openSubmenu < 0 || !items) {
        return [];
      }
      // focusable 与 rows 的可聚焦项一一对应;openSubmenu 是父项在 focusable 序列里的下标。
      const parent = focusable[openSubmenu] as MenubarItem | undefined;
      return parent && hasSubmenu(parent) ? (parent.submenu ?? []) : [];
    }, [openSubmenu, items, focusable]);

    // 子菜单里「可聚焦」的项下标集合(渲染按 j 顺序为 button;disabled 项不计入焦点环)。
    const subFocusableIndexes = useMemo<number[]>(() => {
      const out: number[] = [];
      for (let j = 0; j < openSubItems.length; j += 1) {
        const sub = openSubItems[j];
        if (sub && !sub.disabled && sub.type !== 'separator' && sub.type !== 'group') {
          out.push(j);
        }
      }
      return out;
    }, [openSubItems]);

    const focusSubByRenderIndex = useCallback((j: number) => {
      if (j >= 0) {
        subItemRefs.current[j]?.focus();
      }
    }, []);

    // 键盘 → 打开子菜单时置位:让落焦 effect 把焦点移进子菜单首项;鼠标 hover/点开不置位(不抢焦)。
    const focusSubFirstRef = useRef(false);
    const subFocusableRef = useRef<number[]>(subFocusableIndexes);
    subFocusableRef.current = subFocusableIndexes;
    // openSubmenu 上升到某父项且带键盘意图 → 同步落焦子菜单首个可聚焦项。
    // useLayoutEffect + 同步 focus:与父面板开菜单落焦同理,在 commit 相位子菜单已挂载、
    // subItemRefs 已写入,直接同步落焦,覆盖「→ 展开子菜单 + 同一 act 内 flush 计时器」的测试时序,
    // 也避免迟到 rAF 抢焦。
    useLayoutEffect(() => {
      if (openSubmenu < 0 || !focusSubFirstRef.current) {
        return;
      }
      focusSubFirstRef.current = false;
      const first = subFocusableRef.current[0];
      if (first === undefined) {
        return;
      }
      subItemRefs.current[first]?.focus();
    }, [openSubmenu]);

    // 子菜单 typeahead(独立焦点环);currentRenderIndex 是当前聚焦子项的渲染下标。
    const runSubTypeahead = useCallback((char: string, currentRenderIndex: number) => {
      const state = subTypeaheadRef.current;
      if (state.timer !== null) {
        window.clearTimeout(state.timer);
      }
      state.query += char.toLowerCase();
      const order = subFocusableRef.current;
      const subs = subItemRefs.current;
      // 从当前项之后开始环形找首字符匹配项(以渲染文本近似);只在可聚焦下标集合内找。
      const startPos = order.indexOf(currentRenderIndex);
      for (let step = 1; step <= order.length; step += 1) {
        const pos = (startPos + step + order.length) % order.length;
        const j = order[pos];
        if (j === undefined) {
          continue;
        }
        const text = (subs[j]?.textContent ?? '').trim().toLowerCase();
        if (text.startsWith(state.query)) {
          subs[j]?.focus();
          break;
        }
      }
      state.timer = window.setTimeout(() => {
        state.query = '';
        state.timer = null;
      }, 500);
    }, []);

    // 打开时按 intent(first/last)落焦(仅数据驱动用法)。
    // 关键:与不稳定的 ctx / 内联 focusable 解耦——consumeIntent 与最新 focusable 用 ref 持有,
    // effect 依赖只收敛为 [open],并用「上升沿守卫」确保仅在 open 真正 false→true 时落焦一次。
    // 否则菜单打开期间父级任意重渲染(内联 classNames/items 换引用 → ctx/focusable 换引用)会再次
    // 执行本 effect,把已被 ↑/↓ 移动过的焦点强行拉回首项(参考 Dropdown.tsx 刻意不依赖 ctx 的等价 effect)。
    const consumeIntentRef = useRef(ctx.consumeIntent);
    consumeIntentRef.current = ctx.consumeIntent;
    const focusableRef = useRef(focusable);
    focusableRef.current = focusable;
    const wasOpenRef = useRef(false);
    // useLayoutEffect(而非 useEffect):在 commit 阶段同步执行,确保 rAF 在打开菜单的那一拍
    // 同步相位内就被排期。否则被动 effect 异步 flush 会晚于测试在同一 act 块内调用的 vi.runAllTimers()
    // ——rAF 还没排期就被 flush,落焦丢失(对照 Dropdown 落焦 effect 仅依赖 [open,items,focusable],
    // 此处再加「上升沿守卫 + ref 持有 consumeIntent/focusable」以免父级重渲染把焦点拉回首项)。
    useLayoutEffect(() => {
      const rising = open && !wasOpenRef.current;
      wasOpenRef.current = open;
      if (!rising || !items) {
        return;
      }
      const intent = consumeIntentRef.current();
      const list = focusableRef.current;
      const target = intent === 'last' ? lastFocusable(list) : firstFocusable(list);
      if (target < 0) {
        return undefined;
      }
      // useLayoutEffect 在 commit 阶段同步执行:此时面板已挂载、itemRefs 已写入,直接同步落焦。
      // 刻意不再用 rAF 延后——延后的 rAF 会被「下一次无关的计时器 flush」驱动,把用户随后用 ↑/↓
      // 移动过的焦点强行拉回开菜单时的落点(本组件 #1 回归正是这个抢焦)。同步落焦既满足「键盘
      // 开菜单 + 同一 act 内 flush 计时器」的测试时序,又彻底避免迟到 rAF 抢焦。
      itemRefs.current[target]?.focus();
      return undefined;
    }, [open, items]);

    const closeAndRefocus = useCallback(() => {
      ctx.requestOpen(null, 'none');
      triggerRef.current?.focus();
    }, [ctx]);

    const select = useCallback(
      (
        item: MenubarItem,
        focusIndex: number,
        event?: { defaultPrevented?: boolean; preventDefault: () => void },
      ) => {
        if (item.disabled) {
          return;
        }
        if (hasSubmenu(item)) {
          setOpenSubmenu((cur) => (cur === focusIndex ? -1 : focusIndex));
          return;
        }
        if (event && item.onClick) {
          item.onClick(event);
          if (event.defaultPrevented) {
            return;
          }
        }
        item.onSelect?.();
        selectForwardRef.current?.(item, value);
        // checkbox / radio 项(checked!==undefined)保持打开便于连续切换;否则按 closeOnSelect。
        const keepOpen = item.checked !== undefined;
        if (!keepOpen && ctx.closeOnSelect) {
          closeAndRefocus();
        }
      },
      [ctx.closeOnSelect, closeAndRefocus, value],
    );

    const selectSub = useCallback(
      (sub: MenubarItem, event: { defaultPrevented?: boolean; preventDefault: () => void }) => {
        if (sub.disabled) {
          return;
        }
        // 与父项 select 同口径:仅当子项自身 onClick 把事件 preventDefault 时才中止 onSelect。
        // 不能无条件读 event.defaultPrevented —— 键盘 Enter/Space 入口已先 e.preventDefault()(阻止
        // 滚动 / 合成 click),那是路由控制不是「取消选中」,否则键盘选中永远被自己的 preventDefault 吞掉。
        if (sub.onClick) {
          sub.onClick(event);
          if (event.defaultPrevented) {
            return;
          }
        }
        sub.onSelect?.();
        selectForwardRef.current?.(sub, value);
        const keepOpen = sub.checked !== undefined;
        if (!keepOpen && ctx.closeOnSelect) {
          closeAndRefocus();
        }
      },
      [ctx.closeOnSelect, closeAndRefocus, value],
    );

    const runTypeahead = useCallback(
      (char: string, currentFocusIndex: number) => {
        const state = typeaheadRef.current;
        if (state.timer !== null) {
          window.clearTimeout(state.timer);
        }
        state.query += char;
        const matched = typeaheadMatch(focusable, state.query, currentFocusIndex);
        if (matched >= 0) {
          focusByIndex(matched);
        }
        state.timer = window.setTimeout(() => {
          state.query = '';
          state.timer = null;
        }, 500);
      },
      [focusable, focusByIndex],
    );

    // 卸载清理 typeahead 计时器(主面板 + 子菜单两条焦点环;路由切换 / 条件移除 Menubar.Menu 时),
    // 避免回调写已分离的 ref —— 与 Dropdown 卸载清 hover 计时器(useEffect(() => clearHoverTimer, …))一致。
    useEffect(() => {
      const main = typeaheadRef.current;
      const sub = subTypeaheadRef.current;
      return () => {
        if (main.timer !== null) {
          window.clearTimeout(main.timer);
          main.timer = null;
        }
        if (sub.timer !== null) {
          window.clearTimeout(sub.timer);
          sub.timer = null;
        }
      };
    }, []);

    // —— 触发器键盘:顶层 menubar 语义(委托 logic) ——
    const onTriggerKeyDown = useCallback(
      (e: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (disabled) {
          return;
        }
        const total = ctx.count();
        const result = resolveMenubarKey(e.key, index, total, ctx.anyOpen(), ctx.disabledMask());
        if (!result.handled) {
          return;
        }
        e.preventDefault();
        // nextIndex<0:roving 全撞墙(相邻 / 首尾全是 disabled),保持原位不移焦、不开合。
        if (result.open) {
          if (result.nextIndex < 0) {
            return;
          }
          const targetValue = ctx.valueAt(result.nextIndex);
          // 先把焦点移到目标触发器(切换打开态时焦点跟随),再请求打开。
          if (result.nextIndex !== index) {
            ctx.focusTrigger(result.nextIndex);
          }
          ctx.requestOpen(targetValue, result.intent);
        } else if (result.nextIndex >= 0 && result.nextIndex !== index) {
          ctx.focusTrigger(result.nextIndex);
        }
      },
      [ctx, index, disabled],
    );

    const onTriggerClick = useCallback(() => {
      if (disabled) {
        return;
      }
      ctx.requestOpen(open ? null : value, 'none');
    }, [ctx, open, value, disabled]);

    // hover:当菜单栏已有某个菜单打开时,指针移到别的触发器即切换(应用菜单栏惯例)。
    const onTriggerPointerEnter = useCallback(() => {
      if (disabled || open) {
        return;
      }
      if (ctx.anyOpen()) {
        ctx.requestOpen(value, 'none');
      }
    }, [ctx, open, value, disabled]);

    // 菜单内 ←→ 切到相邻顶级菜单:关本菜单 → 移焦相邻触发器 → 打开它并落焦首项。
    const switchAdjacent = useCallback(
      (dir: 1 | -1) => {
        const total = ctx.count();
        const { nextIndex, intent } = adjacentMenu(index, dir, total, ctx.disabledMask());
        // 相邻全为 disabled(nextIndex<0)或回到自身:保持当前菜单不动(不关、不移焦),
        // 避免「当前被关 + 焦点落到禁用触发器 = 无菜单无焦点」死态。
        if (nextIndex < 0 || nextIndex === index) {
          return;
        }
        const targetValue = ctx.valueAt(nextIndex);
        ctx.focusTrigger(nextIndex);
        ctx.requestOpen(targetValue, intent);
      },
      [ctx, index],
    );

    // —— 菜单项键盘 ——
    const onItemKeyDown = useCallback(
      (e: ReactKeyboardEvent<HTMLElement>, focusIndex: number, item: MenubarItem) => {
        const total = focusable.length;
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            focusByIndex(nextFocusIndex(focusIndex, 1, total, true));
            break;
          case 'ArrowUp':
            e.preventDefault();
            focusByIndex(nextFocusIndex(focusIndex, -1, total, true));
            break;
          case 'Home':
            e.preventDefault();
            focusByIndex(firstFocusable(focusable));
            break;
          case 'End':
            e.preventDefault();
            focusByIndex(lastFocusable(focusable));
            break;
          case 'ArrowRight':
            // 项自身有子菜单 → 展开并把焦点移入子菜单首项(键盘可达);否则切到右邻顶级菜单。
            e.preventDefault();
            if (hasSubmenu(item)) {
              focusSubFirstRef.current = true;
              setOpenSubmenu(focusIndex);
            } else {
              switchAdjacent(1);
            }
            break;
          case 'ArrowLeft':
            // 子菜单已展开 → 收起;否则切到左邻顶级菜单。
            e.preventDefault();
            if (openSubmenu === focusIndex) {
              setOpenSubmenu(-1);
            } else {
              switchAdjacent(-1);
            }
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            select(item, focusIndex, e);
            break;
          case 'Escape':
            e.preventDefault();
            closeAndRefocus();
            break;
          case 'Tab':
            // Tab 关闭但不抢焦:把焦点显式交还触发器(避免 top-layer 同步隐藏导致焦点落空),
            // 再关闭——用户从触发器自然续 Tab。Shift+Tab 同理。
            e.preventDefault();
            closeAndRefocus();
            break;
          default:
            if (e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey) {
              runTypeahead(e.key, focusIndex);
            }
            break;
        }
      },
      [focusable, focusByIndex, select, closeAndRefocus, runTypeahead, openSubmenu, switchAdjacent],
    );

    // —— 子菜单项键盘(独立焦点环):↑↓ 在子项间 roving、Home/End、Enter/Space 选、
    // ← 收起子菜单并回焦父项、Esc 全关回焦触发器、typeahead。建立 ARIA APG「→ 进子菜单、← 回父级」环。
    const onSubItemKeyDown = useCallback(
      (e: ReactKeyboardEvent<HTMLButtonElement>, renderIndex: number, sub: MenubarItem) => {
        const order = subFocusableRef.current;
        const pos = order.indexOf(renderIndex);
        switch (e.key) {
          case 'ArrowDown': {
            e.preventDefault();
            if (order.length === 0) {
              break;
            }
            const next = order[(pos + 1 + order.length) % order.length];
            if (next !== undefined) {
              focusSubByRenderIndex(next);
            }
            break;
          }
          case 'ArrowUp': {
            e.preventDefault();
            if (order.length === 0) {
              break;
            }
            const prev = order[(pos - 1 + order.length) % order.length];
            if (prev !== undefined) {
              focusSubByRenderIndex(prev);
            }
            break;
          }
          case 'Home': {
            e.preventDefault();
            const first = order[0];
            if (first !== undefined) {
              focusSubByRenderIndex(first);
            }
            break;
          }
          case 'End': {
            e.preventDefault();
            const last = order[order.length - 1];
            if (last !== undefined) {
              focusSubByRenderIndex(last);
            }
            break;
          }
          case 'Enter':
          case ' ':
            e.preventDefault();
            selectSub(sub, e);
            break;
          case 'ArrowLeft':
            // ← 收起子菜单并把焦点交还父项(回父级焦点环)。
            e.preventDefault();
            if (openSubmenu >= 0) {
              focusByIndex(openSubmenu);
              setOpenSubmenu(-1);
            }
            break;
          case 'Escape':
            // Esc 整菜单关闭并回焦顶层触发器(与父面板 Esc 一致)。
            e.preventDefault();
            closeAndRefocus();
            break;
          case 'Tab':
            e.preventDefault();
            closeAndRefocus();
            break;
          default:
            if (e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey) {
              runSubTypeahead(e.key, renderIndex);
            }
            break;
        }
      },
      [
        selectSub,
        closeAndRefocus,
        runSubTypeahead,
        openSubmenu,
        focusByIndex,
        focusSubByRenderIndex,
      ],
    );

    // 顶层 roving:激活的触发器(open 或首个)tabIndex=0,其余 -1。
    const activeIndex = ctx.indexOf(ctx.openValue ?? '');
    const rovingActive = activeIndex >= 0 ? activeIndex : 0;
    const tabIndex = index === rovingActive ? 0 : -1;

    const triggerClass = [
      'ms-menubar__trigger',
      open && 'ms-menubar__trigger--open',
      ctx.classNames?.trigger,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // 用户 style 与 anchorName 合并:anchorName 放最后,确保不被用户 style(或下方 {...rest})覆盖
    // ——style 已从 props 解构出、不在 rest 里,故 {...rest} 不会二次覆盖 anchor-name
    // (否则触发器锚点丢失 → 菜单浮层掉到 top-layer 左上角)。
    const triggerStyle: AnchorStyle = { ...style, anchorName };

    const side = ctx.placement.startsWith('top') ? 'top' : 'bottom';
    const align = ctx.placement.endsWith('-end') ? 'end' : 'start';
    const popoverStyle: AnchorStyle = {
      positionAnchor: anchorName,
      '--ms-menubar-area': placementToArea(ctx.placement),
      '--ms-menubar-offset': `${ctx.offset}px`,
    };

    const menuClass = ['ms-menubar__list', ctx.classNames?.list].filter(Boolean).join(' ');

    // —— 渲染一个可聚焦项 ——
    const renderActionRow = (row: FlatRow): ReactNode => {
      const item = row.item as MenubarItem;
      const focusIndex = row.focusIndex;
      const submenu = hasSubmenu(item);
      const isLink = typeof item.href === 'string' && !item.disabled && !submenu;
      const selectionRole: MenuItemRole | undefined =
        item.checked !== undefined ? (item.selectionRole ?? 'checkbox') : undefined;
      const ariaRole =
        selectionRole === 'radio'
          ? 'menuitemradio'
          : selectionRole === 'checkbox'
            ? 'menuitemcheckbox'
            : 'menuitem';

      const submenuOpen = submenu && openSubmenu === focusIndex;
      const itemClass = [
        'ms-menubar__item',
        item.danger && 'ms-menubar__item--danger',
        selectionRole && 'ms-menubar__item--selectable',
        submenu && 'ms-menubar__item--has-submenu',
        ctx.classNames?.item,
      ]
        .filter(Boolean)
        .join(' ');

      const setItemRef = (node: HTMLElement | null) => {
        itemRefs.current[focusIndex] = node;
      };
      const inner = renderItemInner(item, selectionRole);

      if (submenu) {
        return (
          <div key={row.rowKey} role="none" className="ms-menubar__submenu-wrap">
            <button
              ref={setItemRef as Ref<HTMLButtonElement>}
              type="button"
              role="menuitem"
              tabIndex={-1}
              aria-haspopup="menu"
              aria-expanded={submenuOpen}
              disabled={item.disabled}
              className={itemClass}
              aria-disabled={item.disabled || undefined}
              onKeyDown={(e) => onItemKeyDown(e, focusIndex, item)}
              onClick={(e) =>
                select(
                  item,
                  focusIndex,
                  e as unknown as {
                    defaultPrevented?: boolean;
                    preventDefault: () => void;
                  },
                )
              }
            >
              {inner}
            </button>
            {submenuOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                className={['ms-menubar__submenu', ctx.classNames?.submenu]
                  .filter(Boolean)
                  .join(' ')}
              >
                {(item.submenu ?? []).map((sub, j) => {
                  const subRole: MenuItemRole | undefined =
                    sub.checked !== undefined ? (sub.selectionRole ?? 'checkbox') : undefined;
                  const subAriaRole =
                    subRole === 'radio'
                      ? 'menuitemradio'
                      : subRole === 'checkbox'
                        ? 'menuitemcheckbox'
                        : 'menuitem';
                  return (
                    <button
                      // biome-ignore lint/suspicious/noArrayIndexKey: 子菜单项无稳定 id,一层静态列表用索引足够
                      key={`sub-${focusIndex}-${j}`}
                      ref={(node) => {
                        subItemRefs.current[j] = node;
                      }}
                      type="button"
                      role={subAriaRole}
                      tabIndex={-1}
                      disabled={sub.disabled}
                      className={[
                        'ms-menubar__item',
                        sub.danger && 'ms-menubar__item--danger',
                        subRole && 'ms-menubar__item--selectable',
                        ctx.classNames?.item,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-disabled={sub.disabled || undefined}
                      {...(subRole ? { 'aria-checked': !!sub.checked } : {})}
                      onKeyDown={(e) => onSubItemKeyDown(e, j, sub)}
                      onClick={(e) =>
                        selectSub(
                          sub,
                          e as unknown as {
                            defaultPrevented?: boolean;
                            preventDefault: () => void;
                          },
                        )
                      }
                    >
                      {renderItemInner(sub, subRole)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      if (isLink) {
        return (
          <a
            key={row.rowKey}
            ref={setItemRef as Ref<HTMLAnchorElement>}
            href={item.href}
            target={item.target}
            rel={item.rel}
            role={ariaRole}
            tabIndex={-1}
            className={itemClass}
            aria-disabled={item.disabled || undefined}
            {...(selectionRole ? { 'aria-checked': !!item.checked } : {})}
            onKeyDown={(e) => onItemKeyDown(e, focusIndex, item)}
            onClick={(e) =>
              select(
                item,
                focusIndex,
                e as unknown as {
                  defaultPrevented?: boolean;
                  preventDefault: () => void;
                },
              )
            }
          >
            {inner}
          </a>
        );
      }

      return (
        <button
          key={row.rowKey}
          ref={setItemRef as Ref<HTMLButtonElement>}
          type="button"
          role={ariaRole}
          tabIndex={-1}
          disabled={item.disabled}
          className={itemClass}
          aria-disabled={item.disabled || undefined}
          {...(selectionRole ? { 'aria-checked': !!item.checked } : {})}
          onKeyDown={(e) => onItemKeyDown(e, focusIndex, item)}
          onClick={(e) =>
            select(
              item,
              focusIndex,
              e as unknown as {
                defaultPrevented?: boolean;
                preventDefault: () => void;
              },
            )
          }
        >
          {inner}
        </button>
      );
    };

    const menuInner = items ? (
      <div
        role="menu"
        aria-orientation="vertical"
        aria-labelledby={triggerId}
        className={menuClass}
      >
        {rows.map((row) => {
          if (row.kind === 'separator') {
            return (
              <hr
                key={row.rowKey}
                className={['ms-menubar__separator', ctx.classNames?.separator]
                  .filter(Boolean)
                  .join(' ')}
              />
            );
          }
          if (row.kind === 'group-label') {
            return (
              <div role="presentation" key={row.rowKey} className="ms-menubar__group">
                <div
                  className={['ms-menubar__group-label', ctx.classNames?.groupLabel]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {row.item.label}
                </div>
              </div>
            );
          }
          return renderActionRow(row);
        })}
        {rows.length === 0 && <MenubarEmpty />}
      </div>
    ) : (
      <div
        role="menu"
        aria-orientation="vertical"
        aria-labelledby={triggerId}
        className={menuClass}
      >
        {children}
      </div>
    );

    const popoverClass = ['ms-menubar__menu', `ms-menubar__menu--${side}`, ctx.classNames?.menu]
      .filter(Boolean)
      .join(' ');

    return (
      <>
        <button
          ref={setTriggerRef}
          id={triggerId}
          type="button"
          role="menuitem"
          tabIndex={disabled ? -1 : tabIndex}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          aria-disabled={disabled || undefined}
          disabled={disabled}
          className={triggerClass}
          style={triggerStyle}
          data-state={open ? 'open' : 'closed'}
          {...(textValue ? { 'data-text-value': textValue } : {})}
          onClick={composeEventHandlers(onClick, onTriggerClick)}
          onKeyDown={composeEventHandlers(onKeyDown, onTriggerKeyDown)}
          onPointerEnter={composeEventHandlers(onPointerEnter, onTriggerPointerEnter)}
          {...rest}
        >
          {label}
        </button>
        <div
          ref={setPopoverRef}
          id={menuId}
          popover="auto"
          data-ms-side={side}
          data-ms-align={align}
          className={popoverClass}
          style={popoverStyle}
          onToggle={(e) => {
            // 原生 light-dismiss(点外 / Esc)→ 同步回开合状态。
            const next = (e as unknown as { newState?: string }).newState === 'open';
            if (!next && open) {
              ctx.requestOpen(null, 'none');
            }
          }}
        >
          {/* 仅打开时挂载面板内容:关闭的菜单不向 AT 暴露 role=menu/menuitem,
              也避免一条菜单栏里多个 Menubar.Menu 的 role=menu 同时存在(每条最多一个打开)。 */}
          {open && <div className="ms-menubar__panel">{menuInner}</div>}
        </div>
      </>
    );
  },
);
MenubarMenu.displayName = 'Menubar.Menu';

/** 空菜单文案(走 i18n select.empty)。 */
function MenubarEmpty(): ReactNode {
  const t = useMessages();
  return (
    <div role="presentation" className="ms-menubar__empty">
      {t('select.empty')}
    </div>
  );
}

// —— 命名空间:Menubar.Menu —— //
type MenubarComponent = typeof MenubarRoot & {
  Menu: typeof MenubarMenu;
};
const MenubarWithStatics = MenubarRoot as MenubarComponent;
MenubarWithStatics.Menu = MenubarMenu;

/** Menubar —— 应用菜单栏,带命名空间子组件 Menubar.Menu。 */
export const Menubar = MenubarWithStatics;

export { MenubarMenu };

/* TODO(submenu-deep): 子菜单当前仅一层(item.submenu)。深层嵌套(submenu 再带 submenu)需要
 * 递归渲染 + 每级独立 roving/typeahead 焦点环 + 跨级方向键(← 回父级、→ 进子级)与多级浮层
 * 翻转定位,留待后续按 ARIA APG「menubar with submenus」完整实现。 */

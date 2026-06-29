import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactElement,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  PointerEvent as ReactPointerEvent,
  Ref,
} from 'react';
import {
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
  useState,
} from 'react';
import { composeEventHandlers, composeRefs, mergeAsChildProps } from '../../utils/compose';
import {
  edgeEnabledIndex,
  isActivatable,
  type NavMenuNode,
  nextEnabledIndex,
  planHoverIntent,
  reduceActive,
  resolveTriggerKey,
} from './logic';

export type {
  HoverIntentPlan,
  NavMenuMoveIntent,
  NavMenuNode,
} from './logic';

export type NavigationMenuTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** panel(viewport)相对触发器行的对齐方式。 */
export type NavigationMenuViewportAlign = 'start' | 'center' | 'end';

/** 数据驱动的链接 / 子项(用于 mega-menu 的链接网格)。 */
export interface NavMenuLink {
  /** 链接文本。 */
  label: ReactNode;
  /** 链接地址。给了即渲染为 <a>。 */
  href: string;
  /** 链接下的辅助描述(mega-menu 卡片常用)。 */
  description?: ReactNode;
  /** 前置图标(装饰性,aria-hidden)。 */
  icon?: ReactNode;
  /** 是否为当前页(渲染 aria-current=page)。 */
  active?: boolean;
  /** target(如 '_blank')。 */
  target?: string;
  /** rel(配合 _blank 建议 noreferrer)。 */
  rel?: string;
  /** 是否禁用。 */
  disabled?: boolean;
  /**
   * 点击回调(与内部行为 compose,先你的、未 preventDefault 再走内部关闭)。
   * @param event 该次点击事件,可 `preventDefault()` 阻断内部关闭与导航后处理。
   */
  onSelect?: (event: { defaultPrevented?: boolean; preventDefault: () => void }) => void;
}

/** 数据驱动的单个导航项。 */
export interface NavMenuItem {
  /** 唯一值(active / 受控标识)。 */
  value: string;
  /** 触发器 / 链接显示内容。 */
  label: ReactNode;
  /**
   * 该项的下拉 panel 内容(mega-menu)。给了即渲染为带 panel 的触发器;
   * 不给且有 href 则是纯链接项。content 与 links 二选一(content 优先)。
   */
  content?: ReactNode;
  /** 便捷:链接网格(等价于把 links 渲染进默认 panel)。仅在未给 content 时生效。 */
  links?: NavMenuLink[];
  /** 纯链接项地址(无 content / links 时,整项是一个跳转链接)。 */
  href?: string;
  /** href 存在时的 target。 */
  target?: string;
  /** href 存在时的 rel。 */
  rel?: string;
  /** 纯链接项:是否为当前页(aria-current=page)。 */
  active?: boolean;
  /** 是否禁用。 */
  disabled?: boolean;
  /** 前置图标(装饰性,aria-hidden)。 */
  icon?: ReactNode;
}

/** 关键子部件 className 槽位。 */
export interface NavigationMenuClassNames {
  /** 外层 <nav> .ms-navmenu。 */
  root?: string | undefined;
  /** 触发器行 .ms-navmenu__list(role=list 语义的横排)。 */
  list?: string | undefined;
  /** 单个项容器 .ms-navmenu__item。 */
  item?: string | undefined;
  /** 触发器按钮 .ms-navmenu__trigger。 */
  trigger?: string | undefined;
  /** 纯链接项 .ms-navmenu__link。 */
  link?: string | undefined;
  /** 共享浮层容器 .ms-navmenu__viewport。 */
  viewport?: string | undefined;
  /** panel 内容 .ms-navmenu__content。 */
  content?: string | undefined;
}

/** anchor-name / position-anchor 不在标准 CSSProperties,这里做最小扩展。 */
interface AnchorStyle extends CSSProperties {
  anchorName?: string | undefined;
  [key: `--${string}`]: string | number | undefined;
}

export interface NavigationMenuProps
  extends Omit<ComponentPropsWithoutRef<'nav'>, 'onChange' | 'children' | 'defaultValue'> {
  /** 数据驱动的导航项(与 children 二选一,优先 items)。 */
  items?: NavMenuItem[] | undefined;
  /** 复合用法:塞 <NavigationMenu.List> 等子组件。仅在不传 items 时生效。 */
  children?: ReactNode;
  /** 语义色调,经全库 tone resolver 派生 hover / active / 发光配色。默认 primary。 */
  tone?: NavigationMenuTone;
  /** 受控:当前打开 panel 的项 value(null = 全关)。传入即受控,需配合 onValueChange。 */
  value?: string | null | undefined;
  /** 非受控初始打开项。默认 null(全关)。 */
  defaultValue?: string | null | undefined;
  /**
   * 打开项变化回调(受控 / 非受控双通道都触发)。
   * @param value 变化后处于打开态的项 value;全部关闭时为 null。
   */
  onValueChange?: ((value: string | null) => void) | undefined;
  /** 指针 hover 到打开 panel 的延时(ms,防一扫而过)。默认 200。 */
  openDelay?: number;
  /** 指针离开到关闭 panel 的宽限延时(ms,防触发器↔panel 穿越误关)。默认 300。 */
  closeDelay?: number;
  /**
   * 是否启用 hover 打开。默认 true。关掉则仅点击 / 键盘可开(无障碍 / 触屏更稳)。
   */
  hoverable?: boolean;
  /**
   * 是否用共享 Viewport(单一浮层容器,尺寸 / 位置随 active panel 平滑过渡,Radix 风格)。
   * 默认 true。关掉则每个 panel 各自就地展开(更易做超宽 mega-menu 满宽布局)。
   */
  viewport?: boolean;
  /** Viewport 相对触发器行的对齐。默认 start。 */
  viewportAlign?: NavigationMenuViewportAlign;
  /** panel 与触发器行的间距(px)。默认 8。 */
  offset?: number;
  /** 外层 <nav> 的可访问名(屏读「导航地标」标签)。默认 '主导航'。 */
  'aria-label'?: string | undefined;
  /**
   * Esc 关闭 panel 前回调,可 `preventDefault()` 拦截阻止关闭。
   * 无论焦点在触发器还是 panel 内,Esc 都统一走根级全局监听并先调用本回调(单一路径),
   * 因此 `preventDefault()` 在两种焦点位置下都能拦截关闭(行为一致)。
   * 注:回调收到的是把原生 KeyboardEvent 适配后的事件对象,仅保证 `key` / `preventDefault()` /
   * `defaultPrevented` / `nativeEvent` 可用;不要依赖 React 合成事件的池化或 currentTarget。
   * @param event 触发关闭的 Esc 键盘事件,可 `preventDefault()` 拦截。
   */
  onEscapeKeyDown?: ((event: ReactKeyboardEvent<HTMLElement>) => void) | undefined;
  /** 外层附加 className(作用于 <nav>)。 */
  className?: string | undefined;
  /** 各部件细粒度 className 槽位。 */
  classNames?: NavigationMenuClassNames | undefined;
}

/* ——————————————————— 复合用法的内部 Context ——————————————————— */

interface NavMenuContextValue {
  /** 当前打开项 value。 */
  activeValue: string | null;
  /** 整体 tone。 */
  tone: NavigationMenuTone;
  /** 命名空间前缀(用于派生触发器 / panel 的 id 关联)。 */
  idBase: string;
  /** 请求打开 / 切换某项 panel(点击 / 键盘)。 */
  toggle: (value: string) => void;
  /** 命令式设值(键盘 ← → 切换、Esc 关闭等)。 */
  setActive: (value: string | null, refocusTrigger?: boolean) => void;
  /** hover 打开某项 panel(走 hover-intent 防抖)。 */
  hoverOpen: (value: string) => void;
  /** hover 关闭(走 closeDelay 宽限)。 */
  hoverClose: () => void;
  /** 取消挂起的 hover 计时(指针重新进入热区时调用)。 */
  cancelHover: () => void;
  /** 是否启用 hover。 */
  hoverable: boolean;
  classNames?: NavigationMenuClassNames | undefined;
  /** 注册触发器节点(键盘 roving 焦点用)。 */
  registerTrigger: (value: string, node: HTMLElement | null) => void;
  /** 复合用法:注册 / 注销结构性节点(数据驱动模式由 items 接管,此调用为 no-op)。 */
  registerNode: (node: NavMenuNode | { value: string; remove: true }) => void;
  /** 触发器键盘:← → / Home / End / ↓ 等。 */
  onTriggerKeyDown: (event: ReactKeyboardEvent<HTMLElement>, value: string) => void;
  /** 该项是否带 panel(用于 aria-haspopup / id 关联)。 */
  hasPanel: (value: string) => boolean;
}

const NavMenuContext = createContext<NavMenuContextValue | null>(null);

function useNavMenuContext(component: string): NavMenuContextValue {
  const ctx = useContext(NavMenuContext);
  if (!ctx) {
    throw new Error(`<${component}> 必须用在 <NavigationMenu> 内部。`);
  }
  return ctx;
}

/* ——————————————————— 默认链接网格(便捷 links 渲染) ——————————————————— */

function LinkGrid({
  links,
  onNavigate,
  className,
}: {
  links: NavMenuLink[];
  onNavigate: () => void;
  className?: string | undefined;
}): ReactElement {
  return (
    <ul className={['ms-navmenu__grid', className].filter(Boolean).join(' ')}>
      {links.map((link, i) => (
        <li
          // biome-ignore lint/suspicious/noArrayIndexKey: 链接网格为一层静态列表,无稳定 id,索引足够
          key={`${link.href}-${i}`}
          className="ms-navmenu__grid-item"
        >
          <a
            className="ms-navmenu__grid-link"
            href={link.disabled ? undefined : link.href}
            target={link.target}
            rel={link.rel}
            aria-current={link.active ? 'page' : undefined}
            aria-disabled={link.disabled || undefined}
            data-active={link.active || undefined}
            onClick={(e) => {
              if (link.disabled) {
                e.preventDefault();
                return;
              }
              link.onSelect?.(e);
              if (!e.defaultPrevented) {
                onNavigate();
              }
            }}
          >
            {link.icon != null && (
              <span className="ms-navmenu__grid-icon" aria-hidden="true">
                {link.icon}
              </span>
            )}
            <span className="ms-navmenu__grid-text">
              <span className="ms-navmenu__grid-label">{link.label}</span>
              {link.description != null && (
                <span className="ms-navmenu__grid-desc">{link.description}</span>
              )}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ——————————————————— 根组件 ——————————————————— */

/**
 * NavigationMenu —— 网站导航菜单(navigation,旗舰深度组件)。自研、零依赖。
 *
 * 与 Menubar / Menu 的根本区别:这是「站点导航」而非「命令菜单」——触发器与内容用 link / button
 * 语义(非 menu / menuitem role),面向页面跳转与信息架构。横向一排导航项,每项可是:
 * - 纯链接(整项 <a> 跳转,可标 aria-current=page);
 * - 带下拉 panel 的触发器(mega-menu,放富内容 / 链接网格)。
 *
 * 交互契约:
 * - 同一时刻至多一个 panel 打开(单值 activeValue 不变式);切换带平滑过渡。
 * - 指针 hover:openDelay 防抖打开、closeDelay 宽限关闭,指针在触发器↔panel 间穿越不误关
 *   (hover-intent 纯逻辑在 logic.ts)。hoverable=false 可只走点击 / 键盘。
 * - 键盘:Tab 在触发器 / 链接间;触发器上 ← → 横向 roving、Home / End 跳首尾、↓ / Enter / Space
 *   打开 panel 并把焦点移入;panel 内 Tab / Shift+Tab 自然遍历;Esc 关闭并回焦触发器。
 *
 * a11y:外层 <nav aria-label>(导航地标);触发器 <button aria-expanded / aria-controls>;
 * panel 关联 id 并 aria-labelledby 回指触发器;active link aria-current=page。
 *
 * 浮层:默认共享 Viewport(单容器,尺寸 / 位置随 active panel 用 CSS 过渡,Radix 风格);
 * viewport=false 则各 panel 就地展开(便于满宽 mega-menu)。
 *
 * 诚实备注:
 * - viewport 的尺寸 / 位置过渡用纯 CSS(grid-template / transform),不测量 DOM,SSR 安全、无布局抖动;
 *   极端超宽 panel 在窄视口可能溢出,已用 max-inline-size + 横向滚动兜底。
 * - 定位用 CSS Anchor Positioning,`@supports not (anchor-name)` 降级为 fixed 居中,保证可用。
 * - 数据驱动(items)与复合(children)二选一;复合用法自定义 panel 内容时,键盘移入 panel 后的
 *   遍历交由原生 Tab(我们只负责把焦点送进 panel 第一个可聚焦元素)。
 *
 * 纯逻辑(active 状态机 / hover-intent / 横向 roving)在同目录 logic.ts(零 React,可平移 core)。
 * 样式见同目录 NavigationMenu.css,需引入 @magic-scope/react/styles.css。
 */
const NavigationMenuBase = forwardRef<HTMLElement, NavigationMenuProps>(
  (
    {
      items,
      children,
      tone = 'primary',
      value: valueProp,
      defaultValue = null,
      onValueChange,
      openDelay = 200,
      closeDelay = 300,
      hoverable = true,
      viewport = true,
      viewportAlign = 'start',
      offset = 8,
      'aria-label': ariaLabel = '主导航',
      onEscapeKeyDown,
      className,
      classNames,
      ...rest
    },
    ref,
  ) => {
    const reactId = useId();
    const idBase = `ms-navmenu-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    // 受控 / 非受控 active。
    const isControlled = valueProp !== undefined;
    const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue);
    const activeValue = isControlled ? (valueProp ?? null) : uncontrolled;

    // 触发器节点表(键盘 roving 焦点用)与 hover 计时器。
    const triggerNodes = useRef<Map<string, HTMLElement | null>>(new Map());
    const hoverTimer = useRef<number | null>(null);
    const closingRef = useRef(false);

    // 结构性节点表(value/disabled/hasPanel)—— 状态机与 roving 的唯一真相源。
    // 数据驱动用 items 直接派生;复合用法由子组件(Trigger / Link)注册进 registry。
    // 用 ref 保存插入序(= DOM 序),供方向键 roving 正确取相邻项。
    const nodeRegistry = useRef<Map<string, NavMenuNode>>(new Map());

    // 数据驱动:items 是真相源,每次渲染同步进 registry(顺序与 items 一致)。
    const itemNodes = useMemo<NavMenuNode[] | null>(() => {
      if (!items) {
        return null;
      }
      return items.map((it) => ({
        value: it.value,
        disabled: it.disabled,
        hasPanel: it.content != null || (it.links != null && it.links.length > 0),
      }));
    }, [items]);

    if (itemNodes) {
      const next = new Map<string, NavMenuNode>();
      for (const n of itemNodes) {
        next.set(n.value, n);
      }
      nodeRegistry.current = next;
    }

    // 取当前有序节点数组(状态机 / roving 用)。
    const getNodes = useCallback((): NavMenuNode[] => [...nodeRegistry.current.values()], []);

    // itemNodes 的最新值放 ref,供 registerNode 判断当前是否数据驱动(避免闭包过期)。
    const itemNodesRef = useRef<NavMenuNode[] | null>(itemNodes);
    itemNodesRef.current = itemNodes;

    // 复合用法:子组件注册 / 注销结构性节点(value/disabled/hasPanel)。
    // 数据驱动模式(itemNodesRef.current 非空)下 registry 由 items 重建,此调用为 no-op,
    // 避免子组件挂载次序污染 items 派生的顺序。
    const registerNode = useCallback((node: NavMenuNode | { value: string; remove: true }) => {
      if (itemNodesRef.current) {
        return;
      }
      if ('remove' in node) {
        nodeRegistry.current.delete(node.value);
      } else {
        nodeRegistry.current.set(node.value, node);
      }
    }, []);

    const clearHoverTimer = useCallback(() => {
      if (hoverTimer.current !== null) {
        window.clearTimeout(hoverTimer.current);
        hoverTimer.current = null;
      }
    }, []);

    // 卸载清理。
    useEffect(() => clearHoverTimer, [clearHoverTimer]);

    const commitActive = useCallback(
      (next: string | null) => {
        if (next === activeValue) {
          return;
        }
        if (!isControlled) {
          setUncontrolled(next);
        }
        onValueChange?.(next);
      },
      [activeValue, isControlled, onValueChange],
    );

    const setActive = useCallback(
      (next: string | null, refocusTrigger = false) => {
        clearHoverTimer();
        commitActive(next);
        if (refocusTrigger && next === null && activeValue) {
          // 关闭回焦原触发器(Esc / 关闭场景)。
          triggerNodes.current.get(activeValue)?.focus();
        }
      },
      [clearHoverTimer, commitActive, activeValue],
    );

    // 点击 / 键盘 toggle:经状态机判定(纯链接项不开 panel)。
    const toggle = useCallback(
      (value: string) => {
        clearHoverTimer();
        const next = reduceActive(getNodes(), activeValue, { type: 'toggle', value });
        commitActive(next);
      },
      [clearHoverTimer, getNodes, activeValue, commitActive],
    );

    // hover 打开(走 hover-intent 防抖 / 即切)。
    const hoverOpen = useCallback(
      (value: string) => {
        if (!hoverable || !isActivatable(getNodes(), value)) {
          return;
        }
        clearHoverTimer();
        const plan = planHoverIntent({
          target: value,
          isAnyOpen: activeValue !== null,
          openDelay,
          closeDelay,
          switchDelay: 0,
        });
        if (plan.delay <= 0) {
          commitActive(plan.target);
        } else {
          hoverTimer.current = window.setTimeout(() => {
            commitActive(plan.target);
            hoverTimer.current = null;
          }, plan.delay);
        }
      },
      [hoverable, getNodes, activeValue, openDelay, closeDelay, clearHoverTimer, commitActive],
    );

    // hover 关闭(走 closeDelay 宽限)。
    const hoverClose = useCallback(() => {
      if (!hoverable) {
        return;
      }
      clearHoverTimer();
      const plan = planHoverIntent({
        target: null,
        isAnyOpen: activeValue !== null,
        openDelay,
        closeDelay,
      });
      hoverTimer.current = window.setTimeout(() => {
        commitActive(null);
        hoverTimer.current = null;
      }, plan.delay);
    }, [hoverable, clearHoverTimer, activeValue, openDelay, closeDelay, commitActive]);

    const cancelHover = useCallback(() => clearHoverTimer(), [clearHoverTimer]);

    const registerTrigger = useCallback((value: string, node: HTMLElement | null) => {
      if (node) {
        triggerNodes.current.set(value, node);
      } else {
        triggerNodes.current.delete(value);
      }
    }, []);

    const hasPanel = useCallback((value: string) => isActivatable(getNodes(), value), [getNodes]);

    // 触发器键盘:横向 roving + 打开。
    // 注:Esc 关闭统一交给根级全局监听(见上方 effect)单一路径处理,这里不再各自拦 Esc,
    // 避免「触发器拦一套、panel 内拦一套」两条并行路径将来漂移(原 finding #4)。
    const onTriggerKeyDown = useCallback(
      (e: ReactKeyboardEvent<HTMLElement>, value: string) => {
        const intent = resolveTriggerKey(e.key);
        if (!intent) {
          return;
        }
        const ns = getNodes();
        const curIndex = ns.findIndex((n) => n.value === value);
        if (intent.type === 'move') {
          e.preventDefault();
          const ni = nextEnabledIndex(ns, curIndex < 0 ? 0 : curIndex, intent.dir);
          const target = ns[ni];
          if (target) {
            triggerNodes.current.get(target.value)?.focus();
          }
        } else if (intent.type === 'edge') {
          e.preventDefault();
          const ni = edgeEnabledIndex(ns, intent.dir);
          if (ni >= 0) {
            const target = ns[ni];
            if (target) {
              triggerNodes.current.get(target.value)?.focus();
            }
          }
        } else if (intent.type === 'open') {
          // 仅对带 panel 的项拦截并打开;纯链接项放行(Enter 走原生导航)。
          if (isActivatable(ns, value)) {
            e.preventDefault();
            const next = reduceActive(ns, activeValue, { type: 'set', value });
            commitActive(next);
            // 下一帧把焦点移入 panel 第一个可聚焦元素。
            if (next) {
              requestAnimationFrame(() => {
                const panel = document.getElementById(`${idBase}-content-${value}`);
                focusFirstIn(panel);
              });
            }
          }
        }
      },
      [getNodes, activeValue, commitActive, idBase],
    );

    const ctx: NavMenuContextValue = useMemo(
      () => ({
        activeValue,
        tone,
        idBase,
        toggle,
        setActive,
        hoverOpen,
        hoverClose,
        cancelHover,
        hoverable,
        classNames,
        registerTrigger,
        registerNode,
        onTriggerKeyDown,
        hasPanel,
      }),
      [
        activeValue,
        tone,
        idBase,
        toggle,
        setActive,
        hoverOpen,
        hoverClose,
        cancelHover,
        hoverable,
        classNames,
        registerTrigger,
        registerNode,
        onTriggerKeyDown,
        hasPanel,
      ],
    );

    // onEscapeKeyDown 放 ref:这是内联 prop(每次渲染新引用),若进 effect 依赖会让全局监听反复
    // 解绑 / 重绑;用 ref 持有最新回调、收敛依赖(参考 Dropbox 落焦 effect 的稳定化手法)。
    const onEscapeKeyDownRef = useRef(onEscapeKeyDown);
    onEscapeKeyDownRef.current = onEscapeKeyDown;

    // panel 打开时:全局 Esc / 点外关闭(数据驱动 + 复合都覆盖)。
    // Esc 关闭走「单一路径」—— 统一由这里的全局监听处理(Trigger / Content / ViewportPanel 不再各自拦),
    // 避免两套并行路径将来漂移不一致(原 finding #4)。无论焦点在触发器还是 panel 内,都先调
    // onEscapeKeyDown 让父级可 preventDefault 拦截(原 finding #3:焦点在 panel 内时拦截失效)。
    useEffect(() => {
      if (activeValue === null) {
        return;
      }
      const onKey = (ev: KeyboardEvent) => {
        if (ev.key !== 'Escape') {
          return;
        }
        if (closingRef.current) {
          return;
        }
        // 把原生 KeyboardEvent 包成带 preventDefault 钩子的最小事件,喂给 onEscapeKeyDown。
        // 父级 preventDefault() 后即拦截关闭(无论焦点在触发器还是 panel 内,契约一致)。
        const cb = onEscapeKeyDownRef.current;
        if (cb) {
          let prevented = false;
          const wrapped = {
            ...(ev as object),
            key: ev.key,
            nativeEvent: ev,
            defaultPrevented: false,
            preventDefault: () => {
              prevented = true;
              ev.preventDefault();
            },
            stopPropagation: () => ev.stopPropagation(),
          } as unknown as ReactKeyboardEvent<HTMLElement>;
          cb(wrapped);
          if (prevented) {
            return;
          }
        }
        closingRef.current = true;
        const trig = triggerNodes.current.get(activeValue);
        commitActive(null);
        trig?.focus();
        requestAnimationFrame(() => {
          closingRef.current = false;
        });
      };
      const onPointerDown = (ev: PointerEvent) => {
        const target = ev.target as Node | null;
        const root = rootRef.current;
        if (root && target && root.contains(target)) {
          return;
        }
        commitActive(null);
      };
      document.addEventListener('keydown', onKey);
      document.addEventListener('pointerdown', onPointerDown, true);
      return () => {
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('pointerdown', onPointerDown, true);
      };
    }, [activeValue, commitActive]);

    const rootRef = useRef<HTMLElement | null>(null);
    const setRootRef = useCallback(
      (node: HTMLElement | null) => {
        rootRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as { current: HTMLElement | null }).current = node;
        }
      },
      [ref],
    );

    const rootClass = [
      'ms-navmenu',
      `ms-tone-${tone}`,
      viewport && 'ms-navmenu--viewport',
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(' ');

    const rootStyle: AnchorStyle = {
      '--ms-navmenu-offset': `${offset}px`,
    };

    // —— 数据驱动渲染 ——
    // panel 内容只渲染一处,避免重复 id:
    // - viewport 模式:内容收进共享 Viewport(下方),Item 里不再放 Content;
    // - 非 viewport:内容由 Item 内的 Content 就地渲染。
    const itemHasPanel = (it: NavMenuItem): boolean =>
      it.content != null || (it.links != null && it.links.length > 0);

    const dataDriven = items ? (
      <NavigationMenuList>
        {items.map((it) => {
          if (!itemHasPanel(it)) {
            // 纯链接项。
            return (
              <NavigationMenuItem key={it.value} value={it.value}>
                <NavigationMenuLink
                  href={it.href}
                  target={it.target}
                  rel={it.rel}
                  active={it.active}
                  disabled={it.disabled}
                  asTrigger
                  value={it.value}
                >
                  {it.icon != null && (
                    <span className="ms-navmenu__trigger-icon" aria-hidden="true">
                      {it.icon}
                    </span>
                  )}
                  {it.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          }
          return (
            <NavigationMenuItem key={it.value} value={it.value}>
              <NavigationMenuTrigger value={it.value} disabled={it.disabled}>
                {it.icon != null && (
                  <span className="ms-navmenu__trigger-icon" aria-hidden="true">
                    {it.icon}
                  </span>
                )}
                {it.label}
              </NavigationMenuTrigger>
              {!viewport && (
                <NavigationMenuContent value={it.value}>
                  {it.content ?? <LinkGridWithClose links={it.links ?? []} value={it.value} />}
                </NavigationMenuContent>
              )}
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    ) : (
      children
    );

    return (
      <NavMenuContext.Provider value={ctx}>
        <nav
          ref={setRootRef}
          aria-label={ariaLabel}
          data-ms-viewport-align={viewport ? viewportAlign : undefined}
          className={rootClass}
          style={rootStyle}
          {...rest}
        >
          {dataDriven}
          {viewport && items && (
            <NavigationMenuViewport align={viewportAlign}>
              {items.map((it) => {
                const panel =
                  it.content ??
                  (it.links ? <LinkGridWithClose links={it.links} value={it.value} /> : null);
                if (panel == null) {
                  return null;
                }
                return (
                  <ViewportPanel key={it.value} value={it.value}>
                    {panel}
                  </ViewportPanel>
                );
              })}
            </NavigationMenuViewport>
          )}
        </nav>
      </NavMenuContext.Provider>
    );
  },
);
NavigationMenuBase.displayName = 'NavigationMenu';

/** 把焦点送进容器里第一个可聚焦元素(panel 进入用)。 */
function focusFirstIn(container: HTMLElement | null): void {
  if (!container) {
    return;
  }
  const focusable = container.querySelector<HTMLElement>(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
  );
  focusable?.focus();
}

/* ——————————————————— 子组件:List ——————————————————— */

/** NavigationMenu.List —— 触发器横排容器(role=list 的 <ul>)。 */
const NavigationMenuList = forwardRef<HTMLUListElement, ComponentPropsWithoutRef<'ul'>>(
  ({ className, children, ...props }, ref) => {
    const ctx = useNavMenuContext('NavigationMenu.List');
    return (
      <ul
        ref={ref}
        className={['ms-navmenu__list', ctx.classNames?.list, className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </ul>
    );
  },
);
NavigationMenuList.displayName = 'NavigationMenu.List';

/* ——————————————————— 子组件:Item ——————————————————— */

export interface NavigationMenuItemProps
  extends Omit<ComponentPropsWithoutRef<'li'>, 'onPointerEnter' | 'onPointerLeave'> {
  /** 该项 value(必填,active / 受控标识)。 */
  value: string;
}

/** NavigationMenu.Item —— 单个导航项容器(<li>);承接 hover 进出的热区。 */
const NavigationMenuItem = forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  ({ value, className, children, ...props }, ref) => {
    const ctx = useNavMenuContext('NavigationMenu.Item');
    const isOpen = ctx.activeValue === value;
    return (
      <li
        ref={ref}
        data-value={value}
        data-state={isOpen ? 'open' : 'closed'}
        className={['ms-navmenu__item', ctx.classNames?.item, className].filter(Boolean).join(' ')}
        onPointerEnter={(e: ReactPointerEvent<HTMLLIElement>) => {
          // 仅鼠标 / 触控笔走 hover-intent;触屏(coarse)交点击,避免误开。
          if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
            if (ctx.hasPanel(value)) {
              ctx.hoverOpen(value);
            }
          }
        }}
        onPointerLeave={(e: ReactPointerEvent<HTMLLIElement>) => {
          if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
            ctx.hoverClose();
          }
        }}
        {...props}
      >
        {children}
      </li>
    );
  },
);
NavigationMenuItem.displayName = 'NavigationMenu.Item';

/* ——————————————————— 子组件:Trigger ——————————————————— */

export interface NavigationMenuTriggerProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'value'> {
  /** 关联的项 value。 */
  value: string;
  /** 是否禁用。 */
  disabled?: boolean | undefined;
}

/** NavigationMenu.Trigger —— 带 panel 的触发器(<button aria-expanded / aria-controls>)。 */
const NavigationMenuTrigger = forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  ({ value, disabled, className, children, onClick, onKeyDown, onKeyUp, ...props }, ref) => {
    const ctx = useNavMenuContext('NavigationMenu.Trigger');
    const isOpen = ctx.activeValue === value;
    const contentId = `${ctx.idBase}-content-${value}`;
    const triggerId = `${ctx.idBase}-trigger-${value}`;

    // 复合用法:注册结构性节点(触发器恒有 panel)。数据驱动模式下为 no-op。
    const { registerNode } = ctx;
    useEffect(() => {
      registerNode({ value, disabled, hasPanel: true });
      return () => registerNode({ value, remove: true });
    }, [registerNode, value, disabled]);

    // Space 修复:keydown 已把 'open' 意图处理掉(preventDefault + 打开 panel),
    // 但 <button> 的原生 click 在 keyup 才合成,keydown 的 preventDefault 不抑制它。
    // 标记一次「键盘已处理」,让随后那次合成 click 短路,避免把刚打开的 panel 又 toggle 关掉。
    const keyHandledRef = useRef(false);
    const keyClearRaf = useRef<number | null>(null);
    useEffect(
      () => () => {
        if (keyClearRaf.current !== null) {
          cancelAnimationFrame(keyClearRaf.current);
        }
      },
      [],
    );

    return (
      <button
        ref={composeRefs(ref, (node: HTMLButtonElement | null) => ctx.registerTrigger(value, node))}
        type="button"
        id={triggerId}
        data-state={isOpen ? 'open' : 'closed'}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-controls={isOpen ? contentId : undefined}
        className={['ms-navmenu__trigger', ctx.classNames?.trigger, className]
          .filter(Boolean)
          .join(' ')}
        onClick={composeEventHandlers(onClick, () => {
          // 由键盘(Space)合成的 click:keydown 已经打开 panel,这里短路避免 toggle 关回去。
          if (keyHandledRef.current) {
            keyHandledRef.current = false;
            return;
          }
          if (!disabled) {
            ctx.toggle(value);
          }
        })}
        onKeyDown={composeEventHandlers(onKeyDown, (e) => {
          // Space 在 keydown 即被 onTriggerKeyDown 当作 'open' 处理;标记让后续合成 click 短路。
          // (Enter 的合成 click 在 keydown 期间派发并已被 preventDefault 抑制,不会走到 onClick,无需标记。)
          if ((e.key === ' ' || e.key === 'Spacebar') && !disabled && ctx.hasPanel(value)) {
            keyHandledRef.current = true;
          }
          ctx.onTriggerKeyDown(e, value);
        })}
        onKeyUp={composeEventHandlers(onKeyUp, () => {
          // 兜底:若浏览器未合成 click(异常路径),在 keyup 后一帧清掉标记,避免污染下一次真实点击。
          // (Space 的合成 click 在 keyup 后派发,故用 rAF 推到 click 之后再清。)
          if (keyHandledRef.current && keyClearRaf.current === null) {
            keyClearRaf.current = requestAnimationFrame(() => {
              keyHandledRef.current = false;
              keyClearRaf.current = null;
            });
          }
        })}
        {...props}
      >
        {children}
        <span className="ms-navmenu__trigger-caret" aria-hidden="true">
          ▾
        </span>
      </button>
    );
  },
);
NavigationMenuTrigger.displayName = 'NavigationMenu.Trigger';

/* ——————————————————— 子组件:Link ——————————————————— */

export interface NavigationMenuLinkProps extends ComponentPropsWithoutRef<'a'> {
  /** 是否当前页(渲染 aria-current=page + active 态)。 */
  active?: boolean | undefined;
  /** asChild:渲染为子元素(如框架 Router 的 <Link>),把属性 / ref compose 进去。 */
  asChild?: boolean | undefined;
  /** 是否禁用。 */
  disabled?: boolean | undefined;
  /** 内部用:作为顶层导航项的链接(承接横向 roving 焦点注册与键盘)。 */
  asTrigger?: boolean | undefined;
  /** 内部用:asTrigger 时关联的项 value。 */
  value?: string | undefined;
}

/** NavigationMenu.Link —— 导航链接(active 态 aria-current=page)。可作顶层项或 panel 内链接。 */
const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  (
    {
      active,
      asChild = false,
      disabled,
      asTrigger = false,
      value,
      className,
      children,
      onClick,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const ctx = useNavMenuContext('NavigationMenu.Link');
    const cls = [
      asTrigger ? 'ms-navmenu__trigger ms-navmenu__trigger--link' : 'ms-navmenu__link',
      ctx.classNames?.link,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // 顶层链接项:复合用法注册结构性节点(纯链接,无 panel)。数据驱动模式为 no-op。
    const { registerNode } = ctx;
    useEffect(() => {
      if (!asTrigger || !value) {
        return;
      }
      registerNode({ value, disabled, hasPanel: false });
      return () => registerNode({ value, remove: true });
    }, [registerNode, asTrigger, value, disabled]);

    // 作为顶层项链接:注册到 roving + 接键盘(← → 在触发器/链接间移动)。
    const triggerRef =
      asTrigger && value
        ? composeRefs(ref as Ref<unknown>, (node: HTMLElement | null) =>
            ctx.registerTrigger(value, node),
          )
        : (ref as Ref<HTMLAnchorElement>);

    const handleKeyDown = composeEventHandlers(
      onKeyDown as ((e: ReactKeyboardEvent<HTMLElement>) => void) | undefined,
      (e: ReactKeyboardEvent<HTMLElement>) => {
        if (asTrigger && value) {
          ctx.onTriggerKeyDown(e, value);
        }
      },
    );

    const merged: Record<string, unknown> = {
      className: cls,
      'aria-current': active ? 'page' : undefined,
      'aria-disabled': disabled || undefined,
      'data-active': active || undefined,
      onClick,
      onKeyDown: handleKeyDown,
      ...props,
    };

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const childMerged = mergeAsChildProps(merged, child.props);
      return cloneElement(child, {
        ...childMerged,
        ref: composeRefs(triggerRef as Ref<unknown>, childRef),
      } as Record<string, unknown>);
    }

    return (
      <a ref={triggerRef as Ref<HTMLAnchorElement>} {...(merged as ComponentPropsWithoutRef<'a'>)}>
        {children}
      </a>
    );
  },
);
NavigationMenuLink.displayName = 'NavigationMenu.Link';

/* ——————————————————— 子组件:Content(就地 panel) ——————————————————— */

export interface NavigationMenuContentProps extends ComponentPropsWithoutRef<'div'> {
  /** 关联的项 value。 */
  value: string;
}

/**
 * NavigationMenu.Content —— 单项 panel 内容。
 * - viewport 模式:这里只是「声明」内容,实际由共享 Viewport 渲染(本组件渲染为空,
 *   内容被收集进 Viewport)。但为支持纯复合用法(无 Viewport),本组件也能就地渲染。
 * 此处实现的是「就地渲染」分支(viewport=false 或纯复合);数据驱动 viewport 模式走 ViewportPanel。
 */
const NavigationMenuContent = forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const ctx = useNavMenuContext('NavigationMenu.Content');
    const isOpen = ctx.activeValue === value;
    const contentId = `${ctx.idBase}-content-${value}`;
    const triggerId = `${ctx.idBase}-trigger-${value}`;

    if (!isOpen) {
      return null;
    }
    return (
      // role=group:让被 aria-labelledby 标注的 panel 成为非地标分组(不污染 landmark 树)。
      // Esc 关闭统一由根级全局监听处理(单一路径,见根组件 effect),这里不再各自拦 Esc。
      // biome-ignore lint/a11y/useSemanticElements: 导航 panel 是 ARIA group(非 fieldset),role=group 正确
      <div
        ref={ref}
        id={contentId}
        role="group"
        data-state="open"
        aria-labelledby={triggerId}
        className={['ms-navmenu__content', ctx.classNames?.content, className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  },
);
NavigationMenuContent.displayName = 'NavigationMenu.Content';

/* ——————————————————— 子组件:Viewport(共享浮层容器) ——————————————————— */

export interface NavigationMenuViewportProps extends ComponentPropsWithoutRef<'div'> {
  /** 对齐方式。 */
  align?: NavigationMenuViewportAlign;
}

/** NavigationMenu.Viewport —— 共享浮层容器,尺寸 / 位置随 active panel 用 CSS 过渡。 */
const NavigationMenuViewport = forwardRef<HTMLDivElement, NavigationMenuViewportProps>(
  ({ align = 'start', className, children, ...props }, ref) => {
    const ctx = useNavMenuContext('NavigationMenu.Viewport');
    const isOpen = ctx.activeValue !== null;
    return (
      <div
        ref={ref}
        data-state={isOpen ? 'open' : 'closed'}
        data-align={align}
        // 关闭时隐藏(不参与可达性遍历);打开时可见。
        hidden={!isOpen}
        className={['ms-navmenu__viewport', ctx.classNames?.viewport, className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <div className="ms-navmenu__viewport-inner">{children}</div>
      </div>
    );
  },
);
NavigationMenuViewport.displayName = 'NavigationMenu.Viewport';

/* ——————————————————— 内部:Viewport 里的单个 panel ——————————————————— */

function ViewportPanel({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}): ReactElement | null {
  const ctx = useNavMenuContext('NavigationMenu.Viewport');
  const isOpen = ctx.activeValue === value;
  const contentId = `${ctx.idBase}-content-${value}`;
  const triggerId = `${ctx.idBase}-trigger-${value}`;
  if (!isOpen) {
    return null;
  }
  return (
    // role=group:同 NavigationMenu.Content,被 trigger 标注的非地标分组。
    // Esc 关闭统一由根级全局监听处理(单一路径,见根组件 effect),这里不再各自拦 Esc。
    // biome-ignore lint/a11y/useSemanticElements: 导航 panel 是 ARIA group(非 fieldset),role=group 正确
    <div
      id={contentId}
      role="group"
      data-state="open"
      aria-labelledby={triggerId}
      className={['ms-navmenu__content', ctx.classNames?.content].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}

/** 内部:带「点击即关 panel」的链接网格(数据驱动 links 用)。 */
function LinkGridWithClose({
  links,
  value,
}: {
  links: NavMenuLink[];
  value: string;
}): ReactElement {
  const ctx = useNavMenuContext('NavigationMenu');
  return (
    <LinkGrid
      links={links}
      onNavigate={() => {
        // 同一项再点不抖动;选链接后关闭 panel。
        if (ctx.activeValue === value) {
          ctx.setActive(null);
        }
      }}
    />
  );
}

/* ——————————————————— 命名空间挂载 + 导出 ——————————————————— */

type NavigationMenuComponent = typeof NavigationMenuBase & {
  List: typeof NavigationMenuList;
  Item: typeof NavigationMenuItem;
  Trigger: typeof NavigationMenuTrigger;
  Link: typeof NavigationMenuLink;
  Content: typeof NavigationMenuContent;
  Viewport: typeof NavigationMenuViewport;
};

const NavigationMenuWithStatics = NavigationMenuBase as NavigationMenuComponent;
NavigationMenuWithStatics.List = NavigationMenuList;
NavigationMenuWithStatics.Item = NavigationMenuItem;
NavigationMenuWithStatics.Trigger = NavigationMenuTrigger;
NavigationMenuWithStatics.Link = NavigationMenuLink;
NavigationMenuWithStatics.Content = NavigationMenuContent;
NavigationMenuWithStatics.Viewport = NavigationMenuViewport;

/** NavigationMenu —— 带命名空间子组件(List / Item / Trigger / Link / Content / Viewport)。 */
export const NavigationMenu = NavigationMenuWithStatics;

export {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
};

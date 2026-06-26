/**
 * NavigationMenu 纯逻辑层 —— 零 React 依赖,可平移进 packages/core(vue / web-component 共用)。
 *
 * 负责三件事(都与 DOM / React 无关,只做数据 → 数据的派生):
 * 1. active 触发器状态机:在「一排触发器」里,根据键盘 / 指针意图算出下一个该激活(打开 panel)的项,
 *    或算出「无激活」(全关);同一时刻至多一个 panel 打开是状态机的不变式(单值 activeValue)。
 * 2. hover-intent 计时:openDelay / closeDelay 的纯计算 —— 给定「想打开 / 想关闭某项」的意图,
 *    返回应当延后执行的毫秒数与目标值,定时器的实际挂载交给框架壳(零副作用)。
 * 3. 横向 roving 与方向键意图解析:← / → 在触发器间移动,Home / End 跳首尾,跳过 disabled。
 *
 * 不变式:任意时刻 activeValue 至多一个;panel 打开 ⇔ 该项是 active 且其有 content。
 */

/** 单个导航项的「结构性」描述(逻辑层只关心 value / disabled / 是否带 panel,不碰渲染内容)。 */
export interface NavMenuNode {
  /** 唯一值,作为 active / 受控的标识。 */
  value: string;
  /** 是否禁用(不可聚焦、不可激活)。 */
  disabled?: boolean | undefined;
  /** 是否带下拉 panel(content)。纯链接项为 false。 */
  hasPanel?: boolean | undefined;
}

/**
 * 从 from 起按 dir 找下一个可用项索引(循环,跳过 disabled)。
 * 全禁用或仅自己可用时回退 from。横向触发器 roving 用。
 */
export function nextEnabledIndex(nodes: readonly NavMenuNode[], from: number, dir: 1 | -1): number {
  const n = nodes.length;
  if (n === 0) {
    return from;
  }
  for (let step = 1; step <= n; step += 1) {
    // + n * step 保证取模前非负(JS 负数取模会得负)。
    const i = (from + dir * step + n * step) % n;
    if (!nodes[i]?.disabled) {
      return i;
    }
  }
  return from;
}

/** 返回首个(dir=-1)或末个(dir=1)可用项索引;全禁用返回 -1。 */
export function edgeEnabledIndex(nodes: readonly NavMenuNode[], dir: 1 | -1): number {
  if (dir === 1) {
    for (let i = nodes.length - 1; i >= 0; i -= 1) {
      if (!nodes[i]?.disabled) {
        return i;
      }
    }
  } else {
    for (let i = 0; i < nodes.length; i += 1) {
      if (!nodes[i]?.disabled) {
        return i;
      }
    }
  }
  return -1;
}

/** 触发器横向方向键解析出的导航意图(与具体键值解耦)。 */
export type NavMenuMoveIntent =
  | { type: 'move'; dir: 1 | -1 }
  | { type: 'edge'; dir: 1 | -1 }
  | { type: 'open' }
  | null;

/**
 * 把触发器上的按键映射为意图(横向导航,LTR 语义):
 * - ← / → 在触发器间移动;Home / End 跳首 / 尾;
 * - ↓ / Enter / Space:打开当前项的 panel 并进入(由壳决定具体行为);
 * 返回 null 表示不拦截(交回浏览器默认,如 Tab)。
 */
export function resolveTriggerKey(key: string): NavMenuMoveIntent {
  switch (key) {
    case 'ArrowRight':
      return { type: 'move', dir: 1 };
    case 'ArrowLeft':
      return { type: 'move', dir: -1 };
    case 'Home':
      return { type: 'edge', dir: -1 };
    case 'End':
      return { type: 'edge', dir: 1 };
    case 'ArrowDown':
    case 'Enter':
    case ' ':
    case 'Spacebar':
      return { type: 'open' };
    default:
      return null;
  }
}

/**
 * active 状态机:给定当前 active 值与一个「目标值或意图」,算出下一个 active 值。
 * 不变式:返回值要么是某个可激活项的 value,要么是 null(全关)。
 *
 * - toggle(value):点同一个已 active 的项 → 关(null);点别的项 → 切到该项;
 *   目标项无 panel(纯链接)→ 不打开任何 panel,返回 null(链接交给原生导航)。
 * - disabled 项不可成为 active。
 */
export function reduceActive(
  nodes: readonly NavMenuNode[],
  current: string | null,
  action: { type: 'set'; value: string | null } | { type: 'toggle'; value: string },
): string | null {
  if (action.type === 'set') {
    if (action.value === null) {
      return null;
    }
    const node = nodes.find((n) => n.value === action.value);
    if (!node || node.disabled || !node.hasPanel) {
      return null;
    }
    return action.value;
  }
  // toggle
  const node = nodes.find((n) => n.value === action.value);
  if (!node || node.disabled || !node.hasPanel) {
    return null;
  }
  return current === action.value ? null : action.value;
}

/** hover-intent 的一次决策结果:延后多少毫秒后把 active 设为 target。 */
export interface HoverIntentPlan {
  /** 延后毫秒(0 = 立即)。 */
  delay: number;
  /** 计划达成后要设置的 active 值(null = 关闭)。 */
  target: string | null;
}

/**
 * hover-intent 计划:把「指针想打开 / 想关闭」转成「延后多少毫秒、设为什么值」。
 *
 * 关键的「宽限」规则(防止指针在触发器与 panel 之间穿越的瞬间误关):
 * - 想打开某项:若当前已有别的 panel 开着,几乎立即切换(用较短的 switchDelay,体验为「滑过即切」);
 *   若当前全关,用 openDelay 防抖(避免一扫而过就弹)。
 * - 想关闭(指针离开触发器 / panel 区域):一律用 closeDelay 宽限,给指针在两块热区间移动留时间。
 *
 * 纯计算:不挂定时器、不读时钟,壳层据此 setTimeout。
 */
export function planHoverIntent(params: {
  /** 意图:打开某项,或关闭(target=null)。 */
  target: string | null;
  /** 当前是否已有 panel 打开。 */
  isAnyOpen: boolean;
  /** 首次打开的防抖延时(ms)。 */
  openDelay: number;
  /** 关闭的宽限延时(ms)。 */
  closeDelay: number;
  /** 已有 panel 时切换到另一项的延时(ms),通常远小于 openDelay。 */
  switchDelay?: number | undefined;
}): HoverIntentPlan {
  const { target, isAnyOpen, openDelay, closeDelay, switchDelay = 0 } = params;
  if (target === null) {
    return { delay: Math.max(0, closeDelay), target: null };
  }
  // 想打开:已有面板开着 → 几乎即切;全关 → openDelay 防抖。
  const delay = isAnyOpen ? Math.max(0, switchDelay) : Math.max(0, openDelay);
  return { delay, target };
}

/** 判断 value 是否对应一个「可激活(有 panel 且未禁用)」的项。 */
export function isActivatable(nodes: readonly NavMenuNode[], value: string): boolean {
  const node = nodes.find((n) => n.value === value);
  return !!node && !node.disabled && !!node.hasPanel;
}

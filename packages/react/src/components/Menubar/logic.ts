/**
 * Menubar 纯逻辑层 —— 零 React 依赖,可平移进 packages/core(vue / web-component 等共用)。
 *
 * Menubar 是「横向一排顶级菜单触发器(文件 / 编辑 / 视图…),各自打开一个 Menu 面板」的应用菜单栏。
 * 菜单面板内部的拍平 / typeahead / 方向键复用 Menu/logic.ts;这里只放 Menubar 自己的派生:
 * - 顶层触发器之间的 roving 索引移动(←→ / Home / End,回绕)
 * - 「已打开某顶级菜单」时按 ←→ 切换到相邻菜单的打开态(ARIA APG menubar 行为)
 * - placement → CSS position-area 拆解(复用 Popover 语义,顶级菜单默认贴左下展开)
 *
 * 组件壳(Menubar.tsx)只负责把这些结果接到 DOM、焦点与原生 popover 上。
 */

/** 单个顶级菜单的「打开后落焦」意图 —— 决定菜单面板打开时焦点落在首项还是末项。 */
export type MenubarOpenIntent = 'first' | 'last' | 'none';

/**
 * 触发器禁用掩码:`disabled[i] === true` 表示第 i 个触发器被禁用、不可聚焦 / 不可打开。
 * 传入即让 roving / 相邻切换在禁用项处跳过(ARIA APG:roving 应跳过 disabled 项);
 * 不传(undefined)则视为全部可用,保持向后兼容。下标越界(noUncheckedIndexedAccess)按未禁用处理。
 */
export type MenubarDisabledMask = readonly boolean[] | undefined;

/** 第 i 个触发器是否被掩码标记为禁用(掩码缺省 / 越界 → false)。 */
function isTriggerDisabled(mask: MenubarDisabledMask, i: number): boolean {
  return mask?.[i] === true;
}

/**
 * 顶层触发器之间按方向键移动,返回下一个**可聚焦**触发器索引(始终回绕,菜单栏惯例首尾相接)。
 * total<=0 返回 -1;from 越界先夹取进合法区间再移动,容错调用方传脏索引。
 * 传入 disabled 掩码时跳过禁用触发器找下一个可用项;全部禁用(含 from 自身)则返回 -1
 * (避免把焦点 / 打开态落到不可聚焦的 disabled 触发器上)。
 * @param from 当前聚焦 / 激活的触发器索引。
 * @param dir 移动方向:1=下一个(→),-1=上一个(←)。
 * @param total 顶级菜单总数。
 * @param disabled 可选禁用掩码(长度应等于 total);缺省视为全可用。
 */
export function nextTriggerIndex(
  from: number,
  dir: 1 | -1,
  total: number,
  disabled?: MenubarDisabledMask,
): number {
  if (total <= 0) {
    return -1;
  }
  const clamped = from < 0 ? 0 : from >= total ? total - 1 : from;
  // 无掩码:纯模运算(向后兼容,单触发器回到自身)。
  if (disabled === undefined) {
    return (clamped + dir + total) % total;
  }
  // 有掩码:跳过禁用项找下一个**可用**索引。最多走 total-1 步(不回到起点);
  // 一圈内除自身外无可用项(全禁用,或仅自身可用)则返回 -1(撞墙,组件层据此不移焦)。
  let idx = clamped;
  for (let step = 0; step < total - 1; step += 1) {
    idx = (idx + dir + total) % total;
    if (!isTriggerDisabled(disabled, idx)) {
      return idx;
    }
  }
  return -1;
}

/**
 * 第一个**可用**触发器索引(从左向右找第一个未禁用项;全禁用 / 空则 -1)。
 * @param total 顶级菜单总数。
 * @param disabled 可选禁用掩码;缺省视为全可用,直接返回 0。
 */
export function firstTriggerIndex(total: number, disabled?: MenubarDisabledMask): number {
  for (let i = 0; i < total; i += 1) {
    if (!isTriggerDisabled(disabled, i)) {
      return i;
    }
  }
  return -1;
}

/**
 * 最后一个**可用**触发器索引(从右向左找第一个未禁用项;全禁用 / 空则 -1)。
 * @param total 顶级菜单总数。
 * @param disabled 可选禁用掩码;缺省视为全可用,直接返回 total-1。
 */
export function lastTriggerIndex(total: number, disabled?: MenubarDisabledMask): number {
  for (let i = total - 1; i >= 0; i -= 1) {
    if (!isTriggerDisabled(disabled, i)) {
      return i;
    }
  }
  return -1;
}

/**
 * Menubar 顶层键盘动作的语义判定结果 —— 组件壳据此驱动焦点 / 开合,而不必把 switch 写在组件里。
 */
export interface MenubarKeyResult {
  /** 该键是否被 Menubar 顶层逻辑消费(消费则组件应 preventDefault)。 */
  handled: boolean;
  /** 移动 / 打开后应聚焦或激活的目标触发器索引(-1 = 不变)。 */
  nextIndex: number;
  /** 是否请求打开 nextIndex 指向的菜单(↓/Enter/Space,或「已有菜单打开时 ←→ 切换」)。 */
  open: boolean;
  /** 若 open,菜单面板打开后焦点落点。 */
  intent: MenubarOpenIntent;
}

const NO_OP: MenubarKeyResult = { handled: false, nextIndex: -1, open: false, intent: 'none' };

/**
 * 顶层触发器上的键盘语义(ARIA APG menubar / menubutton):
 * - ←:移到上一个触发器(回绕);若当前已有菜单打开(anyOpen),则把打开态切到上一个(open=true)。
 * - →:移到下一个触发器(回绕);anyOpen 时切到下一个的打开态。
 * - Home / End:跳到首 / 尾触发器;anyOpen 时把打开态切过去。
 * - ↓ / Enter / Space:打开当前触发器的菜单并落焦首项(intent='first')。
 * - ↑:打开当前菜单并落焦末项(intent='last',与原生 menubutton 一致)。
 * 其它键返回 handled=false,交还组件(typeahead 等不在顶层处理)。
 *
 * @param key KeyboardEvent.key。
 * @param currentIndex 当前聚焦的触发器索引。
 * @param total 顶级菜单总数。
 * @param anyOpen 当前是否已有某个顶级菜单处于打开态(决定 ←→/Home/End 是「仅移焦」还是「切换打开态」)。
 * @param disabled 可选禁用掩码;传入时 ←→/Home/End 跳过禁用触发器(ARIA APG:roving 跳过 disabled),
 *   找不到可用目标(全禁用)时 nextIndex=-1,组件层据此「撞墙不动」而非把焦点丢到不可聚焦的禁用触发器。
 */
export function resolveMenubarKey(
  key: string,
  currentIndex: number,
  total: number,
  anyOpen: boolean,
  disabled?: MenubarDisabledMask,
): MenubarKeyResult {
  if (total <= 0) {
    return NO_OP;
  }
  switch (key) {
    case 'ArrowRight': {
      const nextIndex = nextTriggerIndex(currentIndex, 1, total, disabled);
      return { handled: true, nextIndex, open: anyOpen, intent: anyOpen ? 'first' : 'none' };
    }
    case 'ArrowLeft': {
      const nextIndex = nextTriggerIndex(currentIndex, -1, total, disabled);
      return { handled: true, nextIndex, open: anyOpen, intent: anyOpen ? 'first' : 'none' };
    }
    case 'Home': {
      const nextIndex = firstTriggerIndex(total, disabled);
      return { handled: true, nextIndex, open: anyOpen, intent: anyOpen ? 'first' : 'none' };
    }
    case 'End': {
      const nextIndex = lastTriggerIndex(total, disabled);
      return { handled: true, nextIndex, open: anyOpen, intent: anyOpen ? 'first' : 'none' };
    }
    case 'ArrowDown':
    case 'Enter':
    case ' ':
    case 'Spacebar':
      return { handled: true, nextIndex: currentIndex, open: true, intent: 'first' };
    case 'ArrowUp':
      return { handled: true, nextIndex: currentIndex, open: true, intent: 'last' };
    default:
      return NO_OP;
  }
}

/**
 * 菜单面板内按 ←→ 在「相邻顶级菜单」之间移动的派生(ARIA APG:菜单内 ← 关本菜单并打开左邻、
 * → 关本菜单并打开右邻——除非项自身有子菜单要展开,子菜单分支由组件层先判)。
 * 返回相邻触发器索引 + 打开意图(始终落焦首项)。
 * 传入 disabled 掩码时跳过禁用的相邻顶级菜单;找不到可用相邻项(全禁用)返回 nextIndex=-1,
 * 组件层据此保持当前菜单不动(不关当前 / 不移焦),避免「当前菜单被关、焦点落空、新菜单又不开」的死态。
 * @param currentIndex 当前打开的顶级菜单索引。
 * @param dir 1=右邻(→),-1=左邻(←)。
 * @param total 顶级菜单总数。
 * @param disabled 可选禁用掩码;缺省视为全可用。
 */
export function adjacentMenu(
  currentIndex: number,
  dir: 1 | -1,
  total: number,
  disabled?: MenubarDisabledMask,
): { nextIndex: number; intent: MenubarOpenIntent } {
  if (total <= 0) {
    return { nextIndex: -1, intent: 'none' };
  }
  const nextIndex = nextTriggerIndex(currentIndex, dir, total, disabled);
  return nextIndex < 0 ? { nextIndex: -1, intent: 'none' } : { nextIndex, intent: 'first' };
}

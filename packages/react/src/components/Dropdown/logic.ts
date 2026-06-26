/**
 * Dropdown 纯逻辑层 —— 零 React 依赖,可平移进 packages/core。
 *
 * Dropdown 是「trigger + Menu」的便捷封装,菜单的拍平 / typeahead / 方向键复用 Menu/logic.ts。
 * 这里只放 Dropdown 自己的派生:打开键判定、placement → Menu 主轴/对齐拆解、子菜单展开方位推导。
 * 组件壳(Dropdown.tsx)只负责把这些结果接到 DOM 与事件上。
 */

import type { MenuItem } from '../Menu/logic';

/**
 * Dropdown 菜单项 —— 在复用的 Menu `MenuItem` 上扩展一层子菜单 `submenu`。
 *
 * 复用 MenuItem 的所有字段(label / icon / onClick / disabled / danger / type='separator'/'group'
 * / checked / href …),便捷封装只额外加 `submenu`(一层),保证已落地的 Menu 渲染逻辑可直接吃这套数据。
 */
export interface DropdownItem extends MenuItem {
  /**
   * 子菜单项(一层)。给了非空数组的项会渲染为「有子菜单」入口:hover / → 展开二级菜单。
   * 深层(子菜单再带子菜单)暂不支持,见 Dropdown.tsx 的 TODO。
   */
  submenu?: DropdownItem[];
}

/** Dropdown 触发方式:点击 / 悬停。 */
export type DropdownTriggerAction = 'click' | 'hover';

/**
 * Dropdown 菜单方位(12 向,与 Popover 对齐)。便捷封装对外用这套语义,
 * 内部再拆成 Menu 的主轴(side)+ 交叉轴对齐(align)。
 */
export type DropdownPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

/** Menu 的主轴方位。 */
export type DropdownSide = 'top' | 'bottom' | 'left' | 'right';
/** Menu 的交叉轴对齐。 */
export type DropdownAlign = 'start' | 'center' | 'end';

/** placement 全部合法值(运行时校验 / 枚举遍历)。 */
export const DROPDOWN_PLACEMENTS: readonly DropdownPlacement[] = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
];

/** placement 非法时回退 'bottom-start'(下拉菜单默认贴左下展开)。 */
export function normalizeDropdownPlacement(placement: string | undefined): DropdownPlacement {
  if (placement && (DROPDOWN_PLACEMENTS as readonly string[]).includes(placement)) {
    return placement as DropdownPlacement;
  }
  return 'bottom-start';
}

/** placement → 主轴方位(菜单出现在 trigger 的哪一侧)。 */
export function placementToSide(placement: DropdownPlacement): DropdownSide {
  if (placement.startsWith('top')) return 'top';
  if (placement.startsWith('bottom')) return 'bottom';
  if (placement.startsWith('left')) return 'left';
  return 'right';
}

/** placement → 交叉轴对齐('center' | 'start' | 'end')。 */
export function placementToAlign(placement: DropdownPlacement): DropdownAlign {
  if (placement.endsWith('-start')) return 'start';
  if (placement.endsWith('-end')) return 'end';
  return 'center';
}

/**
 * 判定一个键是否应在 trigger 上「打开」下拉菜单。
 * - Enter / Space:激活按钮即开;
 * - ArrowDown:菜单在下方时开并落焦首项(原生 menu button 行为);
 * - ArrowUp:菜单在上方时开。
 * 返回 true 表示应打开(组件层据此 preventDefault + setOpen(true))。
 */
export function isOpenKey(key: string, side: DropdownSide): boolean {
  if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
    return true;
  }
  if (key === 'ArrowDown') {
    return side !== 'top';
  }
  if (key === 'ArrowUp') {
    return side === 'top';
  }
  return false;
}

/** 一个项是否带子菜单(有非空 submenu 子项)。 */
export function hasSubmenu(item: DropdownItem): boolean {
  return Array.isArray(item.submenu) && item.submenu.length > 0;
}

/**
 * 子菜单相对父项的展开方位:跟随父菜单主轴的「行内方向」。
 * 父菜单从左侧弹出(side==='left')时子菜单继续向左,否则一律向右(下拉菜单惯例)。
 * 深层(子菜单再嵌子菜单)暂不支持,见 Dropdown.tsx 的 TODO。
 */
export function submenuSide(parentSide: DropdownSide): 'left' | 'right' {
  return parentSide === 'left' ? 'left' : 'right';
}

import { describe, expect, it } from 'vitest';
import {
  type DropdownItem,
  hasSubmenu,
  isOpenKey,
  normalizeDropdownPlacement,
  placementToAlign,
  placementToSide,
  submenuSide,
} from './logic';

describe('Dropdown/logic', () => {
  describe('normalizeDropdownPlacement', () => {
    it('合法 placement 原样返回', () => {
      expect(normalizeDropdownPlacement('top-end')).toBe('top-end');
      expect(normalizeDropdownPlacement('right')).toBe('right');
    });
    it('非法 / undefined 回退 bottom-start', () => {
      expect(normalizeDropdownPlacement(undefined)).toBe('bottom-start');
      expect(normalizeDropdownPlacement('nope')).toBe('bottom-start');
    });
  });

  describe('placementToSide', () => {
    it('按主轴前缀拆主轴方位', () => {
      expect(placementToSide('top-start')).toBe('top');
      expect(placementToSide('bottom')).toBe('bottom');
      expect(placementToSide('left-end')).toBe('left');
      expect(placementToSide('right-start')).toBe('right');
    });
  });

  describe('placementToAlign', () => {
    it('按 -start / -end 后缀拆交叉轴对齐,无后缀为 center', () => {
      expect(placementToAlign('bottom-start')).toBe('start');
      expect(placementToAlign('bottom-end')).toBe('end');
      expect(placementToAlign('bottom')).toBe('center');
      expect(placementToAlign('top')).toBe('center');
    });
  });

  describe('isOpenKey', () => {
    it('Enter / Space 任意主轴都打开', () => {
      expect(isOpenKey('Enter', 'bottom')).toBe(true);
      expect(isOpenKey(' ', 'top')).toBe(true);
      expect(isOpenKey('Spacebar', 'right')).toBe(true);
    });
    it('↓ 在菜单非上方时打开;菜单在上方时 ↓ 不打开', () => {
      expect(isOpenKey('ArrowDown', 'bottom')).toBe(true);
      expect(isOpenKey('ArrowDown', 'top')).toBe(false);
    });
    it('↑ 仅在菜单上方时打开', () => {
      expect(isOpenKey('ArrowUp', 'top')).toBe(true);
      expect(isOpenKey('ArrowUp', 'bottom')).toBe(false);
    });
    it('其它键不打开', () => {
      expect(isOpenKey('a', 'bottom')).toBe(false);
      expect(isOpenKey('Escape', 'bottom')).toBe(false);
    });
  });

  describe('hasSubmenu', () => {
    it('有非空 submenu 数组才算带子菜单', () => {
      const withSub: DropdownItem = { label: 'a', submenu: [{ label: 'b' }] };
      expect(hasSubmenu(withSub)).toBe(true);
      expect(hasSubmenu({ label: 'a', submenu: [] })).toBe(false);
      expect(hasSubmenu({ label: 'a' })).toBe(false);
    });
  });

  describe('submenuSide', () => {
    it('父菜单从左弹出则子菜单也向左,否则向右', () => {
      expect(submenuSide('left')).toBe('left');
      expect(submenuSide('right')).toBe('right');
      expect(submenuSide('bottom')).toBe('right');
      expect(submenuSide('top')).toBe('right');
    });
  });
});

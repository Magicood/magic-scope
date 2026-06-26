import { describe, expect, it } from 'vitest';
import {
  adjacentMenu,
  firstTriggerIndex,
  lastTriggerIndex,
  nextTriggerIndex,
  resolveMenubarKey,
} from './logic';

describe('Menubar/logic · nextTriggerIndex', () => {
  it('正向移动到下一个', () => {
    expect(nextTriggerIndex(0, 1, 3)).toBe(1);
    expect(nextTriggerIndex(1, 1, 3)).toBe(2);
  });

  it('反向移动到上一个', () => {
    expect(nextTriggerIndex(2, -1, 3)).toBe(1);
    expect(nextTriggerIndex(1, -1, 3)).toBe(0);
  });

  it('到末尾向右回绕到首,到首向左回绕到末(菜单栏惯例首尾相接)', () => {
    expect(nextTriggerIndex(2, 1, 3)).toBe(0);
    expect(nextTriggerIndex(0, -1, 3)).toBe(2);
  });

  it('total<=0 返回 -1', () => {
    expect(nextTriggerIndex(0, 1, 0)).toBe(-1);
    expect(nextTriggerIndex(0, -1, -3)).toBe(-1);
  });

  it('from 越界先夹取进合法区间再移动(容错脏索引)', () => {
    expect(nextTriggerIndex(-5, 1, 3)).toBe(1); // 夹到 0 再 +1
    expect(nextTriggerIndex(99, -1, 3)).toBe(1); // 夹到 2 再 -1
    expect(nextTriggerIndex(99, 1, 3)).toBe(0); // 夹到 2 再 +1 回绕
  });

  it('单个触发器:任何方向都回到自身', () => {
    expect(nextTriggerIndex(0, 1, 1)).toBe(0);
    expect(nextTriggerIndex(0, -1, 1)).toBe(0);
  });
});

describe('Menubar/logic · first/lastTriggerIndex', () => {
  it('非空返回首尾,空返回 -1', () => {
    expect(firstTriggerIndex(3)).toBe(0);
    expect(lastTriggerIndex(3)).toBe(2);
    expect(firstTriggerIndex(0)).toBe(-1);
    expect(lastTriggerIndex(0)).toBe(-1);
  });
});

describe('Menubar/logic · resolveMenubarKey', () => {
  it('未打开任何菜单时 ←→ 仅移焦(open=false)', () => {
    const right = resolveMenubarKey('ArrowRight', 0, 3, false);
    expect(right).toEqual({ handled: true, nextIndex: 1, open: false, intent: 'none' });
    const left = resolveMenubarKey('ArrowLeft', 0, 3, false);
    expect(left).toEqual({ handled: true, nextIndex: 2, open: false, intent: 'none' });
  });

  it('已有菜单打开时 ←→ 切换到相邻菜单的打开态(open=true, intent=first)', () => {
    const right = resolveMenubarKey('ArrowRight', 1, 3, true);
    expect(right).toEqual({ handled: true, nextIndex: 2, open: true, intent: 'first' });
    const left = resolveMenubarKey('ArrowLeft', 1, 3, true);
    expect(left).toEqual({ handled: true, nextIndex: 0, open: true, intent: 'first' });
  });

  it('Home / End 跳首尾触发器;anyOpen 时把打开态切过去', () => {
    expect(resolveMenubarKey('Home', 2, 3, false)).toEqual({
      handled: true,
      nextIndex: 0,
      open: false,
      intent: 'none',
    });
    expect(resolveMenubarKey('End', 0, 3, true)).toEqual({
      handled: true,
      nextIndex: 2,
      open: true,
      intent: 'first',
    });
  });

  it('↓ / Enter / Space 打开当前菜单并落焦首项', () => {
    for (const key of ['ArrowDown', 'Enter', ' ', 'Spacebar']) {
      expect(resolveMenubarKey(key, 1, 3, false)).toEqual({
        handled: true,
        nextIndex: 1,
        open: true,
        intent: 'first',
      });
    }
  });

  it('↑ 打开当前菜单并落焦末项(与原生 menubutton 一致)', () => {
    expect(resolveMenubarKey('ArrowUp', 1, 3, false)).toEqual({
      handled: true,
      nextIndex: 1,
      open: true,
      intent: 'last',
    });
  });

  it('其它键不消费(handled=false),交还组件处理 typeahead 等', () => {
    expect(resolveMenubarKey('a', 0, 3, false).handled).toBe(false);
    expect(resolveMenubarKey('Tab', 0, 3, false).handled).toBe(false);
    expect(resolveMenubarKey('Escape', 0, 3, true).handled).toBe(false);
  });

  it('total<=0 一律不消费', () => {
    expect(resolveMenubarKey('ArrowRight', 0, 0, false).handled).toBe(false);
  });
});

describe('Menubar/logic · adjacentMenu', () => {
  it('菜单内 → 切右邻、← 切左邻,始终落焦首项', () => {
    expect(adjacentMenu(0, 1, 3)).toEqual({ nextIndex: 1, intent: 'first' });
    expect(adjacentMenu(0, -1, 3)).toEqual({ nextIndex: 2, intent: 'first' }); // 回绕
    expect(adjacentMenu(2, 1, 3)).toEqual({ nextIndex: 0, intent: 'first' }); // 回绕
  });

  it('total<=0 返回 -1 / none', () => {
    expect(adjacentMenu(0, 1, 0)).toEqual({ nextIndex: -1, intent: 'none' });
  });

  it('跳过禁用的相邻顶级菜单(#3:中间项 disabled 时越过它)', () => {
    // [0 可用, 1 禁用, 2 可用];从 0 向右应跳过 1 落到 2。
    const mask = [false, true, false];
    expect(adjacentMenu(0, 1, 3, mask)).toEqual({ nextIndex: 2, intent: 'first' });
    // 从 2 向右回绕跳过(无禁用)直接到 0。
    expect(adjacentMenu(2, 1, 3, mask)).toEqual({ nextIndex: 0, intent: 'first' });
  });

  it('相邻全为 disabled → nextIndex=-1 / none(组件层据此保持当前菜单不动)', () => {
    // 仅 index 0 可用,1/2 全禁用;从 0 任意方向都找不到可用相邻项。
    const mask = [false, true, true];
    expect(adjacentMenu(0, 1, 3, mask)).toEqual({ nextIndex: -1, intent: 'none' });
    expect(adjacentMenu(0, -1, 3, mask)).toEqual({ nextIndex: -1, intent: 'none' });
  });
});

describe('Menubar/logic · 禁用掩码 roving(#2)', () => {
  it('nextTriggerIndex 跳过禁用触发器找下一个可用项', () => {
    const mask = [false, true, false];
    // 从 0 向右跳过禁用的 1 → 2。
    expect(nextTriggerIndex(0, 1, 3, mask)).toBe(2);
    // 从 2 向左跳过禁用的 1 → 0。
    expect(nextTriggerIndex(2, -1, 3, mask)).toBe(0);
  });

  it('nextTriggerIndex 全禁用返回 -1(撞墙,不落到不可聚焦项)', () => {
    expect(nextTriggerIndex(0, 1, 3, [true, true, true])).toBe(-1);
    // 当前项可用、其余全禁用:无别的可用项 → -1。
    expect(nextTriggerIndex(0, 1, 3, [false, true, true])).toBe(-1);
  });

  it('firstTriggerIndex / lastTriggerIndex 跳过首尾禁用项', () => {
    const mask = [true, false, true];
    expect(firstTriggerIndex(3, mask)).toBe(1);
    expect(lastTriggerIndex(3, mask)).toBe(1);
    // 全禁用返回 -1。
    expect(firstTriggerIndex(3, [true, true, true])).toBe(-1);
    expect(lastTriggerIndex(3, [true, true, true])).toBe(-1);
  });

  it('缺省掩码(undefined)向后兼容:行为同无禁用', () => {
    expect(nextTriggerIndex(0, 1, 3)).toBe(1);
    expect(firstTriggerIndex(3)).toBe(0);
    expect(lastTriggerIndex(3)).toBe(2);
  });

  it('resolveMenubarKey 携带掩码时 ←→/Home/End 跳禁用,全撞墙 nextIndex=-1', () => {
    const mask = [false, true, false];
    // 已打开态下 → 跳过禁用 1 → 2(切换打开态)。
    expect(resolveMenubarKey('ArrowRight', 0, 3, true, mask)).toEqual({
      handled: true,
      nextIndex: 2,
      open: true,
      intent: 'first',
    });
    // Home 跳过禁用首项落到首个可用项。
    expect(resolveMenubarKey('Home', 2, 3, false, [true, false, false]).nextIndex).toBe(1);
    // End 跳过禁用尾项落到末个可用项。
    expect(resolveMenubarKey('End', 0, 3, false, [false, false, true]).nextIndex).toBe(1);
    // 全禁用:仅移焦的 ←→ nextIndex=-1。
    expect(resolveMenubarKey('ArrowRight', 0, 3, false, [false, true, true]).nextIndex).toBe(-1);
  });
});

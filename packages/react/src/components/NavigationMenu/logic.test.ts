import { describe, expect, it } from 'vitest';
import {
  edgeEnabledIndex,
  isActivatable,
  type NavMenuNode,
  nextEnabledIndex,
  planHoverIntent,
  reduceActive,
  resolveTriggerKey,
} from './logic';

const nodes = (
  spec: Array<[value: string, disabled?: boolean, hasPanel?: boolean]>,
): NavMenuNode[] => spec.map(([value, disabled, hasPanel]) => ({ value, disabled, hasPanel }));

describe('nextEnabledIndex', () => {
  const ns = nodes([['a'], ['b', true], ['c'], ['d']]);

  it('正向移动跳过 disabled', () => {
    expect(nextEnabledIndex(ns, 0, 1)).toBe(2); // a -> (跳过 b) -> c
  });

  it('反向移动跳过 disabled', () => {
    expect(nextEnabledIndex(ns, 2, -1)).toBe(0); // c -> (跳过 b) -> a
  });

  it('到末尾正向循环回首个可用', () => {
    expect(nextEnabledIndex(ns, 3, 1)).toBe(0); // d -> 回绕 a
  });

  it('到首个反向循环回末个可用', () => {
    expect(nextEnabledIndex(ns, 0, -1)).toBe(3); // a -> 回绕 d
  });

  it('空列表回退 from', () => {
    expect(nextEnabledIndex([], 0, 1)).toBe(0);
  });

  it('全禁用回退 from', () => {
    expect(
      nextEnabledIndex(
        nodes([
          ['a', true],
          ['b', true],
        ]),
        0,
        1,
      ),
    ).toBe(0);
  });
});

describe('edgeEnabledIndex', () => {
  it('dir=-1 取首个可用(跳过开头的 disabled)', () => {
    expect(edgeEnabledIndex(nodes([['a', true], ['b'], ['c']]), -1)).toBe(1);
  });

  it('dir=1 取末个可用(跳过结尾的 disabled)', () => {
    expect(edgeEnabledIndex(nodes([['a'], ['b'], ['c', true]]), 1)).toBe(1);
  });

  it('全禁用返回 -1', () => {
    expect(edgeEnabledIndex(nodes([['a', true]]), 1)).toBe(-1);
  });
});

describe('resolveTriggerKey', () => {
  it('← → 解析为移动', () => {
    expect(resolveTriggerKey('ArrowRight')).toEqual({ type: 'move', dir: 1 });
    expect(resolveTriggerKey('ArrowLeft')).toEqual({ type: 'move', dir: -1 });
  });

  it('Home / End 解析为端点', () => {
    expect(resolveTriggerKey('Home')).toEqual({ type: 'edge', dir: -1 });
    expect(resolveTriggerKey('End')).toEqual({ type: 'edge', dir: 1 });
  });

  it('↓ / Enter / Space 解析为打开', () => {
    expect(resolveTriggerKey('ArrowDown')).toEqual({ type: 'open' });
    expect(resolveTriggerKey('Enter')).toEqual({ type: 'open' });
    expect(resolveTriggerKey(' ')).toEqual({ type: 'open' });
    expect(resolveTriggerKey('Spacebar')).toEqual({ type: 'open' });
  });

  it('其它键不拦截(返回 null)', () => {
    expect(resolveTriggerKey('Tab')).toBeNull();
    expect(resolveTriggerKey('a')).toBeNull();
    expect(resolveTriggerKey('ArrowUp')).toBeNull();
  });
});

describe('reduceActive', () => {
  const ns = nodes([
    ['home', false, false], // 纯链接,无 panel
    ['products', false, true],
    ['company', false, true],
    ['dead', true, true], // 禁用
  ]);

  it('toggle 同一已打开项 → 关闭(null)', () => {
    expect(reduceActive(ns, 'products', { type: 'toggle', value: 'products' })).toBeNull();
  });

  it('toggle 切换到另一带 panel 项', () => {
    expect(reduceActive(ns, 'products', { type: 'toggle', value: 'company' })).toBe('company');
  });

  it('toggle 纯链接项不打开 panel(返回 null)', () => {
    expect(reduceActive(ns, null, { type: 'toggle', value: 'home' })).toBeNull();
  });

  it('toggle 禁用项不打开', () => {
    expect(reduceActive(ns, null, { type: 'toggle', value: 'dead' })).toBeNull();
  });

  it('toggle 不存在的 value 返回 null', () => {
    expect(reduceActive(ns, 'products', { type: 'toggle', value: 'ghost' })).toBeNull();
  });

  it('set 到带 panel 项打开它', () => {
    expect(reduceActive(ns, null, { type: 'set', value: 'company' })).toBe('company');
  });

  it('set null 强制关闭', () => {
    expect(reduceActive(ns, 'company', { type: 'set', value: null })).toBeNull();
  });

  it('set 到纯链接项返回 null(不开 panel)', () => {
    expect(reduceActive(ns, null, { type: 'set', value: 'home' })).toBeNull();
  });
});

describe('planHoverIntent', () => {
  it('全关时打开走 openDelay 防抖', () => {
    const plan = planHoverIntent({
      target: 'a',
      isAnyOpen: false,
      openDelay: 200,
      closeDelay: 300,
    });
    expect(plan).toEqual({ delay: 200, target: 'a' });
  });

  it('已有 panel 时切换走 switchDelay(即切)', () => {
    const plan = planHoverIntent({
      target: 'b',
      isAnyOpen: true,
      openDelay: 200,
      closeDelay: 300,
      switchDelay: 0,
    });
    expect(plan).toEqual({ delay: 0, target: 'b' });
  });

  it('关闭(target=null)走 closeDelay 宽限', () => {
    const plan = planHoverIntent({
      target: null,
      isAnyOpen: true,
      openDelay: 200,
      closeDelay: 300,
    });
    expect(plan).toEqual({ delay: 300, target: null });
  });

  it('负延时被夹到 0', () => {
    expect(
      planHoverIntent({ target: 'a', isAnyOpen: false, openDelay: -50, closeDelay: 0 }).delay,
    ).toBe(0);
    expect(
      planHoverIntent({ target: null, isAnyOpen: true, openDelay: 0, closeDelay: -10 }).delay,
    ).toBe(0);
  });
});

describe('isActivatable', () => {
  const ns = nodes([
    ['link', false, false],
    ['panel', false, true],
    ['disabledPanel', true, true],
  ]);

  it('带 panel 且未禁用 → true', () => {
    expect(isActivatable(ns, 'panel')).toBe(true);
  });

  it('纯链接 → false', () => {
    expect(isActivatable(ns, 'link')).toBe(false);
  });

  it('禁用即便带 panel → false', () => {
    expect(isActivatable(ns, 'disabledPanel')).toBe(false);
  });

  it('不存在的 value → false', () => {
    expect(isActivatable(ns, 'ghost')).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import {
  computeEnterIntent,
  computeLeaveIntent,
  HOVER_CARD_PLACEMENTS,
  isNativelyFocusable,
  normalizePlacement,
  placementToAlign,
  placementToArea,
  placementToSide,
  resolveOpen,
} from './logic';

describe('placementToSide', () => {
  it('四主轴各变体都归到正确主轴', () => {
    expect(placementToSide('top')).toBe('top');
    expect(placementToSide('top-start')).toBe('top');
    expect(placementToSide('top-end')).toBe('top');
    expect(placementToSide('bottom-start')).toBe('bottom');
    expect(placementToSide('left-end')).toBe('left');
    expect(placementToSide('right')).toBe('right');
  });
});

describe('placementToAlign', () => {
  it('-start / -end 后缀映射到 start / end,无后缀为 center', () => {
    expect(placementToAlign('top')).toBe('center');
    expect(placementToAlign('bottom-start')).toBe('start');
    expect(placementToAlign('right-end')).toBe('end');
  });
});

describe('placementToArea', () => {
  it('每个合法 placement 都给出非空 position-area,且全部唯一', () => {
    const areas = HOVER_CARD_PLACEMENTS.map(placementToArea);
    for (const area of areas) {
      expect(area.length).toBeGreaterThan(0);
    }
    // 12 向应映射到 12 个不同的 position-area 关键字组合
    expect(new Set(areas).size).toBe(HOVER_CARD_PLACEMENTS.length);
  });

  it('居中向横向 / 纵向跨满', () => {
    expect(placementToArea('top')).toBe('block-start span-inline');
    expect(placementToArea('bottom')).toBe('block-end span-inline');
    expect(placementToArea('left')).toBe('inline-start span-block');
    expect(placementToArea('right')).toBe('inline-end span-block');
  });
});

describe('normalizePlacement', () => {
  it('合法值原样返回', () => {
    expect(normalizePlacement('top-end')).toBe('top-end');
    expect(normalizePlacement('right')).toBe('right');
  });

  it('非法 / 空值回退 bottom', () => {
    expect(normalizePlacement(undefined)).toBe('bottom');
    expect(normalizePlacement('')).toBe('bottom');
    expect(normalizePlacement('diagonal')).toBe('bottom');
    expect(normalizePlacement('TOP')).toBe('bottom');
  });
});

describe('resolveOpen', () => {
  it('受控值存在时优先于内部态', () => {
    expect(resolveOpen(true, false)).toBe(true);
    expect(resolveOpen(false, true)).toBe(false);
  });

  it('受控值为 undefined 时取内部态', () => {
    expect(resolveOpen(undefined, true)).toBe(true);
    expect(resolveOpen(undefined, false)).toBe(false);
  });
});

describe('computeEnterIntent', () => {
  it('进入 trigger / content 都该打开,带 openDelay', () => {
    expect(computeEnterIntent('trigger', 700)).toEqual({ next: true, delay: 700 });
    expect(computeEnterIntent('content', 0)).toEqual({ next: true, delay: 0 });
  });

  it('进入 outside 无动作', () => {
    expect(computeEnterIntent('outside', 700)).toEqual({ next: null, delay: 0 });
  });

  it('负延时被夹到 0', () => {
    expect(computeEnterIntent('trigger', -100)).toEqual({ next: true, delay: 0 });
  });
});

describe('computeLeaveIntent (桥接 / 宽限)', () => {
  it('从 trigger 移向 content(桥接)不关闭', () => {
    expect(computeLeaveIntent('trigger', 'content', 300)).toEqual({ next: null, delay: 0 });
  });

  it('从 content 移回 trigger(桥接)不关闭', () => {
    expect(computeLeaveIntent('content', 'trigger', 300)).toEqual({ next: null, delay: 0 });
  });

  it('从 trigger 移向 outside 安排关闭,带 closeDelay 宽限', () => {
    expect(computeLeaveIntent('trigger', 'outside', 300)).toEqual({ next: false, delay: 300 });
  });

  it('从 content 移向 outside 安排关闭', () => {
    expect(computeLeaveIntent('content', 'outside', 250)).toEqual({ next: false, delay: 250 });
  });

  it('去向落在同一活跃区(content→content,卡内子元素间移动)不关闭', () => {
    expect(computeLeaveIntent('content', 'content', 300)).toEqual({ next: null, delay: 0 });
  });

  it('from 为 outside 时不产生任何动作', () => {
    expect(computeLeaveIntent('outside', 'outside', 300)).toEqual({ next: null, delay: 0 });
  });

  it('负 closeDelay 被夹到 0', () => {
    expect(computeLeaveIntent('trigger', 'outside', -50)).toEqual({ next: false, delay: 0 });
  });
});

describe('isNativelyFocusable (#3 trigger tabindex 兜底判定)', () => {
  it('原生可聚焦标签判为可聚焦,无需注入 tabindex', () => {
    expect(isNativelyFocusable('button', {})).toBe(true);
    expect(isNativelyFocusable('input', {})).toBe(true);
    expect(isNativelyFocusable('select', {})).toBe(true);
    expect(isNativelyFocusable('textarea', {})).toBe(true);
  });

  it('<a> 仅在带 href 时原生可聚焦,缺 href 时判为不可聚焦', () => {
    expect(isNativelyFocusable('a', { href: '/u/ada' })).toBe(true);
    expect(isNativelyFocusable('a', {})).toBe(false);
  });

  it('非可聚焦原生标签(span / div)判为不可聚焦 → 需注入 tabindex', () => {
    expect(isNativelyFocusable('span', {})).toBe(false);
    expect(isNativelyFocusable('div', {})).toBe(false);
  });

  it('自定义组件(type 非字符串)保守判为不可聚焦', () => {
    const Avatar = () => null;
    expect(isNativelyFocusable(Avatar, {})).toBe(false);
  });

  it('用户已显式给数值 tabIndex 时尊重其意图(判为可聚焦,不再覆盖)', () => {
    expect(isNativelyFocusable('span', { tabIndex: 0 })).toBe(true);
    expect(isNativelyFocusable('span', { tabIndex: -1 })).toBe(true);
  });
});

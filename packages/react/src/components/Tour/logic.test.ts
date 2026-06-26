import { describe, expect, it } from 'vitest';
import {
  clampStepIndex,
  placementForStep,
  type RectLike,
  resolveStep,
  spotlightRect,
  type ViewportSize,
} from './logic';

const VP: ViewportSize = { width: 1000, height: 800 };

describe('clampStepIndex', () => {
  it('正常索引原样返回', () => {
    expect(clampStepIndex(2, 5)).toBe(2);
    expect(clampStepIndex(0, 5)).toBe(0);
    expect(clampStepIndex(4, 5)).toBe(4);
  });

  it('越界夹到边界', () => {
    expect(clampStepIndex(-3, 5)).toBe(0);
    expect(clampStepIndex(99, 5)).toBe(4);
  });

  it('total <= 0 或 NaN 回 0', () => {
    expect(clampStepIndex(3, 0)).toBe(0);
    expect(clampStepIndex(3, -1)).toBe(0);
    expect(clampStepIndex(Number.NaN, 5)).toBe(0);
  });

  it('小数向下取整', () => {
    expect(clampStepIndex(2.9, 5)).toBe(2);
  });
});

describe('resolveStep', () => {
  it('null / undefined / 空串 → null', () => {
    expect(resolveStep(null)).toBeNull();
    expect(resolveStep(undefined)).toBeNull();
    expect(resolveStep('   ')).toBeNull();
  });

  it('函数取值器：返回元素 / 返回 null / 抛错都不崩', () => {
    const el = {} as Element;
    expect(resolveStep(() => el)).toBe(el);
    expect(resolveStep(() => null)).toBeNull();
    expect(
      resolveStep(() => {
        throw new Error('boom');
      }),
    ).toBeNull();
  });

  it('selector 字符串：命中 / 未命中 / 非法选择器', () => {
    const found = {} as Element;
    const root = {
      querySelector: (sel: string) => {
        if (sel === '.bad[') throw new SyntaxError('invalid');
        return sel === '#ok' ? found : null;
      },
    } as unknown as Element;
    expect(resolveStep('#ok', root)).toBe(found);
    expect(resolveStep('#miss', root)).toBeNull();
    expect(resolveStep('.bad[', root)).toBeNull(); // 非法选择器吞掉
  });
});

describe('spotlightRect', () => {
  const rect: RectLike = { top: 100, left: 200, width: 50, height: 30 };

  it('padding=0 原样', () => {
    expect(spotlightRect(rect, 0)).toEqual({ top: 100, left: 200, width: 50, height: 30 });
  });

  it('数字 padding 四向外扩', () => {
    expect(spotlightRect(rect, 8)).toEqual({ top: 92, left: 192, width: 66, height: 46 });
  });

  it('分向 padding 对象', () => {
    expect(spotlightRect(rect, { top: 4, left: 10 })).toEqual({
      top: 96,
      left: 190,
      width: 60,
      height: 34,
    });
  });

  it('提供视口时把洞夹进视口，宽高非负', () => {
    // 目标贴左上角 + 大 padding：洞被夹到 (0,0)，宽高相应收缩
    const corner: RectLike = { top: 2, left: 2, width: 20, height: 20 };
    const out = spotlightRect(corner, 10, VP);
    expect(out.top).toBe(0);
    expect(out.left).toBe(0);
    expect(out.width).toBeGreaterThanOrEqual(0);
    expect(out.height).toBeGreaterThanOrEqual(0);
  });

  it('完全在视口外的目标宽高夹到 0，不出负值', () => {
    const off: RectLike = { top: 2000, left: 2000, width: 10, height: 10 };
    const out = spotlightRect(off, 0, VP);
    expect(out.width).toBe(0);
    expect(out.height).toBe(0);
  });
});

describe('placementForStep', () => {
  it('显式 placement 优先（含 center）', () => {
    const rect: RectLike = { top: 10, left: 10, width: 10, height: 10 };
    expect(placementForStep({ placement: 'left' }, rect, VP)).toBe('left');
    expect(placementForStep({ placement: 'center' }, rect, VP)).toBe('center');
  });

  it('无目标 rect → center', () => {
    expect(placementForStep({}, null, VP)).toBe('center');
  });

  it('目标在顶部 → 卡片放下方', () => {
    const top: RectLike = { top: 20, left: 400, width: 100, height: 40 };
    expect(placementForStep({}, top, VP)).toBe('bottom');
  });

  it('目标在底部 → 卡片放上方', () => {
    const bottom: RectLike = { top: 740, left: 400, width: 100, height: 40 };
    expect(placementForStep({}, bottom, VP)).toBe('top');
  });

  it('竖向被占满、横向更宽裕 → 走左右且择空间更大一侧', () => {
    // 几乎占满整个高度，靠左：右侧空间远大于左侧 → right
    const tall: RectLike = { top: 0, left: 0, width: 60, height: 800 };
    expect(placementForStep({}, tall, VP)).toBe('right');
    // 靠右：左侧空间更大 → left
    const tallRight: RectLike = { top: 0, left: 940, width: 60, height: 800 };
    expect(placementForStep({}, tallRight, VP)).toBe('left');
  });
});

import { describe, expect, it } from 'vitest';
import { clamp, computeThumb, isOverflowing, scrollPosFromThumb, scrollValueNow } from './logic';

describe('clamp', () => {
  it('夹在区间内的值原样返回', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('低于下界返回下界,高于上界返回上界', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it('min>max 退化为 min(保证有界,不返回非法值)', () => {
    expect(clamp(5, 10, 0)).toBe(10);
  });
});

describe('isOverflowing', () => {
  it('内容比可视区大出 1px 以上算溢出', () => {
    expect(isOverflowing(100, 200)).toBe(true);
  });

  it('内容等于可视区不算溢出', () => {
    expect(isOverflowing(100, 100)).toBe(false);
  });

  it('仅大出不到 1px(浮点误差)不算溢出', () => {
    expect(isOverflowing(100, 100.4)).toBe(false);
  });
});

describe('computeThumb', () => {
  it('内容不溢出时 thumb 填满 track 且不偏移', () => {
    const { thumbSize, thumbPos } = computeThumb(100, 100, 0);
    expect(thumbSize).toBe(100);
    expect(thumbPos).toBe(0);
  });

  it('thumb 尺寸 = viewport/content 比例 × track', () => {
    // viewport 100, content 400 → ratio 0.25 → thumb 25
    const { thumbSize } = computeThumb(100, 400, 0);
    expect(thumbSize).toBeCloseTo(25);
  });

  it('滚到顶部 thumbPos 为 0,滚到底部贴到轨道末端', () => {
    // content 400, viewport 100 → maxScroll 300, thumb 25, travel 75
    expect(computeThumb(100, 400, 0).thumbPos).toBeCloseTo(0);
    expect(computeThumb(100, 400, 300).thumbPos).toBeCloseTo(75);
  });

  it('滚到中点 thumb 居中', () => {
    // maxScroll 300 的一半 150 → progress 0.5 → travel 75 × 0.5 = 37.5
    expect(computeThumb(100, 400, 150).thumbPos).toBeCloseTo(37.5);
  });

  it('超长内容下 thumb 不短于 minThumb', () => {
    // viewport 100, content 100000 → ratio 0.001 → 原始 thumb 0.1,被夹到 minThumb 20
    expect(computeThumb(100, 100000, 0, 20).thumbSize).toBe(20);
  });

  it('minThumb 大于 viewport 时不超过 viewport(轨道本身上限)', () => {
    expect(computeThumb(30, 100000, 0, 50).thumbSize).toBe(30);
  });

  it('scrollPos 越界(超过 maxScroll)被夹住,thumbPos 不溢出轨道', () => {
    const { thumbSize, thumbPos } = computeThumb(100, 400, 99999);
    expect(thumbPos).toBeCloseTo(100 - thumbSize);
  });

  it('viewport<=0 退化为零 thumb', () => {
    expect(computeThumb(0, 400, 0)).toEqual({ thumbSize: 0, thumbPos: 0 });
  });
});

describe('scrollPosFromThumb', () => {
  it('thumbPos 0 → scrollPos 0', () => {
    expect(scrollPosFromThumb(100, 400, 0, 25)).toBeCloseTo(0);
  });

  it('thumb 拖到轨道末端 → scrollPos = maxScroll', () => {
    // travel = 100-25 = 75 → 拖到 75 → progress 1 → scrollPos 300
    expect(scrollPosFromThumb(100, 400, 75, 25)).toBeCloseTo(300);
  });

  it('与 computeThumb 互逆:由 scrollPos 算 thumb 再反算回原 scrollPos', () => {
    const scroll = 150;
    const { thumbSize, thumbPos } = computeThumb(100, 400, scroll);
    expect(scrollPosFromThumb(100, 400, thumbPos, thumbSize)).toBeCloseTo(scroll);
  });

  it('内容不溢出时反算恒为 0', () => {
    expect(scrollPosFromThumb(100, 100, 30, 100)).toBe(0);
  });

  it('thumbPos 越界被夹住,scrollPos 不超过 maxScroll', () => {
    expect(scrollPosFromThumb(100, 400, 9999, 25)).toBeCloseTo(300);
  });
});

describe('scrollValueNow', () => {
  it('顶部 0、底部 100、中点约 50', () => {
    expect(scrollValueNow(100, 400, 0)).toBe(0);
    expect(scrollValueNow(100, 400, 300)).toBe(100);
    expect(scrollValueNow(100, 400, 150)).toBe(50);
  });

  it('不可滚动(内容不溢出)返回 0', () => {
    expect(scrollValueNow(100, 100, 0)).toBe(0);
  });
});

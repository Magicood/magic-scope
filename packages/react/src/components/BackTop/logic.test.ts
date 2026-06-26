// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { easeInOutCubic, getScrollTop, scrollStep, shouldShow } from './logic';

describe('easeInOutCubic', () => {
  it('端点固定:0→0、1→1、0.5→0.5(对称)', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 10);
  });

  it('越界自动夹取到 [0,1]', () => {
    expect(easeInOutCubic(-0.5)).toBe(0);
    expect(easeInOutCubic(2)).toBe(1);
  });

  it('单调递增且前段慢(缓入)', () => {
    expect(easeInOutCubic(0.25)).toBeLessThan(0.25);
    expect(easeInOutCubic(0.1)).toBeLessThan(easeInOutCubic(0.2));
    expect(easeInOutCubic(0.75)).toBeGreaterThan(0.75);
  });
});

describe('scrollStep', () => {
  it('elapsed=0 返回起点;elapsed>=duration 返回 0(到顶)', () => {
    expect(scrollStep(1000, 0, 450)).toBe(1000);
    expect(scrollStep(1000, 450, 450)).toBe(0);
    expect(scrollStep(1000, 999, 450)).toBe(0);
  });

  it('duration<=0 直接归 0(瞬时)', () => {
    expect(scrollStep(1000, 0, 0)).toBe(0);
    expect(scrollStep(1000, 10, -5)).toBe(0);
  });

  it('中途位置在 (0, start) 之间且随时间递减', () => {
    const mid = scrollStep(1000, 225, 450);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1000);
    const later = scrollStep(1000, 360, 450);
    expect(later).toBeLessThan(mid);
  });
});

describe('shouldShow', () => {
  it('严格大于阈值才显示', () => {
    expect(shouldShow(401, 400)).toBe(true);
    expect(shouldShow(400, 400)).toBe(false);
    expect(shouldShow(0, 400)).toBe(false);
  });
});

describe('getScrollTop', () => {
  it('元素(无 document)读 scrollTop', () => {
    const el = { scrollTop: 321 } as unknown as HTMLElement;
    expect(getScrollTop(el)).toBe(321);
  });

  it('Window(带 document)优先取 scrollY', () => {
    const win = { document: {}, scrollY: 88, pageYOffset: 0 } as unknown as Window;
    expect(getScrollTop(win)).toBe(88);
  });

  it('Window 缺 scrollY 时退化到 documentElement.scrollTop', () => {
    const win = {
      document: { documentElement: { scrollTop: 17 } },
    } as unknown as Window;
    expect(getScrollTop(win)).toBe(17);
  });
});

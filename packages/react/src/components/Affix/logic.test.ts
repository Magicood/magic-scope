import { describe, expect, it } from 'vitest';
import { type AffixContainerRect, type AffixRect, computeAffix, getScrollTop } from './logic';

// window 容器视口:top/left 为 0,宽高即 inner 尺寸
const viewport: AffixContainerRect = { top: 0, left: 0, width: 1000, height: 800 };
// 一个典型被吸元素几何
const el = (top: number): AffixRect => ({ top, left: 40, width: 320, height: 60 });

describe('computeAffix —— 吸顶', () => {
  it('元素上沿距容器顶 > offsetTop 时不吸,style 为空对象', () => {
    const r = computeAffix({
      rect: el(120),
      containerRect: viewport,
      scrollTop: 0,
      offsetTop: 16,
    });
    expect(r.affixed).toBe(false);
    expect(r.mode).toBe('none');
    expect(r.style).toEqual({});
  });

  it('元素上沿距容器顶 <= offsetTop 时吸顶,fixed 到 containerTop+offsetTop,并锁宽锁左', () => {
    const r = computeAffix({
      rect: el(10),
      containerRect: viewport,
      scrollTop: 200,
      offsetTop: 16,
    });
    expect(r.affixed).toBe(true);
    expect(r.mode).toBe('top');
    expect(r.style.position).toBe('fixed');
    expect(r.style.top).toBe(16); // 0 + 16
    expect(r.style.width).toBe(320);
    expect(r.style.left).toBe(40);
  });

  it('offsetTop=0 也启用吸顶(边界等号命中)', () => {
    const r = computeAffix({
      rect: el(0),
      containerRect: viewport,
      scrollTop: 0,
      offsetTop: 0,
    });
    expect(r.affixed).toBe(true);
    expect(r.style.top).toBe(0);
  });

  it('非 window 容器:fixedTop 折算到 containerTop+offsetTop(相对视口)', () => {
    const container: AffixContainerRect = { top: 100, left: 0, width: 600, height: 400 };
    // 元素上沿相对容器顶距离 = 110 - 100 = 10 <= offsetTop 12 → 吸
    const r = computeAffix({
      rect: el(110),
      containerRect: container,
      scrollTop: 50,
      offsetTop: 12,
    });
    expect(r.affixed).toBe(true);
    expect(r.style.top).toBe(112); // 100 + 12
  });
});

describe('computeAffix —— 吸底', () => {
  it('仅给 offsetBottom:元素下沿距容器底 > offsetBottom 时不吸', () => {
    // 元素下沿 = 200 + 60 = 260;容器底 = 800;距离 540 > 24
    const r = computeAffix({
      rect: el(200),
      containerRect: viewport,
      scrollTop: 0,
      offsetBottom: 24,
    });
    expect(r.affixed).toBe(false);
  });

  it('元素下沿距容器底 <= offsetBottom 时吸底,fixedTop=containerBottom-offsetBottom-height', () => {
    // 元素下沿 = 730 + 60 = 790;容器底 800;距离 10 <= 24 → 吸
    const r = computeAffix({
      rect: el(730),
      containerRect: viewport,
      scrollTop: 0,
      offsetBottom: 24,
    });
    expect(r.affixed).toBe(true);
    expect(r.mode).toBe('bottom');
    expect(r.style.position).toBe('fixed');
    expect(r.style.top).toBe(800 - 24 - 60); // 716
    expect(r.style.bottom).toBe(24);
    expect(r.style.width).toBe(320);
  });

  it('offsetTop 与 offsetBottom 同时给:offsetTop 优先(走吸顶分支)', () => {
    const r = computeAffix({
      rect: el(4),
      containerRect: viewport,
      scrollTop: 0,
      offsetTop: 8,
      offsetBottom: 24,
    });
    expect(r.mode).toBe('top');
    expect(r.style.top).toBe(8);
  });
});

describe('computeAffix —— 默认(都不给)', () => {
  it('既无 offsetTop 也无 offsetBottom:元素上沿 <= 容器顶即吸顶到 0', () => {
    const r = computeAffix({
      rect: el(-5),
      containerRect: viewport,
      scrollTop: 100,
    });
    expect(r.affixed).toBe(true);
    expect(r.mode).toBe('top');
    expect(r.style.top).toBe(0);
  });

  it('默认模式下元素仍在容器顶下方则不吸', () => {
    const r = computeAffix({
      rect: el(30),
      containerRect: viewport,
      scrollTop: 0,
    });
    expect(r.affixed).toBe(false);
  });
});

describe('getScrollTop', () => {
  it('元素容器读 scrollTop', () => {
    expect(getScrollTop({ scrollTop: 321 } as unknown as HTMLElement)).toBe(321);
  });

  it('window 容器优先读 scrollY', () => {
    const fakeWin = { document: {}, scrollY: 88, pageYOffset: 0 } as unknown as Window;
    expect(getScrollTop(fakeWin)).toBe(88);
  });

  it('window 容器 scrollY 缺失回退 pageYOffset', () => {
    const win = { document: {}, pageYOffset: 45 } as unknown as Window;
    expect(getScrollTop(win)).toBe(45);
  });

  it('window 容器 scrollY/pageYOffset 都缺失时回退 documentElement.scrollTop,再缺回退 0', () => {
    const win1 = {
      document: { documentElement: { scrollTop: 12 } },
    } as unknown as Window;
    expect(getScrollTop(win1)).toBe(12);
    const win2 = { document: {} } as unknown as Window;
    expect(getScrollTop(win2)).toBe(0);
  });
});

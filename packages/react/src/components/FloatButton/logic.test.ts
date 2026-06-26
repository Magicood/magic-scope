import { describe, expect, it } from 'vitest';
import { resolveBadge, staggerDelay } from './logic';

describe('resolveBadge', () => {
  it('undefined / 非 dot 且 count<=0 时不渲染(返回 null)', () => {
    expect(resolveBadge(undefined)).toBeNull();
    expect(resolveBadge(0)).toBeNull();
    expect(resolveBadge(-3)).toBeNull();
    expect(resolveBadge({ count: 0 })).toBeNull();
  });

  it('dot 优先于 count,返回 dot 类型', () => {
    expect(resolveBadge({ dot: true })).toEqual({ kind: 'dot' });
    expect(resolveBadge({ dot: true, count: 5 })).toEqual({ kind: 'dot' });
  });

  it('正数 count 返回计数文本(数字简写等价 { count })', () => {
    expect(resolveBadge(5)).toEqual({ kind: 'count', text: '5' });
    expect(resolveBadge({ count: 12 })).toEqual({ kind: 'count', text: '12' });
  });

  it('超过 overflowCount(默认 99)截断为 N+', () => {
    expect(resolveBadge(100)).toEqual({ kind: 'count', text: '99+' });
    expect(resolveBadge({ count: 1000, overflowCount: 999 })).toEqual({
      kind: 'count',
      text: '999+',
    });
  });

  it('小数 count 向下取整;非有限值不渲染', () => {
    expect(resolveBadge(3.9)).toEqual({ kind: 'count', text: '3' });
    expect(resolveBadge(Number.POSITIVE_INFINITY)).toBeNull();
    expect(resolveBadge(Number.NaN)).toBeNull();
  });
});

describe('staggerDelay', () => {
  it('展开态按 index 线性错峰', () => {
    expect(staggerDelay(0, true, 40)).toBe(0);
    expect(staggerDelay(1, true, 40)).toBe(40);
    expect(staggerDelay(3, true, 40)).toBe(120);
  });

  it('收起态恒为 0(离场不错峰拖尾)', () => {
    expect(staggerDelay(2, false, 40)).toBe(0);
  });

  it('stagger<=0 或负索引时为 0(关闭错峰 / 越界保护)', () => {
    expect(staggerDelay(2, true, 0)).toBe(0);
    expect(staggerDelay(-1, true, 40)).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import { computeUnitLayout, estimateTextSize, normalizeVec2, toLines } from './logic';

describe('computeUnitLayout', () => {
  it('画布尺寸 = gap + content,中心在画布几何中点', () => {
    const layout = computeUnitLayout({
      gap: [100, 100],
      content: [60, 20],
      rotate: -22,
    });
    expect(layout.canvasWidth).toBe(160);
    expect(layout.canvasHeight).toBe(120);
    expect(layout.centerX).toBe(80);
    expect(layout.centerY).toBe(60);
    expect(layout.contentWidth).toBe(60);
    expect(layout.contentHeight).toBe(20);
  });

  it('对负数 / NaN 尺寸做防御,兜成 0 不产出非法画布', () => {
    const layout = computeUnitLayout({
      gap: [-10, Number.NaN],
      content: [Number.POSITIVE_INFINITY, -5],
      rotate: 0,
    });
    // 全部非法兜 0:画布坍缩为 0×0,中心 0,组件据此降级不绘制
    expect(layout.canvasWidth).toBe(0);
    expect(layout.canvasHeight).toBe(0);
    expect(layout.centerX).toBe(0);
    expect(layout.centerY).toBe(0);
  });

  it('gap 为 0 时画布 = content 尺寸(紧贴平铺)', () => {
    const layout = computeUnitLayout({
      gap: [0, 0],
      content: [120, 64],
      rotate: 45,
    });
    expect(layout.canvasWidth).toBe(120);
    expect(layout.canvasHeight).toBe(64);
  });
});

describe('estimateTextSize', () => {
  it('宽取最长行,高随行数累加', () => {
    const [w1, h1] = estimateTextSize(['ab'], 16);
    const [w2, h2] = estimateTextSize(['ab', 'abcd'], 16);
    // 行更多 / 最长行更长 → 尺寸不减
    expect(w2).toBeGreaterThan(w1);
    expect(h2).toBeGreaterThan(h1);
    expect(h1).toBeGreaterThan(0);
  });

  it('空行数组高度至少按 1 行算(不为 0)', () => {
    const [, h] = estimateTextSize([], 16);
    expect(h).toBeGreaterThan(0);
  });

  it('字号无效时回退默认字号,不产出 NaN', () => {
    const [w, h] = estimateTextSize(['abc'], Number.NaN);
    expect(Number.isFinite(w)).toBe(true);
    expect(Number.isFinite(h)).toBe(true);
  });
});

describe('toLines', () => {
  it('undefined → 空数组', () => {
    expect(toLines(undefined)).toEqual([]);
  });

  it('字符串 → 单元素数组', () => {
    expect(toLines('confidential')).toEqual(['confidential']);
  });

  it('字符串数组原样规整为字符串数组', () => {
    expect(toLines(['line1', 'line2'])).toEqual(['line1', 'line2']);
  });
});

describe('normalizeVec2', () => {
  it('undefined → fallback', () => {
    expect(normalizeVec2(undefined, [100, 100])).toEqual([100, 100]);
  });

  it('合法二元组原样返回', () => {
    expect(normalizeVec2([12, 34], [0, 0])).toEqual([12, 34]);
  });

  it('元素非有限数时逐位回退 fallback', () => {
    expect(normalizeVec2([Number.NaN, 7], [1, 2])).toEqual([1, 7]);
  });
});

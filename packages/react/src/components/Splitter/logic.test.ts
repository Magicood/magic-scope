import { describe, expect, it } from 'vitest';
import {
  clamp,
  normalizeSizes,
  type PanelConstraint,
  resizePanels,
  resolveLength,
  sizesToPercents,
} from './logic';

/** 求和小工具:避开下标 non-null 断言(noUncheckedIndexedAccess 下用它断言总和守恒)。 */
const sum = (arr: readonly number[]): number => arr.reduce((a, b) => a + b, 0);

describe('clamp', () => {
  it('夹在区间内', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
  it('max<min 时退化为 min', () => {
    expect(clamp(5, 10, 0)).toBe(10);
  });
  it('非有限值回退 min', () => {
    expect(clamp(Number.NaN, 2, 8)).toBe(2);
  });
});

describe('resizePanels', () => {
  it('正向位移:左侧加、右侧减,总和守恒', () => {
    const out = resizePanels([100, 100], 0, 30, 200);
    expect(out).toEqual([130, 70]);
    expect(sum(out)).toBe(200);
  });

  it('负向位移:左侧减、右侧加', () => {
    expect(resizePanels([100, 100], 0, -40, 200)).toEqual([60, 140]);
  });

  it('受左侧 max 夹取,生效位移被截断且守恒', () => {
    const cons: PanelConstraint[] = [{ max: 120 }, {}];
    const out = resizePanels([100, 100], 0, 50, 200, cons);
    expect(out).toEqual([120, 80]);
    expect(sum(out)).toBe(200);
  });

  it('受右侧 min 夹取(右侧不能再缩)', () => {
    const cons: PanelConstraint[] = [{}, { min: 80 }];
    const out = resizePanels([100, 100], 0, 50, 200, cons);
    expect(out).toEqual([120, 80]);
  });

  it('两侧都触界时取更紧的约束', () => {
    const cons: PanelConstraint[] = [{ max: 110 }, { min: 95 }];
    // 左最多 +10,右最多 -5 → 实际只搬 5
    const out = resizePanels([100, 100], 0, 50, 200, cons);
    expect(out).toEqual([105, 95]);
  });

  it('只动相邻两块,其余面板不变', () => {
    const out = resizePanels([100, 100, 100], 1, 20, 300);
    expect(out).toEqual([100, 120, 80]);
  });

  it('非法 gutter / delta=0 原样返回拷贝(不改原数组)', () => {
    const src = [100, 100];
    expect(resizePanels(src, -1, 10, 200)).toEqual([100, 100]);
    expect(resizePanels(src, 5, 10, 200)).toEqual([100, 100]);
    expect(resizePanels(src, 0, 0, 200)).toEqual([100, 100]);
    expect(resizePanels(src, 0, Number.NaN, 200)).toEqual([100, 100]);
    expect(src).toEqual([100, 100]);
  });
});

describe('normalizeSizes', () => {
  it('总和已达标且在界内:原样返回', () => {
    expect(normalizeSizes([100, 100], 200)).toEqual([100, 100]);
  });

  it('总量大于和:按余量比例放大到 total', () => {
    const out = normalizeSizes([50, 50], 200);
    expect(sum(out)).toBeCloseTo(200, 5);
    expect(out[0]).toBeCloseTo(100, 5);
  });

  it('总量小于和:按余量比例收缩到 total', () => {
    const out = normalizeSizes([200, 200], 200);
    expect(sum(out)).toBeCloseTo(200, 5);
  });

  it('尊重 min:不可压缩的块保住下限,差额由其它块吸收', () => {
    const cons: PanelConstraint[] = [{ min: 150 }, {}];
    const out = normalizeSizes([200, 200], 200, cons);
    expect(out[0]).toBeGreaterThanOrEqual(150);
    expect(sum(out)).toBeCloseTo(200, 5);
  });

  it('尊重 max:封顶块不超界', () => {
    const cons: PanelConstraint[] = [{ max: 80 }, {}];
    const out = normalizeSizes([100, 100], 300, cons);
    expect(out[0]).toBeLessThanOrEqual(80);
  });

  it('total<=0 退化为全 0;空数组返回空', () => {
    expect(normalizeSizes([10, 20], 0)).toEqual([0, 0]);
    expect(normalizeSizes([], 100)).toEqual([]);
  });

  it('NaN / 负值被夹正后参与分摊', () => {
    const out = normalizeSizes([Number.NaN, -5], 100);
    expect(out.every((v) => Number.isFinite(v) && v >= 0)).toBe(true);
    expect(sum(out)).toBeCloseTo(100, 5);
  });
});

describe('sizesToPercents', () => {
  it('换算为百分比', () => {
    expect(sizesToPercents([50, 150], 200)).toEqual([25, 75]);
  });
  it('total<=0 全 0', () => {
    expect(sizesToPercents([1, 2], 0)).toEqual([0, 0]);
  });
});

describe('resolveLength', () => {
  it('数字直接当像素', () => {
    expect(resolveLength(120, 800)).toBe(120);
  });
  it('百分比按容器换算', () => {
    expect(resolveLength('25%', 800)).toBe(200);
  });
  it('带 px 后缀解析为像素', () => {
    expect(resolveLength('80px', 800)).toBe(80);
  });
  it('undefined / 非法返回 undefined', () => {
    expect(resolveLength(undefined, 800)).toBeUndefined();
    expect(resolveLength('abc', 800)).toBeUndefined();
  });
});

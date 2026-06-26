import { describe, expect, it } from 'vitest';
import {
  clampZoom,
  IDENTITY_TRANSFORM,
  isIdentityTransform,
  nextRotate,
  nextZoom,
  ROTATE_STEP,
  resolveSrc,
  transformString,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
} from './logic';

describe('clampZoom', () => {
  it('夹取到 [ZOOM_MIN, ZOOM_MAX]', () => {
    expect(clampZoom(0.1)).toBe(ZOOM_MIN);
    expect(clampZoom(10)).toBe(ZOOM_MAX);
    expect(clampZoom(1.5)).toBe(1.5);
  });

  it('非有限数回落到 1', () => {
    expect(clampZoom(Number.NaN)).toBe(1);
    expect(clampZoom(Number.POSITIVE_INFINITY)).toBe(1);
  });
});

describe('nextZoom', () => {
  it('按方向叠加一步', () => {
    expect(nextZoom(1, 1)).toBe(1 + ZOOM_STEP);
    expect(nextZoom(1, -1)).toBe(1 - ZOOM_STEP);
  });

  it('direction 为 0 时不变(仍夹取)', () => {
    expect(nextZoom(1.5, 0)).toBe(1.5);
  });

  it('叠加结果不越界', () => {
    expect(nextZoom(ZOOM_MAX, 1)).toBe(ZOOM_MAX);
    expect(nextZoom(ZOOM_MIN, -1)).toBe(ZOOM_MIN);
  });

  it('消除浮点累积误差', () => {
    // 0.5 → 0.75 → 1.0,不出现 0.7500000001
    expect(nextZoom(nextZoom(0.5, 1), 1)).toBe(1);
  });

  it('支持自定义步进', () => {
    expect(nextZoom(1, 1, 0.5)).toBe(1.5);
  });
});

describe('nextRotate', () => {
  it('按 90° 步进顺时针', () => {
    expect(nextRotate(0, 1)).toBe(ROTATE_STEP);
    expect(nextRotate(270, 1)).toBe(0); // 360 归一到 0
  });

  it('逆时针归一到 [0,360)', () => {
    expect(nextRotate(0, -1)).toBe(270);
    expect(nextRotate(90, -1)).toBe(0);
  });

  it('非有限数从 0 起算', () => {
    expect(nextRotate(Number.NaN, 1)).toBe(90);
  });
});

describe('transformString / isIdentityTransform', () => {
  it('拼出 scale + rotate', () => {
    expect(transformString({ zoom: 2, rotate: 90 })).toBe('scale(2) rotate(90deg)');
  });

  it('拼接时夹取越界 zoom', () => {
    expect(transformString({ zoom: 99, rotate: 0 })).toBe(`scale(${ZOOM_MAX}) rotate(0deg)`);
  });

  it('还原态识别', () => {
    expect(isIdentityTransform(IDENTITY_TRANSFORM)).toBe(true);
    expect(isIdentityTransform({ zoom: 1, rotate: 360 })).toBe(true);
    expect(isIdentityTransform({ zoom: 1.5, rotate: 0 })).toBe(false);
    expect(isIdentityTransform({ zoom: 1, rotate: 90 })).toBe(false);
  });
});

describe('resolveSrc', () => {
  it('未失败时用主图', () => {
    expect(resolveSrc('a.png', ['b.png'], 0)).toEqual({ src: 'a.png', errored: false });
  });

  it('失败一次降到第一个 fallback', () => {
    expect(resolveSrc('a.png', ['b.png', 'c.png'], 1)).toEqual({ src: 'b.png', errored: false });
    expect(resolveSrc('a.png', ['b.png', 'c.png'], 2)).toEqual({ src: 'c.png', errored: false });
  });

  it('耗尽所有候选进入错误态', () => {
    expect(resolveSrc('a.png', ['b.png'], 2)).toEqual({ src: null, errored: true });
  });

  it('无任何来源直接错误态', () => {
    expect(resolveSrc(undefined, undefined, 0)).toEqual({ src: null, errored: true });
    expect(resolveSrc('', [], 0)).toEqual({ src: null, errored: true });
  });

  it('过滤空白候选', () => {
    expect(resolveSrc('  ', ['b.png'], 0)).toEqual({ src: 'b.png', errored: false });
  });

  it('负数 / 小数 failedCount 归一', () => {
    expect(resolveSrc('a.png', ['b.png'], -1)).toEqual({ src: 'a.png', errored: false });
    expect(resolveSrc('a.png', ['b.png'], 1.9)).toEqual({ src: 'b.png', errored: false });
  });
});

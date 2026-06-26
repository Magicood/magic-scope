import { describe, expect, it } from 'vitest';
import {
  clamp,
  formatColor,
  type HSVA,
  hexToRgb,
  hslToRgb,
  hsvaEquals,
  hsvToRgb,
  parseColor,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  round,
} from './logic';

describe('clamp / round', () => {
  it('clamp 夹取并对非有限数回退 min', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
    expect(clamp(Number.NaN, 2, 10)).toBe(2);
    expect(clamp(5, 10, 0)).toBe(10); // max<min 回退 min
  });

  it('round 按小数位四舍五入,非有限数回退 0', () => {
    expect(round(1.2345, 2)).toBe(1.23);
    expect(round(1.235, 2)).toBe(1.24);
    expect(round(127.6)).toBe(128);
    expect(round(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('hsvToRgb / rgbToHsv 往返', () => {
  it('纯红 / 纯绿 / 纯蓝', () => {
    expect(hsvToRgb(0, 1, 1)).toEqual({ r: 255, g: 0, b: 0 });
    expect(hsvToRgb(120, 1, 1)).toEqual({ r: 0, g: 255, b: 0 });
    expect(hsvToRgb(240, 1, 1)).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('黑 / 白 / 灰', () => {
    expect(hsvToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });
    expect(hsvToRgb(0, 0, 1)).toEqual({ r: 255, g: 255, b: 255 });
    expect(hsvToRgb(0, 0, 0.5)).toEqual({ r: 128, g: 128, b: 128 });
  });

  it('rgbToHsv 还原纯色与无彩色', () => {
    expect(rgbToHsv(255, 0, 0)).toMatchObject({ h: 0, s: 1, v: 1 });
    expect(rgbToHsv(0, 255, 0)).toMatchObject({ h: 120, s: 1, v: 1 });
    expect(rgbToHsv(0, 0, 0)).toMatchObject({ s: 0, v: 0 }); // 黑:饱和度/明度 0
    expect(rgbToHsv(255, 255, 255)).toMatchObject({ h: 0, s: 0, v: 1 });
  });

  it('色相环绕:负值与越界归一一致', () => {
    expect(hsvToRgb(-120, 1, 1)).toEqual(hsvToRgb(240, 1, 1));
    expect(hsvToRgb(480, 1, 1)).toEqual(hsvToRgb(120, 1, 1));
  });
});

describe('rgbToHex / hexToRgb', () => {
  it('rgbToHex 输出 6 位,a<1 且 withAlpha 时输出 8 位', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    expect(rgbToHex(0, 128, 255)).toBe('#0080ff');
    expect(rgbToHex(255, 0, 0, 0.5, true)).toBe('#ff000080');
    expect(rgbToHex(255, 0, 0, 1, true)).toBe('#ff0000'); // a===1 不带 alpha
  });

  it('hexToRgb 吃 3/4/6/8 位与 # 省略', () => {
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    expect(hexToRgb('#0080ff')).toEqual({ r: 0, g: 128, b: 255, a: 1 });
    expect(hexToRgb('#ff000080')).toMatchObject({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#ff000080')?.a).toBeCloseTo(0.502, 2);
    expect(hexToRgb('#f00f')).toEqual({ r: 255, g: 0, b: 0, a: 1 }); // 4 位简写带 alpha
  });

  it('hexToRgb 非法输入返回 null', () => {
    expect(hexToRgb('#zzz')).toBeNull();
    expect(hexToRgb('#12345')).toBeNull(); // 5 位非法
    expect(hexToRgb('')).toBeNull();
  });
});

describe('rgbToHsl / hslToRgb 往返', () => {
  it('纯色 HSL', () => {
    expect(rgbToHsl(255, 0, 0)).toMatchObject({ h: 0, s: 1, l: 0.5 });
    expect(rgbToHsl(0, 0, 0)).toMatchObject({ s: 0, l: 0 });
    expect(rgbToHsl(255, 255, 255)).toMatchObject({ s: 0, l: 1 });
  });

  it('hslToRgb 还原纯色', () => {
    expect(hslToRgb(0, 1, 0.5)).toEqual({ r: 255, g: 0, b: 0 });
    expect(hslToRgb(120, 1, 0.5)).toEqual({ r: 0, g: 255, b: 0 });
    expect(hslToRgb(240, 1, 0.5)).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('RGB → HSL → RGB 往返对若干随机色稳定', () => {
    const samples: Array<[number, number, number]> = [
      [123, 45, 200],
      [10, 220, 130],
      [200, 200, 50],
    ];
    for (const [r, g, b] of samples) {
      const { h, s, l } = rgbToHsl(r, g, b);
      const back = hslToRgb(h, s, l);
      expect(back.r).toBeCloseTo(r, -0.4);
      expect(back.g).toBeCloseTo(g, -0.4);
      expect(back.b).toBeCloseTo(b, -0.4);
    }
  });
});

describe('parseColor', () => {
  it('解析 hex(含简写 / 含 alpha)', () => {
    expect(parseColor('#ff0000')).toMatchObject({ h: 0, s: 1, v: 1, a: 1 });
    expect(parseColor('#f00')).toMatchObject({ h: 0, s: 1, v: 1 });
    const withA = parseColor('#ff000080');
    expect(withA?.a).toBeCloseTo(0.502, 2);
  });

  it('解析 rgb() / rgba()(逗号与空格语法 + / alpha)', () => {
    expect(parseColor('rgb(255, 0, 0)')).toMatchObject({ h: 0, s: 1, v: 1, a: 1 });
    expect(parseColor('rgb(255 0 0)')).toMatchObject({ h: 0, s: 1, v: 1 });
    expect(parseColor('rgba(0, 0, 255, 0.5)')).toMatchObject({ h: 240, s: 1, v: 1, a: 0.5 });
    expect(parseColor('rgb(255 0 0 / 0.25)')?.a).toBeCloseTo(0.25, 2);
  });

  it('解析 hsl() / hsla()', () => {
    expect(parseColor('hsl(0, 100%, 50%)')).toMatchObject({ h: 0, s: 1, v: 1, a: 1 });
    expect(parseColor('hsl(120deg, 100%, 50%)')).toMatchObject({ h: 120, s: 1, v: 1 });
    expect(parseColor('hsla(240, 100%, 50%, 0.3)')?.a).toBeCloseTo(0.3, 2);
  });

  it('非法 / 空串返回 null', () => {
    expect(parseColor('not-a-color')).toBeNull();
    expect(parseColor('')).toBeNull();
    expect(parseColor('rgb(255, 0)')).toBeNull(); // 缺通道
  });
});

describe('formatColor', () => {
  const red: HSVA = { h: 0, s: 1, v: 1, a: 1 };
  const semiBlue: HSVA = { h: 240, s: 1, v: 1, a: 0.5 };

  it('hex 格式(透明走 8 位)', () => {
    expect(formatColor(red, 'hex')).toBe('#ff0000');
    expect(formatColor(semiBlue, 'hex')).toBe('#0000ff80');
  });

  it('rgb 格式(透明走 rgba)', () => {
    expect(formatColor(red, 'rgb')).toBe('rgb(255, 0, 0)');
    expect(formatColor(semiBlue, 'rgb')).toBe('rgba(0, 0, 255, 0.5)');
  });

  it('hsl 格式(透明走 hsla)', () => {
    expect(formatColor(red, 'hsl')).toBe('hsl(0, 100%, 50%)');
    expect(formatColor(semiBlue, 'hsl')).toBe('hsla(240, 100%, 50%, 0.5)');
  });

  it('parseColor → formatColor 往返串稳定(hex)', () => {
    const parsed = parseColor('#3366cc');
    expect(parsed).not.toBeNull();
    if (parsed) expect(formatColor(parsed, 'hex')).toBe('#3366cc');
  });
});

describe('hsvaEquals', () => {
  it('格点近似相等去抖', () => {
    const a: HSVA = { h: 120, s: 0.5, v: 0.5, a: 1 };
    const b: HSVA = { h: 120.001, s: 0.50001, v: 0.5, a: 1 };
    expect(hsvaEquals(a, b)).toBe(true);
    expect(hsvaEquals(a, { ...a, h: 121 })).toBe(false);
  });
});

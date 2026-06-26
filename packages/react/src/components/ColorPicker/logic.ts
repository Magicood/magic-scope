/**
 * ColorPicker 纯逻辑 —— 零 React 依赖,色彩数学 + 解析/格式化全是纯函数,
 * 便于将来平移 `packages/core`(vue / web-component 共用同一套色彩语义)。
 *
 * 内部统一真相源为 HSVA(h∈[0,360) / s,v,a∈[0,1]):
 * - 2D 饱和度-明度面板天然映射到 s(x)/v(y),hue 滑条直接给 h,alpha 滑条给 a;
 * - 与 RGB / HEX / HSL 之间靠下面这组互转函数桥接;
 * - parseColor 把任意支持串归一为 HSVA;formatColor 反向出 hex / rgb / hsl 串。
 */

/** RGB(各通道 0–255 整数) + alpha(0–1)。 */
export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** HSV(h 0–360 / s,v 0–1) + alpha(0–1)。组件内部状态的真相源。 */
export interface HSVA {
  h: number;
  s: number;
  v: number;
  a: number;
}

/** HSL(h 0–360 / s,l 0–1) + alpha(0–1)。 */
export interface HSLA {
  h: number;
  s: number;
  l: number;
  a: number;
}

/** 输出格式:十六进制 / rgb(a) / hsl(a) 字符串。 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl';

/** 把值夹取到 [min, max];非有限数回退 min。 */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
}

/** 四舍五入到指定小数位(默认 0 位,即取整);非有限数回退 0。 */
export function round(value: number, digits = 0): number {
  if (!Number.isFinite(value)) return 0;
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

/** 把色相规整到 [0, 360)(支持负数 / 越界环绕)。 */
function normalizeHue(h: number): number {
  if (!Number.isFinite(h)) return 0;
  const m = h % 360;
  return m < 0 ? m + 360 : m;
}

/** HSV → RGB。h∈[0,360) / s,v∈[0,1] → r,g,b∈[0,255] 整数。 */
export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const hh = normalizeHue(h);
  const ss = clamp(s, 0, 1);
  const vv = clamp(v, 0, 1);
  const c = vv * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = vv - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hh < 60) {
    r = c;
    g = x;
  } else if (hh < 120) {
    r = x;
    g = c;
  } else if (hh < 180) {
    g = c;
    b = x;
  } else if (hh < 240) {
    g = x;
    b = c;
  } else if (hh < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return {
    r: round((r + m) * 255),
    g: round((g + m) * 255),
    b: round((b + m) * 255),
  };
}

/** RGB → HSV。r,g,b∈[0,255] → h∈[0,360) / s,v∈[0,1]。 */
export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rr = clamp(r, 0, 255) / 255;
  const gg = clamp(g, 0, 255) / 255;
  const bb = clamp(b, 0, 255) / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rr) {
      h = ((gg - bb) / d) % 6;
    } else if (max === gg) {
      h = (bb - rr) / d + 2;
    } else {
      h = (rr - gg) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h: round(h, 2), s, v: max };
}

/** 单通道(0–255)转两位十六进制。 */
function channelToHex(value: number): string {
  const clamped = clamp(round(value), 0, 255);
  return clamped.toString(16).padStart(2, '0');
}

/**
 * RGB(A) → HEX 串。withAlpha 为 true 且 a<1 时输出 8 位 #RRGGBBAA,否则 6 位 #RRGGBB。
 */
export function rgbToHex(r: number, g: number, b: number, a = 1, withAlpha = false): string {
  const base = `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
  if (withAlpha && a < 1) {
    return `${base}${channelToHex(clamp(a, 0, 1) * 255)}`;
  }
  return base;
}

/**
 * HEX → RGBA。吃 #rgb / #rgba / #rrggbb / #rrggbbaa(# 可省略);
 * 非法返回 null,由调用方决定回退。
 */
export function hexToRgb(hex: string): RGBA | null {
  let h = hex.trim().toLowerCase();
  if (h.startsWith('#')) h = h.slice(1);
  if (!/^[0-9a-f]+$/.test(h)) return null;
  // 3 / 4 位简写:每位翻倍展开。
  if (h.length === 3 || h.length === 4) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (h.length !== 6 && h.length !== 8) return null;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? Number.parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a: round(a, 3) };
}

/** RGB → HSL。r,g,b∈[0,255] → h∈[0,360) / s,l∈[0,1]。 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rr = clamp(r, 0, 255) / 255;
  const gg = clamp(g, 0, 255) / 255;
  const bb = clamp(b, 0, 255) / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rr) {
      h = ((gg - bb) / d) % 6;
    } else if (max === gg) {
      h = (bb - rr) / d + 2;
    } else {
      h = (rr - gg) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: round(h, 2), s, l };
}

/** HSL → RGB。h∈[0,360) / s,l∈[0,1] → r,g,b∈[0,255] 整数。 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hh = normalizeHue(h);
  const ss = clamp(s, 0, 1);
  const ll = clamp(l, 0, 1);
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hh < 60) {
    r = c;
    g = x;
  } else if (hh < 120) {
    r = x;
    g = c;
  } else if (hh < 180) {
    g = c;
    b = x;
  } else if (hh < 240) {
    g = x;
    b = c;
  } else if (hh < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return {
    r: round((r + m) * 255),
    g: round((g + m) * 255),
    b: round((b + m) * 255),
  };
}

// —— 复合换算(组件状态真相源 HSVA ↔ 各表示)——

/** HSVA → RGBA(整数通道 + 透传 alpha)。 */
export function hsvaToRgba(hsva: HSVA): RGBA {
  const { r, g, b } = hsvToRgb(hsva.h, hsva.s, hsva.v);
  return { r, g, b, a: clamp(hsva.a, 0, 1) };
}

/** RGBA → HSVA(透传 alpha)。 */
export function rgbaToHsva(rgba: RGBA): HSVA {
  const { h, s, v } = rgbToHsv(rgba.r, rgba.g, rgba.b);
  return { h, s, v, a: clamp(rgba.a, 0, 1) };
}

/** HSVA → HSLA(经 RGB 中转,避免 HSV↔HSL 直推的边界误差)。 */
export function hsvaToHsla(hsva: HSVA): HSLA {
  const { r, g, b } = hsvToRgb(hsva.h, hsva.s, hsva.v);
  const { h, s, l } = rgbToHsl(r, g, b);
  return { h, s, l, a: clamp(hsva.a, 0, 1) };
}

const RGB_RE = /^rgba?\(\s*([^)]+)\)$/i;
const HSL_RE = /^hsla?\(\s*([^)]+)\)$/i;

/** 拆 `rgb()/hsl()` 括号内的参数:支持逗号或空格(+ `/` alpha)分隔,百分号保留由调用方处理。 */
function splitParts(inner: string): string[] {
  return inner
    .replace(/\//g, ' ')
    .split(/[\s,]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/** 解析单个数值(支持百分比:相对 base 归一)。失败返回 null。 */
function parseNum(token: string, base: number): number | null {
  if (token.endsWith('%')) {
    const n = Number.parseFloat(token.slice(0, -1));
    return Number.isFinite(n) ? (n / 100) * base : null;
  }
  const n = Number.parseFloat(token);
  return Number.isFinite(n) ? n : null;
}

/**
 * parseColor —— 把任意支持串归一为 HSVA。
 * 吃 `#hex` / `#hexa`(3/4/6/8 位)/ `rgb()` / `rgba()` / `hsl()` / `hsla()`,
 * 数值支持逗号或空格语法、alpha 支持 `/` 语法、s/l 与 alpha 支持百分号。
 * 解析失败返回 null(组件层回退到上一有效值,绝不抛错)。
 */
export function parseColor(input: string): HSVA | null {
  if (typeof input !== 'string') return null;
  const str = input.trim();
  if (str === '') return null;

  // HEX(含简写 / 含 alpha)
  if (str.startsWith('#') || /^[0-9a-fA-F]{3,8}$/.test(str)) {
    const rgba = hexToRgb(str);
    return rgba ? rgbaToHsva(rgba) : null;
  }

  // rgb() / rgba()
  const rgbMatch = RGB_RE.exec(str);
  if (rgbMatch?.[1] !== undefined) {
    const parts = splitParts(rgbMatch[1]);
    if (parts.length < 3) return null;
    const r = parseNum(parts[0] as string, 255);
    const g = parseNum(parts[1] as string, 255);
    const b = parseNum(parts[2] as string, 255);
    if (r === null || g === null || b === null) return null;
    const a = parts.length >= 4 ? parseNum(parts[3] as string, 1) : 1;
    return rgbaToHsva({
      r: clamp(round(r), 0, 255),
      g: clamp(round(g), 0, 255),
      b: clamp(round(b), 0, 255),
      a: clamp(a ?? 1, 0, 1),
    });
  }

  // hsl() / hsla()
  const hslMatch = HSL_RE.exec(str);
  if (hslMatch?.[1] !== undefined) {
    const parts = splitParts(hslMatch[1]);
    if (parts.length < 3) return null;
    // 色相:可带 deg,按数值取;s/l 通常带 %(parseNum 归一到 0–1)。
    const hToken = (parts[0] as string).replace(/deg$/i, '');
    const h = Number.parseFloat(hToken);
    const s = parseNum(parts[1] as string, 1);
    const l = parseNum(parts[2] as string, 1);
    if (!Number.isFinite(h) || s === null || l === null) return null;
    const a = parts.length >= 4 ? parseNum(parts[3] as string, 1) : 1;
    const { r, g, b } = hslToRgb(h, clamp(s, 0, 1), clamp(l, 0, 1));
    return rgbaToHsva({ r, g, b, a: clamp(a ?? 1, 0, 1) });
  }

  return null;
}

/**
 * formatColor —— HSVA → 指定格式串。
 * - hex:a<1 时输出 8 位 #RRGGBBAA(由 withAlpha 控制是否带),否则 6 位;
 * - rgb:a<1 输出 `rgba(r, g, b, a)`,否则 `rgb(r, g, b)`;
 * - hsl:a<1 输出 `hsla(h, s%, l%, a)`,否则 `hsl(h, s%, l%)`。
 * withAlpha=true 强制带 alpha 通道(即便 a===1)。
 */
export function formatColor(hsva: HSVA, format: ColorFormat, withAlpha = false): string {
  const a = clamp(hsva.a, 0, 1);
  const showAlpha = withAlpha || a < 1;
  if (format === 'hex') {
    const { r, g, b } = hsvToRgb(hsva.h, hsva.s, hsva.v);
    return rgbToHex(r, g, b, a, showAlpha);
  }
  if (format === 'rgb') {
    const { r, g, b } = hsvToRgb(hsva.h, hsva.s, hsva.v);
    return showAlpha ? `rgba(${r}, ${g}, ${b}, ${round(a, 2)})` : `rgb(${r}, ${g}, ${b})`;
  }
  // hsl
  const { h, s, l } = hsvaToHsla(hsva);
  const hh = round(h);
  const ss = round(s * 100);
  const ll = round(l * 100);
  return showAlpha ? `hsla(${hh}, ${ss}%, ${ll}%, ${round(a, 2)})` : `hsl(${hh}, ${ss}%, ${ll}%)`;
}

/** 两个 HSVA 是否等价(按格点近似;用于受控同步去抖,避免浮点抖动反复 setState)。 */
export function hsvaEquals(a: HSVA, b: HSVA): boolean {
  return (
    round(a.h, 2) === round(b.h, 2) &&
    round(a.s, 4) === round(b.s, 4) &&
    round(a.v, 4) === round(b.v, 4) &&
    round(a.a, 3) === round(b.a, 3)
  );
}

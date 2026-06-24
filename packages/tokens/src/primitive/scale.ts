/**
 * primitive 数值刻度(无语义) —— 间距 / 圆角 / 字号 / 字重 / 行高 / 动效。
 * type scale 比例 1.2(minor third,见 DESIGN.md 附录 A 决策 10)。
 * 流式(clamp)与密度缩放在 engine 层用 calc(... * --ms-density-scale) 落地。
 */
export const scale = {
  space: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  },
  radius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  fontSize: {
    xs: '0.694rem',
    sm: '0.833rem',
    base: '1rem',
    lg: '1.2rem',
    xl: '1.44rem',
    '2xl': '1.728rem',
    '3xl': '2.074rem',
  },
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.7',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  duration: {
    instant: '0ms',
    fast: '120ms',
    base: '200ms',
    slow: '320ms',
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    cast: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

export type Scale = typeof scale;

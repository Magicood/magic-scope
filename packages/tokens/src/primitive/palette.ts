/**
 * primitive 调色板(魔法名 · 唯一根) —— 客观无语义的原子色值。
 *
 * 命名色族:arcane(主紫) / frost(青蓝) / ember(品红) / void(中性深色阶,带紫调) /
 * moss(成功绿) / sun(警示黄) / rose(危险)。值经 WCAG 2.1 校验(见 DESIGN.md §3.4)。
 *
 * 注:首版以 sRGB hex 为值(对外降级基线)。OKLCH 基准与 color-mix 派生在 derive/ 层增量接入。
 * 组件 CSS 禁止直接引用本层(只准用语义层 var(--ms-color-*)),见 DESIGN.md §2 铁律 1。
 */
export const palette = {
  arcane: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#4C1D95',
    900: '#2E1065',
  },
  frost: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },
  ember: {
    50: '#FFF1F7',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },
  void: {
    50: '#F2EEFB',
    100: '#D8D2E8',
    200: '#A89FC4',
    300: '#8278A6',
    400: '#6B6485',
    500: '#6B5C90',
    600: '#473D63',
    700: '#2E2842',
    800: '#1C1828',
    900: '#13101C',
    950: '#0A0710',
  },
  moss: {
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  sun: {
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  rose: {
    400: '#FB7185',
    500: '#F43F5E',
    600: '#E11D48',
  },
} as const;

export type Palette = typeof palette;
export type ColorFamily = keyof Palette;

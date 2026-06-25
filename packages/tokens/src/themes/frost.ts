import { deriveTheme } from '../derive/deriveTheme';
import { palette } from '../primitive/palette';

/**
 * 霜蓝(frost)预设 —— 青蓝主色 + 品红点缀、冷调中性。
 * 全程由 `deriveTheme` 从少量 seed 派生,示范「随心变化但遵从核心」:
 * 不必手写整套契约,给主色 / 中性 / 点缀即得协调的明暗双模主题。
 */
const seed = {
  name: 'frost',
  label: '霜蓝',
  primary: palette.frost[500], // #0EA5E9 青蓝
  neutral: '#1F2A37', // 冷蓝灰中性
  accent: palette.ember[500], // #EC4899 品红点缀
} as const;

export const frostDark = deriveTheme({ ...seed, scheme: 'dark' });
export const frostLight = deriveTheme({ ...seed, scheme: 'light' });

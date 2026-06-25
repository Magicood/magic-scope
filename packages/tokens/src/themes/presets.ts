import type { ThemeContract } from '../contract/contract';
import { deriveTheme } from '../derive/deriveTheme';
import { palette } from '../primitive/palette';

/**
 * 派生预设家族 —— 全部由 deriveTheme 从少量 seed 派生(明暗双模)。
 * 新增一套预设 = 加一条 seed,零额外代码:这正是「配色多重选择」的系统化做法。
 * 覆盖暖 / 冷 / 绿 / 中性几个方向,与默认 arcane(紫)、frost(青蓝)并列。
 */
interface PresetSeed {
  name: string;
  label: string;
  primary: string;
  neutral: string;
  accent: string;
}

function pair(seed: PresetSeed): { dark: ThemeContract; light: ThemeContract } {
  return {
    dark: deriveTheme({ ...seed, scheme: 'dark' }),
    light: deriveTheme({ ...seed, scheme: 'light' }),
  };
}

const ember = pair({
  name: 'ember',
  label: '余烬',
  primary: palette.ember[500], // 暖品红
  neutral: '#2A1A22', // 暖调深中性
  accent: palette.sun[500], // 落日橙点缀
});
const verdant = pair({
  name: 'verdant',
  label: '苍翠',
  primary: palette.moss[500], // 森绿
  neutral: '#17241D', // 绿调深中性
  accent: palette.frost[500], // 霜青点缀
});
const solar = pair({
  name: 'solar',
  label: '曦光',
  primary: palette.sun[500], // 琥珀橙
  neutral: '#241E16', // 暖调深中性
  accent: palette.ember[500], // 品红点缀
});
const mono = pair({
  name: 'mono',
  label: '墨白',
  primary: '#71717A', // 中性 zinc,无彩
  neutral: '#18181B',
  accent: '#71717A',
});

export const emberDark = ember.dark;
export const emberLight = ember.light;
export const verdantDark = verdant.dark;
export const verdantLight = verdant.light;
export const solarDark = solar.dark;
export const solarLight = solar.light;
export const monoDark = mono.dark;
export const monoLight = mono.light;

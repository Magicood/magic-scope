import type { ThemeContract } from '../contract/contract';
import { arcaneDark } from './arcane';
import { arcaneLight } from './arcane-light';
import { frostDark, frostLight } from './frost';
import {
  emberDark,
  emberLight,
  monoDark,
  monoLight,
  solarDark,
  solarLight,
  verdantDark,
  verdantLight,
} from './presets';

export {
  arcaneDark,
  arcaneLight,
  emberDark,
  emberLight,
  frostDark,
  frostLight,
  monoDark,
  monoLight,
  solarDark,
  solarLight,
  verdantDark,
  verdantLight,
};

/** 内置预设主题(供 registerThemes 一次注册;深色奥术为默认)。 */
export const presetThemes: ThemeContract[] = [
  arcaneDark,
  arcaneLight,
  frostDark,
  frostLight,
  emberDark,
  emberLight,
  verdantDark,
  verdantLight,
  solarDark,
  solarLight,
  monoDark,
  monoLight,
];

/** 预设家族清单(name + label),供主题画廊 / 选择器动态渲染 —— 配色「多重选择」的数据源。 */
export const presetFamilies: ReadonlyArray<{ name: string; label: string }> = [
  { name: 'arcane', label: '奥术' },
  { name: 'frost', label: '霜蓝' },
  { name: 'ember', label: '余烬' },
  { name: 'verdant', label: '苍翠' },
  { name: 'solar', label: '曦光' },
  { name: 'mono', label: '墨白' },
];

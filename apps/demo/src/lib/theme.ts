import type { Density, FxPref, MotionPref } from '@magic-scope/tokens';
import { setDensity, setFx, setMotion, setTheme, withViewTransition } from '@magic-scope/tokens';
import { presetFamilies } from '@magic-scope/tokens/themes';

export type Scheme = 'dark' | 'light';

export interface ThemeState {
  preset: string;
  scheme: Scheme;
  density: Density;
  motion: MotionPref;
  fx: FxPref;
}

export const FAMILIES = presetFamilies;

export const DEFAULT_THEME: ThemeState = {
  preset: 'arcane',
  scheme: 'dark',
  density: 'comfortable',
  motion: 'full',
  fx: 'on',
};

/** 用 View Transitions 平滑切主题(降级时直接切),是组件库「一键换肤」的招牌效果。 */
export function applyPreset(preset: string, scheme: Scheme): void {
  withViewTransition(() => setTheme(preset, scheme));
}

export function applyDensity(density: Density): void {
  setDensity(density);
}

export function applyMotion(motion: MotionPref): void {
  setMotion(motion);
}

export function applyFx(fx: FxPref): void {
  // setFx 会写 data-ms-fx;app.css 的极光背景按 data-ms-fx='off' 隐藏,自动跟随。
  setFx(fx);
}

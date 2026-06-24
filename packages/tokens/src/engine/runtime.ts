import type { ThemeContract } from '../contract/contract';
import { applyTheme } from './inject';

export type ColorSchemePref = 'light' | 'dark' | 'system';
export type Density = 'comfortable' | 'compact' | 'spacious';
export type MotionPref = 'full' | 'subtle' | 'off';

const registry = new Map<string, ThemeContract>();

const themeKey = (name: string, scheme: 'light' | 'dark'): string => `${name}::${scheme}`;

/** 注册主题(按 name + colorScheme 索引),供 setTheme 按名切换。 */
export function registerTheme(theme: ThemeContract): void {
  registry.set(themeKey(theme.meta.name, theme.meta.colorScheme), theme);
}

export function registerThemes(themes: readonly ThemeContract[]): void {
  for (const theme of themes) {
    registerTheme(theme);
  }
}

export function getTheme(name: string, scheme: 'light' | 'dark'): ThemeContract | undefined {
  return registry.get(themeKey(name, scheme));
}

/** 把 system 偏好解析为具体 light/dark(无法判定时默认 dark,见决策)。 */
export function resolveScheme(pref: ColorSchemePref): 'light' | 'dark' {
  if (pref !== 'system') {
    return pref;
  }
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

/** 切换到指定主题家族 + 配色方案(应用变量 + data-ms-*)。仅浏览器环境。 */
export function setTheme(
  name: string,
  pref: ColorSchemePref = 'system',
  target?: HTMLElement,
): void {
  const scheme = resolveScheme(pref);
  const theme = getTheme(name, scheme) ?? getTheme(name, scheme === 'dark' ? 'light' : 'dark');
  if (!theme) {
    throw new Error(`[magic-scope] 未注册的主题: ${name}`);
  }
  applyTheme(theme, target);
}

export function setDensity(density: Density, target?: HTMLElement): void {
  (target ?? document.documentElement).dataset.msDensity = density;
}

export function setMotion(motion: MotionPref, target?: HTMLElement): void {
  (target ?? document.documentElement).dataset.msMotion = motion;
}

export type FxPref = 'on' | 'off';

/** 开关装饰性光影(发光 / 渐变);off 时 --ms-fx-glow 归零,聚焦环不受影响(保可达性)。 */
export function setFx(fx: FxPref, target?: HTMLElement): void {
  (target ?? document.documentElement).dataset.msFx = fx;
}

/** 用 View Transitions 平滑包裹一次切换;不支持或用户偏好 reduce 时直接执行。 */
export function withViewTransition(mutate: () => void): void {
  const reduce =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof document.startViewTransition === 'function' && !reduce) {
    document.startViewTransition(mutate);
  } else {
    mutate();
  }
}

export interface NoFlashOptions {
  storageKey?: string;
  defaultTheme?: string;
}

/**
 * 生成首屏无闪烁(no-FOUC)inline script:paint 前从 localStorage / system 设好 data-ms-*。
 * 用法:SSR 的 <head> 里 <script dangerouslySetInnerHTML={{ __html: getNoFlashScript() }} />。
 */
export function getNoFlashScript(options: NoFlashOptions = {}): string {
  const key = JSON.stringify(options.storageKey ?? 'ms-theme');
  const def = JSON.stringify(options.defaultTheme ?? 'arcane');
  return `(function(){try{var d=document.documentElement,raw=localStorage.getItem(${key}),o=raw?JSON.parse(raw):{};var t=o.theme||${def};var p=o.scheme||"system";var m=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;d.dataset.msTheme=t;d.dataset.msScheme=m;if(o.density)d.dataset.msDensity=o.density;if(o.motion)d.dataset.msMotion=o.motion;}catch(e){}})();`;
}

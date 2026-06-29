import { setDensity, setMotion, setTheme } from '@magic-scope/tokens';
import { useSyncExternalStore } from 'react';

// 展示站主题偏好的唯一真相源:顶栏与预设画廊共用同一份状态,任一处改动两边同步,
// 并持久化到 localStorage、启动时无闪烁恢复(配色/明暗 = setTheme,动效/密度/光影各自落地)。
export type Scheme = 'dark' | 'light';
export type Tri = 'full' | 'subtle' | 'off';
export type Density = 'comfortable' | 'compact' | 'spacious';

export interface ThemePrefs {
  /** 预设家族 name(arcane / frost / …),与 tokens presetFamilies 对应。 */
  family: string;
  scheme: Scheme;
  motion: Tri;
  /** 装饰光影强度档(驱动 data-ms-fx → --ms-fx-glow)。 */
  fx: Tri;
  density: Density;
}

const KEY = 'ms-showcase-theme';
const DEFAULTS: ThemePrefs = {
  family: 'arcane',
  scheme: 'dark',
  motion: 'full',
  fx: 'subtle',
  density: 'comfortable',
};

function load(): ThemePrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ThemePrefs>) };
  } catch {
    // localStorage 不可用(隐私模式 / SSR)时退回默认。
  }
  return { ...DEFAULTS };
}

let current = load();
const listeners = new Set<() => void>();

function apply(p: ThemePrefs): void {
  setTheme(p.family, p.scheme);
  setMotion(p.motion);
  setDensity(p.density);
  document.documentElement.dataset.msFx = p.fx;
}

/** 启动时调用(main.tsx 注册主题后):按持久化偏好落地,避免首屏闪烁。 */
export function applyInitialPrefs(): void {
  apply(current);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ThemePrefs {
  return current;
}

/** 改一部分偏好:更新真相源 → 持久化 → 落地 DOM → 通知所有订阅者(顶栏/画廊同步)。 */
export function setPrefs(patch: Partial<ThemePrefs>): void {
  current = { ...current, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // 无法持久化时仍然落地当前会话。
  }
  apply(current);
  for (const l of listeners) l();
}

/** React 订阅:顶栏与画廊都用它,任一处 setPrefs 两边即时同步。 */
export function useThemePrefs(): ThemePrefs {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

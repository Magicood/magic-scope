import {
  type ColorSchemePref,
  type Density,
  deriveTheme,
  type FxPref,
  type MotionPref,
  presetFamilies,
  presetThemes,
  registerProperties,
  registerThemes,
  setDensity,
  setFx,
  setMotion,
  setTheme,
  withViewTransition,
} from '@magic-scope/tokens';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/* ============================================================================
 * 外观四轴 —— 主题家族 × 明暗 × 密度 × 动效/光效,全站一处状态、双端共用。
 * 这是组件库「一键切换」能力的实战展示:全部走 tokens runtime,localStorage 持久化。
 * ========================================================================== */

/** 品牌主题 Arden:暖纸白 + 深 ink 主色 + 陶土点缀,由 deriveTheme 派生明暗双版。 */
const ardenSeed = {
  name: 'arden',
  label: 'Arden',
  primary: '#2A241C', // 深暖 ink —— 主 CTA 用深色而非亮色(编辑式零售质感)
  neutral: '#2B251E', // 暖调中性,浅色端派生出暖纸白底
  accent: '#A9603E', // 陶土,克制使用
};

export const ardenLight = deriveTheme({ ...ardenSeed, scheme: 'light' });
// 深色端主色翻转为暖 bone 白(深底上深 ink CTA 会隐身),陶土点缀提亮一档
export const ardenDark = deriveTheme({
  ...ardenSeed,
  primary: '#E7E1D5',
  accent: '#C08A63',
  scheme: 'dark',
});

/** 主题画廊数据源:品牌主题置顶,其后是库内置的 6 个预设家族。 */
export const themeFamilies: ReadonlyArray<{ name: string; label: string }> = [
  { name: 'arden', label: 'Arden' },
  ...presetFamilies,
];

export interface AppearanceState {
  theme: string;
  scheme: ColorSchemePref;
  density: Density;
  motion: MotionPref;
  fx: FxPref;
}

const DEFAULTS: AppearanceState = {
  theme: 'arden',
  scheme: 'light',
  density: 'comfortable',
  motion: 'full',
  fx: 'on',
};

const STORAGE_KEY = 'arden.appearance';

function loadStored(): AppearanceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<AppearanceState>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

function applyAll(state: AppearanceState): void {
  setTheme(state.theme, state.scheme);
  setDensity(state.density);
  setMotion(state.motion);
  setFx(state.fx);
}

/** 应用启动时调用一次:注册主题 + @property + 应用持久化偏好(渲染前,防错帧)。 */
export function bootstrapAppearance(): AppearanceState {
  registerThemes([...presetThemes, ardenLight, ardenDark]);
  registerProperties();
  const state = loadStored();
  applyAll(state);
  return state;
}

interface AppearanceContextValue {
  appearance: AppearanceState;
  /** 更新任意子集;主题/明暗变更自动包一层 View Transition 平滑过渡。 */
  update: (patch: Partial<AppearanceState>) => void;
  reset: () => void;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({
  initial,
  children,
}: {
  initial: AppearanceState;
  children: ReactNode;
}) {
  const [appearance, setAppearance] = useState<AppearanceState>(initial);

  const update = useCallback((patch: Partial<AppearanceState>) => {
    setAppearance((prev) => {
      const next = { ...prev, ...patch };
      const colorChanged = patch.theme !== undefined || patch.scheme !== undefined;
      const mutate = () => applyAll(next);
      if (colorChanged) {
        withViewTransition(mutate);
      } else {
        mutate();
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* 隐私模式等场景下持久化失败可忽略 */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => update(DEFAULTS), [update]);

  // scheme=system 时跟随系统明暗切换实时响应
  useEffect(() => {
    if (appearance.scheme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => withViewTransition(() => applyAll(appearance));
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [appearance]);

  const value = useMemo(() => ({ appearance, update, reset }), [appearance, update, reset]);
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceContextValue {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error('useAppearance 必须在 AppearanceProvider 内使用');
  return ctx;
}

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

/**
 * 品牌主题 Arden(Chromatic Grid)—— 冷灰白底 + 石墨字 + 饱和靛蓝主色。
 *
 * 与上一版(暖纸白 + 深棕 ink + 陶土)彻底切割:这一版的设计语言里
 * **色彩是版面骨架与信息编码**,不是点缀,所以主色必须是敢整块铺的饱和色。
 * 四个品类色由主色在 OKLCH 色相轮上等距旋转派生(见 shop.css 的 --cat-*),
 * 因此换任何主题家族,整套品类色都跟着转而彼此区分度不变。
 */
const ardenSeed = {
  name: 'arden',
  label: 'Arden',
  primary: '#2E48D6', // 靛蓝 —— 大色块主角
  neutral: '#1A1A22', // 冷调中性(略偏蓝),浅色端派生出冷灰白 ground
  accent: '#E2531D', // 朱红 —— 第二色,承担强调与 lighting 品类
};

export const ardenLight = deriveTheme({ ...ardenSeed, scheme: 'light' });
// 深色端把主色提亮一档(深底上 #2E48D6 压得住但对比不足),保持同色相
export const ardenDark = deriveTheme({
  ...ardenSeed,
  primary: '#6B85FF',
  accent: '#FF7A45',
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

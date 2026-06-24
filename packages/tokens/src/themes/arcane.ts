import type { ThemeContract } from '../contract/contract';
import { palette } from '../primitive/palette';
import { scale } from '../primitive/scale';

/** 暗底实底按钮的文字色(纯白对比不足 → 用最深 ink,见 DESIGN.md §3.4)。 */
const ink = palette.void[950];

/**
 * 深色奥术(Arcane) —— 开箱即用的默认预设主题(dark)。
 * 填满 ThemeContract:语义角色 → primitive 调色板的引用(单向依赖)。
 */
export const arcaneDark: ThemeContract = {
  meta: { name: 'arcane', colorScheme: 'dark', label: '深色奥术' },
  color: {
    bg: palette.void[950],
    surface: palette.void[900],
    surfaceRaised: palette.void[800],
    surfaceSunken: palette.void[950],
    overlay: 'rgba(10, 7, 16, 0.72)',
    fg: palette.void[50],
    fgMuted: palette.void[200],
    fgSubtle: palette.void[400],
    border: palette.void[700],
    borderStrong: palette.void[500],
    primary: palette.arcane[500],
    primaryHover: palette.arcane[400],
    primaryActive: palette.arcane[600],
    onPrimary: ink,
    accent: palette.ember[400],
    onAccent: ink,
    info: palette.frost[400],
    onInfo: ink,
    success: palette.moss[400],
    onSuccess: ink,
    warning: palette.sun[400],
    onWarning: ink,
    danger: palette.rose[500],
    onDanger: ink,
    link: palette.arcane[400],
    linkHover: palette.arcane[300],
    linkVisited: palette.ember[300],
    selection: palette.arcane[700],
    onSelection: palette.void[50],
    focusRing: palette.arcane[400],
    glow: palette.arcane[400],
  },
  dimension: {
    radius: {
      sm: scale.radius.sm,
      md: scale.radius.md,
      lg: scale.radius.lg,
      full: scale.radius.full,
    },
    space: {
      1: scale.space[1],
      2: scale.space[2],
      3: scale.space[3],
      4: scale.space[4],
      6: scale.space[6],
      8: scale.space[8],
    },
  },
  typography: {
    fontSans: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    fontDisplay: "'Cinzel', 'Cormorant Garamond', Georgia, serif",
    fontMono: "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace",
  },
  motion: {
    durationFast: scale.duration.fast,
    durationBase: scale.duration.base,
    easingStandard: scale.easing.standard,
    easingEmphasized: scale.easing.cast,
  },
};

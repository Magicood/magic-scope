import type { ThemeContract } from '../contract/contract';
import { palette } from '../primitive/palette';
import { sharedDimension, sharedMotion, sharedTypography } from './shared';

/** 暗底实底按钮的文字色(纯白对比不足 → 用最深 ink,见 DESIGN.md §3.4)。 */
const ink = palette.void[950];

/**
 * 深色(Arcane) —— 开箱即用的默认预设主题(dark)。
 * 底色族走中性 zinc 阶字面量(清爽、低底噪、衬托动效光影);品牌紫只保留在 primary/accent/selection/glow。
 * 填满 ThemeContract:语义角色 → primitive 或字面量。
 */
export const arcaneDark: ThemeContract = {
  meta: { name: 'arcane', colorScheme: 'dark', label: '深色' },
  color: {
    // 底色族:中性深灰(去紫调),相邻档明度差极小 → 层次柔、不跳块(WCAG AA 全过)。
    bg: '#0A0A0B',
    surface: '#141416',
    surfaceRaised: '#1C1C1F',
    surfaceSunken: '#08080A',
    overlay: 'rgba(8, 8, 10, 0.72)',
    fg: '#FAFAFA',
    fgMuted: '#A1A1AA',
    fgSubtle: '#797982',
    // 优雅简洁:用半透明白的极淡 hairline(融入背景、不抢眼),取代偏亮的紫灰硬线。
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
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
    selection: '#6D28D9',
    onSelection: '#FAFAFA',
    focusRing: palette.arcane[400],
    glow: palette.arcane[400],
  },
  dimension: sharedDimension,
  typography: sharedTypography,
  motion: sharedMotion,
};

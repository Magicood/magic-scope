import type { ThemeContract } from '../contract/contract';
import { palette } from '../primitive/palette';
import { sharedDimension, sharedMotion, sharedTypography } from './shared';

/**
 * 浅色奥术(Arcane) —— 默认预设主题的 light 变体。
 * 初版色值按 OKLCH 思路从 dark 反推(决策 16 授权);深色文字 on 浅底,对比天然充裕。
 * 后续 OKLCH 派生器接入后可精校。
 */
export const arcaneLight: ThemeContract = {
  meta: { name: 'arcane', colorScheme: 'light', label: '浅色奥术' },
  color: {
    bg: '#FAF8FF',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    surfaceSunken: palette.void[50],
    overlay: 'rgba(46, 40, 66, 0.40)',
    fg: palette.void[900],
    fgMuted: palette.void[600],
    fgSubtle: palette.void[500],
    border: palette.void[100],
    borderStrong: palette.void[200],
    primary: palette.arcane[600],
    primaryHover: palette.arcane[700],
    primaryActive: palette.arcane[800],
    onPrimary: '#FFFFFF',
    accent: palette.ember[600],
    onAccent: '#FFFFFF',
    info: palette.frost[600],
    onInfo: '#FFFFFF',
    success: palette.moss[600],
    onSuccess: '#FFFFFF',
    warning: palette.sun[600],
    onWarning: '#FFFFFF',
    danger: palette.rose[600],
    onDanger: '#FFFFFF',
    link: palette.arcane[600],
    linkHover: palette.arcane[700],
    linkVisited: palette.ember[700],
    selection: palette.arcane[200],
    onSelection: palette.void[900],
    focusRing: palette.arcane[500],
    glow: palette.arcane[400],
  },
  dimension: sharedDimension,
  typography: sharedTypography,
  motion: sharedMotion,
};

import type { ThemeContract } from '../contract/contract';
import { palette } from '../primitive/palette';
import { sharedDimension, sharedMotion, sharedTypography } from './shared';

/**
 * 浅色(Arcane) —— 默认预设主题的 light 变体。
 * 底色族走中性 zinc 阶字面量(清爽、留白);深色文字 on 浅底,对比充裕(WCAG AA 全过)。品牌紫只保留在 primary/accent/selection/glow。
 */
export const arcaneLight: ThemeContract = {
  meta: { name: 'arcane', colorScheme: 'light', label: '浅色' },
  color: {
    // 底色族:中性近白(去紫调),层次柔。
    bg: '#FCFCFD',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    surfaceSunken: '#F4F4F5',
    overlay: 'rgba(24, 24, 27, 0.40)',
    fg: '#18181B',
    fgMuted: '#52525B',
    fgSubtle: '#6E6E78',
    // 半透明黑 hairline(与 dark 的半透明白同一套思路)。
    border: 'rgba(24, 24, 27, 0.08)',
    borderStrong: 'rgba(24, 24, 27, 0.16)',
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
    selection: '#DDD6FE',
    onSelection: '#18181B',
    focusRing: palette.arcane[500],
    glow: palette.arcane[400],
  },
  dimension: sharedDimension,
  typography: sharedTypography,
  motion: sharedMotion,
};

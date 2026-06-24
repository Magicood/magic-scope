import type { ThemeContract } from '../contract/contract';
import { sharedDimension, sharedMotion, sharedTypography } from '../themes/shared';
import { deriveScale } from './deriveScale';

export interface DeriveThemeInput {
  name: string;
  scheme: 'light' | 'dark';
  label?: string;
  /** 主色 seed。 */
  primary: string;
  /** 中性色 seed(背景 / 文字 / 边框基);带轻微色相可让中性"沾"上品牌气质。 */
  neutral: string;
  accent?: string;
  info?: string;
  success?: string;
  warning?: string;
  danger?: string;
}

/**
 * 从少量 seed 色派生一套完整主题(填满 ThemeContract)。
 * 「随心变化但遵从核心」:给主色 + 中性色(+ 可选状态色)即得协调的多主题。
 * 值用 color-mix(运行时计算、零依赖);dark / light 按 scheme 取不同档位。
 */
export function deriveTheme(input: DeriveThemeInput): ThemeContract {
  const isDark = input.scheme === 'dark';
  const primary = deriveScale(input.primary);
  const neutral = deriveScale(input.neutral);
  const accent = deriveScale(input.accent ?? input.primary);
  const info = deriveScale(input.info ?? input.primary);
  const success = deriveScale(input.success ?? '#10B981');
  const warning = deriveScale(input.warning ?? '#F59E0B');
  const danger = deriveScale(input.danger ?? '#F43F5E');

  const ink = neutral[950];
  const paper = '#FFFFFF';

  const color: ThemeContract['color'] = isDark
    ? {
        bg: neutral[950],
        surface: neutral[900],
        surfaceRaised: neutral[800],
        surfaceSunken: neutral[950],
        overlay: `color-mix(in oklch, ${neutral[950]} 72%, transparent)`,
        fg: neutral[50],
        fgMuted: neutral[200],
        fgSubtle: neutral[400],
        border: neutral[700],
        borderStrong: neutral[500],
        primary: primary[500],
        primaryHover: primary[400],
        primaryActive: primary[600],
        onPrimary: ink,
        accent: accent[400],
        onAccent: ink,
        info: info[400],
        onInfo: ink,
        success: success[400],
        onSuccess: ink,
        warning: warning[400],
        onWarning: ink,
        danger: danger[500],
        onDanger: ink,
        link: primary[400],
        linkHover: primary[300],
        linkVisited: accent[300],
        selection: primary[700],
        onSelection: neutral[50],
        focusRing: primary[400],
        glow: primary[400],
      }
    : {
        bg: neutral[50],
        surface: paper,
        surfaceRaised: paper,
        surfaceSunken: neutral[100],
        overlay: `color-mix(in oklch, ${neutral[900]} 40%, transparent)`,
        fg: neutral[900],
        fgMuted: neutral[600],
        fgSubtle: neutral[500],
        border: neutral[200],
        borderStrong: neutral[300],
        primary: primary[600],
        primaryHover: primary[700],
        primaryActive: primary[800],
        onPrimary: paper,
        accent: accent[600],
        onAccent: paper,
        info: info[600],
        onInfo: paper,
        success: success[600],
        onSuccess: paper,
        warning: warning[600],
        onWarning: paper,
        danger: danger[600],
        onDanger: paper,
        link: primary[600],
        linkHover: primary[700],
        linkVisited: accent[700],
        selection: primary[200],
        onSelection: neutral[900],
        focusRing: primary[500],
        glow: primary[400],
      };

  const meta: ThemeContract['meta'] = input.label
    ? { name: input.name, colorScheme: input.scheme, label: input.label }
    : { name: input.name, colorScheme: input.scheme };

  return {
    meta,
    color,
    dimension: sharedDimension,
    typography: sharedTypography,
    motion: sharedMotion,
  };
}

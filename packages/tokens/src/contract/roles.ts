import type { ThemeContract } from './contract';

/**
 * color 角色键清单 —— 运行时可枚举,用于校验主题是否填满契约
 * (见 engine 的 assertValidTheme)。顺序即生成 CSS 变量的顺序。
 */
export const COLOR_ROLES = [
  'bg',
  'surface',
  'surfaceRaised',
  'surfaceSunken',
  'overlay',
  'fg',
  'fgMuted',
  'fgSubtle',
  'border',
  'borderStrong',
  'primary',
  'primaryHover',
  'primaryActive',
  'onPrimary',
  'accent',
  'onAccent',
  'info',
  'onInfo',
  'success',
  'onSuccess',
  'warning',
  'onWarning',
  'danger',
  'onDanger',
  'link',
  'linkHover',
  'linkVisited',
  'selection',
  'onSelection',
  'focusRing',
  'glow',
] as const;

export type ColorRole = (typeof COLOR_ROLES)[number];

/**
 * 编译期断言:COLOR_ROLES 必须与 ThemeContract['color'] 的键**完全一致**。
 * 任一侧漂移(加键忘了同步)都会让下面这行报类型错误,从而强制同步。
 */
export const _rolesInSyncWithContract: ColorRole extends keyof ThemeContract['color']
  ? keyof ThemeContract['color'] extends ColorRole
    ? true
    : never
  : never = true;

import type { ThemeContract } from '../contract/contract';

/** CSS 自定义属性前缀(magic-scope),见 DESIGN.md §8.3。 */
export const VAR_PREFIX = '--ms';

const kebab = (s: string): string => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/**
 * 把一份主题契约扁平化为 CSS 自定义属性 map(--ms-* 前缀 → 值)。
 * 映射:color.<role> → --ms-color-<kebab>;radius 与 space → --ms-radius-<k>、--ms-space-<k>;
 * 字体 → --ms-font-sans|display|mono;动效 → --ms-duration-fast|base、--ms-ease-standard|emphasized。
 */
export function themeToVars(theme: ThemeContract): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [role, value] of Object.entries(theme.color)) {
    vars[`${VAR_PREFIX}-color-${kebab(role)}`] = value;
  }
  for (const [k, v] of Object.entries(theme.dimension.radius)) {
    vars[`${VAR_PREFIX}-radius-${k}`] = v;
  }
  for (const [k, v] of Object.entries(theme.dimension.space)) {
    vars[`${VAR_PREFIX}-space-${k}`] = v;
  }
  vars[`${VAR_PREFIX}-font-sans`] = theme.typography.fontSans;
  vars[`${VAR_PREFIX}-font-display`] = theme.typography.fontDisplay;
  vars[`${VAR_PREFIX}-font-mono`] = theme.typography.fontMono;
  vars[`${VAR_PREFIX}-duration-fast`] = theme.motion.durationFast;
  vars[`${VAR_PREFIX}-duration-base`] = theme.motion.durationBase;
  vars[`${VAR_PREFIX}-ease-standard`] = theme.motion.easingStandard;
  vars[`${VAR_PREFIX}-ease-emphasized`] = theme.motion.easingEmphasized;
  return vars;
}

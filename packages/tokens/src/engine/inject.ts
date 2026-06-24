import type { ThemeContract } from '../contract/contract';
import { COLOR_ROLES } from '../contract/roles';
import { themeToVars } from './varName';

/** 校验主题填满契约的所有颜色角色;缺失即抛错(契约校验,见 DESIGN.md §10.3)。 */
export function assertValidTheme(theme: ThemeContract): void {
  const missing = COLOR_ROLES.filter((role) => !theme.color[role]);
  if (missing.length > 0) {
    throw new Error(`[magic-scope] 主题 "${theme.meta.name}" 缺少颜色角色: ${missing.join(', ')}`);
  }
}

/**
 * 把主题的 --ms-* 变量直接应用到目标元素(默认 <html>),并设置 data-ms-* 标记。
 * 切换 = 换一组变量(零重渲染、可被 CSS transition 平滑过渡,见 DESIGN.md §2)。
 * 仅在浏览器环境调用(依赖 DOM);SSR 请改用 compileThemeToCss 注入静态 CSS。
 */
export function applyTheme(theme: ThemeContract, target?: HTMLElement): void {
  assertValidTheme(theme);
  const el = target ?? document.documentElement;
  const vars = themeToVars(theme);
  for (const [k, v] of Object.entries(vars)) {
    el.style.setProperty(k, v);
  }
  el.dataset.msTheme = theme.meta.name;
  el.dataset.msScheme = theme.meta.colorScheme;
}

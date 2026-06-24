/**
 * @magic-scope/tokens — 设计 token 与主题引擎。
 *
 * 已实现:
 * - primitive 调色板 `palette`、数值刻度 `scale`
 * - 核心契约 `ThemeContract` + 角色清单 `COLOR_ROLES`
 * - 预设主题 `arcaneDark` / `arcaneLight`(`presetThemes`)
 * - 引擎:compileThemeToCss / applyTheme / setTheme / setDensity / setMotion /
 *   withViewTransition / getNoFlashScript / registerProperties
 *
 * 待实现(后续增量,见 DESIGN.md):OKLCH 派生器、CSS 静态产物 + 子路径导出、单测。
 */
export * from './contract/contract';
export * from './contract/roles';
export * from './derive/index';
export * from './engine/index';
export * from './primitive/palette';
export * from './primitive/scale';
export * from './themes/index';

export const version = '0.0.0';

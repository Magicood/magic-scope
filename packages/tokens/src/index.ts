/**
 * @magic-scope/tokens — 设计 token 与主题引擎。
 *
 * 已实现(数据 + 契约层):
 * - primitive 调色板 `palette`、数值刻度 `scale`
 * - 核心契约 `ThemeContract` + 角色清单 `COLOR_ROLES`
 * - 默认预设主题 `arcaneDark`(深色奥术)
 *
 * 待实现(后续增量,见 DESIGN.md):主题引擎 runtime(compile/inject/setTheme)、
 * OKLCH 派生器、arcane-light、CSS 变量产物、@property 注册。
 */
export * from './contract/contract';
export * from './contract/roles';
export * from './engine/index';
export * from './primitive/palette';
export * from './primitive/scale';
export * from './themes/index';

export const version = '0.0.0';

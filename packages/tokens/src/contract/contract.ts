/**
 * ThemeContract —— magic-scope 的「核心契约」(库的宪法)。
 *
 * 任何主题(预设或用户自定义)只要填满这份契约即「合法」,组件即可运行——
 * 这是「随心变化但遵从核心」的字面实现(DESIGN.md §2)。
 *
 * 增删键 = 破坏性版本(major)。角色集已按附录 A 决策 1 补齐常用角色
 * (overlay / selection / link / surfaceSunken)。
 */

/** 颜色角色值:任意合法 CSS 颜色字符串(hex / oklch / rgb / var() 等)。 */
export type ColorToken = string;

export interface ThemeContract {
  meta: {
    name: string;
    colorScheme: 'light' | 'dark';
    label?: string;
  };
  color: {
    // —— 表面 / 文字 ——
    bg: ColorToken;
    surface: ColorToken;
    surfaceRaised: ColorToken;
    surfaceSunken: ColorToken;
    overlay: ColorToken;
    fg: ColorToken;
    fgMuted: ColorToken;
    fgSubtle: ColorToken;
    // —— 边框 ——
    border: ColorToken;
    borderStrong: ColorToken;
    // —— 主色族 ——
    primary: ColorToken;
    primaryHover: ColorToken;
    primaryActive: ColorToken;
    onPrimary: ColorToken;
    // —— 状态色族(各带 on 前景) ——
    accent: ColorToken;
    onAccent: ColorToken;
    info: ColorToken;
    onInfo: ColorToken;
    success: ColorToken;
    onSuccess: ColorToken;
    warning: ColorToken;
    onWarning: ColorToken;
    danger: ColorToken;
    onDanger: ColorToken;
    // —— 链接 ——
    link: ColorToken;
    linkHover: ColorToken;
    linkVisited: ColorToken;
    // —— 选区 ——
    selection: ColorToken;
    onSelection: ColorToken;
    // —— 焦点 / 发光(魔法表达的语义化入口) ——
    focusRing: ColorToken;
    glow: ColorToken;
  };
  dimension: {
    radius: { sm: string; md: string; lg: string; full: string };
    space: { 1: string; 2: string; 3: string; 4: string; 6: string; 8: string };
  };
  typography: {
    fontSans: string;
    fontDisplay: string;
    fontMono: string;
  };
  motion: {
    durationFast: string;
    durationBase: string;
    easingStandard: string;
    easingEmphasized: string;
  };
}

import type { ThemeContract } from '../contract/contract';
import { themeToVars } from './varName';

export interface CompileOptions {
  /** CSS 选择器。默认 [data-ms-theme="<name>"];传 ':root' 可作默认主题。 */
  selector?: string;
}

/**
 * 把主题编译成 CSS 文本(含 color-scheme 与全部 --ms-* 变量声明)。
 * 构建期可把预设主题 compile 成静态 .css(SSR 首屏无闪烁,见 DESIGN.md §7.4)。
 */
export function compileThemeToCss(theme: ThemeContract, options: CompileOptions = {}): string {
  const selector = options.selector ?? `[data-ms-theme="${theme.meta.name}"]`;
  const vars = themeToVars(theme);
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `${selector} {\n  color-scheme: ${theme.meta.colorScheme};\n${body}\n}\n`;
}

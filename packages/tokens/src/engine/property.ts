/**
 * @property 注册 —— 让关键颜色变量成为「可补间」的自定义属性,
 * 从而主题切换 / hover 时颜色能平滑过渡而非瞬跳(见 DESIGN.md §3.5、§6)。
 * 不支持的浏览器:功能不降级,只是少了平滑(瞬跳)。
 */
const ANIMATABLE_COLOR_VARS = [
  '--ms-color-bg',
  '--ms-color-surface',
  '--ms-color-fg',
  '--ms-color-primary',
  '--ms-color-primary-hover',
  '--ms-color-accent',
  '--ms-color-focus-ring',
  '--ms-color-glow',
];

/** 生成 @property 声明文本(供构建期写入静态 CSS 或运行时注入 <style>)。 */
export function getPropertyDefinitions(): string {
  return ANIMATABLE_COLOR_VARS.map(
    (name) =>
      `@property ${name} {\n  syntax: "<color>";\n  inherits: true;\n  initial-value: transparent;\n}`,
  ).join('\n\n');
}

interface PropertyRegistrationCSS {
  registerProperty: (definition: {
    name: string;
    syntax: string;
    inherits: boolean;
    initialValue: string;
  }) => void;
}

/** 运行时注册 @property(CSS.registerProperty;不支持或已注册则安全忽略)。 */
export function registerProperties(): void {
  if (typeof CSS === 'undefined' || !('registerProperty' in CSS)) {
    return;
  }
  const css = CSS as unknown as PropertyRegistrationCSS;
  for (const name of ANIMATABLE_COLOR_VARS) {
    try {
      css.registerProperty({
        name,
        syntax: '<color>',
        inherits: true,
        initialValue: 'transparent',
      });
    } catch {
      // 该属性已注册:安全忽略
    }
  }
}

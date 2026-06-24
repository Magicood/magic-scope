import { describe, expect, it } from 'vitest';
import {
  arcaneDark,
  arcaneLight,
  assertValidTheme,
  COLOR_ROLES,
  compileThemeToCss,
  getNoFlashScript,
  getPropertyDefinitions,
  presetThemes,
  resolveScheme,
  themeToVars,
} from './index';

describe('contract / roles', () => {
  it('COLOR_ROLES 含 31 个角色', () => {
    expect(COLOR_ROLES.length).toBe(31);
  });
});

describe('themes', () => {
  it('所有预设主题都填满契约(assertValidTheme 不抛)', () => {
    for (const theme of presetThemes) {
      expect(() => assertValidTheme(theme)).not.toThrow();
    }
  });

  it('arcaneDark 为 dark、arcaneLight 为 light,且同属 arcane 家族', () => {
    expect(arcaneDark.meta.colorScheme).toBe('dark');
    expect(arcaneLight.meta.colorScheme).toBe('light');
    expect(arcaneDark.meta.name).toBe('arcane');
    expect(arcaneLight.meta.name).toBe('arcane');
  });
});

describe('engine / varName', () => {
  it('themeToVars 生成 48 个变量且 kebab 命名正确', () => {
    const vars = themeToVars(arcaneDark);
    expect(Object.keys(vars).length).toBe(48);
    expect(vars['--ms-color-surface-raised']).toBe(arcaneDark.color.surfaceRaised);
    expect(vars['--ms-color-primary']).toBe('#8B5CF6');
    expect(vars['--ms-ease-emphasized']).toBe(arcaneDark.motion.easingEmphasized);
  });
});

describe('engine / compile', () => {
  it('默认选择器含 theme 与 scheme,并写出 color-scheme 与变量', () => {
    const css = compileThemeToCss(arcaneDark);
    expect(css).toContain('[data-ms-theme="arcane"][data-ms-scheme="dark"]');
    expect(css).toContain('color-scheme: dark;');
    expect(css).toContain('--ms-color-bg: #0A0710;');
  });

  it('selector 可覆盖为 :root', () => {
    expect(compileThemeToCss(arcaneDark, { selector: ':root' })).toContain(':root {');
  });
});

describe('engine / assertValidTheme', () => {
  it('缺失颜色角色时抛错', () => {
    const broken = { ...arcaneDark, color: { ...arcaneDark.color, bg: '' } };
    expect(() => assertValidTheme(broken)).toThrow(/缺少颜色角色/);
  });
});

describe('engine / runtime', () => {
  it('resolveScheme:明确值原样返回,system 在无 window 时兜底 dark', () => {
    expect(resolveScheme('light')).toBe('light');
    expect(resolveScheme('dark')).toBe('dark');
    expect(resolveScheme('system')).toBe('dark');
  });

  it('getNoFlashScript 设置 data-ms-theme 且尊重默认主题', () => {
    const script = getNoFlashScript();
    expect(script).toContain('dataset.msTheme');
    expect(script).toContain('"arcane"');
  });
});

describe('engine / property', () => {
  it('getPropertyDefinitions 生成 8 个 @property 声明', () => {
    expect(getPropertyDefinitions().match(/@property/g)?.length).toBe(8);
  });
});

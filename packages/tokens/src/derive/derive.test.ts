import { describe, expect, it } from 'vitest';
import { assertValidTheme } from '../engine/inject';
import { deriveScale, deriveTheme } from './index';

describe('deriveScale', () => {
  it('生成 11 阶,500 为 seed 原色,两端为 color-mix', () => {
    const s = deriveScale('#8B5CF6');
    expect(Object.keys(s).length).toBe(11);
    expect(s[500]).toBe('#8B5CF6');
    expect(s[50]).toContain('color-mix(in oklch, white');
    expect(s[900]).toContain('color-mix(in oklch, black');
  });

  it('提亮档(50-400)混 white、加深档(600-950)混 black', () => {
    const s = deriveScale('#8B5CF6');
    for (const shade of [50, 100, 200, 300, 400] as const) {
      expect(s[shade]).toContain('color-mix(in oklch, white');
    }
    for (const shade of [600, 700, 800, 900, 950] as const) {
      expect(s[shade]).toContain('color-mix(in oklch, black');
    }
  });

  it('配比由浅到深递进(50=white 95% … 950=black 72%)', () => {
    const s = deriveScale('#8B5CF6');
    expect(s[50]).toContain('white 95%');
    expect(s[400]).toContain('white 30%');
    expect(s[600]).toContain('black 12%');
    expect(s[950]).toContain('black 72%');
  });

  it('确定性:同 seed 两次结果一致', () => {
    expect(deriveScale('#0EA5E9')).toEqual(deriveScale('#0EA5E9'));
  });
});

describe('deriveTheme', () => {
  it('单 seed 派生出填满契约的合法主题', () => {
    const theme = deriveTheme({
      name: 'ocean',
      scheme: 'dark',
      primary: '#0EA5E9',
      neutral: '#1E293B',
    });
    expect(() => assertValidTheme(theme)).not.toThrow();
    expect(theme.meta.colorScheme).toBe('dark');
    expect(theme.color.primary).toBe('#0EA5E9');
  });

  it('dark 与 light 取不同档位(背景不同)', () => {
    const base = { name: 'x', primary: '#0EA5E9', neutral: '#1E293B' } as const;
    const dark = deriveTheme({ ...base, scheme: 'dark' });
    const light = deriveTheme({ ...base, scheme: 'light' });
    expect(dark.color.bg).not.toBe(light.color.bg);
    expect(() => assertValidTheme(light)).not.toThrow();
  });

  it('确定性:同 input 两次派生完全一致', () => {
    const input = { name: 'x', scheme: 'dark', primary: '#0EA5E9', neutral: '#1E293B' } as const;
    expect(deriveTheme(input)).toEqual(deriveTheme(input));
  });

  it('状态色缺省用内置默认、显式给则覆盖', () => {
    const base = { name: 'x', scheme: 'dark', primary: '#0EA5E9', neutral: '#1E293B' } as const;
    const def = deriveTheme(base);
    const custom = deriveTheme({ ...base, danger: '#DC2626' });
    expect(def.color.danger).not.toBe(custom.color.danger);
  });

  it('accent / info 缺省回落到 primary seed', () => {
    const t = deriveTheme({ name: 'x', scheme: 'dark', primary: '#0EA5E9', neutral: '#1E293B' });
    expect(t.color.accent).toContain('#0EA5E9');
    expect(t.color.info).toContain('#0EA5E9');
  });

  it('onPrimary:light 为纸白、dark 为墨黑(= dark 的 surfaceSunken)', () => {
    const light = deriveTheme({
      name: 'x',
      scheme: 'light',
      primary: '#0EA5E9',
      neutral: '#1E293B',
    });
    expect(light.color.onPrimary).toBe('#FFFFFF');
    const dark = deriveTheme({ name: 'x', scheme: 'dark', primary: '#0EA5E9', neutral: '#1E293B' });
    expect(dark.color.onPrimary).toBe(dark.color.surfaceSunken);
  });

  it('所有颜色角色都派生出非空字符串', () => {
    const t = deriveTheme({ name: 'x', scheme: 'dark', primary: '#0EA5E9', neutral: '#1E293B' });
    for (const v of Object.values(t.color)) {
      expect(typeof v).toBe('string');
      expect((v as string).length).toBeGreaterThan(0);
    }
  });
});

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
});

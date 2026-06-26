import { describe, expect, it } from 'vitest';
import { assertValidTheme } from '../engine/inject';
import { arcaneDark } from './arcane';
import { frostDark, frostLight } from './frost';

describe('frost 预设(deriveTheme 派生)', () => {
  it('dark / light 都派生出合法契约', () => {
    expect(() => assertValidTheme(frostDark)).not.toThrow();
    expect(() => assertValidTheme(frostLight)).not.toThrow();
  });

  it('与默认 arcane 是不同的主题(主色不同)', () => {
    expect(frostDark.color.primary).not.toBe(arcaneDark.color.primary);
    expect(frostDark.color.primary).toBe('#0EA5E9');
  });

  it('meta 标注 name / scheme / label', () => {
    expect(frostDark.meta.name).toBe('frost');
    expect(frostDark.meta.colorScheme).toBe('dark');
    expect(frostDark.meta.label).toBe('霜蓝');
    expect(frostLight.meta.colorScheme).toBe('light');
  });

  it('dark 与 light 背景不同档', () => {
    expect(frostDark.color.bg).not.toBe(frostLight.color.bg);
  });
});

import { describe, expect, it } from 'vitest';
import { assertValidTheme } from '../engine/inject';
import { presetFamilies, presetThemes } from './index';
import {
  emberDark,
  emberLight,
  monoDark,
  monoLight,
  solarDark,
  solarLight,
  verdantDark,
  verdantLight,
} from './presets';

const derived = [
  emberDark,
  emberLight,
  verdantDark,
  verdantLight,
  solarDark,
  solarLight,
  monoDark,
  monoLight,
];

describe('派生预设(ember/verdant/solar/mono)', () => {
  it('全部派生出合法契约', () => {
    for (const t of derived) {
      expect(() => assertValidTheme(t)).not.toThrow();
    }
  });

  it('meta.name / colorScheme 正确', () => {
    expect(emberDark.meta.name).toBe('ember');
    expect(emberDark.meta.colorScheme).toBe('dark');
    expect(emberLight.meta.colorScheme).toBe('light');
    expect(monoDark.meta.name).toBe('mono');
    expect(verdantDark.meta.name).toBe('verdant');
    expect(solarDark.meta.name).toBe('solar');
  });
});

describe('presetThemes / presetFamilies(画廊数据源)', () => {
  it('共 6 家族 × 明暗 = 12 套', () => {
    expect(presetThemes.length).toBe(12);
    expect(new Set(presetThemes.map((t) => t.meta.name))).toEqual(
      new Set(['arcane', 'frost', 'ember', 'verdant', 'solar', 'mono']),
    );
  });

  it('presetFamilies 与 presetThemes 的家族一一对应(画廊不会漏/多)', () => {
    const families = presetFamilies.map((f) => f.name).sort();
    const themeNames = [...new Set(presetThemes.map((t) => t.meta.name))].sort();
    expect(families).toEqual(themeNames);
  });

  it('每个 family 都有 label(供画廊显示)', () => {
    for (const f of presetFamilies) {
      expect(f.label.length).toBeGreaterThan(0);
    }
  });
});

import { describe, expect, it } from 'vitest';
import {
  easeOutCubic,
  formatStatistic,
  groupThousands,
  interpolate,
  parseNumeric,
  roundToPrecision,
} from './logic';

describe('groupThousands', () => {
  it('每三位插入分隔符', () => {
    expect(groupThousands('1234567', ',')).toBe('1,234,567');
    expect(groupThousands('1000', ',')).toBe('1,000');
  });

  it('不足四位不插入', () => {
    expect(groupThousands('999', ',')).toBe('999');
    expect(groupThousands('1', ',')).toBe('1');
  });

  it('空分隔符或空串原样返回', () => {
    expect(groupThousands('1234567', '')).toBe('1234567');
    expect(groupThousands('', ',')).toBe('');
  });

  it('支持自定义分隔符(如空格 / 点)', () => {
    expect(groupThousands('1234567', ' ')).toBe('1 234 567');
    expect(groupThousands('1234567', '.')).toBe('1.234.567');
  });
});

describe('roundToPrecision', () => {
  it('按精度四舍五入并补零(取绝对值面)', () => {
    expect(roundToPrecision(3.456789, 2)).toBe('3.46');
    expect(roundToPrecision(3.1, 3)).toBe('3.100');
    expect(roundToPrecision(2.5, 0)).toBe('3');
  });

  it('不传精度保留原始形态', () => {
    expect(roundToPrecision(1234.5, undefined)).toBe('1234.5');
  });

  it('非有限数返回空串', () => {
    expect(roundToPrecision(Number.NaN, 2)).toBe('');
    expect(roundToPrecision(Number.POSITIVE_INFINITY, 2)).toBe('');
  });

  it('负精度按 0 处理', () => {
    expect(roundToPrecision(3.9, -1)).toBe('4');
  });
});

describe('parseNumeric', () => {
  it('解析合法数字串', () => {
    expect(parseNumeric('1234.5')).toBe(1234.5);
    expect(parseNumeric('  -42 ')).toBe(-42);
  });

  it('非数字串 / 空串返回 null', () => {
    expect(parseNumeric('N/A')).toBeNull();
    expect(parseNumeric('')).toBeNull();
    expect(parseNumeric('   ')).toBeNull();
  });
});

describe('formatStatistic', () => {
  it('数值:插千分位 + 应用精度 + 拆三段', () => {
    const r = formatStatistic(1234567.891, { precision: 2 });
    expect(r.numeric).toBe(true);
    expect(r.sign).toBe('');
    expect(r.integer).toBe('1,234,567');
    expect(r.fraction).toBe('89');
    expect(r.decimalPoint).toBe('.');
    expect(r.display).toBe('1,234,567.89');
  });

  it('负数:sign 为 - 且整数部分不含负号', () => {
    const r = formatStatistic(-9876.5, { precision: 1 });
    expect(r.sign).toBe('-');
    expect(r.integer).toBe('9,876');
    expect(r.fraction).toBe('5');
    expect(r.display).toBe('-9,876.5');
  });

  it('无小数时 fraction / decimalPoint 为空', () => {
    const r = formatStatistic(1000, { precision: 0 });
    expect(r.fraction).toBe('');
    expect(r.decimalPoint).toBe('');
    expect(r.display).toBe('1,000');
  });

  it('数字串被解析并同样格式化', () => {
    const r = formatStatistic('1234.5', { precision: 2 });
    expect(r.numeric).toBe(true);
    expect(r.display).toBe('1,234.50');
  });

  it('非数字串原样透传(numeric=false,不插分隔符)', () => {
    const r = formatStatistic('N/A', { precision: 2 });
    expect(r.numeric).toBe(false);
    expect(r.display).toBe('N/A');
    expect(r.integer).toBe('N/A');
    expect(r.fraction).toBe('');
  });

  it('空分隔符关闭分组', () => {
    const r = formatStatistic(1234567, { groupSeparator: '' });
    expect(r.integer).toBe('1234567');
  });

  it('默认分隔符为逗号', () => {
    const r = formatStatistic(1000000);
    expect(r.integer).toBe('1,000,000');
  });

  // —— 回归:负数四舍五入到 0 不应残留虚假负号(HIGH) ——
  it('负数四舍五入到 0 时不显示负号(-0.4 precision=0 → "0" 而非 "-0")', () => {
    const r = formatStatistic(-0.4, { precision: 0 });
    expect(r.sign).toBe('');
    expect(r.integer).toBe('0');
    expect(r.fraction).toBe('');
    expect(r.display).toBe('0');
  });

  it('负数四舍五入后仍非 0 时保留负号', () => {
    const r = formatStatistic(-0.6, { precision: 0 });
    expect(r.sign).toBe('-');
    expect(r.display).toBe('-1');
  });

  it('-0 直接传入也不显示负号', () => {
    const r = formatStatistic(-0, { precision: 2 });
    expect(r.sign).toBe('');
    expect(r.display).toBe('0.00');
  });

  // —— 回归:groupSeparator 与小数点冲突消歧(MEDIUM) ——
  it('存在小数位且分隔符为 "." 时千分位退回 ",",避免歧义 "1.234.5"', () => {
    const r = formatStatistic(1234.5, { precision: 1, groupSeparator: '.' });
    expect(r.integer).toBe('1,234');
    expect(r.display).toBe('1,234.5');
  });

  it('无小数位时分隔符 "." 仍可用作千分位', () => {
    const r = formatStatistic(1234567, { precision: 0, groupSeparator: '.' });
    expect(r.integer).toBe('1.234.567');
    expect(r.display).toBe('1.234.567');
  });

  // —— 回归:科学计数法泄漏(MEDIUM) ——
  it('无 precision 的极大数不泄漏科学计数法', () => {
    const r = formatStatistic(1e21);
    expect(r.display).not.toContain('e');
    expect(r.display).not.toContain('E');
    expect(r.integer).toBe('1,000,000,000,000,000,000,000');
  });

  it('无 precision 的极小数不泄漏科学计数法', () => {
    const r = formatStatistic(1e-7);
    expect(r.display).not.toMatch(/[eE]/);
    expect(r.fraction).toBe('0000001');
    expect(r.display).toBe('0.0000001');
  });

  // —— 回归:NaN/Infinity number 不被吞成 "0"(LOW) ——
  it('NaN(number)走非数值分支,不渲染为 "0"', () => {
    const r = formatStatistic(Number.NaN);
    expect(r.numeric).toBe(false);
    expect(r.integer).not.toBe('0');
    expect(r.display).toBe('NaN');
  });

  it('Infinity(number)走非数值分支,不渲染为 "0"', () => {
    const r = formatStatistic(Number.POSITIVE_INFINITY, { precision: 2 });
    expect(r.numeric).toBe(false);
    expect(r.display).toBe('Infinity');
  });
});

describe('roundToPrecision 无 precision 定点串(科学计数法回退)', () => {
  it('极大数走定点而非科学计数法', () => {
    expect(roundToPrecision(1e21, undefined)).toBe('1000000000000000000000');
  });

  it('极小数走定点而非科学计数法', () => {
    expect(roundToPrecision(1e-7, undefined)).toBe('0.0000001');
  });

  it('普通数保持原形态', () => {
    expect(roundToPrecision(1234.5, undefined)).toBe('1234.5');
  });
});

describe('interpolate', () => {
  it('在 [0,1] 内线性插值', () => {
    expect(interpolate(0, 100, 0)).toBe(0);
    expect(interpolate(0, 100, 0.5)).toBe(50);
    expect(interpolate(0, 100, 1)).toBe(100);
  });

  it('进度越界被夹紧', () => {
    expect(interpolate(0, 100, -1)).toBe(0);
    expect(interpolate(0, 100, 2)).toBe(100);
  });
});

describe('easeOutCubic', () => {
  it('端点为 0 / 1 且单调缓出', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    // 缓出:前段进度快于线性
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });

  it('越界夹紧', () => {
    expect(easeOutCubic(-0.5)).toBe(0);
    expect(easeOutCubic(1.5)).toBe(1);
  });
});

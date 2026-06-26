import { describe, expect, it } from 'vitest';
import { addMany, canAdd, isDuplicate, normalizeTag, splitByDelimiters, toTagArray } from './logic';

describe('normalizeTag', () => {
  it('去首尾空白', () => {
    expect(normalizeTag('  react  ')).toBe('react');
    expect(normalizeTag('\tvue\n')).toBe('vue');
  });
  it('纯空白规整为空串', () => {
    expect(normalizeTag('   ')).toBe('');
    expect(normalizeTag('')).toBe('');
  });
});

describe('isDuplicate', () => {
  it('默认大小写不敏感', () => {
    expect(isDuplicate(['React'], 'react')).toBe(true);
    expect(isDuplicate(['React'], 'vue')).toBe(false);
  });
  it('caseSensitive=true 区分大小写', () => {
    expect(isDuplicate(['React'], 'react', true)).toBe(false);
    expect(isDuplicate(['react'], 'react', true)).toBe(true);
  });
});

describe('splitByDelimiters', () => {
  it('按多个分隔符切分并规整、剔除空段', () => {
    expect(splitByDelimiters('a, b ;c', [',', ';'])).toEqual(['a', 'b', 'c']);
  });
  it('连续分隔符不产生空标签', () => {
    expect(splitByDelimiters('a,,,b', [','])).toEqual(['a', 'b']);
  });
  it('转义正则元字符的分隔符(如 . | $)', () => {
    expect(splitByDelimiters('a.b.c', ['.'])).toEqual(['a', 'b', 'c']);
    expect(splitByDelimiters('a|b', ['|'])).toEqual(['a', 'b']);
  });
  it('支持多字符分隔符', () => {
    expect(splitByDelimiters('a::b::c', ['::'])).toEqual(['a', 'b', 'c']);
  });
  it('空分隔符表回退为整串规整', () => {
    expect(splitByDelimiters('  hello world  ', [])).toEqual(['hello world']);
    expect(splitByDelimiters('   ', [])).toEqual([]);
  });
});

describe('canAdd', () => {
  it('空标签被拒(empty)', () => {
    expect(canAdd([], '')).toEqual({ ok: false, reason: 'empty' });
  });
  it('达到 maxTags 被拒(max)', () => {
    expect(canAdd(['a', 'b'], 'c', { maxTags: 2 })).toEqual({ ok: false, reason: 'max' });
    expect(canAdd(['a'], 'b', { maxTags: 2 })).toEqual({ ok: true });
  });
  it('默认拒重复(duplicate),大小写不敏感', () => {
    expect(canAdd(['React'], 'react')).toEqual({ ok: false, reason: 'duplicate' });
  });
  it('allowDuplicates=true 放行重复', () => {
    expect(canAdd(['react'], 'react', { allowDuplicates: true })).toEqual({ ok: true });
  });
  it('caseSensitive=true 时大小写不同视为可加', () => {
    expect(canAdd(['React'], 'react', { caseSensitive: true })).toEqual({ ok: true });
  });
  it('validate 返回 false 被拒(invalid)', () => {
    const validate = (t: string) => t.length >= 3;
    expect(canAdd([], 'ab', { validate })).toEqual({ ok: false, reason: 'invalid' });
    expect(canAdd([], 'abc', { validate })).toEqual({ ok: true });
  });
  it('validate 抛错也视为 invalid(不冒泡)', () => {
    const validate = () => {
      throw new Error('boom');
    };
    expect(canAdd([], 'x', { validate })).toEqual({ ok: false, reason: 'invalid' });
  });
  it('判定顺序:空在超限之前', () => {
    expect(canAdd(['a', 'b'], '', { maxTags: 2 })).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('addMany', () => {
  it('依次加入并规整,跳过被拒项', () => {
    expect(addMany(['a'], [' b ', 'a', 'c'])).toEqual(['a', 'b', 'c']);
  });
  it('一批内自我去重', () => {
    expect(addMany([], ['x', 'X', 'x'])).toEqual(['x']);
  });
  it('受 maxTags 累积约束', () => {
    expect(addMany([], ['a', 'b', 'c', 'd'], { maxTags: 2 })).toEqual(['a', 'b']);
  });
  it('不修改入参', () => {
    const input = ['a'];
    addMany(input, ['b']);
    expect(input).toEqual(['a']);
  });
});

describe('toTagArray', () => {
  it('undefined → 空数组', () => {
    expect(toTagArray(undefined)).toEqual([]);
  });
  it('返回拷贝(不与入参同引用)', () => {
    const src = ['a', 'b'];
    const out = toTagArray(src);
    expect(out).toEqual(['a', 'b']);
    expect(out).not.toBe(src);
  });
});

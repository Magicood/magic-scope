import { describe, expect, it } from 'vitest';
import { resolveDataAttrs, resolveFxAttr, resolveMotionAttr } from './logic';

describe('ConfigProvider logic', () => {
  it('未给任何开关时返回空属性集合(继承祖先 / 用根基线)', () => {
    expect(resolveDataAttrs({})).toEqual({});
  });

  it('density 原样落到 data-ms-density', () => {
    expect(resolveDataAttrs({ density: 'compact' })).toEqual({
      'data-ms-density': 'compact',
    });
    expect(resolveDataAttrs({ density: 'spacious' })['data-ms-density']).toBe('spacious');
  });

  it('motion 友好别名归一到 effects.css 实际属性值', () => {
    expect(resolveMotionAttr('on')).toBe('full');
    expect(resolveMotionAttr('reduced')).toBe('subtle');
    expect(resolveMotionAttr('subtle')).toBe('subtle');
    expect(resolveMotionAttr('off')).toBe('off');
    expect(resolveMotionAttr('full')).toBe('full');
  });

  it('fx 友好别名归一(on → full)', () => {
    expect(resolveFxAttr('on')).toBe('full');
    expect(resolveFxAttr('subtle')).toBe('subtle');
    expect(resolveFxAttr('off')).toBe('off');
  });

  it('多个开关一并解析,motion/fx 经归一后落属性', () => {
    expect(
      resolveDataAttrs({ density: 'comfortable', motion: 'off', fx: 'on', tone: 'accent' }),
    ).toEqual({
      'data-ms-density': 'comfortable',
      'data-ms-motion': 'off',
      'data-ms-fx': 'full',
      'data-ms-tone': 'accent',
    });
  });

  it('只设部分开关时,未设的开关不落属性', () => {
    const attrs = resolveDataAttrs({ motion: 'reduced' });
    expect(attrs).toEqual({ 'data-ms-motion': 'subtle' });
    expect(attrs).not.toHaveProperty('data-ms-density');
    expect(attrs).not.toHaveProperty('data-ms-fx');
    expect(attrs).not.toHaveProperty('data-ms-tone');
  });

  it('tone 原样落到 data-ms-tone', () => {
    expect(resolveDataAttrs({ tone: 'danger' })['data-ms-tone']).toBe('danger');
  });
});

import { describe, expect, it } from 'vitest';
import {
  denormalizeToggleValue,
  edgeIndex,
  normalizeToggleValue,
  resolveToolbarIntent,
  stepIndex,
  toggleValue,
} from './logic';

describe('resolveToolbarIntent', () => {
  it('横向:左右移动,上下不拦截', () => {
    expect(resolveToolbarIntent('ArrowRight', 'horizontal')).toEqual({ type: 'move', dir: 1 });
    expect(resolveToolbarIntent('ArrowLeft', 'horizontal')).toEqual({ type: 'move', dir: -1 });
    expect(resolveToolbarIntent('ArrowDown', 'horizontal')).toBeNull();
    expect(resolveToolbarIntent('ArrowUp', 'horizontal')).toBeNull();
  });

  it('纵向:上下移动,左右不拦截', () => {
    expect(resolveToolbarIntent('ArrowDown', 'vertical')).toEqual({ type: 'move', dir: 1 });
    expect(resolveToolbarIntent('ArrowUp', 'vertical')).toEqual({ type: 'move', dir: -1 });
    expect(resolveToolbarIntent('ArrowRight', 'vertical')).toBeNull();
    expect(resolveToolbarIntent('ArrowLeft', 'vertical')).toBeNull();
  });

  it('Home/End 两朝向通用', () => {
    expect(resolveToolbarIntent('Home', 'horizontal')).toEqual({ type: 'edge', dir: -1 });
    expect(resolveToolbarIntent('End', 'vertical')).toEqual({ type: 'edge', dir: 1 });
  });

  it('其它键返回 null', () => {
    expect(resolveToolbarIntent('Enter', 'horizontal')).toBeNull();
    expect(resolveToolbarIntent('a', 'vertical')).toBeNull();
  });
});

describe('stepIndex', () => {
  it('正向移动并环形回绕', () => {
    expect(stepIndex(3, 0, 1)).toBe(1);
    expect(stepIndex(3, 2, 1)).toBe(0);
  });

  it('反向移动并环形回绕', () => {
    expect(stepIndex(3, 0, -1)).toBe(2);
    expect(stepIndex(3, 1, -1)).toBe(0);
  });

  it('空数组返回 -1', () => {
    expect(stepIndex(0, 0, 1)).toBe(-1);
  });
});

describe('edgeIndex', () => {
  it('首尾索引', () => {
    expect(edgeIndex(4, -1)).toBe(0);
    expect(edgeIndex(4, 1)).toBe(3);
    expect(edgeIndex(0, 1)).toBe(-1);
  });
});

describe('toggleValue single', () => {
  it('选中未选项返回单元素', () => {
    expect(toggleValue('single', [], 'a', false)).toEqual(['a']);
    expect(toggleValue('single', ['b'], 'a', false)).toEqual(['a']);
  });

  it('点已选项:默认维持,allowDeselect 时清空', () => {
    expect(toggleValue('single', ['a'], 'a', false)).toEqual(['a']);
    expect(toggleValue('single', ['a'], 'a', true)).toEqual([]);
  });
});

describe('toggleValue multiple', () => {
  it('增删翻转', () => {
    expect(toggleValue('multiple', ['a'], 'b', false)).toEqual(['a', 'b']);
    expect(toggleValue('multiple', ['a', 'b'], 'a', false)).toEqual(['b']);
  });
});

describe('normalize / denormalize', () => {
  it('single 受控值归一', () => {
    expect(normalizeToggleValue('single', 'a')).toEqual(['a']);
    expect(normalizeToggleValue('single', null)).toEqual([]);
    expect(normalizeToggleValue('single', ['a', 'b'])).toEqual(['a']);
  });

  it('multiple 受控值归一', () => {
    expect(normalizeToggleValue('multiple', ['a', 'b'])).toEqual(['a', 'b']);
    expect(normalizeToggleValue('multiple', 'a')).toEqual(['a']);
    expect(normalizeToggleValue('multiple', undefined)).toEqual([]);
  });

  it('denormalize 还原对外形态', () => {
    expect(denormalizeToggleValue('single', ['a'])).toBe('a');
    expect(denormalizeToggleValue('single', [])).toBeNull();
    expect(denormalizeToggleValue('multiple', ['a', 'b'])).toEqual(['a', 'b']);
  });
});

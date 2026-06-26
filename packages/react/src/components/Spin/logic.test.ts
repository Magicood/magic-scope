import { describe, expect, it } from 'vitest';
import { shouldShow } from './logic';

describe('Spin/logic shouldShow', () => {
  it('spinning=false 时永远不显示(delay/elapsed 不影响)', () => {
    expect(shouldShow(false)).toBe(false);
    expect(shouldShow(false, 300, 999999)).toBe(false);
    expect(shouldShow(false, 0, 0)).toBe(false);
  });

  it('spinning=true 且无 delay(默认 0)立即显示', () => {
    expect(shouldShow(true)).toBe(true);
    expect(shouldShow(true, 0)).toBe(true);
    expect(shouldShow(true, 0, 0)).toBe(true);
  });

  it('spinning=true 且 delay<=0 立即显示', () => {
    expect(shouldShow(true, -100, 0)).toBe(true);
  });

  it('spinning=true 且有正 delay:elapsed 未达 delay 不显示', () => {
    expect(shouldShow(true, 300, 0)).toBe(false);
    expect(shouldShow(true, 300, 299)).toBe(false);
  });

  it('spinning=true 且有正 delay:elapsed 达到/超过 delay 才显示(边界含等于)', () => {
    expect(shouldShow(true, 300, 300)).toBe(true);
    expect(shouldShow(true, 300, 301)).toBe(true);
  });

  it('elapsed 缺省按 0 处理(刚置真还没等够)', () => {
    expect(shouldShow(true, 200)).toBe(false);
  });

  it('elapsed 为负值按 0 处理', () => {
    expect(shouldShow(true, 200, -50)).toBe(false);
  });

  it('delay 为非有限值(Infinity / NaN)视作无延迟立即显示', () => {
    expect(shouldShow(true, Number.POSITIVE_INFINITY, 0)).toBe(true);
    expect(shouldShow(true, Number.NaN, 0)).toBe(true);
  });

  it('elasped 为非有限值按 0 处理(不误判为已达 delay)', () => {
    expect(shouldShow(true, 200, Number.POSITIVE_INFINITY)).toBe(false);
    expect(shouldShow(true, 200, Number.NaN)).toBe(false);
  });
});

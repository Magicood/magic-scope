import { describe, expect, it } from 'vitest';
import { clampIndex, dragToStep, nextIndex, prevIndex, resolveGoTo, shouldAutoplay } from './logic';

describe('clampIndex', () => {
  it('在区间内原样返回', () => {
    expect(clampIndex(2, 5)).toBe(2);
  });
  it('负数夹到 0、超界夹到末位', () => {
    expect(clampIndex(-3, 5)).toBe(0);
    expect(clampIndex(9, 5)).toBe(4);
  });
  it('count<=0 返回 0(空轮播)', () => {
    expect(clampIndex(3, 0)).toBe(0);
    expect(clampIndex(3, -1)).toBe(0);
  });
});

describe('nextIndex', () => {
  it('普通前进 +1', () => {
    expect(nextIndex(1, 4, false)).toBe(2);
  });
  it('末位 loop=true 环绕回首张', () => {
    expect(nextIndex(3, 4, true)).toBe(0);
  });
  it('末位 loop=false 停在末位', () => {
    expect(nextIndex(3, 4, false)).toBe(3);
  });
  it('count<=0 返回 0', () => {
    expect(nextIndex(0, 0, true)).toBe(0);
  });
});

describe('prevIndex', () => {
  it('普通后退 -1', () => {
    expect(prevIndex(2, 4, false)).toBe(1);
  });
  it('首张 loop=true 环绕到末张', () => {
    expect(prevIndex(0, 4, true)).toBe(3);
  });
  it('首张 loop=false 停在首张', () => {
    expect(prevIndex(0, 4, false)).toBe(0);
  });
});

describe('resolveGoTo', () => {
  it('loop=false 夹取越界', () => {
    expect(resolveGoTo(10, 4, false)).toBe(3);
    expect(resolveGoTo(-2, 4, false)).toBe(0);
  });
  it('loop=true 取模环绕(含负数)', () => {
    expect(resolveGoTo(5, 4, true)).toBe(1);
    expect(resolveGoTo(-1, 4, true)).toBe(3);
  });
  it('count<=0 返回 0', () => {
    expect(resolveGoTo(2, 0, true)).toBe(0);
  });
});

describe('shouldAutoplay', () => {
  const base = {
    autoplay: true,
    interval: 3000,
    count: 3,
    paused: false,
    motionOff: false,
  };
  it('全条件满足时为 true', () => {
    expect(shouldAutoplay(base)).toBe(true);
  });
  it('autoplay 关 / 暂停 / motionOff 任一为真即 false', () => {
    expect(shouldAutoplay({ ...base, autoplay: false })).toBe(false);
    expect(shouldAutoplay({ ...base, paused: true })).toBe(false);
    expect(shouldAutoplay({ ...base, motionOff: true })).toBe(false);
  });
  it('间隔非正 / 少于两张即 false', () => {
    expect(shouldAutoplay({ ...base, interval: 0 })).toBe(false);
    expect(shouldAutoplay({ ...base, count: 1 })).toBe(false);
  });
});

describe('dragToStep', () => {
  it('位移不足阈值不翻页', () => {
    expect(dragToStep(20, 50)).toBe(0);
    expect(dragToStep(-20, 50)).toBe(0);
  });
  it('正位移(向终点方向拖)看上一张 -1', () => {
    expect(dragToStep(80, 50)).toBe(-1);
  });
  it('负位移看下一张 +1', () => {
    expect(dragToStep(-80, 50)).toBe(1);
  });
});

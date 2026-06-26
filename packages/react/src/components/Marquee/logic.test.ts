import { describe, expect, it } from 'vitest';
import {
  cycleDistance,
  isVerticalDirection,
  type MarqueeDirection,
  repeatCount,
  resolveDuration,
  shouldAnimate,
  shouldReverseAnimation,
  trackTranslatePercent,
} from './logic';

describe('isVerticalDirection', () => {
  it('up / down 为纵向,left / right 为横向', () => {
    expect(isVerticalDirection('up')).toBe(true);
    expect(isVerticalDirection('down')).toBe(true);
    expect(isVerticalDirection('left')).toBe(false);
    expect(isVerticalDirection('right')).toBe(false);
  });
});

describe('shouldReverseAnimation', () => {
  it('基准方向 left/up 不 reverse,right/down 需 reverse', () => {
    expect(shouldReverseAnimation('left', false)).toBe(false);
    expect(shouldReverseAnimation('up', false)).toBe(false);
    expect(shouldReverseAnimation('right', false)).toBe(true);
    expect(shouldReverseAnimation('down', false)).toBe(true);
  });

  it('reverse 形参与方向异或:同真相互抵消', () => {
    // right 本就 reverse,再叠加 reverse=true → 抵消回正向
    expect(shouldReverseAnimation('right', true)).toBe(false);
    // left 本不 reverse,叠加 reverse=true → 反向
    expect(shouldReverseAnimation('left', true)).toBe(true);
  });
});

describe('resolveDuration', () => {
  it('一圈秒数 = 内容尺寸 / 速度', () => {
    expect(resolveDuration(800, 100)).toBe(8);
    expect(resolveDuration(50, 50)).toBe(1);
  });

  it('内容尺寸 / 速度非法(<=0 或非有限)时回退 fallback', () => {
    expect(resolveDuration(0, 100)).toBe(20);
    expect(resolveDuration(-5, 100)).toBe(20);
    expect(resolveDuration(800, 0)).toBe(20);
    expect(resolveDuration(800, -10)).toBe(20);
    expect(resolveDuration(Number.NaN, 100)).toBe(20);
    // 速度非有限(Infinity)也回退 fallback,而非算出 0
    expect(resolveDuration(800, Number.POSITIVE_INFINITY, 9)).toBe(9);
  });

  it('可自定义 fallback', () => {
    expect(resolveDuration(0, 0, 12)).toBe(12);
  });
});

describe('cycleDistance', () => {
  it('一圈真实位移 = 单份 + 一个份间距(gap)', () => {
    // 这是无缝循环的核心:重复周期含 gap,绝不能只算单份
    expect(cycleDistance(200, 16)).toBe(216);
    expect(cycleDistance(800, 24)).toBe(824);
  });

  it('gap 为 0 时退化为「仅单份」(与无 gap 旧行为一致)', () => {
    expect(cycleDistance(200, 0)).toBe(200);
  });

  it('非有限 / 负的入参按 0 计入,不污染结果', () => {
    expect(cycleDistance(200, Number.NaN)).toBe(200);
    expect(cycleDistance(200, -10)).toBe(200);
    expect(cycleDistance(Number.NaN, 16)).toBe(16);
    expect(cycleDistance(-5, 16)).toBe(16);
  });

  it('speed→duration 必须用含 gap 的距离:非零 gap 下比仅单份更慢(px/s 才准)', () => {
    // 单份 200,gap 16,speed 100 → 真实一圈 216px ÷ 100 = 2.16s
    const real = resolveDuration(cycleDistance(200, 16), 100);
    expect(real).toBeCloseTo(2.16, 5);
    // 若错误地只用单份(旧 bug)→ 2.0s,比真实快(走完一圈实际要 2.16s)
    const buggy = resolveDuration(200, 100);
    expect(real).toBeGreaterThan(buggy);
  });
});

describe('repeatCount', () => {
  it('内容比容器窄时补足到能铺满 + 1 份冗余', () => {
    // 容器 1000,内容 300 → ceil(1000/300)=4,+1=5
    expect(repeatCount(1000, 300)).toBe(5);
    // 容器 1000,内容 600 → ceil(1000/600)=2,+1=3
    expect(repeatCount(1000, 600)).toBe(3);
  });

  it('内容已比容器宽时仍至少 min 份(默认 2)', () => {
    // 容器 200,内容 800 → ceil(0.25)=1,+1=2,min=2 → 2
    expect(repeatCount(200, 800)).toBe(2);
  });

  it('尺寸未测得(<=0)退回 min', () => {
    expect(repeatCount(1000, 0)).toBe(2);
    expect(repeatCount(0, 300)).toBe(2);
    expect(repeatCount(Number.NaN, 300)).toBe(2);
  });

  it('可指定更大的 min,并向下取整保护', () => {
    expect(repeatCount(100, 1000, 4)).toBe(4);
    expect(repeatCount(1000, 200, 2)).toBe(6);
  });
});

describe('trackTranslatePercent', () => {
  it('位移 = -100 / 份数', () => {
    expect(trackTranslatePercent(2)).toBe(-50);
    expect(trackTranslatePercent(4)).toBe(-25);
    expect(trackTranslatePercent(5)).toBe(-20);
  });

  it('份数 <=0 视为 1 份(退化为无位移)', () => {
    expect(trackTranslatePercent(0)).toBe(-100);
    expect(trackTranslatePercent(-3)).toBe(-100);
    expect(trackTranslatePercent(1)).toBe(-100);
  });
});

describe('shouldAnimate', () => {
  it('未关停且未暂停才滚动', () => {
    expect(shouldAnimate({ motionOff: false, paused: false })).toBe(true);
  });

  it('motionOff 或 paused 任一为真都不滚动', () => {
    expect(shouldAnimate({ motionOff: true, paused: false })).toBe(false);
    expect(shouldAnimate({ motionOff: false, paused: true })).toBe(false);
    expect(shouldAnimate({ motionOff: true, paused: true })).toBe(false);
  });
});

describe('MarqueeDirection 类型契约', () => {
  it('四向都可用', () => {
    const dirs: MarqueeDirection[] = ['left', 'right', 'up', 'down'];
    expect(dirs).toHaveLength(4);
  });
});

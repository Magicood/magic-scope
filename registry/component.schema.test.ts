import { describe, expect, it } from 'vitest';
import { componentSchema, sourceSchema } from './component.schema';

const base = {
  type: 'original' as const,
  capturedAt: '2026-06-24',
  requirements: '自研原创组件,完整覆盖交互状态与无障碍,消费 --ms-* 主题变量。',
};

describe('sourceSchema 溯源校验', () => {
  it('original 自研:无外部证据也通过(向后兼容,现有 26 个组件即此形态)', () => {
    expect(sourceSchema.safeParse(base).success).toBe(true);
  });

  it('inspired 无任何证据:拒绝', () => {
    const r = sourceSchema.safeParse({ ...base, type: 'inspired' });
    expect(r.success).toBe(false);
  });

  it('captured 无任何证据:拒绝', () => {
    const r = sourceSchema.safeParse({ ...base, type: 'captured' });
    expect(r.success).toBe(false);
  });

  it('inspired 提供 url:通过', () => {
    const r = sourceSchema.safeParse({ ...base, type: 'inspired', url: 'https://linear.app' });
    expect(r.success).toBe(true);
  });

  it('captured 提供 app:通过', () => {
    const r = sourceSchema.safeParse({ ...base, type: 'captured', app: 'Linear' });
    expect(r.success).toBe(true);
  });

  it('capturedAt 非 YYYY-MM-DD:拒绝', () => {
    expect(sourceSchema.safeParse({ ...base, capturedAt: '2026/6/24' }).success).toBe(false);
  });

  it('requirements 过短:拒绝', () => {
    expect(sourceSchema.safeParse({ ...base, requirements: '太短' }).success).toBe(false);
  });

  it('url 非法格式:拒绝', () => {
    const r = sourceSchema.safeParse({ ...base, type: 'inspired', url: 'not-a-url' });
    expect(r.success).toBe(false);
  });

  it('source.notes 透明备注:可选,且解析后保留(曾被 zod strip 静默剥离)', () => {
    const r = sourceSchema.safeParse({ ...base, notes: '兼容性边界:X 场景需用户自行接 ref。' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.notes).toBe('兼容性边界:X 场景需用户自行接 ref。');
    }
  });

  it('source 内未知键:拒绝而非静默剥离', () => {
    const r = sourceSchema.safeParse({ ...base, remark: '写错字段名' });
    expect(r.success).toBe(false);
  });
});

const comp = {
  id: 'x',
  name: 'X',
  description: '测试组件',
  category: 'misc',
  version: '0.0.0',
  frameworks: ['react'] as const,
  source: base,
};

describe('componentSchema tier / frameworks', () => {
  it('tier 可选:不给也通过(过渡期用 tag 兜底,现有 26 个组件即此形态)', () => {
    expect(componentSchema.safeParse(comp).success).toBe(true);
  });

  it('tier 接受 primitive / composite', () => {
    expect(componentSchema.safeParse({ ...comp, tier: 'primitive' }).success).toBe(true);
    expect(componentSchema.safeParse({ ...comp, tier: 'composite' }).success).toBe(true);
  });

  it('tier 非法值拒绝', () => {
    expect(componentSchema.safeParse({ ...comp, tier: 'molecule' }).success).toBe(false);
  });

  it('frameworks 接受 angular(多框架地基已就位)', () => {
    expect(componentSchema.safeParse({ ...comp, frameworks: ['angular'] }).success).toBe(true);
  });

  it('顶层未知键(如 notes 写错位置):拒绝而非静默剥离,备注应写进 source.notes', () => {
    expect(componentSchema.safeParse({ ...comp, notes: '写错位置的备注' }).success).toBe(false);
  });
});

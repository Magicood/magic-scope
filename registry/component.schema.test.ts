import { describe, expect, it } from 'vitest';
import { sourceSchema } from './component.schema';

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
});

import { describe, expect, it } from 'vitest';
import { computeToggle, resolveOpen, shouldRenderContent } from './logic';

describe('Collapsible logic', () => {
  describe('resolveOpen', () => {
    it('受控:有外部 open 时取外部值(忽略内部)', () => {
      expect(resolveOpen(true, false)).toBe(true);
      expect(resolveOpen(false, true)).toBe(false);
    });

    it('非受控:外部 open 为 undefined 时取内部值', () => {
      expect(resolveOpen(undefined, true)).toBe(true);
      expect(resolveOpen(undefined, false)).toBe(false);
    });
  });

  describe('computeToggle', () => {
    it('未禁用:取反并标记 changed', () => {
      expect(computeToggle(false, false)).toEqual({ next: true, changed: true });
      expect(computeToggle(true, false)).toEqual({ next: false, changed: true });
    });

    it('禁用:保持原值且 changed=false(不触发回调)', () => {
      expect(computeToggle(false, true)).toEqual({ next: false, changed: false });
      expect(computeToggle(true, true)).toEqual({ next: true, changed: false });
    });
  });

  describe('shouldRenderContent', () => {
    it('open 为 true:始终挂载', () => {
      expect(shouldRenderContent(true, false, false)).toBe(true);
    });

    it('forceMount:收起也挂载', () => {
      expect(shouldRenderContent(false, true, false)).toBe(true);
    });

    it('exiting:退场动画期间暂留', () => {
      expect(shouldRenderContent(false, false, true)).toBe(true);
    });

    it('收起 + 非 forceMount + 未在退场:不挂载', () => {
      expect(shouldRenderContent(false, false, false)).toBe(false);
    });
  });
});

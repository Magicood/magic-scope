import { describe, expect, it } from 'vitest';
import {
  commitValue,
  resolveKeyIntent,
  resolvePreviewText,
  shouldEnterEditFromPreview,
} from './logic';

describe('resolveKeyIntent', () => {
  it('Escape / Esc → cancel', () => {
    expect(
      resolveKeyIntent({ key: 'Escape', shiftKey: false, multiline: false, submitOnEnter: true }),
    ).toBe('cancel');
    expect(
      resolveKeyIntent({ key: 'Esc', shiftKey: false, multiline: true, submitOnEnter: false }),
    ).toBe('cancel');
  });

  it('单行 Enter + submitOnEnter → submit', () => {
    expect(
      resolveKeyIntent({ key: 'Enter', shiftKey: false, multiline: false, submitOnEnter: true }),
    ).toBe('submit');
  });

  it('submitOnEnter=false 时 Enter → none', () => {
    expect(
      resolveKeyIntent({ key: 'Enter', shiftKey: false, multiline: false, submitOnEnter: false }),
    ).toBe('none');
  });

  it('多行 Shift+Enter → none(换行)', () => {
    expect(
      resolveKeyIntent({ key: 'Enter', shiftKey: true, multiline: true, submitOnEnter: true }),
    ).toBe('none');
  });

  it('多行 Enter + submitOnEnter=true 仍 submit(裸 Enter 显式提交)', () => {
    expect(
      resolveKeyIntent({ key: 'Enter', shiftKey: false, multiline: true, submitOnEnter: true }),
    ).toBe('submit');
  });

  it('其它键 → none', () => {
    expect(
      resolveKeyIntent({ key: 'a', shiftKey: false, multiline: false, submitOnEnter: true }),
    ).toBe('none');
  });
});

describe('commitValue', () => {
  it('值变化时 changed=true', () => {
    expect(commitValue('new', 'old')).toEqual({ changed: true, value: 'new' });
  });

  it('值未变时 changed=false', () => {
    expect(commitValue('same', 'same')).toEqual({ changed: false, value: 'same' });
  });

  it('超 maxLength 时截断,并以截断后的值判定 changed', () => {
    expect(commitValue('abcdef', '', 3)).toEqual({ changed: true, value: 'abc' });
    // 截断后与初值相等则 changed=false
    expect(commitValue('abcXXX', 'abc', 3)).toEqual({ changed: false, value: 'abc' });
  });

  it('maxLength 未传 / 为负 / 未超时不截断', () => {
    expect(commitValue('abc', '', undefined)).toEqual({ changed: true, value: 'abc' });
    expect(commitValue('abc', '', 10)).toEqual({ changed: true, value: 'abc' });
  });
});

describe('resolvePreviewText', () => {
  it('有值时回值、isEmpty=false', () => {
    expect(resolvePreviewText('hi', '占位')).toEqual({ text: 'hi', isEmpty: false });
  });

  it('空串 / null / undefined 回退占位、isEmpty=true', () => {
    expect(resolvePreviewText('', '占位')).toEqual({ text: '占位', isEmpty: true });
    expect(resolvePreviewText(null, '占位')).toEqual({ text: '占位', isEmpty: true });
    expect(resolvePreviewText(undefined, '占位')).toEqual({ text: '占位', isEmpty: true });
  });
});

describe('shouldEnterEditFromPreview', () => {
  it('Enter / Space / Spacebar → true,其它 → false', () => {
    expect(shouldEnterEditFromPreview('Enter')).toBe(true);
    expect(shouldEnterEditFromPreview(' ')).toBe(true);
    expect(shouldEnterEditFromPreview('Spacebar')).toBe(true);
    expect(shouldEnterEditFromPreview('a')).toBe(false);
    expect(shouldEnterEditFromPreview('Escape')).toBe(false);
  });
});

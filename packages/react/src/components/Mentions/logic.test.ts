import { describe, expect, it } from 'vitest';
import {
  computeInsertion,
  detectMention,
  filterOptions,
  firstEnabledIndex,
  nextEnabledIndex,
} from './logic';

describe('detectMention —— 找光标前最近的触发段', () => {
  it('刚敲下 @(query 为空)即激活,start 指向 @,query 为空串', () => {
    const text = 'hi @';
    const r = detectMention(text, text.length, ['@']);
    expect(r.active).toBe(true);
    expect(r.prefix).toBe('@');
    expect(r.query).toBe('');
    expect(r.start).toBe(3);
  });

  it('@ 后跟查询文本:query 取前缀到光标之间', () => {
    const text = 'hello @ali';
    const r = detectMention(text, text.length, ['@']);
    expect(r.active).toBe(true);
    expect(r.query).toBe('ali');
    expect(r.start).toBe(6);
  });

  it('提及段内含空白 → 视为已结束,不激活', () => {
    const text = 'hello @ali bob';
    const r = detectMention(text, text.length, ['@']);
    expect(r.active).toBe(false);
    expect(r.start).toBe(-1);
  });

  it('光标在提及段中间:query 只取到光标处', () => {
    // 文本 "@alice",光标停在 "@al" 之后(下标 3)
    const r = detectMention('@alice', 3, ['@']);
    expect(r.active).toBe(true);
    expect(r.query).toBe('al');
    expect(r.start).toBe(0);
  });

  it('邮箱 foo@bar:@ 紧贴非空白字符,不误判为提及', () => {
    const text = 'foo@bar';
    const r = detectMention(text, text.length, ['@']);
    expect(r.active).toBe(false);
  });

  it('支持多前缀:# 也能触发', () => {
    const text = 'topic #design';
    const r = detectMention(text, text.length, ['@', '#']);
    expect(r.active).toBe(true);
    expect(r.prefix).toBe('#');
    expect(r.query).toBe('design');
    expect(r.start).toBe(6);
  });

  it('光标前最近的是普通空白文本(无前缀)→ 不激活', () => {
    const text = 'just plain text';
    const r = detectMention(text, text.length, ['@']);
    expect(r.active).toBe(false);
  });

  it('caretPos 越界被夹取,不抛错', () => {
    const text = '@bob';
    const r = detectMention(text, 999, ['@']);
    expect(r.active).toBe(true);
    expect(r.query).toBe('bob');
  });

  it('空前缀集合 → 永不激活', () => {
    const r = detectMention('@x', 2, []);
    expect(r.active).toBe(false);
  });
});

describe('filterOptions —— 候选过滤', () => {
  const opts = [
    { value: 'alice', label: 'Alice' },
    { value: 'bob', label: 'Bob' },
    { value: 'carol', label: 'Carol Z' },
  ];

  it('空 query 返回全部(且是新数组,不是原引用)', () => {
    const r = filterOptions(opts, '');
    expect(r).toHaveLength(3);
    expect(r).not.toBe(opts);
  });

  it('大小写不敏感,匹配 label', () => {
    expect(filterOptions(opts, 'ali')).toEqual([{ value: 'alice', label: 'Alice' }]);
    expect(filterOptions(opts, 'CAROL')).toEqual([{ value: 'carol', label: 'Carol Z' }]);
  });

  it('也匹配 value', () => {
    expect(filterOptions(opts, 'bob')).toHaveLength(1);
  });

  it('无匹配返回空数组', () => {
    expect(filterOptions(opts, 'zzz')).toEqual([]);
  });
});

describe('computeInsertion —— 替换触发段并算新光标', () => {
  it('把 @al 替换成 @Alice + 空格,光标落在分隔符后', () => {
    // 文本 "hi @al",start=3,query="al"
    const r = computeInsertion('hi @al', 3, 'al', '@Alice', ' ');
    expect(r.nextText).toBe('hi @Alice ');
    expect(r.nextCaret).toBe('hi @Alice '.length);
  });

  it('保留触发段后面的尾部文本', () => {
    // 文本 "hi @al world",start=3,query="al";光标处在 "@al" 后
    const r = computeInsertion('hi @al world', 3, 'al', '@Alice', ' ');
    expect(r.nextText).toBe('hi @Alice  world');
    // 新光标紧跟插入文本 + 分隔符
    expect(r.nextCaret).toBe('hi @Alice '.length);
  });

  it('query 为空(刚敲 @)也能插入', () => {
    const r = computeInsertion('hi @', 3, '', '@Bob', ' ');
    expect(r.nextText).toBe('hi @Bob ');
    expect(r.nextCaret).toBe('hi @Bob '.length);
  });

  it('自定义分隔符(如换行 / 顿号)', () => {
    const r = computeInsertion('@a', 0, 'a', '@Alice', '、');
    expect(r.nextText).toBe('@Alice、');
    expect(r.nextCaret).toBe('@Alice、'.length);
  });

  it('多字符前缀:prefixLen=2 时正确算出被替换段', () => {
    // 触发前缀 "@@",文本 "@@al",start=0,query="al"
    const r = computeInsertion('@@al', 0, 'al', '@@Alice', ' ', 2);
    expect(r.nextText).toBe('@@Alice ');
  });

  it('start 越界被夹取,不抛错', () => {
    const r = computeInsertion('hi', 999, '', '@X', ' ');
    expect(r.nextText).toBe('hi@X ');
  });
});

describe('nextEnabledIndex —— 循环跳过 disabled', () => {
  const opts = [{ disabled: true }, { disabled: false }, { disabled: true }, { disabled: false }];

  it('向后跳过 disabled', () => {
    expect(nextEnabledIndex(opts, 1, 1)).toBe(3);
  });

  it('向后到尾回绕到首个可选', () => {
    expect(nextEnabledIndex(opts, 3, 1)).toBe(1);
  });

  it('向前跳过 disabled', () => {
    expect(nextEnabledIndex(opts, 3, -1)).toBe(1);
  });

  it('全部 disabled 返回 -1(不动高亮)', () => {
    expect(nextEnabledIndex([{ disabled: true }, { disabled: true }], 0, 1)).toBe(-1);
  });

  it('空列表返回 -1', () => {
    expect(nextEnabledIndex([], 0, 1)).toBe(-1);
  });

  it('from 越界仍正确回绕', () => {
    expect(nextEnabledIndex(opts, 99, 1)).toBe(nextEnabledIndex(opts, 99 % 4, 1));
  });
});

describe('firstEnabledIndex —— 首个可选项', () => {
  it('首项 disabled 时跳到下一个', () => {
    expect(firstEnabledIndex([{ disabled: true }, { disabled: false }])).toBe(1);
  });

  it('首项可选时返回 0', () => {
    expect(firstEnabledIndex([{ disabled: false }, { disabled: true }])).toBe(0);
  });

  it('全禁用返回 -1', () => {
    expect(firstEnabledIndex([{ disabled: true }])).toBe(-1);
  });

  it('空列表返回 -1', () => {
    expect(firstEnabledIndex([])).toBe(-1);
  });
});

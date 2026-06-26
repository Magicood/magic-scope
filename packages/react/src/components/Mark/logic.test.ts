import { describe, expect, it } from 'vitest';
import { escapeRegExp, type MarkSegment, splitByMatches } from './logic';

/** 工具:把段数组还原成原文,断言无丢字 / 无改写。 */
const join = (segs: MarkSegment[]): string => segs.map((s) => s.text).join('');
/** 工具:只取命中段的文本。 */
const hits = (segs: MarkSegment[]): string[] => segs.filter((s) => s.matched).map((s) => s.text);

describe('escapeRegExp', () => {
  it('转义所有正则元字符', () => {
    expect(escapeRegExp('a.b*c+?')).toBe('a\\.b\\*c\\+\\?');
    expect(escapeRegExp('(x)[y]{z}')).toBe('\\(x\\)\\[y\\]\\{z\\}');
    expect(escapeRegExp('a|b\\c^d$')).toBe('a\\|b\\\\c\\^d\\$');
  });

  it('普通字符原样', () => {
    expect(escapeRegExp('hello world 123')).toBe('hello world 123');
  });
});

describe('splitByMatches —— 基础切分', () => {
  it('单词命中:切成 未命中/命中/未命中', () => {
    const segs = splitByMatches('hello world', 'world');
    expect(segs).toEqual([
      { text: 'hello ', matched: false },
      { text: 'world', matched: true },
    ]);
    expect(join(segs)).toBe('hello world');
  });

  it('命中在中间', () => {
    const segs = splitByMatches('the quick brown fox', 'quick');
    expect(hits(segs)).toEqual(['quick']);
    expect(join(segs)).toBe('the quick brown fox');
  });

  it('同一词多次命中全部切出', () => {
    const segs = splitByMatches('na na na batman', 'na');
    expect(hits(segs)).toEqual(['na', 'na', 'na']);
    expect(join(segs)).toBe('na na na batman');
  });
});

describe('splitByMatches —— 空 search 原样', () => {
  it('空串 search 整段未命中', () => {
    expect(splitByMatches('hello', '')).toEqual([{ text: 'hello', matched: false }]);
  });

  it('空数组 search 整段未命中', () => {
    expect(splitByMatches('hello', [])).toEqual([{ text: 'hello', matched: false }]);
  });

  it('全空白词的数组也视为空 search', () => {
    expect(splitByMatches('hello', ['', ''])).toEqual([{ text: 'hello', matched: false }]);
  });

  it('无命中时整段未命中', () => {
    expect(splitByMatches('hello', 'zzz')).toEqual([{ text: 'hello', matched: false }]);
  });
});

describe('splitByMatches —— 空 / 异常文本', () => {
  it('空文本返回空数组', () => {
    expect(splitByMatches('', 'x')).toEqual([]);
  });
});

describe('splitByMatches —— 大小写', () => {
  it('默认不区分大小写', () => {
    const segs = splitByMatches('Hello HELLO hello', 'hello');
    expect(hits(segs)).toEqual(['Hello', 'HELLO', 'hello']);
    // 命中段保留原始大小写
    expect(join(segs)).toBe('Hello HELLO hello');
  });

  it('caseSensitive 时严格区分', () => {
    const segs = splitByMatches('Hello hello', 'hello', { caseSensitive: true });
    expect(hits(segs)).toEqual(['hello']);
  });
});

describe('splitByMatches —— 整词匹配', () => {
  it('wholeWord 只命中独立单词', () => {
    const segs = splitByMatches('cat category cats', 'cat', { wholeWord: true });
    expect(hits(segs)).toEqual(['cat']);
    expect(join(segs)).toBe('cat category cats');
  });

  it('非整词模式命中子串', () => {
    const segs = splitByMatches('category', 'cat');
    expect(hits(segs)).toEqual(['cat']);
  });
});

describe('splitByMatches —— 多词', () => {
  it('多个词分别命中', () => {
    const segs = splitByMatches('red green blue', ['red', 'blue']);
    expect(hits(segs)).toEqual(['red', 'blue']);
    expect(join(segs)).toBe('red green blue');
  });

  it('多词去重不重复匹配', () => {
    const segs = splitByMatches('aa aa', ['aa', 'aa']);
    expect(hits(segs)).toEqual(['aa', 'aa']);
  });
});

describe('splitByMatches —— 重叠区间合并', () => {
  it('重叠的多词命中合并为一段(不嵌套包裹)', () => {
    // "foobar" 搜 ["foo","oba"]:foo=[0,3) oba=[2,5) 重叠 → 合并 [0,5) => "fooba"
    const segs = splitByMatches('foobar', ['foo', 'oba']);
    expect(hits(segs)).toEqual(['fooba']);
    expect(join(segs)).toBe('foobar');
  });

  it('相邻区间也合并', () => {
    // "abcd" 搜 ["ab","cd"]:[0,2)+[2,4) 相邻 → 合并成 "abcd"
    const segs = splitByMatches('abcd', ['ab', 'cd']);
    expect(hits(segs)).toEqual(['abcd']);
  });

  it('一个词完全包含另一个词的命中', () => {
    const segs = splitByMatches('javascript', ['java', 'javascript']);
    expect(hits(segs)).toEqual(['javascript']);
    expect(join(segs)).toBe('javascript');
  });
});

describe('splitByMatches —— 正则元字符按字面量', () => {
  it('点号不当通配符', () => {
    const segs = splitByMatches('a.b axb', '.');
    expect(hits(segs)).toEqual(['.']);
    expect(join(segs)).toBe('a.b axb');
  });

  it('括号 / 加号等按字面量匹配', () => {
    const segs = splitByMatches('f(x)+1', '(x)');
    expect(hits(segs)).toEqual(['(x)']);
  });

  it('星号按字面量', () => {
    const segs = splitByMatches('2 * 3', '*');
    expect(hits(segs)).toEqual(['*']);
  });
});

describe('splitByMatches —— CJK', () => {
  it('中文命中', () => {
    const segs = splitByMatches('魔法组件库', '组件');
    expect(hits(segs)).toEqual(['组件']);
    expect(join(segs)).toBe('魔法组件库');
  });
});

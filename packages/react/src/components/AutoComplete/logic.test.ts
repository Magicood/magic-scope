import { describe, expect, it } from 'vitest';
import {
  type AutoCompleteOptionLike,
  defaultFilter,
  filterOptions,
  findEnabledIndex,
  optionText,
} from './logic';

const opts: AutoCompleteOptionLike[] = [
  { value: 'apple', label: '苹果 Apple' },
  { value: 'banana', label: '香蕉 Banana' },
  { value: 'cherry' }, // 无 label,回退 value
  { value: 'date', label: '枣 Date', disabled: true },
];

describe('AutoComplete/logic', () => {
  describe('optionText', () => {
    it('有 label 用 label', () => {
      expect(optionText({ value: 'a', label: 'L' })).toBe('L');
    });
    it('缺 label 回退 value', () => {
      expect(optionText({ value: 'cherry' })).toBe('cherry');
    });
  });

  describe('defaultFilter', () => {
    it('空输入返回全部(副本,非同一引用)', () => {
      const out = defaultFilter(opts, '');
      expect(out).toHaveLength(opts.length);
      expect(out).not.toBe(opts);
    });

    it('仅空白也视为空,返回全部', () => {
      expect(defaultFilter(opts, '   ')).toHaveLength(opts.length);
    });

    it('子串大小写不敏感匹配 label', () => {
      const out = defaultFilter(opts, 'APP');
      expect(out.map((o) => o.value)).toEqual(['apple']);
    });

    it('匹配命中 value(即便 label 不含该串)', () => {
      // 'cherry' 无 label,靠 value 命中
      expect(defaultFilter(opts, 'cher').map((o) => o.value)).toEqual(['cherry']);
    });

    it('匹配中文 label', () => {
      expect(defaultFilter(opts, '香蕉').map((o) => o.value)).toEqual(['banana']);
    });

    it('无命中返回空数组', () => {
      expect(defaultFilter(opts, 'zzz')).toEqual([]);
    });
  });

  describe('filterOptions', () => {
    it('filterOption === false 关闭内置过滤,透传全部', () => {
      const out = filterOptions(opts, 'app', false);
      expect(out).toHaveLength(opts.length);
      expect(out).not.toBe(opts);
    });

    it('自定义谓词:按 (inputValue, option) 决定保留', () => {
      const out = filterOptions(opts, 'a', (input, o) => o.value.startsWith(input));
      expect(out.map((o) => o.value)).toEqual(['apple']);
    });

    it('缺省走 defaultFilter 子串匹配', () => {
      expect(filterOptions(opts, 'ban', undefined).map((o) => o.value)).toEqual(['banana']);
    });
  });

  describe('findEnabledIndex', () => {
    it('跳过禁用项,正向找下一个可用', () => {
      // index 3 (date) 禁用,从 3 正向应环回到 0(apple)
      expect(findEnabledIndex(opts, 3, 1)).toBe(0);
    });

    it('反向导航环形回绕', () => {
      // 从 0 反向 -> 环到末尾,末尾 date 禁用,继续到 cherry(index 2)
      expect(findEnabledIndex(opts, -1, -1)).toBe(2);
    });

    it('从可用项起点直接返回该索引', () => {
      expect(findEnabledIndex(opts, 1, 1)).toBe(1);
    });

    it('空表返回 -1', () => {
      expect(findEnabledIndex([], 0, 1)).toBe(-1);
    });

    it('全禁用返回 -1', () => {
      const allDisabled: AutoCompleteOptionLike[] = [
        { value: 'x', disabled: true },
        { value: 'y', disabled: true },
      ];
      expect(findEnabledIndex(allDisabled, 0, 1)).toBe(-1);
    });
  });
});

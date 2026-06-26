import { describe, expect, it } from 'vitest';
import {
  compactCells,
  isComplete,
  joinCells,
  joinValue,
  sanitize,
  splitCells,
  splitValue,
} from './logic';

describe('PinInput/logic — sanitize', () => {
  it('numeric 只保留数字,剔除字母/符号/空白', () => {
    expect(sanitize('1a2-b 3', 'numeric')).toBe('123');
    expect(sanitize('abc', 'numeric')).toBe('');
  });

  it('alphanumeric 保留数字与大小写字母,剔除其余', () => {
    expect(sanitize('a1-B2 c3!', 'alphanumeric')).toBe('a1B2c3');
  });

  it('空串安全返回空串', () => {
    expect(sanitize('', 'numeric')).toBe('');
    expect(sanitize('', 'alphanumeric')).toBe('');
  });
});

describe('PinInput/logic — splitValue', () => {
  it('不足 length 时右侧补空串,长度恒等于 length', () => {
    expect(splitValue('12', 4)).toEqual(['1', '2', '', '']);
  });

  it('超长按 length 截断', () => {
    expect(splitValue('123456', 4)).toEqual(['1', '2', '3', '4']);
  });

  it('length<=0 返回空数组', () => {
    expect(splitValue('123', 0)).toEqual([]);
    expect(splitValue('123', -2)).toEqual([]);
  });
});

describe('PinInput/logic — joinValue', () => {
  it('拼回完整串,空格保留为空不补位', () => {
    expect(joinValue(['1', '', '3'])).toBe('13');
    expect(joinValue(['', '', ''])).toBe('');
  });

  it('与 splitValue 在填满时互逆', () => {
    expect(joinValue(splitValue('1234', 4))).toBe('1234');
  });
});

describe('PinInput/logic — joinCells / splitCells(保留空位)', () => {
  it('中间有空格子时不折叠、不左挤,往返互逆', () => {
    const cells = ['', '', '5'];
    const internal = joinCells(cells);
    // join("") 会得到 "5",joinCells 必须保留三位
    expect(internal.length).toBe(3);
    expect(splitCells(internal, 3)).toEqual(['', '', '5']);
  });

  it('首格空、后两格有值时往返保位', () => {
    expect(splitCells(joinCells(['', '2', '3']), 3)).toEqual(['', '2', '3']);
  });

  it('splitCells 不足右侧补空、超长截断、length<=0 返回空', () => {
    expect(splitCells(joinCells(['1']), 3)).toEqual(['1', '', '']);
    expect(splitCells(joinCells(['1', '2', '3', '4']), 2)).toEqual(['1', '2']);
    expect(splitCells('123', 0)).toEqual([]);
  });
});

describe('PinInput/logic — compactCells', () => {
  it('丢弃空位压成紧凑串(对外 onChange 用)', () => {
    expect(compactCells(['', '', '5'])).toBe('5');
    expect(compactCells(['1', '', '3'])).toBe('13');
    expect(compactCells(['', '', ''])).toBe('');
  });
});

describe('PinInput/logic — isComplete', () => {
  it('达到 length 才算填满', () => {
    expect(isComplete('1234', 4)).toBe(true);
    expect(isComplete('123', 4)).toBe(false);
  });

  it('length<=0 永远不算填满', () => {
    expect(isComplete('', 0)).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { type AnchorLinkOffset, flattenKeys, hrefToId, resolveActiveLink } from './logic';

const offsets: AnchorLinkOffset[] = [
  { key: 'a', top: 0 },
  { key: 'b', top: 200 },
  { key: 'c', top: 600 },
];

describe('resolveActiveLink', () => {
  it('空表返回 null', () => {
    expect(resolveActiveLink([], 100)).toBeNull();
  });

  it('页面顶部时高亮第一项(回退到最靠前)', () => {
    // scrollTop 0:判定线 5,只有 a(top 0)在线上 → a
    expect(resolveActiveLink(offsets, 0)).toBe('a');
  });

  it('滚过第二个锚点后高亮 b', () => {
    // scrollTop 250:判定线 255,a/b 在线上,取靠下的 b
    expect(resolveActiveLink(offsets, 250)).toBe('b');
  });

  it('滚到底部高亮最后一项', () => {
    expect(resolveActiveLink(offsets, 1000)).toBe('c');
  });

  it('所有锚点都在判定线下方时回退到最靠前项(负 scrollTop 等边界)', () => {
    expect(resolveActiveLink(offsets, -50)).toBe('a');
  });

  it('offsetTop 提前命中下一个小节', () => {
    // scrollTop 100 默认应是 a;给 offsetTop 120 后判定线 225 → b
    expect(resolveActiveLink(offsets, 100, 5, 120)).toBe('b');
  });

  it('bounds 影响命中边界', () => {
    // scrollTop 195 + bounds 5 = 200 == b.top,b 命中
    expect(resolveActiveLink(offsets, 195, 5)).toBe('b');
    // bounds 0 时 195 < 200,b 不命中,仍是 a
    expect(resolveActiveLink(offsets, 195, 0)).toBe('a');
  });

  it('乱序输入不影响结果(内部按 top 比较)', () => {
    const shuffled: AnchorLinkOffset[] = [
      { key: 'c', top: 600 },
      { key: 'a', top: 0 },
      { key: 'b', top: 200 },
    ];
    expect(resolveActiveLink(shuffled, 250)).toBe('b');
  });
});

describe('flattenKeys', () => {
  it('前序拍平嵌套 key', () => {
    const items = [{ key: 'a', children: [{ key: 'a1' }, { key: 'a2' }] }, { key: 'b' }];
    expect(flattenKeys(items)).toEqual(['a', 'a1', 'a2', 'b']);
  });

  it('空表返回空数组', () => {
    expect(flattenKeys([])).toEqual([]);
  });
});

describe('hrefToId', () => {
  it('取出锚点 id', () => {
    expect(hrefToId('#intro')).toBe('intro');
  });

  it('非锚点 / 空 / 仅 # 返回 null', () => {
    expect(hrefToId('https://example.com')).toBeNull();
    expect(hrefToId(undefined)).toBeNull();
    expect(hrefToId('#')).toBeNull();
  });
});

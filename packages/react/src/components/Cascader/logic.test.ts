import { describe, expect, it } from 'vitest';
import {
  type CascaderOption,
  columnsForValue,
  findEnabledIndex,
  findPath,
  flattenLeafPaths,
  getOptionByPath,
  isLeaf,
  pathLabel,
} from './logic';

const tree: CascaderOption[] = [
  {
    value: 'zj',
    label: '浙江',
    children: [
      {
        value: 'hz',
        label: '杭州',
        children: [
          { value: 'xh', label: '西湖' },
          { value: 'yh', label: '余杭', disabled: true },
        ],
      },
      { value: 'nb', label: '宁波', children: [{ value: 'yz', label: '鄞州' }] },
    ],
  },
  {
    value: 'js',
    label: '江苏',
    disabled: true,
    children: [{ value: 'nj', label: '南京' }],
  },
  { value: 'bj', label: '北京' },
];

describe('isLeaf', () => {
  it('无 children 或空 children 视为叶子', () => {
    expect(isLeaf({ value: 'a', label: 'A' })).toBe(true);
    expect(isLeaf({ value: 'a', label: 'A', children: [] })).toBe(true);
    expect(isLeaf({ value: 'a', label: 'A', children: [{ value: 'b', label: 'B' }] })).toBe(false);
  });
});

describe('findPath', () => {
  it('逐层定位返回沿途选项', () => {
    const path = findPath(tree, ['zj', 'hz', 'xh']);
    expect(path.map((o) => o.label)).toEqual(['浙江', '杭州', '西湖']);
  });

  it('中途匹配不到则返回已走通的前缀', () => {
    const path = findPath(tree, ['zj', 'nope', 'xh']);
    expect(path.map((o) => o.value)).toEqual(['zj']);
  });

  it('空路径返回空数组', () => {
    expect(findPath(tree, [])).toEqual([]);
  });
});

describe('getOptionByPath', () => {
  it('完整路径返回末端选项', () => {
    expect(getOptionByPath(tree, ['zj', 'hz', 'xh'])?.label).toBe('西湖');
  });

  it('断裂路径返回 undefined', () => {
    expect(getOptionByPath(tree, ['zj', 'hz', 'zzz'])).toBeUndefined();
  });

  it('空路径返回 undefined', () => {
    expect(getOptionByPath(tree, [])).toBeUndefined();
  });
});

describe('flattenLeafPaths', () => {
  it('默认仅展开叶子路径', () => {
    const leaves = flattenLeafPaths(tree);
    const values = leaves.map((l) => l.value.join('/'));
    expect(values).toEqual(['zj/hz/xh', 'zj/hz/yh', 'zj/nb/yz', 'js/nj', 'bj']);
  });

  it('叶子路径携带 labels', () => {
    const leaves = flattenLeafPaths(tree);
    expect(leaves[0]?.labels).toEqual(['浙江', '杭州', '西湖']);
  });

  it('includeNonLeaf 时每个中间节点也产出一条', () => {
    const all = flattenLeafPaths(tree, true);
    const values = all.map((l) => l.value.join('/'));
    expect(values).toContain('zj');
    expect(values).toContain('zj/hz');
    expect(values).toContain('zj/hz/xh');
  });
});

describe('pathLabel', () => {
  it('选项数组拼成显示串', () => {
    expect(pathLabel(findPath(tree, ['zj', 'hz', 'xh']))).toBe('浙江 / 杭州 / 西湖');
  });

  it('label 字符串数组同样可用,且分隔符可自定义', () => {
    expect(pathLabel(['浙江', '杭州'], ' > ')).toBe('浙江 > 杭州');
  });
});

describe('findEnabledIndex', () => {
  it('跳过禁用项', () => {
    const col = tree[0]?.children?.[0]?.children ?? [];
    // [西湖, 余杭(disabled)]:从 0 往后第一个可用是 0
    expect(findEnabledIndex(col, 0, 1)).toBe(0);
    // 从 1(余杭,禁用)往后环形找到 0(西湖)
    expect(findEnabledIndex(col, 1, 1)).toBe(0);
  });

  it('空表返回 -1', () => {
    expect(findEnabledIndex([], 0, 1)).toBe(-1);
  });

  it('全禁用返回 -1', () => {
    const allDisabled: CascaderOption[] = [
      { value: 'a', label: 'A', disabled: true },
      { value: 'b', label: 'B', disabled: true },
    ];
    expect(findEnabledIndex(allDisabled, 0, 1)).toBe(-1);
  });
});

describe('columnsForValue', () => {
  it('空 value 只有根列', () => {
    const cols = columnsForValue(tree, []);
    expect(cols).toHaveLength(1);
    expect(cols[0]?.map((o) => o.value)).toEqual(['zj', 'js', 'bj']);
  });

  it('走通两层非叶子追加两列', () => {
    const cols = columnsForValue(tree, ['zj', 'hz']);
    expect(cols).toHaveLength(3);
    expect(cols[2]?.map((o) => o.value)).toEqual(['xh', 'yh']);
  });

  it('命中叶子后不再追加列', () => {
    const cols = columnsForValue(tree, ['zj', 'hz', 'xh']);
    // xh 是叶子,无 children → 列数停在 3(根 + 杭州的子 + 西湖所在层)
    expect(cols).toHaveLength(3);
  });
});

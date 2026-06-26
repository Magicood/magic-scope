import { describe, expect, it } from 'vitest';
import {
  buildTreeMeta,
  cascadeCheck,
  deriveHalfChecked,
  flattenVisible,
  getAncestorKeys,
  getDescendantKeys,
  type TreeNodeLike,
} from './logic';

const tree: TreeNodeLike[] = [
  {
    key: '1',
    children: [{ key: '1-1', children: [{ key: '1-1-1' }, { key: '1-1-2' }] }, { key: '1-2' }],
  },
  { key: '2', children: [{ key: '2-1' }] },
];

describe('buildTreeMeta', () => {
  it('父子映射 + 叶子', () => {
    const m = buildTreeMeta(tree);
    expect(m.parentMap.get('1-1-1')).toBe('1-1');
    expect(m.parentMap.get('1')).toBeNull();
    expect(m.childrenKeys.get('1')).toEqual(['1-1', '1-2']);
    expect(m.leafKeys).toEqual(expect.arrayContaining(['1-1-1', '1-1-2', '1-2', '2-1']));
    expect(m.allKeys).toHaveLength(7);
  });
});

describe('flattenVisible', () => {
  it('折叠时只见根', () => {
    const flat = flattenVisible(tree, new Set());
    expect(flat.map((f) => f.node.key)).toEqual(['1', '2']);
    expect(flat[0]?.level).toBe(0);
    expect(flat[0]?.hasChildren).toBe(true);
    expect(flat[0]?.setSize).toBe(2);
    expect(flat[0]?.posInSet).toBe(1);
  });

  it('展开父才见子', () => {
    expect(flattenVisible(tree, new Set(['1'])).map((f) => f.node.key)).toEqual([
      '1',
      '1-1',
      '1-2',
      '2',
    ]);
    expect(flattenVisible(tree, new Set(['1', '1-1'])).map((f) => f.node.key)).toEqual([
      '1',
      '1-1',
      '1-1-1',
      '1-1-2',
      '1-2',
      '2',
    ]);
  });

  it('level 递增', () => {
    const flat = flattenVisible(tree, new Set(['1', '1-1']));
    expect(flat.find((f) => f.node.key === '1-1-1')?.level).toBe(2);
  });
});

describe('getDescendantKeys / getAncestorKeys', () => {
  it('后代 / 祖先', () => {
    const node1 = tree[0] as TreeNodeLike;
    expect(new Set(getDescendantKeys(node1))).toEqual(new Set(['1-1', '1-1-1', '1-1-2', '1-2']));
    const m = buildTreeMeta(tree);
    expect(getAncestorKeys(m, '1-1-1')).toEqual(['1-1', '1']);
  });
});

describe('cascadeCheck', () => {
  const m = buildTreeMeta(tree);

  it('向下:勾父连带全后代', () => {
    const next = cascadeCheck(m, new Set(), '1', true);
    expect(next).toEqual(new Set(['1', '1-1', '1-1-1', '1-1-2', '1-2']));
  });

  it('向上:全部子勾选则父勾选', () => {
    let s = cascadeCheck(m, new Set(), '1-1-1', true);
    expect(s.has('1-1')).toBe(false); // 还差 1-1-2
    s = cascadeCheck(m, s, '1-1-2', true);
    expect(s.has('1-1')).toBe(true); // 两子齐 → 1-1 勾选
    expect(s.has('1')).toBe(false); // 1-2 未勾 → 1 未勾
  });

  it('取消一个子 → 父取消', () => {
    let s = cascadeCheck(m, new Set(), '1', true); // 全勾
    expect(s.has('1')).toBe(true);
    s = cascadeCheck(m, s, '1-1-1', false);
    expect(s.has('1-1')).toBe(false);
    expect(s.has('1')).toBe(false);
  });

  it('disabled 子树不参与级联', () => {
    const t2: TreeNodeLike[] = [
      { key: 'p', children: [{ key: 'a' }, { key: 'b', disabled: true }] },
    ];
    const m2 = buildTreeMeta(t2);
    const s = cascadeCheck(m2, new Set(), 'p', true);
    expect(s.has('a')).toBe(true);
    expect(s.has('b')).toBe(false); // 禁用不被勾
    expect(s.has('p')).toBe(true); // 非禁用子(a)全勾 → p 勾
  });

  it('disabled 中间节点不阻断其 enabled 后代级联', () => {
    const t3: TreeNodeLike[] = [
      { key: 'p', children: [{ key: 'mid', disabled: true, children: [{ key: 'leaf' }] }] },
    ];
    const m3 = buildTreeMeta(t3);
    const s = cascadeCheck(m3, new Set(), 'p', true);
    expect(s.has('leaf')).toBe(true); // disabled 中间节点下的 enabled 叶子仍被勾
    expect(s.has('mid')).toBe(false); // disabled 自身不勾
  });

  it('disabled 父不被污染进 checkedKeys', () => {
    const t4: TreeNodeLike[] = [
      { key: 'p', disabled: true, children: [{ key: 'a' }, { key: 'b' }] },
    ];
    const m4 = buildTreeMeta(t4);
    let s = cascadeCheck(m4, new Set(), 'a', true);
    s = cascadeCheck(m4, s, 'b', true);
    expect(s.has('a')).toBe(true);
    expect(s.has('b')).toBe(true);
    expect(s.has('p')).toBe(false); // disabled 父不被加入 checked
  });
});

describe('deriveHalfChecked', () => {
  it('有后代勾选但未全勾 → 半选', () => {
    const checked = new Set(['1-1-1']);
    const half = deriveHalfChecked(tree, checked);
    expect(half.has('1-1')).toBe(true);
    expect(half.has('1')).toBe(true);
    expect(half.has('2')).toBe(false);
  });

  it('完全勾选的节点不算半选', () => {
    const m = buildTreeMeta(tree);
    const checked = cascadeCheck(m, new Set(), '1', true); // 1 全勾
    const half = deriveHalfChecked(tree, checked);
    expect(half.has('1')).toBe(false);
    expect(half.has('1-1')).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import {
  checkStateOf,
  countOf,
  filterBySearch,
  moveKeys,
  splitByTargetKeys,
  type TransferItemLike,
  toggleSelectAll,
  toggleSelectAllByKeys,
  toggleSelectedKey,
} from './logic';

const data: TransferItemLike[] = [
  { key: 'a', title: 'Apple' },
  { key: 'b', title: 'Banana' },
  { key: 'c', title: 'Cherry', disabled: true },
  { key: 'd', title: 'Date' },
];

describe('splitByTargetKeys', () => {
  it('按 targetKeys 切左右两栏并保持 dataSource 原序', () => {
    const { left, right } = splitByTargetKeys(data, ['d', 'a']);
    expect(left.map((i) => i.key)).toEqual(['b', 'c']);
    expect(right.map((i) => i.key)).toEqual(['a', 'd']);
  });

  it('忽略不存在于 dataSource 的孤儿 key', () => {
    const { left, right } = splitByTargetKeys(data, ['zzz']);
    expect(right).toHaveLength(0);
    expect(left).toHaveLength(4);
  });
});

describe('filterBySearch', () => {
  it('大小写不敏感地匹配 title 包含 query', () => {
    expect(filterBySearch(data, 'an').map((i) => i.key)).toEqual(['b']);
    expect(filterBySearch(data, 'A').map((i) => i.key)).toEqual(['a', 'b', 'd']);
  });

  it('query 为空或纯空白返回全部(浅拷贝)', () => {
    const out = filterBySearch(data, '   ');
    expect(out).toHaveLength(4);
    expect(out).not.toBe(data);
  });

  it('支持自定义 filter 匹配器', () => {
    const out = filterBySearch(data, 'x', (_q, item) => item.key === 'c');
    expect(out.map((i) => i.key)).toEqual(['c']);
  });
});

describe('moveKeys', () => {
  it('向右移动:选中左栏项加入 targetKeys,方向 right,右栏保持原序', () => {
    const r = moveKeys(data, [], ['d', 'a'], 'right');
    expect(r.targetKeys).toEqual(['a', 'd']);
    expect(r.moveKeys.sort()).toEqual(['a', 'd']);
    expect(r.direction).toBe('right');
  });

  it('向左移动:选中右栏项移出 targetKeys', () => {
    const r = moveKeys(data, ['a', 'd'], ['a'], 'left');
    expect(r.targetKeys).toEqual(['d']);
    expect(r.moveKeys).toEqual(['a']);
    expect(r.direction).toBe('left');
  });

  it('跳过禁用项:禁用 key 即便被选中也不移动', () => {
    const r = moveKeys(data, [], ['c'], 'right');
    expect(r.moveKeys).toEqual([]);
    expect(r.targetKeys).toEqual([]);
  });

  it('忽略不在源侧的 key(已在目标态 / 不存在)', () => {
    // 'a' 已在右栏,向右再移动它无效
    const r = moveKeys(data, ['a'], ['a', 'b'], 'right');
    expect(r.moveKeys).toEqual(['b']);
    expect(r.targetKeys).toEqual(['a', 'b']);
  });

  it('无可移动 key 时返回空 moveKeys 且 targetKeys 去重不变', () => {
    const r = moveKeys(data, ['a', 'a'], [], 'right');
    expect(r.moveKeys).toEqual([]);
    expect(r.targetKeys).toEqual(['a']);
  });
});

describe('checkStateOf', () => {
  it('none / some / all 三态(仅按可选项判定)', () => {
    expect(checkStateOf(data, [])).toBe('none');
    expect(checkStateOf(data, ['a'])).toBe('some');
    // a/b/d 是全部可选项(c 禁用),全选中 => all
    expect(checkStateOf(data, ['a', 'b', 'd'])).toBe('all');
  });

  it('无可选项时恒为 none', () => {
    expect(checkStateOf([{ key: 'x', title: 'X', disabled: true }], ['x'])).toBe('none');
  });
});

describe('toggleSelectAll', () => {
  it('勾选并入本栏全部可选项,不含禁用', () => {
    expect(toggleSelectAll(data, [], true).sort()).toEqual(['a', 'b', 'd']);
  });

  it('取消仅移除本栏可选项,保留外部已选 key', () => {
    const out = toggleSelectAll(data, ['a', 'b', 'other'], false);
    expect(out).toEqual(['other']);
  });
});

describe('toggleSelectAllByKeys', () => {
  it('勾选只并入显式传入的作用域 key(模拟过滤后子集),不触碰其它', () => {
    // 模拟搜索激活:作用域仅含可见的 'b',即便整栏还有 a / d 也不应被选中
    expect(toggleSelectAllByKeys([], ['b'], true)).toEqual(['b']);
  });

  it('勾选与已选合并去重', () => {
    expect(toggleSelectAllByKeys(['a'], ['a', 'b'], true).sort()).toEqual(['a', 'b']);
  });

  it('取消只移除作用域内 key,保留作用域外已选(被搜索隐藏的项不丢)', () => {
    // 已选 a/b/d,但本次作用域(可见)仅 b —— 取消只摘掉 b,a/d 保持
    expect(toggleSelectAllByKeys(['a', 'b', 'd'], ['b'], false)).toEqual(['a', 'd']);
  });

  it('不改入参', () => {
    const base = ['a'];
    toggleSelectAllByKeys(base, ['b'], true);
    expect(base).toEqual(['a']);
  });
});

describe('toggleSelectedKey', () => {
  it('加入 / 移除单个 key(不改入参)', () => {
    const base = ['a'];
    expect(toggleSelectedKey(base, 'b')).toEqual(['a', 'b']);
    expect(toggleSelectedKey(base, 'a')).toEqual([]);
    expect(base).toEqual(['a']);
  });
});

describe('countOf', () => {
  it('已选(仅可选项)与总数(含禁用)', () => {
    expect(countOf(data, ['a', 'c'])).toEqual({ checked: 1, total: 4 });
  });
});

import { describe, expect, it } from 'vitest';
import {
  type CommandGroupLike,
  type CommandItemLike,
  edgeEnabledIndex,
  filterItems,
  groupAndFlatten,
  nextEnabledIndex,
  segmentLabel,
} from './logic';

const items: CommandItemLike[] = [
  { value: 'new-file', label: 'New File', keywords: ['create', 'add'] },
  { value: 'open', label: 'Open Folder' },
  { value: 'save', label: 'Save', disabled: true },
  { value: 'settings', label: 'Settings' },
];

describe('filterItems', () => {
  it('query 为空时原样返回全部、无高亮区间、保持顺序', () => {
    const res = filterItems(items, '');
    expect(res).toHaveLength(4);
    expect(res.map((r) => r.item.value)).toEqual(['new-file', 'open', 'save', 'settings']);
    expect(res.every((r) => r.ranges.length === 0)).toBe(true);
  });

  it('仅空白的 query 视作空', () => {
    expect(filterItems(items, '   ')).toHaveLength(4);
  });

  it('子串匹配大小写不敏感,并给出命中区间', () => {
    const res = filterItems(items, 'open');
    expect(res).toHaveLength(1);
    expect(res[0]?.item.value).toBe('open');
    expect(res[0]?.ranges).toEqual([{ start: 0, end: 4 }]);
  });

  it('命中区间定位到 label 中部', () => {
    const res = filterItems(items, 'folder');
    expect(res[0]?.ranges).toEqual([{ start: 5, end: 11 }]);
  });

  it('label 不中时回退 keywords 命中(但不产出高亮区间)', () => {
    const res = filterItems(items, 'create');
    expect(res.map((r) => r.item.value)).toContain('new-file');
    const hit = res.find((r) => r.item.value === 'new-file');
    expect(hit?.ranges).toEqual([]);
  });

  it('子串模式下不匹配跳字符', () => {
    expect(filterItems(items, 'nf')).toHaveLength(0);
  });

  it('fuzzy 模式允许跳字符并合并相邻命中', () => {
    const res = filterItems(items, 'nf', { fuzzy: true });
    expect(res.map((r) => r.item.value)).toContain('new-file');
    const hit = res.find((r) => r.item.value === 'new-file');
    // 'N' 在 0,'F' 在 'New File' 的第 4 位(空格后)
    expect(hit?.ranges).toEqual([
      { start: 0, end: 1 },
      { start: 4, end: 5 },
    ]);
  });

  it('fuzzy 连续命中合并成一段', () => {
    const res = filterItems([{ value: 'x', label: 'Settings' }], 'set', { fuzzy: true });
    expect(res[0]?.ranges).toEqual([{ start: 0, end: 3 }]);
  });

  it('按 score 升序:子串起点越靠前越前', () => {
    const data: CommandItemLike[] = [
      { value: 'a', label: 'xxgo' },
      { value: 'b', label: 'go now' },
    ];
    const res = filterItems(data, 'go');
    expect(res.map((r) => r.item.value)).toEqual(['b', 'a']);
  });

  it('score 相等时保持原始相对顺序(稳定)', () => {
    const data: CommandItemLike[] = [
      { value: 'a', label: 'go a' },
      { value: 'b', label: 'go b' },
    ];
    const res = filterItems(data, 'go');
    expect(res.map((r) => r.item.value)).toEqual(['a', 'b']);
  });
});

describe('segmentLabel', () => {
  it('无区间时返回整段未命中', () => {
    expect(segmentLabel('Open', [])).toEqual([{ text: 'Open', match: false }]);
  });

  it('空 label 返回空数组', () => {
    expect(segmentLabel('', [])).toEqual([]);
  });

  it('切出命中 / 未命中交替片段', () => {
    expect(segmentLabel('Open Folder', [{ start: 5, end: 11 }])).toEqual([
      { text: 'Open ', match: false },
      { text: 'Folder', match: true },
    ]);
  });

  it('命中在开头', () => {
    expect(segmentLabel('Open', [{ start: 0, end: 4 }])).toEqual([{ text: 'Open', match: true }]);
  });

  it('多段命中', () => {
    expect(
      segmentLabel('New File', [
        { start: 0, end: 1 },
        { start: 4, end: 5 },
      ]),
    ).toEqual([
      { text: 'N', match: true },
      { text: 'ew ', match: false },
      { text: 'F', match: true },
      { text: 'ile', match: false },
    ]);
  });

  it('越界区间被夹取,不抛错', () => {
    expect(segmentLabel('ab', [{ start: 0, end: 99 }])).toEqual([{ text: 'ab', match: true }]);
  });

  it('重叠 / 乱序区间不重复吐已消费字符,拼回仍是原 label', () => {
    const segs = segmentLabel('hello', [
      { start: 2, end: 4 },
      { start: 0, end: 3 },
    ]);
    expect(segs.map((s) => s.text).join('')).toBe('hello');
  });
});

describe('groupAndFlatten', () => {
  const groups: Array<CommandGroupLike<CommandItemLike>> = [
    {
      id: 'g1',
      heading: 'Files',
      items: [
        { value: 'new', label: 'New' },
        { value: 'open', label: 'Open', disabled: true },
      ],
    },
    {
      id: 'g2',
      heading: 'Edit',
      items: [{ value: 'copy', label: 'Copy' }],
    },
  ];

  it('组头不可选,可选序列只含未禁用项', () => {
    const { rows, selectable } = groupAndFlatten(groups);
    expect(selectable.map((i) => i.value)).toEqual(['new', 'copy']);
    const headings = rows.filter((r) => r.kind === 'heading');
    expect(headings).toHaveLength(2);
  });

  it('禁用项仍渲染但 selectableIndex=-1', () => {
    const { rows } = groupAndFlatten(groups);
    const openRow = rows.find((r) => r.kind === 'item' && r.item.value === 'open');
    expect(openRow?.kind).toBe('item');
    if (openRow?.kind === 'item') {
      expect(openRow.selectableIndex).toBe(-1);
    }
  });

  it('可选项 selectableIndex 连续递增', () => {
    const { rows } = groupAndFlatten(groups);
    const idxs = rows
      .filter((r): r is Extract<typeof r, { kind: 'item' }> => r.kind === 'item')
      .filter((r) => r.selectableIndex >= 0)
      .map((r) => r.selectableIndex);
    expect(idxs).toEqual([0, 1]);
  });

  it('空分组不产出组头', () => {
    const { rows } = groupAndFlatten([{ heading: 'Empty', items: [] }]);
    expect(rows).toHaveLength(0);
  });

  it('无 heading 的分组不产出组头行', () => {
    const { rows } = groupAndFlatten([{ items: [{ value: 'a', label: 'A' }] }]);
    expect(rows.filter((r) => r.kind === 'heading')).toHaveLength(0);
    expect(rows).toHaveLength(1);
  });
});

describe('nextEnabledIndex', () => {
  it('正向移动 +1', () => {
    expect(nextEnabledIndex(0, 1, 3)).toBe(1);
  });

  it('正向到末位回绕到 0', () => {
    expect(nextEnabledIndex(2, 1, 3)).toBe(0);
  });

  it('反向到 0 回绕到末位', () => {
    expect(nextEnabledIndex(0, -1, 3)).toBe(2);
  });

  it('from=-1 时 dir=1 进入首位', () => {
    expect(nextEnabledIndex(-1, 1, 3)).toBe(0);
  });

  it('from=-1 时 dir=-1 进入末位', () => {
    expect(nextEnabledIndex(-1, -1, 3)).toBe(2);
  });

  it('空序列返回 -1', () => {
    expect(nextEnabledIndex(0, 1, 0)).toBe(-1);
  });
});

describe('edgeEnabledIndex', () => {
  it('dir=-1 取首位', () => {
    expect(edgeEnabledIndex(3, -1)).toBe(0);
  });
  it('dir=1 取末位', () => {
    expect(edgeEnabledIndex(3, 1)).toBe(2);
  });
  it('空序列返回 -1', () => {
    expect(edgeEnabledIndex(0, 1)).toBe(-1);
  });
});

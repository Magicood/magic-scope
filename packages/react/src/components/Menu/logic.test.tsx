import { describe, expect, it } from 'vitest';
import {
  firstFocusable,
  flattenItems,
  itemTextValue,
  lastFocusable,
  type MenuItem,
  nextFocusIndex,
  typeaheadMatch,
} from './logic';

describe('Menu/logic flattenItems', () => {
  it('拍平普通项,disabled 不计入可聚焦序列', () => {
    const items: MenuItem[] = [
      { label: '编辑' },
      { label: '复制', disabled: true },
      { label: '删除' },
    ];
    const { rows, focusable } = flattenItems(items);
    expect(rows).toHaveLength(3);
    // 编辑(0) + 删除(1) 可聚焦,复制 disabled 跳过
    expect(focusable.map((i) => i.label)).toEqual(['编辑', '删除']);
    expect(rows[0]?.focusIndex).toBe(0);
    expect(rows[1]?.focusIndex).toBe(-1);
    expect(rows[2]?.focusIndex).toBe(1);
  });

  it('separator / group 展开:group 标题行不可聚焦,子项续接 focusIndex', () => {
    const items: MenuItem[] = [
      { label: '剪切' },
      { type: 'separator' },
      { type: 'group', label: '导出', items: [{ label: 'PDF' }, { label: 'PNG' }] },
    ];
    const { rows, focusable } = flattenItems(items);
    expect(rows.map((r) => r.kind)).toEqual(['item', 'separator', 'group-label', 'item', 'item']);
    expect(focusable.map((i) => i.label)).toEqual(['剪切', 'PDF', 'PNG']);
  });
});

describe('Menu/logic nextFocusIndex', () => {
  it('边界夹取与回绕', () => {
    expect(nextFocusIndex(0, 1, 3)).toBe(1);
    expect(nextFocusIndex(2, 1, 3)).toBe(2); // 不回绕停在末尾
    expect(nextFocusIndex(2, 1, 3, true)).toBe(0); // 回绕到头
    expect(nextFocusIndex(0, -1, 3, true)).toBe(2); // 回绕到尾
    expect(nextFocusIndex(0, -1, 0)).toBe(-1); // 空
  });

  it('first/last', () => {
    expect(firstFocusable([{ label: 'a' }])).toBe(0);
    expect(firstFocusable([])).toBe(-1);
    expect(lastFocusable([{ label: 'a' }, { label: 'b' }])).toBe(1);
  });
});

describe('Menu/logic typeahead', () => {
  const focusable: MenuItem[] = [
    { label: 'Apple' },
    { label: 'Banana' },
    { label: 'Cherry' },
    { label: 'Avocado' },
  ];

  it('前缀匹配,从当前项之后开始', () => {
    expect(typeaheadMatch(focusable, 'ch', 0)).toBe(2);
    expect(typeaheadMatch(focusable, 'ba', 0)).toBe(1);
  });

  it('全同一字符在「同首字母」项间循环', () => {
    // 从 Apple(0)按 'a' → 下一个 a 开头是 Avocado(3)
    expect(typeaheadMatch(focusable, 'a', 0)).toBe(3);
    // 再按 'a' 从 Avocado(3)→ 回绕到 Apple(0)
    expect(typeaheadMatch(focusable, 'a', 3)).toBe(0);
  });

  it('无匹配返回 -1', () => {
    expect(typeaheadMatch(focusable, 'z', 0)).toBe(-1);
    expect(typeaheadMatch([], 'a', 0)).toBe(-1);
  });

  it('itemTextValue 取 textValue 优先,否则取字符串 label,非字符串取空', () => {
    expect(itemTextValue({ label: 'Hello', textValue: 'world' })).toBe('world');
    expect(itemTextValue({ label: ' Mixed ' })).toBe('mixed');
    expect(itemTextValue({ label: 123 as unknown as string })).toBe('');
  });
});

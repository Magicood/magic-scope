// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tree, type TreeNode } from './index';

const data: TreeNode[] = [
  {
    key: '1',
    title: '父1',
    children: [
      { key: '1-1', title: '子1-1', children: [{ key: '1-1-1', title: '孙1-1-1' }] },
      { key: '1-2', title: '子1-2' },
    ],
  },
  { key: '2', title: '父2' },
];

const node = (key: string) =>
  document.querySelector<HTMLElement>(`[data-key="${key}"]`) as HTMLElement;
const toggleOf = (key: string) => node(key).querySelector('.ms-tree__toggle') as HTMLElement;
const checkboxOf = (key: string) => node(key).querySelector('.ms-tree__checkbox') as HTMLElement;

describe('Tree 展开/选择', () => {
  it('折叠时只见根 treeitem', () => {
    render(<Tree data={data} />);
    expect(screen.getAllByRole('treeitem')).toHaveLength(2);
    expect(node('1')).toHaveAttribute('aria-level', '1');
    expect(node('1')).toHaveAttribute('aria-expanded', 'false');
  });

  it('点箭头展开 → 子节点出现', () => {
    render(<Tree data={data} />);
    fireEvent.click(toggleOf('1'));
    expect(node('1-1')).toBeInTheDocument();
    expect(node('1')).toHaveAttribute('aria-expanded', 'true');
    expect(node('1-1')).toHaveAttribute('aria-level', '2');
  });

  it('defaultExpandAll 全展开', () => {
    render(<Tree data={data} defaultExpandAll />);
    expect(node('1-1-1')).toBeInTheDocument();
  });

  it('点击节点选中(单选)', () => {
    const onSelect = vi.fn();
    render(<Tree data={data} onSelect={onSelect} />);
    fireEvent.click(node('1'));
    expect(onSelect).toHaveBeenCalledWith(['1'], expect.objectContaining({ selected: true }));
    expect(node('1')).toHaveAttribute('aria-selected', 'true');
  });

  it('多选累加', () => {
    const onSelect = vi.fn();
    render(<Tree data={data} multiple onSelect={onSelect} />);
    fireEvent.click(node('1'));
    fireEvent.click(node('2'));
    expect(onSelect).toHaveBeenLastCalledWith(
      expect.arrayContaining(['1', '2']),
      expect.anything(),
    );
  });

  it('disabled 节点不可选', () => {
    const onSelect = vi.fn();
    const d2: TreeNode[] = [{ key: 'x', title: 'X', disabled: true }];
    render(<Tree data={d2} onSelect={onSelect} />);
    fireEvent.click(node('x'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('单选再点已选节点保持选中(不取消)', () => {
    const onSelect = vi.fn();
    render(<Tree data={data} onSelect={onSelect} />);
    fireEvent.click(node('1'));
    fireEvent.click(node('1'));
    expect(node('1')).toHaveAttribute('aria-selected', 'true');
    expect(onSelect).toHaveBeenLastCalledWith(['1'], expect.objectContaining({ selected: true }));
  });

  it('折叠隐藏被聚焦节点后 roving tabindex 不丢失', () => {
    render(<Tree data={data} defaultExpandAll />);
    node('1-1-1').focus(); // 聚焦深层子
    fireEvent.click(toggleOf('1-1')); // 折叠其父 → 1-1-1 从可见集消失
    // 树仍须恰有一个可 Tab 进入项
    expect(document.querySelector('[role="treeitem"][tabindex="0"]')).not.toBeNull();
  });
});

describe('Tree 级联勾选', () => {
  it('勾父连带后代,onCheck 带后代 key', () => {
    const onCheck = vi.fn();
    render(<Tree data={data} checkable defaultExpandAll onCheck={onCheck} />);
    fireEvent.click(checkboxOf('1'));
    const keys = onCheck.mock.calls[0]?.[0] as string[];
    expect(keys).toEqual(expect.arrayContaining(['1', '1-1', '1-1-1', '1-2']));
    expect(node('1')).toHaveAttribute('aria-checked', 'true');
  });

  it('勾叶子 → 单子父全选、跨子祖先半选(aria-checked=mixed)', () => {
    render(<Tree data={data} checkable defaultExpandAll />);
    fireEvent.click(checkboxOf('1-1-1'));
    expect(node('1-1-1')).toHaveAttribute('aria-checked', 'true');
    expect(node('1-1')).toHaveAttribute('aria-checked', 'true'); // 唯一子勾选 → 父全选
    expect(node('1-2')).toHaveAttribute('aria-checked', 'false');
    expect(node('1')).toHaveAttribute('aria-checked', 'mixed'); // 1-1 全选但 1-2 未选 → 半选
  });

  it('勾选框点击不触发选中', () => {
    const onSelect = vi.fn();
    render(<Tree data={data} checkable onSelect={onSelect} />);
    fireEvent.click(checkboxOf('1'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('Tree 键盘导航', () => {
  it('→ 展开,← 折叠', () => {
    render(<Tree data={data} />);
    node('1').focus();
    fireEvent.keyDown(screen.getByRole('tree'), { key: 'ArrowRight' });
    expect(node('1')).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(screen.getByRole('tree'), { key: 'ArrowLeft' });
    expect(node('1')).toHaveAttribute('aria-expanded', 'false');
  });

  it('↓ 移焦到下一可见节点', () => {
    render(<Tree data={data} />);
    node('1').focus();
    fireEvent.keyDown(screen.getByRole('tree'), { key: 'ArrowDown' });
    expect(node('2')).toHaveFocus();
  });

  it('Enter 选中', () => {
    const onSelect = vi.fn();
    render(<Tree data={data} onSelect={onSelect} />);
    node('1').focus();
    fireEvent.keyDown(screen.getByRole('tree'), { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(['1'], expect.anything());
  });

  it('Space 勾选(checkable)', () => {
    const onCheck = vi.fn();
    render(<Tree data={data} checkable onCheck={onCheck} />);
    node('1').focus();
    fireEvent.keyDown(screen.getByRole('tree'), { key: ' ' });
    expect(onCheck).toHaveBeenCalled();
  });
});

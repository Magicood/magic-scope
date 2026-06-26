// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tabs } from './Tabs';

const items = [
  { value: 'a', label: 'A', content: 'panel-a' },
  { value: 'b', label: 'B', content: 'panel-b' },
  { value: 'c', label: 'C', content: 'panel-c' },
];

describe('Tabs', () => {
  it('默认选中第一项并渲染其面板', () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('panel-a')).toBeInTheDocument();
  });

  it('点击切换选中与面板', () => {
    render(<Tabs items={items} />);
    fireEvent.click(screen.getByRole('tab', { name: 'B' }));
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('panel-b')).toBeInTheDocument();
  });

  it('方向键 → 切换到下一标签', () => {
    render(<Tabs items={items} />);
    const tabA = screen.getByRole('tab', { name: 'A' });
    tabA.focus();
    fireEvent.keyDown(tabA, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
  });

  it('竖排时 ArrowDown 切换、ArrowRight 不接管', () => {
    render(<Tabs items={items} orientation="vertical" />);
    const tabA = screen.getByRole('tab', { name: 'A' });
    tabA.focus();
    fireEvent.keyDown(tabA, { key: 'ArrowRight' });
    // 横向键在竖排下不切换
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(tabA, { key: 'ArrowDown' });
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('keepMounted 保留未选 panel(hidden 不卸载)', () => {
    render(<Tabs items={items} keepMounted />);
    // 三个 panel 都在 DOM 中,未选的 hidden
    expect(screen.getByText('panel-b')).toBeInTheDocument();
    const panelB = screen.getByText('panel-b');
    expect(panelB).toHaveAttribute('hidden');
    const panelA = screen.getByText('panel-a');
    expect(panelA).not.toHaveAttribute('hidden');
  });

  it('onTabClick 在切换前触发;preventDefault 可阻断切换', () => {
    const onTabClick = vi.fn((_value: string, e: React.MouseEvent) => e.preventDefault());
    const onChange = vi.fn();
    render(<Tabs items={items} onTabClick={onTabClick} onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'B' }));
    expect(onTabClick).toHaveBeenCalledWith('b', expect.anything());
    // 被 preventDefault 拦截,未切换
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
  });

  it('TabItem.onClick 与内部切换都触发(composeEventHandlers)', () => {
    const userClick = vi.fn();
    const onChange = vi.fn();
    const data = [
      { value: 'a', label: 'A', content: 'pa' },
      { value: 'b', label: 'B', content: 'pb', onClick: userClick },
    ];
    render(<Tabs items={data} onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'B' }));
    expect(userClick).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('closable + onEdit:点关闭按钮触发 remove,不触发选中', () => {
    const onEdit = vi.fn();
    const onChange = vi.fn();
    const data = [
      { value: 'a', label: 'A', content: 'pa' },
      { value: 'b', label: 'B', content: 'pb', closable: true },
    ];
    render(<Tabs items={data} onEdit={onEdit} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '移除' }));
    expect(onEdit).toHaveBeenCalledWith('b', 'remove');
    // 关闭按钮 stopPropagation,未切换选中
    expect(onChange).not.toHaveBeenCalled();
  });

  it('addable + onEdit:点新增按钮触发 add', () => {
    const onEdit = vi.fn();
    render(<Tabs items={items} addable onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button', { name: '新增标签' }));
    expect(onEdit).toHaveBeenCalledWith('', 'add');
  });

  it('根透传原生事件与属性(...rest):用户 onKeyDown 与内部导航都触发', () => {
    const userKeyDown = vi.fn();
    const onContextMenu = vi.fn();
    render(
      <Tabs
        items={items}
        data-testid="root"
        onKeyDown={userKeyDown}
        onContextMenu={onContextMenu}
      />,
    );
    const root = screen.getByTestId('root');
    expect(root).toBeInTheDocument();
    fireEvent.contextMenu(root);
    expect(onContextMenu).toHaveBeenCalled();

    const tabA = screen.getByRole('tab', { name: 'A' });
    tabA.focus();
    fireEvent.keyDown(tabA, { key: 'ArrowRight' });
    // 用户 onKeyDown 与内部切换都执行
    expect(userKeyDown).toHaveBeenCalled();
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
  });

  it('tone / size 类挂到根', () => {
    const { container } = render(<Tabs items={items} tone="success" size="lg" />);
    const root = container.querySelector('.ms-tabs');
    expect(root).toHaveClass('ms-tone-success');
    expect(root).toHaveClass('ms-tabs--lg');
  });
});

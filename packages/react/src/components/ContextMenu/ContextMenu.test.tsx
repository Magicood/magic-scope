// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContextMenu } from './ContextMenu';
import { clampToViewport } from './logic';

describe('ContextMenu', () => {
  it('右键弹出菜单(定位光标处)并渲染菜单项', () => {
    render(
      <ContextMenu items={[{ label: '编辑' }, { label: '删除', danger: true }]}>
        <div data-testid="area">区域</div>
      </ContextMenu>,
    );
    expect(screen.queryByRole('menu')).toBeNull();

    fireEvent.contextMenu(screen.getByTestId('area'), { clientX: 60, clientY: 40 });
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveClass('ms-context-menu');
    expect(screen.getByRole('menuitem', { name: '编辑' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '删除' })).toHaveClass('ms-menu__item--danger');
  });

  it('点菜单项触发 onSelect 并关闭', () => {
    const onSelect = vi.fn();
    render(
      <ContextMenu items={[{ label: '编辑', onSelect }]}>
        <div data-testid="a">x</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('a'));
    fireEvent.click(screen.getByRole('menuitem', { name: '编辑' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('Esc 关闭', () => {
    render(
      <ContextMenu items={[{ label: 'x' }]}>
        <div data-testid="a">x</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('a'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('禁用项不触发 onSelect', () => {
    const onSelect = vi.fn();
    render(
      <ContextMenu items={[{ label: '禁用', disabled: true, onSelect }]}>
        <div data-testid="a">x</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('a'));
    const item = screen.getByRole('menuitem', { name: '禁用' });
    expect(item).toBeDisabled();
    fireEvent.click(item);
    expect(onSelect).not.toHaveBeenCalled();
  });

  // —— 新增能力 ——

  it('用户 onContextMenu 与内部定位都触发;preventDefault 可拦截打开', () => {
    const userHandler = vi.fn();
    const { rerender } = render(
      <ContextMenu items={[{ label: 'x' }]} onContextMenu={userHandler}>
        <div data-testid="a">x</div>
      </ContextMenu>,
    );
    // 用户处理器与内部打开都触发。
    fireEvent.contextMenu(screen.getByTestId('a'));
    expect(userHandler).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });

    // 用户 preventDefault → 内部不打开。
    const intercept = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    rerender(
      <ContextMenu items={[{ label: 'x' }]} onContextMenu={intercept}>
        <div data-testid="a">x</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('a'));
    expect(intercept).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('onOpen 带光标坐标、onOpenChange 通知开合、onSelect 菜单级回调都触发', () => {
    const onOpen = vi.fn();
    const onOpenChange = vi.fn();
    const onSelect = vi.fn();
    render(
      <ContextMenu
        items={[{ label: '甲' }, { label: '乙' }]}
        onOpen={onOpen}
        onOpenChange={onOpenChange}
        onSelect={onSelect}
      >
        <div data-testid="a">x</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('a'), { clientX: 12, clientY: 34 });
    expect(onOpen).toHaveBeenCalledWith(expect.anything(), { x: 12, y: 34 });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByRole('menuitem', { name: '乙' }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: '乙' }), 1);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('tone 挂到浮层根、separator / group / shortcut 等结构正确渲染', () => {
    render(
      <ContextMenu
        tone="success"
        items={[
          { type: 'group', label: '文件', items: [{ label: '新建', shortcut: 'Ctrl N' }] },
          { type: 'separator' },
          { label: '退出' },
        ]}
      >
        <div data-testid="a">x</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('a'));
    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('ms-tone-success');
    expect(screen.getByText('文件')).toHaveClass('ms-menu__group-label');
    expect(screen.getByRole('menuitem', { name: /新建/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '退出' })).toBeInTheDocument();
  });

  it('onEscapeKeyDown preventDefault 可拦截关闭', () => {
    const onEscapeKeyDown = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <ContextMenu items={[{ label: 'x' }]} onEscapeKeyDown={onEscapeKeyDown}>
        <div data-testid="a">x</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('a'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    // 被拦截 → 菜单仍在。
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('受控 open + 原生属性透传到包裹根与浮层', () => {
    render(
      <ContextMenu
        open
        items={[{ label: '项' }]}
        data-area="1"
        overlayProps={{ 'data-overlay': '1' }}
      >
        <div data-testid="area">区域</div>
      </ContextMenu>,
    );
    // 受控 open=true → 直接渲染浮层。
    const menu = screen.getByRole('menu');
    expect(menu).toHaveAttribute('data-overlay', '1');
    expect(screen.getByTestId('area').closest('.ms-context-menu-area')).toHaveAttribute(
      'data-area',
      '1',
    );
  });

  it('clampToViewport 纯函数:越界夹回、超大浮层退到 pad', () => {
    expect(
      clampToViewport(
        { x: 990, y: 590 },
        { width: 200, height: 100 },
        { width: 1000, height: 600 },
      ),
    ).toEqual({ x: 792, y: 492 });
    // 浮层比视口还大 → 退到 pad 左上对齐,不返回负坐标。
    expect(
      clampToViewport(
        { x: 50, y: 50 },
        { width: 2000, height: 2000 },
        { width: 1000, height: 600 },
      ),
    ).toEqual({ x: 8, y: 8 });
  });
});

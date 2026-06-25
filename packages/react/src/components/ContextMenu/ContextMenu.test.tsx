// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContextMenu } from './ContextMenu';

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
});

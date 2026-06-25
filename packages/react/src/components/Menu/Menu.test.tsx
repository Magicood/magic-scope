// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Menu } from './Menu';

describe('Menu', () => {
  const items = [
    { label: '编辑' },
    { label: '复制', disabled: true },
    { label: '删除', danger: true },
  ];

  it('在 trigger 上注入 menu 相关 aria 属性', () => {
    render(<Menu trigger={<button type="button">操作</button>} items={items} />);
    const trigger = screen.getByRole('button', { name: '操作' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('点击 trigger 后 aria-expanded 变为 true 并设置 aria-controls', () => {
    render(<Menu trigger={<button type="button">操作</button>} items={items} />);
    const trigger = screen.getByRole('button', { name: '操作' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls');
  });

  it('渲染 menu 容器与 menuitem,并对 disabled / danger 项应用正确属性与类名', () => {
    const { container } = render(
      <Menu
        trigger={<button type="button">操作</button>}
        items={items}
        className="custom-overlay"
      />,
    );
    const menu = screen.getByRole('menu', { hidden: true });
    expect(menu).toHaveAttribute('aria-orientation', 'vertical');
    expect(menu).toHaveClass('ms-menu', 'custom-overlay');

    const disabledItem = screen.getByRole('menuitem', { name: '复制', hidden: true });
    expect(disabledItem).toBeDisabled();

    const dangerItem = screen.getByRole('menuitem', { name: '删除', hidden: true });
    expect(dangerItem).toHaveClass('ms-menu__item', 'ms-menu__item--danger');

    expect(container.querySelectorAll('[role="menuitem"]')).toHaveLength(3);
  });

  it('点击可用项触发 onSelect,点击 disabled 项不触发', () => {
    const onEdit = vi.fn();
    const onCopy = vi.fn();
    render(
      <Menu
        trigger={<button type="button">操作</button>}
        items={[
          { label: '编辑', onSelect: onEdit },
          { label: '复制', disabled: true, onSelect: onCopy },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('menuitem', { name: '编辑', hidden: true }));
    expect(onEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('menuitem', { name: '复制', hidden: true }));
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('Enter 键在 menuitem 上触发 onSelect', () => {
    const onEdit = vi.fn();
    render(
      <Menu
        trigger={<button type="button">操作</button>}
        items={[{ label: '编辑', onSelect: onEdit }]}
      />,
    );
    fireEvent.keyDown(screen.getByRole('menuitem', { name: '编辑', hidden: true }), {
      key: 'Enter',
    });
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

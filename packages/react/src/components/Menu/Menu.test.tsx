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

  it('在浮层根挂 tone class 与 placement/align data 属性', () => {
    render(
      <Menu
        trigger={<button type="button">操作</button>}
        items={items}
        tone="danger"
        placement="top"
        align="end"
      />,
    );
    const menu = screen.getByRole('menu', { hidden: true });
    expect(menu).toHaveClass('ms-tone-danger');
    expect(menu).toHaveAttribute('data-placement', 'top');
    expect(menu).toHaveAttribute('data-align', 'end');
  });

  it('渲染 separator、group 标题与分组项,且只对可聚焦项计数', () => {
    render(
      <Menu
        trigger={<button type="button">操作</button>}
        items={[
          { label: '剪切' },
          { type: 'separator' },
          {
            type: 'group',
            label: '导出',
            items: [{ label: 'PDF' }, { label: 'PNG' }],
          },
        ]}
      />,
    );
    expect(screen.getByText('导出')).toBeInTheDocument();
    expect(screen.getAllByRole('separator', { hidden: true })).toHaveLength(1);
    // 剪切 + PDF + PNG = 3 个可聚焦 menuitem(group 标题不是 menuitem)
    expect(screen.getAllByRole('menuitem', { hidden: true })).toHaveLength(3);
  });

  it('checked 项渲染为 menuitemcheckbox/radio 并设置 aria-checked,选中后保持菜单打开', () => {
    const onOpenChange = vi.fn();
    const onToggle = vi.fn();
    render(
      <Menu
        trigger={<button type="button">操作</button>}
        onOpenChange={onOpenChange}
        items={[
          { label: '自动换行', checked: true, onSelect: onToggle },
          { label: '深色模式', checked: false, selectionRole: 'radio' },
        ]}
      />,
    );
    const checkbox = screen.getByRole('menuitemcheckbox', { name: '自动换行', hidden: true });
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    const radio = screen.getByRole('menuitemradio', { name: '深色模式', hidden: true });
    expect(radio).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledTimes(1);
    // checkbox/radio 项不关闭菜单(不应触发 onOpenChange(false))
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('href 项渲染为链接(a[href]),仍触发 onSelect', () => {
    const onGo = vi.fn();
    render(
      <Menu
        trigger={<button type="button">操作</button>}
        items={[{ label: '文档', href: '/docs', onSelect: onGo }]}
      />,
    );
    const link = screen.getByRole('menuitem', { name: '文档', hidden: true });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/docs');
    fireEvent.click(link);
    expect(onGo).toHaveBeenCalledTimes(1);
  });

  it('受控 open + onOpenChange:点击 trigger 通知开合但内部状态以 prop 为准', () => {
    const onOpenChange = vi.fn();
    render(
      <Menu
        trigger={<button type="button">操作</button>}
        items={items}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );
    const trigger = screen.getByRole('button', { name: '操作' });
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // 受控:prop 未变,aria-expanded 仍为 false
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('trigger 的用户 onClick 与内部开合处理器都触发(compose 不丢失用户处理器)', () => {
    const userClick = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Menu
        trigger={
          <button type="button" onClick={userClick}>
            操作
          </button>
        }
        items={items}
        onOpenChange={onOpenChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '操作' }));
    expect(userClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('菜单级 onSelect 与项级 onClick 都触发;项级 onClick preventDefault 可阻断 onSelect', () => {
    const menuSelect = vi.fn();
    const itemSelect = vi.fn();
    const itemClick = vi.fn();
    render(
      <Menu
        trigger={<button type="button">操作</button>}
        onSelect={menuSelect}
        items={[
          { label: '保存', onSelect: itemSelect, onClick: itemClick },
          {
            label: '拦截',
            onSelect: itemSelect,
            onClick: (e) => e.preventDefault(),
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('menuitem', { name: '保存', hidden: true }));
    expect(itemClick).toHaveBeenCalledTimes(1);
    expect(itemSelect).toHaveBeenCalledTimes(1);
    expect(menuSelect).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('menuitem', { name: '拦截', hidden: true }));
    // preventDefault 后 onSelect / 菜单级 onSelect 不再触发
    expect(itemSelect).toHaveBeenCalledTimes(1);
    expect(menuSelect).toHaveBeenCalledTimes(1);
  });

  it('onEscapeKeyDown 可 preventDefault 拦截关闭', () => {
    const onOpenChange = vi.fn();
    render(
      <Menu
        trigger={<button type="button">操作</button>}
        items={[{ label: '编辑' }]}
        defaultOpen
        onOpenChange={onOpenChange}
        onEscapeKeyDown={(e) => e.preventDefault()}
      />,
    );
    fireEvent.keyDown(screen.getByRole('menuitem', { name: '编辑', hidden: true }), {
      key: 'Escape',
    });
    // 被拦截 → 不关闭
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('组合式 Menu.Item / Separator / Group 可独立渲染', () => {
    render(
      <Menu.Group label="文件">
        <Menu.Item icon={<span>📄</span>} shortcut="cmd+s">
          保存
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item danger>删除</Menu.Item>
      </Menu.Group>,
    );
    expect(screen.getByText('文件')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /保存/ })).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '删除' })).toHaveClass('ms-menu__item--danger');
  });
});

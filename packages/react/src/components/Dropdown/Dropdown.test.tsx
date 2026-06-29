// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Dropdown, type DropdownItem } from './Dropdown';

// 浮层进 top-layer(popover="auto"),jsdom 视其内容为 hidden,查询统一带 { hidden: true }。
const baseItems: DropdownItem[] = [
  { label: '个人资料', onSelect: vi.fn() },
  { label: '账号设置', onSelect: vi.fn() },
  { type: 'separator' },
  { label: '退出登录', danger: true, onSelect: vi.fn() },
];

describe('Dropdown', () => {
  it('trigger 注入 aria-haspopup=menu,初始 aria-expanded=false', () => {
    render(<Dropdown trigger={<button type="button">菜单</button>} items={baseItems} />);
    const trigger = screen.getByRole('button', { name: '菜单' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('点击 trigger 展开菜单,渲染 role=menu 与 role=menuitem 项', () => {
    render(<Dropdown trigger={<button type="button">菜单</button>} items={baseItems} />);
    const trigger = screen.getByRole('button', { name: '菜单' });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls');
    const menu = screen.getByRole('menu', { hidden: true });
    expect(menu).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getByRole('menuitem', { name: '个人资料', hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '退出登录', hidden: true })).toHaveClass(
      'ms-dropdown__item--danger',
    );
  });

  it('trigger 上按 ↓ 打开菜单(menu button 行为)', () => {
    render(<Dropdown trigger={<button type="button">菜单</button>} items={baseItems} />);
    const trigger = screen.getByRole('button', { name: '菜单' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('点击菜单项触发 onSelect 与项级 onClick,并默认关闭(closeOnSelect)', () => {
    const onSelect = vi.fn();
    const itemClick = vi.fn();
    const items: DropdownItem[] = [{ label: '动作', onClick: itemClick, onSelect: vi.fn() }];
    render(
      <Dropdown trigger={<button type="button">菜单</button>} items={items} onSelect={onSelect} />,
    );
    const trigger = screen.getByRole('button', { name: '菜单' });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('menuitem', { name: '动作', hidden: true }));

    expect(itemClick).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closeOnSelect=false 时选中后菜单保持打开', () => {
    const items: DropdownItem[] = [{ label: '动作', onSelect: vi.fn() }];
    render(
      <Dropdown
        trigger={<button type="button">菜单</button>}
        items={items}
        closeOnSelect={false}
      />,
    );
    const trigger = screen.getByRole('button', { name: '菜单' });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('menuitem', { name: '动作', hidden: true }));
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('禁用项不触发选中', () => {
    const onSelect = vi.fn();
    const items: DropdownItem[] = [{ label: '禁用项', disabled: true, onSelect: vi.fn() }];
    render(
      <Dropdown trigger={<button type="button">菜单</button>} items={items} onSelect={onSelect} />,
    );
    fireEvent.click(screen.getByRole('button', { name: '菜单' }));
    const item = screen.getByRole('menuitem', { name: '禁用项', hidden: true });
    fireEvent.click(item);
    expect(onSelect).not.toHaveBeenCalled();
    expect(item).toBeDisabled();
  });

  it('checkbox 项渲染 menuitemcheckbox + aria-checked,选中后保持打开', () => {
    const items: DropdownItem[] = [
      { label: '显示网格', checked: true, selectionRole: 'checkbox', onSelect: vi.fn() },
    ];
    render(<Dropdown trigger={<button type="button">菜单</button>} items={items} />);
    const trigger = screen.getByRole('button', { name: '菜单' });
    fireEvent.click(trigger);
    const item = screen.getByRole('menuitemcheckbox', { name: '显示网格', hidden: true });
    expect(item).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(item);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  // 回归 #1:给了 checked 但没显式 selectionRole —— 渲染会推成 menuitemcheckbox,
  // 选中后必须同样保持打开(keepOpen 口径与渲染推导对齐),不能像普通项一样关掉。
  it('checked 但缺 selectionRole 的项:仍渲染 menuitemcheckbox 且选中后保持打开', () => {
    const onSelect = vi.fn();
    const items: DropdownItem[] = [{ label: '显示网格', checked: true, onSelect }];
    render(<Dropdown trigger={<button type="button">菜单</button>} items={items} />);
    const trigger = screen.getByRole('button', { name: '菜单' });
    fireEvent.click(trigger);
    const item = screen.getByRole('menuitemcheckbox', { name: '显示网格', hidden: true });
    expect(item).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(item);
    expect(onSelect).toHaveBeenCalledTimes(1);
    // 关键:菜单保持打开,便于连续切换。
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  // 回归 #2:子菜单项给了 checked 但缺 selectionRole —— 渲染推成 menuitemcheckbox,
  // 点击切换后整个菜单必须保持打开,不能一次切换就关掉。
  it('submenu 子项 checked 缺 selectionRole:切换后菜单保持打开', () => {
    const subSelect = vi.fn();
    const items: DropdownItem[] = [
      { label: '更多', submenu: [{ label: '网格', checked: true, onSelect: subSelect }] },
    ];
    render(<Dropdown trigger={<button type="button">菜单</button>} items={items} />);
    const trigger = screen.getByRole('button', { name: '菜单' });
    fireEvent.click(trigger);
    const parent = screen.getByRole('menuitem', { name: /更多/, hidden: true });
    fireEvent.keyDown(parent, { key: 'ArrowRight' });
    const sub = screen.getByRole('menuitemcheckbox', { name: '网格', hidden: true });
    expect(sub).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(sub);
    expect(subSelect).toHaveBeenCalledTimes(1);
    // 关键:整个 Dropdown 保持打开。
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  // 回归 #3:非受控下「打开 → 禁用 → 再启用」不得自动复现上次打开态。
  it('非受控:打开后 disabled 再恢复,菜单不自动重新弹出', () => {
    const { rerender } = render(
      <Dropdown trigger={<button type="button">菜单</button>} items={baseItems} />,
    );
    const trigger = screen.getByRole('button', { name: '菜单' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // 父级置 disabled:视觉收起。
    rerender(<Dropdown trigger={<button type="button">菜单</button>} items={baseItems} disabled />);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // 父级恢复 disabled=false:用户未操作,应保持关闭。
    rerender(<Dropdown trigger={<button type="button">菜单</button>} items={baseItems} />);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // 再次点击仍可正常打开。
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  // 回归 #4:菜单内按 Tab 关闭时,焦点显式回到 trigger(不落空 / 不跳 body)。
  it('菜单项按 Tab:阻止默认、关闭并把焦点交还 trigger', () => {
    render(<Dropdown trigger={<button type="button">菜单</button>} items={baseItems} />);
    const trigger = screen.getByRole('button', { name: '菜单' });
    fireEvent.click(trigger);
    const first = screen.getByRole('menuitem', { name: '个人资料', hidden: true });
    const ev = fireEvent.keyDown(first, { key: 'Tab' });
    // preventDefault 生效(fireEvent 返回 false 表示 defaultPrevented)。
    expect(ev).toBe(false);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('键盘 ↓ 在菜单内移焦(roving),Esc 关闭并回焦 trigger', () => {
    render(<Dropdown trigger={<button type="button">菜单</button>} items={baseItems} />);
    const trigger = screen.getByRole('button', { name: '菜单' });
    fireEvent.click(trigger);
    const first = screen.getByRole('menuitem', { name: '个人资料', hidden: true });
    const second = screen.getByRole('menuitem', { name: '账号设置', hidden: true });

    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(second).toHaveFocus();

    fireEvent.keyDown(second, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('受控 open:外部状态驱动,内部交互走 onOpenChange', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Dropdown
        trigger={<button type="button">菜单</button>}
        items={baseItems}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );
    const trigger = screen.getByRole('button', { name: '菜单' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // 受控:未被父级 rerender 前不自行打开
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <Dropdown
        trigger={<button type="button">菜单</button>}
        items={baseItems}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('disabled 时 trigger 标 aria-disabled,点击不展开', () => {
    render(<Dropdown trigger={<button type="button">菜单</button>} items={baseItems} disabled />);
    const trigger = screen.getByRole('button', { name: '菜单' });
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');
  });

  it('链接项渲染为 <a href> 且 role=menuitem', () => {
    const items: DropdownItem[] = [
      { label: '文档', href: 'https://example.com', target: '_blank' },
    ];
    render(<Dropdown trigger={<button type="button">菜单</button>} items={items} />);
    fireEvent.click(screen.getByRole('button', { name: '菜单' }));
    const link = screen.getByRole('menuitem', { name: '文档', hidden: true });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('一层 submenu:→ 展开二级菜单,点击子项触发其 onSelect', () => {
    const subSelect = vi.fn();
    const items: DropdownItem[] = [
      { label: '更多', submenu: [{ label: '导出', onSelect: subSelect }] },
    ];
    render(<Dropdown trigger={<button type="button">菜单</button>} items={items} />);
    fireEvent.click(screen.getByRole('button', { name: '菜单' }));
    const parent = screen.getByRole('menuitem', { name: /更多/, hidden: true });
    expect(parent).toHaveAttribute('aria-haspopup', 'menu');
    expect(parent).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(parent, { key: 'ArrowRight' });
    expect(parent).toHaveAttribute('aria-expanded', 'true');
    const sub = screen.getByRole('menuitem', { name: '导出', hidden: true });
    fireEvent.click(sub);
    expect(subSelect).toHaveBeenCalledTimes(1);
  });

  it('children 复合用法:不传 items 时原样渲染自定义菜单内容', () => {
    render(
      <Dropdown trigger={<button type="button">菜单</button>} defaultOpen>
        <button type="button" role="menuitem">
          自定义项
        </button>
      </Dropdown>,
    );
    expect(screen.getByRole('menu', { hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '自定义项', hidden: true })).toBeInTheDocument();
  });

  it('空 items 渲染空态文案', () => {
    render(<Dropdown trigger={<button type="button">菜单</button>} items={[]} defaultOpen />);
    expect(screen.getByText('无匹配项')).toBeInTheDocument();
  });

  it('合并 trigger 自带的 onClick(compose,不丢用户处理器)', () => {
    const userClick = vi.fn();
    render(
      <Dropdown
        trigger={
          <button type="button" onClick={userClick}>
            菜单
          </button>
        }
        items={baseItems}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '菜单' }));
    expect(userClick).toHaveBeenCalledTimes(1);
  });

  it('hover 触发:指针进 trigger 即展开', () => {
    render(
      <Dropdown
        trigger={<button type="button">菜单</button>}
        items={baseItems}
        triggerAction="hover"
      />,
    );
    const trigger = screen.getByRole('button', { name: '菜单' });
    fireEvent.pointerEnter(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('classNames 槽位:自定义 root / item 类名生效', () => {
    render(
      <Dropdown
        trigger={<button type="button">菜单</button>}
        items={[{ label: '动作' }]}
        className="my-overlay"
        classNames={{ item: 'my-item' }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '菜单' }));
    expect(screen.getByRole('menu', { hidden: true }).closest('.ms-dropdown')).toHaveClass(
      'my-overlay',
    );
    expect(screen.getByRole('menuitem', { name: '动作', hidden: true })).toHaveClass('my-item');
  });

  // 回归:CSS Anchor Positioning 锚定不被用户 style 覆盖
  // —— 触发器侧 anchor-name、面板侧 position-anchor 都要在用户 style 之后,
  // 否则锚点丢失,popover 退化到 top-layer 左上角。
  describe('CSS Anchor Positioning:用户 style 不覆盖锚定', () => {
    it('trigger 子元素传 style:同时保留用户样式与 anchor-name', () => {
      render(
        <Dropdown
          trigger={
            <button type="button" style={{ maxInlineSize: '16rem' }}>
              菜单
            </button>
          }
          items={baseItems}
        />,
      );
      const trigger = screen.getByRole('button', { name: '菜单' });
      // 用户样式仍在。
      expect(trigger.style.maxInlineSize).toBe('16rem');
      // anchor-name 也在(未被用户 style 覆盖)——以 --ms-dropdown- 开头。
      expect(trigger.style.getPropertyValue('anchor-name')).toMatch(/^--ms-dropdown-/);
      // inline style 字符串里两者并存。
      const cssText = trigger.getAttribute('style') ?? '';
      expect(cssText).toContain('max-inline-size: 16rem');
      expect(cssText).toContain('anchor-name:');
    });

    it('面板传 style:同时保留用户样式与 position-anchor', () => {
      render(
        <Dropdown
          trigger={<button type="button">菜单</button>}
          items={baseItems}
          defaultOpen
          style={{ maxInlineSize: '20rem' }}
        />,
      );
      const panel = screen
        .getByRole('menu', { hidden: true })
        .closest('.ms-dropdown') as HTMLElement;
      // 用户样式仍在。
      expect(panel.style.maxInlineSize).toBe('20rem');
      // position-anchor 未被覆盖,指向与 trigger 相同的 --ms-dropdown- 锚名。
      expect(panel.style.getPropertyValue('position-anchor')).toMatch(/^--ms-dropdown-/);
      const cssText = panel.getAttribute('style') ?? '';
      expect(cssText).toContain('max-inline-size: 20rem');
      expect(cssText).toContain('position-anchor:');
    });

    it('用户 style 显式带 position-anchor 也不能盖掉组件锚定(锚名放最后)', () => {
      render(
        <Dropdown
          trigger={<button type="button">菜单</button>}
          items={baseItems}
          defaultOpen
          // 用户恶意/无意传入冲突的 position-anchor:不得生效。
          // positionAnchor 不在标准 CSSProperties 上,经 Record 透传给 DOM。
          style={{ positionAnchor: '--evil' } as unknown as CSSProperties}
        />,
      );
      const panel = screen
        .getByRole('menu', { hidden: true })
        .closest('.ms-dropdown') as HTMLElement;
      // 组件锚定胜出(--ms-dropdown-*),而非 --evil。
      expect(panel.style.getPropertyValue('position-anchor')).toMatch(/^--ms-dropdown-/);
      expect(panel.style.getPropertyValue('position-anchor')).not.toBe('--evil');
    });
  });
});

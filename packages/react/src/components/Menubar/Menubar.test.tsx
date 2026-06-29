// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Menubar, type MenubarItem } from './Menubar';

// 面板进 top-layer(popover="auto"),jsdom 视其内容为 hidden,菜单内查询统一带 { hidden: true }。
const fileItems: MenubarItem[] = [
  { label: '新建', shortcut: 'Cmd+N', onSelect: vi.fn() },
  { label: '打开', onSelect: vi.fn() },
  { type: 'separator' },
  { label: '退出', danger: true, onSelect: vi.fn() },
];
const editItems: MenubarItem[] = [
  { label: '撤销', onSelect: vi.fn() },
  { label: '重做', disabled: true, onSelect: vi.fn() },
];

function Basic(props?: Partial<Parameters<typeof Menubar>[0]>) {
  return (
    <Menubar {...props}>
      <Menubar.Menu value="file" label="文件" items={fileItems} />
      <Menubar.Menu value="edit" label="编辑" items={editItems} />
      <Menubar.Menu value="view" label="视图" items={[{ label: '放大', onSelect: vi.fn() }]} />
    </Menubar>
  );
}

describe('Menubar', () => {
  it('根 role=menubar + aria-orientation=horizontal,触发器 role=menuitem + aria-haspopup=menu', () => {
    render(<Basic />);
    const bar = screen.getByRole('menubar');
    expect(bar).toHaveAttribute('aria-orientation', 'horizontal');
    const file = screen.getByRole('menuitem', { name: '文件' });
    expect(file).toHaveAttribute('aria-haspopup', 'menu');
    expect(file).toHaveAttribute('aria-expanded', 'false');
  });

  it('点击触发器展开对应菜单,渲染 role=menu 与项;再点击关闭', () => {
    render(<Basic />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    fireEvent.click(file);
    expect(file).toHaveAttribute('aria-expanded', 'true');
    expect(file).toHaveAttribute('aria-controls');
    const menu = screen.getByRole('menu', { hidden: true });
    expect(menu).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getByRole('menuitem', { name: /新建/, hidden: true })).toBeInTheDocument();
    fireEvent.click(file);
    expect(file).toHaveAttribute('aria-expanded', 'false');
  });

  it('同一时刻至多一个菜单打开:打开「文件」后点击「编辑」切换', () => {
    render(<Basic />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    const edit = screen.getByRole('menuitem', { name: '编辑' });
    fireEvent.click(file);
    expect(file).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(edit);
    expect(file).toHaveAttribute('aria-expanded', 'false');
    expect(edit).toHaveAttribute('aria-expanded', 'true');
  });

  it('顶层 ←→ 在触发器间 roving 移动(未打开时仅移焦,回绕)', () => {
    render(<Basic />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    const edit = screen.getByRole('menuitem', { name: '编辑' });
    const view = screen.getByRole('menuitem', { name: '视图' });
    file.focus();
    fireEvent.keyDown(file, { key: 'ArrowRight' });
    expect(edit).toHaveFocus();
    fireEvent.keyDown(edit, { key: 'ArrowRight' });
    expect(view).toHaveFocus();
    // 末尾向右回绕到首
    fireEvent.keyDown(view, { key: 'ArrowRight' });
    expect(file).toHaveFocus();
    // 首向左回绕到末
    fireEvent.keyDown(file, { key: 'ArrowLeft' });
    expect(view).toHaveFocus();
  });

  it('Home / End 跳首尾触发器', () => {
    render(<Basic />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    const view = screen.getByRole('menuitem', { name: '视图' });
    file.focus();
    fireEvent.keyDown(file, { key: 'End' });
    expect(view).toHaveFocus();
    fireEvent.keyDown(view, { key: 'Home' });
    expect(file).toHaveFocus();
  });

  it('↓ / Enter 在触发器上打开当前菜单', () => {
    render(<Basic />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    fireEvent.keyDown(file, { key: 'ArrowDown' });
    expect(file).toHaveAttribute('aria-expanded', 'true');

    const edit = screen.getByRole('menuitem', { name: '编辑' });
    fireEvent.keyDown(edit, { key: 'Enter' });
    expect(edit).toHaveAttribute('aria-expanded', 'true');
    // 切换到 edit 后 file 关闭
    expect(file).toHaveAttribute('aria-expanded', 'false');
  });

  it('已打开某菜单时,顶层 → 切换到相邻菜单的打开态', () => {
    render(<Basic />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    const edit = screen.getByRole('menuitem', { name: '编辑' });
    fireEvent.click(file);
    expect(file).toHaveAttribute('aria-expanded', 'true');
    // 在触发器上按 → :切到 edit 的打开态
    fireEvent.keyDown(file, { key: 'ArrowRight' });
    expect(file).toHaveAttribute('aria-expanded', 'false');
    expect(edit).toHaveAttribute('aria-expanded', 'true');
  });

  it('菜单项点击触发 onSelect 与项级 onClick,默认关闭(closeOnSelect)并回焦触发器', () => {
    const onSelect = vi.fn();
    const itemClick = vi.fn();
    const items: MenubarItem[] = [{ label: '动作', onClick: itemClick, onSelect: vi.fn() }];
    render(
      <Menubar onSelect={onSelect}>
        <Menubar.Menu value="m" label="菜单" items={items} />
      </Menubar>,
    );
    const trigger = screen.getByRole('menuitem', { name: '菜单' });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('menuitem', { name: '动作', hidden: true }));
    expect(itemClick).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: '动作' }), 'm');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('菜单内 ↓↑ roving(跳过 disabled),Esc 关闭并回焦触发器', () => {
    render(<Basic />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    fireEvent.click(file);
    const first = screen.getByRole('menuitem', { name: /新建/, hidden: true });
    const second = screen.getByRole('menuitem', { name: '打开', hidden: true });
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(second).toHaveFocus();
    fireEvent.keyDown(second, { key: 'Escape' });
    expect(file).toHaveAttribute('aria-expanded', 'false');
    expect(file).toHaveFocus();
  });

  it('菜单内 → 切到右邻顶级菜单并打开(项无子菜单时)', () => {
    render(<Basic />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    const edit = screen.getByRole('menuitem', { name: '编辑' });
    fireEvent.click(file);
    const first = screen.getByRole('menuitem', { name: /新建/, hidden: true });
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(file).toHaveAttribute('aria-expanded', 'false');
    expect(edit).toHaveAttribute('aria-expanded', 'true');
  });

  it('菜单内 ← 切到左邻顶级菜单并打开(子菜单未展开时)', () => {
    render(<Basic />);
    const edit = screen.getByRole('menuitem', { name: '编辑' });
    const file = screen.getByRole('menuitem', { name: '文件' });
    fireEvent.click(edit);
    const undo = screen.getByRole('menuitem', { name: '撤销', hidden: true });
    fireEvent.keyDown(undo, { key: 'ArrowLeft' });
    expect(edit).toHaveAttribute('aria-expanded', 'false');
    expect(file).toHaveAttribute('aria-expanded', 'true');
  });

  it('禁用项渲染 disabled 且不触发选中', () => {
    render(<Basic />);
    fireEvent.click(screen.getByRole('menuitem', { name: '编辑' }));
    const redo = screen.getByRole('menuitem', { name: '重做', hidden: true });
    expect(redo).toBeDisabled();
  });

  it('checkbox 项渲染 menuitemcheckbox + aria-checked,选中后保持打开', () => {
    const items: MenubarItem[] = [
      { label: '显示网格', checked: true, selectionRole: 'checkbox', onSelect: vi.fn() },
    ];
    render(
      <Menubar>
        <Menubar.Menu value="view" label="视图" items={items} />
      </Menubar>,
    );
    const trigger = screen.getByRole('menuitem', { name: '视图' });
    fireEvent.click(trigger);
    const item = screen.getByRole('menuitemcheckbox', { name: '显示网格', hidden: true });
    expect(item).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(item);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('checked 但缺 selectionRole 的项:仍渲染 menuitemcheckbox 且选中后保持打开', () => {
    const onSelect = vi.fn();
    const items: MenubarItem[] = [{ label: '显示网格', checked: false, onSelect }];
    render(
      <Menubar>
        <Menubar.Menu value="view" label="视图" items={items} />
      </Menubar>,
    );
    const trigger = screen.getByRole('menuitem', { name: '视图' });
    fireEvent.click(trigger);
    const item = screen.getByRole('menuitemcheckbox', { name: '显示网格', hidden: true });
    fireEvent.click(item);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('一层 submenu:→ 展开二级菜单,点击子项触发其 onSelect;子菜单展开时 ← 收起', () => {
    const subSelect = vi.fn();
    const items: MenubarItem[] = [
      { label: '更多', submenu: [{ label: '导出', onSelect: subSelect }] },
    ];
    render(
      <Menubar>
        <Menubar.Menu value="file" label="文件" items={items} />
      </Menubar>,
    );
    fireEvent.click(screen.getByRole('menuitem', { name: '文件' }));
    const parent = screen.getByRole('menuitem', { name: /更多/, hidden: true });
    expect(parent).toHaveAttribute('aria-haspopup', 'menu');
    expect(parent).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(parent, { key: 'ArrowRight' });
    expect(parent).toHaveAttribute('aria-expanded', 'true');
    const sub = screen.getByRole('menuitem', { name: '导出', hidden: true });
    fireEvent.click(sub);
    expect(subSelect).toHaveBeenCalledTimes(1);
  });

  it('菜单内 Tab:阻止默认、关闭并把焦点交还触发器(不抢焦)', () => {
    render(<Basic />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    fireEvent.click(file);
    const first = screen.getByRole('menuitem', { name: /新建/, hidden: true });
    const ev = fireEvent.keyDown(first, { key: 'Tab' });
    expect(ev).toBe(false); // preventDefault 生效
    expect(file).toHaveAttribute('aria-expanded', 'false');
    expect(file).toHaveFocus();
  });

  it('受控 value:外部状态驱动,内部交互走 onValueChange', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Menubar value={null} onValueChange={onValueChange}>
        <Menubar.Menu value="file" label="文件" items={fileItems} />
        <Menubar.Menu value="edit" label="编辑" items={editItems} />
      </Menubar>,
    );
    const file = screen.getByRole('menuitem', { name: '文件' });
    expect(file).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(file);
    expect(onValueChange).toHaveBeenCalledWith('file');
    // 受控:未被父级 rerender 前不自行打开
    expect(file).toHaveAttribute('aria-expanded', 'false');
    rerender(
      <Menubar value="file" onValueChange={onValueChange}>
        <Menubar.Menu value="file" label="文件" items={fileItems} />
        <Menubar.Menu value="edit" label="编辑" items={editItems} />
      </Menubar>,
    );
    expect(file).toHaveAttribute('aria-expanded', 'true');
  });

  it('整库 disabled:触发器标 aria-disabled,点击不展开', () => {
    render(<Basic disabled />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    expect(file).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(file);
    expect(file).toHaveAttribute('aria-expanded', 'false');
  });

  it('hover:已有菜单打开时,指针移到别的触发器即切换', () => {
    render(<Basic />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    const edit = screen.getByRole('menuitem', { name: '编辑' });
    fireEvent.click(file);
    fireEvent.pointerEnter(edit);
    expect(file).toHaveAttribute('aria-expanded', 'false');
    expect(edit).toHaveAttribute('aria-expanded', 'true');
  });

  it('hover:无菜单打开时,指针进触发器不会展开(需点击 / 键盘)', () => {
    render(<Basic />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    fireEvent.pointerEnter(file);
    expect(file).toHaveAttribute('aria-expanded', 'false');
  });

  it('children 复合用法:不传 items 时原样渲染自定义菜单内容', () => {
    render(
      <Menubar value="m">
        <Menubar.Menu value="m" label="菜单">
          <button type="button" role="menuitem">
            自定义项
          </button>
        </Menubar.Menu>
      </Menubar>,
    );
    expect(screen.getByRole('menu', { hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '自定义项', hidden: true })).toBeInTheDocument();
  });

  it('空 items 渲染空态文案', () => {
    render(
      <Menubar value="m">
        <Menubar.Menu value="m" label="菜单" items={[]} />
      </Menubar>,
    );
    expect(screen.getByText('无匹配项')).toBeInTheDocument();
  });

  it('合并触发器自带 onClick(compose,不丢用户处理器)', () => {
    const userClick = vi.fn();
    render(
      <Menubar>
        <Menubar.Menu value="m" label="菜单" items={fileItems} onClick={userClick} />
      </Menubar>,
    );
    fireEvent.click(screen.getByRole('menuitem', { name: '菜单' }));
    expect(userClick).toHaveBeenCalledTimes(1);
  });

  it('classNames 槽位:自定义 root / trigger / item 类名生效', () => {
    render(
      <Menubar className="my-bar" classNames={{ root: 'root-slot', trigger: 'trig', item: 'it' }}>
        <Menubar.Menu value="m" label="菜单" items={[{ label: '动作' }]} />
      </Menubar>,
    );
    const bar = screen.getByRole('menubar');
    expect(bar).toHaveClass('my-bar', 'root-slot');
    const trigger = screen.getByRole('menuitem', { name: '菜单' });
    expect(trigger).toHaveClass('trig');
    fireEvent.click(trigger);
    expect(screen.getByRole('menuitem', { name: '动作', hidden: true })).toHaveClass('it');
  });

  it('顶层 roving tabIndex:无打开时首个触发器 tabIndex=0,其余 -1', () => {
    render(<Basic />);
    const file = screen.getByRole('menuitem', { name: '文件' });
    const edit = screen.getByRole('menuitem', { name: '编辑' });
    expect(file).toHaveAttribute('tabindex', '0');
    expect(edit).toHaveAttribute('tabindex', '-1');
    // 打开 edit 后,活动触发器变为 edit
    fireEvent.click(edit);
    expect(edit).toHaveAttribute('tabindex', '0');
    expect(file).toHaveAttribute('tabindex', '-1');
  });

  // —— #1:开菜单落焦只在 open false→true 时落一次,父级重渲染不抢已移动的焦点 ——
  describe('#1 打开期间父级重渲染不抢焦', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('↑ 打开落焦末项后,父级用内联 classNames/items 重渲染不把焦点拉回首项', () => {
      // 父级持有一个无关 state;每次 bump 都给 Menubar 传新引用的内联 classNames + items,
      // 复现「内联 props 让 ctx/focusable 每次换引用」的场景。
      let bump: () => void = () => {};
      function Harness() {
        const [, setN] = useState(0);
        bump = () => setN((n) => n + 1);
        return (
          <Menubar classNames={{ root: 'r' }}>
            <Menubar.Menu
              value="file"
              label="文件"
              items={[
                { label: '新建', onSelect: vi.fn() },
                { label: '打开', onSelect: vi.fn() },
                { label: '退出', onSelect: vi.fn() },
              ]}
            />
          </Menubar>
        );
      }
      render(<Harness />);
      const file = screen.getByRole('menuitem', { name: '文件' });
      file.focus();
      // ↑ 打开并意图落焦末项。
      act(() => {
        fireEvent.keyDown(file, { key: 'ArrowUp' });
        vi.runAllTimers(); // flush rAF（fake timer 下 jsdom 的 rAF 走 timer）
      });
      const last = screen.getByRole('menuitem', { name: '退出', hidden: true });
      expect(last).toHaveFocus();
      // 用户再用 ↑ 把焦点移到中间项「打开」。
      const middle = screen.getByRole('menuitem', { name: '打开', hidden: true });
      act(() => {
        fireEvent.keyDown(last, { key: 'ArrowUp' });
      });
      expect(middle).toHaveFocus();
      // 父级无关重渲染（内联 classNames/items 换引用）——焦点必须保持在「打开」,不被拉回首项。
      act(() => {
        bump();
        vi.runAllTimers();
      });
      expect(middle).toHaveFocus();
    });
  });

  // —— #2 / #3:disabled 顶级菜单上的 roving / 相邻切换 ——
  describe('#2/#3 禁用顶级菜单的键盘跳过', () => {
    function WithDisabledMiddle(props?: Partial<Parameters<typeof Menubar>[0]>) {
      return (
        <Menubar {...props}>
          <Menubar.Menu value="file" label="文件" items={fileItems} />
          <Menubar.Menu value="edit" label="编辑" items={editItems} disabled />
          <Menubar.Menu value="view" label="视图" items={[{ label: '放大' }]} />
        </Menubar>
      );
    }

    it('#2:→ 在触发器上跨过中间 disabled 菜单,roving 不撞墙', () => {
      render(<WithDisabledMiddle />);
      const file = screen.getByRole('menuitem', { name: '文件' });
      const view = screen.getByRole('menuitem', { name: '视图' });
      file.focus();
      fireEvent.keyDown(file, { key: 'ArrowRight' });
      // 跳过禁用的「编辑」直接落到「视图」。
      expect(view).toHaveFocus();
    });

    it('#2:End 落到末个可用触发器(若末项禁用则前移)', () => {
      render(
        <Menubar>
          <Menubar.Menu value="file" label="文件" items={fileItems} />
          <Menubar.Menu value="edit" label="编辑" items={editItems} />
          <Menubar.Menu value="view" label="视图" items={[{ label: '放大' }]} disabled />
        </Menubar>,
      );
      const file = screen.getByRole('menuitem', { name: '文件' });
      const edit = screen.getByRole('menuitem', { name: '编辑' });
      file.focus();
      fireEvent.keyDown(file, { key: 'End' });
      // 末项「视图」禁用 → End 落到「编辑」。
      expect(edit).toHaveFocus();
    });

    it('#3:菜单内 → 切到相邻顶级菜单时跳过 disabled 的相邻项', () => {
      render(<WithDisabledMiddle />);
      const file = screen.getByRole('menuitem', { name: '文件' });
      const view = screen.getByRole('menuitem', { name: '视图' });
      fireEvent.click(file);
      const first = screen.getByRole('menuitem', { name: /新建/, hidden: true });
      fireEvent.keyDown(first, { key: 'ArrowRight' });
      // 跳过禁用的「编辑」→ 打开「视图」。
      expect(file).toHaveAttribute('aria-expanded', 'false');
      expect(view).toHaveAttribute('aria-expanded', 'true');
    });

    it('#3:相邻全为 disabled 时,菜单内 ←→ 保持当前菜单不动(不陷入无菜单无焦点死态)', () => {
      render(
        <Menubar>
          <Menubar.Menu value="file" label="文件" items={fileItems} />
          <Menubar.Menu value="edit" label="编辑" items={editItems} disabled />
        </Menubar>,
      );
      const file = screen.getByRole('menuitem', { name: '文件' });
      fireEvent.click(file);
      const first = screen.getByRole('menuitem', { name: /新建/, hidden: true });
      // 唯一相邻项「编辑」禁用 → → 应保持「文件」打开,不关、不丢焦。
      fireEvent.keyDown(first, { key: 'ArrowRight' });
      expect(file).toHaveAttribute('aria-expanded', 'true');
    });
  });

  // —— #4:子菜单键盘穿梭(→ 进首项 / ↑↓ roving / Enter 选 / ← 回父 / Esc 全关) ——
  describe('#4 子菜单键盘可达', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    function WithSubmenu(onSub = vi.fn()) {
      const items: MenubarItem[] = [
        { label: '普通项', onSelect: vi.fn() },
        {
          label: '更多',
          submenu: [
            { label: '导出 PNG', onSelect: onSub },
            { label: '导出 SVG', onSelect: vi.fn() },
          ],
        },
      ];
      return (
        <Menubar>
          <Menubar.Menu value="file" label="文件" items={items} />
        </Menubar>
      );
    }

    it('→ 展开子菜单并把焦点落到子菜单首项', () => {
      render(WithSubmenu());
      fireEvent.click(screen.getByRole('menuitem', { name: '文件' }));
      const parent = screen.getByRole('menuitem', { name: /更多/, hidden: true });
      act(() => {
        fireEvent.keyDown(parent, { key: 'ArrowRight' });
        vi.runAllTimers();
      });
      const sub1 = screen.getByRole('menuitem', { name: '导出 PNG', hidden: true });
      expect(sub1).toHaveFocus();
    });

    it('子菜单内 ↓ roving、Enter 选中触发 onSelect', () => {
      const onSub = vi.fn();
      render(WithSubmenu(onSub));
      fireEvent.click(screen.getByRole('menuitem', { name: '文件' }));
      const parent = screen.getByRole('menuitem', { name: /更多/, hidden: true });
      act(() => {
        fireEvent.keyDown(parent, { key: 'ArrowRight' });
        vi.runAllTimers();
      });
      const sub1 = screen.getByRole('menuitem', { name: '导出 PNG', hidden: true });
      const sub2 = screen.getByRole('menuitem', { name: '导出 SVG', hidden: true });
      fireEvent.keyDown(sub1, { key: 'ArrowDown' });
      expect(sub2).toHaveFocus();
      // ↓ 回绕回首项。
      fireEvent.keyDown(sub2, { key: 'ArrowDown' });
      expect(sub1).toHaveFocus();
      fireEvent.keyDown(sub1, { key: 'Enter' });
      expect(onSub).toHaveBeenCalledTimes(1);
    });

    it('子菜单内 ← 收起并回焦父项', () => {
      render(WithSubmenu());
      fireEvent.click(screen.getByRole('menuitem', { name: '文件' }));
      const parent = screen.getByRole('menuitem', { name: /更多/, hidden: true });
      act(() => {
        fireEvent.keyDown(parent, { key: 'ArrowRight' });
        vi.runAllTimers();
      });
      const sub1 = screen.getByRole('menuitem', { name: '导出 PNG', hidden: true });
      fireEvent.keyDown(sub1, { key: 'ArrowLeft' });
      // 子菜单收起,焦点回到父项「更多」。
      const parentAfter = screen.getByRole('menuitem', { name: /更多/, hidden: true });
      expect(parentAfter).toHaveAttribute('aria-expanded', 'false');
      expect(parentAfter).toHaveFocus();
    });

    it('子菜单内 Esc 整菜单关闭并回焦顶层触发器', () => {
      render(WithSubmenu());
      const file = screen.getByRole('menuitem', { name: '文件' });
      fireEvent.click(file);
      const parent = screen.getByRole('menuitem', { name: /更多/, hidden: true });
      act(() => {
        fireEvent.keyDown(parent, { key: 'ArrowRight' });
        vi.runAllTimers();
      });
      const sub1 = screen.getByRole('menuitem', { name: '导出 PNG', hidden: true });
      fireEvent.keyDown(sub1, { key: 'Escape' });
      expect(file).toHaveAttribute('aria-expanded', 'false');
      expect(file).toHaveFocus();
    });
  });

  // —— #5:typeahead 计时器在卸载时被清理,不泄漏 ——
  it('#5:卸载时清理 typeahead 计时器(无悬挂 timer 回调)', () => {
    vi.useFakeTimers();
    try {
      const clearSpy = vi.spyOn(window, 'clearTimeout');
      const { unmount } = render(
        <Menubar value="file">
          <Menubar.Menu value="file" label="文件" items={fileItems} />
        </Menubar>,
      );
      const first = screen.getByRole('menuitem', { name: /新建/, hidden: true });
      // 敲字符创建一个 500ms typeahead 计时器。
      fireEvent.keyDown(first, { key: 'd' });
      const callsBefore = clearSpy.mock.calls.length;
      // 计时器到期前卸载:卸载 cleanup 必须 clearTimeout。
      unmount();
      expect(clearSpy.mock.calls.length).toBeGreaterThan(callsBefore);
    } finally {
      vi.useRealTimers();
    }
  });

  // —— CSS Anchor Positioning 回归:用户传 style 不得覆盖 anchor-name / position-anchor ——
  // 触发器经 style={{ ...style, anchorName }} 合并、且 style 已从 props 解构出不进 {...rest},
  // 故用户 style 与 anchor-name 同时生效;否则锚点丢失,菜单浮层会掉到 top-layer 左上角。
  describe('CSS Anchor Positioning:用户 style 不覆盖锚点', () => {
    it('触发器 inline style 同时含用户样式与 anchor-name(style 经 Menubar.Menu 透传)', () => {
      render(
        <Menubar>
          <Menubar.Menu
            value="file"
            label="文件"
            items={fileItems}
            style={{ maxInlineSize: '16rem' }}
          />
        </Menubar>,
      );
      const file = screen.getByRole('menuitem', { name: '文件' });
      // 用户样式生效。
      expect(file.style.getPropertyValue('max-inline-size')).toBe('16rem');
      // 关键断言:anchor-name 没被用户 style / {...rest} 覆盖,仍以 -- 开头。
      const anchorName = file.style.getPropertyValue('anchor-name');
      expect(anchorName).not.toBe('');
      expect(anchorName.startsWith('--')).toBe(true);
      // inline style 串里两者并存。
      const inline = file.getAttribute('style') ?? '';
      expect(inline).toContain('max-inline-size');
      expect(inline).toContain('anchor-name');
    });

    it('面板 position-anchor 指向触发器 anchor-name,且不被用户 style 干扰', () => {
      render(
        <Menubar value="file">
          <Menubar.Menu
            value="file"
            label="文件"
            items={fileItems}
            style={{ maxInlineSize: '16rem' }}
          />
        </Menubar>,
      );
      const file = screen.getByRole('menuitem', { name: '文件' });
      const anchorName = file.style.getPropertyValue('anchor-name');
      // 面板浮层(role=menu 的容器 .ms-menubar__menu,popover top-layer)。
      const menu = screen.getByRole('menu', { hidden: true });
      const popover = menu.closest('.ms-menubar__menu') as HTMLElement;
      const positionAnchor = popover.style.getPropertyValue('position-anchor');
      // position-anchor 未丢失,且与触发器的 anchor-name 一致(锚定成立)。
      expect(positionAnchor).not.toBe('');
      expect(positionAnchor).toBe(anchorName);
    });
  });
});

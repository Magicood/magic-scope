// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Command } from './Command';

/** 一个完整的命令面板基本盘,供多个用例复用。 */
function Basic(props: {
  onSelect?: (v: string) => void;
  onValueChange?: (v: string) => void;
  value?: string;
  fuzzy?: boolean;
}) {
  // 条件 spread 避免把 undefined 透给 exactOptionalPropertyTypes 下的非 undefined prop(TS2375)。
  return (
    <Command
      {...(props.onSelect ? { onSelect: props.onSelect } : {})}
      {...(props.onValueChange ? { onValueChange: props.onValueChange } : {})}
      {...(props.value !== undefined ? { value: props.value } : {})}
      filterMode={props.fuzzy ? 'fuzzy' : 'substring'}
    >
      <Command.Input />
      <Command.List label="命令">
        <Command.Group heading="文件">
          <Command.Item value="new" keywords={['create', 'add']}>
            New File
          </Command.Item>
          <Command.Item value="open">Open Folder</Command.Item>
        </Command.Group>
        <Command.Group heading="编辑">
          <Command.Item value="copy">Copy</Command.Item>
          <Command.Item value="paste" disabled>
            Paste
          </Command.Item>
        </Command.Group>
        <Command.Empty>无匹配项</Command.Empty>
      </Command.List>
    </Command>
  );
}

describe('Command', () => {
  it('渲染 combobox 输入框、listbox 与所有 option,带基础类名', () => {
    render(<Basic />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveClass('ms-command__input');
    expect(screen.getByRole('listbox', { name: '命令' })).toBeInTheDocument();
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4);
  });

  it('搜索框占位文案来自 i18n select.search', () => {
    render(<Basic />);
    expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', '搜索…');
  });

  it('输入即过滤:只保留命中项', () => {
    render(<Basic />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'open' } });
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Open Folder');
  });

  it('命中片段用 <mark> 高亮', () => {
    render(<Basic />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'folder' } });
    const option = screen.getByRole('option');
    const mark = option.querySelector('mark.ms-command__highlight');
    expect(mark).toHaveTextContent('Folder');
  });

  it('keywords 命中:label 不含但别名命中也保留', () => {
    render(<Basic />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'create' } });
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('New File');
  });

  it('fuzzy 模式允许跳字符匹配', () => {
    render(<Basic fuzzy />);
    // 'nw' 只在 "New File"(n…w)模糊命中,"Open Folder" 无 'w'
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'nw' } });
    expect(screen.getByRole('option')).toHaveTextContent('New File');
  });

  it('无结果时渲染 Empty,可选项存在时不渲染', () => {
    render(<Basic />);
    // 初始有结果 → 无空态
    expect(screen.queryByText('无匹配项')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zzz' } });
    expect(screen.getByText('无匹配项')).toBeInTheDocument();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('默认高亮第一个可选项(aria-selected)', () => {
    render(<Basic />);
    const first = screen.getByRole('option', { name: 'New File' });
    expect(first).toHaveAttribute('aria-selected', 'true');
  });

  it('↓ 移动高亮到下一项,Enter 选中', () => {
    const onSelect = vi.fn();
    render(<Basic onSelect={onSelect} />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: 'Open Folder' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('open');
  });

  it('键盘导航跳过禁用项', () => {
    render(<Basic />);
    const input = screen.getByRole('combobox');
    // 顺序可选:new → open → copy(paste 禁用被跳过)
    fireEvent.keyDown(input, { key: 'End' });
    expect(screen.getByRole('option', { name: 'Copy' })).toHaveAttribute('aria-selected', 'true');
    // 再 ↓ 回绕到首项
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: 'New File' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('禁用项带 aria-disabled,点击不触发选中', () => {
    const onSelect = vi.fn();
    render(<Basic onSelect={onSelect} />);
    const paste = screen.getByRole('option', { name: 'Paste' });
    expect(paste).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(paste);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('点击项触发项级 onSelect 与根 onSelect', () => {
    const rootSelect = vi.fn();
    const itemSelect = vi.fn();
    render(
      <Command onSelect={rootSelect}>
        <Command.Input />
        <Command.List>
          <Command.Item value="x" onSelect={itemSelect}>
            X
          </Command.Item>
        </Command.List>
      </Command>,
    );
    fireEvent.click(screen.getByRole('option', { name: 'X' }));
    expect(itemSelect).toHaveBeenCalledWith('x');
    expect(rootSelect).toHaveBeenCalledWith('x');
  });

  it('input aria-activedescendant 指向当前高亮项', () => {
    render(<Basic />);
    const input = screen.getByRole('combobox');
    const first = screen.getByRole('option', { name: 'New File' });
    expect(input.getAttribute('aria-activedescendant')).toBe(first.id);
  });

  it('受控 value + onValueChange:输入回调拿到新值', () => {
    const onValueChange = vi.fn();
    render(<Basic value="" onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'co' } });
    expect(onValueChange).toHaveBeenCalledWith('co');
  });

  it('整组项都被过滤时隐藏分组(含组头)', () => {
    render(<Basic />);
    // 仅匹配「文件」组的项
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'folder' } });
    expect(screen.queryByText('编辑')).not.toBeInTheDocument();
    expect(screen.getByText('文件')).toBeInTheDocument();
  });

  it('Command.Dialog 打开时渲染面板内的命令面板', () => {
    render(
      <Command.Dialog open onOpenChange={() => {}}>
        <Command.Input />
        <Command.List>
          <Command.Item value="a">Alpha</Command.Item>
        </Command.List>
      </Command.Dialog>,
    );
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(within(dialog).getByRole('combobox')).toBeInTheDocument();
    expect(within(dialog).getByRole('option', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('Command.Dialog hotkey:mod+k 切换开合', () => {
    const onOpenChange = vi.fn();
    render(
      <Command.Dialog open={false} onOpenChange={onOpenChange} hotkey>
        <Command.Input />
        <Command.List />
      </Command.Dialog>,
    );
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('子部件脱离 Command 根使用时抛错', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Command.Input />)).toThrow(/必须用在 <Command> 内部/);
    spy.mockRestore();
  });

  it('仅特殊字符不同的两个 value 不撞同一个 option id', () => {
    render(
      <Command>
        <Command.Input />
        <Command.List label="命令">
          <Command.Item value="a/b">Slash</Command.Item>
          <Command.Item value="a.b">Dot</Command.Item>
        </Command.List>
      </Command>,
    );
    const slash = screen.getByRole('option', { name: 'Slash' });
    const dot = screen.getByRole('option', { name: 'Dot' });
    expect(slash.id).toBeTruthy();
    expect(dot.id).toBeTruthy();
    expect(slash.id).not.toBe(dot.id);
  });
});

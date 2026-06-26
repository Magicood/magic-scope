// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './Select';

const options = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'cherry', label: '樱桃', disabled: true },
];

describe('Select', () => {
  it('渲染 combobox trigger,占位文本与变体类名/状态属性正确', () => {
    render(<Select options={options} placeholder="选择水果" size="lg" aria-label="水果" />);

    const trigger = screen.getByRole('combobox', { name: '水果' });
    expect(trigger).toBeInTheDocument();
    // 尺寸变体类名 + 基础类名
    expect(trigger).toHaveClass('ms-select', 'ms-select--lg');
    // 未选中:展示占位文本并带 data-placeholder
    expect(trigger).toHaveTextContent('选择水果');
    expect(trigger).toHaveAttribute('data-placeholder', '');
    // 无障碍关系属性
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls');
  });

  it('受控 value 展示选中项 label,且对应 option aria-selected=true', () => {
    render(<Select options={options} value="banana" aria-label="水果" />);

    const trigger = screen.getByRole('combobox', { name: '水果' });
    // 受控值展示对应 label,而非占位符;选中态无 data-placeholder
    expect(trigger).toHaveTextContent('香蕉');
    expect(trigger).not.toHaveAttribute('data-placeholder');

    const selected = screen.getByRole('option', { name: '香蕉', hidden: true });
    expect(selected).toHaveAttribute('aria-selected', 'true');
    expect(selected).toHaveClass('ms-select__option--selected');

    // 禁用项标记 aria-disabled 与禁用类名
    const disabledOpt = screen.getByRole('option', { name: '樱桃', hidden: true });
    expect(disabledOpt).toHaveAttribute('aria-disabled', 'true');
    expect(disabledOpt).toHaveClass('ms-select__option--disabled');
  });

  it('点击 trigger 展开后 aria-expanded=true,点选可用项触发 onChange 并关闭', () => {
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} aria-label="水果" />);

    const trigger = screen.getByRole('combobox', { name: '水果' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveClass('ms-select--open');

    // 点选第二个可用项,回调收到 value + 完整 option(双参);之后浮层收起
    fireEvent.click(screen.getByRole('option', { name: '苹果', hidden: true }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('apple', expect.objectContaining({ value: 'apple' }));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('点击禁用项不触发 onChange,且仍保持展开', () => {
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} aria-label="水果" />);

    const trigger = screen.getByRole('combobox', { name: '水果' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('option', { name: '樱桃', hidden: true }));
    expect(onChange).not.toHaveBeenCalled();
    // 禁用项不可提交,故不会关闭
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('disabled 时 trigger 被禁用且点击不展开', () => {
    render(<Select options={options} disabled aria-label="水果" />);

    const trigger = screen.getByRole('combobox', { name: '水果' });
    expect(trigger).toBeDisabled();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('接 tone 槽位:根 trigger 挂对应 ms-tone- 类;默认 primary', () => {
    const { rerender } = render(<Select options={options} aria-label="水果" />);
    expect(screen.getByRole('combobox', { name: '水果' })).toHaveClass('ms-tone-primary');

    rerender(<Select options={options} tone="success" aria-label="水果" />);
    expect(screen.getByRole('combobox', { name: '水果' })).toHaveClass('ms-tone-success');
  });

  it('placeholder 走 i18n 默认文案;未传时显示「请选择…」', () => {
    render(<Select options={options} aria-label="水果" />);
    expect(screen.getByRole('combobox', { name: '水果' })).toHaveTextContent('请选择…');
  });

  it('onOpenChange 受控双通道:开合都回调,且选中后回调 false', () => {
    const onOpenChange = vi.fn();
    render(<Select options={options} onOpenChange={onOpenChange} aria-label="水果" />);

    const trigger = screen.getByRole('combobox', { name: '水果' });
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByRole('option', { name: '苹果', hidden: true }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('onClose 区分 reason:点选关闭为 select,Esc 关闭为 escape', () => {
    const onClose = vi.fn();
    render(<Select options={options} onClose={onClose} aria-label="水果" />);

    const trigger = screen.getByRole('combobox', { name: '水果' });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: '苹果', hidden: true }));
    expect(onClose).toHaveBeenLastCalledWith('select');

    fireEvent.click(trigger);
    const listbox = screen.getByRole('listbox', { hidden: true });
    fireEvent.keyDown(listbox, { key: 'Escape' });
    expect(onClose).toHaveBeenLastCalledWith('escape');
  });

  it('onEscapeKeyDown 可 preventDefault 拦截关闭', () => {
    const onClose = vi.fn();
    render(
      <Select
        options={options}
        onClose={onClose}
        onEscapeKeyDown={(e) => e.preventDefault()}
        aria-label="水果"
      />,
    );

    const trigger = screen.getByRole('combobox', { name: '水果' });
    fireEvent.click(trigger);
    const listbox = screen.getByRole('listbox', { hidden: true });
    fireEvent.keyDown(listbox, { key: 'Escape' });
    // 被拦截:不触发 onClose,保持展开
    expect(onClose).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('clearable:有值显清除,点击触发 onClear 并清空(非受控)', () => {
    const onClear = vi.fn();
    const onChange = vi.fn();
    render(
      <Select
        options={options}
        defaultValue="banana"
        clearable
        onClear={onClear}
        onChange={onChange}
        aria-label="水果"
      />,
    );

    const trigger = screen.getByRole('combobox', { name: '水果' });
    expect(trigger).toHaveTextContent('香蕉');
    const clear = screen.getByRole('button', { name: '清除' });
    fireEvent.click(clear);
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('', undefined);
    // 清空后回占位
    expect(trigger).toHaveTextContent('请选择…');
  });

  it('空 options 显示空态文案', () => {
    render(<Select options={[]} aria-label="水果" />);
    const trigger = screen.getByRole('combobox', { name: '水果' });
    fireEvent.click(trigger);
    expect(screen.getByText('无匹配项')).toBeInTheDocument();
  });

  it('loading 显示加载文案且 aria-busy', () => {
    render(<Select options={options} loading aria-label="水果" />);
    const trigger = screen.getByRole('combobox', { name: '水果' });
    expect(trigger).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(trigger);
    expect(screen.getByText('加载中…')).toBeInTheDocument();
  });

  it('searchable:输入过滤选项并触发 onSearch', () => {
    const onSearch = vi.fn();
    render(<Select options={options} searchable onSearch={onSearch} aria-label="水果" />);

    fireEvent.click(screen.getByRole('combobox', { name: '水果' }));
    const search = screen.getByPlaceholderText('搜索…');
    fireEvent.change(search, { target: { value: '香' } });
    expect(onSearch).toHaveBeenLastCalledWith('香');
    // 仅匹配「香蕉」
    expect(screen.getByRole('option', { name: '香蕉', hidden: true })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '苹果', hidden: true })).not.toBeInTheDocument();
  });

  it('multiple:点选多个不关闭,onChange 收数组,可移除 tag', () => {
    const onChange = vi.fn();
    render(<Select options={options} multiple onChange={onChange} aria-label="水果" />);

    const trigger = screen.getByRole('combobox', { name: '水果' });
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox', { hidden: true })).toHaveAttribute(
      'aria-multiselectable',
      'true',
    );
    fireEvent.click(screen.getByRole('option', { name: '苹果', hidden: true }));
    expect(onChange).toHaveBeenLastCalledWith(
      ['apple'],
      expect.objectContaining({ value: 'apple' }),
    );
    // 多选不关闭
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('option', { name: '香蕉', hidden: true }));
    expect(onChange).toHaveBeenLastCalledWith(
      ['apple', 'banana'],
      expect.objectContaining({ value: 'banana' }),
    );

    // 移除一个 tag
    const removeApple = screen.getByRole('button', { name: '移除 苹果' });
    fireEvent.click(removeApple);
    expect(onChange).toHaveBeenLastCalledWith(['banana'], undefined);
  });

  it('原生属性透传 + 用户 onClick 与内部开合都触发(composeEventHandlers)', () => {
    const userClick = vi.fn();
    render(<Select options={options} onClick={userClick} data-testid="ms-sel" aria-label="水果" />);

    const trigger = screen.getByRole('combobox', { name: '水果' });
    // 原生 data-* 透传到根
    expect(trigger).toHaveAttribute('data-testid', 'ms-sel');
    fireEvent.click(trigger);
    // 用户处理器触发
    expect(userClick).toHaveBeenCalledTimes(1);
    // 内部开合也生效
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('onHighlightChange:键盘导航时回调高亮项', () => {
    const onHighlightChange = vi.fn();
    render(<Select options={options} onHighlightChange={onHighlightChange} aria-label="水果" />);

    fireEvent.click(screen.getByRole('combobox', { name: '水果' }));
    const listbox = screen.getByRole('listbox', { hidden: true });
    onHighlightChange.mockClear();
    fireEvent.keyDown(listbox, { key: 'ArrowDown' });
    expect(onHighlightChange).toHaveBeenCalled();
    const lastCall = onHighlightChange.mock.lastCall;
    expect(lastCall?.[1]).toMatchObject({ value: expect.any(String) });
  });
});

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

    // 点选第二个可用项,回调收到其 value;之后浮层收起
    fireEvent.click(screen.getByRole('option', { name: '苹果', hidden: true }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('apple');
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
});

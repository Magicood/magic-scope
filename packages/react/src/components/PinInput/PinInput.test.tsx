// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PinInput } from './PinInput';

describe('PinInput', () => {
  it('渲染 length 个格子,外层 role=group 带默认 i18n aria-label,每格有「第 N 位」标签', () => {
    render(<PinInput length={4} />);

    const group = screen.getByRole('group', { name: '验证码输入' });
    expect(group).toBeInTheDocument();
    expect(group).toHaveClass('ms-pin-input');

    const cells = screen.getAllByRole('textbox');
    expect(cells).toHaveLength(4);
    expect(cells[0]).toHaveAttribute('aria-label', '验证码输入 第 1 位');
    expect(cells[3]).toHaveAttribute('aria-label', '验证码输入 第 4 位');
  });

  it('numeric 下输入合法数字写入本格并自动聚焦下一格;非法字母被拒', () => {
    render(<PinInput length={4} />);
    const cells = screen.getAllByRole('textbox') as HTMLInputElement[];

    fireEvent.change(cells[0] as HTMLInputElement, { target: { value: '5' } });
    expect(cells[0]).toHaveValue('5');
    expect(cells[1]).toHaveFocus();

    // 非法字母:本格保持空
    fireEvent.change(cells[1] as HTMLInputElement, { target: { value: 'a' } });
    expect(cells[1]).toHaveValue('');
  });

  it('onChange 回传当前整串,填满末格触发 onComplete', () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    render(<PinInput length={3} onChange={onChange} onComplete={onComplete} />);
    const cells = screen.getAllByRole('textbox') as HTMLInputElement[];

    fireEvent.change(cells[0] as HTMLInputElement, { target: { value: '1' } });
    expect(onChange).toHaveBeenLastCalledWith('1');
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.change(cells[1] as HTMLInputElement, { target: { value: '2' } });
    fireEvent.change(cells[2] as HTMLInputElement, { target: { value: '3' } });
    expect(onChange).toHaveBeenLastCalledWith('123');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenLastCalledWith('123');
  });

  it('粘贴整串自动分填到各格(从聚焦格起),并清洗非法字符', () => {
    const onChange = vi.fn();
    render(<PinInput length={6} onChange={onChange} />);
    const cells = screen.getAllByRole('textbox') as HTMLInputElement[];

    fireEvent.paste(cells[0] as HTMLInputElement, {
      clipboardData: { getData: () => '12-34ab56' },
    });
    // numeric 清洗后为 123456,截断到 6 格
    expect(onChange).toHaveBeenLastCalledWith('123456');
    expect(cells[0]).toHaveValue('1');
    expect(cells[5]).toHaveValue('6');
  });

  it('Backspace:本格有字符清本格;本格为空回退上一格并清除其字符', () => {
    const onChange = vi.fn();
    render(<PinInput length={3} defaultValue="12" onChange={onChange} />);
    const cells = screen.getAllByRole('textbox') as HTMLInputElement[];

    // 第 2 格(index 1)有字符 '2',Backspace 清本格
    fireEvent.keyDown(cells[1] as HTMLInputElement, { key: 'Backspace' });
    expect(onChange).toHaveBeenLastCalledWith('1');
    expect(cells[1]).toHaveValue('');

    // 此时 index 1 为空,再次 Backspace 回退到 index 0 并清除
    fireEvent.keyDown(cells[1] as HTMLInputElement, { key: 'Backspace' });
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(cells[0]).toHaveFocus();
  });

  it('回归:直接点非首格(末格)输入,字符留在本格不左移到首格', () => {
    const onChange = vi.fn();
    render(<PinInput length={3} onChange={onChange} />);
    const cells = screen.getAllByRole('textbox') as HTMLInputElement[];

    // 直接在第 3 格(index 2)输入,不能被 join("") 折叠到 index 0
    fireEvent.change(cells[2] as HTMLInputElement, { target: { value: '9' } });
    expect(cells[0]).toHaveValue('');
    expect(cells[1]).toHaveValue('');
    expect(cells[2]).toHaveValue('9');
    // 对外仍回紧凑串
    expect(onChange).toHaveBeenLastCalledWith('9');
  });

  it('回归:cells=123 对 index0 按 Delete,只清本格变空+23,后两格不左移', () => {
    const onChange = vi.fn();
    render(<PinInput length={3} defaultValue="123" onChange={onChange} />);
    const cells = screen.getAllByRole('textbox') as HTMLInputElement[];

    fireEvent.keyDown(cells[0] as HTMLInputElement, { key: 'Delete' });
    // index0 清空,index1/2 原位不动(不左挤成 23_)
    expect(cells[0]).toHaveValue('');
    expect(cells[1]).toHaveValue('2');
    expect(cells[2]).toHaveValue('3');
    expect(onChange).toHaveBeenLastCalledWith('23');
  });

  it('回归:onComplete 只在填满上升沿触发一次,填满后改格不再重复触发', () => {
    const onComplete = vi.fn();
    render(<PinInput length={2} onComplete={onComplete} />);
    const cells = screen.getAllByRole('textbox') as HTMLInputElement[];

    fireEvent.change(cells[0] as HTMLInputElement, { target: { value: '1' } });
    fireEvent.change(cells[1] as HTMLInputElement, { target: { value: '2' } });
    expect(onComplete).toHaveBeenCalledTimes(1);

    // 已满状态下改某格(改值仍满):不应再次触发
    fireEvent.change(cells[1] as HTMLInputElement, { target: { value: '5' } });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('方向键与 Home/End 移动焦点', () => {
    render(<PinInput length={4} />);
    const cells = screen.getAllByRole('textbox') as HTMLInputElement[];

    (cells[0] as HTMLInputElement).focus();
    fireEvent.keyDown(cells[0] as HTMLInputElement, { key: 'ArrowRight' });
    expect(cells[1]).toHaveFocus();

    fireEvent.keyDown(cells[1] as HTMLInputElement, { key: 'End' });
    expect(cells[3]).toHaveFocus();

    fireEvent.keyDown(cells[3] as HTMLInputElement, { key: 'ArrowLeft' });
    expect(cells[2]).toHaveFocus();

    fireEvent.keyDown(cells[2] as HTMLInputElement, { key: 'Home' });
    expect(cells[0]).toHaveFocus();
  });

  it('invalid 给每格设 aria-invalid 并加 danger 类', () => {
    render(<PinInput length={3} invalid />);
    expect(screen.getByRole('group')).toHaveClass('ms-pin-input--invalid');
    for (const cell of screen.getAllByRole('textbox')) {
      expect(cell).toHaveAttribute('aria-invalid', 'true');
    }
  });

  it('受控:value 决定显示,输入经 onChange 回流父级后才更新', () => {
    function Controlled() {
      const [v, setV] = useState('');
      return <PinInput length={4} value={v} onChange={setV} />;
    }
    render(<Controlled />);
    const cells = screen.getAllByRole('textbox') as HTMLInputElement[];

    fireEvent.change(cells[0] as HTMLInputElement, { target: { value: '7' } });
    expect(cells[0]).toHaveValue('7');
    fireEvent.change(cells[1] as HTMLInputElement, { target: { value: '8' } });
    expect(cells[1]).toHaveValue('8');
  });

  it('mask 时格子渲染为 password 类型,disabled 时全部禁用', () => {
    const { rerender } = render(<PinInput length={2} mask />);
    // password 输入不暴露 textbox role,用 querySelectorAll 取
    const group = screen.getByRole('group');
    const masked = group.querySelectorAll('input');
    expect(masked).toHaveLength(2);
    expect(masked[0]).toHaveAttribute('type', 'password');

    rerender(<PinInput length={2} disabled />);
    for (const cell of screen.getAllByRole('textbox')) {
      expect(cell).toBeDisabled();
    }
    expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true');
  });

  it('自定义 aria-label 覆盖默认,并贯穿到每格标签', () => {
    render(<PinInput length={2} aria-label="短信验证码" />);
    expect(screen.getByRole('group', { name: '短信验证码' })).toBeInTheDocument();
    const cells = screen.getAllByRole('textbox');
    expect(cells[0]).toHaveAttribute('aria-label', '短信验证码 第 1 位');
  });

  it('classNames 留口落到 root 与 cell;...rest 透传根容器属性', () => {
    render(
      <PinInput length={2} data-testid="pin" classNames={{ root: 'my-root', cell: 'my-cell' }} />,
    );
    const group = screen.getByTestId('pin');
    expect(group).toHaveClass('ms-pin-input', 'my-root');
    expect(screen.getAllByRole('textbox')[0]).toHaveClass('ms-pin-input__cell', 'my-cell');
  });
});

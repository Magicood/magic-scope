// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('size / invalid 类落在容器,aria-invalid 在 input', () => {
    render(<Input invalid size="lg" placeholder="p" />);
    const input = screen.getByPlaceholderText('p');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const box = input.closest('.ms-input');
    expect(box).toHaveClass('ms-input--lg', 'ms-input--invalid');
    // invalid 强制 danger 色调
    expect(box).toHaveClass('ms-tone-danger');
  });

  it('tone 映射到容器 ms-tone-*(默认 primary)', () => {
    const { rerender } = render(<Input placeholder="p" />);
    expect(screen.getByPlaceholderText('p').closest('.ms-input')).toHaveClass('ms-tone-primary');
    rerender(<Input tone="success" placeholder="p" />);
    expect(screen.getByPlaceholderText('p').closest('.ms-input')).toHaveClass('ms-tone-success');
  });

  it('prefix / suffix 渲染在框内', () => {
    render(
      <Input
        prefix={<span data-testid="pf">¥</span>}
        suffix={<span data-testid="sf">.00</span>}
        placeholder="p"
      />,
    );
    expect(screen.getByTestId('pf')).toBeInTheDocument();
    expect(screen.getByTestId('sf')).toBeInTheDocument();
  });

  it('clearable:有值显示清除钮,点击清空(非受控)', () => {
    const onClear = vi.fn();
    render(<Input clearable defaultValue="hello" onClear={onClear} placeholder="p" />);
    const input = screen.getByPlaceholderText('p') as HTMLInputElement;
    expect(screen.getByRole('button', { name: '清除' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(input.value).toBe('');
    expect(onClear).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: '清除' })).toBeNull();
  });

  it('type=password:切换明文(password ↔ text)', () => {
    render(<Input type="password" defaultValue="secret" placeholder="p" />);
    const input = screen.getByPlaceholderText('p');
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: '显示密码' }));
    expect(input).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: '隐藏密码' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('showCount + maxLength:显示 当前/上限,随输入更新', () => {
    render(<Input showCount maxLength={10} defaultValue="abc" placeholder="p" />);
    expect(screen.getByText('3/10')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('p'), { target: { value: 'abcde' } });
    expect(screen.getByText('5/10')).toBeInTheDocument();
  });

  it('addonBefore / addonAfter:包成拼接 group', () => {
    render(<Input addonBefore="https://" addonAfter=".com" placeholder="p" />);
    const group = screen.getByPlaceholderText('p').closest('.ms-input-group');
    expect(group).toBeInTheDocument();
    expect(within(group as HTMLElement).getByText('https://')).toBeInTheDocument();
    expect(within(group as HTMLElement).getByText('.com')).toBeInTheDocument();
  });

  it('受控:onChange 透传,value 由父级控制', () => {
    const onChange = vi.fn();
    render(<Input value="x" onChange={onChange} placeholder="p" />);
    fireEvent.change(screen.getByPlaceholderText('p'), { target: { value: 'xy' } });
    expect(onChange).toHaveBeenCalledOnce();
    expect((screen.getByPlaceholderText('p') as HTMLInputElement).value).toBe('x');
  });

  it('disabled:容器加禁用类,input 禁用', () => {
    render(<Input disabled placeholder="p" />);
    const input = screen.getByPlaceholderText('p');
    expect(input).toBeDisabled();
    expect(input.closest('.ms-input')).toHaveClass('ms-input--disabled');
  });
});

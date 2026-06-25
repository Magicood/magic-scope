// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

describe('Switch', () => {
  it('渲染一个 checkbox 输入并带有基础结构类名', () => {
    const { container } = render(<Switch aria-label="开关" />);
    const input = screen.getByRole('checkbox', { name: '开关' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'checkbox');
    expect(input).toHaveClass('ms-switch__input');
    // label 包裹 + 轨道/滑块结构
    expect(container.querySelector('label.ms-switch')).toBeInTheDocument();
    expect(container.querySelector('.ms-switch__track')).toBeInTheDocument();
    expect(container.querySelector('.ms-switch__thumb')).toBeInTheDocument();
  });

  it('把自定义 className 合并到 label 上,保留 ms-switch', () => {
    const { container } = render(<Switch className="my-extra" aria-label="开关" />);
    const label = container.querySelector('label');
    expect(label).toHaveClass('ms-switch');
    expect(label).toHaveClass('my-extra');
  });

  it('作为受控组件:反映 checked 并在切换时触发 onChange', () => {
    const onChange = vi.fn();
    render(<Switch checked onChange={onChange} aria-label="开关" />);
    const input = screen.getByRole('checkbox', { name: '开关' });
    expect(input).toBeChecked();
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('透传 disabled 等原生 props 到底层 input', () => {
    render(<Switch disabled aria-label="开关" />);
    const input = screen.getByRole('checkbox', { name: '开关' });
    expect(input).toBeDisabled();
  });
});

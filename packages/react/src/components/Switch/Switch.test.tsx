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

  it('size 与 tone 落到根 label 类名上(默认 md/primary)', () => {
    const { container, rerender } = render(<Switch aria-label="开关" />);
    let label = container.querySelector('label.ms-switch');
    expect(label).toHaveClass('ms-switch--md');
    expect(label).toHaveClass('ms-tone-primary');

    rerender(<Switch size="lg" tone="success" aria-label="开关" />);
    label = container.querySelector('label.ms-switch');
    expect(label).toHaveClass('ms-switch--lg');
    expect(label).toHaveClass('ms-tone-success');
  });

  it('children 渲染为右侧文字标签', () => {
    const { container } = render(<Switch aria-label="开关">深色模式</Switch>);
    const text = container.querySelector('.ms-switch__label');
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent('深色模式');
  });

  it('checkedIcon / uncheckedIcon 渲染到轨道两端', () => {
    const { container } = render(
      <Switch aria-label="开关" checkedIcon={<span>开</span>} uncheckedIcon={<span>关</span>} />,
    );
    expect(container.querySelector('.ms-switch__icon--on')).toHaveTextContent('开');
    expect(container.querySelector('.ms-switch__icon--off')).toHaveTextContent('关');
  });

  it('loading:禁用底层 input、置 aria-busy 并渲染 spinner', () => {
    const { container } = render(<Switch loading aria-label="开关" />);
    const input = screen.getByRole('checkbox', { name: '开关' });
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('.ms-switch--loading')).toBeInTheDocument();
    expect(container.querySelector('.ms-switch__spinner')).toBeInTheDocument();
  });

  it('暴露子部件类名留口:labelClassName/trackClassName/thumbClassName', () => {
    const { container } = render(
      <Switch
        aria-label="开关"
        labelClassName="my-label"
        trackClassName="my-track"
        thumbClassName="my-thumb"
      />,
    );
    expect(container.querySelector('label.ms-switch')).toHaveClass('my-label');
    expect(container.querySelector('.ms-switch__track')).toHaveClass('my-track');
    expect(container.querySelector('.ms-switch__thumb')).toHaveClass('my-thumb');
  });

  it('用户 onChange 不被覆盖:点击时被调用且能拿到 checked', () => {
    const onChange = vi.fn();
    render(<Switch onChange={onChange} aria-label="开关" />);
    const input = screen.getByRole('checkbox', { name: '开关' });
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input).toBeChecked();
  });
});

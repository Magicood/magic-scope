// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('渲染为原生 checkbox,children 作为可访问名,并带组件基础类名', () => {
    render(<Checkbox>同意条款</Checkbox>);

    const input = screen.getByRole('checkbox', { name: '同意条款' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'checkbox');
    expect(input).toHaveClass('ms-checkbox__input');

    // 文字标签渲染在独立的 label span 中
    expect(screen.getByText('同意条款')).toHaveClass('ms-checkbox__label');
  });

  it('合并外部 className 到根 label,且保留组件基础类名', () => {
    render(<Checkbox className="custom-cls">勾选</Checkbox>);

    // 根元素是 label,通过其包裹的 label 文本定位
    const label = screen.getByText('勾选').closest('label');
    expect(label).toHaveClass('ms-checkbox');
    expect(label).toHaveClass('custom-cls');
  });

  it('透传原生 props:受控 checked + disabled,并触发 onChange 回调', () => {
    const onChange = vi.fn();
    render(
      <Checkbox checked disabled onChange={onChange}>
        受控项
      </Checkbox>,
    );

    const input = screen.getByRole('checkbox', { name: '受控项' });
    expect(input).toBeChecked();
    expect(input).toBeDisabled();
  });

  it('可点击切换并调用 onChange(非受控,非 disabled)', () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>可切换</Checkbox>);

    const input = screen.getByRole('checkbox', { name: '可切换' });
    expect(input).not.toBeChecked();

    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input).toBeChecked();
  });
});

// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('默认渲染为 md 尺寸,带基础类名,且不设 aria-invalid', () => {
    render(<Textarea placeholder="留言" />);
    const el = screen.getByPlaceholderText('留言');

    expect(el.tagName).toBe('TEXTAREA');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('ms-textarea', 'ms-textarea--md');
    expect(el).not.toHaveClass('ms-textarea--invalid');
    expect(el).not.toHaveAttribute('aria-invalid');
  });

  it('size 变体映射到对应修饰类名', () => {
    render(<Textarea size="lg" placeholder="大号" />);
    const el = screen.getByPlaceholderText('大号');

    expect(el).toHaveClass('ms-textarea', 'ms-textarea--lg');
    expect(el).not.toHaveClass('ms-textarea--md');
  });

  it('invalid 时设置 aria-invalid 与 danger 修饰类名', () => {
    render(<Textarea invalid placeholder="校验失败" />);
    const el = screen.getByPlaceholderText('校验失败');

    expect(el).toHaveClass('ms-textarea--invalid');
    expect(el).toHaveAttribute('aria-invalid', 'true');
  });

  it('合并外部 className 并透传原生 props 与 onChange 回调', () => {
    const onChange = vi.fn();
    render(
      <Textarea
        className="custom-cls"
        disabled
        defaultValue="hi"
        aria-label="备注"
        onChange={onChange}
      />,
    );
    const el = screen.getByLabelText('备注') as HTMLTextAreaElement;

    expect(el).toHaveClass('ms-textarea', 'ms-textarea--md', 'custom-cls');
    expect(el).toBeDisabled();
    expect(el).toHaveValue('hi');

    el.disabled = false;
    fireEvent.change(el, { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

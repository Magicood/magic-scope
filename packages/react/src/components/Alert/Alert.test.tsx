// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Alert } from './Alert';

describe('Alert', () => {
  it('默认渲染为 role="alert" 并带 info 变体类名与基础类名', () => {
    render(<Alert>提示内容</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('提示内容');
    expect(alert).toHaveClass('ms-alert', 'ms-alert--info');
  });

  it('按 variant 渲染对应的变体类名', () => {
    render(<Alert variant="danger">出错了</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('ms-alert', 'ms-alert--danger');
    expect(alert).not.toHaveClass('ms-alert--info');
  });

  it('合并自定义 className 并透传原生 div 属性(id / data-* / onClick)', () => {
    const handleClick = vi.fn();
    render(
      <Alert variant="success" id="my-alert" data-testid="al" onClick={handleClick}>
        成功
      </Alert>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('ms-alert', 'ms-alert--success');
    expect(alert).toHaveAttribute('id', 'my-alert');
    expect(alert).toHaveAttribute('data-testid', 'al');

    fireEvent.click(alert);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('转发 ref 到底层 div 元素', () => {
    const ref = vi.fn();
    render(<Alert ref={ref}>带 ref</Alert>);
    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref.mock.calls[0]?.[0]).toBeInstanceOf(HTMLDivElement);
  });
});

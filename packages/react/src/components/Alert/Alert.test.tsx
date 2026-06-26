// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Alert } from './Alert';

describe('Alert', () => {
  it('默认渲染 info 变体:role="status"、带 info 变体类名与 tone 类与基础类名', () => {
    render(<Alert>提示内容</Alert>);
    // info/success 走礼貌播报 role="status"
    const alert = screen.getByRole('status');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('提示内容');
    expect(alert).toHaveClass('ms-alert', 'ms-alert--info', 'ms-tone-info');
  });

  it('按 variant 渲染对应的变体类名与 tone 类', () => {
    render(<Alert variant="danger">出错了</Alert>);
    // danger/warning 走打断式播报 role="alert"
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('ms-alert', 'ms-alert--danger', 'ms-tone-danger');
    expect(alert).not.toHaveClass('ms-alert--info');
  });

  it('role 按语义分流:warning→alert、success→status,且可被 role prop 覆盖', () => {
    const { rerender } = render(<Alert variant="warning">警告</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Alert variant="success">成功</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(
      <Alert variant="success" role="alert">
        强制打断
      </Alert>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('合并自定义 className 并透传原生 div 属性(id / data-* / onClick)', () => {
    const handleClick = vi.fn();
    render(
      <Alert variant="success" id="my-alert" data-testid="al" onClick={handleClick}>
        成功
      </Alert>,
    );
    const alert = screen.getByRole('status');
    expect(alert).toHaveClass('ms-alert', 'ms-alert--success', 'ms-tone-success');
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

  it('渲染 title 与 action 子部件;默认按 variant 给图标,icon={false} 关闭图标列', () => {
    const { container, rerender } = render(
      <Alert variant="warning" title="标题" action={<button type="button">重试</button>}>
        正文
      </Alert>,
    );
    expect(container.querySelector('.ms-alert__title')).toHaveTextContent('标题');
    expect(container.querySelector('.ms-alert__description')).toHaveTextContent('正文');
    expect(container.querySelector('.ms-alert__action')).toHaveTextContent('重试');
    // 默认有图标列
    expect(container.querySelector('.ms-alert__icon')).toBeInTheDocument();

    rerender(
      <Alert variant="warning" icon={false}>
        正文
      </Alert>,
    );
    expect(container.querySelector('.ms-alert__icon')).not.toBeInTheDocument();
  });

  it('dismissible 渲染关闭按钮:i18n aria-label,点击触发 onClose', () => {
    const onClose = vi.fn();
    render(
      <Alert dismissible onClose={onClose}>
        可关闭
      </Alert>,
    );
    const closeBtn = screen.getByRole('button', { name: '关闭' });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('classNames 把细粒度类挂到对应子部件', () => {
    const { container } = render(
      <Alert
        title="标题"
        dismissible
        classNames={{
          root: 'x-root',
          icon: 'x-icon',
          title: 'x-title',
          description: 'x-desc',
          close: 'x-close',
        }}
      >
        正文
      </Alert>,
    );
    expect(container.querySelector('.ms-alert')).toHaveClass('x-root');
    expect(container.querySelector('.ms-alert__icon')).toHaveClass('x-icon');
    expect(container.querySelector('.ms-alert__title')).toHaveClass('x-title');
    expect(container.querySelector('.ms-alert__description')).toHaveClass('x-desc');
    expect(container.querySelector('.ms-alert__close')).toHaveClass('x-close');
  });

  it('asChild 把样式合并到子元素并保留语义 role', () => {
    const { container } = render(
      <Alert variant="danger" asChild className="extra">
        <section>自带内容</section>
      </Alert>,
    );
    const el = container.querySelector('section');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('ms-alert', 'ms-alert--danger', 'ms-tone-danger', 'extra');
    expect(el).toHaveAttribute('role', 'alert');
    expect(el).toHaveTextContent('自带内容');
  });
});

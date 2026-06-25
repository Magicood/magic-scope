// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('使用默认变体与色调渲染,带基础类名', () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText('New');
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveClass('ms-badge', 'ms-badge--soft', 'ms-badge--primary');
  });

  it('根据 variant 与 tone 拼出对应的修饰类名', () => {
    render(
      <Badge variant="outline" tone="danger">
        Error
      </Badge>,
    );
    const badge = screen.getByText('Error');
    expect(badge).toHaveClass('ms-badge--outline', 'ms-badge--danger');
    expect(badge).not.toHaveClass('ms-badge--soft');
    expect(badge).not.toHaveClass('ms-badge--primary');
  });

  it('合并自定义 className 并透传原生 span 属性与事件回调', () => {
    const onClick = vi.fn();
    render(
      <Badge className="extra" data-testid="status" aria-label="状态标记" onClick={onClick}>
        Live
      </Badge>,
    );
    const badge = screen.getByLabelText('状态标记');
    expect(badge).toHaveClass('ms-badge', 'extra');
    expect(badge).toHaveAttribute('data-testid', 'status');
    fireEvent.click(badge);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('将 ref 转发到底层 span 元素', () => {
    const ref = vi.fn();
    render(<Badge ref={ref}>Ref</Badge>);
    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref.mock.calls[0]?.[0]).toBeInstanceOf(HTMLSpanElement);
  });
});

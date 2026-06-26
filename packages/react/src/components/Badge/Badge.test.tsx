// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Badge } from './Badge';
import { resolveCount } from './logic';

describe('Badge', () => {
  it('使用默认变体、色调与尺寸渲染,带基础类名(tone 走 ms-tone-*)', () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText('New').closest('.ms-badge');
    expect(badge).toBeInTheDocument();
    expect(badge?.tagName).toBe('SPAN');
    expect(badge).toHaveClass('ms-badge', 'ms-badge--soft', 'ms-badge--md', 'ms-tone-primary');
  });

  it('根据 variant 与 tone 拼出对应的修饰类名(tone 用 ms-tone-* 槽位类)', () => {
    render(
      <Badge variant="outline" tone="danger">
        Error
      </Badge>,
    );
    const badge = screen.getByText('Error').closest('.ms-badge');
    expect(badge).toHaveClass('ms-badge--outline', 'ms-tone-danger');
    expect(badge).not.toHaveClass('ms-badge--soft');
    expect(badge).not.toHaveClass('ms-tone-primary');
  });

  it('支持 glow 变体、info 色调与 sm 尺寸', () => {
    render(
      <Badge variant="glow" tone="info" size="sm">
        Beta
      </Badge>,
    );
    const badge = screen.getByText('Beta').closest('.ms-badge');
    expect(badge).toHaveClass('ms-badge--glow', 'ms-tone-info', 'ms-badge--sm');
  });

  it('dot 渲染纯圆点(无文字),可叠加 pulse', () => {
    const { container } = render(<Badge dot pulse tone="success" aria-label="在线" />);
    const badge = container.querySelector('.ms-badge');
    expect(badge).toHaveClass('ms-badge--dot', 'ms-badge--pulse', 'ms-tone-success');
    expect(badge?.querySelector('.ms-badge__label')).toBeNull();
  });

  it('数字徽标:count 推导文本、超 max 显示 max+', () => {
    const { rerender } = render(<Badge count={5} />);
    expect(screen.getByText('5').closest('.ms-badge')).toHaveClass('ms-badge--count');
    rerender(<Badge count={150} max={99} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('count 为 0 默认隐藏(独立模式不渲染),showZero 时渲染', () => {
    const { container, rerender } = render(<Badge count={0} />);
    expect(container.querySelector('.ms-badge')).toBeNull();
    rerender(<Badge count={0} showZero />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('icon 槽位渲染为 aria-hidden 装饰', () => {
    render(<Badge icon={<svg data-testid="ico" />}>Pro</Badge>);
    const icon = screen.getByText('Pro').parentElement?.querySelector('.ms-badge__icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon?.querySelector('[data-testid="ico"]')).not.toBeNull();
  });

  it('standalone=false 时包裹宿主并把徽标定位为角标', () => {
    render(
      <Badge standalone={false} count={3} placement="bottom-start" data-testid="anchored">
        <button type="button">收件箱</button>
      </Badge>,
    );
    const host = screen.getByText('收件箱');
    const anchor = host.closest('.ms-badge-anchor');
    expect(anchor).not.toBeNull();
    const badge = anchor?.querySelector('.ms-badge');
    expect(badge).toHaveClass('ms-badge--anchored', 'ms-badge--bottom-start');
    expect(badge).toHaveTextContent('3');
  });

  it('asChild 将徽标样式合并到子元素(独立模式)', () => {
    render(
      <Badge asChild tone="accent">
        <a href="https://example.com" data-testid="link">
          链接徽标
        </a>
      </Badge>,
    );
    const link = screen.getByTestId('link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('ms-badge', 'ms-tone-accent');
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

describe('resolveCount(纯逻辑)', () => {
  it('普通计数原样显示', () => {
    expect(resolveCount({ count: 7 })).toEqual({ display: '7', hidden: false, overflow: false });
  });

  it('超出 max 显示 max+(默认 99)', () => {
    expect(resolveCount({ count: 200 })).toEqual({
      display: '99+',
      hidden: false,
      overflow: true,
    });
    expect(resolveCount({ count: 12, max: 9 }).display).toBe('9+');
  });

  it('count<=0 默认隐藏,showZero 时显示 0', () => {
    expect(resolveCount({ count: 0 }).hidden).toBe(true);
    expect(resolveCount({ count: 0, showZero: true })).toEqual({
      display: '0',
      hidden: false,
      overflow: false,
    });
  });

  it('非整数向下取整,负数与 NaN 归零', () => {
    expect(resolveCount({ count: 3.9 }).display).toBe('3');
    expect(resolveCount({ count: -5 }).hidden).toBe(true);
    expect(resolveCount({ count: Number.NaN }).hidden).toBe(true);
  });
});

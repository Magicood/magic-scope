// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button, ButtonGroup } from './Button';

describe('Button', () => {
  it('渲染变体与尺寸类名,默认 type=button', () => {
    render(
      <Button variant="outline" size="lg">
        点我
      </Button>,
    );
    const btn = screen.getByRole('button', { name: '点我' });
    expect(btn).toHaveClass('ms-button', 'ms-button--outline', 'ms-button--lg');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('点击触发 onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>点</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('disabled 时不触发 onClick', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        禁用
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('tone 映射到 ms-tone-* 类(默认 primary)', () => {
    const { rerender } = render(<Button>x</Button>);
    expect(screen.getByRole('button')).toHaveClass('ms-tone-primary');
    rerender(<Button tone="danger">x</Button>);
    expect(screen.getByRole('button')).toHaveClass('ms-tone-danger');
  });

  it('扩展变体 soft / link 加变体类', () => {
    const { rerender } = render(<Button variant="soft">x</Button>);
    expect(screen.getByRole('button')).toHaveClass('ms-button--soft');
    rerender(<Button variant="link">x</Button>);
    expect(screen.getByRole('button')).toHaveClass('ms-button--link');
  });

  it('loading:aria-busy + 禁用 + spinner,且不触发 onClick', () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button loading onClick={onClick}>
        提交
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
    expect(container.querySelector('.ms-button__spinner')).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('图标 / iconOnly / fullWidth', () => {
    render(
      <Button leftIcon={<span data-testid="ic">★</span>} fullWidth>
        带图标
      </Button>,
    );
    expect(screen.getByTestId('ic')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('ms-button--full');

    render(
      <Button iconOnly aria-label="设置">
        <span>⚙</span>
      </Button>,
    );
    expect(screen.getByRole('button', { name: '设置' })).toHaveClass('ms-button--icon-only');
  });

  it('asChild:渲染为子元素(如 <a>)并合并按钮样式与 href', () => {
    render(
      <Button asChild variant="link" tone="accent">
        <a href="/x">链接</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: '链接' });
    expect(link).toHaveClass('ms-button', 'ms-button--link', 'ms-tone-accent');
    expect(link).toHaveAttribute('href', '/x');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('asChild:compose 两边 onClick(都触发)+ ref 接到子元素', () => {
    const onButton = vi.fn();
    const onChild = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button asChild onClick={onButton} ref={ref}>
        <a href="/x" onClick={onChild}>
          去文档
        </a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: '去文档' });
    fireEvent.click(link);
    expect(onChild).toHaveBeenCalledOnce(); // 子元素自带的
    expect(onButton).toHaveBeenCalledOnce(); // 传给 Button 的,不再被丢
    expect(ref.current).toBe(link); // 外部 ref 拿到真实 <a> DOM
  });

  it('ButtonGroup:role=group + 吸附类,内含子按钮', () => {
    render(
      <ButtonGroup>
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole('group');
    expect(group).toHaveClass('ms-button-group', 'ms-button-group--attached');
    expect(within(group).getAllByRole('button')).toHaveLength(2);
  });
});

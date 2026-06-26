// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('默认渲染 span + ms-visually-hidden,内容仍在 DOM(可被 SR 读到)', () => {
    render(<VisuallyHidden>跳过导航</VisuallyHidden>);
    const el = screen.getByText('跳过导航');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveClass('ms-visually-hidden');
    expect(el).toBeInTheDocument();
  });

  it('focusable=false 时不加 --focusable 修饰类', () => {
    render(<VisuallyHidden>x</VisuallyHidden>);
    expect(screen.getByText('x')).not.toHaveClass('ms-visually-hidden--focusable');
  });

  it('focusable=true 时加 --focusable 修饰类(skip-link 模式)', () => {
    render(<VisuallyHidden focusable>跳到主内容</VisuallyHidden>);
    expect(screen.getByText('跳到主内容')).toHaveClass('ms-visually-hidden--focusable');
  });

  it('as 多态渲染标签', () => {
    render(<VisuallyHidden as="h2">隐藏标题</VisuallyHidden>);
    expect(screen.getByText('隐藏标题').tagName).toBe('H2');
  });

  it('className 与组件类合并(用户类保留)', () => {
    render(<VisuallyHidden className="user-cls">x</VisuallyHidden>);
    const el = screen.getByText('x');
    expect(el).toHaveClass('ms-visually-hidden');
    expect(el).toHaveClass('user-cls');
  });

  it('透传原生属性与事件(...rest)', () => {
    const onClick = vi.fn();
    render(
      <VisuallyHidden data-testid="vh" onClick={onClick}>
        x
      </VisuallyHidden>,
    );
    const el = screen.getByTestId('vh');
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwardRef 指向渲染元素', () => {
    const ref = createRef<HTMLElement>();
    render(<VisuallyHidden ref={ref}>x</VisuallyHidden>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current).toHaveClass('ms-visually-hidden');
  });

  it('asChild 合并类/props 到子元素,不额外包裹(skip-link 用 <a>)', () => {
    render(
      <VisuallyHidden asChild focusable>
        <a href="#main">跳到主内容</a>
      </VisuallyHidden>,
    );
    const link = screen.getByRole('link', { name: '跳到主内容' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '#main');
    expect(link).toHaveClass('ms-visually-hidden', 'ms-visually-hidden--focusable');
  });

  it('asChild 时事件 compose(子元素与组件的同名处理器都执行)', () => {
    const childHandler = vi.fn();
    const parentHandler = vi.fn();
    render(
      <VisuallyHidden asChild onClick={parentHandler}>
        {/* biome-ignore lint/a11y/useValidAnchor: 测试用占位锚点 */}
        <a href="#x" onClick={childHandler}>
          x
        </a>
      </VisuallyHidden>,
    );
    fireEvent.click(screen.getByText('x'));
    expect(childHandler).toHaveBeenCalledTimes(1);
    expect(parentHandler).toHaveBeenCalledTimes(1);
  });

  it('asChild 时 ref 合并到子元素(外部 ref 拿到真实 DOM)', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <VisuallyHidden asChild>
        <a href="#x" ref={ref}>
          x
        </a>
      </VisuallyHidden>,
    );
    expect(ref.current?.tagName).toBe('A');
    expect(ref.current).toHaveClass('ms-visually-hidden');
  });
});

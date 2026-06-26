// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('渲染为原生 button,带 type=button、基础类名与 aria-pressed=false', () => {
    render(<Toggle>加粗</Toggle>);
    const btn = screen.getByRole('button', { name: '加粗', pressed: false });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('type', 'button');
    expect(btn).toHaveClass('ms-toggle');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(btn).toHaveAttribute('data-state', 'off');
  });

  it('非受控:defaultPressed 决定初始按下态', () => {
    render(<Toggle defaultPressed>B</Toggle>);
    const btn = screen.getByRole('button', { name: 'B' });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(btn).toHaveClass('ms-toggle--pressed');
    expect(btn).toHaveAttribute('data-state', 'on');
  });

  it('非受控:点击在两态间切换并回调 onPressedChange(next)', () => {
    const onPressedChange = vi.fn();
    render(<Toggle onPressedChange={onPressedChange}>B</Toggle>);
    const btn = screen.getByRole('button', { name: 'B' });

    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(onPressedChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(onPressedChange).toHaveBeenLastCalledWith(false);
    expect(onPressedChange).toHaveBeenCalledTimes(2);
  });

  it('受控:pressed 由外部控制,内部点击不自行改变 DOM(仅回调)', () => {
    const onPressedChange = vi.fn();
    const { rerender } = render(
      <Toggle pressed={false} onPressedChange={onPressedChange}>
        B
      </Toggle>,
    );
    const btn = screen.getByRole('button', { name: 'B' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(btn);
    // 受控未回写 pressed:仍是 false,但回调拿到期望的 next=true
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(onPressedChange).toHaveBeenCalledWith(true);

    // 父级回写后才变化
    rerender(
      <Toggle pressed={true} onPressedChange={onPressedChange}>
        B
      </Toggle>,
    );
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('键盘 Enter / Space 由原生 button 触发 click 即切换', () => {
    const onPressedChange = vi.fn();
    render(<Toggle onPressedChange={onPressedChange}>B</Toggle>);
    const btn = screen.getByRole('button', { name: 'B' });
    btn.focus();
    expect(btn).toHaveFocus();
    // jsdom 不会因 keyDown 自动派发 click,故直接验证 click 行为(原生 button 在真实浏览器由 Enter/Space 触发)
    fireEvent.click(btn);
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it('disabled:不可点、不切换、不回调', () => {
    const onPressedChange = vi.fn();
    render(
      <Toggle disabled onPressedChange={onPressedChange}>
        B
      </Toggle>,
    );
    const btn = screen.getByRole('button', { name: 'B' });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onPressedChange).not.toHaveBeenCalled();
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('用户 onClick 内 preventDefault 可阻断内部切换', () => {
    const onPressedChange = vi.fn();
    render(
      <Toggle onClick={(e) => e.preventDefault()} onPressedChange={onPressedChange}>
        B
      </Toggle>,
    );
    const btn = screen.getByRole('button', { name: 'B' });
    fireEvent.click(btn);
    expect(onPressedChange).not.toHaveBeenCalled();
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('iconOnly + aria-label:正方形类名 + 可访问名来自 aria-label', () => {
    render(<Toggle iconOnly aria-label="静音" />);
    const btn = screen.getByRole('button', { name: '静音' });
    expect(btn).toHaveClass('ms-toggle--icon-only');
  });

  it('variant / tone / size / shape / glow 落到类名,且合并外部 className', () => {
    render(
      <Toggle variant="solid" tone="danger" size="lg" shape="pill" className="my-toggle">
        B
      </Toggle>,
    );
    const btn = screen.getByRole('button', { name: 'B' });
    expect(btn).toHaveClass('ms-toggle--solid');
    expect(btn).toHaveClass('ms-tone-danger');
    expect(btn).toHaveClass('ms-toggle--lg');
    expect(btn).toHaveClass('ms-toggle--pill');
    expect(btn).toHaveClass('ms-toggle--glow');
    expect(btn).toHaveClass('my-toggle');
  });

  it('glow=false 时不加发光类名', () => {
    render(
      <Toggle glow={false} defaultPressed>
        B
      </Toggle>,
    );
    const btn = screen.getByRole('button', { name: 'B' });
    expect(btn).not.toHaveClass('ms-toggle--glow');
  });

  it('转发 ref 到底层 button 元素', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Toggle ref={ref}>B</Toggle>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveClass('ms-toggle');
  });

  it('透传 ...rest 原生属性(data-* / title)到 button', () => {
    render(
      <Toggle data-testid="t1" title="切换加粗">
        B
      </Toggle>,
    );
    const btn = screen.getByTestId('t1');
    expect(btn).toHaveAttribute('title', '切换加粗');
  });
});

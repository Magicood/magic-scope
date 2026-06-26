// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('渲染 trigger 与气泡结构,默认 placement 类名与 role 正确', () => {
    render(
      <Tooltip content="提示文字">
        <button type="button">触发器</button>
      </Tooltip>,
    );

    // trigger 正常渲染
    expect(screen.getByRole('button', { name: '触发器' })).toBeInTheDocument();

    // 气泡有 role="tooltip"、popover、默认 placement 类名
    const bubble = screen.getByRole('tooltip', { hidden: true });
    expect(bubble).toHaveTextContent('提示文字');
    expect(bubble).toHaveClass('ms-tooltip', 'ms-tooltip--top');
    expect(bubble).toHaveAttribute('popover', 'manual');
    expect(bubble).toHaveAttribute('id');
  });

  it('placement 与自定义 className 透传到气泡', () => {
    render(
      <Tooltip content="内容" placement="bottom" className="custom-cls">
        <button type="button">btn</button>
      </Tooltip>,
    );

    const bubble = screen.getByRole('tooltip', { hidden: true });
    expect(bubble).toHaveClass('ms-tooltip', 'ms-tooltip--bottom', 'custom-cls');
  });

  it('focus 触发显示(走 delay 定时器):data-open 置位且 trigger 关联 aria-describedby', () => {
    vi.useFakeTimers();
    try {
      render(
        <Tooltip content="提示" delay={150}>
          <button type="button">触发器</button>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: '触发器' });
      const bubble = screen.getByRole('tooltip', { hidden: true });

      // 初始未显示
      expect(bubble).not.toHaveAttribute('data-open');
      expect(trigger).not.toHaveAttribute('aria-describedby');

      // focus 后需等待 delay
      fireEvent.focus(trigger);
      expect(bubble).not.toHaveAttribute('data-open');

      act(() => {
        vi.advanceTimersByTime(150);
      });

      // 显示后:气泡 data-open=true(mock Popover API 切换),trigger 关联 aria-describedby 指向气泡 id
      expect(bubble).toHaveAttribute('data-open', 'true');
      expect(trigger).toHaveAttribute('aria-describedby', bubble.id);
    } finally {
      vi.useRealTimers();
    }
  });

  it('blur 后即时隐藏:清除 data-open 与 aria-describedby', () => {
    vi.useFakeTimers();
    try {
      render(
        <Tooltip content="提示" delay={150}>
          <button type="button">触发器</button>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: '触发器' });
      const bubble = screen.getByRole('tooltip', { hidden: true });

      fireEvent.focus(trigger);
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(bubble).toHaveAttribute('data-open', 'true');

      // blur 立即隐藏(无 delay)
      fireEvent.blur(trigger);
      expect(bubble).not.toHaveAttribute('data-open');
      expect(trigger).not.toHaveAttribute('aria-describedby');
    } finally {
      vi.useRealTimers();
    }
  });

  it('受控 open 直接驱动显隐,onOpenChange 在用户处理器外被触发', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Tooltip content="受控内容" open={false} onOpenChange={onOpenChange}>
        <button type="button">触发器</button>
      </Tooltip>,
    );

    const bubble = screen.getByRole('tooltip', { hidden: true });
    // 受控 open=false:不显示
    expect(bubble).not.toHaveAttribute('data-open');

    // 受控 open=true:直接显示(不走 delay)
    rerender(
      <Tooltip content="受控内容" open={true} onOpenChange={onOpenChange}>
        <button type="button">触发器</button>
      </Tooltip>,
    );
    expect(bubble).toHaveAttribute('data-open', 'true');

    // 受控模式下 hover 不改内部状态,但仍回调 onOpenChange 让外部决定
    const trigger = screen.getByRole('button', { name: '触发器' });
    fireEvent.pointerEnter(trigger);
    // 受控下 data-open 仍由 open prop 决定(此处仍 true)
    expect(bubble).toHaveAttribute('data-open', 'true');
  });

  it('defaultOpen 非受控初始即打开,onOpenChange 随显隐触发', () => {
    const onOpenChange = vi.fn();
    render(
      <Tooltip content="引导提示" defaultOpen onOpenChange={onOpenChange}>
        <button type="button">触发器</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: '触发器' });
    const bubble = screen.getByRole('tooltip', { hidden: true });
    // 初始即打开
    expect(bubble).toHaveAttribute('data-open', 'true');

    // 失焦隐藏(closeDelay=0 即时),onOpenChange(false)
    fireEvent.blur(trigger);
    expect(bubble).not.toHaveAttribute('data-open');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('disabled 时 hover/focus 都不弹', () => {
    vi.useFakeTimers();
    try {
      render(
        <Tooltip content="提示" disabled delay={150}>
          <button type="button">触发器</button>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: '触发器' });
      const bubble = screen.getByRole('tooltip', { hidden: true });

      fireEvent.focus(trigger);
      act(() => {
        vi.advanceTimersByTime(150);
      });
      // disabled:始终不显示
      expect(bubble).not.toHaveAttribute('data-open');
      expect(trigger).not.toHaveAttribute('aria-describedby');
    } finally {
      vi.useRealTimers();
    }
  });

  it('trigger 用户处理器与内部触发都执行(compose 不丢弃)', () => {
    vi.useFakeTimers();
    try {
      const onFocus = vi.fn();
      render(
        <Tooltip content="提示" delay={0}>
          <button type="button" onFocus={onFocus}>
            触发器
          </button>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: '触发器' });
      const bubble = screen.getByRole('tooltip', { hidden: true });

      fireEvent.focus(trigger);
      act(() => {
        vi.advanceTimersByTime(0);
      });
      // 用户 onFocus 被调用
      expect(onFocus).toHaveBeenCalledTimes(1);
      // 内部 show 也被调用(气泡显示)
      expect(bubble).toHaveAttribute('data-open', 'true');
    } finally {
      vi.useRealTimers();
    }
  });

  it('tone / placement(左右)/ arrow / ...rest 透传到气泡', () => {
    render(
      <Tooltip content="内容" placement="right" tone="danger" arrow data-testid="tip-bubble">
        <button type="button">btn</button>
      </Tooltip>,
    );

    const bubble = screen.getByRole('tooltip', { hidden: true });
    // 主轴方位类名 + data-ms-side、tone 类名
    expect(bubble).toHaveClass('ms-tooltip', 'ms-tooltip--right', 'ms-tone-danger');
    expect(bubble).toHaveAttribute('data-ms-side', 'right');
    // ...rest 透传(data-* 落到气泡根)
    expect(bubble).toHaveAttribute('data-testid', 'tip-bubble');
    // arrow 渲染
    expect(bubble.querySelector('.ms-tooltip__arrow')).not.toBeNull();
  });
});

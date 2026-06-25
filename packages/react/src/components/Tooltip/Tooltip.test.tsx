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
});

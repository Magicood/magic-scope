// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Spin } from './Spin';

describe('Spin', () => {
  it('包裹模式:spinning 时盖遮罩(role=status)且内容不卸载、被 aria-hidden', () => {
    render(
      <Spin spinning>
        <button type="button">内部按钮</button>
      </Spin>,
    );

    // 内容仍在 DOM(不卸载),保留布局
    const inner = screen.getByText('内部按钮');
    expect(inner).toBeInTheDocument();

    // 遮罩作为状态区域播报
    const status = screen.getByRole('status');
    expect(status).toHaveClass('ms-spin__overlay');
    expect(status).toHaveAttribute('aria-live', 'polite');

    // 被遮内容盒 aria-hidden + inert(防交互/读屏穿透)
    const contentBox = inner.closest('.ms-spin__content');
    expect(contentBox).toHaveAttribute('aria-hidden', 'true');
    expect(contentBox).toHaveAttribute('inert');
  });

  it('spinning=false 时不渲染遮罩,内容正常可访问(无 aria-hidden / inert)', () => {
    render(
      <Spin spinning={false}>
        <button type="button">内部按钮</button>
      </Spin>,
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    const inner = screen.getByRole('button', { name: '内部按钮' });
    const contentBox = inner.closest('.ms-spin__content');
    expect(contentBox).not.toHaveAttribute('aria-hidden');
    expect(contentBox).not.toHaveAttribute('inert');
  });

  it('默认 spinning 为 true(不传即加载态)', () => {
    render(
      <Spin>
        <div>内容</div>
      </Spin>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('默认指示器复用 Spinner;无 tip 时 aria-label 回退 i18n「加载中」', () => {
    render(
      <Spin>
        <div>内容</div>
      </Spin>,
    );
    // Spinner 自带 role=status + aria-label;遮罩也是 status —— 取带「加载中」名字的那个
    const labelled = screen.getAllByLabelText('加载中');
    expect(labelled.length).toBeGreaterThan(0);
  });

  it('tip 文本既可见渲染,也作为遮罩的可访问名播报', () => {
    render(
      <Spin tip="正在施法…">
        <div>内容</div>
      </Spin>,
    );
    // 可见 tip
    expect(screen.getByText('正在施法…')).toHaveClass('ms-spin__tip');
    // 遮罩可访问名取 tip
    const overlay = document.querySelector('.ms-spin__overlay');
    expect(overlay).toHaveAttribute('aria-label', '正在施法…');
  });

  it('自定义 indicator 取代默认 Spinner', () => {
    render(
      <Spin indicator={<span data-testid="custom">★</span>}>
        <div>内容</div>
      </Spin>,
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
    // 默认 Spinner 的指示器类不应出现
    expect(document.querySelector('.ms-spinner__indicator')).not.toBeInTheDocument();
  });

  it('size 与 tone 落到根类名(ms-spin--lg / ms-tone-success)', () => {
    const { container } = render(
      <Spin size="lg" tone="success">
        <div>内容</div>
      </Spin>,
    );
    const root = container.querySelector('.ms-spin');
    expect(root).toHaveClass('ms-spin--lg');
    expect(root).toHaveClass('ms-tone-success');
    expect(root).toHaveClass('ms-spin--wrap');
  });

  it('无 children:退化为独立指示器(ms-spin--bare),spinning 时渲染、停止时返回 null', () => {
    const { container, rerender } = render(<Spin spinning aria-label="独立加载" />);
    const root = container.querySelector('.ms-spin');
    expect(root).toHaveClass('ms-spin--bare');
    expect(root).not.toHaveClass('ms-spin--wrap');
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<Spin spinning={false} />);
    expect(container.querySelector('.ms-spin')).not.toBeInTheDocument();
  });

  it('fullscreen:spinning 时渲染固定全屏浮层,停止时返回 null', () => {
    const { container, rerender } = render(<Spin fullscreen spinning tip="加载页面" />);
    const root = container.querySelector('.ms-spin');
    expect(root).toHaveClass('ms-spin--fullscreen');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('加载页面')).toBeInTheDocument();

    rerender(<Spin fullscreen spinning={false} tip="加载页面" />);
    expect(container.querySelector('.ms-spin')).not.toBeInTheDocument();
  });

  it('classNames 细粒度槽位与 wrapperClassName 都拼接到对应元素', () => {
    const { container } = render(
      <Spin
        wrapperClassName="wrap-extra"
        classNames={{
          root: 'root-extra',
          overlay: 'overlay-extra',
          indicator: 'indicator-extra',
          content: 'content-extra',
          tip: 'tip-extra',
        }}
        tip="提示"
      >
        <div>内容</div>
      </Spin>,
    );
    const root = container.querySelector('.ms-spin');
    expect(root).toHaveClass('wrap-extra');
    expect(root).toHaveClass('root-extra');
    expect(container.querySelector('.ms-spin__overlay')).toHaveClass('overlay-extra');
    expect(container.querySelector('.ms-spin__indicator')).toHaveClass('indicator-extra');
    expect(container.querySelector('.ms-spin__content')).toHaveClass('content-extra');
    expect(container.querySelector('.ms-spin__tip')).toHaveClass('tip-extra');
  });

  it('forwardRef 指向根容器,...rest 透传(id / data-*)', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Spin ref={ref} id="my-spin" data-foo="bar">
        <div>内容</div>
      </Spin>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current).toHaveClass('ms-spin');
    expect(ref.current).toHaveAttribute('id', 'my-spin');
    expect(ref.current).toHaveAttribute('data-foo', 'bar');
  });

  it('SSR/首帧:spinning + delay>0 不立刻渲染遮罩(delay 对首帧/SSR 生效)', async () => {
    const { renderToString } = await import('react-dom/server');
    const withDelay = renderToString(
      <Spin spinning delay={300}>
        <div>内容</div>
      </Spin>,
    );
    expect(withDelay).not.toContain('role="status"'); // 首帧无遮罩(等够才显)
    const noDelay = renderToString(
      <Spin spinning>
        <div>内容</div>
      </Spin>,
    );
    expect(noDelay).toContain('role="status"'); // 无 delay 首帧即遮罩
  });

  describe('delay 防闪烁(fake timers)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('delay>0:spinning 立即置真但遮罩在等够前不出现,等够后出现', () => {
      const { rerender } = render(
        <Spin spinning delay={300}>
          <div>内容</div>
        </Spin>,
      );
      // 刚 spinning,还没等够 → 无遮罩
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByRole('status')).toBeInTheDocument();

      // 关闭即时收起
      rerender(
        <Spin spinning={false} delay={300}>
          <div>内容</div>
        </Spin>,
      );
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('delay>0:在等够前就 spinning→false,则遮罩完全不闪(防一闪而过)', () => {
      const { rerender } = render(
        <Spin spinning delay={300}>
          <div>内容</div>
        </Spin>,
      );
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      // 200ms 时请求已完成 → 收起,定时器被清,不应在 300ms 触发
      act(() => {
        vi.advanceTimersByTime(200);
      });
      rerender(
        <Spin spinning={false} delay={300}>
          <div>内容</div>
        </Spin>,
      );
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});

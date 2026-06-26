// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Statistic } from './Statistic';

/** 把 matchMedia(prefers-reduced-motion) 设为给定 matches。 */
function stubReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
}

beforeEach(() => {
  stubReducedMotion(false);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Statistic', () => {
  it('渲染数值并按默认千分位格式化,带组件基础类名', () => {
    const { container } = render(<Statistic value={1234567} />);
    const root = container.querySelector('.ms-statistic');
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('ms-statistic--md');
    // 整数部分插入千分位
    expect(container.querySelector('.ms-statistic__integer')?.textContent).toBe('1,234,567');
  });

  it('应用 precision 拆出小数部分到独立槽位', () => {
    const { container } = render(<Statistic value={3.456789} precision={2} />);
    expect(container.querySelector('.ms-statistic__integer')?.textContent).toBe('3');
    expect(container.querySelector('.ms-statistic__fraction')?.textContent).toBe('.46');
  });

  it('渲染 title / prefix / suffix 子部件', () => {
    const { container } = render(<Statistic value={88} title="月活跃用户" prefix="¥" suffix="%" />);
    expect(screen.getByText('月活跃用户')).toBeInTheDocument();
    expect(container.querySelector('.ms-statistic__prefix')?.textContent).toBe('¥');
    expect(container.querySelector('.ms-statistic__suffix')?.textContent).toBe('%');
  });

  it('trend=up 上 success tone 类并渲染趋势箭头;down 上 danger tone', () => {
    const { container, rerender } = render(<Statistic value={12} trend="up" />);
    let root = container.querySelector('.ms-statistic');
    expect(root).toHaveClass('ms-statistic--trend-up');
    expect(root).toHaveClass('ms-tone-success');
    expect(container.querySelector('.ms-statistic__trend-icon')).toBeInTheDocument();

    rerender(<Statistic value={12} trend="down" />);
    root = container.querySelector('.ms-statistic');
    expect(root).toHaveClass('ms-statistic--trend-down');
    expect(root).toHaveClass('ms-tone-danger');
  });

  it('数值容器给完整 aria-label(标题 + 趋势 + 前缀数值后缀)', () => {
    const { container } = render(
      <Statistic value={1234} title="收入" prefix="¥" suffix="元" trend="up" />,
    );
    const valueBox = container.querySelector('.ms-statistic__value');
    expect(valueBox).toHaveAttribute('aria-label', '收入 上升 ¥1,234元');
  });

  it('aria-label 可被外部覆盖', () => {
    const { container } = render(<Statistic value={1234} title="收入" aria-label="自定义读法" />);
    expect(container.querySelector('.ms-statistic__value')).toHaveAttribute(
      'aria-label',
      '自定义读法',
    );
  });

  it('loading 渲染 skeleton 占位、置 aria-busy 且不渲染真实数值', () => {
    const { container } = render(<Statistic value={9999} loading title="加载中指标" />);
    const root = container.querySelector('.ms-statistic');
    expect(root).toHaveClass('ms-statistic--loading');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('.ms-statistic__skeleton')).toBeInTheDocument();
    // 真实数值容器不应出现
    expect(container.querySelector('.ms-statistic__value')).not.toBeInTheDocument();
  });

  it('animateOnMount 在 reduced-motion 下直接显示终值(不从 0 起步)', () => {
    stubReducedMotion(true);
    const { container } = render(<Statistic value={5000} animateOnMount />);
    // reduced-motion:跳过滚动,直接落终值
    expect(container.querySelector('.ms-statistic__integer')?.textContent).toBe('5,000');
  });

  it('非数字字符串原样透传,不插分隔符、不拆段', () => {
    const { container } = render(<Statistic value="N/A" />);
    expect(container.querySelector('.ms-statistic__number')?.textContent).toBe('N/A');
    expect(container.querySelector('.ms-statistic__fraction')).not.toBeInTheDocument();
  });

  // —— 回归:NaN(number)走非数值分支,不被吞成 "0"(LOW) ——
  it('value=NaN(number)原样透传,不渲染为 "0"', () => {
    const { container } = render(<Statistic value={Number.NaN} />);
    expect(container.querySelector('.ms-statistic__number')?.textContent).toBe('NaN');
    expect(container.querySelector('.ms-statistic__integer')).not.toBeInTheDocument();
  });

  // —— 回归:reduced-motion 下首帧不闪 0,直接终值(LOW) ——
  it('animateOnMount 在 reduced-motion 下首帧即终值,不出现 "0" 中间态', () => {
    stubReducedMotion(true);
    const { container } = render(<Statistic value={5000} animateOnMount />);
    // 首次提交(useLayoutEffect 已在 paint 前跑过)就应是终值,绝不出现 "0"
    expect(container.querySelector('.ms-statistic__integer')?.textContent).toBe('5,000');
  });

  // —— 回归:animateOnMount 仅挂载一次,后续 value 变化直接显示终值不重滚(MEDIUM) ——
  it('animateOnMount 后 value 变化直接显示新终值,不从 0 重滚', () => {
    vi.useFakeTimers();
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        return setTimeout(() => cb(performance.now()), 16) as unknown as number;
      });
    try {
      const { container, rerender } = render(
        <Statistic value={1000} animateOnMount animateDuration={1000} />,
      );
      // 挂载入场滚动跑完(用真实终值收尾)
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      const initialCalls = rafSpy.mock.calls.length;
      expect(initialCalls).toBeGreaterThan(0);

      // value 变更:不应重新启动 rAF 滚动,且立即显示新终值
      rerender(<Statistic value={9999} animateOnMount animateDuration={1000} />);
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(rafSpy.mock.calls.length).toBe(initialCalls); // 无新的滚动帧
      expect(container.querySelector('.ms-statistic__integer')?.textContent).toBe('9,999');
    } finally {
      rafSpy.mockRestore();
      vi.useRealTimers();
    }
  });

  it('size 与 as 多态生效', () => {
    const { container } = render(<Statistic value={1} size="lg" as="section" data-testid="stat" />);
    const root = container.querySelector('.ms-statistic');
    expect(root?.tagName).toBe('SECTION');
    expect(root).toHaveClass('ms-statistic--lg');
    expect(root).toHaveAttribute('data-testid', 'stat');
  });

  it('classNames 子部件留口与 valueClassName 生效', () => {
    const { container } = render(
      <Statistic
        value={1}
        title="t"
        valueClassName="my-value"
        classNames={{ title: 'my-title', value: 'extra-value' }}
      />,
    );
    expect(container.querySelector('.ms-statistic__title')).toHaveClass('my-title');
    const valueBox = container.querySelector('.ms-statistic__value');
    expect(valueBox).toHaveClass('my-value');
    expect(valueBox).toHaveClass('extra-value');
  });

  it('forwardRef 暴露根 DOM 节点', () => {
    let node: HTMLElement | null = null;
    render(
      <Statistic
        value={1}
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).not.toBeNull();
    expect((node as unknown as HTMLElement).classList.contains('ms-statistic')).toBe(true);
  });
});

// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BackTop } from './BackTop';

// 把 window 滚动位置设到某值并派发 scroll 事件
function setWindowScroll(top: number) {
  Object.defineProperty(window, 'scrollY', { value: top, writable: true, configurable: true });
  Object.defineProperty(window, 'pageYOffset', {
    value: top,
    writable: true,
    configurable: true,
  });
  fireEvent.scroll(window);
}

beforeEach(() => {
  setWindowScroll(0);
  // 默认不减弱动效
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('BackTop', () => {
  it('渲染为 button,默认 aria-label 取自 i18n,带组件基础类名与 tone 类', () => {
    render(<BackTop />);
    const btn = screen.getByRole('button', { hidden: true });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-label', '回到顶部');
    expect(btn).toHaveClass('ms-back-top');
    expect(btn).toHaveClass('ms-tone-primary');
    expect(btn).toHaveClass('ms-back-top--circle');
  });

  it('初始(scrollTop=0)隐藏:aria-hidden + tabIndex=-1 + 无 data-visible', () => {
    render(<BackTop />);
    const btn = screen.getByRole('button', { hidden: true });
    expect(btn).toHaveAttribute('aria-hidden', 'true');
    expect(btn).toHaveAttribute('tabindex', '-1');
    expect(btn).not.toHaveAttribute('data-visible');
  });

  it('滚动超过 visibilityHeight 后淡入:data-visible + 去 aria-hidden + tabIndex=0', () => {
    render(<BackTop visibilityHeight={400} />);
    act(() => setWindowScroll(500));
    const btn = screen.getByRole('button', { name: '回到顶部' });
    expect(btn).toHaveAttribute('data-visible');
    expect(btn).not.toHaveAttribute('aria-hidden');
    expect(btn).toHaveAttribute('tabindex', '0');
  });

  it('滚动未超过阈值仍隐藏', () => {
    render(<BackTop visibilityHeight={400} />);
    act(() => setWindowScroll(399));
    const btn = screen.getByRole('button', { hidden: true });
    expect(btn).not.toHaveAttribute('data-visible');
    expect(btn).toHaveAttribute('aria-hidden', 'true');
  });

  it('自定义 children 覆盖默认箭头图标', () => {
    render(<BackTop>顶</BackTop>);
    const btn = screen.getByRole('button', { hidden: true });
    expect(btn).toHaveTextContent('顶');
    expect(btn.querySelector('svg')).toBeNull();
  });

  it('aria-label 可被显式覆盖', () => {
    render(<BackTop aria-label="回到页首" />);
    expect(screen.getByRole('button', { hidden: true })).toHaveAttribute('aria-label', '回到页首');
  });

  it('点击:减弱动效时瞬时归顶(scrollTo(0,0))并触发用户 onClick', () => {
    // 强制 prefers-reduced-motion
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      })),
    );
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    const onClick = vi.fn();

    render(<BackTop onClick={onClick} />);
    act(() => setWindowScroll(800));
    fireEvent.click(screen.getByRole('button', { name: '回到顶部' }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('用户在 onClick 里 preventDefault 可阻断回顶滚动', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      })),
    );
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);

    render(
      <BackTop
        onClick={(e) => {
          e.preventDefault();
        }}
      />,
    );
    act(() => setWindowScroll(800));
    fireEvent.click(screen.getByRole('button', { name: '回到顶部' }));

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('监听自定义 target(返回 HTMLElement)的滚动', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    Object.defineProperty(container, 'scrollTop', {
      value: 0,
      writable: true,
      configurable: true,
    });

    render(<BackTop visibilityHeight={100} target={() => container} />);
    const btn = screen.getByRole('button', { hidden: true });
    expect(btn).not.toHaveAttribute('data-visible');

    act(() => {
      (container as unknown as { scrollTop: number }).scrollTop = 250;
      fireEvent.scroll(container);
    });
    expect(btn).toHaveAttribute('data-visible');

    container.remove();
  });

  it('square 形状与自定义 right/bottom 注入定位变量', () => {
    render(<BackTop shape="square" right={40} bottom={60} />);
    const btn = screen.getByRole('button', { hidden: true });
    expect(btn).toHaveClass('ms-back-top--square');
    expect(btn.style.getPropertyValue('--ms-back-top-right')).toBe('40px');
    expect(btn.style.getPropertyValue('--ms-back-top-bottom')).toBe('60px');
  });

  it('回归:target prop 变化后重订阅,新容器滚动能触发可见性(旧容器解绑)', () => {
    const containerA = document.createElement('div');
    const containerB = document.createElement('div');
    for (const c of [containerA, containerB]) {
      document.body.appendChild(c);
      Object.defineProperty(c, 'scrollTop', { value: 0, writable: true, configurable: true });
    }

    const { rerender } = render(<BackTop visibilityHeight={100} target={() => containerA} />);
    const btn = screen.getByRole('button', { hidden: true });
    expect(btn).not.toHaveAttribute('data-visible');

    // 切换到新容器
    rerender(<BackTop visibilityHeight={100} target={() => containerB} />);

    // 旧容器滚动不再触发(已解绑)
    act(() => {
      (containerA as unknown as { scrollTop: number }).scrollTop = 250;
      fireEvent.scroll(containerA);
    });
    expect(btn).not.toHaveAttribute('data-visible');

    // 新容器滚动触发可见
    act(() => {
      (containerB as unknown as { scrollTop: number }).scrollTop = 250;
      fireEvent.scroll(containerB);
    });
    expect(btn).toHaveAttribute('data-visible');

    containerA.remove();
    containerB.remove();
  });

  it('回归:隐藏态用户传 tabIndex 仍强制 -1(受控属性不被 {...props} 覆盖)', () => {
    // biome-ignore lint/a11y/noPositiveTabindex: 测试需要可区分的正值以验证受控覆盖
    render(<BackTop tabIndex={3} />);
    const btn = screen.getByRole('button', { hidden: true });
    // 初始隐藏:无论用户传什么,tabIndex 都是 -1
    expect(btn).toHaveAttribute('tabindex', '-1');
  });

  it('回归:可见态用户传 tabIndex 被采纳', () => {
    // biome-ignore lint/a11y/noPositiveTabindex: 测试需要可区分的正值以验证受控采纳
    render(<BackTop visibilityHeight={100} tabIndex={3} />);
    act(() => setWindowScroll(200));
    const btn = screen.getByRole('button', { name: '回到顶部' });
    expect(btn).toHaveAttribute('tabindex', '3');
  });

  it('转发 ref 到底层 button', () => {
    let node: HTMLButtonElement | null = null;
    render(
      <BackTop
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLButtonElement);
  });
});

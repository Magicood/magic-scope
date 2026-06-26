// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Affix, type AffixHandle } from './Affix';

// jsdom 不做布局,getBoundingClientRect 恒为 0。用一个可变的 fake rect 喂给被测元素,
// 让 computeAffix 在「内容上沿 = topValue」的几何下判定吸附。
let topValue = 200;

function stubRects() {
  // 根占位与 content 都用同一个 fake rect(测试里 root 即内容本应所处几何)
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value() {
      return {
        top: topValue,
        left: 40,
        right: 360,
        bottom: topValue + 60,
        width: 320,
        height: 60,
        x: 40,
        y: topValue,
        toJSON() {},
      } as DOMRect;
    },
  });
}

function setWindowScroll(top: number) {
  Object.defineProperty(window, 'scrollY', { value: top, writable: true, configurable: true });
  Object.defineProperty(window, 'pageYOffset', { value: top, writable: true, configurable: true });
}

// rAF 待执行队列:真实 rAF 是「先返回 id,稍后再跑 cb」,这里用队列模拟以保证组件内
// `rafRef.current = requestAnimationFrame(cb)` 能先拿到 id 再被 flushRaf() 触发(避免同步执行
// 导致 rafRef 被回写成 id 后再也无法调度的测试假象)。
let rafQueue: FrameRequestCallback[] = [];
let rafId = 0;
function flushRaf() {
  const pending = rafQueue;
  rafQueue = [];
  for (const cb of pending) {
    cb(performance.now?.() ?? 0);
  }
}
// 在 act 内触发滚动并把排期的 rAF 帧跑掉
function scroll(target: Window | HTMLElement = window) {
  fireEvent.scroll(target);
  flushRaf();
}

beforeEach(() => {
  topValue = 200;
  rafQueue = [];
  rafId = 0;
  setWindowScroll(0);
  Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true });
  stubRects();
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    rafQueue.push(cb);
    rafId += 1;
    return rafId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    void id;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Affix', () => {
  it('渲染透明包裹:根带 ms-affix、content 带 ms-affix__content,children 原样在内,未吸时无 data-affixed', () => {
    const { container } = render(
      <Affix offsetTop={16}>
        <button type="button">回到顶部</button>
      </Affix>,
    );
    const root = container.querySelector('.ms-affix');
    const content = container.querySelector('.ms-affix__content');
    expect(root).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(content?.querySelector('button')).toHaveTextContent('回到顶部');
    // 初始 top=200 > offsetTop=16,不吸
    expect(root).not.toHaveAttribute('data-affixed');
    expect(root).not.toHaveAttribute('data-mode');
  });

  it('滚动使元素上沿越过 offsetTop 时吸顶:data-affixed/data-mode=top,content position:fixed 且锁宽', () => {
    const { container } = render(
      <Affix offsetTop={16}>
        <div>导航条</div>
      </Affix>,
    );
    const root = container.querySelector('.ms-affix') as HTMLElement;
    const content = container.querySelector('.ms-affix__content') as HTMLElement;

    // 模拟向下滚动:内容上沿降到 8(<= 16)
    topValue = 8;
    act(() => {
      scroll();
    });

    expect(root).toHaveAttribute('data-affixed');
    expect(root).toHaveAttribute('data-mode', 'top');
    expect(content.style.position).toBe('fixed');
    expect(content.style.width).toBe('320px');
    expect(content.style.top).toBe('16px');
    // 等尺寸占位:根撑出 min 高度防跳动
    expect(root.style.minHeight).toBe('60px');
    expect(root.style.minWidth).toBe('320px');
  });

  it('onChange 仅在跨态(不吸↔吸)时各触发一次,不每帧回调', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Affix offsetTop={16} onChange={onChange}>
        <div>条</div>
      </Affix>,
    );
    const root = container.querySelector('.ms-affix') as HTMLElement;
    onChange.mockClear(); // 忽略挂载时的首次 sync(此时未吸,不应回调,但稳妥清零)

    topValue = 8;
    act(() => scroll());
    act(() => scroll()); // 仍吸,不应再触发
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(true);

    topValue = 200;
    act(() => scroll()); // 回到不吸
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(root).not.toHaveAttribute('data-affixed');
  });

  it('offsetBottom 触发吸底:data-mode=bottom 且 content fixed', () => {
    const { container } = render(
      <Affix offsetBottom={24}>
        <div>底栏</div>
      </Affix>,
    );
    const root = container.querySelector('.ms-affix') as HTMLElement;
    const content = container.querySelector('.ms-affix__content') as HTMLElement;
    // 内容下沿 = top+60;容器底 800;距底 <= 24 需 top >= 716。设 top=730 → 距底 10
    topValue = 730;
    act(() => scroll());

    expect(root).toHaveAttribute('data-mode', 'bottom');
    expect(content.style.position).toBe('fixed');
  });

  it('自定义 getTarget:在该元素上监听 scroll(非 window 也能驱动吸附)', () => {
    const scrollHost = document.createElement('div');
    document.body.appendChild(scrollHost);
    const addSpy = vi.spyOn(scrollHost, 'addEventListener');

    render(
      <Affix offsetTop={0} getTarget={() => scrollHost}>
        <div>内容</div>
      </Affix>,
    );
    // 已在自定义容器上挂了 scroll 监听
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), expect.anything());
    document.body.removeChild(scrollHost);
  });

  it('透传根 div 原生属性 / className / classNames 槽位,不破坏内部语义', () => {
    const { container } = render(
      <Affix
        className="outer"
        classNames={{ root: 'slot-root', content: 'slot-content' }}
        data-testid="affix-root"
        aria-label="吸附区"
      >
        <nav>导航</nav>
      </Affix>,
    );
    const root = container.querySelector('.ms-affix') as HTMLElement;
    expect(root).toHaveClass('outer', 'slot-root');
    expect(root).toHaveAttribute('data-testid', 'affix-root');
    expect(root).toHaveAttribute('aria-label', '吸附区');
    expect(container.querySelector('.ms-affix__content')).toHaveClass('slot-content');
    // 内部语义保留:nav 原样存在,Affix 未注入 role
    expect(container.querySelector('nav')).toBeInTheDocument();
    expect(root).not.toHaveAttribute('role');
  });

  it('ref 暴露命令式 measure():布局变化后主动重测可切到吸附态', () => {
    const ref = createRef<AffixHandle>();
    const { container } = render(
      <Affix ref={ref} offsetTop={16}>
        <div>条</div>
      </Affix>,
    );
    const root = container.querySelector('.ms-affix') as HTMLElement;
    expect(root).not.toHaveAttribute('data-affixed');

    // 不派发 scroll,仅改几何后命令式重测
    topValue = 4;
    act(() => {
      ref.current?.measure();
    });
    expect(root).toHaveAttribute('data-affixed');
  });

  it('卸载时移除 scroll/resize 监听(不残留泄漏)', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(
      <Affix offsetTop={0}>
        <div>条</div>
      </Affix>,
    );
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('ResizeObserver 可用时:订阅内容尺寸变化以更新(特性检测分支)', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    class FakeRO {
      observe = observe;
      unobserve = vi.fn();
      disconnect = disconnect;
    }
    vi.stubGlobal('ResizeObserver', FakeRO);

    const { unmount } = render(
      <Affix offsetTop={0}>
        <div>条</div>
      </Affix>,
    );
    // root 与 content 都被 observe
    expect(observe).toHaveBeenCalled();
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});

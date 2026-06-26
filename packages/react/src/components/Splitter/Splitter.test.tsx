// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Splitter, type SplitterHandle } from './Splitter';

// jsdom 不做布局:容器主轴宽度恒为 0。给所有元素喂一个固定 width=400 的 fake rect,
// 让组件测得 containerPx=400,从而能初始化 / 归一尺寸。
function stubWidth(width: number) {
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value() {
      return {
        top: 0,
        left: 0,
        right: width,
        bottom: 200,
        width,
        height: 200,
        x: 0,
        y: 0,
        toJSON() {},
      } as DOMRect;
    },
  });
}

// 一个会立刻回调一次的假 ResizeObserver(组件首测已够,这里仅保证构造不报错)。
class FakeRO {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  stubWidth(400);
  vi.stubGlobal('ResizeObserver', FakeRO);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Splitter', () => {
  it('渲染 N 个面板 + (N-1) 个 separator gutter,内容原样在内', () => {
    render(
      <Splitter>
        <Splitter.Panel>左</Splitter.Panel>
        <Splitter.Panel>中</Splitter.Panel>
        <Splitter.Panel>右</Splitter.Panel>
      </Splitter>,
    );
    expect(screen.getByText('左')).toBeInTheDocument();
    expect(screen.getByText('右')).toBeInTheDocument();
    // 3 面板 → 2 个分隔条
    expect(screen.getAllByRole('separator')).toHaveLength(2);
  });

  it('gutter 带 a11y:role=separator + aria-orientation + aria-label + valuemin/max', () => {
    render(
      <Splitter>
        <Splitter.Panel>a</Splitter.Panel>
        <Splitter.Panel>b</Splitter.Panel>
      </Splitter>,
    );
    const sep = screen.getByRole('separator');
    // 水平分栏的分隔条本身是竖直方向
    expect(sep).toHaveAttribute('aria-orientation', 'vertical');
    expect(sep).toHaveAttribute('aria-label', '拖动调整大小');
    expect(sep).toHaveAttribute('aria-valuemin', '0');
    expect(sep).toHaveAttribute('aria-valuemax', '100');
    expect(sep).toHaveAttribute('tabindex', '0');
  });

  it('vertical 朝向:根带 data-orientation=vertical,分隔条 aria-orientation=horizontal', () => {
    render(
      <Splitter orientation="vertical">
        <Splitter.Panel>上</Splitter.Panel>
        <Splitter.Panel>下</Splitter.Panel>
      </Splitter>,
    );
    expect(document.querySelector('.ms-splitter')).toHaveAttribute('data-orientation', 'vertical');
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('键盘 →:增大左侧面板并触发 onResize(末态 percents 守恒约 100)', () => {
    const onResize = vi.fn();
    render(
      <Splitter onResize={onResize} keyboardStep={20}>
        <Splitter.Panel>a</Splitter.Panel>
        <Splitter.Panel>b</Splitter.Panel>
      </Splitter>,
    );
    const sep = screen.getByRole('separator');
    act(() => {
      fireEvent.keyDown(sep, { key: 'ArrowRight' });
    });
    expect(onResize).toHaveBeenCalled();
    const detail = onResize.mock.calls.at(-1)?.[0];
    expect(detail.sizes[0]).toBeGreaterThan(detail.sizes[1]);
    expect(detail.percents[0] + detail.percents[1]).toBeCloseTo(100, 1);
  });

  it('键盘 ←:减小左侧面板', () => {
    const onResize = vi.fn();
    render(
      <Splitter onResize={onResize} keyboardStep={20}>
        <Splitter.Panel>a</Splitter.Panel>
        <Splitter.Panel>b</Splitter.Panel>
      </Splitter>,
    );
    act(() => {
      fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowLeft' });
    });
    const detail = onResize.mock.calls.at(-1)?.[0];
    expect(detail.sizes[0]).toBeLessThan(detail.sizes[1]);
  });

  it('受控:sizes 来自外部,onResize 回写后重渲染生效', () => {
    const onResize = vi.fn();
    const { rerender } = render(
      <Splitter sizes={[300, 100]} onResize={onResize}>
        <Splitter.Panel>a</Splitter.Panel>
        <Splitter.Panel>b</Splitter.Panel>
      </Splitter>,
    );
    // usable = 400 - 6 = 394;归一后第一块占比约 300/400 → valuenow≈76
    const sep = screen.getByRole('separator');
    const v1 = Number(sep.getAttribute('aria-valuenow'));
    expect(v1).toBeGreaterThan(50);

    act(() => {
      fireEvent.keyDown(sep, { key: 'ArrowLeft' });
    });
    // 受控:内部不自更新,仅回调
    expect(onResize).toHaveBeenCalled();

    rerender(
      <Splitter sizes={[100, 300]} onResize={onResize}>
        <Splitter.Panel>a</Splitter.Panel>
        <Splitter.Panel>b</Splitter.Panel>
      </Splitter>,
    );
    const v2 = Number(screen.getByRole('separator').getAttribute('aria-valuenow'));
    expect(v2).toBeLessThan(v1);
  });

  it('min 约束:键盘连续缩小不会越过左侧 min', () => {
    const onResize = vi.fn();
    render(
      <Splitter onResize={onResize} keyboardStep={1000}>
        <Splitter.Panel min={120}>a</Splitter.Panel>
        <Splitter.Panel>b</Splitter.Panel>
      </Splitter>,
    );
    act(() => {
      fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowLeft' });
    });
    const detail = onResize.mock.calls.at(-1)?.[0];
    expect(detail.sizes[0]).toBeGreaterThanOrEqual(120 - 0.5);
  });

  it('双击可折叠面板的 gutter:折叠并触发 onResizeEnd', () => {
    const onResizeEnd = vi.fn();
    render(
      <Splitter onResizeEnd={onResizeEnd}>
        <Splitter.Panel collapsible>a</Splitter.Panel>
        <Splitter.Panel>b</Splitter.Panel>
      </Splitter>,
    );
    act(() => {
      fireEvent.doubleClick(screen.getByRole('separator'));
    });
    expect(onResizeEnd).toHaveBeenCalled();
    const detail = onResizeEnd.mock.calls.at(-1)?.[0];
    expect(detail.sizes[0]).toBeCloseTo(0, 1);
  });

  it('命令式 handle:collapse / expand / getSizes 可用', () => {
    const ref = createRef<SplitterHandle>();
    render(
      <Splitter ref={ref}>
        <Splitter.Panel collapsible>a</Splitter.Panel>
        <Splitter.Panel>b</Splitter.Panel>
      </Splitter>,
    );
    expect(ref.current?.getSizes()).toHaveLength(2);
    const before = ref.current?.getSizes()[0] ?? 0;
    act(() => {
      ref.current?.collapse(0);
    });
    expect(ref.current?.getSizes()[0]).toBeCloseTo(0, 1);
    act(() => {
      ref.current?.expand(0);
    });
    // 还原到折叠前
    expect(ref.current?.getSizes()[0]).toBeCloseTo(before, 0);
  });

  it('回归:重复折叠同一面板再展开,仍还原到折叠前真实尺寸(非 0)', () => {
    const ref = createRef<SplitterHandle>();
    render(
      <Splitter ref={ref}>
        <Splitter.Panel collapsible>a</Splitter.Panel>
        <Splitter.Panel>b</Splitter.Panel>
      </Splitter>,
    );
    const before = ref.current?.getSizes()[0] ?? 0;
    expect(before).toBeGreaterThan(0);
    // 第一次折叠
    act(() => {
      ref.current?.collapse(0);
    });
    expect(ref.current?.getSizes()[0]).toBeCloseTo(0, 1);
    // 第二次折叠(此时 cur 已是 0):不得覆盖还原快照
    act(() => {
      ref.current?.collapse(0);
    });
    expect(ref.current?.getSizes()[0]).toBeCloseTo(0, 1);
    // 展开:必须还原到折叠前真实尺寸,而非 0
    act(() => {
      ref.current?.expand(0);
    });
    expect(ref.current?.getSizes()[0]).toBeCloseTo(before, 0);
    expect(ref.current?.getSizes()[0]).toBeGreaterThan(0);
  });

  it('回归:受控且父组件不回写 onResize 时,松手 onResizeEnd 报拖拽末态而非起始值', () => {
    const onResizeEnd = vi.fn();
    // 受控:固定 sizes,父组件不在 onResize 里回写 → latest.current 恒为起始态
    render(
      <Splitter sizes={[200, 200]} onResizeEnd={onResizeEnd}>
        <Splitter.Panel>a</Splitter.Panel>
        <Splitter.Panel>b</Splitter.Panel>
      </Splitter>,
    );
    const sep = screen.getByRole('separator');
    act(() => {
      fireEvent.pointerDown(sep, { button: 0, clientX: 200, pointerId: 1 });
      fireEvent.pointerMove(sep, { clientX: 260, pointerId: 1 });
      fireEvent.pointerUp(sep, { pointerId: 1 });
    });
    expect(onResizeEnd).toHaveBeenCalled();
    const detail = onResizeEnd.mock.calls.at(-1)?.[0];
    // 末态:左侧被拖大(>200 起始值),而非报回起始 200/200
    expect(detail.sizes[0]).toBeGreaterThan(detail.sizes[1]);
    expect(detail.sizes[0]).toBeGreaterThan(200);
  });

  it('忽略非 Panel 子节点(纯文本 / 其它元素不计入面板)', () => {
    render(
      <Splitter>
        <Splitter.Panel>real</Splitter.Panel>
        随便一段文字
        <div>not a panel</div>
        <Splitter.Panel>real2</Splitter.Panel>
      </Splitter>,
    );
    // 仅 2 个 Panel → 1 个分隔条
    expect(screen.getAllByRole('separator')).toHaveLength(1);
    expect(screen.queryByText('not a panel')).not.toBeInTheDocument();
  });

  it('classNames 细粒度槽位落到对应部件;透传 data-* 到根', () => {
    render(
      <Splitter
        data-testid="root"
        classNames={{ root: 'r-x', panel: 'p-x', gutter: 'g-x', handle: 'h-x' }}
      >
        <Splitter.Panel>a</Splitter.Panel>
        <Splitter.Panel>b</Splitter.Panel>
      </Splitter>,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveClass('ms-splitter', 'r-x');
    expect(document.querySelector('.ms-splitter__panel')).toHaveClass('p-x');
    expect(screen.getByRole('separator')).toHaveClass('g-x');
    expect(document.querySelector('.ms-splitter__handle')).toHaveClass('h-x');
  });

  it('拖拽:pointerdown→move 改两侧尺寸,pointerup 落定触发 onResizeEnd', () => {
    const onResize = vi.fn();
    const onResizeEnd = vi.fn();
    render(
      <Splitter onResize={onResize} onResizeEnd={onResizeEnd}>
        <Splitter.Panel>a</Splitter.Panel>
        <Splitter.Panel>b</Splitter.Panel>
      </Splitter>,
    );
    const sep = screen.getByRole('separator');
    act(() => {
      fireEvent.pointerDown(sep, { button: 0, clientX: 200, pointerId: 1 });
      fireEvent.pointerMove(sep, { clientX: 240, pointerId: 1 });
    });
    expect(onResize).toHaveBeenCalled();
    const moved = onResize.mock.calls.at(-1)?.[0];
    expect(moved.sizes[0]).toBeGreaterThan(moved.sizes[1]);
    act(() => {
      fireEvent.pointerUp(sep, { pointerId: 1 });
    });
    expect(onResizeEnd).toHaveBeenCalled();
  });
});

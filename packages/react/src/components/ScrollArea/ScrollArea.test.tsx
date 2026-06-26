// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScrollArea } from './ScrollArea';

// jsdom 不做布局:clientHeight/scrollHeight 等恒为 0。给视口元素打桩一组几何,
// 让组件测得「内容溢出」并算出 thumb,从而能测到溢出/拖拽/可见性逻辑。
function stubViewportGeometry(opts: {
  clientHeight?: number;
  scrollHeight?: number;
  clientWidth?: number;
  scrollWidth?: number;
}): void {
  const map: Record<string, number> = {
    clientHeight: opts.clientHeight ?? 0,
    scrollHeight: opts.scrollHeight ?? 0,
    clientWidth: opts.clientWidth ?? 0,
    scrollWidth: opts.scrollWidth ?? 0,
  };
  for (const [prop, value] of Object.entries(map)) {
    Object.defineProperty(HTMLElement.prototype, prop, {
      configurable: true,
      get() {
        return value;
      },
    });
  }
}

class FakeRO {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', FakeRO);
  // 默认:纵向内容溢出(viewport 100, content 400)。
  stubViewportGeometry({
    clientHeight: 100,
    scrollHeight: 400,
    clientWidth: 100,
    scrollWidth: 400,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ScrollArea', () => {
  it('渲染根 / 视口 / 内容三层结构与基础类名,children 落在内容层', () => {
    render(<ScrollArea>滚动内容</ScrollArea>);
    const root = document.querySelector('.ms-scroll-area');
    const viewport = document.querySelector('.ms-scroll-area__viewport');
    const content = document.querySelector('.ms-scroll-area__content');
    expect(root).toBeInTheDocument();
    expect(viewport).toBeInTheDocument();
    expect(content).toHaveTextContent('滚动内容');
  });

  it('默认 type=auto / orientation=vertical:渲染纵向 role=scrollbar,带 aria-orientation/aria-controls/aria-value*', () => {
    render(<ScrollArea>内容</ScrollArea>);
    const bar = screen.getByRole('scrollbar');
    expect(bar).toHaveAttribute('aria-orientation', 'vertical');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    // aria-controls 指向视口 id(useId 生成,非空)。
    const viewport = document.querySelector('.ms-scroll-area__viewport');
    expect(bar.getAttribute('aria-controls')).toBe(viewport?.getAttribute('id'));
    expect(bar.getAttribute('aria-controls')).toBeTruthy();
  });

  it('orientation=both 渲染纵 + 横两条 scrollbar', () => {
    render(<ScrollArea orientation="both">内容</ScrollArea>);
    const bars = screen.getAllByRole('scrollbar');
    expect(bars).toHaveLength(2);
    const orientations = bars.map((b) => b.getAttribute('aria-orientation'));
    expect(orientations).toContain('vertical');
    expect(orientations).toContain('horizontal');
  });

  it('orientation=horizontal 只渲染横向 scrollbar', () => {
    render(<ScrollArea orientation="horizontal">内容</ScrollArea>);
    const bar = screen.getByRole('scrollbar');
    expect(bar).toHaveAttribute('aria-orientation', 'horizontal');
    expect(document.querySelector('.ms-scroll-area--horizontal')).toBeInTheDocument();
  });

  it('内容溢出时 thumb 有非零高度,且滚动后 aria-valuenow 与 thumb 位置更新', () => {
    render(<ScrollArea>内容</ScrollArea>);
    const bar = screen.getByRole('scrollbar');
    const thumb = bar.querySelector('.ms-scroll-area__thumb') as HTMLElement;
    // viewport 100 / content 400 → thumb 25px。
    expect(thumb.style.height).toBe('25px');

    const viewport = document.querySelector('.ms-scroll-area__viewport') as HTMLElement;
    // 模拟滚到底:scrollTop = maxScroll 300。
    Object.defineProperty(viewport, 'scrollTop', { configurable: true, value: 300 });
    act(() => {
      fireEvent.scroll(viewport);
    });
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    // 末态 thumb 贴到底:translate ≈ 75px(track 100 - thumb 25)。
    expect(thumb.style.transform).toContain('75px');
  });

  it('内容不溢出时 scrollbar 隐藏(data-state=hidden)', () => {
    // 覆盖打桩:viewport == content,无溢出。
    stubViewportGeometry({
      clientHeight: 200,
      scrollHeight: 200,
      clientWidth: 200,
      scrollWidth: 200,
    });
    render(<ScrollArea>短内容</ScrollArea>);
    const bar = screen.getByRole('scrollbar');
    expect(bar).toHaveAttribute('data-state', 'hidden');
  });

  it('type=always:即便不溢出也强制显示 scrollbar', () => {
    stubViewportGeometry({
      clientHeight: 200,
      scrollHeight: 200,
      clientWidth: 200,
      scrollWidth: 200,
    });
    render(<ScrollArea type="always">短内容</ScrollArea>);
    expect(screen.getByRole('scrollbar')).toHaveAttribute('data-state', 'visible');
    expect(document.querySelector('.ms-scroll-area--always')).toBeInTheDocument();
  });

  it('type=hover:默认隐藏,指针进入根才显示,离开再隐藏', () => {
    render(<ScrollArea type="hover">内容</ScrollArea>);
    const bar = screen.getByRole('scrollbar');
    const root = document.querySelector('.ms-scroll-area') as HTMLElement;
    expect(bar).toHaveAttribute('data-state', 'hidden');
    act(() => {
      fireEvent.pointerEnter(root);
    });
    expect(bar).toHaveAttribute('data-state', 'visible');
    act(() => {
      fireEvent.pointerLeave(root);
    });
    expect(bar).toHaveAttribute('data-state', 'hidden');
  });

  it('type=scroll:滚动时显示,停止 scrollHideDelay 后隐藏(假定时器)', () => {
    vi.useFakeTimers();
    try {
      render(
        <ScrollArea type="scroll" scrollHideDelay={500}>
          内容
        </ScrollArea>,
      );
      const bar = screen.getByRole('scrollbar');
      const viewport = document.querySelector('.ms-scroll-area__viewport') as HTMLElement;
      expect(bar).toHaveAttribute('data-state', 'hidden');
      act(() => {
        fireEvent.scroll(viewport);
      });
      expect(bar).toHaveAttribute('data-state', 'visible');
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(bar).toHaveAttribute('data-state', 'hidden');
    } finally {
      vi.useRealTimers();
    }
  });

  it('拖拽 thumb 改写视口 scrollTop(pointer 反算)', () => {
    render(<ScrollArea>内容</ScrollArea>);
    const thumb = document.querySelector('.ms-scroll-area__thumb') as HTMLElement;
    const viewport = document.querySelector('.ms-scroll-area__viewport') as HTMLElement;
    // 使 scrollTop 可写以便断言被反算写入。
    let scrollTop = 0;
    Object.defineProperty(viewport, 'scrollTop', {
      configurable: true,
      get: () => scrollTop,
      set: (v: number) => {
        scrollTop = v;
      },
    });
    thumb.setPointerCapture = vi.fn();
    thumb.releasePointerCapture = vi.fn();

    fireEvent.pointerDown(thumb, { button: 0, clientY: 0, pointerId: 1 });
    // 向下拖 75px(thumb travel 上限)→ scrollTop 应到 maxScroll 300。
    fireEvent.pointerMove(thumb, { clientY: 75, pointerId: 1 });
    expect(scrollTop).toBeCloseTo(300);
    fireEvent.pointerUp(thumb, { pointerId: 1 });
    expect(thumb.releasePointerCapture).toHaveBeenCalled();
  });

  it('classNames 细粒度槽位分别落到 root/viewport/scrollbar/thumb', () => {
    render(
      <ScrollArea classNames={{ root: 'r-x', viewport: 'v-x', scrollbar: 'sb-x', thumb: 'th-x' }}>
        内容
      </ScrollArea>,
    );
    expect(document.querySelector('.ms-scroll-area.r-x')).toBeInTheDocument();
    expect(document.querySelector('.ms-scroll-area__viewport.v-x')).toBeInTheDocument();
    expect(document.querySelector('.ms-scroll-area__scrollbar.sb-x')).toBeInTheDocument();
    expect(document.querySelector('.ms-scroll-area__thumb.th-x')).toBeInTheDocument();
  });

  it('合并用户 onPointerEnter(不吞掉用户处理器)并转发 ref / 透传 className', () => {
    const onPointerEnter = vi.fn();
    const ref = createRef<HTMLDivElement>();
    render(
      <ScrollArea ref={ref} className="custom" onPointerEnter={onPointerEnter} type="hover">
        内容
      </ScrollArea>,
    );
    const root = document.querySelector('.ms-scroll-area') as HTMLElement;
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('custom');
    act(() => {
      fireEvent.pointerEnter(root);
    });
    // 用户处理器被调用,且内部 hover 显示逻辑也生效。
    expect(onPointerEnter).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('scrollbar')).toHaveAttribute('data-state', 'visible');
  });
});

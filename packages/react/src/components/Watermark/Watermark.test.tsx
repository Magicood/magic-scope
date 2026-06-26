// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Watermark } from './Watermark';

const getOverlay = (container: HTMLElement): HTMLElement => {
  const el = container.querySelector<HTMLElement>('[data-ms-watermark-overlay]');
  if (el == null) throw new Error('overlay not found');
  return el;
};

beforeEach(() => {
  // jsdom 未实现 canvas getContext(会打印 "Not implemented" 噪声)。
  // 默认 stub 返回 null,等价于「无 2d 上下文」的降级路径;需要绘制路径的用例自行覆盖此 mock。
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Watermark', () => {
  it('渲染根容器(带基础类名)+ 被覆盖的 children + 装饰覆盖层', () => {
    const { container } = render(
      <Watermark content="confidential">
        <p>受保护内容</p>
      </Watermark>,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass('ms-watermark');
    // children 正常渲染、可访问
    expect(screen.getByText('受保护内容')).toBeInTheDocument();
    // 覆盖层存在且基础类名正确
    expect(getOverlay(container)).toHaveClass('ms-watermark__overlay');
  });

  it('覆盖层 aria-hidden=true(纯装饰,不进可访问性树)', () => {
    const { container } = render(<Watermark content="mark">x</Watermark>);
    expect(getOverlay(container)).toHaveAttribute('aria-hidden', 'true');
  });

  it('opacity / zIndex 透传到覆盖层内联样式(含默认值)', () => {
    const { container } = render(
      <Watermark content="mark" opacity={0.3} zIndex={42}>
        x
      </Watermark>,
    );
    const overlay = getOverlay(container);
    expect(overlay.style.opacity).toBe('0.3');
    expect(overlay.style.zIndex).toBe('42');
  });

  it('默认 opacity=0.15 / zIndex=9', () => {
    const { container } = render(<Watermark content="mark">x</Watermark>);
    const overlay = getOverlay(container);
    expect(overlay.style.opacity).toBe('0.15');
    expect(overlay.style.zIndex).toBe('9');
  });

  it('合并外部 className 与 classNames 槽位到对应部件', () => {
    const { container } = render(
      <Watermark
        content="mark"
        className="custom-root"
        classNames={{ root: 'slot-root', overlay: 'slot-overlay' }}
      >
        x
      </Watermark>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass('ms-watermark', 'custom-root', 'slot-root');
    const overlay = getOverlay(container);
    expect(overlay).toHaveClass('ms-watermark__overlay', 'slot-overlay');
  });

  it('透传原生属性与事件到根容器(...rest)', () => {
    const onClick = vi.fn();
    const { container } = render(
      <Watermark content="mark" data-testid="wm" onClick={onClick}>
        x
      </Watermark>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-testid', 'wm');
    root.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwardRef 指向根 div', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Watermark ref={ref} content="mark">
        x
      </Watermark>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('ms-watermark');
  });

  it('有可用 2d 上下文时绘制单元并设为覆盖层 repeating background-image', () => {
    // jsdom 默认无 canvas 实现:stub getContext + toDataURL 走通绘制路径。
    const fakeCtx = {
      font: '',
      fillStyle: '',
      textAlign: '',
      textBaseline: '',
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn(),
      drawImage: vi.fn(),
      measureText: vi.fn(() => ({ width: 80 })),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fakeCtx as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/png;base64,STUB',
    );

    const { container } = render(
      <Watermark content="secret" gap={[80, 80]}>
        x
      </Watermark>,
    );
    const overlay = getOverlay(container);
    expect(overlay.style.backgroundImage).toContain('data:image/png;base64,STUB');
    expect(overlay.style.backgroundRepeat).toBe('repeat');
    // 文字路径会调用 fillText(多行逐行绘制)
    expect(fakeCtx.fillText).toHaveBeenCalled();
  });

  it('拿不到 2d 上下文时降级:不设背景图,仍正常渲染 children,不抛错', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const { container } = render(
      <Watermark content="mark">
        <span>still here</span>
      </Watermark>,
    );
    expect(screen.getByText('still here')).toBeInTheDocument();
    expect(getOverlay(container).style.backgroundImage).toBe('');
  });

  it('跨域图片污染画布、toDataURL 抛 SecurityError 时降级:不崩溃、仍正常渲染 children、不设背景图', () => {
    const fakeCtx = {
      font: '',
      fillStyle: '',
      textAlign: '',
      textBaseline: '',
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn(),
      drawImage: vi.fn(),
      measureText: vi.fn(() => ({ width: 80 })),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fakeCtx as unknown as CanvasRenderingContext2D,
    );
    // 模拟跨域污染:toDataURL 抛 SecurityError(浏览器真实行为)。
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(() => {
      throw new DOMException(
        'Failed to execute toDataURL on HTMLCanvasElement: Tainted canvases may not be exported.',
        'SecurityError',
      );
    });

    // 组件不应抛错。
    const renderTainted = () =>
      render(
        <Watermark content="confidential">
          <span>still here</span>
        </Watermark>,
      );
    expect(renderTainted).not.toThrow();
    const { container } = renderTainted();
    // children 仍正常渲染。
    expect(screen.getAllByText('still here').length).toBeGreaterThan(0);
    // 降级:不设背景图。
    expect(getOverlay(container).style.backgroundImage).toBe('');
  });

  it('content 含换行符时不丢行边界(JSON key 无损反解,逐物理行绘制)', () => {
    const fakeCtx = {
      font: '',
      fillStyle: '',
      textAlign: '',
      textBaseline: '',
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn(),
      drawImage: vi.fn(),
      measureText: vi.fn(() => ({ width: 80 })),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fakeCtx as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/png;base64,STUB',
    );

    // 两个数组元素,其中一个含 '\n'。旧实现 join('\n') + split('\n') 会摊成 3 行(丢边界);
    // 新实现 JSON 序列化保留为 2 个原始字符串,fillText 应恰好按 2 行绘制。
    render(<Watermark content={['line A\nwith newline', 'line B']}>x</Watermark>);
    expect(fakeCtx.fillText).toHaveBeenCalledTimes(2);
    expect(fakeCtx.fillText.mock.calls[0]?.[0]).toBe('line A\nwith newline');
    expect(fakeCtx.fillText.mock.calls[1]?.[0]).toBe('line B');
  });

  it('既无 content 也无 image 时不绘制背景图', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      font: '',
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
    } as unknown as CanvasRenderingContext2D);
    const { container } = render(<Watermark>no mark</Watermark>);
    expect(getOverlay(container).style.backgroundImage).toBe('');
  });
});

// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef, Profiler } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tour, type TourHandle, type TourStep } from './Tour';

// jsdom 不实现 scrollIntoView,补桩避免切步时报错。
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const baseSteps: TourStep[] = [
  { title: '第一步', description: '欢迎使用' },
  { title: '第二步', description: '这是设置区' },
  { title: '第三步', description: '大功告成' },
];

describe('Tour', () => {
  it('open 时渲染遮罩 + 引导卡 + 当前步内容', () => {
    render(<Tour steps={baseSteps} open current={0} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('ms-tour__card');
    expect(screen.getByText('第一步')).toBeInTheDocument();
    expect(screen.getByText('欢迎使用')).toBeInTheDocument();
  });

  it('open=false 不渲染任何内容', () => {
    const { container } = render(<Tour steps={baseSteps} open={false} />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('steps 为空不渲染', () => {
    const { container } = render(<Tour steps={[]} open />);
    expect(container.firstChild).toBeNull();
  });

  it('步数指示走 i18n tour.stepOf', () => {
    render(<Tour steps={baseSteps} open current={1} />);
    expect(screen.getByText('第 2 / 3 步')).toBeInTheDocument();
  });

  it('首步隐藏「上一步」、非末步显示「下一步」', () => {
    render(<Tour steps={baseSteps} open current={0} />);
    expect(screen.queryByText('上一步')).not.toBeInTheDocument();
    expect(screen.getByText('下一步')).toBeInTheDocument();
    expect(screen.queryByText('完成')).not.toBeInTheDocument();
  });

  it('末步显示「完成」而非「下一步」', () => {
    render(<Tour steps={baseSteps} open current={2} />);
    expect(screen.getByText('完成')).toBeInTheDocument();
    expect(screen.queryByText('下一步')).not.toBeInTheDocument();
    expect(screen.getByText('上一步')).toBeInTheDocument();
  });

  it('点「下一步」触发 onChange(current+1)', () => {
    const onChange = vi.fn();
    render(<Tour steps={baseSteps} open current={0} onChange={onChange} />);
    fireEvent.click(screen.getByText('下一步'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('末步点「完成」触发 onFinish 与 onClose(reason=finish)', () => {
    const onFinish = vi.fn();
    const onClose = vi.fn();
    render(<Tour steps={baseSteps} open current={2} onFinish={onFinish} onClose={onClose} />);
    fireEvent.click(screen.getByText('完成'));
    expect(onFinish).toHaveBeenCalledWith(2);
    expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ reason: 'finish', current: 2 }));
  });

  it('点「跳过」触发 onClose(reason=skip)', () => {
    const onClose = vi.fn();
    render(<Tour steps={baseSteps} open current={0} onClose={onClose} />);
    // 底栏「跳过」按钮(getAllByText 因右上角 aria-label 也叫跳过)
    fireEvent.click(screen.getByText('跳过'));
    expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ reason: 'skip' }));
  });

  it('非受控:点「下一步」自身推进步内容', () => {
    render(<Tour steps={baseSteps} defaultCurrent={0} />);
    expect(screen.getByText('第一步')).toBeInTheDocument();
    fireEvent.click(screen.getByText('下一步'));
    expect(screen.getByText('第二步')).toBeInTheDocument();
  });

  it('键盘:Esc 关闭(closeOnEscape 默认 true)、方向键切步', () => {
    const onClose = vi.fn();
    const onChange = vi.fn();
    render(<Tour steps={baseSteps} open current={1} onClose={onClose} onChange={onChange} />);
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(2);
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ reason: 'escape' }));
  });

  it('closeOnEscape=false 时 Esc 不关闭', () => {
    const onClose = vi.fn();
    render(<Tour steps={baseSteps} open current={0} closeOnEscape={false} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('卡片有 role=dialog / aria-modal,并关联 title/description', () => {
    render(<Tour steps={baseSteps} open current={0} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('classNames 槽位与 tone 落到对应元素', () => {
    render(
      <Tour
        steps={baseSteps}
        open
        current={0}
        tone="success"
        classNames={{ card: 'my-card', title: 'my-title' }}
      />,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('my-card');
    expect(screen.getByText('第一步')).toHaveClass('my-title');
    // tone 落到遮罩根
    expect(dialog.closest('.ms-tour')).toHaveClass('ms-tone-success');
  });

  it('整步 content 完全替换默认卡片内容', () => {
    const steps: TourStep[] = [{ content: <div data-testid="custom">自定义内容</div> }];
    render(<Tour steps={steps} open current={0} />);
    expect(screen.getByTestId('custom')).toBeInTheDocument();
    expect(screen.queryByText('下一步')).not.toBeInTheDocument();
  });

  it('ref 暴露命令式 next/prev/goTo/close', () => {
    const ref = createRef<TourHandle>();
    const onChange = vi.fn();
    const onClose = vi.fn();
    render(
      <Tour ref={ref} steps={baseSteps} open current={1} onChange={onChange} onClose={onClose} />,
    );
    ref.current?.next();
    expect(onChange).toHaveBeenLastCalledWith(2);
    ref.current?.prev();
    expect(onChange).toHaveBeenLastCalledWith(0);
    ref.current?.goTo(99); // 越界夹到末步
    expect(onChange).toHaveBeenLastCalledWith(2);
    ref.current?.close();
    expect(onClose).toHaveBeenCalled();
  });

  it('hideSkip 隐藏跳过、showCounter=false 隐藏步数', () => {
    render(<Tour steps={baseSteps} open current={0} hideSkip showCounter={false} />);
    expect(screen.queryByText('跳过')).not.toBeInTheDocument();
    expect(screen.queryByText('第 1 / 3 步')).not.toBeInTheDocument();
  });

  // —— 回归:rAF 跟随的相等性短路 ——
  // 目标静止时,rAF 每帧 measure 不应让整个 Tour 子树(含 portal 引导卡 / spotlight)
  // 持续重渲染。measure 用函数式 updater 比较旧值,值未变返回原引用让 React bail-out。
  // 用 <Profiler> 数实际 commit:每次 Tour 子树重渲染才回调一次。
  it('目标静止时:多帧 rAF measure 不触发 Tour 子树重渲染(setState 相等短路)', () => {
    // 受控 rAF:手动逐帧 flush,稳定可数。
    const rafCallbacks = new Map<number, FrameRequestCallback>();
    let rafId = 0;
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      const id = ++rafId;
      rafCallbacks.set(id, cb);
      return id;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      rafCallbacks.delete(id);
    });
    // 静止目标:每次测量返回完全相同的 rect。
    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 50,
      width: 200,
      height: 40,
      right: 250,
      bottom: 140,
      x: 50,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect);

    // flush 当前所有挂起的 rAF,并连带 act 让 React 处理可能的 setState。
    const flushFrames = (count: number) => {
      for (let i = 0; i < count; i++) {
        const pending = Array.from(rafCallbacks.values());
        rafCallbacks.clear();
        act(() => {
          for (const cb of pending) cb(performance.now());
        });
      }
    };

    let commitCount = 0;
    const onRender = () => {
      commitCount += 1;
    };

    const steps: TourStep[] = [{ target: '#anchor', title: '锚点步', description: '静止目标' }];

    render(
      <div>
        <div id="anchor">锚点</div>
        <Profiler id="tour" onRender={onRender}>
          <Tour steps={steps} open current={0} scrollIntoView={false} />
        </Profiler>
      </div>,
    );

    // 先 flush 若干帧让 rect/viewport 从初值落定(含焦点 rAF、首测量,均属一次性正常重渲染)。
    flushFrames(5);
    const settledCommits = commitCount;

    // 再连续 flush 多帧:目标静止,measure 的 setState 应全部相等短路、不再 commit。
    flushFrames(20);

    expect(commitCount).toBe(settledCommits);
    expect(screen.getByText('锚点步')).toBeInTheDocument();

    rafSpy.mockRestore();
    rectSpy.mockRestore();
  });
});

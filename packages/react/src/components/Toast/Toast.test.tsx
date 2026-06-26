// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster, toast } from './Toast';

// 消息文本会同时出现在持久 SR live region 与可见条目,故可见内容查询限定到可见列表 .ms-toaster
const inList = () => within(document.querySelector('.ms-toaster') as HTMLElement);

// 模块级 store 在用例间共享,故每个用例后清空残留(点关闭 + 跑完退场计时)
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  act(() => {
    for (const btn of document.querySelectorAll<HTMLButtonElement>('.ms-toast__close')) {
      btn.click();
    }
    vi.advanceTimersByTime(300);
  });
  cleanup();
  vi.useRealTimers();
});

describe('toast + Toaster', () => {
  it('toast() 弹出提示,渲染在带 aria-label 的列表区域', () => {
    render(<Toaster />);
    expect(document.querySelector('.ms-toast')).toBeNull();

    act(() => {
      toast('已保存 ✦');
    });
    expect(inList().getByText('已保存 ✦')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: '通知' })).toBeInTheDocument();
  });

  it('持久 live region 解耦播报:danger→assertive、默认→polite', () => {
    render(<Toaster />);
    act(() => {
      toast.error('出错了', { duration: 0 });
    });
    expect(document.querySelector('[aria-live="assertive"]')).toHaveTextContent('出错了');

    act(() => {
      toast('普通消息', { duration: 0 });
    });
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent('普通消息');

    // 可见条目本身仍渲染消息文本
    expect(inList().getByText('出错了')).toBeInTheDocument();
    expect(inList().getByText('普通消息')).toBeInTheDocument();
  });

  it('点击关闭按钮移除(走退场后从 store 删除)', () => {
    render(<Toaster />);
    act(() => {
      toast('待关闭', { duration: 0 });
    });
    expect(inList().getByText('待关闭')).toBeInTheDocument();

    act(() => {
      fireEvent.click(inList().getByLabelText('关闭'));
      vi.advanceTimersByTime(300);
    });
    expect(inList().queryByText('待关闭')).toBeNull();
  });

  it('到 duration 后自动消失', () => {
    render(<Toaster />);
    act(() => {
      toast('自动消失', { duration: 1000 });
    });
    expect(inList().getByText('自动消失')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000 + 300);
    });
    expect(inList().queryByText('自动消失')).toBeNull();
  });

  it('duration=0 常驻,不自动消失', () => {
    render(<Toaster />);
    act(() => {
      toast('常驻', { duration: 0 });
    });
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(inList().getByText('常驻')).toBeInTheDocument();
  });

  it('toast.dismiss(id) 主动关闭', () => {
    render(<Toaster />);
    let id = '';
    act(() => {
      id = toast('手动关', { duration: 0 });
    });
    act(() => {
      toast.dismiss(id);
      vi.advanceTimersByTime(300);
    });
    expect(inList().queryByText('手动关')).toBeNull();
  });

  it('description 与 action 渲染;点击 action 调用回调并关闭', () => {
    render(<Toaster />);
    const onClick = vi.fn();
    act(() => {
      toast('标题', { duration: 0, description: '副文案', action: { label: '撤销', onClick } });
    });
    expect(inList().getByText('副文案')).toBeInTheDocument();

    act(() => {
      fireEvent.click(inList().getByText('撤销'));
      vi.advanceTimersByTime(300);
    });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(inList().queryByText('标题')).toBeNull();
  });

  it('相同 id 替换而非新增', () => {
    render(<Toaster />);
    act(() => {
      toast('v1', { id: 'dup', duration: 0 });
    });
    act(() => {
      toast('v2', { id: 'dup', duration: 0 });
    });
    expect(inList().queryByText('v1')).toBeNull();
    expect(inList().getByText('v2')).toBeInTheDocument();
    expect(document.querySelectorAll('.ms-toast').length).toBe(1);
  });

  it('同 id 重发重置寿命:不会被上一条的旧计时中途关掉', () => {
    render(<Toaster />);
    act(() => {
      toast('上传中', { id: 'up', duration: 1000 });
    });
    act(() => {
      vi.advanceTimersByTime(800); // 接近旧寿命
    });
    act(() => {
      toast('上传完成', { id: 'up', duration: 1000 }); // 同 id 重发 → 重置计时
    });
    act(() => {
      vi.advanceTimersByTime(800); // 距新计时仅 800 < 1000,应仍在
    });
    expect(inList().getByText('上传完成')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(400 + 300); // 跑完新寿命后才消失
    });
    expect(inList().queryByText('上传完成')).toBeNull();
  });

  it('onDismiss 携带来源:手动关→manual、到期→auto、点 action→action', () => {
    render(<Toaster />);
    const onDismiss = vi.fn();
    const onAutoClose = vi.fn();

    // 手动关闭 → manual,且不触发 onAutoClose
    act(() => {
      toast('手动', { duration: 0, onDismiss, onAutoClose });
    });
    act(() => {
      fireEvent.click(inList().getByLabelText('关闭'));
      vi.advanceTimersByTime(300);
    });
    expect(onDismiss).toHaveBeenCalledWith(expect.any(String), 'manual');
    expect(onAutoClose).not.toHaveBeenCalled();

    // 到期 → auto,且触发 onAutoClose
    const onDismiss2 = vi.fn();
    const onAutoClose2 = vi.fn();
    act(() => {
      toast('到期', { duration: 500, onDismiss: onDismiss2, onAutoClose: onAutoClose2 });
    });
    act(() => {
      vi.advanceTimersByTime(500 + 300);
    });
    expect(onDismiss2).toHaveBeenCalledWith(expect.any(String), 'auto');
    expect(onAutoClose2).toHaveBeenCalledTimes(1);

    // 点 action → action(用户回调 + 内部关闭都触发)
    const onDismiss3 = vi.fn();
    const onAction = vi.fn();
    act(() => {
      toast('行动', {
        duration: 0,
        onDismiss: onDismiss3,
        action: { label: '确定', onClick: onAction },
      });
    });
    act(() => {
      fireEvent.click(inList().getByText('确定'));
      vi.advanceTimersByTime(300);
    });
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onDismiss3).toHaveBeenCalledWith(expect.any(String), 'action');
  });

  it('整条 onClick 透传;点内部关闭钮 stopPropagation 不触发整条 onClick', () => {
    render(<Toaster />);
    const onClick = vi.fn();
    act(() => {
      toast('可点', { duration: 0, onClick });
    });
    const item = inList().getByText('可点').closest('.ms-toast') as HTMLElement;
    expect(item).toHaveClass('ms-toast--clickable');

    // 点主体 → 触发
    act(() => {
      fireEvent.click(item);
    });
    expect(onClick).toHaveBeenCalledTimes(1);

    // 点关闭钮 → 因 stopPropagation 不冒泡到主体,onClick 不再增加
    act(() => {
      fireEvent.click(inList().getByLabelText('关闭'));
      vi.advanceTimersByTime(300);
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('icon:默认按 variant 给符文、传 false 关闭整列、自定义 closeIcon', () => {
    render(<Toaster />);
    act(() => {
      toast.success('成', { duration: 0 });
    });
    // success 默认符文渲染在图标列
    expect(document.querySelector('.ms-toast--success .ms-toast__icon')).not.toBeNull();

    act(() => {
      toast('无图标', { duration: 0, icon: false });
    });
    const plain = inList().getByText('无图标').closest('.ms-toast') as HTMLElement;
    expect(plain.querySelector('.ms-toast__icon')).toBeNull();

    act(() => {
      toast('自定义关闭', { duration: 0, closeIcon: '✦' });
    });
    const custom = inList().getByText('自定义关闭').closest('.ms-toast') as HTMLElement;
    expect(within(custom).getByText('✦')).toBeInTheDocument();
  });

  it('toast.promise:loading 常驻 → resolve 后同 id 替换为 success', async () => {
    render(<Toaster />);
    let resolveFn: (v: string) => void = () => {};
    const p = new Promise<string>((resolve) => {
      resolveFn = resolve;
    });

    act(() => {
      toast.promise(p, {
        loading: '处理中',
        success: (v) => `完成:${v}`,
        error: '失败',
      });
    });
    expect(inList().getByText('处理中')).toBeInTheDocument();
    // loading 走 duration:0 常驻,推进时间不消失
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(inList().getByText('处理中')).toBeInTheDocument();

    await act(async () => {
      resolveFn('ok');
      await Promise.resolve();
    });
    expect(inList().queryByText('处理中')).toBeNull();
    expect(inList().getByText('完成:ok')).toBeInTheDocument();
    // 替换后只剩一条(同 id)
    expect(document.querySelectorAll('.ms-toast').length).toBe(1);
  });

  it('Toaster 透传 ...rest 与 onMouseEnter 到 <ol>,可注入 className', () => {
    const onMouseEnter = vi.fn();
    render(<Toaster className="my-toaster" data-testid="region" onMouseEnter={onMouseEnter} />);
    const ol = screen.getByRole('list');
    expect(ol).toHaveClass('ms-toaster', 'my-toaster');
    expect(ol).toHaveAttribute('data-testid', 'region');

    act(() => {
      fireEvent.mouseEnter(ol);
    });
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });

  it('default 变体带 ms-tone-neutral、success 带 ms-tone-success(换肤联动)', () => {
    render(<Toaster />);
    act(() => {
      toast('普通', { duration: 0 });
      toast.success('好', { duration: 0 });
    });
    expect(inList().getByText('普通').closest('.ms-toast')).toHaveClass('ms-tone-neutral');
    expect(inList().getByText('好').closest('.ms-toast')).toHaveClass('ms-tone-success');
  });

  it('悬停暂停自动消失,移开后继续', () => {
    render(<Toaster />);
    act(() => {
      toast('悬停暂停', { duration: 1000 });
    });
    const item = inList().getByText('悬停暂停').closest('.ms-toast') as HTMLElement;

    // 进行到一半后悬停 → 暂停;再等远超 duration 也不消失
    act(() => {
      vi.advanceTimersByTime(600);
      fireEvent.mouseEnter(item);
      vi.advanceTimersByTime(2000);
    });
    expect(inList().getByText('悬停暂停')).toBeInTheDocument();

    // 移开 → 以剩余时间继续,跑完后消失
    act(() => {
      fireEvent.mouseLeave(item);
      vi.advanceTimersByTime(400 + 300);
    });
    expect(inList().queryByText('悬停暂停')).toBeNull();
  });
});

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

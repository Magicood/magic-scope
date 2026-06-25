// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AlertDialogHost, alert, confirm, prompt } from './AlertDialog';

// 模块级队列在用例间共享:每个用例后清空残留弹窗
afterEach(() => {
  act(() => {
    let guard = 0;
    let btn = document.querySelector<HTMLButtonElement>('.ms-alert-dialog__confirm');
    while (btn && guard++ < 10) {
      btn.click();
      btn = document.querySelector<HTMLButtonElement>('.ms-alert-dialog__confirm');
    }
  });
  cleanup();
});

const dialogEl = () => document.querySelector('.ms-alert-dialog') as HTMLDialogElement;

describe('confirm / alert + AlertDialogHost', () => {
  it('confirm 渲染消息与确认/取消按钮,role=alertdialog;点确认 resolve(true)', async () => {
    render(<AlertDialogHost />);
    let result: boolean | undefined;
    act(() => {
      confirm('确定继续吗').then((r) => {
        result = r;
      });
    });

    expect(screen.getByText('确定继续吗')).toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: '确定' });
    const cancelBtn = screen.getByRole('button', { name: '取消' });
    expect(confirmBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(confirmBtn);
    });
    expect(result).toBe(true);
  });

  it('confirm 点取消 resolve(false)', async () => {
    render(<AlertDialogHost />);
    let result: boolean | undefined;
    act(() => {
      confirm('删一下?').then((r) => {
        result = r;
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '取消' }));
    });
    expect(result).toBe(false);
  });

  it('confirm 点遮罩(dialog 本体)resolve(false)', async () => {
    render(<AlertDialogHost />);
    let result: boolean | undefined;
    act(() => {
      confirm('点外面关').then((r) => {
        result = r;
      });
    });
    await act(async () => {
      fireEvent.click(dialogEl()); // e.target === dialog → 遮罩
    });
    expect(result).toBe(false);
  });

  it('自定义文案与 danger 变体:确认按钮染危险类,默认焦点落在取消', async () => {
    render(<AlertDialogHost />);
    act(() => {
      confirm('确定删除该项?', { variant: 'danger', confirmText: '删除', cancelText: '再想想' });
    });

    const del = screen.getByRole('button', { name: '删除' });
    const cancel = screen.getByRole('button', { name: '再想想' });
    expect(del).toHaveClass('ms-alert-dialog__confirm');
    expect(screen.getByRole('alertdialog')).toHaveClass('ms-alert-dialog__panel--danger');
    // 危险确认默认焦点在取消,防误触
    expect(cancel).toHaveFocus();
  });

  it('title 渲染并与 alertdialog 通过 aria-labelledby 关联', () => {
    render(<AlertDialogHost />);
    act(() => {
      confirm('内容', { title: '提示标题' });
    });
    const ad = screen.getByRole('alertdialog');
    const title = screen.getByText('提示标题');
    expect(title.tagName).toBe('H2');
    expect(ad).toHaveAttribute('aria-labelledby', title.id);
  });

  it('alert 仅一个确认按钮,resolve(void)', async () => {
    render(<AlertDialogHost />);
    const done = vi.fn();
    act(() => {
      alert('这是一条提示').then(done);
    });
    expect(screen.getByText('这是一条提示')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '取消' })).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '确定' }));
    });
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('队列:连续两个 confirm 串行展示,前一个解决后后一个出现', async () => {
    render(<AlertDialogHost />);
    const r1 = vi.fn();
    const r2 = vi.fn();
    act(() => {
      confirm('第一个').then(r1);
      confirm('第二个').then(r2);
    });
    // 仅展示队首
    expect(screen.getByText('第一个')).toBeInTheDocument();
    expect(screen.queryByText('第二个')).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '确定' }));
    });
    expect(r1).toHaveBeenCalledWith(true);
    // 第二个接着出现
    expect(screen.getByText('第二个')).toBeInTheDocument();
  });

  it('prompt:渲染输入框(defaultValue 填充),输入后确认 resolve(输入值)', async () => {
    render(<AlertDialogHost />);
    let result: string | null | undefined;
    act(() => {
      prompt('输入名称', { defaultValue: '初始' }).then((r) => {
        result = r;
      });
    });
    const input = document.querySelector('.ms-alert-dialog__input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('初始');

    await act(async () => {
      fireEvent.change(input, { target: { value: '新名称' } });
      fireEvent.click(screen.getByRole('button', { name: '确定' }));
    });
    expect(result).toBe('新名称');
  });

  it('prompt:取消 resolve(null)', async () => {
    render(<AlertDialogHost />);
    let result: string | null | undefined = '未变';
    act(() => {
      prompt('输入').then((r) => {
        result = r;
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '取消' }));
    });
    expect(result).toBeNull();
  });

  it('prompt:输入框 Enter 提交当前值', async () => {
    render(<AlertDialogHost />);
    let result: string | null | undefined;
    act(() => {
      prompt('输入').then((r) => {
        result = r;
      });
    });
    const input = document.querySelector('.ms-alert-dialog__input') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'X' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    expect(result).toBe('X');
  });
});

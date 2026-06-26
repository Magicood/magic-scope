// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AlertDialogHost, alert, confirm, prompt } from './AlertDialog';

// 模块级队列在用例间共享:每个用例后清空残留弹窗(确认按钮可能因校验/loading 被禁用时改点取消)
afterEach(() => {
  act(() => {
    let guard = 0;
    while (document.querySelector('.ms-alert-dialog__panel') && guard++ < 10) {
      const confirmBtn = document.querySelector<HTMLButtonElement>('.ms-alert-dialog__confirm');
      const cancelBtn = document.querySelector<HTMLButtonElement>('.ms-alert-dialog__cancel');
      if (confirmBtn && !confirmBtn.disabled) confirmBtn.click();
      else if (cancelBtn && !cancelBtn.disabled) cancelBtn.click();
      else break;
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

  // —— 补强能力 ——

  it('i18n:默认确认/取消文案走字典(单例),非硬编码', () => {
    render(<AlertDialogHost />);
    act(() => {
      confirm('内容');
    });
    // defaultMessages 的 alertDialog.confirm/cancel = 确定/取消
    expect(screen.getByRole('button', { name: '确定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
  });

  it('tone:variant 扩成完整色调,面板挂 ms-tone-* 并带强调条 class', () => {
    render(<AlertDialogHost />);
    act(() => {
      confirm('警告内容', { variant: 'warning' });
    });
    const panel = screen.getByRole('alertdialog');
    expect(panel).toHaveClass('ms-tone-warning');
    expect(panel).toHaveClass('ms-alert-dialog__panel--accent');
  });

  it('icon:危险弹窗渲染警示图标槽位', () => {
    render(<AlertDialogHost />);
    act(() => {
      confirm('删除?', { variant: 'danger', icon: <span data-testid="warn-icon">!</span> });
    });
    expect(screen.getByTestId('warn-icon')).toBeInTheDocument();
    expect(document.querySelector('.ms-alert-dialog__icon')).toBeInTheDocument();
  });

  it('events:onConfirm / onCancel 回调与 Promise 双轨,都触发', async () => {
    render(<AlertDialogHost />);
    const onConfirm = vi.fn();
    let promiseResult: boolean | undefined;
    act(() => {
      confirm('继续?', { onConfirm }).then((r) => {
        promiseResult = r;
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '确定' }));
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(promiseResult).toBe(true);

    const onCancel = vi.fn();
    let cancelResult: boolean | undefined;
    act(() => {
      confirm('继续?', { onCancel }).then((r) => {
        cancelResult = r;
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '取消' }));
    });
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(cancelResult).toBe(false);
  });

  it('events:异步 onConfirm 期间确认按钮 loading + 禁用,resolve 后才关闭', async () => {
    render(<AlertDialogHost />);
    let resolveConfirm: (() => void) | undefined;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((res) => {
          resolveConfirm = res;
        }),
    );
    let promiseResult: boolean | undefined;
    act(() => {
      confirm('保存?', { confirmText: '保存', onConfirm }).then((r) => {
        promiseResult = r;
      });
    });
    const confirmBtn = screen.getByRole('button', { name: '保存' });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });
    // 异步进行中:loading + 禁用,弹窗仍在
    expect(confirmBtn).toBeDisabled();
    expect(confirmBtn).toHaveClass('ms-button--loading');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(promiseResult).toBeUndefined();
    // resolve 后才关闭、Promise 才 settle
    await act(async () => {
      resolveConfirm?.();
    });
    expect(promiseResult).toBe(true);
  });

  it('depth:prompt validate 无效时拦截确认、展示提示、禁用按钮', async () => {
    render(<AlertDialogHost />);
    let result: string | null | undefined;
    act(() => {
      prompt('输入邮箱', {
        validate: (v) => (v.includes('@') ? undefined : '需包含 @'),
      }).then((r) => {
        result = r;
      });
    });
    const input = document.querySelector('.ms-alert-dialog__input') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'bad' } });
    });
    // 无效:提示出现 + 确认禁用 + Enter 不提交
    expect(screen.getByText('需包含 @')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确定' })).toBeDisabled();
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    expect(result).toBeUndefined();
    // 改为有效后可提交
    await act(async () => {
      fireEvent.change(input, { target: { value: 'a@b.com' } });
      fireEvent.click(screen.getByRole('button', { name: '确定' }));
    });
    expect(result).toBe('a@b.com');
  });

  it('depth:prompt inputType 平移到原生 input type;onValueChange 实时触发', async () => {
    render(<AlertDialogHost />);
    const onValueChange = vi.fn();
    act(() => {
      prompt('设置密码', { inputType: 'password', onValueChange });
    });
    const input = document.querySelector('.ms-alert-dialog__input') as HTMLInputElement;
    expect(input.type).toBe('password');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'pw' } });
    });
    expect(onValueChange).toHaveBeenCalledWith('pw');
  });

  it('events:onEscapeKeyDown preventDefault 可拦截关闭(危险操作禁 Esc)', async () => {
    render(<AlertDialogHost />);
    let result: boolean | undefined;
    const onEscapeKeyDown = vi.fn((e: Event) => e.preventDefault());
    act(() => {
      confirm('禁 Esc', { variant: 'danger', onEscapeKeyDown }).then((r) => {
        result = r;
      });
    });
    await act(async () => {
      fireEvent(dialogEl(), new Event('cancel', { cancelable: true, bubbles: true }));
    });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    // 被拦截:弹窗仍在、Promise 未 settle
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(result).toBeUndefined();
  });

  it('events:onPointerDownOutside preventDefault 可拦截点外关闭', async () => {
    render(<AlertDialogHost />);
    let result: boolean | undefined;
    const onPointerDownOutside = vi.fn((e: MouseEvent) => e.preventDefault());
    act(() => {
      confirm('禁点外关', { onPointerDownOutside }).then((r) => {
        result = r;
      });
    });
    await act(async () => {
      fireEvent.click(dialogEl()); // e.target === dialog → 遮罩
    });
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(result).toBeUndefined();
  });
});

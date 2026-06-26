// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Popconfirm } from './Popconfirm';

describe('Popconfirm', () => {
  it('渲染 trigger(注入 popover aria)并内建标题/描述/确认/取消', () => {
    render(
      <Popconfirm
        trigger={<button type="button">删除</button>}
        title="确定删除?"
        description="此操作不可恢复"
      />,
    );
    const trigger = screen.getByRole('button', { name: '删除' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');

    expect(screen.getByText('确定删除?')).toBeInTheDocument();
    expect(screen.getByText('此操作不可恢复')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确定', hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '取消', hidden: true })).toBeInTheDocument();
  });

  it('默认确认 / 取消文案走 i18n(popconfirm.confirm / popconfirm.cancel)', () => {
    render(<Popconfirm trigger={<button type="button">act</button>} title="确认?" />);
    // 默认 zh-CN 字典:确定 / 取消
    expect(screen.getByRole('button', { name: '确定', hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '取消', hidden: true })).toBeInTheDocument();
  });

  it('点确认触发 onConfirm', () => {
    const onConfirm = vi.fn();
    render(
      <Popconfirm
        trigger={<button type="button">act</button>}
        title="确认?"
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '确定', hidden: true }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('点取消触发 onCancel', () => {
    const onCancel = vi.fn();
    render(
      <Popconfirm trigger={<button type="button">act</button>} title="确认?" onCancel={onCancel} />,
    );
    fireEvent.click(screen.getByRole('button', { name: '取消', hidden: true }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('自定义文案与 danger(variant 向后兼容 → tone=danger)', () => {
    const { container } = render(
      <Popconfirm
        trigger={<button type="button">act</button>}
        title="删?"
        variant="danger"
        confirmText="删除"
        cancelText="算了"
      />,
    );
    // variant="danger" 收敛为 tone:浮层根带 ms-tone-danger
    expect(container.querySelector('.ms-popover')).toHaveClass('ms-tone-danger');
    expect(screen.getByRole('button', { name: '删除', hidden: true })).toHaveClass(
      'ms-popconfirm__confirm',
    );
    expect(screen.getByRole('button', { name: '算了', hidden: true })).toBeInTheDocument();
  });

  it('tone 直接驱动浮层与确认按钮配色', () => {
    const { container } = render(
      <Popconfirm trigger={<button type="button">act</button>} title="保存?" tone="success" />,
    );
    expect(container.querySelector('.ms-popover')).toHaveClass('ms-tone-success');
    // 确认按钮自身也带 tone 类(由内部 Button 渲染)
    expect(screen.getByRole('button', { name: '确定', hidden: true })).toHaveClass(
      'ms-tone-success',
    );
  });

  it('渲染 icon 警示槽', () => {
    const { container } = render(
      <Popconfirm
        trigger={<button type="button">act</button>}
        title="危险操作"
        icon={<svg data-testid="warn-icon" aria-hidden="true" />}
      />,
    );
    expect(container.querySelector('.ms-popconfirm__icon')).toBeInTheDocument();
    expect(screen.getByTestId('warn-icon')).toBeInTheDocument();
  });

  it('异步 onConfirm:Promise 期间确认按钮 loading + 禁用,resolve 后关闭', async () => {
    let resolveFn: (() => void) | undefined;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveFn = resolve;
        }),
    );
    const onOpenChange = vi.fn();
    render(
      <Popconfirm
        trigger={<button type="button">act</button>}
        title="确认?"
        defaultOpen
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />,
    );
    const confirmBtn = screen.getByRole('button', { name: '确定', hidden: true });
    fireEvent.click(confirmBtn);

    // pending:按钮进入 loading(aria-busy)且禁用,尚未触发关闭
    await waitFor(() => expect(confirmBtn).toHaveAttribute('aria-busy', 'true'));
    expect(confirmBtn).toBeDisabled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    // resolve:关闭(onOpenChange(false))
    resolveFn?.();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('异步 onConfirm reject:保持打开,清掉 loading', async () => {
    let rejectFn: (() => void) | undefined;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectFn = reject;
        }),
    );
    const onOpenChange = vi.fn();
    render(
      <Popconfirm
        trigger={<button type="button">act</button>}
        title="确认?"
        defaultOpen
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />,
    );
    const confirmBtn = screen.getByRole('button', { name: '确定', hidden: true });
    fireEvent.click(confirmBtn);
    await waitFor(() => expect(confirmBtn).toHaveAttribute('aria-busy', 'true'));

    rejectFn?.();
    // reject 后清掉 loading 且未关闭
    await waitFor(() => expect(confirmBtn).not.toHaveAttribute('aria-busy'));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('受控 open + onOpenChange:点取消派发 false', () => {
    const onOpenChange = vi.fn();
    render(
      <Popconfirm
        trigger={<button type="button">act</button>}
        title="确认?"
        open
        onOpenChange={onOpenChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '取消', hidden: true }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('confirmButtonProps / cancelButtonProps 透传内部按钮,用户 onClick 与内部 handler 都触发', () => {
    const userConfirmClick = vi.fn();
    const onConfirm = vi.fn();
    const { container } = render(
      <Popconfirm
        trigger={<button type="button">act</button>}
        title="确认?"
        onConfirm={onConfirm}
        confirmButtonProps={{ onClick: userConfirmClick, id: 'confirm-btn' }}
      />,
    );
    const confirmBtn = container.querySelector('#confirm-btn');
    expect(confirmBtn).not.toBeNull();
    if (confirmBtn) fireEvent.click(confirmBtn);
    // 用户处理器与内部确认 handler 都触发
    expect(userConfirmClick).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('根透传原生属性 / 事件到浮层(...rest)', () => {
    const onMouseEnter = vi.fn();
    const { container } = render(
      <Popconfirm
        trigger={<button type="button">act</button>}
        title="确认?"
        data-testid="pop-root"
        onMouseEnter={onMouseEnter}
      />,
    );
    const root = container.querySelector('.ms-popconfirm');
    expect(root).toHaveAttribute('data-testid', 'pop-root');
    if (root) fireEvent.mouseEnter(root);
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });
});

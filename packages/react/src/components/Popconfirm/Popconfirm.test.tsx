// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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

  it('自定义文案与 danger 变体', () => {
    const { container } = render(
      <Popconfirm
        trigger={<button type="button">act</button>}
        title="删?"
        variant="danger"
        confirmText="删除"
        cancelText="算了"
      />,
    );
    expect(container.querySelector('.ms-popconfirm__body')).toHaveClass(
      'ms-popconfirm__body--danger',
    );
    expect(screen.getByRole('button', { name: '删除', hidden: true })).toHaveClass(
      'ms-popconfirm__confirm',
    );
    expect(screen.getByRole('button', { name: '算了', hidden: true })).toBeInTheDocument();
  });
});
